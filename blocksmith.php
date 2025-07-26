<?php
/*
Plugin Name: Blocksmith
Description: Blocksmith is a plugin that leverages AI to build your wordpress website using your existing blocks.
Version: 1.0.0
Author: Blocksmith
Author URI: https://blocksmith.site
*/

if (! defined('ABSPATH')) {
    exit;
}

function blocksmith_enqueue_assets()
{
    $asset_file = include(plugin_dir_path(__FILE__) . 'build/editor.asset.php');

    wp_enqueue_script(
        'blocksmith-editor',
        plugin_dir_url(__FILE__) . 'build/editor.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // Pass the AJAX URL and current API key if available
    wp_localize_script('blocksmith-editor', 'blocksmithData', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'api_key' => get_option('blocksmith_api_key', ''),
        'site_url' => get_site_url(),
        'plugin_version' => '1.0.0',
    ]);

    // Add nonce for AJAX security
    wp_localize_script('blocksmith-editor', 'blocksmithSecurity', [
        'nonce' => wp_create_nonce('blocksmith_nonce')
    ]);
}

add_action('enqueue_block_editor_assets', 'blocksmith_enqueue_assets');

add_action('admin_menu', function () {
    add_menu_page(
        'Blocksmith Admin',
        'Blocksmith',
        'manage_options',
        'blocksmith-admin',
        function () {
            echo '<div id="blocksmith-admin-root"></div>';
        },
        'dashicons-shield',
        80
    );
});

add_action('admin_enqueue_scripts', function ($hook) {
    // Only load on our plugin admin page
    if ($hook !== 'toplevel_page_blocksmith-admin') return;

    $asset_file = include(plugin_dir_path(__FILE__) . 'build/admin.asset.php');

    wp_enqueue_script(
        'blocksmith-admin',
        plugin_dir_url(__FILE__) . 'build/admin.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // Pass the AJAX URL and current API key if available
    wp_localize_script('blocksmith-admin', 'blocksmithData', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'api_key' => get_option('blocksmith_api_key', ''),
        'site_url' => get_site_url(),
        'plugin_version' => '1.0.0',
    ]);
});

// API Helper Class
class BlocksmithAPI
{
    private $api_key;
    private $base_url = 'http://localhost:3000/api';

    public function __construct()
    {
        $this->api_key = get_option('blocksmith_api_key');
    }

    public function make_request($endpoint, $data = null)
    {
        if (!$this->api_key) {
            return [
                'success' => false,
                'error' => 'API key not configured. Please set your API key in the plugin settings.'
            ];
        }

        $args = [
            'headers' => [
                'Content-Type' => 'application/json',
                'x-blocksmith-api-key' => $this->api_key,
                'Origin' => get_site_url()
            ],
            'timeout' => 30
        ];

        if ($data) {
            $args['method'] = 'POST';
            $args['body'] = json_encode($data);
        }

        $response = wp_remote_request($this->base_url . $endpoint, $args);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'error' => $response->get_error_message()
            ];
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $response_data = json_decode($body, true);

        // Handle specific error codes
        if ($status_code === 403) {
            return [
                'success' => false,
                'error' => 'CORS validation failed. Please verify your WordPress site URL matches the one configured in your Blocksmith dashboard.'
            ];
        }

        if ($status_code === 401) {
            return [
                'success' => false,
                'error' => 'Invalid API key. Please check your API key in the plugin settings.'
            ];
        }

        if ($status_code === 429) {
            return [
                'success' => false,
                'error' => 'Rate limit exceeded. Please wait before making more requests.'
            ];
        }

        if ($status_code !== 200) {
            return [
                'success' => false,
                'error' => 'API request failed: ' . ($response_data['error'] ?? 'Unknown error')
            ];
        }

        return [
            'success' => true,
            'data' => $response_data
        ];
    }
}

// Handle API key saving
add_action('wp_ajax_blocksmith_save_api_key', function () {
    // Verify nonce for security
    if (!check_ajax_referer('blocksmith_nonce', 'nonce', false)) {
        wp_send_json_error(['message' => 'Security check failed']);
        return;
    }

    $api_key = sanitize_text_field($_POST['api_key']);

    if (empty($api_key)) {
        wp_send_json_error(['message' => 'API key cannot be empty']);
        return;
    }

    // Test the API key by making a simple request
    $temp_api = new BlocksmithAPI();
    // Temporarily set the API key for testing
    update_option('blocksmith_api_key', $api_key);
    $temp_api = new BlocksmithAPI();

    // Make a test request to validate the key
    $test_result = $temp_api->make_request('/wordpress/health-check');

    if (!$test_result['success']) {
        // Remove the invalid key
        delete_option('blocksmith_api_key');
        wp_send_json_error(['message' => 'Invalid API key: ' . $test_result['error']]);
        return;
    }

    wp_send_json_success(['message' => 'API key saved and validated successfully']);
});

// Handle API key removal
add_action('wp_ajax_blocksmith_remove_api_key', function () {
    // Verify nonce for security
    if (!check_ajax_referer('blocksmith_nonce', 'nonce', false)) {
        wp_send_json_error(['message' => 'Security check failed']);
        return;
    }

    delete_option('blocksmith_api_key');
    wp_send_json_success(['message' => 'API key removed successfully']);
});

// Test API connection
add_action('wp_ajax_blocksmith_test_connection', function () {
    // Verify nonce for security
    if (!check_ajax_referer('blocksmith_nonce', 'nonce', false)) {
        wp_send_json_error(['message' => 'Security check failed']);
        return;
    }

    $api = new BlocksmithAPI();
    $result = $api->make_request('/wordpress/health-check');

    if ($result['success']) {
        wp_send_json_success(['message' => 'Connection successful']);
    } else {
        wp_send_json_error(['message' => $result['error']]);
    }
});

// Generate content endpoint
add_action('wp_ajax_blocksmith_generate_content', function () {
    // Verify nonce for security
    if (!check_ajax_referer('blocksmith_nonce', 'nonce', false)) {
        wp_send_json_error(['message' => 'Security check failed']);
        return;
    }

    $options = isset($_POST['options']) ? json_decode(stripslashes($_POST['options']), true) : [];

    // Extract required fields from options
    $post_title = isset($options['postTitle']) ? sanitize_text_field($options['postTitle']) : '';
    $post_content = isset($options['postContent']) ? sanitize_textarea_field($options['postContent']) : '';

    if (empty($post_title) || empty($post_content)) {
        wp_send_json_error(['message' => 'Post title and content are required']);
        return;
    }

    $api = new BlocksmithAPI();
    $result = $api->make_request('/agent/generate', [
        'postTitle' => $post_title,
        'postContent' => $post_content,
        'format' => isset($options['format']) ? $options['format'] : 'block',
        'style' => isset($options['style']) ? $options['style'] : 'professional'
    ]);

    if ($result['success']) {
        wp_send_json_success($result['data']);
    } else {
        wp_send_json_error(['message' => $result['error']]);
    }
});

// Add nonce for AJAX security
add_action('wp_enqueue_scripts', function () {
    wp_localize_script('blocksmith-admin', 'blocksmithSecurity', [
        'nonce' => wp_create_nonce('blocksmith_nonce')
    ]);
});

add_action('admin_enqueue_scripts', function () {
    wp_localize_script('blocksmith-admin', 'blocksmithSecurity', [
        'nonce' => wp_create_nonce('blocksmith_nonce')
    ]);
});

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

    // Pass the AJAX URL and token if available
    wp_localize_script('blocksmith-admin', 'blocksmithData', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'token'    => get_user_meta(get_current_user_id(), '_blocksmith_token', true) ?: null,
    ]);
});

// Handle login
add_action('wp_ajax_blocksmith_login', function () {
    $email    = sanitize_email($_POST['email']);
    $password = sanitize_text_field($_POST['password']);

    $response = wp_remote_post('http://localhost:3000/api/auth/sign-in', [
        'headers' => ['Content-Type' => 'application/json'],
        'body'    => json_encode(['email' => $email, 'password' => $password]),
    ]);

    if (is_wp_error($response)) {
        wp_send_json_error(['message' => 'Request failed']);
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (!isset($body['success']) || !$body['success'] || !isset($body['data']['token'])) {
        $errorMsg = isset($body['error']) ? $body['error'] : 'Invalid credentials';
        wp_send_json_error(['message' => $errorMsg]);
    }

    update_user_meta(get_current_user_id(), '_blocksmith_token', sanitize_text_field($body['data']['token']));
    wp_send_json_success(['token' => $body['data']['token']]);
});

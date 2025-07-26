import { ApiResponse } from '../types';

export class BlocksmithAPIClient {
  private async makeRequest<T = any>(
    action: string,
    data: Record<string, any> = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('nonce', blocksmithSecurity.nonce);
    
    // Add all data fields to form data
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    try {
      const response = await fetch(blocksmithData.ajax_url, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        data: {
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
      };
    }
  }

  async saveApiKey(apiKey: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest('blocksmith_save_api_key', { api_key: apiKey });
  }

  async removeApiKey(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest('blocksmith_remove_api_key');
  }

  async testConnection(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest('blocksmith_test_connection');
  }

  async generateContent(
    prompt: string,
    options: Record<string, any> = {}
  ): Promise<ApiResponse<any>> {
    return this.makeRequest('blocksmith_generate_content', {
      prompt,
      options,
    });
  }
}

export const apiClient = new BlocksmithAPIClient();

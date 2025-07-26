// Global blocksmithData object type
export interface BlocksmithData {
  ajax_url: string;
  api_key: string;
  site_url: string;
  plugin_version: string;
}

// Global blocksmithSecurity object type
export interface BlocksmithSecurity {
  nonce: string;
}

// API response types
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  data: {
    message: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// API Key management types
export interface ApiKeyValidationResponse {
  success: true;
  data: {
    message: string;
  };
}

export interface ConnectionTestResponse {
  success: true;
  data: {
    message: string;
  };
}

export interface ContentGenerationRequest {
  prompt: string;
  options?: {
    format?: string;
    style?: string;
    length?: string;
    [key: string]: any;
  };
}

export interface ContentGenerationResponse {
  content: string;
  metadata?: {
    [key: string]: any;
  };
}

// Form event types
export interface InputChangeEvent {
  target: {
    value: string;
  };
}

// Component state types
export interface AdminAppState {
  api_key: string;
  status: string;
  isConnected: boolean;
  isLoading: boolean;
}

// Declare global blocksmithData and blocksmithSecurity
declare global {
  interface Window {
    blocksmithData: BlocksmithData;
    blocksmithSecurity: BlocksmithSecurity;
  }
  const blocksmithData: BlocksmithData;
  const blocksmithSecurity: BlocksmithSecurity;
}

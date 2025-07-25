// Global blocksmithData object type
export interface BlocksmithData {
  ajax_url: string;
  token: string | null;
}

// Login API response types
export interface LoginSuccessResponse {
  success: true;
  data: {
    token: string;
  };
}

export interface LoginErrorResponse {
  success: false;
  data: {
    message: string;
  };
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

// Form event types
export interface InputChangeEvent {
  target: {
    value: string;
  };
}

// Component state types
export interface AdminAppState {
  email: string;
  password: string;
  token: string | null;
  status: string;
}

// Declare global blocksmithData
declare global {
  interface Window {
    blocksmithData: BlocksmithData;
  }
  const blocksmithData: BlocksmithData;
}

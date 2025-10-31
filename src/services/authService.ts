import axiosInstance from './axiosInstance';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  phone_number: string;
  phone_verified: boolean;
  email_verified: boolean;
  mfa_enabled: boolean;
  mfa_method: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface LoginResponse {
  message: string;
  error?: string;
  // MFA required response
  mfa_required?: boolean;
  mfa_method?: string;
  session_key?: string;
  // Successful login response (no MFA)
  user?: User;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

export interface VerifyOtpRequest {
  session_key: string;
  code: string;
}

export interface VerifyOtpResponse {
  message?: string;
  error?: string;
  user?: User;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

/**
 * Send login credentials and authenticate
 * If MFA is not required, returns tokens immediately
 * If MFA is required, returns session_key for OTP verification
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login/', credentials);
  
  // If MFA is not required, store tokens immediately
  if (!response.data.mfa_required && response.data.access_token) {
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token!);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Verify OTP and complete login
 */
export const verifyOtp = async (otpData: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const response = await axiosInstance.post<VerifyOtpResponse>('/auth/mfa/verify/', otpData);
  
  // Store token and user data if successful
  if (response.data.access_token) {
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token!);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Resend OTP
 */
export const resendOtp = async (username: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/resend-otp/', { username });
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post('/auth/logout/');
  } finally {
    // Clear local storage regardless of API response
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};

/**
 * Get current user data from localStorage
 */
export const getCurrentUser = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

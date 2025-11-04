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

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // storage may be unavailable (privacy mode) — fail silently
  }
}

function safeGetItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

function safeRemoveItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (e) { /* ignore */ }
}

export function setAuth(token: string, refresh?: string, user?: unknown) {
  // Note: storing tokens in localStorage is vulnerable to XSS.
  // Prefer httpOnly cookies from the server if possible.
  safeSetItem(AUTH_TOKEN_KEY, token);
  if (refresh) safeSetItem(REFRESH_TOKEN_KEY, refresh);
  if (user) safeSetItem(USER_DATA_KEY, JSON.stringify(user));
}

export function clearAuth() {
  safeRemoveItem(AUTH_TOKEN_KEY);
  safeRemoveItem(REFRESH_TOKEN_KEY);
  safeRemoveItem(USER_DATA_KEY);
}

export function getAuthToken() {
  return safeGetItem(AUTH_TOKEN_KEY);
}

/**
 * Send login credentials and authenticate
 * If MFA is not required, returns tokens immediately
 * If MFA is required, returns session_key for OTP verification
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login/', credentials);
  
  if (!response.data.mfa_required && response.data.access_token) {
    setAuth(response.data.access_token, response.data.refresh_token, response.data.user);
  }
  
  return response.data;
};

/**
 * Verify OTP and complete login
 */
export const verifyOtp = async (otpData: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const response = await axiosInstance.post<VerifyOtpResponse>('/auth/mfa/verify/', otpData);
  
  if (response.data.access_token) {
    setAuth(response.data.access_token, response.data.refresh_token, response.data.user);
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
    clearAuth();
  }
};

/**
 * Get current user data from localStorage
 */
export const getCurrentUser = () => {
  const userData = safeGetItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

import axiosInstance from './axiosInstance';
import {
  LoginCredentials,
  LoginResponse as BaseLoginResponse,
  User,
  UserProfile,
  StaffProfile,
} from '../models/auth';
import { fetchStationById } from './system_administration/stationService';

// Extended LoginResponse to support MFA flow
export interface LoginResponse extends Partial<BaseLoginResponse> {
  error?: string;
  // MFA required response
  mfa_required?: boolean;
  mfa_method?: string;
  session_key?: string;
}

export type { LoginCredentials, User, UserProfile, StaffProfile };

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
 * Fetch and store station data in filter context
 */
const fetchAndStoreStationData = async (stationId: string): Promise<void> => {
  try {
    const stationData = await fetchStationById(stationId);
    
    // Store station filter data in localStorage for FilterContext
    const filterData = {
      region: stationData.region.id,
      district: stationData.district.id,
      station: stationData.id,
    };
    
    localStorage.setItem('pmis_user_filters', JSON.stringify(filterData));
    
    // Dispatch event to notify FilterContext of the change
    window.dispatchEvent(
      new CustomEvent('filterChanged', {
        detail: filterData,
      })
    );
  } catch (error) {
    console.error('Failed to fetch station data:', error);
    // Don't throw - allow login to succeed even if station fetch fails
  }
};

/**
 * Send login credentials and authenticate
 * If MFA is not required, returns tokens immediately
 * If MFA is required, returns session_key for OTP verification
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login/', credentials);
  
  if (!response.data.mfa_required && response.data.access_token) {
<<<<<<< HEAD
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token!);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    // Fetch and store station data if user has a staff profile
    if (response.data.user?.profile?.staff_profile_details?.station) {
      await fetchAndStoreStationData(
        response.data.user.profile.staff_profile_details.station
      );
    }
=======
    setAuth(response.data.access_token, response.data.refresh_token, response.data.user);
>>>>>>> station
  }
  
  return response.data;
};

/**
 * Verify OTP and complete login
 */
export const verifyOtp = async (otpData: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const response = await axiosInstance.post<VerifyOtpResponse>('/auth/mfa/verify/', otpData);
  
  if (response.data.access_token) {
<<<<<<< HEAD
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token!);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    // Fetch and store station data if user has a staff profile
    if (response.data.user?.profile?.staff_profile_details?.station) {
      await fetchAndStoreStationData(
        response.data.user.profile.staff_profile_details.station
      );
    }
=======
    setAuth(response.data.access_token, response.data.refresh_token, response.data.user);
>>>>>>> station
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
<<<<<<< HEAD
    // Clear local storage regardless of API response
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('pmis_user_filters');
=======
    clearAuth();
>>>>>>> station
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

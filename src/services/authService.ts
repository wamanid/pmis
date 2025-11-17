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
  
  // If MFA is not required, store tokens immediately
  if (!response.data.mfa_required && response.data.access_token) {
    localStorage.setItem('auth_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token!);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    // Fetch and store station data if user has a staff profile
    if (response.data.user?.profile?.staff_profile_details?.station) {
      await fetchAndStoreStationData(
        response.data.user.profile.staff_profile_details.station
      );
    }
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
    
    // Fetch and store station data if user has a staff profile
    if (response.data.user?.profile?.staff_profile_details?.station) {
      await fetchAndStoreStationData(
        response.data.user.profile.staff_profile_details.station
      );
    }
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
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('pmis_user_filters');
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

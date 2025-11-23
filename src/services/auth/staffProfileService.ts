import axiosInstance from '../axiosInstance';
import type { StaffProfile, StaffProfileListResponse, StaffProfileFilters } from '../../models/auth/staffProfile';

/**
 * Fetch staff profiles with optional filters
 */
export const getStaffProfiles = async (
  filters?: StaffProfileFilters
): Promise<StaffProfileListResponse> => {
  try {
    const params: Record<string, any> = {};
    
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.organization) params.organization = filters.organization;
    if (filters?.is_available !== undefined) params.is_available = filters.is_available;
    if (filters?.page) params.page = filters.page;
    if (filters?.page_size) params.page_size = filters.page_size;

    const response = await axiosInstance.get<StaffProfileListResponse>(
      '/api/accounts/staff-profiles/',
      { params }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching staff profiles:', error);
    throw error;
  }
};

/**
 * Fetch a single staff profile by ID
 */
export const getStaffProfile = async (id: string): Promise<StaffProfile> => {
  try {
    const response = await axiosInstance.get<StaffProfile>(
      `/api/accounts/staff-profiles/${id}/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    throw error;
  }
};

/**
 * Create a new staff profile
 */
export const createStaffProfile = async (
  data: Partial<StaffProfile>
): Promise<StaffProfile> => {
  try {
    const response = await axiosInstance.post<StaffProfile>(
      '/api/accounts/staff-profiles/',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error creating staff profile:', error);
    throw error;
  }
};

/**
 * Update an existing staff profile
 */
export const updateStaffProfile = async (
  id: string,
  data: Partial<StaffProfile>
): Promise<StaffProfile> => {
  try {
    const response = await axiosInstance.patch<StaffProfile>(
      `/api/accounts/staff-profiles/${id}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error updating staff profile:', error);
    throw error;
  }
};

/**
 * Delete a staff profile
 */
export const deleteStaffProfile = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/accounts/staff-profiles/${id}/`);
  } catch (error) {
    console.error('Error deleting staff profile:', error);
    throw error;
  }
};

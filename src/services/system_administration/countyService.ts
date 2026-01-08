import axiosInstance from '../axiosInstance';
import type { 
  County,
  CountyListResponse,
  CountyQueryParams
} from '../../models/system_administration';

/**
 * County Service
 * Handles API calls for county resources
 */

/**
 * Fetch counties with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated county list
 */
export const fetchCounties = async (params?: CountyQueryParams): Promise<CountyListResponse> => {
  const response = await axiosInstance.get<CountyListResponse>('/system-administration/counties/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single county by ID
 * @param id County UUID
 * @returns Promise with county details
 */
export const fetchCountyById = async (id: string): Promise<County> => {
  const response = await axiosInstance.get<County>(`/system-administration/counties/${id}/`);
  return response.data;
};

/**
 * Create a new county
 * @param data County data
 * @returns Promise with created county
 */
export const createCounty = async (data: Partial<County>): Promise<County> => {
  const response = await axiosInstance.post<County>('/system-administration/counties/', data);
  return response.data;
};

/**
 * Update an existing county
 * @param id County UUID
 * @param data Updated county data
 * @returns Promise with updated county
 */
export const updateCounty = async (id: string, data: Partial<County>): Promise<County> => {
  const response = await axiosInstance.put<County>(`/system-administration/counties/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing county
 * @param id County UUID
 * @param data Partial county data to update
 * @returns Promise with updated county
 */
export const patchCounty = async (id: string, data: Partial<County>): Promise<County> => {
  const response = await axiosInstance.patch<County>(`/system-administration/counties/${id}/`, data);
  return response.data;
};

/**
 * Delete a county
 * @param id County UUID
 * @returns Promise with void
 */
export const deleteCounty = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/counties/${id}/`);
};

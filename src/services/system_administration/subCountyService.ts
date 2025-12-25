import axiosInstance from '../axiosInstance';
import type { 
  SubCounty,
  SubCountyListResponse,
  SubCountyQueryParams
} from '../../models/system_administration';

/**
 * Sub-County Service
 * Handles API calls for sub-county resources
 */

/**
 * Fetch sub-counties with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated sub-county list
 */
export const fetchSubCounties = async (params?: SubCountyQueryParams): Promise<SubCountyListResponse> => {
  const response = await axiosInstance.get<SubCountyListResponse>('/system-administration/sub-counties/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single sub-county by ID
 * @param id Sub-County UUID
 * @returns Promise with sub-county details
 */
export const fetchSubCountyById = async (id: string): Promise<SubCounty> => {
  const response = await axiosInstance.get<SubCounty>(`/system-administration/sub-counties/${id}/`);
  return response.data;
};

/**
 * Create a new sub-county
 * @param data Sub-County data
 * @returns Promise with created sub-county
 */
export const createSubCounty = async (data: Partial<SubCounty>): Promise<SubCounty> => {
  const response = await axiosInstance.post<SubCounty>('/system-administration/sub-counties/', data);
  return response.data;
};

/**
 * Update an existing sub-county
 * @param id Sub-County UUID
 * @param data Updated sub-county data
 * @returns Promise with updated sub-county
 */
export const updateSubCounty = async (id: string, data: Partial<SubCounty>): Promise<SubCounty> => {
  const response = await axiosInstance.put<SubCounty>(`/system-administration/sub-counties/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing sub-county
 * @param id Sub-County UUID
 * @param data Partial sub-county data to update
 * @returns Promise with updated sub-county
 */
export const patchSubCounty = async (id: string, data: Partial<SubCounty>): Promise<SubCounty> => {
  const response = await axiosInstance.patch<SubCounty>(`/system-administration/sub-counties/${id}/`, data);
  return response.data;
};

/**
 * Delete a sub-county
 * @param id Sub-County UUID
 * @returns Promise with void
 */
export const deleteSubCounty = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/sub-counties/${id}/`);
};

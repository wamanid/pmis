import axiosInstance from '../axiosInstance';
import type { 
  District,
  DistrictListResponse,
  DistrictQueryParams
} from '../../models/system_administration';

/**
 * District Service
 * Handles API calls for district resources
 */

/**
 * Fetch districts with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated district list
 */
export const fetchDistricts = async (params?: DistrictQueryParams): Promise<DistrictListResponse> => {
  const response = await axiosInstance.get<DistrictListResponse>('/system-administration/districts/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single district by ID
 * @param id District UUID
 * @returns Promise with district details
 */
export const fetchDistrictById = async (id: string): Promise<District> => {
  const response = await axiosInstance.get<District>(`/system-administration/districts/${id}/`);
  return response.data;
};

/**
 * Create a new district
 * @param data District data
 * @returns Promise with created district
 */
export const createDistrict = async (data: Partial<District>): Promise<District> => {
  const response = await axiosInstance.post<District>('/system-administration/districts/', data);
  return response.data;
};

/**
 * Update an existing district
 * @param id District UUID
 * @param data Updated district data
 * @returns Promise with updated district
 */
export const updateDistrict = async (id: string, data: Partial<District>): Promise<District> => {
  const response = await axiosInstance.put<District>(`/system-administration/districts/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing district
 * @param id District UUID
 * @param data Partial district data to update
 * @returns Promise with updated district
 */
export const patchDistrict = async (id: string, data: Partial<District>): Promise<District> => {
  const response = await axiosInstance.patch<District>(`/system-administration/districts/${id}/`, data);
  return response.data;
};

/**
 * Delete a district
 * @param id District UUID
 * @returns Promise with void
 */
export const deleteDistrict = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/districts/${id}/`);
};

import axiosInstance from '../axiosInstance';
import type { 
  Village,
  VillageListResponse,
  VillageQueryParams
} from '../../models/system_administration';

/**
 * Village Service
 * Handles API calls for village resources
 */

/**
 * Fetch villages with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated village list
 */
export const fetchVillages = async (params?: VillageQueryParams): Promise<VillageListResponse> => {
  const response = await axiosInstance.get<VillageListResponse>('/system-administration/villages/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single village by ID
 * @param id Village UUID
 * @returns Promise with village details
 */
export const fetchVillageById = async (id: string): Promise<Village> => {
  const response = await axiosInstance.get<Village>(`/system-administration/villages/${id}/`);
  return response.data;
};

/**
 * Create a new village
 * @param data Village data
 * @returns Promise with created village
 */
export const createVillage = async (data: Partial<Village>): Promise<Village> => {
  const response = await axiosInstance.post<Village>('/system-administration/villages/', data);
  return response.data;
};

/**
 * Update an existing village
 * @param id Village UUID
 * @param data Updated village data
 * @returns Promise with updated village
 */
export const updateVillage = async (id: string, data: Partial<Village>): Promise<Village> => {
  const response = await axiosInstance.put<Village>(`/system-administration/villages/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing village
 * @param id Village UUID
 * @param data Partial village data to update
 * @returns Promise with updated village
 */
export const patchVillage = async (id: string, data: Partial<Village>): Promise<Village> => {
  const response = await axiosInstance.patch<Village>(`/system-administration/villages/${id}/`, data);
  return response.data;
};

/**
 * Delete a village
 * @param id Village UUID
 * @returns Promise with void
 */
export const deleteVillage = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/villages/${id}/`);
};

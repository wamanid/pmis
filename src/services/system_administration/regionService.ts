import axiosInstance from '../axiosInstance';
import type { 
  Region, 
  RegionListResponse, 
  RegionQueryParams
} from '../../models/system_administration';

/**
 * Region Service
 * Handles API calls for region resources
 */

/**
 * Fetch regions with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated region list
 */
export const fetchRegions = async (params?: RegionQueryParams): Promise<RegionListResponse> => {
  const response = await axiosInstance.get<RegionListResponse>('/system-administration/regions/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single region by ID
 * @param id Region UUID
 * @returns Promise with region details
 */
export const fetchRegionById = async (id: string): Promise<Region> => {
  const response = await axiosInstance.get<Region>(`/system-administration/regions/${id}/`);
  return response.data;
};

/**
 * Create a new region
 * @param data Region data
 * @returns Promise with created region
 */
export const createRegion = async (data: Partial<Region>): Promise<Region> => {
  const response = await axiosInstance.post<Region>('/system-administration/regions/', data);
  return response.data;
};

/**
 * Update an existing region
 * @param id Region UUID
 * @param data Updated region data
 * @returns Promise with updated region
 */
export const updateRegion = async (id: string, data: Partial<Region>): Promise<Region> => {
  const response = await axiosInstance.put<Region>(`/system-administration/regions/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing region
 * @param id Region UUID
 * @param data Partial region data to update
 * @returns Promise with updated region
 */
export const patchRegion = async (id: string, data: Partial<Region>): Promise<Region> => {
  const response = await axiosInstance.patch<Region>(`/system-administration/regions/${id}/`, data);
  return response.data;
};

/**
 * Delete a region
 * @param id Region UUID
 * @returns Promise with void
 */
export const deleteRegion = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/regions/${id}/`);
};

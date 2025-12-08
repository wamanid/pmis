import axiosInstance from '../axiosInstance';
import type { 
  Parish,
  ParishListResponse,
  ParishQueryParams
} from '../../models/system_administration';

/**
 * Parish Service
 * Handles API calls for parish resources
 */

/**
 * Fetch parishes with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated parish list
 */
export const fetchParishes = async (params?: ParishQueryParams): Promise<ParishListResponse> => {
  const response = await axiosInstance.get<ParishListResponse>('/system-administration/parishes/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single parish by ID
 * @param id Parish UUID
 * @returns Promise with parish details
 */
export const fetchParishById = async (id: string): Promise<Parish> => {
  const response = await axiosInstance.get<Parish>(`/system-administration/parishes/${id}/`);
  return response.data;
};

/**
 * Create a new parish
 * @param data Parish data
 * @returns Promise with created parish
 */
export const createParish = async (data: Partial<Parish>): Promise<Parish> => {
  const response = await axiosInstance.post<Parish>('/system-administration/parishes/', data);
  return response.data;
};

/**
 * Update an existing parish
 * @param id Parish UUID
 * @param data Updated parish data
 * @returns Promise with updated parish
 */
export const updateParish = async (id: string, data: Partial<Parish>): Promise<Parish> => {
  const response = await axiosInstance.put<Parish>(`/system-administration/parishes/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing parish
 * @param id Parish UUID
 * @param data Partial parish data to update
 * @returns Promise with updated parish
 */
export const patchParish = async (id: string, data: Partial<Parish>): Promise<Parish> => {
  const response = await axiosInstance.patch<Parish>(`/system-administration/parishes/${id}/`, data);
  return response.data;
};

/**
 * Delete a parish
 * @param id Parish UUID
 * @returns Promise with void
 */
export const deleteParish = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/parishes/${id}/`);
};

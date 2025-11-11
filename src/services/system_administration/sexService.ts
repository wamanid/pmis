import axiosInstance from '../axiosInstance';
import type { 
  Sex,
  SexListResponse,
  SexQueryParams
} from '../../models/system_administration';

/**
 * Sex Service
 * Handles API calls for sex/gender resources
 */

/**
 * Fetch sexes with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated sex list
 */
export const fetchSexes = async (params?: SexQueryParams): Promise<SexListResponse> => {
  const response = await axiosInstance.get<SexListResponse>('/system-administration/sexes/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single sex by ID
 * @param id Sex UUID
 * @returns Promise with sex details
 */
export const fetchSexById = async (id: string): Promise<Sex> => {
  const response = await axiosInstance.get<Sex>(`/system-administration/sexes/${id}/`);
  return response.data;
};

/**
 * Create a new sex
 * @param data Sex data
 * @returns Promise with created sex
 */
export const createSex = async (data: Partial<Sex>): Promise<Sex> => {
  const response = await axiosInstance.post<Sex>('/system-administration/sexes/', data);
  return response.data;
};

/**
 * Update an existing sex
 * @param id Sex UUID
 * @param data Updated sex data
 * @returns Promise with updated sex
 */
export const updateSex = async (id: string, data: Partial<Sex>): Promise<Sex> => {
  const response = await axiosInstance.put<Sex>(`/system-administration/sexes/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing sex
 * @param id Sex UUID
 * @param data Partial sex data to update
 * @returns Promise with updated sex
 */
export const patchSex = async (id: string, data: Partial<Sex>): Promise<Sex> => {
  const response = await axiosInstance.patch<Sex>(`/system-administration/sexes/${id}/`, data);
  return response.data;
};

/**
 * Delete a sex
 * @param id Sex UUID
 * @returns Promise with void
 */
export const deleteSex = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/sexes/${id}/`);
};

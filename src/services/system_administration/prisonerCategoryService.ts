import axiosInstance from '../axiosInstance';
import type { 
  PrisonerCategory,
  PrisonerCategoryListResponse,
  PrisonerCategoryQueryParams
} from '../../models/system_administration';

/**
 * Prisoner Category Service
 * Handles API calls for prisoner category resources
 */

/**
 * Fetch prisoner categories with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated prisoner category list
 */
export const fetchPrisonerCategories = async (params?: PrisonerCategoryQueryParams): Promise<PrisonerCategoryListResponse> => {
  const response = await axiosInstance.get<PrisonerCategoryListResponse>('/system-administration/prisoner-categories/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single prisoner category by ID
 * @param id Prisoner Category UUID
 * @returns Promise with prisoner category details
 */
export const fetchPrisonerCategoryById = async (id: string): Promise<PrisonerCategory> => {
  const response = await axiosInstance.get<PrisonerCategory>(`/system-administration/prisoner-categories/${id}/`);
  return response.data;
};

/**
 * Create a new prisoner category
 * @param data Prisoner category data
 * @returns Promise with created prisoner category
 */
export const createPrisonerCategory = async (data: Partial<PrisonerCategory>): Promise<PrisonerCategory> => {
  const response = await axiosInstance.post<PrisonerCategory>('/system-administration/prisoner-categories/', data);
  return response.data;
};

/**
 * Update an existing prisoner category
 * @param id Prisoner Category UUID
 * @param data Updated prisoner category data
 * @returns Promise with updated prisoner category
 */
export const updatePrisonerCategory = async (id: string, data: Partial<PrisonerCategory>): Promise<PrisonerCategory> => {
  const response = await axiosInstance.put<PrisonerCategory>(`/system-administration/prisoner-categories/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing prisoner category
 * @param id Prisoner Category UUID
 * @param data Partial prisoner category data to update
 * @returns Promise with updated prisoner category
 */
export const patchPrisonerCategory = async (id: string, data: Partial<PrisonerCategory>): Promise<PrisonerCategory> => {
  const response = await axiosInstance.patch<PrisonerCategory>(`/system-administration/prisoner-categories/${id}/`, data);
  return response.data;
};

/**
 * Delete a prisoner category
 * @param id Prisoner Category UUID
 * @returns Promise with void
 */
export const deletePrisonerCategory = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/prisoner-categories/${id}/`);
};

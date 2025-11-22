import axiosInstance from '../axiosInstance';
import type { PrisonerClass, PrisonerClassListResponse, PrisonerClassParams } from '../../models/system_administration/prisonerClass';

const BASE_URL = '/system-administration/prisoner-classes';

/**
 * Fetch all prisoner classes with optional filters
 */
export const fetchPrisonerClasses = async (params?: PrisonerClassParams): Promise<PrisonerClassListResponse> => {
  const response = await axiosInstance.get<PrisonerClassListResponse>(BASE_URL + '/', { params });
  return response.data;
};

/**
 * Fetch a single prisoner class by ID
 */
export const fetchPrisonerClassById = async (id: string): Promise<PrisonerClass> => {
  const response = await axiosInstance.get<PrisonerClass>(`${BASE_URL}/${id}/`);
  return response.data;
};

/**
 * Create a new prisoner class
 */
export const createPrisonerClass = async (data: Omit<PrisonerClass, 'id'>): Promise<PrisonerClass> => {
  const response = await axiosInstance.post<PrisonerClass>(BASE_URL + '/', data);
  return response.data;
};

/**
 * Update a prisoner class (full update)
 */
export const updatePrisonerClass = async (id: string, data: Omit<PrisonerClass, 'id'>): Promise<PrisonerClass> => {
  const response = await axiosInstance.put<PrisonerClass>(`${BASE_URL}/${id}/`, data);
  return response.data;
};

/**
 * Partially update a prisoner class
 */
export const patchPrisonerClass = async (id: string, data: Partial<Omit<PrisonerClass, 'id'>>): Promise<PrisonerClass> => {
  const response = await axiosInstance.patch<PrisonerClass>(`${BASE_URL}/${id}/`, data);
  return response.data;
};

/**
 * Delete a prisoner class
 */
export const deletePrisonerClass = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}/${id}/`);
};

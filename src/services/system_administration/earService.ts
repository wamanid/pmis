import axiosInstance from '../axiosInstance';
import type {
  Ear,
  EarListResponse,
  EarQueryParams,
  CreateEarParams,
  UpdateEarParams,
} from '../../models/system_administration/ear';

const BASE_URL = '/system-administration/ears/';

/**
 * Fetch all ears with optional filtering and pagination
 */
export const fetchEars = async (
  params?: EarQueryParams
): Promise<EarListResponse> => {
  const response = await axiosInstance.get<EarListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single ear by ID
 */
export const fetchEarById = async (id: string): Promise<Ear> => {
  const response = await axiosInstance.get<Ear>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new ear
 */
export const createEar = async (
  data: CreateEarParams
): Promise<Ear> => {
  const response = await axiosInstance.post<Ear>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing ear
 */
export const updateEar = async (
  id: string,
  data: UpdateEarParams
): Promise<Ear> => {
  const response = await axiosInstance.patch<Ear>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete an ear
 */
export const deleteEar = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

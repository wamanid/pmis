import axiosInstance from '../axiosInstance';
import type {
  Eye,
  EyeListResponse,
  EyeQueryParams,
  CreateEyeParams,
  UpdateEyeParams,
} from '../../models/system_administration/eye';

const BASE_URL = '/system-administration/eyes/';

/**
 * Fetch all eyes with optional filtering and pagination
 */
export const fetchEyes = async (
  params?: EyeQueryParams
): Promise<EyeListResponse> => {
  const response = await axiosInstance.get<EyeListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single eye by ID
 */
export const fetchEyeById = async (id: string): Promise<Eye> => {
  const response = await axiosInstance.get<Eye>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new eye
 */
export const createEye = async (
  data: CreateEyeParams
): Promise<Eye> => {
  const response = await axiosInstance.post<Eye>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing eye
 */
export const updateEye = async (
  id: string,
  data: UpdateEyeParams
): Promise<Eye> => {
  const response = await axiosInstance.patch<Eye>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete an eye
 */
export const deleteEye = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

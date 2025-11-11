import axiosInstance from '../axiosInstance';
import type {
  StatusOfWoman,
  StatusOfWomanListResponse,
  StatusOfWomanQueryParams,
  CreateStatusOfWomanData,
  UpdateStatusOfWomanData,
} from '../../models/system_administration/statusOfWoman';

const BASE_URL = '/api/system-administration/status-of-women/';

/**
 * Fetch status of women with optional query parameters
 */
export const fetchStatusOfWomen = async (
  params?: StatusOfWomanQueryParams
): Promise<StatusOfWomanListResponse> => {
  const response = await axiosInstance.get<StatusOfWomanListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single status of woman by ID
 */
export const fetchStatusOfWomanById = async (id: string): Promise<StatusOfWoman> => {
  const response = await axiosInstance.get<StatusOfWoman>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new status of woman
 */
export const createStatusOfWoman = async (data: CreateStatusOfWomanData): Promise<StatusOfWoman> => {
  const response = await axiosInstance.post<StatusOfWoman>(BASE_URL, data);
  return response.data;
};

/**
 * Update a status of woman (PUT)
 */
export const updateStatusOfWoman = async (
  id: string,
  data: UpdateStatusOfWomanData
): Promise<StatusOfWoman> => {
  const response = await axiosInstance.put<StatusOfWoman>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update a status of woman (PATCH)
 */
export const patchStatusOfWoman = async (
  id: string,
  data: Partial<UpdateStatusOfWomanData>
): Promise<StatusOfWoman> => {
  const response = await axiosInstance.patch<StatusOfWoman>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete a status of woman
 */
export const deleteStatusOfWoman = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

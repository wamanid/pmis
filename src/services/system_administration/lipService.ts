import axiosInstance from '../axiosInstance';
import type {
  Lip,
  LipListResponse,
  LipQueryParams,
  CreateLipParams,
  UpdateLipParams,
} from '../../models/system_administration/lip';

const BASE_URL = '/system-administration/lips/';

/**
 * Fetch all lips with optional filtering and pagination
 */
export const fetchLips = async (
  params?: LipQueryParams
): Promise<LipListResponse> => {
  const response = await axiosInstance.get<LipListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single lip by ID
 */
export const fetchLipById = async (id: string): Promise<Lip> => {
  const response = await axiosInstance.get<Lip>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new lip
 */
export const createLip = async (
  data: CreateLipParams
): Promise<Lip> => {
  const response = await axiosInstance.post<Lip>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing lip
 */
export const updateLip = async (
  id: string,
  data: UpdateLipParams
): Promise<Lip> => {
  const response = await axiosInstance.patch<Lip>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete a lip
 */
export const deleteLip = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

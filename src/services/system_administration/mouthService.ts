import axiosInstance from '../axiosInstance';
import type {
  Mouth,
  MouthListResponse,
  MouthQueryParams,
  CreateMouthParams,
  UpdateMouthParams,
} from '../../models/system_administration/mouth';

const BASE_URL = '/system-administration/mouths/';

/**
 * Fetch all mouths with optional filtering and pagination
 */
export const fetchMouths = async (
  params?: MouthQueryParams
): Promise<MouthListResponse> => {
  const response = await axiosInstance.get<MouthListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single mouth by ID
 */
export const fetchMouthById = async (id: string): Promise<Mouth> => {
  const response = await axiosInstance.get<Mouth>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new mouth
 */
export const createMouth = async (
  data: CreateMouthParams
): Promise<Mouth> => {
  const response = await axiosInstance.post<Mouth>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing mouth
 */
export const updateMouth = async (
  id: string,
  data: UpdateMouthParams
): Promise<Mouth> => {
  const response = await axiosInstance.patch<Mouth>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete a mouth
 */
export const deleteMouth = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

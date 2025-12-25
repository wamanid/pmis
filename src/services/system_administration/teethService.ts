import axiosInstance from '../axiosInstance';
import type {
  Teeth,
  TeethListResponse,
  TeethQueryParams,
  CreateTeethParams,
  UpdateTeethParams,
} from '../../models/system_administration/teeth';

const BASE_URL = '/system-administration/teeth/';

/**
 * Fetch all teeth with optional filtering and pagination
 */
export const fetchTeeth = async (
  params?: TeethQueryParams
): Promise<TeethListResponse> => {
  const response = await axiosInstance.get<TeethListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single teeth by ID
 */
export const fetchTeethById = async (id: string): Promise<Teeth> => {
  const response = await axiosInstance.get<Teeth>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new teeth
 */
export const createTeeth = async (
  data: CreateTeethParams
): Promise<Teeth> => {
  const response = await axiosInstance.post<Teeth>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing teeth
 */
export const updateTeeth = async (
  id: string,
  data: UpdateTeethParams
): Promise<Teeth> => {
  const response = await axiosInstance.patch<Teeth>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete a teeth
 */
export const deleteTeeth = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

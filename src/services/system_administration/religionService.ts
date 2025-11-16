import axiosInstance from '../axiosInstance';
import type {
  Religion,
  ReligionListResponse,
  ReligionQueryParams,
  CreateReligionData,
  UpdateReligionData,
} from '../../models/system_administration/religion';

const BASE_URL = '/system-administration/religions/';

/**
 * Fetch religions with optional query parameters
 */
export const fetchReligions = async (
  params?: ReligionQueryParams
): Promise<ReligionListResponse> => {
  const response = await axiosInstance.get<ReligionListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single religion by ID
 */
export const fetchReligionById = async (id: string): Promise<Religion> => {
  const response = await axiosInstance.get<Religion>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new religion
 */
export const createReligion = async (data: CreateReligionData): Promise<Religion> => {
  const response = await axiosInstance.post<Religion>(BASE_URL, data);
  return response.data;
};

/**
 * Update a religion (PUT)
 */
export const updateReligion = async (
  id: string,
  data: UpdateReligionData
): Promise<Religion> => {
  const response = await axiosInstance.put<Religion>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update a religion (PATCH)
 */
export const patchReligion = async (
  id: string,
  data: Partial<UpdateReligionData>
): Promise<Religion> => {
  const response = await axiosInstance.patch<Religion>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete a religion
 */
export const deleteReligion = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

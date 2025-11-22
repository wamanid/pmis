import axiosInstance from '../axiosInstance';
import type {
  EducationLevel,
  EducationLevelListResponse,
  EducationLevelQueryParams,
  CreateEducationLevelData,
  UpdateEducationLevelData,
} from '../../models/system_administration/educationLevel';

const BASE_URL = '/system-administration/education-levels/';

/**
 * Fetch education levels with optional query parameters
 */
export const fetchEducationLevels = async (
  params?: EducationLevelQueryParams
): Promise<EducationLevelListResponse> => {
  const response = await axiosInstance.get<EducationLevelListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single education level by ID
 */
export const fetchEducationLevelById = async (id: string): Promise<EducationLevel> => {
  const response = await axiosInstance.get<EducationLevel>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new education level
 */
export const createEducationLevel = async (data: CreateEducationLevelData): Promise<EducationLevel> => {
  const response = await axiosInstance.post<EducationLevel>(BASE_URL, data);
  return response.data;
};

/**
 * Update an education level (PUT)
 */
export const updateEducationLevel = async (
  id: string,
  data: UpdateEducationLevelData
): Promise<EducationLevel> => {
  const response = await axiosInstance.put<EducationLevel>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update an education level (PATCH)
 */
export const patchEducationLevel = async (
  id: string,
  data: Partial<UpdateEducationLevelData>
): Promise<EducationLevel> => {
  const response = await axiosInstance.patch<EducationLevel>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete an education level
 */
export const deleteEducationLevel = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

import axiosInstance from '../axiosInstance';
import type {
  MaritalStatus,
  MaritalStatusListResponse,
  MaritalStatusQueryParams,
  CreateMaritalStatusData,
  UpdateMaritalStatusData,
} from '../../models/system_administration/maritalStatus';

const BASE_URL = '/system-administration/marital-statuses/';

/**
 * Fetch marital statuses with optional query parameters
 */
export const fetchMaritalStatuses = async (
  params?: MaritalStatusQueryParams
): Promise<MaritalStatusListResponse> => {
  const response = await axiosInstance.get<MaritalStatusListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single marital status by ID
 */
export const fetchMaritalStatusById = async (id: string): Promise<MaritalStatus> => {
  const response = await axiosInstance.get<MaritalStatus>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new marital status
 */
export const createMaritalStatus = async (data: CreateMaritalStatusData): Promise<MaritalStatus> => {
  const response = await axiosInstance.post<MaritalStatus>(BASE_URL, data);
  return response.data;
};

/**
 * Update a marital status (PUT)
 */
export const updateMaritalStatus = async (
  id: string,
  data: UpdateMaritalStatusData
): Promise<MaritalStatus> => {
  const response = await axiosInstance.put<MaritalStatus>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update a marital status (PATCH)
 */
export const patchMaritalStatus = async (
  id: string,
  data: Partial<UpdateMaritalStatusData>
): Promise<MaritalStatus> => {
  const response = await axiosInstance.patch<MaritalStatus>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete a marital status
 */
export const deleteMaritalStatus = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

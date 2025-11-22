import axiosInstance from '../axiosInstance';
import type {
  EmploymentStatus,
  EmploymentStatusListResponse,
  EmploymentStatusQueryParams,
  CreateEmploymentStatusData,
  UpdateEmploymentStatusData,
} from '../../models/system_administration/employmentStatus';

const BASE_URL = '/system-administration/employment-statuses/';

/**
 * Fetch employment statuses with optional query parameters
 */
export const fetchEmploymentStatuses = async (
  params?: EmploymentStatusQueryParams
): Promise<EmploymentStatusListResponse> => {
  const response = await axiosInstance.get<EmploymentStatusListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single employment status by ID
 */
export const fetchEmploymentStatusById = async (id: string): Promise<EmploymentStatus> => {
  const response = await axiosInstance.get<EmploymentStatus>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new employment status
 */
export const createEmploymentStatus = async (data: CreateEmploymentStatusData): Promise<EmploymentStatus> => {
  const response = await axiosInstance.post<EmploymentStatus>(BASE_URL, data);
  return response.data;
};

/**
 * Update an employment status (PUT)
 */
export const updateEmploymentStatus = async (
  id: string,
  data: UpdateEmploymentStatusData
): Promise<EmploymentStatus> => {
  const response = await axiosInstance.put<EmploymentStatus>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update an employment status (PATCH)
 */
export const patchEmploymentStatus = async (
  id: string,
  data: Partial<UpdateEmploymentStatusData>
): Promise<EmploymentStatus> => {
  const response = await axiosInstance.patch<EmploymentStatus>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete an employment status
 */
export const deleteEmploymentStatus = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

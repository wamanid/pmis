import axiosInstance from '../axiosInstance';
import type {
  IdType,
  IdTypeListResponse,
  IdTypeQueryParams,
  CreateIdTypeData,
  UpdateIdTypeData,
} from '../../models/system_administration/idType';

const BASE_URL = '/system-administration/id-types/';

/**
 * Fetch ID types with optional query parameters
 */
export const fetchIdTypes = async (
  params?: IdTypeQueryParams
): Promise<IdTypeListResponse> => {
  const response = await axiosInstance.get<IdTypeListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single ID type by ID
 */
export const fetchIdTypeById = async (id: string): Promise<IdType> => {
  const response = await axiosInstance.get<IdType>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new ID type
 */
export const createIdType = async (data: CreateIdTypeData): Promise<IdType> => {
  const response = await axiosInstance.post<IdType>(BASE_URL, data);
  return response.data;
};

/**
 * Update an ID type (PUT)
 */
export const updateIdType = async (
  id: string,
  data: UpdateIdTypeData
): Promise<IdType> => {
  const response = await axiosInstance.put<IdType>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update an ID type (PATCH)
 */
export const patchIdType = async (
  id: string,
  data: Partial<UpdateIdTypeData>
): Promise<IdType> => {
  const response = await axiosInstance.patch<IdType>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete an ID type
 */
export const deleteIdType = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

import axiosInstance from '../axiosInstance';
import type {
  Hair,
  HairListResponse,
  HairQueryParams,
  CreateHairParams,
  UpdateHairParams,
} from '../../models/system_administration/hair';

const BASE_URL = '/system-administration/hairs/';

/**
 * Fetch all hairs with optional filtering and pagination
 */
export const fetchHairs = async (
  params?: HairQueryParams
): Promise<HairListResponse> => {
  const response = await axiosInstance.get<HairListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single hair by ID
 */
export const fetchHairById = async (id: string): Promise<Hair> => {
  const response = await axiosInstance.get<Hair>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new hair
 */
export const createHair = async (
  data: CreateHairParams
): Promise<Hair> => {
  const response = await axiosInstance.post<Hair>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing hair
 */
export const updateHair = async (
  id: string,
  data: UpdateHairParams
): Promise<Hair> => {
  const response = await axiosInstance.patch<Hair>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete a hair
 */
export const deleteHair = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

import axiosInstance from '../axiosInstance';
import type {
  Tribe,
  TribeListResponse,
  TribeQueryParams,
  CreateTribeData,
  UpdateTribeData,
} from '../../models/system_administration/tribe';

const BASE_URL = '/api/system-administration/tribes/';

/**
 * Fetch tribes with optional query parameters
 */
export const fetchTribes = async (
  params?: TribeQueryParams
): Promise<TribeListResponse> => {
  const response = await axiosInstance.get<TribeListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single tribe by ID
 */
export const fetchTribeById = async (id: string): Promise<Tribe> => {
  const response = await axiosInstance.get<Tribe>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new tribe
 */
export const createTribe = async (data: CreateTribeData): Promise<Tribe> => {
  const response = await axiosInstance.post<Tribe>(BASE_URL, data);
  return response.data;
};

/**
 * Update a tribe (PUT)
 */
export const updateTribe = async (
  id: string,
  data: UpdateTribeData
): Promise<Tribe> => {
  const response = await axiosInstance.put<Tribe>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update a tribe (PATCH)
 */
export const patchTribe = async (
  id: string,
  data: Partial<UpdateTribeData>
): Promise<Tribe> => {
  const response = await axiosInstance.patch<Tribe>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete a tribe
 */
export const deleteTribe = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

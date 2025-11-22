import axiosInstance from '../axiosInstance';
import type {
  Continent,
  ContinentListResponse,
  ContinentQueryParams,
  CreateContinentData,
  UpdateContinentData,
} from '../../models/system_administration/continent';

const BASE_URL = '/system-administration/continents/';

/**
 * Fetch continents with optional query parameters
 */
export const fetchContinents = async (
  params?: ContinentQueryParams
): Promise<ContinentListResponse> => {
  const response = await axiosInstance.get<ContinentListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single continent by ID
 */
export const fetchContinentById = async (id: string): Promise<Continent> => {
  const response = await axiosInstance.get<Continent>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new continent
 */
export const createContinent = async (data: CreateContinentData): Promise<Continent> => {
  const response = await axiosInstance.post<Continent>(BASE_URL, data);
  return response.data;
};

/**
 * Update a continent (PUT)
 */
export const updateContinent = async (
  id: string,
  data: UpdateContinentData
): Promise<Continent> => {
  const response = await axiosInstance.put<Continent>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update a continent (PATCH)
 */
export const patchContinent = async (
  id: string,
  data: Partial<UpdateContinentData>
): Promise<Continent> => {
  const response = await axiosInstance.patch<Continent>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete a continent
 */
export const deleteContinent = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

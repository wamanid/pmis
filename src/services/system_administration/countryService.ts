import axiosInstance from '../axiosInstance';
import type {
  Country,
  CountryListResponse,
  CountryQueryParams,
  CreateCountryData,
  UpdateCountryData,
} from '../../models/system_administration/country';

const BASE_URL = '/api/system-administration/countries/';

/**
 * Fetch countries with optional query parameters
 */
export const fetchCountries = async (
  params?: CountryQueryParams
): Promise<CountryListResponse> => {
  const response = await axiosInstance.get<CountryListResponse>(BASE_URL, { params });
  return response.data;
};

/**
 * Fetch a single country by ID
 */
export const fetchCountryById = async (id: string): Promise<Country> => {
  const response = await axiosInstance.get<Country>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new country
 */
export const createCountry = async (data: CreateCountryData): Promise<Country> => {
  const response = await axiosInstance.post<Country>(BASE_URL, data);
  return response.data;
};

/**
 * Update a country (PUT)
 */
export const updateCountry = async (
  id: string,
  data: UpdateCountryData
): Promise<Country> => {
  const response = await axiosInstance.put<Country>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Partially update a country (PATCH)
 */
export const patchCountry = async (
  id: string,
  data: Partial<UpdateCountryData>
): Promise<Country> => {
  const response = await axiosInstance.patch<Country>(`${BASE_URL}${id}/`, data);
  return response.data;
};

/**
 * Delete a country
 */
export const deleteCountry = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};

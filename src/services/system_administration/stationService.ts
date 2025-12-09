import axiosInstance from '../axiosInstance';
import type { 
  Station,
  StationListResponse,
  StationQueryParams
} from '../../models/system_administration';

/**
 * Station Service
 * Handles API calls for station resources
 */

/**
 * Fetch stations with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated station list
 */
export const fetchStations = async (params?: StationQueryParams): Promise<StationListResponse> => {
  const response = await axiosInstance.get<StationListResponse>('/system-administration/stations/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single station by ID
 * @param id Station UUID
 * @returns Promise with station details
 */
export const fetchStationById = async (id: string): Promise<Station> => {
  const response = await axiosInstance.get<Station>(`/system-administration/stations/${id}/`);
  return response.data;
};

/**
 * Create a new station
 * @param data Station data
 * @returns Promise with created station
 */
export const createStation = async (data: Partial<Station>): Promise<Station> => {
  const response = await axiosInstance.post<Station>('/system-administration/stations/', data);
  return response.data;
};

/**
 * Update an existing station
 * @param id Station UUID
 * @param data Updated station data
 * @returns Promise with updated station
 */
export const updateStation = async (id: string, data: Partial<Station>): Promise<Station> => {
  const response = await axiosInstance.put<Station>(`/system-administration/stations/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing station
 * @param id Station UUID
 * @param data Partial station data to update
 * @returns Promise with updated station
 */
export const patchStation = async (id: string, data: Partial<Station>): Promise<Station> => {
  const response = await axiosInstance.patch<Station>(`/system-administration/stations/${id}/`, data);
  return response.data;
};

/**
 * Delete a station
 * @param id Station UUID
 * @returns Promise with void
 */
export const deleteStation = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/stations/${id}/`);
};

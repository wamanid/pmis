import axiosInstance from './axiosInstance';
import type { 
  Region, 
  RegionListResponse, 
  RegionQueryParams,
  District,
  DistrictListResponse,
  DistrictQueryParams,
  Station,
  StationListResponse,
  StationQueryParams
} from '../models/system_administration';

/**
 * System Administration Service
 * Handles API calls for system administration resources
 */

// ==================== REGIONS ====================

/**
 * Fetch regions with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated region list
 */
export const fetchRegions = async (params?: RegionQueryParams): Promise<RegionListResponse> => {
  const response = await axiosInstance.get<RegionListResponse>('/system-administration/regions/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single region by ID
 * @param id Region UUID
 * @returns Promise with region details
 */
export const fetchRegionById = async (id: string): Promise<Region> => {
  const response = await axiosInstance.get<Region>(`/system-administration/regions/${id}/`);
  return response.data;
};

/**
 * Create a new region
 * @param data Region data
 * @returns Promise with created region
 */
export const createRegion = async (data: Partial<Region>): Promise<Region> => {
  const response = await axiosInstance.post<Region>('/system-administration/regions/', data);
  return response.data;
};

/**
 * Update an existing region
 * @param id Region UUID
 * @param data Updated region data
 * @returns Promise with updated region
 */
export const updateRegion = async (id: string, data: Partial<Region>): Promise<Region> => {
  const response = await axiosInstance.put<Region>(`/system-administration/regions/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing region
 * @param id Region UUID
 * @param data Partial region data to update
 * @returns Promise with updated region
 */
export const patchRegion = async (id: string, data: Partial<Region>): Promise<Region> => {
  const response = await axiosInstance.patch<Region>(`/system-administration/regions/${id}/`, data);
  return response.data;
};

/**
 * Delete a region
 * @param id Region UUID
 * @returns Promise with void
 */
export const deleteRegion = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/regions/${id}/`);
};

// ==================== DISTRICTS ====================

/**
 * Fetch districts with optional filtering, searching, and pagination
 * @param params Query parameters for filtering and pagination
 * @returns Promise with paginated district list
 */
export const fetchDistricts = async (params?: DistrictQueryParams): Promise<DistrictListResponse> => {
  const response = await axiosInstance.get<DistrictListResponse>('/system-administration/districts/', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single district by ID
 * @param id District UUID
 * @returns Promise with district details
 */
export const fetchDistrictById = async (id: string): Promise<District> => {
  const response = await axiosInstance.get<District>(`/system-administration/districts/${id}/`);
  return response.data;
};

/**
 * Create a new district
 * @param data District data
 * @returns Promise with created district
 */
export const createDistrict = async (data: Partial<District>): Promise<District> => {
  const response = await axiosInstance.post<District>('/system-administration/districts/', data);
  return response.data;
};

/**
 * Update an existing district
 * @param id District UUID
 * @param data Updated district data
 * @returns Promise with updated district
 */
export const updateDistrict = async (id: string, data: Partial<District>): Promise<District> => {
  const response = await axiosInstance.put<District>(`/system-administration/districts/${id}/`, data);
  return response.data;
};

/**
 * Partially update an existing district
 * @param id District UUID
 * @param data Partial district data to update
 * @returns Promise with updated district
 */
export const patchDistrict = async (id: string, data: Partial<District>): Promise<District> => {
  const response = await axiosInstance.patch<District>(`/system-administration/districts/${id}/`, data);
  return response.data;
};

/**
 * Delete a district
 * @param id District UUID
 * @returns Promise with void
 */
export const deleteDistrict = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/districts/${id}/`);
};

// ==================== STATIONS ====================

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

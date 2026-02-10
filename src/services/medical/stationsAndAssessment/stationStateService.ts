import axiosInstance from '../../axiosInstance';

// ========================
// API Endpoints
// ========================
export const STATION_STATE_API_ENDPOINTS = {
  STATION_STATES: 'medical-management/station-states/',
  STATIONS: 'system-administration/stations/',
  RATINGS: 'medical-management/ratings/',
};

// ========================
// Interfaces
// ========================
export interface StationState {
  id?: string;
  station_name?: string;
  level_of_conjestion: string;
  station: string;
  state_of_buildings: string;
  state_of_buildings_name?: string;
  ventilation: string;
  ventilation_name?: string;
  lighting: string;
  lighting_name?: string;
  fencing: string;
  fencing_name?: string;
  general_environment: string;
  general_environment_name?: string;
  ward_environment: string;
  ward_environment_name?: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
}

export interface Station {
  id: string;
  name: string;
  station_code?: string;
  district_name?: string;
  region_name?: string;
  security_level_name?: string;
  category_name?: string;
  station_type_name?: string;
  gender_name?: string;
  capacity?: string;
  occupancy?: string;
  congestion?: string;
  is_overcrowded?: string;
}

export interface Rating {
  id: string;
  name: string;
  description: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ========================
// Fetch Functions
// ========================

/**
 * Fetch paginated station states
 */
export async function fetchStationStates(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: StationState[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<StationState>>(
      STATION_STATE_API_ENDPOINTS.STATION_STATES,
      { params, signal }
    );

    return {
      items: response.data.results,
      count: response.data.count,
      next: response.data.next,
    };
  } catch (error: any) {
    // Silence cancellation errors
    if (
      error.name === 'CanceledError' ||
      error.code === 'ERR_CANCELED' ||
      error.name === 'AbortError'
    ) {
      return { items: [], count: 0, next: null };
    }
    console.error('Error fetching station states:', error);
    throw error;
  }
}

/**
 * Fetch paginated stations
 */
export async function fetchStations(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: Station[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<Station>>(
      STATION_STATE_API_ENDPOINTS.STATIONS,
      { params, signal }
    );

    return {
      items: response.data.results,
      count: response.data.count,
      next: response.data.next,
    };
  } catch (error: any) {
    // Silence cancellation errors
    if (
      error.name === 'CanceledError' ||
      error.code === 'ERR_CANCELED' ||
      error.name === 'AbortError'
    ) {
      return { items: [], count: 0, next: null };
    }
    console.error('Error fetching stations:', error);
    throw error;
  }
}

/**
 * Fetch paginated ratings
 */
export async function fetchRatings(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: Rating[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<Rating>>(
      STATION_STATE_API_ENDPOINTS.RATINGS,
      { params, signal }
    );

    return {
      items: response.data.results,
      count: response.data.count,
      next: response.data.next,
    };
  } catch (error: any) {
    // Silence cancellation errors
    if (
      error.name === 'CanceledError' ||
      error.code === 'ERR_CANCELED' ||
      error.name === 'AbortError'
    ) {
      return { items: [], count: 0, next: null };
    }
    console.error('Error fetching ratings:', error);
    throw error;
  }
}

/**
 * Fetch station state by ID
 */
export async function fetchStationStateById(id: string): Promise<StationState> {
  try {
    const response = await axiosInstance.get<StationState>(
      `${STATION_STATE_API_ENDPOINTS.STATION_STATES}${id}/`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching station state by ID:', error);
    throw error;
  }
}

// ========================
// CRUD Operations
// ========================

/**
 * Create a new station state record
 */
export async function createStationState(data: StationState): Promise<StationState> {
  try {
    const response = await axiosInstance.post<StationState>(
      STATION_STATE_API_ENDPOINTS.STATION_STATES,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating station state:', error);
    throw error;
  }
}

/**
 * Update an existing station state record
 */
export async function updateStationState(id: string, data: StationState): Promise<StationState> {
  try {
    const response = await axiosInstance.put<StationState>(
      `${STATION_STATE_API_ENDPOINTS.STATION_STATES}${id}/`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating station state:', error);
    throw error;
  }
}

/**
 * Delete a station state record
 */
export async function deleteStationState(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`${STATION_STATE_API_ENDPOINTS.STATION_STATES}${id}/`);
  } catch (error: any) {
    console.error('Error deleting station state:', error);
    throw error;
  }
}

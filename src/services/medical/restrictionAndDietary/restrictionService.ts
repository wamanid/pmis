import axiosInstance from '../../axiosInstance';

/**
 * Centralized API Endpoints for Medical Restrictions Module
 * Following the pattern from journal, complaints, and housing allocation modules
 */
export const RESTRICTION_API_ENDPOINTS = {
  RESTRICTIONS: '/medical-management/restrictions/',
  RESTRICTION_REASONS: '/medical-management/restriction-reasons/',
  PRISONERS: '/admission/prisoners/',
  STATIONS: '/system-administration/stations/',
};

/**
 * Restriction interfaces
 */
export interface PrisonerRestriction {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  reason_name?: string;
  station_name?: string;
  state_of_prisoner: string;
  start_date: string;
  end_date?: string;
  prisoner: string;
  reason: string;
  place_of_medical_attention: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
}

export interface RestrictionReason {
  id: string;
  name: string;
  description?: string;
  created_datetime?: string;
  is_active?: boolean;
}

export interface Station {
  id: string;
  name: string;
  code?: string;
  station_type?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Fetch paginated restrictions
 * @param params - Search, pagination, and filter parameters
 * @param signal - AbortSignal for request cancellation
 */
export const fetchRestrictions = async (
  params: {
    search?: string;
    page?: number;
    page_size?: number;
    prisoner?: string;
    station?: string;
    district?: string;
    region?: string;
    ordering?: string;
    [key: string]: any;
  } = {},
  signal?: AbortSignal
): Promise<PaginatedResponse<PrisonerRestriction>> => {
  try {
    const response = await axiosInstance.get(RESTRICTION_API_ENDPOINTS.RESTRICTIONS, {
      params: {
        search: params.search || undefined,
        page: params.page || 1,
        page_size: params.page_size || 50,
        prisoner: params.prisoner || undefined,
        station: params.station || undefined,
        district: params.district || undefined,
        region: params.region || undefined,
        ordering: params.ordering || '-created_datetime',
        ...params,
      },
      signal,
    });
    return response.data;
  } catch (error: any) {
    // Silence cancellation errors
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
      return { count: 0, next: null, previous: null, results: [] };
    }
    throw error;
  }
};

/**
 * Fetch paginated restriction reasons (for dropdown)
 * @param params - Search and pagination parameters
 * @param signal - AbortSignal for request cancellation
 */
export const fetchRestrictionReasons = async (
  params: {
    search?: string;
    page?: number;
    page_size?: number;
    [key: string]: any;
  } = {},
  signal?: AbortSignal
): Promise<{ items: RestrictionReason[]; count: number; next: string | null }> => {
  try {
    const response = await axiosInstance.get<PaginatedResponse<RestrictionReason>>(
      RESTRICTION_API_ENDPOINTS.RESTRICTION_REASONS,
      {
        params: {
          search: params.search || undefined,
          page: params.page || 1,
          page_size: params.page_size || 50,
          ordering: 'name',
        },
        signal,
      }
    );
    return {
      items: response.data.results,
      count: response.data.count,
      next: response.data.next,
    };
  } catch (error: any) {
    // Silence cancellation errors
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
      return { items: [], count: 0, next: null };
    }
    throw error;
  }
};

/**
 * Fetch paginated stations (for place of medical attention dropdown)
 * @param params - Search and pagination parameters
 * @param signal - AbortSignal for request cancellation
 */
export const fetchStations = async (
  params: {
    search?: string;
    page?: number;
    page_size?: number;
    region?: string;
    district?: string;
    station_type?: string;
    [key: string]: any;
  } = {},
  signal?: AbortSignal
): Promise<{ items: Station[]; count: number; next: string | null }> => {
  try {
    const response = await axiosInstance.get<PaginatedResponse<Station>>(
      RESTRICTION_API_ENDPOINTS.STATIONS,
      {
        params: {
          search: params.search || undefined,
          page: params.page || 1,
          page_size: params.page_size || 50,
          region: params.region || undefined,
          district: params.district || undefined,
          station_type: params.station_type || undefined,
          ordering: 'name',
        },
        signal,
      }
    );
    return {
      items: response.data.results,
      count: response.data.count,
      next: response.data.next,
    };
  } catch (error: any) {
    // Silence cancellation errors
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
      return { items: [], count: 0, next: null };
    }
    throw error;
  }
};

/**
 * Fetch single restriction by ID
 * @param id - Restriction ID
 */
export const fetchRestrictionById = async (id: string): Promise<PrisonerRestriction> => {
  const response = await axiosInstance.get(`${RESTRICTION_API_ENDPOINTS.RESTRICTIONS}${id}/`);
  return response.data;
};

/**
 * Fetch single restriction reason by ID
 * @param id - Restriction reason ID
 */
export const fetchRestrictionReasonById = async (id: string): Promise<RestrictionReason> => {
  const response = await axiosInstance.get(`${RESTRICTION_API_ENDPOINTS.RESTRICTION_REASONS}${id}/`);
  return response.data;
};

/**
 * Fetch single station by ID
 * @param id - Station ID
 */
export const fetchStationById = async (id: string): Promise<Station> => {
  const response = await axiosInstance.get(`${RESTRICTION_API_ENDPOINTS.STATIONS}${id}/`);
  return response.data;
};

/**
 * Create new restriction
 * @param data - Restriction data
 */
export const createRestriction = async (data: Partial<PrisonerRestriction>): Promise<PrisonerRestriction> => {
  const response = await axiosInstance.post(RESTRICTION_API_ENDPOINTS.RESTRICTIONS, data);
  return response.data;
};

/**
 * Update existing restriction
 * @param id - Restriction ID
 * @param data - Updated restriction data
 */
export const updateRestriction = async (
  id: string,
  data: Partial<PrisonerRestriction>
): Promise<PrisonerRestriction> => {
  const response = await axiosInstance.put(`${RESTRICTION_API_ENDPOINTS.RESTRICTIONS}${id}/`, data);
  return response.data;
};

/**
 * Delete restriction (soft delete)
 * @param id - Restriction ID
 */
export const deleteRestriction = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${RESTRICTION_API_ENDPOINTS.RESTRICTIONS}${id}/`);
};

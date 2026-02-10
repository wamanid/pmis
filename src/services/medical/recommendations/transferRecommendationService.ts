import axiosInstance from '../../axiosInstance';

// ========================
// API Endpoints
// ========================
export const TRANSFER_RECOMMENDATION_API_ENDPOINTS = {
  TRANSFER_RECOMMENDATIONS: 'medical-management/transfer-recommendations/',
  TRANSFER_REASONS: 'system-administration/transfer-recommendation-reasons/',
  STATIONS: 'system-administration/stations/',
  HOSPITALS: 'system-administration/hospitals/',
  REFERRAL_CATEGORIES: 'system-administration/referral-categories/',
  PRISONERS: 'admission/prisoners/',
};

// ========================
// Interfaces
// ========================
export interface TransferRecommendation {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  reason_name?: string;
  station_name?: string;
  hospital_name?: string;
  category_name?: string;
  recommendation_notes: string;
  prisoner: string;
  reason_for_recommendation: string;
  recommended_station: string;
  refferal_hospital: string; // Note: API has typo "refferal"
  referral_category: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
}

export interface TransferRecommendationReason {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_datetime?: string;
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
  physical_address?: string;
  phone_number?: string;
  email?: string;
  is_active?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  region_name?: string;
  district_name?: string;
  hospital_authority_name?: string;
  hospital_level_name?: string;
  address?: string;
  contact?: string;
  description?: string;
  is_active?: boolean;
}

export interface ReferralCategory {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_datetime?: string;
  updated_datetime?: string;
  deleted_datetime?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
}

export interface Prisoner {
  id: string;
  prisoner_number_value: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  current_station_name?: string;
  admission_status_name?: string;
  gender?: string;
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
 * Fetch paginated transfer recommendations
 */
export async function fetchTransferRecommendations(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: TransferRecommendation[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<TransferRecommendation>>(
      TRANSFER_RECOMMENDATION_API_ENDPOINTS.TRANSFER_RECOMMENDATIONS,
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
    console.error('Error fetching transfer recommendations:', error);
    throw error;
  }
}

/**
 * Fetch paginated transfer recommendation reasons
 */
export async function fetchTransferReasons(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: TransferRecommendationReason[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<TransferRecommendationReason>>(
      TRANSFER_RECOMMENDATION_API_ENDPOINTS.TRANSFER_REASONS,
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
    console.error('Error fetching transfer reasons:', error);
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
      TRANSFER_RECOMMENDATION_API_ENDPOINTS.STATIONS,
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
 * Fetch paginated hospitals
 */
export async function fetchHospitals(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: Hospital[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<Hospital>>(
      TRANSFER_RECOMMENDATION_API_ENDPOINTS.HOSPITALS,
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
    console.error('Error fetching hospitals:', error);
    throw error;
  }
}

/**
 * Fetch paginated referral categories
 */
export async function fetchReferralCategories(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: ReferralCategory[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<ReferralCategory>>(
      TRANSFER_RECOMMENDATION_API_ENDPOINTS.REFERRAL_CATEGORIES,
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
    console.error('Error fetching referral categories:', error);
    throw error;
  }
}

/**
 * Fetch transfer recommendation by ID
 */
export async function fetchTransferRecommendationById(id: string): Promise<TransferRecommendation> {
  try {
    const response = await axiosInstance.get<TransferRecommendation>(
      `${TRANSFER_RECOMMENDATION_API_ENDPOINTS.TRANSFER_RECOMMENDATIONS}${id}/`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching transfer recommendation by ID:', error);
    throw error;
  }
}

// ========================
// CRUD Operations
// ========================

/**
 * Create a new transfer recommendation
 */
export async function createTransferRecommendation(data: TransferRecommendation): Promise<TransferRecommendation> {
  try {
    const response = await axiosInstance.post<TransferRecommendation>(
      TRANSFER_RECOMMENDATION_API_ENDPOINTS.TRANSFER_RECOMMENDATIONS,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating transfer recommendation:', error);
    throw error;
  }
}

/**
 * Update an existing transfer recommendation
 */
export async function updateTransferRecommendation(id: string, data: TransferRecommendation): Promise<TransferRecommendation> {
  try {
    const response = await axiosInstance.put<TransferRecommendation>(
      `${TRANSFER_RECOMMENDATION_API_ENDPOINTS.TRANSFER_RECOMMENDATIONS}${id}/`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating transfer recommendation:', error);
    throw error;
  }
}

/**
 * Delete a transfer recommendation
 */
export async function deleteTransferRecommendation(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`${TRANSFER_RECOMMENDATION_API_ENDPOINTS.TRANSFER_RECOMMENDATIONS}${id}/`);
  } catch (error: any) {
    console.error('Error deleting transfer recommendation:', error);
    throw error;
  }
}

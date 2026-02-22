import axiosInstance from '../../axiosInstance';

// ========================
// API Endpoints
// ========================
export const WARD_RECOMMENDATION_API_ENDPOINTS = {
  WARD_RECOMMENDATIONS: 'medical-management/ward-recommendations/',
  WARDS: 'station-management/api/wards/',
  PRISONERS: 'admission/prisoners/',
};

// ========================
// Interfaces
// ========================
export interface WardRecommendation {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  prisoner_number_value?: string;
  ward_name?: string;
  recommendation_notes: string;
  prisoner: string;
  recommended_ward: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
}

export interface Ward {
  id: string;
  name: string;
  station_name?: string;
  ward_type_name?: string;
  block_name?: string;
  security_classification_name?: string;
  ward_capacity?: string;
  occupancy?: string;
  congestion?: string;
  ward_number?: string;
  ward_area?: string;
  description?: string;
  is_active?: boolean;
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
 * Fetch paginated ward recommendations
 */
export async function fetchWardRecommendations(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: WardRecommendation[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<WardRecommendation>>(
      WARD_RECOMMENDATION_API_ENDPOINTS.WARD_RECOMMENDATIONS,
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
    console.error('Error fetching ward recommendations:', error);
    throw error;
  }
}

/**
 * Fetch paginated wards
 */
export async function fetchWards(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: Ward[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<Ward>>(
      WARD_RECOMMENDATION_API_ENDPOINTS.WARDS,
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
    console.error('Error fetching wards:', error);
    throw error;
  }
}

/**
 * Fetch ward recommendation by ID
 */
export async function fetchWardRecommendationById(id: string): Promise<WardRecommendation> {
  try {
    const response = await axiosInstance.get<WardRecommendation>(
      `${WARD_RECOMMENDATION_API_ENDPOINTS.WARD_RECOMMENDATIONS}${id}/`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ward recommendation by ID:', error);
    throw error;
  }
}

// ========================
// CRUD Operations
// ========================

/**
 * Create a new ward recommendation
 */
export async function createWardRecommendation(data: WardRecommendation): Promise<WardRecommendation> {
  try {
    const response = await axiosInstance.post<WardRecommendation>(
      WARD_RECOMMENDATION_API_ENDPOINTS.WARD_RECOMMENDATIONS,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating ward recommendation:', error);
    throw error;
  }
}

/**
 * Update an existing ward recommendation
 */
export async function updateWardRecommendation(id: string, data: WardRecommendation): Promise<WardRecommendation> {
  try {
    const response = await axiosInstance.put<WardRecommendation>(
      `${WARD_RECOMMENDATION_API_ENDPOINTS.WARD_RECOMMENDATIONS}${id}/`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating ward recommendation:', error);
    throw error;
  }
}

/**
 * Delete a ward recommendation
 */
export async function deleteWardRecommendation(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`${WARD_RECOMMENDATION_API_ENDPOINTS.WARD_RECOMMENDATIONS}${id}/`);
  } catch (error: any) {
    console.error('Error deleting ward recommendation:', error);
    throw error;
  }
}

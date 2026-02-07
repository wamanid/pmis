import axiosInstance from '../../axiosInstance';

// ========================
// API Endpoints
// ========================
export const FOOD_ASSESSMENT_API_ENDPOINTS = {
  FOOD_ASSESSMENTS: 'medical-management/food-assessments/',
  STATIONS: 'system-administration/stations/',
  FOOD_ITEMS: 'medical-management/food-items/',
  FOOD_QUALITIES: 'medical-management/food-qualities/',
};

// ========================
// Interfaces
// ========================
export interface FoodAssessment {
  id?: string;
  station_name?: string;
  item_name?: string;
  quality_name?: string;
  notes: string;
  station: string;
  item: string;
  quality: string;
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

export interface FoodItem {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface FoodQuality {
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
 * Fetch paginated food assessments
 */
export async function fetchFoodAssessments(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: FoodAssessment[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<FoodAssessment>>(
      FOOD_ASSESSMENT_API_ENDPOINTS.FOOD_ASSESSMENTS,
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
    console.error('Error fetching food assessments:', error);
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
      FOOD_ASSESSMENT_API_ENDPOINTS.STATIONS,
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
 * Fetch paginated food items
 */
export async function fetchFoodItems(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: FoodItem[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<FoodItem>>(
      FOOD_ASSESSMENT_API_ENDPOINTS.FOOD_ITEMS,
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
    console.error('Error fetching food items:', error);
    throw error;
  }
}

/**
 * Fetch paginated food qualities
 */
export async function fetchFoodQualities(
  page = 1,
  pageSize = 50,
  search = '',
  signal?: AbortSignal
): Promise<{ items: FoodQuality[]; count: number; next: string | null }> {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<FoodQuality>>(
      FOOD_ASSESSMENT_API_ENDPOINTS.FOOD_QUALITIES,
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
    console.error('Error fetching food qualities:', error);
    throw error;
  }
}

/**
 * Fetch food assessment by ID
 */
export async function fetchFoodAssessmentById(id: string): Promise<FoodAssessment> {
  try {
    const response = await axiosInstance.get<FoodAssessment>(
      `${FOOD_ASSESSMENT_API_ENDPOINTS.FOOD_ASSESSMENTS}${id}/`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching food assessment by ID:', error);
    throw error;
  }
}

// ========================
// CRUD Operations
// ========================

/**
 * Create a new food assessment
 */
export async function createFoodAssessment(data: FoodAssessment): Promise<FoodAssessment> {
  try {
    const response = await axiosInstance.post<FoodAssessment>(
      FOOD_ASSESSMENT_API_ENDPOINTS.FOOD_ASSESSMENTS,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating food assessment:', error);
    throw error;
  }
}

/**
 * Update an existing food assessment
 */
export async function updateFoodAssessment(id: string, data: FoodAssessment): Promise<FoodAssessment> {
  try {
    const response = await axiosInstance.put<FoodAssessment>(
      `${FOOD_ASSESSMENT_API_ENDPOINTS.FOOD_ASSESSMENTS}${id}/`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating food assessment:', error);
    throw error;
  }
}

/**
 * Delete a food assessment
 */
export async function deleteFoodAssessment(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`${FOOD_ASSESSMENT_API_ENDPOINTS.FOOD_ASSESSMENTS}${id}/`);
  } catch (error: any) {
    console.error('Error deleting food assessment:', error);
    throw error;
  }
}

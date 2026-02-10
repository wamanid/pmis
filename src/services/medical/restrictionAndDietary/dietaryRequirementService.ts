import axiosInstance from '../../axiosInstance';

// =====================================================================
// API ENDPOINTS
// =====================================================================
export const DIETARY_REQUIREMENT_API_ENDPOINTS = {
  BASE: '/medical-management/dietary-requirements',
  LIST: '/medical-management/dietary-requirements/',
  CREATE: '/medical-management/dietary-requirements/',
  DETAIL: (id: string) => `/medical-management/dietary-requirements/${id}/`,
  UPDATE: (id: string) => `/medical-management/dietary-requirements/${id}/`,
  DELETE: (id: string) => `/medical-management/dietary-requirements/${id}/`,
  // Related endpoints
  RESTRICTIONS: '/medical-management/restrictions/',
};

// =====================================================================
// TYPE DEFINITIONS
// =====================================================================
export interface DietaryRequirement {
  id?: string;
  prisoner_name?: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string | null;
  dietary_requirement: string;
  start_date: string;
  end_date?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number | null;
  prisoner_restriction: string;
  // Computed fields
  prisoner_restriction_info?: string;
}

export interface PrisonerRestriction {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  reason_name: string;
  station_name?: string;
  state_of_prisoner: string;
  start_date: string;
  end_date?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DietaryRequirementCreatePayload {
  dietary_requirement: string;
  start_date: string;
  end_date?: string;
  prisoner_restriction: string;
}

export interface DietaryRequirementUpdatePayload {
  dietary_requirement?: string;
  start_date?: string;
  end_date?: string;
  prisoner_restriction?: string;
}

// =====================================================================
// SERVICE FUNCTIONS
// =====================================================================

/**
 * Fetch all dietary requirements with pagination
 */
export const fetchDietaryRequirements = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  filters?: Record<string, any>
): Promise<PaginatedResponse<DietaryRequirement>> => {
  try {
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    if (filters) {
      Object.assign(params, filters);
    }

    const response = await axiosInstance.get<PaginatedResponse<DietaryRequirement>>(
      DIETARY_REQUIREMENT_API_ENDPOINTS.LIST,
      { params }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching dietary requirements:', error);
    throw error;
  }
};

/**
 * Fetch a single dietary requirement by ID
 */
export const fetchDietaryRequirementById = async (id: string): Promise<DietaryRequirement> => {
  try {
    const response = await axiosInstance.get<DietaryRequirement>(
      DIETARY_REQUIREMENT_API_ENDPOINTS.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching dietary requirement ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new dietary requirement
 */
export const createDietaryRequirement = async (
  data: DietaryRequirementCreatePayload
): Promise<DietaryRequirement> => {
  try {
    const response = await axiosInstance.post<DietaryRequirement>(
      DIETARY_REQUIREMENT_API_ENDPOINTS.CREATE,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating dietary requirement:', error);
    throw error;
  }
};

/**
 * Update an existing dietary requirement
 */
export const updateDietaryRequirement = async (
  id: string,
  data: DietaryRequirementUpdatePayload
): Promise<DietaryRequirement> => {
  try {
    const response = await axiosInstance.patch<DietaryRequirement>(
      DIETARY_REQUIREMENT_API_ENDPOINTS.UPDATE(id),
      data
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error updating dietary requirement ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a dietary requirement
 */
export const deleteDietaryRequirement = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(DIETARY_REQUIREMENT_API_ENDPOINTS.DELETE(id));
  } catch (error: any) {
    console.error(`Error deleting dietary requirement ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch prisoner restrictions with pagination (for dropdown)
 */
export const fetchPrisonerRestrictions = async (
  page: number = 1,
  pageSize: number = 50,
  search?: string,
  signal?: AbortSignal
): Promise<{ items: PrisonerRestriction[]; count: number; next: string | null }> => {
  try {
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
      is_active: true, // Only show active restrictions
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<PrisonerRestriction>>(
      DIETARY_REQUIREMENT_API_ENDPOINTS.RESTRICTIONS,
      { params, signal }
    );

    // Add formatted name field for SearchableSelect
    const itemsWithName = response.data.results.map((item: PrisonerRestriction) => ({
      ...item,
      name: `${item.prisoner_number} - ${item.prisoner_name} (${item.reason_name})`,
    }));

    return {
      items: itemsWithName,
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
    console.error('Error fetching prisoner restrictions:', error);
    throw error;
  }
};

/**
 * Fetch a single prisoner restriction by ID
 */
export const fetchPrisonerRestrictionById = async (
  id: string
): Promise<PrisonerRestriction> => {
  try {
    const response = await axiosInstance.get<PrisonerRestriction>(
      `/medical-management/restrictions/${id}/`
    );
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching prisoner restriction ${id}:`, error);
    throw error;
  }
};

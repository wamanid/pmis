import axiosInstance from '../../axiosInstance';

// API Endpoints
export const RELEASE_RECOMMENDATION_API_ENDPOINTS = {
  RELEASE_RECOMMENDATIONS: '/medical-management/release-recommendations/',
  PRISONERS: '/admission/prisoners/',
};

// Interfaces
export interface ReleaseRecommendation {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string;
  date_of_report: string;
  abnormal_condition: string;
  duration_of_condition: string;
  cause_of_condition: string;
  life_endangered: boolean;
  illness_fatal: boolean;
  aggravated_pain: boolean;
  contracted_in_prison: boolean;
  permanently_unfit_for_labour: boolean;
  temporary_removal_to_hospital: boolean;
  elderly_cripple_or_feeble: boolean;
  mental_condition_due_to_imprisonment: boolean;
  other_observations: string;
  friends_support: boolean;
  prisoner_wishes: string;
  reoffend_possibility: boolean;
  reoffend_possibility_reason: string;
  hospital_support: boolean;
  hospital_support_reason: string;
  recommendation_date: string;
  approval_status: string;
  approved_by: string;
  approval_date: string;
  approval_notes: string;
  recommendation_notes: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  prisoner: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Fetch Release Recommendations with pagination
export const fetchReleaseRecommendations = async (
  page: number = 1,
  pageSize: number = 50,
  search: string = '',
  filters: Record<string, any> = {}
): Promise<PaginatedResponse<ReleaseRecommendation>> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    // Add additional filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params[key] = filters[key];
      }
    });

    const response = await axiosInstance.get<PaginatedResponse<ReleaseRecommendation>>(
      RELEASE_RECOMMENDATION_API_ENDPOINTS.RELEASE_RECOMMENDATIONS,
      { params }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching release recommendations:', error);
    throw error;
  }
};

// Fetch single Release Recommendation by ID
export const fetchReleaseRecommendationById = async (id: string): Promise<ReleaseRecommendation> => {
  try {
    const response = await axiosInstance.get<ReleaseRecommendation>(
      `${RELEASE_RECOMMENDATION_API_ENDPOINTS.RELEASE_RECOMMENDATIONS}${id}/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching release recommendation by ID:', error);
    throw error;
  }
};

// Create Release Recommendation
export const createReleaseRecommendation = async (
  data: Partial<ReleaseRecommendation>
): Promise<ReleaseRecommendation> => {
  try {
    const response = await axiosInstance.post<ReleaseRecommendation>(
      RELEASE_RECOMMENDATION_API_ENDPOINTS.RELEASE_RECOMMENDATIONS,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error creating release recommendation:', error);
    throw error;
  }
};

// Update Release Recommendation
export const updateReleaseRecommendation = async (
  id: string,
  data: Partial<ReleaseRecommendation>
): Promise<ReleaseRecommendation> => {
  try {
    const response = await axiosInstance.patch<ReleaseRecommendation>(
      `${RELEASE_RECOMMENDATION_API_ENDPOINTS.RELEASE_RECOMMENDATIONS}${id}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error updating release recommendation:', error);
    throw error;
  }
};

// Delete Release Recommendation
export const deleteReleaseRecommendation = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${RELEASE_RECOMMENDATION_API_ENDPOINTS.RELEASE_RECOMMENDATIONS}${id}/`
    );
  } catch (error) {
    console.error('Error deleting release recommendation:', error);
    throw error;
  }
};

// Fetch Prisoners with pagination
export const fetchPrisoners = async (
  page: number = 1,
  pageSize: number = 50,
  search: string = '',
  signal?: AbortSignal
): Promise<{ items: any[]; count: number; next: string | null }> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get(RELEASE_RECOMMENDATION_API_ENDPOINTS.PRISONERS, {
      params,
      signal,
    });

    return {
      items: response.data.results || [],
      count: response.data.count || 0,
      next: response.data.next || null,
    };
  } catch (error: any) {
    if (
      error.name === 'CanceledError' ||
      error.code === 'ERR_CANCELED' ||
      error.name === 'AbortError'
    ) {
      return { items: [], count: 0, next: null };
    }
    console.error('Error fetching prisoners:', error);
    throw error;
  }
};

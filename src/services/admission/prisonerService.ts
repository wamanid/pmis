import axiosInstance from '../axiosInstance';
import { PrisonerListResponse, Prisoner, PrisonerFilters } from '../../models/admission';

/**
 * Prisoner Service
 * Handles API calls for prisoner operations
 */

/**
 * Fetch list of prisoners
 * @param filters - Optional filters for the prisoner list
 * @returns Paginated list of prisoners
 */
export const getPrisoners = async (
  filters?: PrisonerFilters
): Promise<PrisonerListResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.habitual !== undefined) params.append('habitual', filters.habitual.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.is_dangerous !== undefined) params.append('is_dangerous', filters.is_dangerous.toString());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `admission/prisoners/${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get<PrisonerListResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching prisoners:', error);
    throw error;
  }
};

/**
 * Fetch a single prisoner by ID
 * @param id - Prisoner ID
 * @returns Prisoner details
 */
export const getPrisonerById = async (id: string): Promise<Prisoner> => {
  try {
    const response = await axiosInstance.get<Prisoner>(`admission/prisoners/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching prisoner ${id}:`, error);
    throw error;
  }
};

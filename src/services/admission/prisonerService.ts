import axiosInstance from '../axiosInstance';
import { PrisonerListResponse, Prisoner, PrisonerFilters, PrisonerNumberReservationResponse } from '../../models/admission';

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
    
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
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

/**
 * Generate a new prisoner number for a given personal number and category.
 * Station filter is automatically added from user filters via axiosInstance.
 */
export const generatePrisonerNumber = async (
  params: {
    category: string;
    prisoner_personal_number?: string;
  }
): Promise<PrisonerNumberReservationResponse> => {
  try {
    const response = await axiosInstance.get<PrisonerNumberReservationResponse>(
      'admission/prisoner-numbers/new/',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating prisoner number:', error);
    throw error;
  }
};

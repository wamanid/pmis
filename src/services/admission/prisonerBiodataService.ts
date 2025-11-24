import axiosInstance from '../axiosInstance';
import { PrisonerBiodata, PrisonerBiodataListResponse, PrisonerBiodataFilters } from '../../models/admission';

/**
 * Prisoner Biodata Service
 * Handles API calls for prisoner biodata operations
 */

/**
 * Fetch list of prisoner biodata with optional filters
 * @param filters - Optional filters for the biodata list
 * @returns Paginated list of prisoner biodata
 */
export const getPrisonerBiodata = async (
  filters?: PrisonerBiodataFilters
): Promise<PrisonerBiodataListResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.habitual_criminal !== undefined)
        params.append('habitual_criminal', String(filters.habitual_criminal));
      if (filters.is_active !== undefined)
        params.append('is_active', String(filters.is_active));
      if (filters.marital_status)
        params.append('marital_status', filters.marital_status);
      if (filters.nationality)
        params.append('nationality', filters.nationality);
      if (filters.ordering)
        params.append('ordering', filters.ordering);
      if (filters.page)
        params.append('page', String(filters.page));
      if (filters.prisoner)
        params.append('prisoner', filters.prisoner);
      if (filters.prisoner_class)
        params.append('prisoner_class', filters.prisoner_class);
      if (filters.religion)
        params.append('religion', filters.religion);
      if (filters.search)
        params.append('search', filters.search);
      if (filters.sex)
        params.append('sex', filters.sex);
      if (filters.tribe)
        params.append('tribe', filters.tribe);
    }

    const queryString = params.toString();
    const url = `admission/prisoner-biodata/${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get<PrisonerBiodataListResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching prisoner biodata:', error);
    throw error;
  }
};

/**
 * Fetch biodata for a specific prisoner by prisoner ID
 * This fetches the list filtered by prisoner ID and returns the first result
 * @param prisonerId - The prisoner UUID
 * @returns First prisoner biodata record or null if not found
 */
export const getPrisonerBiodataByPrisonerId = async (
  prisonerId: string
): Promise<PrisonerBiodata | null> => {
  try {
    const response = await getPrisonerBiodata({ prisoner: prisonerId });
    
    // Return the first result if available
    if (response.results && response.results.length > 0) {
      return response.results[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching biodata for prisoner ${prisonerId}:`, error);
    throw error;
  }
};

/**
 * Fetch a single prisoner biodata by its ID
 * @param id - Biodata record ID
 * @returns Prisoner biodata details
 */
export const getPrisonerBiodataById = async (
  id: string
): Promise<PrisonerBiodata> => {
  try {
    const url = `admission/prisoner-biodata/${id}/`;
    const response = await axiosInstance.get<PrisonerBiodata>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching biodata ${id}:`, error);
    throw error;
  }
};

/**
 * Create new prisoner biodata
 * @param data - Partial prisoner biodata to create
 * @returns Created prisoner biodata
 */
export const createPrisonerBiodata = async (
  data: Partial<PrisonerBiodata>
): Promise<PrisonerBiodata> => {
  try {
    const url = 'admission/prisoner-biodata/';
    const response = await axiosInstance.post<PrisonerBiodata>(url, data);
    return response.data;
  } catch (error) {
    console.error('Error creating prisoner biodata:', error);
    throw error;
  }
};

/**
 * Update existing prisoner biodata
 * @param id - Biodata record ID
 * @param data - Partial prisoner biodata to update
 * @returns Updated prisoner biodata
 */
export const updatePrisonerBiodata = async (
  id: string,
  data: Partial<PrisonerBiodata>
): Promise<PrisonerBiodata> => {
  try {
    const url = `admission/prisoner-biodata/${id}/`;
    const response = await axiosInstance.patch<PrisonerBiodata>(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating biodata ${id}:`, error);
    throw error;
  }
};

/**
 * Delete prisoner biodata
 * @param id - Biodata record ID
 */
export const deletePrisonerBiodata = async (id: string): Promise<void> => {
  try {
    const url = `admission/prisoner-biodata/${id}/`;
    await axiosInstance.delete(url);
  } catch (error) {
    console.error(`Error deleting biodata ${id}:`, error);
    throw error;
  }
};

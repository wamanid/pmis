import axiosInstance from '../axiosInstance';
import { PrisonerRecord, PrisonerRecordListResponse, PrisonerRecordFilters } from '../../models/admission';

/**
 * Prisoner Record Service
 * Handles API calls for prisoner record operations
 */

/**
 * Fetch list of prisoner records with optional filters
 * @param filters - Optional filters for the prisoner records list
 * @returns Paginated list of prisoner records
 */
export const getPrisonerRecords = async (
  filters?: PrisonerRecordFilters
): Promise<PrisonerRecordListResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page)
        params.append('page', String(filters.page));
      if (filters.prisoner)
        params.append('prisoner', filters.prisoner);
      if (filters.prison_station)
        params.append('prison_station', filters.prison_station);
      if (filters.prisoner_class)
        params.append('prisoner_class', filters.prisoner_class);
      if (filters.escapee !== undefined)
        params.append('escapee', String(filters.escapee));
      if (filters.armed_personnel !== undefined)
        params.append('armed_personnel', String(filters.armed_personnel));
      if (filters.extremely_violent !== undefined)
        params.append('extremely_violent', String(filters.extremely_violent));
      if (filters.life_or_death_imprisonment !== undefined)
        params.append('life_or_death_imprisonment', String(filters.life_or_death_imprisonment));
      if (filters.is_active !== undefined)
        params.append('is_active', String(filters.is_active));
      if (filters.search)
        params.append('search', filters.search);
      if (filters.ordering)
        params.append('ordering', filters.ordering);
    }

    const queryString = params.toString();
    const url = `admission/prisoner-records/${queryString ? `?${queryString}` : ''}`;

    const response = await axiosInstance.get<PrisonerRecordListResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching prisoner records:', error);
    throw error;
  }
};

/**
 * Fetch prisoner records for a specific prisoner by prisoner ID
 * @param prisonerId - The prisoner UUID
 * @returns Prisoner records list response
 */
export const getPrisonerRecordsByPrisonerId = async (
  prisonerId: string
): Promise<PrisonerRecordListResponse> => {
  try {
    return await getPrisonerRecords({ prisoner: prisonerId });
  } catch (error) {
    console.error(`Error fetching records for prisoner ${prisonerId}:`, error);
    throw error;
  }
};

/**
 * Fetch a single prisoner record by its ID
 * @param id - Prisoner record ID
 * @returns Prisoner record details
 */
export const getPrisonerRecordById = async (
  id: string
): Promise<PrisonerRecord> => {
  try {
    const url = `admission/prisoner-records/${id}/`;
    const response = await axiosInstance.get<PrisonerRecord>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching prisoner record ${id}:`, error);
    throw error;
  }
};

/**
 * Create new prisoner record
 * @param data - Partial prisoner record to create
 * @returns Created prisoner record
 */
export const createPrisonerRecord = async (
  data: Partial<PrisonerRecord>
): Promise<PrisonerRecord> => {
  try {
    const url = 'admission/prisoner-records/';
    const response = await axiosInstance.post<PrisonerRecord>(url, data);
    return response.data;
  } catch (error) {
    console.error('Error creating prisoner record:', error);
    throw error;
  }
};

/**
 * Update existing prisoner record
 * @param id - Prisoner record ID
 * @param data - Partial prisoner record to update
 * @returns Updated prisoner record
 */
export const updatePrisonerRecord = async (
  id: string,
  data: Partial<PrisonerRecord>
): Promise<PrisonerRecord> => {
  try {
    const url = `admission/prisoner-records/${id}/`;
    const response = await axiosInstance.patch<PrisonerRecord>(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating prisoner record ${id}:`, error);
    throw error;
  }
};

/**
 * Delete prisoner record
 * @param id - Prisoner record ID
 */
export const deletePrisonerRecord = async (id: string): Promise<void> => {
  try {
    const url = `admission/prisoner-records/${id}/`;
    await axiosInstance.delete(url);
  } catch (error) {
    console.error(`Error deleting prisoner record ${id}:`, error);
    throw error;
  }
};

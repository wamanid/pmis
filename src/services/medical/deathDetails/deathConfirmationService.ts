import axiosInstance from '../../axiosInstance';

// API Endpoints
export const DEATH_CONFIRMATION_API_ENDPOINTS = {
  DEATH_CONFIRMATIONS: '/medical-management/death-confirmations/',
  PRISONERS: '/admission/prisoners/',
  STAFF_PROFILES: '/auth/staff-profiles/',
} as const;

// Interfaces
export interface DeathConfirmation {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  prisoner_number_value?: string;
  officer_in_charge_name?: string;
  medical_officer_name?: string;
  pathologist_attachment: string;
  other_attachment: string;
  medical_form: string;
  death_certificate: string;
  presumed_cause_of_death: string;
  actual_cause_of_death: string;
  cause_of_death: string;
  place_of_death: string;
  date_of_death: string;
  notes: string;
  prisoner: string | null;
  officer_in_charge: string | null;
  medial_officer: string | null; // Note: API has typo "medial"
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
}

export interface Prisoner {
  id: string;
  prisoner_number: string;
  prisoner_number_value: string;
  prisoner_personal_number?: string;
  prisoner_personal_number_value?: string;
  admission_status?: string;
  admission_status_name?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  current_station?: string;
  current_station_name?: string;
  id_number?: string;
  id_type?: string;
  gender?: string;
  tribe?: string;
  date_of_admission?: string;
  religion?: string;
  category?: string;
  is_active?: boolean;
}

export interface StaffProfile {
  id: string;
  rank_name?: string;
  station_name?: string;
  gender_name?: string;
  supervisor_name?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  section?: string;
  division?: string;
  department?: string;
  directorate?: string;
  force_number?: string;
  appointment?: string;
  senior?: boolean;
  gender?: string;
  rank?: string;
  station?: string;
  supervisor?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Fetch death confirmations with pagination
export const fetchDeathConfirmations = async (
  page: number = 1,
  pageSize: number = 50,
  search: string = '',
  filters: Record<string, any> = {}
): Promise<{ items: DeathConfirmation[]; count: number; next: string | null }> => {
  try {
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    // Add any additional filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params[key] = filters[key];
      }
    });

    const response = await axiosInstance.get<PaginatedResponse<DeathConfirmation>>(
      DEATH_CONFIRMATION_API_ENDPOINTS.DEATH_CONFIRMATIONS,
      { params }
    );

    return {
      items: response.data.results,
      count: response.data.count,
      next: response.data.next,
    };
  } catch (error) {
    console.error('Error fetching death confirmations:', error);
    throw error;
  }
};

// Fetch single death confirmation by ID
export const fetchDeathConfirmationById = async (id: string): Promise<DeathConfirmation> => {
  try {
    const response = await axiosInstance.get<DeathConfirmation>(
      `${DEATH_CONFIRMATION_API_ENDPOINTS.DEATH_CONFIRMATIONS}${id}/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching death confirmation by ID:', error);
    throw error;
  }
};

// Create new death confirmation
export const createDeathConfirmation = async (
  data: Omit<DeathConfirmation, 'id'>
): Promise<DeathConfirmation> => {
  try {
    const cleanData = cleanDeathConfirmationData(data);
    const response = await axiosInstance.post<DeathConfirmation>(
      DEATH_CONFIRMATION_API_ENDPOINTS.DEATH_CONFIRMATIONS,
      cleanData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating death confirmation:', error);
    throw error;
  }
};

// Clean data before sending to API (remove read-only fields)
const cleanDeathConfirmationData = (data: Partial<DeathConfirmation>) => {
  const {
    id,
    prisoner_name,
    prisoner_number,
    officer_in_charge_name,
    medical_officer_name,
    created_datetime,
    is_active,
    updated_datetime,
    deleted_datetime,
    created_by,
    updated_by,
    deleted_by,
    ...cleanData
  } = data;
  
  // Convert null values to empty strings for URL fields (backend validation)
  return {
    ...cleanData,
    pathologist_attachment: cleanData.pathologist_attachment || '',
    other_attachment: cleanData.other_attachment || '',
    medical_form: cleanData.medical_form || '',
    death_certificate: cleanData.death_certificate || '',
  };
};

// Update existing death confirmation
export const updateDeathConfirmation = async (
  id: string,
  data: Partial<DeathConfirmation>
): Promise<DeathConfirmation> => {
  try {
    const cleanData = cleanDeathConfirmationData(data);
    
    // For updates: Remove document fields if they're URLs (not new file uploads)
    // Backend expects FormData with files, not URL strings
    const updateData: any = { ...cleanData };
    
    // Skip document fields with existing URLs (they haven't changed)
    if (updateData.pathologist_attachment?.startsWith('http')) {
      delete updateData.pathologist_attachment;
    }
    if (updateData.other_attachment?.startsWith('http')) {
      delete updateData.other_attachment;
    }
    if (updateData.medical_form?.startsWith('http')) {
      delete updateData.medical_form;
    }
    if (updateData.death_certificate?.startsWith('http')) {
      delete updateData.death_certificate;
    }
    
    // Also remove empty strings for document fields (unchanged)
    if (updateData.pathologist_attachment === '') delete updateData.pathologist_attachment;
    if (updateData.other_attachment === '') delete updateData.other_attachment;
    if (updateData.medical_form === '') delete updateData.medical_form;
    if (updateData.death_certificate === '') delete updateData.death_certificate;
    
    console.log('Sending update data:', updateData);
    
    // Use PATCH for partial updates
    const response = await axiosInstance.patch<DeathConfirmation>(
      `${DEATH_CONFIRMATION_API_ENDPOINTS.DEATH_CONFIRMATIONS}${id}/`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating death confirmation:', error);
    throw error;
  }
};

// Delete death confirmation
export const deleteDeathConfirmation = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${DEATH_CONFIRMATION_API_ENDPOINTS.DEATH_CONFIRMATIONS}${id}/`
    );
  } catch (error) {
    console.error('Error deleting death confirmation:', error);
    throw error;
  }
};

// Fetch prisoners with pagination (for CustomPrisonerSearch)
export const fetchPrisoners = async (
  page: number = 1,
  pageSize: number = 50,
  search: string = '',
  signal?: AbortSignal
): Promise<{ items: Prisoner[]; count: number; next: string | null }> => {
  try {
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<Prisoner>>(
      DEATH_CONFIRMATION_API_ENDPOINTS.PRISONERS,
      { params, signal }
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
    console.error('Error fetching prisoners:', error);
    throw error;
  }
};

// Fetch staff profiles with pagination (for StaffProfileSelect)
export const fetchStaffProfiles = async (
  page: number = 1,
  pageSize: number = 50,
  search: string = '',
  signal?: AbortSignal
): Promise<{ items: StaffProfile[]; count: number; next: string | null }> => {
  try {
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
    };

    if (search) {
      params.search = search;
    }

    const response = await axiosInstance.get<PaginatedResponse<StaffProfile>>(
      DEATH_CONFIRMATION_API_ENDPOINTS.STAFF_PROFILES,
      { params, signal }
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
    console.error('Error fetching staff profiles:', error);
    throw error;
  }
};

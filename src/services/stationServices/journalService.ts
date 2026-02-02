import axiosInstance from '../axiosInstance';

/**
 * Centralized API endpoints for Journal module.
 * All service functions use these constants for consistency and maintainability.
 */
export const JOURNAL_API_ENDPOINTS = {
  JOURNALS: '/station-management/api/journals/',
  JOURNAL_TYPES: '/station-management/api/journal-types/',
  JOURNAL_PRISONERS: '/station-management/api/journal-prisoners/',
  STAFF_PROFILES: '/auth/staff-profiles/',
  STATIONS: '/system-administration/stations/',
} as const;

export interface JournalPrisoner {
  id: string;
  prisoner_name?: string;
  remarks?: string;
  created_datetime?: string;
  [k: string]: any;
}

export interface DutyOfficer {
  id: string;
  first_name?: string;
  last_name?: string;
  force_number?: string;
  rank?: string;
  rank_name?: string;
  station?: string;
  station_name?: string;
  senior?: boolean;
  raw?: any;
}

export interface JournalItem {
  id: string;
  station_name?: string;
  type_of_journal_name?: string;
  duty_officer_username?: string;
  rank_name?: string;
  created_datetime?: string;
  prisoners?: JournalPrisoner[];
  activity?: string;
  state_of_prisoners?: string;
  state_of_prison?: string;
  remark?: string;
  force_number?: string;
  journal_date?: string;
  station?: string;
  type_of_journal?: string;
  duty_officer?: string;
  rank?: string;
  is_active?: boolean;
  [k: string]: any;
}

/**
 * Journals list (paginated). Forward signal for cancellation.
 */
export const fetchJournals = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(JOURNAL_API_ENDPOINTS.JOURNALS, { params, signal });
  return res.data; // {count, next, previous, results}
};

// fetch single journal by id
export const fetchJournalById = async (id: string, signal?: AbortSignal) => {
  const res = await axiosInstance.get(`${JOURNAL_API_ENDPOINTS.JOURNALS}${id}/`, { signal });
  return res.data;
};

export const createJournal = async (payload: Record<string, any>) => {
  const res = await axiosInstance.post(JOURNAL_API_ENDPOINTS.JOURNALS, payload);
  return res.data;
};

export const updateJournal = async (id: string, payload: Record<string, any>) => {
  const res = await axiosInstance.patch(`${JOURNAL_API_ENDPOINTS.JOURNALS}${id}/`, payload);
  return res.data;
};

export const deleteJournal = async (id: string) => {
  const res = await axiosInstance.delete(`${JOURNAL_API_ENDPOINTS.JOURNALS}${id}/`);
  return res.data;
};

export const fetchJournalTypes = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(JOURNAL_API_ENDPOINTS.JOURNAL_TYPES, { params, signal });
  return res.data; // Return full paginated response for server-side pagination
};

export const fetchJournalPrisoners = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(JOURNAL_API_ENDPOINTS.JOURNAL_PRISONERS, { params, signal });
  return res.data?.results ?? res.data ?? [];
};

export const fetchDutyOfficers = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(JOURNAL_API_ENDPOINTS.STAFF_PROFILES, { params, signal });
  // Return full paginated response for server-side pagination
  return res.data;
};

export const fetchStations = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(JOURNAL_API_ENDPOINTS.STATIONS, { params, signal });
    return res.data; // Return full paginated response for server-side pagination
  } catch (err: any) {
    // Silently ignore cancellation errors (expected when component unmounts)
    if (
      err?.name === 'AbortError' ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      String(err?.message).toLowerCase().includes('canceled')
    ) {
      throw err; // Re-throw to be handled by caller
    }
    console.error('fetchStations error:', err);
    return { results: [], count: 0 };
  }
};
import axiosInstance from '../axiosInstance';

const JOURNALS_BASE = '/api/station-management/api/journals/';
const JOURNAL_TYPES = '/api/station-management/api/journal-types/';
const JOURNAL_PRISONERS = '/api/station-management/api/journal-prisoners/';
const STAFF_PROFILES = '/auth/staff-profiles/';
const STATIONS_ENDPOINT = '/system-administration/stations/';

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
  const res = await axiosInstance.get(JOURNALS_BASE, { params, signal });
  return res.data; // {count, next, previous, results}
};

export const createJournal = async (payload: Record<string, any>) => {
  const res = await axiosInstance.post(JOURNALS_BASE, payload);
  return res.data;
};

export const updateJournal = async (id: string, payload: Record<string, any>) => {
  const res = await axiosInstance.patch(`${JOURNALS_BASE}${id}/`, payload);
  return res.data;
};

export const deleteJournal = async (id: string) => {
  const res = await axiosInstance.delete(`${JOURNALS_BASE}${id}/`);
  return res.data;
};

export const fetchJournalTypes = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(JOURNAL_TYPES, { params, signal });
  return res.data?.results ?? res.data ?? [];
};

export const fetchJournalPrisoners = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(JOURNAL_PRISONERS, { params, signal });
  return res.data?.results ?? res.data ?? [];
};

export const fetchDutyOfficers = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(STAFF_PROFILES, { params, signal });
  const items = res.data?.results ?? res.data ?? [];
  return (items || []).map((p: any) => ({
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    force_number: p.force_number,
    rank: p.rank,
    rank_name: p.rank_name,
    station: p.station,
    station_name: p.station_name,
    senior: p.senior,
    raw: p,
  })) as DutyOfficer[];
};

export const fetchStations = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(STATIONS_ENDPOINT, { params, signal });
    return res.data?.results ?? res.data ?? [];
  } catch (err) {
    console.error('fetchStations error:', err);
    return [];
  }
};
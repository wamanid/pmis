import axiosInstance from '../axiosInstance';

/**
 * Centralized API endpoints for Staff Entry & Exit module.
 * All service functions use these constants for consistency and maintainability.
 */
export const STAFF_ENTRY_API_ENDPOINTS = {
  ENTRIES: '/station-management/api/attendance/',
  STAFF_PROFILES: '/auth/staff-profiles/',
  STATIONS: '/system-administration/stations/',
} as const;

export interface StaffProfile {
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

export interface StaffEntryPayload {
  staff: string | number; // staff id (uuid or number depending on backend)
  station: string;
  time_in?: string;
  time_out?: string | null;
  remark?: string | null;
  attendance_type: 'PRESENT' | 'ABSENT';
  date: string; // YYYY-MM-DD
  gate_keeper?: number;
  staff_rank?: string;
  staff_name?: string;
  staff_force_number?: string;
  staff_category?: string;
}

export const fetchEntries = async (params?: Record<string, any>, signal?: AbortSignal) => {
  // pass through the signal so callers can cancel requests
  const res = await axiosInstance.get(STAFF_ENTRY_API_ENDPOINTS.ENTRIES, { params, signal });
  return res.data; // standardized DRF paginated payload: {count, next, previous, results}
};

export const createEntry = async (payload: StaffEntryPayload) => {
  const res = await axiosInstance.post(STAFF_ENTRY_API_ENDPOINTS.ENTRIES, payload);
  return res.data;
};

export const deleteEntry = async (id: string) => {
  const res = await axiosInstance.delete(`${STAFF_ENTRY_API_ENDPOINTS.ENTRIES}${id}/`);
  return res.data;
};

export const fetchStaffProfiles = async (params?: Record<string, any>) => {
  const res = await axiosInstance.get(STAFF_ENTRY_API_ENDPOINTS.STAFF_PROFILES, { params });
  const items = res.data.results ?? res.data ?? [];

  // Normalize to consistent shape
  const profiles = (items || []).map((p: any) => ({
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    force_number: p.force_number,
    rank: p.rank,
    rank_name: p.rank_name,
    station: p.station,
    station_name: p.station_name,
    senior: p.senior, // boolean
    raw: p,
  })) as StaffProfile[];

  // If caller provided a specific force_number, prefer exact-match on client side.
  // Some backends return broad results; this ensures we only accept exact hits.
  if (params && params.force_number) {
    const needle = String(params.force_number).trim();
    const exact = profiles.find((p) => String(p.force_number).trim() === needle);
    return exact ? [exact] : [];
  }

  return profiles;
};

export const fetchStations = async () => {
  try {
    const res = await axiosInstance.get(STAFF_ENTRY_API_ENDPOINTS.STATIONS);
    return res.data.results ?? res.data ?? [];
  } catch (err) {
    console.error('fetchStations error:', err);
    return [];
  }
}

// Ensure updateEntry exists — fallback implementation using fetch so the component can call it.
// PATCH /station-management/api/attendance/{id}/
export const updateEntry = async (id: string, payload: Partial<StaffEntryPayload>) => {
  if (!id) throw new Error('updateEntry: id is required');
  // use axiosInstance + STAFF_ENTRY_API_ENDPOINTS so baseURL from axiosInstance is honored
  const res = await axiosInstance.patch(`${STAFF_ENTRY_API_ENDPOINTS.ENTRIES}${id}/`, payload);
  return res.data;
};
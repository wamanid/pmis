import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';

const BASE = '/station-management/api/complaints/';

// Option endpoints (adjust if your API uses different paths)
const STATIONS_ENDPOINT = '/system-administration/stations/';
const PRISONERS_ENDPOINT = '/admission/prisoners/';
const NATURES_ENDPOINT = '/station-management/api/nature-of-complaints/';
const PRIORITIES_ENDPOINT = '/station-management/api/complaint-priorities/';
const RANKS_ENDPOINT = '/system-administration/ranks/';
const OFFICER_ENDPOINT = '/auth/staff-profiles/';
const COMPLAINT_STATUS_ENDPOINT = '/station-management/api/complaint-status/';
const COMPLAINT_ACTIONS_ENDPOINT = '/station-management/api/complaint-actions/';

export const fetchComplaints = async (params?: Record<string, any>) => {
    const res = await axiosInstance.get(BASE, { params });
    return res.data;
};

export const fetchComplaint = async (id: string) => {
    const res = await axiosInstance.get(`${BASE}${id}/`);
    return res.data;
};

export const createComplaint = async (payload: any) => {
    // tell axiosInstance (via config flag) to skip its default toasts (form will handle friendly message)
    const res = await axiosInstance.post(BASE, payload, { skipErrorToast: true });
    return res.data;
};

export const updateComplaint = async (id: string, payload: any) => {
    const res = await axiosInstance.put(`${BASE}${id}/`, payload, { skipErrorToast: true });
    return res.data;
};

export const deleteComplaint = async (id: string) => {
    const res = await axiosInstance.delete(`${BASE}${id}/`);
    return res.data;
};

// Option fetchers — best-effort, return [] on failure so UI stays functional
export const fetchStations = async () => {
    try {
        const res = await axiosInstance.get(STATIONS_ENDPOINT);
        return res.data.results ?? res.data ?? [];
    } catch {
        return [];
    }
};

export const fetchPrisoners = async () => {
    try {
        const res = await axiosInstance.get(PRISONERS_ENDPOINT);
        const items = res.data.results ?? res.data ?? [];
        // Normalize to { id, name } so UI can display labels consistently
        return (items || []).map((p: any) => {
            const fullName = `${(p.first_name ?? '').trim()} ${(p.last_name ?? '').trim()}`.trim();
            const name = (p.full_name ?? fullName) || p.prison_number || p.name || '';
            return {
                id: p.id,
                name,
                raw: p,
            };
        });
    } catch (err: any) {
        console.error('fetchPrisoners error:', err?.response ?? err);
        toast.error(`Failed to load prisoners: ${err?.response?.status || err?.message || 'unknown'}`);
        return [];
    }
};

export const fetchComplaintNatures = async () => {
    try {
        const res = await axiosInstance.get(NATURES_ENDPOINT);
        return res.data.results ?? res.data ?? [];
    } catch (err: any) {
        console.error('fetchComplaintNatures error:', err?.response ?? err);
        toast.error(`Failed to load complaint natures: ${err?.response?.status || err?.message || 'unknown'}`);
        return [];
    }
};

export const fetchPriorities = async () => {
    try {
        const res = await axiosInstance.get(PRIORITIES_ENDPOINT);
        return res.data.results ?? res.data ?? [];
    } catch (err: any) {
        console.error('fetchPriorities error:', err?.response ?? err);
        toast.error(`Failed to load priorities: ${err?.response?.status || err?.message || 'unknown'}`);
        return [];
    }
};

// api fetch option for ranks
export const fetchRanks = async () => {
    try {
        const res = await axiosInstance.get(RANKS_ENDPOINT);
        return res.data.results ?? res.data ?? [];
    } catch {
        return [];
    }
};

// fetch staff profiles (used by ComplaintForm)
export const fetchStaffProfiles = async () => {
    try {
        const res = await axiosInstance.get(OFFICER_ENDPOINT);
        const items = res.data?.results ?? res.data ?? [];
        return (items || []).map((p: any) => {
            // robust extraction
            const username = p.username ?? p.user?.username ?? `${(p.first_name ?? '').toLowerCase()}.${(p.last_name ?? '').toLowerCase()}`.replace(/\s+/g, '.');
            const name = (p.first_name || p.last_name) ? `${(p.first_name ?? '').trim()} ${(p.last_name ?? '').trim()}`.trim() : (p.name ?? '');
            return {
                id: p.id,
                force_number: p.force_number ?? '',
                username,
                name,
                rank: p.rank ?? null,
                rank_name: p.rank_name ?? null,
                station: p.station ?? null,
                raw: p,
            };
        });
    } catch (err: any) {
        console.error('fetchStaffProfiles error', err?.response ?? err);
        toast.error('Failed to load staff profiles');
        return [];
    }
}

// Fetch complaint statuses (used to render status badges)
export const fetchComplaintStatuses = async (signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(COMPLAINT_STATUS_ENDPOINT, { signal });
    return res.data?.results ?? res.data ?? [];
  } catch (err) {
    console.error('fetchComplaintStatuses error', err);
    return [];
  }
};

// Create a complaint action
export const createComplaintAction = async (payload: any) => {
  try {
    const res = await axiosInstance.post(COMPLAINT_ACTIONS_ENDPOINT, payload, { skipErrorToast: true });
    return res.data;
  } catch (err: any) {
    console.error('createComplaintAction error', err?.response ?? err);
    throw err;
  }
};

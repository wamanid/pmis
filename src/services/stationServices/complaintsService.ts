import axiosInstance from '../axiosInstance';
import { toast } from 'sonner';

/**
 * Centralized API endpoints for Complaints module.
 * All service functions use these constants for consistency and maintainability.
 */
export const COMPLAINTS_API_ENDPOINTS = {
  COMPLAINTS: '/station-management/api/complaints/',
  STATIONS: '/system-administration/stations/',
  PRISONERS: '/admission/prisoners/',
  NATURES: '/station-management/api/nature-of-complaints/',
  PRIORITIES: '/station-management/api/complaint-priorities/',
  RANKS: '/system-administration/ranks/',
  STAFF_PROFILES: '/auth/staff-profiles/',
  COMPLAINT_STATUS: '/station-management/api/complaint-status/',
  COMPLAINT_ACTIONS: '/station-management/api/complaint-actions/',
  APPROVAL_STATUSES: '/station-management/api/complaint-status/',
} as const;

export const fetchComplaints = async (params?: Record<string, any>, signal?: AbortSignal) => {
    const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.COMPLAINTS, { params, signal });
    return res.data;
};

export const fetchComplaint = async (id: string, signal?: AbortSignal) => {
    const res = await axiosInstance.get(`${COMPLAINTS_API_ENDPOINTS.COMPLAINTS}${id}/`, { signal });
    return res.data;
};

export const createComplaint = async (payload: any) => {
    // tell axiosInstance (via config flag) to skip its default toasts (form will handle friendly message)
    const res = await axiosInstance.post(COMPLAINTS_API_ENDPOINTS.COMPLAINTS, payload, { skipErrorToast: true } as any);
    return res.data;
};

export const updateComplaint = async (id: string, payload: any) => {
    const res = await axiosInstance.put(`${COMPLAINTS_API_ENDPOINTS.COMPLAINTS}${id}/`, payload, { skipErrorToast: true } as any);
    return res.data;
};

export const deleteComplaint = async (id: string) => {
    const res = await axiosInstance.delete(`${COMPLAINTS_API_ENDPOINTS.COMPLAINTS}${id}/`);
    return res.data;
};

// Option fetchers — return full paginated response for server-side pagination
export const fetchStations = async (params?: Record<string, any>, signal?: AbortSignal) => {
    try {
        const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.STATIONS, { params, signal });
        return res.data; // Return full paginated response
    } catch (err: any) {
        // Silently ignore cancellation errors
        if (
            err?.name === 'AbortError' ||
            err?.name === 'CanceledError' ||
            err?.code === 'ERR_CANCELED' ||
            String(err?.message).toLowerCase().includes('canceled')
        ) {
            throw err;
        }
        console.error('fetchStations error:', err);
        return { results: [], count: 0 };
    }
};

export const fetchPrisoners = async (params?: Record<string, any>, signal?: AbortSignal) => {
    try {
        const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.PRISONERS, { params, signal });
        return res.data; // Return full paginated response for server-side pagination
    } catch (err: any) {
        // Silently ignore cancellation errors
        if (
            err?.name === 'AbortError' ||
            err?.name === 'CanceledError' ||
            err?.code === 'ERR_CANCELED' ||
            String(err?.message).toLowerCase().includes('canceled')
        ) {
            throw err;
        }
        console.error('fetchPrisoners error:', err?.response ?? err);
        return { results: [], count: 0 };
    }
};

export const fetchComplaintNatures = async (params?: Record<string, any>, signal?: AbortSignal) => {
    try {
        const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.NATURES, { params, signal });
        return res.data; // Return full paginated response for server-side pagination
    } catch (err: any) {
        // Silently ignore cancellation errors
        if (
            err?.name === 'AbortError' ||
            err?.name === 'CanceledError' ||
            err?.code === 'ERR_CANCELED' ||
            String(err?.message).toLowerCase().includes('canceled')
        ) {
            throw err;
        }
        console.error('fetchComplaintNatures error:', err?.response ?? err);
        return { results: [], count: 0 };
    }
};

export const fetchPriorities = async (params?: Record<string, any>, signal?: AbortSignal) => {
    try {
        const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.PRIORITIES, { params, signal });
        return res.data; // Return full paginated response for server-side pagination
    } catch (err: any) {
        // Silently ignore cancellation errors
        if (
            err?.name === 'AbortError' ||
            err?.name === 'CanceledError' ||
            err?.code === 'ERR_CANCELED' ||
            String(err?.message).toLowerCase().includes('canceled')
        ) {
            throw err;
        }
        console.error('fetchPriorities error:', err?.response ?? err);
        return { results: [], count: 0 };
    }
};

// api fetch option for ranks
export const fetchRanks = async (params?: Record<string, any>, signal?: AbortSignal) => {
    try {
        const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.RANKS, { params, signal });
        return res.data; // Return full paginated response for server-side pagination
    } catch (err: any) {
        // Silently ignore cancellation errors
        if (
            err?.name === 'AbortError' ||
            err?.name === 'CanceledError' ||
            err?.code === 'ERR_CANCELED' ||
            String(err?.message).toLowerCase().includes('canceled')
        ) {
            throw err;
        }
        console.error('fetchRanks error:', err);
        return { results: [], count: 0 };
    }
};

// fetch staff profiles (used by ComplaintForm)
export const fetchStaffProfiles = async (params?: Record<string, any>, signal?: AbortSignal) => {
    try {
        const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.STAFF_PROFILES, { params, signal });
        return res.data; // Return full paginated response for server-side pagination
    } catch (err: any) {
        // Silently ignore cancellation errors
        if (
            err?.name === 'AbortError' ||
            err?.name === 'CanceledError' ||
            err?.code === 'ERR_CANCELED' ||
            String(err?.message).toLowerCase().includes('canceled')
        ) {
            throw err;
        }
        console.error('fetchStaffProfiles error', err?.response ?? err);
        return { results: [], count: 0 };
    }
}

// Fetch complaint statuses (used to render status badges)
export const fetchComplaintStatuses = async (signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.COMPLAINT_STATUS, { signal });
    return res.data?.results ?? res.data ?? [];
  } catch (err: any) {
    // Silently ignore cancellation errors
    if (
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED' ||
        String(err?.message).toLowerCase().includes('canceled')
    ) {
        return [];
    }
    console.error('fetchComplaintStatuses error', err);
    return [];
  }
};

// Create a complaint action
export const createComplaintAction = async (payload: any) => {
  try {
    const res = await axiosInstance.post(COMPLAINTS_API_ENDPOINTS.COMPLAINT_ACTIONS, payload, { skipErrorToast: true } as any);
    return res.data;
  } catch (err: any) {
    console.error('createComplaintAction error', err?.response ?? err);
    throw err;
  }
};

export const fetchApprovalStatuses = async (signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(COMPLAINTS_API_ENDPOINTS.APPROVAL_STATUSES, { signal });
    // Return either paginated results or raw array
    return res.data?.results ?? res.data;
  } catch (err: any) {
    // Silently ignore cancellation errors
    if (
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED' ||
        String(err?.message).toLowerCase().includes('canceled')
    ) {
        return [];
    }
    console.error('fetchApprovalStatuses error:', err);
    return [];
  }
};
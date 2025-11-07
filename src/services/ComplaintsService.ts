import axiosInstance from './axiosInstance';
import { toast } from 'sonner';

const BASE = '/station-management/api/complaints/';

// Option endpoints (adjust if your API uses different paths)
const STATIONS_ENDPOINT = '/system-administration/stations/';
const PRISONERS_ENDPOINT = '/admission/prisoners/';
const NATURES_ENDPOINT = '/station-management/api/nature-of-complaints/';
const PRIORITIES_ENDPOINT = '/station-management/api/complaint-priorities/';
const RANKS_ENDPOINT = '/system-administration/ranks/';

// Use mock ranks instead of hitting an API
// export const MOCK_RANKS = [
//     { id: 'd3b07384-9f2e-4b6d-9f3a-1a2b3c4d5e6f', name: 'Chief Inspector' },
//     { id: 'a1e2b3c4-5d6f-4a7b-8c9d-0e1f2a3b4c5d', name: 'Inspector' },
//     { id: 'f1e2d3c4-b5a6-4c7d-9e8f-1234567890ab', name: 'Sergeant' },
//     { id: '0a1b2c3d-4e5f-4f6a-8b9c-abcdef012345', name: 'Constable' },
// ];

// To use the mock in this file, replace the fetchRanks implementation with:
// export const fetchRanks = async () => MOCK_RANKS;

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

// export const fetchPrisoners = async () => {
//     try {
//         const res = await axiosInstance.get(PRISONERS_ENDPOINT);
//         return res.data.results ?? res.data ?? [];
//     } catch (err: any) {
//         console.error('fetchPrisoners error:', err?.response ?? err);
//         toast.error(`Failed to load prisoners: ${err?.response?.status || err?.message || 'unknown'}`);
//         return [];
//     }
// };

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

import axiosInstance from './axiosInstance';
import { toast } from 'sonner';

const BASE = '/station-management/api/complaints/';

// Option endpoints (adjust if your API uses different paths)
const STATIONS_ENDPOINT = '/system-administration/stations/';
const PRISONERS_ENDPOINT = '/admission/prisoners/';
const NATURES_ENDPOINT = '/station-management/api/nature-of-complaints/';
const PRIORITIES_ENDPOINT = '/station-management/api/complaint-priorities/';
const RANKS_ENDPOINT = '/system-administration/ranks/';

export const fetchComplaints = async (params?: Record<string, any>) => {
    const res = await axiosInstance.get(BASE, { params });
    return res.data;
};

export const fetchComplaint = async (id: string) => {
    const res = await axiosInstance.get(`${BASE}${id}/`);
    return res.data;
};

export const createComplaint = async (payload: any) => {
    const res = await axiosInstance.post(BASE, payload);
    return res.data;
};

export const updateComplaint = async (id: string, payload: any) => {
    const res = await axiosInstance.put(`${BASE}${id}/`, payload);
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
        return res.data.results ?? res.data ?? [];
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

export const fetchRanks = async () => {
    try {
        const res = await axiosInstance.get(RANKS_ENDPOINT);
        return res.data.results ?? res.data ?? [];
    } catch {
        return [];
    }
};

import axiosInstance from "../axiosInstance";

const BASE = "/rehabilitation/call-records/";

export interface CallRecordItem {
  id: string;
  prisoner_name?: string;
  prisoner_number?: string;
  call_type_name?: string;
  relation_name?: string;
  welfare_officer_name?: string;
  recorded_call?: string;
  created_datetime?: string;
  is_active?: boolean;
  caller?: string;
  phone_number?: string;
  call_date?: string;
  call_duration?: number;
  call_notes?: string;
  prisoner?: string;
  call_type?: string;
  relation_to_prisoner?: string;
  welfare_officer?: string;
  [k: string]: any;
}

/**
 * Fetch paginated call records.
 * params: { page, page_size, search, ordering, ... }
 */
export const fetchCallRecords = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(BASE, { params, signal });
  return res.data; // { count, next, previous, results }
};

export const fetchCallById = async (id: string, signal?: AbortSignal) => {
  const res = await axiosInstance.get(`${BASE}${id}/`, { signal });
  return res.data;
};

export const createCallRecord = async (payload: Record<string, any>) => {
  const res = await axiosInstance.post(BASE, payload);
  return res.data;
};

export const updateCallRecord = async (id: string, payload: Record<string, any>) => {
  const res = await axiosInstance.patch(`${BASE}${id}/`, payload);
  return res.data;
};

export const deleteCallRecord = async (id: string) => {
  const res = await axiosInstance.delete(`${BASE}${id}/`);
  return res.data;
};
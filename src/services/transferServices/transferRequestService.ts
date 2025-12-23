import axiosInstance from "../axiosInstance";

const TRANSFER_REQUESTS_ENDPOINT = "/transfer-management/requests/";
const TRANSFERS_ENDPOINT = "/transfer-management/transfers/";
const STATIONS_ENDPOINT = "/system-administration/stations/";
const REASONS_ENDPOINT = "/transfer-management/reasons/";
const STATUSES_ENDPOINT = "/transfer-management/statuses/";

export interface ApiListResult<T> {
  items: T[];
  count: number;
}

/**
 * Fetch transfer requests with optional filters and pagination.
 */
export async function fetchTransferRequests(
  params: {
    search?: string;
    original_station?: string | null;
    destination_station?: string | null;
    status?: string | null;
    reason?: string | null;
    transfer_type?: string | null; // bulk/single
    date_from?: string | null;
    date_to?: string | null;
    page?: number;
    page_size?: number;
  } = {},
  signal?: AbortSignal
) {
  const q: Record<string, any> = {};
  if (params.search) q.search = params.search;
  if (params.original_station) q.original_station = params.original_station;
  if (params.destination_station) q.destination_station = params.destination_station;
  if (params.status) q.status = params.status;
  if (params.reason) q.reason = params.reason;
  if (params.transfer_type) q.bulk_transfer = params.transfer_type === "bulk" ? true : undefined;
  if (params.date_from) q.date_from = params.date_from;
  if (params.date_to) q.date_to = params.date_to;
  q.page = params.page ?? 1;
  q.page_size = params.page_size ?? 100;

  const res = await axiosInstance.get(TRANSFER_REQUESTS_ENDPOINT, { params: q, signal });
  const raw = res?.data ?? {};
  const results = raw.results ?? raw;
  const count = Number(raw.count ?? results.length ?? 0);
  return { items: results, count } as ApiListResult<any>;
}

export async function createTransferRequest(payload: any) {
  const res = await axiosInstance.post(TRANSFER_REQUESTS_ENDPOINT, payload);
  return res.data;
}

export async function updateTransferRequest(id: string, payload: any) {
  const res = await axiosInstance.put(`${TRANSFER_REQUESTS_ENDPOINT}${id}/`, payload);
  return res.data;
}

export async function deleteTransferRequest(id: string) {
  const res = await axiosInstance.delete(`${TRANSFER_REQUESTS_ENDPOINT}${id}/`);
  return res.data;
}

/* Lookup helpers */
export async function fetchStations(params: Record<string, any> = {}, signal?: AbortSignal) {
  // params first, signal second — callers may pass params and an AbortSignal
  const res = await axiosInstance.get(STATIONS_ENDPOINT, { params, signal });
  const raw = res.data ?? {};
  const results = raw.results ?? raw;
  return (results || []).map((r: any) => ({ id: r.id, name: r.name, ...r }));
}
export async function fetchReasons(signal?: AbortSignal) {
  const res = await axiosInstance.get(REASONS_ENDPOINT, { signal });
  const raw = res.data ?? {};
  return raw.results ?? raw;
}
export async function fetchStatuses(signal?: AbortSignal) {
  const res = await axiosInstance.get(STATUSES_ENDPOINT, { signal });
  const raw = res.data ?? {};
  return raw.results ?? raw;
}
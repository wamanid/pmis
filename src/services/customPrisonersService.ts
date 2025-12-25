import axiosInstance from "./axiosInstance";
const PRISONERS_ENDPOINT = "/admission/prisoners/";

/**
 * normalize raw prisoner object coming from backend into predictable shape
 */
export function normalizePrisoner(p: any) {
  return {
    ...p,
    id: p.id,
    full_name: p.full_name ?? `${(p.first_name ?? "").trim()} ${(p.last_name ?? "").trim()}`.trim(),
    prisoner_number_value: p.prisoner_number_value ?? p.prisoner_number ?? p.prisoner_personal_number_value ?? "",
    current_station_name: p.current_station_name ?? p.station_name ?? "",
    current_station: p.current_station ?? p.station ?? p.current_station_id ?? p.station_id ?? "",
    raw: p,
  };
}

/**
 * Types and options for the fetchPrisoners service.
 */
export interface Prisoner {
  id: string;
  full_name: string;
  prisoner_number_value: string;
  current_station_name: string;
  current_station: string;
  raw: any;
  [k: string]: any;
}

export interface FetchPrisonersOptions {
  search?: string;
  station?: string | null;
  district?: string | null;
  region?: string | null;
  page_size?: number;
  page?: number;
  useCache?: boolean;
  extraParams?: Record<string, any>;
}

export interface FetchPrisonersResult {
  items: Prisoner[];
  count: number;
  next?: string | null;
}

/**
 * Simple in-memory cache to avoid duplicate rapid requests.
 * Keep TTL short to avoid stale data. Cache is optional per-call.
 */
const cache = new Map<string, { ts: number; data: FetchPrisonersResult }>();
const DEFAULT_CACHE_TTL = 30_000; // 30 seconds

function makeCacheKey(params: Record<string, any>) {
  return Object.keys(params).sort().map(k => `${k}=${String(params[k])}`).join("&");
}

/**
 * fetchPrisoners(options, signal)
 * - returns { items, count, next }
 */
export async function fetchPrisoners(
  options: FetchPrisonersOptions = {},
  signal?: AbortSignal,
  cacheTTL = DEFAULT_CACHE_TTL
): Promise<FetchPrisonersResult> {
  const {
    search = "",
    station = null,
    district = null,
    region = null,
    page_size = 100,
    page = 1,
    useCache = true,
    extraParams = {},
  } = options;

  // map to API params (keep backwards compat)
  const params: Record<string, any> = { search: search || "", page_size, page, ...extraParams };

  if (station) params.current_station = station;
  if (district) params.district = district;
  if (region) params.region = region;

  const key = makeCacheKey(params);
  if (useCache) {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.ts) <= cacheTTL) {
      return { ...cached.data };
    }
  }

  try {
    const res = await axiosInstance.get(PRISONERS_ENDPOINT, { params, signal });
    const rawData = res?.data ?? {};
    // support both paginated shape and array shape
    const rawItems: any[] = rawData.results ?? rawData.items ?? (Array.isArray(rawData) ? rawData : []);
    const count: number = Number(rawData.count ?? rawItems.length ?? 0);
    const next: string | null = rawData.next ?? null;
    const items: Prisoner[] = (rawItems || []).map(normalizePrisoner);

    const result: FetchPrisonersResult = { items, count, next };
    if (useCache) cache.set(key, { ts: Date.now(), data: result });
    return result;
  } catch (err: any) {
    if (err?.response) {
      const status = err.response.status;
      const data = err.response.data;
      const e = new Error(`Prisoners fetch failed: HTTP ${status}`);
      (e as any).status = status;
      (e as any).data = data;
      throw e;
    } else if (err?.request) {
      const e = new Error("Prisoners fetch failed: Network / no response");
      (e as any).request = err.request;
      throw e;
    } else {
      throw err;
    }
  }
}

/**
 * Utility to clear the in-memory cache
 */
export function clearPrisonersCache() {
  cache.clear();
}

/**
 * Fetch a single prisoner by id using a dedicated endpoint if available.
 * Falls back to a search-by-id (page_size:1) when direct endpoint fails.
 */
export async function fetchPrisonerById(id: string, signal?: AbortSignal) {
  if (!id) return { items: [], count: 0, next: null };
  // try dedicated endpoint first
  try {
    const res = await axiosInstance.get(`${PRISONERS_ENDPOINT}${id}/`, { signal });
    const raw = res?.data ? [res.data] : [];
    // reuse normalize logic if present in file
    const items = (raw || []).map((p: any) => {
      // minimal normalize (keep fields as returned)
      return {
        ...p,
        id: p.id,
        full_name: p.full_name ?? `${(p.first_name ?? "").trim()} ${(p.last_name ?? "").trim()}`.trim(),
        prisoner_number_value: p.prisoner_number_value ?? p.prisoner_number ?? "",
        current_station: p.current_station ?? p.station ?? null,
        current_station_name: p.current_station_name ?? p.station_name ?? "",
        raw: p,
      };
    });
    return { items, count: items.length, next: null };
  } catch (err) {
    // fallback to search-by-id (some backends support this)
    try {
      const res = await fetchPrisoners({ search: String(id), page_size: 1, page: 1, useCache: true }, signal);
      return res;
    } catch (e) {
      return { items: [], count: 0, next: null };
    }
  }
}
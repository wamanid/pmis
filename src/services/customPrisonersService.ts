import axiosInstance from "./axiosInstance";

export const PRISONERS_ENDPOINT = "/admission/prisoners/";

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
 * - keep service stateless and cheap (no debounce here).
 * - UI should debounce and pass an AbortSignal for cancellation.
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
  // useCache: if true, service will return a cached result when available (short TTL)
  useCache?: boolean;
  // allow callers to pass arbitrary extra query params if needed
  extraParams?: Record<string, any>;
}

export interface FetchPrisonersResult {
  items: Prisoner[];
  count: number;
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
 * - returns { items, count }
 * - classifies errors: network (no response) vs HTTP (response.status)
 * - optional caching via options.useCache
 *
 * Note: UI should debounce user typing. Service accepts AbortSignal to cancel in-flight requests.
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
      useCache = true,
      extraParams = {},
    } = options;

    const params: Record<string, any> = { search: search || "", page_size, ...extraParams };

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
      const rawItems: any[] = res?.data?.results ?? res?.data ?? [];
      const count: number = Number(res?.data?.count ?? rawItems.length ?? 0);
      const items: Prisoner[] = (rawItems || []).map(normalizePrisoner);

      const result: FetchPrisonersResult = { items, count };
      if (useCache) cache.set(key, { ts: Date.now(), data: result });
      return result;
    } catch (err: any) {
      // classify and rethrow informative errors for callers (UI can react accordingly)
      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data;
        const e = new Error(`Prisoners fetch failed: HTTP ${status}`);
        (e as any).status = status;
        (e as any).data = data;
        throw e;
      } else if (err?.request) {
        // network / CORS / no response
        const e = new Error("Prisoners fetch failed: Network / no response");
        (e as any).request = err.request;
        throw e;
      } else {
        throw err;
      }
    }
}

/**
 * Utility to clear the in-memory cache (useful in tests or when data changes server-side)
 */
export function clearPrisonersCache() {
  cache.clear();
}
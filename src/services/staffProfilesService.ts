import axiosInstance from "./axiosInstance";

const STAFF_ENDPOINT = "/auth/staff-profiles/";

export interface FetchStaffOptions {
  search?: string;
  page?: number;
  page_size?: number;
  useCache?: boolean;
  extraParams?: Record<string, any>;
}

export interface FetchStaffResult {
  items: any[];
  count: number;
  next?: string | null;
}

/**
 * fetchStaffProfiles supports pagination and returns { items, count, next }
 */
export async function fetchStaffProfiles(options: FetchStaffOptions | string = "", signal?: AbortSignal): Promise<FetchStaffResult> {
  let search = "";
  let page = 1;
  let page_size = 50;
  let useCache = true;
  let extraParams: Record<string, any> = {};

  if (typeof options === "string") {
    search = options;
  } else {
    search = options.search ?? "";
    page = options.page ?? 1;
    page_size = options.page_size ?? 50;
    useCache = options.useCache ?? true;
    extraParams = options.extraParams ?? {};
  }

  const params: Record<string, any> = { search: search ?? "", page, page_size, ...extraParams };

  const res = await axiosInstance.get(STAFF_ENDPOINT, { params, signal });
  const raw = res?.data ?? {};
  const rawItems: any[] = raw.results ?? raw.items ?? (Array.isArray(raw) ? raw : []);
  const count = Number(raw.count ?? rawItems.length ?? 0);
  const next = raw.next ?? null;
  const items = (rawItems || []).map((it) => ({ ...it }));

  return { items, count, next };
}
import axiosInstance from "./axiosInstance";

const STAFF_ENDPOINT = "/auth/staff-profiles/";

/**
 * fetchStaffProfiles(q, signal)
 * returns array of staff profiles (res.data.results)
 */
export async function fetchStaffProfiles(q = "", signal?: AbortSignal) {
  const params = { search: q || "", page_size: 50 };
  const res = await axiosInstance.get(STAFF_ENDPOINT, { params, signal });
  const items = res?.data?.results ?? res?.data ?? [];
  return items;
}
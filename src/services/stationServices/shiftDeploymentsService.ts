import axiosInstance from '../axiosInstance';

/**
 * Centralized API endpoints for Shift Deployments module.
 * All service functions use these constants for consistency and maintainability.
 */
export const SHIFT_DEPLOYMENTS_API_ENDPOINTS = {
  SHIFT_DEPLOYMENTS: '/station-management/api/shift-deployments/',
  SHIFT_DETAILS: '/station-management/api/shift-details/',
  SHIFTS: '/station-management/api/shifts/',
  DEPLOYMENT_AREAS: '/station-management/api/deployment-areas/',
  STAFF_PROFILES: '/auth/staff-profiles/',
  STATIONS: '/system-administration/stations/',
  RANKS: '/system-administration/ranks/',
  REGIONS: '/system-administration/regions/',
  DISTRICTS: '/system-administration/districts/',
} as const;

export const fetchShiftDetails = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DETAILS, { params, signal });
    return res.data; // Return full paginated response {count, results, next}
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
    console.error('fetchShiftDetails error:', err);
    return { results: [], count: 0 };
  }
};

export const fetchShiftDetailDeployments = async (shiftId: string, params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(`${SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DETAILS}${shiftId}/deployments/`, { params, signal });
    return res.data; // Return full paginated response
  } catch (err: any) {
    if (
      err?.name === 'AbortError' ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      String(err?.message).toLowerCase().includes('canceled')
    ) {
      throw err;
    }
    console.error('fetchShiftDetailDeployments error:', err);
    return { results: [], count: 0 };
  }
};

export const fetchShiftDeployments = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DEPLOYMENTS, { params, signal });
    return res.data; // Return full paginated response
  } catch (err: any) {
    if (
      err?.name === 'AbortError' ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      String(err?.message).toLowerCase().includes('canceled')
    ) {
      throw err;
    }
    console.error('fetchShiftDeployments error:', err);
    return { results: [], count: 0 };
  }
};

export const createShiftDetail = async (payload: Record<string, any>) => {
  const res = await axiosInstance.post(SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DETAILS, payload);
  return res.data;
};

export const updateShiftDetail = async (id: string, payload: Record<string, any>) => {
  const res = await axiosInstance.patch(`${SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DETAILS}${id}/`, payload);
  return res.data;
};

export const deleteShiftDetail = async (id: string) => {
  const res = await axiosInstance.delete(`${SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DETAILS}${id}/`);
  return res.data;
};

export const createDeployment = async (payload: Record<string, any>) => {
  const res = await axiosInstance.post(SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DEPLOYMENTS, payload);
  return res.data;
};

export const updateDeployment = async (id: string, payload: Record<string, any>) => {
  const res = await axiosInstance.patch(`${SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DEPLOYMENTS}${id}/`, payload);
  return res.data;
};

export const deleteDeployment = async (id: string) => {
  const res = await axiosInstance.delete(`${SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFT_DEPLOYMENTS}${id}/`);
  return res.data;
};

export const fetchDeploymentAreas = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.DEPLOYMENT_AREAS, { params, signal });
    return res.data; // Return full paginated response for server-side pagination
  } catch (err: any) {
    if (
      err?.name === 'AbortError' ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      String(err?.message).toLowerCase().includes('canceled')
    ) {
      throw err;
    }
    console.error('fetchDeploymentAreas error:', err);
    return { results: [], count: 0 };
  }
};

export const fetchStaffProfiles = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.STAFF_PROFILES, { params, signal });
    return res.data; // Return full paginated response for server-side pagination
  } catch (err: any) {
    if (
      err?.name === 'AbortError' ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      String(err?.message).toLowerCase().includes('canceled')
    ) {
      throw err;
    }
    console.error('fetchStaffProfiles error:', err);
    return { results: [], count: 0 };
  }
};

export const fetchStations = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.STATIONS, { params, signal });
    return res.data; // Return full paginated response
  } catch (err: any) {
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

export const fetchRanks = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.RANKS, { params, signal });
    return res.data; // Return full paginated response
  } catch (err: any) {
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

export const fetchRegions = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.REGIONS, { params, signal });
    return res.data; // Return full paginated response
  } catch (err: any) {
    if (
      err?.name === 'AbortError' ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      String(err?.message).toLowerCase().includes('canceled')
    ) {
      throw err;
    }
    console.error('fetchRegions error:', err);
    return { results: [], count: 0 };
  }
};

export const fetchDistricts = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.DISTRICTS, { params, signal });
    return res.data; // Return full paginated response
  } catch (err: any) {
    if (
      err?.name === 'AbortError' ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      String(err?.message).toLowerCase().includes('canceled')
    ) {
      throw err;
    }
    console.error('fetchDistricts error:', err);
    return { results: [], count: 0 };
  }
};

export const fetchShifts = async (params?: Record<string, any>, signal?: AbortSignal) => {
  try {
    const res = await axiosInstance.get(SHIFT_DEPLOYMENTS_API_ENDPOINTS.SHIFTS, { params, signal });
    return res.data; // Return full paginated response {count, results, next}
  } catch (err: any) {
    if (
      err?.name === 'AbortError' ||
      err?.name === 'CanceledError' ||
      err?.code === 'ERR_CANCELED' ||
      String(err?.message).toLowerCase().includes('canceled')
    ) {
      throw err;
    }
    console.error('fetchShifts error:', err);
    return { results: [], count: 0 };
  }
};
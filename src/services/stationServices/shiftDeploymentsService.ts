import axiosInstance from '../axiosInstance';

const SHIFT_DEPLOYMENTS = '/station-management/api/shift-deployments/';
const SHIFT_DETAILS = '/station-management/api/shift-details/';
const DEPLOYMENT_AREAS = '/station-management/api/deployment-areas/';
const STAFF_PROFILES = '/auth/staff-profiles/';
const STATIONS = '/system-administration/stations/';
const RANKS = '/system-administration/ranks/';
const REGIONS = '/system-administration/regions/';
const DISTRICTS = '/system-administration/districts/';

export const fetchShiftDetails = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(SHIFT_DETAILS, { params, signal });
  return res.data; // {count, results}
};

export const fetchShiftDetailDeployments = async (shiftId: string, params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(`${SHIFT_DETAILS}${shiftId}/deployments/`, { params, signal });
  return res.data;
};

export const fetchShiftDeployments = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(SHIFT_DEPLOYMENTS, { params, signal });
  return res.data;
};

export const createShiftDetail = async (payload: Record<string, any>) => {
  const res = await axiosInstance.post(SHIFT_DETAILS, payload);
  return res.data;
};

export const updateShiftDetail = async (id: string, payload: Record<string, any>) => {
  const res = await axiosInstance.patch(`${SHIFT_DETAILS}${id}/`, payload);
  return res.data;
};

export const deleteShiftDetail = async (id: string) => {
  const res = await axiosInstance.delete(`${SHIFT_DETAILS}${id}/`);
  return res.data;
};

export const createDeployment = async (payload: Record<string, any>) => {
  const res = await axiosInstance.post(SHIFT_DEPLOYMENTS, payload);
  return res.data;
};

export const updateDeployment = async (id: string, payload: Record<string, any>) => {
  const res = await axiosInstance.patch(`${SHIFT_DEPLOYMENTS}${id}/`, payload);
  return res.data;
};

export const deleteDeployment = async (id: string) => {
  const res = await axiosInstance.delete(`${SHIFT_DEPLOYMENTS}${id}/`);
  return res.data;
};

export const fetchDeploymentAreas = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(DEPLOYMENT_AREAS, { params, signal });
  return res.data?.results ?? res.data ?? [];
};

export const fetchStaffProfiles = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(STAFF_PROFILES, { params, signal });
  const items = res.data?.results ?? res.data ?? [];
  return (items || []).map((p: any) => ({
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    force_number: p.force_number,
    name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.force_number || p.id,
    rank: p.rank,
    rank_name: p.rank_name,
    station: p.station,
    station_name: p.station_name,
    raw: p,
  }));
};

export const fetchStations = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(STATIONS, { params, signal });
  return res.data?.results ?? res.data ?? [];
};

export const fetchRanks = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(RANKS, { params, signal });
  return res.data?.results ?? res.data ?? [];
};

export const fetchRegions = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(REGIONS, { params, signal });
  return res.data?.results ?? res.data ?? [];
};

export const fetchDistricts = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(DISTRICTS, { params, signal });
  return res.data?.results ?? res.data ?? [];
};
import axiosInstance from '../axiosInstance';

// API endpoints (centralised)
const BASE = '/property-management/prisoner-accounts/';
const ACCOUNT_TYPES = '/property-management/cash-account-types/';

export interface ListParams { page?: number; page_size?: number; search?: string; ordering?: string; station?: string; district?: string; region?: string; prisoner?: string; }

export async function listAccounts(params: ListParams = {}) {
  const res = await axiosInstance.get(BASE, { params });
  return res.data;
}

export async function getAccount(id: string) {
  const res = await axiosInstance.get(`${BASE}${id}/`);
  return res.data;
}

export async function createAccount(payload: any) {
  const res = await axiosInstance.post(BASE, payload);
  return res.data;
}

export async function updateAccount(id: string, payload: any) {
  const res = await axiosInstance.patch(`${BASE}${id}/`, payload);
  return res.data;
}

export async function deleteAccount(id: string) {
  const res = await axiosInstance.delete(`${BASE}${id}/`);
  return res.data;
}

export async function listAccountTypes(params: any = {}) {
  const res = await axiosInstance.get(ACCOUNT_TYPES, { params });
  return res.data;
}

export async function accountsByPrisoner(prisonerId: string) {
  const res = await axiosInstance.get('/property-management/prisoner-accounts/by_prisoner/', { params: { prisoner: prisonerId } });
  return res.data;
}

export async function getAccountBalance(id: string) {
  const res = await axiosInstance.get(`/property-management/prisoner-accounts/${id}/balance/`);
  return res.data;
}
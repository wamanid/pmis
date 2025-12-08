import axiosInstance from '../axiosInstance';

// API endpoints (centralised)
const BASE = '/property-management/transactions/';
const TX_TYPES = '/property-management/transaction-types/';
const TX_STATUSES = '/system-administration/transaction-statuses/';

export interface TxListParams { page?: number; page_size?: number; search?: string; ordering?: string; station?: string; district?: string; region?: string; property_prisoner_account?: string; prisoner?: string; transaction_type?: string; transaction_status?: string; }

export async function listTransactions(params: TxListParams = {}) {
  const res = await axiosInstance.get(BASE, { params });
  return res.data;
}

export async function createTransaction(payload: any) {
  const res = await axiosInstance.post(BASE, payload);
  return res.data;
}

export async function getTransactionsByAccount(accountId: string, params: any = {}) {
  const res = await axiosInstance.get('/property-management/transactions/by_account/', { params: { property_prisoner_account: accountId, ...params } });
  return res.data;
}

export async function listTransactionTypes(params: any = {}) {
  const res = await axiosInstance.get(TX_TYPES, { params });
  return res.data;
}

export async function listTransactionStatuses(params: any = {}) {
  const res = await axiosInstance.get(TX_STATUSES, { params });
  return res.data;
}
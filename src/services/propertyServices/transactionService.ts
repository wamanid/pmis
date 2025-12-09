import axiosInstance from '../../services/axiosInstance';

// API endpoints (centralised)
const BASE = '/property-management/transactions/';
const TX_TYPES = '/property-management/transaction-types/';
const TX_STATUSES = '/system-administration/transaction-statuses/';

export const listTransactions = (params?: any) => {
  return axiosInstance.get(BASE, { params }).then(r => r.data);
};

export const createTransaction = (data: any) => {
  return axiosInstance.post(BASE, data).then(r => r.data);
};

// update transaction
export const updateTransaction = (id: string, data: any) => {
  return axiosInstance.patch(`${BASE}${id}/`, data).then(r => r.data);
};

// delete transaction
export const deleteTransaction = (id: string) => {
  return axiosInstance.delete(`${BASE}${id}/`).then(r => r.data);
};

export const listTransactionTypes = () => axiosInstance.get(TX_TYPES).then(r => r.data);
export const listTransactionStatuses = () => axiosInstance.get(TX_STATUSES).then(r => r.data);
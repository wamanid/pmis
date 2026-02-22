import axiosInstance from '../../axiosInstance';

export const DEATH_NOTIFICATION_API_ENDPOINTS = {
  DEATH_NOTIFICATIONS: '/medical-management/death-notifications/',
  DEATH_NOTIFICATION_DETAIL: (id: string) => `/medical-management/death-notifications/${id}/`,
};

export interface Recipient {
  id?: string;
  recipient_name: string;
  recipient: string;
}

export interface DeathNotificationItem {
  id?: string;
  prisoner_name?: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string | null;
  deleted_datetime?: string | null;
  death_confirmation?: string;
  notification?: string;
  recipients?: Recipient[];
}

export interface PaginatedDeathNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: DeathNotificationItem[];
}

// Fetch paginated list. Accepts params: page, page_size, search, ordering, etc.
export const fetchDeathNotifications = async (
  params: Record<string, any> = {},
  signal?: AbortSignal
): Promise<PaginatedDeathNotifications> => {
  const response = await axiosInstance.get(DEATH_NOTIFICATION_API_ENDPOINTS.DEATH_NOTIFICATIONS, {
    params,
    signal,
  });
  return response.data as PaginatedDeathNotifications;
};

export const fetchDeathNotificationById = async (id: string): Promise<DeathNotificationItem> => {
  const response = await axiosInstance.get(DEATH_NOTIFICATION_API_ENDPOINTS.DEATH_NOTIFICATION_DETAIL(id));
  return response.data as DeathNotificationItem;
};

export const createDeathNotification = async (payload: Partial<DeathNotificationItem>) => {
  const response = await axiosInstance.post(DEATH_NOTIFICATION_API_ENDPOINTS.DEATH_NOTIFICATIONS, payload);
  return response.data;
};

export const updateDeathNotification = async (id: string, payload: Partial<DeathNotificationItem>) => {
  const response = await axiosInstance.patch(DEATH_NOTIFICATION_API_ENDPOINTS.DEATH_NOTIFICATION_DETAIL(id), payload);
  return response.data;
};

export const deleteDeathNotification = async (id: string) => {
  const response = await axiosInstance.delete(DEATH_NOTIFICATION_API_ENDPOINTS.DEATH_NOTIFICATION_DETAIL(id));
  return response.data;
};

export default {
  DEATH_NOTIFICATION_API_ENDPOINTS,
  fetchDeathNotifications,
  fetchDeathNotificationById,
  createDeathNotification,
  updateDeathNotification,
  deleteDeathNotification,
};

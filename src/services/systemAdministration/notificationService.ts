import axiosInstance from '../axiosInstance';

export const NOTIFICATION_API_ENDPOINTS = {
  NOTIFICATIONS: '/system-administration/notifications/',
  NOTIFICATION_DETAIL: (id: string) => `/system-administration/notifications/${id}/`,
};

export interface NotificationTemplate {
  id: string;
  system_module_name?: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string;
  notification_date?: string;
  notification_time?: string;
  notification_status?: 'sent' | 'pending' | 'failed';
  notification_method?: 'sms' | 'email' | 'push';
  subject: string;
  body: string;
  url?: string;
  is_read?: boolean;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  prisoner?: string;
  system_module?: string;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationTemplate[];
}

// Fetch paginated notifications
export const fetchNotifications = async (
  params: Record<string, any> = {},
  signal?: AbortSignal
): Promise<PaginatedNotifications> => {
  const response = await axiosInstance.get(NOTIFICATION_API_ENDPOINTS.NOTIFICATIONS, {
    params,
    signal,
  });
  return response.data as PaginatedNotifications;
};

// Fetch for SearchableSelect dropdown (server-side pagination)
export const fetchNotificationsPaginated = async (
  page: number = 1,
  pageSize: number = 50,
  search: string = '',
  signal?: AbortSignal
): Promise<{ items: NotificationTemplate[]; count: number; next: string | null }> => {
  try {
    const response = await axiosInstance.get(NOTIFICATION_API_ENDPOINTS.NOTIFICATIONS, {
      params: {
        page,
        page_size: pageSize,
        search,
      },
      signal,
    });
    return {
      items: response.data.results || [],
      count: response.data.count || 0,
      next: response.data.next || null,
    };
  } catch (error: any) {
    if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
      return { items: [], count: 0, next: null };
    }
    throw error;
  }
};

export const fetchNotificationById = async (id: string): Promise<NotificationTemplate> => {
  const response = await axiosInstance.get(NOTIFICATION_API_ENDPOINTS.NOTIFICATION_DETAIL(id));
  return response.data as NotificationTemplate;
};

export const createNotification = async (payload: Partial<NotificationTemplate>) => {
  const response = await axiosInstance.post(NOTIFICATION_API_ENDPOINTS.NOTIFICATIONS, payload);
  return response.data;
};

export const updateNotification = async (id: string, payload: Partial<NotificationTemplate>) => {
  const response = await axiosInstance.patch(NOTIFICATION_API_ENDPOINTS.NOTIFICATION_DETAIL(id), payload);
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await axiosInstance.delete(NOTIFICATION_API_ENDPOINTS.NOTIFICATION_DETAIL(id));
  return response.data;
};

export default {
  NOTIFICATION_API_ENDPOINTS,
  fetchNotifications,
  fetchNotificationsPaginated,
  fetchNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};

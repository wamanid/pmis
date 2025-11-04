import axiosInstance from './axiosInstance';
import { ApiMenuItem, MenuResponse } from '../models/common/menu';

export type { ApiMenuItem, MenuResponse };

/**
 * Fetch menu items from backend
 */
export const fetchMenus = async (): Promise<MenuResponse> => {
  const response = await axiosInstance.get<MenuResponse>('/system-administration/menus/');
  return response.data;
};

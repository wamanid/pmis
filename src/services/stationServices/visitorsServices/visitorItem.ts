import axiosInstance from "../../axiosInstance";
import {IdTypeResponse, StationVisitor, Visitor, VisitorResponse} from "./VisitorsService";

// API Endpoints for Visitor Items and Property Management
export const VISITOR_ITEM_API_ENDPOINTS = {
  VISITOR_ITEMS: '/gate-management/visitor-items/',
  STATION_VISITORS: '/gate-management/station-visitors/',
  ITEM_CATEGORIES: '/system-administration/item-categories/',
  ITEM_STATUSES: '/system-administration/item-statuses/',
  UNITS: '/system-administration/measurement-units/',
  ITEMS: '/system-administration/items/',
  CURRENCIES: '/system-administration/currencies/',
} as const;

export interface Item {
  is_active: boolean;
  deleted_datetime: string | null;
  quantity: number;
  currency: string;
  amount: string;
  bag_no: string;
  photo: string;
  remarks: string;
  is_collected: boolean;
  for_prisoner: boolean;
  deleted_by: number | null;
  visitor: string;
  item_category: string;
  item: string;
  measurement_unit: string;
  item_status: string;
}

export interface VisitorItem {
  id: string;
  visitor_name: string;
  item_name: string;
  category_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  quantity: number;
  currency: string;
  currency_name?: string;
  currency_symbol?: string;
  amount: string;
  bag_no: string;
  is_allowed: boolean;
  photo: string;
  remarks: string;
  is_collected: boolean;
  for_prisoner: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  visitor: string;
  item_category: string;
  item: string;
  measurement_unit: string;
  measurement_unit_name: string;
  item_status: string;
  item_status_name?: string;
}

export interface VisitorItems {
  count: number;
  next: string | null;
  previous: string | null;
  results: VisitorItem[];
}

export interface ItemCategory {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  name: string;
  is_cash: boolean;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface ItemCategories {
  count: number;
  next: string | null;
  previous: string | null;
  results: ItemCategory[];
}

export interface ItemStatus {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface ItemStatuses {
  count: number;
  next: string | null;
  previous: string | null;
  results: ItemStatus[];
}

export interface Unit {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface MeasurementUnit {
  count: number;
  next: string | null;
  previous: string | null;
  results: Unit[];
}

export interface StationItem {
  id: string;
  station_name: string;
  category_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  name: string;
  max_quantity: number;
  is_allowed: boolean;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  station: string;
  category: string;
}

export interface StationItems {
  count: number;
  next: string | null;
  previous: string | null;
  results: StationItem[];
}

export interface ErrorResponse {
  error: string;
}

export type VisitorItemResponse = VisitorItem | ErrorResponse;
export type ItemCategoriesResponse = ItemCategories | ErrorResponse;
export type ItemStatusesResponse = ItemStatuses | ErrorResponse;
export type MeasurementUnitResponse = MeasurementUnit | ErrorResponse;
export type StationItemsResponse = StationItems | ErrorResponse;
export type VisitorItemsResponse = VisitorItems | ErrorResponse;

export const addVisitorItem = async (item: Item) : Promise<VisitorItemResponse> => {
  const response = await axiosInstance.post<VisitorItemResponse>(VISITOR_ITEM_API_ENDPOINTS.VISITOR_ITEMS, item);
  return response.data;
}

export const updateVisitorItem = async (item: Item, id: string) : Promise<VisitorItemResponse> => {
  const response = await axiosInstance.put<VisitorItemResponse>(`${VISITOR_ITEM_API_ENDPOINTS.VISITOR_ITEMS}${id}/`, item);
  return response.data;
}

    export const fetchVisitorItem = async (id: string, signal?: AbortSignal) : Promise<VisitorItemResponse> => {
      const response = await axiosInstance.get<VisitorItemResponse>(`${VISITOR_ITEM_API_ENDPOINTS.VISITOR_ITEMS}${id}/`, { signal });
      return response.data;
    }

    export const getVisitorItems = async () : Promise<VisitorItemsResponse> => {
      const response = await axiosInstance.get<VisitorItemsResponse>(VISITOR_ITEM_API_ENDPOINTS.VISITOR_ITEMS);
      return response.data;
    }

    export const getVisitorItems2 = async (visitorId: string) : Promise<VisitorItemsResponse> => {
      const response = await axiosInstance.get<VisitorItemsResponse>(VISITOR_ITEM_API_ENDPOINTS.VISITOR_ITEMS, {
    params: {
      visitor: visitorId
    }
  });
  return response.data;
}

// Paginated fetch for SearchableSelect dropdown (server-side pagination)
export const fetchVisitorItemsPaginated = async (page: number = 1, search: string = '', visitorId?: string, isCollected?: boolean) => {
  const response = await axiosInstance.get(VISITOR_ITEM_API_ENDPOINTS.VISITOR_ITEMS, {
    params: {
      page,
      search,
      visitor: visitorId || undefined,
      ...(isCollected !== undefined && { is_collected: isCollected }),
      page_size: 50
    }
  });
  return response.data;
}

export const deleteVisitorItem = async (id: string) : Promise<{ message: string } | { error: string }> => {
  try {
    await axiosInstance.delete(`${VISITOR_ITEM_API_ENDPOINTS.VISITOR_ITEMS}${id}/`);

    return { message: "Visitor team deleted successfully" }

  } catch (error: any) {
    return {
      error: "Failed to delete visitor item."
    };
  }
}

export const getItemCategories = async () : Promise<ItemCategoriesResponse> => {
  const response = await axiosInstance.get<ItemCategoriesResponse>(VISITOR_ITEM_API_ENDPOINTS.ITEM_CATEGORIES);
  return response.data;
}

export const getItemStatuses = async () : Promise<ItemStatusesResponse> => {
  const response = await axiosInstance.get<ItemStatusesResponse>(VISITOR_ITEM_API_ENDPOINTS.ITEM_STATUSES);
  return response.data;
}

export const getUnits = async () : Promise<MeasurementUnitResponse> => {
  const response = await axiosInstance.get<MeasurementUnitResponse>(VISITOR_ITEM_API_ENDPOINTS.UNITS);
  return response.data;
}

export const getStationItems = async () : Promise<StationItemsResponse> => {
  const response = await axiosInstance.get<StationItemsResponse>(VISITOR_ITEM_API_ENDPOINTS.ITEMS);
  return response.data;
}
import axiosInstance from "../../axiosInstance";
import {IdTypeResponse, StationVisitor, Visitor, VisitorResponse} from "./VisitorsService";

export interface Item {
  is_active: boolean;
  deleted_datetime: string;
  quantity: number;
  currency: string;
  amount: string;
  bag_no: string;
  photo: string;
  remarks: string;
  is_collected: boolean;
  for_prisoner: boolean;
  deleted_by: number;
  visitor: string;
  item_category: string;
  item: string;
  measurement_unit: string;
  item_status: string;
  is_allowed: boolean;
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
  item_status: string;
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
  const response = await axiosInstance.post<VisitorItemResponse>('/gate-management/visitor-items/', item);
  return response.data;
}

export const getVisitorItems = async () : Promise<VisitorItemsResponse> => {
  const response = await axiosInstance.get<VisitorItemsResponse>('/gate-management/visitor-items/');
  return response.data;
}

export const getItemCategories = async () : Promise<ItemCategoriesResponse> => {
  const response = await axiosInstance.get<ItemCategoriesResponse>('/system-administration/item-categories/');
  return response.data;
}

export const getItemStatuses = async () : Promise<ItemStatusesResponse> => {
  const response = await axiosInstance.get<ItemStatusesResponse>('/system-administration/item-statuses/');
  return response.data;
}

export const getUnits = async () : Promise<MeasurementUnitResponse> => {
  const response = await axiosInstance.get<MeasurementUnitResponse>('/system-administration/measurement-units/');
  return response.data;
}

export const getStationItems = async () : Promise<StationItemsResponse> => {
  const response = await axiosInstance.get<StationItemsResponse>('/system-administration/items/');
  return response.data;
}
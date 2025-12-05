import {ErrorResponse} from "./visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";
import {WardsResponse} from "./housingService";
import {Paginated} from "./utils";
import {Unit} from "./visitorsServices/visitorItem";

export interface DefaultPropertyItem {
  id: string;
  property_type: string;
  property_category: string;
  property_item: string;
  measurement_unit: string;
  property_bag: string;
  next_of_kin: string;
  property_status: string;
  quantity: string;
  amount: string;
  note: string;
  destination: string;
  visitor_item: string;
}

export interface Property {
  is_active: boolean;
  deleted_datetime: string | null;
  quantity: string;
  amount: string;
  biometric_consent: boolean;
  note: string;
  destination: string;
  deleted_by: number | null;
  prisoner: string;
  property_type: string;
  property_item: string;
  measurement_unit: string;
  property_bag: string;
  next_of_kin: string;
  visitor: string;
  visitor_item: string;
  property_status: string;
}

export interface PrisonerProperty {
  id: string;
  prisoner_name: string;
  property_type_name: string;
  property_item_name: string;
  measurement_unit_name: string;
  property_bag_number: string;
  property_status_name: string;
  next_of_kin_name: string;
  visitor_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  quantity: string;
  amount: string;
  biometric_consent: boolean;
  note: string;
  destination: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  property_type: string;
  property_item: string;
  measurement_unit: string;
  property_bag: string;
  next_of_kin: string;
  visitor: string;
  visitor_item: string;
  property_status: string;
}

export interface PropertyItem {
  id: string;
  property_category_name: string;
  station_name: string;
  status_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  name: string;
  description: string;
  price: string;
  is_money: boolean;
  remark: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  station: string;
  property_category: string;
  status: string;
}

export interface PropertyBag {
  id: string;
  prisoner_name: string;
  property_category_name: string;
  shelf_number: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  bag_number: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  station: string;
  property_category: string;
  shelf: string;
}

export type PropertyResponse = PrisonerProperty | ErrorResponse;
export type PropertiesResponse<T> = Paginated<T> | ErrorResponse
export type PropertyTypesResponse<T> = Paginated<T> | ErrorResponse
export type PropertyItemsResponse<T> = Paginated<T> | ErrorResponse
export type PropertyBagsResponse<T> = Paginated<T> | ErrorResponse
export type PropertyStatusResponse<T> = Paginated<T> | ErrorResponse

export const addProperty = async (property: Property) : Promise<PropertyResponse> => {
  const response = await axiosInstance.post<PropertyResponse>('/property-management/properties/', property);
  return response.data;
}

export const deleteProperty = async (id: string) : Promise<{ message: string } | { error: string }> => {
  try {
    await axiosInstance.delete(`/property-management/properties/${id}/`);

    return { message: "Property deleted successfully" }

  } catch (error: any) {
    return {
      error: "Failed to delete property."
    };
  }
}

export const getProperties = async <T = PrisonerProperty>() : Promise<PropertiesResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/property-management/properties/');
  return response.data;
}

export const getPropertyTypes = async <T = Unit>() : Promise<PropertyTypesResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/property-management/types/');
  return response.data;
}

export const getPropertyItems = async <T = PropertyItem>(property_category: string) : Promise<PropertyItemsResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/property-management/items/', {
    params: {
      property_category
    }
  });
  return response.data;
}

export const getPropertyBags = async <T = PropertyBag>(prisoner: string, property_category: string) : Promise<PropertyBagsResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/property-management/bags/', {
    params: {
      prisoner,
      property_category
    }
  });
  return response.data;
}

export const getPropertyStatuses = async <T = Unit>() : Promise<PropertyStatusResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/property-management/statuses/');
  return response.data;
}

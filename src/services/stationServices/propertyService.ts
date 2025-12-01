import {ErrorResponse} from "./visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";
import {WardsResponse} from "./housingService";
import {Paginated} from "./utils";

export interface Property {
  is_active: boolean;
  deleted_datetime: string | null;
  quantity: string;
  amount: string;
  biometric_consent: boolean;
  note: string;
  destination: string;
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

export type PropertyResponse = PrisonerProperty | ErrorResponse;
export type PropertiesResponse<T> = Paginated<T> | ErrorResponse

export const addProperty = async (property: Property) : Promise<PropertyResponse> => {
  const response = await axiosInstance.post<PropertyResponse>('/property-management/properties/', property);
  return response.data;
}

export const getProperties = async <T = PrisonerProperty>() : Promise<PropertiesResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/property-management/properties/');
  return response.data;
}

import {Paginated} from "../stationServices/utils";
import {ErrorResponse} from "../stationServices/visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";
import {Unit} from "../stationServices/visitorsServices/visitorItem";

// DisCharge

export interface DischargeType {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  affects_lockup: boolean;
  on_premise: boolean;
  description: string;
  is_execution: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
}

export interface PrisonerDischarge {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  discharge_type_name: string;
  discharge_reason_name: string;
  request_number: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  discharge_number: string;
  discharge_datetime: string;
  remarks: string;
  intended_place_of_stay: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  request: string;
  prisoner: string;
  discharge_type: string;
  discharge_reason: string;
}

export type TypesResponse<T> = Paginated<T> | ErrorResponse
export type ReasonsResponse<T> = Paginated<T> | ErrorResponse
export type PrisonerDischargeResponse<T> = Paginated<T> | ErrorResponse

export const getTypes = async <T = DischargeType>() : Promise<TypesResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/discharge-management/types/');
  return response.data;
}

export const getReasons = async <T = Unit>() : Promise<ReasonsResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/discharge-management/reasons/');
  return response.data;
}

export const getDischarges = async <T = PrisonerDischarge>() : Promise<PrisonerDischargeResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/discharge-management/discharges/');
  return response.data;
}

// Discharge Request

export interface DischargeRequest {
  id: string;
  in_charge_name: string;
  in_charge_force_number: string;
  in_charge_rank: string;
  officer_in_charge_name: string;
  officer_in_charge_force_number: string;
  officer_in_charge_rank: string;
  discharges: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  request_number: string;
  comment: string;
  in_charge_approved: boolean;
  in_charge_remark: string;
  officer_in_charge_approved: boolean;
  officer_in_charge_remark: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  in_charge: string;
  officer_in_charge: string;
}

export type RequestResponse<T> = Paginated<T> | ErrorResponse

export const getRequests = async <T = DischargeRequest>() : Promise<RequestResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/discharge-management/requests/');
  return response.data;
}
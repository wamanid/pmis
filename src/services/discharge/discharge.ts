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

// Subsistence Allowance
export interface Allowance {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  allowance_amount: string;
  creditor_details: string;
  disposal_date: string;
  remarks: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  prisoner: string;
}

export interface SubsistenceAllowance {
  is_active: boolean;
  deleted_datetime: string | null;
  allowance_amount: string;
  creditor_details: string;
  disposal_date: string;
  remarks: string;
  deleted_by: number | null;
  prisoner: string;
}


export type AllowanceResponse<T> = Paginated<T> | ErrorResponse
export type SubsistenceAllowanceResponse = Allowance | ErrorResponse

export const getAllowances = async <T = Allowance>() : Promise<AllowanceResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/discharge-management/subsistence-allowances/');
  return response.data;
}

export const addAllowance = async (allowance: SubsistenceAllowance) : Promise<SubsistenceAllowanceResponse> => {
  const response = await axiosInstance.post('/discharge-management/subsistence-allowances/', allowance);
  return response.data;
}

export const updateAllowance = async (allowance: SubsistenceAllowance, id: string) : Promise<SubsistenceAllowanceResponse> => {
  const response = await axiosInstance.put(`/discharge-management/subsistence-allowances/${id}/`, allowance);
  return response.data;
}

export const deleteAllowance = async (id: string) : Promise<{ message: string } | { error: string }> => {
  try {
    await axiosInstance.delete(`/discharge-management/subsistence-allowances/${id}/`);

    return { message: "subsistence allowance deleted successfully" }

  } catch (error: any) {
    return {
      error: "Failed to delete subsistence allowance."
    };
  }
}

// Suspended sentences

export interface SuspendedSentence {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  court_name: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  discharge_number: string;
  discharge_datetime: string;
  remarks: string;
  intended_place_of_stay: string;
  duration_of_suspension: number;
  conditions_for_suspension: string;
  conviction_date: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  request: string;
  prisoner: string;
  discharge_type: string;
  discharge_reason: string;
  court_details: string;
}

export interface Sentence {
  discharge_datetime: string;
  conviction_date: string;
  duration_of_suspension: number;
  conditions_for_suspension: string;
  intended_place_of_stay: string;
  remarks: string;
  request: string;
  prisoner: string;
  discharge_type: string;
  discharge_reason: string;
  court_details: string;
}

export interface Court {
  id: string;
  level_name: string;
  district_name: string;
  jurisdiction_area_name: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  name: string;
  court_code: string;
  date_of_opening: string;
  physical_address: string;
  postal_address: string;
  gps_location: string;
  phone_number: string;
  fax_number: string;
  email_address: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  level: string;
  district: string;
  jurisdiction_area: string;
}


export type SuspendedSentenceResponse<T> = Paginated<T> | ErrorResponse
export type CourtResponse<T> = Paginated<T> | ErrorResponse
export type SentenceResponse = SuspendedSentence | ErrorResponse

export const getSuspendedSentences = async <T = SuspendedSentence>() : Promise<SuspendedSentenceResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/discharge-management/suspended-sentences/');
  return response.data;
}

export const addSentence = async (sentence: Sentence) : Promise<SentenceResponse> => {
  const response = await axiosInstance.post('/discharge-management/suspended-sentences/', sentence);
  return response.data;
}

export const updateSentences = async (sentence: Sentence, id: string) : Promise<SentenceResponse> => {
  const response = await axiosInstance.put(`/discharge-management/suspended-sentences/${id}/`, sentence);
  return response.data;
}

export const getCourts = async <T = Court>() : Promise<CourtResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/system-administration/court-details/');
  return response.data;
}

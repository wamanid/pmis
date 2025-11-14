import axiosInstance from "../axiosInstance";
import {
  ErrorResponse,
  StaffDeployment,
  StaffDeploymentResp,
  StaffProfile,
  StaffResponse
} from "./staffDeploymentIntegration";

export interface StationVisitor {
  is_active: boolean;
  deleted_datetime: string;
  visitation_datetime: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  organisation: string;
  id_number: string;
  contact_no: string;
  remarks: string;
  vehicle_no: string;
  time_in: string;
  time_out: string;
  reason_of_visitation: string;
  address: string;
  place_visited: string;
  blacklist_reason: string;
  photo: string;
  deleted_by: number;
  visit_location: string;
  prisoner: string;
  visitor_type: string;
  relation: string;
  visitor_status: string;
  id_type: string;
  gate: string;
  gate_keeper: string;
}

export interface Visitor {
  id: string; 
  prisoner_name: string;
  gate_name: string;
  visit_location_name: string;
  visitor_type_name: string;
  visitor_status_name: string;
  relation_name: string;
  id_type_name: string;
  gate_keeper_name: string;
  created_datetime: string; 
  updated_datetime: string; 
  deleted_datetime: string; 
  visitation_datetime: string; 
  is_active: boolean;
  first_name: string;
  middle_name: string;
  last_name: string;
  organisation: string;
  id_number: string;
  contact_no: string;
  remarks: string;
  vehicle_no: string;
  time_in: string; 
  time_out: string; 
  reason_of_visitation: string;
  address: string;
  place_visited: string;
  blacklist_reason: string;
  photo: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  visit_location: string; 
  prisoner: string; 
  visitor_type: string; 
  relation: string; 
  visitor_status: string; 
  id_type: string; 
  gate: string; 
  gate_keeper: string; 
}

export interface IdType {
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

export interface IdTypes {
  count: number;
  next: string | null;
  previous: string | null;
  results: IdType[];
}

export interface ErrorResponse {
  error: string;
}

export type VisitorResponse = Visitor | ErrorResponse;
export type IdTypeResponse = IdTypes | ErrorResponse;

export const addStationVisitor = async (visitor: StationVisitor) : Promise<VisitorResponse> => {
  const response = await axiosInstance.post<VisitorResponse>('/gate-management/api/station-visitors/', visitor);
  return response.data;
}

export const getIdTypes = async () : Promise<IdTypeResponse> => {
  const response = await axiosInstance.get<IdTypeResponse>('/system-administration/id-types/');
  return response.data;
}

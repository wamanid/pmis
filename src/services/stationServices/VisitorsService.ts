import axiosInstance from "../axiosInstance";

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

export interface GateItem {
  id: string;
  station_name: string;
  gate_type_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  station: string;
  gate_type: string;
}

export interface Gate {
  count: number;
  next: string | null;
  previous: string | null;
  results: GateItem[];
}

export interface CreatedByDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface PrisonerItem {
  id: string;
  prisoner_number: string;
  prisoner_number_value: string;
  prisoner_personal_number: string;
  prisoner_personal_number_value: string;
  first_name: string;
  last_name: string;
  full_name: string;
  current_station: string;
  current_station_name: string;
  is_active: boolean;
  created_datetime: string;
  created_by: number;
  created_by_details: CreatedByDetails;
  updated_datetime: string;
  updated_by: number;
}

export interface Prisoner {
  count: number;
  next: string | null;
  previous: string | null;
  results: PrisonerItem[];
}

export interface VisitorType {
  count: number;
  next: string | null;
  previous: string | null;
  results: VisitorTypeItem[];
}

export interface VisitorTypeItem {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null; // can be null depending on API
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface RelationShipItem {
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

export interface Relationship {
  count: number;
  next: string | null;
  previous: string | null;
  results: RelationShipItem[];
}

export interface VisitorStatusItem {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null; // often nullable
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface VisitorStatus {
  count: number;
  next: string | null;
  previous: string | null;
  results: VisitorStatusItem[];
}

export interface VisitorGet {
  count: number;
  next: string | null;
  previous: string | null;
  results: Visitor[];
}


export interface ErrorResponse {
  error: string;
}

export type VisitorResponse = Visitor | ErrorResponse;
export type VisitorGetResponse = VisitorGet | ErrorResponse;
export type IdTypeResponse = IdTypes | ErrorResponse;
export type GateResponse = Gate | ErrorResponse;
export type PrisonerResponse = Prisoner | ErrorResponse;
export type VisitorTypeResponse = VisitorType | ErrorResponse;
export type RelationshipResponse = Relationship | ErrorResponse;
export type VisitorStatusResponse = VisitorStatus | ErrorResponse;

export const addStationVisitor = async (visitor: StationVisitor) : Promise<VisitorResponse> => {
  const response = await axiosInstance.post<VisitorResponse>('/gate-management/station-visitors/', visitor);
  return response.data;
}

export const getStationVisitors = async () : Promise<VisitorGetResponse> => {
  const response = await axiosInstance.get<VisitorGetResponse>('/gate-management/station-visitors/');
  return response.data;
}

export const updateStationVisitor = async (visitor: StationVisitor, id: string) : Promise<VisitorResponse> => {
  const response = await axiosInstance.put<VisitorResponse>(`/gate-management/station-visitors/${id}/`, visitor);
  return response.data;
}

export const getIdTypes = async () : Promise<IdTypeResponse> => {
  const response = await axiosInstance.get<IdTypeResponse>('/system-administration/id-types/');
  return response.data;
}

export const getGates= async () : Promise<GateResponse> => {
  const response = await axiosInstance.get<GateResponse>('/system-administration/gates/');
  return response.data;
}

export const getPrisoners= async () : Promise<PrisonerResponse> => {
  const response = await axiosInstance.get<PrisonerResponse>('/admission/prisoners/');
  return response.data;
}

export const getVisitorTypes= async () : Promise<VisitorTypeResponse> => {
  const response = await axiosInstance.get<VisitorTypeResponse>('/system-administration/visitor-types/');
  return response.data;
}

export const getRelationships= async () : Promise<RelationshipResponse> => {
  const response = await axiosInstance.get<RelationshipResponse>('/system-administration/relationships/');
  return response.data;
}

export const getVisitorStatus= async () : Promise<VisitorStatusResponse> => {
  const response = await axiosInstance.get<VisitorStatusResponse  >('/gate-management/visitor-statuses/');
  return response.data;
}

import axiosInstance from "../axiosInstance";

export interface StaffItem {
  id: string;
  rank_name: string;
  station_name: string;
  gender_name: string;
  supervisor_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  section: string;
  date_of_birth: string;
  division: string;
  department: string;
  directorate: string;
  force_number: string;
  appointment: string;
  senior: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  gender: string;
  rank: string;
  station: string;
  supervisor: string;
}

export interface StaffProfile {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffItem[];
}

export interface StaffDeployment {
  is_active: boolean;
  start_date: string;
  end_date: string;
  station: string;
  profile: string;
}

export interface StaffDeploymentResponse {
  id: string;
  station_name: string;
  created_by_name: string;
  full_name: string;
  force_number: string;
  profile_rank: string;
  age_at_deployment: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  date_of_birth: string;
  rank: string;
  start_date: string;
  end_date: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  station: string;
  profile: string;
}

export interface StaffDeploymentList {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffDeploymentResponse[];
}

export interface ErrorResponse {
  error: string;
}

export type StaffResponse = StaffProfile | ErrorResponse;
export type StaffDeploymentResp = StaffDeploymentResponse | ErrorResponse;
export type StaffDeploymentRespList = StaffDeploymentList | ErrorResponse;

export const getStaffProfile = async () : Promise<StaffResponse> => {
  const response = await axiosInstance.get<StaffResponse>('/auth/staff-profiles/');
  return response.data;
}

export const addStaffDeployment = async (deployment: StaffDeployment) : Promise<StaffDeploymentResp> => {
  const response = await axiosInstance.post<StaffDeploymentResp>('/station-management/api/staff-deployments/', deployment);
  return response.data;
}

export const getStaffDeployment = async () : Promise<StaffDeploymentRespList> => {
  const response = await axiosInstance.get<StaffDeploymentRespList>('/station-management/api/staff-deployments/');
  return response.data;
}
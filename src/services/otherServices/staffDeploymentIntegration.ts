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

export interface ErrorResponse {
  error: string;
}

export type StaffResponse = StaffProfile | ErrorResponse;

export const getStaffProfile = async () : Promise<StaffResponse> => {
  const response = await axiosInstance.get<StaffResponse>('/auth/staff-profiles/');
  return response.data;
}
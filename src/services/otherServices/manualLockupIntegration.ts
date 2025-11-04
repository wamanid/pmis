import axiosInstance from '../axiosInstance';

export interface AddLockUp {
  is_active: boolean;
  date: string;
  lockup_time: string;
  location: string;
  count: number;
  station: string;
  type: string;
  prisoner_category: string;
  sex: string;
}

export interface LockupRecordResponse {
  id?: string;
  error?: string;
  station_name?: string;
  type_name?: string;
  prisoner_category_name?: string;
  sex_name?: string;
  created_by_name?: string;
  created_datetime?: string;
  is_active?: boolean;
  updated_datetime?: string;
  deleted_datetime?: string;
  date?: string;
  lockup_time?: string;
  location?: string;
  count?: number;
  created_by?: number;
  updated_by?: number;
  deleted_by?: number;
  station?: string;
  type?: string;
  prisoner_category?: string;
  sex?: string;
}

export interface Item {
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

export interface StationItem {
  id: string;
  district_name: string;
  region_name: string;
  security_level_name: string;
  category_name: string;
  station_type_name: string;
  gender_name: string;
  jurisdiction_area_name: string;
  capacity: string;
  occupancy: string;
  congestion: string;
  is_overcrowded: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string;
  name: string;
  station_code: string;
  manual_capacity: number;
  date_opened: string;
  physical_address: string;
  postal_address: string;
  gps_location: string;
  phone_number: string;
  fax_number: string;
  email: string;
  alternate_email: string;
  pmis_available: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  district: string;
  region: string;
  security_level: string;
  category: string;
  station_type: string;
  jurisdiction_area: string;
  gender: string;
}

export interface LockTypeItem {
  id: string;
  created_by_name: string;
  created_datetime: string; // ISO timestamp
  is_active: boolean;
  updated_datetime: string; // ISO timestamp
  deleted_datetime: string; // ISO timestamp
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}


export interface StationInformation {
  count: number;
  next: string | null;
  previous: string | null;
  results: Item[];
}

export interface Station {
  count: number;
  next: string | null;
  previous: string | null;
  results: StationItem[];
}

export interface LockType {
  count: number;
  next: string | null;
  previous: string | null;
  results: LockTypeItem[];
}

export interface ErrorResponse {
  error: string;
}

export type StationInformationResponse = StationInformation | ErrorResponse;
export type StationResponse = Station | ErrorResponse;
export type LockTypeResponse = LockType | ErrorResponse;

export const addLockUpRecord = async (lockup: AddLockUp): Promise<LockupRecordResponse> => {
  const response = await axiosInstance.post<LockupRecordResponse>('/station-management/api/manual-lockups/', lockup);
  return response.data;
};

export const getSexes = async () : Promise<StationInformationResponse> => {
  const response = await axiosInstance.get<StationInformationResponse>('/system-administration/sexes/');
  return response.data;
}

export const getPrisonerCategories = async () : Promise<StationInformationResponse> => {
  const response = await axiosInstance.get<StationInformationResponse>('/system-administration/prisoner-categories/');
  return response.data;
}

export const getStation = async () : Promise<StationResponse> => {
  const response = await axiosInstance.get<StationResponse>('/system-administration/stations/');
  return response.data;
}

export const getLockType = async () : Promise<LockTypeResponse> => {
  const response = await axiosInstance.get<LockTypeResponse>('/station-management/api/lockup-types/');
  return response.data;
}



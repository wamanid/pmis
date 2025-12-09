import {Paginated} from "../stationServices/utils";
import {ErrorResponse, IdTypeResponse} from "../stationServices/visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";

export interface Region {
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

export interface District {
  id: string;
  region_name: string;
  region: Region;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface County {
  id: string;
  district_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  district: string;
}

export interface SubCounty {
  id: string;
  county_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  county: string;
}

export interface Parish {
  id: string;
  sub_county_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  sub_county: string;
}

export interface Village {
  id: string;
  parish_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  parish: string;
}

export interface NextOfKin {
  is_active: boolean;
  deleted_datetime: string;
  first_name: string;
  middle_name: string;
  surname: string;
  phone_number: string;
  alternate_phone_number: string;
  id_number: string;
  lc1: string;
  discharge_property: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  relationship: string;
  sex: string;
  id_type: string;
  address_region: string;
  address_district: string;
  address_county: string;
  address_sub_county: string;
  address_parish: string;
  address_village: string;
}

export interface NextOfKinResponse {
  id: string;
  prisoner_name: string;
  relationship_name: string;
  sex_name: string;
  full_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  first_name: string;
  middle_name: string;
  surname: string;
  phone_number: string;
  alternate_phone_number: string;
  id_number: string;
  lc1: string;
  discharge_property: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  relationship: string;
  sex: string;
  id_type: string;
  address_region: string;
  address_district: string;
  address_county: string;
  address_sub_county: string;
  address_parish: string;
  address_village: string;
}

export type RegionsResponse<T> = Paginated<T> | ErrorResponse
export type DistrictsResponse<T> = Paginated<T> | ErrorResponse
export type CountyResponse<T> = Paginated<T> | ErrorResponse
export type SubCountyResponse<T> = Paginated<T> | ErrorResponse
export type ParishResponse<T> = Paginated<T> | ErrorResponse
export type VillageResponse<T> = Paginated<T> | ErrorResponse
export type NextResponse = NextOfKinResponse | ErrorResponse
export type NextResp<T> = Paginated<T> | ErrorResponse

export const addNextOfKin = async (next: NextOfKin) : Promise<NextResponse> => {
  const response = await axiosInstance.post<NextResponse>('/admission/next-of-kin/', next);
  return response.data;
}

export const getNextOfKins = async <T = NextOfKinResponse>(prisoner: string) : Promise<NextResp<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/admission/next-of-kin/', {
    params: {
      prisoner
    }
  });
  return response.data;
}

export const getRegions = async <T = Region>() : Promise<RegionsResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/system-administration/regions/');
  return response.data;
}

export const getDistricts = async <T = District>(region: string) : Promise<DistrictsResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/system-administration/districts/', {
      params: {
          region
      }
  });
  return response.data;
}

export const getCounties = async <T = County>(district: string) : Promise<CountyResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/system-administration/counties/', {
      params: {
          district
      }
  });
  return response.data;
}

export const getSubCounties = async <T = SubCounty>(county: string) : Promise<SubCountyResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/system-administration/sub-counties/', {
      params: {
          county
      }
  });
  return response.data;
}

export const getParishes = async <T = Parish>(sub_county: string) : Promise<ParishResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/system-administration/parishes/', {
      params: {
          sub_county
      }
  });
  return response.data;
}

export const getVillages = async <T = Village>(parish: string) : Promise<VillageResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/system-administration/villages/', {
      params: {
          parish
      }
  });
  return response.data;
}


/**
 * Station Model
 * Represents a prison station in the system
 */

export interface Station {
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
  deleted_datetime: string | null;
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
  deleted_by: number | null;
  district: string;
  region: string;
  security_level: string;
  category: string;
  station_type: string;
  jurisdiction_area: string;
  gender: string;
}

export interface StationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Station[];
}

export interface StationQueryParams {
  category?: string;
  district?: string;
  gender?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  region?: string;
  search?: string;
  security_level?: string;
  station_type?: string;
}

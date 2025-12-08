/**
 * Station Model
 * Represents a prison station in the system
 */

export interface District {
  id: string;
  name: string;
  description: string;
}

export interface Region {
  id: string;
  name: string;
  description: string;
}

export interface Station {
  id: string;
  district_name: string;
  region_name: string;
  security_level_name: string;
  category_name: string;
  station_type_name: string;
  gender_name?: string;
  jurisdiction_area_name: string;
  capacity: number;
  occupancy: number;
  congestion: number;
  is_overcrowded: boolean;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  station_code: string;
  manual_capacity: number;
  date_opened: string;
  physical_address: string | null;
  postal_address: string | null;
  gps_location: string | null;
  phone_number: string | null;
  fax_number: string | null;
  email: string | null;
  alternate_email: string | null;
  pmis_available: boolean;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  district: District;
  region: Region;
  security_level: string;
  category: string;
  station_type: string;
  jurisdiction_area: string;
  gender: string | null;
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

/**
 * Authentication and User models
 */

export interface StaffProfile {
  id: string;
  rank_name: string;
  station_name: string;
  gender_name: string;
  supervisor_name: string | null;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  section: string | null;
  division: string | null;
  department: string | null;
  directorate: string | null;
  force_number: string;
  appointment: string | null;
  senior: boolean;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  gender: string;
  rank: string;
  station: string;
  supervisor: string | null;
}

export interface UserProfile {
  staff_profile: string;
  staff_profile_details: StaffProfile;
  phone_number: string;
  phone_verified: boolean;
  email_verified: boolean;
  mfa_enabled: boolean;
  mfa_method: string;
  ldap_dn: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface LoginResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

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

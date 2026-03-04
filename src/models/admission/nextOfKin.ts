/**
 * Next of Kin Models
 * Represents next of kin information for prisoners
 */

export interface NextOfKin {
  id?: string;
  prisoner?: string;
  first_name?: string;
  middle_name?: string;
  surname?: string;
  relationship?: string;
  id_type?: string;
  id_number?: string;
  phone_number?: string;
  email?: string;
  address_region?: string;
  address_district?: string;
  address_county?: string;
  address_sub_county?: string;
  address_parish?: string;
  address_village?: string;
  is_active?: boolean;
  created_datetime?: string;
  updated_datetime?: string;
  created_by?: number;
  updated_by?: number;
}

export interface NextOfKinListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NextOfKin[];
}

export interface NextOfKinQueryParams {
  prisoner?: string;
  relationship?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

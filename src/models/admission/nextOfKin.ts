/**
 * Next of Kin model for prisoner admission
 */

export interface NextOfKin {
  id?: string;
  full_name?: string;
  first_name: string;
  middle_name?: string;
  surname: string;
  phone_number?: string;
  alternate_phone_number?: string;
  id_number?: string;
  lc1?: string;
  discharge_property?: boolean;
  relationship?: string;
  sex?: string;
  id_type?: string;
  address_region?: string;
  address_district?: string;
  address_county?: string;
  address_sub_county?: string;
  address_parish?: string;
  address_village?: string;
}

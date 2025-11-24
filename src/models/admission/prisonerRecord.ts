/**
 * Prisoner Record Model
 * Represents prisoner record information
 */

export interface PrisonerRecord {
  id: string;
  prisoner_name: string;
  prisoner_number_value: string;
  prisoner_personal_number_value: string;
  prison_station_name: string;
  prisoner_class_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  photo: string;
  escapee: boolean;
  armed_personnel: boolean;
  extremely_violent: boolean;
  life_or_death_imprisonment: boolean;
  lodger: boolean;
  previous_convictions_count: number;
  commital: boolean;
  date_of_commital: string | null;
  habitual: boolean;
  is_dangerous: boolean;
  is_recividist: boolean;
  prohibited_from_visitation: boolean;
  avg_security_rating: number;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  prisoner: string;
  prison_station: string;
  arrest_region: string | null;
  arrest_district: string | null;
  arrest_county: string | null;
  arrest_sub_county: string | null;
  arrest_parish: string | null;
  arrest_village: string | null;
  prisoner_class: string;
}

/**
 * Prisoner Record List Response
 */
export interface PrisonerRecordListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PrisonerRecord[];
}

/**
 * Prisoner Record Filters
 */
export interface PrisonerRecordFilters {
  page?: number;
  prisoner?: string;
  prison_station?: string;
  prisoner_class?: string;
  escapee?: boolean;
  armed_personnel?: boolean;
  extremely_violent?: boolean;
  life_or_death_imprisonment?: boolean;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

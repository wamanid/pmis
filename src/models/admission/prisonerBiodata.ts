/**
 * Prisoner Biodata Models
 * Represents detailed prisoner biographical data
 */

export interface PrisonerBiodata {
  id?: string;
  prisoner?: string;
  prisoner_number?: string;
  prisoner_personal_number?: string;
  is_active?: boolean;
  first_name?: string;
  middle_name?: string;
  surname?: string;
  photo?: string;
  date_of_birth?: string;
  employment_description?: string;
  employer?: string;
  also_known_as?: string;
  finger_print?: string;
  fathers_name?: string;
  mothers_name?: string;
  estimated_age_of_pregnancy?: number;
  id_number?: string;
  habitual_criminal?: boolean;
  height?: string;
  description?: string;
  marks?: string;
  date_of_admission?: string;
  deformity?: boolean;
  age_on_admission?: number;
  sex?: string;
  birth_region?: string;
  birth_district?: string;
  birth_county?: string;
  birth_sub_county?: string;
  birth_parish?: string;
  birth_village?: string;
  education_level?: string;
  employment_status?: string;
  tribe?: string;
  nationality?: string;
  marital_status?: string;
  address_region?: string;
  address_district?: string;
  address_county?: string;
  address_sub_county?: string;
  address_parish?: string;
  address_village?: string;
  status_of_women?: string;
  id_type?: string;
  permanent_region?: string;
  permanent_district?: string;
  permanent_county?: string;
  permanent_sub_county?: string;
  permanent_parish?: string;
  permanent_village?: string;
  arrest_region?: string;
  arrest_district?: string;
  arrest_county?: string;
  arrest_sub_county?: string;
  arrest_parish?: string;
  arrest_village?: string;
  continent?: string;
  district_of_origin?: string;
  country_of_origin?: string;
  religion?: string;
  highest_education?: string;
  build?: string;
  face?: string;
  eyes?: string;
  mouth?: string;
  speech?: string;
  teeth?: string;
  lips?: string;
  ears?: string;
  hair?: string;
  desired_district_of_release?: string;
  prisoner_class?: string;
  security_rating?: string;
  armed_personnel?: boolean;
  created_datetime?: string;
  updated_datetime?: string;
  created_by?: number;
  updated_by?: number;
}

export interface PrisonerBiodataListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PrisonerBiodata[];
}

export interface PrisonerBiodataFilters {
  prisoner?: string;
  habitual_criminal?: boolean;
  is_active?: boolean;
  marital_status?: string;
  nationality?: string;
  ordering?: string;
  page?: number;
  prisoner_class?: string;
  religion?: string;
  search?: string;
  sex?: string;
  tribe?: string;
}

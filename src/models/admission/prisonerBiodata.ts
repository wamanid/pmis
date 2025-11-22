/**
 * Prisoner Biodata Models
 * Represents detailed biodata information for a prisoner
 */

// Generic helper for simple lookup objects returned in nested biodata fields
export interface SimpleNamedObject {
  id: string;
  name: string;
  // Allow additional properties that may be present on specific lookups
  [key: string]: any;
}

export interface PrisonerBiodata {
  id: string;
  prisoner_personal_number_value: string;
  prisoner_number_value: string;
  sex_name: string;
  nationality_name: string;
  current_age_value: number;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  first_name: string;
  middle_name: string;
  surname: string;
  photo: string | null;
  date_of_birth: string;
  employment_description: string | null;
  employer: string | null;
  also_known_as: string | null;
  finger_print: string | null;
  fathers_name: string | null;
  mothers_name: string | null;
  estimated_age_of_pregnancy: number | null;
  id_number: string | null;
  habitual_criminal: boolean;
  height: string | null;
  description: string | null;
  marks: string | null;
  date_of_admission: string;
  deformity: boolean;
  age_on_admission: number;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  prisoner: string;

  // Expanded nested objects for foreign-key relationships
  sex: SimpleNamedObject;
  nationality: SimpleNamedObject | null;

  birth_region: SimpleNamedObject | null;
  birth_district: SimpleNamedObject | null;
  birth_county: SimpleNamedObject | null;
  birth_sub_county: SimpleNamedObject | null;
  birth_parish: SimpleNamedObject | null;
  birth_village: SimpleNamedObject | null;

  education_level: SimpleNamedObject | null;
  employment_status: SimpleNamedObject | null;
  tribe: SimpleNamedObject | null;
  marital_status: SimpleNamedObject | null;

  address_region: SimpleNamedObject | null;
  address_district: SimpleNamedObject | null;
  address_county: SimpleNamedObject | null;
  address_sub_county: SimpleNamedObject | null;
  address_parish: SimpleNamedObject | null;
  address_village: SimpleNamedObject | null;

  status_of_women: SimpleNamedObject | null;
  id_type: SimpleNamedObject | null;

  permanent_region: SimpleNamedObject | null;
  permanent_district: SimpleNamedObject | null;
  permanent_county: SimpleNamedObject | null;
  permanent_sub_county: SimpleNamedObject | null;
  permanent_parish: SimpleNamedObject | null;
  permanent_village: SimpleNamedObject | null;

  arrest_region: SimpleNamedObject | null;
  arrest_district: SimpleNamedObject | null;
  arrest_county: SimpleNamedObject | null;
  arrest_sub_county: SimpleNamedObject | null;
  arrest_parish: SimpleNamedObject | null;
  arrest_village: SimpleNamedObject | null;

  continent: SimpleNamedObject | null;
  district_of_origin: SimpleNamedObject | null;
  country_of_origin: SimpleNamedObject | null;
  religion: SimpleNamedObject | null;
  highest_education: SimpleNamedObject | null;

  build: SimpleNamedObject | null;
  face: SimpleNamedObject | null;
  eyes: SimpleNamedObject | null;
  mouth: SimpleNamedObject | null;
  speech: SimpleNamedObject | null;
  teeth: SimpleNamedObject | null;
  lips: SimpleNamedObject | null;
  ears: SimpleNamedObject | null;
  hair: SimpleNamedObject | null;

  desired_district_of_release: SimpleNamedObject | null;
  prisoner_class: SimpleNamedObject | null;
}

export interface PrisonerBiodataListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PrisonerBiodata[];
}

export interface PrisonerBiodataFilters {
  habitual_criminal?: boolean;
  is_active?: boolean;
  marital_status?: string;
  nationality?: string;
  ordering?: string;
  page?: number;
  prisoner?: string;
  prisoner_class?: string;
  religion?: string;
  search?: string;
  sex?: string;
  tribe?: string;
}

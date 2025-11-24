/**
 * Prisoner Models
 * Represents basic prisoner information
 */

export interface Prisoner {
  id: string;
  prisoner_number: string;
  prisoner_number_value: string;
  prisoner_personal_number: string;
  prisoner_personal_number_value: string;
  admission_status: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  current_station: string | null;
  current_station_name: string | null;
  is_active: boolean;
  created_datetime: string;
  created_by: number;
  created_by_details: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  updated_datetime: string;
  updated_by: number;
  avg_security_rating?: number;
  habitual?: boolean;
  is_dangerous?: boolean;
}

export interface PrisonerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Prisoner[];
}

export interface PrisonerFilters {
  is_active?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
}

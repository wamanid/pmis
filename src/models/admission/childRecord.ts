/**
 * Child Record Models
 * Represents child records for prisoners
 */

export interface ChildRecord {
  id?: string;
  prisoner?: string;
  first_name?: string;
  middle_name?: string;
  surname?: string;
  date_of_birth?: string;
  sex?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  is_active?: boolean;
  created_datetime?: string;
  updated_datetime?: string;
  created_by?: number;
  updated_by?: number;
}

export interface ChildRecordListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChildRecord[];
}

export interface ChildRecordQueryParams {
  prisoner?: string;
  sex?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

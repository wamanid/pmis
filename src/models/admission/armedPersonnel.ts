/**
 * Armed Personnel Models
 * Represents armed personnel information for prisoners
 */

export interface ArmedPersonnel {
  id?: string;
  prisoner?: string;
  armed_force?: string;
  armed_forces_status?: string;
  force_number?: string;
  unit?: string;
  division?: string;
  station?: string;
  rank?: string;
  is_active?: boolean;
  created_datetime?: string;
  updated_datetime?: string;
  created_by?: number;
  updated_by?: number;
}

export interface ArmedPersonnelListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ArmedPersonnel[];
}

export interface ArmedPersonnelQueryParams {
  prisoner?: string;
  armed_force?: string;
  armed_forces_status?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

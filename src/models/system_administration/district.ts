/**
 * District Model
 * Represents a district within a region in the system
 */

export interface District {
  id: string;
  region_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  region: string;
}

export interface DistrictListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: District[];
}

export interface DistrictQueryParams {
  is_active?: boolean;
  ordering?: string;
  page?: number;
  region?: string;
  search?: string;
}

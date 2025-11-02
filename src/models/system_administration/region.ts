/**
 * Region Model
 * Represents a geographical region in the system
 */

export interface Region {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
}

export interface RegionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Region[];
}

export interface RegionQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
}

/**
 * Parish Models
 * Models for parish data from system administration API
 */

/**
 * Parish model
 */
export interface Parish {
  id: string;
  sub_county_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  sub_county: string;
}

/**
 * Paginated parish list response
 */
export interface ParishListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Parish[];
}

/**
 * Parish list query parameters
 */
export interface ParishQueryParams {
  is_active?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
  sub_county?: string;
}

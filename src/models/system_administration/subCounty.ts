/**
 * Sub-County Models
 * Models for sub-county data from system administration API
 */

/**
 * Sub-County model
 */
export interface SubCounty {
  id: string;
  county_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  county: string;
}

/**
 * Paginated sub-county list response
 */
export interface SubCountyListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SubCounty[];
}

/**
 * Sub-County list query parameters
 */
export interface SubCountyQueryParams {
  county?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
}

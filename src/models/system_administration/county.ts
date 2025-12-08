/**
 * County Models
 * Models for county data from system administration API
 */

/**
 * County model
 */
export interface County {
  id: string;
  district_name: string;
  is_active: boolean;
  name: string;
  description: string;
  district: string;
}

/**
 * Paginated county list response
 */
export interface CountyListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: County[];
}

/**
 * County list query parameters
 */
export interface CountyQueryParams {
  district?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
}

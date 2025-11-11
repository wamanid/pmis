/**
 * Village Models
 * Models for village data from system administration API
 */

/**
 * Village model
 */
export interface Village {
  id: string;
  parish_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  parish: string;
}

/**
 * Paginated village list response
 */
export interface VillageListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Village[];
}

/**
 * Village list query parameters
 */
export interface VillageQueryParams {
  is_active?: boolean;
  ordering?: string;
  page?: number;
  parish?: string;
  search?: string;
}

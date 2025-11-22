/**
 * Sex Models
 * Models for sex/gender data from system administration API
 */

/**
 * Sex model
 */
export interface Sex {
  id: string;
  is_active: boolean;
  name: string;
  description: string;
}

/**
 * Paginated sex list response
 */
export interface SexListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Sex[];
}

/**
 * Sex list query parameters
 */
export interface SexQueryParams {
  is_active?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
}

/**
 * Lip Model
 * Represents a lip type in the system
 */

export interface Lip {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for lips
 */
export interface LipListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Lip[];
}

/**
 * Query parameters for fetching lips
 */
export interface LipQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new lip
 */
export interface CreateLipParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing lip
 */
export interface UpdateLipParams extends Partial<CreateLipParams> {}

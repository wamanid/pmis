/**
 * Ear Model
 * Represents an ear type in the system
 */

export interface Ear {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for ears
 */
export interface EarListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ear[];
}

/**
 * Query parameters for fetching ears
 */
export interface EarQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new ear
 */
export interface CreateEarParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing ear
 */
export interface UpdateEarParams extends Partial<CreateEarParams> {}

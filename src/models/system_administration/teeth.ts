/**
 * Teeth Model
 * Represents a teeth type in the system
 */

export interface Teeth {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for teeth
 */
export interface TeethListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Teeth[];
}

/**
 * Query parameters for fetching teeth
 */
export interface TeethQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new teeth
 */
export interface CreateTeethParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing teeth
 */
export interface UpdateTeethParams extends Partial<CreateTeethParams> {}

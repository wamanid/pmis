/**
 * Eye Model
 * Represents an eye type in the system
 */

export interface Eye {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for eyes
 */
export interface EyeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Eye[];
}

/**
 * Query parameters for fetching eyes
 */
export interface EyeQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new eye
 */
export interface CreateEyeParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing eye
 */
export interface UpdateEyeParams extends Partial<CreateEyeParams> {}

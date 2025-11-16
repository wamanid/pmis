/**
 * Build Model
 * Represents a body build type in the system
 */

export interface Build {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for builds
 */
export interface BuildListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Build[];
}

/**
 * Query parameters for fetching builds
 */
export interface BuildQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new build
 */
export interface CreateBuildParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing build
 */
export interface UpdateBuildParams extends Partial<CreateBuildParams> {}

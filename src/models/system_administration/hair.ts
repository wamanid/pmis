/**
 * Hair Model
 * Represents a hair type in the system
 */

export interface Hair {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for hairs
 */
export interface HairListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Hair[];
}

/**
 * Query parameters for fetching hairs
 */
export interface HairQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new hair
 */
export interface CreateHairParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing hair
 */
export interface UpdateHairParams extends Partial<CreateHairParams> {}

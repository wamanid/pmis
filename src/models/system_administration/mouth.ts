/**
 * Mouth Model
 * Represents a mouth type in the system
 */

export interface Mouth {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for mouths
 */
export interface MouthListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Mouth[];
}

/**
 * Query parameters for fetching mouths
 */
export interface MouthQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new mouth
 */
export interface CreateMouthParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing mouth
 */
export interface UpdateMouthParams extends Partial<CreateMouthParams> {}

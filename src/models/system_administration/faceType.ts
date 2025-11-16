/**
 * Face Type Model
 * Represents a face type in the system
 */

export interface FaceType {
  id: string;
  name: string;
  description?: string;
}

/**
 * Paginated response for face types
 */
export interface FaceTypeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FaceType[];
}

/**
 * Query parameters for fetching face types
 */
export interface FaceTypeQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Parameters for creating a new face type
 */
export interface CreateFaceTypeParams {
  name: string;
  description?: string;
}

/**
 * Parameters for updating an existing face type
 */
export interface UpdateFaceTypeParams extends Partial<CreateFaceTypeParams> {}

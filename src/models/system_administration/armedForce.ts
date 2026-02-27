/**
 * Armed Force Models
 * Represents armed force information
 */

export interface ArmedForce {
  id: string;
  name: string;
  description?: string;
}

export interface ArmedForceListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ArmedForce[];
}

export interface ArmedForceQueryParams {
  search?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
}

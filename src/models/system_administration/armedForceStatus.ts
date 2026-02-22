/**
 * Armed Force Status Models
 * Represents armed force status information
 */

export interface ArmedForceStatus {
  id: string;
  name: string;
  description?: string;
}

export interface ArmedForceStatusListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ArmedForceStatus[];
}

export interface ArmedForceStatusQueryParams {
  search?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
}

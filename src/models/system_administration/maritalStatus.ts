/**
 * Marital Status Model
 * Represents marital status data from /api/system-administration/marital-statuses/
 */

export interface MaritalStatus {
  id: string;
  is_active: boolean;
  name: string;
  description?: string;
}

export interface MaritalStatusListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MaritalStatus[];
}

export interface MaritalStatusQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateMaritalStatusData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateMaritalStatusData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

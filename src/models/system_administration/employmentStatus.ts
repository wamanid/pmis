/**
 * Employment Status Model
 * Represents employment status data from /api/system-administration/employment-statuses/
 */

export interface EmploymentStatus {
  id: string;
  is_active: boolean;
  name: string;
  description?: string;
}

export interface EmploymentStatusListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EmploymentStatus[];
}

export interface EmploymentStatusQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateEmploymentStatusData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateEmploymentStatusData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

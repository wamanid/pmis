/**
 * Prisoner Category Model
 * Represents a prisoner category in the system
 */

export interface PrisonerCategory {
  id: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
}

export interface PrisonerCategoryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PrisonerCategory[];
}

export interface PrisonerCategoryQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
}

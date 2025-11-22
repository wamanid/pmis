/**
 * Prisoner Class Model
 */

export interface PrisonerClass {
  id: string;
  name: string;
  description: string;
}

export interface PrisonerClassListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PrisonerClass[];
}

export interface PrisonerClassParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  is_active?: boolean;
}

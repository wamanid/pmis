/**
 * Religion Model
 * Represents religion data structure from the API
 */

export interface Religion {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReligionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Religion[];
}

export interface ReligionQueryParams {
  search?: string;
  ordering?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface CreateReligionData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateReligionData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * ID Type Model
 * Represents ID type data structure from the API
 */

export interface IdType {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IdTypeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IdType[];
}

export interface IdTypeQueryParams {
  search?: string;
  ordering?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface CreateIdTypeData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateIdTypeData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

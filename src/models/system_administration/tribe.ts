/**
 * Tribe Model
 * Represents tribe data from /api/system-administration/tribes/
 */

export interface Tribe {
  id: string;
  is_active: boolean;
  name: string;
  description?: string;
}

export interface TribeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tribe[];
}

export interface TribeQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateTribeData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateTribeData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

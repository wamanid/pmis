/**
 * Continent Model
 * Represents continent data from /api/system-administration/continents/
 */

export interface Continent {
  id: string;
  is_active: boolean;
  name: string;
  description?: string;
}

export interface ContinentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Continent[];
}

export interface ContinentQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateContinentData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateContinentData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

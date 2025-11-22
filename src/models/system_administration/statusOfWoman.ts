/**
 * Status of Woman Model
 * Represents status of woman data from /api/system-administration/status-of-women/
 */

export interface StatusOfWoman {
  id: string;
  is_active: boolean;
  name: string;
  description?: string;
}

export interface StatusOfWomanListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StatusOfWoman[];
}

export interface StatusOfWomanQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateStatusOfWomanData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateStatusOfWomanData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

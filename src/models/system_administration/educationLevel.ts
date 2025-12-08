/**
 * Education Level Model
 * Represents education level data from /api/system-administration/education-levels/
 */

export interface EducationLevel {
  id: string;
  is_active: boolean;
  name: string;
  description?: string;
}

export interface EducationLevelListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EducationLevel[];
}

export interface EducationLevelQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateEducationLevelData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateEducationLevelData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

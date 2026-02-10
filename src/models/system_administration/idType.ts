export interface IdType {
  id: string;
  is_active: boolean;
  name: string;
  description: string;
}

export interface IdTypeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IdType[];
}

export interface IdTypeQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateIdTypeData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateIdTypeData {
  name: string;
  description?: string;
  is_active?: boolean;
}

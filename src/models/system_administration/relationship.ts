export interface Relationship {
  id: string;
  name: string;
  description: string;
}

export interface RelationshipListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Relationship[];
}

export interface RelationshipQueryParams {
  ordering?: string;
  page?: number;
  search?: string;
  is_active?: boolean;
}

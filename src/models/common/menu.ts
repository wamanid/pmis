// Menu Models

export interface ApiMenuItem {
  id: string;
  parent_name?: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  url: string;
  icon: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  parent: string | null;
}

export interface MenuResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiMenuItem[];
}

/**
 * Country Model
 * Represents country data from /api/system-administration/countries/
 */

export interface Country {
  id: string;
  continent_name?: string;
  is_active: boolean;
  name: string;
  nationality?: string;
  iso_code2?: string;
  iso_code3?: string;
  description?: string;
  continent: string;
}

export interface CountryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Country[];
}

export interface CountryQueryParams {
  continent?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
}

export interface CreateCountryData {
  name: string;
  continent: string;
  nationality?: string;
  iso_code2?: string;
  iso_code3?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCountryData {
  name?: string;
  continent?: string;
  nationality?: string;
  iso_code2?: string;
  iso_code3?: string;
  description?: string;
  is_active?: boolean;
}

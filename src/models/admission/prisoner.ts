/**
 * Prisoner Models
 * Models for prisoner data from admission API
 */

/**
 * User details embedded in prisoner records
 */
export interface UserDetails {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Prisoner model
 */
export interface Prisoner {
  id: string;
  prison_number: string;
  first_name: string;
  last_name: string;
  full_name: string;
  habitual: boolean;
  is_dangerous: boolean;
  avg_security_rating: number;
  is_active: boolean;
  created_datetime: string;
  created_by: number;
  created_by_details: UserDetails;
  updated_datetime: string;
  updated_by: number;
}

/**
 * Paginated prisoner list response
 */
export interface PrisonerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Prisoner[];
}

/**
 * Prisoner list filters
 */
export interface PrisonerFilters {
  habitual?: boolean;
  is_active?: boolean;
  is_dangerous?: boolean;
  ordering?: string;
  page?: number;
  search?: string;
}

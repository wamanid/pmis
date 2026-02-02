export interface StaffProfile {
  id: string;
  user: string;
  user_email: string;
  user_phone: string;
  organization: string;
  organization_name: string;
  staff_id: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  bio: string;
  experience_years: number;
  rating: string;
  total_ratings: number;
  total_jobs_completed: number;
  earnings_balance: string;
  total_earnings: string;
  is_online: boolean;
  is_available: boolean;
  available_from: string;
  available_to: string;
  current_latitude: string;
  current_longitude: string;
  last_location_update: string;
  created_at: string;
  updated_at: string;
}

export interface StaffProfileListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffProfile[];
}

export interface StaffProfileFilters {
  search?: string;
  status?: string;
  organization?: string;
  is_available?: boolean;
  page?: number;
  page_size?: number;
}

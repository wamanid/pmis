/**
 * Debtor Information Models
 * Represents debtor information for prisoners
 */

export interface DebtorInformation {
  id?: string;
  prisoner?: string;
  creditor_name?: string;
  creditor_phone?: string;
  creditor_address?: string;
  debt_amount?: number;
  debt_description?: string;
  is_active?: boolean;
  created_datetime?: string;
  updated_datetime?: string;
  created_by?: number;
  updated_by?: number;
}

export interface DebtorInformationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DebtorInformation[];
}

export interface DebtorInformationQueryParams {
  prisoner?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

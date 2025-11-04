// Admission Dashboard Models

export interface AdmissionCategory {
  convict: number;
  remand: number;
  debtor: number;
  lifer: number;
  condemned: number;
  young_offender: number;
}

export interface SummaryPeriod {
  current: number;
  previous: number;
  percentage_change: number;
}

export interface DashboardResponse {
  total_admissions: number;
  admissions: {
    category: AdmissionCategory;
  };
  pending_approvals: number;
  armed_personnel: number;
  children: number;
  weekly_summary: SummaryPeriod;
  monthly_summary: SummaryPeriod;
  annual_summary: SummaryPeriod;
}

export interface DashboardFilters {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  station?: number;
  region?: number;
  district?: number;
  period?: 'daily' | 'weekly' | 'monthly';
}

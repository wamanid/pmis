/**
 * Debtor Information model for prisoner admission
 */

export interface DebtorInformation {
  id?: string;
  photo?: string;
  escapee?: boolean;
  armed_personnel?: boolean;
  extremely_violent?: boolean;
  life_or_death_imprisonment?: boolean;
  lodger?: boolean;
  previous_convictions_count?: number;
  commital?: boolean;
  date_of_committal?: string;
  subsistence_allowance?: string;
  rate_per_day?: string;
  amount_received?: string;
  days_paid?: number;
  amount_for_full_days?: string;
  value_of_debt?: string;
  creditor_name?: string;
  next_of_kin_details?: string;
  prison_station?: string;
  arrest_region?: string;
  arrest_district?: string;
  arrest_county?: string;
  arrest_sub_county?: string;
  arrest_parish?: string;
  arrest_village?: string;
  prisoner_class?: string;
}

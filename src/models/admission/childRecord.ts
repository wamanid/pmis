/**
 * Child Record model for prisoner admission (children accompanying female prisoners)
 */

export interface ChildRecord {
  id?: string;
  name: string;
  date_of_birth: string;
  fathers_name?: string;
  mothers_name?: string;
  sex?: string;
  photo?: string;
  physical_condition?: string;
  child_record?: string;
  medical_condition?: string;
  medical_report?: string;
  probation_report?: string;
  description?: string;
  age_on_admission?: number;
  relation?: string;
  hospital_of_birth?: string;
  district_of_birth?: string;
}

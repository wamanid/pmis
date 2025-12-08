/**
 * Armed Personnel model for prisoner admission
 */

export interface ArmedPersonnel {
  id?: string;
  prisoner?: string;
  prisoner_name?: string;
  armed_forces_status?: string;
  armed_forces_status_name?: string;
  armed_force?: string;
  armed_force_name?: string;
  unit?: string;
  division?: string;
  station?: string;
  government_forces?: boolean;
  remarks?: string;
}

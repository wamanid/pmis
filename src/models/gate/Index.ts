

import { Prisoner } from './Prisoner';
import { Escort } from './Escort';

export interface GatePass {
  id: string;
  gate_keeper_username: string;
  gate_pass_type_name: string;
  prisoners: Prisoner[];
  escorts: Escort[];
  destination: string;
  main_gate_required: boolean;
  exception_reason: string;
  remarks: string;
  gate_keeper: string;
  gate_pass_type: string;
  created_at?: string;
  status?: string;
  status_name:String
}

export  interface PrisonerRecord {
  id: string;
  full_name: string;
  prisoner_number: string;
  category?: string;
}

export interface WorkingParty {
  id: string;
  name: string;
  station_name: string;
  officer_name: string;
  officer_force_number: string ;
  staff_name: string;
  staff_force_number: string;
  speciality_name: string;
  current_capacity: number;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  remarks: string;
  capacity: number;
  start_date: string;
  end_date: string;
  is_out_party: boolean;
  is_special_party: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  station: string;
  officer_in_charge: string;
  staff_in_charge_name: string;
  speciality: string;
}

export interface GatePassType {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  rank: string;
  force_number: string;
  last_name: string;
}

//working part response
export interface WorkingPartyResponse {
  countexport : number;
  next: string | null;
  previous: string | null;
  results: WorkingParty[];
}

export interface VisitorPass {
  id?: string;
  prisoner_name?: string;
  visitor_name?: string;
  suspended_reason?: string;
  visitor_tag_number: string;
  valid_from: string;
  valid_until: string;
  purpose: string;
  issue_date: string;
  is_suspended: boolean;
  is_valid?: boolean;
  prisoner: string;
  visitor: string;
  is_active: boolean
}




export interface Visitor {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  id_type_name: string;
  id_number: string;

  
}

export interface Relationship {
  id: string;
  name: string;
}

export interface IDType {
  id: string;
  name: string;
}


import { File } from 'lucide-react';

export interface CourtScheduleRecord {
  id: string;
  prisoner_name: string;
  offence_name: string;
  court_name: string;
  station_name: string;
  attendance_type_name: string;
  case_outcome_name: string;
  scheduled_date: string;
  scheduled_time: string;
  presiding_judge: string;
  attendance_status: boolean;
  remarks: string;
  court_order: string;
  prisoner: string;
  offence: string;
  court_detail: string;
  station: string;
  court_attendance_type: string;
  case_outcome: string;
}
export interface UploadedFile {
  name?:String;
  file:File
}

export interface CourtSchedulePost {
  is_active: boolean;
  deleted_datetime: string;
  scheduled_time: string;
  presiding_judge: string;
  attendance_status: string;
  remarks: string;
  court_order: string;
  prisoner: string;
  offence: string;
  court_detail: string;
  casecourt_attendance_type_outcome: string;
  case_outcome: string;
  station:String;
  scheduled_date:string;
  court_attendance_type:string;
  file:File
}


export interface CourtAttendanceRecord {
  id?: string;
  prisoner_name?: string;
  attendance_type_name?: string;
  court_name?: string;
  offence_name?: string;
  case_outcome_name?: string;
  appeal_id?: string;
  gate_pass_number?: string;
  remarks?: string;
  production_warrant?: string;
  criminal_case_number?: string;
  attendance_datetime?: string;
  legal_proceedings?: string;
  prisoner?: string;
  court_attendance_type?: string;
  court?: string;
  offence?: string;
  case_outcome?: string;
  appeal?: string;
  gate_pass?: string;
}

export interface CourtAttendanceRecordMini {
  id?: string;
  prisoner_name?: string;
  court_name?: string;
  attendance_datetime:String;
  criminal_case_number?: string;
}

export interface Prisoner {
  id: string;
  prisoner_number: string;
  personal_number: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  id_number: string;
  id_type: string;
  gender: string;
  tribe: string;
  date_of_admission: string;
  religion: string;
  category?: string;
  status?: string;
}


export interface CourtProceedingRecord {
  id: string;
  court_attendance_details: string;
  prisoner_name: string;
  transcript: string;
  court_attendance: string;
  created_datetime?: string;
  updated_datetime?: string;
}

export interface CourtProceedingPost {
    id?: string;
  is_active?: boolean;
  deleted_datetime?: string;
  transcript: string;
  court_attendance: string;
}
export interface CourtVisitRecord {
  id: string;
  prisoner_name: string;
  id_type_name: string;
  relationship_name: string;
  visit_id: string;
  visit_date: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  id_number: string;
  telephone_number: string;
  address: string;
  items_brought: string;
  prisoner: string;
  id_type: string;
  relationship: string;
  visitation_datetime: string;

}



export interface Courts {
  id:string
  level_name: string;
  district_name: string;

}

export interface PrisonerOffencePair {
  id: string;
  prisoner: string;
  prisoner_name: string;
  offence: string;
  offence_name: string;
  court: string;
  court_attendance_type: string;
  attendance_datetime: string;
  case_outcome: string;
  appeal: string;
  gate_pass_number: string;
  remarks: string;
  production_warrant: File | null;
  criminal_case_number: string;
  legal_proceedings: string;
}

export interface BulkAttendanceData {
  court: string;
  court_attendance_type: string;
  attendance_datetime: string;
  case_outcome: string;
  appeal: string;
  gate_pass_number: string;
  remarks: string;
  production_warrant: File | null;
  criminal_case_number: string;
  legal_proceedings: string;
  schedule: string;
  prisoner_offence_pairs: PrisonerOffencePair[];
}


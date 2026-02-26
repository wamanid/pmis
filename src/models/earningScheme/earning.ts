export interface AttendanceRecord {
  id: string;
  prisoner_name: string;
  working_party_name: string;
  earning_rate_grade: string;
  is_present: boolean;
  attendance_datetime: string;
  amount_earned: string;
  remarks: string;
  working_party_prisoner: string;
  earning_rate: string;
}

export interface AttendanceFormData {
  prisoner_name: string;
  working_party_name: string;
  earning_rate_grade: string;
  is_present: boolean;
  attendance_datetime: string;
  amount_earned: string;
  remarks: string;
  working_party_prisoner: string;
  earning_rate: string;
}

export interface EarningSchemePrisonerAttendanceFormProps {
  initialData?: AttendanceFormData | null;
  onSubmit: (data: AttendanceFormData) => void;
  onCancel: () => void;
  editData?: AttendanceRecord | null; 
  prisoners: any[]; // You can replace 'any' with a more specific type if you have one
  workingParties:any[]; // You can replace 'any' with a more specific type if you have one
}
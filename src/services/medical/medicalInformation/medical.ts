import {Paginated} from "../../stationServices/utils";
import {ErrorResponse} from "../../stationServices/visitorsServices/VisitorsService";
import axiosInstance from "../../axiosInstance";
import {Unit} from "../../stationServices/visitorsServices/visitorItem";
import {BatchDischargeRequest, DischargeRequest, DischargeRequestResponse} from "../../discharge/discharge";

// Medical Records
export interface MedicalRecord {
  id: string
  prisoner_name: string
  prisoner_number: string
  blood_group_name: string
  created_datetime: string
  updated_datetime: string
  deleted_datetime: string | null
  is_active: boolean
  created_by: number
  updated_by: number
  deleted_by: number
  prisoner: string
  blood_group: string
}

export interface Record {
  is_active: boolean;
  deleted_datetime: string | null;
  deleted_by: number | null;
  prisoner: string;
  blood_group: string;
}

export type MedicalRecordResponse<T> = Paginated<T> | ErrorResponse
export type BloodGroupResponse<T> = Paginated<T> | ErrorResponse
export type RecordResponse = MedicalRecord | ErrorResponse

export const getMedicalRecords = async (): Promise<MedicalRecordResponse<MedicalRecord>> => {
  const response = await axiosInstance.get<Paginated<MedicalRecord>>(
    '/medical-management/medical-records/'
  )
  return response.data
}

export const getBloodGroups = async (): Promise<BloodGroupResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/system-administration/blood-groups/'
  )
  return response.data
}

export const addMedicalRecord = async (record: Record) : Promise<RecordResponse> => {
  const response = await axiosInstance.post<RecordResponse>('/medical-management/medical-records/', record);
  return response.data;
}

export const updateMedicalRecord = async (record: Record, id: string) : Promise<RecordResponse> => {
  const response = await axiosInstance.put<RecordResponse>(`/medical-management/medical-records/${id}/`, record);
  return response.data;
}

export const deleteMedicalRecord = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-management/medical-records/${id}/`);
};

// BMI
export interface BmiClassification {
  id: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string;
  is_active: boolean;
  name: string;
  description: string;
  min_bmi: string;
  max_bmi: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface BmiRecord {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  classification_name: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string;
  is_active: boolean;
  weight: string;
  height: string;
  bmi: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  bmi_classification: string;
}

export interface Bmi {
  is_active: boolean;
  deleted_datetime: string | null;
  weight: string;
  height: string;
  bmi: string;
  deleted_by: number | null;
  prisoner: string;
  bmi_classification: string;
}

export type BmiClassificationResponse<T> = Paginated<T> | ErrorResponse
export type BmiRecordResponse<T> = Paginated<T> | ErrorResponse
export type BmiResponse = BmiRecord | ErrorResponse

export const getBmiClassifications = async (): Promise<BmiClassificationResponse<BmiClassification>> => {
  const response = await axiosInstance.get<Paginated<BmiClassification>>(
    '/medical-management/bmi-classifications/'
  )
  return response.data
}

export const getBmiRecords = async (): Promise<BmiRecordResponse<BmiRecord>> => {
  const response = await axiosInstance.get<Paginated<BmiRecord>>(
    '/medical-management/bmi-records/'
  )
  return response.data
}

export const getBmiRecord = async (prisonerId: string): Promise<BmiRecordResponse<BmiRecord>> => {
  const response = await axiosInstance.get<Paginated<BmiRecord>>(
    '/medical-management/bmi-records/',
      {
        params: {
          prisoner: prisonerId,
        }
      }
  )
  return response.data
}

export const addBmiRecord = async (bmi: Bmi) : Promise<BmiResponse> => {
  const response = await axiosInstance.post<BmiResponse>('/medical-management/bmi-records/', bmi);
  return response.data;
}

export const updateBmiRecord = async (bmi: Bmi, id: string) : Promise<BmiResponse> => {
  const response = await axiosInstance.put<BmiResponse>(`/medical-management/bmi-records/${id}/`, bmi);
  return response.data;
}

export const deleteBmiRecord = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-management/bmi-records/${id}/`);
};

// Case books
export interface CaseBook {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  check_type_name: string;
  blood_group_name: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string;
  is_active: boolean;
  present_complaint: string;
  history: string;
  grade: string;
  referral: string;
  doctors_name: string;
  mental_case: boolean;
  notes: string;
  edoctor_video_link: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  check_type: string;
  bmi: string;
  presentation_of_patient: string;
  blood_group: string;
}

export interface Case {
  is_active: boolean;
  deleted_datetime: string | null;
  present_complaint: string;
  history: string;
  grade: string;
  referral: string;
  doctors_name: string;
  mental_case: boolean;
  notes: string;
  edoctor_video_link: string;
  deleted_by: number | null;
  prisoner: string;
  check_type: string;
  bmi: string;
  presentation_of_patient: string;
  blood_group: string;
}


export type PresentationTypesResponse<T> = Paginated<T> | ErrorResponse
export type CheckupTypesResponse<T> = Paginated<T> | ErrorResponse
export type CaseBooksResponse<T> = Paginated<T> | ErrorResponse
export type CaseBookResponse = CaseBook | ErrorResponse

export const getPresentationTypes = async (): Promise<PresentationTypesResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/medical-management/presentation-types/'
  )
  return response.data
}

export const getCheckupTypes = async (): Promise<CheckupTypesResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/medical-management/checkup-types/'
  )
  return response.data
}

export const getCaseBooks = async (): Promise<CaseBooksResponse<CaseBook>> => {
  const response = await axiosInstance.get<Paginated<CaseBook>>(
    '/medical-management/case-books/'
  )
  return response.data
}

export const addCaseBook = async (book: Case) : Promise<CaseBookResponse> => {
  const response = await axiosInstance.post<CaseBookResponse>('/medical-management/case-books/', book);
  return response.data;
}

export const updateCaseBook = async (book: Case, id: string) : Promise<CaseBookResponse> => {
  const response = await axiosInstance.put<CaseBookResponse>(`/medical-management/case-books/${id}/`, book);
  return response.data;
}

export const deleteCaseBook = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-management/case-books/${id}/`);
};


// Schedules
export interface Schedule {
  id: string;
  prisoner_name: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string;
  followup_date: string;
  is_active: boolean;
  attendance_status: boolean;
  notes: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  medical_case_book: string;
}

export interface NewSchedule {
  is_active: boolean;
  deleted_datetime: string | null;   
  followup_date: string;      
  attendance_status: boolean;
  notes: string;
  deleted_by: number | null;
  medical_case_book: string;  
}


export type SchedulesResponse<T> = Paginated<T> | ErrorResponse
export type ScheduleResponse = Schedule | ErrorResponse

export const getSchedules = async (): Promise<SchedulesResponse<Schedule>> => {
  const response = await axiosInstance.get<Paginated<Schedule>>(
    '/medical-management/schedules/'
  )
  return response.data
}

export const addSchedule = async (schedule: NewSchedule) : Promise<ScheduleResponse> => {
  const response = await axiosInstance.post<ScheduleResponse>('/medical-management/schedules/', schedule);
  return response.data;
}

export const updateSchedule = async (schedule: NewSchedule, id: string) : Promise<ScheduleResponse> => {
  const response = await axiosInstance.put<ScheduleResponse>(`/medical-management/schedules/${id}/`, schedule);
  return response.data;
}

export const deleteSchedule = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-management/schedules/${id}/`);
};
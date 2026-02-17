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
  prisoner_number_value: string
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
  prisoner_number_value: string;
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
  prisoner_number_value: string;
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

// Examination Results
export interface ExaminationResult {
  id: string
  prisoner_name: string
  exam_name: string
  created_datetime: string
  updated_datetime: string
  deleted_datetime: string | null
  is_active: boolean
  notes: string
  created_by: number
  updated_by: number
  deleted_by: number
  medical_case_book: string
  medical_exam: string
}

export interface Result {
  is_active: boolean
  deleted_datetime: string | null
  notes: string
  deleted_by: number | null
  medical_case_book: string
  medical_exam: string
}


export type ExamsResponse<T> = Paginated<T> | ErrorResponse
export type ExaminationResultResponse<T> = Paginated<T> | ErrorResponse
export type ResultResponse = ExaminationResult | ErrorResponse

export const getExams = async (): Promise<ExamsResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/medical-management/medical-exams/'
  )
  return response.data
}

export const getExaminationResults = async (): Promise<ExaminationResultResponse<ExaminationResult>> => {
  const response = await axiosInstance.get<Paginated<ExaminationResult>>(
    '/medical-management/exam-results/'
  )
  return response.data
}

export const addResult = async (result: Result) : Promise<ResultResponse> => {
  const response = await axiosInstance.post<ResultResponse>('/medical-management/exam-results/', result);
  return response.data;
}

export const updateResult = async (result: Result, id: string) : Promise<ResultResponse> => {
  const response = await axiosInstance.put<ResultResponse>(`/medical-management/exam-results/${id}/`, result);
  return response.data;
}

export const deleteResult = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-management/exam-results/${id}/`);
};

// Diagnosis
export interface Diagnosis {
  id: string;
  prisoner_name: string;
  disease_name: string;
  regiment_name: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  differential: boolean;
  unfit_for_labor: boolean;
  remarks: string;
  created_by: number;
  updated_by: number;
  deleted_by: number | null;
  medical_case_book: string;
  disease: string;
  regiment: string;
}

export interface DiagnosisItem {
  is_active: boolean;
  deleted_datetime: string | null;
  deleted_by: number | null;
  differential: boolean;
  unfit_for_labor: boolean;
  remarks: string;
  medical_case_book: string;
  disease: string;
  regiment: string;
}

export type DiagnosisItemResponse = Diagnosis | ErrorResponse
export type DiagnosisResponse<T> = Paginated<T> | ErrorResponse
export type DiseaseResponse<T> = Paginated<T> | ErrorResponse
export type RegimentResponse<T> = Paginated<T> | ErrorResponse

export const getDiseases = async (): Promise<DiseaseResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/system-administration/diseases/'
  )
  return response.data
}

export const getRegiments = async (): Promise<RegimentResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/medical-management/regiments/'
  )
  return response.data
}

export const getDiagnosis = async (): Promise<DiagnosisResponse<Diagnosis>> => {
  const response = await axiosInstance.get<Paginated<Diagnosis>>(
    '/medical-management/diagnoses/'
  )
  return response.data
}

export const addDiagnosis = async (diagnosis: DiagnosisItem) : Promise<DiagnosisItemResponse> => {
  const response = await axiosInstance.post<DiagnosisItemResponse>('/medical-management/diagnoses/', diagnosis);
  return response.data;
}

export const updateDiagnosis = async (diagnosis: DiagnosisItem, id: string) : Promise<DiagnosisItemResponse> => {
  const response = await axiosInstance.put<DiagnosisItemResponse>(`/medical-management/diagnoses/${id}/`, diagnosis);
  return response.data;
}

export const deleteDiagnosis = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-management/diagnoses/${id}/`);
};

// Lab tests
export interface LabTest {
  id: string;
  prisoner_name: string;
  test_name: string;
  result_name: string;
  result_document: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  notes: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  medical_case_book: string;
  medical_test: string;
  result: string;
}

export type LabTestsResponse<T> = Paginated<T> | ErrorResponse
export type TestResponse = LabTest | ErrorResponse
export type TestResultsResponse<T> = Paginated<T> | ErrorResponse
export type MedicalTestsResponse<T> = Paginated<T> | ErrorResponse

export const getTestResults = async (): Promise<TestResultsResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/medical-management/test-results/'
  )
  return response.data
}

export const getMedicalTests = async (): Promise<MedicalTestsResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/medical-management/medical-tests/'
  )
  return response.data
}

export const getLabTests = async (): Promise<LabTestsResponse<LabTest>> => {
  const response = await axiosInstance.get<Paginated<LabTest>>(
    '/medical-management/lab-tests/'
  )
  return response.data
}

export const addLabTest = async (formData: FormData) : Promise<TestResponse> => {
  const response = await axiosInstance.post<TestResponse>('/medical-management/lab-tests/', formData);
  return response.data;
}

export const updateLabTest = async (formData: FormData, id: string) : Promise<TestResponse> => {
  const response = await axiosInstance.put<TestResponse>(`/medical-management/lab-tests/${id}/`, formData);
  return response.data;
}

export const deleteLabTest = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-management/lab-tests/${id}/`);
};

// Ailment
export interface Ailment {
  id: string;
  prisoner_name: string;
  ailment_name: string;
  regiment_name: string;
  supporting_document: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  remarks: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner_medical_record: string;
  ailment: string;
  regiment: string;
}

export type AilmentsResponse<T> = Paginated<T> | ErrorResponse
export type AilmentResponse = Ailment | ErrorResponse

export const getAilments = async (): Promise<AilmentsResponse<Ailment>> => {
  const response = await axiosInstance.get<Paginated<Ailment>>(
    '/medical-management/ailments/'
  )
  return response.data
}

export const addAilment = async (formData: FormData) : Promise<AilmentResponse> => {
  const response = await axiosInstance.post<AilmentResponse>('/medical-management/ailments/', formData);
  return response.data;
}

export const updateAilment = async (formData: FormData, id: string) : Promise<AilmentResponse> => {
  const response = await axiosInstance.put<AilmentResponse>(`/medical-management/ailments/${id}/`, formData);
  return response.data;
}

export const deleteAilment = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/medical-management/ailments/${id}/`);
};
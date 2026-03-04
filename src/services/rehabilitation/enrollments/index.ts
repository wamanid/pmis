import {Paginated} from "../../stationServices/utils";
import {ErrorResponse} from "../../stationServices/visitorsServices/VisitorsService";
import axiosInstance from "../../axiosInstance";
import {
  BloodGroupResponse,
  MedicalRecord,
  MedicalRecordResponse,
  Record, RecordResponse
} from "../../medical/medicalInformation/medical";
import {Unit} from "../../stationServices/visitorsServices/visitorItem";

export interface Programme {
  id: string;
  category_name: string;
  level_name: string;
  certification_name: string;
  sponsor_name: string;
  security_classification_name: string;
  programme_head_name: string;
  responsible_officer_name: string;
  allowed_prisoner_categories_names: string;
  programme_no: string;
  programme_name: string;
  comment: string;
  is_active: boolean;
  created_datetime: string;   // ISO 8601 datetime
  updated_datetime: string;   // ISO 8601 datetime
  deleted_datetime: string | null;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  programme_category: string;               // UUID
  programme_level: string;                  // UUID
  rehabilitation_certification: string;     // UUID
  rehabilitation_sponsor: string;           // UUID
  security_classification: string;           // UUID
  programme_head: string;                   // UUID
  responsible_officer: string;              // UUID
  allowed_prisoner_categories: string[];    // UUID[]
}

export interface Enrollment {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  programme_name: string;
  programme_stage_name: string;
  sponsor_name: string;
  responsible_officer_name: string;
  progress_status_name: string;
  is_active: string; // backend sends as string (e.g. "true"/"false" or status)
  prisoner_opinion: string;
  comment: string;
  certificate_awarded: boolean;
  certification_document: string;
  created_datetime: string;   // ISO 8601
  updated_datetime: string;   // ISO 8601
  deleted_datetime: string | null;
  date_of_enrollment: string; // ISO 8601
  start_date: string;         // ISO 8601
  end_date: string;           // ISO 8601
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;               // UUID
  programme: string;              // UUID
  programme_stage: string;        // UUID
  rehabilitation_sponsor: string; // UUID
  responsible_officer: string;    // UUID
  progress_status: string;        // UUID
}

export interface ProgrammeStage {
  id: string;
  programme_name: string;
  stage: string;
  is_active: boolean;
  created_datetime: string;   // ISO 8601
  updated_datetime: string;   // ISO 8601
  deleted_datetime: string | null;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  programme: string; // UUID reference
}

export interface Sponsor {
  id: string;
  name: string;
  address: string;
  contact: string;
  is_active: boolean;
  created_datetime: string;   // ISO 8601
  updated_datetime: string;   // ISO 8601
  deleted_datetime: string | null;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface RehabilitationEnrollment {
  prisoner_opinion: string;
  comment: string;
  date_of_enrollment: string;
  start_date: string;
  end_date: string;
  certificate_awarded: boolean;
  certification_document: string;
  prisoners: string[];
  programme: string;
  programme_stage: string;
  rehabilitation_sponsor: string | null;
  responsible_officer: string;
  progress_status: string;
}

export interface EnrollmentResp {
  message: string;
  count: number;
  enrollments: Enrollment[];
}

export type ProgrammesResponse<T> = Paginated<T> | ErrorResponse
export type StatusesResponse<T> = Paginated<T> | ErrorResponse
export type CertificationsResponse<T> = Paginated<T> | ErrorResponse
export type EnrollmentsResponse<T> = Paginated<T> | ErrorResponse
export type ProgrammeStageResponse<T> = Paginated<T> | ErrorResponse
export type SponsorResponse<T> = Paginated<T> | ErrorResponse
export type EnrollmentResponse1 = EnrollmentResp | ErrorResponse
export type EnrollmentResponse2 = Enrollment | ErrorResponse

export const getProgrammes = async (): Promise<ProgrammesResponse<Programme>> => {
  const response = await axiosInstance.get<Paginated<Programme>>(
    '/rehabilitation/programmes/'
  )
  return response.data
}

export const getStatuses = async (): Promise<StatusesResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/rehabilitation/progress-statuses/'
  )
  return response.data
}

export const getCertifications = async (): Promise<CertificationsResponse<Unit>> => {
  const response = await axiosInstance.get<Paginated<Unit>>(
    '/rehabilitation/certifications/'
  )
  return response.data
}

export const getEnrollments = async (): Promise<EnrollmentsResponse<Enrollment>> => {
  const response = await axiosInstance.get<Paginated<Enrollment>>(
    '/rehabilitation/enrollments/'
  )
  return response.data
}

export const getProgrammeStages = async (programme: string): Promise<ProgrammeStageResponse<ProgrammeStage>> => {
  const response = await axiosInstance.get<Paginated<ProgrammeStage>>(
    '/rehabilitation/programme-stages/', {
        params: {
          programme
        }
      }
  )
  return response.data
}

export const getSponsors = async (): Promise<SponsorResponse<Sponsor>> => {
  const response = await axiosInstance.get<Paginated<Sponsor>>(
    '/rehabilitation/sponsors/'
  )
  return response.data
}

export const addEnrollment = async (enrollment: RehabilitationEnrollment, file?: File | null) : Promise<EnrollmentResponse1> => {
  if (file) {
    const formData = new FormData();
    
    // Append all enrollment data to FormData
    Object.keys(enrollment).forEach(key => {
      const value = enrollment[key as keyof RehabilitationEnrollment];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append the file
    formData.append('certification_document', file);
    
    const response = await axiosInstance.post<EnrollmentResponse1>('/rehabilitation/enrollments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  
  const response = await axiosInstance.post<EnrollmentResponse1>('/rehabilitation/enrollments/', enrollment);
  return response.data;
}

export const updateEnrollment = async (enrollment: RehabilitationEnrollment, id: string, file?: File | null) : Promise<EnrollmentResponse2> => {
  if (file) {
    const formData = new FormData();
    
    // Append all enrollment data to FormData
    Object.keys(enrollment).forEach(key => {
      const value = enrollment[key as keyof RehabilitationEnrollment];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append the file
    formData.append('certification_document', file);
    
    const response = await axiosInstance.put<EnrollmentResponse2>(`/rehabilitation/enrollments/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  
  const response = await axiosInstance.put<EnrollmentResponse2>(`/rehabilitation/enrollments/${id}/`, enrollment);
  return response.data;
}

export const deleteEnrollment = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/rehabilitation/enrollments/${id}/`);
};
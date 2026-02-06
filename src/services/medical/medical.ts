import {Paginated} from "../stationServices/utils";
import {ErrorResponse} from "../stationServices/visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";
import {Unit} from "../stationServices/visitorsServices/visitorItem";
import {BatchDischargeRequest, DischargeRequest, DischargeRequestResponse} from "../discharge/discharge";

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
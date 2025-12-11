import {Paginated} from "../stationServices/utils";
import {ErrorResponse} from "../stationServices/visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";
import {PrisonerProperty, PropertiesResponse} from "../propertyServices/propertyService";

export interface TransferRequest {
  id: string;
  prisoner_name: string;
  bulk_transfer: boolean;
  number_of_prisoners: number;
  original_station_name: string;
  destination_station_name: string;
  reason_name: string;
  status_name: string;
  in_charge_name: string;
  original_station_oc_approval_status_name: string;
  destination_station_oc_approval_status_name: string;
  original_station_oc_acknowledged: boolean;
  destination_station_oc_acknowledged: boolean;
  original_station_oc_approved_date: string;
  destination_station_oc_approved_date: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  original_station: string;
  destination_station: string;
  reason: string;
  in_charge: string;
  status: string;
  original_station_oc_approval_status: string;
  destination_station_oc_approval_status: string;
  original_station_oc_approved_by: string;
  destination_station_oc_approved_by: string;
}

export interface TransferReason {
  id: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string;
  is_active: boolean;
  name: string;
  slug: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export interface TransferStatus {
  id: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string;
  is_active: boolean;
  name: string;
  slug: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
}

export type TransferRequestResponse<T> = Paginated<T> | ErrorResponse
export type TransferReasonResponse<T> = Paginated<T> | ErrorResponse
export type TransferStatusResponse<T> = Paginated<T> | ErrorResponse

export const getTransferRequests = async <T = TransferRequest>(bulk_transfer: boolean) : Promise<TransferRequestResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/transfer-management/requests/', {
      params: {
          bulk_transfer
      }
  });
  return response.data;
}

export const getTransferReasons = async <T = TransferReason>() : Promise<TransferReasonResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/transfer-management/reasons/');
  return response.data;
}

export const getTransferStatus = async <T = TransferStatus>() : Promise<TransferStatusResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>('/transfer-management/statuses/');
  return response.data;
}


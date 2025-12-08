import axiosInstance from "../../axiosInstance";
import {Item, VisitorItem, VisitorItemResponse, VisitorItemsResponse} from "./visitorItem";

export interface Pass {
  prisoner: string;
  visitor: string;
  issue_date: string;
  valid_from: string;
  valid_until: string;
  is_suspended: boolean;
  // remarks: string;
  // is_active: boolean;
  // deleted_datetime: string | null;
  // visitor_tag_number: string;
  // valid_from: string;
  // valid_until: string;
  // purpose: string;
  // is_suspended: boolean;
  // suspended_date: string | null;
  // suspended_reason: string;
  // is_valid: boolean;
  // deleted_by: number | null;
  // prisoner: string;
  // visitor: string;
  // suspended_by: string;
}

export interface VisitorPass {
  id: string;
  prisoner_name: string;
  visitor_name: string;
  suspended_by_name: string;
  suspended_by_force_number: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  visitor_tag_number: string;
  valid_from: string;
  valid_until: string;
  purpose: string;
  issue_date: string;
  is_suspended: boolean;
  suspended_date: string | null;
  suspended_reason: string | null;
  is_valid: boolean;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  prisoner: string;
  visitor: string;
  suspended_by: string | null;
}

export interface ErrorResponse {
  error: string;
}

export type VisitorPassResponse = VisitorPass | ErrorResponse;

export const addVisitorPass = async (pass: Pass) : Promise<VisitorPassResponse> => {
  const response = await axiosInstance.post<VisitorPassResponse>('/gate-management/visitor-passes/', pass);
  return response.data;
}

export const getVisitorPass = async (id: string) : Promise<VisitorItemsResponse> => {
  const response = await axiosInstance.get<VisitorItemsResponse>(`/gate-management/visitor-passes/${id}/`);
  return response.data;
}
import { ErrorResponse } from "./visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";
import {Paginated} from "./utils";
import {PrisonerProperty, PropertiesResponse} from "../propertyServices/propertyService";

/**
 * Centralized API endpoints for Housing Allocation module
 * Single source of truth for all housing-related API paths
 */
export const HOUSING_API_ENDPOINTS = {
  ASSIGNMENTS: '/admission/prisoner-housing-assignments/',
  WARDS: '/station-management/api/wards/',
  CELLS: '/station-management/api/cells/',
  BLOCKS: '/station-management/api/blocks/',
  WARD_TYPES: '/system-administration/ward-types/',
  SECURITY_CLASSIFICATIONS: '/system-administration/security-classifications/',
} as const;

export interface Ward {
  id: string;
  station_name: string;
  ward_type_name: string;
  block_name: string;
  security_classification_name: string;
  created_by_name: string;
  ward_capacity: string;
  occupancy: string;
  congestion: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  name: string;
  ward_number: string;
  ward_area: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  station: string;
  ward_type: string;
  block: string;
  security_classification: string;
}

export interface Wards {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ward[];
}

export interface Cell {
  id: string;
  ward_name: string;
  security_classification_name: string;
  created_by_name: string;
  created_datetime: string;
  updated_datetime: string;
  deleted_datetime: string | null;
  is_active: boolean;
  name: string;
  cell_number: string;
  cell_capacity: number;
  cell_area: string;
  description: string;
  created_by: number;
  updated_by: number;
  deleted_by: number;
  ward: string;
  security_classification: string;
}

export interface Cells {
  count: number;
  next: string | null;
  previous: string | null;
  results: Cell[];
}

export interface Assignment {
  prisoner: string;
  ward: string;
  cell: string;
  is_active: boolean;
  created_by: number | null;
}

export interface HousingAssignment {
  id: string;
  prisoner: string;
  prisoner_name: string;
  ward: string;
  ward_name: string;
  cell: string;
  cell_name: string;
  is_active: boolean;
  created_datetime: string;
  created_by: number;
}


export type WardsResponse = Wards | ErrorResponse;
export type CellsResponse = Cells | ErrorResponse;
export type PrisonAssignmentResponse = HousingAssignment | ErrorResponse;
export type AssignmentsResponse<T> = Paginated<T> | ErrorResponse

export interface AssignmentResponse extends HousingAssignment {
  prisoner_number?: string;
  block_name?: string;
}

export const addHousingAssignment = async (assignment: Assignment) : Promise<PrisonAssignmentResponse> => {
  const response = await axiosInstance.post<PrisonAssignmentResponse>(HOUSING_API_ENDPOINTS.ASSIGNMENTS, assignment);
  return response.data;
}

export const updateHousingAssignment = async (assignment: Assignment, id: string) : Promise<PrisonAssignmentResponse> => {
  const response = await axiosInstance.put<PrisonAssignmentResponse>(`${HOUSING_API_ENDPOINTS.ASSIGNMENTS}${id}/`, assignment);
  return response.data;
}

export const deleteHousingAssignment = async (id: string) : Promise<void> => {
  await axiosInstance.delete<void>(`${HOUSING_API_ENDPOINTS.ASSIGNMENTS}${id}`);
}

export const getHousingAssignments = async <T = HousingAssignment>() : Promise<AssignmentsResponse<T>> => {
  const response = await axiosInstance.get<Paginated<T>>(HOUSING_API_ENDPOINTS.ASSIGNMENTS);
  return response.data;
}

export const fetchAssignmentById = async (id: string): Promise<HousingAssignment> => {
  const response = await axiosInstance.get<HousingAssignment>(`${HOUSING_API_ENDPOINTS.ASSIGNMENTS}${id}/`);
  return response.data;
}

export const getStationWards = async (stationId: string) : Promise<WardsResponse> => {
  const response = await axiosInstance.get<WardsResponse>(HOUSING_API_ENDPOINTS.WARDS, {
      params: {
          station: stationId
      }
  });
  return response.data;
}

export const fetchWardById = async (id: string): Promise<Ward> => {
  const response = await axiosInstance.get<Ward>(`${HOUSING_API_ENDPOINTS.WARDS}${id}/`);
  return response.data;
}

export const deleteWardById = async (id: string) : Promise<void> => {
  await axiosInstance.delete<void>(`${HOUSING_API_ENDPOINTS.WARDS}${id}`);
}

export const getWardCells = async (wardId: string) : Promise<CellsResponse> => {
  const response = await axiosInstance.get<CellsResponse>(HOUSING_API_ENDPOINTS.CELLS, {
      params: {
          ward: wardId
      }
  });
  return response.data;
}

import { ErrorResponse } from "./visitorsServices/VisitorsService";
import axiosInstance from "../axiosInstance";

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

export type WardsResponse = Wards | ErrorResponse;
export type CellsResponse = Cells | ErrorResponse;

export const getStationWards = async (stationId: string) : Promise<WardsResponse> => {
  const response = await axiosInstance.get<WardsResponse>('/station-management/api/wards/', {
      params: {
          station: stationId
      }
  });
  return response.data;
}

export const getWardCells = async (wardId: string) : Promise<CellsResponse> => {
  const response = await axiosInstance.get<CellsResponse>('/station-management/api/cells/', {
      params: {
          ward: wardId
      }
  });
  return response.data;
}
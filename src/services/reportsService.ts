import axiosInstance from './axiosInstance';
import {
  ReportsResponse,
  Report,
  ReportExecutionRequest,
  ReportExecutionResponse,
  AppMetadata,
  ModelMetadata,
  FieldMetadata,
  CreateReportRequest,
} from '../models/reports';

export const fetchReports = async (): Promise<ReportsResponse> => {
  const response = await axiosInstance.get<ReportsResponse>('/reports/reports/');
  return response.data;
};

export const fetchReportById = async (reportId: number): Promise<Report> => {
  const response = await axiosInstance.get<Report>(`/reports/reports/${reportId}/`);
  return response.data;
};

export const executeReport = async (
  reportId: number,
  request: ReportExecutionRequest
): Promise<ReportExecutionResponse> => {
  const response = await axiosInstance.post<ReportExecutionResponse>(
    `/reports/reports/${reportId}/execute/`,
    request
  );
  return response.data;
};

// Metadata functions for report creation
export const fetchApps = async (): Promise<AppMetadata[]> => {
  const response = await axiosInstance.get<AppMetadata[]>('/reports/metadata/apps/');
  return response.data;
};

export const fetchModels = async (appLabel: string): Promise<ModelMetadata[]> => {
  const response = await axiosInstance.get<ModelMetadata[]>(
    `/reports/metadata/models/?app_label=${appLabel}`
  );
  return response.data;
};

export const fetchFields = async (
  appLabel: string,
  modelName: string
): Promise<FieldMetadata[]> => {
  const response = await axiosInstance.get<FieldMetadata[]>(
    `/reports/metadata/fields/?app_label=${appLabel}&model_name=${modelName.toLowerCase()}`
  );
  return response.data;
};

export const createReport = async (report: CreateReportRequest): Promise<Report> => {
  const response = await axiosInstance.post<Report>('/reports/reports/', report);
  return response.data;
};

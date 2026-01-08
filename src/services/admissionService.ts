import axiosInstance from './axiosInstance';
import { DashboardResponse, DashboardFilters } from '../models/admission';

/**
 * Admission Service
 * Handles all API calls related to prisoner admissions
 */

/**
 * Fetch admission dashboard statistics
 * @param filters - Optional filters for the dashboard data
 * @returns Dashboard statistics including admissions, categories, and summaries
 */
export const getAdmissionDashboard = async (
  filters?: DashboardFilters
): Promise<DashboardResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.station) params.append('station', filters.station.toString());
    if (filters?.region) params.append('region', filters.region.toString());
    if (filters?.district) params.append('district', filters.district.toString());
    if (filters?.period) params.append('period', filters.period);

    const queryString = params.toString();
    const url = `admission/dashboard/${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get<DashboardResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching admission dashboard:', error);
    throw error;
  }
};

/**
 * Export all admission service functions
 */
export const admissionService = {
  getAdmissionDashboard,
};

export default admissionService;

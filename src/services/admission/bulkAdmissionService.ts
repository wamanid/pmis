/**
 * Bulk Admission Service
 * Handles API calls for bulk admission operations
 */

import axiosInstance from '../axiosInstance';
import type {
  BulkAdmission,
  BulkAdmissionListResponse,
  BulkAdmissionRecord,
  CreateBulkAdmissionRequest,
  BulkAdmissionFilters,
  UpdateBulkAdmissionRecordRequest,
} from '../../models/admission/bulkAdmission';

/**
 * Fetch list of bulk admissions
 * @param filters - Optional filters for the bulk admission list
 * @returns Paginated list of bulk admissions
 */
export const getBulkAdmissions = async (
  filters?: BulkAdmissionFilters
): Promise<BulkAdmissionListResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.uploaded_by) params.append('uploaded_by', filters.uploaded_by.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const queryString = params.toString();
    const url = `admission/bulk-admissions/${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get<BulkAdmissionListResponse>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching bulk admissions:', error);
    throw error;
  }
};

/**
 * Fetch a single bulk admission by ID
 * @param id - Bulk admission ID
 * @returns Bulk admission details
 */
export const getBulkAdmissionById = async (id: string): Promise<BulkAdmission> => {
  try {
    const response = await axiosInstance.get<BulkAdmission>(`admission/bulk-admissions/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bulk admission ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new bulk admission batch
 * @param data - Bulk admission data including batch name and file
 * @returns Created bulk admission
 */
export const createBulkAdmission = async (
  data: CreateBulkAdmissionRequest
): Promise<BulkAdmission> => {
  try {
    const formData = new FormData();
    formData.append('batch_name', data.batch_name);
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await axiosInstance.post<BulkAdmission>(
      'admission/bulk-admissions/upload/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating bulk admission:', error);
    throw error;
  }
};

/**
 * Delete a bulk admission batch
 * @param id - Bulk admission ID
 */
export const deleteBulkAdmission = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`admission/bulk-admissions/${id}/`);
  } catch (error) {
    console.error(`Error deleting bulk admission ${id}:`, error);
    throw error;
  }
};

/**
 * Commit a bulk admission batch (process all valid records)
 * @param id - Bulk admission ID
 * @returns Updated bulk admission
 */
export const commitBulkAdmission = async (id: string): Promise<BulkAdmission> => {
  try {
    const response = await axiosInstance.post<BulkAdmission>(
      `admission/bulk-admissions/${id}/commit/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error committing bulk admission ${id}:`, error);
    throw error;
  }
};

/**
 * Validate a bulk admission batch
 * @param id - Bulk admission ID
 * @returns Updated bulk admission
 */
export const validateBulkAdmission = async (id: string): Promise<BulkAdmission> => {
  try {
    const response = await axiosInstance.post<BulkAdmission>(
      `admission/bulk-admissions/${id}/validate/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error validating bulk admission ${id}:`, error);
    throw error;
  }
};

/**
 * Download bulk admission template CSV
 * @returns Blob containing the CSV file
 */
export const downloadBulkAdmissionTemplate = async (): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(
      'admission/bulk-admissions/download_template/',
      {
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error downloading bulk admission template:', error);
    throw error;
  }
};

/**
 * Update a bulk admission record
 * @param bulkAdmissionId - Bulk admission ID
 * @param recordId - Record ID
 * @param data - Updated record data
 * @returns Updated bulk admission record
 */
export const updateBulkAdmissionRecord = async (
  bulkAdmissionId: string,
  recordId: string,
  data: UpdateBulkAdmissionRecordRequest
): Promise<BulkAdmissionRecord> => {
  try {
    const response = await axiosInstance.patch<BulkAdmissionRecord>(
      `admission/bulk-admissions/${bulkAdmissionId}/records/${recordId}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating bulk admission record ${recordId}:`, error);
    throw error;
  }
};

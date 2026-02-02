/**
 * Bulk Admission Models
 * Represents bulk admission batch and record information
 */

export type BulkAdmissionStatus = 'uploaded' | 'verified' | 'committing' | 'committed' | 'partially_committed' | 'failed' | 'cancelled';
export type BulkRecordStatus = 'pending' | 'valid' | 'invalid' | 'committed' | 'failed' | 'warning';

/**
 * Bulk Admission Record
 */
export interface BulkAdmissionRecord {
  id: string;
  row_number: number;
  status: BulkRecordStatus;
  raw_data: Record<string, any>;
  validated_data: Record<string, any> | null;
  errors: string[] | null;
  warnings: string[] | null;
  missing_required_fields: string[] | null;
  prisoner_personal_number: string | null;
  prisoner_number: string | null;
  is_duplicate: boolean;
  duplicate_of: string | null;
  duplicate_match_type: string;
  existing_prisoner_data: Record<string, any>;
  user_edits: Record<string, any>;
  edited_at: string | null;
  committed_prisoner_id: string | null;
  committed_at: string | null;
  commit_error: string;
  final_data: Record<string, any> | null;
}

/**
 * Bulk Admission Batch
 */
export interface BulkAdmission {
  id: string;
  batch_name: string;
  status: BulkAdmissionStatus;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  committed_records: number;
  failed_records: number;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_at: string;
  verified_at: string | null;
  committed_at: string | null;
  committed_by: number | null;
  committed_by_name: string | null;
  validation_summary: Record<string, any> | null;
  processing_log: Array<Record<string, any>> | null;
  records?: BulkAdmissionRecord[];
}

/**
 * Bulk Admission List Response
 */
export interface BulkAdmissionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BulkAdmission[];
}

/**
 * Create Bulk Admission Request
 */
export interface CreateBulkAdmissionRequest {
  batch_name: string;
  file?: File;
}

/**
 * Bulk Admission Filters
 */
export interface BulkAdmissionFilters {
  page?: number;
  status?: BulkAdmissionStatus;
  uploaded_by?: number;
  search?: string;
  ordering?: string;
  date_from?: string;
  date_to?: string;
}

/**
 * Update Bulk Admission Record Request
 */
export interface UpdateBulkAdmissionRecordRequest {
  raw_data?: Record<string, any>;
  user_edits?: Record<string, any>;
}

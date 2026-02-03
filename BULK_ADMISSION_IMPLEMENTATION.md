# Bulk Admission Implementation

This document describes the implementation of the Bulk Admission feature for the PMIS system.

## Overview

The Bulk Admission feature allows users to upload multiple prisoner records at once via CSV/Excel files, validate them, and commit them to the system.

## Files Created

### Models
- **`src/models/admission/bulkAdmission.ts`**
  - `BulkAdmission` - Main bulk admission batch interface
  - `BulkAdmissionRecord` - Individual record in a batch
  - `BulkAdmissionListResponse` - API response for list endpoint
  - `CreateBulkAdmissionRequest` - Request payload for creating batch
  - `BulkAdmissionFilters` - Filter options for listing batches
  - Status types: `BulkAdmissionStatus`, `BulkRecordStatus`

### Services
- **`src/services/admission/bulkAdmissionService.ts`**
  - `getBulkAdmissions()` - Fetch list of bulk admissions with filters
  - `getBulkAdmissionById()` - Fetch single batch details
  - `createBulkAdmission()` - Create new batch with file upload
  - `deleteBulkAdmission()` - Delete a batch
  - `commitBulkAdmission()` - Commit valid records to system
  - `validateBulkAdmission()` - Trigger validation of batch

### Components
- **`src/components/admission/BulkAdmissionScreen.tsx`**
  - List view of all bulk admission batches
  - Search and filter functionality
  - Dialog for creating new bulk upload
  - Summary statistics (total, valid, invalid, committed records)
  - Click-through to detail screen

- **`src/components/admission/BulkAdmissionDetailScreen.tsx`**
  - Detailed view of a single batch
  - Summary cards showing record counts
  - Batch details (status, dates, uploaded by, etc.)
  - Tabbed view of records (All, Valid, Invalid, Committed, Failed)
  - Actions: Validate, Commit, Delete, Refresh
  - Individual record details with errors and warnings

### Routes
- **`src/routes/admission.routes.tsx`** (updated)
  - `/admissions-management/bulk-admissions` - List screen
  - `/admissions-management/bulk-admissions/:id` - Detail screen

### Index Files
- **`src/models/admission/index.ts`** (updated)
  - Added export for `bulkAdmission` models

## API Endpoints

### List Bulk Admissions
```
GET /api/admission/bulk-admissions/
Query Parameters:
  - page: number
  - status: BulkAdmissionStatus
  - uploaded_by: number
  - search: string
  - ordering: string
  - date_from: string
  - date_to: string
```

### Get Bulk Admission Details
```
GET /api/admission/bulk-admissions/{id}/
```

### Create Bulk Admission
```
POST /api/admission/bulk-admissions/
Content-Type: multipart/form-data
Body:
  - batch_name: string (required)
  - file: File (required, .csv/.xlsx/.xls)
```

### Validate Batch
```
POST /api/admission/bulk-admissions/{id}/validate/
```

### Commit Batch
```
POST /api/admission/bulk-admissions/{id}/commit/
```

### Delete Batch
```
DELETE /api/admission/bulk-admissions/{id}/
```

## Features

### BulkAdmissionScreen
- **List View**: Shows all bulk admission batches with key metrics
- **Search**: Filter batches by name
- **Status Filter**: Filter by batch status (uploaded, validating, validated, etc.)
- **New Upload Dialog**: 
  - Batch name input
  - File upload (CSV/Excel)
  - Automatic redirect to detail screen after upload
- **Status Badges**: Color-coded status indicators
- **Statistics**: Total, valid, invalid, and committed record counts
- **Empty State**: Helpful message when no batches exist

### BulkAdmissionDetailScreen
- **Summary Cards**: Quick overview of record counts
- **Batch Information**:
  - Status, uploaded by, dates
  - Validation summary
  - Processing logs
- **Actions**:
  - Validate: Trigger validation for uploaded batches
  - Commit: Process valid records (only for validated batches)
  - Delete: Remove batch with confirmation dialog
  - Refresh: Reload batch data
- **Records Table**:
  - Tabbed view (All, Valid, Invalid, Committed, Failed)
  - Row number, status, prisoner numbers
  - Duplicate detection indicators
  - Error and warning messages
  - Filterable by record status

## Status Flow

1. **uploaded** - File uploaded, awaiting validation
2. **validating** - Validation in progress
3. **validated** - Validation complete, ready to commit
4. **committing** - Commit in progress
5. **committed** - All valid records committed
6. **failed** - Process failed

## Record Statuses

- **pending** - Awaiting validation
- **valid** - Passed validation
- **invalid** - Failed validation
- **committed** - Successfully committed to system
- **failed** - Commit failed

## UI/UX Features

- Responsive design with Tailwind CSS
- Loading skeletons for better UX
- Toast notifications for actions
- Confirmation dialogs for destructive actions
- Color-coded status badges
- Empty states with helpful CTAs
- Real-time status updates via refresh
- Detailed error and warning messages

## Type Safety

All components are fully typed with TypeScript:
- Strict type checking for API responses
- Type-safe status enums
- Proper event handler typing
- Interface-based data structures

## Next Steps

To use the bulk admission feature:

1. Navigate to `/admissions-management/bulk-admissions`
2. Click "New Bulk Upload"
3. Enter a batch name and select a file
4. Click "Upload" - you'll be redirected to the detail screen
5. Click "Validate" to validate the records
6. Review validation results in the tabs
7. Click "Commit Records" to process valid records
8. Monitor progress and review any errors

## Notes

- File uploads use `multipart/form-data` encoding
- The API handles file parsing and validation
- Duplicate detection is performed automatically
- Records can be edited before committing (if API supports)
- Failed records can be reviewed and retried

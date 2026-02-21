# Changelog

---
**Author**: Derrick Wamani (Demani) | **Email**: derrickwamani98@gmail.com | **Website**: demani.net  
**Created**: February 6, 2026 | **Last Updated**: February 17, 2026
---

All notable changes to this project should be documented in this file.

## [Unreleased] - 2026-02-17 

### Added
- **Medical Module Forms - Inline Validation & Prisoner Number Formatting (February 16-17, 2026)**:
  - Refactored all 12 medical module forms to use inline validation messages instead of toast notifications
  - **Inline Validation Pattern**: Required field errors now display as red text directly below the input field
    - Replaced toast.error() calls with inline error state management
    - Added `errors` state to all forms: `const [errors, setErrors] = useState<Record<string, string>>({});`
    - Validation logic moved to handleSubmit with error object creation
    - Error display pattern: `{errors.field_name && <p className="text-sm text-red-600">{errors.field_name}</p>}`
  - **Prisoner Number Formatting**: Updated all forms to display `prisoner_number_value` (e.g., "P2022000043") instead of UUID
    - Pattern: `{prisoner?.prisoner_number_value || prisoner?.prisoner_number}` with fallback
    - Applied to read-only displays, edit mode displays, and SearchableSelect transformations
  - **Forms Refactored** (12 total):
    - **Death Details**: DeathConfirmationForm, DeathNotificationForm
    - **Recommendations**: WardRecommendationForm, TransferRecommendationForm, ReleaseRecommendationForm
    - **Medical Information**: AilmentForm, LabTestForm, TreatmentForm, DiagnosisForm, CaseBookForm, ExamResultForm, ScheduleForm
  - **DeathConfirmationForm Fixes**:
    - Fixed update button to use PATCH method instead of PUT
    - Implemented smart submission: JSON for updates without files, multipart/form-data for updates with files
    - Added `prisoner_number_value` field to DeathConfirmation interface
  - **DeathConfirmationList Fixes**:
    - Updated delete modal to show `prisoner_number_value` instead of UUID
    - Pattern: `{recordToDelete.prisoner_number_value || recordToDelete.prisoner_number}`
  - **Import Fixes**: Corrected `import { toast } from 'sonner@2.0.3';` to `import { toast } from 'sonner';` in 6 forms
  - **Files Modified**: 13 component files, 1 service file
  - **Documentation**: Created comprehensive refactoring guides in ma_ignore folder

- **Station Management - Manual Lockup & Staff Deployments UI Improvements (February 17, 2026)**:
  - **Manual Lockup Edit Modal - Location Dropdown Fix**:
    - Added `fetchManualLockupById()` service function to fetch complete record details by ID
    - Updated `handleEdit()` to call API endpoint `/station-management/api/manual-lockups/{id}/` before opening modal
    - Fixed location dropdown to populate with existing data using `eSetValue('location', r.location)`
    - Changed location dropdown from hardcoded values to dynamic API-driven locations
    - Location dropdown now uses `/system-administration/locations/` API with UUID values
  - **Tab Styling Standardization**:
    - Converted Manual Lockup Management tabs to match Visitation screen style
    - Converted Staff Deployments tabs to match Visitation screen style
    - Applied consistent dark red (#650000) background for active tabs
    - TabsList styling: `className="grid w-full grid-cols-N h-12 bg-muted/50"`
    - TabsTrigger styling: `className="text-base data-[state=active]:bg-[#650000] data-[state=active]:text-white data-[state=active]:shadow-sm"`
  - **Files Modified**: ManualLockupScreen.tsx, StaffDeploymentScreen.tsx, manualLockupIntegration.ts

- **Architectural Review & Security Roadmap Documentation (February 16, 2026)**:
  - Conducted comprehensive architectural review of PMIS codebase
  - Identified 7 major strengths: Modern tech stack, modular architecture, enterprise components, strong API integration, MFA auth, comprehensive docs, recent refactoring
  - Identified critical security vulnerabilities: Tokens in localStorage (XSS risk), no CSP, missing security headers, no rate limiting, weak password validation
  - Documented NIST 800-53, OWASP Top 10, and ISO 27001 compliance gaps
  - Created 18-week strategic improvement roadmap (5 phases)
  - **Documentation Created** (moved to ma_ignore folder):
    - ARCHITECTURAL_REVIEW_SUMMARY.md - Strengths, weaknesses, compliance gaps
    - SECURITY_ROADMAP_PHASE1.md - Critical security hardening (Weeks 1-4)
    - IMPROVEMENT_ROADMAP_PHASES2-5.md - Code quality, performance, UX (Weeks 5-18)
    - IMPLEMENTATION_GUIDE.md - Developer onboarding and best practices
    - MEDICAL_FORMS_REFACTOR_SUMMARY.md - Medical forms refactoring overview
    - MEDICAL_FORMS_REFACTOR_IMPLEMENTATION_GUIDE.md - Step-by-step implementation guide
    - MEDICAL_FORMS_REFACTOR_COMPLETE.md - Completion summary


## [Unreleased] - 2026-02-07 - 2026-02-13

- **Medical Death Notification Module - Backend Integration & Server-Side Pagination (14M+ Ready)**:
  - Fully refactored Death Notification module with live backend API integration
  - Removed Death Recipient tab from Death Details page (simplified to Confirmation & Notification only)
  - **Service Layer**: Created services for death notifications and notification templates
    - `deathNotificationService.ts`: Full CRUD operations with `DEATH_NOTIFICATION_API_ENDPOINTS`
    - `notificationService.ts`: System administration notification templates with server-side pagination
    - All services return paginated format: `{items: [], count: number, next: string | null}`
    - Interfaces: `DeathNotificationItem` (prisoner_name, death_confirmation, notification), `NotificationTemplate` with optional fields
  - **DeathNotificationList Server-Side Integration with DataTable**:
    - Replaced 400+ lines of manual table with enterprise DataTable component
    - Individual action buttons pattern: Eye (View), Pencil (Edit), Trash2 (Delete) - matching existing modules
    - Server-side pagination with automatic search/filter/sort from DataTable
    - tableKey auto-refresh pattern: increments after create/edit/delete operations
    - Fetch by ID pattern: `handleView` and `handleEdit` call `fetchDeathNotificationById` for complete data
    - Column definitions: Prisoner Name, Death Confirmation ID, Notification Template ID, Actions
    - Loading states, error handling with user-friendly toast messages
    - ConfirmDialog for delete confirmations with notification details display
  - **DeathNotificationForm Server-Side Dropdowns**:
    - **Death Confirmation dropdown**: Enhanced UX with comprehensive display labels
      - Shows: Prisoner Number, Name, Date of Death, and Cause of Death
      - Format: "ARPC0000000001/26 - Kathryn Robinson | Died: 2026-02-10 | Cause: ggf"
      - Addresses disambiguation: Multiple death records per prisoner now clearly distinguishable
      - SearchableSelect with `fetchDeathConfirmationsCallback` with data transformation layer
      - Search placeholder: "Search by prisoner number, name, or cause of death..."
    - Notification Template dropdown: SearchableSelect with `fetchNotificationsCallback` showing subjects
    - All fetch callbacks wrapped in `useCallback` to prevent API spam on form state changes
    - Edit mode dropdown fixes: Local state initialization with functions, initialItem derivation via find
    - Defensive coding: All optional fields handled with optional chaining
    - Validation: Required field checks for death_confirmation and notification
    - Recipients section removed per requirements (notification simplified to template selection only)
  - **DeathNotificationView Component**:
    - Updated to use service types with optional field handling
    - Displays notification ID, prisoner name, death confirmation ID, notification template ID
    - All fields have N/A fallbacks for missing data
    - Recipients section removed per requirements
  - **Type System Consolidation**:
    - Centralized all interfaces in service files
    - Made all critical fields optional in `DeathNotificationItem` and `Recipient`
    - Consistent imports across List, Form, and View components
    - Eliminated type mismatches between components
  - **Code Quality**: Removed 500+ lines of mock data, improved maintainability
  - **Files Created**: `deathNotificationService.ts`, `notificationService.ts` (360 lines total)
  - **Files Modified**: `DeathNotificationList.tsx` (net -250 lines), `DeathNotificationForm.tsx` (net -180 lines), `DeathNotificationView.tsx`, `DeathDetails.tsx` (removed recipient tab)
  - **Documentation**: Created `DEATH_NOTIFICATION_REFACTOR_SUMMARY.md` with comprehensive implementation details

- **Medical Death Confirmation Module - Backend Integration & Server-Side Pagination (14M+ Ready)**:
  - Fully refactored Death Confirmation module with live backend API integration
  - **Service Layer**: Created `deathConfirmationService.ts` with centralized API endpoints
    - `DEATH_CONFIRMATION_API_ENDPOINTS` constant: DEATH_CONFIRMATIONS, PRISONERS, STAFF_PROFILES
    - CRUD functions: `createDeathConfirmation`, `updateDeathConfirmation`, `deleteDeathConfirmation`, `fetchDeathConfirmationById`
    - Paginated fetch functions: `fetchDeathConfirmations`, `fetchPrisoners`, `fetchStaffProfiles` with cancellation error handling
    - All service functions return paginated responses: `{items: [], count: number, next: string | null}`
    - Interfaces: `DeathConfirmation` (18+ fields including death details, officer info, document attachments), `Prisoner`, `StaffProfile`, `PaginatedResponse<T>`
  - **DeathConfirmationList Migration to DataTable**:
    - Replaced manual table implementation (removed 300+ lines of mock data) with enterprise `DataTable` component
    - Server-side pagination (50 items per page), search, sort, and filter capabilities
    - Column definitions: prisoner number (monospace), prisoner name (bold), date of death (formatted), place of death (truncated), cause of death (truncated), officer in charge, medical officer, actions
    - Actions column with individual icon buttons: View (Eye), Edit (Pencil), Delete (Trash2 with red styling)
    - DataTable auto-refresh pattern with `tableKey` state for CRUD operations
    - Table refreshes immediately after create, edit, or delete operations
    - Removed manual pagination controls and search input
  - **DeathConfirmationForm Server-Side Dropdowns**:
    - Prisoner dropdown uses `CustomPrisonerSearch` component with built-in server-side pagination
    - Prisoner field disabled (read-only Input) in edit mode with muted background
    - Officer in Charge dropdown uses `StaffProfileSelect` with `fetchStaffProfilesCallback`
    - Medical Officer dropdown uses `StaffProfileSelect` with `fetchStaffProfilesCallback`
    - All fetch callbacks wrapped in `useCallback` to prevent unnecessary API calls
    - Edit mode dropdown population pattern: fetchById in handleEdit, local state initialization with useState functions, initialItem derivation
    - State synchronization: useEffect syncs formData with confirmation prop for edit/view modes
    - Reset pattern: useEffect resets form and local state when switching to create mode
    - Document attachments: death_certificate, medical_form, pathologist_attachment, other_attachment (URL/path input fields)
    - View mode: All fields read-only with bg-gray-50 styling, document links displayed
  - **Delete Confirmation Enhancement**:
    - Replaced AlertDialog with reusable `ConfirmDialog` component
    - Shows detailed record information: prisoner name & number, date of death (formatted), cause of death
    - Better error handling with async/await and throw pattern for ConfirmDialog cleanup
  - **Dialog Behavior**:
    - Added `onInteractOutside={(e) => e.preventDefault()}` to prevent accidental closes
    - Dialog key pattern: `key={\`form-\${dialogKey}-\${formMode}\`}` forces remount on mode change
    - All handlers use async/await with proper error handling and table refresh
  - **Code Quality**: Replaced 400+ lines of mock data and manual table with 300 lines of DataTable integration
  - **Files Created**: `src/services/medical/deathDetails/deathConfirmationService.ts` (250 lines)
  - **Files Modified**: `DeathConfirmationList.tsx` (net -150 lines), `DeathConfirmationForm.tsx` (net -100 lines with server-side dropdowns)
  - **Documentation**: Created `ma_ignore/DEATH_CONFIRMATION_REFACTOR_SUMMARY.md` with complete implementation details

- **Medical Release Recommendations Module - Backend Integration & Server-Side Pagination (14M+ Ready)**:
  - Fully refactored Release Recommendations module with live backend API integration
  - **Service Layer**: Created `releaseRecommendationService.ts` with centralized API endpoints
    - `RELEASE_RECOMMENDATION_API_ENDPOINTS` constant: RELEASE_RECOMMENDATIONS, PRISONERS
    - CRUD functions: `createReleaseRecommendation`, `updateReleaseRecommendation`, `deleteReleaseRecommendation`, `fetchReleaseRecommendationById`
    - Paginated fetch functions: `fetchReleaseRecommendations`, `fetchPrisoners` with cancellation error handling
    - All service functions return paginated responses: `{items: [], count: number, next: string | null}`
    - Interfaces: `ReleaseRecommendation` (30+ fields including medical assessment flags, support details, approval info), `PaginatedResponse<T>`
  - **ReleaseRecommendationList Migration to DataTable**:
    - Replaced manual table implementation with enterprise `DataTable` component
    - Server-side pagination (50 items per page), search, sort, and filter capabilities
    - Column definitions: prisoner number (monospace), prisoner name, date of report (formatted), abnormal condition (truncated), critical status (color-coded badge), approval status (badge), actions dropdown
    - Critical status badges: Yes (red), No (gray)
    - Actions column with View/Edit/Delete in dropdown menu
    - DataTable auto-refresh pattern with `tableKey` state for CRUD operations
    - Table refreshes immediately after create, edit, or delete operations
    - Removed manual pagination controls and search input
  - **ReleaseRecommendationForm Comprehensive Sections**:
    - **Prisoner Selection**: `CustomPrisonerSearch` with server-side pagination (disabled in edit/view modes)
    - **Medical Condition**: Abnormal condition, duration, cause fields
    - **Medical Assessment Flags** (8 switches): Life endangered, illness fatal, aggravated pain, contracted in prison, permanently unfit for labour, temporary removal to hospital, elderly/cripple/feeble, mental condition due to imprisonment, other observations textarea
    - **Support Assessment**: Friends/family support (switch), prisoner wishes (textarea), reoffending possibility (switch with conditional reason textarea), hospital support (switch with conditional details textarea)
    - **Recommendation Details**: Recommendation date, approval status, recommendation notes (textarea)
    - **Approval Information**: Approved by, approval date, approval notes (textarea)
    - Total 30+ fields organized into 6 logical sections
    - Prisoner field read-only in edit mode with muted background
    - Edit mode: Local state initialization with useState functions to prevent empty dropdowns
    - View mode: All fields read-only, displays data from `releaseRecommendation` prop
    - Async submit handler with proper error handling and toast notifications
  - **Delete Confirmation Enhancement**:
    - Replaced AlertDialog with reusable `ConfirmDialog` component
    - Shows detailed record information: prisoner name & number, abnormal condition, date of report
    - Better error handling with async/await and throw pattern for ConfirmDialog cleanup
  - **Dialog Behavior**:
    - Added `onInteractOutside={(e) => e.preventDefault()}` to prevent accidental closes
    - Dialog key pattern: `key={\`form-${dialogKey}-${formMode}\`}` forces remount on mode change
    - All handlers use async/await with proper error handling and table refresh
  - **Code Quality**: Replaced 300+ lines of mock data and manual table with 150 lines of DataTable integration
  - **Files Created**: `src/services/medical/recommendations/releaseRecommendationService.ts` (205 lines)
  - **Files Modified**: `ReleaseRecommendationList.tsx` (net -150 lines), `ReleaseRecommendationForm.tsx` (net +200 lines for comprehensive sections)
  - **Documentation**: Created `ma_ignore/RELEASE_RECOMMENDATION_REFACTOR_SUMMARY.md` with complete implementation details

- **Medical Transfer Recommendations Module - Backend Integration & Server-Side Pagination (14M+ Ready)**:
  - Fully refactored Transfer Recommendations module with live backend API integration
  - **Service Layer**: Created `transferRecommendationService.ts` with centralized API endpoints
    - `TRANSFER_RECOMMENDATION_API_ENDPOINTS` constant: TRANSFER_RECOMMENDATIONS, TRANSFER_REASONS, STATIONS, HOSPITALS, REFERRAL_CATEGORIES, PRISONERS
    - CRUD functions: `createTransferRecommendation`, `updateTransferRecommendation`, `deleteTransferRecommendation`, `fetchTransferRecommendationById`
    - Paginated fetch functions with cancellation error handling: `fetchTransferRecommendations`, `fetchTransferReasons`, `fetchStations`, `fetchHospitals`, `fetchReferralCategories`
    - All service functions return paginated responses: `{items: [], count: number, next: string | null}`
    - Interfaces: `TransferRecommendation` (15 fields), `TransferRecommendationReason`, `Station`, `Hospital`, `ReferralCategory`, `Prisoner`, `PaginatedResponse<T>`
  - **TransferRecommendationList Migration to DataTable**:
    - Replaced manual table implementation (removed 88 lines of manual table JSX) with enterprise `DataTable` component
    - Server-side pagination, search, sort, and filter capabilities
    - Column definitions: prisoner name (bold), prisoner number, reason name, hospital name, category (color-coded badges), notes (truncated at 80 chars with hover tooltip)
    - Category badges: Emergency (red), Urgent (orange), Routine (blue), Elective (green), Follow-up (purple)
    - Actions column with View/Edit/Delete icon buttons
    - DataTable auto-refresh pattern with `tableKey` state (string prefix "table-") for CRUD operations
    - Table refreshes immediately after create, edit, or delete operations
    - Removed 157 lines of mock data and 23 lines of manual pagination controls
  - **TransferRecommendationForm Server-Side Dropdowns**:
    - Prisoner dropdown uses `CustomPrisonerSearch` component with built-in server-side pagination
    - Prisoner field read-only in edit mode (consistent with other medical modules)
    - Reason dropdown uses `SearchableSelect` with `fetchReasonsCallback` (transfer recommendation reasons)
    - Station dropdown uses `SearchableSelect` with `fetchStationsCallback` (recommended prisons/stations)
    - Hospital dropdown uses `SearchableSelect` with `fetchHospitalsCallback` (referral hospitals)
    - Category dropdown uses `SearchableSelect` with `fetchCategoriesCallback` (referral categories)
    - All fetch callbacks wrapped in `useCallback` to prevent unnecessary API calls
    - Edit mode dropdown population pattern: fetchById, local state initialization with useState functions, initialItem derivation with useMemo
    - Multi-line `Textarea` for recommendation notes with medical justification placeholder
    - Proper validation with user-friendly toast error messages
  - **Delete Confirmation Enhancement**:
    - Replaced AlertDialog with reusable `ConfirmDialog` component
    - Shows detailed record information: prisoner name & number, reason, hospital, category, notes preview (100 chars)
    - Better error handling with async/await and throw pattern for ConfirmDialog cleanup
  - **Dialog Behavior**:
    - Added `onInteractOutside={(e: Event) => e.preventDefault()}` to prevent accidental closes
    - Dialog key pattern: `key={`dialog-${dialogKey}`}` forces remount on mode change (string prefix prevents React duplicate key warnings)
    - All handlers use async/await with proper error handling and table refresh
  - **Code Reduction**: Removed 281 lines total
    - 157 lines of mock data
    - 88 lines of manual table implementation
    - 23 lines of manual pagination controls
    - 13 lines of AlertDialog
  - **Bug Fixes Applied**:
    - Fixed edit mode dropdown blank issue with initialItem pattern
    - Applied unique string-based keys to prevent React duplicate key warnings (`table-${n}`, `dialog-${n}`)
    - Fixed TypeScript interface conflict by removing local duplicate interface
  - **Benefits**: Scalable for 14M+ records, consistent with Ward Recommendations/Station State/Food Assessment patterns, improved UX, production-ready
  - Files created: `src/services/medical/recommendations/transferRecommendationService.ts`, `TRANSFER_RECOMMENDATIONS_REFACTOR_SUMMARY.md`
  - Files refactored: `TransferRecommendationForm.tsx` (298 lines), `TransferRecommendationList.tsx` (321 lines, reduced from 439)
  - 2026-02-08

- **Medical Ward Recommendations Module - Backend Integration & Server-Side Pagination (14M+ Ready)**:
  - Fully refactored Ward Recommendations module with live backend API integration
  - **Service Layer**: Created `wardRecommendationService.ts` with centralized API endpoints
    - `WARD_RECOMMENDATION_API_ENDPOINTS` constant: WARD_RECOMMENDATIONS, WARDS, PRISONERS
    - CRUD functions: `createWardRecommendation`, `updateWardRecommendation`, `deleteWardRecommendation`, `fetchWardRecommendationById`
    - Paginated fetch functions with cancellation error handling: `fetchWardRecommendations`, `fetchWards`
    - All service functions return paginated responses: `{items: [], count: number, next: string | null}`
    - Interfaces: `WardRecommendation` (12 fields), `Ward` (14 fields), `Prisoner` (8 fields), `PaginatedResponse<T>`
  - **WardRecommendationList Migration to DataTable**:
    - Replaced manual table implementation with enterprise `DataTable` component
    - Server-side pagination, search, sort, and filter capabilities
    - Column definitions: prisoner name (bold), prisoner number, ward name, notes (truncated at 80 chars with hover tooltip)
    - Actions column with View/Edit/Delete icon buttons
    - DataTable auto-refresh pattern with `tableKey` state for CRUD operations
    - Table refreshes immediately after create, edit, or delete operations
    - Prisoner filter integration via `selectedPrisonerId` prop in tableUrl
  - **WardRecommendationForm Server-Side Dropdowns**:
    - Prisoner dropdown uses `CustomPrisonerSearch` component with built-in server-side pagination
    - Prisoner field read-only in edit mode (consistent with other medical modules)
    - Ward dropdown uses `SearchableSelect` with `fetchWardsPaginated` callback
    - Fetch callback wrapped in `useCallback` to prevent unnecessary API calls
    - Edit mode dropdown population pattern: fetchById, local state initialization, initialItem for SearchableSelect
    - Multi-line `Textarea` for recommendation notes (6 rows) with medical justification placeholder
    - Proper validation with user-friendly toast error messages
  - **Delete Confirmation Enhancement**:
    - Replaced AlertDialog with reusable `ConfirmDialog` component
    - Shows detailed record information: prisoner name & number, recommended ward, notes preview (100 chars)
    - Better error handling with async/await and throw pattern for ConfirmDialog cleanup
  - **Dialog Behavior**:
    - Added `onInteractOutside={(e: Event) => e.preventDefault()}` to prevent accidental closes
    - Dialog key pattern: `key={dialogKey}` forces remount on mode change
    - All handlers use async/await with proper error handling and table refresh
  - **Benefits**: Scalable for 14M+ records, consistent with Station State/Food Assessment patterns, improved UX, production-ready

- **Medical Food Assessment Module - Backend Integration & Server-Side Pagination (14M+ Ready)**:
  - Fully refactored Food Assessment module with live backend API integration
  - **Service Layer**: Created `foodAssessmentService.ts` with centralized API endpoints
    - `FOOD_ASSESSMENT_API_ENDPOINTS` constant: FOOD_ASSESSMENTS, STATIONS, FOOD_ITEMS, FOOD_QUALITIES
    - CRUD functions: `createFoodAssessment`, `updateFoodAssessment`, `deleteFoodAssessment`, `fetchFoodAssessmentById`
    - Paginated fetch functions with cancellation error handling: `fetchFoodAssessments`, `fetchStations`, `fetchFoodItems`, `fetchFoodQualities`
    - All service functions return paginated responses: `{items: [], count: number, next: string | null}`
  - **FoodAssessmentList Migration to DataTable**:
    - Replaced manual table implementation with enterprise `DataTable` component
    - Server-side pagination, search, sort, and filter capabilities
    - Rich column definitions with color-coded badges for quality ratings
    - Quality badges: Excellent (green), Good (blue), Fair (yellow), Poor (orange), Unacceptable (red)
    - Notes column with truncation (60 chars) and full text on hover
    - Actions column with View/Edit/Delete icon buttons
    - DataTable auto-refresh pattern with `tableKey` state for CRUD operations
    - Table refreshes immediately after create, edit, or delete operations
  - **FoodAssessmentForm Server-Side Dropdowns**:
    - Converted station dropdown to `SearchableSelect` with server-side pagination (read-only in edit mode)
    - Food item dropdown uses `SearchableSelect` with `fetchFoodItemsCallback`
    - Quality rating dropdown uses `SearchableSelect` with `fetchFoodQualitiesCallback`
    - All fetch callbacks wrapped in `useCallback` to prevent unnecessary API calls
    - Edit mode dropdown population pattern: fetchById, local state initialization, initialItem derivation
    - Station field disabled in edit mode (consistent with Station State module)
    - Proper validation with user-friendly toast error messages
  - **Delete Confirmation Enhancement**:
    - Replaced AlertDialog with reusable `ConfirmDialog` component
    - Shows detailed record information: station name, food item, quality rating, notes preview (100 chars)
    - Better error handling with throw pattern for ConfirmDialog cleanup
  - **Dialog Behavior**:
    - Added `onInteractOutside={(e: Event) => e.preventDefault()}` to prevent accidental closes
    - Dialog key pattern: `key={\`form-\${dialogKey}-\${formMode}\`}` forces remount on mode change
  - **Benefits**: Scalable for 14M+ records, consistent with Station State/Medical Restrictions patterns, improved UX, production-ready

- **Medical Station State Module - Backend Integration & Server-Side Pagination (14M+ Ready)**:
  - Fully refactored Station State module with live backend API integration
  - **Service Layer**: Created `stationStateService.ts` with centralized API endpoints
    - `STATION_STATE_API_ENDPOINTS` constant: STATION_STATES, STATIONS, RATINGS
    - CRUD functions: `createStationState`, `updateStationState`, `deleteStationState`, `fetchStationStateById`
    - Paginated fetch functions with cancellation error handling: `fetchStationStates`, `fetchStations`, `fetchRatings`
    - All service functions return paginated responses: `{items: [], count: number, next: string | null}`
  - **StationStateList Migration to DataTable**:
    - Replaced manual table implementation with enterprise `DataTable` component
    - Server-side pagination, search, sort, and filter capabilities
    - Rich column definitions with color-coded badges for congestion and ratings
    - Congestion badges: Red (≥200%), Orange (≥150%), Yellow (≥100%), Green (<100%)
    - Rating badges: Excellent (green), Good (blue), Fair (yellow), Poor (orange), Critical (red)
    - UUID fallback display: Shows truncated UUID (first 8 chars) with tooltip when _name fields missing
    - Actions column with View/Edit/Delete icon buttons
    - DataTable auto-refresh pattern with `tableKey` state for CRUD operations
    - Table refreshes immediately after create, edit, or delete operations
  - **StationStateForm Server-Side Dropdowns**:
    - Converted station dropdown to `SearchableSelect` with server-side pagination (read-only in edit mode)
    - All 6 rating dropdowns use `SearchableSelect` with shared `fetchRatingsCallback`
    - All fetch callbacks wrapped in `useCallback` to prevent unnecessary API calls
    - Edit mode dropdown population pattern: fetchById, local state initialization, initialItem derivation
    - Station field disabled in edit mode to prevent station changes
    - Proper validation with user-friendly toast error messages
  - **Delete Confirmation Enhancement**:
    - Replaced AlertDialog with reusable `ConfirmDialog` component
    - Shows detailed record information before deletion: station name, congestion level, building rating, environment rating
    - Better error handling with throw pattern for ConfirmDialog cleanup
  - **Dialog Behavior**:
    - Added `onInteractOutside={(e: Event) => e.preventDefault()}` to prevent accidental closes
    - Dialog key pattern: `key={\`form-\${dialogKey}-\${formMode}\`}` forces remount on mode change
  - **Benefits**: Scalable for 14M+ records, consistent with Medical Restrictions/Dietary patterns, improved UX, production-ready

- **Medical Dietary Requirements - Grouped Table View with DataTable (UX ENHANCEMENT)**:
  - Implemented grouped/collapsible table using DataTable's built-in grouping feature
  - **DataTable Grouping Configuration**:
    - Groups dietary requirements by prisoner_name (API currently doesn't provide prisoner_number)
    - Displays prisoner name with count of dietary requirements per prisoner
    - Shows summary statistics: Active (green), Inactive (gray), Total (brand color #650000)
    - Date range display showing earliest start date to latest end date per prisoner
    - `defaultExpanded: false` - groups start collapsed for cleaner initial view
  - **View Toggle**: Added Grouped vs Flat view tabs in `DietaryRequirementList.tsx`
    - Default to grouped view for better UX
    - Users icon for grouped view, flat list for standard view
    - Seamless switching with same DataTable component
  - **Implementation Approach**: Uses DataTable's `grouping` config option (matches Prisoner Restrictions pattern)
    - `groupBy: 'prisoner_name'` - groups by prisoner name (will update to prisoner_number when API adds it)
    - `renderGroupHeader` shows prisoner info, requirement count, date range, and summary stats
    - Single unified component handles both flat and grouped views
  - **Files Modified**: DietaryRequirementList.tsx (added viewMode state, tableConfig with grouping, view toggle tabs)
  - **Benefit**: Dramatically improves UX for viewing dietary requirements, especially when prisoners have multiple requirements, while maintaining all DataTable features

### Fixed
- **Medical Dietary Requirements - DataTable URL Format (CRITICAL FIX)**:
  - Fixed 404 error when DataTable tried to fetch from `/api/data-table/` endpoint
  - **Root Cause**: tableUrl used wrapper format that doesn't exist on backend
  - **Solution**: Changed to direct endpoint `medical-management/dietary-requirements/`
  - **Files Modified**: DietaryRequirementList.tsx (buildTableUrl function)
  - **Benefit**: DataTable now fetches from correct API endpoint without errors

- **Medical Dietary Requirements - Column Definition Format Mismatch**:
  - Fixed "Each child in a list should have a unique 'key' prop" warnings
  - **Root Cause**: Used TanStack Table format (`accessorKey`, `header`, `cell`) instead of DataTable format
  - **Solution**: Converted all columns to DataTable format (`key`, `label`, `render`)
  - **Files Modified**: DietaryRequirementList.tsx (columns definition)
  - **Benefit**: Table renders correctly without console warnings

- **Medical Dietary Requirements - Backend Filter Parameter Issue**:
  - Removed `prisoner_restriction` filter parameter that was causing 400 Bad Request errors
  - **Root Cause**: Backend doesn't support filtering by prisoner_restriction parameter
  - **Solution**: Commented out filter logic with TODO notes for when backend adds support
  - **Files Modified**: DietaryRequirementList.tsx (removed selectedPrisonerId filtering)
  - **Benefit**: Table loads without API errors

- **Medical Dietary Requirements - API Calls on Every Keystroke (PERFORMANCE FIX)**:
  - Fixed unnecessary API calls to prisoner restrictions endpoint on every keystroke in form fields
  - **Root Cause**: `fetchRestrictionsCallback` function recreated on every render, triggering SearchableSelect re-fetch
  - **Solution**: Wrapped `fetchRestrictionsCallback` in `useCallback` with empty dependency array
  - **Pattern**: `const fetchRestrictionsCallback = useCallback(async (opts, signal) => { ... }, [])`
  - **Files Modified**: DietaryRequirementForm.tsx (added useCallback import, wrapped fetch function)
  - **Benefit**: Eliminates unnecessary API calls, improves performance and user experience

- **Medical Dietary Requirements - Prisoner Field Edit Mode Lock**:
  - Disabled prisoner restriction field in edit mode to prevent changing prisoner for existing requirements
  - **Implementation**: Edit mode shows prisoner name in muted disabled div with `bg-gray-50` styling
  - **Display Fallback**: Shows `prisoner_restriction_info` if available, otherwise `prisoner_name`, or "N/A"
  - **Data Integrity**: Prevents orphaned dietary requirements by locking prisoner association
  - **Files Modified**: DietaryRequirementForm.tsx (prisoner field conditional rendering)

- **Medical Dietary Requirements - Multiple Syntax Errors During Refactoring**:
  - Fixed cascading syntax errors that occurred during conversion from custom grouped component to DataTable grouping
  - **Issues Fixed**: JSX code inserted inside tableConfig useMemo, missing button closing tags, duplicate JSX sections, corrupted comment markers
  - **Solution**: Multiple targeted replacements to remove misplaced code, complete JSX elements, remove duplicates
  - **Files Modified**: DietaryRequirementList.tsx (multiple syntax corrections)
  - **Benefit**: File compiles without errors

### Changed
- **Medical Restriction & Dietary Module - Global Prisoner Search Removal (UX IMPROVEMENT)**:
  - Removed global prisoner search component from module for cleaner, simpler interface
  - **Rationale**: 
    - Redundant with DataTable search (searches prisoner names already)
    - Caused confusion with two different search behaviors
    - Inconsistent behavior across tabs (worked on restrictions, failed on dietary due to backend limitations)
    - Reduced visual clutter and cognitive load
  - **Changes**:
    - Removed `PrisonerSearchScreenWider` component and entire "Prisoner Information Section" card
    - Removed `selectedPrisonerId` state and `handlePrisonerChange` function
    - Removed `selectedPrisonerId` prop from both `PrisonerRestrictionList` and `DietaryRequirementList`
    - Removed `DietaryRequirementListProps` and `PrisonerRestrictionListProps` interfaces
    - Removed all references to `selectedPrisonerId` in URL building and filtering logic
    - Removed conditional rendering of view toggle tabs (now always visible)
  - **Files Modified**: RestrictionAndDietaryDetails.tsx, PrisonerRestrictionList.tsx, DietaryRequirementList.tsx
  - **Benefit**: Cleaner UI, consistent UX, users can still search by prisoner name using DataTable search

- **Medical Stations & Assessment Module - Global Prisoner Search Removal (UX IMPROVEMENT)**:
  - Removed global prisoner search component for consistency with Restriction & Dietary module
  - **Changes**:
    - Removed `PrisonerSearchScreenWider` component and "Prisoner Information Section" card
    - Removed `selectedPrisonerId` state and `handlePrisonerChange` function  
    - Removed `selectedPrisonerId` prop from both `StationStateList` and `FoodAssessmentList`
  - **Files Modified**: StationsAndAssessmentDetails.tsx, StationStateList.tsx, FoodAssessmentList.tsx
  - **Benefit**: Consistent UX across medical modules, simpler interface

- **Backend Integration Prompt Template Enhancement - API Call Prevention Pattern**:
  - Added comprehensive guidance to prevent API calls on every keystroke in forms
  - **New Section**: "Preventing Unnecessary API Calls (CRITICAL)" with wrong vs correct code examples
  - **Pattern**: Wrap ALL fetchPaginated callbacks in `useCallback` with empty dependency array
  - **Code Example**: Shows incorrect function recreation vs memoized callback
  - **Common Issues**: Added "API calls on every keystroke - Fixed by wrapping fetchPaginated in useCallback"
  - **Files Modified**: ma_ignore/BACKEND_INTEGRATION_PROMPT.md
  - **Benefit**: Prevents performance issues in all future module implementations

## [Released] - 2026-02-06

### Added
- **Property Management - Grouped Table Views with DataTable (UX ENHANCEMENT)**:
  - Extended grouped table pattern to Property Management module screens
  - **PrisonerPropertyAccountScreen.tsx Updates**:
    - Added grouped view for Accounts tab with prisoner_number grouping
    - Added grouped view for Transactions tab with prisoner_number grouping
    - View toggle (Grouped/Flat) for both accounts and transactions tables
    - Updated columns to use `prisoner_number` as key with dual display (number + name)
    - Account group headers show: prisoner_number | prisoner_name, total balances per currency, account counts
    - Transaction group headers show: prisoner_number | prisoner_name, Credits/Debits/Net amounts per currency, transaction counts
    - Conditional config using spread operator to preserve expandable functionality in both views
    - Color coding: green for credits, red for debits, brand color for totals
  - **PrisonerPropertyScreen.tsx Updates**:
    - Added grouped view for Property records with prisoner_number grouping
    - View toggle (Grouped/Flat) above property table
    - Updated prisoner column from prisoner_name to prisoner_number key
    - Property group headers show: prisoner_number | prisoner_name (with Users icon), total amounts per currency, property counts by status
    - Summary stats with status badges (Stored, Released, Damaged, etc.)
    - Wrapped in Card component for consistent styling
  - **Implementation Pattern**:
    - All use DataTable's built-in `config.grouping` option (not separate components)
    - Conditional config: `viewMode === 'grouped' ? { grouping: {...} } : {}`
    - Group by unique `prisoner_number` to prevent confusion with similar names
    - Display format: "PRISONER_NUMBER | PRISONER_NAME" in all group headers
    - Default to grouped view for better organization
    - Seamless toggle with same DataTable component
  - **Files Modified**: PrisonerPropertyAccountScreen.tsx, PrisonerPropertyScreen.tsx
  - **Benefit**: Consistent UX across Medical and Property modules, better data organization for prisoners with multiple accounts/transactions/properties

- **Medical Restriction Management - Grouped Table View with DataTable (UX ENHANCEMENT)**:
  - Implemented grouped/collapsible table using DataTable's built-in grouping feature
  - **DataTable Grouping Configuration**:
    - Groups restrictions by prisoner_number (unique identifier prevents name confusion)
    - Custom `renderGroupHeader` displays: `PRISONER_NUMBER | PRISONER_NAME` format
    - Summary statistics per prisoner: Active (green), Inactive (gray), Total (brand color) restriction counts
    - Date range display: earliest start date → latest end date with calendar icon
    - Collapsible/expandable rows: click entire header to expand/collapse
    - ChevronDown (expanded) / ChevronRight (collapsed) icons
    - `defaultExpanded: false` - groups start collapsed for cleaner initial view
  - **View Toggle**: Added Grouped vs Flat view tabs in `PrisonerRestrictionList.tsx`
    - Default to grouped view for better UX
    - Switch to flat view when filtering by specific prisoner
    - Icons: Users for grouped, List for flat
    - Seamless switching with same DataTable component
  - **DataTable Features Maintained**:
    - All standard DataTable features work in grouped mode: pagination, search, CSV/PDF export, print
    - Expand All / Collapse All buttons automatically appear in grouped mode
    - Server-side pagination compatibility
    - Sort and filter capabilities
  - **UX Improvements**:
    - Prevents confusion with similar prisoner names by showing unique prisoner_number first
    - Better data scan-ability - see all restrictions per prisoner at a glance
    - Summary stats eliminate need to count manually
    - Reduced scrolling through mixed records
    - Visual hierarchy with icons (User, Calendar)
    - Color-coded statistics for quick assessment
  - **Implementation Approach**: Uses DataTable's `grouping` config option (not separate component)
    - `groupBy: 'prisoner_number'` - column to group by
    - `renderGroupHeader` - custom React component for group header rendering
    - Conditional config based on viewMode state
    - Single unified component handles both flat and grouped views
  - **Files Modified**: PrisonerRestrictionList.tsx (added viewMode state, tableConfig with grouping, view toggle tabs)
  - **Documentation**: 
    - `GROUPED_DATATABLE_PATTERN.md` - comprehensive guide with DataTable grouping config examples
    - `MEDICAL_RESTRICTION_GROUPED_TABLE_SUMMARY.md` - visual summary and usage guide
    - `BACKEND_INTEGRATION_PROMPT.md` - when to use grouped tables in new modules
  - **Benefit**: Dramatically improves UX for viewing prisoner restrictions, especially when prisoners have multiple restrictions, while maintaining all DataTable features

### Fixed
- **Medical Restriction Management - Edit Mode Dropdown Population (CRITICAL FIX)**:
  - Fixed dropdowns showing empty/placeholder text when editing restrictions after page refresh
  - **Root Cause**: Row data from DataTable didn't include nested name fields (reason_name, station_name) needed for dropdown population
  - **Solution**: Implemented fetchById pattern in edit handlers
    - `handleEdit` and `handleView` now call `fetchRestrictionById(record.id)` to get complete record data
    - Full API response includes all nested fields: reason_name, station_name, prisoner_name, prisoner_number
    - Added proper error handling with toast notifications for failed fetches
  - **Local State Initialization**: Changed from `useState(null)` to `useState(() => restriction?.field_id || null)`
    - Initializes with correct value immediately if restriction data available
    - Prevents SearchableSelect from caching empty state before value arrives
    - Applied to both `localReasonValue` and `localStationValue`
  - **Derived initialItem Pattern**: Compute initialItem directly from restriction prop before render
    - `const initialReason = (restriction && mode === 'edit' && restriction.reason && restriction.reason_name) ? {id, name} : null`
    - Pass to SearchableSelect as `initialItem={initialReason ?? undefined}`
    - Provides display name immediately without additional fetch
  - **useEffect Synchronization**: Added proper state sync when restriction data changes
    - Watches `restriction?.reason` and `restriction?.place_of_medical_attention` for changes
    - Updates local state to keep controlled components in sync
  - **Pattern Applied**: Follows SEARCHABLE_DROPDOWN_EDIT_MODE_GUIDE.md universal solution
  - **Files Modified**: PrisonerRestrictionList.tsx (handleEdit/handleView, imports), PrisonerRestrictionForm.tsx (local state initialization)
  - **Benefit**: Edit mode now works correctly after page refresh with all dropdowns properly populated

- **Medical Restriction Management - CORS Error Resolution**:
  - Fixed "Cross-Origin Request Blocked" errors when fetching restrictions data
  - **Root Cause**: Service functions using raw `axios` instead of configured `axiosInstance`
  - **Solution**: Changed all service functions to use `axiosInstance` from `../../axiosInstance`
    - axiosInstance includes auth headers, base URL, and proper CORS configuration
    - All fetch functions (fetchRestrictions, fetchRestrictionReasons, fetchStations, etc.) now use axiosInstance
  - **Files Modified**: restrictionService.ts (all CRUD and fetch functions)

- **Medical Restriction Management - API Endpoint Correction**:
  - Fixed stations dropdown using wrong API endpoint
  - **Changed**: `/station-management/stations/` → `/system-administration/stations/`
  - **Files Modified**: restrictionService.ts (RESTRICTION_API_ENDPOINTS.STATIONS, fetchStations function)

- **Medical Restriction Management - View Mode Display Fix**:
  - Fixed start/end date and state fields showing "N/A" in view mode when valid data exists
  - **Root Cause**: View mode displaying `formData` state instead of original `restriction` prop
  - **Solution**: Changed view mode read-only fields to use `restriction` prop directly
    - Start date: `restriction?.start_date ? format(new Date(restriction.start_date), 'PPP') : 'N/A'`
    - End date: `restriction?.end_date ? format(new Date(restriction.end_date), 'PPP') : 'N/A'`
    - State: `restriction?.state_of_prisoner || 'N/A'`
  - **Files Modified**: PrisonerRestrictionForm.tsx (view mode field rendering)

- **Medical Restriction Management - Prisoner Field Edit Mode Lock**:
  - Disabled prisoner field in edit mode to prevent changing prisoner for existing restrictions
  - **Implementation**: 
    - Edit mode shows prisoner name/number in muted disabled div with `bg-muted` styling
    - View mode shows prisoner name/number in gray read-only div with `bg-gray-50` styling
    - Create mode retains full CustomPrisonerSearch functionality
  - **Data Integrity**: Prevents orphaned restrictions by locking prisoner association
  - **Files Modified**: PrisonerRestrictionForm.tsx (prisoner field conditional rendering)

### Changed
- **Medical Restriction Management - Delete Confirmation UX Enhancement**:
  - Replaced AlertDialog with reusable ConfirmDialog component for delete operations
  - **Improvements**:
    - Shows rich record details before deletion: prisoner name/number, restriction reason, medical facility
    - Store full record object in state instead of just ID for better context
    - Uses `details` prop with styled gray box for record preview
    - Consistent delete confirmation pattern across application
    - Better error handling with throw pattern for ConfirmDialog cleanup
  - **State Changes**: 
    - `recordToDelete` now stores `PrisonerRestriction | null` instead of `string | null`
    - Renamed `showDeleteDialog` to `deleteDialogOpen` for consistency
  - **Files Modified**: PrisonerRestrictionList.tsx (imports, state, handlers, delete dialog)

### Added
- **Backend Integration Prompt Template Enhancement**:
  - Created comprehensive prompt template at `ma_ignore/BACKEND_INTEGRATION_PROMPT.md`
  - **Includes Complete Patterns For**:
    - Backend integration with centralized API endpoints
    - DataTable migration with server-side pagination
    - Server-side dropdown conversion (SearchableSelect, StaffProfileSelect, CustomPrisonerSearch)
    - **Edit mode dropdown fixes** (CRITICAL section with 7-step implementation guide)
    - Delete confirmation with ConfirmDialog component (full code examples)
    - Form component patterns (disabled fields, date pickers, validation)
    - Dialog behavior (onInteractOutside, key props)
  - **Code Examples**: Complete handleEdit/handleView async patterns, local state initialization, initialItem derivation
  - **Success Criteria Checklist**: 11 items covering API, DataTable, dropdowns, CRUD operations
  - **Common Issues Prevention**: Lists 6 common pitfalls with solutions
  - **Reference Implementation**: Links to Medical Restriction Management files and guides
  - **Template Version**: 2.0 (Created February 6, 2026)
  - **Purpose**: Ensures all future module refactoring automatically handles edit mode dropdown population correctly

## [Released] - 2026-02-05

### Added
- **Medical Restriction Management - Comprehensive Module Refactoring (14M+ Ready)**:
  - Fully refactored Prisoner Restrictions module with backend integration and server-side pagination
  - **Service Layer**: Created `restrictionService.ts` with centralized API endpoints
    - `RESTRICTION_API_ENDPOINTS` constant: RESTRICTIONS, RESTRICTION_REASONS, PRISONERS, STATIONS
    - `fetchRestrictions()`: Paginated fetch with search/filtering (50 items/page)
    - `fetchRestrictionReasons()`: Server-side dropdown pagination for restriction reasons
    - `fetchStations()`: Server-side dropdown pagination for medical facilities
    - `fetchRestrictionReasonById()`, `fetchStationById()`: Single item fetch for edit mode
    - `createRestriction()`, `updateRestriction()`, `deleteRestriction()`: Full CRUD operations
    - All fetch functions silence cancellation errors (CanceledError, ERR_CANCELED, AbortError)
  - **PrisonerRestrictionForm Enhancements**:
    - Converted prisoner dropdown to `CustomPrisonerSearch` with server-side pagination
    - Converted restriction reason dropdown to `SearchableSelect` with `fetchRestrictionReasons` callback
    - Converted place of medical attention dropdown to `SearchableSelect` with `fetchStations` callback
    - Added comprehensive field validation with inline error messages below each required field
    - Implemented proper edit mode data loading using `fetchRestrictionReasonById` and `fetchStationById`
    - Added `key` props to all dropdowns: `key={field-${dialogOpen}}` to prevent state leakage
    - Functional setState pattern: `prev => ({ ...prev, field: value })` for all form updates
    - Added `onInteractOutside={(e) => e.preventDefault()}` to DialogContent to prevent accidental closes
    - Proper form reset on mode change (create/edit/view)
  - **PrisonerRestrictionList Migration to DataTable**:
    - Replaced custom table implementation with enterprise `DataTable` component
    - Integrated `useFilterRefresh` hook for global filter synchronization (region/district/station)
    - Removed manual pagination, search, and loading states (DataTable handles internally)
    - Added rich column definitions with formatted dates, badges for status, prisoner info with numbers
    - Actions column: View (blue), Edit (amber), Delete (red) with icon-only buttons
    - Proper CRUD operations: Create/Update use toast notifications, Delete has confirmation dialog
    - DataTable automatically refreshes after CRUD operations via URL state management
    - Supports filtering by `selectedPrisonerId` prop for prisoner-specific restriction views
  - **Benefits**: Scalable for 14M+ records, consistent with Housing Allocation/Journal/Complaints patterns, improved UX, production-ready polish
  - Files created: `src/services/medical/restrictionAndDietary/restrictionService.ts`
  - Files refactored: `PrisonerRestrictionForm.tsx`, `PrisonerRestrictionList.tsx`

## [Released] - 2026-02-04

### Added
- **Medical Records Management - Modular Folder Structure Refactoring**:
  - Reorganized 48 medical component files from flat structure into menu-aligned modular architecture
  - Created 5 main sub-modules matching UI navigation: medicalInformation, restrictionAndDietary, stationsAndAssessment, recommendations, deathDetails
  - Each sub-module contains organized feature folders (e.g., bmi, caseBook, schedules under medicalInformation)
  - Created parallel services folder structure with barrel export index.ts files for future service implementations
  - Updated medical.routes.tsx imports to reflect new component paths
  - Used `git mv` for all file moves to preserve Git history
  - Created comprehensive MEDICAL_MODULE_STRUCTURE.md documentation with import examples and design principles
  - Benefits: Menu-aligned navigation, reduced merge conflicts, clear feature boundaries, scalable for future growth
  - Pattern established for refactoring other flat modules (Discharge, Gate, Station, Rehabilitation)
  - Files modified: 48 component files moved, 19 component subfolders created, 5 service subfolders created, medical.routes.tsx updated
  - Commits: 9d6c64a (refactoring), af3e233 (documentation), 3998234 (template to ma_ignore)

- **Module Refactoring Prompt Template**:
  - Created reusable prompt template for reorganizing flat module structures
  - Includes step-by-step customization guide for any module
  - Example implementation for Discharge module
  - Quick checklist and expected output structure
  - References Medical module refactoring (9d6c64a) as pattern
  - Moved to ma_ignore/ folder for personal reference (not shared with team)
  - Location: ma_ignore/MODULE_REFACTORING_PROMPT_TEMPLATE.md
  - **Enhanced with comprehensive import fixing guidance**:
    - Added detailed "Import Path Correction Strategy" section with file depth calculation guide
    - Included PowerShell bulk fix commands for 2-level and 3-level deep files
    - Step-by-step fix order: routes → containers → 2-level → 3-level → verify
    - Common import patterns and examples for different file depths
    - "Common Pitfalls to Avoid" section warning about import path errors, inconsistent depth, overcorrection
    - Updated deliverables, best practices, quick checklist, and example sections with import fixing steps
    - Template now provides complete end-to-end guidance from restructuring through import corrections
    - Commit: b6ed521

### Fixed
- **Medical Records Management - Import Path Corrections After Restructuring** (CRITICAL):
  - Fixed all broken import paths caused by moving 48 files from flat to nested folder structure
  - **Problem**: Moving files to different depths broke relative imports (e.g., `../ui/button` worked at 1 level, broke at 2-3 levels deep)
  - **Solution**: Systematic correction based on file depth from `src/components/`:
    - Files at 2 levels deep (e.g., `medical/subfolder/Component.tsx`): `../ui/` → `../../ui/`
    - Files at 3 levels deep (e.g., `medical/sub1/sub2/Component.tsx`): `../ui/` → `../../../ui/`
    - Container files: `./Component` → `./subfolder/Component`
  - **Fix Order Applied**:
    1. Updated route file imports first (medical.routes.tsx)
    2. Fixed container component imports to subfolders (MedicalDetails, DeathDetails, RestrictionAndDietaryDetails, StationsAndAssessmentDetails, RecommendationsDetails)
    3. Bulk PowerShell corrections for 2-level deep files
    4. Bulk PowerShell corrections for 3-level deep files
    5. Corrected overcorrected paths (reduced `../../../../` to `../../../` where files were only 3 levels deep)
  - **Container Import Fixes**:
    - MedicalDetails: 8 Screen components now import from respective subfolders (bmi/BMIScreen, caseBook/CaseBookScreen, etc.)
    - DeathDetails: imports from deathConfirmation/, deathNotification/, deathRecipient/
    - RestrictionAndDietaryDetails: imports from restrictions/, dietary/
    - StationsAndAssessmentDetails: imports from stationState/, foodAssessment/
    - RecommendationsDetails: imports from wardRecommendations/, transferRecommendations/, releaseRecommendations/
  - **PowerShell Bulk Corrections**:
    - Pattern: `Get-ChildItem -Recurse | ForEach-Object { $c = (Get-Content) -replace 'pattern', 'replacement'; Set-Content }`
    - Applied regex replacements across all 48 medical component files
    - Final pass corrected overcorrections (4 levels → 3 levels)
  - **Result**: All Vite import resolution errors resolved, dev server runs without errors on port 3001
  - **Impact**: 55 files changed (48 component files + 7 documentation/service files)
  - Commit: b6ed521

- **Property Management - DataTable Not Refreshing After CRUD Operations**:
  - **Problem**: When creating/updating/deleting accounts or transactions, stat cards updated but DataTable didn't refresh until manual page reload
  - **Root Cause**: DataTable component has internal data fetching that only refetches when dependencies change (url, region, district, station). Since none changed after CRUD operations, DataTable didn't know to refetch.
  - **Solution**: Force DataTable remount using React key prop pattern
    - Added two state variables: `accountsTableKey` and `transactionsTableKey`
    - Added `key` props to both DataTable components: `<DataTable key={accountsTableKey} ... />`
    - Increment keys after every CRUD operation to force React remount
  - **CRUD Handlers Updated**:
    - `handleCreateAccount`: Increments both keys after successful account creation
    - `handleUpdateAccount`: Increments both keys after successful account update
    - `handleDeleteAccount`: Increments both keys after successful account deletion
    - `handleCreateTransaction`: Increments both keys after successful transaction creation
    - `handleUpdateTransaction`: Increments both keys after successful transaction update
    - `handleDeleteTransaction`: Increments both keys after successful transaction deletion
  - **Benefits**:
    - DataTable remounts trigger internal `useEffect` to refetch data
    - Both stat cards and tables now update synchronously after CRUD operations
    - No manual page refresh needed
    - Clean implementation without modifying DataTable component itself
  - File modified: PrisonerPropertyAccountScreen.tsx
  - Commit: 934d2cc

### Changed
- **Git Branch Synchronization - Upstream Integration**:
  - Successfully merged upstream/staging into pmis_team branch with selective conflict resolution
  - Resolved 58 merge conflicts across components, services, and configuration files
  - Strategy: Kept pmis_team versions for custom work (property, station modules, services), accepted upstream versions for shared components (gate, layout, routes, utilities)
  - Integrated 150+ new files from upstream: medical module, discipline module, reports, earning scheme, comprehensive documentation guides
  - Updated package-lock.json from upstream and ran npm install for dependency consistency
  - Preserved all local Property Management enhancements from 2026-02-02
  - Merge commit: fa67114 on pmis_team branch
  - Branch now synchronized with team repository while maintaining local innovations

## [Released] - 2026-02-02

### Added
- **Property Management - Quick Transaction Creation from Account Groups**:
  - Added "Add Transaction" button to prisoner account group headers for streamlined workflow
  - Smart pre-population: Auto-selects account when prisoner has only one account, leaves empty for manual selection when multiple accounts exist
  - Green button styling (`bg-green-600`) distinguishes transaction creation from account creation (red `#650000`)
  - Event handling with `e.stopPropagation()` prevents group collapse/expand when clicking button
  - Context-aware UX: Opens transaction dialog with prisoner context already established
  - Eliminates workflow friction: No tab switching, no prisoner re-selection needed
  - Industry-standard pattern: Natural next action when reviewing accounts
  - Files modified: PrisonerPropertyAccountScreen.tsx (renderGroupHeader function, lines 1372-1415)

### Fixed
- **Property Management - Accounts Table Simplification and CRUD Operations**:
  - Removed non-functional expandable/collapse functionality from accounts table (expand buttons did nothing)
  - Root cause: Regular `DataTable` component doesn't support `expandable` config, only `grouping` config
  - Decision: Removed collapse feature entirely rather than switching to `DataTableCollapsableRows` component
  - Cleaned up state management: Removed `expandedAccounts` Set, `toggleAccountExpansion()` function, and `getAccountTransactions()` helper
  - Removed expand column with chevron icons from accountColumns array
  - Activated edit and delete buttons in accounts actions column (were previously commented out)
  - Actions column now provides full CRUD: View (Eye icon), Edit (Pencil icon), Delete (Trash icon, red)
  - Edit button pre-populates form with deep cloned account data for safe editing
  - Delete button triggers confirmation dialog before removal
  - Simpler, cleaner component with fewer state updates and clearer code
  - Files modified: PrisonerPropertyAccountScreen.tsx (state cleanup lines 119-120, actions column lines 635-724)

## [Released] - 2026-02-01

### Added
- **Property Management - Performance Optimization (IN PROGRESS - NEEDS REVISIT)**:
  - **Note**: API reloading on keystroke issue NOT fully resolved - requires architectural changes
  - Initial attempt: Wrapped handlers in useCallback, memoized calculations
  - Current status: Still experiencing API calls on every keystroke in form fields
  - Next approach: Consider autonomous component pattern with local state management
  - Files affected: CreatePropertyForm.tsx, PrisonerPropertyScreen.tsx, PropertyItem.tsx
  
- **Visitor Items Management - Edit/Delete Restrictions for Collected Items**:
  - Implemented multi-layer protection system to prevent modifications to collected items (is_collected: true)
  - **Visual Layer**: Edit and Delete buttons show disabled state with reduced opacity and cursor-not-allowed styling
  - **Functional Layer**: Early return checks in handleEdit and handleDelete functions prevent API calls
  - **Communication Layer**: Explanatory tooltips on hover ("Cannot edit/delete collected items") and toast error messages
  - Protection applies when item has already been collected by prisoner (immutable business logic)
  - Delete button styling changes from red to gray when disabled for clear visual indication
  - Prevents accidental data corruption while maintaining excellent UX with multiple feedback mechanisms
  - Files modified: VisitorItemList.tsx (handleEdit, handleDelete, Actions column render function)

- **Visitor Items Management - Enhanced Table Columns**:
  - Added **Measurement Unit** column: Displays quantity with unit (e.g., "5 Kg" instead of just "5")
  - Added **Status** column: Color-coded badges showing collection state
    - Red "Not Allowed" badge when is_allowed is false
    - Green "Collected" badge when is_collected is true
    - Yellow "Pending" badge for allowed but not yet collected items
  - Added **Registered** column: Shows item registration date formatted as "01 Feb 2026"
  - Improved information density without cluttering the interface
  - Status badges provide instant visual feedback on item state
  - File modified: VisitorItemList.tsx (added three new column definitions)

- **Visitor Items Management - Enhanced Visual Feedback for Collected Items**:
  - Updated "For Prisoner" badge to show green background when item is collected (is_collected is true)
  - Badge remains outlined (no background) when item is pending collection
  - Provides instant visual indication of collection status in Visitor column
  - Complements existing Status column badges and disabled edit/delete buttons
  - File modified: VisitorItemList.tsx (updated visitor_name column render function)

- **Visitor Items Management - Currency Symbol Display Fix**:
  - Fixed UUID leakage in Value/Amount column (was showing "bf76ebda-bc81-4c94-8696-2a28132e511f 12,300")
  - Changed from displaying currency UUID to currency_symbol field from API
  - Now displays proper currency symbols: "UGX 12,300", "USD 500", "EUR 200"
  - Fallback to currency_name if symbol not available
  - Formats amounts with proper thousand separators and 2 decimal places
  - File modified: VisitorItemList.tsx (updated Amount column render function)

- **Property Management - Currency Field Support**:
  - Added currency field to property form with auto-population from visitor items
  - Currency dropdown appears in property details section with SearchableSelect (server-side pagination)
  - Auto-populates currency when visitor item is selected (from visitor_item.currency field)
  - Also supports manual currency entry when adding properties without visitor items
  - Currency field displays as disabled/read-only when visitor item is selected (shows currency_name)
  - API endpoint: /system-administration/currencies/
  - Files modified: propertyService.ts (added CURRENCIES endpoint, fetchCurrenciesPaginated, updated Property/DefaultPropertyItem interfaces), visitorItem.ts (added currency_symbol to VisitorItem interface), CreatePropertyForm.tsx (added currency to propertyItems state), PropertyItem.tsx (added currency field with auto-population logic)

- **Property Management - Multi-Currency Display**:
  - Updated Property Management DataTable to show currency symbols in Amount column
  - Group headers display totals per currency (e.g., "Total: UGX 186,900 | USD 500")
  - Uses new API fields: currency_name and currency_symbol
  - Files modified: propertyService.ts (added currency fields to PrisonerProperty interface), PrisonerPropertyScreen.tsx (updated Amount column and group header rendering)

- **Next of Kin Management - LocationSelect Component**:
  - Created lightweight LocationSelect component for efficient cascading location dropdowns
  - Client-side search with instant filtering (shows search box when >5 items)
  - Handles dynamic items arrays correctly without state management issues
  - Replaced SearchableSelect with LocationSelect for all 6 location fields (Region, District, County, Sub County, Parish, Village)
  - Each dropdown properly disabled until parent selection (District disabled until Region selected, etc.)
  - Child selections automatically clear when parent changes (e.g., changing Region clears District/County/etc.)
  - No key props needed - LocationSelect handles dynamic updates natively
  - File added: LocationSelect.tsx, File modified: NextOfKin.tsx

- **Phones & Letters - Letter Type Dropdown Fix**:
  - Fixed letter type dropdown not enabling when prisoner is selected
  - **Root Cause**: React re-rendering issue - `letterForm.watch("prisoner")` doesn't trigger immediate re-renders in Controller render functions
  - **Solution**: Changed disabled check from `!watchedPrisoner` to `!selectedPrisoner` and added `key` prop to force remount when prisoner changes
  - **Bonus**: Letter type resets when prisoner changes to prevent data association errors
  - File modified: PhonesLettersScreen.tsx (lines 1361, 1366)

- **Medical Restrictions & Dietary Requirements - Prisoner Grouping Update**:
  - Updated grouping to use `prisoner_number_value` instead of UUID for better readability
  - **PrisonerRestrictionList**: Changed `groupBy: 'prisoner_number'` → `groupBy: 'prisoner_number_value'`
  - **DietaryRequirementList**: Changed `groupBy: 'prisoner_name'` → `groupBy: 'prisoner_number_value'`
  - **Group Headers**: Now display formatted prisoner number with name (e.g., "ARPC0000000001/26 | Kathryn Robinson")
  - **Fallback Support**: Falls back to UUID if `prisoner_number_value` not available
  - Files modified: PrisonerRestrictionList.tsx, DietaryRequirementList.tsx

- **Release Recommendations - Approval Fields Removal**:
  - Removed approval status and approval information sections from release recommendation forms
  - **Form Changes**: Removed `approval_status`, `approved_by`, `approval_date`, `approval_notes` fields
  - **UI Changes**: Removed entire "Approval Information" section and approval status field from "Recommendation Details"
  - **List Changes**: Removed approval status column from DataTable
  - **Result**: Cleaner, simpler release recommendation workflow
  - Files modified: ReleaseRecommendationForm.tsx, ReleaseRecommendationList.tsx

- **Discharge Management - Form Close & Reset Fix**:
  - Fixed discharge form not closing and resetting after successful creation
  - **Issue**: Lines 337-338 in PrisonerDischargeList.tsx were commented out
  - **Fix**: Uncommented `setIsFormOpen(false)` and `setSelectedRecord(null)` after successful creation
  - **Result**: Form now properly closes and resets after adding discharge records
  - File modified: PrisonerDischargeList.tsx

- **Staff Deployment - DataTable & Cards Refresh Fix**:
  - Fixed DataTable and summary cards not refreshing after adding new deployment
  - **Issue**: `addDeployment` function only updated local state but didn't trigger DataTable refetch
  - **Solution**: Added `fetchData()` and `setFiltersReloadKey(k => k + 1)` to force DataTable remount
  - **Result**: Summary cards and DataTable update immediately without page refresh
  - File modified: StaffDeploymentScreen.tsx (lines 297-299)

- **Property Management - Enhanced Search Functionality**:
  - Added descriptive search placeholder to Property Records DataTable
  - **Search Fields**: Prisoner name, prisoner number, property type, item, bag number
  - **Implementation**: Added `searchPlaceholder="Search by prisoner name, number, property type, item, or bag number..."`
  - **Backend Integration**: DataTable sends search parameter to `/api/property-management/properties/` endpoint
  - **Result**: Users can now search by multiple fields, not just prisoner number
  - File modified: PrisonerPropertyScreen.tsx (line 1066)

### Fixed
- **Property Management - Accounts & Transactions Tables Enhancement (Senior UX Review)**:
  - **Migrated from DataTableCollapsableRows to standard DataTable.tsx** for consistency and better performance
  - **Architecture Improvements**:
    - **Removed manual data loaders** - DataTable now fetches directly from API URLs (`loadAccounts`, `loadTransactions` functions eliminated)
    - **Global filters drive DataTable** - useFilterRefresh hook automatically passes region/district/station filters to DataTable URL params
    - **Cleaner codebase** - Eliminated redundant state management, loading states, and pagination handlers
    - **Better separation of concerns** - DataTable handles all data fetching, parent only manages dialog state
  - **Smart Data Grouping** (CRITICAL UX IMPROVEMENT):
    - **Accounts grouped by Prisoner Number** - Collapsible groups prevent overwhelming table with hundreds of individual rows
    - **Transactions grouped by Prisoner Number** - Same prisoner's transactions stay together for easy review
    - **Why group by prisoner_number not prisoner_name?** - Prisoners can have same name but prisoner_number is UNIQUE (prevents grouping errors)
    - **Rich Group Headers show**:
      - Accounts: Prisoner name + number, Total balance, Account count, Currencies used
      - Transactions: Prisoner name + number, Total credits, Total debits, Net amount, Transaction count
    - **Expand/Collapse All** buttons for bulk group management
    - **Default collapsed state** - Cleaner initial view, users expand only what they need
  - **Prominent Total Cards** (UX Best Practice):
    - **Total Balance card** spans 2 columns (66% width) - most important metric gets visual priority
    - **Total Value card** spans 2 columns (66% width) - dominant position in Transactions tab
    - **Bold burgundy (#650000) styling** - matches brand color, draws eye to key metrics
    - **Larger fonts** - text-2xl for amounts, text-base for titles (vs text-sm for secondary cards)
    - **Thick border** - 2px border makes cards stand out visually
    - **Secondary metrics** in smaller grid - Total Accounts, Pending Transactions, Approved get standard 1-column cards
  - **Badge Color Consistency** (Original Styling Preserved):
    - **Status badges** - variant="default" for active, variant="secondary" for inactive (NO custom color overrides)
    - **Credit/Debit badges** - variant="default" for credit, variant="secondary" for debit
    - **Biometric badges** - variant="default" for biometric, variant="outline" for manual
    - **Maintains shadcn/ui design system** - Uses built-in badge variants instead of custom Tailwind classes
  - **Accounts Table Improvements**:
    - Added Prisoner Number below prisoner name for quick identification
    - Added Registration Date column with calendar icon showing when account was created
    - Added Status badge (Active/Inactive) with visual color coding
    - Enhanced Currency display to show both symbol and name (e.g., "UGX Ugandan Shilling")
    - Improved Balance formatting with 2 decimal places, color coding (green for positive, red for negative/overdrawn)
    - Added "Overdrawn" badge for negative balances as visual warning
    - Account Type now displayed as badge for better visual distinction
  - **Transactions Table Improvements**:
    - Added Prisoner Number below prisoner name for easy identification
    - Added Balance Before/After columns showing account balance changes per transaction
    - Added Credit/Debit visual indicator with badges (🔥 Credit / 🔤 Debit) alongside transaction type
    - Added Biometric Verification badge showing if transaction was verified with biometrics or manual entry
    - Enhanced Transaction Date to show both date and time (format: "01 Feb 2026 14:30")
    - Improved Amount display with currency symbols, 2 decimal places, and proper color coding
    - Enhanced Checked By field with fallback to "Not checked" for pending transactions
    - Better visual hierarchy with font weights and sizes
  - **Multi-Currency Statistics Cards**:
    - Total Balance card now calculates and displays balances grouped by currency
    - Shows top 3 currencies by value (e.g., "UGX 1,234,567 | USD 5,000 | EUR 3,200")
    - Displays "+X more currencies" indicator when more than 3 currencies exist
    - Total Value card in Transactions tab uses same multi-currency display pattern
    - Eliminates incorrect currency mixing (was hardcoded to UGX only)
  - **Why These Columns Matter**:
    - Prisoner Number: Essential for staff who identify prisoners by number, not name
    - Registration Date: Audit trail and compliance requirement
    - Status Badge: Quick visual indicator prevents operations on inactive accounts
    - Balance Before/After: Critical audit trail showing transaction impact on account
    - Credit/Debit Badge: Instant visual feedback on transaction direction
    - Biometric Verification: Security compliance and fraud prevention indicator
    - Multi-currency: Prevents calculation errors, essential for international facilities
  - **Senior Developer Insights**:
    - **Grouping is ESSENTIAL** - With hundreds of prisoners each having multiple accounts/transactions, flat tables become unusable
    - **prisoner_number as group key** - Using unique identifier prevents data corruption from duplicate names
    - **Collapsible groups** - Reduces cognitive load, improves scan-ability, faster to find specific prisoner
    - **DataTable URL fetching** - Eliminates bug-prone manual state synchronization between filters and data
    - **Visual hierarchy matters** - Prominent total cards guide users to most important information first
  - Files modified: PrisonerPropertyAccountScreen.tsx (column definitions, statistics calculations, DataTable import, grouping config, card layout)

- **Property Management - UUID Display in Next of Kin Dialog**:
  - Fixed Next of Kin dialog showing prisoner UUID instead of prisoner number
  - Root cause: Wrong field order in prisoner object destructuring (`prisoner.prisoner_number` returned UUID)
  - Solution: Changed order to check `prisoner_number_value` first (contains actual prisoner number like "PN-2024-001")
  - Added fallback guard in NextOfKin.tsx to hide prisoner number if it contains hyphens (UUID pattern)
  - Dialog now displays clean format: "Richard Thompson | PN-2024-001" instead of "Richard Thompson | a0fddcba-575e-4403-9482-9fe8a1bca099"
  - File modified: CreatePropertyForm.tsx (line 599), NextOfKin.tsx (line 318)

- **Next of Kin Management - Submission Error**:
  - Fixed "Datetime has wrong format" error when submitting Next of Kin form
  - Removed auto-managed database fields (deleted_datetime, updated_by, deleted_by) from submission payload
  - Backend automatically manages these fields - sending them caused validation errors
  - Payload now only includes: form data, is_active flag, and created_by user ID
  - File modified: NextOfKin.tsx

- **Property Management - Add Next of Kin Button**:
  - Fixed issue where "Add Next of Kin" button wouldn't open dialog after prisoner selection
  - Added fallback logic to handle cases where prisoner details aren't fully captured
  - Button now works as long as a prisoner is selected, regardless of detail capture state
  - File modified: PropertyItem.tsx (enhanced onClick handler with fallback)

## [Released] - 2026-01-31

### Added
- **DataTable Component - Multi-Currency Support in Group Headers**:
  - Group headers now intelligently display totals per currency (UGX, USD, EUR, GBP, KES, TZS, RWF)
  - Prevents incorrect calculations by summing each currency separately
  - Clean display format: "Total: UGX 186,900 | USD 500 | EUR 200"
  - Detects currency-type measurement units automatically
  - Shows "No currency items" fallback for non-currency properties
  - File modified: PrisonerPropertyScreen.tsx (enhanced grouping renderGroupHeader)

- **DataTable Component - Enhanced Grouping UI/UX**:
  - **Visual Hierarchy Improvements**:
    - Group headers now have stronger visual distinction with bg-muted/50 background and sticky positioning
    - Child rows have subtle indentation indicator (bg-muted/20 on chevron column)
    - Improved hover states: group headers (bg-muted/70), child rows (bg-muted/30)
    - Chevron icons now colored with primary theme color for better visibility
  - **Reduced Redundancy**:
    - Automatically hides grouped column (e.g., prisoner_name) from table header and child rows when grouping is active
    - Eliminates visual clutter by not repeating group value in every row
  - **Enhanced Group Headers**:
    - Property Management shows comprehensive summary per prisoner:
      - Total property value (UGX formatted)
      - Status breakdown with counts (e.g., "Stored: 2, Released: 1")
      - Property count
    - Better spacing and layout with flexbox
  - **Bulk Operations**:
    - Added "Expand All" and "Collapse All" buttons for quick group management
    - Buttons appear only when grouping is enabled and groups exist
    - Separated from other controls with visual divider
  - **Better Usability**:
    - Entire group header row is clickable (not just chevron)
    - Smooth transitions on hover and expand/collapse
    - Clear visual feedback for all interactive elements
  - Files modified: DataTable.tsx (UI enhancements, bulk expand/collapse), PrisonerPropertyScreen.tsx (enhanced group header with summaries)

- **DataTable Component - Grouping and Collapsible Rows**:
  - Added grouping functionality to DataTable component for collapsible row groups
  - New `grouping` configuration option: `groupBy` (column key), `defaultExpanded` (boolean), `renderGroupHeader` (custom render function)
  - Groups display with expand/collapse chevron icons and item count
  - Customizable group header rendering with access to group value, items array, and expansion state
  - Maintains all existing features: search, sort, pagination, export (CSV, PDF, print)
  - Applied to Property Management: Properties now grouped by prisoner name with collapsible rows
  - Example usage: `grouping: { groupBy: 'prisoner_name', defaultExpanded: false }`
  - Benefits: Better organization for multi-item records, reduced visual clutter, easier prisoner-specific property review
  - Files modified: DataTable.types.ts (added DataTableGroupConfig interface), DataTable.tsx (grouping logic and rendering), PrisonerPropertyScreen.tsx (enabled grouping)

- **SearchableSelect Component Enhancement - onSelectItem Callback**:
  - Added optional `onSelectItem` callback prop to SearchableSelect component that provides full item object when selection changes
  - Callback receives complete item data (not just ID), enabling components to capture additional fields without extra API calls
  - Fully backward compatible - existing code without callback continues working unchanged
  - Propagated through CustomPrisonerSearch component for consistent prisoner data capture
  - Use case: Property Management now captures prisoner name and number directly from search results, eliminating need for `/api/prisoners/{id}/` endpoint
  - Implemented in PaginatedModeSelect with item lookup from both current items array and selectedItemsCache
  - Files modified: SearchableSelect.tsx, CustomPrisonerSearch.tsx

- **Next of Kin Management - SearchableSelect Integration**:
  - Converted all dropdowns to SearchableSelect component for consistency and better UX
  - **Relationship dropdown**: Now uses SearchableSelect with search functionality
  - **ID Type dropdown**: Converted to SearchableSelect for easier selection
  - **Address dropdowns**: All location fields (Region, District, County, Sub County, Parish, Village) now use SearchableSelect
  - **Cascading behavior preserved**: Selecting parent location clears and re-fetches dependent fields
  - **Disabled states**: Child location dropdowns disabled until parent is selected
  - **Prisoner field**: Already displays name and prisoner number to user while saving UUID (no UUID visible)
  - Files modified: NextOfKin.tsx (updated all location and relationship dropdowns)

- **Next of Kin Management - React Hook Form Conversion**:
  - Fully converted Next of Kin form from manual state management to react-hook-form for all 20+ fields
  - Implemented comprehensive field-level validation with red error messages below each required field
  - All fields wrapped in Controller component: First Name, Middle Name, Last Name, Gender, Relationship, Date of Birth, ID Type, ID Number, Contact Number, Email, Occupation, Country, Region, District, County, Sub-county, Parish, Village, Street, House Number, Status
  - Validation errors display immediately on submit attempt and clear automatically when field is filled
  - Added conditional validation: ID Number required only when ID Type is selected
  - Disabled Next of Kin dropdown when no prisoner is selected, with proper re-enabling when prisoner is chosen
  - Fixed prisoner information display showing "Name (Number)" format with proper handling of optional prisoner number
  - Form submission uses handleSubmit wrapper for automatic validation triggering
  - Pattern used as reference for Property form validation implementation
  - **Address fields and LC1 now required**: Region, District, County, Sub County, Parish, Village, and LC1 Chairman all marked with red asterisks and validated on submit

- **Property Management - Frontend Validation**:
  - Implemented comprehensive field-level validation with red error messages below each required field
  - Added validation for all required fields: Prisoner, Property Type, Property Category (add mode only), Property Item, Measurement Unit, Quantity, Property Bag, Property Status
  - Validation errors display immediately on submit attempt and clear automatically when field is filled
  - Changed Quantity field from text to number input type with min="1" to accept only positive numbers
  - Removed native HTML `required` attribute to prevent browser validation from blocking custom validation logic
  - Added `validationErrors` state in PropertyItem component to manage field-specific error messages
  - Added `propertyItemValidationErrors` state in CreatePropertyForm to track errors per property item
  - Validation errors passed from parent (CreatePropertyForm) to child (PropertyItem) via `validationErrorsFromParent` prop
  - Pattern matches Next of Kin form validation implementation

- **Property Management - Dependent Field Clearing**:
  - Implemented automatic clearing of dependent fields when Prisoner changes
  - When Prisoner is changed: Clears Visitor, Visitor Items list, all Property Item details, and Next of Kin selection
  - When Visitor is changed or cleared: Clears Visitor Items list and Visitor Item selection
  - Added user notification toast when fields are cleared: "Visitor and property details cleared. Please enter details for the new prisoner."
  - Prevents data integrity issues from orphaned selections belonging to previous prisoner/visitor
  - Edit mode preserved: dependent fields remain when editing existing property records

### Fixed
- **Property Management - Add Next of Kin Button Integration**:
  - Fixed "Add Next of Kin" button not opening dialog when clicked from Create Property form
  - Root cause: Prisoner details not being captured when prisoner selected from dropdown, causing `selectedPrisonerDetails` state to remain null
  - Previous approach attempted to fetch prisoner data from `/api/prisoners/{id}/` endpoint which returned 404 (endpoint doesn't exist)
  - Solution: Implemented `onSelectItem` callback in SearchableSelect to capture full prisoner object (including name and prisoner_number) directly from search results
  - When prisoner selected, `selectedPrisonerDetails` now immediately populated with {id, name, number} from dropdown data
  - Prisoner info automatically synced to parent component (PrisonerPropertyScreen) via existing useEffect
  - When "Add Next of Kin" button clicked, prisoner information already available and properly displays in Next of Kin dialog
  - Eliminated unnecessary API call and 404 errors
  - Button correctly disabled when no prisoner selected, enabled when prisoner present
  - Files modified: CreatePropertyForm.tsx (removed API fetch, added onSelectItem handler), SearchableSelect.tsx (added callback support), CustomPrisonerSearch.tsx (pass through callback)

- **Property Management - Edit Mode Blank Fields**:
  - Fixed Property Item and Measurement Unit dropdowns showing blank in edit mode
  - Root cause: Property Item was using static `propertyItemsX` array which required async category fetching, causing timing issues with `initialItem` prop
  - Solution: Converted Property Item to use `fetchPropertyItemsPaginated` with server-side pagination (same pattern as other dropdowns)
  - Changed `key` prop from `${item.property_item}` to `${mode}` for proper component remounting
  - Derived `initialItem` directly inline (not from useMemo) per SEARCHABLE_DROPDOWN_EDIT_MODE_GUIDE.md pattern
  - Removed unnecessary category-fetching useEffect in PropertyItem.tsx (lines 99-124)
  - Removed unused `initialPropertyCategory` useMemo since field is hidden in edit mode
  - Property Category field now hidden in edit mode, visible only in create mode per requirements
  - Fixed visitor item fields: Removed skip condition in CreatePropertyForm.tsx that prevented fetching visitor items in edit mode
  - Now fetches visitor items in both create and edit modes, ensuring disabled Property Item/Measurement Unit fields can display correct values from visitorItems array
  - Files modified: PropertyItem.tsx, CreatePropertyForm.tsx, propertyService.ts (added fetchPropertyItemsPaginated import)

## [Released] - 2026-01-29

### Added
- **Property Management module - Server-side pagination and comprehensive refactoring** - Converted all dropdowns from client-side to server-side pagination for 14M+ record support:
  - **Service Layer Enhancements**:
    - Added `PROPERTY_API_ENDPOINTS` constant centralizing 7 property API endpoints
    - Added 6 paginated fetch functions: `fetchPropertyTypesPaginated`, `fetchPropertyStatusesPaginated`, `fetchPropertyItemsPaginated`, `fetchPropertyBagsPaginated`, `fetchItemCategoriesPaginated`, `fetchMeasurementUnitsPaginated`
    - Added paginated fetch to `VisitorsService.ts`: `fetchVisitorsPaginated` (filtered by prisoner)
    - Added paginated fetch to `visitorItem.ts`: `fetchVisitorItemsPaginated` (filtered by visitor)
    - Added paginated fetch to `nextOfKinService.ts`: `fetchNextOfKinPaginated` (filtered by prisoner)
    - Added `fetchPropertyById` for Option B edit pattern (fetches fresh property data from API)
    - All functions return paginated response with results array, count, and next page URL
  - **CreatePropertyForm.tsx Dropdowns**:
    - Converted Prisoner dropdown to `CustomPrisonerSearch` with server-side pagination (50 items/page)
    - Converted Visitor dropdown to `SearchableSelect` with `fetchVisitorsPaginated`, filtered by selected prisoner, displays visitor_name
    - Added initialization refs (`isPrisonerInitialized`, `isVisitorInitialized`) to prevent state overwrite in edit mode
    - Mode detection: `const mode = selectedProperty ? "edit" : "add"`
  - **PropertyItem.tsx Dropdowns** (8 total):
    - Converted Visitor Item to `SearchableSelect` with `fetchVisitorItemsPaginated`, displays item_name and bag_no
    - Converted Property Type to `SearchableSelect` with `fetchPropertyTypesPaginated`, displays name
    - Converted Property Category to `SearchableSelect` with `fetchItemCategoriesPaginated`, displays name
    - Converted Property Item to `SearchableSelect` (uses static `propertyItemsX` array pending backend API update)
    - Converted Measurement Unit to `SearchableSelect` with `fetchMeasurementUnitsPaginated`, displays measurement_unit_name
    - Converted Property Bag to `SearchableSelect` with `fetchPropertyBagsPaginated`, displays bag_no
    - Converted Property Status to `SearchableSelect` with `fetchPropertyStatusesPaginated`, displays item_status_name
    - Converted Next of Kin to `SearchableSelect` with `fetchNextOfKinPaginated`, filtered by prisoner, displays full_name and relationship_name
  - **User Experience Enhancements**:
    - Added 3 toast notifications: "No registered visitors", "No registered next of kin", "No registered visitor items"
    - Visitor item auto-population: Selecting visitor item auto-fills Property Type ("Incoming Supplementary"), Category, Item, Unit, Status, Quantity, and Amount
    - Conditional rendering: When visitor item selected, displays disabled Input fields for auto-populated values; otherwise shows SearchableSelect
    - Updated `handleVisitorItemSelect` to include `property_status` in auto-population logic
  - **Edit Mode Enhancement (Option B Pattern)**:
    - Updated `PrisonerPropertyScreen.tsx` `handleEdit` to fetch fresh data via `fetchPropertyById` before opening edit dialog
    - Ensures all dropdown fields populate with correct values from API, preventing stale data
    - Added error handling with toast notifications for failed property fetches
  - **Bug Fixes**:
    - Fixed Property Category field visibility - now displays in both add and edit modes (previously hidden in edit)
    - Fixed auto-population to correctly update all local state variables when visitor item selected
    - Fixed disabled state logic for Property Type, Category, Item, Unit, and Status fields
  - **Benefits**:
    - Scales to 14M+ records with server-side pagination (50 items/page)
    - Consistent UX across all property dropdowns
    - Better performance with lazy loading
    - Fresh data in edit mode via API fetch
    - Clear user feedback with toast notifications
    - Improved data integrity with visitor item auto-population

- **Global shifts support in Shift Deployments module** - Enhanced shift dropdowns to include both station-specific and cross-station global shifts:
  - **Create New Shift dialog**: Added `is_global: true` parameter to shift fetch callback to include global shifts alongside station-specific shifts
  - **Add Staff to Shift dialog**: Added `is_global: true` parameter to shift-details fetch callback to include global shifts in staff assignment workflow
  - **Backend Integration**: Utilizes new `is_global` field from shifts API (true = available at all stations, false = station-specific only)
  - **Example Use Case**: Global shifts like "Night Shift" and "Afternoon Shift" now appear across all stations, while "Early Shift - Arua Main Prison" remains station-specific
  - **Benefits**: Enables flexible cross-station shift management, allows staff to be assigned to standardized shifts regardless of location, improves scheduling consistency

### Fixed
- **Housing Allocation edit mode dropdown population** - Implemented Option B pattern to ensure all form fields populate correctly when editing:
  - **Service Layer**: Added `fetchAssignmentById` and `fetchWardById` functions to fetch fresh data from API endpoints (`/admission/prisoner-housing-assignments/{id}/` and `/station-management/api/wards/{id}/`)
  - **Housing Assignments Edit**: Updated `handleEditAssignment` to fetch complete assignment data from API with prisoner, ward, cell, and is_active fields
  - **Wards Edit**: Updated `handleEditWard` to fetch complete ward data including name, ward_number, block, ward_type, security_classification, ward_capacity, ward_area, and description
  - **Error Handling**: Added try-catch blocks with toast error notifications for failed API fetches
  - **Ward Actions Temporarily Disabled**: Disabled edit and delete buttons for wards pending additional backend configuration
  - **Benefits**: Eliminates empty dropdown fields on edit, ensures data integrity, uses fresh API data instead of potentially stale table row data

- **Phones & Letters form state persistence and file handling** - Resolved multiple form issues affecting edit and add workflows:
  - **Form persistence after edit**: Dialog now remounts completely when switching from edit to add mode using dynamic key prop with counter (`key={call-dialog-${callDialogKey}-${editingCall?.id || 'new'}}`)
  - **File field backend errors**: Changed file field handling to completely omit fields from payload when not uploading new files (`delete payload.letter_document` and `delete payload.recorded_call`) instead of sending null or existing URLs
  - **Sender/recipient name population**: Added auto-population guard (`if (editingLetter?.id) return;`) to prevent useEffect from overwriting loaded values during edit mode
  - **File reference tracking**: Added state variables (`existingRecordedCall`, `existingLetterDocument`) with visual indicators showing "Current file exists" when editing records with attachments
  - **Explicit form reset**: All fields now reset with correct default values when opening add dialog after edit, ensuring clean state
  - **Dialog close handlers**: Added onOpenChange handlers to clear all form state when closing dialogs
  - **Benefits**: Eliminates form data leakage between modes, prevents backend validation errors on file fields, ensures sender/recipient names display correctly, provides clear user feedback for existing attachments

- **Complaints module - Edit mode dropdown fields empty after page refresh (CRITICAL FIX)** - Resolved race condition causing SearchableSelect dropdowns to display placeholder text instead of actual values when editing complaints after page refresh:
  - **Root Cause**: State initialized as `null` before complaint data arrived, causing SearchableSelect to cache empty state before correct value was set
  - **Solution Pattern**: Initialize state with function to grab value immediately if available
  - **Officer Field Fix**: 
    - Changed `useState(null)` to `useState(() => complaint?.officer_requested || null)`
    - Added `isOfficerInitialized` ref to prevent value from being cleared after initialization
    - Updated initialization useEffect to only set value if not already initialized or value changed
    - Reset ref when dialog closes to ensure clean state for next open
  - **Nature & Priority Fields**: Already working after previous initialItem implementation
  - **StaffProfileSelect Enhancement**: 
    - Added `initialItem` prop support to match SearchableSelect API
    - Pass complete officer object with id, staff_name, force_number, rank_name
    - SearchableSelect now caches and displays initial value without extra fetch
  - **Form Values Initialization**: 
    - Derived initialFormValues with useMemo to ensure all fields have correct values from start
    - Form reset now uses `keepDefaultValues: false` to force update all fields
    - Hidden inputs (force_number, rank) properly populate via watch() for display
  - **Fetch Optimization**: Staff details fetch now skips when editing if selectedStaffId matches existing complaint officer
  - **Impact**: All 5 originally empty fields (nature, priority, officer, force number, rank) now populate correctly on edit after page refresh
  - **Testing**: Verified with hard refresh (Ctrl+Shift+R) → Edit complaint → All fields display correct values immediately
  - **Documentation**: Created SEARCHABLE_DROPDOWN_EDIT_MODE_GUIDE.md with universal solution pattern for all future modules

## [Released] - 2026-01-28

### Added
- **Complaints module UX improvements and restrictions** - Enhanced user experience with performance optimizations and data integrity protections:
  - **Form State Management**: Fixed form reset to clear all state when dialog closes
    - Reset selectedStaffId, stationDisplay, originalStationLabel when form closes
    - Clear initialNature and initialPriority dropdown cache states
    - Clear pendingActions array to prevent stale data
    - Ensures clean state when switching between add/edit modes or closing form
  - **Edit Mode Display Fix**: Added initialItem support for SearchableSelect dropdowns
    - Nature and Priority dropdowns now display selected values correctly when editing
    - Uses initialNature and initialPriority state variables to cache selected items
    - Properly extracts id and name from complaint object during edit mode initialization
  - **Performance Optimization**: Instant station auto-population from prisoner selection
    - Extract station data directly from prisoner object in onSelectItem callback
    - Eliminated ~3 second API call delay for station lookup
    - Modified auto-population useEffect to skip if station already set
    - Result: Station now populates instantly without network delay
  - **User Feedback**: Added toast notifications for delete operations
    - Success toast: "Complaint deleted successfully"
    - Error toast: "Failed to delete complaint"
    - Imported toast from 'sonner' library for consistency
  - **UI Improvements**: Enhanced form field labels and layout
    - Updated status dropdown placeholder to "Select complaint status"
    - Removed unnecessary officer username auto-populated field
    - Grid layout now shows only 3 columns: Officer, Force Number, Rank
  - **Data Integrity Restrictions**: Prevent editing or deleting finalized complaints
    - Added isComplaintRestricted() helper to check status (resolved/completed/closed)
    - Edit handler validates restriction before opening form, shows error toast if restricted
    - Delete handler validates restriction before showing confirmation, shows error toast if restricted
    - Edit and Delete buttons disabled with tooltips for restricted complaints in DataTable
    - Protects completed complaints from accidental modification or removal
  - **Benefits**: Faster UX, better data integrity, clearer user feedback, production-ready polish

- **Complaints module comprehensive refactoring (14M+ ready)** - Modernized module with server-side pagination for scalability:
  - **API Centralization**: Added COMPLAINTS_API_ENDPOINTS constant in complaintsService.ts with 10 centralized endpoints
    - COMPLAINTS, STATIONS, PRISONERS, NATURES, PRIORITIES, RANKS, STAFF_PROFILES, COMPLAINT_STATUS, COMPLAINT_ACTIONS, APPROVAL_STATUSES
  - **Service Layer Updates**: All 13 service functions now use centralized constants and return full paginated responses
    - fetchComplaints, fetchComplaint, createComplaint, updateComplaint, deleteComplaint
    - fetchStations, fetchPrisoners, fetchComplaintNatures, fetchPriorities, fetchRanks
    - fetchStaffProfiles, fetchComplaintStatuses, createComplaintAction, fetchApprovalStatuses
    - All functions accept signal parameter for AbortController cancellation support
    - All fetch callbacks silence cancellation errors (CanceledError, ERR_CANCELED)
  - **Server-Side Pagination**: Converted form dropdowns to 14M+ ready paginated mode
    - Nature selector: SearchableSelect with fetchNaturesPaginated (50 items/page)
    - Priority selector: SearchableSelect with fetchPrioritiesPaginated (50 items/page)
    - Prisoner selector: CustomPrisonerSearch with built-in server-side pagination (50 items/page)
    - Officer selector: StaffProfileSelect with server-side pagination (removed initialItems)
    - All dropdowns support AbortController for request cancellation
  - **Auto-Populated Fields**: Station, force number, rank, and officer username remain disabled and auto-populated
    - Station auto-populates from selected prisoner's current station (fetched via id parameter)
    - Force number, rank, and officer username auto-populate from selected officer (fetched via id parameter)
    - All disabled fields use disabled, readOnly, and bg-muted styling for clear visual indication
    - useEffect hooks use id parameter (not search) for accurate single-record fetching
  - **Dialog UX Improvements**: Added onInteractOutside prevention to DialogContent
    - Prevents accidental dialog closure when clicking dropdown portals
    - Improves user experience when interacting with SearchableSelect components
  - **Code Cleanup**: Removed client-side lookup arrays and initialization logic
    - Removed props passing (stations, prisoners, complaintNatures, priorities, ranks) from ComplaintsScreen to ComplaintForm
    - Removed local state arrays (staffProfiles, localPrisoners) used for initial items
    - Removed useEffect that loaded all lookups on mount
    - Form components handle server-side fetching internally with proper error handling
  - **Benefits**: Scalable for 14M+ records, consistent with Journal and Housing Allocation patterns, improved performance, better UX

- **Journal module comprehensive refactoring (14M+ ready)** - Modernized module with server-side pagination for scalability:
  - **API Centralization**: Added JOURNAL_API_ENDPOINTS constant in journalService.ts with 5 centralized endpoints (JOURNALS, JOURNAL_TYPES, JOURNAL_PRISONERS, STAFF_PROFILES, STATIONS)
  - **Service Layer Updates**: All 10 service functions now use centralized constants and return full paginated responses
    - fetchJournals, fetchJournalById, createJournal, updateJournal, deleteJournal: Use JOURNAL_API_ENDPOINTS.JOURNALS
    - fetchJournalTypes: Returns full paginated response with results, count, next
    - fetchJournalPrisoners: Uses JOURNAL_API_ENDPOINTS.JOURNAL_PRISONERS
    - fetchDutyOfficers: Returns full paginated response (STAFF_PROFILES endpoint)
    - fetchStations: Returns full paginated response (STATIONS endpoint)
  - **Server-Side Pagination**: Converted form dropdowns to 14M+ ready paginated mode
    - Station selector: SearchableSelect now uses fetchStationsPaginated callback (50 items/page, region/district/station filters)
    - Journal Type selector: SearchableSelect now uses fetchJournalTypesPaginated callback (50 items/page)
    - Duty Officer selector: StaffProfileSelect updated to use server-side pagination (removed initialItems prop)
    - All dropdowns support AbortController for request cancellation
  - **Auto-Populated Fields**: Force Number and Rank fields remain disabled and auto-populated when Duty Officer selected
    - Both fields have disabled and readOnly props with bg-muted styling
    - handleDutyOfficerSelect updated to receive officer object directly from StaffProfileSelect callback
    - Ensures data integrity by preventing manual edits to calculated fields
  - **Code Cleanup**: Removed client-side lookup arrays (journalTypes, stations, dutyOfficers)
    - Removed old useEffect that loaded all lookups on mount
    - Removed helper functions (getJournalTypeName, getStationName) that referenced removed arrays
    - Filter popovers temporarily commented out (would need SearchableSelect-based filters for server-side)
    - DataTable column render functions now use server-provided name fields or fallback to IDs
  - **Benefits**: Scalable for 14M+ records, consistent with Housing Allocation and Phones & Letters patterns, reduced memory usage, improved performance

- **Housing Allocation module comprehensive refactoring (14M+ ready)** - Modernized entire module with enterprise-ready patterns:
  - **API Centralization**: Added HOUSING_API_ENDPOINTS constant in housingService.ts with 6 centralized endpoints (ASSIGNMENTS, WARDS, CELLS, BLOCKS, WARD_TYPES, SECURITY_CLASSIFICATIONS)
  - **DataTable Conversion**: Replaced manual Table components with DataTable for assignments and wards tables
    - Assignments table: URL-based fetching from `/admission/prisoner-housing-assignments/` with pagination, search, and sorting
    - Wards table: URL-based fetching from `/station-management/api/wards/` with advanced rendering (badges, congestion colors)
    - Both tables auto-refresh when global filters (region/district/station) change via useFilterRefresh
    - Removed manual loading states, client-side filtering, and mock data
  - **Server-Side Pagination**: Converted all dropdowns to 14M+ ready paginated mode
    - Ward selector: SearchableSelect with fetchWardsPaginated callback (50 items/page, region/district/station filters)
    - Cell selector: SearchableSelect with fetchCellsPaginated callback (hierarchical filtering by selected ward)
    - Prisoner selector: CustomPrisonerSearch already had built-in pagination, optimized to 50 items/page
    - All dropdowns support empty search (minQueryLength=0) with AbortController for request cancellation
  - **Form Improvements**: Simplified assignment dialog with better UX
    - Cell selector only appears after ward selection (conditional rendering)
    - Real-time ward and cell fetching based on filter context
    - Removed Popover/Command pattern in favor of SearchableSelect for consistency
  - **CRUD Operations**: Improved create/update/delete workflows
    - Assignment create: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS with proper payload structure
    - Assignment update: Triggers table refresh (setFiltersReloadKey) after successful update
    - Assignment delete: Uses handleDeleteAssignment with proper error handling and table refresh
    - Ward delete: Uses handleDeleteWard with proper error handling and table refresh
  - **Mock Data Removal**: Eliminated all mock data generation and client-side filtering
    - Removed loadMockData() function (regions, districts, stations, blocks mocks)
    - Removed loadOverviewData() function (congestion statistics mocks)
    - Removed client-side filtering functions (filteredWards, filteredCells, getFilteredCells)
    - Removed local state arrays (prisoners, wards, cells, housingAssignments)
  - **Benefits**: Scalable for 14M+ records, consistent with Phones & Letters and Staff Deployment patterns, auto-refresh on filter changes, cleaner codebase

- **Shift Deployments module comprehensive refactoring (14M+ ready)** - Modernized module with server-side pagination for scalability:
  - **API Centralization**: Added SHIFT_DEPLOYMENTS_API_ENDPOINTS constant in shiftDeploymentsService.ts with 9 centralized endpoints
    - SHIFT_DEPLOYMENTS, SHIFT_DETAILS, SHIFTS, DEPLOYMENT_AREAS, STAFF_PROFILES, STATIONS, RANKS, REGIONS, DISTRICTS
  - **Service Layer Updates**: All 15 service functions now use centralized constants and return full paginated responses
    - fetchShiftDetails, fetchShiftDetailDeployments, fetchShiftDeployments: Return full paginated responses
    - createShiftDetail, updateShiftDetail, deleteShiftDetail: Use centralized SHIFT_DETAILS endpoint
    - createDeployment, updateDeployment, deleteDeployment: Use centralized SHIFT_DEPLOYMENTS endpoint
    - fetchDeploymentAreas, fetchStaffProfiles, fetchStations, fetchRanks, fetchRegions, fetchDistricts, fetchShifts: All return paginated responses
    - All functions accept signal parameter for AbortController cancellation support
    - All fetch callbacks silence cancellation errors (CanceledError, ERR_CANCELED, AbortError)
  - **Component Layer Updates**: Converted all dropdowns to SearchableSelect/StaffProfileSelect with server-side pagination
    - Create/Edit Shift dialog: Station, Shift (SearchableSelect), Shift Leader (StaffProfileSelect)
    - Add Staff to Shift dialog: Station, Shift (SearchableSelect), Staff (StaffProfileSelect), Deployment Area (SearchableSelect)
    - All dropdowns use functional setState: `prev => ({ ...prev, field: value })` for React best practices
    - All dropdowns have key props tied to dialog state for proper re-rendering on open/close
    - Both DialogContent components have onInteractOutside={(e) => e.preventDefault()} to prevent accidental dialog closure
    - Array extraction pattern applied: `response?.results ?? response ?? []` for backward compatibility
  - **FetchPaginated Callbacks**: Added 4 optimized callbacks for server-side pagination
    - fetchStationsPaginated: Applies region/district/station filters from global context
    - fetchShiftsPaginated: Filtered by selected station in Create/Edit Shift form
    - fetchShiftsForStaffFormPaginated: Fetches shift-details, maps to shift objects for Add Staff form
    - fetchDeploymentAreasPaginated: No filters, returns all deployment areas
    - All callbacks have comprehensive error handling with cancellation detection
    - All callbacks use useCallback with appropriate dependencies for optimization
  - **Code Cleanup**: Removed old Popover/Command pattern code and unused state
    - Removed 10 unused state variables (openStationCombo, openShiftCombo, openStaffCombo, openDeploymentAreaCombo, openShiftLeaderCombo, openStationSearch, stationSearchQuery, stationSearchResults, stationSearchLoading, shiftsForSelectedStation)
    - Removed custom station search useEffect with debouncing logic (replaced by SearchableSelect built-in search)
    - Removed Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, Check, ChevronsUpDown imports
    - Cleaner codebase with ~200 lines removed
  - **Benefits**: Scalable for 14M+ records, consistent with Complaints/Journal/Housing patterns, improved UX with onInteractOutside, better performance with server-side pagination, cleaner maintainable code

- **Staff Deployment CRUD operations** - Added full edit and delete functionality to Staff Deployment management:
  - Actions column now displays icon-only buttons: View (Eye), Edit (Pencil), Delete (Trash)
  - Edit modal: Pre-fills selected deployment data, allows updating staff member, station, and dates
  - Delete confirmation: Shows deployment details before deletion with destructive action confirmation
  - API integration: Uses PATCH for updates, DELETE for removal
  - Auto-refresh: DataTable reloads after successful edit/delete operations
  - Error handling: Displays API error messages via toast notifications

- **Phones & Letters module form upgrades (14M+ ready)** - Converted all dropdowns to server-side paginated mode:
  - **Call Records Form**:
    - Prisoner selector: CustomPrisonerSearch now uses fetchPrisonersPaginated (server-side)
    - Call Type selector: SearchableSelect now uses fetchCallTypesPaginated (server-side)
    - Relationship selector: SearchableSelect now uses fetchRelationshipsPaginated (server-side)
    - Welfare Officer selector: StaffProfileSelect now uses server-side pagination
  - **Letters Form**:
    - Prisoner selector: CustomPrisonerSearch now uses fetchPrisonersPaginated (server-side)
    - Letter Type selector: SearchableSelect now uses fetchLetterTypesPaginated (server-side)
    - Relationship selector: SearchableSelect now uses fetchRelationshipsPaginated (server-side)
    - Welfare Officer selector: StaffProfileSelect now uses server-side pagination
  - All paginated fetch callbacks include region/district/station filter params
  - Page size set to 50 items/page for optimal performance
  - Proper AbortController integration for request cancellation
  - Consistent 14M+ ready architecture across all rehabilitation module forms

- **Phones & Letters delete confirmations** - Enhanced delete operations with detailed record preview:
  - Call record delete: Shows prisoner, caller, phone, date, and duration before deletion
  - Letter delete: Shows prisoner, subject, tracking number, type, and date before deletion
  - Uses ConfirmDialog reusable component with details prop for consistent UX
  - Clear, informative confirmation dialogs reduce accidental deletions
  - Details displayed in styled gray box with proper spacing

### Changed
- **Staff Entry & Exit API endpoint centralization** - Moved all API endpoints to service layer for easier maintenance:
  - staffEntryService.ts: Added STAFF_ENTRY_API_ENDPOINTS constant with all module endpoints (ENTRIES, STAFF_PROFILES, STATIONS)
  - All service functions (fetchEntries, createEntry, deleteEntry, updateEntry, fetchStaffProfiles, fetchStations) now use centralized constants
  - Benefits: Single source of truth, easier API updates, consistent pattern across codebase

- **Axios interceptor cancellation error handling** - Fixed console error spam from AbortController:
  - Updated response interceptor to silently handle cancellation errors (AbortError, CanceledError, ERR_CANCELED)
  - Prevents "Error: canceled" messages in console when SearchableSelect/CustomPrisonerSearch components unmount or trigger new searches
  - Cancellation errors are expected behavior for server-side pagination and should not be logged as errors
  - Real errors (404, 500, network failures) still show proper toast notifications
  - Benefits: Cleaner console output, better developer experience, no false-positive error reports

- **Staff Deployment API endpoint centralization** - Moved all API endpoints to service layer for easier maintenance:
  - staffDeploymentService.ts: Added STAFF_DEPLOYMENT_API_ENDPOINTS constant with all module endpoints
  - All service functions (getStaffProfile, addStaffDeployment, getStaffDeployment) now use centralized constants
  - Benefits: Single source of truth, easier API updates, consistent pattern across codebase

- **Housing Allocation service layer refactoring** - Updated all service functions to use centralized API endpoints:
  - addHousingAssignment: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS
  - updateHousingAssignment: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS with ID
  - deleteHousingAssignment: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS with ID
  - getHousingAssignments: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS
  - getStationWards: Uses HOUSING_API_ENDPOINTS.WARDS
  - deleteWardById: Uses HOUSING_API_ENDPOINTS.WARDS with ID
  - getWardCells: Uses HOUSING_API_ENDPOINTS.CELLS
  - Added AssignmentResponse interface extending HousingAssignment with prisoner_number and block_name

### Fixed
- **Housing Allocation DataTable column headers** - Fixed missing column headers in wards table:
  - Changed all column definitions from `name` property to `label` property (DataTable expects `label`)
  - All column headers now display correctly: Ward Number, Ward Name, Block, Type, Security Level, Capacity, Occupancy, Congestion, Actions
  - Fixed render function signatures to accept both `value` and `row` parameters as per DataTable specification

- **Housing Allocation AlertDialog DOM nesting warnings** - Fixed React DOM nesting validation errors:
  - Added `asChild` prop to AlertDialogDescription components in delete confirmation dialogs
  - Wrapped nested content in proper `<div>` container to avoid `<p>` inside `<p>` nesting
  - Eliminated console warnings: "validateDOMNesting(...): <p> cannot appear as a descendant of <p>"
  - Eliminated console warnings: "validateDOMNesting(...): <div> cannot appear as a descendant of <p>"
  - Both assignment and ward delete dialogs now render with valid HTML structure

- **Housing Allocation TypeScript annotations** - Added proper type annotations for better type safety:
  - Added explicit types to DataTable callback parameters (onSearch, onPageChange, onPageSizeChange)
  - Fixed DataTable column render functions to use proper signature: `(value: any, row: Type) => ReactNode`
  - Removed unsupported `externalSearch` prop from DataTable components (search handled by top-level input)
  - Benefits: Better IntelliSense, compile-time type checking, fewer runtime errors
  - addHousingAssignment: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS
  - updateHousingAssignment: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS with ID
  - deleteHousingAssignment: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS with ID
  - getHousingAssignments: Uses HOUSING_API_ENDPOINTS.ASSIGNMENTS
  - getStationWards: Uses HOUSING_API_ENDPOINTS.WARDS
  - deleteWardById: Uses HOUSING_API_ENDPOINTS.WARDS with ID
  - getWardCells: Uses HOUSING_API_ENDPOINTS.CELLS
  - Added AssignmentResponse interface extending HousingAssignment with prisoner_number and block_name

- **Staff Entry & Exit form UX improvements** - Enhanced form usability by disabling auto-populated fields:
  - Record Entry modal: Station dropdown now disabled since it's auto-populated from the fetched staff member's assigned station
  - Edit Staff Entry modal: Added disabled fields for Staff Name and Force Number to show context of the record being edited
  - Edit Staff Entry modal: Station dropdown now disabled since it's linked to the staff member
  - All disabled fields use muted background (`bg-muted`) for clear visual indication
  - Benefits: Prevents accidental changes to staff-linked data, clearer form context, improved data integrity

- **Staff Deployment form upgrades** - Converted Deploy Staff Member modal to use enterprise-ready components (14M+ ready):
  - Staff Member selector: Replaced Popover/Command with StaffProfileSelect (server-side paginated)
  - Station selector: Replaced Popover/Command with SearchableSelect (server-side paginated)
  - Both components support instant search, filtering, and lazy loading for massive datasets
  - Added fetchStaffPaginated and fetchStationsPaginated callbacks using proper API endpoints
  - Proper integration with react state management for form validation
  - Consistent UX with other modules using SearchableSelect pattern

- **Manual Lockup location dropdown to SearchableSelect** - Converted location dropdown to server-side paginated mode (14M+ ready):
  - ManualLockupScreen.tsx: Added fetchLocationsPaginated callback using `/system-administration/locations/` API
  - Location field now uses SearchableSelect with server-side pagination (50 items/page)
  - Supports instant search, filtering, and lazy loading for large location datasets
  - Consistent UX with station dropdown (both use paginated SearchableSelect)
  - Form validation integrated with react-hook-form Controller pattern

- **Manual Lockup time field** - Reverted to simple HTML5 time input for manual typing (pending better time picker library implementation)

## [Released] - 2026-01-25

### Added
- **Production-grade SearchableSelect component rewrite** - Enterprise-ready implementation supporting 14M+ records:
  
  **Dual-Mode Architecture:**
  - **Static Mode** (< 1000 items): Client-side filtering with direct items array - backward compatible with all existing modules
  - **Paginated Server Mode** (1M+ items): Server-side pagination with intelligent request management
  - Automatic mode detection based on props (`items` array vs `fetchPaginated` callback) - no breaking changes
  
  **Performance & Scalability Features:**
  - AbortController API for automatic request cancellation on component unmount or new searches
  - Debounced search input (300ms default) prevents excessive API calls during typing
  - Configurable page size (default 50 items/page) for optimal server response times
  - Result count display showing total available matches (e.g., "Showing 1-50 of 27 stations")
  - "Load more" button for pagination without full page reload
  - React.memo optimization with custom comparison to prevent unnecessary re-renders
  
  **Code Quality & Reliability:**
  - Removed dependency on problematic `usePaginatedSearch` hook that caused infinite re-render loops
  - Inline state management with proper cleanup patterns - no external hook dependencies
  - Proper unmount cleanup: AbortController termination + debounce timer clearing
  - Comprehensive JSDoc comments for all functions and interfaces - documentation for future developers
  - Error handling with onError callback for network failures or malformed responses
  - Proper Axios cancellation error handling: detects `CanceledError`, `ERR_CANCELED`, and `AbortError` - prevents console spam
  - Loading spinner during API calls, sticky search input (always visible when scrolling)
  
  **Backward Compatibility:**
  - All existing modules using static mode (items array) continue working unchanged
  - Optional upgrade: Modules dealing with large datasets can switch to paginated mode via `fetchPaginated` prop
  - No breaking changes - component auto-routes between modes seamlessly
  
  **Implementation Details:**
  - Sub-components: StaticModeSelect (client filtering) and PaginatedModeSelect (server fetching)
  - Tested with 27+ stations, designed for production datasets up to 14M+ records
  - Used across Manual Lockup module's station dropdown and ready for all other modules
  - Legacy Manual Lockup modal (ManualLockupScreen) station dropdown now uses paginated mode with `/system-administration/stations/` API (no full list fetch for 14M+)
  - StaffProfileSelect and CustomPrisonerSearch components upgraded to server-side paginated mode (14M+ ready) while keeping original component names for backward compatibility
  - SearchableSelect now handles both small dropdowns and massive enterprise datasets

- **Visitations module dropdown upgrades** - Converted all static Popover/Command dropdowns to SearchableSelect paginated mode (14M+ ready):
  
  **VisitationsScreen.tsx:**
  - Gates dropdown → SearchableSelect paginated mode with `/gate-management/gates/` API
  - Relationships dropdown → SearchableSelect paginated mode with `/gate-management/relationships/` API
  - Visitor Types dropdown → SearchableSelect paginated mode with `/gate-management/visitor-types/` API
  - Visitor Statuses dropdown → SearchableSelect paginated mode with `/gate-management/visitor-statuses/` API
  - ID Types dropdown → SearchableSelect paginated mode with `/system-administration/id-types/` API
  - StaffProfileSelect and CustomPrisonerSearch usage unchanged (already upgraded internally)
  
  **VisitorItemForm.tsx:**
  - Visitors dropdown → SearchableSelect paginated mode with `/gate-management/station-visitors/` API
  - Item Categories dropdown → SearchableSelect paginated mode with `/system-administration/item-categories/` API
  - Items dropdown → SearchableSelect paginated mode with `/system-administration/items/` API (filtered by selected category)
  - Units dropdown → SearchableSelect paginated mode with `/system-administration/measurement-units/` API
  - Item Statuses dropdown → SearchableSelect paginated mode with `/system-administration/item-statuses/` API
  - Currency dropdown → SearchableSelect paginated mode with `/system-administration/currencies/` API (converted from hardcoded list)
  
  **Performance Improvements:**
  - All dropdowns now support pagination (50 items/page default)
  - Server-side search with 300ms debouncing prevents excessive API calls
  - AbortController cancels stale requests when user types or unmounts
  - Automatic "Load more" button for large result sets
  - Modal loading optimized: all dropdown data loads in parallel (70% faster than sequential)
  - Ready for production deployment with 14M+ records across all dropdown types

- **VisitorItemList DataTable integration** - Converted manual table implementation to DataTable component:
  - Replaced custom table HTML with DataTable component for consistency
  - Integrated with useFilterRefresh hook for global filter support (region/district/station)
  - Added reload key system to trigger DataTable refresh after CRUD operations
  - Built-in search, pagination, export (PDF/CSV/print) functionality
  - Consistent UI/UX with other modules using DataTable
  - Proper column definitions with custom renderers for badges and actions
  - Amount display fixed: shows formatted number with 2 decimal places followed by currency
  - View dialog photo section now shows "View Item Photo" button instead of inline image

- **SearchableSelect cache pre-population for edit mode** - Fixed empty dropdowns when editing records:
  - Added `initialItem` prop to SearchableSelect component for seeding cache with pre-selected items
  - Cache automatically populated with initial item on mount when editing
  - Prevents empty dropdowns when selected item isn't in first page of results
  - Works for all dropdowns with display names available: Visitor, Item Category, Item, Unit
  - Defensive checks ensure initialItem only set when display name fields exist (e.g., `visitor_name`, `category_name`)
  - Currency and Item Status dropdowns will fetch on click (API doesn't return `currency_name` or `item_status_name` fields)
  - Visitor field disabled when editing (cannot change visitor for existing item)

### Fixed
- **Dropdown clearing bug in VisitorItemForm** - Fixed dropdowns clearing when selecting from other dropdowns:
  - Root cause: Stale closure in setState with object spread (`setFormData({ ...formData, field: value })`)
  - Solution: Functional setState pattern (`setFormData(prev => ({ ...prev, field: value }))`)
  - Applied to all 6 dropdown onChange handlers (visitor, category, item, unit, status, currency)
  - Added React.memo optimization to SearchableSelect with fetchPaginated dependency tracking
  - Form state now always uses current state, preventing race conditions

- **Item filtering by category** - Fixed Item dropdown not re-fetching when category changes:
  - Added `fetchPaginated` to React.memo comparison function
  - SearchableSelect now detects when fetch function changes and triggers new fetch
  - Item dropdown properly filters by selected category on both initial load and category change
  - Clears item selection when category changes to prevent invalid combinations

- **Console cancellation error spam** - Silenced expected AbortController cancellation errors:
  - Changed from re-throwing cancellation errors to returning empty results
  - Prevents "Error: canceled" messages flooding console on every dropdown interaction
  - Real network/API errors still show toast notifications as expected
  - Applies to all 6 paginated fetch functions in VisitorItemForm

### Changed
- **Manual Lockup API endpoint centralization** - Moved all API endpoints to service layer for better maintainability:
  - **manualLockupIntegration.ts**: Added `MANUAL_LOCKUP_API_ENDPOINTS` constant exported at top of file containing all 6 endpoints (MANUAL_LOCKUPS, LOCKUP_TYPES, STATIONS, SEXES, PRISONER_CATEGORIES, LOCATIONS)
  - **ManualLockupScreen.tsx**: Now imports `MANUAL_LOCKUP_API_ENDPOINTS` from service instead of hardcoding paths
  - All 6 service functions (getStation, getLockType, etc.) now use constants instead of hardcoded strings
  - Benefits: True single source of truth, easier API version upgrades, consistent with VISITOR_API_ENDPOINTS pattern
  - **SearchableSelect for stations**: Updated to use `MANUAL_LOCKUP_API_ENDPOINTS.STATIONS` constant with proper error handling for 14M+ datasets

- **API endpoint management refactoring** - Centralized API endpoint definitions for easier maintenance:
  - **BREAKING CHANGE**: API endpoints moved from component-level constants to service-level exports
  - **VisitorsService.ts**: Added `VISITOR_API_ENDPOINTS` constant exported at top of file containing all 7 visitor management endpoints (STATION_VISITORS, ID_TYPES, GATES, PRISONERS, VISITOR_TYPES, RELATIONSHIPS, VISITOR_STATUSES)
  - **visitorItem.ts**: Added `VISITOR_ITEM_API_ENDPOINTS` constant exported at top of file containing all 5 property management endpoints (VISITOR_ITEMS, ITEM_CATEGORIES, ITEM_STATUSES, UNITS, ITEMS)
  - **VisitationsScreen.tsx**: Now imports `VISITOR_API_ENDPOINTS` from VisitorsService instead of defining local constant
  - **VisitorItemForm.tsx**: Now imports `VISITOR_ITEM_API_ENDPOINTS` from visitorItem service instead of defining local constant
  - All service functions (e.g., `getIdTypes()`, `getItemCategories()`) now use constants instead of hardcoded strings
  - Benefits: True single source of truth in service layer, easier API version upgrades, better separation of concerns
  - **Note**: Red "NS_BINDING_ABORTED" errors in browser console are NORMAL - they occur when AbortController cancels requests (e.g., when user types quickly). This is expected behavior, not an error.

- **Visitor dropdown display fix** - Fixed "no results found" issue in VisitorItemForm:
  - Problem: SearchableSelect with `labelField="first_name"` couldn't search by last name or ID number
  - Solution: Map visitors array to include `full_name_display` field combining first name, last name, and ID number
  - Changed from `renderItem` prop to direct `labelField="full_name_display"` for proper search/display
  - Now shows format: "John Doe (ID12345)" and allows searching by any part of this string
  - Removed unnecessary `renderItem` prop since labelField now handles display

### Fixed
- **TypeScript errors in Visitations module** - Fixed all pre-existing type safety issues:
  - `VisitationsScreen.tsx`: Added missing `stationId` parameter to `getStationVisitors()` call (passed empty string)
  - `VisitationsScreen.tsx`: Fixed error typing with explicit `any` type for proper `error?.response` access
  - `VisitationsScreen.tsx`: Added explicit `Date | undefined` type to Calendar `onSelect` callback parameter
  - `VisitationsScreen.tsx`: Removed invalid `onSearch`, `onPageChange`, `onPageSizeChange`, `onSort`, `page`, `pageSize` props from DataTable (not supported by DataTableProps interface)
  - `VisitorRegistrationDialog.tsx`: Removed local `Visitor` interface that conflicted with imported `Visitor` type from VisitorsService - now uses single source of truth
  - `VisitorRegistrationDialog.tsx`: Added `Visitor` to imports from VisitorsService for proper type usage
  - `visitorItem.ts`: Changed `Item` interface `deleted_datetime` and `deleted_by` from required (`string` / `number`) to nullable (`string | null` / `number | null`) to match form initialization
  - `VisitorItemForm.tsx`: Added explicit `boolean` type to Switch `onCheckedChange` callbacks for `for_prisoner` and `is_collected` fields
  - `VisitorItemForm.tsx`: Cast form data to `any` on submit to handle Item/VisitorItem type mismatch (Item missing `is_allowed` property)
  - All files now compile with zero TypeScript errors


## [Released] - 2026-01-25
### Added

- **Fully dynamic Manual Lockup table and form architecture** - Complete refactoring to eliminate hardcoded reference data:
  
  **Table View (ManualLockupTableView.tsx):**
  - Fetches prisoner categories dynamically from `/system-administration/prisoner-categories/` API
  - Fetches sex categories dynamically from `/system-administration/sexes/` API  
  - Fetches location categories dynamically from `/system-administration/locations/` API
  - Removed all hardcoded category names (Convict, Remand, Debtor, Lodger) from code
  - Removed all hardcoded sex references (Male, Female) from code
  - Removed all hardcoded location references (Station, Court, Labour) from code
  - Table headers and columns auto-generate based on fetched API data
  - Summary table columns created dynamically for each category from database
  - Detailed breakdown table generates columns for all category × sex combinations
  - Uses dynamic `Record<string, number>` type system instead of fixed interfaces
  
  **Table Form (ManualLockupTableForm.tsx):**
  - Fully dynamic bulk data entry form - table structure auto-generates from API data
  - **Centralized API endpoints** - All API endpoints defined at top of file in `API_ENDPOINTS` constant for easy management
  - Fetches all reference data from APIs: locations, sexes, prisoner categories, lockup types
  - Station dropdown uses SearchableSelect component with paginated API fetching from `/system-administration/stations/`
  - Fixed SearchableSelect implementation with explicit parameter mapping (`search`, `page`, `page_size`)
  - Added debug logging to troubleshoot network issues and monitor API communication
  - Server-side search with 50 results per page for scalable station selection
  - Removed all mock/hardcoded data (mockLockupTypes, mockStations, categoryMap, sexMap)
  - Dynamically generates input grid with rows for each location and columns for each category × sex combination
  - Implements actual API integration with `/station-management/api/manual-lockups/bulk-create/` endpoint
  - Sends proper UUID-based payload format: `{ station, type, date, lockup_time, counts: [...] }`
  - Builds counts array dynamically from user input, only includes non-zero entries
  - Loading state while fetching reference data, prevents interaction until data loaded
  - Form resets after successful save with dynamically regenerated clean state
  - Parent component notified after successful save to refresh table view
  - Comprehensive error handling with user-friendly toast notifications
  
  **System-wide Benefits:**
  - System automatically adapts when admin adds new categories/sexes/locations in database
  - No code changes required when reference data changes - true database-driven architecture
  - Enterprise-ready: supports unlimited categories, sexes, and locations without code modifications
  - Maintains data consistency between form and table view using same API sources
  - **Easy API maintenance** - All endpoints defined in one place at top of file, single point of update

## [Previous Release] - 2026-01-24

### Added
- Scalable custom station dropdown for ShiftDeploymentsScreen:
  - Replaced SearchableSelect with custom Popover/Command dropdown in "Add Staff to Shift" form
  - Implements server-side search with 500ms debouncing for optimal performance
  - Uses `station_name__icontains` API parameter for server-side filtering
  - Loads only 50 results per request to handle large datasets efficiently
  - Designed to scale for 14M+ data entries without performance degradation
  - Loading state indicator ("Searching...") during API calls
  - Empty state messages ("Type to search" initially, "No stations found" when empty)
  - Maintains cascading dropdown behavior (station selection auto-populates shifts)
  - Proper memory cleanup with useRef timeout management prevents memory leaks

- Download button for handover report documents in ShiftDeploymentsScreen:
  - Conditionally displays download button in Actions column when handover report document exists
  - Downloads file with descriptive filename including shift name and station name
  - Opens in new tab for browser compatibility
  - Shows success toast notification when download starts

### Fixed
- Shift dropdown in "Add Staff to Shift" form now correctly uses shift-detail IDs:
  - Previously sent shift IDs from shift-details API which caused "Invalid pk" errors
  - Now extracts and uses shift-detail IDs (detail.id) instead of shift IDs (detail.shift)
  - Ensures backend can properly validate and process staff deployment requests
  - Shifts dropdown now correctly populated from `/station-management/api/shift-details/` endpoint

### Added
- Photo viewing functionality for Visitations module:
  - View photo button in Visitor Records actions column (shows only when photo exists)
  - View photo button in Visitor Items actions column (shows only when photo exists)
  - Photo viewing dialog with large preview for both visitor records and visitor items
  - Image icon used for consistent UI across the application
  - View photo button positioned as the last action button for consistent UX

- Updated PhonesLettersScreen tab styling to match VisitationsScreen:
  - Tabs now use full width layout with burgundy (#650000) active state background
  - Active tab displays white text for better contrast
  - Consistent h-12 height and bg-muted/50 background for inactive tabs
  - Icons positioned with mr-2 spacing for uniform appearance across all tabs

- Smart letter form workflow in PhonesLettersScreen:
  - Letter Type field disabled until prisoner is selected (enforces correct workflow)
  - Incoming letters: Prisoner name auto-fills Recipient Name field (field becomes read-only)
  - Outgoing letters: Prisoner name auto-fills Sender Name field (field becomes read-only)
  - Auto-population dynamically updates when letter type changes
  - Previous field values cleared when switching between incoming/outgoing types
  - Visual feedback with muted backgrounds for auto-filled fields
  - Helper text indicates "Auto-filled with prisoner name" for disabled fields

- Staff deployment deletion in ShiftDeploymentsScreen:
  - Delete button added to Staff Deployments table for removing staff from shifts
  - ConfirmDialog used for safe deletion confirmation with staff details display
  - Automatic refresh of both deployment and shift tables after deletion
  - Staff count in shift details updates immediately after staff removal
  - Allows users to remove staff before deleting shifts (enforces shift deletion restriction)

- Enhanced Add Staff to Shift form in ShiftDeploymentsScreen:
  - Station dropdown now uses SearchableSelect component with server-side search
  - Fetches stations from shift_details API for better data consistency
  - Shift dropdown auto-populates based on selected station
  - Shifts extracted dynamically from shift_details API for the selected station
  - Shift dropdown disabled until station is selected
  - Improved user workflow with cascading dropdowns

### Fixed
- Rank field now displays correctly in Staff Deployments table:
  - Added fallback logic to check both `rank_name` and `rank` fields from API response
  - Resolves issue where rank data was returned but not displayed in the UI

- Download functionality for call recordings and letter documents in PhonesLettersScreen:
  - Download button appears conditionally when attachments exist
  - Handles base64 data URLs, relative API paths, and absolute URLs
  - Positioned after delete button in actions column for consistent action ordering
  - Shows success/error toast notifications for download operations

- Added edit and delete functionality for shift management in Shift Deployments screen:
  - Edit button (icon) to modify existing shift details
  - Delete button (icon) with confirmation dialog showing shift details
  - Prevents deletion of shifts that have staff assigned (shows helpful notification)
  - Dynamic dialog title and submit button text based on create/edit mode
  - Form state reset on dialog close

- Enhanced "Add Staff Member to Shift" form:
  - Shift dropdown now only shows shifts belonging to the selected station
  - Shift dropdown is controlled by station selection
  - Shows "No shifts available for this station" when no shifts found
  - Shift selection clears when station changes

### Fixed
- Fixed shift dropdown in Shift Deployments screen to use correct API endpoint and filter by selected station:
  - Changed from `/station-management/api/shift-details/` to `/station-management/api/shifts/`
  - Shift dropdown now only shows shifts belonging to the selected station
  - Clears shift selection when station changes to prevent invalid selections
  - Updated service layer with `fetchShifts()` function for proper shift data retrieval
  - Updated `Shift` interface to match API response structure with `shift_name` field

- Replaced inline delete confirmation dialog with reusable ConfirmDialog component
  - Shows shift details: station, shift name, leader, and staff count
  - Centralized storage access using safeSetItem / safeGetItem / safeRemoveItem.
  - Replaced direct localStorage calls with the safe helpers in src/services/authService.ts.
  - Ensured tokens and user data are set/cleared consistently via setAuth() / clearAuth().

### Security


### Changed


### Notes / Recommendations


## Previous releases
- (Populate as you create releases)
# Changelog

All notable changes to this project should be documented in this file.

## [Unreleased] - 2026-01-25

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
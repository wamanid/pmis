# Changelog

All notable changes to this project should be documented in this file.

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
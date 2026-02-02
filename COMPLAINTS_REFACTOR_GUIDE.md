# Complaints Module Server-Side Pagination Refactoring Guide

## Service Layer ✅ COMPLETE
- Added COMPLAINTS_API_ENDPOINTS constant
- Updated all 13 service functions to use constants
- All functions return full paginated responses
- Cancellation errors silently handled

## ComplaintsScreen.tsx ✅ COMPLETE
- Removed client-side state arrays (stations, prisoners, natures, priorities, ranks)
- Removed useEffect that loaded lookups
- Removed props to ComplaintForm

## ComplaintForm.tsx - TODO

### 1. Update Interface (remove props arrays)
```tsx
interface ComplaintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (complaint: Complaint) => Promise<any>;
  complaint?: Complaint | null;
  mode: "add" | "edit";
  // REMOVE: stations, prisoners, complaintNatures, priorities, ranks props
}
```

### 2. Add Server-Side Fetch Callbacks
```tsx
import { useFilters } from '../../contexts/FilterContext';

const { region: globalRegion, district: globalDistrict, station: globalStation } = useFilters();

// Add these fetch callbacks (50 items/page, region/district/station filters)
const fetchStationsPaginated = useCallback(
  async (opts: any, signal?: AbortSignal) => {
    try {
      const response = await ComplaintsService.fetchStations({
        search: opts?.search || '',
        page: opts?.page || 1,
        page_size: opts?.page_size || 50,
        region: globalRegion || undefined,
        district: globalDistrict || undefined,
        station: globalStation || undefined,
      }, signal);
      const payload = response?.results ? response : { results: response || [], count: 0 };
      return {
        items: payload?.results ?? [],
        count: payload?.count ?? 0,
        next: payload?.next ?? null,
      };
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      console.error('fetchStationsPaginated error:', error);
      return { items: [], count: 0, next: null };
    }
  },
  [globalRegion, globalDistrict, globalStation]
);

const fetchNaturesPaginated = useCallback(
  async (opts: any, signal?: AbortSignal) => {
    try {
      const response = await ComplaintsService.fetchComplaintNatures({
        search: opts?.search || '',
        page: opts?.page || 1,
        page_size: opts?.page_size || 50,
      }, signal);
      const payload = response?.results ? response : { results: response || [], count: 0 };
      return {
        items: payload?.results ?? [],
        count: payload?.count ?? 0,
        next: payload?.next ?? null,
      };
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      return { items: [], count: 0, next: null };
    }
  },
  []
);

const fetchPrioritiesPaginated = useCallback(
  async (opts: any, signal?: AbortSignal) => {
    try {
      const response = await ComplaintsService.fetchPriorities({
        search: opts?.search || '',
        page: opts?.page || 1,
        page_size: opts?.page_size || 50,
      }, signal);
      const payload = response?.results ? response : { results: response || [], count: 0 };
      return {
        items: payload?.results ?? [],
        count: payload?.count ?? 0,
        next: payload?.next ?? null,
      };
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      return { items: [], count: 0, next: null };
    }
  },
  []
);

const fetchRanksPaginated = useCallback(
  async (opts: any, signal?: AbortSignal) => {
    try {
      const response = await ComplaintsService.fetchRanks({
        search: opts?.search || '',
        page: opts?.page || 1,
        page_size: opts?.page_size || 50,
      }, signal);
      const payload = response?.results ? response : { results: response || [], count: 0 };
      return {
        items: payload?.results ?? [],
        count: payload?.count ?? 0,
        next: payload?.next ?? null,
      };
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return { items: [], count: 0, next: null };
      }
      return { items: [], count: 0, next: null };
    }
  },
  []
);
```

### 3. Remove Client-Side State Arrays
Remove these lines:
```tsx
// REMOVE:
const [stationSearch, setStationSearch] = useState("");
const [staffSearch, setStaffSearch] = useState<string>("");
const [staffOptions, ...] // if not needed
```

### 4. Update Staff Profile Handling
```tsx
// Change staffProfiles useEffect to use server-side params
useEffect(() => {
  if (!selectedStaffId) {
    setValue("officer_requested", "");
    setValue("force_number", "");
    setValue("officer_requested_username", "");
    setValue("rank", "");
    setValue("rank_name", "");
    return;
  }

  let mounted = true;
  (async () => {
    try {
      const response = await ComplaintsService.fetchStaffProfiles({
        id: selectedStaffId,
        page: 1,
        page_size: 1,
      });
      if (!mounted) return;
      
      const results = response?.results ?? [];
      const s = results.length > 0 ? results[0] : null;
      
      if (s) {
        setValue("officer_requested", s.id);
        setValue("force_number", s.force_number ?? "");
        setValue("rank", s.rank ?? "");
        setValue("officer_requested_username", s.username ?? "");
        setValue("rank_name", s.rank_name ?? "");
      }
    } catch (err) {
      if (!mounted) return;
      console.error('Failed to fetch staff details:', err);
    }
  })();
  
  return () => { mounted = false; };
}, [selectedStaffId, setValue]);
```

### 5. Convert to SearchableSelect/CustomPrisonerSearch
Replace all Select components with server-side paginated versions:

**Station (if shown - usually auto-populated from prisoner)**:
```tsx
<SearchableSelect
  key={`station-${isOpen}`}
  value={watchStation}
  onChange={(v) => setValue("station", v ?? "")}
  fetchPaginated={fetchStationsPaginated}
  idField="id"
  labelField="name"
  pageSize={50}
  placeholder="Select station"
  disabled={mode === "edit"} // Usually disabled/auto-populated
/>
```

**Nature of Complaint**:
```tsx
<SearchableSelect
  key={`nature-${isOpen}`}
  value={watchNature}
  onChange={(v) => setValue("nature_of_complaint", v ?? "")}
  fetchPaginated={fetchNaturesPaginated}
  idField="id"
  labelField="name"
  pageSize={50}
  placeholder="Select nature"
/>
```

**Priority**:
```tsx
<SearchableSelect
  key={`priority-${isOpen}`}
  value={watchPriority}
  onChange={(v) => setValue("complaint_priority", v ?? "")}
  fetchPaginated={fetchPrioritiesPaginated}
  idField="id"
  labelField="name"
  pageSize={50}
  placeholder="Select priority"
/>
```

**Rank** (if using SearchableSelect instead of auto-populate):
```tsx
<SearchableSelect
  key={`rank-${isOpen}`}
  value={watchRank}
  onChange={(v) => setValue("rank", v ?? "")}
  fetchPaginated={fetchRanksPaginated}
  idField="id"
  labelField="name"
  pageSize={50}
  placeholder="Select rank"
  disabled // If auto-populated from staff
  readOnly
  className="bg-muted"
/>
```

**Prisoner (CustomPrisonerSearch)**:
```tsx
<CustomPrisonerSearch
  key={`prisoner-${isOpen}`}
  value={watchPrisoner || null}
  onChange={(v) => setValue("prisoner", v ?? "")}
  placeholder="Search prisoner"
  disabled={mode === "edit"} // Usually disabled when editing
/>
```

**Officer (StaffProfileSelect)**:
```tsx
<StaffProfileSelect
  key={`officer-${isOpen}`}
  value={selectedStaffId || null}
  onChange={(v) => setSelectedStaffId(v ?? null)}
  placeholder="Select officer"
/>
```

### 6. Add onInteractOutside to DialogContent
```tsx
<DialogContent 
  className="max-w-4xl max-h-[90vh] overflow-y-auto"
  onInteractOutside={(e) => e.preventDefault()}
>
```

### 7. Ensure Auto-Populated Fields are Disabled
```tsx
{/* Station - auto-populated from prisoner */}
<Input
  value={stationDisplay}
  disabled
  readOnly
  className="bg-muted"
  placeholder="Auto-populated from prisoner"
/>

{/* Force Number - auto-populated from staff */}
<Input
  {...register("force_number")}
  disabled
  readOnly
  className="bg-muted"
  placeholder="Auto-populated"
/>

{/* Rank - auto-populated from staff */}
<Input
  value={watch("rank_name") ?? ""}
  disabled
  readOnly
  className="bg-muted"
  placeholder="Auto-populated"
/>
```

### 8. Remove Destructured Props
```tsx
// CHANGE FROM:
const ComplaintForm: React.FC<ComplaintFormProps> = ({
  isOpen,
  onClose,
  onSave,
  complaint,
  mode,
  stations = [],
  prisoners = [],
  complaintNatures = [],
  priorities = [],
  ranks = [],
}) => {

// TO:
const ComplaintForm: React.FC<ComplaintFormProps> = ({
  isOpen,
  onClose,
  onSave,
  complaint,
  mode,
}) => {
```

### 9. Update Complaint Status Select
```tsx
// Load statuses from API (already in code)
// Convert to SearchableSelect if many statuses, or keep as Select if few

{/* If few statuses, keep as Select */}
<Select
  value={watchStatus}
  onValueChange={(v) => setValue("complaint_status", v)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    {complaintStatuses.map(s => (
      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

## CHANGELOG Update

Add this entry to CHANGELOG.md under `### Added`:

```markdown
- **Complaints module comprehensive refactoring (14M+ ready)** - Modernized module with server-side pagination for scalability:
  - **API Centralization**: Added COMPLAINTS_API_ENDPOINTS constant in complaintsService.ts with 10 centralized endpoints
  - **Service Layer Updates**: All 13 service functions now use centralized constants and return full paginated responses
    - fetchComplaints, fetchComplaint, createComplaint, updateComplaint, deleteComplaint
    - fetchStations, fetchPrisoners, fetchComplaintNatures, fetchPriorities, fetchRanks
    - fetchStaffProfiles, fetchComplaintStatuses, createComplaintAction, fetchApprovalStatuses
  - **Server-Side Pagination**: Converted form dropdowns to 14M+ ready paginated mode
    - Station selector: SearchableSelect with fetchStationsPaginated (50 items/page, region/district/station filters)
    - Nature selector: SearchableSelect with fetchNaturesPaginated (50 items/page)
    - Priority selector: SearchableSelect with fetchPrioritiesPaginated (50 items/page)
    - Rank selector: SearchableSelect with fetchRanksPaginated (50 items/page)
    - Prisoner selector: CustomPrisonerSearch with built-in server-side pagination
    - Officer selector: StaffProfileSelect with server-side pagination
  - **Auto-Populated Fields**: Station, force number, and rank remain disabled and auto-populated
    - Station auto-populates from selected prisoner's current station
    - Force number and rank auto-populate from selected officer/staff profile
    - All disabled fields use disabled, readOnly, and bg-muted styling
  - **Code Cleanup**: Removed client-side lookup arrays and useEffect that loaded them
    - Removed props passing (stations, prisoners, natures, priorities, ranks) to ComplaintForm
    - Form components handle server-side fetching internally
  - **Benefits**: Scalable for 14M+ records, consistent with Journal and Housing Allocation patterns, improved performance
```

## Testing Checklist

After implementation, verify:
- [ ] All dropdowns load options via server-side pagination
- [ ] Searching in dropdowns triggers API calls with search param
- [ ] Pagination works (next/previous pages load)
- [ ] Region/district/station filters affect dropdown options
- [ ] Station auto-populates when prisoner selected
- [ ] Force number and rank auto-populate when officer selected
- [ ] Disabled fields cannot be edited
- [ ] No console errors about cancellation
- [ ] Form submission works (create and edit)
- [ ] Actions can be added to complaints
- [ ] No dropdown clearing when switching between fields

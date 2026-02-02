# SearchableSelect Edit Mode Guide - Prevent Empty Fields After Page Refresh

## Problem We Solved
When editing records after page refresh, dropdown fields (SearchableSelect, StaffProfileSelect, CustomPrisonerSearch) showed placeholder text instead of the actual selected values, even though the API returned complete data.

## Root Cause
**Timing Issue:** Components initialized with `null` values before complaint data arrived, causing SearchableSelect to cache the empty state before the correct value was set.

## Universal Solution Pattern

### 1. **Initialize State with Correct Value Immediately**

❌ **WRONG - Don't do this:**
```typescript
const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
// Later in useEffect: setSelectedStaffId(complaint.officer_requested)
```

✅ **CORRECT - Do this:**
```typescript
const [selectedStaffId, setSelectedStaffId] = useState<string | null>(() => {
  if (complaint && mode === "edit" && complaint.officer_requested) {
    return complaint.officer_requested;
  }
  return null;
});
```

**Why:** useState initializer function runs once on mount. If complaint data is already available (from props), grab the value immediately.

---

### 2. **Always Pass initialItem in Edit Mode**

✅ **For SearchableSelect (nature, priority, etc.):**
```typescript
// Derive initialItem directly from complaint prop
const initialNature = (complaint && mode === "edit" && complaint.nature_of_complaint)
  ? { id: complaint.nature_of_complaint, name: complaint.nature_of_complaint_name }
  : null;

<SearchableSelect
  key={`nature-${isOpen}-${complaint?.id}-${selectsKey}`}
  value={localNatureValue}
  onChange={(v) => {
    setLocalNatureValue(v ?? null);
    setValue("nature_of_complaint", v ?? "");
  }}
  fetchPaginated={fetchNaturesPaginated}
  idField="id"
  labelField="name"
  placeholder="Select nature"
  initialItem={initialNature ?? undefined} // ← CRITICAL
/>
```

✅ **For StaffProfileSelect (officers, staff):**
```typescript
<StaffProfileSelect
  value={selectedStaffId ?? null}
  onChange={(v) => setSelectedStaffId(v ?? null)}
  placeholder="Select officer"
  initialItem={complaint && mode === "edit" && complaint.officer_requested ? {
    id: complaint.officer_requested,
    staff_name: complaint.officer_requested_username || "Unknown",
    force_number: complaint.force_number,
    rank_name: complaint.rank_name
  } : undefined} // ← Pass complete object
/>
```

**Why:** SearchableSelect caches initialItem immediately, ensuring the display name shows up without fetching.

---

### 3. **Use Refs to Prevent Race Conditions**

✅ **Add initialization tracking ref:**
```typescript
const isOfficerInitialized = React.useRef(false);

// In useState initializer
const [selectedStaffId, setSelectedStaffId] = useState<string | null>(() => {
  if (complaint && mode === "edit" && complaint.officer_requested) {
    isOfficerInitialized.current = true; // ← Mark as initialized
    return complaint.officer_requested;
  }
  return null;
});

// In initialization useEffect
useEffect(() => {
  if (complaint && mode === "edit") {
    const newOfficerId = complaint.officer_requested || null;
    // Only set if not already initialized OR if value changed
    if (newOfficerId && (!isOfficerInitialized.current || selectedStaffId !== newOfficerId)) {
      setSelectedStaffId(newOfficerId);
      isOfficerInitialized.current = true;
    }
  } else if (mode === "add") {
    setSelectedStaffId(null);
    isOfficerInitialized.current = false; // ← Reset when switching modes
  }
}, [complaint?.officer_requested, mode, selectedStaffId]);

// Reset ref when dialog closes
useEffect(() => {
  if (!isOpen) {
    setSelectedStaffId(null);
    isOfficerInitialized.current = false; // ← Reset
  }
}, [isOpen]);
```

**Why:** Prevents state from being cleared after it's correctly initialized.

---

### 4. **Derive Initial Form Values with useMemo**

✅ **Do this:**
```typescript
const initialFormValues = React.useMemo(() => {
  if (complaint && mode === "edit") {
    return {
      nature_of_complaint: complaint.nature_of_complaint,
      complaint_priority: complaint.complaint_priority,
      officer_requested: complaint.officer_requested,
      force_number: complaint.force_number,
      rank: complaint.rank,
      rank_name: complaint.rank_name,
      // ... all other fields
    };
  }
  return {
    nature_of_complaint: "",
    complaint_priority: "",
    officer_requested: "",
    force_number: "",
    rank: "",
    rank_name: "",
    // ... all other fields
  };
}, [complaint, mode]);

const { register, setValue, watch, reset } = useForm<FormData>({
  defaultValues: initialFormValues,
});

// Reset when complaint changes
useEffect(() => {
  if (isOpen && mode === "edit" && complaint) {
    reset(initialFormValues, { 
      keepDefaultValues: false,
      keepDirty: false,
      keepTouched: false,
    });
  }
}, [isOpen, complaint?.id, mode, initialFormValues, reset]);
```

**Why:** Ensures React Hook Form has all values from the start, preventing empty fields in hidden inputs.

---

### 5. **Sync Local State with Complaint Data**

✅ **For SearchableSelect components:**
```typescript
const [localNatureValue, setLocalNatureValue] = useState<string | null>(null);

useEffect(() => {
  if (complaint && mode === "edit") {
    setLocalNatureValue(complaint.nature_of_complaint || null);
  } else {
    setLocalNatureValue(null);
  }
}, [complaint?.nature_of_complaint, mode]);
```

**Why:** Keeps controlled component value in sync with fresh API data.

---

### 6. **Only Fetch When User Manually Changes Selection**

✅ **Auto-populate fields (force number, rank from staff):**
```typescript
useEffect(() => {
  // Skip if editing and staff ID matches existing complaint
  if (!selectedStaffId || (mode === "edit" && complaint?.officer_requested === selectedStaffId)) {
    return; // Don't fetch - we already have the data from form reset
  }

  // Only fetch when user manually selects different officer
  const controller = new AbortController();
  (async () => {
    const response = await fetchStaffProfiles({ id: selectedStaffId }, controller.signal);
    const staff = response?.results?.[0];
    if (staff) {
      setValue("force_number", staff.force_number);
      setValue("rank", staff.rank);
    }
  })();

  return () => controller.abort();
}, [selectedStaffId, mode, complaint?.officer_requested, setValue]);
```

**Why:** Prevents unnecessary API calls when opening edit form with existing data.

---

## Complete Checklist for New Modules

### For Each Dropdown Field:

- [ ] Initialize state with function: `useState(() => complaint?.field || null)`
- [ ] Pass `initialItem` in edit mode with complete object `{id, name, ...}`
- [ ] Use local state variable (`localNatureValue`) for SearchableSelect `value` prop
- [ ] Sync local state with complaint data in useEffect
- [ ] Add `key` prop to force remount: `key={`field-${isOpen}-${complaint?.id}`}`
- [ ] Derive `initialItem` from complaint prop before component render
- [ ] Use ref to track initialization for complex fields (like staff selection)
- [ ] Skip auto-populate fetch if editing and value matches existing complaint

### For Auto-Populated Fields (force number, rank, etc.):

- [ ] Store in React Hook Form with `register("field")` or `setValue("field", value)`
- [ ] Display with `watch("field")` in read-only Input
- [ ] Add hidden input: `<input type="hidden" {...register("field")} />`
- [ ] Style as disabled: `disabled readOnly className="bg-muted"`
- [ ] Only fetch when user manually changes parent selection (check mode and existing value)

### For Form Reset:

- [ ] Use `useMemo` to derive `initialFormValues` from complaint
- [ ] Call `reset(initialFormValues, { keepDefaultValues: false })` when complaint changes
- [ ] Include all fields in dependency array: `[complaint?.field1, complaint?.field2, mode]`
- [ ] Reset local state variables in same useEffect

### For Dialog Cleanup:

- [ ] Reset all state when dialog closes: `if (!isOpen) { ... }`
- [ ] Reset initialization refs: `isOfficerInitialized.current = false`
- [ ] Clear local state: `setLocalNatureValue(null)`

---

## Module Template

```typescript
// 1. Initialize state with correct value
const isFieldInitialized = React.useRef(false);
const [selectedFieldId, setSelectedFieldId] = useState<string | null>(() => {
  if (record && mode === "edit" && record.field_id) {
    isFieldInitialized.current = true;
    return record.field_id;
  }
  return null;
});

const [localFieldValue, setLocalFieldValue] = useState<string | null>(null);

// 2. Derive initialItem from record
const initialFieldItem = (record && mode === "edit" && record.field_id && record.field_name)
  ? { id: record.field_id, name: record.field_name }
  : null;

// 3. Derive initial form values
const initialFormValues = React.useMemo(() => {
  if (record && mode === "edit") {
    return {
      field_id: record.field_id,
      field_name: record.field_name,
      // ... all fields
    };
  }
  return { field_id: "", field_name: "", /* ... */ };
}, [record, mode]);

// 4. Setup form
const { register, setValue, watch, reset } = useForm({ defaultValues: initialFormValues });

// 5. Sync local state with record data
useEffect(() => {
  if (record && mode === "edit") {
    setLocalFieldValue(record.field_id || null);
  } else {
    setLocalFieldValue(null);
  }
}, [record?.field_id, mode]);

// 6. Reset form when record changes
useEffect(() => {
  if (isOpen && mode === "edit" && record) {
    reset(initialFormValues, { keepDefaultValues: false });
  }
}, [isOpen, record?.id, mode, initialFormValues, reset]);

// 7. Initialize display state
useEffect(() => {
  if (record && mode === "edit") {
    const newFieldId = record.field_id || null;
    if (newFieldId && (!isFieldInitialized.current || selectedFieldId !== newFieldId)) {
      setSelectedFieldId(newFieldId);
      isFieldInitialized.current = true;
    }
  } else if (mode === "add") {
    setSelectedFieldId(null);
    isFieldInitialized.current = false;
  }
}, [record?.field_id, mode, selectedFieldId]);

// 8. Reset on close
useEffect(() => {
  if (!isOpen) {
    setSelectedFieldId(null);
    setLocalFieldValue(null);
    isFieldInitialized.current = false;
  }
}, [isOpen]);

// 9. Only fetch when user manually changes
useEffect(() => {
  if (!selectedFieldId || (mode === "edit" && record?.field_id === selectedFieldId)) {
    return; // Skip - already have data
  }
  // Fetch details...
}, [selectedFieldId, mode, record?.field_id]);

// 10. Render with initialItem
<SearchableSelect
  key={`field-${isOpen}-${record?.id}`}
  value={localFieldValue}
  onChange={(v) => {
    setLocalFieldValue(v ?? null);
    setValue("field_id", v ?? "");
  }}
  fetchPaginated={fetchFieldsPaginated}
  initialItem={initialFieldItem ?? undefined}
  idField="id"
  labelField="name"
/>
```

---

## Key Takeaways

1. **Start with correct value** - Don't initialize with `null` if data is already available
2. **Pass initialItem** - SearchableSelect needs display data immediately, not later
3. **Use refs for flags** - Prevent race conditions from useEffect re-runs
4. **Skip unnecessary fetches** - Check mode and existing value before fetching
5. **Reset everything** - Clear all state and refs when dialog closes

Follow this pattern for ALL dropdown fields in ALL modules to avoid empty field issues after page refresh.

---

## Updated Module Refactoring Prompt

Use this prompt template when refactoring or creating new modules:

```
Convert [MODULE NAME] dropdowns to server-side pagination (14M+ ready):

**Server-Side Pagination:**
- Convert SearchableSelect to use fetchPaginated callbacks (50 items/page, region/district/station filters)
- Update StaffProfileSelect to use server-side pagination (remove initialItems prop)
- Update CustomPrisonerSearch to use server-side pagination (remove initialItems prop, already has built-in fetchPaginated)
- Remove old client-side state arrays (items, lookups) and useEffect that loaded them

**Edit Mode Dropdown Fixes (CRITICAL - Prevents Empty Fields After Refresh):**
- Initialize dropdown state with function: `useState(() => record?.field_id || null)`
- Add initialization ref: `const isFieldInitialized = React.useRef(false)` and set in useState initializer
- Always pass `initialItem` prop in edit mode: `initialItem={record && mode === "edit" ? {id, name} : undefined}`
- Derive initialItem before render: `const initialItem = record && mode === "edit" ? {id, name} : null`
- Use local state for SearchableSelect value: `const [localValue, setLocalValue] = useState(null)`
- Sync local state with record in useEffect: watch `record?.field_id` changes
- Add key props to force remount: `key={`field-${isOpen}-${record?.id}-${selectsKey}`}`
- Skip auto-populate fetch if editing and value matches: `if (mode === "edit" && record?.field === value) return;`
- Reset initialization refs when dialog closes: `isFieldInitialized.current = false`
- Derive initialFormValues with useMemo and reset form when record changes

**State Management:**
- All onChange handlers MUST use functional setState: `prev => ({ ...prev, field: value })`
- Auto-populated fields use React Hook Form setValue: `setValue("force_number", value)`
- Watch RHF values for display: `const watchField = watch("field")`
- Hidden inputs for backend submission: `<input type="hidden" {...register("field")} />`

**Dialog & Interaction:**
- Add `onInteractOutside={(e) => e.preventDefault()}` to DialogContent to prevent closing when clicking dropdowns
- Disabled auto-populated fields should have both disabled and readOnly props with bg-muted styling

**Error Handling:**
- Silence cancellation errors in all fetch callbacks (CanceledError, ERR_CANCELED, AbortError)
- Use AbortController for all async operations with cleanup in useEffect return

**API & Services:**
- API centralization: Add MODULE_API_ENDPOINTS constant in service file
- All service functions use centralized endpoint constants
- Service functions return full paginated responses for server-side pagination
- Fetch with id parameter for single record details (not search parameter)

**Documentation:**
- Update CHANGELOG with comprehensive module refactoring entry
- Reference SEARCHABLE_DROPDOWN_EDIT_MODE_GUIDE.md for detailed patterns

**Testing Checklist:**
✅ All dropdown fields populate correctly in edit mode after page refresh
✅ Force number, rank, and auto-populated fields display correctly
✅ No console errors about canceled requests
✅ Dropdowns don't cause dialog to close when clicking
✅ Form submission sends correct UUIDs to backend
```

**Example Implementation Reference:** See ComplaintForm.tsx for complete working implementation of all patterns.

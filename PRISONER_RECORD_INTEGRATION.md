# Prisoner Record Integration

## Overview
Integrated prisoner record management into the Prisoner BioData Form, allowing creation, updating, and viewing of prisoner records through the Records tab.

## Files Created

### 1. Model: `src/models/admission/prisonerRecord.ts`
- **PrisonerRecord** interface with all fields from API response
- **PrisonerRecordListResponse** for paginated API responses
- **PrisonerRecordFilters** for filtering records
- Exported through `src/models/admission/index.ts`

### 2. Service: `src/services/admission/prisonerRecordService.ts`
Complete CRUD operations for prisoner records:
- `getPrisonerRecords(filters)` - Fetch paginated list with filters
- `getPrisonerRecordsByPrisonerId(prisonerId)` - Fetch records for specific prisoner
- `getPrisonerRecordById(id)` - Fetch single record
- `createPrisonerRecord(data)` - Create new record
- `updatePrisonerRecord(id, data)` - Update existing record
- `deletePrisonerRecord(id)` - Delete record

## Integration in PrisonerBioDataForm

### State Management
Added state variables:
```typescript
const [prisonerRecords, setPrisonerRecords] = useState<PrisonerRecord[]>([]);
const [loadingRecords, setLoadingRecords] = useState(false);
```

### Fetch Records Function
```typescript
const fetchPrisonerRecords = async (prisonerId: string) => {
  // Fetches and displays prisoner records when editing existing biodata
}
```

### Form Submission
The form makes **two separate API requests** when submitting:

1. **Prisoner Biodata Submission**: Submits all biodata fields (personal info, identification, address, physical characteristics) excluding prisoner record fields
2. **Prisoner Record Submission**: Submits prisoner record fields separately:
   - prisoner_class
   - escapee, armed_personnel, extremely_violent, life_or_death_imprisonment
   - commital, previous_convictions_count
   - arrest location (region, district, county, sub_county, parish, village)

The prisoner record fields are removed from the biodata submission to avoid duplication. If editing an existing prisoner, the form updates the existing record; otherwise, it creates a new one.

### Records Tab Display
Added a "Prisoner Records History" section at the top of the Records tab that:
- Shows loading spinner while fetching
- Displays table with columns:
  - Prisoner Class
  - Prison Station
  - Tags (colored badges for escapee, armed, violent, life/death)
  - Security Rating
  - Created Date
- Shows message if no records exist
- Only visible when editing existing prisoner (bioData?.prisoner exists)

## API Endpoints Used
- `GET /admission/prisoner-records/?prisoner={id}` - Fetch records for prisoner (display in history table)
- `POST /admission/prisoner-records/` - Create new prisoner record
- `PATCH /admission/prisoner-records/{id}/` - Update existing prisoner record
- `POST /admission/prisoner-biodata/` - Create prisoner biodata
- `PATCH /admission/prisoner-biodata/{id}/` - Update prisoner biodata

## Data Flow
1. **On Edit Mode**: When bioData has a prisoner ID, existing prisoner records are fetched and displayed in the Records tab history table
2. **On Submit**: 
   - First, biodata is created/updated (excluding prisoner record fields)
   - Then, prisoner record is created/updated separately with record-specific fields
   - Both requests must succeed for the operation to complete
3. **Display**: Records history shown in table format with visual tags for easy reference

## TypeScript Notes
Pre-existing TypeScript errors exist because the PrisonerBiodata interface doesn't include prisoner record fields (escapee, armed_personnel, etc.). These fields are in the form UI but not in the interface definition. Used type assertion (`as any`) to work around this in the submission logic.

## Testing Checklist
- [ ] Create new prisoner biodata with record information
- [ ] Edit existing prisoner biodata and verify records display
- [ ] Update prisoner record information
- [ ] Verify all prisoner tagging checkboxes work correctly
- [ ] Verify arrest location fields are saved to prisoner record
- [ ] Check prisoner class selection saves correctly
- [ ] Verify table displays all record fields properly
- [ ] Test with multiple records for same prisoner

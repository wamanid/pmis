# Treatment Plan UI Improvements - Implementation Summary

## Overview
Implemented improvements to the Treatment Plan module based on medical expert review feedback, focusing on real-world pharmacy practices and clinical workflows.

## Changes Implemented

### 1. **Terminology Update**
**Before**: `medication_type`  
**After**: `medication_form`  
**Rationale**: Medical terminology distinction - "form" refers to physical formulation (Tablet, Syrup, etc.), while "type" is ambiguous.

### 2. **Hierarchical Dispensing System**
**Problem**: Flat quantity system didn't match real pharmacy practices (pharmacists dispense strips/packets, not individual pills).

**Solution**: Added two-level dispensing hierarchy:
- `quantity_dispensed`: How many units (numeric)
- `dispensing_unit`: What unit type (Strip, Packet, Bottle, etc.)

**Example**:
- **Before**: `quantity: 48, quantity_unit: "tablets"` ❌
- **After**: `quantity_dispensed: 2, dispensing_unit: "Strip"` ✅  
  (2 strips × 24 tablets = 48 tablets)

### 3. **Context-Aware Dispensing Units**
Added intelligent dropdown that shows relevant units based on medication form:

```typescript
const DISPENSING_UNITS = {
  Tablet: ['Individual', 'Strip', 'Packet'],
  Capsule: ['Individual', 'Strip', 'Packet'],
  Syrup: ['Bottle'],
  Injection: ['Vial', 'Ampule'],
  IV: ['Bottle'],
  Ointment: ['Tube'],
  Cream: ['Tube'],
  Drop: ['Bottle'],
  Inhaler: ['Individual'],
};
```

### 4. **Added Cream Form**
Extended medication forms to include 'Cream' (was missing from original list).

### 5. **Display Labels**
Added user-friendly labels for dispensing units:
```typescript
const DISPENSING_UNIT_LABELS = {
  Individual: 'Individual units',
  Strip: 'Strip (typically 10 units)',
  Packet: 'Packet (multiple strips)',
  Bottle: 'Bottle',
  Vial: 'Vial',
  Ampule: 'Ampule',
  Tube: 'Tube',
};
```

## Files Modified

### Core Type Definitions
- **[TreatmentPlan.types.ts](src/components/medical/treatment/TreatmentPlan.types.ts)**
  - Updated `TreatmentMedication` interface
  - Renamed `medication_type` → `medication_form`
  - Renamed `quantity` → `quantity_dispensed`
  - Removed `quantity_unit` field
  - Added `dispensing_unit` field
  - Added `MEDICATION_FORMS` constant (renamed from `MEDICATION_TYPES`)
  - Added `DISPENSING_UNITS` constant
  - Added `DISPENSING_UNIT_LABELS` constant

### Form Component
- **[TreatmentPlanFormV2.tsx](src/components/medical/treatment/TreatmentPlanFormV2.tsx)**
  - Updated imports to use new constants
  - Changed "Type" label to "Form"
  - Changed "Quantity" label to "Quantity Dispensed"
  - Changed "Unit" label to "Dispensing Unit"
  - Added dynamic dispensing unit dropdown that updates based on selected form
  - Updated table column headers: "Type" → "Form", "Quantity" → "Dispensed"
  - Updated display logic for medication lists
  - Fixed initial state and reset form logic

### Mock Data
- **[TreatmentPlan.mock.ts](src/components/medical/treatment/TreatmentPlan.mock.ts)**
  - Updated all mock treatment plans with new field names
  - Changed dispensing units from generic (tablets, ml) to specific (Strip, Bottle)

### Deprecated Files
- **[TreatmentPlanForm.tsx](src/components/medical/treatment/TreatmentPlanForm.tsx)**
  - Added deprecation notice (old version kept for backwards compatibility)

## Before vs After Comparison

| Aspect | Before | After |
|--------|--------|-------|
| **Terminology** | medication_type | medication_form |
| **Dispensing** | quantity: 48 tablets | quantity_dispensed: 2 Strips |
| **Hierarchy** | Flat (only pills counted) | Two-level (strips → pills) |
| **UI Labels** | Type, Quantity, Unit | Form, Quantity Dispensed, Dispensing Unit |
| **Dropdown** | Static units list | Context-aware (changes with form) |
| **Forms Available** | 8 forms | 9 forms (added Cream) |

## Real-World Examples

### Example 1: Panadol
**Before**:
```typescript
{
  medication_name: 'Panadol',
  medication_type: 'Tablet',
  quantity: 48,
  quantity_unit: 'tablets'
}
```

**After**:
```typescript
{
  medication_name: 'Panadol',
  medication_form: 'Tablet',
  quantity_dispensed: 2,
  dispensing_unit: 'Strip'  // Each strip has 24 tablets
}
```

### Example 2: Cough Syrup
**Before**:
```typescript
{
  medication_name: 'Bromhexine',
  medication_type: 'Syrup',
  quantity: 100,
  quantity_unit: 'ml'
}
```

**After**:
```typescript
{
  medication_name: 'Bromhexine',
  medication_form: 'Syrup',
  quantity_dispensed: 1,
  dispensing_unit: 'Bottle'  // Bottle contains 100ml
}
```

## Migration Notes

### API Compatibility
The backend API will need to be updated to:
1. Accept `medication_form` instead of `medication_type`
2. Accept `quantity_dispensed` and `dispensing_unit` instead of `quantity` and `quantity_unit`
3. Handle the new enum values for `dispensing_unit`

### Data Migration
Existing treatment plan records will need field mapping:
```sql
UPDATE treatment_medications SET
  medication_form = medication_type,
  quantity_dispensed = quantity,
  dispensing_unit = CASE 
    WHEN quantity_unit IN ('tablets', 'capsules') THEN 'Strip'
    WHEN quantity_unit IN ('ml') THEN 'Bottle'
    ELSE 'Individual'
  END;
```

## Benefits

1. ✅ **Matches Real Practice**: Reflects how pharmacists actually dispense medications
2. ✅ **Better Inventory**: Easier to track strips/bottles vs individual pills
3. ✅ **Clearer Terminology**: "Form" is medically accurate
4. ✅ **Context-Aware UI**: Dropdowns show only relevant options
5. ✅ **Extensible**: Easy to add new forms and dispensing units
6. ✅ **Type-Safe**: Full TypeScript support with proper enums

## Outstanding Items

### Not Yet Implemented
1. **Diagnosis Dropdown**: Still free text, needs integration with case book diagnoses
2. **Backend API Updates**: API endpoints need to support new field names
3. **Old Form Deprecation**: TreatmentPlanForm.tsx should eventually be removed

### Future Enhancements
1. Add quantity-per-unit metadata (e.g., "Strip of 10 tablets")
2. Auto-calculate individual units from dispensing units
3. Add batch/lot number tracking for dispensed medications
4. Implement expiry date tracking for dispensed items

## Testing Checklist

- [x] Type definitions compile without errors
- [x] Form component compiles without errors
- [x] Mock data compiles without errors
- [x] Dispensing unit dropdown updates when form changes
- [x] Initial values set correctly
- [x] Reset form clears all fields properly
- [x] Table displays new field names correctly
- [ ] Backend API integration (pending API changes)
- [ ] End-to-end create/edit/view flows (pending manual testing)

## Commit Information

All changes ready for commit with message:
```
feat(medical): Improve treatment plan dispensing with hierarchical units

- Rename medication_type to medication_form for medical accuracy
- Add two-level dispensing hierarchy (quantity_dispensed + dispensing_unit)
- Implement context-aware dispensing unit dropdowns based on medication form
- Add 'Cream' to medication forms
- Update mock data with realistic dispensing units (Strip, Bottle, etc.)
- Add user-friendly labels for dispensing units
- Deprecate old TreatmentPlanForm.tsx

BREAKING CHANGE: API field names changed - medication_type → medication_form,
quantity → quantity_dispensed, quantity_unit replaced with dispensing_unit enum
```

---

**Implementation Date**: February 8, 2026  
**Implemented By**: GitHub Copilot  
**Review Status**: Awaiting user testing and backend API updates

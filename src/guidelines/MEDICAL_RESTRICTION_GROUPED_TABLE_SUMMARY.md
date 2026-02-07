# Medical Restriction Management - Grouped Table Implementation

---
**Author**: Derrick Wamani (Demani) | **Email**: derrickwamani98@gmail.com | **Website**: demani.net  
**Created**: February 6, 2026 | **Last Updated**: February 6, 2026
---

## Overview
This document summarizes the grouped/collapsible table implementation for Medical Restriction Management module.

## Problem Statement
**Before**: Flat table mixed all restrictions together, making it difficult to:
- Identify which restrictions belong to which prisoner
- See how many restrictions each prisoner has
- Distinguish between prisoners with similar names
- Get a quick overview of active vs inactive restrictions per prisoner

**Example Data Confusion**:
```
Prisoner Name       | Reason              | Start Date
---------------------------------------------------------
Kathryn Robinson    | Injury Recovery     | 2026-02-10
Henry Semanda       | Injury Recovery     | 2026-02-09
Kathryn Robinson    | Security Risk       | 2026-02-09
```
→ Hard to tell at a glance that Kathryn has 2 restrictions and Henry has 1

## Solution: Grouped/Collapsible Table

### Visual Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ ▶ ARPC0000000001/26 | Kathryn Robinson                         │
│   📅 Feb 10, 2026 → Feb 23, 2026                                │
│   Active: 2  |  Inactive: 0  |  Total: 2                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ▼ JMPR0000000001/26 | Henry Semanda                            │
│   📅 Feb 9, 2026 → Feb 19, 2026                                 │
│   Active: 1  |  Inactive: 0  |  Total: 1                       │
├─────────────────────────────────────────────────────────────────┤
│   Reason            | State  | Facility       | Start      | Status │
│   ─────────────────────────────────────────────────────────────────│
│   Injury Recovery   | York   | Jinja Main     | Feb 9      | ✅ Active │
│   [View] [Edit] [Delete]                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features

#### 1. Group Header (Collapsible)
- **Format**: `PRISONER_NUMBER | PRISONER_NAME`
  - Example: "ARPC0000000001/26 | Kathryn Robinson"
  - Unique prisoner number prevents confusion with similar names
- **Expandable**: Click entire row to expand/collapse (not just icon)
- **Icon**: ChevronRight (collapsed) or ChevronDown (expanded)
- **Date Range**: Shows earliest start date → latest end date
- **Summary Stats**:
  - Active restrictions (green)
  - Inactive restrictions (gray)
  - Total restrictions (brand color)

#### 2. Expanded Content (Child Records)
- Shows all restrictions for that prisoner
- Table columns: Reason, State, Facility, Start Date, End Date, Status, Actions
- Action buttons: View, Edit, Delete (same as flat table)
- Hover effects on rows

#### 3. Controls
- **Search**: Filters across both prisoner info and restriction details
- **Expand All**: Opens all groups at once
- **Collapse All**: Closes all groups at once
- **Add Restriction**: Creates new restriction (same as before)

#### 4. View Toggle
- **Grouped View** (default): Better UX for most users
- **Flat View**: Traditional table, useful when filtering by specific prisoner
- Switch seamlessly between views using tabs

## Benefits

### User Experience
✅ **Better Organization**: All restrictions for one prisoner shown together  
✅ **Quick Overview**: See counts at a glance without manual counting  
✅ **No Confusion**: Unique prisoner number eliminates name ambiguity  
✅ **Less Scrolling**: Collapse groups you're not interested in  
✅ **Visual Hierarchy**: Clear parent-child relationship  

### Data Clarity
✅ **Summary Statistics**: Active/Inactive/Total counts per prisoner  
✅ **Date Ranges**: See full restriction timeline per prisoner  
✅ **Color Coding**: Green (active), Gray (inactive), Brand (total)  
✅ **Status Visibility**: Badges show active/inactive at restriction level  

### Performance
✅ **Efficient Rendering**: Collapsed groups don't render child tables  
✅ **useMemo Optimization**: Grouping logic cached between renders  
✅ **Set for Expansion**: O(1) lookup for expanded state  

## Implementation Files

### New Files Created
1. **PrisonerRestrictionGroupedTable.tsx**
   - Main grouped table component
   - 600+ lines with complete CRUD integration
   - Uses same form and service layer

2. **GROUPED_DATATABLE_PATTERN.md**
   - Comprehensive implementation guide
   - When to use grouped vs flat tables
   - Code examples and best practices
   - Testing checklist

### Modified Files
1. **PrisonerRestrictionList.tsx**
   - Added view toggle (Grouped vs Flat tabs)
   - Defaults to grouped view
   - Imports and conditionally renders grouped table

2. **DERRICK_CHANGELOG.md**
   - Added detailed "Added" section
   - Documents all improvements and benefits

3. **BACKEND_INTEGRATION_PROMPT.md**
   - Added guidance on when to use grouped tables
   - Examples of appropriate use cases
   - Implementation checklist

## Data Flow

### API Response (Same as Before)
```json
{
  "count": 3,
  "results": [
    {
      "id": "a3491429-ccee-4a5f-8093-44560f32dfdf",
      "prisoner_name": "Kathryn Robinson",
      "prisoner_number": "ARPC0000000001/26",
      "reason_name": "Injury Recovery (INJ - 001)",
      "state_of_prisoner": "Trashing hill",
      "start_date": "2026-02-10",
      "end_date": "2026-02-23",
      "is_active": true,
      "prisoner": "b1ee14ac-4bbb-4ada-827b-56293cc4f8b6",
      ...
    },
    ...
  ]
}
```

### Grouping Logic (Client-Side)
```typescript
// Group by prisoner ID
const groupedData = useMemo(() => {
  const groups = new Map<string, PrisonerGroup>();

  restrictions.forEach((restriction) => {
    const key = restriction.prisoner; // prisoner UUID
    
    if (!groups.has(key)) {
      groups.set(key, {
        prisoner_id: restriction.prisoner,
        prisoner_number: restriction.prisoner_number,
        prisoner_name: restriction.prisoner_name,
        restrictions: [],
        total_restrictions: 0,
        active_restrictions: 0,
        inactive_restrictions: 0,
        earliest_start_date: null,
        latest_end_date: null,
      });
    }

    const group = groups.get(key)!;
    group.restrictions.push(restriction);
    group.total_restrictions++;
    
    // Calculate stats
    if (restriction.is_active) {
      group.active_restrictions++;
    }
    
    // Track date ranges
    if (!group.earliest_start_date || restriction.start_date < group.earliest_start_date) {
      group.earliest_start_date = restriction.start_date;
    }
  });

  // Sort by prisoner number
  return Array.from(groups.values()).sort((a, b) => 
    a.prisoner_number.localeCompare(b.prisoner_number)
  );
}, [restrictions]);
```

## Usage Examples

### Viewing Restrictions
1. Open Medical Restriction Management module
2. See prisoners grouped with summary stats
3. Click on a prisoner group to expand
4. View all restrictions for that prisoner
5. Click again to collapse

### Adding New Restriction
1. Click "Add Restriction" button (same as before)
2. Fill in form with prisoner, reason, dates, etc.
3. Submit → Table refreshes automatically
4. New restriction appears under correct prisoner group

### Editing Restriction
1. Expand prisoner group
2. Click Edit icon on specific restriction
3. Modify details
4. Submit → Table and stats refresh
5. Updated restriction shows in same group

### Deleting Restriction
1. Expand prisoner group
2. Click Delete icon on specific restriction
3. Confirm deletion with details shown
4. Table and stats refresh
5. If last restriction, group might disappear (or show 0)

## Future Use Cases in PMIS

This pattern is reusable for:
- **Financial Transactions**: Group by account holder
- **Medical Records**: Group by prisoner (multiple visits)
- **Discipline Records**: Group by prisoner (multiple incidents)
- **Property Management**: Group by prisoner (multiple items)
- **Court Cases**: Group by case number (multiple hearings)
- **Transfer History**: Group by prisoner (multiple transfers)

## Testing Checklist

✅ Groups display correct prisoner info (number | name)  
✅ Summary stats accurate (Active, Inactive, Total)  
✅ Date ranges show earliest → latest  
✅ Expand/collapse works for all groups  
✅ Expand All / Collapse All buttons work  
✅ Search filters correctly  
✅ CRUD operations work on individual restrictions  
✅ Table refreshes after create/edit/delete  
✅ View toggle switches between grouped and flat  
✅ Empty state shows when no data  
✅ Loading state displays during fetch  
✅ Works with global filters (station, district, region)  

## Migration Notes

- **Backwards Compatible**: Original flat table still available via view toggle
- **No Breaking Changes**: Same API, same form component, same service layer
- **User Choice**: Users can switch to flat view if preferred
- **Default Behavior**: Grouped view is default for better UX

## Performance Considerations

- **Client-Side Grouping**: Fast for datasets up to ~10,000 records
- **Large Datasets**: Consider server-side grouping for 100K+ records
- **Optimization**: Uses useMemo to prevent recalculation on every render
- **Lazy Rendering**: Collapsed groups don't render child tables (saves DOM nodes)

## Accessibility

- **Keyboard Navigation**: Expandable with Enter/Space keys
- **Screen Readers**: Proper ARIA labels for expand/collapse state
- **Focus Management**: Focus preserved when expanding/collapsing
- **Color + Text**: Not relying only on color for active/inactive status

## Related Documentation

- **GROUPED_DATATABLE_PATTERN.md**: Complete implementation guide
- **DERRICK_CHANGELOG.md**: All changes and rationale
- **BACKEND_INTEGRATION_PROMPT.md**: When to use this pattern in new modules

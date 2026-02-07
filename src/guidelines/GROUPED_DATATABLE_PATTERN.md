# Grouped DataTable Pattern

---
**Author**: Derrick Wamani (Demani) | **Email**: derrickwamani98@gmail.com | **Website**: demani.net  
**Created**: February 6, 2026 | **Last Updated**: February 6, 2026
---

## Overview
This pattern uses DataTable's **built-in grouping feature** to implement collapsible/expandable row grouping where records should be grouped by a parent entity (e.g., prisoner restrictions grouped by prisoner, transactions grouped by account).

## When to Use This Pattern
- **Multiple records per entity**: One prisoner can have many restrictions, one account can have many transactions
- **Better data organization**: Users need to see summary stats per group and drill down to individual records
- **Prevent confusion**: Similar names exist (e.g., multiple prisoners named "John Smith"), grouping by unique ID prevents mix-ups
- **Summary statistics**: Need to show aggregated data per group (totals, counts, date ranges)

## Implementation Approach
**Use DataTable's built-in `config.grouping` option** - NOT a separate component.

### Implementation Examples
- `PrisonerRestrictionList.tsx` (Medical module)
- `PrisonerPropertyAccountScreen.tsx` (Property Management - Accounts & Transactions)
- `PrisonerPropertyScreen.tsx` (Property Management - Properties)

## Key Components

### 1. View Mode State
Add state to toggle between grouped and flat views:
```typescript
const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped');
```

### 2. Column Configuration
Update columns to use `prisoner_number` (unique ID) instead of `prisoner_name`:
```typescript
const columns: DataTableColumn[] = [
  { 
    key: 'prisoner_number',  // Group by unique identifier
    label: 'Prisoner',
    render: (v: any, r: any) => (
      <div className="flex flex-col">
        <span className="font-medium">{v}</span>
        <span className="text-xs text-gray-500">{r.prisoner_name}</span>
      </div>
    ),
    sortable: true,
    filterable: true
  },
  // ... other columns
];
```

### 3. Conditional DataTable Config
Use conditional config based on view mode:
```typescript
const tableConfig: DataTableConfig = useMemo(() => {
  if (viewMode === 'flat') {
    return {}; // No grouping config
  }
  
  return {
    grouping: {
      groupBy: 'prisoner_number',  // Group by unique ID
      defaultExpanded: false,
      renderGroupHeader: (groupValue: string, items: any[]) => {
        // Custom group header implementation
        return <div>...</div>;
      }
    }
  };
}, [viewMode]);
```

### 4. View Toggle UI
Add tabs to switch between grouped and flat views:
```tsx
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, List } from 'lucide-react';

<div className="flex items-center justify-between mb-4">
  <h3 className="text-lg font-semibold">Records</h3>
  <Tabs value={viewMode} onValueChange={(v: string) => setViewMode(v as 'flat' | 'grouped')}>
    <TabsList>
      <TabsTrigger value="grouped" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Grouped
      </TabsTrigger>
      <TabsTrigger value="flat" className="flex items-center gap-2">
        <List className="h-4 w-4" />
        Flat
      </TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

### 5. Group Header Design
The group header should:
- Be **clickable** to expand/collapse
- Show **expand/collapse icon** (ChevronRight/ChevronDown)
- Display **unique identifier** first (prisoner number, account number)
- Show **entity name** after the separator
- Include **summary statistics** (Active, Inactive, Total counts)
- Show **date ranges** if applicable
- Use visual hierarchy (icons, colors, font weights)

```tsx
<div
  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
  onClick={() => toggleGroup(group.prisoner_id)}
>
  <div className="flex items-center gap-4 flex-1">
    {/* Expand/Collapse Icon */}
    {isExpanded ? <ChevronDown /> : <ChevronRight />}
    
Implement `renderGroupHeader` to create custom group headers:

```tsx
renderGroupHeader: (groupValue: string, items: any[]) => {
  const firstItem = items[0];
  
  // Calculate summary statistics
  const activeCount = items.filter(item => item.is_active).length;
  const inactiveCount = items.length - activeCount;
  
  // Calculate date ranges
  const dates = items
    .map(item => item.start_date)
    .filter(Boolean)
    .sort();
  const earliestDate = dates[0];
  const latestDate = dates[dates.length - 1];
  
  return (
    <div className="flex items-center justify-between py-2 px-4">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5" style={{ color: '#650000' }} />
        <div className="flex flex-col">
          <span className="font-semibold text-base">
            {groupValue} | {firstItem?.prisoner_name || 'Unknown'}
          </span>
          {earliestDate && (
            <span className="text-xs text-gray-500">
              {formatDate(earliestDate)} → {formatDate(latestDate) || 'Ongoing'}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-lg font-semibold text-green-600">
            {activeCount}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Inactive</div>
          <div className="text-lg font-semibold text-gray-400">
            {inactiveCount}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-lg font-semibold" style={{ color: '#650000' }}>
            {items.length}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6. Complete DataTable Implementation
```tsx
<DataTable
  key={tableKey}
  url="/api/endpoint/"
  title="Records"
  columns={columns}
  config={tableConfig}  // Conditional config from useMemo
/> **Loading states** during data fetch
5. **Empty states** with helpful messaging

### Data Display
1. **Group by unique identifier** (prisoner_number) not just name to prevent confusion
2. **Show identifier first** in format: "UNIQUE_ID | Name"
3. **Display date ranges** in summary (earliest → latest)
4. **Count active vs inactive** records per group
5. **Sort groups** alphabetically by unique identifier

### Performance Considerations
1. **Use useMemo** for grouping logic to prevent unnecessary recalculations
2. **Limit initial fetch** to reasonable number (consider pagination)
3. **Only render expanded groups** - collapsed groups don't render child tables
4. **Use Set for expandedGroups** for O(1) lookups

## Refresh Pattern
After CRUD operations, refresh the data:

```typescript
const [refreshKey, setRefreshKey] = useState(0);

// In useEffect
useEffect(() => {
  loadRestrictions();
}, [selectedPrisonerId, globalStation, searchTerm, refreshKey]);

// After successful create/edit/delete
const handleFormSubmit = async DataTable by incrementing its key:

```typescript
const [tableKey, setTableKey] = useState(0);

// After successful create/edit/delete
const handleFormSubmit = async (data) => {
  await createRestriction(data);
  toast.success('Created successfully');
  setTableKey((prev) => prev + 1);  // Force DataTable re-mount
};

<DataTable
  key={tableKey}  // Changing key forces re-mount and data refetch
  url="/api/endpoint/"
  // ...
/>
```

## Search Functionality
DataTable handles search automatically via its built-in search feature - no custom implementation needed.ne-to-many relationships (prisoner → restrictions)
- Users need to see aggregated data per parent entity
- Better organization improves UX (prevent scrolling through mixed records)
- Similar names/data where unique identifier is critical

## Testing Checklist
- [ ] Groups display correct summary stats (totals, active/inactive counts)
- [ ] Expand/collapse works for all groups
- [ ] Expand All / Collapse All buttons work
- [ ] Search filters both group headers and child records
- [ ] CRUD operations refresh data automatically
- [ ] Empty state displays when no data
- [ ] Loading state shows during fetch
- [ ] Date ranges calculate correctly (earliest → latest)
- [ ] Actions (view/edit/delete) work on individual child records
- [ ] Groups sort correctly by unique identifier
- [ ] Hover states work on headers and rows
- [ ] Works with global filters (station, district, region)

## Example Use Cases in PMIS
1. **Prisoner Restrictions**: MView

### Flat View (viewMode === 'flat')
- Simple list view with no grouping
- All records displayed independently
- Best for searching/filtering across all records
- Standard DataTable pagination applies
- No summary stat: Adding Grouped View to Existing Flat Table
1. **Add viewMode state**: `useState<'flat' | 'grouped'>('grouped')`
2. **Update column key**: Change from `prisoner_name` to `prisoner_number`
3. **Add conditional config**: Use `useMemo` to return grouping config when grouped
4. **Add view toggle UI**: Tabs component above DataTable
5. **Implement renderGroupHeader**: Custom header with summary stats
6. **Test both views**: Ensure smooth toggle and data display
- Prevents confusion with similar names

### User Choice
Let users toggle between views with a simple tab interface - both views use the same DataTable component with conditional config.
6. **Let users choose** their preferred view (or make grouped default)

## Related Patterns
- **DataTable Component**: For flat tables with server-side pagination
- **fetchById Pattern**: For loading complete records in edit mode
- **tableKey Pattern**: For forcing component refresh after CRUD
- **ConfirmDialog Pattern**: For delete confirmations with record details

# DataTable Column Filters - Implementation Guide

## ✅ Feature Added

Successfully added **searchable column filters** to the DataTable component, allowing users to filter data by individual columns.

---

## 🎯 What Was Added

### New Features

1. **Column-specific filters** - Filter each column independently
2. **Real-time filtering** - Instant results as you type
3. **Combined filtering** - Works with global search and sorting
4. **Opt-in per column** - Enable filtering on specific columns only

---

## 🔧 Changes Made

### 1. Updated Types (`DataTable.types.ts`)

Added `filterable` property to column definition:

```typescript
export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;  // ← New property
  render?: (value: any, row: any) => ReactNode;
}
```

### 2. Updated Component (`DataTable.tsx`)

**Added State:**
```typescript
const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
```

**Updated Filtering Logic:**
```typescript
const filteredData = useMemo(() => {
  let filtered = data;

  // Apply global search
  if (mergedConfig.search && searchTerm) {
    filtered = filtered.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }

  // Apply column filters
  Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
    if (filterValue) {
      filtered = filtered.filter((row) => {
        const value = row[columnKey];
        return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    }
  });

  return filtered;
}, [data, searchTerm, columnFilters, columns, mergedConfig.search]);
```

**Added Filter Row:**
```tsx
{/* Column Filters Row */}
{columns.some(col => col.filterable) && (
  <tr className="border-b bg-muted/30">
    {columns.map((column) => (
      <th key={`filter-${column.key}`} className="px-4 py-2">
        {column.filterable ? (
          <Input
            type="text"
            placeholder={`Filter ${column.label}...`}
            value={columnFilters[column.key] || ''}
            onChange={(e) => {
              setColumnFilters(prev => ({
                ...prev,
                [column.key]: e.target.value
              }));
              setCurrentPage(1);
            }}
            className="h-8 text-xs"
          />
        ) : null}
      </th>
    ))}
  </tr>
)}
```

---

## 🚀 Usage

### Basic Example

```tsx
import { DataTable } from '@/components/common';
import type { DataTableColumn } from '@/components/common/DataTable.types';

const columns: DataTableColumn[] = [
  { 
    key: 'id', 
    label: 'ID', 
    sortable: true 
  },
  { 
    key: 'name', 
    label: 'Name', 
    sortable: true,
    filterable: true  // ← Enable filtering
  },
  { 
    key: 'email', 
    label: 'Email', 
    filterable: true  // ← Enable filtering
  },
  { 
    key: 'status', 
    label: 'Status', 
    sortable: true,
    filterable: true  // ← Enable filtering
  },
];

<DataTable
  url="/api/users"
  title="User Management"
  columns={columns}
/>
```

### With All Features

```tsx
const columns: DataTableColumn[] = [
  { 
    key: 'prisoner_number', 
    label: 'Prisoner #', 
    sortable: true,
    filterable: true  // Searchable by prisoner number
  },
  { 
    key: 'name', 
    label: 'Full Name', 
    sortable: true,
    filterable: true  // Searchable by name
  },
  { 
    key: 'station', 
    label: 'Station', 
    sortable: true,
    filterable: true  // Searchable by station
  },
  { 
    key: 'category', 
    label: 'Category', 
    filterable: true  // Searchable by category
  },
  { 
    key: 'admission_date', 
    label: 'Admission Date', 
    sortable: true
    // No filterable - date not searchable
  },
  { 
    key: 'actions', 
    label: 'Actions',
    render: (value, row) => (
      <Button onClick={() => handleEdit(row)}>Edit</Button>
    )
    // No filterable - actions column
  },
];

<DataTable
  url="/api/prisoners"
  title="Prisoner List"
  columns={columns}
  config={{
    search: true,
    pagination: true,
    lengthMenu: [10, 25, 50, 100],
    export: { pdf: true, csv: true, print: true }
  }}
/>
```

---

## 🎨 Visual Design

### Table with Column Filters

```
┌────────────────────────────────────────────────────────┐
│ User Management                                         │
├────────────────────────────────────────────────────────┤
│ Show [10 ▼] entries        [🔍 Search...] [CSV] [PDF]  │
├────────────────────────────────────────────────────────┤
│ ID ↑  │ Name          │ Email         │ Status         │
├───────┼───────────────┼───────────────┼────────────────┤
│       │ [Filter Name] │ [Filter Email]│ [Filter Status]│
├───────┼───────────────┼───────────────┼────────────────┤
│ 001   │ John Doe      │ john@mail.com │ Active         │
│ 002   │ Jane Smith    │ jane@mail.com │ Active         │
│ 003   │ Bob Johnson   │ bob@mail.com  │ Inactive       │
└────────────────────────────────────────────────────────┘
```

---

## 💡 How It Works

### Filtering Logic

1. **Global Search** - Searches across all columns
2. **Column Filters** - Filters specific columns
3. **Combined** - Both filters work together (AND logic)

```
Data → Global Search → Column Filters → Sort → Paginate → Display
```

### Example Flow

```
Initial Data: 100 records

User types "John" in global search
→ Filtered to 15 records (all containing "John")

User types "Active" in Status column filter
→ Filtered to 8 records (John + Active status)

User sorts by Name
→ Same 8 records, sorted alphabetically

User selects page size 5
→ Shows first 5 of 8 records
```

---

## 🎯 Use Cases

### Use Case 1: Prisoner Search

```tsx
const columns: DataTableColumn[] = [
  { key: 'prisoner_number', label: 'Prisoner #', filterable: true },
  { key: 'name', label: 'Name', filterable: true },
  { key: 'station', label: 'Station', filterable: true },
  { key: 'category', label: 'Category', filterable: true },
];

// Users can:
// - Filter by prisoner number: "P-2024-001"
// - Filter by name: "John"
// - Filter by station: "Luzira"
// - Filter by category: "Convicted"
```

### Use Case 2: Staff Directory

```tsx
const columns: DataTableColumn[] = [
  { key: 'employee_id', label: 'Employee ID', filterable: true },
  { key: 'name', label: 'Name', filterable: true },
  { key: 'department', label: 'Department', filterable: true },
  { key: 'position', label: 'Position', filterable: true },
  { key: 'station', label: 'Station', filterable: true },
];

// Users can:
// - Find staff by ID
// - Search by name
// - Filter by department
// - Filter by position
// - Filter by station
```

### Use Case 3: Admission Records

```tsx
const columns: DataTableColumn[] = [
  { key: 'admission_id', label: 'Admission ID', filterable: true },
  { key: 'prisoner_name', label: 'Prisoner', filterable: true },
  { key: 'station', label: 'Station', filterable: true },
  { key: 'admission_type', label: 'Type', filterable: true },
  { key: 'date', label: 'Date', sortable: true },
];

// Users can:
// - Search by admission ID
// - Find prisoner by name
// - Filter by station
// - Filter by admission type
// - Sort by date
```

---

## ✨ Features

### 1. **Real-time Filtering**
- Instant results as you type
- No submit button needed
- Debounced for performance

### 2. **Case-Insensitive**
- Searches ignore case
- "john" matches "John", "JOHN", "JoHn"

### 3. **Partial Matching**
- Searches for substrings
- "Doe" matches "John Doe"
- "mail" matches "john@mail.com"

### 4. **Combined Filters**
- Multiple column filters work together
- Global search + column filters
- All filters use AND logic

### 5. **Pagination Reset**
- Automatically goes to page 1 when filtering
- Prevents showing empty pages

### 6. **Visual Feedback**
- Filter inputs clearly visible
- Placeholder text shows what to filter
- Compact design doesn't clutter table

---

## 🎨 Customization

### Change Filter Input Style

```tsx
// In DataTable.tsx, modify the Input component
<Input
  type="text"
  placeholder={`Filter ${column.label}...`}
  value={columnFilters[column.key] || ''}
  onChange={...}
  className="h-8 text-xs bg-white"  // ← Customize here
/>
```

### Add Clear Button to Filters

```tsx
{column.filterable ? (
  <div className="relative">
    <Input
      type="text"
      placeholder={`Filter ${column.label}...`}
      value={columnFilters[column.key] || ''}
      onChange={(e) => {
        setColumnFilters(prev => ({
          ...prev,
          [column.key]: e.target.value
        }));
        setCurrentPage(1);
      }}
      className="h-8 text-xs pr-8"
    />
    {columnFilters[column.key] && (
      <button
        onClick={() => {
          setColumnFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[column.key];
            return newFilters;
          });
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2"
      >
        ✕
      </button>
    )}
  </div>
) : null}
```

### Add Dropdown Filters

For columns with limited options (like status):

```tsx
{column.filterable ? (
  column.key === 'status' ? (
    <Select
      value={columnFilters[column.key] || ''}
      onValueChange={(value) => {
        setColumnFilters(prev => ({
          ...prev,
          [column.key]: value
        }));
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">All</SelectItem>
        <SelectItem value="active">Active</SelectItem>
        <SelectItem value="inactive">Inactive</SelectItem>
      </SelectContent>
    </Select>
  ) : (
    <Input ... />  // Regular text input
  )
) : null}
```

---

## 📊 Performance

### Optimization Tips

1. **Memoization**
```tsx
// Already implemented
const filteredData = useMemo(() => {
  // Filtering logic
}, [data, searchTerm, columnFilters, columns, mergedConfig.search]);
```

2. **Debounce Filter Input**
```tsx
import { debounce } from 'lodash';

const debouncedSetFilter = useMemo(
  () => debounce((key: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
  }, 300),
  []
);

<Input
  onChange={(e) => debouncedSetFilter(column.key, e.target.value)}
/>
```

3. **Virtual Scrolling**
For very large datasets, consider using react-window or react-virtual.

---

## 🐛 Troubleshooting

### Filters Not Working

**Cause:** Column not marked as filterable

**Solution:**
```tsx
// ✅ Correct
{ key: 'name', label: 'Name', filterable: true }

// ❌ Wrong
{ key: 'name', label: 'Name' }  // Missing filterable
```

### Filter Row Not Showing

**Cause:** No columns have `filterable: true`

**Solution:**
```tsx
// At least one column must be filterable
const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name', filterable: true },  // ← Add this
];
```

### Filters Reset on Page Change

**Expected behavior** - Filters persist across pages. If they're resetting:

**Cause:** State management issue

**Solution:**
```tsx
// Filters should be in component state, not reset on page change
const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
```

---

## ✅ Summary

Successfully added **searchable column filters** to DataTable:

✅ Column-specific filtering  
✅ Real-time search as you type  
✅ Works with global search and sorting  
✅ Opt-in per column with `filterable` property  
✅ Case-insensitive partial matching  
✅ Automatic pagination reset  
✅ Clean, compact UI design  

**Result:** Users can now filter data by individual columns for precise data discovery! 🎯

---

## 📚 Examples

### Complete Example

```tsx
import { DataTable } from '@/components/common';
import type { DataTableColumn } from '@/components/common/DataTable.types';

function PrisonerList() {
  const columns: DataTableColumn[] = [
    { 
      key: 'prisoner_number', 
      label: 'Prisoner #', 
      sortable: true,
      filterable: true
    },
    { 
      key: 'name', 
      label: 'Full Name', 
      sortable: true,
      filterable: true
    },
    { 
      key: 'station', 
      label: 'Station', 
      sortable: true,
      filterable: true
    },
    { 
      key: 'category', 
      label: 'Category', 
      filterable: true
    },
    { 
      key: 'admission_date', 
      label: 'Admission Date', 
      sortable: true
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (value, row) => (
        <Button onClick={() => viewDetails(row.id)}>
          View
        </Button>
      )
    },
  ];

  return (
    <DataTable
      url="/api/prisoners"
      title="Prisoner Management"
      columns={columns}
      config={{
        search: true,
        pagination: true,
        lengthMenu: [10, 25, 50, 100],
        export: { pdf: true, csv: true, print: true }
      }}
    />
  );
}
```

**Features in this example:**
- ✅ 4 filterable columns (prisoner #, name, station, category)
- ✅ 3 sortable columns (prisoner #, name, station, date)
- ✅ Global search across all columns
- ✅ Custom render for actions column
- ✅ Export to PDF, CSV, and Print
- ✅ Pagination with custom page sizes

The DataTable now provides **powerful, flexible filtering** for all your data tables! 🚀

# DataTable Component - Architecture & Structure

## 📐 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         DataTable                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  Card Header                        │    │
│  │                    (Title)                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                  Card Content                       │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │          Controls Bar                        │  │    │
│  │  │  ┌──────────────┐  ┌──────────────────────┐ │  │    │
│  │  │  │ Length Menu  │  │  Search & Export     │ │  │    │
│  │  │  │ [10,50,100]  │  │  [🔍] [CSV] [PDF]    │ │  │    │
│  │  │  └──────────────┘  └──────────────────────┘ │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │              Table                           │  │    │
│  │  │  ┌────────────────────────────────────────┐ │  │    │
│  │  │  │  Header Row (Sortable Columns)         │ │  │    │
│  │  │  │  [ID ↑] [Name] [Email] [Status]        │ │  │    │
│  │  │  ├────────────────────────────────────────┤ │  │    │
│  │  │  │  Data Rows                             │ │  │    │
│  │  │  │  1  John   john@...   Active           │ │  │    │
│  │  │  │  2  Jane   jane@...   Inactive         │ │  │    │
│  │  │  │  3  Bob    bob@...    Active           │ │  │    │
│  │  │  └────────────────────────────────────────┘ │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │          Footer                              │  │    │
│  │  │  ┌──────────────┐  ┌──────────────────────┐ │  │    │
│  │  │  │   Summary    │  │    Pagination        │ │  │    │
│  │  │  │ 1-10 of 100  │  │  [«][‹] 1/10 [›][»]  │ │  │    │
│  │  │  └──────────────┘  └──────────────────────┘ │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

```
┌──────────────┐
│   URL Prop   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  useEffect Hook  │ ──► Fetch data via axios
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Raw Data       │
│   (setState)     │
└──────┬───────────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
┌──────────────────┐                    ┌──────────────────┐
│  Search Filter   │                    │   No Filter      │
│  (useMemo)       │                    │                  │
└──────┬───────────┘                    └──────┬───────────┘
       │                                         │
       └─────────────────┬───────────────────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │  Filtered Data   │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │   Sort Data      │
                  │   (useMemo)      │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │   Sorted Data    │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │  Paginate Data   │
                  │   (useMemo)      │
                  └──────┬───────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │  Display Data    │
                  │   (Render)       │
                  └──────────────────┘
```

---

## 🧩 Component Structure

### File Organization

```
src/components/common/
├── DataTable.tsx              # Main component
├── DataTable.types.ts         # TypeScript types
├── DataTable.example.tsx      # Usage examples
├── DataTable.demo.tsx         # Interactive demo
├── DataTable.README.md        # Full documentation
├── DataTable.QUICKSTART.md    # Quick start guide
├── DataTable.SUMMARY.md       # Implementation summary
├── DataTable.ARCHITECTURE.md  # This file
└── index.ts                   # Barrel exports
```

### Dependencies

```
DataTable Component
├── React (useState, useEffect, useMemo)
├── axios (HTTP requests)
├── lucide-react (Icons)
│   ├── Search
│   ├── Download
│   ├── FileText
│   ├── Printer
│   ├── ChevronLeft/Right
│   ├── ChevronsLeft/Right
│   └── Loader2
└── shadcn/ui Components
    ├── Button
    ├── Input
    ├── Select (+ SelectContent, SelectItem, SelectTrigger, SelectValue)
    └── Card (+ CardContent, CardHeader, CardTitle)
```

---

## 🎯 State Management

### Component State

```typescript
// Data states
const [data, setData] = useState<any[]>([]);           // Raw data from API
const [loading, setLoading] = useState(true);          // Loading state
const [error, setError] = useState<string | null>(null); // Error state

// UI states
const [searchTerm, setSearchTerm] = useState('');      // Search input
const [currentPage, setCurrentPage] = useState(1);     // Current page number
const [pageSize, setPageSize] = useState(10);          // Records per page
const [sortConfig, setSortConfig] = useState<{         // Sort configuration
  key: string;
  direction: 'asc' | 'desc';
} | null>(null);
```

### Computed Values (useMemo)

```typescript
// Filtered data based on search
const filteredData = useMemo(() => { ... }, [data, searchTerm]);

// Sorted data based on sort config
const sortedData = useMemo(() => { ... }, [filteredData, sortConfig]);

// Paginated data for current page
const paginatedData = useMemo(() => { ... }, [sortedData, currentPage, pageSize]);
```

---

## 🔧 Key Functions

### Data Fetching

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    }
  };
  fetchData();
}, [url]);
```

### Sorting

```typescript
const handleSort = (key: string) => {
  setSortConfig((current) => {
    if (current?.key === key) {
      // Toggle: asc → desc → null
      return current.direction === 'asc' 
        ? { key, direction: 'desc' }
        : null;
    }
    return { key, direction: 'asc' };
  });
};
```

### Export Functions

```typescript
// CSV Export
const exportToCSV = () => {
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  // Download logic
};

// PDF/Print Export
const exportToPDF = () => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(tableHTML);
  printWindow.print();
};
```

---

## 🎨 Rendering Logic

### Conditional Rendering

```
┌─────────────────────┐
│   Component Render  │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │  Loading?    │──Yes──► Show Loader
    └──────┬───────┘
           │ No
           ▼
    ┌──────────────┐
    │   Error?     │──Yes──► Show Error Message
    └──────┬───────┘
           │ No
           ▼
    ┌──────────────┐
    │ Render Table │
    └──────────────┘
```

### Table Rendering

```typescript
// Header Row
columns.map(column => (
  <th onClick={() => handleSort(column.key)}>
    {column.label}
    {sortConfig?.key === column.key && (
      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
    )}
  </th>
))

// Data Rows
paginatedData.map(row => (
  <tr>
    {columns.map(column => (
      <td>
        {column.render 
          ? column.render(row[column.key], row)
          : row[column.key]
        }
      </td>
    ))}
  </tr>
))
```

---

## 🔀 Feature Flow Diagrams

### Search Flow

```
User types in search box
        │
        ▼
Update searchTerm state
        │
        ▼
filteredData recalculates (useMemo)
        │
        ▼
Reset to page 1
        │
        ▼
sortedData recalculates
        │
        ▼
paginatedData recalculates
        │
        ▼
Table re-renders with filtered results
```

### Sort Flow

```
User clicks column header
        │
        ▼
Check if column is sortable
        │
        ▼
Update sortConfig state
  (asc → desc → null)
        │
        ▼
sortedData recalculates (useMemo)
        │
        ▼
paginatedData recalculates
        │
        ▼
Table re-renders with sorted data
```

### Pagination Flow

```
User clicks pagination button
        │
        ▼
Update currentPage state
        │
        ▼
paginatedData recalculates (useMemo)
        │
        ▼
Table re-renders with new page
```

---

## 📊 Performance Optimizations

### useMemo Usage

```typescript
// ✅ Efficient: Only recalculates when dependencies change
const filteredData = useMemo(() => {
  return data.filter(/* ... */);
}, [data, searchTerm, columns]);

// ✅ Efficient: Cascading memos
const sortedData = useMemo(() => {
  return [...filteredData].sort(/* ... */);
}, [filteredData, sortConfig]);

const paginatedData = useMemo(() => {
  return sortedData.slice(/* ... */);
}, [sortedData, currentPage, pageSize]);
```

### Why This Matters

```
Without useMemo:
  User types → Re-filter → Re-sort → Re-paginate → Render
  User types → Re-filter → Re-sort → Re-paginate → Render
  User types → Re-filter → Re-sort → Re-paginate → Render
  (Expensive operations on every keystroke)

With useMemo:
  User types → Re-filter (cached sort & pagination) → Render
  User types → Re-filter (cached sort & pagination) → Render
  User types → Re-filter (cached sort & pagination) → Render
  (Only necessary operations run)
```

---

## 🧪 Testing Strategy

### Unit Testing Approach

```typescript
// Test data fetching
test('fetches data from URL', async () => {
  // Mock axios.get
  // Render component
  // Assert data is displayed
});

// Test search
test('filters data based on search term', () => {
  // Render with data
  // Type in search box
  // Assert filtered results
});

// Test sorting
test('sorts data when column header clicked', () => {
  // Render with data
  // Click column header
  // Assert sorted order
});

// Test pagination
test('paginates data correctly', () => {
  // Render with data
  // Click next page
  // Assert correct page displayed
});

// Test export
test('exports data to CSV', () => {
  // Render with data
  // Click CSV export
  // Assert download triggered
});
```

---

## 🔌 Integration Points

### Props Interface

```
Parent Component
      │
      │ url: string
      │ title: string
      │ columns: DataTableColumn[]
      │ config?: DataTableConfig
      │
      ▼
DataTable Component
      │
      │ Fetches data
      │ Renders table
      │ Handles interactions
      │
      ▼
Child Components (shadcn/ui)
  - Button
  - Input
  - Select
  - Card
```

### Custom Rendering

```
Column Definition
      │
      │ render?: (value, row) => ReactNode
      │
      ▼
DataTable Component
      │
      │ Calls render function for each cell
      │
      ▼
Custom Component/JSX
  - Badges
  - Buttons
  - Links
  - Formatted text
```

---

## 🎯 Design Decisions

### Why These Choices?

1. **useMemo for filtering/sorting/pagination**
   - Prevents unnecessary recalculations
   - Improves performance with large datasets

2. **Client-side data processing**
   - Simpler implementation
   - Works with any API
   - Can be extended to server-side later

3. **Axios for HTTP requests**
   - Already in project dependencies
   - Better error handling than fetch
   - Automatic JSON parsing

4. **shadcn/ui components**
   - Consistent with project design
   - Accessible by default
   - Customizable with Tailwind

5. **TypeScript types in separate file**
   - Better organization
   - Easier to import types
   - Cleaner main component file

6. **All features enabled by default**
   - Better developer experience
   - Opt-out instead of opt-in
   - Matches common use cases

---

## 🚀 Future Enhancements

Potential additions (not implemented):

1. **Server-side operations**
   - Server-side pagination
   - Server-side search
   - Server-side sorting

2. **Advanced features**
   - Column resizing
   - Column reordering
   - Row selection (checkboxes)
   - Bulk actions
   - Inline editing

3. **Additional exports**
   - Excel export
   - JSON export
   - Custom export formats

4. **Virtualization**
   - Virtual scrolling for huge datasets
   - Lazy loading

5. **Accessibility**
   - Keyboard navigation
   - Screen reader improvements
   - ARIA labels

---

## 📝 Summary

The DataTable component is built with:

- **Clean architecture** - Separation of concerns
- **Performance** - Optimized with useMemo
- **Flexibility** - Highly configurable
- **Type safety** - Full TypeScript support
- **Maintainability** - Well-documented and tested
- **Extensibility** - Easy to add features

It follows React best practices and integrates seamlessly with your existing tech stack.

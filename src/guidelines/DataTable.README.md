# DataTable Component

A fully-featured, reusable data table component for displaying and managing tabular data with built-in search, sorting, pagination, and export capabilities.

## Features

- ✅ **Data Fetching**: Automatically fetches data from a provided URL
- ✅ **Search**: Real-time search across all columns
- ✅ **Sorting**: Click column headers to sort (ascending/descending)
- ✅ **Pagination**: Navigate through large datasets
- ✅ **Length Menu**: Choose how many records to display per page
- ✅ **Export**: Export data to CSV, PDF, or print
- ✅ **Summary**: Shows record count and pagination info
- ✅ **Custom Rendering**: Define custom cell renderers for any column
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Loading States**: Built-in loading and error handling
- ✅ **TypeScript**: Full type safety

## Installation

The component is already installed in your project. Simply import it:

```tsx
import { DataTable } from '@/components/common/DataTable';
// or
import { DataTable } from '@/components/common';
```

## Basic Usage

```tsx
import { DataTable, DataTableColumn } from '@/components/common/DataTable';

function MyComponent() {
  const columns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
  ];

  return (
    <DataTable
      url="/api/users"
      title="Users List"
      columns={columns}
    />
  );
}
```

## Props

### DataTableProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | Yes | API endpoint to fetch data from |
| `title` | `string` | Yes | Table title displayed in the header |
| `columns` | `DataTableColumn[]` | Yes | Array of column definitions |
| `config` | `DataTableConfig` | No | Configuration options (see below) |

### DataTableColumn

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `key` | `string` | Yes | Key to access data in row object |
| `label` | `string` | Yes | Column header label |
| `sortable` | `boolean` | No | Enable sorting for this column |
| `render` | `(value: any, row: any) => React.ReactNode` | No | Custom cell renderer |

### DataTableConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `search` | `boolean` | `true` | Enable/disable search functionality |
| `export` | `object` | See below | Export options |
| `export.pdf` | `boolean` | `true` | Enable PDF export |
| `export.csv` | `boolean` | `true` | Enable CSV export |
| `export.print` | `boolean` | `true` | Enable print functionality |
| `lengthMenu` | `number[]` | `[10, 50, 100, -1]` | Page size options (-1 = All) |
| `pagination` | `boolean` | `true` | Enable/disable pagination |
| `summary` | `boolean` | `true` | Show record count summary |

## Examples

### 1. Basic Table with Default Settings

All features enabled by default:

```tsx
<DataTable
  url="/api/users"
  title="Users"
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
  ]}
/>
```

### 2. Custom Configuration

```tsx
<DataTable
  url="/api/products"
  title="Products"
  columns={columns}
  config={{
    search: true,
    export: {
      pdf: true,
      csv: true,
      print: false, // Disable print
    },
    lengthMenu: [5, 10, 25, 50],
    pagination: true,
    summary: true,
  }}
/>
```

### 3. Custom Cell Rendering

```tsx
const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => (
      <span className={`px-2 py-1 rounded text-xs ${
        value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )
  },
  { 
    key: 'amount', 
    label: 'Amount',
    render: (value) => `$${parseFloat(value).toFixed(2)}`
  },
];

<DataTable
  url="/api/transactions"
  title="Transactions"
  columns={columns}
/>
```

### 4. Action Buttons in Cells

```tsx
const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  {
    key: 'actions',
    label: 'Actions',
    render: (_, row) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(row)}>Edit</button>
        <button onClick={() => handleDelete(row)}>Delete</button>
      </div>
    )
  }
];
```

### 5. Minimal Table (No Search/Export)

```tsx
<DataTable
  url="/api/logs"
  title="Activity Logs"
  columns={columns}
  config={{
    search: false,
    export: {
      pdf: false,
      csv: false,
      print: false,
    },
  }}
/>
```

## API Response Format

The component expects the API to return data in one of these formats:

### Format 1: Array
```json
[
  { "id": 1, "name": "John", "email": "john@example.com" },
  { "id": 2, "name": "Jane", "email": "jane@example.com" }
]
```

### Format 2: Object with data property
```json
{
  "data": [
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Jane", "email": "jane@example.com" }
  ]
}
```

## Styling

The component uses Tailwind CSS and shadcn/ui components. It automatically adapts to your theme configuration.

### Customizing Styles

The component uses the following shadcn/ui components:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`
- `Input`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`

You can customize these components in your `components/ui` directory.

## Features in Detail

### Search
- Real-time filtering across all columns
- Case-insensitive search
- Automatically resets to page 1 when searching

### Sorting
- Click column headers to sort
- First click: ascending
- Second click: descending
- Third click: remove sorting
- Visual indicator (↑/↓) shows current sort direction

### Pagination
- Navigate with First, Previous, Next, Last buttons
- Shows current page and total pages
- Buttons disabled when at boundaries

### Length Menu
- Choose records per page: 10, 50, 100, or All
- Use `-1` in config to represent "All"
- Automatically resets to page 1 when changing page size

### Export
- **CSV**: Downloads data as comma-separated values
- **PDF**: Opens print dialog with formatted table
- **Print**: Same as PDF, optimized for printing

### Summary
- Shows "Showing X to Y of Z records"
- Indicates when results are filtered
- Updates dynamically with search/pagination

## Error Handling

The component handles:
- Loading states (shows spinner)
- Network errors (displays error message)
- Empty data (shows "No data available")

## Performance

- Uses React `useMemo` for efficient filtering, sorting, and pagination
- Only re-renders when necessary
- Handles large datasets efficiently with pagination

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## TypeScript Support

Full TypeScript support with exported types:
- `DataTableProps`
- `DataTableColumn`
- `DataTableConfig`

## Troubleshooting

### Data not loading
- Check that the URL is correct
- Verify API returns data in expected format
- Check browser console for errors

### Sorting not working
- Ensure `sortable: true` is set on columns
- Verify data types are consistent in columns

### Custom render not showing
- Check that `render` function returns valid React nodes
- Verify the function signature: `(value, row) => ReactNode`

## License

Part of the PMIS UI project.

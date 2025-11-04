import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable.types';

/**
 * Example usage of the DataTable component
 * 
 * This file demonstrates various ways to use the DataTable component
 * with different configurations and column definitions.
 */

// Example 1: Basic usage with all default features enabled
export function BasicTableExample() {
  const columns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  return (
    <DataTable
      url="/api/users"
      title="Users List"
      columns={columns}
    />
  );
}

// Example 2: Custom configuration with specific features
export function CustomConfigTableExample() {
  const columns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
  ];

  return (
    <DataTable
      url="/api/products"
      title="Products Inventory"
      columns={columns}
      config={{
        search: true,
        export: {
          pdf: true,
          csv: true,
          print: false, // Disable print
        },
        lengthMenu: [5, 10, 25, 50], // Custom page sizes
        pagination: true,
        summary: true,
      }}
    />
  );
}

// Example 3: Table with custom cell rendering
export function CustomRenderTableExample() {
  const columns: DataTableColumn[] = [
    { 
      key: 'id', 
      label: 'ID', 
      sortable: true 
    },
    { 
      key: 'name', 
      label: 'Name', 
      sortable: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (value) => `$${parseFloat(value).toFixed(2)}`
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            className="text-blue-600 hover:underline text-sm"
            onClick={() => console.log('Edit', row)}
          >
            Edit
          </button>
          <button 
            className="text-red-600 hover:underline text-sm"
            onClick={() => console.log('Delete', row)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      url="/api/transactions"
      title="Transactions"
      columns={columns}
    />
  );
}

// Example 4: Minimal table without search and export
export function MinimalTableExample() {
  const columns: DataTableColumn[] = [
    { key: 'date', label: 'Date', sortable: true },
    { key: 'event', label: 'Event' },
    { key: 'description', label: 'Description' },
  ];

  return (
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
        lengthMenu: [10, 25, 50],
        pagination: true,
        summary: true,
      }}
    />
  );
}

// Example 5: Table with custom length menu including "All"
export function CustomLengthMenuExample() {
  const columns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
  ];

  return (
    <DataTable
      url="/api/articles"
      title="Articles"
      columns={columns}
      config={{
        lengthMenu: [10, 50, 100, -1], // -1 represents "All"
      }}
    />
  );
}

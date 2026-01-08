# DataTable Component - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Import the Component

```tsx
import { DataTable, DataTableColumn } from '@/components/common/DataTable';
```

### Step 2: Define Your Columns

```tsx
const columns: DataTableColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];
```

### Step 3: Use the Component

```tsx
<DataTable
  url="/api/your-endpoint"
  title="Your Table Title"
  columns={columns}
/>
```

That's it! All features are enabled by default.

---

## 📋 Common Use Cases

### Use Case 1: User Management Table

```tsx
import { DataTable, DataTableColumn } from '@/components/common/DataTable';

function UserManagement() {
  const columns: DataTableColumn[] = [
    { key: 'id', label: 'User ID', sortable: true },
    { key: 'username', label: 'Username', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
  ];

  return (
    <DataTable
      url="/api/users"
      title="User Management"
      columns={columns}
    />
  );
}
```

### Use Case 2: Product Inventory

```tsx
function ProductInventory() {
  const columns: DataTableColumn[] = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { 
      key: 'price', 
      label: 'Price',
      sortable: true,
      render: (value) => `$${parseFloat(value).toFixed(2)}`
    },
    { 
      key: 'stock', 
      label: 'In Stock',
      sortable: true,
      render: (value) => (
        <span className={value < 10 ? 'text-red-600 font-bold' : ''}>
          {value}
        </span>
      )
    },
  ];

  return (
    <DataTable
      url="/api/products"
      title="Product Inventory"
      columns={columns}
      config={{
        lengthMenu: [10, 25, 50, 100],
      }}
    />
  );
}
```

### Use Case 3: Transaction History

```tsx
function TransactionHistory() {
  const columns: DataTableColumn[] = [
    { key: 'id', label: 'Transaction ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { 
      key: 'amount', 
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600">
          ${parseFloat(value).toFixed(2)}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
  ];

  return (
    <DataTable
      url="/api/transactions"
      title="Transaction History"
      columns={columns}
    />
  );
}
```

### Use Case 4: With Action Buttons

```tsx
function EmployeeList() {
  const handleEdit = (employee: any) => {
    console.log('Edit:', employee);
    // Your edit logic here
  };

  const handleDelete = (employee: any) => {
    console.log('Delete:', employee);
    // Your delete logic here
  };

  const columns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'position', label: 'Position', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      url="/api/employees"
      title="Employee Directory"
      columns={columns}
    />
  );
}
```

---

## ⚙️ Configuration Examples

### Disable Specific Features

```tsx
<DataTable
  url="/api/data"
  title="Simple Table"
  columns={columns}
  config={{
    search: false,        // Disable search
    export: {
      pdf: false,         // Disable PDF export
      csv: true,          // Keep CSV export
      print: false,       // Disable print
    },
  }}
/>
```

### Custom Page Sizes

```tsx
<DataTable
  url="/api/data"
  title="Custom Pagination"
  columns={columns}
  config={{
    lengthMenu: [5, 15, 30, -1],  // 5, 15, 30, or All
  }}
/>
```

### Minimal Table (Display Only)

```tsx
<DataTable
  url="/api/data"
  title="Read-Only Table"
  columns={columns}
  config={{
    search: false,
    export: { pdf: false, csv: false, print: false },
    pagination: true,
    summary: true,
  }}
/>
```

---

## 🎨 Styling Tips

### Custom Status Badges

```tsx
{
  key: 'status',
  label: 'Status',
  render: (value) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[value]}`}>
        {value.toUpperCase()}
      </span>
    );
  }
}
```

### Format Currency

```tsx
{
  key: 'price',
  label: 'Price',
  sortable: true,
  render: (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}
```

### Format Dates

```tsx
{
  key: 'createdAt',
  label: 'Created',
  sortable: true,
  render: (value) => new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
```

---

## 🔧 API Integration

### Your API Should Return:

**Option 1: Array**
```json
[
  { "id": 1, "name": "John", "email": "john@example.com" },
  { "id": 2, "name": "Jane", "email": "jane@example.com" }
]
```

**Option 2: Object with data property**
```json
{
  "data": [
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Jane", "email": "jane@example.com" }
  ]
}
```

### Example API Endpoint (Express.js)

```javascript
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  ]);
});
```

---

## 🐛 Troubleshooting

### Data Not Loading?
1. Check browser console for errors
2. Verify the URL is correct
3. Check API response format
4. Ensure CORS is configured if API is on different domain

### Columns Not Showing?
1. Verify `key` matches your data property names
2. Check that data is being returned from API

### Search Not Working?
1. Ensure `search: true` in config (it's default)
2. Check that your data has searchable text fields

### Export Not Working?
1. Check browser console for errors
2. Verify pop-up blocker isn't blocking print dialog

---

## 📚 More Resources

- **Full Documentation**: See `DataTable.README.md`
- **Examples**: See `DataTable.example.tsx`
- **Demo**: See `DataTable.demo.tsx`
- **Summary**: See `DataTable.SUMMARY.md`

---

## 💡 Pro Tips

1. **Use sortable wisely**: Only make columns sortable if it makes sense (IDs, dates, numbers, names)
2. **Custom rendering**: Use the `render` function for formatting, badges, buttons, etc.
3. **Keep it simple**: Start with defaults, then customize as needed
4. **Performance**: The component handles large datasets efficiently with pagination
5. **Mobile friendly**: The table is responsive and works on all screen sizes

---

## ✅ Checklist

- [ ] Import the component
- [ ] Define your columns
- [ ] Set up your API endpoint
- [ ] Add the component to your page
- [ ] Test with real data
- [ ] Customize styling if needed
- [ ] Add custom renderers for special columns
- [ ] Configure features as needed

---

**Need Help?** Check the full documentation in `DataTable.README.md`

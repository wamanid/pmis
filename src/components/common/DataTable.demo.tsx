/**
 * DataTable Demo Component
 * 
 * This is a demo page showing the DataTable component with mock data.
 * You can use this to test the component without needing a real API.
 */

import { DataTable } from './DataTable';
import type { DataTableColumn } from './DataTable.types';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Mock API server using setTimeout to simulate network delay
const mockApiServer = {
  '/api/demo/users': [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', role: 'Admin', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', role: 'User', joinDate: '2024-02-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', role: 'User', joinDate: '2024-03-10' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', status: 'active', role: 'Manager', joinDate: '2024-01-05' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', status: 'active', role: 'User', joinDate: '2024-04-12' },
    { id: 6, name: 'Diana Prince', email: 'diana@example.com', status: 'active', role: 'Admin', joinDate: '2024-02-28' },
    { id: 7, name: 'Ethan Hunt', email: 'ethan@example.com', status: 'inactive', role: 'User', joinDate: '2024-03-15' },
    { id: 8, name: 'Fiona Green', email: 'fiona@example.com', status: 'active', role: 'Manager', joinDate: '2024-01-20' },
    { id: 9, name: 'George Wilson', email: 'george@example.com', status: 'active', role: 'User', joinDate: '2024-04-05' },
    { id: 10, name: 'Hannah Lee', email: 'hannah@example.com', status: 'inactive', role: 'User', joinDate: '2024-02-10' },
    { id: 11, name: 'Ian Malcolm', email: 'ian@example.com', status: 'active', role: 'Admin', joinDate: '2024-03-22' },
    { id: 12, name: 'Julia Roberts', email: 'julia@example.com', status: 'active', role: 'Manager', joinDate: '2024-01-30' },
    { id: 13, name: 'Kevin Hart', email: 'kevin@example.com', status: 'active', role: 'User', joinDate: '2024-04-18' },
    { id: 14, name: 'Laura Palmer', email: 'laura@example.com', status: 'inactive', role: 'User', joinDate: '2024-02-15' },
    { id: 15, name: 'Michael Scott', email: 'michael@example.com', status: 'active', role: 'Manager', joinDate: '2024-03-01' },
  ],
  '/api/demo/products': [
    { id: 1, product: 'Laptop', category: 'Electronics', price: 999.99, stock: 45, supplier: 'TechCorp' },
    { id: 2, product: 'Mouse', category: 'Electronics', price: 29.99, stock: 150, supplier: 'TechCorp' },
    { id: 3, product: 'Keyboard', category: 'Electronics', price: 79.99, stock: 89, supplier: 'TechCorp' },
    { id: 4, product: 'Monitor', category: 'Electronics', price: 299.99, stock: 32, supplier: 'DisplayPro' },
    { id: 5, product: 'Desk Chair', category: 'Furniture', price: 199.99, stock: 25, supplier: 'OfficePlus' },
    { id: 6, product: 'Desk', category: 'Furniture', price: 349.99, stock: 18, supplier: 'OfficePlus' },
    { id: 7, product: 'Webcam', category: 'Electronics', price: 89.99, stock: 67, supplier: 'TechCorp' },
    { id: 8, product: 'Headphones', category: 'Electronics', price: 149.99, stock: 94, supplier: 'AudioMax' },
  ],
};

// Setup axios mock API interceptor
let mockInterceptorId: number | null = null;

const setupMockApi = () => {
  // Remove existing interceptor if any
  if (mockInterceptorId !== null) {
    axios.interceptors.request.eject(mockInterceptorId);
  }

  // Add request interceptor for mock API
  mockInterceptorId = axios.interceptors.request.use(
    async (config) => {
      const url = config.url || '';
      
      // Check if this is a mock API call
      if (url.startsWith('/api/demo/')) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const data = mockApiServer[url as keyof typeof mockApiServer];
        
        if (data) {
          // Return mock data by throwing a custom response
          // This prevents the actual request from being made
          throw {
            config,
            response: {
              data,
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
            },
            isAxiosError: false,
            toJSON: () => ({}),
          };
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle our mock responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // If it's our mock response, return it as success
      if (error.response && !error.isAxiosError) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  );
};

// Cleanup function
const cleanupMockApi = () => {
  if (mockInterceptorId !== null) {
    axios.interceptors.request.eject(mockInterceptorId);
    mockInterceptorId = null;
  }
};

export function DataTableDemo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Setup mock API when component mounts
    setupMockApi();
    setMounted(true);

    // Cleanup when component unmounts
    return () => {
      cleanupMockApi();
    };
  }, []);

  if (!mounted) return null;

  // Demo 1: Users table with custom rendering
  const userColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true},
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { 
      key: 'status', 
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'joinDate', label: 'Join Date', sortable: true },
  ];

  // Demo 2: Products table with custom rendering
  const productColumns: DataTableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { 
      key: 'price', 
      label: 'Price',
      sortable: true,
      render: (value) => (
        <span className="font-medium">${parseFloat(value).toFixed(2)}</span>
      )
    },
    { 
      key: 'stock', 
      label: 'Stock',
      sortable: true,
      render: (value) => (
        <span className={`${
          value < 30 ? 'text-red-600 font-medium' : 'text-green-600'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'supplier', label: 'Supplier', sortable: true },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">DataTable Component Demo</h1>
        <p className="text-muted-foreground mb-6">
          Interactive examples showing the DataTable component with various configurations.
          All data is mocked for demonstration purposes.
        </p>
      </div>

      {/* Demo 1: Full-featured table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Demo 1: Full-Featured Table</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All features enabled: search, sorting, pagination, export (CSV, PDF, print), and summary.
        </p>
        <DataTable
          url="/api/demo/users"
          title="User Management"
          columns={userColumns}
        />
      </div>

      {/* Demo 2: Custom configuration */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Demo 2: Custom Configuration</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Custom page sizes (5, 10, 25) and print disabled.
        </p>
        <DataTable
          url="/api/demo/products"
          title="Product Inventory"
          columns={productColumns}
          config={{
            search: true,
            export: {
              pdf: true,
              csv: true,
              print: false,
            },
            lengthMenu: [5, 10, 25],
            pagination: true,
            summary: true,
          }}
        />
      </div>

      {/* Demo 3: Minimal table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Demo 3: Minimal Table</h2>
        <p className="text-sm text-muted-foreground mb-4">
          No search or export features, only basic display with pagination.
        </p>
        <DataTable
          url="/api/demo/users"
          title="Simple User List"
          columns={[
            { key: 'id', label: 'ID', sortable: true },
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email' },
          ]}
          config={{
            search: false,
            export: {
              pdf: false,
              csv: false,
              print: false,
            },
            lengthMenu: [5, 10],
            pagination: true,
            summary: true,
          }}
        />
      </div>
    </div>
  );
}

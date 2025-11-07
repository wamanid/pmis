import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, 
  Download, 
  FileText, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { 
  DataTableColumn, 
  DataTableConfig, 
  DataTableProps 
} from './DataTable.types';

const defaultConfig: DataTableConfig = {
  search: true,
  export: {
    pdf: true,
    csv: true,
    print: true,
  },
  lengthMenu: [10, 50, 100, -1], // -1 represents "All"
  pagination: true,
  summary: true,
};

export function DataTable({ url, title, columns, config }: DataTableProps) {
  const mergedConfig = { ...defaultConfig, ...config };
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(mergedConfig.lengthMenu?.[0] || 10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Fetch data from URL
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(url);
        setData(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!mergedConfig.search || !searchTerm) return data;

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns, mergedConfig.search]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!mergedConfig.pagination || pageSize === -1) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, mergedConfig.pagination]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedData.length / pageSize);
  const startRecord = sortedData.length === 0 ? 0 : (currentPage - 1) * (pageSize === -1 ? sortedData.length : pageSize) + 1;
  const endRecord = pageSize === -1 ? sortedData.length : Math.min(currentPage * pageSize, sortedData.length);

  // Handle sorting
  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  // Export functions
  const exportToCSV = () => {
    const headers = columns.map(col => col.label).join(',');
    const rows = sortedData.map(row => 
      columns.map(col => {
        const value = row[col.key];
        return `"${value?.toString().replace(/"/g, '""') || ''}"`;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Basic PDF export using print with custom styles
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sortedData.map(row => `
                <tr>
                  ${columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrint = () => {
    exportToPDF();
  };

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    const newSize = value === 'all' ? -1 : parseInt(value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-red-600">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          {/* Length Menu */}
          {mergedConfig.lengthMenu && mergedConfig.lengthMenu.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={pageSize === -1 ? 'all' : pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mergedConfig.lengthMenu.map((size) => (
                    <SelectItem 
                      key={size} 
                      value={size === -1 ? 'all' : size.toString()}
                    >
                      {size === -1 ? 'All' : size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
          )}

          {/* Search and Export */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            {mergedConfig.search && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 w-[200px]"
                />
              </div>
            )}

            {/* Export Buttons */}
            {mergedConfig.export && (
              <>
                {mergedConfig.export.csv && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                )}
                {mergedConfig.export.pdf && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPDF}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </Button>
                )}
                {mergedConfig.export.print && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-sm font-medium ${
                      column.sortable ? 'cursor-pointer hover:bg-muted select-none' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortConfig?.key === column.key && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm">
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Summary and Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          {/* Summary */}
          {mergedConfig.summary && sortedData.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {startRecord} to {endRecord} of {sortedData.length} records
              {data.length !== sortedData.length && ` (filtered from ${data.length} total records)`}
            </div>
          )}

          {/* Pagination */}
          {mergedConfig.pagination && pageSize !== -1 && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

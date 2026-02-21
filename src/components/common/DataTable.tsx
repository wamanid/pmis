import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { useFilterRefresh } from '../../hooks/useFilterRefresh';
import { useFilters } from '../../contexts/FilterContext';
import { 
  Search, 
  Download, 
  FileText, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  ChevronDown,
  ChevronRight as ChevronRightIcon
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

export function DataTable({ url, title, columns, config, searchPlaceholder }: DataTableProps) {
  const mergedConfig = { ...defaultConfig, ...config };
  const { region, district, station } = useFilters();
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(mergedConfig.lengthMenu?.[0] || 10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [useClientPagination, setUseClientPagination] = useState(false);
  const prevGroupingRef = React.useRef(mergedConfig.grouping);

  // Reset to page 1 when grouping mode changes or when switching views
  useEffect(() => {
    const groupingChanged = prevGroupingRef.current !== mergedConfig.grouping;
    if (groupingChanged) {
      console.log('Grouping mode changed, resetting to page 1');
      setCurrentPage(1);
      prevGroupingRef.current = mergedConfig.grouping;
    }
  }, [mergedConfig.grouping]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 when searching
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data from URL
  useEffect(() => {
    // Skip fetch if using client-side pagination and we already have all data
    if (useClientPagination && data.length > 0 && currentPage > 1) {
      console.log('Skipping fetch - using client-side pagination with existing data');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {};
        
        // When grouping is enabled, fetch all records for proper grouping
        if (mergedConfig.grouping) {
          params.page_size = -1; // Fetch all records
        } else {
          params.page = currentPage;
          params.page_size = pageSize;
        }
        
        // Add search parameter if search term exists
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        
        console.log('DataTable fetching with params:', params);
        console.log('Current page:', currentPage);
        console.log('Grouping enabled:', !!mergedConfig.grouping);
        
        const response = await axiosInstance.get(url, { params });
        const responseData = response.data;
        
        console.log('DataTable response:', responseData);
        
        if (Array.isArray(responseData)) {
          setData(responseData);
          setTotalCount(responseData.length);
        } else if (responseData.results && Array.isArray(responseData.results)) {
          const count = responseData.count || responseData.results.length;
          const resultsLength = responseData.results.length;
          
          // Check if backend returned all records despite page_size parameter
          if (!mergedConfig.grouping && resultsLength === count && count > pageSize && currentPage === 1) {
            console.warn('Backend returned all records despite page_size param. Switching to client-side pagination.');
            setUseClientPagination(true);
          }
          
          setData(responseData.results);
          setTotalCount(count);
          console.log('Set totalCount to:', count, 'Results length:', resultsLength, 'Use client pagination:', useClientPagination);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          setData(responseData.data);
          setTotalCount(responseData.data.length);
        } else {
          setData([]);
          setTotalCount(0);
        }
      } catch (err: any) {
        console.error('DataTable fetch error:', err);
        
        // If we get a 404 "Invalid page" error, reset to page 1 and retry
        if (err.response?.status === 404 && err.response?.data?.detail?.includes('Invalid page')) {
          console.log('Invalid page detected, resetting to page 1');
          if (currentPage !== 1) {
            setCurrentPage(1);
            return; // Don't set error, let it retry with page 1
          }
        }
        
        setError(err.message || 'Failed to fetch data');
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, currentPage, pageSize, debouncedSearch, mergedConfig.grouping, region, district, station]);

  // Use server-side search - data is already filtered by backend
  const filteredData = data;

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

  // Group data FIRST (before pagination) when grouping is enabled
  const groupedData = useMemo(() => {
    if (!mergedConfig.grouping) return null;

    const groupKey = mergedConfig.grouping.groupBy;
    const groups = new Map<string, any[]>();

    // Group ALL sorted data (before pagination)
    sortedData.forEach(row => {
      const rawValue = row[groupKey] || 'Unknown';
      const groupValue = String(rawValue).trim();
      if (!groups.has(groupValue)) {
        groups.set(groupValue, []);
      }
      groups.get(groupValue)!.push(row);
    });

    console.log(`Grouped ${sortedData.length} records into ${groups.size} groups`);
    return groups;
  }, [sortedData, mergedConfig.grouping]);

  // Pagination AFTER grouping
  const paginatedData = useMemo(() => {
    if (!mergedConfig.grouping) {
      // Flat view: use client-side pagination if backend returned all records
      const needsClientPagination = useClientPagination;
      
      if (!needsClientPagination) {
        // Server-side pagination - data is already paginated by backend
        return sortedData;
      } else {
        // Client-side pagination
        if (!mergedConfig.pagination || pageSize === -1) return sortedData;
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        console.log(`Flat view client-side pagination: slicing from ${startIndex} to ${endIndex} of ${sortedData.length} records`);
        return sortedData.slice(startIndex, endIndex);
      }
    } else {
      // Grouped view: paginate by number of groups (10 groups per page)
      if (!mergedConfig.pagination || pageSize === -1 || !groupedData) return sortedData;
      
      // Get array of groups
      const groupsArray = Array.from(groupedData.entries());
      
      // Paginate groups: show pageSize groups per page
      const startGroupIndex = (currentPage - 1) * pageSize;
      const endGroupIndex = startGroupIndex + pageSize;
      const paginatedGroups = groupsArray.slice(startGroupIndex, endGroupIndex);
      
      // Flatten groups to rows
      const rows: any[] = [];
      paginatedGroups.forEach(([groupValue, groupRows]) => {
        rows.push(...groupRows);
      });
      
      console.log(`Page ${currentPage}: showing ${paginatedGroups.length} groups (${rows.length} rows) - groups ${startGroupIndex} to ${endGroupIndex-1}`);
      
      return rows;
    }
  }, [sortedData, groupedData, currentPage, pageSize, mergedConfig.grouping, mergedConfig.pagination, useClientPagination]);

  // Initialize expanded groups when data changes or config changes
  useEffect(() => {
    if (mergedConfig.grouping?.defaultExpanded && data.length > 0) {
      const groupKey = mergedConfig.grouping.groupBy;
      const uniqueGroups = new Set(data.map(row => String(row[groupKey] || 'Unknown')));
      setExpandedGroups(uniqueGroups);
    } else {
      setExpandedGroups(new Set());
    }
  }, [data, mergedConfig.grouping?.defaultExpanded, mergedConfig.grouping?.groupBy]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupValue: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupValue)) {
        newSet.delete(groupValue);
      } else {
        newSet.add(groupValue);
      }
      return newSet;
    });
  }, []);

  // Expand all groups
  const expandAll = useCallback(() => {
    if (groupedData) {
      setExpandedGroups(new Set(groupedData.keys()));
    }
  }, [groupedData]);

  // Collapse all groups
  const collapseAll = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  // Calculate pagination info
  const actualTotal = mergedConfig.grouping ? (groupedData?.size || 0) : totalCount;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(actualTotal / pageSize);
  const displayTotal = mergedConfig.grouping ? sortedData.length : totalCount;
  const startRecord = displayTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = mergedConfig.grouping ? Math.min(startRecord + paginatedData.length - 1, displayTotal) : Math.min(currentPage * pageSize, totalCount);

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
            {/* Expand/Collapse All for Grouped Data */}
            {mergedConfig.grouping && groupedData && groupedData.size > 0 && (
              <div className="flex items-center gap-2 mr-2 pr-2 border-r">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAll}
                  className="gap-2"
                >
                  <ChevronsRight className="h-4 w-4" />
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                  className="gap-2"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  Collapse All
                </Button>
              </div>
            )}

            {/* Search */}
            {mergedConfig.search && (
              <div className="relative">
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                {mergedConfig.grouping && (
                  <th className="px-4 py-3 w-10"></th>
                )}
                {columns.map((column) => {
                  // Hide the groupBy column in table header when grouping is enabled
                  if (mergedConfig.grouping && column.key === mergedConfig.grouping.groupBy) {
                    return null;
                  }
                  return (
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
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (mergedConfig.grouping ? 1 : 0)}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No data available
                  </td>
                </tr>
              ) : mergedConfig.grouping && groupedData ? (
                // Render grouped data - rebuild groups from paginatedData
                (() => {
                  // Rebuild groups from paginated data only
                  const displayGroups = new Map<string, any[]>();
                  const groupKey = mergedConfig.grouping!.groupBy;
                  
                  paginatedData.forEach(row => {
                    const rawValue = row[groupKey] || 'Unknown';
                    const groupValue = String(rawValue).trim();
                    if (!displayGroups.has(groupValue)) {
                      displayGroups.set(groupValue, []);
                    }
                    displayGroups.get(groupValue)!.push(row);
                  });
                  
                  return Array.from(displayGroups.entries());
                })().map(([groupValue, items]) => {
                  const isExpanded = expandedGroups.has(groupValue);
                  return (
                    <React.Fragment key={groupValue}>
                      {/* Group Header Row */}
                      <tr
                        className="border-b bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors sticky top-0"
                        onClick={() => toggleGroup(groupValue)}
                      >
                        <td className="px-4 py-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-primary" />
                          )}
                        </td>
                        <td colSpan={columns.filter(col => col.key !== mergedConfig.grouping!.groupBy).length} className="px-4 py-3">
                          {mergedConfig.grouping.renderGroupHeader ? (
                            mergedConfig.grouping.renderGroupHeader(groupValue, items, isExpanded)
                          ) : (
                            <span className="font-semibold">
                              {groupValue} <span className="text-muted-foreground font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Group Items */}
                      {isExpanded && items.map((row, rowIndex) => (
                        <tr
                          key={`${groupValue}-${rowIndex}`}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 bg-muted/20"></td>
                          {columns.map((column) => {
                            // Hide the groupBy column data in child rows (redundant)
                            if (column.key === mergedConfig.grouping!.groupBy) {
                              return null;
                            }
                            return (
                              <td key={column.key} className="px-4 py-3 text-sm">
                                {column.render
                                  ? column.render(row[column.key], row)
                                  : row[column.key]}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                // Render ungrouped data
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
          {mergedConfig.summary && displayTotal > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {startRecord} to {endRecord} of {displayTotal} records
              {mergedConfig.grouping && ` (${actualTotal} ${actualTotal === 1 ? 'group' : 'groups'})`}
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

import React, { useEffect, useState } from 'react';
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
  Loader2,
  ArrowUpDown,
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
  search: false,
  export: {
    pdf: true,
    csv: true,
    print: true,
  },
  lengthMenu: [10, 50, 100, -1], // -1 represents "All"
  pagination: true,
  summary: true,
};

export function DataTable({
  url,
  title,
  columns,
  config,
  data: externalData,
  loading: externalLoading,
  total: externalTotal,
  // new optional callbacks (no breaking change)
  onSearch,
  onPageChange,
  onPageSizeChange,
  onSort,
  externalSearch,
}: DataTableProps & {
  data?: any[];
  loading?: boolean;
  total?: number;
  onSearch?: (q: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (field: string | null, dir: 'asc' | 'desc' | null) => void;
  externalSearch?: string;
}) {
  const mergedConfig = { ...defaultConfig, ...config };
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(mergedConfig.lengthMenu?.[0] ?? 10);
 
   // if API provides paginated { results, count } we can surface count too
   const [total, setTotal] = useState<number | null>(null);
 
   useEffect(() => {
     // If parent provided data, do not perform fetch — operate in controlled mode
     if (externalData !== undefined) {
       setData(externalData);
       setLoading(false);
       setError(null);
       if (externalTotal !== undefined) setTotal(externalTotal);
       return;
     }
 
     let mounted = true;
     const fetchData = async () => {
       setLoading(true);
       setError(null);
       try {
        // request with server-side paging/search params
        const params: Record<string, any> = {};
        if (currentPage) params.page = currentPage;
        if (pageSize !== -1) params.page_size = pageSize;
        if (searchTerm) { params.search = searchTerm; setCurrentPage(1); }
        if (sortField) params.ordering = (sortDir === 'desc' ? `-${sortField}` : sortField);
        const response = await axios.get(url, { params });
         const payload = response.data;
         const rows = Array.isArray(payload) ? payload : payload?.results ?? payload?.data ?? [];
         if (!mounted) return;
         setData(rows);
         setTotal(payload?.count ?? null);
       } catch (err: any) {
         setError(err.message || 'Failed to fetch data');
       } finally {
         if (mounted) setLoading(false);
       }
     };
     if (url) fetchData();
    return () => { mounted = false; };
   }, [url, searchTerm, currentPage, mergedConfig.lengthMenu, externalData, externalTotal, pageSize, sortField, sortDir]);
 
   // derive final render values preferring external props
   const rowsToRender = externalData ?? data;
   const isLoading = externalLoading ?? loading;
   const totalToShow = externalTotal ?? total;
 
   // debug: remove after confirming
   // eslint-disable-next-line no-console
   console.debug('DataTable render rows:', rowsToRender?.length, 'loading:', isLoading, 'total:', totalToShow);

  // ----- Exports -----
  const exportToCSV = () => {
    if (!rowsToRender || rowsToRender.length === 0) return;
    const cols = columns.map(c => c.label);
    const keys = columns.map(c => c.key);
    const csvRows = [cols.join(',')];
    rowsToRender.forEach((r: any) => {
      const row = keys.map(k => {
        const v = r[k];
        if (v === null || v === undefined) return '';
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(',');
      csvRows.push(row);
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'export').replace(/\s+/g, '_').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPrint = () => {
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) return;
    const html = `
      <html>
      <head><title>${title}</title></head>
      <body>
        <h3>${title}</h3>
        <table border="1" cellpadding="6" cellspacing="0">
          <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
          <tbody>${rowsToRender.map((r: any) => `<tr>${columns.map(c => `<td>${(r[c.key] ?? '-')}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    win.focus();
    // give the window a moment to render then call print
    setTimeout(() => win.print(), 300);
  };

  const exportToPDF = () => {
    // simple PDF fallback: open print dialog (user can Save as PDF)
    exportToPrint();
  };

  // keep local searchTerm in sync when parent controls it
  useEffect(() => {
    if (externalSearch !== undefined) setSearchTerm(externalSearch);
  }, [externalSearch]);

  // when user types in search box:
  const handleSearchChange = (v: string) => {
    setSearchTerm(v);
    setCurrentPage(1);
    if (externalData !== undefined && onSearch) {
      // controlled mode -> notify parent to fetch
      onSearch(v);
      return;
    }
    // otherwise internal fetch effect will pick up searchTerm
  };

  const handlePageChange = (page: number) => {
    if (externalData !== undefined && onPageChange) {
      onPageChange(page);
      return;
    }
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    if (externalData !== undefined && onPageSizeChange) {
      onPageSizeChange(size);
      return;
    }
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    // compute new sort state synchronously so we can notify parent correctly
    let newField: string | null = sortField;
    let newDir: 'asc' | 'desc' | null = sortDir;

    if (sortField !== key) {
      newField = key;
      newDir = 'asc';
    } else {
      if (sortDir === 'asc') newDir = 'desc';
      else if (sortDir === 'desc') { newField = null; newDir = null; }
      else newDir = 'asc';
    }

    setSortField(newField);
    setSortDir(newDir);
    setCurrentPage(1);

    if (externalData !== undefined && onSort) {
      onSort(newField, newDir);
    }
  };

   return (
     <div className="datatable">
      {/* Search + Export area */}
      <div className="datatable-header flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {mergedConfig.search && (
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-[220px]"
              />
            </div>
          )}

          {mergedConfig.export && (
            <>
              {mergedConfig.export.csv && (
                <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
                  <Download className="h-4 w-4" /> CSV
                </Button>
              )}
              {mergedConfig.export.pdf && (
                <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-2">
                  <FileText className="h-4 w-4" /> PDF
                </Button>
              )}
              {mergedConfig.export.print && (
                <Button variant="outline" size="sm" onClick={exportToPrint} className="gap-2">
                  <Printer className="h-4 w-4" /> Print
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">Loading…</div>
      ) : error ? (
        <div className="py-8 text-center text-red-600">{error}</div>
      ) : !rowsToRender || rowsToRender.length === 0 ? (
        <div className="py-8 text-center">No data available</div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 text-sm font-medium">
                    {col.sortable ? (
                      <button type="button" className="inline-flex items-center gap-2" onClick={() => handleSort(col.key)}>
                        <span>{col.label}</span>
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        {sortField === col.key && (sortDir === 'asc' ? <span className="text-xs ml-1">▲</span> : <span className="text-xs ml-1">▼</span>)}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowsToRender.map((row: any, ri: number) => (
                <tr key={row.id ?? ri} className="border-b hover:bg-muted/50 transition-colors">
                  {columns.map((col) => {
                    const field = col.key;
                    const val = row[field];
                    return (
                      <td key={field} className="px-2 py-2 align-top">
                        {col.render ? col.render(val, row) : (val ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer with Summary and Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        {/* Summary */}
        {mergedConfig.summary && rowsToRender && rowsToRender.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {(() => {
              const totalRecords = totalToShow ?? rowsToRender.length;
              const effectivePageSize = pageSize === -1 ? totalRecords : pageSize;
              const totalPages = Math.max(1, Math.ceil(totalRecords / Math.max(1, effectivePageSize)));
              const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
              const endRecord = Math.min(totalRecords, startRecord + (rowsToRender.length || 0) - 1);
              return `Showing ${startRecord} to ${endRecord} of ${totalRecords} records`;
            })()}
          </div>
        )}

        {/* Pagination */}
        {mergedConfig.pagination && (pageSize !== -1) && (() => {
          const totalRecords = totalToShow ?? rowsToRender.length;
          const effectivePageSize = pageSize === -1 ? totalRecords : pageSize;
          const totalPages = Math.max(1, Math.ceil(totalRecords / Math.max(1, effectivePageSize)));
          if (totalPages <= 1) return null;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>

              {/* Page size selector */}
              <div className="ml-2">
                <Select value={String(pageSize)} onValueChange={(v) => { handlePageSizeChange(Number(v)); }}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(mergedConfig.lengthMenu || []).map((opt) => (
                      <SelectItem key={String(opt)} value={String(opt)}>{opt === -1 ? 'All' : String(opt)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })()}
      </div>
     </div>
   );
 }
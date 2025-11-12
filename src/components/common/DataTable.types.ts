/**
 * Type definitions for the DataTable component
 * 
 * This file contains all TypeScript interfaces and types used by the DataTable component.
 * Import these types when you need to define columns or configuration for your tables.
 */

import { ReactNode } from 'react';

/**
 * Column definition for the DataTable
 * 
 * @example
 * const columns: DataTableColumn[] = [
 *   { key: 'id', label: 'ID', sortable: true },
 *   { key: 'name', label: 'Name', sortable: true },
 * ];
 */
export interface DataTableColumn {
  /** The key to access the data in the row object */
  key: string;
  
  /** The label to display in the column header */
  label: string;
  
  /** Whether this column can be sorted (default: false) */
  sortable?: boolean;
  
  /** Whether this column can be filtered (default: false) */
  filterable?: boolean;
  
  /** 
   * Custom render function for the cell content
   * @param value - The value of the cell
   * @param row - The entire row object
   * @returns React node to render in the cell
   * 
   * @example
   * render: (value) => <span className="font-bold">{value}</span>
   * render: (value, row) => <button onClick={() => handleClick(row)}>Edit</button>
   */
  render?: (value: any, row: any) => ReactNode;
}

/**
 * Export configuration options
 */
export interface DataTableExportConfig {
  /** Enable PDF export (default: true) */
  pdf?: boolean;
  
  /** Enable CSV export (default: true) */
  csv?: boolean;
  
  /** Enable print functionality (default: true) */
  print?: boolean;
}

/**
 * Row spacing options for the DataTable
 */
export type RowSpacing = 'compact' | 'normal' | 'cozy';

/**
 * Configuration options for the DataTable
 * 
 * All options are optional and have sensible defaults.
 * 
 * @example
 * const config: DataTableConfig = {
 *   search: true,
 *   export: { pdf: true, csv: true, print: false },
 *   lengthMenu: [10, 25, 50, 100],
 *   pagination: true,
 *   summary: true,
 *   rowSpacing: 'normal',
 * };
 */
export interface DataTableConfig {
  /** Enable search functionality (default: true) */
  search?: boolean;
  
  /** Export options (default: all enabled) */
  export?: DataTableExportConfig;
  
  /** 
   * Array of page size options. Use -1 for "All" option.
   * (default: [10, 50, 100, -1])
   * 
   * @example
   * lengthMenu: [5, 10, 25, 50]        // Custom sizes
   * lengthMenu: [10, 50, 100, -1]      // Include "All" option
   */
  lengthMenu?: number[];
  
  /** Enable pagination (default: true) */
  pagination?: boolean;
  
  /** Show record count summary (default: true) */
  summary?: boolean;
  
  /** 
   * Row spacing mode (default: 'normal')
   * - compact: Minimal padding for dense data
   * - normal: Standard padding
   * - cozy: Extra padding for comfortable reading
   */
  rowSpacing?: RowSpacing;
}

/**
 * Props for the DataTable component
 * 
 * @example
 * <DataTable
 *   url="/api/users"
 *   title="User Management"
 *   columns={columns}
 *   config={config}
 * />
 */
export interface DataTableProps {
  /** API endpoint URL to fetch data from */
  url: string;
  
  /** Title displayed in the table header */
  title: string;
  
  /** Array of column definitions */
  columns: DataTableColumn[];
  
  /** Optional configuration (uses defaults if not provided) */
  config?: DataTableConfig;
}

/**
 * Sort configuration state
 * @internal
 */
export interface SortConfig {
  /** The key of the column being sorted */
  key: string;
  
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Default configuration values
 * @internal
 */
export const DEFAULT_CONFIG: Required<DataTableConfig> = {
  search: true,
  export: {
    pdf: true,
    csv: true,
    print: true,
  },
  lengthMenu: [10, 50, 100, -1],
  pagination: true,
  summary: true,
  rowSpacing: 'normal',
};

/**
 * Type guard to check if a value is a valid page size
 * @internal
 */
export function isValidPageSize(value: number): boolean {
  return value === -1 || value > 0;
}

/**
 * Helper type for row data
 * Can be extended based on your specific data structure
 */
export type RowData = Record<string, any>;

/**
 * API response types
 */
export type DataTableApiResponse = RowData[] | { data: RowData[] };

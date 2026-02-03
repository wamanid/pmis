import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Database, CheckCircle, XCircle, Loader2, Download, FileSpreadsheet, FileText as FileTextIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { fetchReportById, executeReport } from '../../services/reportsService';
import { ReportFilters } from './ReportFilters';
import { Report, ReportExecutionResponse } from '../../models/reports';
import { toast } from 'sonner';

export function ReportViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ReportExecutionResponse | null>(null);
  const [runtimeParameters, setRuntimeParameters] = useState<Record<string, any>>({});

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const reportData = await fetchReportById(Number(id));
      setReport(reportData);
    } catch (error) {
      console.error('Failed to load report:', error);
      toast.error('Report not found');
      navigate('/reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteReport = async () => {
    if (!report) return;

    try {
      setExecuting(true);
      const result = await executeReport(report.id, { 
        use_cache: false,
        runtime_parameters: runtimeParameters 
      });
      setExecutionResult(result);
      if (result.success) {
        toast.success(`Report executed in ${result.execution_time_ms}ms`);
      } else {
        toast.error('Report execution failed');
      }
    } catch (error) {
      console.error('Failed to execute report:', error);
      toast.error('Failed to execute report');
    } finally {
      setExecuting(false);
    }
  };

  const exportToCSV = () => {
    if (!executionResult || !executionResult.data || executionResult.data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const data = executionResult.data;
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quote
          const stringValue = value !== null && value !== undefined ? String(value) : '';
          return stringValue.includes(',') || stringValue.includes('"') 
            ? `"${stringValue.replace(/"/g, '""')}"` 
            : stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported as CSV');
  };

  const exportToExcel = () => {
    if (!executionResult || !executionResult.data || executionResult.data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const data = executionResult.data;
    const headers = Object.keys(data[0]);
    
    // Create HTML table for Excel
    const htmlTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(h => `<td>${row[h] !== null && row[h] !== undefined ? row[h] : ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${report?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported as Excel');
  };

  const renderTableFromData = (data: Record<string, any>[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No data available
        </div>
      );
    }

    const columns = Object.keys(data[0]);

    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="font-semibold">
                  {col.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>
                    {row[col] !== null && row[col] !== undefined
                      ? String(row[col])
                      : '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/reports')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Reports
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{report.name}</CardTitle>
              <CardDescription className="text-base">
                {report.description}
              </CardDescription>
            </div>
            <Button
              onClick={handleExecuteReport}
              disabled={executing}
              size="lg"
            >
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Report
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Scope</p>
              <p className="font-medium">{report.scope}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Created By</p>
              <p className="font-medium">
                {report.created_by_details 
                  ? `${report.created_by_details.first_name} ${report.created_by_details.last_name}`.trim() || report.created_by_details.username
                  : report.created_by_username || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Execution Count</p>
              <p className="font-medium">{report.execution_count}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Executed</p>
              <p className="font-medium">
                {report.last_executed_at
                  ? new Date(report.last_executed_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Filters */}
      {report.available_filters && report.available_filters.length > 0 && (
        <div className="mb-6">
          <ReportFilters
            availableFilters={report.available_filters}
            onFiltersChange={setRuntimeParameters}
          />
        </div>
      )}

      {executionResult && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                {executionResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                Execution Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center">
                    <Database className="h-4 w-4 mr-1" />
                    Records
                  </p>
                  <p className="font-medium text-lg">{executionResult.count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Execution Time
                  </p>
                  <p className="font-medium text-lg">
                    {executionResult.execution_time_ms}ms
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Cached</p>
                  <p className="font-medium text-lg">
                    {executionResult.cached ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Execution ID</p>
                  <p className="font-medium text-lg">
                    {executionResult.execution_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Report Data</CardTitle>
                  <CardDescription>
                    {executionResult.count} record(s) returned
                  </CardDescription>
                </div>
                {executionResult.data && executionResult.data.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToCSV}
                    >
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToExcel}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderTableFromData(executionResult.data)}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

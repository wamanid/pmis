import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, User, TrendingUp, Search, Filter, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { fetchReports } from '../../services/reportsService';
import { Report } from '../../models/reports';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 9;

export function ReportsList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetchReports();
      setReports(response.results.filter(r => r.is_active));
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Get unique modules and scopes for filters
  const modules = useMemo(() => {
    const uniqueModules = Array.from(new Set(reports.map(r => r.module)));
    return uniqueModules.sort();
  }, [reports]);

  const scopes = useMemo(() => {
    const uniqueScopes = Array.from(new Set(reports.map(r => r.scope)));
    return uniqueScopes.sort();
  }, [reports]);

  // Filter and search reports
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.name.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          (report.created_by_username || '').toLowerCase().includes(query)
      );
    }

    // Apply module filter
    if (selectedModule !== 'all') {
      filtered = filtered.filter((report) => report.module === selectedModule);
    }

    // Apply scope filter
    if (selectedScope !== 'all') {
      filtered = filtered.filter((report) => report.scope === selectedScope);
    }

    return filtered;
  }, [reports, searchQuery, selectedModule, selectedScope]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredReports, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedModule, selectedScope]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports</h1>
            <p className="text-muted-foreground">
              View and execute system reports
            </p>
          </div>
          <Button onClick={() => navigate('/reports/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports by name, description, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module} className="capitalize">
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedScope} onValueChange={setSelectedScope}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                {scopes.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {scope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {paginatedReports.length} of {filteredReports.length} reports
          {filteredReports.length !== reports.length && ` (filtered from ${reports.length} total)`}
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {reports.length === 0 ? 'No reports available' : 'No reports match your search criteria'}
            </p>
            {reports.length > 0 && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedModule('all');
                  setSelectedScope('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedReports.map((report) => (
            <Card
              key={report.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/reports/viewer/${report.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                      {report.module}
                    </span>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {report.scope}
                    </span>
                  </div>
                </div>
                <CardTitle className="mt-4 text-lg">{report.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>
                      {report.created_by_details 
                        ? `${report.created_by_details.first_name} ${report.created_by_details.last_name}`.trim() || report.created_by_details.username
                        : report.created_by_username || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Last run: {formatDate(report.last_executed_at)}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span>Executed {report.execution_count} times</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  View Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </>
      )}
    </div>
  );
}

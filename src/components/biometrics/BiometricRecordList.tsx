import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  Star,
  Calendar,
  User,
  FileText,
  Filter,
  X
} from 'lucide-react';
import BiometricRecordForm from './BiometricRecordForm';
import FilterSearchScreen, { FilterData } from '../common/FilterSearchScreen';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface BiometricRecord {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  biometric_field_name: string;
  remark: string;
  quality_score: number;
  capture_datetime: string;
  prisoner: string;
  biometric_field: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

// Mock data for biometric records
const mockBiometricRecords: BiometricRecord[] = [
  {
    id: 'br1',
    prisoner_name: 'John Doe Mukasa',
    prisoner_number: 'PRS-2024-001',
    biometric_field_name: 'Right Thumb',
    remark: 'Clear capture with good quality',
    quality_score: 95,
    capture_datetime: '2024-10-15T10:30:00Z',
    prisoner: 'pr1',
    biometric_field: 'bf6'
  },
  {
    id: 'br2',
    prisoner_name: 'Sarah Jane Nakato',
    prisoner_number: 'PRS-2024-002',
    biometric_field_name: 'Left Index Finger',
    remark: 'Second attempt - better quality',
    quality_score: 88,
    capture_datetime: '2024-10-16T14:20:00Z',
    prisoner: 'pr2',
    biometric_field: 'bf2'
  },
  {
    id: 'br3',
    prisoner_name: 'Michael Peter Okello',
    prisoner_number: 'PRS-2024-003',
    biometric_field_name: 'Facial Recognition',
    remark: 'Facial capture completed',
    quality_score: 92,
    capture_datetime: '2024-10-17T09:15:00Z',
    prisoner: 'pr3',
    biometric_field: 'bf11'
  },
  {
    id: 'br4',
    prisoner_name: 'David Emmanuel Musoke',
    prisoner_number: 'PRS-2024-004',
    biometric_field_name: 'Right Index Finger',
    remark: 'Initial registration',
    quality_score: 78,
    capture_datetime: '2024-10-18T11:45:00Z',
    prisoner: 'pr4',
    biometric_field: 'bf7'
  },
  {
    id: 'br5',
    prisoner_name: 'Grace Mary Akello',
    prisoner_number: 'PRS-2024-005',
    biometric_field_name: 'Left Thumb',
    remark: 'Poor lighting conditions affected quality',
    quality_score: 65,
    capture_datetime: '2024-10-19T13:30:00Z',
    prisoner: 'pr5',
    biometric_field: 'bf1'
  },
  {
    id: 'br6',
    prisoner_name: 'Robert James Tumwine',
    prisoner_number: 'PRS-2024-006',
    biometric_field_name: 'Iris Scan',
    remark: 'Excellent capture quality',
    quality_score: 98,
    capture_datetime: '2024-10-20T08:00:00Z',
    prisoner: 'pr6',
    biometric_field: 'bf12'
  },
  {
    id: 'br7',
    prisoner_name: 'Patricia Anne Nambi',
    prisoner_number: 'PRS-2024-007',
    biometric_field_name: 'Right Middle Finger',
    remark: 'Standard capture',
    quality_score: 85,
    capture_datetime: '2024-10-21T15:20:00Z',
    prisoner: 'pr7',
    biometric_field: 'bf8'
  },
  {
    id: 'br8',
    prisoner_name: 'Andrew Simon Kaweesi',
    prisoner_number: 'PRS-2024-008',
    biometric_field_name: 'Left Little Finger',
    remark: 'Recapture due to injury healing',
    quality_score: 72,
    capture_datetime: '2024-10-22T10:10:00Z',
    prisoner: 'pr8',
    biometric_field: 'bf5'
  }
];

export default function BiometricRecordList() {
  const [records, setRecords] = useState<BiometricRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BiometricRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<BiometricRecord | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [filterData, setFilterData] = useState<FilterData | null>(null);

  // Load biometric records
  const fetchRecords = async (page: number = 1) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/biometrics/records/?page=${page}&page_size=${pageSize}`);
      // const data = await response.json();
      // setRecords(data.results);
      // setPagination({
      //   count: data.count,
      //   next: data.next,
      //   previous: data.previous
      // });

      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 500));
      setRecords(mockBiometricRecords);
      setPagination({
        count: mockBiometricRecords.length,
        next: null,
        previous: null
      });
    } catch (error) {
      console.error('Error fetching biometric records:', error);
      toast.error('Failed to load biometric records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage, pageSize]);

  // Apply filters
  useEffect(() => {
    let filtered = [...records];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.prisoner_name.toLowerCase().includes(query) ||
        record.prisoner_number.toLowerCase().includes(query) ||
        record.biometric_field_name.toLowerCase().includes(query) ||
        record.remark.toLowerCase().includes(query)
      );
    }

    // Quality filter
    if (qualityFilter !== 'all') {
      if (qualityFilter === 'excellent') {
        filtered = filtered.filter(r => r.quality_score >= 90);
      } else if (qualityFilter === 'good') {
        filtered = filtered.filter(r => r.quality_score >= 70 && r.quality_score < 90);
      } else if (qualityFilter === 'poor') {
        filtered = filtered.filter(r => r.quality_score < 70);
      }
    }

    // Region/District/Station filter
    // Note: In real implementation, you would filter based on prisoner's location
    // For now, this is a placeholder for the filter structure

    setFilteredRecords(filtered);
  }, [records, searchQuery, qualityFilter, filterData]);

  const handleCreate = () => {
    setEditData(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEdit = (record: BiometricRecord) => {
    setEditData(record);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;

    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/biometrics/records/${recordToDelete}/`, {
      //   method: 'DELETE'
      // });

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Biometric record deleted successfully');
      fetchRecords(currentPage);
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete biometric record');
    } finally {
      setDeleteConfirmOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    fetchRecords(currentPage);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityBadge = (score: number) => {
    if (score >= 90) {
      return <Badge className="bg-green-600">Excellent ({score}%)</Badge>;
    } else if (score >= 70) {
      return <Badge className="bg-blue-600">Good ({score}%)</Badge>;
    } else if (score >= 50) {
      return <Badge className="bg-yellow-600">Fair ({score}%)</Badge>;
    } else {
      return <Badge variant="destructive">Poor ({score}%)</Badge>;
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setQualityFilter('all');
    setFilterData(null);
  };

  const hasActiveFilters = searchQuery || qualityFilter !== 'all' || filterData;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3" style={{ color: '#650000' }}>
          <Fingerprint className="h-8 w-8" />
          <div>
            <h1 className="text-2xl">Biometric Records Management</h1>
            <p className="text-sm text-gray-600">
              Manage prisoner biometric data and capture records
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          style={{ backgroundColor: '#650000' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Biometric Record
        </Button>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" style={{ color: '#650000' }} />
              Search & Filters
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Advanced Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Search & Quality Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by prisoner name, number, field, or remark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quality Filter */}
            <div className="space-y-2">
              <Label htmlFor="quality">Quality Score</Label>
              <Select value={qualityFilter} onValueChange={setQualityFilter}>
                <SelectTrigger id="quality">
                  <SelectValue placeholder="All Qualities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualities</SelectItem>
                  <SelectItem value="excellent">Excellent (90-100%)</SelectItem>
                  <SelectItem value="good">Good (70-89%)</SelectItem>
                  <SelectItem value="poor">Poor (&lt;70%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent>
              <div className="pt-4 border-t">
                <FilterSearchScreen
                  showTitle={false}
                  onFilterChange={setFilterData}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-sm text-gray-600">Active Filters:</span>
              {searchQuery && (
                <Badge variant="outline">
                  Search: {searchQuery}
                </Badge>
              )}
              {qualityFilter !== 'all' && (
                <Badge variant="outline">
                  Quality: {qualityFilter}
                </Badge>
              )}
              {filterData?.station_name && (
                <Badge variant="outline">
                  Station: {filterData.station_name}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Biometric Records ({filteredRecords.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page Size:</span>
              <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(parseInt(val))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: '#650000' }}></div>
                <p className="text-sm text-gray-600">Loading records...</p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Fingerprint className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No biometric records found</p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: '#650000' }}>
                      <TableHead className="text-white">Prisoner</TableHead>
                      <TableHead className="text-white">Prisoner Number</TableHead>
                      <TableHead className="text-white">Biometric Field</TableHead>
                      <TableHead className="text-white">Quality Score</TableHead>
                      <TableHead className="text-white">Capture Date/Time</TableHead>
                      <TableHead className="text-white">Remark</TableHead>
                      <TableHead className="text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" style={{ color: '#650000' }} />
                            <span className="font-medium">{record.prisoner_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" style={{ borderColor: '#650000', color: '#650000' }}>
                            {record.prisoner_number}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Fingerprint className="h-4 w-4 text-gray-600" />
                            {record.biometric_field_name}
                          </div>
                        </TableCell>
                        <TableCell>{getQualityBadge(record.quality_score)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            {formatDate(record.capture_datetime)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {record.remark ? (record.remark.length > 30 ? `${record.remark.substring(0, 30)}...` : record.remark) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(record.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {filteredRecords.length} of {pagination.count} records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.previous || currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">Page {currentPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.next}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <BiometricRecordForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editData={editData}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#650000' }}>
              Delete Biometric Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this biometric record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              style={{ backgroundColor: '#650000' }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

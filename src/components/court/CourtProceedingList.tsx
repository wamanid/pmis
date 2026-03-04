import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, FileText, MoreVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import CourtProceedingForm from './CourtProceedingForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { CourtAttendanceRecord, CourtAttendanceRecordMini, CourtProceedingRecord } from '../../models/court';
import { getCourtattendance, getCourtProceedings } from '../../services/courtService';
import { getprisoners } from '../../services/gateService';



const CourtProceedingList: React.FC = () => {
  const [mockCourtProceedingRecords, setMockCourtProceedingRecords] = useState<CourtProceedingRecord[]>([]);
  const [proceedings, setProceedings] = useState<CourtProceedingRecord[]>([]);
  const [filteredProceedings, setFilteredProceedings] = useState<CourtProceedingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedProceeding, setSelectedProceeding] = useState<CourtProceedingRecord | null>(null);
  const [editData, setEditData] = useState<CourtProceedingRecord | null>(null);
 const [mockCourtAttendanceRecords, setMockCourtAttendanceRecords] = useState<CourtAttendanceRecord[]>([]);
 
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrisoner, setFilterPrisoner] = useState('');
  const [filterCourtAttendance, setFilterCourtAttendance] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadProceedings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [proceedings, searchQuery, filterPrisoner, filterCourtAttendance]);

  const loadProceedings = async () => {
    setLoading(true);
    try {
            
       getCourtattendance().then((data) => {
        setMockCourtAttendanceRecords(data.results);
          }).catch((error) => {
            alert(error);
          });

      //get proceeedings here
       getCourtProceedings().then((data) => {
        setMockCourtProceedingRecords(data.results);
        setProceedings(data.results); 
      //  alert(JSON.stringify(data.results));
          }).catch((error) => {
            alert(error);
          });
      setTotalCount(mockCourtProceedingRecords.length);
    } catch (error) {
      toast.error('Failed to load court proceedings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...proceedings];

    // Search filter (searches in transcript and court attendance details)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.transcript.toLowerCase().includes(query) ||
          p.court_attendance_details.toLowerCase().includes(query) ||
          p.prisoner_name.toLowerCase().includes(query)
      );
    }

    // Prisoner filter
    if (filterPrisoner) {
      filtered = filtered.filter((p) => p.prisoner_name === filterPrisoner);
    }

    // Court Attendance filter
    if (filterCourtAttendance) {
      filtered = filtered.filter((p) => p.court_attendance === filterCourtAttendance);
    }

    setFilteredProceedings(filtered);
    setTotalCount(filtered.length);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (proceeding: CourtProceedingRecord) => {
    setEditData(proceeding);
    setShowForm(true);
  };

  const handleView = (proceeding: CourtProceedingRecord) => {
    setSelectedProceeding(proceeding);
    setShowViewDialog(true);
  };

  const handleFormSuccess = () => {
    loadProceedings();
    setShowForm(false);
    setEditData(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPrisoner('');
    setFilterCourtAttendance('');
  };

  // Get unique prisoner names for filter
  const uniquePrisoners = Array.from(new Set(proceedings.map(p => p.prisoner_name)));

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProceedings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProceedings.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Court Proceedings</h1>
          <p className="text-gray-600">Manage and view court proceeding transcripts</p>
        </div>
        <Button
          onClick={handleCreate}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Proceeding
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search transcript or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Prisoner Filter */}
            <div className="space-y-2">
              <Label htmlFor="prisoner_filter">Prisoner</Label>
              <Select value={filterPrisoner} onValueChange={setFilterPrisoner}>
                <SelectTrigger>
                  <SelectValue placeholder="All Prisoners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prisoners</SelectItem>
                  {uniquePrisoners.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Court Attendance Filter */}
            <div className="space-y-2">
              <Label htmlFor="court_attendance_filter">Court Attendance</Label>
              <Select value={filterCourtAttendance} onValueChange={setFilterCourtAttendance}>
                <SelectTrigger>
                  <SelectValue placeholder="All Records" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  {mockCourtAttendanceRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {record.criminal_case_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="space-y-2 flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalCount)} of {totalCount} proceedings
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="w-[50px] text-white">#</TableHead>
                  <TableHead className="text-white">Prisoner Name</TableHead>
                  <TableHead className="text-white">Court Attendance Details</TableHead>
                  <TableHead className="text-white">Transcript Preview</TableHead>
                  <TableHead className="text-white">Created Date</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No court proceedings found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((proceeding, index) => (
                    <TableRow key={proceeding.id}>
                      <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{proceeding.prisoner_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate">{proceeding.court_attendance_details}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm line-clamp-2 text-gray-600">
                            {proceeding.transcript}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {proceeding.created_datetime
                          ? new Date(proceeding.created_datetime).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(proceeding)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(proceeding)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Form Dialog */}
      <CourtProceedingForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSuccess={handleFormSuccess}
        editData={editData}
      />

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Court Proceeding Details
            </DialogTitle>
          </DialogHeader>

          {selectedProceeding && (
            <div className="space-y-6">
              {/* Prisoner and Court Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Prisoner Name</Label>
                  <p className="mt-1">{selectedProceeding.prisoner_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Created Date</Label>
                  <p className="mt-1">
                    {selectedProceeding.created_datetime
                      ? new Date(selectedProceeding.created_datetime).toLocaleString()
                      : '-'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Court Attendance Details</Label>
                <p className="mt-1">{selectedProceeding.court_attendance_details}</p>
              </div>

              {/* Full Transcript */}
              <div className="space-y-2">
                <Label className="text-gray-600">Full Transcript</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-md border">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedProceeding.transcript}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEdit(selectedProceeding);
                  }}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white hover:opacity-90"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourtProceedingList;
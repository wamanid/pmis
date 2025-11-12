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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, Calendar, FileText, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import CourtScheduleForm from './CourtScheduleForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface CourtScheduleRecord {
  id: string;
  prisoner_name: string;
  offence_name: string;
  court_name: string;
  station_name: string;
  attendance_type_name: string;
  case_outcome_name: string;
  scheduled_date: string;
  scheduled_time: string;
  presiding_judge: string;
  attendance_status: boolean;
  remarks: string;
  court_order: string;
  prisoner: string;
  offence: string;
  court_detail: string;
  station: string;
  court_attendance_type: string;
  case_outcome: string;
}

// Mock data
const mockCourtScheduleRecords: CourtScheduleRecord[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    offence: '1',
    offence_name: 'Theft',
    court_detail: '1',
    court_name: 'High Court - Kampala',
    station: '1',
    station_name: 'Luzira Prison',
    court_attendance_type: '1',
    attendance_type_name: 'Court Appearance',
    case_outcome: '1',
    case_outcome_name: 'Adjourned',
    scheduled_date: '2025-11-15',
    scheduled_time: '09:00:00',
    presiding_judge: 'Hon. Justice Sarah Kisakye',
    attendance_status: false,
    remarks: 'First hearing for theft charges. All documents submitted.',
    court_order: 'court_order_001.pdf'
  },
  {
    id: '2',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    offence: '2',
    offence_name: 'Assault',
    court_detail: '2',
    court_name: 'Chief Magistrates Court - Kampala',
    station: '1',
    station_name: 'Luzira Prison',
    court_attendance_type: '2',
    attendance_type_name: 'Bail Hearing',
    case_outcome: '4',
    case_outcome_name: 'Bail Granted',
    scheduled_date: '2025-11-08',
    scheduled_time: '10:30:00',
    presiding_judge: 'Hon. Chief Magistrate James Okello',
    attendance_status: true,
    remarks: 'Bail hearing completed. Bail granted with conditions.',
    court_order: 'court_order_002.pdf'
  },
  {
    id: '3',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    offence: '4',
    offence_name: 'Murder',
    court_detail: '1',
    court_name: 'High Court - Kampala',
    station: '2',
    station_name: 'Kigo Prison',
    court_attendance_type: '3',
    attendance_type_name: 'Sentencing',
    case_outcome: '2',
    case_outcome_name: 'Convicted',
    scheduled_date: '2025-11-20',
    scheduled_time: '14:00:00',
    presiding_judge: 'Hon. Justice David Makumbi',
    attendance_status: false,
    remarks: 'Sentencing hearing scheduled after conviction.',
    court_order: ''
  },
  {
    id: '4',
    prisoner: '4',
    prisoner_name: 'Mary Williams',
    offence: '5',
    offence_name: 'Fraud',
    court_detail: '5',
    court_name: 'Commercial Court - Kampala',
    station: '1',
    station_name: 'Luzira Prison',
    court_attendance_type: '5',
    attendance_type_name: 'Case Mention',
    case_outcome: '1',
    case_outcome_name: 'Adjourned',
    scheduled_date: '2025-11-12',
    scheduled_time: '11:00:00',
    presiding_judge: 'Hon. Justice Patricia Mutesi',
    attendance_status: false,
    remarks: 'Case mention to set trial dates.',
    court_order: 'court_order_004.pdf'
  },
  {
    id: '5',
    prisoner: '5',
    prisoner_name: 'James Brown',
    offence: '6',
    offence_name: 'Drug Trafficking',
    court_detail: '1',
    court_name: 'High Court - Kampala',
    station: '3',
    station_name: 'Kitalya Prison',
    court_attendance_type: '4',
    attendance_type_name: 'Appeal Hearing',
    case_outcome: '6',
    case_outcome_name: 'Remanded',
    scheduled_date: '2025-11-25',
    scheduled_time: '09:30:00',
    presiding_judge: 'Hon. Justice Richard Buteera',
    attendance_status: false,
    remarks: 'Appeal hearing against previous conviction.',
    court_order: ''
  },
  {
    id: '6',
    prisoner: '1',
    prisoner_name: 'John Doe',
    offence: '1',
    offence_name: 'Theft',
    court_detail: '1',
    court_name: 'High Court - Kampala',
    station: '1',
    station_name: 'Luzira Prison',
    court_attendance_type: '1',
    attendance_type_name: 'Court Appearance',
    case_outcome: '3',
    case_outcome_name: 'Acquitted',
    scheduled_date: '2025-10-20',
    scheduled_time: '09:00:00',
    presiding_judge: 'Hon. Justice Sarah Kisakye',
    attendance_status: true,
    remarks: 'Final hearing. Case dismissed due to lack of evidence.',
    court_order: 'court_order_006.pdf'
  },
];

const CourtScheduleList: React.FC = () => {
  const [schedules, setSchedules] = useState<CourtScheduleRecord[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<CourtScheduleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<CourtScheduleRecord | null>(null);
  const [editData, setEditData] = useState<CourtScheduleRecord | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrisoner, setFilterPrisoner] = useState('');
  const [filterCourt, setFilterCourt] = useState('');
  const [filterOffence, setFilterOffence] = useState('');
  const [filterAttendanceStatus, setFilterAttendanceStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadSchedules();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [schedules, searchQuery, filterPrisoner, filterCourt, filterOffence, filterAttendanceStatus, filterDateFrom, filterDateTo]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSchedules(mockCourtScheduleRecords);
      setTotalCount(mockCourtScheduleRecords.length);
    } catch (error) {
      toast.error('Failed to load court schedules');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...schedules];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.prisoner_name.toLowerCase().includes(query) ||
          s.offence_name.toLowerCase().includes(query) ||
          s.court_name.toLowerCase().includes(query) ||
          s.presiding_judge.toLowerCase().includes(query) ||
          s.remarks.toLowerCase().includes(query)
      );
    }

    // Prisoner filter
    if (filterPrisoner) {
      filtered = filtered.filter((s) => s.prisoner_name === filterPrisoner);
    }

    // Court filter
    if (filterCourt) {
      filtered = filtered.filter((s) => s.court_name === filterCourt);
    }

    // Offence filter
    if (filterOffence) {
      filtered = filtered.filter((s) => s.offence_name === filterOffence);
    }

    // Attendance status filter
    if (filterAttendanceStatus === 'attended') {
      filtered = filtered.filter((s) => s.attendance_status === true);
    } else if (filterAttendanceStatus === 'pending') {
      filtered = filtered.filter((s) => s.attendance_status === false);
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter((s) => s.scheduled_date >= filterDateFrom);
    }
    if (filterDateTo) {
      filtered = filtered.filter((s) => s.scheduled_date <= filterDateTo);
    }

    setFilteredSchedules(filtered);
    setTotalCount(filtered.length);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (schedule: CourtScheduleRecord) => {
    setEditData(schedule);
    setShowForm(true);
  };

  const handleView = (schedule: CourtScheduleRecord) => {
    setSelectedSchedule(schedule);
    setShowViewDialog(true);
  };

  const handleFormSuccess = () => {
    loadSchedules();
    setShowForm(false);
    setEditData(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPrisoner('');
    setFilterCourt('');
    setFilterOffence('');
    setFilterAttendanceStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // Get unique values for filters
  const uniquePrisoners = Array.from(new Set(schedules.map(s => s.prisoner_name)));
  const uniqueCourts = Array.from(new Set(schedules.map(s => s.court_name)));
  const uniqueOffences = Array.from(new Set(schedules.map(s => s.offence_name)));

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900">Court Schedules</h1>
          <p className="text-gray-600">Manage court appearance schedules and attendance</p>
        </div>
        <Button
          onClick={handleCreate}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Row 1: Search and basic filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search schedules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="court_filter">Court</Label>
                <Select value={filterCourt} onValueChange={setFilterCourt}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Courts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courts</SelectItem>
                    {uniqueCourts.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offence_filter">Offence</Label>
                <Select value={filterOffence} onValueChange={setFilterOffence}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Offences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Offences</SelectItem>
                    {uniqueOffences.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status_filter">Status</Label>
                <Select value={filterAttendanceStatus} onValueChange={setFilterAttendanceStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Date filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_from">Date From</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_to">Date To</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>

              <div className="space-y-2 flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalCount)} of {totalCount} schedules
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
                  <TableHead className="text-white">Offence</TableHead>
                  <TableHead className="text-white">Court</TableHead>
                  <TableHead className="text-white">Date & Time</TableHead>
                  <TableHead className="text-white">Presiding Judge</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Outcome</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No court schedules found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((schedule, index) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                      <TableCell>{schedule.prisoner_name}</TableCell>
                      <TableCell>{schedule.offence_name}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{schedule.court_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{formatDate(schedule.scheduled_date)}</span>
                          <span className="text-xs text-gray-500">{formatTime(schedule.scheduled_time)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{schedule.presiding_judge}</div>
                      </TableCell>
                      <TableCell>
                        {schedule.attendance_status ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Attended
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.case_outcome_name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(schedule)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
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
      <CourtScheduleForm
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
              <Calendar className="h-5 w-5" />
              Court Schedule Details
            </DialogTitle>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-6">
              {/* Prisoner and Case Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Prisoner Name</Label>
                  <p className="mt-1">{selectedSchedule.prisoner_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Offence</Label>
                  <p className="mt-1">{selectedSchedule.offence_name}</p>
                </div>
              </div>

              {/* Court and Location Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Court</Label>
                  <p className="mt-1">{selectedSchedule.court_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Station</Label>
                  <p className="mt-1">{selectedSchedule.station_name}</p>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-600">Scheduled Date</Label>
                  <p className="mt-1">{formatDate(selectedSchedule.scheduled_date)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Scheduled Time</Label>
                  <p className="mt-1">{formatTime(selectedSchedule.scheduled_time)}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Attendance Status</Label>
                  <div className="mt-1">
                    {selectedSchedule.attendance_status ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Attended
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Court Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Presiding Judge</Label>
                  <p className="mt-1">{selectedSchedule.presiding_judge}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Attendance Type</Label>
                  <p className="mt-1">{selectedSchedule.attendance_type_name}</p>
                </div>
              </div>

              {/* Case Outcome */}
              {selectedSchedule.case_outcome_name && (
                <div>
                  <Label className="text-gray-600">Case Outcome</Label>
                  <p className="mt-1">{selectedSchedule.case_outcome_name}</p>
                </div>
              )}

              {/* Remarks */}
              {selectedSchedule.remarks && (
                <div>
                  <Label className="text-gray-600">Remarks</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md border">
                    <p className="text-sm whitespace-pre-wrap">{selectedSchedule.remarks}</p>
                  </div>
                </div>
              )}

              {/* Court Order */}
              {selectedSchedule.court_order && (
                <div>
                  <Label className="text-gray-600">Court Order</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">{selectedSchedule.court_order}</span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEdit(selectedSchedule);
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

export default CourtScheduleList;

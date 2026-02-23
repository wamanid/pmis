import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { EarningSchemePrisonerAttendanceForm } from './EarningSchemePrisonerAttendanceForm';
import { AttendanceRecord } from '../../models/earningScheme/earning';

import {getEarningSchemes} from '../../services/gratuityService'
export const EarningSchemePrisonerAttendanceList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWorkingParty, setFilterWorkingParty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Mock data for attendance records
  const [mockAttendanceRecords,setMockAttendanceRecords]= useState<any[]>([
    {
      id: '1',
      prisoner_name: 'John Doe',
      working_party_name: 'Workshop A',
      earning_rate_grade: 'Grade A (1398)',
      is_present: true,
      attendance_datetime: '2025-11-29T08:00:00Z',
      amount_earned: '1398.00',
      remarks: 'Full day attendance',
      working_party_prisoner: 'wp-001',
      earning_rate: 'er-001',
    },
  ]);


  useEffect(() => {
           getEarningSchemes().then((data) => {
           //  alert(JSON.stringify(data.results));
            setMockAttendanceRecords(data.results);
          }).catch((error) => {
            alert(error);
          });

  }, []);

  //userEffect here

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);

  // Filter and search logic
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesSearch = 
      record.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.working_party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.earning_rate_grade.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWorkingParty = filterWorkingParty === 'all' || record.working_party_name === filterWorkingParty;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'present' && record.is_present) ||
      (filterStatus === 'absent' && !record.is_present);
    const matchesGrade = filterGrade === 'all' || record.earning_rate_grade.includes(filterGrade);
    const matchesDate = !filterDate || record.attendance_datetime.includes(filterDate);

    return matchesSearch && matchesWorkingParty && matchesStatus && matchesGrade && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleCreate = () => {
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleView = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const handleDelete = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      setAttendanceRecords(attendanceRecords.filter(r => r.id !== selectedRecord.id));
      toast.success('Attendance record deleted successfully');
      setIsDeleteOpen(false);
      setSelectedRecord(null);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (selectedRecord) {
      // Update existing record
      setAttendanceRecords(attendanceRecords.map(r => 
        r.id === selectedRecord.id ? { ...r, ...data } : r
      ));
      toast.success('Attendance record updated successfully');
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
      //  id: `${attendanceRecords.length + 1}`,
        ...data,
      };
      alert(JSON.stringify(newRecord));
      setAttendanceRecords([...attendanceRecords, newRecord]);
      toast.success('Attendance record created successfully');
    }
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterWorkingParty('all');
    setFilterStatus('all');
    setFilterGrade('all');
    setFilterDate('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Earning Details</h1>
        <p className="text-muted-foreground">
          Manage daily work attendance and earnings calculation for prisoners
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="xl:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by prisoner name, working party..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Working Party</Label>
              <Select value={filterWorkingParty} onValueChange={setFilterWorkingParty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  <SelectItem value="Workshop A">Workshop A</SelectItem>
                  <SelectItem value="Workshop B">Workshop B</SelectItem>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                  <SelectItem value="Cleaning Squad">Cleaning Squad</SelectItem>
                  <SelectItem value="Shamba/Agriculture">Shamba/Agriculture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Attendance Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Earning Grade</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="Grade A">Grade A</SelectItem>
                  <SelectItem value="Grade B">Grade B</SelectItem>
                  <SelectItem value="Grade C">Grade C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Record Attendance
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredRecords.filter(r => r.is_present).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredRecords.filter(r => !r.is_present).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Earned (UGX)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {filteredRecords.reduce((sum, r) => sum + parseFloat(r.amount_earned), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary">
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Working Party</TableHead>
                  <TableHead className="text-white font-bold">Grade</TableHead>
                  <TableHead className="text-white font-bold">Date</TableHead>
                  <TableHead className="text-white font-bold">Time</TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-white font-bold">Amount Earned</TableHead>
                  <TableHead className="text-white font-bold">Remarks</TableHead>
                  <TableHead className="text-white font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.working_party_name}</TableCell>
                      <TableCell>{record.earning_rate_grade}</TableCell>
                      <TableCell>{formatDate(record.attendance_datetime)}</TableCell>
                      <TableCell>{formatTime(record.attendance_datetime)}</TableCell>
                      <TableCell>
                        {record.is_present ? 'Present' : 'Absent'}
                      </TableCell>
                      <TableCell>
                        UGX {parseFloat(record.amount_earned).toLocaleString()}
                      </TableCell>
                      <TableCell>{record.remarks}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(record)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(record)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record)}
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRecord ? 'Edit Attendance Record' : 'Record New Attendance'}
            </DialogTitle>
          </DialogHeader>
          <EarningSchemePrisonerAttendanceForm
            initialData={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Prisoner Name</Label>
                  <p className="text-base mt-1">{selectedRecord.prisoner_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Working Party</Label>
                  <p className="text-base mt-1">{selectedRecord.working_party_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Earning Grade</Label>
                  <p className="text-base mt-1">{selectedRecord.earning_rate_grade}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="text-base mt-1">
                    {formatDate(selectedRecord.attendance_datetime)} at {formatTime(selectedRecord.attendance_datetime)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Attendance Status</Label>
                  <p className="text-base mt-1">
                    {selectedRecord.is_present ? (
                      <span className="text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Present
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-2">
                        <XCircle className="h-4 w-4" /> Absent
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount Earned</Label>
                  <p className="text-base mt-1" style={{ color: '#34D399' }}>
                    UGX {parseFloat(selectedRecord.amount_earned).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Remarks</Label>
                  <p className="text-base mt-1">{selectedRecord.remarks}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this attendance record? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
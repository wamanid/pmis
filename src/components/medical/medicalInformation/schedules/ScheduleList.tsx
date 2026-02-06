import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../ui/alert-dialog';
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

interface Schedule {
  id: string;
  prisoner_name: string;
  followup_date: string;
  attendance_status: boolean;
  notes: string;
  medical_case_book: string;
}

interface ScheduleListProps {
  onView: (schedule: Schedule) => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  schedules: Schedule[]
}

const ScheduleList: React.FC<ScheduleListProps> = ({ onView, onEdit, onDelete, refreshTrigger, schedules }) => {
  // const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // const mockSchedules: Schedule[] = [
  //   {
  //     id: '1',
  //     prisoner_name: 'John Doe',
  //     followup_date: '2025-11-15',
  //     attendance_status: true,
  //     notes: 'Regular check-up completed successfully',
  //     medical_case_book: '1',
  //   },
  //   {
  //     id: '2',
  //     prisoner_name: 'Jane Smith',
  //     followup_date: '2025-11-20',
  //     attendance_status: false,
  //     notes: 'Patient did not attend scheduled appointment',
  //     medical_case_book: '2',
  //   },
  //   {
  //     id: '3',
  //     prisoner_name: 'Michael Johnson',
  //     followup_date: '2025-11-18',
  //     attendance_status: true,
  //     notes: 'Wound dressing changed, healing well',
  //     medical_case_book: '3',
  //   },
  //   {
  //     id: '4',
  //     prisoner_name: 'Emily Davis',
  //     followup_date: '2025-11-22',
  //     attendance_status: true,
  //     notes: 'Blood pressure monitoring',
  //     medical_case_book: '4',
  //   },
  //   {
  //     id: '5',
  //     prisoner_name: 'Robert Lee',
  //     followup_date: '2025-11-25',
  //     attendance_status: false,
  //     notes: 'Rescheduled due to court appearance',
  //     medical_case_book: '5',
  //   },
  // ];

  // useEffect(() => {
  //   loadSchedules();
  // }, [refreshTrigger]);

  useEffect(() => {
    filterSchedules();
  }, [schedules, searchTerm, attendanceFilter]);

  // const loadSchedules = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setSchedules(mockSchedules);
  //     setLoading(false);
  //   }, 500);
  // };

  const filterSchedules = () => {
    let filtered = [...schedules];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (schedule) =>
          schedule.prisoner_name.toLowerCase().includes(term) ||
          schedule.notes.toLowerCase().includes(term)
      );
    }

    if (attendanceFilter === 'attended') {
      filtered = filtered.filter((schedule) => schedule.attendance_status === true);
    } else if (attendanceFilter === 'missed') {
      filtered = filtered.filter((schedule) => schedule.attendance_status === false);
    }

    setFilteredSchedules(filtered);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(recordToDelete);
    // if (recordToDelete) {
    //   onDelete(recordToDelete);
    //   setSchedules((prev) => prev.filter((schedule) => schedule.id !== recordToDelete));
    //   toast.success('Schedule deleted successfully');
    //   setDeleteDialogOpen(false);
    //   setRecordToDelete(null);
    // }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSchedules.length)} of{' '}
          {filteredSchedules.length} schedules
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Follow-up Date</TableHead>
                  <TableHead className="text-white font-bold">Attendance Status</TableHead>
                  <TableHead className="text-white font-bold">Notes</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Loading schedules...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No schedules found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((schedule) => (
                    <TableRow key={schedule.id} className="hover:bg-gray-50">
                      <TableCell>{schedule.prisoner_name}</TableCell>
                      <TableCell>{format(new Date(schedule.followup_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {schedule.attendance_status ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Attended
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Missed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{schedule.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(schedule)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(schedule)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(schedule.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScheduleList;

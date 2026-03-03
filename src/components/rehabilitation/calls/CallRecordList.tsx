import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  MoreVertical,
  Download,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CallRecord {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  call_type_name: string;
  relation_name: string;
  welfare_officer_name: string;
  caller: string;
  phone_number: string;
  call_date: string;
  call_duration: number;
  call_notes: string;
  recorded_call?: string;
  prisoner: string;
  call_type: string;
  relation_to_prisoner: string;
  welfare_officer: number;
}

interface CallRecordListProps {
  onView: (callRecord: CallRecord) => void;
  onEdit: (callRecord: CallRecord) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  prisonerId?: string;
}

const CallRecordList: React.FC<CallRecordListProps> = ({
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
  prisonerId,
}) => {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CallRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [callTypeFilter, setCallTypeFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Mock data
  const mockCallRecords: CallRecord[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      call_type_name: 'Incoming Call',
      relation_name: 'Parent',
      welfare_officer_name: 'Officer David Wilson',
      caller: 'Mary Doe',
      phone_number: '+256 700 123 456',
      call_date: '2025-11-05',
      call_duration: 15,
      call_notes: 'Family welfare check. Mother inquired about health and rehabilitation progress.',
      recorded_call: 'call_recording_001.mp3',
      prisoner: '1',
      call_type: '1',
      relation_to_prisoner: '1',
      welfare_officer: 1,
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      call_type_name: 'Outgoing Call',
      relation_name: 'Spouse',
      welfare_officer_name: 'Officer Sarah Brown',
      caller: 'Jane Smith',
      phone_number: '+256 701 234 567',
      call_date: '2025-11-06',
      call_duration: 10,
      call_notes: 'Prisoner called spouse to discuss family matters.',
      recorded_call: 'call_recording_002.mp3',
      prisoner: '2',
      call_type: '2',
      relation_to_prisoner: '2',
      welfare_officer: 2,
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      call_type_name: 'Emergency Call',
      relation_name: 'Sibling',
      welfare_officer_name: 'Officer James Taylor',
      caller: 'Sarah Johnson',
      phone_number: '+256 702 345 678',
      call_date: '2025-11-04',
      call_duration: 20,
      call_notes: 'Emergency call regarding family emergency. Father admitted to hospital.',
      recorded_call: 'call_recording_003.mp3',
      prisoner: '3',
      call_type: '3',
      relation_to_prisoner: '3',
      welfare_officer: 3,
    },
    {
      id: '4',
      prisoner_name: 'Robert Lee',
      prisoner_number: 'PR-2024-004',
      call_type_name: 'Welfare Check',
      relation_name: 'Legal Representative',
      welfare_officer_name: 'Officer David Wilson',
      caller: 'Attorney John Williams',
      phone_number: '+256 703 456 789',
      call_date: '2025-11-03',
      call_duration: 25,
      call_notes: 'Legal consultation regarding ongoing case proceedings.',
      recorded_call: 'call_recording_004.mp3',
      prisoner: '4',
      call_type: '4',
      relation_to_prisoner: '7',
      welfare_officer: 1,
    },
    {
      id: '5',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR-2024-005',
      call_type_name: 'Incoming Call',
      relation_name: 'Child',
      welfare_officer_name: 'Officer Sarah Brown',
      caller: 'Tom Davis',
      phone_number: '+256 704 567 890',
      call_date: '2025-11-07',
      call_duration: 12,
      call_notes: 'Son called to discuss school progress and family updates.',
      recorded_call: '',
      prisoner: '5',
      call_type: '1',
      relation_to_prisoner: '4',
      welfare_officer: 2,
    },
    {
      id: '6',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      call_type_name: 'Outgoing Call',
      relation_name: 'Spouse',
      welfare_officer_name: 'Officer James Taylor',
      caller: 'John Doe',
      phone_number: '+256 705 678 901',
      call_date: '2025-11-02',
      call_duration: 8,
      call_notes: 'Brief call to spouse regarding personal matters.',
      recorded_call: 'call_recording_006.mp3',
      prisoner: '1',
      call_type: '2',
      relation_to_prisoner: '2',
      welfare_officer: 3,
    },
  ];

  useEffect(() => {
    loadCallRecords();
  }, [refreshTrigger, prisonerId]);

  useEffect(() => {
    filterRecords();
  }, [callRecords, searchTerm, callTypeFilter, dateFromFilter, dateToFilter]);

  const loadCallRecords = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let data = mockCallRecords;
      // Filter by prisonerId if provided
      if (prisonerId) {
        data = data.filter((record) => record.prisoner === prisonerId);
      }
      setCallRecords(data);
      setLoading(false);
    }, 500);
  };

  const filterRecords = () => {
    let filtered = [...callRecords];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(term) ||
          record.prisoner_number.toLowerCase().includes(term) ||
          record.caller.toLowerCase().includes(term) ||
          record.phone_number.toLowerCase().includes(term) ||
          record.call_type_name.toLowerCase().includes(term) ||
          record.relation_name.toLowerCase().includes(term)
      );
    }

    // Call type filter
    if (callTypeFilter !== 'all') {
      filtered = filtered.filter((record) => record.call_type_name === callTypeFilter);
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter((record) => record.call_date >= dateFromFilter);
    }
    if (dateToFilter) {
      filtered = filtered.filter((record) => record.call_date <= dateToFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const getCallTypeBadge = (callType: string) => {
    const badgeStyles: Record<string, string> = {
      'Incoming Call': 'bg-blue-100 text-blue-800',
      'Outgoing Call': 'bg-green-100 text-green-800',
      'Emergency Call': 'bg-red-100 text-red-800',
      'Welfare Check': 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={badgeStyles[callType] || 'bg-gray-100 text-gray-800'}>
        {callType}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '-';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setCallRecords((prev) => prev.filter((record) => record.id !== recordToDelete));
      toast.success('Call record deleted successfully');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const handleDownloadRecording = (recordedCall: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (recordedCall) {
      toast.success(`Downloading ${recordedCall}...`);
      // Implement actual download logic here
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const uniqueCallTypes = Array.from(new Set(callRecords.map((r) => r.call_type_name)));

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner, caller, phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Call Type Filter */}
            <Select value={callTypeFilter} onValueChange={setCallTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Call Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Call Types</SelectItem>
                {uniqueCallTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date From Filter */}
            <Input
              type="date"
              placeholder="From Date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />

            {/* Date To Filter */}
            <Input
              type="date"
              placeholder="To Date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />

            {/* Clear Filters */}
            {(searchTerm || callTypeFilter !== 'all' || dateFromFilter || dateToFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCallTypeFilter('all');
                  setDateFromFilter('');
                  setDateToFilter('');
                }}
                className="lg:col-span-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of{' '}
          {filteredRecords.length} call records
        </div>
      </div>

      {/* Table */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white">Prisoner</TableHead>
                  <TableHead className="text-white">Call Type</TableHead>
                  <TableHead className="text-white">Caller</TableHead>
                  <TableHead className="text-white">Phone Number</TableHead>
                  <TableHead className="text-white">Relationship</TableHead>
                  <TableHead className="text-white">Call Date</TableHead>
                  <TableHead className="text-white">Duration</TableHead>
                  <TableHead className="text-white">Recording</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Loading call records...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No call records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div>{record.prisoner_name}</div>
                          <div className="text-sm text-gray-500">{record.prisoner_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getCallTypeBadge(record.call_type_name)}</TableCell>
                      <TableCell>{record.caller}</TableCell>
                      <TableCell className="text-sm">{record.phone_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.relation_name || '-'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(record.call_date)}</TableCell>
                      <TableCell className="text-sm">{formatDuration(record.call_duration)}</TableCell>
                      <TableCell>
                        {record.recorded_call ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDownloadRecording(record.recorded_call!, e)}
                            className="h-8"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">No recording</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(record)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(record)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(record.id)}
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

      {/* Pagination */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the call record from the system.
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

export default CallRecordList;

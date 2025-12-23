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
  TableRow 
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
  FileText, 
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import CourtAttendanceForm from './CourtAttendanceForm';

interface CourtAttendanceRecord {
  id: string;
  prisoner_name: string;
  attendance_type_name: string;
  court_name: string;
  offence_name: string;
  case_outcome_name: string;
  appeal_id: string;
  gate_pass_number: string;
  remarks: string;
  production_warrant: string;
  criminal_case_number: string;
  attendance_datetime: string;
  legal_proceedings: string;
  prisoner: string;
  court_attendance_type: string;
  court: string;
  offence: string;
  case_outcome: string;
  appeal: string;
  gate_pass: string;
}

// Mock data
const mockRecords: CourtAttendanceRecord[] = [
  {
    id: '1',
    prisoner_name: 'John Doe Mukasa',
    attendance_type_name: 'Court Appearance',
    court_name: 'High Court - Kampala',
    offence_name: 'Theft',
    case_outcome_name: 'Adjourned',
    appeal_id: 'APP-2024-001',
    gate_pass_number: 'GP-2024-001',
    remarks: 'Case adjourned to next month',
    production_warrant: 'warrant_001.jpg',
    criminal_case_number: 'CCN-2024-001',
    attendance_datetime: '2024-10-15T09:00:00',
    legal_proceedings: 'Initial hearing conducted',
    prisoner: 'pr1',
    court_attendance_type: '1',
    court: '1',
    offence: '1',
    case_outcome: '1',
    appeal: '1',
    gate_pass: '1'
  },
  {
    id: '2',
    prisoner_name: 'Sarah Jane Nakato',
    attendance_type_name: 'Sentencing',
    court_name: 'Chief Magistrates Court - Kampala',
    offence_name: 'Fraud',
    case_outcome_name: 'Convicted',
    appeal_id: '',
    gate_pass_number: 'GP-2024-002',
    remarks: 'Sentenced to 5 years imprisonment',
    production_warrant: 'warrant_002.jpg',
    criminal_case_number: 'CCN-2024-002',
    attendance_datetime: '2024-10-20T10:30:00',
    legal_proceedings: 'Final sentencing delivered',
    prisoner: 'pr2',
    court_attendance_type: '3',
    court: '2',
    offence: '4',
    case_outcome: '2',
    appeal: '',
    gate_pass: '2'
  },
  {
    id: '3',
    prisoner_name: 'Michael Peter Okello',
    attendance_type_name: 'Bail Hearing',
    court_name: 'Magistrates Court - Nakawa',
    offence_name: 'Assault',
    case_outcome_name: 'Bail Granted',
    appeal_id: '',
    gate_pass_number: 'GP-2024-003',
    remarks: 'Bail granted with conditions',
    production_warrant: 'warrant_003.jpg',
    criminal_case_number: 'CCN-2024-003',
    attendance_datetime: '2024-10-25T14:00:00',
    legal_proceedings: 'Bail conditions set',
    prisoner: 'pr3',
    court_attendance_type: '2',
    court: '3',
    offence: '2',
    case_outcome: '5',
    appeal: '',
    gate_pass: '3'
  },
  {
    id: '4',
    prisoner_name: 'David Emmanuel Musoke',
    attendance_type_name: 'Appeal Hearing',
    court_name: 'High Court - Kampala',
    offence_name: 'Murder',
    case_outcome_name: 'Remanded',
    appeal_id: 'APP-2024-002',
    gate_pass_number: 'GP-2024-004',
    remarks: 'Appeal hearing in progress',
    production_warrant: 'warrant_004.jpg',
    criminal_case_number: 'CCN-2024-004',
    attendance_datetime: '2024-10-28T11:00:00',
    legal_proceedings: 'Appeal arguments presented',
    prisoner: 'pr4',
    court_attendance_type: '4',
    court: '1',
    offence: '3',
    case_outcome: '6',
    appeal: '2',
    gate_pass: '1'
  },
  {
    id: '5',
    prisoner_name: 'Grace Mary Akello',
    attendance_type_name: 'Case Mention',
    court_name: 'Family Court - Mengo',
    offence_name: 'Drug Trafficking',
    case_outcome_name: 'Adjourned',
    appeal_id: '',
    gate_pass_number: 'GP-2024-005',
    remarks: 'Awaiting witness testimony',
    production_warrant: 'warrant_005.jpg',
    criminal_case_number: 'CCN-2024-005',
    attendance_datetime: '2024-11-01T08:30:00',
    legal_proceedings: 'Case mentioned for next hearing',
    prisoner: 'pr5',
    court_attendance_type: '5',
    court: '4',
    offence: '5',
    case_outcome: '1',
    appeal: '',
    gate_pass: '2'
  }
];

export default function CourtAttendanceList() {
  const [records, setRecords] = useState<CourtAttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CourtAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<CourtAttendanceRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourt, setFilterCourt] = useState('');
  const [filterAttendanceType, setFilterAttendanceType] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchRecords();
  }, [currentPage]);

  useEffect(() => {
    applyFilters();
  }, [records, searchTerm, filterCourt, filterAttendanceType, filterOutcome, filterDateFrom, filterDateTo]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/court-attendance/attendance-records/?page=${currentPage}`);
      // const data = await response.json();
      // setRecords(data.results);
      // setTotalRecords(data.count);

      // Using mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      setRecords(mockRecords);
      setTotalRecords(mockRecords.length);
    } catch (error) {
      console.error('Error fetching court attendance records:', error);
      toast.error('Failed to load court attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.criminal_case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.court_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Court filter
    if (filterCourt) {
      filtered = filtered.filter(record => record.court === filterCourt);
    }

    // Attendance type filter
    if (filterAttendanceType) {
      filtered = filtered.filter(record => record.court_attendance_type === filterAttendanceType);
    }

    // Outcome filter
    if (filterOutcome) {
      filtered = filtered.filter(record => record.case_outcome === filterOutcome);
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(record => 
        new Date(record.attendance_datetime) >= new Date(filterDateFrom)
      );
    }
    if (filterDateTo) {
      filtered = filtered.filter(record => 
        new Date(record.attendance_datetime) <= new Date(filterDateTo)
      );
    }

    setFilteredRecords(filtered);
  };

  const handleCreate = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const handleEdit = (record: CourtAttendanceRecord) => {
    setEditData(record);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/court-attendance/attendance-records/${id}/`, {
      //   method: 'DELETE'
      // });
      // if (!response.ok) throw new Error('Failed to delete record');

      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Court attendance record deleted successfully');
      setDeleteId(null);
      fetchRecords();
    } catch (error) {
      console.error('Error deleting court attendance record:', error);
      toast.error('Failed to delete court attendance record');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCourt('');
    setFilterAttendanceType('');
    setFilterOutcome('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const formatDateTime = (dateString: string) => {
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

  const getOutcomeBadgeColor = (outcome: string) => {
    const colors: { [key: string]: string } = {
      'Convicted': 'bg-red-600',
      'Acquitted': 'bg-green-600',
      'Adjourned': 'bg-yellow-600',
      'Case Dismissed': 'bg-gray-600',
      'Bail Granted': 'bg-blue-600',
      'Remanded': 'bg-orange-600'
    };
    return colors[outcome] || 'bg-gray-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: '#650000' }}>
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl">Court Attendance & Proceedings</h1>
        </div>
        <Button 
          onClick={handleCreate}
          style={{ backgroundColor: '#650000' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Attendance Record
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by prisoner name, case number, or court..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label>Court</Label>
                  <Select value={filterCourt} onValueChange={setFilterCourt}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Courts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Courts</SelectItem>
                      <SelectItem value="1">High Court - Kampala</SelectItem>
                      <SelectItem value="2">Chief Magistrates Court</SelectItem>
                      <SelectItem value="3">Magistrates Court - Nakawa</SelectItem>
                      <SelectItem value="4">Family Court - Mengo</SelectItem>
                      <SelectItem value="5">Commercial Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Attendance Type</Label>
                  <Select value={filterAttendanceType} onValueChange={setFilterAttendanceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="1">Court Appearance</SelectItem>
                      <SelectItem value="2">Bail Hearing</SelectItem>
                      <SelectItem value="3">Sentencing</SelectItem>
                      <SelectItem value="4">Appeal Hearing</SelectItem>
                      <SelectItem value="5">Case Mention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Case Outcome</Label>
                  <Select value={filterOutcome} onValueChange={setFilterOutcome}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Outcomes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Outcomes</SelectItem>
                      <SelectItem value="1">Adjourned</SelectItem>
                      <SelectItem value="2">Convicted</SelectItem>
                      <SelectItem value="3">Acquitted</SelectItem>
                      <SelectItem value="4">Case Dismissed</SelectItem>
                      <SelectItem value="5">Bail Granted</SelectItem>
                      <SelectItem value="6">Remanded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Court Attendance Records ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No court attendance records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#650000' }}>
                    <TableHead className="text-white">Prisoner Name</TableHead>
                    <TableHead className="text-white">Case Number</TableHead>
                    <TableHead className="text-white">Court</TableHead>
                    <TableHead className="text-white">Attendance Type</TableHead>
                    <TableHead className="text-white">Date & Time</TableHead>
                    <TableHead className="text-white">Offence</TableHead>
                    <TableHead className="text-white">Outcome</TableHead>
                    <TableHead className="text-white">Gate Pass</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.prisoner_name}</TableCell>
                      <TableCell>{record.criminal_case_number || '-'}</TableCell>
                      <TableCell className="text-sm">{record.court_name}</TableCell>
                      <TableCell className="text-sm">{record.attendance_type_name}</TableCell>
                      <TableCell className="text-sm">{formatDateTime(record.attendance_datetime)}</TableCell>
                      <TableCell className="text-sm">{record.offence_name || '-'}</TableCell>
                      <TableCell>
                        {record.case_outcome_name ? (
                          <Badge className={`${getOutcomeBadgeColor(record.case_outcome_name)} text-xs`}>
                            {record.case_outcome_name}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{record.gate_pass_number || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(record)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteId(record.id)}
                            title="Delete"
                            style={{ color: '#650000' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <CourtAttendanceForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        onSuccess={fetchRecords}
        editData={editData}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this court attendance record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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

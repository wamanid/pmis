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
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import StationStateForm from './StationStateForm';
import { Dialog, DialogContent } from '../ui/dialog';

interface StationState {
  id: string;
  prisoner_name: string;
  station_name: string;
  medical_officer_name: string;
  assessment_date: string;
  station_type: string;
  admission_reason: string;
  current_health_status: string;
  vital_signs: string;
  treatment_administered: string;
  medications_given: string;
  medical_officer: string;
  duration_days: string;
  discharge_date: string;
  discharge_status: string;
  complications: string;
  follow_up_required: string;
  notes: string;
  prisoner: string;
}

interface StationStateListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockStationStates: StationState[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    station_type: 'Intensive Care Unit',
    station_name: 'Intensive Care Unit',
    medical_officer: '1',
    medical_officer_name: 'Dr. David Makumbi',
    assessment_date: '2024-11-10',
    admission_reason: 'Severe pneumonia requiring intensive monitoring and respiratory support',
    current_health_status: 'Improving',
    vital_signs: 'BP: 130/85, Pulse: 78, Temp: 37.2°C, RR: 20, O2 Sat: 95%',
    treatment_administered: 'IV antibiotics, oxygen therapy via nasal cannula, chest physiotherapy',
    medications_given: 'Ceftriaxone 2g IV q12h, Paracetamol 1g q6h, Bronchodilators',
    duration_days: '7',
    discharge_date: '',
    discharge_status: 'Ongoing',
    complications: 'None observed',
    follow_up_required: 'Yes',
    notes: 'Patient showing good response to treatment, vitals stabilizing',
  },
  {
    id: '2',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    station_type: 'Isolation Ward',
    station_name: 'Isolation Ward',
    medical_officer: '5',
    medical_officer_name: 'Dr. Richard Ssemakula',
    assessment_date: '2024-11-08',
    admission_reason: 'Active tuberculosis requiring isolation and treatment',
    current_health_status: 'Stable',
    vital_signs: 'BP: 120/80, Pulse: 72, Temp: 37.0°C, RR: 18',
    treatment_administered: 'TB treatment regimen, isolation protocols, daily monitoring',
    medications_given: 'Rifampicin 600mg, Isoniazid 300mg, Pyrazinamide 1500mg, Ethambutol 1200mg',
    duration_days: '14',
    discharge_date: '',
    discharge_status: 'Ongoing',
    complications: 'None',
    follow_up_required: 'Yes',
    notes: 'Patient compliant with medication, sputum test scheduled for day 14',
  },
  {
    id: '3',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    station_type: 'Psychiatric Ward',
    station_name: 'Psychiatric Ward',
    medical_officer: '4',
    medical_officer_name: 'Dr. Patricia Mutesi',
    assessment_date: '2024-11-05',
    admission_reason: 'Acute psychotic episode with aggressive behavior',
    current_health_status: 'Discharged',
    vital_signs: 'BP: 125/82, Pulse: 75, Temp: 36.8°C',
    treatment_administered: 'Antipsychotic medication, daily counseling, behavioral therapy',
    medications_given: 'Haloperidol 5mg TID, Diazepam 5mg PRN for agitation',
    duration_days: '21',
    discharge_date: '2024-11-26',
    discharge_status: 'Discharged - Improved',
    complications: 'Initial aggression controlled with medication',
    follow_up_required: 'Yes',
    notes: 'Patient stabilized, responding well to medication, discharged with follow-up plan',
  },
  {
    id: '4',
    prisoner: '4',
    prisoner_name: 'Emily Davis',
    station_type: 'Surgical Ward',
    station_name: 'Surgical Ward',
    medical_officer: '3',
    medical_officer_name: 'Dr. James Okello',
    assessment_date: '2024-11-12',
    admission_reason: 'Post-operative care following appendectomy',
    current_health_status: 'Improving',
    vital_signs: 'BP: 118/76, Pulse: 70, Temp: 36.9°C, RR: 16',
    treatment_administered: 'Wound care, pain management, early mobilization',
    medications_given: 'Tramadol 50mg q6h PRN, Cephalexin 500mg q8h, Paracetamol 1g q6h',
    duration_days: '5',
    discharge_date: '',
    discharge_status: 'Ongoing',
    complications: 'None, wound healing well',
    follow_up_required: 'Yes',
    notes: 'Surgical site clean and dry, patient ambulating well',
  },
  {
    id: '5',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    station_type: 'General Ward',
    station_name: 'General Ward',
    medical_officer: '2',
    medical_officer_name: 'Dr. Sarah Kisakye',
    assessment_date: '2024-11-13',
    admission_reason: 'Gastroenteritis with dehydration requiring IV fluid therapy',
    current_health_status: 'Stable',
    vital_signs: 'BP: 115/75, Pulse: 68, Temp: 36.7°C',
    treatment_administered: 'IV rehydration, anti-emetics, dietary modification',
    medications_given: 'Normal Saline 1L IV q8h, Metoclopramide 10mg IV q8h, ORS',
    duration_days: '3',
    discharge_date: '',
    discharge_status: 'Ongoing',
    complications: 'None',
    follow_up_required: 'No',
    notes: 'Patient tolerating oral fluids, IV to be discontinued tomorrow',
  },
];

const StationStateList: React.FC<StationStateListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<StationState[]>(mockStationStates);
  const [filteredRecords, setFilteredRecords] = useState<StationState[]>(mockStationStates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StationState | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, statusFilter, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedPrisonerId) {
      filtered = filtered.filter((record) => record.prisoner === selectedPrisonerId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.station_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.admission_reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((record) => record.current_health_status === statusFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogOpen(true);
  };

  const handleView = (record: StationState) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: StationState) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: StationState) => {
    if (formMode === 'create') {
      const newRecord: StationState = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Station state record created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Station state record updated successfully');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter((record) => record.id !== recordToDelete));
      toast.success('Station state record deleted successfully');
      setShowDeleteDialog(false);
    }
  };

  const getHealthStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      Stable: 'bg-green-100 text-green-800',
      Improving: 'bg-blue-100 text-blue-800',
      Deteriorating: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800',
      Discharged: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by prisoner, station type, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Health Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Stable">Stable</SelectItem>
                  <SelectItem value="Improving">Improving</SelectItem>
                  <SelectItem value="Deteriorating">Deteriorating</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCreate}
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Station Type</TableHead>
                  <TableHead>Admission Reason</TableHead>
                  <TableHead>Health Status</TableHead>
                  <TableHead>Medical Officer</TableHead>
                  <TableHead>Assessment Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No station state records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.station_type}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.admission_reason}</TableCell>
                      <TableCell>{getHealthStatusBadge(record.current_health_status)}</TableCell>
                      <TableCell>{record.medical_officer_name}</TableCell>
                      <TableCell>{new Date(record.assessment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.duration_days ? `${record.duration_days} days` : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(record)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(record)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(record.id)}
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

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of{' '}
                {filteredRecords.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <StationStateForm
            stationState={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the station state record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StationStateList;
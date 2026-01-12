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
import WardRecommendationForm from './WardRecommendationForm';
import { Dialog, DialogContent } from '../ui/dialog';

interface WardRecommendation {
  id: string;
  prisoner_name: string;
  ward_type_name: string;
  medical_officer_name: string;
  recommendation_date: string;
  expected_duration: string;
  ward_type: string;
  medical_condition: string;
  severity_level: string;
  treatment_plan: string;
  special_care_required: string;
  medical_officer: string;
  status: string;
  actual_admission_date: string;
  actual_discharge_date: string;
  notes: string;
  prisoner: string;
}

interface WardRecommendationListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockWardRecommendations: WardRecommendation[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    ward_type: '2',
    ward_type_name: 'Intensive Care Unit (ICU)',
    medical_officer: '1',
    medical_officer_name: 'Dr. David Makumbi',
    recommendation_date: '2024-11-10',
    expected_duration: '7',
    medical_condition: 'Severe pneumonia with respiratory complications requiring intensive monitoring',
    severity_level: 'Critical',
    treatment_plan: 'IV antibiotics, oxygen therapy, continuous vital signs monitoring',
    special_care_required: '24/7 nursing care, respiratory support equipment',
    status: 'Admitted',
    actual_admission_date: '2024-11-10',
    actual_discharge_date: '',
    notes: 'Patient responding well to treatment, vitals stabilizing',
  },
  {
    id: '2',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    ward_type: '3',
    ward_type_name: 'Isolation Ward',
    medical_officer: '5',
    medical_officer_name: 'Dr. Richard Ssemakula',
    recommendation_date: '2024-11-08',
    expected_duration: '14',
    medical_condition: 'Active tuberculosis requiring isolation and treatment',
    severity_level: 'Severe',
    treatment_plan: 'Multi-drug TB treatment regimen, isolation protocols',
    special_care_required: 'Isolation room, infection control measures, regular sputum tests',
    status: 'Admitted',
    actual_admission_date: '2024-11-09',
    actual_discharge_date: '',
    notes: 'Patient started on TB treatment, showing good compliance',
  },
  {
    id: '3',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    ward_type: '4',
    ward_type_name: 'Psychiatric Ward',
    medical_officer: '4',
    medical_officer_name: 'Dr. Patricia Mutesi',
    recommendation_date: '2024-11-05',
    expected_duration: '21',
    medical_condition: 'Acute psychosis with aggressive behavior',
    severity_level: 'Severe',
    treatment_plan: 'Antipsychotic medication, daily counseling sessions, behavioral therapy',
    special_care_required: 'Secure environment, one-on-one supervision initially',
    status: 'Discharged',
    actual_admission_date: '2024-11-06',
    actual_discharge_date: '2024-11-27',
    notes: 'Patient stabilized and responding well to medication, discharged to general population with follow-up',
  },
  {
    id: '4',
    prisoner: '4',
    prisoner_name: 'Emily Davis',
    ward_type: '5',
    ward_type_name: 'Recovery Ward',
    medical_officer: '3',
    medical_officer_name: 'Dr. James Okello',
    recommendation_date: '2024-11-12',
    expected_duration: '10',
    medical_condition: 'Post-surgical recovery following appendectomy',
    severity_level: 'Moderate',
    treatment_plan: 'Pain management, wound care, gradual mobilization',
    special_care_required: 'Regular wound dressing, physiotherapy',
    status: 'Approved',
    actual_admission_date: '',
    actual_discharge_date: '',
    notes: 'Awaiting bed availability in recovery ward',
  },
  {
    id: '5',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    ward_type: '1',
    ward_type_name: 'General Ward',
    medical_officer: '2',
    medical_officer_name: 'Dr. Sarah Kisakye',
    recommendation_date: '2024-11-13',
    expected_duration: '5',
    medical_condition: 'Gastroenteritis requiring IV fluids and observation',
    severity_level: 'Mild',
    treatment_plan: 'IV rehydration, anti-emetics, dietary modification',
    special_care_required: 'Monitor fluid intake/output, electrolyte balance',
    status: 'Pending',
    actual_admission_date: '',
    actual_discharge_date: '',
    notes: 'Recommendation pending approval from senior medical officer',
  },
];

const WardRecommendationList: React.FC<WardRecommendationListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<WardRecommendation[]>(mockWardRecommendations);
  const [filteredRecords, setFilteredRecords] = useState<WardRecommendation[]>(mockWardRecommendations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WardRecommendation | null>(null);
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
          record.ward_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.medical_condition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogOpen(true);
  };

  const handleView = (record: WardRecommendation) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: WardRecommendation) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: WardRecommendation) => {
    if (formMode === 'create') {
      const newRecord: WardRecommendation = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Ward recommendation created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Ward recommendation updated successfully');
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-blue-100 text-blue-800',
      Admitted: 'bg-green-100 text-green-800',
      Discharged: 'bg-gray-100 text-gray-800',
      Cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants: { [key: string]: string } = {
      Mild: 'bg-green-100 text-green-800',
      Moderate: 'bg-yellow-100 text-yellow-800',
      Severe: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[severity] || 'bg-gray-100 text-gray-800'}>
        {severity}
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
                  placeholder="Search by prisoner, ward type, or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Admitted">Admitted</SelectItem>
                  <SelectItem value="Discharged">Discharged</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                Add Recommendation
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Ward Type</TableHead>
                  <TableHead>Medical Condition</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Medical Officer</TableHead>
                  <TableHead>Rec. Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No ward recommendation records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.ward_type_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.medical_condition}</TableCell>
                      <TableCell>{getSeverityBadge(record.severity_level)}</TableCell>
                      <TableCell>{record.medical_officer_name}</TableCell>
                      <TableCell>{new Date(record.recommendation_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.expected_duration ? `${record.expected_duration} days` : 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
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
                              onClick={() => {
                                setRecordToDelete(record.id);
                                setShowDeleteDialog(true);
                              }}
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
          <WardRecommendationForm
            recommendation={selectedRecord}
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
              This action cannot be undone. This will permanently delete the ward recommendation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (recordToDelete) {
                  setRecords(records.filter((record) => record.id !== recordToDelete));
                  toast.success('Ward recommendation deleted successfully');
                }
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WardRecommendationList;
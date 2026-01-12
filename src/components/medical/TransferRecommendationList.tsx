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
import TransferRecommendationForm from './TransferRecommendationForm';
import { Dialog, DialogContent } from '../ui/dialog';

interface TransferRecommendation {
  id: string;
  prisoner_name: string;
  from_facility_name: string;
  to_facility_name: string;
  medical_officer_name: string;
  recommendation_date: string;
  urgency_level: string;
  medical_reason: string;
  current_condition: string;
  required_facility_type: string;
  special_transport_needs: string;
  medical_officer: string;
  from_facility: string;
  to_facility: string;
  status: string;
  transfer_date: string;
  approval_date: string;
  approved_by: string;
  transfer_notes: string;
  prisoner: string;
}

interface TransferRecommendationListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockTransferRecommendations: TransferRecommendation[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    from_facility: '1',
    from_facility_name: 'Luzira Prison',
    to_facility: '4',
    to_facility_name: 'Mulago National Referral Hospital',
    medical_officer: '3',
    medical_officer_name: 'Dr. James Okello',
    recommendation_date: '2024-11-10',
    urgency_level: 'Emergency',
    medical_reason: 'Acute appendicitis requiring immediate surgical intervention',
    current_condition: 'Severe abdominal pain, elevated white blood cell count, suspected appendicitis',
    required_facility_type: 'Surgical hospital with emergency capabilities',
    special_transport_needs: 'Ambulance with medical escort, pain management during transport',
    status: 'Completed',
    transfer_date: '2024-11-10',
    approval_date: '2024-11-10',
    approved_by: 'Director General - Sarah Kisakye',
    transfer_notes: 'Emergency transfer completed successfully. Surgery performed same day.',
  },
  {
    id: '2',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    from_facility: '2',
    from_facility_name: 'Kigo Prison',
    to_facility: '5',
    to_facility_name: 'Butabika National Psychiatric Hospital',
    medical_officer: '4',
    medical_officer_name: 'Dr. Patricia Mutesi',
    recommendation_date: '2024-11-05',
    urgency_level: 'High',
    medical_reason: 'Severe psychiatric episode requiring specialized psychiatric care',
    current_condition: 'Acute psychosis with violent tendencies, not responding to current medication',
    required_facility_type: 'Specialized psychiatric facility',
    special_transport_needs: 'Secure transport, psychiatric escort, restraints if necessary',
    status: 'Approved',
    transfer_date: '2024-11-15',
    approval_date: '2024-11-06',
    approved_by: 'Commissioner - James Okello',
    transfer_notes: 'Transfer scheduled for November 15th, all documentation prepared',
  },
  {
    id: '3',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    from_facility: '1',
    from_facility_name: 'Luzira Prison',
    to_facility: '4',
    to_facility_name: 'Mulago National Referral Hospital',
    medical_officer: '5',
    medical_officer_name: 'Dr. Richard Ssemakula',
    recommendation_date: '2024-11-08',
    urgency_level: 'High',
    medical_reason: 'Drug-resistant tuberculosis requiring specialized treatment',
    current_condition: 'Multi-drug resistant TB confirmed, not responding to first-line treatment',
    required_facility_type: 'TB specialized unit with isolation capabilities',
    special_transport_needs: 'Isolation transport, N95 masks for escorts, infection control measures',
    status: 'In Transit',
    transfer_date: '2024-11-13',
    approval_date: '2024-11-09',
    approved_by: 'Director Medical Services - Dr. David Makumbi',
    transfer_notes: 'Patient in transit to specialized TB unit at Mulago',
  },
  {
    id: '4',
    prisoner: '4',
    prisoner_name: 'Emily Davis',
    from_facility: '3',
    from_facility_name: 'Kitalya Prison',
    to_facility: '1',
    to_facility_name: 'Luzira Prison',
    medical_officer: '2',
    medical_officer_name: 'Dr. Sarah Kisakye',
    recommendation_date: '2024-11-12',
    urgency_level: 'Medium',
    medical_reason: 'Requires access to better medical facilities for chronic condition management',
    current_condition: 'Chronic diabetes with complications, requires regular specialist consultation',
    required_facility_type: 'Prison facility with hospital and diabetes management program',
    special_transport_needs: 'Standard transport, medical file transfer, medication supply',
    status: 'Pending',
    transfer_date: '',
    approval_date: '',
    approved_by: '',
    transfer_notes: 'Awaiting approval from Commissioner of Prisons',
  },
  {
    id: '5',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    from_facility: '7',
    from_facility_name: 'Gulu Prison',
    to_facility: '6',
    to_facility_name: 'Mbarara Prison',
    medical_officer: '1',
    medical_officer_name: 'Dr. David Makumbi',
    recommendation_date: '2024-11-13',
    urgency_level: 'Low',
    medical_reason: 'Transfer for ongoing cardiac care follow-up',
    current_condition: 'Stable post-cardiac event, requires quarterly cardiology consultations',
    required_facility_type: 'Facility with cardiology services or nearby hospital access',
    special_transport_needs: 'Comfortable transport, avoid excessive stress',
    status: 'Cancelled',
    transfer_date: '',
    approval_date: '',
    approved_by: '',
    transfer_notes: 'Cancelled - Cardiology services now available at Gulu Regional Hospital',
  },
];

const TransferRecommendationList: React.FC<TransferRecommendationListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<TransferRecommendation[]>(mockTransferRecommendations);
  const [filteredRecords, setFilteredRecords] = useState<TransferRecommendation[]>(mockTransferRecommendations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TransferRecommendation | null>(null);
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
          record.from_facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.to_facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.medical_reason.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleView = (record: TransferRecommendation) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: TransferRecommendation) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: TransferRecommendation) => {
    if (formMode === 'create') {
      const newRecord: TransferRecommendation = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Transfer recommendation created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Transfer recommendation updated successfully');
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-blue-100 text-blue-800',
      'In Transit': 'bg-purple-100 text-purple-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants: { [key: string]: string } = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-orange-100 text-orange-800',
      Emergency: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[urgency] || 'bg-gray-100 text-gray-800'}>
        {urgency}
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
                  placeholder="Search by prisoner, facility, or reason..."
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
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
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
                  <TableHead>From Facility</TableHead>
                  <TableHead>To Facility</TableHead>
                  <TableHead>Medical Reason</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Rec. Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No transfer recommendation records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.from_facility_name}</TableCell>
                      <TableCell>{record.to_facility_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.medical_reason}</TableCell>
                      <TableCell>{getUrgencyBadge(record.urgency_level)}</TableCell>
                      <TableCell>{new Date(record.recommendation_date).toLocaleDateString()}</TableCell>
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
          <TransferRecommendationForm
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
              This action cannot be undone. This will permanently delete the transfer recommendation.
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
                  toast.success('Transfer recommendation deleted successfully');
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

export default TransferRecommendationList;
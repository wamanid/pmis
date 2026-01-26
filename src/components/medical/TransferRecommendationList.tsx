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
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';

interface TransferRecommendation {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  reason_name: string;
  station_name: string;
  hospital_name: string;
  category_name: string;
  recommendation_notes: string;
  prisoner: string;
  reason_for_recommendation: string;
  recommended_station: string;
  refferal_hospital: string; // Note: API has typo "refferal"
  referral_category: string;
}

interface TransferRecommendationListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockTransferRecommendations: TransferRecommendation[] = [
  {
    id: '1',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    prisoner_name: 'John Doe',
    prisoner_number: 'PR-2024-001',
    reason_for_recommendation: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    reason_name: 'Critical Medical Condition',
    recommended_station: '3fa85f64-5717-4562-b3fc-2c963f66afc1',
    station_name: 'Luzira Maximum Security Prison',
    refferal_hospital: '3fa85f64-5717-4562-b3fc-2c963f66afd1',
    hospital_name: 'Mulago National Referral Hospital',
    referral_category: '3fa85f64-5717-4562-b3fc-2c963f66afe1',
    category_name: 'Emergency',
    recommendation_notes: 'Patient presenting with severe chest pain and respiratory distress. Suspected myocardial infarction. Requires immediate cardiac evaluation and intervention at specialized cardiac center. ECG shows ST elevation. Patient unstable, requires ambulance transport with medical escort.',
  },
  {
    id: '2',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    prisoner_name: 'Jane Smith',
    prisoner_number: 'PR-2024-002',
    reason_for_recommendation: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    reason_name: 'Psychiatric Evaluation',
    recommended_station: '3fa85f64-5717-4562-b3fc-2c963f66afc2',
    station_name: 'Kigo Prison',
    refferal_hospital: '3fa85f64-5717-4562-b3fc-2c963f66afd2',
    hospital_name: 'Butabika National Psychiatric Hospital',
    referral_category: '3fa85f64-5717-4562-b3fc-2c963f66afe2',
    category_name: 'Urgent',
    recommendation_notes: 'Prisoner exhibiting signs of acute psychotic episode with hallucinations and aggressive behavior. Immediate psychiatric assessment required. Risk of self-harm or harm to others. Requires secure transport and specialized psychiatric care.',
  },
  {
    id: '3',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    prisoner_name: 'Michael Johnson',
    prisoner_number: 'PR-2024-003',
    reason_for_recommendation: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    reason_name: 'Surgical Intervention',
    recommended_station: '3fa85f64-5717-4562-b3fc-2c963f66afc5',
    station_name: 'Mbarara Main Prison',
    refferal_hospital: '3fa85f64-5717-4562-b3fc-2c963f66afd3',
    hospital_name: 'Mbarara Regional Referral Hospital',
    referral_category: '3fa85f64-5717-4562-b3fc-2c963f66afe4',
    category_name: 'Elective',
    recommendation_notes: 'Patient diagnosed with inguinal hernia requiring elective surgical repair. Non-emergency but causing discomfort and limiting physical activities. Surgery scheduled for next month. Pre-operative assessment completed.',
  },
  {
    id: '4',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
    prisoner_name: 'Emily Davis',
    prisoner_number: 'PR-2024-004',
    reason_for_recommendation: '3fa85f64-5717-4562-b3fc-2c963f66afb5',
    reason_name: 'Diagnostic Testing',
    recommended_station: '3fa85f64-5717-4562-b3fc-2c963f66afc4',
    station_name: 'Gulu Main Prison',
    refferal_hospital: '3fa85f64-5717-4562-b3fc-2c963f66afd4',
    hospital_name: 'Gulu Regional Referral Hospital',
    referral_category: '3fa85f64-5717-4562-b3fc-2c963f66afe3',
    category_name: 'Routine',
    recommendation_notes: 'Patient requires advanced imaging studies (CT scan and MRI) to investigate persistent headaches and vision changes. Neurological examination suggests need for detailed brain imaging. Routine referral for diagnostic workup.',
  },
  {
    id: '5',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afaa',
    prisoner_name: 'Robert Lee',
    prisoner_number: 'PR-2024-005',
    reason_for_recommendation: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    reason_name: 'Specialized Treatment Required',
    recommended_station: '3fa85f64-5717-4562-b3fc-2c963f66afc1',
    station_name: 'Luzira Maximum Security Prison',
    refferal_hospital: '3fa85f64-5717-4562-b3fc-2c963f66afd7',
    hospital_name: 'Kiruddu National Referral Hospital',
    referral_category: '3fa85f64-5717-4562-b3fc-2c963f66afe2',
    category_name: 'Urgent',
    recommendation_notes: 'Patient diagnosed with pulmonary tuberculosis with multi-drug resistance. Current facility lacks specialized TB treatment capacity. Requires transfer to facility with MDR-TB treatment protocols and isolation capabilities.',
  },
  {
    id: '6',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    prisoner_name: 'Jane Smith',
    prisoner_number: 'PR-2024-002',
    reason_for_recommendation: '3fa85f64-5717-4562-b3fc-2c963f66afb7',
    reason_name: 'Chronic Disease Management',
    recommended_station: '3fa85f64-5717-4562-b3fc-2c963f66afc6',
    station_name: 'Kitalya Prison',
    refferal_hospital: '3fa85f64-5717-4562-b3fc-2c963f66afd5',
    hospital_name: 'Kampala International Hospital',
    referral_category: '3fa85f64-5717-4562-b3fc-2c963f66afe5',
    category_name: 'Follow-up',
    recommendation_notes: 'Follow-up care for diabetes mellitus Type 2 with complications. Patient requires endocrinology consultation and adjustment of insulin regimen. Regular monitoring and diabetic foot care needed.',
  },
  {
    id: '7',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    prisoner_name: 'John Doe',
    prisoner_number: 'PR-2024-001',
    reason_for_recommendation: '3fa85f64-5717-4562-b3fc-2c963f66afb8',
    reason_name: 'Rehabilitation Services',
    recommended_station: '3fa85f64-5717-4562-b3fc-2c963f66afc3',
    station_name: 'Murchison Bay Prison',
    refferal_hospital: '3fa85f64-5717-4562-b3fc-2c963f66afd6',
    hospital_name: 'Nakasero Hospital',
    referral_category: '3fa85f64-5717-4562-b3fc-2c963f66afe3',
    category_name: 'Routine',
    recommendation_notes: 'Patient recovering from stroke with right-sided weakness. Requires intensive physiotherapy and occupational therapy for functional recovery. Transfer to facility with rehabilitation services recommended.',
  },
];

const TransferRecommendationList: React.FC<TransferRecommendationListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<TransferRecommendation[]>(mockTransferRecommendations);
  const [filteredRecords, setFilteredRecords] = useState<TransferRecommendation[]>(mockTransferRecommendations);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TransferRecommendation | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedPrisonerId) {
      filtered = filtered.filter((record) => record.prisoner === selectedPrisonerId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.prisoner_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.reason_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter((record) => record.id !== recordToDelete));
      toast.success('Transfer recommendation deleted successfully');
      setShowDeleteDialog(false);
    }
  };

  const getCategoryBadge = (categoryName: string) => {
    const variants: { [key: string]: string } = {
      Emergency: 'bg-red-100 text-red-800',
      Urgent: 'bg-orange-100 text-orange-800',
      Routine: 'bg-blue-100 text-blue-800',
      Elective: 'bg-green-100 text-green-800',
      'Follow-up': 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={variants[categoryName] || 'bg-gray-100 text-gray-800'}>
        {categoryName}
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
                  placeholder="Search by prisoner, reason, hospital, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                  <TableHead>Number</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No transfer recommendation records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{record.prisoner_name}</TableCell>
                      <TableCell>{record.prisoner_number}</TableCell>
                      <TableCell>{record.reason_name}</TableCell>
                      <TableCell>{record.hospital_name}</TableCell>
                      <TableCell>{getCategoryBadge(record.category_name)}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2" title={record.recommendation_notes}>
                          {record.recommendation_notes || 'No notes'}
                        </div>
                      </TableCell>
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
          <DialogTitle>Transfer Recommendation Form</DialogTitle>
          <DialogDescription>
            Recommend a prisoner for transfer to another station or hospital for specialized care.
          </DialogDescription>
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
              This action cannot be undone. This will permanently delete the transfer recommendation record.
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

export default TransferRecommendationList;

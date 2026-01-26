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
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import WardRecommendationForm from './WardRecommendationForm';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';

interface WardRecommendation {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  ward_name: string;
  recommendation_notes: string;
  prisoner: string;
  recommended_ward: string;
}

interface WardRecommendationListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockWardRecommendations: WardRecommendation[] = [
  {
    id: '1',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    prisoner_name: 'John Doe',
    prisoner_number: 'PR-2024-001',
    recommended_ward: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    ward_name: 'Intensive Care Unit (ICU)',
    recommendation_notes: 'Prisoner requires intensive medical care due to severe pneumonia with respiratory complications. Continuous monitoring and specialized treatment needed. Patient showing signs of respiratory distress and requires 24/7 nursing care with oxygen therapy and IV antibiotics.',
  },
  {
    id: '2',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    prisoner_name: 'Jane Smith',
    prisoner_number: 'PR-2024-002',
    recommended_ward: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    ward_name: 'Isolation Ward',
    recommendation_notes: 'Active tuberculosis case requiring isolation to prevent spread. Multi-drug treatment regimen to be administered. Patient tested positive for TB, requires strict isolation protocols and daily medication monitoring. Expected duration: 6 months.',
  },
  {
    id: '3',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    prisoner_name: 'Michael Johnson',
    prisoner_number: 'PR-2024-003',
    recommended_ward: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    ward_name: 'Psychiatric Ward',
    recommendation_notes: 'Prisoner showing signs of acute psychotic episode with aggressive behavior. Psychiatric evaluation completed by Dr. Mutesi. Requires controlled environment, medication management, and regular counseling sessions. Safety concerns require specialized psychiatric nursing care.',
  },
  {
    id: '4',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
    prisoner_name: 'Emily Davis',
    prisoner_number: 'PR-2024-004',
    recommended_ward: '3fa85f64-5717-4562-b3fc-2c963f66afb5',
    ward_name: 'Recovery Ward',
    recommendation_notes: 'Post-operative care following appendectomy performed on Nov 11, 2024. Requires monitoring during recovery period. Daily wound assessment and pain management needed. Expected stay 5-7 days with gradual mobilization and dietary progression.',
  },
  {
    id: '5',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afaa',
    prisoner_name: 'Robert Lee',
    prisoner_number: 'PR-2024-005',
    recommended_ward: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    ward_name: 'General Ward A',
    recommendation_notes: 'Mild gastroenteritis requiring observation and IV fluid therapy. Non-critical condition but requires monitoring to prevent dehydration. Patient experiencing nausea, vomiting, and diarrhea. IV rehydration and anti-emetics prescribed. Expected recovery in 2-3 days.',
  },
  {
    id: '6',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    prisoner_name: 'Jane Smith',
    prisoner_number: 'PR-2024-002',
    recommended_ward: '3fa85f64-5717-4562-b3fc-2c963f66afb7',
    ward_name: 'HIV/AIDS Ward',
    recommendation_notes: 'Patient diagnosed with HIV/AIDS, requires specialized care and antiretroviral therapy (ART). Opportunistic infections being managed. Requires nutritional support, counseling, and adherence monitoring for medication compliance.',
  },
  {
    id: '7',
    prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    prisoner_name: 'John Doe',
    prisoner_number: 'PR-2024-001',
    recommended_ward: '3fa85f64-5717-4562-b3fc-2c963f66afb8',
    ward_name: 'General Ward B',
    recommendation_notes: 'Follow-up care after ICU discharge. Patient condition stabilized, transferred for continued monitoring and rehabilitation. Still requires regular vital signs checks and medication management but no longer critical.',
  },
];

const WardRecommendationList: React.FC<WardRecommendationListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<WardRecommendation[]>(mockWardRecommendations);
  const [filteredRecords, setFilteredRecords] = useState<WardRecommendation[]>(mockWardRecommendations);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WardRecommendation | null>(null);
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
          record.ward_name.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter((record) => record.id !== recordToDelete));
      toast.success('Ward recommendation deleted successfully');
      setShowDeleteDialog(false);
    }
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
                  placeholder="Search by prisoner, number, or ward..."
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
                  <TableHead>Prisoner Name</TableHead>
                  <TableHead>Prisoner Number</TableHead>
                  <TableHead>Recommended Ward</TableHead>
                  <TableHead>Recommendation Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No ward recommendation records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{record.prisoner_name}</TableCell>
                      <TableCell>{record.prisoner_number}</TableCell>
                      <TableCell>{record.ward_name}</TableCell>
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
          <DialogTitle>Ward Recommendation Form</DialogTitle>
          <DialogDescription>
            Recommend a prisoner for ward admission based on medical needs.
          </DialogDescription>
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
              This action cannot be undone. This will permanently delete the ward recommendation record.
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

export default WardRecommendationList;

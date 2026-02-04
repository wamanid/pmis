import React, { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
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
import { Card, CardContent } from '../../../ui/card';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import DietaryRequirementForm from './DietaryRequirementForm';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../ui/dialog';

interface DietaryRequirement {
  id: string;
  dietary_requirement: string;
  start_date: string;
  end_date: string;
  prisoner_restriction: string;
  prisoner_restriction_info?: string;
}

interface DietaryRequirementListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockRequirementRecords: DietaryRequirement[] = [
  {
    id: '1',
    prisoner_restriction: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    prisoner_restriction_info: 'PR-2024-001 - John Doe (Medical Condition)',
    dietary_requirement: 'Low sugar diet, no processed foods, limited carbohydrates. Patient requires diabetic-friendly meals with controlled portions.',
    start_date: '2024-09-15',
    end_date: '2025-09-15',
  },
  {
    id: '2',
    prisoner_restriction: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    prisoner_restriction_info: 'PR-2024-002 - Jane Smith (Security Risk)',
    dietary_requirement: 'Vegetarian diet required. No meat, poultry, or fish. Plant-based protein sources only with adequate iron and vitamin B12 supplementation.',
    start_date: '2024-08-01',
    end_date: '',
  },
  {
    id: '3',
    prisoner_restriction: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    prisoner_restriction_info: 'PR-2024-003 - Michael Johnson (Behavioral Issues)',
    dietary_requirement: 'Gluten-free diet mandatory. No wheat, barley, rye, or gluten-containing products. All meals must be prepared in gluten-free environment to prevent cross-contamination.',
    start_date: '2024-10-01',
    end_date: '2025-10-01',
  },
  {
    id: '4',
    prisoner_restriction: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
    prisoner_restriction_info: 'PR-2024-004 - Emily Davis (Injury Recovery)',
    dietary_requirement: 'Soft diet required during recovery period. Easy to chew and swallow foods only. No hard, crunchy, or difficult to digest items.',
    start_date: '2024-11-01',
    end_date: '2024-12-01',
  },
  {
    id: '5',
    prisoner_restriction: '3fa85f64-5717-4562-b3fc-2c963f66afaa',
    prisoner_restriction_info: 'PR-2024-005 - Robert Lee (Mental Health)',
    dietary_requirement: 'Low sodium diet with no shellfish. Reduced salt intake essential for blood pressure management. Strictly avoid all shellfish products due to severe allergy.',
    start_date: '2024-07-15',
    end_date: '',
  },
  {
    id: '6',
    prisoner_restriction: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    prisoner_restriction_info: 'PR-2024-006 - Sarah Wilson (Medical Condition)',
    dietary_requirement: 'Halal diet required. All meat must be halal certified. No pork or pork products. Islamic dietary requirements must be strictly followed.',
    start_date: '2024-06-10',
    end_date: '',
  },
  {
    id: '7',
    prisoner_restriction: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    prisoner_restriction_info: 'PR-2024-007 - David Brown (Injury Recovery)',
    dietary_requirement: 'High protein diet for recovery. Increased protein intake necessary for wound healing and muscle recovery. Include lean meats, eggs, and legumes.',
    start_date: '2024-10-15',
    end_date: '2025-01-15',
  },
];

const DietaryRequirementList: React.FC<DietaryRequirementListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<DietaryRequirement[]>(mockRequirementRecords);
  const [filteredRecords, setFilteredRecords] = useState<DietaryRequirement[]>(mockRequirementRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DietaryRequirement | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedPrisonerId) {
      filtered = filtered.filter((record) => record.prisoner_restriction === selectedPrisonerId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_restriction_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.dietary_requirement.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleView = (record: DietaryRequirement) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: DietaryRequirement) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: DietaryRequirement) => {
    if (formMode === 'create') {
      const newRecord: DietaryRequirement = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Dietary requirement created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Dietary requirement updated successfully');
    }
    setDialogOpen(false);
  };

  const isActive = (record: DietaryRequirement) => {
    const today = new Date();
    const startDate = new Date(record.start_date);
    const endDate = record.end_date ? new Date(record.end_date) : null;
    
    if (today < startDate) return false;
    if (endDate && today > endDate) return false;
    return true;
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
                  placeholder="Search by prisoner restriction or dietary requirement..."
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
                Add Requirement
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner Restriction</TableHead>
                  <TableHead>Dietary Requirement</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No dietary requirement records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {record.prisoner_restriction_info || record.prisoner_restriction}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2" title={record.dietary_requirement}>
                          {record.dietary_requirement}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(record.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {record.end_date ? new Date(record.end_date).toLocaleDateString() : 'Ongoing'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isActive(record)
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {isActive(record) ? 'Active' : 'Inactive'}
                        </span>
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
          <DialogTitle>Dietary Requirement Form</DialogTitle>
          <DialogDescription>
            Add or edit a dietary requirement for a prisoner restriction.
          </DialogDescription>
          <DietaryRequirementForm
            requirement={selectedRecord}
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
              This action cannot be undone. This will permanently delete the dietary requirement.
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
                  toast.success('Dietary requirement deleted successfully');
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

export default DietaryRequirementList;

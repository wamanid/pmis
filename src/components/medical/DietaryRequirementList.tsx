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
import DietaryRequirementForm from './DietaryRequirementForm';
import { Dialog, DialogContent } from '../ui/dialog';

interface DietaryRequirement {
  id: string;
  prisoner_name: string;
  diet_type_name: string;
  allergy_name: string;
  requirement_date: string;
  expiry_date: string;
  specific_requirements: string;
  meal_plan: string;
  prescribed_by: string;
  is_active: boolean;
  medical_condition: string;
  special_instructions: string;
  prisoner: string;
  diet_type: string;
  allergy: string;
}

interface DietaryRequirementListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockRequirementRecords: DietaryRequirement[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    diet_type: '2',
    diet_type_name: 'Diabetic',
    allergy: '2',
    allergy_name: 'Dairy',
    requirement_date: '2024-09-15',
    expiry_date: '2025-09-15',
    specific_requirements: 'Low sugar diet, no processed foods, limited carbohydrates',
    meal_plan: 'Breakfast: Oatmeal with berries\nLunch: Grilled chicken with vegetables\nDinner: Fish with brown rice',
    prescribed_by: 'Dr. David Makumbi',
    is_active: true,
    medical_condition: 'Type 2 Diabetes',
    special_instructions: 'Monitor blood sugar levels before each meal',
  },
  {
    id: '2',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    diet_type: '1',
    diet_type_name: 'Vegetarian',
    allergy: '',
    allergy_name: '',
    requirement_date: '2024-08-01',
    expiry_date: '',
    specific_requirements: 'No meat, poultry, or fish. Plant-based protein sources only',
    meal_plan: 'Breakfast: Beans and plantains\nLunch: Lentil stew with posho\nDinner: Vegetable curry with rice',
    prescribed_by: 'Religious/Cultural Requirement',
    is_active: true,
    medical_condition: 'None',
    special_instructions: 'Ensure adequate protein and iron intake',
  },
  {
    id: '3',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    diet_type: '4',
    diet_type_name: 'Gluten-Free',
    allergy: '6',
    allergy_name: 'Wheat',
    requirement_date: '2024-10-01',
    expiry_date: '2025-10-01',
    specific_requirements: 'No wheat, barley, rye, or gluten-containing products',
    meal_plan: 'Breakfast: Rice porridge\nLunch: Grilled meat with sweet potato\nDinner: Fish with cassava',
    prescribed_by: 'Dr. Sarah Kisakye',
    is_active: true,
    medical_condition: 'Celiac Disease',
    special_instructions: 'Strict gluten avoidance required to prevent intestinal damage',
  },
  {
    id: '4',
    prisoner: '4',
    prisoner_name: 'Emily Davis',
    diet_type: '7',
    diet_type_name: 'Soft Diet',
    allergy: '',
    allergy_name: '',
    requirement_date: '2024-11-01',
    expiry_date: '2024-12-01',
    specific_requirements: 'Easy to chew and swallow, no hard or crunchy foods',
    meal_plan: 'Breakfast: Soft porridge\nLunch: Mashed potatoes with soft vegetables\nDinner: Soft cooked rice with tender chicken',
    prescribed_by: 'Dr. Patricia Mutesi',
    is_active: true,
    medical_condition: 'Post-dental surgery recovery',
    special_instructions: 'Temporary requirement during healing period',
  },
  {
    id: '5',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    diet_type: '3',
    diet_type_name: 'Low Sodium',
    allergy: '4',
    allergy_name: 'Shellfish',
    requirement_date: '2024-07-15',
    expiry_date: '',
    specific_requirements: 'Reduced salt intake, no processed foods, avoid high-sodium items',
    meal_plan: 'Breakfast: Unsalted porridge with fruit\nLunch: Grilled chicken with fresh vegetables\nDinner: Fish (no shellfish) with rice',
    prescribed_by: 'Dr. James Okello',
    is_active: true,
    medical_condition: 'Hypertension',
    special_instructions: 'Monitor blood pressure regularly, no shellfish due to allergy',
  },
];

const DietaryRequirementList: React.FC<DietaryRequirementListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<DietaryRequirement[]>(mockRequirementRecords);
  const [filteredRecords, setFilteredRecords] = useState<DietaryRequirement[]>(mockRequirementRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DietaryRequirement | null>(null);
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
          record.diet_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.medical_condition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((record) => record.is_active === isActive);
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

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {isActive ? 'Active' : 'Inactive'}
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
                  placeholder="Search by prisoner, diet type, or condition..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                Add Requirement
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Diet Type</TableHead>
                  <TableHead>Allergy</TableHead>
                  <TableHead>Medical Condition</TableHead>
                  <TableHead>Requirement Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No dietary requirement records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.diet_type_name}</TableCell>
                      <TableCell>{record.allergy_name || 'None'}</TableCell>
                      <TableCell>{record.medical_condition || 'N/A'}</TableCell>
                      <TableCell>{new Date(record.requirement_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {record.expiry_date ? new Date(record.expiry_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.is_active)}</TableCell>
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
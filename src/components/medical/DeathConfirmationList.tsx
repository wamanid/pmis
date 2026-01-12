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
import DeathConfirmationForm from './DeathConfirmationForm';
import { Dialog, DialogContent } from '../ui/dialog';

interface DeathConfirmation {
  id: string;
  prisoner_name: string;
  medical_officer_name: string;
  death_date: string;
  death_time: string;
  death_location: string;
  cause_of_death: string;
  death_category: string;
  medical_officer: string;
  post_mortem_required: string;
  post_mortem_date: string;
  post_mortem_findings: string;
  autopsy_report_number: string;
  death_certificate_number: string;
  certificate_issued_date: string;
  circumstances: string;
  witnesses: string;
  police_notified: string;
  police_case_number: string;
  notes: string;
  prisoner: string;
}

interface DeathConfirmationListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockDeathConfirmations: DeathConfirmation[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    medical_officer: '1',
    medical_officer_name: 'Dr. David Makumbi',
    death_date: '2024-11-10',
    death_time: '14:30',
    death_location: 'Prison Hospital - ICU',
    cause_of_death: 'Acute respiratory failure secondary to severe pneumonia and septic shock',
    death_category: 'Natural',
    post_mortem_required: 'No',
    post_mortem_date: '',
    post_mortem_findings: '',
    autopsy_report_number: '',
    death_certificate_number: 'DC-2024-001',
    certificate_issued_date: '2024-11-11',
    circumstances: 'Patient was admitted to ICU 7 days prior with severe pneumonia. Despite intensive treatment, condition deteriorated rapidly.',
    witnesses: 'Nurse Mary Nakato, Dr. David Makumbi, Ward Attendant Joseph Okello',
    police_notified: 'Yes',
    police_case_number: 'CRB-2024-045',
    notes: 'Family notified immediately. Natural death confirmed.',
  },
  {
    id: '2',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    medical_officer: '4',
    medical_officer_name: 'Dr. Patricia Mutesi',
    death_date: '2024-11-05',
    death_time: '03:15',
    death_location: 'Cell Block B - Cell 12',
    cause_of_death: 'Asphyxiation - suspected suicide by hanging',
    death_category: 'Suspicious',
    post_mortem_required: 'Yes',
    post_mortem_date: '2024-11-06',
    post_mortem_findings: 'Findings consistent with hanging. No signs of struggle or foul play. Toxicology pending.',
    autopsy_report_number: 'APR-2024-003',
    death_certificate_number: 'DC-2024-002',
    certificate_issued_date: '2024-11-08',
    circumstances: 'Inmate found hanging in cell during early morning rounds. Resuscitation attempted but unsuccessful.',
    witnesses: 'Prison Officer James Wamala (discovered body), Nurse Grace Atim (attempted resuscitation)',
    police_notified: 'Yes',
    police_case_number: 'CRB-2024-046',
    notes: 'Full investigation initiated. Mental health history reviewed. Inquest scheduled.',
  },
  {
    id: '3',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    medical_officer: '2',
    medical_officer_name: 'Dr. Sarah Kisakye',
    death_date: '2024-10-28',
    death_time: '22:45',
    death_location: 'Prison Hospital - General Ward',
    cause_of_death: 'Myocardial infarction (heart attack)',
    death_category: 'Natural',
    post_mortem_required: 'No',
    post_mortem_date: '',
    post_mortem_findings: '',
    autopsy_report_number: '',
    death_certificate_number: 'DC-2024-003',
    certificate_issued_date: '2024-10-29',
    circumstances: 'Patient complained of severe chest pain. Emergency response initiated but patient went into cardiac arrest. Resuscitation unsuccessful.',
    witnesses: 'Dr. Sarah Kisakye, Nurse Peter Ssali, Emergency Response Team',
    police_notified: 'No',
    police_case_number: '',
    notes: 'Patient had documented history of cardiac disease. Natural death.',
  },
];

const DeathConfirmationList: React.FC<DeathConfirmationListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<DeathConfirmation[]>(mockDeathConfirmations);
  const [filteredRecords, setFilteredRecords] = useState<DeathConfirmation[]>(mockDeathConfirmations);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeathConfirmation | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, categoryFilter, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedPrisonerId) {
      filtered = filtered.filter((record) => record.prisoner === selectedPrisonerId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.cause_of_death.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.death_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((record) => record.death_category === categoryFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogOpen(true);
  };

  const handleView = (record: DeathConfirmation) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: DeathConfirmation) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter((record) => record.id !== recordToDelete));
      toast.success('Death confirmation deleted successfully');
    }
    setShowDeleteDialog(false);
  };

  const handleFormSubmit = (data: DeathConfirmation) => {
    if (formMode === 'create') {
      const newRecord: DeathConfirmation = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Death confirmation created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Death confirmation updated successfully');
    }
    setDialogOpen(false);
  };

  const getCategoryBadge = (category: string) => {
    const variants: { [key: string]: string } = {
      Natural: 'bg-gray-100 text-gray-800',
      Unnatural: 'bg-orange-100 text-orange-800',
      Suspicious: 'bg-red-100 text-red-800',
      Suicide: 'bg-purple-100 text-purple-800',
      Accident: 'bg-yellow-100 text-yellow-800',
      Homicide: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[category] || 'bg-gray-100 text-gray-800'}>
        {category}
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
                  placeholder="Search by prisoner, cause, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="category-filter">Death Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Natural">Natural</SelectItem>
                  <SelectItem value="Unnatural">Unnatural</SelectItem>
                  <SelectItem value="Suspicious">Suspicious</SelectItem>
                  <SelectItem value="Suicide">Suicide</SelectItem>
                  <SelectItem value="Accident">Accident</SelectItem>
                  <SelectItem value="Homicide">Homicide</SelectItem>
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
                Add Confirmation
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Death Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Cause</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Medical Officer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No death confirmation records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{new Date(record.death_date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.death_time}</TableCell>
                      <TableCell>{record.death_location}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.cause_of_death}</TableCell>
                      <TableCell>{getCategoryBadge(record.death_category)}</TableCell>
                      <TableCell>{record.medical_officer_name}</TableCell>
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
          <DeathConfirmationForm
            confirmation={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the death confirmation record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeathConfirmationList;
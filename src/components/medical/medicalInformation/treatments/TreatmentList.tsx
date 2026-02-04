import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Badge } from '../../../ui/badge';
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
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Treatment {
  id: string;
  prisoner_name: string;
  quantifiable: boolean;
  medication: string;
  quantity: string;
  unit: string;
  dosage: string;
  notes: string;
  medical_case_book: string;
}

interface TreatmentListProps {
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
}

const TreatmentList: React.FC<TreatmentListProps> = ({ onView, onEdit, onDelete, refreshTrigger }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantifiableFilter, setQuantifiableFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const mockTreatments: Treatment[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      quantifiable: true,
      medication: 'Amoxicillin',
      quantity: '30',
      unit: 'tablets',
      dosage: '1 tablet three times daily',
      notes: 'Complete full course',
      medical_case_book: '1',
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      quantifiable: true,
      medication: 'Paracetamol',
      quantity: '20',
      unit: 'tablets',
      dosage: '2 tablets when needed',
      notes: 'For pain relief',
      medical_case_book: '2',
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      quantifiable: false,
      medication: 'Physical Therapy',
      quantity: '',
      unit: '',
      dosage: 'Daily sessions',
      notes: 'Recovery exercises for knee injury',
      medical_case_book: '3',
    },
    {
      id: '4',
      prisoner_name: 'Emily Davis',
      quantifiable: true,
      medication: 'Insulin',
      quantity: '10',
      unit: 'ml',
      dosage: '5 units twice daily',
      notes: 'Monitor blood sugar levels',
      medical_case_book: '4',
    },
    {
      id: '5',
      prisoner_name: 'Robert Lee',
      quantifiable: false,
      medication: 'Counseling Sessions',
      quantity: '',
      unit: '',
      dosage: 'Weekly sessions',
      notes: 'Mental health support',
      medical_case_book: '5',
    },
  ];

  useEffect(() => {
    loadTreatments();
  }, [refreshTrigger]);

  useEffect(() => {
    filterTreatments();
  }, [treatments, searchTerm, quantifiableFilter]);

  const loadTreatments = () => {
    setLoading(true);
    setTimeout(() => {
      setTreatments(mockTreatments);
      setLoading(false);
    }, 500);
  };

  const filterTreatments = () => {
    let filtered = [...treatments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (treatment) =>
          treatment.prisoner_name.toLowerCase().includes(term) ||
          treatment.medication.toLowerCase().includes(term)
      );
    }

    if (quantifiableFilter === 'quantifiable') {
      filtered = filtered.filter((treatment) => treatment.quantifiable);
    } else if (quantifiableFilter === 'non-quantifiable') {
      filtered = filtered.filter((treatment) => !treatment.quantifiable);
    }

    setFilteredTreatments(filtered);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setTreatments((prev) => prev.filter((treatment) => treatment.id !== recordToDelete));
      toast.success('Treatment record deleted successfully');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTreatments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTreatments.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name or medication..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={quantifiableFilter} onValueChange={setQuantifiableFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="quantifiable">Quantifiable</SelectItem>
                <SelectItem value="non-quantifiable">Non-Quantifiable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTreatments.length)} of{' '}
          {filteredTreatments.length} treatments
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Medication</TableHead>
                  <TableHead className="text-white font-bold">Quantifiable</TableHead>
                  <TableHead className="text-white font-bold">Quantity</TableHead>
                  <TableHead className="text-white font-bold">Dosage</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Loading treatments...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No treatments found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((treatment) => (
                    <TableRow key={treatment.id} className="hover:bg-gray-50">
                      <TableCell>{treatment.prisoner_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {treatment.medication}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {treatment.quantifiable ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                      </TableCell>
                      <TableCell>
                        {treatment.quantifiable && treatment.quantity
                          ? `${treatment.quantity} ${treatment.unit}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm">{treatment.dosage || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(treatment)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(treatment)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(treatment.id)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the treatment record.
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

export default TreatmentList;

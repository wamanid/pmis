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
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";

interface Diagnosis {
  id: string;
  prisoner_name: string;
  disease_name: string;
  regiment_name: string;
  differential: boolean;
  unfit_for_labor: boolean;
  remarks: string;
  medical_case_book: string;
  disease: string;
  regiment: string;
}

interface DiagnosisListProps {
  onView: (diagnosis: Diagnosis) => void;
  onEdit: (diagnosis: Diagnosis) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  diagnosis: Diagnosis[];
  diseases: Unit[];
}

const DiagnosisList: React.FC<DiagnosisListProps> = ({ onView, onEdit, onDelete, refreshTrigger, diagnosis, diseases }) => {
  // const [diagnosis, setDiagnosis] = useState<Diagnosis[]>([]);
  const [filteredDiagnosis, setFilteredDiagnosis] = useState<Diagnosis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // const mockDiagnosis: Diagnosis[] = [
  //   {
  //     id: '1',
  //     prisoner_name: 'John Doe',
  //     disease_name: 'Tuberculosis',
  //     regiment_name: 'Antibiotic Course',
  //     differential: false,
  //     unfit_for_labor: true,
  //     remarks: 'Requires isolation and continuous monitoring',
  //     medical_case_book: '1',
  //     disease: '1',
  //     regiment: '1',
  //   },
  //   {
  //     id: '2',
  //     prisoner_name: 'Jane Smith',
  //     disease_name: 'Malaria',
  //     regiment_name: 'Antiviral Medication',
  //     differential: true,
  //     unfit_for_labor: false,
  //     remarks: 'Pending blood test confirmation',
  //     medical_case_book: '2',
  //     disease: '2',
  //     regiment: '2',
  //   },
  //   {
  //     id: '3',
  //     prisoner_name: 'Michael Johnson',
  //     disease_name: 'Pneumonia',
  //     regiment_name: 'Antibiotic Course',
  //     differential: false,
  //     unfit_for_labor: true,
  //     remarks: 'Severe case, needs hospital care',
  //     medical_case_book: '3',
  //     disease: '3',
  //     regiment: '1',
  //   },
  //   {
  //     id: '4',
  //     prisoner_name: 'Emily Davis',
  //     disease_name: 'Hepatitis B',
  //     regiment_name: 'Observation',
  //     differential: false,
  //     unfit_for_labor: false,
  //     remarks: 'Chronic carrier, stable condition',
  //     medical_case_book: '4',
  //     disease: '4',
  //     regiment: '4',
  //   },
  //   {
  //     id: '5',
  //     prisoner_name: 'Robert Lee',
  //     disease_name: 'COVID-19',
  //     regiment_name: 'Isolation Protocol',
  //     differential: false,
  //     unfit_for_labor: true,
  //     remarks: 'Quarantine in medical wing',
  //     medical_case_book: '5',
  //     disease: '5',
  //     regiment: '3',
  //   },
  // ];

  // useEffect(() => {
  //   loadDiagnosis();
  // }, [refreshTrigger]);

  useEffect(() => {
    filterDiagnosis();
  }, [diagnosis, searchTerm, diseaseFilter, statusFilter]);

  // const loadDiagnosis = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setDiagnosis(mockDiagnosis);
  //     setLoading(false);
  //   }, 500);
  // };

  const filterDiagnosis = () => {
    let filtered = [...diagnosis];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (diagnosis) =>
          diagnosis.prisoner_name.toLowerCase().includes(term) ||
          diagnosis.disease_name.toLowerCase().includes(term) ||
          diagnosis.remarks.toLowerCase().includes(term)
      );
    }

    if (diseaseFilter !== 'all') {
      filtered = filtered.filter((diagnosis) => diagnosis.disease_name === diseaseFilter);
    }

    if (statusFilter === 'unfit') {
      filtered = filtered.filter((diagnosis) => diagnosis.unfit_for_labor);
    } else if (statusFilter === 'differential') {
      filtered = filtered.filter((diagnosis) => diagnosis.differential);
    }

    setFilteredDiagnosis(filtered);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // if (recordToDelete) {
    onDelete(recordToDelete);
    //   setDiagnosis((prev) => prev.filter((diagnosis) => diagnosis.id !== recordToDelete));
    //   toast.success('Diagnosis deleted successfully');
    //   setDeleteDialogOpen(false);
    //   setRecordToDelete(null);
    // }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDiagnosis.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDiagnosis.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name or disease..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Diseases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diseases</SelectItem>
                {
                  diseases.map(item => (
                      <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unfit">Unfit for Labor</SelectItem>
                <SelectItem value="differential">Differential</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDiagnosis.length)} of{' '}
          {filteredDiagnosis.length} diagnosis
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Disease</TableHead>
                  <TableHead className="text-white font-bold">Regiment</TableHead>
                  <TableHead className="text-white font-bold">Differential</TableHead>
                  <TableHead className="text-white font-bold">Unfit for Labor</TableHead>
                  <TableHead className="text-white font-bold">Remarks</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading diagnosis...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No diagnosis found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((diagnosis) => (
                    <TableRow key={diagnosis.id} className="hover:bg-gray-50">
                      <TableCell>{diagnosis.prisoner_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {diagnosis.disease_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {diagnosis.regiment_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {diagnosis.differential ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                      </TableCell>
                      <TableCell>
                        {diagnosis.unfit_for_labor ? (
                          <Badge className="bg-orange-100 text-orange-800">Unfit</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Fit</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{diagnosis.remarks || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(diagnosis)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(diagnosis)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(diagnosis.id)}
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
              This action cannot be undone. This will permanently delete the diagnosis.
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

export default DiagnosisList;

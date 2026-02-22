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
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {ExaminationResult} from "../../../../services/medical/medicalInformation/medical";

interface ExamResult {
  id: string;
  prisoner_name: string;
  exam_name: string;
  notes: string;
  medical_case_book: string;
  medical_exam: string;
}

interface ExamResultListProps {
  onView: (examResult: ExamResult) => void;
  onEdit: (examResult: ExamResult) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  exams: Unit[];
  examinationResults: ExaminationResult[]
}

const ExamResultList: React.FC<ExamResultListProps> = ({ onView, onEdit, onDelete, refreshTrigger, exams, examinationResults }) => {
  // const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ExaminationResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // const mockExamResults: ExamResult[] = [
  //   {
  //     id: '1',
  //     prisoner_name: 'John Doe',
  //     exam_name: 'Blood Test',
  //     notes: 'Hemoglobin: 14.5 g/dL, WBC: 7,200/µL, All parameters within normal range',
  //     medical_case_book: '1',
  //     medical_exam: '1',
  //   },
  //   {
  //     id: '2',
  //     prisoner_name: 'Jane Smith',
  //     exam_name: 'X-Ray',
  //     notes: 'Chest X-Ray shows mild pneumonia in left lower lobe. Recommend antibiotics.',
  //     medical_case_book: '2',
  //     medical_exam: '2',
  //   },
  //   {
  //     id: '3',
  //     prisoner_name: 'Michael Johnson',
  //     exam_name: 'ECG',
  //     notes: 'Normal sinus rhythm, heart rate 72 bpm. No abnormalities detected.',
  //     medical_case_book: '3',
  //     medical_exam: '3',
  //   },
  //   {
  //     id: '4',
  //     prisoner_name: 'John Doe',
  //     exam_name: 'Urinalysis',
  //     notes: 'pH: 6.0, No protein, No glucose. Normal findings.',
  //     medical_case_book: '1',
  //     medical_exam: '4',
  //   },
  //   {
  //     id: '5',
  //     prisoner_name: 'Jane Smith',
  //     exam_name: 'CT Scan',
  //     notes: 'CT scan of chest reveals consolidation consistent with pneumonia diagnosis.',
  //     medical_case_book: '2',
  //     medical_exam: '5',
  //   },
  // ];

  // useEffect(() => {
  //   loadExamResults();
  // }, [refreshTrigger]);

  useEffect(() => {
    filterResults();
  }, [examinationResults, searchTerm, examFilter]);

  // const loadExamResults = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setExamResults(mockExamResults);
  //     setLoading(false);
  //   }, 500);
  // };

  const filterResults = () => {
    let filtered = [...examinationResults];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (result) =>
          result.prisoner_name.toLowerCase().includes(term) ||
          result.exam_name.toLowerCase().includes(term) ||
          result.notes.toLowerCase().includes(term)
      );
    }

    if (examFilter !== 'all') {
      filtered = filtered.filter((result) => result.exam_name === examFilter);
    }

    setFilteredResults(filtered);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // if (recordToDelete) {
      onDelete(recordToDelete);
    //   setExamResults((prev) => prev.filter((result) => result.id !== recordToDelete));
    //   toast.success('Exam result deleted successfully');
    //   setDeleteDialogOpen(false);
    //   setRecordToDelete(null);
    // }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name or exam type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={examFilter} onValueChange={setExamFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Exams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {
                  exams.map(item => (
                      <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredResults.length)} of{' '}
          {filteredResults.length} exam results
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Exam Type</TableHead>
                  <TableHead className="text-white font-bold">Notes</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Loading exam results...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No exam results found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((result) => (
                    <TableRow key={result.id} className="hover:bg-gray-50">
                      <TableCell>{result.prisoner_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {result.exam_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{result.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(result)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(result)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(result.id)}
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
              This action cannot be undone. This will permanently delete the exam result.
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

export default ExamResultList;

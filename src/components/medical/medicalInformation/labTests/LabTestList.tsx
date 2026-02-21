import React, {useState, useEffect, SetStateAction} from 'react';
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
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";

interface LabTest {
  id: string;
  prisoner_name: string;
  test_name: string;
  result_name: string;
  notes: string;
  result_document: string;
  medical_case_book: string;
  medical_test: string;
  result: string;
}

interface LabTestListProps {
  onView: (labTest: LabTest) => void;
  onEdit: (labTest: LabTest) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  labTests: LabTest[];
  medicalTests: Unit[];
  testResults: Unit[];
}

const LabTestList: React.FC<LabTestListProps> = ({ onView, onEdit, onDelete, refreshTrigger, labTests, medicalTests, testResults }) => {
  // const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<LabTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [testFilter, setTestFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // const mockLabTests: LabTest[] = [
  //   {
  //     id: '1',
  //     prisoner_name: 'John Doe',
  //     test_name: 'Complete Blood Count',
  //     result_name: 'Normal',
  //     notes: 'All parameters within normal range',
  //     result_document: 'cbc_results_001.pdf',
  //     medical_case_book: '1',
  //     medical_test: '1',
  //     result: '1',
  //   },
  //   {
  //     id: '2',
  //     prisoner_name: 'Jane Smith',
  //     test_name: 'Liver Function Test',
  //     result_name: 'Abnormal',
  //     notes: 'Elevated ALT levels, requires follow-up',
  //     result_document: 'lft_results_002.pdf',
  //     medical_case_book: '2',
  //     medical_test: '2',
  //     result: '2',
  //   },
  //   {
  //     id: '3',
  //     prisoner_name: 'Michael Johnson',
  //     test_name: 'HIV Test',
  //     result_name: 'Negative',
  //     notes: 'Test negative for HIV antibodies',
  //     result_document: 'hiv_results_003.pdf',
  //     medical_case_book: '3',
  //     medical_test: '4',
  //     result: '4',
  //   },
  // ];

  // useEffect(() => {
  //   loadLabTests();
  // }, [refreshTrigger]);

  useEffect(() => {
    filterRecords();
  }, [labTests, searchTerm, testFilter, resultFilter]);

  // const loadLabTests = () => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLabTests(mockLabTests);
  //     setLoading(false);
  //   }, 500);
  // };

  const filterRecords = () => {
    let filtered = [...labTests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(term) ||
          record.test_name.toLowerCase().includes(term)
      );
    }

    if (testFilter !== 'all') {
      filtered = filtered.filter((record) => record.test_name === testFilter);
    }

    if (resultFilter !== 'all') {
      filtered = filtered.filter((record) => record.result_name === resultFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const getResultBadge = (result: string) => {
    const colors: Record<string, string> = {
      Normal: 'bg-green-100 text-green-800',
      Abnormal: 'bg-red-100 text-red-800',
      Positive: 'bg-orange-100 text-orange-800',
      Negative: 'bg-blue-100 text-blue-800',
      Pending: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={colors[result] || 'bg-gray-100 text-gray-800'}>{result}</Badge>;
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // if (recordToDelete) {
      onDelete(recordToDelete);
    //   setLabTests((prev) => prev.filter((record) => record.id !== recordToDelete));
    //   toast.success('Lab test deleted successfully');
    //   setDeleteDialogOpen(false);
    //   setRecordToDelete(null);
    // }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name or test type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={testFilter} onValueChange={setTestFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Tests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {
                  medicalTests.map(item => (
                      <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                {
                  testResults.map(item => (
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
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of{' '}
          {filteredRecords.length} lab tests
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Test Name</TableHead>
                  <TableHead className="text-white font-bold">Result</TableHead>
                  <TableHead className="text-white font-bold">Document</TableHead>
                  <TableHead className="text-white font-bold">Notes</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Loading lab tests...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No lab tests found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.test_name}</TableCell>
                      <TableCell>{getResultBadge(record.result_name)}</TableCell>
                      <TableCell>
                        {record.result_document ? (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700">
                            <FileText className="h-3 w-3 mr-1" />
                            Attached
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{record.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(record)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(record)}>
                              <Pencil className="h-4 w-4 mr-2" />
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
              This action cannot be undone. This will permanently delete the lab test.
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

export default LabTestList;

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
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {BmiClassification} from "../../../../services/medical/medicalInformation/medical";

interface BMIRecord {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  classification_name: string;
  weight: string;
  height: string;
  bmi: string;
  prisoner: string;
  bmi_classification: string;
}

interface BMIListProps {
  onView: (bmiRecord: BMIRecord) => void;
  onEdit: (bmiRecord: BMIRecord) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  prisonerId?: string;
  classifications: BmiClassification
  bmiRecords: BMIRecord
  deleteDialogOpen: boolean
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<Boolean>>
}

const BMIList: React.FC<BMIListProps> = ({
  bmiRecords, classifications, setDeleteDialogOpen, deleteDialogOpen,
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
  prisonerId,
}) => {
  // const [bmiRecords, setBmiRecords] = useState<BMIRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BMIRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [bmiRangeFilter, setBmiRangeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Mock data
  // const mockBmiRecords: BMIRecord[] = [
  //   {
  //     id: '1',
  //     prisoner_name: 'John Doe',
  //     prisoner_number: 'PR-2024-001',
  //     classification_name: 'Normal Weight',
  //     weight: '70',
  //     height: '175',
  //     bmi: '22.86',
  //     prisoner: '1',
  //     bmi_classification: '2',
  //   },
  //   {
  //     id: '2',
  //     prisoner_name: 'Jane Smith',
  //     prisoner_number: 'PR-2024-002',
  //     classification_name: 'Underweight',
  //     weight: '48',
  //     height: '165',
  //     bmi: '17.63',
  //     prisoner: '2',
  //     bmi_classification: '1',
  //   },
  //   {
  //     id: '3',
  //     prisoner_name: 'Michael Johnson',
  //     prisoner_number: 'PR-2024-003',
  //     classification_name: 'Overweight',
  //     weight: '85',
  //     height: '170',
  //     bmi: '29.41',
  //     prisoner: '3',
  //     bmi_classification: '3',
  //   },
  //   {
  //     id: '4',
  //     prisoner_name: 'Emily Davis',
  //     prisoner_number: 'PR-2024-004',
  //     classification_name: 'Normal Weight',
  //     weight: '62',
  //     height: '168',
  //     bmi: '21.97',
  //     prisoner: '4',
  //     bmi_classification: '2',
  //   },
  //   {
  //     id: '5',
  //     prisoner_name: 'Robert Lee',
  //     prisoner_number: 'PR-2024-005',
  //     classification_name: 'Obese Class I',
  //     weight: '95',
  //     height: '178',
  //     bmi: '29.98',
  //     prisoner: '5',
  //     bmi_classification: '4',
  //   },
  //   {
  //     id: '6',
  //     prisoner_name: 'David Wilson',
  //     prisoner_number: 'PR-2024-006',
  //     classification_name: 'Normal Weight',
  //     weight: '75',
  //     height: '180',
  //     bmi: '23.15',
  //     prisoner: '6',
  //     bmi_classification: '2',
  //   },
  //   {
  //     id: '7',
  //     prisoner_name: 'Sarah Martinez',
  //     prisoner_number: 'PR-2024-007',
  //     classification_name: 'Underweight',
  //     weight: '52',
  //     height: '172',
  //     bmi: '17.58',
  //     prisoner: '7',
  //     bmi_classification: '1',
  //   },
  //   {
  //     id: '8',
  //     prisoner_name: 'Thomas White',
  //     prisoner_number: 'PR-2024-008',
  //     classification_name: 'Obese Class II',
  //     weight: '110',
  //     height: '175',
  //     bmi: '35.92',
  //     prisoner: '8',
  //     bmi_classification: '5',
  //   },
  //   {
  //     id: '9',
  //     prisoner_name: 'Lisa Anderson',
  //     prisoner_number: 'PR-2024-009',
  //     classification_name: 'Normal Weight',
  //     weight: '58',
  //     height: '160',
  //     bmi: '22.66',
  //     prisoner: '9',
  //     bmi_classification: '2',
  //   },
  //   {
  //     id: '10',
  //     prisoner_name: 'James Taylor',
  //     prisoner_number: 'PR-2024-010',
  //     classification_name: 'Overweight',
  //     weight: '88',
  //     height: '182',
  //     bmi: '26.58',
  //     prisoner: '10',
  //     bmi_classification: '3',
  //   },
  // ];

  // useEffect(() => {
  //   loadBmiRecords();
  // }, [refreshTrigger, prisonerId]);

  useEffect(() => {
    filterRecords();
  }, [bmiRecords, searchTerm, classificationFilter, bmiRangeFilter]);

  // const loadBmiRecords = () => {
  //   setLoading(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     let data = mockBmiRecords;
  //     // Filter by prisonerId if provided
  //     if (prisonerId) {
  //       data = data.filter((record) => record.prisoner === prisonerId);
  //     }
  //     setBmiRecords(data);
  //     setLoading(false);
  //   }, 500);
  // };

  const filterRecords = () => {
    let filtered = [...bmiRecords];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(term) ||
          record.prisoner_number.toLowerCase().includes(term) ||
          record.classification_name.toLowerCase().includes(term)
      );
    }

    // Classification filter
    if (classificationFilter !== 'all') {
      filtered = filtered.filter((record) => record.classification_name === classificationFilter);
    }

    // BMI range filter
    if (bmiRangeFilter !== 'all') {
      filtered = filtered.filter((record) => {
        const bmi = parseFloat(record.bmi);
        switch (bmiRangeFilter) {
          case 'underweight':
            return bmi < 18.5;
          case 'normal':
            return bmi >= 18.5 && bmi < 25;
          case 'overweight':
            return bmi >= 25 && bmi < 30;
          case 'obese':
            return bmi >= 30;
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const getBMIBadge = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <TrendingDown className="h-3 w-3 mr-1" />
          {bmi}
        </Badge>
      );
    }
    if (bmiValue < 25) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <Minus className="h-3 w-3 mr-1" />
          {bmi}
        </Badge>
      );
    }
    if (bmiValue < 30) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          {bmi}
        </Badge>
      );
    }
    if (bmiValue < 35) {
      return (
        <Badge className="bg-orange-100 text-orange-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          {bmi}
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800">
        <TrendingUp className="h-3 w-3 mr-1" />
        {bmi}
      </Badge>
    );
  };

  const getClassificationBadge = (classification: string) => {
    const badgeStyles: Record<string, string> = {
      Underweight: 'bg-blue-100 text-blue-800',
      'Normal Weight': 'bg-green-100 text-green-800',
      Overweight: 'bg-yellow-100 text-yellow-800',
      'Obese Class I': 'bg-orange-100 text-orange-800',
      'Obese Class II': 'bg-red-100 text-red-800',
      'Obese Class III': 'bg-red-200 text-red-900',
    };

    return (
      <Badge variant="outline" className={badgeStyles[classification] || 'bg-gray-100 text-gray-800'}>
        {classification}
      </Badge>
    );
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      // setBmiRecords((prev) => prev.filter((record) => record.id !== recordToDelete));
      // toast.success('BMI record deleted successfully');
      // setDeleteDialogOpen(false);
      // setRecordToDelete(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Calculate statistics
  const stats = {
    total: filteredRecords.length,
    underweight: filteredRecords.filter((r) => parseFloat(r.bmi) < 18.5).length,
    normal: filteredRecords.filter((r) => parseFloat(r.bmi) >= 18.5 && parseFloat(r.bmi) < 25)
      .length,
    overweight: filteredRecords.filter((r) => parseFloat(r.bmi) >= 25 && parseFloat(r.bmi) < 30)
      .length,
    obese: filteredRecords.filter((r) => parseFloat(r.bmi) >= 30).length,
  };

  return (
    <div className="w-full space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total Records</div>
            <div className="text-2xl font-bold" style={{ color: '#650000' }}>
              {stats.total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Underweight</div>
            <div className="text-2xl font-bold text-blue-600">{stats.underweight}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Normal</div>
            <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Overweight</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.overweight}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Obese</div>
            <div className="text-2xl font-bold text-red-600">{stats.obese}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Classification Filter */}
            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Classifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {
                  classifications.map(item => (
                      <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            {/* BMI Range Filter */}
            <Select value={bmiRangeFilter} onValueChange={setBmiRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All BMI Ranges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All BMI Ranges</SelectItem>
                <SelectItem value="underweight">Underweight (&lt; 18.5)</SelectItem>
                <SelectItem value="normal">Normal (18.5 - 24.9)</SelectItem>
                <SelectItem value="overweight">Overweight (25 - 29.9)</SelectItem>
                <SelectItem value="obese">Obese (≥ 30)</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm || classificationFilter !== 'all' || bmiRangeFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setClassificationFilter('all');
                  setBmiRangeFilter('all');
                }}
                className="lg:col-span-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of{' '}
          {filteredRecords.length} BMI records
        </div>
      </div>

      {/* Table */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Prisoner Number</TableHead>
                  <TableHead className="text-white font-bold">Weight (kg)</TableHead>
                  <TableHead className="text-white font-bold">Height (cm)</TableHead>
                  <TableHead className="text-white font-bold">BMI</TableHead>
                  <TableHead className="text-white font-bold">Classification</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading BMI records...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No BMI records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell className="font-mono text-sm">{record.prisoner_number}</TableCell>
                      <TableCell>{record.weight}</TableCell>
                      <TableCell>{record.height}</TableCell>
                      <TableCell>{getBMIBadge(record.bmi)}</TableCell>
                      <TableCell>{getClassificationBadge(record.classification_name)}</TableCell>
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

      {/* Pagination */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the BMI record from the
              system.
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

export default BMIList;
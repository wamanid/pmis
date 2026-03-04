import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
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
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Welfare {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  literacy_level_name: string;
  education_level_name: string;
  religion_name: string;
  tread_qualification_name: string;
  classification_name: string;
  officer_name: string;
  reception_date: string;
  reception_place: string;
  physical_mental_state: string;
  prisoner_history: string;
  note_from_previous_record: string;
  board_recommendation: string;
  income_details: string;
  own_land_property: boolean;
  consider_investigation: boolean;
  has_salary_debt: boolean;
  has_property_debt: boolean;
  has_loan: boolean;
  further_details: string;
  date_captured: string;
  prisoner: string;
  literacy_level: string;
  education_level: string;
  religion: string;
  tread_qualification: string;
  recommended_classification: string;
  officer_in_charge: number;
}

interface WelfareListProps {
  onView: (welfare: Welfare) => void;
  onEdit: (welfare: Welfare) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  prisonerId?: string;
}

const WelfareList: React.FC<WelfareListProps> = ({
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
  prisonerId,
}) => {
  const [welfareRecords, setWelfareRecords] = useState<Welfare[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Welfare[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Mock data
  const mockWelfareRecords: Welfare[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      literacy_level_name: 'Fully Literate',
      education_level_name: 'Secondary Education',
      religion_name: 'Christianity',
      tread_qualification_name: 'Carpentry',
      classification_name: 'Class A - Low Risk',
      officer_name: 'Officer David Wilson',
      reception_date: '2024-01-15',
      reception_place: 'Kampala Central Prison',
      physical_mental_state: 'Good physical health, stable mental state',
      prisoner_history: 'First-time offender, cooperative behavior',
      note_from_previous_record: 'No previous records',
      board_recommendation: 'Suitable for vocational training programs',
      income_details: 'Monthly income from family business: UGX 500,000',
      own_land_property: true,
      consider_investigation: false,
      has_salary_debt: false,
      has_property_debt: false,
      has_loan: true,
      further_details: 'Has family support and stable background',
      date_captured: '2024-01-15T10:00:00Z',
      prisoner: '1',
      literacy_level: '4',
      education_level: '3',
      religion: '1',
      tread_qualification: '1',
      recommended_classification: '1',
      officer_in_charge: 1,
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      literacy_level_name: 'Basic Literacy',
      education_level_name: 'Primary Education',
      religion_name: 'Islam',
      tread_qualification_name: 'Tailoring',
      classification_name: 'Class B - Medium Risk',
      officer_name: 'Officer Sarah Brown',
      reception_date: '2024-02-20',
      reception_place: 'Jinja Prison',
      physical_mental_state: 'Minor health issues, requires monitoring',
      prisoner_history: 'Previous conviction, needs rehabilitation support',
      note_from_previous_record: 'Previously served 2 years',
      board_recommendation: 'Recommend psychological counseling and skills training',
      income_details: 'No stable income source',
      own_land_property: false,
      consider_investigation: true,
      has_salary_debt: true,
      has_property_debt: false,
      has_loan: false,
      further_details: 'Limited family support, needs welfare assistance',
      date_captured: '2024-02-20T11:30:00Z',
      prisoner: '2',
      literacy_level: '2',
      education_level: '2',
      religion: '2',
      tread_qualification: '3',
      recommended_classification: '2',
      officer_in_charge: 2,
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      literacy_level_name: 'Cannot Read or Write',
      education_level_name: 'No Formal Education',
      religion_name: 'Christianity',
      tread_qualification_name: 'Agriculture',
      classification_name: 'Class C - High Risk',
      officer_name: 'Officer James Taylor',
      reception_date: '2024-03-10',
      reception_place: 'Mbarara Prison',
      physical_mental_state: 'Aggressive behavior, requires close supervision',
      prisoner_history: 'Multiple convictions, violent offenses',
      note_from_previous_record: 'History of disciplinary issues',
      board_recommendation: 'High security classification, intensive rehabilitation needed',
      income_details: 'No documented income',
      own_land_property: false,
      consider_investigation: true,
      has_salary_debt: false,
      has_property_debt: true,
      has_loan: false,
      further_details: 'High risk prisoner, needs constant monitoring',
      date_captured: '2024-03-10T09:15:00Z',
      prisoner: '3',
      literacy_level: '1',
      education_level: '1',
      religion: '1',
      tread_qualification: '5',
      recommended_classification: '3',
      officer_in_charge: 3,
    },
  ];

  useEffect(() => {
    loadWelfareRecords();
  }, [refreshTrigger, prisonerId]);

  useEffect(() => {
    filterRecords();
  }, [welfareRecords, searchTerm, classificationFilter, dateFromFilter, dateToFilter]);

  const loadWelfareRecords = () => {
    setLoading(true);
    setTimeout(() => {
      let data = mockWelfareRecords;
      if (prisonerId) {
        data = data.filter((record) => record.prisoner === prisonerId);
      }
      setWelfareRecords(data);
      setLoading(false);
    }, 500);
  };

  const filterRecords = () => {
    let filtered = [...welfareRecords];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(term) ||
          record.prisoner_number.toLowerCase().includes(term) ||
          record.reception_place.toLowerCase().includes(term) ||
          record.literacy_level_name.toLowerCase().includes(term) ||
          record.education_level_name.toLowerCase().includes(term)
      );
    }

    if (classificationFilter !== 'all') {
      filtered = filtered.filter((record) => record.classification_name === classificationFilter);
    }

    if (dateFromFilter) {
      filtered = filtered.filter((record) => record.reception_date >= dateFromFilter);
    }
    if (dateToFilter) {
      filtered = filtered.filter((record) => record.reception_date <= dateToFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const getClassificationBadge = (classification: string) => {
    const badgeStyles: Record<string, string> = {
      'Class A - Low Risk': 'bg-green-100 text-green-800',
      'Class B - Medium Risk': 'bg-yellow-100 text-yellow-800',
      'Class C - High Risk': 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={badgeStyles[classification] || 'bg-gray-100 text-gray-800'}>
        {classification}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setWelfareRecords((prev) => prev.filter((record) => record.id !== recordToDelete));
      toast.success('Welfare record deleted successfully');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const uniqueClassifications = Array.from(new Set(welfareRecords.map((r) => r.classification_name)));

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner, reception place, education..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={classificationFilter} onValueChange={setClassificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Classifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                {uniqueClassifications.map((classification) => (
                  <SelectItem key={classification} value={classification}>
                    {classification}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />

            {(searchTerm || classificationFilter !== 'all' || dateFromFilter || dateToFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setClassificationFilter('all');
                  setDateFromFilter('');
                  setDateToFilter('');
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
          {filteredRecords.length} welfare records
        </div>
      </div>

      {/* Table */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner</TableHead>
                  <TableHead className="text-white font-bold">Classification</TableHead>
                  <TableHead className="text-white font-bold">Reception Date</TableHead>
                  <TableHead className="text-white font-bold">Reception Place</TableHead>
                  <TableHead className="text-white font-bold">Education</TableHead>
                  <TableHead className="text-white font-bold">Trade</TableHead>
                  <TableHead className="text-white font-bold">Property</TableHead>
                  <TableHead className="text-white font-bold">Officer</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Loading welfare records...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No welfare records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div>{record.prisoner_name}</div>
                          <div className="text-sm text-gray-500">{record.prisoner_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getClassificationBadge(record.classification_name)}</TableCell>
                      <TableCell className="text-sm">{formatDate(record.reception_date)}</TableCell>
                      <TableCell className="text-sm">{record.reception_place}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.education_level_name}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{record.tread_qualification_name}</TableCell>
                      <TableCell>
                        {record.own_land_property ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{record.officer_name}</TableCell>
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
              This action cannot be undone. This will permanently delete the welfare record from the system.
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

export default WelfareList;

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
  FileText,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CaseBook {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  check_type_name: string;
  blood_group_name: string;
  present_complaint: string;
  history: string;
  grade: string;
  referral: string;
  doctors_name: string;
  mental_case: boolean;
  presentation_of_patient: string;
  notes: string;
  edoctor_video_link: string;
  prisoner: string;
  check_type: string;
  bmi: string;
  blood_group: string;
}

interface CaseBookListProps {
  onView: (caseBook: CaseBook) => void;
  onEdit: (caseBook: CaseBook) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  prisonerId?: string;
}

const CaseBookList: React.FC<CaseBookListProps> = ({
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
  prisonerId,
}) => {
  const [caseBooks, setCaseBooks] = useState<CaseBook[]>([]);
  const [filteredCaseBooks, setFilteredCaseBooks] = useState<CaseBook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkTypeFilter, setCheckTypeFilter] = useState('all');
  const [mentalCaseFilter, setMentalCaseFilter] = useState('all');
  const [presentationFilter, setPresentationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseBookToDelete, setCaseBookToDelete] = useState<string | null>(null);

  // Mock data
  const mockCaseBooks: CaseBook[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      check_type_name: 'General Check-up',
      blood_group_name: 'A+',
      present_complaint: 'Headache and fever for 3 days',
      history: 'No previous chronic conditions',
      grade: 'Moderate',
      referral: 'Referred to specialist for further evaluation',
      doctors_name: 'Dr. Sarah Johnson',
      mental_case: false,
      presentation_of_patient: 'Walking',
      notes: 'Patient responding well to treatment',
      edoctor_video_link: 'https://example.com/video1',
      prisoner: '1',
      check_type: '1',
      bmi: '1',
      blood_group: '1',
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      check_type_name: 'Emergency',
      blood_group_name: 'O+',
      present_complaint: 'Severe chest pain and breathing difficulty',
      history: 'History of hypertension',
      grade: 'Severe',
      referral: 'Immediate hospital transfer required',
      doctors_name: 'Dr. Michael Chen',
      mental_case: false,
      presentation_of_patient: 'Stretcher',
      notes: 'Emergency case - transferred to central hospital',
      edoctor_video_link: '',
      prisoner: '2',
      check_type: '2',
      bmi: '2',
      blood_group: '7',
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      check_type_name: 'Follow-up',
      blood_group_name: 'B+',
      present_complaint: 'Follow-up for previous injury',
      history: 'Fractured arm treated 2 weeks ago',
      grade: 'Mild',
      referral: 'Continue physiotherapy',
      doctors_name: 'Dr. Emily Williams',
      mental_case: false,
      presentation_of_patient: 'Walking',
      notes: 'Recovery progressing as expected',
      edoctor_video_link: 'https://example.com/video3',
      prisoner: '3',
      check_type: '3',
      bmi: '3',
      blood_group: '3',
    },
    {
      id: '4',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR-2024-004',
      check_type_name: 'Specialist Consultation',
      blood_group_name: 'AB+',
      present_complaint: 'Anxiety and sleep disturbances',
      history: 'Previous diagnosis of depression',
      grade: 'Moderate',
      referral: 'Psychiatric evaluation recommended',
      doctors_name: 'Dr. Robert Lee',
      mental_case: true,
      presentation_of_patient: 'Walking',
      notes: 'Patient requires counseling sessions',
      edoctor_video_link: '',
      prisoner: '4',
      check_type: '5',
      bmi: '4',
      blood_group: '5',
    },
    {
      id: '5',
      prisoner_name: 'Robert Lee',
      prisoner_number: 'PR-2024-005',
      check_type_name: 'Routine Examination',
      blood_group_name: 'O-',
      present_complaint: 'Routine health check',
      history: 'No significant medical history',
      grade: 'Normal',
      referral: 'None required',
      doctors_name: 'Dr. Patricia Brown',
      mental_case: false,
      presentation_of_patient: 'Walking',
      notes: 'All vital signs normal',
      edoctor_video_link: 'https://example.com/video5',
      prisoner: '5',
      check_type: '4',
      bmi: '2',
      blood_group: '8',
    },
    {
      id: '6',
      prisoner_name: 'David Wilson',
      prisoner_number: 'PR-2024-006',
      check_type_name: 'Emergency',
      blood_group_name: 'A-',
      present_complaint: 'Accident injury - leg laceration',
      history: 'No allergies',
      grade: 'Moderate',
      referral: 'Wound care and tetanus shot',
      doctors_name: 'Dr. Lisa Anderson',
      mental_case: false,
      presentation_of_patient: 'Wheelchair',
      notes: 'Wound cleaned and stitched',
      edoctor_video_link: '',
      prisoner: '6',
      check_type: '2',
      bmi: '1',
      blood_group: '2',
    },
    {
      id: '7',
      prisoner_name: 'Sarah Martinez',
      prisoner_number: 'PR-2024-007',
      check_type_name: 'Specialist Consultation',
      blood_group_name: 'B-',
      present_complaint: 'Chronic back pain',
      history: 'Old spinal injury',
      grade: 'Moderate',
      referral: 'Orthopedic consultation',
      doctors_name: 'Dr. James Taylor',
      mental_case: false,
      presentation_of_patient: 'Assisted',
      notes: 'Pain management prescribed',
      edoctor_video_link: 'https://example.com/video7',
      prisoner: '7',
      check_type: '5',
      bmi: '3',
      blood_group: '4',
    },
    {
      id: '8',
      prisoner_name: 'Thomas White',
      prisoner_number: 'PR-2024-008',
      check_type_name: 'General Check-up',
      blood_group_name: 'AB-',
      present_complaint: 'Persistent cough and cold',
      history: 'Seasonal allergies',
      grade: 'Mild',
      referral: 'None',
      doctors_name: 'Dr. Jennifer Garcia',
      mental_case: false,
      presentation_of_patient: 'Walking',
      notes: 'Prescribed cough syrup and rest',
      edoctor_video_link: '',
      prisoner: '8',
      check_type: '1',
      bmi: '2',
      blood_group: '6',
    },
  ];

  useEffect(() => {
    loadCaseBooks();
  }, [refreshTrigger, prisonerId]);

  useEffect(() => {
    filterCaseBooks();
  }, [caseBooks, searchTerm, checkTypeFilter, mentalCaseFilter, presentationFilter]);

  const loadCaseBooks = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let data = mockCaseBooks;
      // Filter by prisonerId if provided
      if (prisonerId) {
        data = data.filter((caseBook) => caseBook.prisoner === prisonerId);
      }
      setCaseBooks(data);
      setLoading(false);
    }, 500);
  };

  const filterCaseBooks = () => {
    let filtered = [...caseBooks];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (caseBook) =>
          caseBook.prisoner_name.toLowerCase().includes(term) ||
          caseBook.prisoner_number.toLowerCase().includes(term) ||
          caseBook.doctors_name.toLowerCase().includes(term) ||
          caseBook.present_complaint.toLowerCase().includes(term) ||
          caseBook.check_type_name.toLowerCase().includes(term)
      );
    }

    // Check type filter
    if (checkTypeFilter !== 'all') {
      filtered = filtered.filter((caseBook) => caseBook.check_type_name === checkTypeFilter);
    }

    // Mental case filter
    if (mentalCaseFilter !== 'all') {
      const isMentalCase = mentalCaseFilter === 'yes';
      filtered = filtered.filter((caseBook) => caseBook.mental_case === isMentalCase);
    }

    // Presentation filter
    if (presentationFilter !== 'all') {
      filtered = filtered.filter(
        (caseBook) => caseBook.presentation_of_patient === presentationFilter
      );
    }

    setFilteredCaseBooks(filtered);
    setCurrentPage(1);
  };

  const getGradeBadge = (grade: string) => {
    const badgeStyles: Record<string, string> = {
      Normal: 'bg-green-100 text-green-800',
      Mild: 'bg-blue-100 text-blue-800',
      Moderate: 'bg-yellow-100 text-yellow-800',
      Severe: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={badgeStyles[grade] || 'bg-gray-100 text-gray-800'}>
        {grade}
      </Badge>
    );
  };

  const getPresentationBadge = (presentation: string) => {
    const badgeStyles: Record<string, string> = {
      Walking: 'bg-green-100 text-green-800',
      Assisted: 'bg-blue-100 text-blue-800',
      Wheelchair: 'bg-yellow-100 text-yellow-800',
      Stretcher: 'bg-red-100 text-red-800',
    };

    return (
      <Badge variant="outline" className={badgeStyles[presentation] || 'bg-gray-100 text-gray-800'}>
        {presentation}
      </Badge>
    );
  };

  const handleDeleteClick = (id: string) => {
    setCaseBookToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (caseBookToDelete) {
      onDelete(caseBookToDelete);
      setCaseBooks((prev) => prev.filter((caseBook) => caseBook.id !== caseBookToDelete));
      toast.success('Case book entry deleted successfully');
      setDeleteDialogOpen(false);
      setCaseBookToDelete(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCaseBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCaseBooks.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner, doctor, or complaint..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Check Type Filter */}
            <Select value={checkTypeFilter} onValueChange={setCheckTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Check Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Check Types</SelectItem>
                <SelectItem value="General Check-up">General Check-up</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Routine Examination">Routine Examination</SelectItem>
                <SelectItem value="Specialist Consultation">Specialist Consultation</SelectItem>
              </SelectContent>
            </Select>

            {/* Mental Case Filter */}
            <Select value={mentalCaseFilter} onValueChange={setMentalCaseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mental Case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="yes">Mental Case</SelectItem>
                <SelectItem value="no">Non-Mental Case</SelectItem>
              </SelectContent>
            </Select>

            {/* Presentation Filter */}
            <Select value={presentationFilter} onValueChange={setPresentationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Presentations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Presentations</SelectItem>
                <SelectItem value="Walking">Walking</SelectItem>
                <SelectItem value="Assisted">Assisted</SelectItem>
                <SelectItem value="Wheelchair">Wheelchair</SelectItem>
                <SelectItem value="Stretcher">Stretcher</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm ||
              checkTypeFilter !== 'all' ||
              mentalCaseFilter !== 'all' ||
              presentationFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCheckTypeFilter('all');
                  setMentalCaseFilter('all');
                  setPresentationFilter('all');
                }}
                className="lg:col-span-5"
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
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCaseBooks.length)} of{' '}
          {filteredCaseBooks.length} case book entries
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
                  <TableHead className="text-white font-bold">Check Type</TableHead>
                  <TableHead className="text-white font-bold">Blood Group</TableHead>
                  <TableHead className="text-white font-bold">Present Complaint</TableHead>
                  <TableHead className="text-white font-bold">Grade</TableHead>
                  <TableHead className="text-white font-bold">Doctor</TableHead>
                  <TableHead className="text-white font-bold">Presentation</TableHead>
                  <TableHead className="text-white font-bold">Mental Case</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Loading case book entries...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No case book entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((caseBook) => (
                    <TableRow key={caseBook.id} className="hover:bg-gray-50">
                      <TableCell>{caseBook.prisoner_name}</TableCell>
                      <TableCell className="font-mono text-sm">{caseBook.prisoner_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{caseBook.check_type_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">
                          <Activity className="h-3 w-3 mr-1" />
                          {caseBook.blood_group_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={caseBook.present_complaint}>
                        {caseBook.present_complaint}
                      </TableCell>
                      <TableCell>{getGradeBadge(caseBook.grade)}</TableCell>
                      <TableCell>{caseBook.doctors_name}</TableCell>
                      <TableCell>{getPresentationBadge(caseBook.presentation_of_patient)}</TableCell>
                      <TableCell>
                        {caseBook.mental_case ? (
                          <CheckCircle2 className="h-5 w-5 text-orange-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(caseBook)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(caseBook)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(caseBook.id)}
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
              This action cannot be undone. This will permanently delete the case book entry from the system.
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

export default CaseBookList;

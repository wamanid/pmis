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
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import {Assessment, Programme} from "../../../../services/rehabilitation";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";

// interface EnrollmentAssessment {
//   id: string;
//   prisoner_name: string;
//   programme_name: string;
//   status_name: string;
//   start_date: string;
//   end_date: string;
//   board_members: string;
//   remarks: string;
//   enrollment: string;
//   status: string;
// }

interface EnrollmentAssessmentListProps {
  onView: (assessment: Assessment) => void;
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  enrollmentId?: string;
  prisonerId?: string;
  assessments: Assessment[]
  statuses: Unit[]
  programmes: Programme[]
}

// Mock data
// const mockAssessments: EnrollmentAssessment[] = [
//   {
//     id: '1',
//     prisoner_name: 'John Doe',
//     programme_name: 'Carpentry Skills',
//     status_name: 'Completed',
//     start_date: '2025-10-01',
//     end_date: '2025-10-15',
//     board_members: 'Dr. Smith, Ms. Johnson, Mr. Williams',
//     remarks: 'Excellent progress. Prisoner demonstrated exceptional skills and commitment.',
//     enrollment: '1',
//     status: '3',
//   },
//   {
//     id: '2',
//     prisoner_name: 'Jane Smith',
//     programme_name: 'Computer Literacy',
//     status_name: 'In Progress',
//     start_date: '2025-10-10',
//     end_date: '2025-10-25',
//     board_members: 'Prof. Brown, Dr. Davis, Ms. Taylor',
//     remarks: 'Assessment ongoing. Showing good understanding of basic concepts.',
//     enrollment: '2',
//     status: '2',
//   },
//   {
//     id: '3',
//     prisoner_name: 'Michael Johnson',
//     programme_name: 'Agriculture Training',
//     status_name: 'Pending',
//     start_date: '2025-11-01',
//     end_date: '2025-11-10',
//     board_members: 'Mr. Anderson, Dr. Wilson, Ms. Moore',
//     remarks: 'Scheduled for assessment next week.',
//     enrollment: '3',
//     status: '1',
//   },
//   {
//     id: '4',
//     prisoner_name: 'Sarah Williams',
//     programme_name: 'Tailoring',
//     status_name: 'Completed',
//     start_date: '2025-09-15',
//     end_date: '2025-09-30',
//     board_members: 'Ms. Clark, Mr. Lewis, Dr. Walker',
//     remarks: 'Successfully completed all assessment criteria. Ready for certification.',
//     enrollment: '4',
//     status: '3',
//   },
//   {
//     id: '5',
//     prisoner_name: 'David Brown',
//     programme_name: 'Electrical Skills',
//     status_name: 'On Hold',
//     start_date: '2025-10-20',
//     end_date: '2025-11-05',
//     board_members: 'Dr. Hall, Ms. Allen, Mr. Young',
//     remarks: 'Assessment on hold pending review of programme materials.',
//     enrollment: '5',
//     status: '4',
//   },
//   {
//     id: '6',
//     prisoner_name: 'Emily Davis',
//     programme_name: 'Welding and Fabrication',
//     status_name: 'In Progress',
//     start_date: '2025-10-25',
//     end_date: '2025-11-08',
//     board_members: 'Mr. King, Dr. Wright, Ms. Hill',
//     remarks: 'Practical assessment scheduled for this week.',
//     enrollment: '6',
//     status: '2',
//   },
//   {
//     id: '7',
//     prisoner_name: 'Robert Martinez',
//     programme_name: 'Auto Mechanics',
//     status_name: 'Completed',
//     start_date: '2025-09-01',
//     end_date: '2025-09-20',
//     board_members: 'Dr. Scott, Ms. Green, Mr. Baker',
//     remarks: 'Outstanding performance in both theory and practical assessments.',
//     enrollment: '7',
//     status: '3',
//   },
//   {
//     id: '8',
//     prisoner_name: 'Lisa Anderson',
//     programme_name: 'Culinary Arts',
//     status_name: 'Pending',
//     start_date: '2025-11-05',
//     end_date: '2025-11-15',
//     board_members: 'Chef Adams, Ms. Nelson, Mr. Carter',
//     remarks: 'Awaiting assessment board confirmation.',
//     enrollment: '8',
//     status: '1',
//   },
// ];

const EnrollmentAssessmentList: React.FC<EnrollmentAssessmentListProps> = ({
  assessments, statuses, programmes,
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
  enrollmentId,
  prisonerId,
}) => {
  // const [assessments, setAssessments] = useState<EnrollmentAssessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programmeFilter, setProgrammeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // useEffect(() => {
  //   loadAssessments();
  // }, [refreshTrigger, enrollmentId, prisonerId]);

  useEffect(() => {
    filterAssessments();
  }, [assessments, searchTerm, statusFilter, programmeFilter, enrollmentId, prisonerId]);

  // const loadAssessments = () => {
  //   setLoading(true);
  //   // Simulate API call
  //   setTimeout(() => {
  //     let data = mockAssessments;
  //     // Filter by enrollmentId if provided
  //     if (enrollmentId) {
  //       data = data.filter((a) => a.enrollment === enrollmentId);
  //     }
  //     // Filter by prisonerId if provided (mock - in real API would filter by prisoner)
  //     // For now just showing all assessments when no enrollmentId
  //     setAssessments(data);
  //     setLoading(false);
  //   }, 500);
  // };

  const filterAssessments = () => {
    let filtered = [...assessments];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (assessment) =>
          assessment.prisoner_name.toLowerCase().includes(term) ||
          assessment.programme_name.toLowerCase().includes(term) ||
          assessment.board_members.toLowerCase().includes(term) ||
          assessment.status_name.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((assessment) => assessment.status_name === statusFilter);
    }

    // Programme filter
    if (programmeFilter !== 'all') {
      filtered = filtered.filter((assessment) => assessment.programme_name === programmeFilter);
    }

    setFilteredAssessments(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'Completed': 'bg-green-100 text-green-800 border-green-300',
      'On Hold': 'bg-orange-100 text-orange-800 border-orange-300',
      'Cancelled': 'bg-red-100 text-red-800 border-red-300',
    };

    return (
      <Badge variant="outline" className={statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssessments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);

  // const uniqueStatuses = Array.from(new Set(assessments.map((a) => a.status_name)));
  // const uniqueProgrammes = Array.from(new Set(assessments.map((a) => a.programme_name)));

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner, programme, board members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.name}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Programme Filter */}
            <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Programmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programmes</SelectItem>
                {programmes.map((programme) => (
                  <SelectItem key={programme.id} value={programme.programme_name}>
                    {programme.programme_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssessments.length)} of{' '}
          {filteredAssessments.length} assessments
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
                  <TableHead className="text-white font-bold">Programme</TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-white font-bold">Start Date</TableHead>
                  <TableHead className="text-white font-bold">End Date</TableHead>
                  <TableHead className="text-white font-bold">Board Members</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading assessments...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No assessments found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>{assessment.prisoner_name}</TableCell>
                      <TableCell>{assessment.programme_name}</TableCell>
                      <TableCell>{getStatusBadge(assessment.status_name)}</TableCell>
                      <TableCell className="text-sm">{formatDate(assessment.start_date)}</TableCell>
                      <TableCell className="text-sm">{formatDate(assessment.end_date)}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{assessment.board_members}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(assessment)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(assessment)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDelete(assessment.id)}
                              className="text-red-600"
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
    </div>
  );
};

export default EnrollmentAssessmentList;

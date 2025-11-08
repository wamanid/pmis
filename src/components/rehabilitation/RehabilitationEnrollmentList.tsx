import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Eye, 
  Pencil, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  User
} from 'lucide-react';

interface RehabilitationEnrollment {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  programme_name: string;
  programme_stage_name: string;
  sponsor_name: string;
  responsible_officer_name: string;
  progress_status_name: string;
  prisoner_opinion: string;
  date_of_enrollment: string;
  start_date: string;
  end_date: string;
  certificate_awarded: boolean;
  certification_document: string;
  comment: string;
  prisoner: string;
  programme: string;
  programme_stage: string;
  rehabilitation_sponsor: string;
  responsible_officer: number;
  progress_status: string;
}

interface RehabilitationEnrollmentListProps {
  onView: (enrollment: RehabilitationEnrollment) => void;
  onEdit: (enrollment: RehabilitationEnrollment) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
}

const RehabilitationEnrollmentList: React.FC<RehabilitationEnrollmentListProps> = ({
  onView,
  onEdit,
  onDelete,
  refreshTrigger
}) => {
  const [enrollments, setEnrollments] = useState<RehabilitationEnrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<RehabilitationEnrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [certificateFilter, setCertificateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Mock data
  const mockEnrollments: RehabilitationEnrollment[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      programme_name: 'Vocational Training',
      programme_stage_name: 'Basic Level',
      sponsor_name: 'NGO Hope Foundation',
      responsible_officer_name: 'David Wilson',
      progress_status_name: 'In Progress',
      prisoner_opinion: 'Very helpful programme',
      date_of_enrollment: '2024-01-15',
      start_date: '2024-01-20',
      end_date: '2024-06-20',
      certificate_awarded: false,
      certification_document: '',
      comment: 'Showing good progress',
      prisoner: '1',
      programme: '1',
      programme_stage: '2',
      rehabilitation_sponsor: '1',
      responsible_officer: 1,
      progress_status: '2'
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      programme_name: 'Education Programme',
      programme_stage_name: 'Advanced Level',
      sponsor_name: 'Community Outreach',
      responsible_officer_name: 'Sarah Brown',
      progress_status_name: 'Completed',
      prisoner_opinion: 'Excellent learning experience',
      date_of_enrollment: '2023-09-10',
      start_date: '2023-09-15',
      end_date: '2024-03-15',
      certificate_awarded: true,
      certification_document: 'CERT-2024-001',
      comment: 'Successfully completed all modules',
      prisoner: '2',
      programme: '2',
      programme_stage: '4',
      rehabilitation_sponsor: '2',
      responsible_officer: 2,
      progress_status: '3'
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      programme_name: 'Counseling Services',
      programme_stage_name: 'Initial Assessment',
      sponsor_name: 'Faith-Based Organization',
      responsible_officer_name: 'James Taylor',
      progress_status_name: 'Enrolled',
      prisoner_opinion: 'Looking forward to the sessions',
      date_of_enrollment: '2024-10-01',
      start_date: '2024-10-05',
      end_date: '2024-12-05',
      certificate_awarded: false,
      certification_document: '',
      comment: 'Just started',
      prisoner: '3',
      programme: '3',
      programme_stage: '5',
      rehabilitation_sponsor: '3',
      responsible_officer: 3,
      progress_status: '1'
    },
    {
      id: '4',
      prisoner_name: 'Robert Lee',
      prisoner_number: 'PR-2024-004',
      programme_name: 'Substance Abuse Recovery',
      programme_stage_name: 'Intermediate Level',
      sponsor_name: 'Government Programme',
      responsible_officer_name: 'David Wilson',
      progress_status_name: 'Suspended',
      prisoner_opinion: 'Need more support',
      date_of_enrollment: '2024-03-20',
      start_date: '2024-03-25',
      end_date: '2024-09-25',
      certificate_awarded: false,
      certification_document: '',
      comment: 'Temporarily suspended due to health issues',
      prisoner: '4',
      programme: '4',
      programme_stage: '3',
      rehabilitation_sponsor: '4',
      responsible_officer: 1,
      progress_status: '4'
    },
    {
      id: '5',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR-2024-005',
      programme_name: 'Vocational Training',
      programme_stage_name: 'Intermediate Level',
      sponsor_name: 'NGO Hope Foundation',
      responsible_officer_name: 'Sarah Brown',
      progress_status_name: 'In Progress',
      prisoner_opinion: 'Skills are very practical',
      date_of_enrollment: '2024-02-10',
      start_date: '2024-02-15',
      end_date: '2024-08-15',
      certificate_awarded: false,
      certification_document: '',
      comment: 'Excellent hands-on skills',
      prisoner: '5',
      programme: '1',
      programme_stage: '2',
      rehabilitation_sponsor: '1',
      responsible_officer: 2,
      progress_status: '2'
    }
  ];

  useEffect(() => {
    loadEnrollments();
  }, [refreshTrigger]);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, searchTerm, programmeFilter, statusFilter, certificateFilter]);

  const loadEnrollments = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEnrollments(mockEnrollments);
      setLoading(false);
    }, 500);
  };

  const filterEnrollments = () => {
    let filtered = [...enrollments];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (enrollment) =>
          enrollment.prisoner_name.toLowerCase().includes(term) ||
          enrollment.prisoner_number.toLowerCase().includes(term) ||
          enrollment.programme_name.toLowerCase().includes(term) ||
          enrollment.sponsor_name.toLowerCase().includes(term) ||
          enrollment.responsible_officer_name.toLowerCase().includes(term)
      );
    }

    // Programme filter
    if (programmeFilter !== 'all') {
      filtered = filtered.filter((enrollment) => enrollment.programme_name === programmeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((enrollment) => enrollment.progress_status_name === statusFilter);
    }

    // Certificate filter
    if (certificateFilter !== 'all') {
      const hasAwarded = certificateFilter === 'awarded';
      filtered = filtered.filter((enrollment) => enrollment.certificate_awarded === hasAwarded);
    }

    setFilteredEnrollments(filtered);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      'Enrolled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Suspended': 'bg-orange-100 text-orange-800',
      'Discontinued': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusStyles[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEnrollments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);

  const uniqueProgrammes = Array.from(new Set(enrollments.map(e => e.programme_name)));
  const uniqueStatuses = Array.from(new Set(enrollments.map(e => e.progress_status_name)));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner, programme, sponsor, officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Programme Filter */}
            <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Programmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programmes</SelectItem>
                {uniqueProgrammes.map((programme) => (
                  <SelectItem key={programme} value={programme}>
                    {programme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Certificate Filter */}
            <Select value={certificateFilter} onValueChange={setCertificateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Certificates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Certificates</SelectItem>
                <SelectItem value="awarded">Certificate Awarded</SelectItem>
                <SelectItem value="not-awarded">No Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEnrollments.length)} of{' '}
          {filteredEnrollments.length} enrollments
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white">Prisoner</TableHead>
                  <TableHead className="text-white">Programme</TableHead>
                  <TableHead className="text-white">Stage</TableHead>
                  <TableHead className="text-white">Sponsor</TableHead>
                  <TableHead className="text-white">Officer</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Enrollment Date</TableHead>
                  <TableHead className="text-white">Certificate</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Loading enrollments...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div>
                          <div>{enrollment.prisoner_name}</div>
                          <div className="text-sm text-gray-500">{enrollment.prisoner_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{enrollment.programme_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{enrollment.programme_stage_name}</Badge>
                      </TableCell>
                      <TableCell>{enrollment.sponsor_name}</TableCell>
                      <TableCell>{enrollment.responsible_officer_name}</TableCell>
                      <TableCell>{getStatusBadge(enrollment.progress_status_name)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(enrollment.date_of_enrollment)}
                      </TableCell>
                      <TableCell>
                        {enrollment.certificate_awarded ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Award className="h-3 w-3 mr-1" />
                            Awarded
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Awarded</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(enrollment)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(enrollment)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(enrollment.id)}
                            title="Delete"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

export default RehabilitationEnrollmentList;

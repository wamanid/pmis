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
  Mail,
  MoreVertical,
  Download,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ELetter {
  id: string;
  prisoner_name: string;
  letter_type_name: string;
  prisoner_number: string;
  censored_by_name: string;
  welfare_officer_name: string;
  delivered_by_name: string;
  handled_by_name: string;
  relation_name: string;
  subject: string;
  letter_tracking_number: string;
  letter_date: string;
  letter_content: string;
  letter_document?: string;
  recipient_email: string;
  sender_email: string;
  sender_name: string;
  recipient_name: string;
  comment: string;
  prisoner: string;
  letter_type: string;
  censored_by: number;
  welfare_officer: number;
  relation_to_prisoner: string;
  delivered_by: number;
  handled_by: number;
}

interface ELetterListProps {
  onView: (eLetter: ELetter) => void;
  onEdit: (eLetter: ELetter) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
  prisonerId?: string;
}

const ELetterList: React.FC<ELetterListProps> = ({
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
  prisonerId,
}) => {
  const [eLetters, setELetters] = useState<ELetter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<ELetter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [letterTypeFilter, setLetterTypeFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<string | null>(null);

  // Mock data
  const mockELetters: ELetter[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      letter_type_name: 'Incoming Letter',
      censored_by_name: 'Officer Sarah Brown',
      welfare_officer_name: 'Officer David Wilson',
      delivered_by_name: 'Officer James Taylor',
      handled_by_name: 'Officer Sarah Brown',
      relation_name: 'Parent',
      subject: 'Family Update and Well Wishes',
      letter_tracking_number: 'ELT-2025-0001',
      letter_date: '2025-11-05',
      letter_content: 'Dear Son, we hope this letter finds you well. The family is doing fine and we miss you dearly...',
      letter_document: 'letter_001.pdf',
      recipient_email: 'john.doe@prison.gov.ug',
      sender_email: 'mary.doe@email.com',
      sender_name: 'Mary Doe',
      recipient_name: 'John Doe',
      comment: 'Letter checked and approved for delivery',
      prisoner: '1',
      letter_type: '1',
      censored_by: 2,
      welfare_officer: 1,
      relation_to_prisoner: '1',
      delivered_by: 3,
      handled_by: 2,
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      letter_type_name: 'Outgoing Letter',
      censored_by_name: 'Officer David Wilson',
      welfare_officer_name: 'Officer Sarah Brown',
      delivered_by_name: 'Officer Mary Johnson',
      handled_by_name: 'Officer David Wilson',
      relation_name: 'Spouse',
      subject: 'Request for Family Visit',
      letter_tracking_number: 'ELT-2025-0002',
      letter_date: '2025-11-06',
      letter_content: 'Dear Husband, I am writing to request a visit next week. Please let me know if this is possible...',
      letter_document: 'letter_002.pdf',
      recipient_email: 'husband@email.com',
      sender_email: 'jane.smith@prison.gov.ug',
      sender_name: 'Jane Smith',
      recipient_name: 'Robert Smith',
      comment: 'Approved for sending',
      prisoner: '2',
      letter_type: '2',
      censored_by: 1,
      welfare_officer: 2,
      relation_to_prisoner: '2',
      delivered_by: 4,
      handled_by: 1,
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      letter_type_name: 'Legal Document',
      censored_by_name: 'Officer James Taylor',
      welfare_officer_name: 'Officer David Wilson',
      delivered_by_name: 'Officer Sarah Brown',
      handled_by_name: 'Officer James Taylor',
      relation_name: 'Legal Representative',
      subject: 'Case Documentation and Court Updates',
      letter_tracking_number: 'ELT-2025-0003',
      letter_date: '2025-11-04',
      letter_content: 'Dear Client, this letter contains updates regarding your ongoing legal proceedings...',
      letter_document: 'legal_doc_003.pdf',
      recipient_email: 'michael.j@prison.gov.ug',
      sender_email: 'lawyer@legalfirm.com',
      sender_name: 'Attorney Williams',
      recipient_name: 'Michael Johnson',
      comment: 'Legal correspondence - expedited delivery',
      prisoner: '3',
      letter_type: '4',
      censored_by: 3,
      welfare_officer: 1,
      relation_to_prisoner: '7',
      delivered_by: 2,
      handled_by: 3,
    },
    {
      id: '4',
      prisoner_name: 'Robert Lee',
      prisoner_number: 'PR-2024-004',
      letter_type_name: 'Official Correspondence',
      censored_by_name: 'Officer Sarah Brown',
      welfare_officer_name: 'Officer James Taylor',
      delivered_by_name: 'Officer David Wilson',
      handled_by_name: 'Officer Mary Johnson',
      relation_name: '',
      subject: 'Rehabilitation Program Information',
      letter_tracking_number: 'ELT-2025-0004',
      letter_date: '2025-11-03',
      letter_content: 'This letter contains information about the new vocational training program available...',
      letter_document: 'official_004.pdf',
      recipient_email: 'robert.lee@prison.gov.ug',
      sender_email: 'admin@prison.gov.ug',
      sender_name: 'Prison Administration',
      recipient_name: 'Robert Lee',
      comment: 'Official prison communication',
      prisoner: '4',
      letter_type: '3',
      censored_by: 2,
      welfare_officer: 3,
      relation_to_prisoner: '',
      delivered_by: 1,
      handled_by: 4,
    },
    {
      id: '5',
      prisoner_name: 'Emily Davis',
      prisoner_number: 'PR-2024-005',
      letter_type_name: 'Incoming Letter',
      censored_by_name: 'Officer David Wilson',
      welfare_officer_name: 'Officer Sarah Brown',
      delivered_by_name: 'Officer James Taylor',
      handled_by_name: 'Officer David Wilson',
      relation_name: 'Child',
      subject: 'School Updates and Missing You',
      letter_tracking_number: 'ELT-2025-0005',
      letter_date: '2025-11-07',
      letter_content: 'Dear Mom, I wanted to share my school report with you. I got good grades and I miss you...',
      letter_document: '',
      recipient_email: 'emily.davis@prison.gov.ug',
      sender_email: 'tom.davis@email.com',
      sender_name: 'Tom Davis',
      recipient_name: 'Emily Davis',
      comment: 'Cleared for delivery',
      prisoner: '5',
      letter_type: '1',
      censored_by: 1,
      welfare_officer: 2,
      relation_to_prisoner: '4',
      delivered_by: 3,
      handled_by: 1,
    },
    {
      id: '6',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      letter_type_name: 'Outgoing Letter',
      censored_by_name: 'Officer James Taylor',
      welfare_officer_name: 'Officer Mary Johnson',
      delivered_by_name: 'Officer Sarah Brown',
      handled_by_name: 'Officer James Taylor',
      relation_name: 'Sibling',
      subject: 'Thank You for Support',
      letter_tracking_number: 'ELT-2025-0006',
      letter_date: '2025-11-02',
      letter_content: 'Dear Brother, thank you for your continued support during this difficult time...',
      letter_document: 'letter_006.pdf',
      recipient_email: 'brother@email.com',
      sender_email: 'john.doe@prison.gov.ug',
      sender_name: 'John Doe',
      recipient_name: 'Tom Doe',
      comment: 'Approved',
      prisoner: '1',
      letter_type: '2',
      censored_by: 3,
      welfare_officer: 4,
      relation_to_prisoner: '3',
      delivered_by: 2,
      handled_by: 3,
    },
  ];

  useEffect(() => {
    loadELetters();
  }, [refreshTrigger, prisonerId]);

  useEffect(() => {
    filterLetters();
  }, [eLetters, searchTerm, letterTypeFilter, dateFromFilter, dateToFilter]);

  const loadELetters = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let data = mockELetters;
      // Filter by prisonerId if provided
      if (prisonerId) {
        data = data.filter((letter) => letter.prisoner === prisonerId);
      }
      setELetters(data);
      setLoading(false);
    }, 500);
  };

  const filterLetters = () => {
    let filtered = [...eLetters];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (letter) =>
          letter.prisoner_name.toLowerCase().includes(term) ||
          letter.prisoner_number.toLowerCase().includes(term) ||
          letter.subject.toLowerCase().includes(term) ||
          letter.sender_name.toLowerCase().includes(term) ||
          letter.recipient_name.toLowerCase().includes(term) ||
          letter.letter_tracking_number.toLowerCase().includes(term) ||
          letter.letter_type_name.toLowerCase().includes(term)
      );
    }

    // Letter type filter
    if (letterTypeFilter !== 'all') {
      filtered = filtered.filter((letter) => letter.letter_type_name === letterTypeFilter);
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter((letter) => letter.letter_date >= dateFromFilter);
    }
    if (dateToFilter) {
      filtered = filtered.filter((letter) => letter.letter_date <= dateToFilter);
    }

    setFilteredLetters(filtered);
    setCurrentPage(1);
  };

  const getLetterTypeBadge = (letterType: string) => {
    const badgeStyles: Record<string, string> = {
      'Incoming Letter': 'bg-blue-100 text-blue-800',
      'Outgoing Letter': 'bg-green-100 text-green-800',
      'Official Correspondence': 'bg-purple-100 text-purple-800',
      'Legal Document': 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={badgeStyles[letterType] || 'bg-gray-100 text-gray-800'}>
        {letterType}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteClick = (id: string) => {
    setLetterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (letterToDelete) {
      onDelete(letterToDelete);
      setELetters((prev) => prev.filter((letter) => letter.id !== letterToDelete));
      toast.success('e-Letter deleted successfully');
      setDeleteDialogOpen(false);
      setLetterToDelete(null);
    }
  };

  const handleDownloadDocument = (document: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (document) {
      toast.success(`Downloading ${document}...`);
      // Implement actual download logic here
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLetters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLetters.length / itemsPerPage);

  const uniqueLetterTypes = Array.from(new Set(eLetters.map((l) => l.letter_type_name)));

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner, subject, tracking number, sender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Letter Type Filter */}
            <Select value={letterTypeFilter} onValueChange={setLetterTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Letter Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Letter Types</SelectItem>
                {uniqueLetterTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date From Filter */}
            <Input
              type="date"
              placeholder="From Date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />

            {/* Date To Filter */}
            <Input
              type="date"
              placeholder="To Date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />

            {/* Clear Filters */}
            {(searchTerm || letterTypeFilter !== 'all' || dateFromFilter || dateToFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setLetterTypeFilter('all');
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
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLetters.length)} of{' '}
          {filteredLetters.length} e-letters
        </div>
      </div>

      {/* Table */}
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white">Tracking #</TableHead>
                  <TableHead className="text-white">Prisoner</TableHead>
                  <TableHead className="text-white">Letter Type</TableHead>
                  <TableHead className="text-white">Subject</TableHead>
                  <TableHead className="text-white">Sender</TableHead>
                  <TableHead className="text-white">Recipient</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Document</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Loading e-letters...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No e-letters found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((letter) => (
                    <TableRow key={letter.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {letter.letter_tracking_number}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{letter.prisoner_name}</div>
                          <div className="text-sm text-gray-500">{letter.prisoner_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getLetterTypeBadge(letter.letter_type_name)}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={letter.subject}>
                          {letter.subject}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{letter.sender_name}</TableCell>
                      <TableCell className="text-sm">{letter.recipient_name}</TableCell>
                      <TableCell className="text-sm">{formatDate(letter.letter_date)}</TableCell>
                      <TableCell>
                        {letter.letter_document ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDownloadDocument(letter.letter_document!, e)}
                            className="h-8"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">No document</span>
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
                            <DropdownMenuItem onClick={() => onView(letter)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(letter)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(letter.id)}
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
              This action cannot be undone. This will permanently delete the e-letter from the system.
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

export default ELetterList;

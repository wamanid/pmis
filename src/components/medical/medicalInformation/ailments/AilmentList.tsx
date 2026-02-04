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
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Ailment {
  id: string;
  prisoner_name: string;
  ailment_name: string;
  regiment_name: string;
  remarks: string;
  supporting_document: string;
  prisoner_medical_record: string;
  ailment: string;
  regiment: string;
}

interface AilmentListProps {
  onView: (ailment: Ailment) => void;
  onEdit: (ailment: Ailment) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
}

const AilmentList: React.FC<AilmentListProps> = ({ onView, onEdit, onDelete, refreshTrigger }) => {
  const [ailments, setAilments] = useState<Ailment[]>([]);
  const [filteredAilments, setFilteredAilments] = useState<Ailment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ailmentFilter, setAilmentFilter] = useState('all');
  const [regimentFilter, setRegimentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const mockAilments: Ailment[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      ailment_name: 'Hypertension',
      regiment_name: 'Daily Medication',
      remarks: 'Monitor blood pressure daily',
      supporting_document: 'bp_report_2024.pdf',
      prisoner_medical_record: '1',
      ailment: '1',
      regiment: '1',
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      ailment_name: 'Diabetes Type 2',
      regiment_name: 'Twice Daily',
      remarks: 'Insulin required',
      supporting_document: 'diabetes_test.pdf',
      prisoner_medical_record: '2',
      ailment: '2',
      regiment: '2',
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      ailment_name: 'Asthma',
      regiment_name: 'As Needed',
      remarks: 'Inhaler available',
      supporting_document: '',
      prisoner_medical_record: '3',
      ailment: '3',
      regiment: '3',
    },
    {
      id: '4',
      prisoner_name: 'Emily Davis',
      ailment_name: 'Arthritis',
      regiment_name: 'Daily Medication',
      remarks: 'Pain management protocol',
      supporting_document: 'xray_results.pdf',
      prisoner_medical_record: '4',
      ailment: '4',
      regiment: '1',
    },
    {
      id: '5',
      prisoner_name: 'Robert Lee',
      ailment_name: 'Migraine',
      regiment_name: 'As Needed',
      remarks: 'Avoid bright lights',
      supporting_document: '',
      prisoner_medical_record: '5',
      ailment: '5',
      regiment: '3',
    },
  ];

  useEffect(() => {
    loadAilments();
  }, [refreshTrigger]);

  useEffect(() => {
    filterAilments();
  }, [ailments, searchTerm, ailmentFilter, regimentFilter]);

  const loadAilments = () => {
    setLoading(true);
    setTimeout(() => {
      setAilments(mockAilments);
      setLoading(false);
    }, 500);
  };

  const filterAilments = () => {
    let filtered = [...ailments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ailment) =>
          ailment.prisoner_name.toLowerCase().includes(term) ||
          ailment.ailment_name.toLowerCase().includes(term) ||
          ailment.remarks.toLowerCase().includes(term)
      );
    }

    if (ailmentFilter !== 'all') {
      filtered = filtered.filter((ailment) => ailment.ailment_name === ailmentFilter);
    }

    if (regimentFilter !== 'all') {
      filtered = filtered.filter((ailment) => ailment.regiment_name === regimentFilter);
    }

    setFilteredAilments(filtered);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setAilments((prev) => prev.filter((ailment) => ailment.id !== recordToDelete));
      toast.success('Ailment record deleted successfully');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAilments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAilments.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name or ailment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={ailmentFilter} onValueChange={setAilmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Ailments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ailments</SelectItem>
                <SelectItem value="Hypertension">Hypertension</SelectItem>
                <SelectItem value="Diabetes Type 2">Diabetes Type 2</SelectItem>
                <SelectItem value="Asthma">Asthma</SelectItem>
                <SelectItem value="Arthritis">Arthritis</SelectItem>
                <SelectItem value="Migraine">Migraine</SelectItem>
              </SelectContent>
            </Select>

            <Select value={regimentFilter} onValueChange={setRegimentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Regiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regiments</SelectItem>
                <SelectItem value="Daily Medication">Daily Medication</SelectItem>
                <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                <SelectItem value="As Needed">As Needed</SelectItem>
                <SelectItem value="Weekly Treatment">Weekly Treatment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAilments.length)} of{' '}
          {filteredAilments.length} ailment records
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Ailment</TableHead>
                  <TableHead className="text-white font-bold">Regiment</TableHead>
                  <TableHead className="text-white font-bold">Remarks</TableHead>
                  <TableHead className="text-white font-bold">Document</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Loading ailment records...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No ailment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((ailment) => (
                    <TableRow key={ailment.id} className="hover:bg-gray-50">
                      <TableCell>{ailment.prisoner_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {ailment.ailment_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {ailment.regiment_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{ailment.remarks || '-'}</TableCell>
                      <TableCell>
                        {ailment.supporting_document ? (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700">
                            <FileText className="h-3 w-3 mr-1" />
                            Attached
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
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
                            <DropdownMenuItem onClick={() => onView(ailment)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(ailment)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(ailment.id)}
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
              This action cannot be undone. This will permanently delete the ailment record.
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

export default AilmentList;

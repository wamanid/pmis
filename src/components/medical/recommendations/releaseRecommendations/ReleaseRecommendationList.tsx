import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
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
import { format } from 'date-fns';

interface ReleaseRecommendation {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  date_of_report: string;
  abnormal_condition: string;
  life_endangered: boolean;
  approval_status: string;
  recommendation_notes: string;
  prisoner: string;
}

interface ReleaseRecommendationListProps {
  onView: (releaseRecommendation: ReleaseRecommendation) => void;
  onEdit: (releaseRecommendation: ReleaseRecommendation) => void;
  onDelete: (id: string) => void;
  refreshTrigger?: number;
}

const ReleaseRecommendationList: React.FC<ReleaseRecommendationListProps> = ({
  onView,
  onEdit,
  onDelete,
  refreshTrigger,
}) => {
  const [recommendations, setRecommendations] = useState<ReleaseRecommendation[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ReleaseRecommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const mockRecommendations: ReleaseRecommendation[] = [
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      date_of_report: '2024-11-01',
      abnormal_condition: 'Terminal illness',
      life_endangered: true,
      approval_status: 'Pending',
      recommendation_notes: 'Urgent medical release recommended',
      prisoner: '1',
    },
  ];

  useEffect(() => {
    loadRecommendations();
  }, [refreshTrigger]);

  useEffect(() => {
    filterRecords();
  }, [recommendations, searchTerm]);

  const loadRecommendations = () => {
    setLoading(true);
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 500);
  };

  const filterRecords = () => {
    let filtered = [...recommendations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(term) ||
          record.prisoner_number.toLowerCase().includes(term)
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setRecommendations((prev) => prev.filter((record) => record.id !== recordToDelete));
      toast.success('Release recommendation deleted successfully');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by prisoner name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of{' '}
          {filteredRecords.length} release recommendations
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                  <TableHead className="text-white font-bold">Prisoner Number</TableHead>
                  <TableHead className="text-white font-bold">Date of Report</TableHead>
                  <TableHead className="text-white font-bold">Condition</TableHead>
                  <TableHead className="text-white font-bold">Critical</TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-right text-white font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Loading release recommendations...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No release recommendations found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell className="font-mono text-sm">{record.prisoner_number}</TableCell>
                      <TableCell>{format(new Date(record.date_of_report), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.abnormal_condition}</TableCell>
                      <TableCell>
                        {record.life_endangered ? (
                          <Badge className="bg-red-100 text-red-800">Yes</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">{record.approval_status}</Badge>
                      </TableCell>
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
              This action cannot be undone. This will permanently delete the release recommendation.
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

export default ReleaseRecommendationList;

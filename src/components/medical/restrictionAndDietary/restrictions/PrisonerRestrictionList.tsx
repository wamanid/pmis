import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import PrisonerRestrictionForm from './PrisonerRestrictionForm';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';

interface PrisonerRestriction {
  id: string;
  prisoner_name: string;
  restriction_type_name: string;
  restriction_category_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  restrictions_details: string;
  status: string;
  approved_by: string;
  remarks: string;
  prisoner: string;
  restriction_type: string;
  restriction_category: string;
}

interface PrisonerRestrictionListProps {
  selectedPrisonerId?: string;
}

// Mock data
const mockRestrictionRecords: PrisonerRestriction[] = [
  {
    id: '1',
    prisoner: '1',
    prisoner_name: 'John Doe',
    restriction_type: '1',
    restriction_type_name: 'Movement Restriction',
    restriction_category: '1',
    restriction_category_name: 'Security Risk',
    start_date: '2024-11-01',
    end_date: '2024-12-01',
    reason: 'Identified as potential security risk during routine assessment',
    restrictions_details: 'Limited to cell block A, no access to common areas during peak hours',
    status: 'Active',
    approved_by: 'Chief Warden James Okello',
    remarks: 'Review restriction status weekly',
  },
  {
    id: '2',
    prisoner: '2',
    prisoner_name: 'Jane Smith',
    restriction_type: '2',
    restriction_type_name: 'Communication Restriction',
    restriction_category: '5',
    restriction_category_name: 'Investigation',
    start_date: '2024-10-15',
    end_date: '2024-11-15',
    reason: 'Ongoing investigation into alleged communication with external criminal network',
    restrictions_details: 'Phone calls monitored, mail inspected, visitor list restricted',
    status: 'Active',
    approved_by: 'Director Sarah Kisakye',
    remarks: 'Investigation expected to conclude by end date',
  },
  {
    id: '3',
    prisoner: '3',
    prisoner_name: 'Michael Johnson',
    restriction_type: '4',
    restriction_type_name: 'Visitor Restriction',
    restriction_category: '3',
    restriction_category_name: 'Disciplinary Action',
    start_date: '2024-10-20',
    end_date: '2024-11-20',
    reason: 'Violation of facility rules regarding contraband',
    restrictions_details: 'No visitors for 30 days as disciplinary measure',
    status: 'Active',
    approved_by: 'Deputy Warden Patricia Mutesi',
    remarks: 'Good behavior may result in early lifting of restriction',
  },
  {
    id: '4',
    prisoner: '4',
    prisoner_name: 'Emily Davis',
    restriction_type: '5',
    restriction_type_name: 'Work Restriction',
    restriction_category: '2',
    restriction_category_name: 'Medical Reason',
    start_date: '2024-09-01',
    end_date: '2025-01-01',
    reason: 'Recent surgery, recovery period required',
    restrictions_details: 'No heavy physical labor, light duties only in supervised environment',
    status: 'Active',
    approved_by: 'Medical Officer Dr. David Makumbi',
    remarks: 'Medical review scheduled monthly',
  },
  {
    id: '5',
    prisoner: '5',
    prisoner_name: 'Robert Lee',
    restriction_type: '3',
    restriction_type_name: 'Activity Restriction',
    restriction_category: '4',
    restriction_category_name: 'Protective Custody',
    start_date: '2024-08-15',
    end_date: '',
    reason: 'Threat assessment indicates risk from other inmates',
    restrictions_details: 'Separated from general population, individual recreation time',
    status: 'Active',
    approved_by: 'Chief Warden James Okello',
    remarks: 'Ongoing protective custody, no end date specified',
  },
];

const PrisonerRestrictionList: React.FC<PrisonerRestrictionListProps> = ({ selectedPrisonerId }) => {
  const [records, setRecords] = useState<PrisonerRestriction[]>(mockRestrictionRecords);
  const [filteredRecords, setFilteredRecords] = useState<PrisonerRestriction[]>(mockRestrictionRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PrisonerRestriction | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, statusFilter, records, selectedPrisonerId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedPrisonerId) {
      filtered = filtered.filter((record) => record.prisoner === selectedPrisonerId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.restriction_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.restriction_category_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogOpen(true);
  };

  const handleView = (record: PrisonerRestriction) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: PrisonerRestriction) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: PrisonerRestriction) => {
    if (formMode === 'create') {
      const newRecord: PrisonerRestriction = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Restriction created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Restriction updated successfully');
    }
    setDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Suspended: 'bg-yellow-100 text-yellow-800',
      Expired: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by prisoner, type, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCreate}
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Restriction
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Prisoner</TableHead>
                  <TableHead>Restriction Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No restriction records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.restriction_type_name}</TableCell>
                      <TableCell>{record.restriction_category_name}</TableCell>
                      <TableCell>{new Date(record.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {record.end_date ? new Date(record.end_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.approved_by}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(record)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(record)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setRecordToDelete(record.id);
                                setShowDeleteDialog(true);
                              }}
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

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of{' '}
                {filteredRecords.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Prisoner Restriction Form</DialogTitle>
          <DialogDescription>
            Add or edit a prisoner restriction record.
          </DialogDescription>
          <PrisonerRestrictionForm
            restriction={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the restriction record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (recordToDelete) {
                  setRecords(records.filter((record) => record.id !== recordToDelete));
                  toast.success('Restriction deleted successfully');
                }
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PrisonerRestrictionList;
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Calendar } from '../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  CalendarIcon,
  TrendingUp,
  X,
  Edit2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { StageAssignForm, StageAssignment } from './StageAssignForm';

export function StageAssignList() {
  const [loading, setLoading] = useState(false);
  const [stageAssignments, setStageAssignments] = useState<StageAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<StageAssignment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [startDateFrom, setStartDateFrom] = useState<Date | undefined>(undefined);
  const [startDateTo, setStartDateTo] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<StageAssignment | null>(
    null
  );

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<StageAssignment | null>(
    null
  );

  // Multi-select state
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Batch edit dialog state
  const [batchEditDialogOpen, setBatchEditDialogOpen] = useState(false);
  const [batchEditStage, setBatchEditStage] = useState('');
  const [batchEditStartDate, setBatchEditStartDate] = useState<Date | undefined>(undefined);
  const [batchEditEndDate, setBatchEditEndDate] = useState<Date | undefined>(undefined);
  const [batchEditRemark, setBatchEditRemark] = useState('');

  // Auto Promote dialog state
  const [autoPromoteDialogOpen, setAutoPromoteDialogOpen] = useState(false);
  const [autoPromoteStartDate, setAutoPromoteStartDate] = useState<Date | undefined>(undefined);
  const [autoPromoteEndDate, setAutoPromoteEndDate] = useState<Date | undefined>(undefined);
  const [autoPromoteRemark, setAutoPromoteRemark] = useState('');

  // Auto Demote dialog state
  const [autoDemoteDialogOpen, setAutoDemoteDialogOpen] = useState(false);
  const [autoDemoteStartDate, setAutoDemoteStartDate] = useState<Date | undefined>(undefined);
  const [autoDemoteEndDate, setAutoDemoteEndDate] = useState<Date | undefined>(undefined);
  const [autoDemoteRemark, setAutoDemoteRemark] = useState('');

  // Load data on mount and when filters change
  useEffect(() => {
    loadStageAssignments();
  }, [currentPage, searchQuery, selectedStage, startDateFrom, startDateTo]);

  const loadStageAssignments = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const params = new URLSearchParams({
      //   page: currentPage.toString(),
      //   ...(searchQuery && { search: searchQuery }),
      //   ...(selectedStage !== 'all' && { stage: selectedStage }),
      //   ...(startDateFrom && { start_date_from: format(startDateFrom, 'yyyy-MM-dd') }),
      //   ...(startDateTo && { start_date_to: format(startDateTo, 'yyyy-MM-dd') }),
      // });
      // const response = await fetch(`/api/stage-management/prisoner-stages/?${params}`);
      // const data = await response.json();
      // setStageAssignments(data.results);
      // setTotalCount(data.count);
      // setTotalPages(Math.ceil(data.count / 10));

      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockData: StageAssignment[] = [
        {
          id: '1',
          prisoner_name: 'John Doe',
          prisoner_number: 'P-2024-001',
          stage_name: 'Orientation Stage',
          start_date: '2024-01-15',
          end_date: '2024-04-15',
          remark: 'Initial stage assignment for new admission',
          prisoner: '1',
          stage: '1',
        },
        {
          id: '2',
          prisoner_name: 'Jane Smith',
          prisoner_number: 'P-2024-002',
          stage_name: 'Ordinary Stage',
          start_date: '2024-02-20',
          end_date: '2024-08-20',
          remark: 'Progressed to ordinary stage after orientation',
          prisoner: '2',
          stage: '2',
        },
        {
          id: '3',
          prisoner_name: 'Robert Johnson',
          prisoner_number: 'P-2024-003',
          stage_name: 'Star Stage',
          start_date: '2024-03-10',
          end_date: null,
          remark: 'Model prisoner, advanced to star stage',
          prisoner: '3',
          stage: '3',
        },
        {
          id: '4',
          prisoner_name: 'Mary Williams',
          prisoner_number: 'P-2024-004',
          stage_name: 'Ordinary Stage',
          start_date: '2024-04-05',
          end_date: '2024-10-05',
          remark: 'Standard progression',
          prisoner: '4',
          stage: '2',
        },
        {
          id: '5',
          prisoner_name: 'James Brown',
          prisoner_number: 'P-2024-005',
          stage_name: 'Special Stage',
          start_date: '2024-05-12',
          end_date: null,
          remark: 'Special classification due to health concerns',
          prisoner: '5',
          stage: '4',
        },
        {
          id: '6',
          prisoner_name: 'Patricia Davis',
          prisoner_number: 'P-2024-006',
          stage_name: 'Orientation Stage',
          start_date: '2024-06-18',
          end_date: '2024-09-18',
          remark: 'Recent admission',
          prisoner: '6',
          stage: '1',
        },
        {
          id: '7',
          prisoner_name: 'Michael Miller',
          prisoner_number: 'P-2024-007',
          stage_name: 'Star Stage',
          start_date: '2024-07-22',
          end_date: null,
          remark: 'Excellent behavior and progress',
          prisoner: '7',
          stage: '3',
        },
        {
          id: '8',
          prisoner_name: 'Linda Wilson',
          prisoner_number: 'P-2024-008',
          stage_name: 'Ordinary Stage',
          start_date: '2024-08-30',
          end_date: null,
          remark: 'Standard classification',
          prisoner: '8',
          stage: '2',
        },
      ];

      setStageAssignments(mockData);
      setFilteredAssignments(mockData);
      setTotalCount(mockData.length);
      setTotalPages(Math.ceil(mockData.length / 10));
    } catch (error) {
      console.error('Failed to load stage assignments:', error);
      toast.error('Failed to load stage assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedAssignment(null);
    setFormOpen(true);
  };

  const handleEdit = (assignment: StageAssignment) => {
    setSelectedAssignment(assignment);
    setFormOpen(true);
  };

  const handleDeleteClick = (assignment: StageAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/stage-management/prisoner-stages/${assignmentToDelete.id}/`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete stage assignment');

      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Stage assignment deleted successfully');
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      loadStageAssignments();
    } catch (error) {
      console.error('Failed to delete stage assignment:', error);
      toast.error('Failed to delete stage assignment');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStage('all');
    setStartDateFrom(undefined);
    setStartDateTo(undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedStage !== 'all') count++;
    if (startDateFrom) count++;
    if (startDateTo) count++;
    return count;
  };

  const getStageColor = (stageName: string) => {
    switch (stageName) {
      case 'Orientation Stage':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ordinary Stage':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Star Stage':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Special Stage':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (endDate: string | null) => {
    if (!endDate) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Active
        </Badge>
      );
    }

    const end = new Date(endDate);
    const now = new Date();

    if (end < now) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Completed
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Active
      </Badge>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(stageAssignments.map((assignment) => assignment.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleBatchEdit = () => {
    setBatchEditStage('');
    setBatchEditStartDate(undefined);
    setBatchEditEndDate(undefined);
    setBatchEditRemark('');
    setBatchEditDialogOpen(true);
  };

  const handleBatchEditSubmit = async () => {
    if (!batchEditStage) {
      toast.error('Please select a stage');
      return;
    }

    if (!batchEditStartDate) {
      toast.error('Please select a start date');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/stage-management/prisoner-stages/batch-update/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ids: selectedRows,
      //     stage: batchEditStage,
      //     start_date: format(batchEditStartDate, 'yyyy-MM-dd'),
      //     end_date: batchEditEndDate ? format(batchEditEndDate, 'yyyy-MM-dd') : null,
      //     remark: batchEditRemark,
      //   }),
      // });
      // if (!response.ok) throw new Error('Failed to update stage assignments');

      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`Successfully updated ${selectedRows.length} stage assignment(s)`);
      setBatchEditDialogOpen(false);
      setSelectedRows([]);
      loadStageAssignments();
    } catch (error) {
      console.error('Failed to update stage assignments:', error);
      toast.error('Failed to update stage assignments');
    }
  };

  const handleAutoPromote = () => {
    setAutoPromoteStartDate(undefined);
    setAutoPromoteEndDate(undefined);
    setAutoPromoteRemark('');
    setAutoPromoteDialogOpen(true);
  };

  const handleAutoPromoteSubmit = async () => {
    if (!autoPromoteStartDate) {
      toast.error('Please select a start date');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/stage-management/prisoner-stages/auto-promote/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ids: selectedRows,
      //     start_date: format(autoPromoteStartDate, 'yyyy-MM-dd'),
      //     end_date: autoPromoteEndDate ? format(autoPromoteEndDate, 'yyyy-MM-dd') : null,
      //     remark: autoPromoteRemark,
      //   }),
      // });
      // if (!response.ok) throw new Error('Failed to auto-promote prisoners');

      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`Successfully auto-promoted ${selectedRows.length} prisoner(s)`);
      setAutoPromoteDialogOpen(false);
      setSelectedRows([]);
      loadStageAssignments();
    } catch (error) {
      console.error('Failed to auto-promote prisoners:', error);
      toast.error('Failed to auto-promote prisoners');
    }
  };

  const handleAutoDemote = () => {
    setAutoDemoteStartDate(undefined);
    setAutoDemoteEndDate(undefined);
    setAutoDemoteRemark('');
    setAutoDemoteDialogOpen(true);
  };

  const handleAutoDemoteSubmit = async () => {
    if (!autoDemoteStartDate) {
      toast.error('Please select a start date');
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/stage-management/prisoner-stages/auto-demote/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ids: selectedRows,
      //     start_date: format(autoDemoteStartDate, 'yyyy-MM-dd'),
      //     end_date: autoDemoteEndDate ? format(autoDemoteEndDate, 'yyyy-MM-dd') : null,
      //     remark: autoDemoteRemark,
      //   }),
      // });
      // if (!response.ok) throw new Error('Failed to auto-demote prisoners');

      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`Successfully auto-demoted ${selectedRows.length} prisoner(s)`);
      setAutoDemoteDialogOpen(false);
      setSelectedRows([]);
      loadStageAssignments();
    } catch (error) {
      console.error('Failed to auto-demote prisoners:', error);
      toast.error('Failed to auto-demote prisoners');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2" style={{ color: '#650000' }}>
            <TrendingUp className="h-6 w-6" />
            <h1 className="text-2xl">Prisoner Stage Assignments</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage progressive stage classifications for prisoners
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Assign Stage
        </Button>
      </div>

      {/* Search and Filters */}
      <Card style={{ borderTop: '3px solid #650000' }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Search & Filters</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2"
                  style={{ backgroundColor: '#650000', color: 'white' }}
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by prisoner name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="1">Orientation Stage</SelectItem>
                    <SelectItem value="2">Ordinary Stage</SelectItem>
                    <SelectItem value="3">Star Stage</SelectItem>
                    <SelectItem value="4">Special Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDateFrom ? (
                        format(startDateFrom, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDateFrom}
                      onSelect={setStartDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Start Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDateTo ? format(startDateTo, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDateTo}
                      onSelect={setStartDateTo}
                      initialFocus
                      disabled={(date) =>
                        startDateFrom ? date < startDateFrom : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {getActiveFiltersCount() > 0 && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Action Buttons */}
      {selectedRows.length > 1 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              {selectedRows.length} Selected
            </Badge>
            <span className="text-sm text-blue-800">
              {selectedRows.length} record(s) selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedRows([])}
            >
              Clear Selection
            </Button>
            <Button
              onClick={handleBatchEdit}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Manual Stage Edit
            </Button>
            <Button
              onClick={handleAutoPromote}
              style={{ backgroundColor: '#065f46' }}
              className="text-white hover:opacity-90"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Auto Promote
            </Button>
            <Button
              onClick={handleAutoDemote}
              style={{ backgroundColor: '#dc2626' }}
              className="text-white hover:opacity-90"
            >
              <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
              Auto Demote
            </Button>
          </div>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Assignments ({totalCount})</CardTitle>
          <CardDescription>
            Showing {stageAssignments.length} of {totalCount} stage assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading stage assignments...
            </div>
          ) : stageAssignments.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg mb-2">No Stage Assignments Found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by assigning a stage to a prisoner.
              </p>
              <Button
                onClick={handleAddNew}
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign Stage
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#650000' }}>
                    <TableHead className="text-white w-[50px]">
                      <Checkbox
                        checked={
                          stageAssignments.length > 0 &&
                          selectedRows.length === stageAssignments.length
                        }
                        onCheckedChange={handleSelectAll}
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#650000]"
                      />
                    </TableHead>
                    <TableHead className="text-white">Prisoner Number</TableHead>
                    <TableHead className="text-white">Prisoner Name</TableHead>
                    <TableHead className="text-white">Stage</TableHead>
                    <TableHead className="text-white">Start Date</TableHead>
                    <TableHead className="text-white">End Date</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Remark</TableHead>
                    <TableHead className="text-white text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stageAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(assignment.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(assignment.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {assignment.prisoner_number}
                      </TableCell>
                      <TableCell>{assignment.prisoner_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStageColor(assignment.stage_name)}
                        >
                          {assignment.stage_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(assignment.start_date), 'PP')}
                      </TableCell>
                      <TableCell>
                        {assignment.end_date
                          ? format(new Date(assignment.end_date), 'PP')
                          : 'Ongoing'}
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.end_date)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {assignment.remark || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(assignment)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(assignment)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <StageAssignForm
        open={formOpen}
        onOpenChange={setFormOpen}
        stageAssignment={selectedAssignment}
        onSuccess={loadStageAssignments}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the stage assignment for{' '}
              <span className="font-medium">{assignmentToDelete?.prisoner_name}</span> (
              {assignmentToDelete?.stage_name}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Edit Dialog */}
      <Dialog open={batchEditDialogOpen} onOpenChange={setBatchEditDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Edit2 className="h-5 w-5" />
              Edit Multiple Stage Assignments
            </DialogTitle>
            <DialogDescription>
              Update stage information for {selectedRows.length} selected record(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Stage Selection */}
            <div className="space-y-2">
              <Label htmlFor="batch-stage">Stage *</Label>
              <Select value={batchEditStage} onValueChange={setBatchEditStage}>
                <SelectTrigger id="batch-stage">
                  <SelectValue placeholder="Select a stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Orientation Stage</SelectItem>
                  <SelectItem value="2">Ordinary Stage</SelectItem>
                  <SelectItem value="3">Star Stage</SelectItem>
                  <SelectItem value="4">Special Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {batchEditStartDate ? (
                      format(batchEditStartDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={batchEditStartDate}
                    onSelect={setBatchEditStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {batchEditEndDate ? (
                      format(batchEditEndDate, 'PPP')
                    ) : (
                      <span>Pick a date (optional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={batchEditEndDate}
                    onSelect={setBatchEditEndDate}
                    initialFocus
                    disabled={(date) =>
                      batchEditStartDate ? date < batchEditStartDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
              {batchEditEndDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBatchEditEndDate(undefined)}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear end date
                </Button>
              )}
            </div>

            {/* Remark */}
            <div className="space-y-2">
              <Label htmlFor="batch-remark">Remark</Label>
              <Textarea
                id="batch-remark"
                placeholder="Enter remark (optional)"
                value={batchEditRemark}
                onChange={(e) => setBatchEditRemark(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBatchEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchEditSubmit}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              Update {selectedRows.length} Record(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto Promote Dialog */}
      <Dialog open={autoPromoteDialogOpen} onOpenChange={setAutoPromoteDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#065f46' }}>
              <TrendingUp className="h-5 w-5" />
              Auto Promote Prisoners
            </DialogTitle>
            <DialogDescription>
              Automatically promote {selectedRows.length} selected prisoner(s) to the next stage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {autoPromoteStartDate ? (
                      format(autoPromoteStartDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={autoPromoteStartDate}
                    onSelect={setAutoPromoteStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {autoPromoteEndDate ? (
                      format(autoPromoteEndDate, 'PPP')
                    ) : (
                      <span>Pick a date (optional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={autoPromoteEndDate}
                    onSelect={setAutoPromoteEndDate}
                    initialFocus
                    disabled={(date) =>
                      autoPromoteStartDate ? date < autoPromoteStartDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
              {autoPromoteEndDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoPromoteEndDate(undefined)}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear end date
                </Button>
              )}
            </div>

            {/* Remark */}
            <div className="space-y-2">
              <Label htmlFor="auto-promote-remark">Remark</Label>
              <Textarea
                id="auto-promote-remark"
                placeholder="Enter remark (optional)"
                value={autoPromoteRemark}
                onChange={(e) => setAutoPromoteRemark(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAutoPromoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAutoPromoteSubmit}
              style={{ backgroundColor: '#065f46' }}
              className="text-white hover:opacity-90"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Promote {selectedRows.length} Prisoner(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto Demote Dialog */}
      <Dialog open={autoDemoteDialogOpen} onOpenChange={setAutoDemoteDialogOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#dc2626' }}>
              <TrendingUp className="h-5 w-5 rotate-180" />
              Auto Demote Prisoners
            </DialogTitle>
            <DialogDescription>
              Automatically demote {selectedRows.length} selected prisoner(s) to the previous stage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {autoDemoteStartDate ? (
                      format(autoDemoteStartDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={autoDemoteStartDate}
                    onSelect={setAutoDemoteStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {autoDemoteEndDate ? (
                      format(autoDemoteEndDate, 'PPP')
                    ) : (
                      <span>Pick a date (optional)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={autoDemoteEndDate}
                    onSelect={setAutoDemoteEndDate}
                    initialFocus
                    disabled={(date) =>
                      autoDemoteStartDate ? date < autoDemoteStartDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
              {autoDemoteEndDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoDemoteEndDate(undefined)}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear end date
                </Button>
              )}
            </div>

            {/* Remark */}
            <div className="space-y-2">
              <Label htmlFor="auto-demote-remark">Remark</Label>
              <Textarea
                id="auto-demote-remark"
                placeholder="Enter remark (optional)"
                value={autoDemoteRemark}
                onChange={(e) => setAutoDemoteRemark(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAutoDemoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAutoDemoteSubmit}
              style={{ backgroundColor: '#dc2626' }}
              className="text-white hover:opacity-90"
            >
              <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
              Demote {selectedRows.length} Prisoner(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

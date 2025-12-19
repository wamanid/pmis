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
import { deleteStageData, demotePrioners, getStageList, getStages, manualPromotion, promotePrioners } from '../../services/stageService';
import { Stage, StageDemotionPost } from '../../models/StageClassification';

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

    const [stages, setStages] = useState<Stage[]>([]);




    const loadStages = async () => {
        try {


          //get the state assignments here




          // TODO: Replace with actual API call
          // const response = await fetch('/api/system-administration/stages/');
          // const data = await response.json();
          // setStages(data.results);
    
          // Mock data
            let stages: Stage[] = [
          ];
    
          //get stages
           getStages().then((data) => {
          // alert(JSON.stringify(data.results));
             stages = data.results;
             setStages(stages);

          }).catch((error) => {
            alert(error);
    
          });
    
          setStages(stages);
        } catch (error) {
          console.error('Failed to load stages:', error);
          toast.error('Failed to load stages');
        }
      };
  // Load data on mount and when filters change
  useEffect(() => {
    loadStageAssignments();
    loadStages();
  }, [currentPage, searchQuery, selectedStage, startDateFrom, startDateTo]);

  const loadStageAssignments = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let mockData: StageAssignment[] = [
      
      ];
          getStageList().then((data) => {
          mockData = data.results;
        //alert(JSON.stringify(data.results));
      setStageAssignments(mockData);
      setFilteredAssignments(mockData);
      setTotalCount(mockData.length);
      setTotalPages(Math.ceil(mockData.length / 10));
             
            }).catch((error) => {
              alert(error);
      
            });

    } catch (error) {
      alert(error);
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
 
   // alert(JSON.stringify(assignment));
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

     // await new Promise((resolve) => setTimeout(resolve, 500));

          deleteStageData(assignmentToDelete.id).then((data) => {
              toast.success('Stage assignment deleted successfully');
            }).catch((error) => {
              alert(error);
      
            });

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

  // c
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(stageAssignments.map((assignment) => assignment.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (assment:StageAssignment,id: string, checked: boolean) => {
    if (checked) {
   
      setSelectedRows([...selectedRows, assment.id]);
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

     
     
     
     //batchEditStage
     //here is the batch manual post page
       selectedRows.forEach((rowId) => {
        //get the assignment object
        const assignment = stageAssignments.find((assignment) => assignment.id === rowId);
        //get the prisoner id from the assignment object and add to prisonersSelected array
          prisonersSelected.push(assignment.prisoner);

      })
    

      let data: StageDemotionPost ={
           //we need a loop here
           stage:batchEditStage,
           prisoners: prisonersSelected,
           start_date: format(batchEditStartDate, 'yyyy-MM-dd'),
           end_date: batchEditEndDate ? format(batchEditEndDate, 'yyyy-MM-dd') : "",
           remark: batchEditRemark}
          
         // alert(JSON.stringify(data));
             manualPromotion(data).then((result) => {
                alert(JSON.stringify(result));
          toast.success(`Successfully updated ${selectedRows.length} stage assignment(s)`);
    
           }).catch((error) => {
              toast.error('Failed to auto-promoted prisoners and error has occured'+error);
           });
     
 
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

      //loop through the selected rows and add to prisonersSelected array
      selectedRows.forEach((rowId) => {
        //get the assignment object
        const assignment = stageAssignments.find((assignment) => assignment.id === rowId);
        //get the prisoner id from the assignment object and add to prisonersSelected array
          prisonersSelected.push(assignment.prisoner);

      })
    

     // alert(JSON.stringify(prisonersSelected));

      let data: StageDemotionPost ={
           //we need a loop here
           prisoners: prisonersSelected,
           start_date: format(autoPromoteStartDate, 'yyyy-MM-dd'),
           end_date: autoPromoteEndDate ? format(autoPromoteEndDate, 'yyyy-MM-dd') : "",
           remark: autoPromoteRemark}
          
          // alert(JSON.stringify(data));
              promotePrioners(data).then((result) => {
               // alert(JSON.stringify(result));
               toast.success(`Successfully auto-promoted ${selectedRows.length} prisoner(s)`);
    
           }).catch((error) => {
              toast.error('Failed to auto-promoted prisoners and error has occured');
           });

     setAutoPromoteDialogOpen(false);
      setSelectedRows([]);
      loadStageAssignments();
    } catch (error) {
      console.error('Failed to promote prisoners:', error);
      toast.error('Failed to promote prisoners');
    }
  };

  const handleAutoDemote = () => {
    setAutoDemoteStartDate(undefined);
    setAutoDemoteEndDate(undefined);
    setAutoDemoteRemark('');
    setAutoDemoteDialogOpen(true);
  };


  let prisonersSelected: string[] = [];


  //demotion
  const handleAutoDemoteSubmit = async () => {
    if (!autoDemoteStartDate) {
      toast.error('Please select a start date');
      return;
    }
    try {

      //loop through the selected rows and add to prisonersSelected array
      selectedRows.forEach((rowId) => {
        //get the assignment object
        const assignment = stageAssignments.find((assignment) => assignment.id === rowId);
        //get the prisoner id from the assignment object and add to prisonersSelected array
          prisonersSelected.push(assignment.prisoner);

      })
    

     // alert(JSON.stringify(prisonersSelected));

      let data: StageDemotionPost ={
           //we need a loop here
           prisoners: prisonersSelected,
           start_date: format(autoDemoteStartDate, 'yyyy-MM-dd'),
           end_date: autoDemoteEndDate ? format(autoDemoteEndDate, 'yyyy-MM-dd') : "",
           remark: autoDemoteRemark}
           /*demotePrioners(data).then((result) => {
           }).catch((error) => {
               toast.error(error);
           });*/
         //  alert(JSON.stringify(data));
              demotePrioners(data).then((result) => {
             //   alert(JSON.stringify(result));
               toast.success(`Successfully auto-demoted ${selectedRows.length} prisoner(s)`);
    
           }).catch((error) => {
              toast.error('Failed to auto-demote prisoners and error has occured');
           });




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
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem  value="all">
                    All Stages
                  </SelectItem>
                 {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
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
              Promote
            </Button>
            <Button
              onClick={handleAutoDemote}
              style={{ backgroundColor: '#dc2626' }}
              className="text-white hover:opacity-90"
            >
              <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
              Demote
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
                            handleSelectRow(assignment,assignment.id, checked as boolean)
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
                  {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>



 <div className="space-y-2">
          <Label>
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={batchEditStartDate}
            onChange={(e) => {
               setBatchEditStartDate(e.target.value);
            }}
            
          />
        </div>



          <div className="space-y-2">
          <Label>
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={batchEditEndDate}
            onChange={(e) => {
               setBatchEditEndDate(e.target.value);
            }}
            
          />
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
           <div className="space-y-2">
          <Label>
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={autoPromoteStartDate}
            onChange={(e) => {
               setAutoPromoteStartDate(e.target.value);
            }}
            
          />
        </div>



          <div className="space-y-2">
          <Label>
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={autoPromoteEndDate}
            onChange={(e) => {
               setAutoPromoteEndDate(e.target.value);
            }}
            
          />
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


          <div className="space-y-2">
          <Label>
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={autoDemoteStartDate}
            onChange={(e) => {
               setAutoDemoteStartDate(e.target.value);
            }}
            
          />
        </div>



          <div className="space-y-2">
          <Label>
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={autoDemoteEndDate}
            onChange={(e) => {
               setAutoDemoteEndDate(e.target.value);
            }}
            
          />
        </div>
      
          <div className="space-y-4 py-4">
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
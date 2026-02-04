import React, { useState, useEffect } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../ui/table';
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
import { Card, CardContent } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Search, Plus, Eye, Edit, ChevronLeft, ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import StationStateForm from './StationStateForm';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../ui/dialog';

interface StationState {
  id: string;
  station_name: string;
  level_of_conjestion: string;
  station: string;
  state_of_buildings: string;
  state_of_buildings_name?: string;
  ventilation: string;
  ventilation_name?: string;
  lighting: string;
  lighting_name?: string;
  fencing: string;
  fencing_name?: string;
  general_environment: string;
  general_environment_name?: string;
  ward_environment: string;
  ward_environment_name?: string;
}

interface StationStateListProps {
  selectedStationId?: string;
}

// Mock data
const mockStationStates: StationState[] = [
  {
    id: '1',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    station_name: 'Luzira Maximum Security Prison',
    level_of_conjestion: '188',
    state_of_buildings: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    state_of_buildings_name: 'Poor',
    ventilation: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    ventilation_name: 'Fair',
    lighting: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    lighting_name: 'Fair',
    fencing: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    fencing_name: 'Good',
    general_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    general_environment_name: 'Fair',
    ward_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    ward_environment_name: 'Poor',
  },
  {
    id: '2',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    station_name: 'Kigo Prison',
    level_of_conjestion: '145',
    state_of_buildings: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    state_of_buildings_name: 'Good',
    ventilation: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    ventilation_name: 'Excellent',
    lighting: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    lighting_name: 'Good',
    fencing: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    fencing_name: 'Excellent',
    general_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    general_environment_name: 'Good',
    ward_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    ward_environment_name: 'Good',
  },
  {
    id: '3',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
    station_name: 'Murchison Bay Prison',
    level_of_conjestion: '210',
    state_of_buildings: '3fa85f64-5717-4562-b3fc-2c963f66afb5',
    state_of_buildings_name: 'Critical',
    ventilation: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    ventilation_name: 'Poor',
    lighting: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    lighting_name: 'Poor',
    fencing: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    fencing_name: 'Fair',
    general_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb4',
    general_environment_name: 'Poor',
    ward_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb5',
    ward_environment_name: 'Critical',
  },
  {
    id: '4',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afa9',
    station_name: 'Gulu Main Prison',
    level_of_conjestion: '165',
    state_of_buildings: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    state_of_buildings_name: 'Fair',
    ventilation: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    ventilation_name: 'Good',
    lighting: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    lighting_name: 'Fair',
    fencing: '3fa85f64-5717-4562-b3fc-2c963f66afb2',
    fencing_name: 'Good',
    general_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    general_environment_name: 'Fair',
    ward_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb3',
    ward_environment_name: 'Fair',
  },
  {
    id: '5',
    station: '3fa85f64-5717-4562-b3fc-2c963f66afaa',
    station_name: 'Mbarara Main Prison',
    level_of_conjestion: '120',
    state_of_buildings: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    state_of_buildings_name: 'Excellent',
    ventilation: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    ventilation_name: 'Excellent',
    lighting: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    lighting_name: 'Excellent',
    fencing: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    fencing_name: 'Excellent',
    general_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    general_environment_name: 'Excellent',
    ward_environment: '3fa85f64-5717-4562-b3fc-2c963f66afb1',
    ward_environment_name: 'Excellent',
  },
];

const StationStateList: React.FC<StationStateListProps> = ({ selectedStationId }) => {
  const [records, setRecords] = useState<StationState[]>(mockStationStates);
  const [filteredRecords, setFilteredRecords] = useState<StationState[]>(mockStationStates);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StationState | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records, selectedStationId]);

  const filterRecords = () => {
    let filtered = [...records];

    if (selectedStationId) {
      filtered = filtered.filter((record) => record.station === selectedStationId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.station_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.level_of_conjestion.includes(searchTerm)
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogOpen(true);
  };

  const handleView = (record: StationState) => {
    setSelectedRecord(record);
    setFormMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (record: StationState) => {
    setSelectedRecord(record);
    setFormMode('edit');
    setDialogOpen(true);
  };

  const handleFormSubmit = (data: StationState) => {
    if (formMode === 'create') {
      const newRecord: StationState = {
        ...data,
        id: `${records.length + 1}`,
      };
      setRecords([...records, newRecord]);
      toast.success('Station state record created successfully');
    } else if (formMode === 'edit') {
      setRecords(records.map((r) => (r.id === selectedRecord?.id ? { ...data, id: r.id } : r)));
      toast.success('Station state record updated successfully');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      setRecords(records.filter((record) => record.id !== recordToDelete));
      toast.success('Station state record deleted successfully');
      setShowDeleteDialog(false);
    }
  };

  const getCongestionBadge = (level: string) => {
    const congestionLevel = parseInt(level);
    let className = '';
    
    if (congestionLevel >= 200) {
      className = 'bg-red-100 text-red-800';
    } else if (congestionLevel >= 150) {
      className = 'bg-orange-100 text-orange-800';
    } else if (congestionLevel >= 100) {
      className = 'bg-yellow-100 text-yellow-800';
    } else {
      className = 'bg-green-100 text-green-800';
    }

    return (
      <Badge className={className}>
        {level}%
      </Badge>
    );
  };

  const getRatingBadge = (ratingName?: string) => {
    if (!ratingName) return <Badge>N/A</Badge>;

    const variants: { [key: string]: string } = {
      Excellent: 'bg-green-100 text-green-800',
      Good: 'bg-blue-100 text-blue-800',
      Fair: 'bg-yellow-100 text-yellow-800',
      Poor: 'bg-orange-100 text-orange-800',
      Critical: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[ratingName] || 'bg-gray-100 text-gray-800'}>
        {ratingName}
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
                  placeholder="Search by station name or congestion level..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCreate}
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Station Name</TableHead>
                  <TableHead>Congestion</TableHead>
                  <TableHead>Buildings</TableHead>
                  <TableHead>Ventilation</TableHead>
                  <TableHead>Lighting</TableHead>
                  <TableHead>Fencing</TableHead>
                  <TableHead>General Env.</TableHead>
                  <TableHead>Ward Env.</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No station state records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{record.station_name}</TableCell>
                      <TableCell>{getCongestionBadge(record.level_of_conjestion)}</TableCell>
                      <TableCell>{getRatingBadge(record.state_of_buildings_name)}</TableCell>
                      <TableCell>{getRatingBadge(record.ventilation_name)}</TableCell>
                      <TableCell>{getRatingBadge(record.lighting_name)}</TableCell>
                      <TableCell>{getRatingBadge(record.fencing_name)}</TableCell>
                      <TableCell>{getRatingBadge(record.general_environment_name)}</TableCell>
                      <TableCell>{getRatingBadge(record.ward_environment_name)}</TableCell>
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
                              onClick={() => handleDelete(record.id)}
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
          <DialogTitle>Station State Form</DialogTitle>
          <DialogDescription>
            Manage station state assessment including congestion levels and facility ratings.
          </DialogDescription>
          <StationStateForm
            stationState={selectedRecord}
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
              This action cannot be undone. This will permanently delete the station state record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StationStateList;

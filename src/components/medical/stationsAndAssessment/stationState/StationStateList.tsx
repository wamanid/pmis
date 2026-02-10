import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../../ui/dialog';
import { Plus, Eye, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';
import StationStateForm from './StationStateForm';
import { DataTable } from '../../../common/DataTable';
import { DataTableColumn } from '../../../common/DataTable.types';
import ConfirmDialog from '../../../common/ConfirmDialog';
import {
  StationState,
  fetchStationStateById,
  createStationState,
  updateStationState,
  deleteStationState,
  STATION_STATE_API_ENDPOINTS,
} from '../../../../services/medical/stationsAndAssessment/stationStateService';

interface StationStateListProps {
  selectedStationId?: string;
}

const StationStateList: React.FC<StationStateListProps> = ({ selectedStationId }) => {
  const [tableKey, setTableKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<StationState | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<StationState | null>(null);

  // Build table URL with filters
  const tableUrl = useMemo(() => {
    let url = STATION_STATE_API_ENDPOINTS.STATION_STATES.replace(/^\//, '');
    const params = new URLSearchParams();

    if (selectedStationId) params.append('station', selectedStationId);

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }, [selectedStationId]);

  // Column definitions
  const columns: DataTableColumn[] = useMemo(
    () => [
      {
        key: 'station_name',
        label: 'Station Name',
        render: (value: any) => (
          <span className="font-medium">{value || 'N/A'}</span>
        ),
      },
      {
        key: 'level_of_conjestion',
        label: 'Congestion',
        render: (value: any) => {
          if (!value) return <Badge>N/A</Badge>;
          const congestionLevel = parseInt(value);
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

          return <Badge className={className}>{value}%</Badge>;
        },
      },
      {
        key: 'state_of_buildings_name',
        label: 'Buildings',
        render: (value: any, row: any) => getRatingBadge(value, row.state_of_buildings),
      },
      {
        key: 'ventilation_name',
        label: 'Ventilation',
        render: (value: any, row: any) => getRatingBadge(value, row.ventilation),
      },
      {
        key: 'lighting_name',
        label: 'Lighting',
        render: (value: any, row: any) => getRatingBadge(value, row.lighting),
      },
      {
        key: 'fencing_name',
        label: 'Fencing',
        render: (value: any, row: any) => getRatingBadge(value, row.fencing),
      },
      {
        key: 'general_environment_name',
        label: 'General Env.',
        render: (value: any, row: any) => getRatingBadge(value, row.general_environment),
      },
      {
        key: 'ward_environment_name',
        label: 'Ward Env.',
        render: (value: any, row: any) => getRatingBadge(value, row.ward_environment),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_: any, row: any) => (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(row)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const getRatingBadge = (ratingName?: string, ratingId?: string) => {
    // If no name and no ID, show N/A
    if (!ratingName && !ratingId) return <Badge>N/A</Badge>;
    
    // If no name but has ID, show truncated UUID
    if (!ratingName && ratingId) {
      const truncatedId = ratingId.substring(0, 8);
      return (
        <Badge className="bg-gray-100 text-gray-800" title={ratingId}>
          {truncatedId}...
        </Badge>
      );
    }

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

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleView = async (record: StationState) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchStationStateById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('view');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch station state details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  };

  const handleEdit = async (record: StationState) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchStationStateById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch station state details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  };

  const handleFormSubmit = async (data: StationState) => {
    try {
      if (formMode === 'create') {
        await createStationState(data);
        toast.success('Station state record created successfully');
        setTableKey((prev) => prev + 1);
      } else if (formMode === 'edit' && selectedRecord?.id) {
        await updateStationState(selectedRecord.id, data);
        toast.success('Station state record updated successfully');
        setTableKey((prev) => prev + 1);
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save station state:', error);
      toast.error(error.response?.data?.message || 'Failed to save record');
      throw error;
    }
  };

  const handleDeleteClick = (record: StationState) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete?.id) return;
    try {
      await deleteStationState(recordToDelete.id);
      toast.success('Station state record deleted successfully');
      setTableKey((prev) => prev + 1);
      setRecordToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete station state:', error);
      toast.error(error.response?.data?.message || 'Failed to delete record');
      throw error;
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                Station State Records
              </h3>
              <p className="text-sm text-gray-500">
                Track station conditions, congestion levels, and facility ratings
              </p>
            </div>
            <Button
              onClick={handleCreate}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>

          <DataTable
            key={tableKey}
            url={tableUrl}
            title="Station State"
            columns={columns}
            searchPlaceholder="Search by station name..."
            config={{
              search: true,
              export: { csv: true, pdf: true, print: true },
              lengthMenu: [10, 25, 50, 100, -1],
              pagination: true,
              summary: true,
              rowSpacing: 'normal',
            }}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-[1200px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e: Event) => e.preventDefault()}
        >
          <DialogTitle>
            {formMode === 'create' && 'New Station State Record'}
            {formMode === 'edit' && 'Edit Station State Record'}
            {formMode === 'view' && 'View Station State Record'}
          </DialogTitle>
          <DialogDescription>
            Manage station state assessment including congestion levels and facility ratings.
          </DialogDescription>
          <StationStateForm
            key={`form-${dialogKey}-${formMode}`}
            stationState={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Station State Record"
        description="Are you absolutely sure? This action cannot be undone."
        details={
          recordToDelete ? (
            <div className="space-y-2 p-4 bg-gray-50 rounded-md">
              <div>
                <span className="font-semibold">Station:</span>{' '}
                {recordToDelete.station_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Congestion Level:</span>{' '}
                {recordToDelete.level_of_conjestion}%
              </div>
              <div>
                <span className="font-semibold">Buildings:</span>{' '}
                {recordToDelete.state_of_buildings_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">General Environment:</span>{' '}
                {recordToDelete.general_environment_name || 'N/A'}
              </div>
            </div>
          ) : null
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
      />
    </>
  );
};

export default StationStateList;

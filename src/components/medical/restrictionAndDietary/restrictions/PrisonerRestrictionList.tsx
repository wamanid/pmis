import React, { useState, useMemo } from 'react';
import { Button } from '../../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../ui/dialog';
import { Badge } from '../../../ui/badge';
import ConfirmDialog from '../../../common/ConfirmDialog';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DataTable } from '../../../common/DataTable';
import { DataTableColumn } from '../../../common/DataTable.types';
import PrisonerRestrictionForm from './PrisonerRestrictionForm';
import {
  fetchRestrictions,
  fetchRestrictionById,
  createRestriction,
  updateRestriction,
  deleteRestriction,
  PrisonerRestriction,
  RESTRICTION_API_ENDPOINTS,
} from '../../../../services/medical/restrictionAndDietary/restrictionService';
import { useFilters } from '../../../../contexts/FilterContext';

interface PrisonerRestrictionListProps {
  selectedPrisonerId?: string;
}

const PrisonerRestrictionList: React.FC<PrisonerRestrictionListProps> = ({
  selectedPrisonerId,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PrisonerRestriction | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<PrisonerRestriction | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [tableKey, setTableKey] = useState(0);

  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();

  /**
   * Build URL with query parameters for filtering
   */
  const buildTableUrl = () => {
    const params = new URLSearchParams();
    if (selectedPrisonerId) params.append('prisoner', selectedPrisonerId);
    if (globalStation) params.append('station', globalStation);
    if (globalDistrict) params.append('district', globalDistrict);
    if (globalRegion) params.append('region', globalRegion);
    
    const queryString = params.toString();
    return queryString 
      ? `${RESTRICTION_API_ENDPOINTS.RESTRICTIONS}?${queryString}`
      : RESTRICTION_API_ENDPOINTS.RESTRICTIONS;
  };

  const [tableUrl, setTableUrl] = useState(buildTableUrl());

  // Update table URL when filters or prisoner selection changes
  React.useEffect(() => {
    setTableUrl(buildTableUrl());
  }, [selectedPrisonerId, globalStation, globalDistrict, globalRegion]);

  /**
   * Table columns definition
   */
  const columns: DataTableColumn[] = useMemo(
    () => [
      {
        key: 'prisoner_name',
        label: 'Prisoner',
        sortable: true,
        render: (_: any, row: any) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.prisoner_name || 'N/A'}</span>
            {row.prisoner_number && (
              <span className="text-xs text-muted-foreground font-mono">
                {row.prisoner_number}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'reason_name',
        label: 'Restriction Reason',
        sortable: true,
      },
      {
        key: 'state_of_prisoner',
        label: 'State',
        sortable: true,
        render: (value: any) => (
          <span className="text-sm">{value || 'N/A'}</span>
        ),
      },
      {
        key: 'station_name',
        label: 'Medical Facility',
        sortable: true,
        render: (value: any) => (
          <span className="text-sm">{value || 'N/A'}</span>
        ),
      },
      {
        key: 'start_date',
        label: 'Start Date',
        sortable: true,
        render: (value: any) => {
          if (!value) return 'N/A';
          try {
            return format(new Date(value), 'PP');
          } catch {
            return value;
          }
        },
      },
      {
        key: 'end_date',
        label: 'End Date',
        sortable: true,
        render: (value: any) => {
          if (!value) return '—';
          try {
            return format(new Date(value), 'PP');
          } catch {
            return value;
          }
        },
      },
      {
        key: 'is_active',
        label: 'Status',
        sortable: true,
        render: (value: any) => {
          const isActive = value ?? true;
          return (
            <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        key: 'id',
        label: 'Actions',
        render: (_: any, row: any) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(row)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [selectedPrisonerId]
  );

  /**
   * Handlers
   */
  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleView = async (record: PrisonerRestriction) => {
    if (!record.id) {
      toast.error('Invalid restriction record');
      return;
    }

    try {
      // Fetch complete restriction details by ID to ensure all nested fields are available
      const fullRestriction = await fetchRestrictionById(record.id);
      setSelectedRecord(fullRestriction);
      setFormMode('view');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch restriction details:', error);
      toast.error(error.response?.data?.message || 'Failed to load restriction details');
    }
  };

  const handleEdit = async (record: PrisonerRestriction) => {
    if (!record.id) {
      toast.error('Invalid restriction record');
      return;
    }

    try {
      // Fetch complete restriction details by ID to ensure all nested fields are available
      const fullRestriction = await fetchRestrictionById(record.id);
      setSelectedRecord(fullRestriction);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch restriction details:', error);
      toast.error(error.response?.data?.message || 'Failed to load restriction details');
    }
  };

  const handleDeleteClick = (record: PrisonerRestriction) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: PrisonerRestriction) => {
    try {
      if (formMode === 'create') {
        await createRestriction(data);
        toast.success('Restriction created successfully');
        setTableKey((prev) => prev + 1); // Force DataTable refresh
      } else if (formMode === 'edit' && selectedRecord?.id) {
        await updateRestriction(selectedRecord.id, data);
        toast.success('Restriction updated successfully');
        setTableKey((prev) => prev + 1); // Force DataTable refresh
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save restriction:', error);
      throw error; // Re-throw to let form handle it
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete?.id) return;

    try {
      await deleteRestriction(recordToDelete.id);
      toast.success('Restriction deleted successfully');
      setTableKey((prev) => prev + 1); // Force DataTable refresh
      // Trigger DataTable refresh happens automatically via URL state
    } catch (error: any) {
      console.error('Failed to delete restriction:', error);
      toast.error(error.response?.data?.message || 'Failed to delete restriction');
      throw error;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: '#650000' }}>
            Prisoner Restrictions
          </h2>
          <Button
            onClick={handleCreate}
            style={{ backgroundColor: '#650000' }}
            className="text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Restriction
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          key={tableKey}
          url={tableUrl}
          title="Prisoner Restrictions"
          columns={columns}
          searchPlaceholder="Search by prisoner, reason, or facility..."
        />
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-[1200px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e: any) => e.preventDefault()}
        >
          <DialogTitle>
            {formMode === 'create' && 'Create New Restriction'}
            {formMode === 'edit' && 'Edit Restriction'}
            {formMode === 'view' && 'View Restriction'}
          </DialogTitle>
          <DialogDescription>
            {formMode === 'create' &&
              'Fill in the details to create a new prisoner restriction.'}
            {formMode === 'edit' && 'Modify the details of this restriction.'}
            {formMode === 'view' && 'View the details of this restriction.'}
          </DialogDescription>
          <PrisonerRestrictionForm
            key={`form-${dialogKey}-${formMode}`}
            restriction={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
            dialogOpen={dialogOpen}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Restriction"
        description="Are you absolutely sure? This action cannot be undone."
        details={
          recordToDelete ? (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Prisoner:</span> {recordToDelete.prisoner_name}
                {recordToDelete.prisoner_number && ` (${recordToDelete.prisoner_number})`}
              </div>
              <div>
                <span className="font-semibold">Reason:</span> {recordToDelete.reason_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Facility:</span> {recordToDelete.station_name || 'N/A'}
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

export default PrisonerRestrictionList;

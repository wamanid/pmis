import React, { useState, useMemo } from 'react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from '../../../ui/badge';
import { DataTable } from '../../../common/DataTable';
import type { DataTableColumn } from '../../../common/DataTable.types';
import ConfirmDialog from '../../../common/ConfirmDialog';
import ReleaseRecommendationForm from './ReleaseRecommendationForm';
import {
  ReleaseRecommendation,
  fetchReleaseRecommendationById,
  createReleaseRecommendation,
  updateReleaseRecommendation,
  deleteReleaseRecommendation,
  RELEASE_RECOMMENDATION_API_ENDPOINTS,
} from '../../../../services/medical/recommendations/releaseRecommendationService';

interface ReleaseRecommendationListProps {
  selectedPrisonerId?: string;
}

const ReleaseRecommendationList: React.FC<ReleaseRecommendationListProps> = ({ selectedPrisonerId }) => {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<ReleaseRecommendation | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ReleaseRecommendation | null>(null);

  // Table refresh key
  const [tableKey, setTableKey] = useState(0);

  // Build table URL with filters
  const tableUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedPrisonerId) {
      params.append('prisoner', selectedPrisonerId);
    }
    const queryString = params.toString();
    return queryString
      ? `${RELEASE_RECOMMENDATION_API_ENDPOINTS.RELEASE_RECOMMENDATIONS}?${queryString}`
      : RELEASE_RECOMMENDATION_API_ENDPOINTS.RELEASE_RECOMMENDATIONS;
  }, [selectedPrisonerId]);

  // Column definitions for DataTable
  const columns = useMemo<DataTableColumn[]>(
    () => [
      {
        key: 'prisoner_number_value',
        label: 'Prisoner Number',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-sm">{value || 'N/A'}</span>
        ),
      },
      {
        key: 'prisoner_name',
        label: 'Prisoner Name',
        sortable: true,
        render: (value: string) => <span>{value || 'N/A'}</span>,
      },
      {
        key: 'date_of_report',
        label: 'Date of Report',
        sortable: true,
        render: (value: string) => {
          try {
            return value ? format(new Date(value), 'MMM dd, yyyy') : 'N/A';
          } catch {
            return 'Invalid Date';
          }
        },
      },
      {
        key: 'abnormal_condition',
        label: 'Condition',
        render: (value: string) => (
          <span className="max-w-xs truncate block">{value || 'N/A'}</span>
        ),
      },
      {
        key: 'life_endangered',
        label: 'Critical',
        render: (value: boolean) =>
          value ? (
            <Badge className="bg-red-100 text-red-800">Yes</Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800">No</Badge>
          ),
      },
      {
        key: 'approval_status',
        label: 'Status',
        render: (value: string) => (
          <Badge className="bg-yellow-100 text-yellow-800">
            {value || 'Pending'}
          </Badge>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_value: any, row: ReleaseRecommendation) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(row)}
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(row)}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Handlers
  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleView = async (record: ReleaseRecommendation) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchReleaseRecommendationById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('view');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch release recommendation details:', error);
      toast.error(error.response?.data?.message || 'Failed to load release recommendation details');
    }
  };

  const handleEdit = async (record: ReleaseRecommendation) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchReleaseRecommendationById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch release recommendation details:', error);
      toast.error(error.response?.data?.message || 'Failed to load release recommendation details');
    }
  };

  const handleFormSubmit = async (data: Partial<ReleaseRecommendation>) => {
    try {
      if (formMode === 'create') {
        await createReleaseRecommendation(data);
        toast.success('Release recommendation created successfully');
        setTableKey((prev) => prev + 1);
      } else if (formMode === 'edit' && selectedRecord?.id) {
        await updateReleaseRecommendation(selectedRecord.id, data);
        toast.success('Release recommendation updated successfully');
        setTableKey((prev) => prev + 1);
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save release recommendation:', error);
      throw error;
    }
  };

  const handleDeleteClick = (record: ReleaseRecommendation) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete?.id) return;
    try {
      await deleteReleaseRecommendation(recordToDelete.id);
      toast.success('Release recommendation deleted successfully');
      setTableKey((prev) => prev + 1);
      setRecordToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete release recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to delete release recommendation');
      throw error;
    }
  };

  return (
    <div className="w-full space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Release Recommendations</h1>
          <p className="text-gray-600 text-sm mt-1">Manage release recommendations for prisoners</p>
        </div>
        <Button onClick={handleCreate} style={{ backgroundColor: '#650000' }} className="text-white hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          New Release
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        key={tableKey}
        url={tableUrl}
        title="Release Recommendations"
        columns={columns}
        searchPlaceholder="Search by prisoner name or number..."
      />

      {/* Dialog for Create/Edit/View */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto" 
          onInteractOutside={(e: any) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' 
                ? 'Create Release Recommendation' 
                : formMode === 'edit' 
                ? 'Edit Release Recommendation' 
                : 'View Release Recommendation'}
            </DialogTitle>
          </DialogHeader>
          <ReleaseRecommendationForm
            key={`form-${dialogKey}-${formMode}`}
            mode={formMode}
            releaseRecommendation={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Release Recommendation"
        description="Are you absolutely sure? This action cannot be undone."
        details={
          recordToDelete ? (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Prisoner:</span> {recordToDelete.prisoner_number_value || recordToDelete.prisoner_number} - {recordToDelete.prisoner_name}
              </div>
              <div>
                <span className="font-semibold">Condition:</span> {recordToDelete.abnormal_condition || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Date:</span>{' '}
                {recordToDelete.date_of_report
                  ? format(new Date(recordToDelete.date_of_report), 'MMM dd, yyyy')
                  : 'N/A'}
              </div>
            </div>
          ) : null
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ReleaseRecommendationList;

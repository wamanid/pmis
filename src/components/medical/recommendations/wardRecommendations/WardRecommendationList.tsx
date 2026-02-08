import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from '../../../ui/dialog';
import { Plus, Eye, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';
import WardRecommendationForm from './WardRecommendationForm';
import { DataTable } from '../../../common/DataTable';
import { DataTableColumn } from '../../../common/DataTable.types';
import ConfirmDialog from '../../../common/ConfirmDialog';
import {
  WardRecommendation,
  fetchWardRecommendationById,
  createWardRecommendation,
  updateWardRecommendation,
  deleteWardRecommendation,
  WARD_RECOMMENDATION_API_ENDPOINTS,
} from '../../../../services/medical/recommendations/wardRecommendationService';

interface WardRecommendationListProps {
  selectedPrisonerId?: string;
}

const WardRecommendationList: React.FC<WardRecommendationListProps> = ({ selectedPrisonerId }) => {
  const [tableKey, setTableKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<WardRecommendation | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<WardRecommendation | null>(null);

  // Build table URL with filters
  const tableUrl = useMemo(() => {
    let url = WARD_RECOMMENDATION_API_ENDPOINTS.WARD_RECOMMENDATIONS.replace(/^\//, '');
    const params = new URLSearchParams();

    if (selectedPrisonerId) params.append('prisoner', selectedPrisonerId);

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }, [selectedPrisonerId]);

  const handleCreate = useCallback(() => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  }, []);

  const handleView = useCallback(async (record: WardRecommendation) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchWardRecommendationById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('view');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch ward recommendation details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  }, []);

  const handleEdit = useCallback(async (record: WardRecommendation) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchWardRecommendationById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch ward recommendation details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  }, []);

  const handleFormSubmit = async (data: WardRecommendation) => {
    try {
      if (formMode === 'create') {
        await createWardRecommendation(data);
        toast.success('Ward recommendation created successfully');
        setTableKey((prev) => prev + 1);
      } else if (formMode === 'edit' && selectedRecord?.id) {
        await updateWardRecommendation(selectedRecord.id, data);
        toast.success('Ward recommendation updated successfully');
        setTableKey((prev) => prev + 1);
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save ward recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to save record');
      throw error;
    }
  };

  const handleDeleteClick = useCallback((record: WardRecommendation) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!recordToDelete?.id) return;
    try {
      await deleteWardRecommendation(recordToDelete.id);
      toast.success('Ward recommendation deleted successfully');
      setTableKey((prev) => prev + 1);
      setRecordToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete ward recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to delete record');
      throw error;
    }
  }, [recordToDelete]);

  // Column definitions - MUST be after handler functions
  const columns: DataTableColumn[] = useMemo(
    () => [
      {
        key: 'prisoner_name',
        label: 'Prisoner Name',
        render: (value: any) => (
          <span className="font-medium">{value || 'N/A'}</span>
        ),
      },
      {
        key: 'prisoner_number',
        label: 'Prisoner Number',
        render: (value: any) => value || 'N/A',
      },
      {
        key: 'ward_name',
        label: 'Recommended Ward',
        render: (value: any) => value || 'N/A',
      },
      {
        key: 'recommendation_notes',
        label: 'Recommendation Notes',
        render: (value: any) => {
          if (!value) return <span className="text-gray-400">No notes</span>;
          const truncated = value.length > 80 ? `${value.substring(0, 80)}...` : value;
          return <span title={value}>{truncated}</span>;
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (_: any, row: any) => (
          <div className="flex items-center gap-2 justify-start">
            <Button
              key={`view-${row.id}`}
              variant="ghost"
              size="sm"
              onClick={() => handleView(row)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              key={`edit-${row.id}`}
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              key={`delete-${row.id}`}
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
    [handleView, handleEdit, handleDeleteClick]
  );

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ward Recommendations</h1>
          <p className="text-gray-600 text-sm mt-1">Manage ward recommendations for prisoners</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Recommendation
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        key={`table-${tableKey}`}
        url={tableUrl}
        title="Ward Recommendations"
        columns={columns}
        config={{
          search: true,
          export: {
            csv: true,
            pdf: true,
            print: true,
          },
        }}
      />

      {/* Form Dialog */}
      <Dialog
        key={`dialog-${dialogKey}`}
        open={dialogOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDialogOpen(false);
            setSelectedRecord(null);
          }
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e: Event) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Create Ward Recommendation' : 
               formMode === 'edit' ? 'Edit Ward Recommendation' : 
               'View Ward Recommendation'}
            </DialogTitle>
          </DialogHeader>
          <WardRecommendationForm
            mode={formMode}
            initialData={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Ward Recommendation"
        description="Are you sure you want to delete this ward recommendation? This action cannot be undone."
        details={
          recordToDelete ? (
            <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
              <p key="prisoner-info">
                <span className="font-medium">Prisoner:</span>{' '}
                {recordToDelete.prisoner_name} ({recordToDelete.prisoner_number})
              </p>
              <p key="ward-info">
                <span className="font-medium">Recommended Ward:</span> {recordToDelete.ward_name || 'N/A'}
              </p>
              {recordToDelete.recommendation_notes ? (
                <p key="notes-info">
                  <span className="font-medium">Notes:</span>{' '}
                  {recordToDelete.recommendation_notes.length > 100
                    ? `${recordToDelete.recommendation_notes.substring(0, 100)}...`
                    : recordToDelete.recommendation_notes}
                </p>
              ) : null}
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

export default WardRecommendationList;

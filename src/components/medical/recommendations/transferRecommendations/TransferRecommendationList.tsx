import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '../../../ui/dialog';
import { Plus, Eye, Pencil, Trash } from 'lucide-react';
import { toast } from 'sonner';
import TransferRecommendationForm from './TransferRecommendationForm';
import { DataTable } from '../../../common/DataTable';
import { DataTableColumn } from '../../../common/DataTable.types';
import ConfirmDialog from '../../../common/ConfirmDialog';
import { Badge } from '../../../ui/badge';
import {
  TransferRecommendation,
  fetchTransferRecommendationById,
  createTransferRecommendation,
  updateTransferRecommendation,
  deleteTransferRecommendation,
  TRANSFER_RECOMMENDATION_API_ENDPOINTS,
} from '../../../../services/medical/recommendations/transferRecommendationService';

interface TransferRecommendationListProps {
  selectedPrisonerId?: string;
}

const TransferRecommendationList: React.FC<TransferRecommendationListProps> = ({ selectedPrisonerId }) => {
  const [tableKey, setTableKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<TransferRecommendation | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<TransferRecommendation | null>(null);

  // Build table URL with filters
  const tableUrl = useMemo(() => {
    let url = TRANSFER_RECOMMENDATION_API_ENDPOINTS.TRANSFER_RECOMMENDATIONS.replace(/^\//, '');
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

  const handleView = useCallback(async (record: TransferRecommendation) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchTransferRecommendationById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('view');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch transfer recommendation details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  }, []);

  const handleEdit = useCallback(async (record: TransferRecommendation) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchTransferRecommendationById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch transfer recommendation details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  }, []);

  const handleFormSubmit = async (data: TransferRecommendation) => {
    try {
      if (formMode === 'create') {
        await createTransferRecommendation(data);
        toast.success('Transfer recommendation created successfully');
        setTableKey((prev) => prev + 1);
      } else if (formMode === 'edit' && selectedRecord?.id) {
        await updateTransferRecommendation(selectedRecord.id, data);
        toast.success('Transfer recommendation updated successfully');
        setTableKey((prev) => prev + 1);
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save transfer recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to save record');
      throw error;
    }
  };

  const handleDeleteClick = useCallback((record: TransferRecommendation) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!recordToDelete?.id) return;
    try {
      await deleteTransferRecommendation(recordToDelete.id);
      toast.success('Transfer recommendation deleted successfully');
      setTableKey((prev) => prev + 1);
      setRecordToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete transfer recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to delete record');
      throw error;
    }
  }, [recordToDelete]);

  const getCategoryBadge = (categoryName: string) => {
    const variants: { [key: string]: string } = {
      Emergency: 'bg-red-100 text-red-800',
      Urgent: 'bg-orange-100 text-orange-800',
      Routine: 'bg-blue-100 text-blue-800',
      Elective: 'bg-green-100 text-green-800',
      'Follow-up': 'bg-purple-100 text-purple-800',
    };

    return (
      <Badge className={variants[categoryName] || 'bg-gray-100 text-gray-800'}>
        {categoryName}
      </Badge>
    );
  };

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
        key: 'reason_name',
        label: 'Reason',
        render: (value: any) => value || 'N/A',
      },
      {
        key: 'hospital_name',
        label: 'Hospital',
        render: (value: any) => value || 'N/A',
      },
      {
        key: 'category_name',
        label: 'Category',
        render: (value: any) => {
          if (!value) return <span className="text-gray-400">N/A</span>;
          return getCategoryBadge(value);
        },
      },
      {
        key: 'recommendation_notes',
        label: 'Notes',
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
    [handleView, handleEdit, handleDeleteClick]
  );

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transfer Recommendations</h1>
          <p className="text-gray-600 text-sm mt-1">Manage transfer recommendations for prisoners</p>
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
        title="Transfer Recommendations"
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
              {formMode === 'create' ? 'Create Transfer Recommendation' : 
               formMode === 'edit' ? 'Edit Transfer Recommendation' : 
               'View Transfer Recommendation'}
            </DialogTitle>
          </DialogHeader>
          <TransferRecommendationForm
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
        title="Delete Transfer Recommendation"
        description="Are you sure you want to delete this transfer recommendation? This action cannot be undone."
        details={
          recordToDelete ? (
            <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
              <p key="prisoner-info">
                <span className="font-medium">Prisoner:</span>{' '}
                {recordToDelete.prisoner_name} ({recordToDelete.prisoner_number})
              </p>
              <p key="reason-info">
                <span className="font-medium">Reason:</span> {recordToDelete.reason_name || 'N/A'}
              </p>
              <p key="hospital-info">
                <span className="font-medium">Hospital:</span> {recordToDelete.hospital_name || 'N/A'}
              </p>
              <p key="category-info">
                <span className="font-medium">Category:</span> {recordToDelete.category_name || 'N/A'}
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

export default TransferRecommendationList;

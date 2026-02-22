import React, { useState } from 'react';
import { Button } from '../../../ui/button';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '../../../common/DataTable';
import { DataTableColumn } from '../../../common/DataTable.types';
import ConfirmDialog from '../../../common/ConfirmDialog';
import DeathNotificationForm from './DeathNotificationForm';
import DeathNotificationView from './DeathNotificationView';
import {
  fetchDeathNotificationById,
  createDeathNotification,
  updateDeathNotification,
  deleteDeathNotification,
  DeathNotificationItem as DeathNotification,
  DEATH_NOTIFICATION_API_ENDPOINTS,
} from '../../../../services/medical/deathDetails/deathNotificationService';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../ui/dialog';

interface DeathNotificationListProps {
  selectedPrisonerId?: string;
}

const DeathNotificationList: React.FC<DeathNotificationListProps> = ({ selectedPrisonerId }) => {
  const [tableKey, setTableKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DeathNotification | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DeathNotification | null>(null);

  // DataTable URL
  const tableUrl = DEATH_NOTIFICATION_API_ENDPOINTS.DEATH_NOTIFICATIONS;

  // Column definitions
  const columns: DataTableColumn[] = [
    {
      key: 'prisoner_name',
      label: 'Prisoner Name',
      sortable: true,
      render: (value: any) => (
        <span className="font-medium">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'death_confirmation',
      label: 'Death Confirmation ID',
      render: (value: any) => (
        <span className="font-mono text-sm">DC-{value?.slice(-8) || 'N/A'}</span>
      ),
    },
    {
      key: 'notification',
      label: 'Notification Template ID',
      render: (value: any) => (
        <span className="font-mono text-sm">NTF-{value?.slice(-8) || 'N/A'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: any, row: DeathNotification) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(row)} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} title="Edit">
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
  ];

  // Handlers
  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleView = async (record: DeathNotification) => {
    try {
      if (!record?.id) return;
      const full = await fetchDeathNotificationById(record.id);
      setSelectedRecord(full as DeathNotification);
      setViewDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to load notification details', error);
      toast.error(error?.response?.data?.message || 'Failed to load notification details');
    }
  };

  const handleEdit = async (record: DeathNotification) => {
    try {
      if (!record?.id) return;
      const full = await fetchDeathNotificationById(record.id);
      setSelectedRecord(full as DeathNotification);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to load notification for edit', error);
      toast.error(error?.response?.data?.message || 'Failed to load notification for edit');
    }
  };

  const handleFormSubmit = async (data: DeathNotification) => {
    try {
      if (formMode === 'create') {
        await createDeathNotification(data as any);
        toast.success('Death notification created successfully');
        setTableKey((prev) => prev + 1);
      } else if (formMode === 'edit' && selectedRecord?.id) {
        await updateDeathNotification(selectedRecord.id, data as any);
        toast.success('Death notification updated successfully');
        setTableKey((prev) => prev + 1);
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save death notification', error);
      toast.error(error?.response?.data?.message || 'Failed to save death notification');
      throw error;
    }
  };

  const handleDeleteClick = (record: DeathNotification) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete?.id) return;
    try {
      await deleteDeathNotification(recordToDelete.id);
      toast.success('Death notification deleted successfully');
      setTableKey((prev) => prev + 1);
      setRecordToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete notification', error);
      toast.error(error?.response?.data?.message || 'Failed to delete notification');
      throw error;
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Create Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleCreate}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Notification
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        key={tableKey}
        url={tableUrl}
        title=""
        columns={columns}
        searchPlaceholder="Search by prisoner name..."
      />

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto" onInteractOutside={(e: Event) => e.preventDefault()}>
          <DialogTitle>Death Notification Form</DialogTitle>
          <DialogDescription>
            Create or update death notifications.
          </DialogDescription>
          <DeathNotificationForm
            key={`form-${dialogKey}-${formMode}`}
            notification={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Death Notification Details</DialogTitle>
          <DialogDescription>
            View detailed information about this death notification and all recipients.
          </DialogDescription>
          {selectedRecord && (
            <DeathNotificationView
              deathNotification={selectedRecord}
              onClose={() => setViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Death Notification"
        description="Are you absolutely sure? This action cannot be undone."
        details={
          recordToDelete ? (
            <div className="space-y-2">
              <div><span className="font-semibold">Prisoner:</span> {recordToDelete.prisoner_name || 'N/A'}</div>
              <div><span className="font-semibold">Death Confirmation ID:</span> DC-{recordToDelete.death_confirmation?.slice(-8) || 'N/A'}</div>
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

export default DeathNotificationList;

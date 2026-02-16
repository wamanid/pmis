import React, { useState } from 'react';
import { Button } from '../../../ui/button';
import { Eye, Pencil, Trash2, Plus, FileText, Download, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DataTable } from '../../../common/DataTable';
import { DataTableColumn } from '../../../common/DataTable.types';
import ConfirmDialog from '../../../common/ConfirmDialog';
import DeathConfirmationForm from './DeathConfirmationForm';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../ui/dialog';
import {
  DeathConfirmation,
  fetchDeathConfirmationById,
  deleteDeathConfirmation,
  createDeathConfirmation,
  updateDeathConfirmation,
  DEATH_CONFIRMATION_API_ENDPOINTS,
} from '../../../../services/medical/deathDetails/deathConfirmationService';

interface DeathConfirmationListProps {}

const DeathConfirmationList: React.FC<DeathConfirmationListProps> = () => {
  const [tableKey, setTableKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<DeathConfirmation | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DeathConfirmation | null>(null);

  // DataTable URL
  const tableUrl = DEATH_CONFIRMATION_API_ENDPOINTS.DEATH_CONFIRMATIONS;

  // Column definitions
  const columns: DataTableColumn[] = [
    {
      key: 'prisoner_number_value',
      label: 'Prisoner Number',
      sortable: true,
      render: (value: any) => (
        <span className="font-mono text-sm">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'prisoner_name',
      label: 'Prisoner Name',
      sortable: true,
      render: (value: any) => (
        <span className="font-medium">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'date_of_death',
      label: 'Date of Death',
      sortable: true,
      render: (value: any) => {
        if (!value) return 'N/A';
        try {
          return format(new Date(value), 'MMM dd, yyyy');
        } catch {
          return value;
        }
      },
    },
    {
      key: 'place_of_death',
      label: 'Place of Death',
      render: (value: any) => (
        <div className="max-w-xs truncate" title={value || ''}>
          {value || 'N/A'}
        </div>
      ),
    },
    {
      key: 'cause_of_death',
      label: 'Cause of Death',
      render: (value: any) => (
        <div className="max-w-xs truncate" title={value || ''}>
          {value || 'N/A'}
        </div>
      ),
    },
    {
      key: 'officer_in_charge_name',
      label: 'Officer in Charge',
      render: (value: any) => (
        <div className="max-w-xs truncate" title={value || ''}>
          {value || 'N/A'}
        </div>
      ),
    },
    {
      key: 'medical_officer_name',
      label: 'Medical Officer',
      render: (value: any) => (
        <div className="max-w-xs truncate" title={value || ''}>
          {value || 'N/A'}
        </div>
      ),
    },
    {
      key: 'attachments',
      label: 'Documents',
      render: (_value: any, row: DeathConfirmation) => {
        const attachments = [
          { key: 'death_certificate', label: 'Death Certificate', url: row.death_certificate },
          { key: 'medical_form', label: 'Medical Form', url: row.medical_form },
          { key: 'pathologist_attachment', label: 'Pathologist Report', url: row.pathologist_attachment },
          { key: 'other_attachment', label: 'Other Documents', url: row.other_attachment },
        ];
        
        const existingAttachments = attachments.filter(att => att.url);
        const count = existingAttachments.length;
        const total = attachments.length;
        
        if (count === 0) {
          return (
            <span className="text-gray-400 text-sm">No documents</span>
          );
        }
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Paperclip className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      {count}/{total}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {existingAttachments.map((att) => (
                      <Button
                        key={att.key}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => window.open(att.url, '_blank')}
                        title={`Download ${att.label}`}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-semibold mb-1">Available Documents:</p>
                  {existingAttachments.map((att) => (
                    <div key={att.key} className="text-xs flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {att.label}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: any, row: DeathConfirmation) => (
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

  const handleView = async (record: DeathConfirmation) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchDeathConfirmationById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('view');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch death confirmation details:', error);
      toast.error(error.response?.data?.message || 'Failed to load death confirmation details');
    }
  };

  const handleEdit = async (record: DeathConfirmation) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchDeathConfirmationById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch death confirmation details:', error);
      toast.error(error.response?.data?.message || 'Failed to load death confirmation details');
    }
  };

  const handleFormComplete = () => {
    // Form has already handled submission, just refresh table and close dialog
    setTableKey((prev) => prev + 1);
    setDialogOpen(false);
  };

  const handleDeleteClick = (record: DeathConfirmation) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete?.id) return;
    try {
      await deleteDeathConfirmation(recordToDelete.id);
      toast.success('Death confirmation deleted successfully');
      setTableKey((prev) => prev + 1); // Force table refresh
      setRecordToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete death confirmation:', error);
      toast.error(error.response?.data?.message || 'Failed to delete death confirmation');
      throw error; // Let ConfirmDialog handle cleanup
    }
  };

  return (
    <>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-4 px-6 pt-6">
        <div>
          <h2 className="text-lg font-semibold">Death Confirmations</h2>
          <p className="text-sm text-muted-foreground">
            Manage prisoner death confirmation records with complete documentation
          </p>
        </div>
        <Button
          onClick={handleCreate}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Confirmation
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        key={tableKey}
        url={tableUrl}
        title=""
        columns={columns}
        searchPlaceholder="Search by prisoner name, number, cause, or place of death..."
      />

      {/* Form Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open: boolean) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedRecord(null);
          }
        }}
      >
        <DialogContent
          className="max-w-[1200px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e: any) => e.preventDefault()}
        >
          <DialogTitle>
            {formMode === 'create' && 'New Death Confirmation'}
            {formMode === 'edit' && 'Edit Death Confirmation'}
            {formMode === 'view' && 'View Death Confirmation'}
          </DialogTitle>
          <DialogDescription>
            {formMode === 'create' &&
              'Record and confirm prisoner death with complete documentation and medical details.'}
            {formMode === 'edit' &&
              'Update death confirmation record with complete documentation and medical details.'}
            {formMode === 'view' && 'View death confirmation record details.'}
          </DialogDescription>
          <DeathConfirmationForm
            key={`form-${dialogKey}-${formMode}`}
            confirmation={selectedRecord}
            onComplete={handleFormComplete}
            onCancel={() => setDialogOpen(false)}
            mode={formMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Death Confirmation"
        description="Are you absolutely sure? This action cannot be undone. This will permanently delete the death confirmation record."
        details={
          recordToDelete ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">Prisoner:</span>{' '}
                {recordToDelete.prisoner_number} - {recordToDelete.prisoner_name}
              </div>
              <div>
                <span className="font-semibold">Date of Death:</span>{' '}
                {recordToDelete.date_of_death
                  ? format(new Date(recordToDelete.date_of_death), 'MMM dd, yyyy')
                  : 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Cause of Death:</span>{' '}
                {recordToDelete.cause_of_death || 'N/A'}
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

export default DeathConfirmationList;

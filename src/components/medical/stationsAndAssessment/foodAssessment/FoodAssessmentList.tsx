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
import FoodAssessmentForm from './FoodAssessmentForm';
import { DataTable } from '../../../common/DataTable';
import { DataTableColumn } from '../../../common/DataTable.types';
import ConfirmDialog from '../../../common/ConfirmDialog';
import {
  FoodAssessment,
  fetchFoodAssessmentById,
  createFoodAssessment,
  updateFoodAssessment,
  deleteFoodAssessment,
  FOOD_ASSESSMENT_API_ENDPOINTS,
} from '../../../../services/medical/stationsAndAssessment/foodAssessmentService';

interface FoodAssessmentListProps {
  selectedStationId?: string;
}

const FoodAssessmentList: React.FC<FoodAssessmentListProps> = ({ selectedStationId }) => {
  const [tableKey, setTableKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<FoodAssessment | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<FoodAssessment | null>(null);

  // Build table URL with filters
  const tableUrl = useMemo(() => {
    let url = FOOD_ASSESSMENT_API_ENDPOINTS.FOOD_ASSESSMENTS.replace(/^\//, '');
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
        label: 'Station',
        render: (value: any) => (
          <span className="font-medium">{value || 'N/A'}</span>
        ),
      },
      {
        key: 'item_name',
        label: 'Food Item',
        render: (value: any) => value || 'N/A',
      },
      {
        key: 'quality_name',
        label: 'Quality Rating',
        render: (value: any) => {
          if (!value) return <Badge>N/A</Badge>;
          
          const variants: { [key: string]: string } = {
            Excellent: 'bg-green-100 text-green-800',
            Good: 'bg-blue-100 text-blue-800',
            Fair: 'bg-yellow-100 text-yellow-800',
            Poor: 'bg-orange-100 text-orange-800',
            Unacceptable: 'bg-red-100 text-red-800',
          };

          return (
            <Badge className={variants[value] || 'bg-gray-100 text-gray-800'}>
              {value}
            </Badge>
          );
        },
      },
      {
        key: 'notes',
        label: 'Notes',
        render: (value: any) => {
          if (!value) return <span className="text-gray-400">No notes</span>;
          const truncated = value.length > 60 ? `${value.substring(0, 60)}...` : value;
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
    []
  );

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleView = async (record: FoodAssessment) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchFoodAssessmentById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('view');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch food assessment details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  };

  const handleEdit = async (record: FoodAssessment) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchFoodAssessmentById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch food assessment details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  };

  const handleFormSubmit = async (data: FoodAssessment) => {
    try {
      if (formMode === 'create') {
        await createFoodAssessment(data);
        toast.success('Food assessment created successfully');
        setTableKey((prev) => prev + 1);
      } else if (formMode === 'edit' && selectedRecord?.id) {
        await updateFoodAssessment(selectedRecord.id, data);
        toast.success('Food assessment updated successfully');
        setTableKey((prev) => prev + 1);
      }
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to save food assessment:', error);
      toast.error(error.response?.data?.message || 'Failed to save record');
      throw error;
    }
  };

  const handleDeleteClick = (record: FoodAssessment) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete?.id) return;
    try {
      await deleteFoodAssessment(recordToDelete.id);
      toast.success('Food assessment deleted successfully');
      setTableKey((prev) => prev + 1);
      setRecordToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete food assessment:', error);
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
                Food Assessment Records
              </h3>
              <p className="text-sm text-gray-500">
                Track food quality assessments and observations for station meals
              </p>
            </div>
            <Button
              onClick={handleCreate}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Assessment
            </Button>
          </div>

          <DataTable
            key={tableKey}
            url={tableUrl}
            title="Food Assessments"
            columns={columns}
            searchPlaceholder="Search by station, food item, or quality..."
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
          className="max-w-[600px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e: Event) => e.preventDefault()}
        >
          <DialogTitle>
            {formMode === 'create' && 'New Food Assessment'}
            {formMode === 'edit' && 'Edit Food Assessment'}
            {formMode === 'view' && 'View Food Assessment'}
          </DialogTitle>
          <DialogDescription>
            Assess food quality and record observations for station meals.
          </DialogDescription>
          <FoodAssessmentForm
            key={`form-${dialogKey}-${formMode}`}
            assessment={selectedRecord}
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
        title="Delete Food Assessment"
        description="Are you absolutely sure? This action cannot be undone."
        details={
          recordToDelete ? (
            <div className="space-y-2 p-4 bg-gray-50 rounded-md">
              <div>
                <span className="font-semibold">Station:</span>{' '}
                {recordToDelete.station_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Food Item:</span>{' '}
                {recordToDelete.item_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Quality Rating:</span>{' '}
                {recordToDelete.quality_name || 'N/A'}
              </div>
              {recordToDelete.notes && (
                <div>
                  <span className="font-semibold">Notes:</span>{' '}
                  <span className="text-sm">{recordToDelete.notes.substring(0, 100)}</span>
                </div>
              )}
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

export default FoodAssessmentList;

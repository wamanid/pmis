import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../ui/button';
import { Plus, Eye, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import DietaryRequirementForm from './DietaryRequirementForm';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../../ui/dialog';
import { DataTable } from '../../../common/DataTable';
import { DataTableColumn, DataTableConfig } from '../../../common/DataTable.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { useFilters } from '../../../../contexts/FilterContext';
import { Badge } from '../../../ui/badge';
import ConfirmDialog from '../../../common/ConfirmDialog';
import {
  DietaryRequirement,
  DIETARY_REQUIREMENT_API_ENDPOINTS,
  fetchDietaryRequirementById,
  deleteDietaryRequirement,
} from '../../../../services/medical/restrictionAndDietary/dietaryRequirementService';

type ViewMode = 'flat' | 'grouped';

const DietaryRequirementList: React.FC = () => {
  const {} = useFilters();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grouped'); // Default to grouped
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<DietaryRequirement | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [recordToDelete, setRecordToDelete] = useState<DietaryRequirement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  // Construct table URL
  // TODO: Add prisoner filter when backend supports it
  // Backend currently returns 400 Bad Request for prisoner_restriction parameter
  const tableUrl = useMemo(() => {
    // const params = new URLSearchParams();
    // if (selectedPrisonerId) {
    //   params.append('prisoner_restriction', selectedPrisonerId);
    // }
    // const queryString = params.toString();
    // return queryString
    //   ? `${DIETARY_REQUIREMENT_API_ENDPOINTS.LIST.replace(/^\//, '')}?${queryString}`
    //   : DIETARY_REQUIREMENT_API_ENDPOINTS.LIST.replace(/^\//, '');
    
    // For now, return base URL without filters
    return DIETARY_REQUIREMENT_API_ENDPOINTS.LIST.replace(/^\//, '');
  }, []);

  const handleCreate = () => {
    setSelectedRecord(null);
    setFormMode('create');
    setDialogKey((prev) => prev + 1);
    setDialogOpen(true);
  };

  const handleView = async (record: DietaryRequirement) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchDietaryRequirementById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('view');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch dietary requirement details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  };

  const handleEdit = async (record: DietaryRequirement) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }
    try {
      const fullRecord = await fetchDietaryRequirementById(record.id);
      setSelectedRecord(fullRecord);
      setFormMode('edit');
      setDialogKey((prev) => prev + 1);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to fetch dietary requirement details:', error);
      toast.error(error.response?.data?.message || 'Failed to load record details');
    }
  };

  const handleFormSubmit = async (data: DietaryRequirement) => {
    setDialogOpen(false);
    // Force table refresh
    setTableKey((prev) => prev + 1);
  };

  const handleDeleteClick = (record: DietaryRequirement) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete?.id) return;
    try {
      await deleteDietaryRequirement(recordToDelete.id);
      toast.success('Dietary requirement deleted successfully');
      setTableKey((prev) => prev + 1);
      setRecordToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete dietary requirement:', error);
      toast.error(error.response?.data?.message || 'Failed to delete record');
      throw error;
    }
  };

  const isActive = (record: DietaryRequirement) => {
    const today = new Date();
    const startDate = new Date(record.start_date);
    const endDate = record.end_date ? new Date(record.end_date) : null;
    
    if (today < startDate) return false;
    if (endDate && today > endDate) return false;
    return true;
  };

  // Define columns for DataTable
  const columns: DataTableColumn[] = useMemo(
    () => [
      {
        key: 'prisoner_name',
        label: 'Prisoner',
        sortable: true,
        render: (_: any, row: DietaryRequirement) => {
          const prisonerName = row.prisoner_name || 'Unknown Prisoner';
          // TODO: Add prisoner_number when API is updated
          // const prisonerNumber = row.prisoner_number || 'N/A';
          
          return (
            <div className="flex flex-col">
              <span className="font-medium">{prisonerName}</span>
              {/* TODO: Uncomment when prisoner_number is added to API */}
              {/* <span className="text-xs text-muted-foreground font-mono">{prisonerNumber}</span> */}
            </div>
          );
        },
      },
      {
        key: 'dietary_requirement',
        label: 'Dietary Requirement',
        sortable: true,
        render: (value: string, row: DietaryRequirement) => (
          <div className="max-w-md">
            <div className="line-clamp-2" title={value}>
              {value}
            </div>
          </div>
        ),
      },
      {
        key: 'start_date',
        label: 'Start Date',
        sortable: true,
        render: (value: string) => {
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
        render: (value: string) => {
          if (!value) return 'Ongoing';
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
        render: (value: any, row: DietaryRequirement) => {
          const active = isActive(row);
          return (
            <Badge className={active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {active ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        key: 'id',
        label: 'Actions',
        render: (value: any, row: DietaryRequirement) => (
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
              <Edit className="h-4 w-4" />
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
    []
  );

  /**
   * DataTable configuration with conditional grouping
   */
  const tableConfig: DataTableConfig = useMemo(() => {
    // If viewing grouped mode and not filtering by specific prisoner
    // TODO: Re-enable prisoner filter condition when backend supports filtering
    if (viewMode === 'grouped') { // Removed: && !selectedPrisonerId
      return {
        search: true,
        export: {
          pdf: true,
          csv: true,
          print: true,
        },
        lengthMenu: [10, 50, 100, -1],
        pagination: true,
        summary: true,
        rowSpacing: 'normal',
        grouping: {
          groupBy: 'prisoner_name',
          defaultExpanded: false,
          renderGroupHeader: (groupValue, items: any[]) => {
            // Calculate summary stats
            const activeCount = items.filter((item: any) => isActive(item)).length;
            const inactiveCount = items.length - activeCount;
            
            // Get prisoner info (groupValue is prisoner_name)
            const prisonerName = groupValue || 'Unknown Prisoner';
            // TODO: Add prisoner_number when API is updated
            // const prisonerNumber = items[0]?.prisoner_number || 'N/A';
            
            // Get date range
            const startDates = items
              .map((item: any) => item.start_date)
              .filter(Boolean)
              .sort();
            const endDates = items
              .map((item: any) => item.end_date)
              .filter(Boolean)
              .sort();
            
            const earliestStart = startDates[0];
            const latestEnd = endDates[endDates.length - 1];
            
            return (
              <div className="flex items-center justify-between w-full">
                {/* Prisoner Info */}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" style={{ color: '#650000' }} />
                  <div>
                    <div className="font-semibold text-base">
                      {prisonerName}
                      {/* TODO: Add prisoner number when API updated: {prisonerNumber} | {prisonerName} */}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {items.length} dietary {items.length === 1 ? 'requirement' : 'requirements'}
                    </div>
                    {earliestStart && (
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(earliestStart), 'PP')}
                        {latestEnd && ` → ${format(parseISO(latestEnd), 'PP')}`}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Summary Stats */}
                <div className="flex items-center gap-6 mr-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Active</div>
                    <div className="text-lg font-semibold text-green-600">{activeCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Inactive</div>
                    <div className="text-lg font-semibold text-gray-500">{inactiveCount}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="text-lg font-semibold" style={{ color: '#650000' }}>
                      {items.length}
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        },
      };
    }
    
    // Flat view configuration (no grouping)
    return {
      search: true,
      export: {
        pdf: true,
        csv: true,
        print: true,
      },
      lengthMenu: [10, 50, 100, -1],
      pagination: true,
      summary: true,
      rowSpacing: 'normal',
    };
  }, [viewMode]); // Removed: selectedPrisonerId dependency

  return (
    <>
      <div className="space-y-4">
        {/* Header with View Toggle and Add Button */}
        <div className="flex items-center justify-between">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList>
              <TabsTrigger value="grouped">
                <Users className="h-4 w-4 mr-2" />
                Grouped
              </TabsTrigger>
              <TabsTrigger value="flat">
                Flat
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onClick={handleCreate}
            style={{ backgroundColor: '#650000' }}
            className="text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>

        {/* Single DataTable with conditional grouping */}
        <DataTable
          key={tableKey}
          url={tableUrl}
          title="Dietary Requirements"
          columns={columns}
          config={tableConfig}
          searchPlaceholder="Search by prisoner, requirement..."
        />
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-[1200px] max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e: any) => e.preventDefault()}
        >
          <DialogTitle>Dietary Requirement Form</DialogTitle>
          <DialogDescription>
            Add or edit a dietary requirement for a prisoner restriction.
          </DialogDescription>
          <DietaryRequirementForm
            key={`form-${dialogKey}-${formMode}`}
            requirement={selectedRecord}
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
        title="Delete Dietary Requirement"
        description="Are you absolutely sure? This action cannot be undone."
        details={
          recordToDelete ? (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Prisoner:</span> {recordToDelete.prisoner_name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Requirement:</span>{' '}
                <span className="line-clamp-2">{recordToDelete.dietary_requirement}</span>
              </div>
              <div>
                <span className="font-semibold">Start Date:</span>{' '}
                {new Date(recordToDelete.start_date).toLocaleDateString()}
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

export default DietaryRequirementList;

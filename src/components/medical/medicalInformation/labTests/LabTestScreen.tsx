import React, { useState } from 'react';
import { TestTube, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import LabTestForm from './LabTestForm';
import LabTestList from './LabTestList';

const LabTestScreen: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedRecord(null);
    setShowDialog(true);
  };

  const handleView = (record: any) => {
    setDialogMode('view');
    setSelectedRecord(record);
    setShowDialog(true);
  };

  const handleEdit = (record: any) => {
    setDialogMode('edit');
    setSelectedRecord(record);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = (data: any) => {
    setShowDialog(false);
    setSelectedRecord(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setSelectedRecord(null);
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 style={{ color: '#650000' }}>Laboratory Tests</h1>
          <p className="text-gray-600">
            Manage and track prisoner laboratory test requests and results
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Lab Test
        </Button>
      </div>

      {/* Lab Test List */}
      <LabTestList
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        refreshTrigger={refreshTrigger}
      />

      {/* Dialog for Create/Edit/View */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <TestTube className="h-5 w-5" />
              {dialogMode === 'create' && 'New Lab Test'}
              {dialogMode === 'edit' && 'Edit Lab Test'}
              {dialogMode === 'view' && 'View Lab Test'}
            </DialogTitle>
          </DialogHeader>
          <LabTestForm
            labTest={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabTestScreen;
import React, { useState } from 'react';
import { Activity, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import BMIForm from './BMIForm';
import BMIList from './BMIList';

const BMIScreen: React.FC = () => {
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
          <h1 style={{ color: '#650000' }}>BMI Records</h1>
          <p className="text-gray-600">
            Track and monitor prisoner Body Mass Index measurements and classifications
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New BMI Record
        </Button>
      </div>

      {/* BMI List */}
      <BMIList
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
              <Activity className="h-5 w-5" />
              {dialogMode === 'create' && 'New BMI Record'}
              {dialogMode === 'edit' && 'Edit BMI Record'}
              {dialogMode === 'view' && 'View BMI Record'}
            </DialogTitle>
          </DialogHeader>
          <BMIForm
            bmiRecord={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BMIScreen;

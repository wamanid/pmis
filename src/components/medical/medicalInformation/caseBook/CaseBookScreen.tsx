import React, { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import CaseBookForm from './CaseBookForm';
import CaseBookList from './CaseBookList';

const CaseBookScreen: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCaseBook, setSelectedCaseBook] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedCaseBook(null);
    setShowDialog(true);
  };

  const handleView = (caseBook: any) => {
    setDialogMode('view');
    setSelectedCaseBook(caseBook);
    setShowDialog(true);
  };

  const handleEdit = (caseBook: any) => {
    setDialogMode('edit');
    setSelectedCaseBook(caseBook);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    // The delete is handled in the list component
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = (data: any) => {
    setShowDialog(false);
    setSelectedCaseBook(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setSelectedCaseBook(null);
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 style={{ color: '#650000' }}>Medical Case Book</h1>
          <p className="text-gray-600">
            Manage and track prisoner medical case records, examinations, and health assessments
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Case Book Entry
        </Button>
      </div>

      {/* Case Book List */}
      <CaseBookList
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
              <FileText className="h-5 w-5" />
              {dialogMode === 'create' && 'New Case Book Entry'}
              {dialogMode === 'edit' && 'Edit Case Book Entry'}
              {dialogMode === 'view' && 'View Case Book Entry'}
            </DialogTitle>
          </DialogHeader>
          <CaseBookForm
            caseBook={selectedCaseBook}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseBookScreen;

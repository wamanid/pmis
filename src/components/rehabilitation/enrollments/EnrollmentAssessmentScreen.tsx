import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Plus } from 'lucide-react';
import EnrollmentAssessmentForm from './EnrollmentAssessmentForm';
import EnrollmentAssessmentList from './EnrollmentAssessmentList';

interface EnrollmentAssessment {
  id?: string;
  prisoner_name?: string;
  programme_name?: string;
  status_name?: string;
  start_date: string;
  end_date: string;
  board_members: string;
  remarks: string;
  enrollment: string;
  status: string;
}

const EnrollmentAssessmentScreen: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAssessment, setSelectedAssessment] = useState<EnrollmentAssessment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedAssessment(null);
    setShowDialog(true);
  };

  const handleView = (assessment: EnrollmentAssessment) => {
    setDialogMode('view');
    setSelectedAssessment(assessment);
    setShowDialog(true);
  };

  const handleEdit = (assessment: EnrollmentAssessment) => {
    setDialogMode('edit');
    setSelectedAssessment(assessment);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setAssessmentToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // Simulate API call
    toast.success('Assessment deleted successfully');
    setShowDeleteDialog(false);
    setAssessmentToDelete(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = (data: EnrollmentAssessment) => {
    // Simulate API call
    if (dialogMode === 'create') {
      toast.success('Assessment created successfully');
    } else {
      toast.success('Assessment updated successfully');
    }
    setShowDialog(false);
    setSelectedAssessment(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setSelectedAssessment(null);
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 style={{ color: '#650000' }}>Enrollment Assessments</h1>
          <p className="text-gray-600">Manage and track rehabilitation programme assessments</p>
        </div>
        <Button onClick={handleCreate} style={{ backgroundColor: '#650000' }} className="text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Assessment List */}
      <EnrollmentAssessmentList
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        refreshTrigger={refreshTrigger}
      />

      {/* Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto" style={{ width: '1200px' }}>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' && 'Create New Assessment'}
              {dialogMode === 'edit' && 'Edit Assessment'}
              {dialogMode === 'view' && 'View Assessment Details'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' && 'Create a new assessment for a prisoner enrollment'}
              {dialogMode === 'edit' && 'Update assessment information'}
              {dialogMode === 'view' && 'View detailed information about this assessment'}
            </DialogDescription>
          </DialogHeader>
          <EnrollmentAssessmentForm
            assessment={selectedAssessment}
            mode={dialogMode}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assessment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              style={{ backgroundColor: '#650000' }}
              className="text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EnrollmentAssessmentScreen;

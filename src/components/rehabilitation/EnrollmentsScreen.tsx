import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import RehabilitationEnrollmentForm from './RehabilitationEnrollmentForm';
import RehabilitationEnrollmentList from './RehabilitationEnrollmentList';

interface RehabilitationEnrollment {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  programme_name?: string;
  programme_stage_name?: string;
  sponsor_name?: string;
  responsible_officer_name?: string;
  progress_status_name?: string;
  prisoner_opinion: string;
  date_of_enrollment: string;
  start_date: string;
  end_date: string;
  certificate_awarded: boolean;
  certification_document: string;
  comment: string;
  prisoner: string;
  programme: string;
  programme_stage: string;
  rehabilitation_sponsor: string;
  responsible_officer: number;
  progress_status: string;
}

const EnrollmentsScreen: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEnrollment, setSelectedEnrollment] = useState<RehabilitationEnrollment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedEnrollment(null);
    setShowDialog(true);
  };

  const handleView = (enrollment: RehabilitationEnrollment) => {
    setDialogMode('view');
    setSelectedEnrollment(enrollment);
    setShowDialog(true);
  };

  const handleEdit = (enrollment: RehabilitationEnrollment) => {
    setDialogMode('edit');
    setSelectedEnrollment(enrollment);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setEnrollmentToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // Simulate API call
    toast.success('Enrollment deleted successfully');
    setShowDeleteDialog(false);
    setEnrollmentToDelete(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = (data: RehabilitationEnrollment) => {
    // Simulate API call
    if (dialogMode === 'create') {
      toast.success('Enrollment created successfully');
    } else {
      toast.success('Enrollment updated successfully');
    }
    setShowDialog(false);
    setSelectedEnrollment(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setSelectedEnrollment(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: '#650000' }}>Enrollments</h1>
          <p className="text-gray-600">Manage prisoner enrollments in rehabilitation programmes</p>
        </div>
        <Button
          onClick={handleCreate}
          style={{ backgroundColor: '#650000' }}
          className="text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Enrollment
        </Button>
      </div>

      {/* Enrollment List */}
      <RehabilitationEnrollmentList
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
              {dialogMode === 'create' && 'Create New Enrollment'}
              {dialogMode === 'edit' && 'Edit Enrollment'}
              {dialogMode === 'view' && 'View Enrollment Details'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' && 'Enroll a prisoner in a rehabilitation programme'}
              {dialogMode === 'edit' && 'Update enrollment information'}
              {dialogMode === 'view' && 'View enrollment details and progress'}
            </DialogDescription>
          </DialogHeader>
          <RehabilitationEnrollmentForm
            enrollment={selectedEnrollment}
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
              This action cannot be undone. This will permanently delete the enrollment record.
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

export default EnrollmentsScreen;

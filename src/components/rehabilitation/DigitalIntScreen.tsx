import React, { useState } from 'react';
import { Mail, Phone, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner@2.0.3';
import ELetterList from './ELetterList';
import CallRecordList from './CallRecordList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import ELetterForm from './ELetterForm';
import CallRecordForm from './CallRecordForm';

const DigitalIntScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'eletters' | 'callrecords'>('eletters');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // e-Letter Dialog states
  const [showELetterDialog, setShowELetterDialog] = useState(false);
  const [eLetterDialogMode, setELetterDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedELetter, setSelectedELetter] = useState<any>(null);

  // Call Record Dialog states
  const [showCallRecordDialog, setShowCallRecordDialog] = useState(false);
  const [callRecordDialogMode, setCallRecordDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCallRecord, setSelectedCallRecord] = useState<any>(null);

  // Delete Dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  // Create button handler
  const handleCreateClick = () => {
    switch (activeTab) {
      case 'eletters':
        setELetterDialogMode('create');
        setSelectedELetter(null);
        setShowELetterDialog(true);
        break;
      case 'callrecords':
        setCallRecordDialogMode('create');
        setSelectedCallRecord(null);
        setShowCallRecordDialog(true);
        break;
    }
  };

  // e-Letter handlers
  const handleViewELetter = (eLetter: any) => {
    setELetterDialogMode('view');
    setSelectedELetter(eLetter);
    setShowELetterDialog(true);
  };

  const handleEditELetter = (eLetter: any) => {
    setELetterDialogMode('edit');
    setSelectedELetter(eLetter);
    setShowELetterDialog(true);
  };

  const handleDeleteELetter = (id: string) => {
    setDeleteTarget({ type: 'eletter', id });
    setShowDeleteDialog(true);
  };

  const handleELetterSubmit = (data: any) => {
    toast.success(
      eLetterDialogMode === 'create'
        ? 'e-Letter created successfully'
        : 'e-Letter updated successfully'
    );
    setShowELetterDialog(false);
    setSelectedELetter(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Call Record handlers
  const handleViewCallRecord = (callRecord: any) => {
    setCallRecordDialogMode('view');
    setSelectedCallRecord(callRecord);
    setShowCallRecordDialog(true);
  };

  const handleEditCallRecord = (callRecord: any) => {
    setCallRecordDialogMode('edit');
    setSelectedCallRecord(callRecord);
    setShowCallRecordDialog(true);
  };

  const handleDeleteCallRecord = (id: string) => {
    setDeleteTarget({ type: 'callrecord', id });
    setShowDeleteDialog(true);
  };

  const handleCallRecordSubmit = (data: any) => {
    toast.success(
      callRecordDialogMode === 'create'
        ? 'Call record created successfully'
        : 'Call record updated successfully'
    );
    setShowCallRecordDialog(false);
    setSelectedCallRecord(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Delete confirmation
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const messages = {
      eletter: 'e-Letter deleted successfully',
      callrecord: 'Call record deleted successfully',
    };

    toast.success(messages[deleteTarget.type as keyof typeof messages]);
    setShowDeleteDialog(false);
    setDeleteTarget(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 style={{ color: '#650000' }}>Digital Rehabilitation Integration</h1>
          <p className="text-gray-600">
            Manage electronic letters and call records for prisoner rehabilitation and family communication
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === 'eletters' ? 'New e-Letter' : 'New Call Record'}
        </Button>
      </div>

      {/* Tabs Section */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b items-center flex-wrap">
            <div className="flex gap-2 flex-1 flex-wrap">
              <button
                onClick={() => setActiveTab('eletters')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                  activeTab === 'eletters'
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{
                  backgroundColor: activeTab === 'eletters' ? '#650000' : undefined,
                }}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Mail className="h-4 w-4" />
                  <span>e-Letters</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('callrecords')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                  activeTab === 'callrecords'
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{
                  backgroundColor: activeTab === 'callrecords' ? '#650000' : undefined,
                }}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Phone className="h-4 w-4" />
                  <span>Call Records</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'eletters' && (
              <ELetterList
                onView={handleViewELetter}
                onEdit={handleEditELetter}
                onDelete={handleDeleteELetter}
                refreshTrigger={refreshTrigger}
              />
            )}

            {activeTab === 'callrecords' && (
              <CallRecordList
                onView={handleViewCallRecord}
                onEdit={handleEditCallRecord}
                onDelete={handleDeleteCallRecord}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* e-Letter Dialog */}
      <Dialog open={showELetterDialog} onOpenChange={setShowELetterDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {eLetterDialogMode === 'create' && 'Create New e-Letter'}
              {eLetterDialogMode === 'edit' && 'Edit e-Letter'}
              {eLetterDialogMode === 'view' && 'View e-Letter Details'}
            </DialogTitle>
          </DialogHeader>
          <ELetterForm
            eLetter={selectedELetter}
            onSubmit={handleELetterSubmit}
            onCancel={() => {
              setShowELetterDialog(false);
              setSelectedELetter(null);
            }}
            mode={eLetterDialogMode}
          />
        </DialogContent>
      </Dialog>

      {/* Call Record Dialog */}
      <Dialog open={showCallRecordDialog} onOpenChange={setShowCallRecordDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {callRecordDialogMode === 'create' && 'Create New Call Record'}
              {callRecordDialogMode === 'edit' && 'Edit Call Record'}
              {callRecordDialogMode === 'view' && 'View Call Record Details'}
            </DialogTitle>
          </DialogHeader>
          <CallRecordForm
            callRecord={selectedCallRecord}
            onSubmit={handleCallRecordSubmit}
            onCancel={() => {
              setShowCallRecordDialog(false);
              setSelectedCallRecord(null);
            }}
            mode={callRecordDialogMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              {deleteTarget?.type === 'eletter' ? 'e-letter' : 'call record'} from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DigitalIntScreen;

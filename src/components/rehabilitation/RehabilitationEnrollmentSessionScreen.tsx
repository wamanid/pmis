import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, Calendar } from 'lucide-react';
import RehabilitationEnrollmentSessionForm from './RehabilitationEnrollmentSessionForm';
import RehabilitationEnrollmentSessionList from './RehabilitationEnrollmentSessionList';

interface EnrollmentSession {
  id: string;
  prisoner_name: string;
  programme_name: string;
  session_date: string;
  session_duration: number;
  remarks: string;
  enrollment: string;
}

const RehabilitationEnrollmentSessionScreen: React.FC = () => {
  const [sessions, setSessions] = useState<EnrollmentSession[]>([
    {
      id: '1',
      prisoner_name: 'John Doe',
      programme_name: 'Vocational Training',
      session_date: '2025-11-01',
      session_duration: 120,
      remarks: 'Excellent progress in carpentry skills. Student shows great attention to detail.',
      enrollment: '1'
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      programme_name: 'Education Programme',
      session_date: '2025-11-02',
      session_duration: 90,
      remarks: 'Completed mathematics module with good understanding.',
      enrollment: '2'
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      programme_name: 'Counseling Services',
      session_date: '2025-11-03',
      session_duration: 60,
      remarks: 'Productive counseling session. Patient is opening up more.',
      enrollment: '3'
    },
    {
      id: '4',
      prisoner_name: 'Robert Williams',
      programme_name: 'Substance Abuse Recovery',
      session_date: '2025-11-04',
      session_duration: 75,
      remarks: 'Group therapy session focused on coping mechanisms.',
      enrollment: '4'
    },
    {
      id: '5',
      prisoner_name: 'Mary Brown',
      programme_name: 'Vocational Training',
      session_date: '2025-11-05',
      session_duration: 150,
      remarks: 'Practical workshop on welding techniques. Safety protocols reviewed.',
      enrollment: '5'
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<EnrollmentSession | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');

  const handleCreate = () => {
    setCurrentSession(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleView = (session: EnrollmentSession) => {
    setCurrentSession(session);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (session: EnrollmentSession) => {
    setCurrentSession(session);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success('Session deleted successfully');
  };

  const handleSubmit = (data: EnrollmentSession) => {
    if (dialogMode === 'create') {
      const newSession: EnrollmentSession = {
        ...data,
        id: Date.now().toString(),
        prisoner_name: 'John Doe', // In real app, fetch from enrollment
        programme_name: 'Vocational Training' // In real app, fetch from enrollment
      };
      setSessions(prev => [newSession, ...prev]);
      toast.success('Session created successfully');
    } else if (dialogMode === 'edit') {
      setSessions(prev =>
        prev.map(s => (s.id === currentSession?.id ? { ...s, ...data } : s))
      );
      toast.success('Session updated successfully');
    }
    setDialogOpen(false);
    setCurrentSession(null);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setCurrentSession(null);
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case 'create':
        return 'Create New Session';
      case 'edit':
        return 'Edit Session';
      case 'view':
        return 'View Session Details';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#650000' }}
              >
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Enrollment Sessions</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Manage rehabilitation programme enrollment sessions
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              style={{ backgroundColor: '#650000' }}
              className="text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Sessions List */}
      <RehabilitationEnrollmentSessionList
        sessions={sessions}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Dialog for Create/Edit/View */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <RehabilitationEnrollmentSessionForm
            session={currentSession}
            mode={dialogMode}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RehabilitationEnrollmentSessionScreen;

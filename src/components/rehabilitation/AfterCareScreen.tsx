import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, HeartHandshake } from 'lucide-react';
import AfterCareForm from './AfterCareForm';
import AfterCareList from './AfterCareList';

interface AfterCare {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  activity_name: string;
  officer_name: string;
  description: string;
  photo?: string;
  prisoner: string;
  after_care_activity: string;
  officer: number;
}

const AfterCareScreen: React.FC = () => {
  const [afterCares, setAfterCares] = useState<AfterCare[]>([
    {
      id: '1',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR-2024-001',
      activity_name: 'Job Placement Assistance',
      officer_name: 'Officer Sarah Johnson',
      description: 'Assisted with job application at local manufacturing company. Resume prepared and submitted. Interview scheduled for next week.',
      photo: '',
      prisoner: '1',
      after_care_activity: '1',
      officer: 1
    },
    {
      id: '2',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR-2024-002',
      activity_name: 'Housing Support',
      officer_name: 'Officer David Brown',
      description: 'Connected with local housing authority. Application for transitional housing submitted. Awaiting approval.',
      photo: '',
      prisoner: '2',
      after_care_activity: '2',
      officer: 2
    },
    {
      id: '3',
      prisoner_name: 'Michael Johnson',
      prisoner_number: 'PR-2024-003',
      activity_name: 'Family Reunification',
      officer_name: 'Officer Emily Davis',
      description: 'First family counseling session completed successfully. Both parties showed positive engagement and willingness to rebuild relationship.',
      photo: '',
      prisoner: '3',
      after_care_activity: '3',
      officer: 3
    },
    {
      id: '4',
      prisoner_name: 'Robert Williams',
      prisoner_number: 'PR-2024-004',
      activity_name: 'Mental Health Counseling',
      officer_name: 'Officer Michael Wilson',
      description: 'Ongoing weekly therapy sessions. Patient showing improvement in managing anxiety and stress. Medication compliance good.',
      photo: '',
      prisoner: '4',
      after_care_activity: '4',
      officer: 4
    },
    {
      id: '5',
      prisoner_name: 'Mary Brown',
      prisoner_number: 'PR-2024-005',
      activity_name: 'Skills Training Follow-up',
      officer_name: 'Officer Jennifer Martinez',
      description: 'Enrolled in advanced carpentry course at community college. Attending classes regularly. Instructor reports excellent progress.',
      photo: '',
      prisoner: '5',
      after_care_activity: '5',
      officer: 5
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAfterCare, setCurrentAfterCare] = useState<AfterCare | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');

  const handleCreate = () => {
    setCurrentAfterCare(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleView = (afterCare: AfterCare) => {
    setCurrentAfterCare(afterCare);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (afterCare: AfterCare) => {
    setCurrentAfterCare(afterCare);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAfterCares(prev => prev.filter(a => a.id !== id));
    toast.success('After care record deleted successfully');
  };

  const handleSubmit = (data: AfterCare) => {
    if (dialogMode === 'create') {
      const newAfterCare: AfterCare = {
        ...data,
        id: Date.now().toString(),
        prisoner_name: 'John Doe', // In real app, fetch from prisoner API
        prisoner_number: 'PR-2024-001', // In real app, fetch from prisoner API
        activity_name: 'Job Placement Assistance', // In real app, fetch from activity API
        officer_name: 'Officer Sarah Johnson' // In real app, fetch from officer/HRMIS API
      };
      setAfterCares(prev => [newAfterCare, ...prev]);
      toast.success('After care record created successfully');
    } else if (dialogMode === 'edit') {
      setAfterCares(prev =>
        prev.map(a => (a.id === currentAfterCare?.id ? { ...a, ...data } : a))
      );
      toast.success('After care record updated successfully');
    }
    setDialogOpen(false);
    setCurrentAfterCare(null);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setCurrentAfterCare(null);
  };

  const getDialogTitle = () => {
    switch (dialogMode) {
      case 'create':
        return 'Create New After Care Record';
      case 'edit':
        return 'Edit After Care Record';
      case 'view':
        return 'View After Care Details';
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
                <HeartHandshake className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Prisoner After Care</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Manage post-release support and reintegration activities
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              style={{ backgroundColor: '#650000' }}
              className="text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New After Care Record
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* After Care List */}
      <AfterCareList
        afterCares={afterCares}
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
          <AfterCareForm
            afterCare={currentAfterCare}
            mode={dialogMode}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AfterCareScreen;

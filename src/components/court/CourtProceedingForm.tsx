import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { Save, X, Trash2 } from 'lucide-react';
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

interface CourtProceedingFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CourtProceedingRecord | null;
}

interface CourtProceedingRecord {
  id?: string;
  court_attendance_details?: string;
  prisoner_name?: string;
  transcript?: string;
  court_attendance?: string;
}

interface CourtAttendanceRecord {
  id: string;
  prisoner_name: string;
  court_name: string;
  attendance_datetime: string;
  criminal_case_number: string;
}

// Mock data for court attendance dropdown
const mockCourtAttendanceRecords: CourtAttendanceRecord[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    court_name: 'High Court - Kampala',
    attendance_datetime: '2025-10-15T09:00:00',
    criminal_case_number: 'HCT-00-CR-0123-2025'
  },
  {
    id: '2',
    prisoner_name: 'Jane Smith',
    court_name: 'Chief Magistrates Court - Kampala',
    attendance_datetime: '2025-10-16T10:30:00',
    criminal_case_number: 'CMC-00-CR-0456-2025'
  },
  {
    id: '3',
    prisoner_name: 'Michael Johnson',
    court_name: 'Magistrates Court - Nakawa',
    attendance_datetime: '2025-10-17T14:00:00',
    criminal_case_number: 'MC-NAK-CR-0789-2025'
  },
];

const CourtProceedingForm: React.FC<CourtProceedingFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData
}) => {
  const [formData, setFormData] = useState({
    court_attendance: '',
    court_attendance_details: '',
    prisoner_name: '',
    transcript: ''
  });

  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courtAttendanceRecords, setCourtAttendanceRecords] = useState<CourtAttendanceRecord[]>([]);

  useEffect(() => {
    // Load court attendance records
    setCourtAttendanceRecords(mockCourtAttendanceRecords);
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        court_attendance: editData.court_attendance || '',
        court_attendance_details: editData.court_attendance_details || '',
        prisoner_name: editData.prisoner_name || '',
        transcript: editData.transcript || ''
      });
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setFormData({
      court_attendance: '',
      court_attendance_details: '',
      prisoner_name: '',
      transcript: ''
    });
  };

  const handleCourtAttendanceChange = (value: string) => {
    const selectedRecord = courtAttendanceRecords.find(r => r.id === value);
    setFormData({
      ...formData,
      court_attendance: value,
      prisoner_name: selectedRecord?.prisoner_name || '',
      court_attendance_details: selectedRecord 
        ? `${selectedRecord.court_name} - ${selectedRecord.criminal_case_number} - ${new Date(selectedRecord.attendance_datetime).toLocaleString()}`
        : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.court_attendance) {
      toast.error('Please select a court attendance record');
      return;
    }

    if (!formData.transcript?.trim()) {
      toast.error('Please enter the proceeding transcript');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editData?.id) {
        toast.success('Court proceeding updated successfully');
      } else {
        toast.success('Court proceeding created successfully');
      }
      
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editData?.id) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Court proceeding deleted successfully');
      setShowDeleteDialog(false);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to delete court proceeding');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[1300px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editData ? 'Edit Court Proceeding' : 'New Court Proceeding'}</span>
              <div className="flex gap-2">
                {editData && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Court Attendance Selection */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="court_attendance">
                  Court Attendance Record <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.court_attendance}
                  onValueChange={handleCourtAttendanceChange}
                  disabled={loading || !!editData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select court attendance record" />
                  </SelectTrigger>
                  <SelectContent>
                    {courtAttendanceRecords.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {record.prisoner_name} - {record.court_name} - {record.criminal_case_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Court Attendance Details (Read-only) */}
            {formData.court_attendance && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prisoner_name">Prisoner Name</Label>
                  <Input
                    id="prisoner_name"
                    value={formData.prisoner_name}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="court_attendance_details">Court Attendance Details</Label>
                  <Input
                    id="court_attendance_details"
                    value={formData.court_attendance_details}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Transcript */}
            <div className="space-y-2">
              <Label htmlFor="transcript">
                Proceeding Transcript <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="transcript"
                value={formData.transcript}
                onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                placeholder="Enter detailed transcript of court proceedings..."
                rows={12}
                disabled={loading}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                Record all relevant proceedings, statements, decisions, and outcomes from the court session.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : editData ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this court proceeding record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourtProceedingForm;

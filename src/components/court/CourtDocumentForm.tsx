import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { Save, X, Trash2, Upload, FileText } from 'lucide-react';
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

interface CourtDocumentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CourtDocumentRecord | null;
}

interface CourtDocumentRecord {
  id?: string;
  court_attendance_details?: string;
  description?: string;
  document?: string;
  court_attendance?: string;
}

// Mock data for court attendance records
const mockCourtAttendanceRecords = [
  { id: '1', details: 'Court Appearance - High Court Kampala - 2024-01-15' },
  { id: '2', details: 'Bail Hearing - Chief Magistrates Court - 2024-01-20' },
  { id: '3', details: 'Sentencing - Magistrates Court Nakawa - 2024-01-25' },
  { id: '4', details: 'Appeal Hearing - High Court Kampala - 2024-02-01' },
  { id: '5', details: 'Case Mention - Family Court Mengo - 2024-02-05' },
];

const CourtDocumentForm: React.FC<CourtDocumentFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData
}) => {
  const [formData, setFormData] = useState({
    court_attendance: '',
    description: '',
    document: ''
  });

  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        court_attendance: editData.court_attendance || '',
        description: editData.description || '',
        document: editData.document || ''
      });
      if (editData.document) {
        setSelectedFileName(editData.document);
      }
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setFormData({
      court_attendance: '',
      description: '',
      document: ''
    });
    setSelectedFile(null);
    setSelectedFileName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setFormData({ ...formData, document: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.court_attendance) {
      toast.error('Please select a court attendance record');
      return;
    }
    if (!formData.description?.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (!editData && !selectedFile) {
      toast.error('Please upload a document');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editData?.id) {
        toast.success('Court document updated successfully');
      } else {
        toast.success('Court document created successfully');
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
      
      toast.success('Court document deleted successfully');
      setShowDeleteDialog(false);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to delete court document');
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
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editData ? 'Edit Court Document' : 'New Court Document'}</span>
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
            {/* Court Attendance Record */}
            <div className="space-y-2">
              <Label htmlFor="court_attendance">
                Court Attendance Record <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.court_attendance}
                onValueChange={(value) => setFormData({ ...formData, court_attendance: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select court attendance record" />
                </SelectTrigger>
                <SelectContent>
                  {mockCourtAttendanceRecords.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {record.details}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter document description..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label htmlFor="document">
                Document (PDF) {!editData && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="document_display"
                  value={selectedFileName}
                  placeholder="No file selected"
                  disabled
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('document')?.click()}
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <input
                  id="document"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">Upload PDF file (Max 10MB)</p>
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
              Are you sure you want to delete this court document? This action cannot be undone.
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

export default CourtDocumentForm;

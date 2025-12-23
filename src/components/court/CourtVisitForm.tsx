import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { Save, X, Trash2, Calendar as CalendarIcon } from 'lucide-react';
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
import PrisonerSearchScreen from '../common/PrisonerSearchScreen';

interface CourtVisitFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CourtVisitRecord | null;
}

interface CourtVisitRecord {
  id?: string;
  prisoner_name?: string;
  id_type_name?: string;
  relationship_name?: string;
  visit_id?: string;
  visit_date?: string;
  visitor_name?: string;
  id_number?: string;
  telephone_number?: string;
  address?: string;
  items_brought?: string;
  prisoner?: string;
  id_type?: string;
  relationship?: string;
}

// Mock data for dropdowns
const mockIdTypes = [
  { id: '1', name: 'National ID' },
  { id: '2', name: 'Passport' },
  { id: '3', name: 'Driving License' },
  { id: '4', name: 'Voter ID' },
  { id: '5', name: 'Student ID' },
];

const mockRelationships = [
  { id: '1', name: 'Spouse' },
  { id: '2', name: 'Parent' },
  { id: '3', name: 'Child' },
  { id: '4', name: 'Sibling' },
  { id: '5', name: 'Friend' },
  { id: '6', name: 'Lawyer' },
  { id: '7', name: 'Religious Leader' },
  { id: '8', name: 'Other' },
];

const mockItems = [
  { id: '1', name: 'Food Items' },
  { id: '2', name: 'Clothing' },
  { id: '3', name: 'Books' },
  { id: '4', name: 'Toiletries' },
  { id: '5', name: 'Medication' },
  { id: '6', name: 'None' },
];

const CourtVisitForm: React.FC<CourtVisitFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData
}) => {
  const [formData, setFormData] = useState({
    prisoner: '',
    visit_id: '',
    visit_date: '',
    visitor_name: '',
    id_type: '',
    id_number: '',
    telephone_number: '',
    relationship: '',
    address: '',
    items_brought: ''
  });

  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrisonerSearch, setShowPrisonerSearch] = useState(false);
  const [selectedPrisonerName, setSelectedPrisonerName] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        prisoner: editData.prisoner || '',
        visit_id: editData.visit_id || '',
        visit_date: editData.visit_date || '',
        visitor_name: editData.visitor_name || '',
        id_type: editData.id_type || '',
        id_number: editData.id_number || '',
        telephone_number: editData.telephone_number || '',
        relationship: editData.relationship || '',
        address: editData.address || '',
        items_brought: editData.items_brought || ''
      });
      setSelectedPrisonerName(editData.prisoner_name || '');
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setFormData({
      prisoner: '',
      visit_id: '',
      visit_date: '',
      visitor_name: '',
      id_type: '',
      id_number: '',
      telephone_number: '',
      relationship: '',
      address: '',
      items_brought: ''
    });
    setSelectedPrisonerName('');
  };

  const handlePrisonerSelect = (prisonerId: string) => {
    setFormData({ ...formData, prisoner: prisonerId });
    // Mock prisoner name - in real app, fetch from API
    setSelectedPrisonerName(`Prisoner ${prisonerId}`);
    setShowPrisonerSearch(false);
  };

  const generateVisitId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `VIS-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.visitor_name?.trim()) {
      toast.error('Please enter visitor name');
      return;
    }
    if (!formData.id_type) {
      toast.error('Please select ID type');
      return;
    }
    if (!formData.id_number?.trim()) {
      toast.error('Please enter ID number');
      return;
    }
    if (!formData.telephone_number?.trim()) {
      toast.error('Please enter telephone number');
      return;
    }
    if (!formData.relationship) {
      toast.error('Please select relationship');
      return;
    }
    if (!formData.visit_date) {
      toast.error('Please enter visit date');
      return;
    }

    setLoading(true);

    try {
      // Generate visit ID if creating new record
      const submitData = {
        ...formData,
        visit_id: editData?.visit_id || generateVisitId()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editData?.id) {
        toast.success('Court visit updated successfully');
      } else {
        toast.success('Court visit recorded successfully');
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
      
      toast.success('Court visit deleted successfully');
      setShowDeleteDialog(false);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to delete court visit');
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
        <DialogContent className="max-w-[1400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editData ? 'Edit Court Visit' : 'New Court Visit'}</span>
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
            {/* Prisoner Selection */}
            <div className="space-y-2">
              <Label htmlFor="prisoner">
                Prisoner <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="prisoner"
                  value={selectedPrisonerName}
                  placeholder="Click to search for prisoner..."
                  disabled
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  onClick={() => setShowPrisonerSearch(true)}
                  disabled={loading}
                  variant="outline"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Row 1: Visit ID and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visit_id">Visit ID</Label>
                <Input
                  id="visit_id"
                  value={formData.visit_id}
                  placeholder="Auto-generated"
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">Auto-generated upon submission</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visit_date">
                  Visit Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="visit_date"
                    type="date"
                    value={formData.visit_date}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    disabled={loading}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Visitor Name and Relationship */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitor_name">
                  Visitor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="visitor_name"
                  value={formData.visitor_name}
                  onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                  placeholder="Enter visitor full name"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">
                  Relationship <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRelationships.map((rel) => (
                      <SelectItem key={rel.id} value={rel.id}>
                        {rel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: ID Type and ID Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_type">
                  ID Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.id_type}
                  onValueChange={(value) => setFormData({ ...formData, id_type: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIdTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_number">
                  ID Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="id_number"
                  value={formData.id_number}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  placeholder="Enter ID number"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 4: Telephone Number and Items Brought */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone_number">
                  Telephone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telephone_number"
                  value={formData.telephone_number}
                  onChange={(e) => setFormData({ ...formData, telephone_number: e.target.value })}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="items_brought">Items Brought</Label>
                <Select
                  value={formData.items_brought}
                  onValueChange={(value) => setFormData({ ...formData, items_brought: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select items brought" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter visitor address..."
                rows={3}
                disabled={loading}
              />
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

      {/* Prisoner Search Dialog */}
      <Dialog open={showPrisonerSearch} onOpenChange={setShowPrisonerSearch}>
        <DialogContent className="max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Search Prisoner</DialogTitle>
          </DialogHeader>
          <PrisonerSearchScreen
            value={formData.prisoner}
            onChange={handlePrisonerSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this court visit record? This action cannot be undone.
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

export default CourtVisitForm;

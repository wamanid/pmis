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
import { CourtVisitRecord } from '../../models/court';
import { deleteCourtVisit, getVisitorStatus, getvisitorTypes, postcourtVisit, updatecourtVisit } from '../../services/courtService';

interface CourtVisitFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CourtVisitRecord | null;
    mockIdTypes?:any[];
    mockRelationships?:any[];
    mockItems?:any[];
}

// Mock data for dropdowns
const mockIdTypes2 = [
  { id: '1', name: 'National ID' },
  { id: '2', name: 'Passport' },
  { id: '3', name: 'Driving License' },
  { id: '4', name: 'Voter ID' },
  { id: '5', name: 'Student ID' },
];

const mockRelationships2 = [
  { id: '1', name: 'Spouse' },
  { id: '2', name: 'Parent' },
  { id: '3', name: 'Child' },
  { id: '4', name: 'Sibling' },
  { id: '5', name: 'Friend' },
  { id: '6', name: 'Lawyer' },
  { id: '7', name: 'Religious Leader' },
  { id: '8', name: 'Other' },
];

const mockItems2 = [
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
  editData,
    mockIdTypes,
    mockRelationships,
    mockItems,
}) => {
  const [formData, setFormData] = useState({
    prisoner: '',
    visit_id: '',
    visit_date: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    id_type: '',
    id_number: '',
    contact_no: '',
    relation: '',
    address: '',
    items_brought: '',
    visitor_type:'',
    visitor_status:''

   
  });

  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrisonerSearch, setShowPrisonerSearch] = useState(false);
  const [selectedPrisonerName, setSelectedPrisonerName] = useState('');

   const [visitorTypes, setVisitorTypes] = useState<any[]>([]);
      const [visitorStatus, setVisitorStatus] = useState<any[]>([]);


  useEffect(() => {
      getvisitorTypes().then((data) => {
       // alert(JSON.stringify(data.results));
         setVisitorTypes(data.results);
    });
         getVisitorStatus().then((data) => {
       // alert(JSON.stringify(data.results));
         setVisitorStatus(data.results);
    });

    //load data here
    if (editData) {

    //  alert(JSON.stringify(editData));
      setFormData({
        prisoner: editData.prisoner || '',
        visit_id: editData.visit_id || '',
        visit_date: editData.visitation_datetime || '',
        first_name: editData.first_name || '',
        middle_name: editData.middle_name || '',
        last_name: editData.last_name || '',
        id_type: editData.id_type || '',
        id_number: editData.id_number || '',
        contact_no: editData.contact_no || '',
        relation: editData.relation || '',
        address: editData.address || '',
        items_brought: editData.items_brought || '',
        visitor_type: editData.visitor_type || '',
        visitor_status: editData.visitor_status || ''
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
      first_name: '',
      middle_name: '',
      last_name: '',
      id_type: '',
      id_number: '',
      contact_no: '',
      relation: '',
      address: '',
      items_brought: '',
      visitor_type: '',
      visitor_status: ''
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
    if (!formData.first_name?.trim()) {
      toast.error('Please enter first name');
      return;
    }


     if (!formData.last_name?.trim()) {
      toast.error('Please enter last name');
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

    if (!formData.relation) {
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

    const submitData:CourtVisitRecord = {
        ...formData,
        id: editData?.id || '',
        visitation_datetime: formData.visit_date,
        visit_id: editData?.visit_id || generateVisitId()
      };
      // Simulate API call
   

   /* postcourtVisit(submitData).then((data) => {

    }).catch((error) => {
    });*/

  
      if (editData?.id) {
        //alert(JSON.stringify(submitData));
          updatecourtVisit(submitData).then((data) => {
          toast.success('Court visit updated successfully');
        }).catch((error) => {
          alert(error);
        });

       
      } else {
      postcourtVisit(submitData).then((data) => {
          toast.success('Court visit recorded successfully');
        }).catch((error) => {
          alert(error);
        });
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
    
      deleteCourtVisit(editData.id).then(() => {
      toast.success('Court visit deleted successfully');
      setShowDeleteDialog(false);
      onSuccess();
      onClose();
      }).catch((error) => {

      });

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
                    type="datetime-local"
                    value={formData.visit_date}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    disabled={loading}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Visitor Name and Relationship */}



              <div className="space-y-2">
                <Label htmlFor="relationship">
                  Visitor Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.visitor_type}
                  onValueChange={(value) => setFormData({ ...formData, visitor_type: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visitor type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitorTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitor_name">
                First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter visitor full name"
                  disabled={loading}
                />
              </div>

              
                <div className="space-y-2">
                <Label htmlFor="visitor_name">
                Middle Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  placeholder="Enter visitor full name"
                  disabled={loading}
                />
              </div>


   <div className="space-y-2">
                <Label htmlFor="visitor_name">
                Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter visitor full name"
                  disabled={loading}
                />
              </div>



              <div className="space-y-2">
                <Label htmlFor="relationship">
                  Relationship <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.relation}
                  onValueChange={(value) => setFormData({ ...formData, relation: value })}
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

              <div className="space-y-2">
                <Label htmlFor="contact_no">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact_no"
                  value={formData.contact_no}
                  onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                  placeholder="Enter contact number"
                  disabled={loading}
                />
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

               <div className="space-y-2">
                <Label htmlFor="visitor status">
                  Visitor Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.visitor_status}
                  onValueChange={(value) => setFormData({ ...formData, visitor_status: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visitor status" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitorStatus.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* Row 4: Telephone Number and Items Brought */}
          

            

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

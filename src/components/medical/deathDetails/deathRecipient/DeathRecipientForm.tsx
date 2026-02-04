import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { UserCheck, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { format } from 'date-fns';

interface DeathRecipient {
  id?: string;
  prisoner_name?: string;
  received_by_name?: string;
  collection_date: string;
  collection_time: string;
  recipient_full_name: string;
  recipient_relationship: string;
  recipient_national_id: string;
  recipient_contact: string;
  recipient_address: string;
  witness_name: string;
  witness_contact: string;
  received_by: string;
  body_condition: string;
  personal_effects_released: string;
  effects_description: string;
  death_certificate_collected: string;
  burial_permit_collected: string;
  transportation_arrangement: string;
  funeral_home_details: string;
  acknowledgement_signed: string;
  notes: string;
  prisoner: string;
}

interface DeathRecipientFormProps {
  recipient?: DeathRecipient | null;
  onSubmit: (recipient: DeathRecipient) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DeathRecipientForm: React.FC<DeathRecipientFormProps> = ({ recipient, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<DeathRecipient>({
    collection_date: '',
    collection_time: '',
    recipient_full_name: '',
    recipient_relationship: '',
    recipient_national_id: '',
    recipient_contact: '',
    recipient_address: '',
    witness_name: '',
    witness_contact: '',
    received_by: '',
    body_condition: 'Good',
    personal_effects_released: 'Yes',
    effects_description: '',
    death_certificate_collected: 'Yes',
    burial_permit_collected: 'Yes',
    transportation_arrangement: '',
    funeral_home_details: '',
    acknowledgement_signed: 'Yes',
    notes: '',
    prisoner: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [collectionDateOpen, setCollectionDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (recipient && dataLoaded) {
      setFormData(recipient);
    }
  }, [recipient, dataLoaded]);

  const loadDropdownData = () => {
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    setStaff([
      { id: '1', name: 'Admin Officer - John Okello', role: 'Admin Officer', staff_number: 'ADM-001' },
      { id: '2', name: 'Officer in Charge - David Ssemakula', role: 'OIC', staff_number: 'OIC-001' },
      { id: '3', name: 'Welfare Officer - Sarah Namukasa', role: 'Welfare Officer', staff_number: 'WEL-001' },
      { id: '4', name: 'Stores Officer - Grace Nakato', role: 'Stores Officer', staff_number: 'STO-001' },
      { id: '5', name: 'Security Officer - James Wamala', role: 'Security Officer', staff_number: 'SEC-001' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof DeathRecipient, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.recipient_full_name) {
      toast.error('Please enter the recipient full name');
      return;
    }
    if (!formData.recipient_national_id) {
      toast.error('Please enter the recipient national ID');
      return;
    }
    if (!formData.recipient_contact) {
      toast.error('Please enter the recipient contact');
      return;
    }
    if (!formData.collection_date) {
      toast.error('Please select the collection date');
      return;
    }
    if (!formData.received_by) {
      toast.error('Please select who received');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedStaff = staff.find((s) => s.id === formData.received_by);

      const submitData: DeathRecipient = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        received_by_name: selectedStaff?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Death recipient record created successfully');
        setFormData({
          collection_date: '',
          collection_time: '',
          recipient_full_name: '',
          recipient_relationship: '',
          recipient_national_id: '',
          recipient_contact: '',
          recipient_address: '',
          witness_name: '',
          witness_contact: '',
          received_by: '',
          body_condition: 'Good',
          personal_effects_released: 'Yes',
          effects_description: '',
          death_certificate_collected: 'Yes',
          burial_permit_collected: 'Yes',
          transportation_arrangement: '',
          funeral_home_details: '',
          acknowledgement_signed: 'Yes',
          notes: '',
          prisoner: '',
        });
      } else {
        toast.success('Death recipient record updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  // Get display values for view mode
  const getDisplayValue = (field: string, id: string) => {
    if (!id) return 'N/A';
    
    switch (field) {
      case 'prisoner':
        const prisoner = prisoners.find(p => p.id === id);
        return prisoner ? `${prisoner.prisoner_number} - ${prisoner.full_name}` : id;
      case 'received_by':
        const staffMember = staff.find(s => s.id === id);
        return staffMember ? `${staffMember.name}` : id;
      default:
        return id;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <UserCheck className="h-5 w-5" />
          {mode === 'create' && 'New Body Release Record'}
          {mode === 'edit' && 'Edit Body Release Record'}
          {mode === 'view' && 'View Body Release Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Deceased Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prisoner">
                  Deceased Prisoner <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('prisoner', formData.prisoner)}
                  </div>
                ) : (
                  <Select
                    value={formData.prisoner}
                    onValueChange={(value) => handleInputChange('prisoner', value)}
                  >
                    <SelectTrigger id="prisoner">
                      <SelectValue placeholder="Select prisoner" />
                    </SelectTrigger>
                    <SelectContent>
                      {prisoners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.prisoner_number} - {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="received_by">
                  Received By (Prison Staff) <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('received_by', formData.received_by)}
                  </div>
                ) : (
                  <Select
                    value={formData.received_by}
                    onValueChange={(value) => handleInputChange('received_by', value)}
                  >
                    <SelectTrigger id="received_by">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Collection Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collection_date">
                  Collection Date <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.collection_date ? format(new Date(formData.collection_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={collectionDateOpen} onOpenChange={setCollectionDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.collection_date ? format(new Date(formData.collection_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.collection_date ? new Date(formData.collection_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('collection_date', format(date, 'yyyy-MM-dd'));
                            setCollectionDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection_time">Collection Time</Label>
                <Input
                  id="collection_time"
                  type="time"
                  value={formData.collection_time}
                  onChange={(e) => handleInputChange('collection_time', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Recipient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_full_name">
                  Recipient Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient_full_name"
                  value={formData.recipient_full_name}
                  onChange={(e) => handleInputChange('recipient_full_name', e.target.value)}
                  placeholder="Enter full name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_relationship">Relationship to Deceased</Label>
                <Input
                  id="recipient_relationship"
                  value={formData.recipient_relationship}
                  onChange={(e) => handleInputChange('recipient_relationship', e.target.value)}
                  placeholder="e.g., Spouse, Parent, Child"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_national_id">
                  National ID Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient_national_id"
                  value={formData.recipient_national_id}
                  onChange={(e) => handleInputChange('recipient_national_id', e.target.value)}
                  placeholder="Enter ID number"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_contact">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient_contact"
                  value={formData.recipient_contact}
                  onChange={(e) => handleInputChange('recipient_contact', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_address">Recipient Address</Label>
              <Textarea
                id="recipient_address"
                value={formData.recipient_address}
                onChange={(e) => handleInputChange('recipient_address', e.target.value)}
                placeholder="Enter full address..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Witness Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="witness_name">Witness Name</Label>
                <Input
                  id="witness_name"
                  value={formData.witness_name}
                  onChange={(e) => handleInputChange('witness_name', e.target.value)}
                  placeholder="Enter witness name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="witness_contact">Witness Contact</Label>
                <Input
                  id="witness_contact"
                  value={formData.witness_contact}
                  onChange={(e) => handleInputChange('witness_contact', e.target.value)}
                  placeholder="Enter witness contact"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Body and Effects Release
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="body_condition">Body Condition</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.body_condition || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.body_condition}
                    onValueChange={(value) => handleInputChange('body_condition', value)}
                  >
                    <SelectTrigger id="body_condition">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                      <SelectItem value="Decomposed">Decomposed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personal_effects_released">Personal Effects Released</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.personal_effects_released || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.personal_effects_released}
                    onValueChange={(value) => handleInputChange('personal_effects_released', value)}
                  >
                    <SelectTrigger id="personal_effects_released">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="effects_description">Personal Effects Description</Label>
              <Textarea
                id="effects_description"
                value={formData.effects_description}
                onChange={(e) => handleInputChange('effects_description', e.target.value)}
                placeholder="List all personal effects released..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Documentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="death_certificate_collected">Death Certificate Collected</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.death_certificate_collected || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.death_certificate_collected}
                    onValueChange={(value) => handleInputChange('death_certificate_collected', value)}
                  >
                    <SelectTrigger id="death_certificate_collected">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="burial_permit_collected">Burial Permit Collected</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.burial_permit_collected || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.burial_permit_collected}
                    onValueChange={(value) => handleInputChange('burial_permit_collected', value)}
                  >
                    <SelectTrigger id="burial_permit_collected">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="acknowledgement_signed">Acknowledgement Signed</Label>
              {isReadOnly ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {formData.acknowledgement_signed || 'N/A'}
                </div>
              ) : (
                <Select
                  value={formData.acknowledgement_signed}
                  onValueChange={(value) => handleInputChange('acknowledgement_signed', value)}
                >
                  <SelectTrigger id="acknowledgement_signed">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Transportation
            </h3>
            <div className="space-y-2">
              <Label htmlFor="transportation_arrangement">Transportation Arrangement</Label>
              <Input
                id="transportation_arrangement"
                value={formData.transportation_arrangement}
                onChange={(e) => handleInputChange('transportation_arrangement', e.target.value)}
                placeholder="e.g., Family vehicle, Funeral home hearse"
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funeral_home_details">Funeral Home Details</Label>
              <Textarea
                id="funeral_home_details"
                value={formData.funeral_home_details}
                onChange={(e) => handleInputChange('funeral_home_details', e.target.value)}
                placeholder="Enter funeral home name, contact, and license number if applicable..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter additional notes..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : mode === 'create' ? 'Create Record' : 'Update Record'}
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex items-center justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Close
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default DeathRecipientForm;

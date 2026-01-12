import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeftRight, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface TransferRecommendation {
  id?: string;
  prisoner_name?: string;
  from_facility_name?: string;
  to_facility_name?: string;
  medical_officer_name?: string;
  recommendation_date: string;
  urgency_level: string;
  medical_reason: string;
  current_condition: string;
  required_facility_type: string;
  special_transport_needs: string;
  medical_officer: string;
  from_facility: string;
  to_facility: string;
  status: string;
  transfer_date: string;
  approval_date: string;
  approved_by: string;
  transfer_notes: string;
  prisoner: string;
}

interface TransferRecommendationFormProps {
  recommendation?: TransferRecommendation | null;
  onSubmit: (recommendation: TransferRecommendation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const TransferRecommendationForm: React.FC<TransferRecommendationFormProps> = ({ recommendation, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<TransferRecommendation>({
    recommendation_date: '',
    urgency_level: 'Medium',
    medical_reason: '',
    current_condition: '',
    required_facility_type: '',
    special_transport_needs: '',
    medical_officer: '',
    from_facility: '',
    to_facility: '',
    status: 'Pending',
    transfer_date: '',
    approval_date: '',
    approved_by: '',
    transfer_notes: '',
    prisoner: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [medicalOfficers, setMedicalOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [recDateOpen, setRecDateOpen] = useState(false);
  const [approvalDateOpen, setApprovalDateOpen] = useState(false);
  const [transferDateOpen, setTransferDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (recommendation && dataLoaded) {
      setFormData(recommendation);
    }
  }, [recommendation, dataLoaded]);

  const loadDropdownData = () => {
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    setFacilities([
      { id: '1', name: 'Luzira Prison', type: 'Maximum Security', has_hospital: true },
      { id: '2', name: 'Kigo Prison', type: 'Medium Security', has_hospital: true },
      { id: '3', name: 'Kitalya Prison', type: 'Medium Security', has_hospital: false },
      { id: '4', name: 'Mulago National Referral Hospital', type: 'External Hospital', has_hospital: true },
      { id: '5', name: 'Butabika National Psychiatric Hospital', type: 'External Hospital', has_hospital: true },
      { id: '6', name: 'Mbarara Prison', type: 'Medium Security', has_hospital: true },
      { id: '7', name: 'Gulu Prison', type: 'Medium Security', has_hospital: false },
    ]);

    setMedicalOfficers([
      { id: '1', name: 'Dr. David Makumbi', specialization: 'General Medicine', staff_number: 'MED-001' },
      { id: '2', name: 'Dr. Sarah Kisakye', specialization: 'Internal Medicine', staff_number: 'MED-002' },
      { id: '3', name: 'Dr. James Okello', specialization: 'Surgery', staff_number: 'MED-003' },
      { id: '4', name: 'Dr. Patricia Mutesi', specialization: 'Psychiatry', staff_number: 'MED-004' },
      { id: '5', name: 'Dr. Richard Ssemakula', specialization: 'Infectious Diseases', staff_number: 'MED-005' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof TransferRecommendation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.from_facility) {
      toast.error('Please select the from facility');
      return;
    }
    if (!formData.to_facility) {
      toast.error('Please select the to facility');
      return;
    }
    if (!formData.medical_officer) {
      toast.error('Please select a medical officer');
      return;
    }
    if (!formData.recommendation_date) {
      toast.error('Please select a recommendation date');
      return;
    }
    if (!formData.medical_reason) {
      toast.error('Please enter the medical reason');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedFromFacility = facilities.find((f) => f.id === formData.from_facility);
      const selectedToFacility = facilities.find((f) => f.id === formData.to_facility);
      const selectedOfficer = medicalOfficers.find((o) => o.id === formData.medical_officer);

      const submitData: TransferRecommendation = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        from_facility_name: selectedFromFacility?.name || '',
        to_facility_name: selectedToFacility?.name || '',
        medical_officer_name: selectedOfficer?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Transfer recommendation created successfully');
        setFormData({
          recommendation_date: '',
          urgency_level: 'Medium',
          medical_reason: '',
          current_condition: '',
          required_facility_type: '',
          special_transport_needs: '',
          medical_officer: '',
          from_facility: '',
          to_facility: '',
          status: 'Pending',
          transfer_date: '',
          approval_date: '',
          approved_by: '',
          transfer_notes: '',
          prisoner: '',
        });
      } else {
        toast.success('Transfer recommendation updated successfully');
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
      case 'from_facility':
      case 'to_facility':
        const facility = facilities.find(f => f.id === id);
        return facility ? `${facility.name} (${facility.type})` : id;
      case 'medical_officer':
        const officer = medicalOfficers.find(o => o.id === id);
        return officer ? `${officer.name} (${officer.specialization})` : id;
      default:
        return id;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <ArrowLeftRight className="h-5 w-5" />
          {mode === 'create' && 'New Transfer Recommendation'}
          {mode === 'edit' && 'Edit Transfer Recommendation'}
          {mode === 'view' && 'View Transfer Recommendation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
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
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.status || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Transfer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from_facility">
                  From Facility <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('from_facility', formData.from_facility)}
                  </div>
                ) : (
                  <Select
                    value={formData.from_facility}
                    onValueChange={(value) => handleInputChange('from_facility', value)}
                  >
                    <SelectTrigger id="from_facility">
                      <SelectValue placeholder="Select from facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name} ({facility.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="to_facility">
                  To Facility <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('to_facility', formData.to_facility)}
                  </div>
                ) : (
                  <Select
                    value={formData.to_facility}
                    onValueChange={(value) => handleInputChange('to_facility', value)}
                  >
                    <SelectTrigger id="to_facility">
                      <SelectValue placeholder="Select to facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.id}>
                          {facility.name} ({facility.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medical_officer">
                  Medical Officer <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('medical_officer', formData.medical_officer)}
                  </div>
                ) : (
                  <Select
                    value={formData.medical_officer}
                    onValueChange={(value) => handleInputChange('medical_officer', value)}
                  >
                    <SelectTrigger id="medical_officer">
                      <SelectValue placeholder="Select medical officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicalOfficers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.name} ({officer.specialization})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency_level">
                  Urgency Level <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.urgency_level || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.urgency_level}
                    onValueChange={(value) => handleInputChange('urgency_level', value)}
                  >
                    <SelectTrigger id="urgency_level">
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="required_facility_type">Required Facility Type</Label>
              <Input
                id="required_facility_type"
                value={formData.required_facility_type}
                onChange={(e) => handleInputChange('required_facility_type', e.target.value)}
                placeholder="e.g., Specialized hospital, psychiatric facility"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Medical Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="medical_reason">
                Medical Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="medical_reason"
                value={formData.medical_reason}
                onChange={(e) => handleInputChange('medical_reason', e.target.value)}
                placeholder="Enter medical reason for transfer..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_condition">Current Condition</Label>
              <Textarea
                id="current_condition"
                value={formData.current_condition}
                onChange={(e) => handleInputChange('current_condition', e.target.value)}
                placeholder="Describe current medical condition..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_transport_needs">Special Transport Needs</Label>
              <Textarea
                id="special_transport_needs"
                value={formData.special_transport_needs}
                onChange={(e) => handleInputChange('special_transport_needs', e.target.value)}
                placeholder="Enter special transport requirements (e.g., ambulance, medical escort)..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Dates and Approval
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommendation_date">
                  Recommendation Date <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.recommendation_date ? format(new Date(formData.recommendation_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={recDateOpen} onOpenChange={setRecDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.recommendation_date ? format(new Date(formData.recommendation_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.recommendation_date ? new Date(formData.recommendation_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('recommendation_date', format(date, 'yyyy-MM-dd'));
                            setRecDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval_date">Approval Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.approval_date ? format(new Date(formData.approval_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={approvalDateOpen} onOpenChange={setApprovalDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.approval_date ? format(new Date(formData.approval_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.approval_date ? new Date(formData.approval_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('approval_date', format(date, 'yyyy-MM-dd'));
                            setApprovalDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer_date">Transfer Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.transfer_date ? format(new Date(formData.transfer_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={transferDateOpen} onOpenChange={setTransferDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.transfer_date ? format(new Date(formData.transfer_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.transfer_date ? new Date(formData.transfer_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('transfer_date', format(date, 'yyyy-MM-dd'));
                            setTransferDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approved_by">Approved By</Label>
              <Input
                id="approved_by"
                value={formData.approved_by}
                onChange={(e) => handleInputChange('approved_by', e.target.value)}
                placeholder="Enter approver name"
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="transfer_notes">Transfer Notes</Label>
              <Textarea
                id="transfer_notes"
                value={formData.transfer_notes}
                onChange={(e) => handleInputChange('transfer_notes', e.target.value)}
                placeholder="Enter additional transfer notes..."
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Recommendation' : 'Update Recommendation'}
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

export default TransferRecommendationForm;

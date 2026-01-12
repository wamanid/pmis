import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bed, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface WardRecommendation {
  id?: string;
  prisoner_name?: string;
  ward_type_name?: string;
  medical_officer_name?: string;
  recommendation_date: string;
  expected_duration: string;
  ward_type: string;
  medical_condition: string;
  severity_level: string;
  treatment_plan: string;
  special_care_required: string;
  medical_officer: string;
  status: string;
  actual_admission_date: string;
  actual_discharge_date: string;
  notes: string;
  prisoner: string;
}

interface WardRecommendationFormProps {
  recommendation?: WardRecommendation | null;
  onSubmit: (recommendation: WardRecommendation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const WardRecommendationForm: React.FC<WardRecommendationFormProps> = ({ recommendation, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<WardRecommendation>({
    recommendation_date: '',
    expected_duration: '',
    ward_type: '',
    medical_condition: '',
    severity_level: 'Moderate',
    treatment_plan: '',
    special_care_required: '',
    medical_officer: '',
    status: 'Pending',
    actual_admission_date: '',
    actual_discharge_date: '',
    notes: '',
    prisoner: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [wardTypes, setWardTypes] = useState<any[]>([]);
  const [medicalOfficers, setMedicalOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [recDateOpen, setRecDateOpen] = useState(false);
  const [admissionDateOpen, setAdmissionDateOpen] = useState(false);
  const [dischargeDateOpen, setDischargeDateOpen] = useState(false);

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

    setWardTypes([
      { id: '1', name: 'General Ward', capacity: 20, description: 'Standard medical care ward' },
      { id: '2', name: 'Intensive Care Unit (ICU)', capacity: 5, description: 'Critical care ward' },
      { id: '3', name: 'Isolation Ward', capacity: 10, description: 'For contagious diseases' },
      { id: '4', name: 'Psychiatric Ward', capacity: 15, description: 'Mental health care' },
      { id: '5', name: 'Recovery Ward', capacity: 12, description: 'Post-surgery recovery' },
      { id: '6', name: 'Tuberculosis Ward', capacity: 8, description: 'TB treatment ward' },
      { id: '7', name: 'HIV/AIDS Ward', capacity: 10, description: 'HIV/AIDS care ward' },
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

  const handleInputChange = (field: keyof WardRecommendation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.ward_type) {
      toast.error('Please select a ward type');
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
    if (!formData.medical_condition) {
      toast.error('Please enter the medical condition');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedWard = wardTypes.find((w) => w.id === formData.ward_type);
      const selectedOfficer = medicalOfficers.find((o) => o.id === formData.medical_officer);

      const submitData: WardRecommendation = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        ward_type_name: selectedWard?.name || '',
        medical_officer_name: selectedOfficer?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Ward recommendation created successfully');
        setFormData({
          recommendation_date: '',
          expected_duration: '',
          ward_type: '',
          medical_condition: '',
          severity_level: 'Moderate',
          treatment_plan: '',
          special_care_required: '',
          medical_officer: '',
          status: 'Pending',
          actual_admission_date: '',
          actual_discharge_date: '',
          notes: '',
          prisoner: '',
        });
      } else {
        toast.success('Ward recommendation updated successfully');
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
      case 'ward_type':
        const ward = wardTypes.find(w => w.id === id);
        return ward ? `${ward.name} - ${ward.description}` : id;
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
          <Bed className="h-5 w-5" />
          {mode === 'create' && 'New Ward Recommendation'}
          {mode === 'edit' && 'Edit Ward Recommendation'}
          {mode === 'view' && 'View Ward Recommendation'}
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
                      <SelectItem value="Admitted">Admitted</SelectItem>
                      <SelectItem value="Discharged">Discharged</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Ward and Medical Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ward_type">
                  Ward Type <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('ward_type', formData.ward_type)}
                  </div>
                ) : (
                  <Select
                    value={formData.ward_type}
                    onValueChange={(value) => handleInputChange('ward_type', value)}
                  >
                    <SelectTrigger id="ward_type">
                      <SelectValue placeholder="Select ward type" />
                    </SelectTrigger>
                    <SelectContent>
                      {wardTypes.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name} - {ward.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity_level">
                  Severity Level <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.severity_level || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.severity_level}
                    onValueChange={(value) => handleInputChange('severity_level', value)}
                  >
                    <SelectTrigger id="severity_level">
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mild">Mild</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Severe">Severe</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_duration">Expected Duration (days)</Label>
                <Input
                  id="expected_duration"
                  type="number"
                  value={formData.expected_duration}
                  onChange={(e) => handleInputChange('expected_duration', e.target.value)}
                  placeholder="Enter expected duration"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_condition">
                Medical Condition <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="medical_condition"
                value={formData.medical_condition}
                onChange={(e) => handleInputChange('medical_condition', e.target.value)}
                placeholder="Enter medical condition details..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment_plan">Treatment Plan</Label>
              <Textarea
                id="treatment_plan"
                value={formData.treatment_plan}
                onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                placeholder="Enter treatment plan..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_care_required">Special Care Required</Label>
              <Textarea
                id="special_care_required"
                value={formData.special_care_required}
                onChange={(e) => handleInputChange('special_care_required', e.target.value)}
                placeholder="Enter special care requirements..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Dates and Timeline
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
                <Label htmlFor="actual_admission_date">Actual Admission Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.actual_admission_date ? format(new Date(formData.actual_admission_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={admissionDateOpen} onOpenChange={setAdmissionDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.actual_admission_date ? format(new Date(formData.actual_admission_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.actual_admission_date ? new Date(formData.actual_admission_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('actual_admission_date', format(date, 'yyyy-MM-dd'));
                            setAdmissionDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual_discharge_date">Actual Discharge Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.actual_discharge_date ? format(new Date(formData.actual_discharge_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={dischargeDateOpen} onOpenChange={setDischargeDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.actual_discharge_date ? format(new Date(formData.actual_discharge_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.actual_discharge_date ? new Date(formData.actual_discharge_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('actual_discharge_date', format(date, 'yyyy-MM-dd'));
                            setDischargeDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
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

export default WardRecommendationForm;

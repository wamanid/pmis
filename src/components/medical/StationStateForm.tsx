import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Activity, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface StationState {
  id?: string;
  prisoner_name?: string;
  station_name?: string;
  medical_officer_name?: string;
  assessment_date: string;
  station_type: string;
  admission_reason: string;
  current_health_status: string;
  vital_signs: string;
  treatment_administered: string;
  medications_given: string;
  medical_officer: string;
  duration_days: string;
  discharge_date: string;
  discharge_status: string;
  complications: string;
  follow_up_required: string;
  notes: string;
  prisoner: string;
}

interface StationStateFormProps {
  stationState?: StationState | null;
  onSubmit: (stationState: StationState) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const StationStateForm: React.FC<StationStateFormProps> = ({ stationState, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<StationState>({
    assessment_date: '',
    station_type: '',
    admission_reason: '',
    current_health_status: 'Stable',
    vital_signs: '',
    treatment_administered: '',
    medications_given: '',
    medical_officer: '',
    duration_days: '',
    discharge_date: '',
    discharge_status: 'Ongoing',
    complications: '',
    follow_up_required: 'No',
    notes: '',
    prisoner: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [medicalOfficers, setMedicalOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [assessmentDateOpen, setAssessmentDateOpen] = useState(false);
  const [dischargeDateOpen, setDischargeDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (stationState && dataLoaded) {
      setFormData(stationState);
    }
  }, [stationState, dataLoaded]);

  const loadDropdownData = () => {
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
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

  const handleInputChange = (field: keyof StationState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.station_type) {
      toast.error('Please select a station type');
      return;
    }
    if (!formData.medical_officer) {
      toast.error('Please select a medical officer');
      return;
    }
    if (!formData.assessment_date) {
      toast.error('Please select an assessment date');
      return;
    }
    if (!formData.admission_reason) {
      toast.error('Please enter the admission reason');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedOfficer = medicalOfficers.find((o) => o.id === formData.medical_officer);

      const submitData: StationState = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        station_name: formData.station_type,
        medical_officer_name: selectedOfficer?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Station state record created successfully');
        setFormData({
          assessment_date: '',
          station_type: '',
          admission_reason: '',
          current_health_status: 'Stable',
          vital_signs: '',
          treatment_administered: '',
          medications_given: '',
          medical_officer: '',
          duration_days: '',
          discharge_date: '',
          discharge_status: 'Ongoing',
          complications: '',
          follow_up_required: 'No',
          notes: '',
          prisoner: '',
        });
      } else {
        toast.success('Station state record updated successfully');
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
          <Activity className="h-5 w-5" />
          {mode === 'create' && 'New Station State Record'}
          {mode === 'edit' && 'Edit Station State Record'}
          {mode === 'view' && 'View Station State Record'}
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
                <Label htmlFor="assessment_date">
                  Assessment Date <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.assessment_date ? format(new Date(formData.assessment_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={assessmentDateOpen} onOpenChange={setAssessmentDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.assessment_date ? format(new Date(formData.assessment_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.assessment_date ? new Date(formData.assessment_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('assessment_date', format(date, 'yyyy-MM-dd'));
                            setAssessmentDateOpen(false);
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
              Station Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="station_type">
                  Station Type <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.station_type || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.station_type}
                    onValueChange={(value) => handleInputChange('station_type', value)}
                  >
                    <SelectTrigger id="station_type">
                      <SelectValue placeholder="Select station type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Emergency Station">Emergency Station</SelectItem>
                      <SelectItem value="General Ward">General Ward</SelectItem>
                      <SelectItem value="Intensive Care Unit">Intensive Care Unit</SelectItem>
                      <SelectItem value="Isolation Ward">Isolation Ward</SelectItem>
                      <SelectItem value="Observation Ward">Observation Ward</SelectItem>
                      <SelectItem value="Recovery Ward">Recovery Ward</SelectItem>
                      <SelectItem value="Psychiatric Ward">Psychiatric Ward</SelectItem>
                      <SelectItem value="Surgical Ward">Surgical Ward</SelectItem>
                      <SelectItem value="TB Ward">TB Ward</SelectItem>
                      <SelectItem value="Outpatient Clinic">Outpatient Clinic</SelectItem>
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
                <Label htmlFor="current_health_status">
                  Current Health Status <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.current_health_status || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.current_health_status}
                    onValueChange={(value) => handleInputChange('current_health_status', value)}
                  >
                    <SelectTrigger id="current_health_status">
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stable">Stable</SelectItem>
                      <SelectItem value="Improving">Improving</SelectItem>
                      <SelectItem value="Deteriorating">Deteriorating</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="Discharged">Discharged</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_days">Duration (days)</Label>
                <Input
                  id="duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => handleInputChange('duration_days', e.target.value)}
                  placeholder="Enter duration in days"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admission_reason">
                Admission Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="admission_reason"
                value={formData.admission_reason}
                onChange={(e) => handleInputChange('admission_reason', e.target.value)}
                placeholder="Enter reason for admission to this station..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Medical Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="vital_signs">Vital Signs</Label>
              <Textarea
                id="vital_signs"
                value={formData.vital_signs}
                onChange={(e) => handleInputChange('vital_signs', e.target.value)}
                placeholder="e.g., BP: 120/80, Pulse: 72, Temp: 37.0°C, RR: 18"
                rows={2}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment_administered">Treatment Administered</Label>
              <Textarea
                id="treatment_administered"
                value={formData.treatment_administered}
                onChange={(e) => handleInputChange('treatment_administered', e.target.value)}
                placeholder="Enter treatment and procedures administered..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications_given">Medications Given</Label>
              <Textarea
                id="medications_given"
                value={formData.medications_given}
                onChange={(e) => handleInputChange('medications_given', e.target.value)}
                placeholder="List all medications administered with dosages..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complications">Complications</Label>
              <Textarea
                id="complications"
                value={formData.complications}
                onChange={(e) => handleInputChange('complications', e.target.value)}
                placeholder="Enter any complications observed..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Discharge Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discharge_status">Discharge Status</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.discharge_status || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.discharge_status}
                    onValueChange={(value) => handleInputChange('discharge_status', value)}
                  >
                    <SelectTrigger id="discharge_status">
                      <SelectValue placeholder="Select discharge status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Discharged - Recovered">Discharged - Recovered</SelectItem>
                      <SelectItem value="Discharged - Improved">Discharged - Improved</SelectItem>
                      <SelectItem value="Transferred">Transferred</SelectItem>
                      <SelectItem value="Discharged - Against Medical Advice">Discharged - Against Medical Advice</SelectItem>
                      <SelectItem value="Deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discharge_date">Discharge Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.discharge_date ? format(new Date(formData.discharge_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={dischargeDateOpen} onOpenChange={setDischargeDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.discharge_date ? format(new Date(formData.discharge_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.discharge_date ? new Date(formData.discharge_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('discharge_date', format(date, 'yyyy-MM-dd'));
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

            <div className="space-y-2">
              <Label htmlFor="follow_up_required">Follow-up Required</Label>
              {isReadOnly ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {formData.follow_up_required || 'N/A'}
                </div>
              ) : (
                <Select
                  value={formData.follow_up_required}
                  onValueChange={(value) => handleInputChange('follow_up_required', value)}
                >
                  <SelectTrigger id="follow_up_required">
                    <SelectValue placeholder="Select if follow-up required" />
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

export default StationStateForm;

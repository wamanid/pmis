import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileX, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface DeathConfirmation {
  id?: string;
  prisoner_name?: string;
  medical_officer_name?: string;
  death_date: string;
  death_time: string;
  death_location: string;
  cause_of_death: string;
  death_category: string;
  medical_officer: string;
  post_mortem_required: string;
  post_mortem_date: string;
  post_mortem_findings: string;
  autopsy_report_number: string;
  death_certificate_number: string;
  certificate_issued_date: string;
  circumstances: string;
  witnesses: string;
  police_notified: string;
  police_case_number: string;
  notes: string;
  prisoner: string;
}

interface DeathConfirmationFormProps {
  confirmation?: DeathConfirmation | null;
  onSubmit: (confirmation: DeathConfirmation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DeathConfirmationForm: React.FC<DeathConfirmationFormProps> = ({ confirmation, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<DeathConfirmation>({
    death_date: '',
    death_time: '',
    death_location: '',
    cause_of_death: '',
    death_category: 'Natural',
    medical_officer: '',
    post_mortem_required: 'No',
    post_mortem_date: '',
    post_mortem_findings: '',
    autopsy_report_number: '',
    death_certificate_number: '',
    certificate_issued_date: '',
    circumstances: '',
    witnesses: '',
    police_notified: 'No',
    police_case_number: '',
    notes: '',
    prisoner: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [medicalOfficers, setMedicalOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [deathDateOpen, setDeathDateOpen] = useState(false);
  const [postMortemDateOpen, setPostMortemDateOpen] = useState(false);
  const [certificateDateOpen, setCertificateDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (confirmation && dataLoaded) {
      setFormData(confirmation);
    }
  }, [confirmation, dataLoaded]);

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

  const handleInputChange = (field: keyof DeathConfirmation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.medical_officer) {
      toast.error('Please select a medical officer');
      return;
    }
    if (!formData.death_date) {
      toast.error('Please select the death date');
      return;
    }
    if (!formData.death_time) {
      toast.error('Please enter the death time');
      return;
    }
    if (!formData.cause_of_death) {
      toast.error('Please enter the cause of death');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedOfficer = medicalOfficers.find((o) => o.id === formData.medical_officer);

      const submitData: DeathConfirmation = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        medical_officer_name: selectedOfficer?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Death confirmation created successfully');
        setFormData({
          death_date: '',
          death_time: '',
          death_location: '',
          cause_of_death: '',
          death_category: 'Natural',
          medical_officer: '',
          post_mortem_required: 'No',
          post_mortem_date: '',
          post_mortem_findings: '',
          autopsy_report_number: '',
          death_certificate_number: '',
          certificate_issued_date: '',
          circumstances: '',
          witnesses: '',
          police_notified: 'No',
          police_case_number: '',
          notes: '',
          prisoner: '',
        });
      } else {
        toast.success('Death confirmation updated successfully');
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
          <FileX className="h-5 w-5" />
          {mode === 'create' && 'New Death Confirmation'}
          {mode === 'edit' && 'Edit Death Confirmation'}
          {mode === 'view' && 'View Death Confirmation'}
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
                <Label htmlFor="medical_officer">
                  Certifying Medical Officer <span className="text-red-500">*</span>
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Death Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="death_date">
                  Date of Death <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.death_date ? format(new Date(formData.death_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={deathDateOpen} onOpenChange={setDeathDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.death_date ? format(new Date(formData.death_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.death_date ? new Date(formData.death_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('death_date', format(date, 'yyyy-MM-dd'));
                            setDeathDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="death_time">
                  Time of Death <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="death_time"
                  type="time"
                  value={formData.death_time}
                  onChange={(e) => handleInputChange('death_time', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="death_location">
                  Location of Death <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="death_location"
                  value={formData.death_location}
                  onChange={(e) => handleInputChange('death_location', e.target.value)}
                  placeholder="e.g., Prison Hospital, Cell Block A"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="death_category">
                  Death Category <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.death_category || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.death_category}
                    onValueChange={(value) => handleInputChange('death_category', value)}
                  >
                    <SelectTrigger id="death_category">
                      <SelectValue placeholder="Select death category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Natural">Natural</SelectItem>
                      <SelectItem value="Unnatural">Unnatural</SelectItem>
                      <SelectItem value="Suspicious">Suspicious</SelectItem>
                      <SelectItem value="Suicide">Suicide</SelectItem>
                      <SelectItem value="Accident">Accident</SelectItem>
                      <SelectItem value="Homicide">Homicide</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause_of_death">
                Cause of Death <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cause_of_death"
                value={formData.cause_of_death}
                onChange={(e) => handleInputChange('cause_of_death', e.target.value)}
                placeholder="Enter detailed cause of death..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="circumstances">Circumstances Surrounding Death</Label>
              <Textarea
                id="circumstances"
                value={formData.circumstances}
                onChange={(e) => handleInputChange('circumstances', e.target.value)}
                placeholder="Describe the circumstances..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="witnesses">Witnesses</Label>
              <Textarea
                id="witnesses"
                value={formData.witnesses}
                onChange={(e) => handleInputChange('witnesses', e.target.value)}
                placeholder="List witnesses present..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Post-Mortem Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post_mortem_required">Post-Mortem Required</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.post_mortem_required || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.post_mortem_required}
                    onValueChange={(value) => handleInputChange('post_mortem_required', value)}
                  >
                    <SelectTrigger id="post_mortem_required">
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
                <Label htmlFor="post_mortem_date">Post-Mortem Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.post_mortem_date ? format(new Date(formData.post_mortem_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={postMortemDateOpen} onOpenChange={setPostMortemDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.post_mortem_date ? format(new Date(formData.post_mortem_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.post_mortem_date ? new Date(formData.post_mortem_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('post_mortem_date', format(date, 'yyyy-MM-dd'));
                            setPostMortemDateOpen(false);
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
              <Label htmlFor="autopsy_report_number">Autopsy Report Number</Label>
              <Input
                id="autopsy_report_number"
                value={formData.autopsy_report_number}
                onChange={(e) => handleInputChange('autopsy_report_number', e.target.value)}
                placeholder="e.g., APR-2024-001"
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post_mortem_findings">Post-Mortem Findings</Label>
              <Textarea
                id="post_mortem_findings"
                value={formData.post_mortem_findings}
                onChange={(e) => handleInputChange('post_mortem_findings', e.target.value)}
                placeholder="Enter post-mortem findings..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Death Certificate & Legal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="death_certificate_number">Death Certificate Number</Label>
                <Input
                  id="death_certificate_number"
                  value={formData.death_certificate_number}
                  onChange={(e) => handleInputChange('death_certificate_number', e.target.value)}
                  placeholder="e.g., DC-2024-001"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate_issued_date">Certificate Issue Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.certificate_issued_date ? format(new Date(formData.certificate_issued_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={certificateDateOpen} onOpenChange={setCertificateDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.certificate_issued_date ? format(new Date(formData.certificate_issued_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.certificate_issued_date ? new Date(formData.certificate_issued_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('certificate_issued_date', format(date, 'yyyy-MM-dd'));
                            setCertificateDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="police_notified">Police Notified</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.police_notified || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.police_notified}
                    onValueChange={(value) => handleInputChange('police_notified', value)}
                  >
                    <SelectTrigger id="police_notified">
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
                <Label htmlFor="police_case_number">Police Case Number</Label>
                <Input
                  id="police_case_number"
                  value={formData.police_case_number}
                  onChange={(e) => handleInputChange('police_case_number', e.target.value)}
                  placeholder="e.g., CRB-2024-001"
                  disabled={isReadOnly}
                />
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Confirmation' : 'Update Confirmation'}
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

export default DeathConfirmationForm;

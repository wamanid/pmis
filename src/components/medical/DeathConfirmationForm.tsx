import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileX, Save, X, Calendar as CalendarIcon, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
}

interface StaffProfile {
  id: string;
  name: string;
  staff_number: string;
  designation?: string;
}

interface DeathConfirmation {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  officer_in_charge_name?: string;
  medical_officer_name?: string;
  pathologist_attachment: string;
  other_attachment: string;
  medical_form: string;
  death_certificate: string;
  presumed_cause_of_death: string;
  actual_cause_of_death: string;
  cause_of_death: string;
  place_of_death: string;
  date_of_death: string;
  notes: string;
  prisoner: string;
  officer_in_charge: string;
  medial_officer: string; // Note: API has typo "medial"
}

interface DeathConfirmationFormProps {
  confirmation?: DeathConfirmation | null;
  onSubmit: (confirmation: DeathConfirmation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DeathConfirmationForm: React.FC<DeathConfirmationFormProps> = ({ confirmation, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<DeathConfirmation>({
    pathologist_attachment: '',
    other_attachment: '',
    medical_form: '',
    death_certificate: '',
    presumed_cause_of_death: '',
    actual_cause_of_death: '',
    cause_of_death: '',
    place_of_death: '',
    date_of_death: '',
    notes: '',
    prisoner: '',
    officer_in_charge: '',
    medial_officer: '',
  });

  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [officers, setOfficers] = useState<StaffProfile[]>([]);
  const [medicalOfficers, setMedicalOfficers] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [deathDateOpen, setDeathDateOpen] = useState(false);

  // File upload states
  const [pathologistFile, setPathologistFile] = useState<File | null>(null);
  const [otherFile, setOtherFile] = useState<File | null>(null);
  const [medicalFormFile, setMedicalFormFile] = useState<File | null>(null);
  const [deathCertificateFile, setDeathCertificateFile] = useState<File | null>(null);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (confirmation && dataLoaded) {
      setFormData(confirmation);
    }
  }, [confirmation, dataLoaded]);

  const loadDropdownData = () => {
    // Mock Prisoners
    setPrisoners([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    // Mock Officers in Charge
    setOfficers([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb1', name: 'SSP David Okello', staff_number: 'OIC-001', designation: 'Senior Superintendent' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb2', name: 'SP Sarah Namuganza', staff_number: 'OIC-002', designation: 'Superintendent' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb3', name: 'ASP James Mutumba', staff_number: 'OIC-003', designation: 'Assistant Superintendent' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb4', name: 'IP Grace Nalwanga', staff_number: 'OIC-004', designation: 'Inspector' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb5', name: 'SSP Robert Ssemakula', staff_number: 'OIC-005', designation: 'Senior Superintendent' },
    ]);

    // Mock Medical Officers
    setMedicalOfficers([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc1', name: 'Dr. David Makumbi', staff_number: 'MED-001', designation: 'General Medicine' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc2', name: 'Dr. Sarah Kisakye', staff_number: 'MED-002', designation: 'Internal Medicine' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc3', name: 'Dr. James Okello', staff_number: 'MED-003', designation: 'Surgery' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc4', name: 'Dr. Patricia Mutesi', staff_number: 'MED-004', designation: 'Psychiatry' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc5', name: 'Dr. Richard Ssemakula', staff_number: 'MED-005', designation: 'Infectious Diseases' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof DeathConfirmation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      // In real app, this would upload to server and get back URL
      const mockUrl = `uploads/${field}/${file.name}`;
      handleInputChange(field as keyof DeathConfirmation, mockUrl);
      
      switch (field) {
        case 'pathologist_attachment':
          setPathologistFile(file);
          break;
        case 'other_attachment':
          setOtherFile(file);
          break;
        case 'medical_form':
          setMedicalFormFile(file);
          break;
        case 'death_certificate':
          setDeathCertificateFile(file);
          break;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.officer_in_charge) {
      toast.error('Please select an officer in charge');
      return;
    }
    if (!formData.medial_officer) {
      toast.error('Please select a medical officer');
      return;
    }
    if (!formData.date_of_death) {
      toast.error('Please select date of death');
      return;
    }
    if (!formData.place_of_death) {
      toast.error('Please enter place of death');
      return;
    }
    if (!formData.cause_of_death) {
      toast.error('Please enter cause of death');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedOIC = officers.find((o) => o.id === formData.officer_in_charge);
      const selectedMedical = medicalOfficers.find((m) => m.id === formData.medial_officer);

      const submitData: DeathConfirmation = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        officer_in_charge_name: selectedOIC?.name || '',
        medical_officer_name: selectedMedical?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Death confirmation created successfully');
        setFormData({
          pathologist_attachment: '',
          other_attachment: '',
          medical_form: '',
          death_certificate: '',
          presumed_cause_of_death: '',
          actual_cause_of_death: '',
          cause_of_death: '',
          place_of_death: '',
          date_of_death: '',
          notes: '',
          prisoner: '',
          officer_in_charge: '',
          medial_officer: '',
        });
        setPathologistFile(null);
        setOtherFile(null);
        setMedicalFormFile(null);
        setDeathCertificateFile(null);
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
      case 'officer_in_charge':
        const officer = officers.find(o => o.id === id);
        return officer ? `${officer.staff_number} - ${officer.name} (${officer.designation})` : id;
      case 'medial_officer':
        const medicalOfficer = medicalOfficers.find(m => m.id === id);
        return medicalOfficer ? `${medicalOfficer.staff_number} - ${medicalOfficer.name} (${medicalOfficer.designation})` : id;
      default:
        return id;
    }
  };

  const renderFileUpload = (
    label: string,
    field: string,
    file: File | null,
    required: boolean = false
  ) => {
    const fieldValue = formData[field as keyof DeathConfirmation] as string;
    
    return (
      <div className="space-y-2">
        <Label htmlFor={field}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {isReadOnly ? (
          <div className="p-2 bg-gray-50 rounded border">
            {fieldValue ? (
              <a href={fieldValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                <FileText className="h-4 w-4" />
                View Document
              </a>
            ) : (
              'No file uploaded'
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Input
                id={field}
                type="file"
                onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="flex-1"
              />
              {file && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </span>
              )}
            </div>
            {fieldValue && !file && (
              <div className="text-sm text-gray-600">
                Current file: <a href={fieldValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
              </div>
            )}
          </>
        )}
      </div>
    );
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Death Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_death">
                  Date of Death <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.date_of_death || 'N/A'}
                  </div>
                ) : (
                  <Popover open={deathDateOpen} onOpenChange={setDeathDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        id="date_of_death"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date_of_death ? format(new Date(formData.date_of_death), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date_of_death ? new Date(formData.date_of_death) : undefined}
                        onSelect={(date) => {
                          handleInputChange('date_of_death', date ? format(date, 'yyyy-MM-dd') : '');
                          setDeathDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="place_of_death">
                  Place of Death <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="place_of_death"
                  value={formData.place_of_death}
                  onChange={(e) => handleInputChange('place_of_death', e.target.value)}
                  placeholder="e.g., Prison Hospital Ward, Cell Block A, etc."
                  disabled={isReadOnly}
                />
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
                placeholder="Enter the primary cause of death..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presumed_cause_of_death">Presumed Cause of Death</Label>
              <Textarea
                id="presumed_cause_of_death"
                value={formData.presumed_cause_of_death}
                onChange={(e) => handleInputChange('presumed_cause_of_death', e.target.value)}
                placeholder="Enter the initial/presumed cause of death before investigation..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_cause_of_death">Actual Cause of Death</Label>
              <Textarea
                id="actual_cause_of_death"
                value={formData.actual_cause_of_death}
                onChange={(e) => handleInputChange('actual_cause_of_death', e.target.value)}
                placeholder="Enter the confirmed/actual cause of death after post-mortem or investigation..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Responsible Officers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officer_in_charge">
                  Officer in Charge <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('officer_in_charge', formData.officer_in_charge)}
                  </div>
                ) : (
                  <Select
                    value={formData.officer_in_charge}
                    onValueChange={(value) => handleInputChange('officer_in_charge', value)}
                  >
                    <SelectTrigger id="officer_in_charge">
                      <SelectValue placeholder="Select officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {officers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.staff_number} - {officer.name} ({officer.designation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medial_officer">
                  Medical Officer <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('medial_officer', formData.medial_officer)}
                  </div>
                ) : (
                  <Select
                    value={formData.medial_officer}
                    onValueChange={(value) => handleInputChange('medial_officer', value)}
                  >
                    <SelectTrigger id="medial_officer">
                      <SelectValue placeholder="Select medical officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicalOfficers.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.staff_number} - {officer.name} ({officer.designation})
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
              Documents & Attachments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFileUpload('Death Certificate', 'death_certificate', deathCertificateFile)}
              {renderFileUpload('Medical Form', 'medical_form', medicalFormFile)}
              {renderFileUpload('Pathologist Attachment', 'pathologist_attachment', pathologistFile)}
              {renderFileUpload('Other Attachment', 'other_attachment', otherFile)}
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
                placeholder="Enter any additional notes, observations, or comments..."
                rows={4}
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

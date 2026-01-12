import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { FileText, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CaseBook {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  check_type_name?: string;
  blood_group_name?: string;
  present_complaint: string;
  history: string;
  grade: string;
  referral: string;
  doctors_name: string;
  mental_case: boolean;
  presentation_of_patient: string;
  notes: string;
  edoctor_video_link: string;
  prisoner: string;
  check_type: string;
  bmi: string;
  blood_group: string;
}

interface CaseBookFormProps {
  caseBook?: CaseBook | null;
  onSubmit: (caseBook: CaseBook) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const CaseBookForm: React.FC<CaseBookFormProps> = ({
  caseBook,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<CaseBook>({
    present_complaint: '',
    history: '',
    grade: '',
    referral: '',
    doctors_name: '',
    mental_case: false,
    presentation_of_patient: 'Walking',
    notes: '',
    edoctor_video_link: '',
    prisoner: '',
    check_type: '',
    bmi: '',
    blood_group: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [checkTypes, setCheckTypes] = useState<any[]>([]);
  const [bmiRecords, setBmiRecords] = useState<any[]>([]);
  const [bloodGroups, setBloodGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (caseBook && dataLoaded) {
      setFormData(caseBook);
    }
  }, [caseBook, dataLoaded]);

  const loadDropdownData = () => {
    // Mock data - replace with actual API calls
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
    ]);

    setCheckTypes([
      { id: '1', name: 'General Check-up' },
      { id: '2', name: 'Emergency' },
      { id: '3', name: 'Follow-up' },
      { id: '4', name: 'Routine Examination' },
      { id: '5', name: 'Specialist Consultation' },
    ]);

    setBmiRecords([
      { id: '1', bmi_value: 18.5, category: 'Normal Weight' },
      { id: '2', bmi_value: 22.3, category: 'Normal Weight' },
      { id: '3', bmi_value: 27.1, category: 'Overweight' },
      { id: '4', bmi_value: 16.2, category: 'Underweight' },
    ]);

    setBloodGroups([
      { id: '1', name: 'A+' },
      { id: '2', name: 'A-' },
      { id: '3', name: 'B+' },
      { id: '4', name: 'B-' },
      { id: '5', name: 'AB+' },
      { id: '6', name: 'AB-' },
      { id: '7', name: 'O+' },
      { id: '8', name: 'O-' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof CaseBook, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.check_type) {
      toast.error('Please select check-up type');
      return;
    }
    if (!formData.blood_group) {
      toast.error('Please select blood group');
      return;
    }
    if (!formData.present_complaint.trim()) {
      toast.error('Please enter present complaint');
      return;
    }
    if (!formData.doctors_name.trim()) {
      toast.error('Please enter doctor\'s name');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedCheckType = checkTypes.find((ct) => ct.id === formData.check_type);
      const selectedBloodGroup = bloodGroups.find((bg) => bg.id === formData.blood_group);

      const submitData: CaseBook = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        check_type_name: selectedCheckType?.name || '',
        blood_group_name: selectedBloodGroup?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Case book entry created successfully');
        // Reset form
        setFormData({
          present_complaint: '',
          history: '',
          grade: '',
          referral: '',
          doctors_name: '',
          mental_case: false,
          presentation_of_patient: 'Walking',
          notes: '',
          edoctor_video_link: '',
          prisoner: '',
          check_type: '',
          bmi: '',
          blood_group: '',
        });
      } else {
        toast.success('Case book entry updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5" />
          {mode === 'create' && 'New Case Book Entry'}
          {mode === 'edit' && 'Edit Case Book Entry'}
          {mode === 'view' && 'View Case Book Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prisoner Information */}
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
                  <div className="px-3 py-2 border rounded-md bg-gray-50">
                    {caseBook?.prisoner_number} - {caseBook?.prisoner_name}
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
                      {prisoners.map((prisoner) => (
                        <SelectItem key={prisoner.id} value={prisoner.id}>
                          {prisoner.prisoner_number} - {prisoner.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Medical Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_type">
                  Check-up Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.check_type}
                  onValueChange={(value) => handleInputChange('check_type', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="check_type">
                    <SelectValue placeholder="Select check-up type" />
                  </SelectTrigger>
                  <SelectContent>
                    {checkTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">
                  Blood Group <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => handleInputChange('blood_group', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="blood_group">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg.id} value={bg.id}>
                        {bg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmi">BMI Record</Label>
                <Select
                  value={formData.bmi}
                  onValueChange={(value) => handleInputChange('bmi', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="bmi">
                    <SelectValue placeholder="Select BMI record (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {bmiRecords.map((bmi) => (
                      <SelectItem key={bmi.id} value={bmi.id}>
                        {bmi.bmi_value} - {bmi.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentation_of_patient">
                  Presentation of Patient
                </Label>
                <Select
                  value={formData.presentation_of_patient}
                  onValueChange={(value) => handleInputChange('presentation_of_patient', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="presentation_of_patient">
                    <SelectValue placeholder="Select presentation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Walking">Walking</SelectItem>
                    <SelectItem value="Wheelchair">Wheelchair</SelectItem>
                    <SelectItem value="Stretcher">Stretcher</SelectItem>
                    <SelectItem value="Assisted">Assisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctors_name">
                  Doctor's Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="doctors_name"
                  value={formData.doctors_name}
                  onChange={(e) => handleInputChange('doctors_name', e.target.value)}
                  placeholder="Enter doctor's name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  placeholder="Enter grade"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="present_complaint">
                  Present Complaint <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="present_complaint"
                  value={formData.present_complaint}
                  onChange={(e) => handleInputChange('present_complaint', e.target.value)}
                  placeholder="Describe the present complaint"
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="history">Medical History</Label>
                <Textarea
                  id="history"
                  value={formData.history}
                  onChange={(e) => handleInputChange('history', e.target.value)}
                  placeholder="Enter medical history"
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral">Referral</Label>
                <Textarea
                  id="referral"
                  value={formData.referral}
                  onChange={(e) => handleInputChange('referral', e.target.value)}
                  placeholder="Enter referral information"
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Enter additional notes"
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edoctor_video_link">eDoctor Video Link</Label>
                <Input
                  id="edoctor_video_link"
                  type="url"
                  value={formData.edoctor_video_link}
                  onChange={(e) => handleInputChange('edoctor_video_link', e.target.value)}
                  placeholder="https://example.com/video"
                  disabled={isReadOnly}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="mental_case"
                  checked={formData.mental_case}
                  onCheckedChange={(checked) =>
                    handleInputChange('mental_case', checked === true)
                  }
                  disabled={isReadOnly}
                />
                <Label
                  htmlFor="mental_case"
                  className="cursor-pointer"
                  style={{ cursor: isReadOnly ? 'default' : 'pointer' }}
                >
                  Mental Case
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Entry' : 'Update Entry'}
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex items-center justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CaseBookForm;
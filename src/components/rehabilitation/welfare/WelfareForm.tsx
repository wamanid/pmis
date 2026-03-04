import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Checkbox } from '../../../ui/checkbox';
import { HeartHandshake, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Welfare {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  literacy_level_name?: string;
  education_level_name?: string;
  religion_name?: string;
  tread_qualification_name?: string;
  classification_name?: string;
  officer_name?: string;
  reception_date: string;
  reception_place: string;
  physical_mental_state: string;
  prisoner_history: string;
  note_from_previous_record: string;
  board_recommendation: string;
  income_details: string;
  own_land_property: boolean;
  consider_investigation: boolean;
  has_salary_debt: boolean;
  has_property_debt: boolean;
  has_loan: boolean;
  further_details: string;
  date_captured: string;
  prisoner: string;
  literacy_level: string;
  education_level: string;
  religion: string;
  tread_qualification: string;
  recommended_classification: string;
  officer_in_charge: number;
}

interface WelfareFormProps {
  welfare?: Welfare | null;
  onSubmit: (welfare: Welfare) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const WelfareForm: React.FC<WelfareFormProps> = ({
  welfare,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<Welfare>({
    reception_date: new Date().toISOString().split('T')[0],
    reception_place: '',
    physical_mental_state: '',
    prisoner_history: '',
    note_from_previous_record: '',
    board_recommendation: '',
    income_details: '',
    own_land_property: false,
    consider_investigation: false,
    has_salary_debt: false,
    has_property_debt: false,
    has_loan: false,
    further_details: '',
    date_captured: new Date().toISOString(),
    prisoner: '',
    literacy_level: '',
    education_level: '',
    religion: '',
    tread_qualification: '',
    recommended_classification: '',
    officer_in_charge: 0,
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [literacyLevels, setLiteracyLevels] = useState<any[]>([]);
  const [educationLevels, setEducationLevels] = useState<any[]>([]);
  const [religions, setReligions] = useState<any[]>([]);
  const [treadQualifications, setTreadQualifications] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (welfare) {
      setFormData(welfare);
    }
  }, [welfare]);

  const loadDropdownData = () => {
    // Mock data - replace with actual API calls
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
    ]);

    setLiteracyLevels([
      { id: '1', name: 'Cannot Read or Write' },
      { id: '2', name: 'Basic Literacy' },
      { id: '3', name: 'Functional Literacy' },
      { id: '4', name: 'Fully Literate' },
    ]);

    setEducationLevels([
      { id: '1', name: 'No Formal Education' },
      { id: '2', name: 'Primary Education' },
      { id: '3', name: 'Secondary Education' },
      { id: '4', name: 'Tertiary Education' },
      { id: '5', name: 'University Degree' },
    ]);

    setReligions([
      { id: '1', name: 'Christianity' },
      { id: '2', name: 'Islam' },
      { id: '3', name: 'Hindu' },
      { id: '4', name: 'Other' },
    ]);

    setTreadQualifications([
      { id: '1', name: 'Carpentry' },
      { id: '2', name: 'Masonry' },
      { id: '3', name: 'Tailoring' },
      { id: '4', name: 'Metalwork' },
      { id: '5', name: 'Agriculture' },
      { id: '6', name: 'None' },
    ]);

    setClassifications([
      { id: '1', name: 'Class A - Low Risk' },
      { id: '2', name: 'Class B - Medium Risk' },
      { id: '3', name: 'Class C - High Risk' },
    ]);

    setOfficers([
      { id: 1, name: 'Officer David Wilson' },
      { id: 2, name: 'Officer Sarah Brown' },
      { id: 3, name: 'Officer James Taylor' },
    ]);
  };

  const handleInputChange = (field: keyof Welfare, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof Welfare, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.reception_date) {
      toast.error('Please enter reception date');
      return;
    }
    if (!formData.reception_place.trim()) {
      toast.error('Please enter reception place');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedLiteracy = literacyLevels.find((l) => l.id === formData.literacy_level);
      const selectedEducation = educationLevels.find((e) => e.id === formData.education_level);
      const selectedReligion = religions.find((r) => r.id === formData.religion);
      const selectedTread = treadQualifications.find((t) => t.id === formData.tread_qualification);
      const selectedClassification = classifications.find((c) => c.id === formData.recommended_classification);
      const selectedOfficer = officers.find((o) => o.id === formData.officer_in_charge);

      const submitData: Welfare = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        literacy_level_name: selectedLiteracy?.name || '',
        education_level_name: selectedEducation?.name || '',
        religion_name: selectedReligion?.name || '',
        tread_qualification_name: selectedTread?.name || '',
        classification_name: selectedClassification?.name || '',
        officer_name: selectedOfficer?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Welfare record created successfully');
        // Reset form
        setFormData({
          reception_date: new Date().toISOString().split('T')[0],
          reception_place: '',
          physical_mental_state: '',
          prisoner_history: '',
          note_from_previous_record: '',
          board_recommendation: '',
          income_details: '',
          own_land_property: false,
          consider_investigation: false,
          has_salary_debt: false,
          has_property_debt: false,
          has_loan: false,
          further_details: '',
          date_captured: new Date().toISOString(),
          prisoner: '',
          literacy_level: '',
          education_level: '',
          religion: '',
          tread_qualification: '',
          recommended_classification: '',
          officer_in_charge: 0,
        });
      } else {
        toast.success('Welfare record updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <HeartHandshake className="h-5 w-5" />
          {mode === 'create' && 'New Welfare Record'}
          {mode === 'edit' && 'Edit Welfare Record'}
          {mode === 'view' && 'View Welfare Record'}
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
                <Select
                  value={formData.prisoner}
                  onValueChange={(value) => handleInputChange('prisoner', value)}
                  disabled={isReadOnly}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="officer_in_charge">Officer In Charge</Label>
                <Select
                  value={formData.officer_in_charge.toString()}
                  onValueChange={(value) => handleInputChange('officer_in_charge', parseInt(value))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="officer_in_charge">
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id.toString()}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Reception Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Reception Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reception_date">
                  Reception Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reception_date"
                  type="date"
                  value={formData.reception_date}
                  onChange={(e) => handleInputChange('reception_date', e.target.value)}
                  disabled={isReadOnly}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reception_place">
                  Reception Place <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reception_place"
                  value={formData.reception_place}
                  onChange={(e) => handleInputChange('reception_place', e.target.value)}
                  placeholder="Enter reception place"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Education & Background */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Education & Background
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="literacy_level">Literacy Level</Label>
                <Select
                  value={formData.literacy_level}
                  onValueChange={(value) => handleInputChange('literacy_level', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="literacy_level">
                    <SelectValue placeholder="Select literacy level" />
                  </SelectTrigger>
                  <SelectContent>
                    {literacyLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education_level">Education Level</Label>
                <Select
                  value={formData.education_level}
                  onValueChange={(value) => handleInputChange('education_level', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="education_level">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Select
                  value={formData.religion}
                  onValueChange={(value) => handleInputChange('religion', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="religion">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {religions.map((religion) => (
                      <SelectItem key={religion.id} value={religion.id}>
                        {religion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tread_qualification">Trade Qualification</Label>
                <Select
                  value={formData.tread_qualification}
                  onValueChange={(value) => handleInputChange('tread_qualification', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="tread_qualification">
                    <SelectValue placeholder="Select trade qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    {treadQualifications.map((qual) => (
                      <SelectItem key={qual.id} value={qual.id}>
                        {qual.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommended_classification">Recommended Classification</Label>
                <Select
                  value={formData.recommended_classification}
                  onValueChange={(value) => handleInputChange('recommended_classification', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="recommended_classification">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {classifications.map((classification) => (
                      <SelectItem key={classification.id} value={classification.id}>
                        {classification.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* State & History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              State & History
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="physical_mental_state">Physical & Mental State</Label>
                <Textarea
                  id="physical_mental_state"
                  value={formData.physical_mental_state}
                  onChange={(e) => handleInputChange('physical_mental_state', e.target.value)}
                  placeholder="Describe physical and mental state..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prisoner_history">Prisoner History</Label>
                <Textarea
                  id="prisoner_history"
                  value={formData.prisoner_history}
                  onChange={(e) => handleInputChange('prisoner_history', e.target.value)}
                  placeholder="Enter prisoner history..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note_from_previous_record">Notes from Previous Records</Label>
                <Textarea
                  id="note_from_previous_record"
                  value={formData.note_from_previous_record}
                  onChange={(e) => handleInputChange('note_from_previous_record', e.target.value)}
                  placeholder="Enter notes from previous records..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="board_recommendation">Board Recommendation</Label>
                <Textarea
                  id="board_recommendation"
                  value={formData.board_recommendation}
                  onChange={(e) => handleInputChange('board_recommendation', e.target.value)}
                  placeholder="Enter board recommendation..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Financial & Property Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Financial & Property Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="income_details">Income Details</Label>
                <Textarea
                  id="income_details"
                  value={formData.income_details}
                  onChange={(e) => handleInputChange('income_details', e.target.value)}
                  placeholder="Enter income details..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="own_land_property"
                    checked={formData.own_land_property}
                    onCheckedChange={(checked) => handleCheckboxChange('own_land_property', checked as boolean)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="own_land_property" className="cursor-pointer">
                    Owns Land/Property
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consider_investigation"
                    checked={formData.consider_investigation}
                    onCheckedChange={(checked) => handleCheckboxChange('consider_investigation', checked as boolean)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="consider_investigation" className="cursor-pointer">
                    Consider Investigation
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_salary_debt"
                    checked={formData.has_salary_debt}
                    onCheckedChange={(checked) => handleCheckboxChange('has_salary_debt', checked as boolean)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="has_salary_debt" className="cursor-pointer">
                    Has Salary Debt
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_property_debt"
                    checked={formData.has_property_debt}
                    onCheckedChange={(checked) => handleCheckboxChange('has_property_debt', checked as boolean)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="has_property_debt" className="cursor-pointer">
                    Has Property Debt
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_loan"
                    checked={formData.has_loan}
                    onCheckedChange={(checked) => handleCheckboxChange('has_loan', checked as boolean)}
                    disabled={isReadOnly}
                  />
                  <Label htmlFor="has_loan" className="cursor-pointer">
                    Has Loan
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="further_details">Further Details</Label>
                <Textarea
                  id="further_details"
                  value={formData.further_details}
                  onChange={(e) => handleInputChange('further_details', e.target.value)}
                  placeholder="Enter any additional details..."
                  rows={3}
                  disabled={isReadOnly}
                />
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Welfare Record' : 'Update Welfare Record'}
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

export default WelfareForm;

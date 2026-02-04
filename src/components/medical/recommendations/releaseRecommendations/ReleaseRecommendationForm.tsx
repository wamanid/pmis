import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Switch } from '../../../ui/switch';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { FileCheck, Save, X, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

interface ReleaseRecommendation {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  date_of_report: string;
  abnormal_condition: string;
  duration_of_condition: string;
  cause_of_condition: string;
  life_endangered: boolean;
  illness_fatal: boolean;
  aggravated_pain: boolean;
  contracted_in_prison: boolean;
  permanently_unfit_for_labour: boolean;
  temporary_removal_to_hospital: boolean;
  elderly_cripple_or_feeble: boolean;
  mental_condition_due_to_imprisonment: boolean;
  other_observations: string;
  friends_support: boolean;
  prisoner_wishes: string;
  reoffend_possibility: boolean;
  reoffend_possibility_reason: string;
  hospital_support: boolean;
  hospital_support_reason: string;
  recommendation_date: string;
  approval_status: string;
  approved_by: string;
  approval_date: string;
  approval_notes: string;
  recommendation_notes: string;
  prisoner: string;
}

interface ReleaseRecommendationFormProps {
  releaseRecommendation?: ReleaseRecommendation | null;
  onSubmit: (releaseRecommendation: ReleaseRecommendation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const ReleaseRecommendationForm: React.FC<ReleaseRecommendationFormProps> = ({
  releaseRecommendation,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<ReleaseRecommendation>({
    date_of_report: '',
    abnormal_condition: '',
    duration_of_condition: '',
    cause_of_condition: '',
    life_endangered: false,
    illness_fatal: false,
    aggravated_pain: false,
    contracted_in_prison: false,
    permanently_unfit_for_labour: false,
    temporary_removal_to_hospital: false,
    elderly_cripple_or_feeble: false,
    mental_condition_due_to_imprisonment: false,
    other_observations: '',
    friends_support: false,
    prisoner_wishes: '',
    reoffend_possibility: false,
    reoffend_possibility_reason: '',
    hospital_support: false,
    hospital_support_reason: '',
    recommendation_date: '',
    approval_status: '',
    approved_by: '',
    approval_date: '',
    approval_notes: '',
    recommendation_notes: '',
    prisoner: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportDateOpen, setReportDateOpen] = useState(false);
  const [recDateOpen, setRecDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (releaseRecommendation) {
      setFormData(releaseRecommendation);
    }
  }, [releaseRecommendation]);

  const loadDropdownData = () => {
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
    ]);
  };

  const handleInputChange = (field: keyof ReleaseRecommendation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.date_of_report) {
      toast.error('Please select date of report');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);

      const submitData: ReleaseRecommendation = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Release recommendation created successfully');
      } else {
        toast.success('Release recommendation updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileCheck className="h-5 w-5" />
          {mode === 'create' && 'New Release Recommendation'}
          {mode === 'edit' && 'Edit Release Recommendation'}
          {mode === 'view' && 'View Release Recommendation'}
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
                <Label htmlFor="date_of_report">
                  Date of Report <span className="text-red-500">*</span>
                </Label>
                <Popover open={reportDateOpen} onOpenChange={setReportDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left" disabled={isReadOnly}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date_of_report ? format(new Date(formData.date_of_report), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date_of_report ? new Date(formData.date_of_report) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          handleInputChange('date_of_report', format(date, 'yyyy-MM-dd'));
                          setReportDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Medical Condition
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="abnormal_condition">Abnormal Condition</Label>
                <Input
                  id="abnormal_condition"
                  value={formData.abnormal_condition}
                  onChange={(e) => handleInputChange('abnormal_condition', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_of_condition">Duration of Condition</Label>
                  <Input
                    id="duration_of_condition"
                    value={formData.duration_of_condition}
                    onChange={(e) => handleInputChange('duration_of_condition', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cause_of_condition">Cause of Condition</Label>
                  <Input
                    id="cause_of_condition"
                    value={formData.cause_of_condition}
                    onChange={(e) => handleInputChange('cause_of_condition', e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Medical Assessment Flags
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="life_endangered">Life Endangered</Label>
                <Switch
                  id="life_endangered"
                  checked={formData.life_endangered}
                  onCheckedChange={(checked) => handleInputChange('life_endangered', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="illness_fatal">Illness Fatal</Label>
                <Switch
                  id="illness_fatal"
                  checked={formData.illness_fatal}
                  onCheckedChange={(checked) => handleInputChange('illness_fatal', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="permanently_unfit_for_labour">Permanently Unfit for Labour</Label>
                <Switch
                  id="permanently_unfit_for_labour"
                  checked={formData.permanently_unfit_for_labour}
                  onCheckedChange={(checked) => handleInputChange('permanently_unfit_for_labour', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="contracted_in_prison">Contracted in Prison</Label>
                <Switch
                  id="contracted_in_prison"
                  checked={formData.contracted_in_prison}
                  onCheckedChange={(checked) => handleInputChange('contracted_in_prison', checked)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Recommendation Notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="recommendation_notes">Notes</Label>
              <Textarea
                id="recommendation_notes"
                value={formData.recommendation_notes}
                onChange={(e) => handleInputChange('recommendation_notes', e.target.value)}
                placeholder="Enter recommendation notes..."
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

export default ReleaseRecommendationForm;

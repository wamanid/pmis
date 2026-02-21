import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Switch } from '../../../ui/switch';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { FileCheck, Save, X, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { requiredValidation } from '../../../../utils/validation';
import { format } from 'date-fns';
import CustomPrisonerSearch from '../../../common/CustomPrisonerSearch';
import { ReleaseRecommendation } from '../../../../services/medical/recommendations/releaseRecommendationService';

interface ReleaseRecommendationFormProps {
  releaseRecommendation?: ReleaseRecommendation | null;
  onSubmit: (releaseRecommendation: Partial<ReleaseRecommendation>) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const ReleaseRecommendationForm: React.FC<ReleaseRecommendationFormProps> = ({
  releaseRecommendation,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<ReleaseRecommendation>>({
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
    recommendation_notes: '',
    prisoner: '',
  });

  const [localPrisonerId, setLocalPrisonerId] = useState<string | null>(() => {
    if (releaseRecommendation && (mode === 'edit' || mode === 'view') && releaseRecommendation.prisoner) {
      return releaseRecommendation.prisoner;
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [reportDateOpen, setReportDateOpen] = useState(false);
  const [recDateOpen, setRecDateOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (releaseRecommendation && (mode === 'edit' || mode === 'view')) {
      setFormData(releaseRecommendation);
      setLocalPrisonerId(releaseRecommendation.prisoner || null);
    }
  }, [releaseRecommendation, mode]);

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
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
        recommendation_notes: '',
        prisoner: '',
      });
      setLocalPrisonerId(null);
    }
  }, [mode]);

  const handleInputChange = (field: keyof ReleaseRecommendation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.prisoner) {
      newErrors.prisoner = 'Prisoner is required';
    }
    if (!formData.date_of_report) {
      newErrors.date_of_report = 'Date of Report is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error: any) {
      console.error('Failed to submit form:', error);
      toast.error(error.response?.data?.message || 'Failed to save release recommendation');
    } finally {
      setLoading(false);
    }
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
                {mode === 'edit' || mode === 'view' ? (
                  <Input
                    value={`${releaseRecommendation?.prisoner_number_value || releaseRecommendation?.prisoner_number || 'N/A'} - ${releaseRecommendation?.prisoner_name || 'N/A'}`}
                    disabled
                    readOnly
                    className="bg-muted"
                  />
                ) : (
                  <>
                    <CustomPrisonerSearch
                      value={localPrisonerId}
                      onChange={(value) => {
                        setLocalPrisonerId(value);
                        handleInputChange('prisoner', value);
                      }}
                      placeholder="Search prisoner..."
                      disabled={loading}
                    />
                    {errors.prisoner && (
                      <p className="text-sm text-red-600">{errors.prisoner}</p>
                    )}
                  </>
                )}
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
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          handleInputChange('date_of_report', format(date, 'yyyy-MM-dd'));
                          setReportDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.date_of_report && !isReadOnly && (
                  <p className="text-sm text-red-600">{errors.date_of_report}</p>
                )}
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
                  onCheckedChange={(checked: boolean) => handleInputChange('life_endangered', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="illness_fatal">Illness Fatal</Label>
                <Switch
                  id="illness_fatal"
                  checked={formData.illness_fatal}
                  onCheckedChange={(checked: boolean) => handleInputChange('illness_fatal', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="aggravated_pain">Aggravated Pain</Label>
                <Switch
                  id="aggravated_pain"
                  checked={formData.aggravated_pain}
                  onCheckedChange={(checked: boolean) => handleInputChange('aggravated_pain', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="contracted_in_prison">Contracted in Prison</Label>
                <Switch
                  id="contracted_in_prison"
                  checked={formData.contracted_in_prison}
                  onCheckedChange={(checked: boolean) => handleInputChange('contracted_in_prison', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="permanently_unfit_for_labour">Permanently Unfit for Labour</Label>
                <Switch
                  id="permanently_unfit_for_labour"
                  checked={formData.permanently_unfit_for_labour}
                  onCheckedChange={(checked: boolean) => handleInputChange('permanently_unfit_for_labour', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="temporary_removal_to_hospital">Temporary Removal to Hospital</Label>
                <Switch
                  id="temporary_removal_to_hospital"
                  checked={formData.temporary_removal_to_hospital}
                  onCheckedChange={(checked: boolean) => handleInputChange('temporary_removal_to_hospital', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="elderly_cripple_or_feeble">Elderly, Cripple or Feeble</Label>
                <Switch
                  id="elderly_cripple_or_feeble"
                  checked={formData.elderly_cripple_or_feeble}
                  onCheckedChange={(checked: boolean) => handleInputChange('elderly_cripple_or_feeble', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="mental_condition_due_to_imprisonment">Mental Condition Due to Imprisonment</Label>
                <Switch
                  id="mental_condition_due_to_imprisonment"
                  checked={formData.mental_condition_due_to_imprisonment}
                  onCheckedChange={(checked: boolean) => handleInputChange('mental_condition_due_to_imprisonment', checked)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="other_observations">Other Observations</Label>
              <Textarea
                id="other_observations"
                value={formData.other_observations}
                onChange={(e) => handleInputChange('other_observations', e.target.value)}
                placeholder="Enter other medical observations..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Support Assessment
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="friends_support">Friends/Family Support Available</Label>
                <Switch
                  id="friends_support"
                  checked={formData.friends_support}
                  onCheckedChange={(checked: boolean) => handleInputChange('friends_support', checked)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prisoner_wishes">Prisoner Wishes</Label>
                <Textarea
                  id="prisoner_wishes"
                  value={formData.prisoner_wishes}
                  onChange={(e) => handleInputChange('prisoner_wishes', e.target.value)}
                  placeholder="Enter prisoner wishes and preferences..."
                  rows={3}
                  disabled={isReadOnly}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="reoffend_possibility">Reoffending Possibility</Label>
                <Switch
                  id="reoffend_possibility"
                  checked={formData.reoffend_possibility}
                  onCheckedChange={(checked: boolean) => handleInputChange('reoffend_possibility', checked)}
                  disabled={isReadOnly}
                />
              </div>
              {formData.reoffend_possibility && (
                <div className="space-y-2">
                  <Label htmlFor="reoffend_possibility_reason">Reoffending Possibility Reason</Label>
                  <Textarea
                    id="reoffend_possibility_reason"
                    value={formData.reoffend_possibility_reason}
                    onChange={(e) => handleInputChange('reoffend_possibility_reason', e.target.value)}
                    placeholder="Explain reasons for reoffending possibility..."
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <Label htmlFor="hospital_support">Hospital Support Available</Label>
                <Switch
                  id="hospital_support"
                  checked={formData.hospital_support}
                  onCheckedChange={(checked: boolean) => handleInputChange('hospital_support', checked)}
                  disabled={isReadOnly}
                />
              </div>
              {formData.hospital_support && (
                <div className="space-y-2">
                  <Label htmlFor="hospital_support_reason">Hospital Support Details</Label>
                  <Textarea
                    id="hospital_support_reason"
                    value={formData.hospital_support_reason}
                    onChange={(e) => handleInputChange('hospital_support_reason', e.target.value)}
                    placeholder="Provide details about hospital support..."
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Recommendation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommendation_date">Recommendation Date</Label>
                <Popover open={recDateOpen} onOpenChange={setRecDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left" disabled={isReadOnly}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.recommendation_date ? format(new Date(formData.recommendation_date), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.recommendation_date ? new Date(formData.recommendation_date) : undefined}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          handleInputChange('recommendation_date', format(date, 'yyyy-MM-dd'));
                          setRecDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendation_notes">Recommendation Notes</Label>
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

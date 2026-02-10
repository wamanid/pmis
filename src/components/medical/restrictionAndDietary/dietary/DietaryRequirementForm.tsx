import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import SearchableSelect from '../../../common/SearchableSelect';
import { UtensilsCrossed, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { format } from 'date-fns';
import {
  DietaryRequirement,
  PrisonerRestriction,
  fetchPrisonerRestrictions,
  createDietaryRequirement,
  updateDietaryRequirement,
} from '../../../../services/medical/restrictionAndDietary/dietaryRequirementService';

interface DietaryRequirementFormProps {
  requirement?: DietaryRequirement | null;
  onSubmit: (requirement: DietaryRequirement) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DietaryRequirementForm: React.FC<DietaryRequirementFormProps> = ({ requirement, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<DietaryRequirement>({
    dietary_requirement: '',
    start_date: '',
    end_date: '',
    prisoner_restriction: '',
  });

  const [loading, setLoading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Local state for dropdown value
  const [localRestrictionValue, setLocalRestrictionValue] = useState<string | null>(() => {
    if (requirement && (mode === 'edit' || mode === 'view') && requirement.prisoner_restriction) {
      return requirement.prisoner_restriction;
    }
    return null;
  });

  // Sync form data when requirement changes
  useEffect(() => {
    if (requirement && (mode === 'edit' || mode === 'view')) {
      setFormData(requirement);
      setLocalRestrictionValue(requirement.prisoner_restriction || null);
    }
  }, [requirement, mode]);

  // Reset form when switching to create mode
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        dietary_requirement: '',
        start_date: '',
        end_date: '',
        prisoner_restriction: '',
      });
      setLocalRestrictionValue(null);
    }
  }, [mode]);

  const handleInputChange = (field: keyof DietaryRequirement, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Fetch callback for prisoner restrictions dropdown (memoized to prevent re-fetching on every render)
  const fetchRestrictionsCallback = useCallback(async (
    opts: { [key: string]: any; search?: string; page?: number; page_size?: number },
    signal?: AbortSignal
  ) => {
    return await fetchPrisonerRestrictions(
      opts.page || 1,
      opts.page_size || 50,
      opts.search || '',
      signal
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner_restriction) {
      toast.error('Please select a prisoner restriction');
      return;
    }
    if (!formData.dietary_requirement) {
      toast.error('Please enter dietary requirement');
      return;
    }
    if (!formData.start_date) {
      toast.error('Please select a start date');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        dietary_requirement: formData.dietary_requirement,
        start_date: formData.start_date,
        end_date: formData.end_date || '',
        prisoner_restriction: formData.prisoner_restriction,
      };

      if (mode === 'create') {
        const created = await createDietaryRequirement(payload);
        toast.success('Dietary requirement created successfully');
        onSubmit(created);
        
        // Reset form
        setFormData({
          dietary_requirement: '',
          start_date: '',
          end_date: '',
          prisoner_restriction: '',
        });
        setLocalRestrictionValue(null);
      } else if (mode === 'edit' && requirement?.id) {
        const updated = await updateDietaryRequirement(requirement.id, payload);
        toast.success('Dietary requirement updated successfully');
        onSubmit(updated);
      }
    } catch (error: any) {
      console.error('Error saving dietary requirement:', error);
      toast.error(error.response?.data?.message || 'Failed to save dietary requirement');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  // Derive initialItem for SearchableSelect in edit/view mode
  const initialRestrictionItem =
    requirement && (mode === 'edit' || mode === 'view') && requirement.prisoner_restriction
      ? {
          id: requirement.prisoner_restriction,
          name: requirement.prisoner_restriction_info || '',
          prisoner_number: requirement.prisoner_restriction_info?.split(' - ')[0] || '',
          prisoner_name: requirement.prisoner_restriction_info?.split(' - ')[1]?.split(' (')[0] || '',
          reason_name: requirement.prisoner_restriction_info?.match(/\(([^)]+)\)/)?.[1] || '',
          state_of_prisoner: '',
        }
      : null;

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <UtensilsCrossed className="h-5 w-5" />
          {mode === 'create' && 'New Dietary Requirement'}
          {mode === 'edit' && 'Edit Dietary Requirement'}
          {mode === 'view' && 'View Dietary Requirement'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Restriction
            </h3>
            <div className="space-y-2">
              <Label htmlFor="prisoner_restriction">
                Prisoner Restriction <span className="text-red-500">*</span>
              </Label>
              {isReadOnly || mode === 'edit' ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {requirement?.prisoner_restriction_info || requirement?.prisoner_name || 'N/A'}
                </div>
              ) : (
                <SearchableSelect
                  key={`restriction-${mode}-${requirement?.id}`}
                  fetchPaginated={fetchRestrictionsCallback}
                  value={localRestrictionValue}
                  onChange={(val) => {
                    setLocalRestrictionValue(val);
                    handleInputChange('prisoner_restriction', val);
                  }}
                  placeholder="Select prisoner restriction"
                  idField="id"
                  labelField="name"
                  renderItem={(item: any) => (
                    <div>
                      <div className="font-medium">{item.prisoner_name}</div>
                      <div className="text-sm text-gray-500">
                        {item.prisoner_number} - {item.reason_name}
                      </div>
                    </div>
                  )}
                  pageSize={50}
                  initialItem={initialRestrictionItem ?? undefined}
                  disabled={loading}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Dietary Details
            </h3>
            <div className="space-y-2">
              <Label htmlFor="dietary_requirement">
                Dietary Requirement <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="dietary_requirement"
                value={formData.dietary_requirement}
                onChange={(e) => handleInputChange('dietary_requirement', e.target.value)}
                placeholder="Enter dietary requirement details..."
                rows={4}
                disabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.start_date ? format(new Date(formData.start_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? format(new Date(formData.start_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date ? new Date(formData.start_date) : undefined}
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            handleInputChange('start_date', format(date, 'yyyy-MM-dd'));
                            setStartDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.end_date ? format(new Date(formData.end_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(new Date(formData.end_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date ? new Date(formData.end_date) : undefined}
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            handleInputChange('end_date', format(date, 'yyyy-MM-dd'));
                            setEndDateOpen(false);
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Requirement' : 'Update Requirement'}
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

export default DietaryRequirementForm;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UtensilsCrossed, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface DietaryRequirement {
  id?: string;
  prisoner_restriction_info?: string;
  dietary_requirement: string;
  start_date: string;
  end_date: string;
  prisoner_restriction: string;
}

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

  const [prisonerRestrictions, setPrisonerRestrictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (requirement && dataLoaded) {
      setFormData(requirement);
    }
  }, [requirement, dataLoaded]);

  const loadDropdownData = () => {
    // Mock Prisoner Restrictions data
    setPrisonerRestrictions([
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', 
        prisoner_name: 'John Doe',
        prisoner_number: 'PR-2024-001',
        reason_name: 'Medical Condition',
        state_of_prisoner: 'Under medical observation'
      },
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', 
        prisoner_name: 'Jane Smith',
        prisoner_number: 'PR-2024-002',
        reason_name: 'Security Risk',
        state_of_prisoner: 'Restricted movement'
      },
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', 
        prisoner_name: 'Michael Johnson',
        prisoner_number: 'PR-2024-003',
        reason_name: 'Behavioral Issues',
        state_of_prisoner: 'Under monitoring'
      },
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', 
        prisoner_name: 'Emily Davis',
        prisoner_number: 'PR-2024-004',
        reason_name: 'Injury Recovery',
        state_of_prisoner: 'Post-surgery care'
      },
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', 
        prisoner_name: 'Robert Lee',
        prisoner_number: 'PR-2024-005',
        reason_name: 'Mental Health',
        state_of_prisoner: 'Psychiatric evaluation'
      },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof DietaryRequirement, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setTimeout(() => {
      const selectedRestriction = prisonerRestrictions.find((r) => r.id === formData.prisoner_restriction);

      const submitData: DietaryRequirement = {
        ...formData,
        prisoner_restriction_info: selectedRestriction 
          ? `${selectedRestriction.prisoner_number} - ${selectedRestriction.prisoner_name} (${selectedRestriction.reason_name})`
          : '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Dietary requirement created successfully');
        setFormData({
          dietary_requirement: '',
          start_date: '',
          end_date: '',
          prisoner_restriction: '',
        });
      } else {
        toast.success('Dietary requirement updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  // Get display values for view mode
  const getDisplayValue = (field: string, id: string) => {
    if (!id) return 'N/A';
    
    switch (field) {
      case 'prisoner_restriction':
        const restriction = prisonerRestrictions.find(r => r.id === id);
        return restriction 
          ? `${restriction.prisoner_number} - ${restriction.prisoner_name} (${restriction.reason_name})`
          : id;
      default:
        return id;
    }
  };

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
              {isReadOnly ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {getDisplayValue('prisoner_restriction', formData.prisoner_restriction)}
                </div>
              ) : (
                <Select
                  value={formData.prisoner_restriction}
                  onValueChange={(value) => handleInputChange('prisoner_restriction', value)}
                >
                  <SelectTrigger id="prisoner_restriction">
                    <SelectValue placeholder="Select prisoner restriction" />
                  </SelectTrigger>
                  <SelectContent>
                    {prisonerRestrictions.map((restriction) => (
                      <SelectItem key={restriction.id} value={restriction.id}>
                        {restriction.prisoner_number} - {restriction.prisoner_name} ({restriction.reason_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        onSelect={(date) => {
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
                        onSelect={(date) => {
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

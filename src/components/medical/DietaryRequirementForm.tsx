import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { UtensilsCrossed, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface DietaryRequirement {
  id?: string;
  prisoner_name?: string;
  diet_type_name?: string;
  allergy_name?: string;
  requirement_date: string;
  expiry_date: string;
  specific_requirements: string;
  meal_plan: string;
  prescribed_by: string;
  is_active: boolean;
  medical_condition: string;
  special_instructions: string;
  prisoner: string;
  diet_type: string;
  allergy: string;
}

interface DietaryRequirementFormProps {
  requirement?: DietaryRequirement | null;
  onSubmit: (requirement: DietaryRequirement) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DietaryRequirementForm: React.FC<DietaryRequirementFormProps> = ({ requirement, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<DietaryRequirement>({
    requirement_date: '',
    expiry_date: '',
    specific_requirements: '',
    meal_plan: '',
    prescribed_by: '',
    is_active: true,
    medical_condition: '',
    special_instructions: '',
    prisoner: '',
    diet_type: '',
    allergy: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [dietTypes, setDietTypes] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [reqDateOpen, setReqDateOpen] = useState(false);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (requirement && dataLoaded) {
      setFormData(requirement);
    }
  }, [requirement, dataLoaded]);

  const loadDropdownData = () => {
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    setDietTypes([
      { id: '1', name: 'Vegetarian', description: 'Plant-based diet' },
      { id: '2', name: 'Diabetic', description: 'Low sugar diet' },
      { id: '3', name: 'Low Sodium', description: 'Reduced salt diet' },
      { id: '4', name: 'Gluten-Free', description: 'No gluten products' },
      { id: '5', name: 'Halal', description: 'Islamic dietary laws' },
      { id: '6', name: 'Kosher', description: 'Jewish dietary laws' },
      { id: '7', name: 'Soft Diet', description: 'Easy to chew/digest' },
      { id: '8', name: 'Low Fat', description: 'Reduced fat content' },
    ]);

    setAllergies([
      { id: '1', name: 'Peanuts', severity: 'Severe' },
      { id: '2', name: 'Dairy', severity: 'Moderate' },
      { id: '3', name: 'Eggs', severity: 'Moderate' },
      { id: '4', name: 'Shellfish', severity: 'Severe' },
      { id: '5', name: 'Soy', severity: 'Mild' },
      { id: '6', name: 'Wheat', severity: 'Moderate' },
      { id: '7', name: 'Fish', severity: 'Severe' },
      { id: '8', name: 'Tree Nuts', severity: 'Severe' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof DietaryRequirement, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.diet_type) {
      toast.error('Please select a diet type');
      return;
    }
    if (!formData.requirement_date) {
      toast.error('Please select a requirement date');
      return;
    }
    if (!formData.specific_requirements) {
      toast.error('Please enter specific requirements');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedDietType = dietTypes.find((d) => d.id === formData.diet_type);
      const selectedAllergy = allergies.find((a) => a.id === formData.allergy);

      const submitData: DietaryRequirement = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        diet_type_name: selectedDietType?.name || '',
        allergy_name: selectedAllergy?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Dietary requirement created successfully');
        setFormData({
          requirement_date: '',
          expiry_date: '',
          specific_requirements: '',
          meal_plan: '',
          prescribed_by: '',
          is_active: true,
          medical_condition: '',
          special_instructions: '',
          prisoner: '',
          diet_type: '',
          allergy: '',
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
      case 'prisoner':
        const prisoner = prisoners.find(p => p.id === id);
        return prisoner ? `${prisoner.prisoner_number} - ${prisoner.full_name}` : id;
      case 'diet_type':
        const dietType = dietTypes.find(d => d.id === id);
        return dietType ? `${dietType.name} - ${dietType.description}` : id;
      case 'allergy':
        const allergy = allergies.find(a => a.id === id);
        return allergy ? `${allergy.name} (${allergy.severity})` : id;
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
                <Label htmlFor="is_active">Status</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      Active Requirement
                    </Label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Dietary Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diet_type">
                  Diet Type <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('diet_type', formData.diet_type)}
                  </div>
                ) : (
                  <Select
                    value={formData.diet_type}
                    onValueChange={(value) => handleInputChange('diet_type', value)}
                  >
                    <SelectTrigger id="diet_type">
                      <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dietTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} - {type.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergy">Allergy</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('allergy', formData.allergy)}
                  </div>
                ) : (
                  <Select
                    value={formData.allergy}
                    onValueChange={(value) => handleInputChange('allergy', value)}
                  >
                    <SelectTrigger id="allergy">
                      <SelectValue placeholder="Select allergy (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {allergies.map((allergy) => (
                        <SelectItem key={allergy.id} value={allergy.id}>
                          {allergy.name} ({allergy.severity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requirement_date">
                  Requirement Date <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.requirement_date ? format(new Date(formData.requirement_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={reqDateOpen} onOpenChange={setReqDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.requirement_date ? format(new Date(formData.requirement_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.requirement_date ? new Date(formData.requirement_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('requirement_date', format(date, 'yyyy-MM-dd'));
                            setReqDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.expiry_date ? format(new Date(formData.expiry_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={expiryDateOpen} onOpenChange={setExpiryDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiry_date ? format(new Date(formData.expiry_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.expiry_date ? new Date(formData.expiry_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('expiry_date', format(date, 'yyyy-MM-dd'));
                            setExpiryDateOpen(false);
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
              <Label htmlFor="specific_requirements">
                Specific Requirements <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="specific_requirements"
                value={formData.specific_requirements}
                onChange={(e) => handleInputChange('specific_requirements', e.target.value)}
                placeholder="Enter specific dietary requirements..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal_plan">Meal Plan</Label>
              <Textarea
                id="meal_plan"
                value={formData.meal_plan}
                onChange={(e) => handleInputChange('meal_plan', e.target.value)}
                placeholder="Enter meal plan details..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Medical Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medical_condition">Medical Condition</Label>
                <Input
                  id="medical_condition"
                  value={formData.medical_condition}
                  onChange={(e) => handleInputChange('medical_condition', e.target.value)}
                  placeholder="Enter related medical condition"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prescribed_by">Prescribed By</Label>
                <Input
                  id="prescribed_by"
                  value={formData.prescribed_by}
                  onChange={(e) => handleInputChange('prescribed_by', e.target.value)}
                  placeholder="Enter prescriber name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  placeholder="Enter any special instructions..."
                  rows={3}
                  disabled={isReadOnly}
                />
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

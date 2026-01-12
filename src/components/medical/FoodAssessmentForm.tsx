import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UtensilsCrossed, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface FoodAssessment {
  id?: string;
  prisoner_name?: string;
  assessor_name?: string;
  assessment_date: string;
  meal_type: string;
  food_quality: string;
  portion_size: string;
  nutritional_adequacy: string;
  food_temperature: string;
  presentation: string;
  taste_feedback: string;
  hygiene_standards: string;
  special_dietary_needs: string;
  allergen_considerations: string;
  appetite_level: string;
  food_consumed_percentage: string;
  waste_amount: string;
  complaints: string;
  assessor: string;
  recommendations: string;
  follow_up_required: string;
  notes: string;
  prisoner: string;
}

interface FoodAssessmentFormProps {
  assessment?: FoodAssessment | null;
  onSubmit: (assessment: FoodAssessment) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const FoodAssessmentForm: React.FC<FoodAssessmentFormProps> = ({ assessment, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<FoodAssessment>({
    assessment_date: '',
    meal_type: '',
    food_quality: 'Good',
    portion_size: 'Adequate',
    nutritional_adequacy: 'Adequate',
    food_temperature: 'Appropriate',
    presentation: 'Good',
    taste_feedback: '',
    hygiene_standards: 'Excellent',
    special_dietary_needs: '',
    allergen_considerations: '',
    appetite_level: 'Normal',
    food_consumed_percentage: '',
    waste_amount: 'Minimal',
    complaints: '',
    assessor: '',
    recommendations: '',
    follow_up_required: 'No',
    notes: '',
    prisoner: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [assessors, setAssessors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [assessmentDateOpen, setAssessmentDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (assessment && dataLoaded) {
      setFormData(assessment);
    }
  }, [assessment, dataLoaded]);

  const loadDropdownData = () => {
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    setAssessors([
      { id: '1', name: 'Nurse Mary Nakato', role: 'Ward Nurse', staff_number: 'NUR-001' },
      { id: '2', name: 'Nutritionist Peter Musoke', role: 'Clinical Nutritionist', staff_number: 'NUT-001' },
      { id: '3', name: 'Dr. David Makumbi', role: 'Medical Officer', staff_number: 'MED-001' },
      { id: '4', name: 'Nurse Grace Atim', role: 'Ward Nurse', staff_number: 'NUR-002' },
      { id: '5', name: 'Nutritionist Sarah Kizza', role: 'Dietitian', staff_number: 'NUT-002' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof FoodAssessment, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.meal_type) {
      toast.error('Please select a meal type');
      return;
    }
    if (!formData.assessor) {
      toast.error('Please select an assessor');
      return;
    }
    if (!formData.assessment_date) {
      toast.error('Please select an assessment date');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedAssessor = assessors.find((a) => a.id === formData.assessor);

      const submitData: FoodAssessment = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        assessor_name: selectedAssessor?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Food assessment created successfully');
        setFormData({
          assessment_date: '',
          meal_type: '',
          food_quality: 'Good',
          portion_size: 'Adequate',
          nutritional_adequacy: 'Adequate',
          food_temperature: 'Appropriate',
          presentation: 'Good',
          taste_feedback: '',
          hygiene_standards: 'Excellent',
          special_dietary_needs: '',
          allergen_considerations: '',
          appetite_level: 'Normal',
          food_consumed_percentage: '',
          waste_amount: 'Minimal',
          complaints: '',
          assessor: '',
          recommendations: '',
          follow_up_required: 'No',
          notes: '',
          prisoner: '',
        });
      } else {
        toast.success('Food assessment updated successfully');
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
      case 'assessor':
        const assessor = assessors.find(a => a.id === id);
        return assessor ? `${assessor.name} (${assessor.role})` : id;
      default:
        return id;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <UtensilsCrossed className="h-5 w-5" />
          {mode === 'create' && 'New Food Assessment'}
          {mode === 'edit' && 'Edit Food Assessment'}
          {mode === 'view' && 'View Food Assessment'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Basic Information
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meal_type">
                  Meal Type <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.meal_type || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.meal_type}
                    onValueChange={(value) => handleInputChange('meal_type', value)}
                  >
                    <SelectTrigger id="meal_type">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                      <SelectItem value="Snack">Snack</SelectItem>
                      <SelectItem value="Special Meal">Special Meal</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessor">
                  Assessor <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('assessor', formData.assessor)}
                  </div>
                ) : (
                  <Select
                    value={formData.assessor}
                    onValueChange={(value) => handleInputChange('assessor', value)}
                  >
                    <SelectTrigger id="assessor">
                      <SelectValue placeholder="Select assessor" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessors.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.role})
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
              Food Quality Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="food_quality">Food Quality</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.food_quality || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.food_quality}
                    onValueChange={(value) => handleInputChange('food_quality', value)}
                  >
                    <SelectTrigger id="food_quality">
                      <SelectValue placeholder="Select food quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="portion_size">Portion Size</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.portion_size || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.portion_size}
                    onValueChange={(value) => handleInputChange('portion_size', value)}
                  >
                    <SelectTrigger id="portion_size">
                      <SelectValue placeholder="Select portion size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excessive">Excessive</SelectItem>
                      <SelectItem value="Adequate">Adequate</SelectItem>
                      <SelectItem value="Insufficient">Insufficient</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nutritional_adequacy">Nutritional Adequacy</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.nutritional_adequacy || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.nutritional_adequacy}
                    onValueChange={(value) => handleInputChange('nutritional_adequacy', value)}
                  >
                    <SelectTrigger id="nutritional_adequacy">
                      <SelectValue placeholder="Select nutritional adequacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Adequate">Adequate</SelectItem>
                      <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="food_temperature">Food Temperature</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.food_temperature || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.food_temperature}
                    onValueChange={(value) => handleInputChange('food_temperature', value)}
                  >
                    <SelectTrigger id="food_temperature">
                      <SelectValue placeholder="Select food temperature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appropriate">Appropriate</SelectItem>
                      <SelectItem value="Too Hot">Too Hot</SelectItem>
                      <SelectItem value="Too Cold">Too Cold</SelectItem>
                      <SelectItem value="Room Temperature">Room Temperature</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="presentation">Presentation</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.presentation || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.presentation}
                    onValueChange={(value) => handleInputChange('presentation', value)}
                  >
                    <SelectTrigger id="presentation">
                      <SelectValue placeholder="Select presentation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hygiene_standards">Hygiene Standards</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.hygiene_standards || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.hygiene_standards}
                    onValueChange={(value) => handleInputChange('hygiene_standards', value)}
                  >
                    <SelectTrigger id="hygiene_standards">
                      <SelectValue placeholder="Select hygiene standards" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taste_feedback">Taste Feedback</Label>
              <Textarea
                id="taste_feedback"
                value={formData.taste_feedback}
                onChange={(e) => handleInputChange('taste_feedback', e.target.value)}
                placeholder="Enter prisoner's feedback on taste..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Dietary Considerations
            </h3>
            <div className="space-y-2">
              <Label htmlFor="special_dietary_needs">Special Dietary Needs</Label>
              <Textarea
                id="special_dietary_needs"
                value={formData.special_dietary_needs}
                onChange={(e) => handleInputChange('special_dietary_needs', e.target.value)}
                placeholder="Enter special dietary requirements..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergen_considerations">Allergen Considerations</Label>
              <Textarea
                id="allergen_considerations"
                value={formData.allergen_considerations}
                onChange={(e) => handleInputChange('allergen_considerations', e.target.value)}
                placeholder="Enter any allergen information..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Consumption Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appetite_level">Appetite Level</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.appetite_level || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.appetite_level}
                    onValueChange={(value) => handleInputChange('appetite_level', value)}
                  >
                    <SelectTrigger id="appetite_level">
                      <SelectValue placeholder="Select appetite level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                      <SelectItem value="No Appetite">No Appetite</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="food_consumed_percentage">Food Consumed (%)</Label>
                <Input
                  id="food_consumed_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.food_consumed_percentage}
                  onChange={(e) => handleInputChange('food_consumed_percentage', e.target.value)}
                  placeholder="e.g., 75"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="waste_amount">Waste Amount</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.waste_amount || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.waste_amount}
                    onValueChange={(value) => handleInputChange('waste_amount', value)}
                  >
                    <SelectTrigger id="waste_amount">
                      <SelectValue placeholder="Select waste amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Minimal">Minimal</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Significant">Significant</SelectItem>
                      <SelectItem value="All Wasted">All Wasted</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Feedback and Recommendations
            </h3>
            <div className="space-y-2">
              <Label htmlFor="complaints">Complaints</Label>
              <Textarea
                id="complaints"
                value={formData.complaints}
                onChange={(e) => handleInputChange('complaints', e.target.value)}
                placeholder="Enter any complaints from prisoner..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                placeholder="Enter recommendations for improvement..."
                rows={3}
                disabled={isReadOnly}
              />
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

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Assessment' : 'Update Assessment'}
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

export default FoodAssessmentForm;

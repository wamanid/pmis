import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Activity, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from '../ui/badge';

interface BMIRecord {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  classification_name?: string;
  weight: string;
  height: string;
  bmi: string;
  prisoner: string;
  bmi_classification: string;
}

interface BMIFormProps {
  bmiRecord?: BMIRecord | null;
  onSubmit: (bmiRecord: BMIRecord) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const BMIForm: React.FC<BMIFormProps> = ({
  bmiRecord,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<BMIRecord>({
    weight: '',
    height: '',
    bmi: '',
    prisoner: '',
    bmi_classification: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [bmiClassifications, setBmiClassifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (bmiRecord) {
      setFormData(bmiRecord);
      if (bmiRecord.bmi) {
        setCalculatedBMI(parseFloat(bmiRecord.bmi));
      }
    }
  }, [bmiRecord]);

  useEffect(() => {
    calculateBMI();
  }, [formData.weight, formData.height]);

  const loadDropdownData = () => {
    // Mock data - replace with actual API calls
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    setBmiClassifications([
      { id: '1', name: 'Underweight', min_bmi: 0, max_bmi: 18.5, description: 'BMI less than 18.5' },
      { id: '2', name: 'Normal Weight', min_bmi: 18.5, max_bmi: 24.9, description: 'BMI 18.5 - 24.9' },
      { id: '3', name: 'Overweight', min_bmi: 25, max_bmi: 29.9, description: 'BMI 25 - 29.9' },
      { id: '4', name: 'Obese Class I', min_bmi: 30, max_bmi: 34.9, description: 'BMI 30 - 34.9' },
      { id: '5', name: 'Obese Class II', min_bmi: 35, max_bmi: 39.9, description: 'BMI 35 - 39.9' },
      { id: '6', name: 'Obese Class III', min_bmi: 40, max_bmi: 100, description: 'BMI 40 and above' },
    ]);
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);

    if (weight > 0 && height > 0) {
      // BMI = weight (kg) / (height (cm) / 100)^2
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      setCalculatedBMI(bmi);
      
      // Auto-select classification based on BMI
      const classification = bmiClassifications.find(
        (c) => bmi >= c.min_bmi && bmi < c.max_bmi
      );
      if (classification) {
        setFormData((prev) => ({
          ...prev,
          bmi: bmi.toFixed(2),
          bmi_classification: classification.id,
        }));
      } else {
        setFormData((prev) => ({ ...prev, bmi: bmi.toFixed(2) }));
      }
    } else {
      setCalculatedBMI(null);
      setFormData((prev) => ({ ...prev, bmi: '' }));
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'bg-blue-100 text-blue-800' };
    if (bmi < 25) return { label: 'Normal Weight', color: 'bg-green-100 text-green-800' };
    if (bmi < 30) return { label: 'Overweight', color: 'bg-yellow-100 text-yellow-800' };
    if (bmi < 35) return { label: 'Obese Class I', color: 'bg-orange-100 text-orange-800' };
    if (bmi < 40) return { label: 'Obese Class II', color: 'bg-red-100 text-red-800' };
    return { label: 'Obese Class III', color: 'bg-red-200 text-red-900' };
  };

  const handleInputChange = (field: keyof BMIRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }
    if (!formData.height || parseFloat(formData.height) <= 0) {
      toast.error('Please enter a valid height');
      return;
    }
    if (!formData.bmi_classification) {
      toast.error('Please select BMI classification');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedClassification = bmiClassifications.find(
        (c) => c.id === formData.bmi_classification
      );

      const submitData: BMIRecord = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        classification_name: selectedClassification?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('BMI record created successfully');
        // Reset form
        setFormData({
          weight: '',
          height: '',
          bmi: '',
          prisoner: '',
          bmi_classification: '',
        });
        setCalculatedBMI(null);
      } else {
        toast.success('BMI record updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5" />
          {mode === 'create' && 'New BMI Record'}
          {mode === 'edit' && 'Edit BMI Record'}
          {mode === 'view' && 'View BMI Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prisoner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
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
            </div>
          </div>

          {/* BMI Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Body Measurements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight (kg) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="Enter weight in kg"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">
                  Height (cm) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="Enter height in cm"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* BMI Calculation */}
          {calculatedBMI !== null && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                BMI Calculation
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Calculated BMI</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold" style={{ color: '#650000' }}>
                        {calculatedBMI.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">kg/m²</span>
                    </div>
                  </div>
                  <Badge className={getBMICategory(calculatedBMI).color}>
                    {getBMICategory(calculatedBMI).label}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Weight:</strong> {formData.weight} kg
                  </p>
                  <p>
                    <strong>Height:</strong> {formData.height} cm (
                    {(parseFloat(formData.height) / 100).toFixed(2)} m)
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    Formula: BMI = Weight (kg) ÷ Height² (m²)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BMI Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              BMI Classification
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bmi_classification">
                  Classification <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.bmi_classification}
                  onValueChange={(value) => handleInputChange('bmi_classification', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="bmi_classification">
                    <SelectValue placeholder="Select BMI classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {bmiClassifications.map((classification) => (
                      <SelectItem key={classification.id} value={classification.id}>
                        {classification.name} ({classification.description})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* BMI Reference Guide */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">BMI Reference Guide</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span>Underweight: &lt; 18.5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span>Normal: 18.5 - 24.9</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span>Overweight: 25 - 29.9</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span>Obese I: 30 - 34.9</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span>Obese II: 35 - 39.9</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Obese III: ≥ 40</span>
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Record' : 'Update Record'}
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

export default BMIForm;
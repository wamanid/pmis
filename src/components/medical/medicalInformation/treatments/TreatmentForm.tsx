import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Switch } from '../../../ui/switch';
import { Pill, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Treatment {
  id?: string;
  prisoner_name?: string;
  quantifiable: boolean;
  medication: string;
  quantity: string;
  unit: string;
  dosage: string;
  notes: string;
  medical_case_book: string;
}

interface TreatmentFormProps {
  treatment?: Treatment | null;
  onSubmit: (treatment: Treatment) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({ treatment, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<Treatment>({
    quantifiable: false,
    medication: '',
    quantity: '',
    unit: '',
    dosage: '',
    notes: '',
    medical_case_book: '',
  });

  const [caseBooks, setCaseBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (treatment && dataLoaded) {
      setFormData(treatment);
    }
  }, [treatment, dataLoaded]);

  const loadDropdownData = () => {
    setCaseBooks([
      { id: '1', prisoner_name: 'John Doe', case_number: 'CB-2024-001' },
      { id: '2', prisoner_name: 'Jane Smith', case_number: 'CB-2024-002' },
      { id: '3', prisoner_name: 'Michael Johnson', case_number: 'CB-2024-003' },
    ]);
    
    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof Treatment, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medical_case_book) {
      toast.error('Please select a medical case book');
      return;
    }
    if (!formData.medication) {
      toast.error('Please enter medication details');
      return;
    }
    if (formData.quantifiable && !formData.quantity) {
      toast.error('Please enter quantity for quantifiable medication');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedCaseBook = caseBooks.find((cb) => cb.id === formData.medical_case_book);

      const submitData: Treatment = {
        ...formData,
        prisoner_name: selectedCaseBook?.prisoner_name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Treatment record created successfully');
        setFormData({
          quantifiable: false,
          medication: '',
          quantity: '',
          unit: '',
          dosage: '',
          notes: '',
          medical_case_book: '',
        });
      } else {
        toast.success('Treatment record updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Pill className="h-5 w-5" />
          {mode === 'create' && 'New Treatment Record'}
          {mode === 'edit' && 'Edit Treatment Record'}
          {mode === 'view' && 'View Treatment Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Case Book Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medical_case_book">
                  Medical Case Book <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.medical_case_book}
                  onValueChange={(value) => handleInputChange('medical_case_book', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="medical_case_book">
                    <SelectValue placeholder="Select case book" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseBooks.map((cb) => (
                      <SelectItem key={cb.id} value={cb.id}>
                        {cb.case_number} - {cb.prisoner_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Medication Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="quantifiable">Quantifiable Medication</Label>
                  <p className="text-sm text-gray-600">Mark if medication has specific quantity</p>
                </div>
                <Switch
                  id="quantifiable"
                  checked={formData.quantifiable}
                  onCheckedChange={(checked) => handleInputChange('quantifiable', checked)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medication">
                  Medication <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="medication"
                  value={formData.medication}
                  onChange={(e) => handleInputChange('medication', e.target.value)}
                  placeholder="Enter medication name"
                  disabled={isReadOnly}
                />
              </div>

              {formData.quantifiable && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">
                        Quantity <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        placeholder="Enter quantity"
                        disabled={isReadOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                        placeholder="e.g., tablets, ml, mg"
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  placeholder="e.g., 2 tablets twice daily"
                  disabled={isReadOnly}
                />
              </div>
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
                placeholder="Enter any additional treatment notes..."
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Treatment' : 'Update Treatment'}
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

export default TreatmentForm;
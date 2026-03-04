import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PrisonerChild {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  sex_name?: string;
  age: number;
  prisoner: string;
  sex: string;
}

interface PrisonerChildrenFormProps {
  child?: PrisonerChild | null;
  onSubmit: (child: PrisonerChild) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const PrisonerChildrenForm: React.FC<PrisonerChildrenFormProps> = ({
  child,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<PrisonerChild>({
    age: 0,
    prisoner: '',
    sex: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [sexes, setSexes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (child) {
      setFormData(child);
    }
  }, [child]);

  const loadDropdownData = () => {
    // Mock data - replace with actual API calls
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
    ]);

    setSexes([
      { id: '1', name: 'Male' },
      { id: '2', name: 'Female' },
    ]);
  };

  const handleInputChange = (field: keyof PrisonerChild, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.sex) {
      toast.error('Please select sex');
      return;
    }
    if (formData.age <= 0) {
      toast.error('Please enter a valid age');
      return;
    }
    if (formData.age > 25) {
      toast.warning('Age is unusually high for a dependent child');
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedSex = sexes.find((s) => s.id === formData.sex);

      const submitData: PrisonerChild = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        sex_name: selectedSex?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Child record created successfully');
        // Reset form
        setFormData({
          age: 0,
          prisoner: '',
          sex: '',
        });
      } else {
        toast.success('Child record updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5" />
          {mode === 'create' && 'New Child Record'}
          {mode === 'edit' && 'Edit Child Record'}
          {mode === 'view' && 'View Child Record'}
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
            </div>
          </div>

          {/* Child Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Child Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sex">
                  Sex <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.sex}
                  onValueChange={(value) => handleInputChange('sex', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    {sexes.map((sex) => (
                      <SelectItem key={sex.id} value={sex.id}>
                        {sex.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">
                  Age (years) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                  placeholder="Enter age"
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Record' : 'Update Record'}
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

export default PrisonerChildrenForm;

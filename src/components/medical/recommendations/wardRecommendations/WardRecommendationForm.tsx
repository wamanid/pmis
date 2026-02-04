import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Bed, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
}

interface Ward {
  id: string;
  name: string;
  capacity?: number;
  location?: string;
}

interface WardRecommendation {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  ward_name?: string;
  recommendation_notes: string;
  prisoner: string;
  recommended_ward: string;
}

interface WardRecommendationFormProps {
  recommendation?: WardRecommendation | null;
  onSubmit: (recommendation: WardRecommendation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const WardRecommendationForm: React.FC<WardRecommendationFormProps> = ({ recommendation, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<WardRecommendation>({
    recommendation_notes: '',
    prisoner: '',
    recommended_ward: '',
  });

  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (recommendation && dataLoaded) {
      setFormData(recommendation);
    }
  }, [recommendation, dataLoaded]);

  const loadDropdownData = () => {
    // Mock Prisoners
    setPrisoners([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    // Mock Wards
    setWards([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb1', name: 'General Ward A', capacity: 20, location: 'Block A' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb2', name: 'Intensive Care Unit (ICU)', capacity: 5, location: 'Block B' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb3', name: 'Isolation Ward', capacity: 10, location: 'Block C' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb4', name: 'Psychiatric Ward', capacity: 15, location: 'Block D' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb5', name: 'Recovery Ward', capacity: 12, location: 'Block A' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb6', name: 'Tuberculosis Ward', capacity: 8, location: 'Block E' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb7', name: 'HIV/AIDS Ward', capacity: 10, location: 'Block F' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb8', name: 'General Ward B', capacity: 25, location: 'Block G' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof WardRecommendation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.recommended_ward) {
      toast.error('Please select a recommended ward');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedWard = wards.find((w) => w.id === formData.recommended_ward);

      const submitData: WardRecommendation = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        ward_name: selectedWard?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Ward recommendation created successfully');
        setFormData({
          recommendation_notes: '',
          prisoner: '',
          recommended_ward: '',
        });
      } else {
        toast.success('Ward recommendation updated successfully');
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
      case 'recommended_ward':
        const ward = wards.find(w => w.id === id);
        return ward ? `${ward.name} (${ward.location}) - Capacity: ${ward.capacity}` : id;
      default:
        return id;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bed className="h-5 w-5" />
          {mode === 'create' && 'New Ward Recommendation'}
          {mode === 'edit' && 'Edit Ward Recommendation'}
          {mode === 'view' && 'View Ward Recommendation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Recommendation Details
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
                <Label htmlFor="recommended_ward">
                  Recommended Ward <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('recommended_ward', formData.recommended_ward)}
                  </div>
                ) : (
                  <Select
                    value={formData.recommended_ward}
                    onValueChange={(value) => handleInputChange('recommended_ward', value)}
                  >
                    <SelectTrigger id="recommended_ward">
                      <SelectValue placeholder="Select ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.id}>
                          {ward.name} ({ward.location}) - Capacity: {ward.capacity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendation_notes">Recommendation Notes</Label>
              <Textarea
                id="recommendation_notes"
                value={formData.recommendation_notes}
                onChange={(e) => handleInputChange('recommendation_notes', e.target.value)}
                placeholder="Enter reasons for recommending this ward, medical condition, required care level, treatment plan, special requirements, etc..."
                rows={6}
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

export default WardRecommendationForm;

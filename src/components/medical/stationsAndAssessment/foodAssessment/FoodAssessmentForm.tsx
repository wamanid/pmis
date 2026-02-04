import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UtensilsCrossed, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Station {
  id: string;
  name: string;
  region?: string;
  district?: string;
}

interface FoodItem {
  id: string;
  name: string;
  category: string;
  description?: string;
}

interface FoodQuality {
  id: string;
  name: string;
  description: string;
}

interface FoodAssessment {
  id?: string;
  notes: string;
  station: string;
  station_name?: string;
  item: string;
  item_name?: string;
  quality: string;
  quality_name?: string;
}

interface FoodAssessmentFormProps {
  assessment?: FoodAssessment | null;
  onSubmit: (assessment: FoodAssessment) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const FoodAssessmentForm: React.FC<FoodAssessmentFormProps> = ({ assessment, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<FoodAssessment>({
    notes: '',
    station: '',
    item: '',
    quality: '',
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodQualities, setFoodQualities] = useState<FoodQuality[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (assessment && dataLoaded) {
      setFormData(assessment);
    }
  }, [assessment, dataLoaded]);

  const loadDropdownData = () => {
    // Mock Stations
    setStations([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Luzira Maximum Security Prison', region: 'Central', district: 'Kampala' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', name: 'Kigo Prison', region: 'Central', district: 'Wakiso' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', name: 'Murchison Bay Prison', region: 'Central', district: 'Kampala' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', name: 'Gulu Main Prison', region: 'Northern', district: 'Gulu' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', name: 'Mbarara Main Prison', region: 'Western', district: 'Mbarara' },
    ]);

    // Mock Food Items
    setFoodItems([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb1', name: 'Posho (Maize Meal)', category: 'Staple', description: 'Traditional maize flour porridge' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb2', name: 'Beans', category: 'Protein', description: 'Cooked beans with salt' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb3', name: 'Matoke (Plantain)', category: 'Staple', description: 'Steamed green bananas' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb4', name: 'Rice', category: 'Staple', description: 'Plain steamed rice' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb5', name: 'Groundnut Sauce', category: 'Sauce', description: 'Peanut-based sauce' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb6', name: 'Vegetables (Greens)', category: 'Vegetable', description: 'Mixed leafy greens' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb7', name: 'Fish', category: 'Protein', description: 'Dried or fresh fish' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb8', name: 'Meat Stew', category: 'Protein', description: 'Beef or chicken stew' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb9', name: 'Sweet Potatoes', category: 'Staple', description: 'Boiled sweet potatoes' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afba', name: 'Bread', category: 'Staple', description: 'Plain bread loaf' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afbb', name: 'Tea', category: 'Beverage', description: 'Hot tea with milk and sugar' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afbc', name: 'Porridge', category: 'Breakfast', description: 'Millet or maize porridge' },
    ]);

    // Mock Food Quality Ratings
    setFoodQualities([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc1', name: 'Excellent', description: 'Superior quality, fresh, well-prepared, and nutritious' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc2', name: 'Good', description: 'Acceptable quality, properly cooked, meets standards' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc3', name: 'Fair', description: 'Adequate quality, some minor issues noted' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc4', name: 'Poor', description: 'Below standard, quality concerns, needs improvement' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc5', name: 'Unacceptable', description: 'Unsafe or unsuitable for consumption' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof FoodAssessment, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.station) {
      toast.error('Please select a station');
      return;
    }
    if (!formData.item) {
      toast.error('Please select a food item');
      return;
    }
    if (!formData.quality) {
      toast.error('Please select food quality rating');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedStation = stations.find((s) => s.id === formData.station);
      const selectedItem = foodItems.find((i) => i.id === formData.item);
      const selectedQuality = foodQualities.find((q) => q.id === formData.quality);

      const submitData: FoodAssessment = {
        ...formData,
        station_name: selectedStation?.name || '',
        item_name: selectedItem?.name || '',
        quality_name: selectedQuality?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Food assessment created successfully');
        setFormData({
          notes: '',
          station: '',
          item: '',
          quality: '',
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
      case 'station':
        const station = stations.find(s => s.id === id);
        return station ? `${station.name} (${station.region}, ${station.district})` : id;
      case 'item':
        const item = foodItems.find(i => i.id === id);
        return item ? `${item.name} - ${item.category}` : id;
      case 'quality':
        const quality = foodQualities.find(q => q.id === id);
        return quality ? `${quality.name} - ${quality.description}` : id;
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
              Assessment Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="station">
                  Station <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('station', formData.station)}
                  </div>
                ) : (
                  <Select
                    value={formData.station}
                    onValueChange={(value) => handleInputChange('station', value)}
                  >
                    <SelectTrigger id="station">
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name} ({station.region}, {station.district})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">
                  Food Item <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('item', formData.item)}
                  </div>
                ) : (
                  <Select
                    value={formData.item}
                    onValueChange={(value) => handleInputChange('item', value)}
                  >
                    <SelectTrigger id="item">
                      <SelectValue placeholder="Select food item" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">
                  Food Quality <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('quality', formData.quality)}
                  </div>
                ) : (
                  <Select
                    value={formData.quality}
                    onValueChange={(value) => handleInputChange('quality', value)}
                  >
                    <SelectTrigger id="quality">
                      <SelectValue placeholder="Select quality rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodQualities.map((quality) => (
                        <SelectItem key={quality.id} value={quality.id}>
                          {quality.name} - {quality.description}
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
              Assessment Notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter assessment notes, observations, feedback, or recommendations..."
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

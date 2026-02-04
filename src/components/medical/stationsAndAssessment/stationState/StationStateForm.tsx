import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Building2, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Rating {
  id: string;
  name: string;
  description: string;
}

interface Station {
  id: string;
  name: string;
  region?: string;
  district?: string;
}

interface StationState {
  id?: string;
  station_name?: string;
  level_of_conjestion: string;
  station: string;
  state_of_buildings: string;
  ventilation: string;
  lighting: string;
  fencing: string;
  general_environment: string;
  ward_environment: string;
}

interface StationStateFormProps {
  stationState?: StationState | null;
  onSubmit: (stationState: StationState) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const StationStateForm: React.FC<StationStateFormProps> = ({ stationState, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<StationState>({
    level_of_conjestion: '',
    station: '',
    state_of_buildings: '',
    ventilation: '',
    lighting: '',
    fencing: '',
    general_environment: '',
    ward_environment: '',
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (stationState && dataLoaded) {
      setFormData(stationState);
    }
  }, [stationState, dataLoaded]);

  const loadDropdownData = () => {
    // Mock Stations
    setStations([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Luzira Maximum Security Prison', region: 'Central', district: 'Kampala' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', name: 'Kigo Prison', region: 'Central', district: 'Wakiso' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', name: 'Murchison Bay Prison', region: 'Central', district: 'Kampala' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', name: 'Gulu Main Prison', region: 'Northern', district: 'Gulu' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', name: 'Mbarara Main Prison', region: 'Western', district: 'Mbarara' },
    ]);

    // Mock Ratings
    setRatings([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb1', name: 'Excellent', description: 'Outstanding condition, meets all standards' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb2', name: 'Good', description: 'Satisfactory condition, minor improvements needed' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb3', name: 'Fair', description: 'Acceptable condition, several improvements required' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb4', name: 'Poor', description: 'Below standard, significant improvements needed' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb5', name: 'Critical', description: 'Urgent attention required, major deficiencies' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof StationState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.station) {
      toast.error('Please select a station');
      return;
    }
    if (!formData.level_of_conjestion) {
      toast.error('Please enter level of congestion');
      return;
    }
    if (!formData.state_of_buildings) {
      toast.error('Please select state of buildings rating');
      return;
    }
    if (!formData.ventilation) {
      toast.error('Please select ventilation rating');
      return;
    }
    if (!formData.lighting) {
      toast.error('Please select lighting rating');
      return;
    }
    if (!formData.fencing) {
      toast.error('Please select fencing rating');
      return;
    }
    if (!formData.general_environment) {
      toast.error('Please select general environment rating');
      return;
    }
    if (!formData.ward_environment) {
      toast.error('Please select ward environment rating');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedStation = stations.find((s) => s.id === formData.station);

      const submitData: StationState = {
        ...formData,
        station_name: selectedStation?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Station state record created successfully');
        setFormData({
          level_of_conjestion: '',
          station: '',
          state_of_buildings: '',
          ventilation: '',
          lighting: '',
          fencing: '',
          general_environment: '',
          ward_environment: '',
        });
      } else {
        toast.success('Station state record updated successfully');
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
      case 'rating':
        const rating = ratings.find(r => r.id === id);
        return rating ? `${rating.name} - ${rating.description}` : id;
      default:
        return id;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Building2 className="h-5 w-5" />
          {mode === 'create' && 'New Station State Record'}
          {mode === 'edit' && 'Edit Station State Record'}
          {mode === 'view' && 'View Station State Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Station Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="level_of_conjestion">
                  Level of Congestion (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="level_of_conjestion"
                  type="number"
                  min="0"
                  max="999"
                  value={formData.level_of_conjestion}
                  onChange={(e) => handleInputChange('level_of_conjestion', e.target.value)}
                  placeholder="Enter congestion level (e.g., 188)"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Building & Infrastructure Ratings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state_of_buildings">
                  State of Buildings <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('rating', formData.state_of_buildings)}
                  </div>
                ) : (
                  <Select
                    value={formData.state_of_buildings}
                    onValueChange={(value) => handleInputChange('state_of_buildings', value)}
                  >
                    <SelectTrigger id="state_of_buildings">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((rating) => (
                        <SelectItem key={rating.id} value={rating.id}>
                          {rating.name} - {rating.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ventilation">
                  Ventilation <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('rating', formData.ventilation)}
                  </div>
                ) : (
                  <Select
                    value={formData.ventilation}
                    onValueChange={(value) => handleInputChange('ventilation', value)}
                  >
                    <SelectTrigger id="ventilation">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((rating) => (
                        <SelectItem key={rating.id} value={rating.id}>
                          {rating.name} - {rating.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lighting">
                  Lighting <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('rating', formData.lighting)}
                  </div>
                ) : (
                  <Select
                    value={formData.lighting}
                    onValueChange={(value) => handleInputChange('lighting', value)}
                  >
                    <SelectTrigger id="lighting">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((rating) => (
                        <SelectItem key={rating.id} value={rating.id}>
                          {rating.name} - {rating.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fencing">
                  Fencing <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('rating', formData.fencing)}
                  </div>
                ) : (
                  <Select
                    value={formData.fencing}
                    onValueChange={(value) => handleInputChange('fencing', value)}
                  >
                    <SelectTrigger id="fencing">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((rating) => (
                        <SelectItem key={rating.id} value={rating.id}>
                          {rating.name} - {rating.description}
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
              Environment Ratings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="general_environment">
                  General Environment <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('rating', formData.general_environment)}
                  </div>
                ) : (
                  <Select
                    value={formData.general_environment}
                    onValueChange={(value) => handleInputChange('general_environment', value)}
                  >
                    <SelectTrigger id="general_environment">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((rating) => (
                        <SelectItem key={rating.id} value={rating.id}>
                          {rating.name} - {rating.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward_environment">
                  Ward Environment <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('rating', formData.ward_environment)}
                  </div>
                ) : (
                  <Select
                    value={formData.ward_environment}
                    onValueChange={(value) => handleInputChange('ward_environment', value)}
                  >
                    <SelectTrigger id="ward_environment">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((rating) => (
                        <SelectItem key={rating.id} value={rating.id}>
                          {rating.name} - {rating.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

export default StationStateForm;

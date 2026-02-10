import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { UtensilsCrossed, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import SearchableSelect from '../../../common/SearchableSelect';
import {
  FoodAssessment,
  fetchStations,
  fetchFoodItems,
  fetchFoodQualities,
} from '../../../../services/medical/stationsAndAssessment/foodAssessmentService';

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

  const [loading, setLoading] = useState(false);

  // Local state for dropdown values
  const [localStation, setLocalStation] = useState<string | null>(() => {
    if (assessment && (mode === 'edit' || mode === 'view') && assessment.station) {
      return assessment.station;
    }
    return null;
  });

  const [localItem, setLocalItem] = useState<string | null>(() => {
    if (assessment && (mode === 'edit' || mode === 'view') && assessment.item) {
      return assessment.item;
    }
    return null;
  });

  const [localQuality, setLocalQuality] = useState<string | null>(() => {
    if (assessment && (mode === 'edit' || mode === 'view') && assessment.quality) {
      return assessment.quality;
    }
    return null;
  });

  // Sync local state with assessment prop
  useEffect(() => {
    if (assessment && (mode === 'edit' || mode === 'view')) {
      setFormData(assessment);
      setLocalStation(assessment.station || null);
      setLocalItem(assessment.item || null);
      setLocalQuality(assessment.quality || null);
    }
  }, [assessment, mode]);

  // Reset form when switching to create mode
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        notes: '',
        station: '',
        item: '',
        quality: '',
      });
      setLocalStation(null);
      setLocalItem(null);
      setLocalQuality(null);
    }
  }, [mode]);

  // Fetch callbacks wrapped in useCallback to prevent unnecessary re-fetches
  const fetchStationsCallback = useCallback(
    async (
      opts: { [key: string]: any; search?: string; page?: number; page_size?: number },
      signal?: AbortSignal
    ) => {
      return await fetchStations(opts.page || 1, opts.page_size || 50, opts.search || '', signal);
    },
    []
  );

  const fetchFoodItemsCallback = useCallback(
    async (
      opts: { [key: string]: any; search?: string; page?: number; page_size?: number },
      signal?: AbortSignal
    ) => {
      return await fetchFoodItems(opts.page || 1, opts.page_size || 50, opts.search || '', signal);
    },
    []
  );

  const fetchFoodQualitiesCallback = useCallback(
    async (
      opts: { [key: string]: any; search?: string; page?: number; page_size?: number },
      signal?: AbortSignal
    ) => {
      return await fetchFoodQualities(opts.page || 1, opts.page_size || 50, opts.search || '', signal);
    },
    []
  );

  // Derive initialItem for edit mode
  const initialStation =
    assessment && (mode === 'edit' || mode === 'view') && assessment.station && assessment.station_name
      ? { id: assessment.station, name: assessment.station_name }
      : null;

  const initialItem =
    assessment && (mode === 'edit' || mode === 'view') && assessment.item && assessment.item_name
      ? { id: assessment.item, name: assessment.item_name }
      : null;

  const initialQuality =
    assessment && (mode === 'edit' || mode === 'view') && assessment.quality && assessment.quality_name
      ? { id: assessment.quality, name: assessment.quality_name }
      : null;

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

    try {
      onSubmit(formData);
    } catch (error) {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

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
                {mode === 'view' || mode === 'edit' ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {assessment?.station_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchStationsCallback}
                    value={localStation}
                    onChange={(val) => {
                      setLocalStation(val);
                      handleInputChange('station', val);
                    }}
                    placeholder="Select station"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialStation ?? undefined}
                    disabled={loading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">
                  Food Item <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {assessment?.item_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchFoodItemsCallback}
                    value={localItem}
                    onChange={(val) => {
                      setLocalItem(val);
                      handleInputChange('item', val);
                    }}
                    placeholder="Select food item"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialItem ?? undefined}
                    disabled={loading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">
                  Food Quality <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {assessment?.quality_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchFoodQualitiesCallback}
                    value={localQuality}
                    onChange={(val) => {
                      setLocalQuality(val);
                      handleInputChange('quality', val);
                    }}
                    placeholder="Select quality rating"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialQuality ?? undefined}
                    disabled={loading}
                  />
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

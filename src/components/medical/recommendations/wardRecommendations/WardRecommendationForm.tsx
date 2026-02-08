import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Bed, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import CustomPrisonerSearch from '../../../common/CustomPrisonerSearch';
import SearchableSelect from '../../../common/SearchableSelect';
import {
  WardRecommendation,
  Ward,
  fetchWards,
} from '../../../../services/medical/recommendations/wardRecommendationService';

interface WardRecommendationFormProps {
  initialData?: WardRecommendation | null;
  onSubmit: (recommendation: WardRecommendation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const WardRecommendationForm: React.FC<WardRecommendationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<WardRecommendation>>({
    prisoner: '',
    recommended_ward: '',
    recommendation_notes: '',
  });

  const [selectedPrisoner, setSelectedPrisoner] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  
  // Initialize ward value immediately - CRITICAL for edit mode
  const isWardInitialized = React.useRef(false);
  const [localWardValue, setLocalWardValue] = useState<string | null>(() => {
    if (initialData && mode !== 'create' && initialData.recommended_ward) {
      isWardInitialized.current = true;
      return initialData.recommended_ward;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false);

  // Derive initialItem for ward dropdown - CRITICAL for edit mode
  const initialWardItem = React.useMemo(() => {
    if (initialData && mode !== 'create' && initialData.recommended_ward && initialData.ward_name) {
      return {
        id: initialData.recommended_ward,
        name: initialData.ward_name,
        ward_number: '',
        ward_area: '',
        description: '',
        station_name: '',
        ward_type_name: '',
        block_name: '',
        security_classification_name: '',
        ward_capacity: '',
        occupancy: '',
        congestion: '',
        is_active: true,
      };
    }
    return null;
  }, [initialData, mode]);

  // Initialize form data on edit/view mode
  useEffect(() => {
    if (initialData && mode !== 'create') {
      setFormData({
        prisoner: initialData.prisoner,
        recommended_ward: initialData.recommended_ward,
        recommendation_notes: initialData.recommendation_notes || '',
      });

      // Set local ward value only if not already initialized OR if value changed
      const newWardId = initialData.recommended_ward || null;
      if (newWardId && (!isWardInitialized.current || localWardValue !== newWardId)) {
        setLocalWardValue(newWardId);
        isWardInitialized.current = true;
      }

      // For edit/view mode, set initial values for display
      if (initialData.prisoner) {
        setSelectedPrisoner({
          id: initialData.prisoner,
          full_name: initialData.prisoner_name,
          prisoner_number: initialData.prisoner_number,
        });
      }

      if (initialData.recommended_ward && initialWardItem) {
        setSelectedWard(initialWardItem);
      }
    } else if (mode === 'create') {
      // Reset on create mode
      setLocalWardValue(null);
      isWardInitialized.current = false;
    }
  }, [initialData, mode, initialWardItem, localWardValue]);

  // Fetch wards callback for SearchableSelect
  const fetchWardsPaginated = useCallback(
    async (opts: { search?: string; page?: number; page_size?: number }, signal?: AbortSignal) => {
      try {
        const page = opts.page || 1;
        const pageSize = opts.page_size || 25;
        const search = opts.search || '';
        const response = await fetchWards(page, pageSize, search, signal);
        return response;
      } catch (error) {
        console.error('Failed to fetch wards:', error);
        return { items: [], count: 0, next: null };
      }
    },
    []
  );

  const handlePrisonerSelect = (val: string | null) => {
    setFormData((prev) => ({ ...prev, prisoner: val || '' }));
  };

  const handlePrisonerItemSelect = (prisoner: any) => {
    setSelectedPrisoner(prisoner);
  };

  const handleWardSelect = (val: string | null) => {
    setLocalWardValue(val);
    setFormData((prev) => ({ ...prev, recommended_ward: val || '' }));
  };

  const handleWardItemSelect = (ward: Ward | null) => {
    setSelectedWard(ward);
  };

  const handleInputChange = (field: keyof WardRecommendation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const submitData: WardRecommendation = {
        id: initialData?.id,
        prisoner: formData.prisoner!,
        prisoner_name: selectedPrisoner?.full_name || initialData?.prisoner_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || initialData?.prisoner_number || '',
        recommended_ward: formData.recommended_ward!,
        ward_name: selectedWard?.name || initialData?.ward_name || '',
        recommendation_notes: formData.recommendation_notes || '',
        created_datetime: initialData?.created_datetime,
        updated_datetime: initialData?.updated_datetime,
        deleted_datetime: initialData?.deleted_datetime,
        created_by: initialData?.created_by,
        updated_by: initialData?.updated_by,
        deleted_by: initialData?.deleted_by,
        is_active: initialData?.is_active,
      };

      await onSubmit(submitData);

      if (mode === 'create') {
        setFormData({
          prisoner: '',
          recommended_ward: '',
          recommendation_notes: '',
        });
        setSelectedPrisoner(null);
        setSelectedWard(null);
      }
    } catch (error) {
      // Error already handled in parent component
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

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
              {/* Prisoner Selection */}
              <div className="space-y-2">
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                {isReadOnly || mode === 'edit' ? (
                  <div className="p-2 bg-gray-50 rounded border text-sm">
                    {selectedPrisoner ? (
                      <>
                        {selectedPrisoner.prisoner_number} - {selectedPrisoner.full_name}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </div>
                ) : (
                  <CustomPrisonerSearch
                    value={formData.prisoner || null}
                    onChange={handlePrisonerSelect}
                    onSelectItem={handlePrisonerItemSelect}
                    disabled={loading}
                    idField="id"
                    labelField="full_name"
                  />
                )}
              </div>

              {/* Ward Selection */}
              <div className="space-y-2">
                <Label htmlFor="recommended_ward">
                  Recommended Ward <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-sm">
                    {selectedWard?.name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect<Ward>
                    key={`ward-${initialData?.id}-${mode}`}
                    value={localWardValue}
                    onChange={handleWardSelect}
                    fetchPaginated={fetchWardsPaginated}
                    labelField="name"
                    idField="id"
                    onSelectItem={handleWardItemSelect}
                    initialItem={initialWardItem ?? undefined}
                    placeholder="Select ward"
                    disabled={loading}
                  />
                )}
              </div>
            </div>

            {/* Recommendation Notes */}
            <div className="space-y-2">
              <Label htmlFor="recommendation_notes">Recommendation Notes</Label>
              <Textarea
                id="recommendation_notes"
                value={formData.recommendation_notes || ''}
                onChange={(e) => handleInputChange('recommendation_notes', e.target.value)}
                placeholder="Enter reasons for recommending this ward, medical condition, required care level, treatment plan, special requirements, etc..."
                rows={6}
                disabled={isReadOnly || loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
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

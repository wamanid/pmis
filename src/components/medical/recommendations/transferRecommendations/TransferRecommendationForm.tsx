import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { ArrowLeftRight, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import CustomPrisonerSearch from '../../../common/CustomPrisonerSearch';
import SearchableSelect from '../../../common/SearchableSelect';
import {
  TransferRecommendation,
  TransferRecommendationReason,
  Station,
  Hospital,
  ReferralCategory,
  fetchTransferReasons,
  fetchStations,
  fetchHospitals,
  fetchReferralCategories,
} from '../../../../services/medical/recommendations/transferRecommendationService';

interface Prisoner {
  id: string;
  prisoner_number_value: string;
  full_name: string;
}

interface TransferRecommendationFormProps {
  initialData?: TransferRecommendation | null;
  onSubmit: (recommendation: TransferRecommendation) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const TransferRecommendationForm: React.FC<TransferRecommendationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<TransferRecommendation>>({
    prisoner: '',
    reason_for_recommendation: '',
    recommended_station: '',
    refferal_hospital: '',
    referral_category: '',
    recommendation_notes: '',
  });

  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [selectedReason, setSelectedReason] = useState<TransferRecommendationReason | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ReferralCategory | null>(null);

  // Initialize local state with function - CRITICAL for edit mode
  const [localReasonValue, setLocalReasonValue] = useState<string | null>(() => {
    if (initialData && mode !== 'create' && initialData.reason_for_recommendation) {
      return initialData.reason_for_recommendation;
    }
    return null;
  });

  const [localStationValue, setLocalStationValue] = useState<string | null>(() => {
    if (initialData && mode !== 'create' && initialData.recommended_station) {
      return initialData.recommended_station;
    }
    return null;
  });

  const [localHospitalValue, setLocalHospitalValue] = useState<string | null>(() => {
    if (initialData && mode !== 'create' && initialData.refferal_hospital) {
      return initialData.refferal_hospital;
    }
    return null;
  });

  const [localCategoryValue, setLocalCategoryValue] = useState<string | null>(() => {
    if (initialData && mode !== 'create' && initialData.referral_category) {
      return initialData.referral_category;
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  // Derive initialItem for dropdowns - CRITICAL for edit mode
  const initialReasonItem = React.useMemo(() => {
    if (initialData && mode !== 'create' && initialData.reason_for_recommendation && initialData.reason_name) {
      return {
        id: initialData.reason_for_recommendation,
        name: initialData.reason_name,
        description: '',
        is_active: true,
      };
    }
    return null;
  }, [initialData, mode]);

  const initialStationItem = React.useMemo(() => {
    if (initialData && mode !== 'create' && initialData.recommended_station && initialData.station_name) {
      return {
        id: initialData.recommended_station,
        name: initialData.station_name,
        is_active: true,
      };
    }
    return null;
  }, [initialData, mode]);

  const initialHospitalItem = React.useMemo(() => {
    if (initialData && mode !== 'create' && initialData.refferal_hospital && initialData.hospital_name) {
      return {
        id: initialData.refferal_hospital,
        name: initialData.hospital_name,
        is_active: true,
      };
    }
    return null;
  }, [initialData, mode]);

  const initialCategoryItem = React.useMemo(() => {
    if (initialData && mode !== 'create' && initialData.referral_category && initialData.category_name) {
      return {
        id: initialData.referral_category,
        name: initialData.category_name,
        description: '',
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
        reason_for_recommendation: initialData.reason_for_recommendation,
        recommended_station: initialData.recommended_station,
        refferal_hospital: initialData.refferal_hospital,
        referral_category: initialData.referral_category,
        recommendation_notes: initialData.recommendation_notes || '',
      });

      // Set local values
      setLocalReasonValue(initialData.reason_for_recommendation || null);
      setLocalStationValue(initialData.recommended_station || null);
      setLocalHospitalValue(initialData.refferal_hospital || null);
      setLocalCategoryValue(initialData.referral_category || null);

      // For edit/view mode, set initial values for display
      if (initialData.prisoner) {
        setSelectedPrisoner({
          id: initialData.prisoner,
          full_name: initialData.prisoner_name || '',
          prisoner_number_value: initialData.prisoner_number || '',
        });
      }

      if (initialData.reason_for_recommendation && initialReasonItem) {
        setSelectedReason(initialReasonItem);
      }

      if (initialData.recommended_station && initialStationItem) {
        setSelectedStation(initialStationItem);
      }

      if (initialData.refferal_hospital && initialHospitalItem) {
        setSelectedHospital(initialHospitalItem);
      }

      if (initialData.referral_category && initialCategoryItem) {
        setSelectedCategory(initialCategoryItem);
      }
    } else if (mode === 'create') {
      // Reset on create mode
      setLocalReasonValue(null);
      setLocalStationValue(null);
      setLocalHospitalValue(null);
      setLocalCategoryValue(null);
    }
  }, [initialData, mode, initialReasonItem, initialStationItem, initialHospitalItem, initialCategoryItem]);

  // Fetch callbacks wrapped in useCallback - CRITICAL to prevent unnecessary API calls
  const fetchReasonsCallback = useCallback(
    async (opts: { search?: string; page?: number; page_size?: number }, signal?: AbortSignal) => {
      try {
        const page = opts.page || 1;
        const pageSize = opts.page_size || 50;
        const search = opts.search || '';
        const response = await fetchTransferReasons(page, pageSize, search, signal);
        return response;
      } catch (error) {
        console.error('Failed to fetch transfer reasons:', error);
        return { items: [], count: 0, next: null };
      }
    },
    []
  );

  const fetchStationsCallback = useCallback(
    async (opts: { search?: string; page?: number; page_size?: number }, signal?: AbortSignal) => {
      try {
        const page = opts.page || 1;
        const pageSize = opts.page_size || 50;
        const search = opts.search || '';
        const response = await fetchStations(page, pageSize, search, signal);
        return response;
      } catch (error) {
        console.error('Failed to fetch stations:', error);
        return { items: [], count: 0, next: null };
      }
    },
    []
  );

  const fetchHospitalsCallback = useCallback(
    async (opts: { search?: string; page?: number; page_size?: number }, signal?: AbortSignal) => {
      try {
        const page = opts.page || 1;
        const pageSize = opts.page_size || 50;
        const search = opts.search || '';
        const response = await fetchHospitals(page, pageSize, search, signal);
        return response;
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        return { items: [], count: 0, next: null };
      }
    },
    []
  );

  const fetchCategoriesCallback = useCallback(
    async (opts: { search?: string; page?: number; page_size?: number }, signal?: AbortSignal) => {
      try {
        const page = opts.page || 1;
        const pageSize = opts.page_size || 50;
        const search = opts.search || '';
        const response = await fetchReferralCategories(page, pageSize, search, signal);
        return response;
      } catch (error) {
        console.error('Failed to fetch referral categories:', error);
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

  const handleReasonSelect = (val: string | null) => {
    setLocalReasonValue(val);
    setFormData((prev) => ({ ...prev, reason_for_recommendation: val || '' }));
  };

  const handleReasonItemSelect = (reason: TransferRecommendationReason | null) => {
    setSelectedReason(reason);
  };

  const handleStationSelect = (val: string | null) => {
    setLocalStationValue(val);
    setFormData((prev) => ({ ...prev, recommended_station: val || '' }));
  };

  const handleStationItemSelect = (station: Station | null) => {
    setSelectedStation(station);
  };

  const handleHospitalSelect = (val: string | null) => {
    setLocalHospitalValue(val);
    setFormData((prev) => ({ ...prev, refferal_hospital: val || '' }));
  };

  const handleHospitalItemSelect = (hospital: Hospital | null) => {
    setSelectedHospital(hospital);
  };

  const handleCategorySelect = (val: string | null) => {
    setLocalCategoryValue(val);
    setFormData((prev) => ({ ...prev, referral_category: val || '' }));
  };

  const handleCategoryItemSelect = (category: ReferralCategory | null) => {
    setSelectedCategory(category);
  };

  const handleInputChange = (field: keyof TransferRecommendation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.reason_for_recommendation) {
      toast.error('Please select a reason for recommendation');
      return;
    }
    if (!formData.recommended_station) {
      toast.error('Please select a recommended station');
      return;
    }
    if (!formData.refferal_hospital) {
      toast.error('Please select a referral hospital');
      return;
    }
    if (!formData.referral_category) {
      toast.error('Please select a referral category');
      return;
    }

    setLoading(true);

    try {
      const submitData: TransferRecommendation = {
        id: initialData?.id,
        prisoner: formData.prisoner!,
        prisoner_name: selectedPrisoner?.full_name || initialData?.prisoner_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number_value || initialData?.prisoner_number || '',
        reason_for_recommendation: formData.reason_for_recommendation!,
        reason_name: selectedReason?.name || initialData?.reason_name || '',
        recommended_station: formData.recommended_station!,
        station_name: selectedStation?.name || initialData?.station_name || '',
        refferal_hospital: formData.refferal_hospital!,
        hospital_name: selectedHospital?.name || initialData?.hospital_name || '',
        referral_category: formData.referral_category!,
        category_name: selectedCategory?.name || initialData?.category_name || '',
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
          reason_for_recommendation: '',
          recommended_station: '',
          refferal_hospital: '',
          referral_category: '',
          recommendation_notes: '',
        });
        setSelectedPrisoner(null);
        setSelectedReason(null);
        setSelectedStation(null);
        setSelectedHospital(null);
        setSelectedCategory(null);
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
          <ArrowLeftRight className="h-5 w-5" />
          {mode === 'create' && 'New Transfer Recommendation'}
          {mode === 'edit' && 'Edit Transfer Recommendation'}
          {mode === 'view' && 'View Transfer Recommendation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="prisoner">
                Prisoner <span className="text-red-500">*</span>
              </Label>
              {isReadOnly || mode === 'edit' ? (
                <div className="p-2 bg-gray-50 rounded border text-sm">
                  {selectedPrisoner ? (
                    <>
                      {selectedPrisoner.prisoner_number_value} - {selectedPrisoner.full_name}
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Transfer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason_for_recommendation">
                  Reason for Recommendation <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-sm">
                    {selectedReason?.name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect<TransferRecommendationReason>
                    key={`reason-${initialData?.id}-${mode}`}
                    value={localReasonValue}
                    onChange={handleReasonSelect}
                    fetchPaginated={fetchReasonsCallback}
                    labelField="name"
                    idField="id"
                    onSelectItem={handleReasonItemSelect}
                    initialItem={initialReasonItem ?? undefined}
                    placeholder="Select reason"
                    disabled={loading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral_category">
                  Referral Category <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-sm">
                    {selectedCategory?.name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect<ReferralCategory>
                    key={`category-${initialData?.id}-${mode}`}
                    value={localCategoryValue}
                    onChange={handleCategorySelect}
                    fetchPaginated={fetchCategoriesCallback}
                    labelField="name"
                    idField="id"
                    onSelectItem={handleCategoryItemSelect}
                    initialItem={initialCategoryItem ?? undefined}
                    placeholder="Select category"
                    disabled={loading}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommended_station">
                  Recommended Station <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-sm">
                    {selectedStation?.name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect<Station>
                    key={`station-${initialData?.id}-${mode}`}
                    value={localStationValue}
                    onChange={handleStationSelect}
                    fetchPaginated={fetchStationsCallback}
                    labelField="name"
                    idField="id"
                    onSelectItem={handleStationItemSelect}
                    initialItem={initialStationItem ?? undefined}
                    placeholder="Select station"
                    disabled={loading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="refferal_hospital">
                  Referral Hospital <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border text-sm">
                    {selectedHospital?.name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect<Hospital>
                    key={`hospital-${initialData?.id}-${mode}`}
                    value={localHospitalValue}
                    onChange={handleHospitalSelect}
                    fetchPaginated={fetchHospitalsCallback}
                    labelField="name"
                    idField="id"
                    onSelectItem={handleHospitalItemSelect}
                    initialItem={initialHospitalItem ?? undefined}
                    placeholder="Select hospital"
                    disabled={loading}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="recommendation_notes">Recommendation Notes</Label>
              <Textarea
                id="recommendation_notes"
                value={formData.recommendation_notes}
                onChange={(e) => handleInputChange('recommendation_notes', e.target.value)}
                placeholder="Enter detailed notes about the transfer recommendation, medical condition, urgency, special requirements, etc..."
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

export default TransferRecommendationForm;

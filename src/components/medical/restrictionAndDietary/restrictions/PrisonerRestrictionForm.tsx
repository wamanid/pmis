import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { ShieldAlert, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { format } from 'date-fns';
import SearchableSelect from '../../../common/SearchableSelect';
import CustomPrisonerSearch from '../../../common/CustomPrisonerSearch';
import {
  fetchRestrictionReasons,
  fetchStations,
  fetchRestrictionReasonById,
  fetchStationById,
  PrisonerRestriction,
} from '../../../../services/medical/restrictionAndDietary/restrictionService';

interface PrisonerRestrictionFormProps {
  restriction?: PrisonerRestriction | null;
  onSubmit: (restriction: PrisonerRestriction) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  dialogOpen?: boolean;
}

const PrisonerRestrictionForm: React.FC<PrisonerRestrictionFormProps> = ({
  restriction,
  onSubmit,
  onCancel,
  mode,
  dialogOpen = true,
}) => {
  const [formData, setFormData] = useState<PrisonerRestriction>({
    state_of_prisoner: '',
    start_date: '',
    end_date: '',
    prisoner: '',
    reason: '',
    place_of_medical_attention: '',
  });

  const [loading, setLoading] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Local state for SearchableSelect controlled components - initialize with correct value immediately
  const [localReasonValue, setLocalReasonValue] = useState<string | null>(() => {
    if (restriction && (mode === 'edit' || mode === 'view') && restriction.reason) {
      return restriction.reason;
    }
    return null;
  });
  
  const [localStationValue, setLocalStationValue] = useState<string | null>(() => {
    if (restriction && (mode === 'edit' || mode === 'view') && restriction.place_of_medical_attention) {
      return restriction.place_of_medical_attention;
    }
    return null;
  });

  // Pre-fetched items for edit mode - derive from restriction prop
  const initialReason = (restriction && (mode === 'edit' || mode === 'view') && restriction.reason && restriction.reason_name)
    ? { id: restriction.reason, name: restriction.reason_name }
    : null;
  
  const initialStation = (restriction && (mode === 'edit' || mode === 'view') && restriction.place_of_medical_attention && restriction.station_name)
    ? { id: restriction.place_of_medical_attention, name: restriction.station_name }
    : null;

  /**
   * Load initial data for edit mode
   * Populate formData with restriction data
   */
  useEffect(() => {
    if (restriction && (mode === 'edit' || mode === 'view')) {
      setFormData(restriction);
      setLocalReasonValue(restriction.reason || null);
      setLocalStationValue(restriction.place_of_medical_attention || null);
    }
  }, [restriction, mode]);

  /**
   * Reset form when switching between create/edit modes
   */
  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        state_of_prisoner: '',
        start_date: '',
        end_date: '',
        prisoner: '',
        reason: '',
        place_of_medical_attention: '',
      });
      setLocalReasonValue(null);
      setLocalStationValue(null);
      setErrors({});
    }
  }, [mode, dialogOpen]);

  const handleInputChange = (field: keyof PrisonerRestriction, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.prisoner) {
      newErrors.prisoner = 'Prisoner is required';
    }
    if (!formData.state_of_prisoner.trim()) {
      newErrors.state_of_prisoner = 'State of prisoner is required';
    }
    if (!formData.reason) {
      newErrors.reason = 'Restriction reason is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.place_of_medical_attention) {
      newErrors.place_of_medical_attention = 'Place of medical attention is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);

      if (mode === 'create') {
        setFormData({
          state_of_prisoner: '',
          start_date: '',
          end_date: '',
          prisoner: '',
          reason: '',
          place_of_medical_attention: '',
        });
        setLocalReasonValue(null);
        setLocalStationValue(null);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to save restriction');
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  // Server-side paginated fetch callbacks
  const fetchRestrictionReasonsCallback = useCallback(
    async (opts: any, signal?: AbortSignal) => {
      return await fetchRestrictionReasons(
        {
          search: opts?.search ?? '',
          page: opts?.page ?? 1,
          page_size: opts?.page_size ?? 50,
        },
        signal
      );
    },
    []
  );

  const fetchStationsCallback = useCallback(async (opts: any, signal?: AbortSignal) => {
    return await fetchStations(
      {
        search: opts?.search ?? '',
        page: opts?.page ?? 1,
        page_size: opts?.page_size ?? 50,
      },
      signal
    );
  }, []);

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <ShieldAlert className="h-5 w-5" />
          {mode === 'create' && 'New Prisoner Restriction'}
          {mode === 'edit' && 'Edit Prisoner Restriction'}
          {mode === 'view' && 'View Prisoner Restriction'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {restriction?.prisoner_name || 'N/A'}
                    {restriction?.prisoner_number && ` (${restriction.prisoner_number})`}
                  </div>
                ) : mode === 'edit' ? (
                  <div className="p-2 bg-muted rounded border">
                    {restriction?.prisoner_name || 'N/A'}
                    {restriction?.prisoner_number && ` (${restriction.prisoner_number})`}
                  </div>
                ) : (
                  <>
                    <CustomPrisonerSearch
                      key={`prisoner-${dialogOpen}`}
                      value={formData.prisoner}
                      onChange={(val) => handleInputChange('prisoner', val)}
                      placeholder="Search prisoner..."
                      disabled={loading}
                      pageSize={50}
                    />
                    {errors.prisoner && (
                      <p className="text-sm text-red-500">{errors.prisoner}</p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state_of_prisoner">
                  State of Prisoner <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {restriction?.state_of_prisoner || 'N/A'}
                  </div>
                ) : (
                  <>
                    <Input
                      id="state_of_prisoner"
                      value={formData.state_of_prisoner}
                      onChange={(e) =>
                        handleInputChange('state_of_prisoner', e.target.value)
                      }
                      placeholder="Enter state of prisoner"
                      disabled={loading}
                    />
                    {errors.state_of_prisoner && (
                      <p className="text-sm text-red-500">{errors.state_of_prisoner}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Restriction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Restriction Reason <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {restriction?.reason_name || 'N/A'}
                  </div>
                ) : (
                  <>
                    <SearchableSelect
                      key={`reason-${dialogOpen}-${restriction?.id}`}
                      fetchPaginated={fetchRestrictionReasonsCallback}
                      value={localReasonValue}
                      onChange={(val) => {
                        setLocalReasonValue(val);
                        handleInputChange('reason', val);
                      }}
                      placeholder="Select restriction reason"
                      idField="id"
                      labelField="name"
                      pageSize={50}
                      initialItem={initialReason ?? undefined}
                      disabled={loading}
                    />
                    {errors.reason && (
                      <p className="text-sm text-red-500">{errors.reason}</p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="place_of_medical_attention">
                  Place of Medical Attention <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {restriction?.station_name || 'N/A'}
                  </div>
                ) : (
                  <>
                    <SearchableSelect
                      key={`station-${dialogOpen}-${restriction?.id}`}
                      fetchPaginated={fetchStationsCallback}
                      value={localStationValue}
                      onChange={(val) => {
                        setLocalStationValue(val);
                        handleInputChange('place_of_medical_attention', val);
                      }}
                      placeholder="Select place of medical attention"
                      idField="id"
                      labelField="name"
                      pageSize={50}
                      initialItem={initialStation ?? undefined}
                      disabled={loading}
                    />
                    {errors.place_of_medical_attention && (
                      <p className="text-sm text-red-500">
                        {errors.place_of_medical_attention}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {restriction?.start_date ? format(new Date(restriction.start_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={loading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.start_date
                            ? format(new Date(formData.start_date), 'PPP')
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.start_date ? new Date(formData.start_date) : undefined}
                          onSelect={(date: Date | undefined) => {
                            handleInputChange('start_date', date ? format(date, 'yyyy-MM-dd') : '');
                            setStartDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.start_date && (
                      <p className="text-sm text-red-500">{errors.start_date}</p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {restriction?.end_date ? format(new Date(restriction.end_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date
                          ? format(new Date(formData.end_date), 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date ? new Date(formData.end_date) : undefined}
                        onSelect={(date: Date | undefined) => {
                          handleInputChange('end_date', date ? format(date, 'yyyy-MM-dd') : '');
                          setEndDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                {loading
                  ? 'Saving...'
                  : mode === 'create'
                  ? 'Create Restriction'
                  : 'Update Restriction'}
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

export default PrisonerRestrictionForm;

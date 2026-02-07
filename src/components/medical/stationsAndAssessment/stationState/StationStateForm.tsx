import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Building2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import SearchableSelect from '../../../common/SearchableSelect';
import {
  StationState,
  Station,
  Rating,
  fetchStations,
  fetchRatings,
} from '../../../../services/medical/stationsAndAssessment/stationStateService';

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

  const [loading, setLoading] = useState(false);

  // Local state for dropdown values
  const [localStation, setLocalStation] = useState<string | null>(() => {
    if (stationState && (mode === 'edit' || mode === 'view') && stationState.station) {
      return stationState.station;
    }
    return null;
  });

  const [localStateOfBuildings, setLocalStateOfBuildings] = useState<string | null>(() => {
    if (stationState && (mode === 'edit' || mode === 'view') && stationState.state_of_buildings) {
      return stationState.state_of_buildings;
    }
    return null;
  });

  const [localVentilation, setLocalVentilation] = useState<string | null>(() => {
    if (stationState && (mode === 'edit' || mode === 'view') && stationState.ventilation) {
      return stationState.ventilation;
    }
    return null;
  });

  const [localLighting, setLocalLighting] = useState<string | null>(() => {
    if (stationState && (mode === 'edit' || mode === 'view') && stationState.lighting) {
      return stationState.lighting;
    }
    return null;
  });

  const [localFencing, setLocalFencing] = useState<string | null>(() => {
    if (stationState && (mode === 'edit' || mode === 'view') && stationState.fencing) {
      return stationState.fencing;
    }
    return null;
  });

  const [localGeneralEnv, setLocalGeneralEnv] = useState<string | null>(() => {
    if (stationState && (mode === 'edit' || mode === 'view') && stationState.general_environment) {
      return stationState.general_environment;
    }
    return null;
  });

  const [localWardEnv, setLocalWardEnv] = useState<string | null>(() => {
    if (stationState && (mode === 'edit' || mode === 'view') && stationState.ward_environment) {
      return stationState.ward_environment;
    }
    return null;
  });

  // Sync local state with stationState prop
  useEffect(() => {
    if (stationState && (mode === 'edit' || mode === 'view')) {
      setFormData(stationState);
      setLocalStation(stationState.station || null);
      setLocalStateOfBuildings(stationState.state_of_buildings || null);
      setLocalVentilation(stationState.ventilation || null);
      setLocalLighting(stationState.lighting || null);
      setLocalFencing(stationState.fencing || null);
      setLocalGeneralEnv(stationState.general_environment || null);
      setLocalWardEnv(stationState.ward_environment || null);
    }
  }, [stationState, mode]);

  // Reset form when switching to create mode
  useEffect(() => {
    if (mode === 'create') {
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
      setLocalStation(null);
      setLocalStateOfBuildings(null);
      setLocalVentilation(null);
      setLocalLighting(null);
      setLocalFencing(null);
      setLocalGeneralEnv(null);
      setLocalWardEnv(null);
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

  const fetchRatingsCallback = useCallback(
    async (
      opts: { [key: string]: any; search?: string; page?: number; page_size?: number },
      signal?: AbortSignal
    ) => {
      return await fetchRatings(opts.page || 1, opts.page_size || 50, opts.search || '', signal);
    },
    []
  );

  // Derive initialItem for edit mode
  const initialStation =
    stationState && (mode === 'edit' || mode === 'view') && stationState.station && stationState.station_name
      ? { id: stationState.station, name: stationState.station_name }
      : null;

  const initialStateOfBuildings =
    stationState &&
    (mode === 'edit' || mode === 'view') &&
    stationState.state_of_buildings &&
    stationState.state_of_buildings_name
      ? { id: stationState.state_of_buildings, name: stationState.state_of_buildings_name }
      : null;

  const initialVentilation =
    stationState && (mode === 'edit' || mode === 'view') && stationState.ventilation && stationState.ventilation_name
      ? { id: stationState.ventilation, name: stationState.ventilation_name }
      : null;

  const initialLighting =
    stationState && (mode === 'edit' || mode === 'view') && stationState.lighting && stationState.lighting_name
      ? { id: stationState.lighting, name: stationState.lighting_name }
      : null;

  const initialFencing =
    stationState && (mode === 'edit' || mode === 'view') && stationState.fencing && stationState.fencing_name
      ? { id: stationState.fencing, name: stationState.fencing_name }
      : null;

  const initialGeneralEnv =
    stationState &&
    (mode === 'edit' || mode === 'view') &&
    stationState.general_environment &&
    stationState.general_environment_name
      ? { id: stationState.general_environment, name: stationState.general_environment_name }
      : null;

  const initialWardEnv =
    stationState &&
    (mode === 'edit' || mode === 'view') &&
    stationState.ward_environment &&
    stationState.ward_environment_name
      ? { id: stationState.ward_environment, name: stationState.ward_environment_name }
      : null;

  const handleInputChange = (field: keyof StationState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
          <Building2 className="h-5 w-5" />
          {mode === 'create' && 'New Station State Record'}
          {mode === 'edit' && 'Edit Station State Record'}
          {mode === 'view' && 'View Station State Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Station Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Station Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="station">
                  Station <span className="text-red-500">*</span>
                </Label>
                {mode === 'view' || mode === 'edit' ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {stationState?.station_name || 'N/A'}
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
                  disabled={isReadOnly || loading}
                />
              </div>
            </div>
          </div>

          {/* Building & Infrastructure Ratings */}
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
                    {stationState?.state_of_buildings_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchRatingsCallback}
                    value={localStateOfBuildings}
                    onChange={(val) => {
                      setLocalStateOfBuildings(val);
                      handleInputChange('state_of_buildings', val);
                    }}
                    placeholder="Select rating"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialStateOfBuildings ?? undefined}
                    disabled={loading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ventilation">
                  Ventilation <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {stationState?.ventilation_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchRatingsCallback}
                    value={localVentilation}
                    onChange={(val) => {
                      setLocalVentilation(val);
                      handleInputChange('ventilation', val);
                    }}
                    placeholder="Select rating"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialVentilation ?? undefined}
                    disabled={loading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lighting">
                  Lighting <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {stationState?.lighting_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchRatingsCallback}
                    value={localLighting}
                    onChange={(val) => {
                      setLocalLighting(val);
                      handleInputChange('lighting', val);
                    }}
                    placeholder="Select rating"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialLighting ?? undefined}
                    disabled={loading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fencing">
                  Fencing <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {stationState?.fencing_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchRatingsCallback}
                    value={localFencing}
                    onChange={(val) => {
                      setLocalFencing(val);
                      handleInputChange('fencing', val);
                    }}
                    placeholder="Select rating"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialFencing ?? undefined}
                    disabled={loading}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Environment Ratings */}
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
                    {stationState?.general_environment_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchRatingsCallback}
                    value={localGeneralEnv}
                    onChange={(val) => {
                      setLocalGeneralEnv(val);
                      handleInputChange('general_environment', val);
                    }}
                    placeholder="Select rating"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialGeneralEnv ?? undefined}
                    disabled={loading}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward_environment">
                  Ward Environment <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {stationState?.ward_environment_name || 'N/A'}
                  </div>
                ) : (
                  <SearchableSelect
                    fetchPaginated={fetchRatingsCallback}
                    value={localWardEnv}
                    onChange={(val) => {
                      setLocalWardEnv(val);
                      handleInputChange('ward_environment', val);
                    }}
                    placeholder="Select rating"
                    idField="id"
                    labelField="name"
                    pageSize={50}
                    initialItem={initialWardEnv ?? undefined}
                    disabled={loading}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
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

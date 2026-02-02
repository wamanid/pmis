import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import axiosInstance from '../../services/axiosInstance';
import SearchableSelect from '../common/SearchableSelect';

// API ENDPOINTS - Centralized for easy management
const API_ENDPOINTS = {
  LOCATIONS: '/system-administration/locations/',
  SEXES: '/system-administration/sexes/',
  PRISONER_CATEGORIES: '/system-administration/prisoner-categories/',
  LOCKUP_TYPES: '/station-management/api/lockup-types/',
  STATIONS: '/system-administration/stations/',
  BULK_CREATE: '/station-management/api/manual-lockups/bulk-create/',
};

interface Location {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

interface Sex {
  id: string;
  name: string;
  description?: string;
}

interface PrisonerCategory {
  id: string;
  name: string;
  description?: string;
}

interface LockupType {
  id: string;
  name: string;
}

interface Station {
  id: string;
  name: string;
}

// Dynamic counts structure: Record<locationId, Record<categoryId_sexId, count>>
type LockupCounts = Record<string, Record<string, string>>;

interface ManualLockupTableFormProps {
  onRecordsCreated?: () => void;
  selectedStation?: string;
}

export function ManualLockupTableForm({ onRecordsCreated, selectedStation }: ManualLockupTableFormProps) {
  const [lockupType, setLockupType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [station, setStation] = useState(selectedStation || '');
  const [loading, setLoading] = useState(false);
  
  // API-driven reference data
  const [locations, setLocations] = useState<Location[]>([]);
  const [sexes, setSexes] = useState<Sex[]>([]);
  const [prisonerCategories, setPrisonerCategories] = useState<PrisonerCategory[]>([]);
  const [lockupTypes, setLockupTypes] = useState<LockupType[]>([]);
  // NOTE: stations not stored in state - SearchableSelect handles them via paginated fetch
  const [dataLoading, setDataLoading] = useState(true);

  // Dynamic counts structure
  const [counts, setCounts] = useState<LockupCounts>({});

  // Memoize fetchPaginated to prevent infinite re-renders
  const fetchStationsPaginated = useCallback(async (opts: any, signal?: AbortSignal) => {
    const response = await axiosInstance.get(API_ENDPOINTS.STATIONS, {
      params: {
        search: opts.search || '',
        page: opts.page || 1,
        page_size: opts.page_size || 50,
      },
      signal,
    });
    return {
      items: response.data?.results || [],
      count: response.data?.count || 0,
      next: response.data?.next || null,
    };
  }, []); // Empty dependency array - function never changes

  // Fetch locations from API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.LOCATIONS, {
          params: { page_size: -1 }
        });
        const items = response.data?.results || [];
        setLocations(items);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        toast.error('Failed to load locations');
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  // Fetch sexes from API
  useEffect(() => {
    const fetchSexes = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.SEXES, {
          params: { page_size: -1 }
        });
        const items = response.data?.results || [];
        setSexes(items);
      } catch (error) {
        console.error('Failed to fetch sexes:', error);
        toast.error('Failed to load sexes');
        setSexes([]);
      }
    };
    fetchSexes();
  }, []);

  // Fetch prisoner categories from API
  useEffect(() => {
    const fetchPrisonerCategories = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.PRISONER_CATEGORIES, {
          params: { page_size: -1 }
        });
        const items = response.data?.results || [];
        setPrisonerCategories(items);
      } catch (error) {
        console.error('Failed to fetch prisoner categories:', error);
        toast.error('Failed to load prisoner categories');
        setPrisonerCategories([]);
      }
    };
    fetchPrisonerCategories();
  }, []);

  // Fetch lockup types from API
  useEffect(() => {
    const fetchLockupTypes = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.LOCKUP_TYPES, {
          params: { page_size: -1 }
        });
        const items = response.data?.results || [];
        setLockupTypes(items);
      } catch (error) {
        console.error('Failed to fetch lockup types:', error);
        toast.error('Failed to load lockup types');
        setLockupTypes([]);
      } finally {
        setDataLoading(false);
      }
    };
    fetchLockupTypes();
  }, []);

  // NOTE: Stations are fetched via SearchableSelect's paginated mode, not here
  // Removed duplicate stations fetch to prevent conflicts

  // Initialize counts structure when reference data is loaded
  useEffect(() => {
    if (locations.length > 0 && prisonerCategories.length > 0 && sexes.length > 0) {
      const initialCounts: LockupCounts = {};
      locations.forEach(location => {
        initialCounts[location.id] = {};
        prisonerCategories.forEach(category => {
          sexes.forEach(sex => {
            const key = `${category.id}_${sex.id}`;
            initialCounts[location.id][key] = '';
          });
        });
      });
      setCounts(initialCounts);
    }
  }, [locations, prisonerCategories, sexes]);

  const handleCountChange = (locationId: string, key: string, value: string) => {
    setCounts({
      ...counts,
      [locationId]: {
        ...counts[locationId],
        [key]: value,
      },
    });
  };

  // Calculate how many records will be created
  const calculateRecordCount = () => {
    let count = 0;
    Object.values(counts).forEach(locationCounts => {
      Object.values(locationCounts).forEach(value => {
        const cellCount = value ? parseInt(value) : 0;
        if (cellCount > 0) {
          count++;
        }
      });
    });
    return count;
  };

  const handleSave = async () => {
    // Validation
    if (!lockupType || !date || !time) {
      toast.error('Please fill in Lockup Type, Date, and Time');
      return;
    }

    if (!station) {
      toast.error('Please select a Station');
      return;
    }

    setLoading(true);

    try {
      // Build counts array for bulk-create API
      const countsArray: Array<{
        count: number;
        location: string;
        prisoner_category: string;
        sex: string;
      }> = [];

      // Process each location
      Object.entries(counts).forEach(([locationId, locationCounts]) => {
        Object.entries(locationCounts).forEach(([key, value]) => {
          const count = value ? parseInt(value) : 0;
          if (count > 0) {
            // Extract category and sex IDs from key (format: categoryId_sexId)
            const [categoryId, sexId] = key.split('_');
            countsArray.push({
              count,
              location: locationId,
              prisoner_category: categoryId,
              sex: sexId,
            });
          }
        });
      });

      if (countsArray.length === 0) {
        toast.error('Please enter at least one count');
        setLoading(false);
        return;
      }

      // API payload
      const payload = {
        station,
        type: lockupType,
        date,
        lockup_time: time,
        counts: countsArray,
      };

      // Make API call to bulk-create endpoint
      await axiosInstance.post(API_ENDPOINTS.BULK_CREATE, payload);

      toast.success(`Successfully created ${countsArray.length} lockup record${countsArray.length > 1 ? 's' : ''}`);
      
      // Reset form
      const resetCounts: LockupCounts = {};
      locations.forEach(location => {
        resetCounts[location.id] = {};
        prisonerCategories.forEach(category => {
          sexes.forEach(sex => {
            const key = `${category.id}_${sex.id}`;
            resetCounts[location.id][key] = '';
          });
        });
      });
      setCounts(resetCounts);
      
      // Notify parent to refresh
      if (onRecordsCreated) {
        onRecordsCreated();
      }
    } catch (error: any) {
      console.error('Failed to save lockup records:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || 'Failed to save lockup records';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {dataLoading ? (
        <div className="text-center p-8">Loading reference data...</div>
      ) : (
        <>
          {/* Top Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="station">
                Station <span className="text-red-500">*</span>
              </Label>
              <SearchableSelect
                value={station}
                onChange={(id) => setStation(id || '')}
                fetchPaginated={fetchStationsPaginated}
                placeholder="Search station..."
                idField="id"
                labelField="name"
                pageSize={50}
                minQueryLength={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockup_type">
                Lockup Type <span className="text-red-500">*</span>
              </Label>
              <Select value={lockupType} onValueChange={setLockupType}>
                <SelectTrigger id="lockup_type">
                  <SelectValue placeholder="Select lockup type" />
                </SelectTrigger>
                <SelectContent>
                  {lockupTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Lockup Count Table - Dynamically Generated */}
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="border-r p-3 text-left min-w-[120px]">Location</th>
                  {/* Dynamic category columns */}
                  {prisonerCategories.map(category => (
                    <th key={category.id} className="border-r p-3 text-center capitalize" colSpan={sexes.length}>
                      {category.name}
                    </th>
                  ))}
                </tr>
                <tr className="border-b bg-muted/30">
                  <th className="border-r p-2"></th>
                  {/* Dynamic sex sub-columns for each category */}
                  {prisonerCategories.map(category => (
                    <React.Fragment key={category.id}>
                      {sexes.map((sex, idx) => (
                        <th 
                          key={`${category.id}-${sex.id}`} 
                          className={`${idx < sexes.length - 1 ? 'border-r' : ''} p-2 text-center text-sm capitalize`}
                        >
                          {sex.name}
                        </th>
                      ))}
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Dynamic Location Rows */}
                {locations.map(location => (
                  <tr key={location.id} className="border-b hover:bg-muted/20">
                    <td className="border-r p-3 capitalize">{location.name}</td>
                    {/* Dynamic input cells for each category_sex combination */}
                    {prisonerCategories.map(category => (
                      <React.Fragment key={category.id}>
                        {sexes.map((sex, idx) => {
                          const key = `${category.id}_${sex.id}`;
                          return (
                            <td key={`${category.id}-${sex.id}`} className={`${idx < sexes.length - 1 ? 'border-r' : ''} p-2`}>
                              <Input
                                type="number"
                                min="0"
                                className="h-9 text-center"
                                value={counts[location.id]?.[key] || ''}
                                onChange={(e) => handleCountChange(location.id, key, e.target.value)}
                              />
                            </td>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Record Count Info */}
          {calculateRecordCount() > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-800">
                {calculateRecordCount()} record{calculateRecordCount() > 1 ? 's' : ''} will be created
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSave}
              disabled={loading || dataLoading}
              className="bg-primary hover:bg-primary/90 min-w-[200px]"
            >
              {loading ? 'Saving...' : 'SAVE'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

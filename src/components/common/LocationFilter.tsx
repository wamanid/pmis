import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { RegionSelect } from './RegionSelect';
import { DistrictSelect } from './DistrictSelect';
import { StationSelect } from './StationSelect';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useFilters } from '../../contexts/FilterContext';
import { fetchRegionById } from '../../services/systemAdministrationService';
import { fetchDistrictById } from '../../services/systemAdministrationService';
import { fetchStationById } from '../../services/systemAdministrationService';

export interface LocationFilterProps {
  className?: string;
}

export function LocationFilter({ className }: LocationFilterProps) {
  const { region, district, station, setRegion, setDistrict, setStation } = useFilters();
  
  const [regionName, setRegionName] = useState<string>('');
  const [districtName, setDistrictName] = useState<string>('');
  const [stationName, setStationName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch names when IDs change
  useEffect(() => {
    const loadNames = async () => {
      setLoading(true);
      try {
        if (region) {
          const regionData = await fetchRegionById(region);
          setRegionName(regionData.name);
        } else {
          setRegionName('');
        }

        if (district) {
          const districtData = await fetchDistrictById(district);
          setDistrictName(districtData.name);
        } else {
          setDistrictName('');
        }

        if (station) {
          const stationData = await fetchStationById(station);
          setStationName(stationData.name);
        } else {
          setStationName('');
        }
      } catch (error) {
        console.error('Failed to load location names:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNames();
  }, [region, district, station]);

  // Count active filters
  const activeFilterCount = [region, district, station].filter(Boolean).length;

  // Build display text
  const getDisplayText = () => {
    if (loading) return 'Loading...';
    
    if (station && stationName) {
      return stationName;
    }
    if (district && districtName) {
      return districtName;
    }
    if (region && regionName) {
      return regionName;
    }
    return 'Uganda';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`relative ${className}`}>
          <MapPin className="h-4 w-4 mr-2" />
          <span>{getDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">Filter by Location</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Select your location to filter data across the system
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <RegionSelect
                value={region}
                onValueChange={setRegion}
                placeholder="Select region..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">District</label>
              <DistrictSelect
                value={district}
                onValueChange={setDistrict}
                regionId={region}
                placeholder="Select district..."
              />
              {!region && (
                <p className="text-xs text-muted-foreground">
                  Select a region first
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Station</label>
              <StationSelect
                value={station}
                onValueChange={setStation}
                regionId={region}
                districtId={district}
                placeholder="Select station..."
              />
              {!district && (
                <p className="text-xs text-muted-foreground">
                  Select a district first
                </p>
              )}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRegion('');
                    setDistrict('');
                    setStation('');
                  }}
                  className="h-7 text-xs"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

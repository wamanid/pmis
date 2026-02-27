import React, { useEffect, useRef } from 'react';
import { Label } from '../ui/label';
import { RegionSelect } from './RegionSelect';
import { DistrictSelect } from './DistrictSelect';
import { CountySelect } from './CountySelect';
import { SubCountySelect } from './SubCountySelect';
import { ParishSelect } from './ParishSelect';
import { VillageSelect } from './VillageSelect';

export interface AddressSelectProps {
  // Values
  region?: string;
  district?: string;
  county?: string;
  subCounty?: string;
  parish?: string;
  village?: string;

  // Change handlers
  onRegionChange?: (value: string) => void;
  onDistrictChange?: (value: string) => void;
  onCountyChange?: (value: string) => void;
  onSubCountyChange?: (value: string) => void;
  onParishChange?: (value: string) => void;
  onVillageChange?: (value: string) => void;

  // Optional configuration
  disabled?: boolean;
  className?: string;
  showLabels?: boolean;
  gridCols?: 1 | 2 | 3;
  enableReverseCascade?: boolean;
}

export function AddressSelect({
  region,
  district,
  county,
  subCounty,
  parish,
  village,
  onRegionChange,
  onDistrictChange,
  onCountyChange,
  onSubCountyChange,
  onParishChange,
  onVillageChange,
  disabled = false,
  className = '',
  showLabels = true,
  gridCols = 2,
  enableReverseCascade = true,
}: AddressSelectProps) {
  // Track previous values to detect actual changes
  const prevRegionRef = useRef<string | undefined>(region);
  const prevDistrictRef = useRef<string | undefined>(district);
  const prevCountyRef = useRef<string | undefined>(county);
  const prevSubCountyRef = useRef<string | undefined>(subCounty);
  const prevParishRef = useRef<string | undefined>(parish);

  // Forward cascade: Reset dependent fields when parent changes
  useEffect(() => {
    // Only clear if region actually changed (not just on mount/re-render)
    if (prevRegionRef.current !== region && prevRegionRef.current !== undefined) {
      if (district) {
        onDistrictChange?.('');
      }
    }
    prevRegionRef.current = region;
  }, [region]);

  useEffect(() => {
    // Only clear if district actually changed
    if (prevDistrictRef.current !== district && prevDistrictRef.current !== undefined) {
      if (county) {
        onCountyChange?.('');
      }
    }
    prevDistrictRef.current = district;
  }, [district]);

  useEffect(() => {
    // Only clear if county actually changed
    if (prevCountyRef.current !== county && prevCountyRef.current !== undefined) {
      if (subCounty) {
        onSubCountyChange?.('');
      }
    }
    prevCountyRef.current = county;
  }, [county]);

  useEffect(() => {
    // Only clear if sub-county actually changed
    if (prevSubCountyRef.current !== subCounty && prevSubCountyRef.current !== undefined) {
      if (parish) {
        onParishChange?.('');
      }
    }
    prevSubCountyRef.current = subCounty;
  }, [subCounty]);

  useEffect(() => {
    // Only clear if parish actually changed
    if (prevParishRef.current !== parish && prevParishRef.current !== undefined) {
      if (village) {
        onVillageChange?.('');
      }
    }
    prevParishRef.current = parish;
  }, [parish]);

  const gridClass = `grid grid-cols-1 md:grid-cols-${gridCols} gap-4`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className={gridClass}>
        {/* Region */}
        <div>
          {showLabels && <Label htmlFor="region">Region</Label>}
          <RegionSelect
            value={region}
            onValueChange={onRegionChange}
            placeholder="Select region"
            disabled={disabled}
          />
        </div>

        {/* District */}
        <div>
          {showLabels && <Label htmlFor="district">District</Label>}
          <DistrictSelect
            value={district}
            onValueChange={onDistrictChange}
            regionId={region}
            placeholder="Select district"
            disabled={disabled || !region}
          />
        </div>

        {/* County */}
        <div>
          {showLabels && <Label htmlFor="county">County</Label>}
          <CountySelect
            value={county}
            onValueChange={onCountyChange}
            districtId={district}
            placeholder="Select county"
            disabled={disabled || !district}
          />
        </div>

        {/* Sub-County */}
        <div>
          {showLabels && <Label htmlFor="sub_county">Sub-County</Label>}
          <SubCountySelect
            value={subCounty}
            onValueChange={onSubCountyChange}
            countyId={county}
            placeholder="Select sub-county"
            disabled={disabled || !county}
          />
        </div>

        {/* Parish */}
        <div>
          {showLabels && <Label htmlFor="parish">Parish</Label>}
          <ParishSelect
            value={parish}
            onValueChange={onParishChange}
            subCountyId={subCounty}
            placeholder="Select parish"
            disabled={disabled || !subCounty}
          />
        </div>

        {/* Village */}
        <div>
          {showLabels && <Label htmlFor="village">Village</Label>}
          <VillageSelect
            value={village}
            onValueChange={onVillageChange}
            parishId={parish}
            placeholder="Select village"
            disabled={disabled || !parish}
          />
        </div>
      </div>
    </div>
  );
}

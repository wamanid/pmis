import React, { useEffect } from 'react';
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
  // Forward cascade: Reset dependent fields when parent changes
  useEffect(() => {
    // When region changes, clear district and all dependent fields
    if (district) {
      onDistrictChange?.('');
    }
  }, [region]);

  useEffect(() => {
    // When district changes, clear county and all dependent fields
    if (county) {
      onCountyChange?.('');
    }
  }, [district]);

  useEffect(() => {
    // When county changes, clear sub-county and all dependent fields
    if (subCounty) {
      onSubCountyChange?.('');
    }
  }, [county]);

  useEffect(() => {
    // When sub-county changes, clear parish and all dependent fields
    if (parish) {
      onParishChange?.('');
    }
  }, [subCounty]);

  useEffect(() => {
    // When parish changes, clear village
    if (village) {
      onVillageChange?.('');
    }
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

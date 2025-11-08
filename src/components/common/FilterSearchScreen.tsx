import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  ChevronsUpDown,
  Check,
  MapPin,
  Building2,
  Home,
  User,
  X
} from 'lucide-react';
import { cn } from '../ui/utils';

interface Region {
  id: string;
  name: string;
  code: string;
}

interface District {
  id: string;
  name: string;
  code: string;
  region_id: string;
}

interface Station {
  id: string;
  name: string;
  code: string;
  district_id: string;
}

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
  station_id: string;
}

interface FilterSearchScreenProps {
  onFilterChange?: (filters: FilterData) => void;
  showTitle?: boolean;
  disabled?: boolean;
  initialValues?: FilterData;
}

export interface FilterData {
  region_id: string;
  region_name: string;
  district_id: string;
  district_name: string;
  station_id: string;
  station_name: string;
  prisoner_id: string;
  prisoner_name: string;
}

// Mock data for regions
const mockRegions: Region[] = [
  { id: 'reg1', name: 'Central Region', code: 'CENT' },
  { id: 'reg2', name: 'Eastern Region', code: 'EAST' },
  { id: 'reg3', name: 'Northern Region', code: 'NORT' },
  { id: 'reg4', name: 'Western Region', code: 'WEST' }
];

// Mock data for districts
const mockDistricts: District[] = [
  { id: 'dis1', name: 'Kampala', code: 'KLA', region_id: 'reg1' },
  { id: 'dis2', name: 'Wakiso', code: 'WKS', region_id: 'reg1' },
  { id: 'dis3', name: 'Mukono', code: 'MKN', region_id: 'reg1' },
  { id: 'dis4', name: 'Jinja', code: 'JNJ', region_id: 'reg2' },
  { id: 'dis5', name: 'Mbale', code: 'MBL', region_id: 'reg2' },
  { id: 'dis6', name: 'Soroti', code: 'SRT', region_id: 'reg2' },
  { id: 'dis7', name: 'Gulu', code: 'GUL', region_id: 'reg3' },
  { id: 'dis8', name: 'Lira', code: 'LRA', region_id: 'reg3' },
  { id: 'dis9', name: 'Arua', code: 'ARU', region_id: 'reg3' },
  { id: 'dis10', name: 'Mbarara', code: 'MBR', region_id: 'reg4' },
  { id: 'dis11', name: 'Fort Portal', code: 'FTP', region_id: 'reg4' },
  { id: 'dis12', name: 'Kabale', code: 'KBL', region_id: 'reg4' }
];

// Mock data for stations
const mockStations: Station[] = [
  { id: 'stn1', name: 'Luzira Prison', code: 'LUZ', district_id: 'dis1' },
  { id: 'stn2', name: 'Kitalya Prison', code: 'KIT', district_id: 'dis2' },
  { id: 'stn3', name: 'Kigo Prison', code: 'KIG', district_id: 'dis2' },
  { id: 'stn4', name: 'Mukono Prison', code: 'MKN', district_id: 'dis3' },
  { id: 'stn5', name: 'Jinja Main Prison', code: 'JNJ', district_id: 'dis4' },
  { id: 'stn6', name: 'Mbale Prison', code: 'MBL', district_id: 'dis5' },
  { id: 'stn7', name: 'Soroti Prison', code: 'SRT', district_id: 'dis6' },
  { id: 'stn8', name: 'Gulu Main Prison', code: 'GUL', district_id: 'dis7' },
  { id: 'stn9', name: 'Lira Prison', code: 'LRA', district_id: 'dis8' },
  { id: 'stn10', name: 'Arua Prison', code: 'ARU', district_id: 'dis9' },
  { id: 'stn11', name: 'Mbarara Prison', code: 'MBR', district_id: 'dis10' },
  { id: 'stn12', name: 'Fort Portal Prison', code: 'FTP', district_id: 'dis11' },
  { id: 'stn13', name: 'Kabale Prison', code: 'KBL', district_id: 'dis12' }
];

// Mock data for prisoners
const mockPrisoners: Prisoner[] = [
  { id: 'pr1', prisoner_number: 'PRS-2024-001', full_name: 'John Doe Mukasa', station_id: 'stn1' },
  { id: 'pr2', prisoner_number: 'PRS-2024-002', full_name: 'Sarah Jane Nakato', station_id: 'stn1' },
  { id: 'pr3', prisoner_number: 'PRS-2024-003', full_name: 'Michael Peter Okello', station_id: 'stn2' },
  { id: 'pr4', prisoner_number: 'PRS-2024-004', full_name: 'David Emmanuel Musoke', station_id: 'stn2' },
  { id: 'pr5', prisoner_number: 'PRS-2024-005', full_name: 'Grace Mary Akello', station_id: 'stn3' },
  { id: 'pr6', prisoner_number: 'PRS-2024-006', full_name: 'Robert James Tumwine', station_id: 'stn4' },
  { id: 'pr7', prisoner_number: 'PRS-2024-007', full_name: 'Patricia Anne Nambi', station_id: 'stn5' },
  { id: 'pr8', prisoner_number: 'PRS-2024-008', full_name: 'Andrew Simon Kaweesi', station_id: 'stn6' }
];

export default function FilterSearchScreen({ 
  onFilterChange,
  showTitle = true,
  disabled = false,
  initialValues
}: FilterSearchScreenProps) {
  // State for selections
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);

  // State for dropdowns
  const [regionOpen, setRegionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [stationOpen, setStationOpen] = useState(false);
  const [prisonerOpen, setPrisonerOpen] = useState(false);

  // State for data
  const [regions, setRegions] = useState<Region[]>(mockRegions);
  const [districts, setDistricts] = useState<District[]>(mockDistricts);
  const [stations, setStations] = useState<Station[]>(mockStations);
  const [prisoners, setPrisoners] = useState<Prisoner[]>(mockPrisoners);

  // Filtered data based on cascading selections
  const filteredDistricts = selectedRegion 
    ? districts.filter(d => d.region_id === selectedRegion.id)
    : [];

  const filteredStations = selectedDistrict
    ? stations.filter(s => s.district_id === selectedDistrict.id)
    : [];

  const filteredPrisoners = selectedStation
    ? prisoners.filter(p => p.station_id === selectedStation.id)
    : [];

  // Initialize with initial values
  useEffect(() => {
    if (initialValues) {
      if (initialValues.region_id) {
        const region = regions.find(r => r.id === initialValues.region_id);
        if (region) setSelectedRegion(region);
      }
      if (initialValues.district_id) {
        const district = districts.find(d => d.id === initialValues.district_id);
        if (district) setSelectedDistrict(district);
      }
      if (initialValues.station_id) {
        const station = stations.find(s => s.id === initialValues.station_id);
        if (station) setSelectedStation(station);
      }
      if (initialValues.prisoner_id) {
        const prisoner = prisoners.find(p => p.id === initialValues.prisoner_id);
        if (prisoner) setSelectedPrisoner(prisoner);
      }
    }
  }, [initialValues]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      const filterData: FilterData = {
        region_id: selectedRegion?.id || '',
        region_name: selectedRegion?.name || '',
        district_id: selectedDistrict?.id || '',
        district_name: selectedDistrict?.name || '',
        station_id: selectedStation?.id || '',
        station_name: selectedStation?.name || '',
        prisoner_id: selectedPrisoner?.id || '',
        prisoner_name: selectedPrisoner?.full_name || ''
      };
      onFilterChange(filterData);
    }
  }, [selectedRegion, selectedDistrict, selectedStation, selectedPrisoner, onFilterChange]);

  // Handle region selection
  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
    setSelectedDistrict(null);
    setSelectedStation(null);
    setSelectedPrisoner(null);
    setRegionOpen(false);
    toast.success(`Selected region: ${region.name}`);
  };

  // Handle district selection
  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
    setSelectedStation(null);
    setSelectedPrisoner(null);
    setDistrictOpen(false);
    toast.success(`Selected district: ${district.name}`);
  };

  // Handle station selection
  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setSelectedPrisoner(null);
    setStationOpen(false);
    toast.success(`Selected station: ${station.name}`);
  };

  // Handle prisoner selection
  const handlePrisonerSelect = (prisoner: Prisoner) => {
    setSelectedPrisoner(prisoner);
    setPrisonerOpen(false);
    toast.success(`Selected prisoner: ${prisoner.full_name}`);
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedRegion(null);
    setSelectedDistrict(null);
    setSelectedStation(null);
    setSelectedPrisoner(null);
    toast.info('All filters cleared');
  };

  // Clear individual filter
  const clearRegion = () => {
    setSelectedRegion(null);
    setSelectedDistrict(null);
    setSelectedStation(null);
    setSelectedPrisoner(null);
  };

  const clearDistrict = () => {
    setSelectedDistrict(null);
    setSelectedStation(null);
    setSelectedPrisoner(null);
  };

  const clearStation = () => {
    setSelectedStation(null);
    setSelectedPrisoner(null);
  };

  const clearPrisoner = () => {
    setSelectedPrisoner(null);
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: '#650000' }}>
            <MapPin className="h-6 w-6" />
            <h2>Filter & Search</h2>
          </div>
          {(selectedRegion || selectedDistrict || selectedStation || selectedPrisoner) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Region Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="region-filter">Region</Label>
              <div className="flex gap-2">
                <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={regionOpen}
                      className="w-full justify-between"
                      type="button"
                      disabled={disabled}
                      style={{ 
                        borderColor: selectedRegion ? '#650000' : undefined,
                        borderWidth: selectedRegion ? '2px' : '1px'
                      }}
                    >
                      {selectedRegion ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" style={{ color: '#650000' }} />
                          <span className="truncate">{selectedRegion.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Select region...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search regions..." />
                      <CommandList>
                        <CommandEmpty>No region found.</CommandEmpty>
                        <CommandGroup>
                          {regions.map((region) => (
                            <CommandItem
                              key={region.id}
                              value={region.name}
                              onSelect={() => handleRegionSelect(region)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedRegion?.id === region.id ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: '#650000' }}
                              />
                              <div className="flex items-center justify-between flex-1">
                                <span>{region.name}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {region.code}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedRegion && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearRegion}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* District Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="district-filter">District</Label>
              <div className="flex gap-2">
                <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={districtOpen}
                      className="w-full justify-between"
                      type="button"
                      disabled={disabled || !selectedRegion}
                      style={{ 
                        borderColor: selectedDistrict ? '#650000' : undefined,
                        borderWidth: selectedDistrict ? '2px' : '1px'
                      }}
                    >
                      {selectedDistrict ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" style={{ color: '#650000' }} />
                          <span className="truncate">{selectedDistrict.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {selectedRegion ? 'Select district...' : 'Select region first'}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search districts..." />
                      <CommandList>
                        <CommandEmpty>No district found.</CommandEmpty>
                        <CommandGroup>
                          {filteredDistricts.map((district) => (
                            <CommandItem
                              key={district.id}
                              value={district.name}
                              onSelect={() => handleDistrictSelect(district)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedDistrict?.id === district.id ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: '#650000' }}
                              />
                              <div className="flex items-center justify-between flex-1">
                                <span>{district.name}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {district.code}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedDistrict && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearDistrict}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Station Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="station-filter">Station</Label>
              <div className="flex gap-2">
                <Popover open={stationOpen} onOpenChange={setStationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={stationOpen}
                      className="w-full justify-between"
                      type="button"
                      disabled={disabled || !selectedDistrict}
                      style={{ 
                        borderColor: selectedStation ? '#650000' : undefined,
                        borderWidth: selectedStation ? '2px' : '1px'
                      }}
                    >
                      {selectedStation ? (
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" style={{ color: '#650000' }} />
                          <span className="truncate">{selectedStation.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {selectedDistrict ? 'Select station...' : 'Select district first'}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search stations..." />
                      <CommandList>
                        <CommandEmpty>No station found.</CommandEmpty>
                        <CommandGroup>
                          {filteredStations.map((station) => (
                            <CommandItem
                              key={station.id}
                              value={station.name}
                              onSelect={() => handleStationSelect(station)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedStation?.id === station.id ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: '#650000' }}
                              />
                              <div className="flex items-center justify-between flex-1">
                                <span>{station.name}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {station.code}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedStation && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearStation}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Prisoner Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="prisoner-filter">Prisoner</Label>
              <div className="flex gap-2">
                <Popover open={prisonerOpen} onOpenChange={setPrisonerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={prisonerOpen}
                      className="w-full justify-between"
                      type="button"
                      disabled={disabled || !selectedStation}
                      style={{ 
                        borderColor: selectedPrisoner ? '#650000' : undefined,
                        borderWidth: selectedPrisoner ? '2px' : '1px'
                      }}
                    >
                      {selectedPrisoner ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" style={{ color: '#650000' }} />
                          <span className="truncate">{selectedPrisoner.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {selectedStation ? 'Select prisoner...' : 'Select station first'}
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0">
                    <Command>
                      <CommandInput placeholder="Search prisoners..." />
                      <CommandList>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {filteredPrisoners.map((prisoner) => (
                            <CommandItem
                              key={prisoner.id}
                              value={`${prisoner.full_name} ${prisoner.prisoner_number}`}
                              onSelect={() => handlePrisonerSelect(prisoner)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPrisoner?.id === prisoner.id ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: '#650000' }}
                              />
                              <div className="flex flex-col flex-1">
                                <span>{prisoner.full_name}</span>
                                <span className="text-xs text-gray-500">{prisoner.prisoner_number}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedPrisoner && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearPrisoner}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedRegion || selectedDistrict || selectedStation || selectedPrisoner) && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active Filters:</span>
                {selectedRegion && (
                  <Badge style={{ backgroundColor: '#650000' }}>
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedRegion.name}
                  </Badge>
                )}
                {selectedDistrict && (
                  <Badge style={{ backgroundColor: '#650000' }}>
                    <Building2 className="h-3 w-3 mr-1" />
                    {selectedDistrict.name}
                  </Badge>
                )}
                {selectedStation && (
                  <Badge style={{ backgroundColor: '#650000' }}>
                    <Home className="h-3 w-3 mr-1" />
                    {selectedStation.name}
                  </Badge>
                )}
                {selectedPrisoner && (
                  <Badge style={{ backgroundColor: '#650000' }}>
                    <User className="h-3 w-3 mr-1" />
                    {selectedPrisoner.full_name}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

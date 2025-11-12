import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { fetchStations } from '../../services/system_administration';
import type { Station } from '../../models/system_administration';

export interface StationSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  regionId?: string;
  districtId?: string;
  categoryId?: string;
  genderId?: string;
  securityLevelId?: string;
  stationTypeId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StationSelect({
  value,
  onValueChange,
  regionId,
  districtId,
  categoryId,
  genderId,
  securityLevelId,
  stationTypeId,
  placeholder = 'Select station...',
  disabled = false,
  className,
}: StationSelectProps) {
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch stations when component mounts, search query changes, or filters change
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchStations({
          search: searchQuery || undefined,
          region: regionId || undefined,
          district: districtId || undefined,
          category: categoryId || undefined,
          gender: genderId || undefined,
          security_level: securityLevelId || undefined,
          station_type: stationTypeId || undefined,
          is_active: true,
          ordering: 'name',
        });
        setStations(response.results);
      } catch (err: any) {
        console.error('Failed to load stations:', err);
        setError(err.message || 'Failed to load stations');
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [searchQuery, regionId, districtId, categoryId, genderId, securityLevelId, stationTypeId]);

  // Find selected station
  const selectedStation = stations.find((station) => station.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {selectedStation ? selectedStation.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search stations..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-red-600">
                {error}
              </div>
            ) : (
              <>
                <CommandEmpty>No station found.</CommandEmpty>
                <CommandGroup>
                  {stations.map((station) => (
                    <CommandItem
                      key={station.id}
                      value={station.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === station.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{station.name}</span>
                        {station.station_code && (
                          <span className="text-xs text-muted-foreground">
                            Code: {station.station_code}
                          </span>
                        )}
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {station.district_name && <span>{station.district_name}</span>}
                          {station.region_name && <span>• {station.region_name}</span>}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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
import { fetchDistricts } from '../../services/systemAdministrationService';
import type { District } from '../../models/system_administration';

export interface DistrictSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  regionId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DistrictSelect({
  value,
  onValueChange,
  regionId,
  placeholder = 'Select district...',
  disabled = false,
  className,
}: DistrictSelectProps) {
  const [open, setOpen] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch districts when component mounts, search query changes, or regionId changes
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchDistricts({
          search: searchQuery || undefined,
          region: regionId || undefined,
          is_active: true,
          ordering: 'name',
        });
        setDistricts(response.results);
      } catch (err: any) {
        console.error('Failed to load districts:', err);
        setError(err.message || 'Failed to load districts');
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, [searchQuery, regionId]);

  // Find selected district
  const selectedDistrict = districts.find((district) => district.id === value);

  // Determine if component should be disabled
  const isDisabled = disabled || (!regionId && districts.length === 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={isDisabled}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {selectedDistrict ? selectedDistrict.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search districts..."
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
            ) : !regionId ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Please select a region first
              </div>
            ) : (
              <>
                <CommandEmpty>No district found.</CommandEmpty>
                <CommandGroup>
                  {districts.map((district) => (
                    <CommandItem
                      key={district.id}
                      value={district.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === district.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{district.name}</span>
                        {district.description && (
                          <span className="text-xs text-muted-foreground">
                            {district.description}
                          </span>
                        )}
                        {district.region_name && (
                          <span className="text-xs text-muted-foreground">
                            Region: {district.region_name}
                          </span>
                        )}
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

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
import { fetchRegions } from '../../services/system_administration';
import type { Region } from '../../models/system_administration';

export interface RegionSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RegionSelect({
  value,
  onValueChange,
  placeholder = 'Select region...',
  disabled = false,
  className,
}: RegionSelectProps) {
  const [open, setOpen] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch regions when component mounts or search query changes
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchRegions({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setRegions(response.results);
      } catch (err: any) {
        console.error('Failed to load regions:', err);
        setError(err.message || 'Failed to load regions');
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, [searchQuery]);

  // Find selected region
  const selectedRegion = regions.find((region) => region.id === value);

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
          {selectedRegion ? selectedRegion.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search regions..."
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
                <CommandEmpty>No region found.</CommandEmpty>
                <CommandGroup>
                  {regions.map((region) => (
                    <CommandItem
                      key={region.id}
                      value={region.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === region.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{region.name}</span>
                        {region.description && (
                          <span className="text-xs text-muted-foreground">
                            {region.description}
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

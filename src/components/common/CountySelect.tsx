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
import { fetchCounties } from '../../services/system_administration';
import type { County } from '../../models/system_administration';

export interface CountySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  districtId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CountySelect({
  value,
  onValueChange,
  districtId,
  placeholder = 'Select county...',
  disabled = false,
  className,
}: CountySelectProps) {
  const [open, setOpen] = useState(false);
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch counties when component mounts, search query, or districtId changes
  useEffect(() => {
    const loadCounties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCounties({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
          district: districtId,
        });
        setCounties(response.results);
      } catch (err: any) {
        console.error('Failed to load counties:', err);
        setError(err.message || 'Failed to load counties');
      } finally {
        setLoading(false);
      }
    };

    loadCounties();
  }, [searchQuery, districtId]);

  // Find selected county
  const selectedCounty = counties.find((county) => county.id === value);

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
          {selectedCounty ? selectedCounty.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search counties..."
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
                <CommandEmpty>No county found.</CommandEmpty>
                <CommandGroup>
                  {counties.map((county) => (
                    <CommandItem
                      key={county.id}
                      value={county.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === county.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{county.name}</span>
                        {county.district_name && (
                          <span className="text-xs text-muted-foreground">
                            District: {county.district_name}
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

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
import { fetchSubCounties } from '../../services/system_administration/subCountyService';
import type { SubCounty } from '../../models/system_administration';

export interface SubCountySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  countyId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SubCountySelect({
  value,
  onValueChange,
  countyId,
  placeholder = 'Select sub-county...',
  disabled = false,
  className,
}: SubCountySelectProps) {
  const [open, setOpen] = useState(false);
  const [subCounties, setSubCounties] = useState<SubCounty[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch sub-counties when component mounts, search query, or countyId changes
  useEffect(() => {
    const loadSubCounties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchSubCounties({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
          county: countyId,
        });
        setSubCounties(response.results);
      } catch (err: any) {
        console.error('Failed to load sub-counties:', err);
        setError(err.message || 'Failed to load sub-counties');
      } finally {
        setLoading(false);
      }
    };

    loadSubCounties();
  }, [searchQuery, countyId]);

  // Find selected sub-county
  const selectedSubCounty = subCounties.find((subCounty) => subCounty.id === value);

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
          {selectedSubCounty ? selectedSubCounty.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search sub-counties..."
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
                <CommandEmpty>No sub-county found.</CommandEmpty>
                <CommandGroup>
                  {subCounties.map((subCounty) => (
                    <CommandItem
                      key={subCounty.id}
                      value={subCounty.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === subCounty.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{subCounty.name}</span>
                        {subCounty.county_name && (
                          <span className="text-xs text-muted-foreground">
                            County: {subCounty.county_name}
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

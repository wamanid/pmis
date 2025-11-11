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
import { fetchContinents } from '../../services/system_administration';
import type { Continent } from '../../models/system_administration';

export interface ContinentSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ContinentSelect({
  value,
  onValueChange,
  placeholder = 'Select continent...',
  disabled = false,
  className,
}: ContinentSelectProps) {
  const [open, setOpen] = useState(false);
  const [continents, setContinents] = useState<Continent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch continents when component mounts or search query changes
  useEffect(() => {
    const loadContinents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchContinents({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setContinents(response.results);
      } catch (err: any) {
        console.error('Failed to load continents:', err);
        setError(err.message || 'Failed to load continents');
      } finally {
        setLoading(false);
      }
    };

    loadContinents();
  }, [searchQuery]);

  // Find selected continent
  const selectedContinent = continents.find((continent) => continent.id === value);

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
          {selectedContinent ? selectedContinent.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search continents..."
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
                <CommandEmpty>No continent found.</CommandEmpty>
                <CommandGroup>
                  {continents.map((continent) => (
                    <CommandItem
                      key={continent.id}
                      value={continent.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === continent.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{continent.name}</span>
                        {continent.description && (
                          <span className="text-xs text-muted-foreground">
                            {continent.description}
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

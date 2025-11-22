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
import { fetchParishes } from '../../services/system_administration';
import type { Parish } from '../../models/system_administration';

export interface ParishSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  subCountyId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ParishSelect({
  value,
  onValueChange,
  subCountyId,
  placeholder = 'Select parish...',
  disabled = false,
  className,
}: ParishSelectProps) {
  const [open, setOpen] = useState(false);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch parishes when component mounts, search query, or subCountyId changes
  useEffect(() => {
    const loadParishes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchParishes({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
          sub_county: subCountyId,
        });
        setParishes(response.results);
      } catch (err: any) {
        console.error('Failed to load parishes:', err);
        setError(err.message || 'Failed to load parishes');
      } finally {
        setLoading(false);
      }
    };

    loadParishes();
  }, [searchQuery, subCountyId]);

  // Find selected parish
  const selectedParish = parishes.find((parish) => parish.id === value);

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
          {selectedParish ? selectedParish.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search parishes..."
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
                <CommandEmpty>No parish found.</CommandEmpty>
                <CommandGroup>
                  {parishes.map((parish) => (
                    <CommandItem
                      key={parish.id}
                      value={parish.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === parish.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{parish.name}</span>
                        {parish.sub_county_name && (
                          <span className="text-xs text-muted-foreground">
                            Sub-County: {parish.sub_county_name}
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

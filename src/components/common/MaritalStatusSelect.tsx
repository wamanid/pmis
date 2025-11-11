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
import { fetchMaritalStatuses } from '../../services/system_administration';
import type { MaritalStatus } from '../../models/system_administration';

export interface MaritalStatusSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MaritalStatusSelect({
  value,
  onValueChange,
  placeholder = 'Select marital status...',
  disabled = false,
  className,
}: MaritalStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch marital statuses when component mounts or search query changes
  useEffect(() => {
    const loadMaritalStatuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchMaritalStatuses({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setMaritalStatuses(response.results);
      } catch (err: any) {
        console.error('Failed to load marital statuses:', err);
        setError(err.message || 'Failed to load marital statuses');
      } finally {
        setLoading(false);
      }
    };

    loadMaritalStatuses();
  }, [searchQuery]);

  // Find selected marital status
  const selectedMaritalStatus = maritalStatuses.find((status) => status.id === value);

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
          {selectedMaritalStatus ? selectedMaritalStatus.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search marital statuses..."
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
                <CommandEmpty>No marital status found.</CommandEmpty>
                <CommandGroup>
                  {maritalStatuses.map((status) => (
                    <CommandItem
                      key={status.id}
                      value={status.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === status.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{status.name}</span>
                        {status.description && (
                          <span className="text-xs text-muted-foreground">
                            {status.description}
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

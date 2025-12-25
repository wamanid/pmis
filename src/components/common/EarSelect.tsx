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
import { fetchEars } from '../../services/system_administration/earService';
import type { Ear } from '../../models/system_administration/ear';

export interface EarSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function EarSelect({
  value,
  onValueChange,
  placeholder = 'Select ear type...',
  disabled = false,
  className,
}: EarSelectProps) {
  const [open, setOpen] = useState(false);
  const [ears, setEars] = useState<Ear[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEars = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchEars({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setEars(response.results);
      } catch (err: any) {
        console.error('Failed to load ears:', err);
        setError(err.message || 'Failed to load ears');
      } finally {
        setLoading(false);
      }
    };

    loadEars();
  }, [searchQuery]);

  const selectedEar = ears.find((ear) => ear.id === value);

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
          {selectedEar ? selectedEar.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search ears..."
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
                <CommandEmpty>No ear type found.</CommandEmpty>
                <CommandGroup>
                  {ears.map((ear) => (
                    <CommandItem
                      key={ear.id}
                      value={ear.name}
                      onSelect={() => {
                        onValueChange?.(ear.id === value ? '' : ear.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === ear.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{ear.name}</span>
                        {ear.description && (
                          <span className="text-xs text-muted-foreground">
                            {ear.description}
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

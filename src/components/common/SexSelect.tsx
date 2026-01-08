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
import { fetchSexes } from '../../services/system_administration/sexService';
import type { Sex } from '../../models/system_administration';

export interface SexSelectProps {
  value?: string;
  onValueChange?: (value: string, sex?: Sex) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SexSelect({
  value,
  onValueChange,
  placeholder = 'Select sex...',
  disabled = false,
  className,
}: SexSelectProps) {
  const [open, setOpen] = useState(false);
  const [sexes, setSexes] = useState<Sex[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch sexes when component mounts or search query changes
  useEffect(() => {
    const loadSexes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchSexes({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setSexes(response.results);
      } catch (err: any) {
        console.error('Failed to load sexes:', err);
        setError(err.message || 'Failed to load sexes');
      } finally {
        setLoading(false);
      }
    };

    loadSexes();
  }, [searchQuery]);

  // Find selected sex
  const selectedSex = sexes.find((sex) => sex.id === value);

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
          {selectedSex ? selectedSex.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search sexes..."
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
                <CommandEmpty>No sex found.</CommandEmpty>
                <CommandGroup>
                  {sexes.map((sex) => (
                    <CommandItem
                      key={sex.id}
                      value={sex.name}
                      onSelect={() => {
                        const newValue = sex.id === value ? '' : sex.id;
                        onValueChange?.(newValue, newValue ? sex : undefined);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === sex.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{sex.name}</span>
                        {sex.description && (
                          <span className="text-xs text-muted-foreground">
                            {sex.description}
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

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
import { fetchTribes } from '../../services/system_administration';
import type { Tribe } from '../../models/system_administration';

export interface TribeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TribeSelect({
  value,
  onValueChange,
  placeholder = 'Select tribe...',
  disabled = false,
  className,
}: TribeSelectProps) {
  const [open, setOpen] = useState(false);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch tribes when component mounts or search query changes
  useEffect(() => {
    const loadTribes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchTribes({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setTribes(response.results);
      } catch (err: any) {
        console.error('Failed to load tribes:', err);
        setError(err.message || 'Failed to load tribes');
      } finally {
        setLoading(false);
      }
    };

    loadTribes();
  }, [searchQuery]);

  // Find selected tribe
  const selectedTribe = tribes.find((tribe) => tribe.id === value);

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
          {selectedTribe ? selectedTribe.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search tribes..."
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
                <CommandEmpty>No tribe found.</CommandEmpty>
                <CommandGroup>
                  {tribes.map((tribe) => (
                    <CommandItem
                      key={tribe.id}
                      value={tribe.name}
                      onSelect={() => {
                        onValueChange?.(tribe.id === value ? '' : tribe.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === tribe.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{tribe.name}</span>
                        {tribe.description && (
                          <span className="text-xs text-muted-foreground">
                            {tribe.description}
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

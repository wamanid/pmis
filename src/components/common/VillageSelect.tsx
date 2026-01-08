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
import { fetchVillages } from '../../services/system_administration/villageService';
import type { Village } from '../../models/system_administration';

export interface VillageSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  parishId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function VillageSelect({
  value,
  onValueChange,
  parishId,
  placeholder = 'Select village...',
  disabled = false,
  className,
}: VillageSelectProps) {
  const [open, setOpen] = useState(false);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch villages when component mounts, search query, or parishId changes
  useEffect(() => {
    const loadVillages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchVillages({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
          parish: parishId,
        });
        setVillages(response.results);
      } catch (err: any) {
        console.error('Failed to load villages:', err);
        setError(err.message || 'Failed to load villages');
      } finally {
        setLoading(false);
      }
    };

    loadVillages();
  }, [searchQuery, parishId]);

  // Find selected village
  const selectedVillage = villages.find((village) => village.id === value);

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
          {selectedVillage ? selectedVillage.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search villages..."
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
                <CommandEmpty>No village found.</CommandEmpty>
                <CommandGroup>
                  {villages.map((village) => (
                    <CommandItem
                      key={village.id}
                      value={village.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === village.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{village.name}</span>
                        {village.parish_name && (
                          <span className="text-xs text-muted-foreground">
                            Parish: {village.parish_name}
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

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
import { fetchMouths } from '../../services/system_administration/mouthService';
import type { Mouth } from '../../models/system_administration/mouth';

export interface MouthSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MouthSelect({
  value,
  onValueChange,
  placeholder = 'Select mouth type...',
  disabled = false,
  className,
}: MouthSelectProps) {
  const [open, setOpen] = useState(false);
  const [mouths, setMouths] = useState<Mouth[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMouths = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchMouths({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setMouths(response.results);
      } catch (err: any) {
        console.error('Failed to load mouths:', err);
        setError(err.message || 'Failed to load mouths');
      } finally {
        setLoading(false);
      }
    };

    loadMouths();
  }, [searchQuery]);

  const selectedMouth = mouths.find((mouth) => mouth.id === value);

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
          {selectedMouth ? selectedMouth.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search mouths..."
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
                <CommandEmpty>No mouth type found.</CommandEmpty>
                <CommandGroup>
                  {mouths.map((mouth) => (
                    <CommandItem
                      key={mouth.id}
                      value={mouth.name}
                      onSelect={() => {
                        onValueChange?.(mouth.id === value ? '' : mouth.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === mouth.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{mouth.name}</span>
                        {mouth.description && (
                          <span className="text-xs text-muted-foreground">
                            {mouth.description}
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

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
import { fetchHairs } from '../../services/system_administration/hairService';
import type { Hair } from '../../models/system_administration/hair';

export interface HairSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function HairSelect({
  value,
  onValueChange,
  placeholder = 'Select hair type...',
  disabled = false,
  className,
}: HairSelectProps) {
  const [open, setOpen] = useState(false);
  const [hairs, setHairs] = useState<Hair[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHairs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchHairs({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setHairs(response.results);
      } catch (err: any) {
        console.error('Failed to load hairs:', err);
        setError(err.message || 'Failed to load hairs');
      } finally {
        setLoading(false);
      }
    };

    loadHairs();
  }, [searchQuery]);

  const selectedHair = hairs.find((hair) => hair.id === value);

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
          {selectedHair ? selectedHair.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search hairs..."
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
                <CommandEmpty>No hair type found.</CommandEmpty>
                <CommandGroup>
                  {hairs.map((hair) => (
                    <CommandItem
                      key={hair.id}
                      value={hair.name}
                      onSelect={() => {
                        onValueChange?.(hair.id === value ? '' : hair.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === hair.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{hair.name}</span>
                        {hair.description && (
                          <span className="text-xs text-muted-foreground">
                            {hair.description}
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

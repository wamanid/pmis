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
import { fetchLips } from '../../services/system_administration/lipService';
import type { Lip } from '../../models/system_administration/lip';

export interface LipSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function LipSelect({
  value,
  onValueChange,
  placeholder = 'Select lip type...',
  disabled = false,
  className,
}: LipSelectProps) {
  const [open, setOpen] = useState(false);
  const [lips, setLips] = useState<Lip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLips = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchLips({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setLips(response.results);
      } catch (err: any) {
        console.error('Failed to load lips:', err);
        setError(err.message || 'Failed to load lips');
      } finally {
        setLoading(false);
      }
    };

    loadLips();
  }, [searchQuery]);

  const selectedLip = lips.find((lip) => lip.id === value);

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
          {selectedLip ? selectedLip.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search lips..."
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
                <CommandEmpty>No lip type found.</CommandEmpty>
                <CommandGroup>
                  {lips.map((lip) => (
                    <CommandItem
                      key={lip.id}
                      value={lip.name}
                      onSelect={() => {
                        onValueChange?.(lip.id === value ? '' : lip.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === lip.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{lip.name}</span>
                        {lip.description && (
                          <span className="text-xs text-muted-foreground">
                            {lip.description}
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

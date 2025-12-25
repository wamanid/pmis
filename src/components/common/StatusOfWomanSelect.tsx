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
import { fetchStatusOfWomen } from '../../services/system_administration/statusOfWomanService';
import type { StatusOfWoman } from '../../models/system_administration';

export interface StatusOfWomanSelectProps {
  value?: string;
  onValueChange?: (value: string, statusOfWoman?: StatusOfWoman) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StatusOfWomanSelect({
  value,
  onValueChange,
  placeholder = 'Select status of woman...',
  disabled = false,
  className,
}: StatusOfWomanSelectProps) {
  const [open, setOpen] = useState(false);
  const [statusOfWomen, setStatusOfWomen] = useState<StatusOfWoman[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatusOfWomen = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchStatusOfWomen({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setStatusOfWomen(response.results);
      } catch (err: any) {
        console.error('Failed to load status of women:', err);
        setError(err.message || 'Failed to load status of women');
      } finally {
        setLoading(false);
      }
    };

    loadStatusOfWomen();
  }, [searchQuery]);

  const selectedStatus = statusOfWomen.find((status) => status.id === value);

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
          {selectedStatus ? selectedStatus.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search status of women..."
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
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {statusOfWomen.map((status) => (
                    <CommandItem
                      key={status.id}
                      value={status.name}
                      onSelect={() => {
                        const newValue = status.id === value ? '' : status.id;
                        onValueChange?.(newValue, newValue ? status : undefined);
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

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
import { fetchArmedForceStatuses } from '../../services/system_administration/armedForceStatusService';
import type { ArmedForceStatus } from '../../models/system_administration/armedForceStatus';

export interface ArmedForceStatusSelectProps {
  value?: string;
  onValueChange?: (value: string, armedForceStatus?: ArmedForceStatus) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ArmedForceStatusSelect({
  value,
  onValueChange,
  placeholder = 'Select armed force status...',
  disabled = false,
  className,
}: ArmedForceStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const [armedForceStatuses, setArmedForceStatuses] = useState<ArmedForceStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArmedForceStatuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchArmedForceStatuses({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setArmedForceStatuses(response.results);
      } catch (err: any) {
        console.error('Failed to load armed force statuses:', err);
        setError(err.message || 'Failed to load armed force statuses');
      } finally {
        setLoading(false);
      }
    };

    loadArmedForceStatuses();
  }, [searchQuery]);

  const selectedArmedForceStatus = armedForceStatuses.find((afs) => afs.id === value);

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
          {selectedArmedForceStatus ? selectedArmedForceStatus.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search armed force statuses..."
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
                <CommandEmpty>No armed force status found.</CommandEmpty>
                <CommandGroup>
                  {armedForceStatuses.map((armedForceStatus) => (
                    <CommandItem
                      key={armedForceStatus.id}
                      value={armedForceStatus.name}
                      onSelect={() => {
                        const newValue = armedForceStatus.id === value ? '' : armedForceStatus.id;
                        onValueChange?.(
                          newValue,
                          newValue ? armedForceStatus : undefined
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === armedForceStatus.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{armedForceStatus.name}</span>
                        {armedForceStatus.description && (
                          <span className="text-xs text-muted-foreground">
                            {armedForceStatus.description}
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

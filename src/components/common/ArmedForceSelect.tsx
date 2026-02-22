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
import { fetchArmedForces } from '../../services/system_administration/armedForceService';
import type { ArmedForce } from '../../models/system_administration/armedForce';

export interface ArmedForceSelectProps {
  value?: string;
  onValueChange?: (value: string, armedForce?: ArmedForce) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ArmedForceSelect({
  value,
  onValueChange,
  placeholder = 'Select armed force...',
  disabled = false,
  className,
}: ArmedForceSelectProps) {
  const [open, setOpen] = useState(false);
  const [armedForces, setArmedForces] = useState<ArmedForce[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArmedForces = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchArmedForces({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setArmedForces(response.results);
      } catch (err: any) {
        console.error('Failed to load armed forces:', err);
        setError(err.message || 'Failed to load armed forces');
      } finally {
        setLoading(false);
      }
    };

    loadArmedForces();
  }, [searchQuery]);

  const selectedArmedForce = armedForces.find((af) => af.id === value);

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
          {selectedArmedForce ? selectedArmedForce.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search armed forces..."
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
                <CommandEmpty>No armed force found.</CommandEmpty>
                <CommandGroup>
                  {armedForces.map((armedForce) => (
                    <CommandItem
                      key={armedForce.id}
                      value={armedForce.name}
                      onSelect={() => {
                        const newValue = armedForce.id === value ? '' : armedForce.id;
                        onValueChange?.(
                          newValue,
                          newValue ? armedForce : undefined
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === armedForce.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{armedForce.name}</span>
                        {armedForce.description && (
                          <span className="text-xs text-muted-foreground">
                            {armedForce.description}
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

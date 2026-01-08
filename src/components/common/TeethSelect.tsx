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
import { fetchTeeth } from '../../services/system_administration/teethService';
import type { Teeth } from '../../models/system_administration/teeth';

export interface TeethSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TeethSelect({
  value,
  onValueChange,
  placeholder = 'Select teeth type...',
  disabled = false,
  className,
}: TeethSelectProps) {
  const [open, setOpen] = useState(false);
  const [teethList, setTeethList] = useState<Teeth[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeeth = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchTeeth({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setTeethList(response.results);
      } catch (err: any) {
        console.error('Failed to load teeth:', err);
        setError(err.message || 'Failed to load teeth');
      } finally {
        setLoading(false);
      }
    };

    loadTeeth();
  }, [searchQuery]);

  const selectedTeeth = teethList.find((teeth) => teeth.id === value);

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
          {selectedTeeth ? selectedTeeth.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search teeth..."
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
                <CommandEmpty>No teeth type found.</CommandEmpty>
                <CommandGroup>
                  {teethList.map((teeth) => (
                    <CommandItem
                      key={teeth.id}
                      value={teeth.name}
                      onSelect={() => {
                        onValueChange?.(teeth.id === value ? '' : teeth.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === teeth.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{teeth.name}</span>
                        {teeth.description && (
                          <span className="text-xs text-muted-foreground">
                            {teeth.description}
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

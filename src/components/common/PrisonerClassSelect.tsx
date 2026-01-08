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
import { fetchPrisonerClasses } from '../../services/system_administration/prisonerClassService';
import type { PrisonerClass } from '../../models/system_administration/prisonerClass';

export interface PrisonerClassSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PrisonerClassSelect({
  value,
  onValueChange,
  placeholder = 'Select prisoner class...',
  disabled = false,
  className,
}: PrisonerClassSelectProps) {
  const [open, setOpen] = useState(false);
  const [prisonerClasses, setPrisonerClasses] = useState<PrisonerClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrisonerClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchPrisonerClasses({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setPrisonerClasses(response.results);
      } catch (err) {
        console.error('Error loading prisoner classes:', err);
        setError('Failed to load prisoner classes');
        setPrisonerClasses([]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadPrisonerClasses();
    }
  }, [open, searchQuery]);

  const selectedPrisonerClass = prisonerClasses.find((pc) => pc.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {selectedPrisonerClass ? selectedPrisonerClass.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search prisoner class..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Loading...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-500">{error}</div>
            ) : (
              <>
                <CommandEmpty>No prisoner class found.</CommandEmpty>
                <CommandGroup>
                  {prisonerClasses.map((prisonerClass) => (
                    <CommandItem
                      key={prisonerClass.id}
                      value={prisonerClass.name}
                      onSelect={() => {
                        onValueChange?.(prisonerClass.id === value ? '' : prisonerClass.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === prisonerClass.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{prisonerClass.name}</span>
                        {prisonerClass.description && (
                          <span className="text-xs text-muted-foreground">
                            {prisonerClass.description}
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

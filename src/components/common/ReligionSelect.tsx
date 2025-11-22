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
import { fetchReligions } from '../../services/system_administration/religionService';
import type { Religion } from '../../models/system_administration/religion';

export interface ReligionSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ReligionSelect({
  value,
  onValueChange,
  placeholder = 'Select religion...',
  disabled = false,
  className,
}: ReligionSelectProps) {
  const [open, setOpen] = useState(false);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch religions when component mounts or search query changes
  useEffect(() => {
    const loadReligions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchReligions({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setReligions(response.results);
      } catch (err: any) {
        console.error('Failed to load religions:', err);
        setError(err.message || 'Failed to load religions');
      } finally {
        setLoading(false);
      }
    };

    loadReligions();
  }, [searchQuery]);

  // Find selected religion
  const selectedReligion = religions.find((religion) => religion.id === value);

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
          {selectedReligion ? selectedReligion.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search religions..."
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
                <CommandEmpty>No religion found.</CommandEmpty>
                <CommandGroup>
                  {religions.map((religion) => (
                    <CommandItem
                      key={religion.id}
                      value={religion.name}
                      onSelect={() => {
                        onValueChange?.(religion.id === value ? '' : religion.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === religion.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{religion.name}</span>
                        {religion.description && (
                          <span className="text-xs text-muted-foreground">
                            {religion.description}
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

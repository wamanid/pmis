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
import { fetchEducationLevels } from '../../services/system_administration';
import type { EducationLevel } from '../../models/system_administration';

export interface EducationLevelSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function EducationLevelSelect({
  value,
  onValueChange,
  placeholder = 'Select education level...',
  disabled = false,
  className,
}: EducationLevelSelectProps) {
  const [open, setOpen] = useState(false);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch education levels when component mounts or search query changes
  useEffect(() => {
    const loadEducationLevels = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchEducationLevels({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setEducationLevels(response.results);
      } catch (err: any) {
        console.error('Failed to load education levels:', err);
        setError(err.message || 'Failed to load education levels');
      } finally {
        setLoading(false);
      }
    };

    loadEducationLevels();
  }, [searchQuery]);

  // Find selected education level
  const selectedEducationLevel = educationLevels.find((level) => level.id === value);

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
          {selectedEducationLevel ? selectedEducationLevel.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search education levels..."
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
                <CommandEmpty>No education level found.</CommandEmpty>
                <CommandGroup>
                  {educationLevels.map((level) => (
                    <CommandItem
                      key={level.id}
                      value={level.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === level.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{level.name}</span>
                        {level.description && (
                          <span className="text-xs text-muted-foreground">
                            {level.description}
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

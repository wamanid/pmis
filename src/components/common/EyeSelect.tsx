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
import { fetchEyes } from '../../services/system_administration/eyeService';
import type { Eye } from '../../models/system_administration/eye';

export interface EyeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function EyeSelect({
  value,
  onValueChange,
  placeholder = 'Select eye type...',
  disabled = false,
  className,
}: EyeSelectProps) {
  const [open, setOpen] = useState(false);
  const [eyes, setEyes] = useState<Eye[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEyes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchEyes({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setEyes(response.results);
      } catch (err: any) {
        console.error('Failed to load eyes:', err);
        setError(err.message || 'Failed to load eyes');
      } finally {
        setLoading(false);
      }
    };

    loadEyes();
  }, [searchQuery]);

  const selectedEye = eyes.find((eye) => eye.id === value);

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
          {selectedEye ? selectedEye.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search eyes..."
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
                <CommandEmpty>No eye type found.</CommandEmpty>
                <CommandGroup>
                  {eyes.map((eye) => (
                    <CommandItem
                      key={eye.id}
                      value={eye.name}
                      onSelect={() => {
                        onValueChange?.(eye.id === value ? '' : eye.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === eye.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{eye.name}</span>
                        {eye.description && (
                          <span className="text-xs text-muted-foreground">
                            {eye.description}
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

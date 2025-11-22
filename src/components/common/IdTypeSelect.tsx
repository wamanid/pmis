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
import { fetchIdTypes } from '../../services/system_administration/idTypeService';
import type { IdType } from '../../models/system_administration/idType';

export interface IdTypeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function IdTypeSelect({
  value,
  onValueChange,
  placeholder = 'Select ID type...',
  disabled = false,
  className,
}: IdTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [idTypes, setIdTypes] = useState<IdType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch ID types when component mounts or search query changes
  useEffect(() => {
    const loadIdTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchIdTypes({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setIdTypes(response.results);
      } catch (err: any) {
        console.error('Failed to load ID types:', err);
        setError(err.message || 'Failed to load ID types');
      } finally {
        setLoading(false);
      }
    };

    loadIdTypes();
  }, [searchQuery]);

  // Find selected ID type
  const selectedIdType = idTypes.find((idType) => idType.id === value);

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
          {selectedIdType ? selectedIdType.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search ID types..."
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
                <CommandEmpty>No ID type found.</CommandEmpty>
                <CommandGroup>
                  {idTypes.map((idType) => (
                    <CommandItem
                      key={idType.id}
                      value={idType.name}
                      onSelect={() => {
                        onValueChange?.(idType.id === value ? '' : idType.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === idType.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{idType.name}</span>
                        {idType.description && (
                          <span className="text-xs text-muted-foreground">
                            {idType.description}
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

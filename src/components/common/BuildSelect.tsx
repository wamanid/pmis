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
import { fetchBuilds } from '../../services/system_administration/buildService';
import type { Build } from '../../models/system_administration/build';

export interface BuildSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function BuildSelect({
  value,
  onValueChange,
  placeholder = 'Select build...',
  disabled = false,
  className,
}: BuildSelectProps) {
  const [open, setOpen] = useState(false);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBuilds = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchBuilds({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setBuilds(response.results);
      } catch (err: any) {
        console.error('Failed to load builds:', err);
        setError(err.message || 'Failed to load builds');
      } finally {
        setLoading(false);
      }
    };

    loadBuilds();
  }, [searchQuery]);

  const selectedBuild = builds.find((build) => build.id === value);

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
          {selectedBuild ? selectedBuild.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search builds..."
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
                <CommandEmpty>No build found.</CommandEmpty>
                <CommandGroup>
                  {builds.map((build) => (
                    <CommandItem
                      key={build.id}
                      value={build.name}
                      onSelect={() => {
                        onValueChange?.(build.id === value ? '' : build.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === build.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{build.name}</span>
                        {build.description && (
                          <span className="text-xs text-muted-foreground">
                            {build.description}
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

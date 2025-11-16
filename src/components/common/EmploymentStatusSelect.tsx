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
import { fetchEmploymentStatuses } from '../../services/system_administration';
import type { EmploymentStatus } from '../../models/system_administration';

export interface EmploymentStatusSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function EmploymentStatusSelect({
  value,
  onValueChange,
  placeholder = 'Select employment status...',
  disabled = false,
  className,
}: EmploymentStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const [employmentStatuses, setEmploymentStatuses] = useState<EmploymentStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch employment statuses when component mounts or search query changes
  useEffect(() => {
    const loadEmploymentStatuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchEmploymentStatuses({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setEmploymentStatuses(response.results);
      } catch (err: any) {
        console.error('Failed to load employment statuses:', err);
        setError(err.message || 'Failed to load employment statuses');
      } finally {
        setLoading(false);
      }
    };

    loadEmploymentStatuses();
  }, [searchQuery]);

  // Find selected employment status
  const selectedEmploymentStatus = employmentStatuses.find((status) => status.id === value);

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
          {selectedEmploymentStatus ? selectedEmploymentStatus.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search employment statuses..."
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
                <CommandEmpty>No employment status found.</CommandEmpty>
                <CommandGroup>
                  {employmentStatuses.map((status) => (
                    <CommandItem
                      key={status.id}
                      value={status.name}
                      onSelect={() => {
                        onValueChange?.(status.id === value ? '' : status.id);
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

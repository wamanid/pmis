import { useEffect, useState } from 'react';
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
import { fetchRelationships } from '../../services/system_administration/relationshipService';
import type { Relationship } from '../../models/system_administration';

export interface RelationshipSelectProps {
  value?: string;
  onValueChange?: (value: string, relationship?: Relationship) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RelationshipSelect({
  value,
  onValueChange,
  placeholder = 'Select relationship...',
  disabled = false,
  className,
}: RelationshipSelectProps) {
  const [open, setOpen] = useState(false);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRelationships = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchRelationships({
          search: searchQuery || undefined,
          ordering: 'name',
          is_active: true,
        });
        setRelationships(response.results);
      } catch (err: any) {
        console.error('Failed to load relationships:', err);
        setError(err.message || 'Failed to load relationships');
      } finally {
        setLoading(false);
      }
    };

    loadRelationships();
  }, [searchQuery]);

  const selectedRelationship = relationships.find((r) => r.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', !value && 'text-muted-foreground', className)}
        >
          {selectedRelationship ? selectedRelationship.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search relationships..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-red-600">{error}</div>
            ) : (
              <>
                <CommandEmpty>No relationship found.</CommandEmpty>
                <CommandGroup>
                  {relationships.map((relationship) => (
                    <CommandItem
                      key={relationship.id}
                      value={relationship.name}
                      onSelect={() => {
                        const newValue = relationship.id === value ? '' : relationship.id;
                        onValueChange?.(
                          newValue,
                          newValue ? relationship : undefined
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === relationship.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{relationship.name}</span>
                        {relationship.description && (
                          <span className="text-xs text-muted-foreground">
                            {relationship.description}
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

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
import { fetchPrisonerCategories } from '../../services/system_administration';
import type { PrisonerCategory } from '../../models/system_administration';

export interface PrisonerCategorySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PrisonerCategorySelect({
  value,
  onValueChange,
  placeholder = 'Select prisoner category...',
  disabled = false,
  className,
}: PrisonerCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<PrisonerCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch prisoner categories when component mounts or search query changes
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchPrisonerCategories({
          search: searchQuery || undefined,
          ordering: 'name',
        });
        setCategories(response.results);
      } catch (err: any) {
        console.error('Failed to load prisoner categories:', err);
        setError(err.message || 'Failed to load prisoner categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [searchQuery]);

  // Find selected category
  const selectedCategory = categories.find((category) => category.id === value);

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
          {selectedCategory ? selectedCategory.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search prisoner categories..."
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
                <CommandEmpty>No prisoner category found.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={(currentValue: string) => {
                        onValueChange?.(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === category.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{category.name}</span>
                        {category.description && (
                          <span className="text-xs text-muted-foreground">
                            {category.description}
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

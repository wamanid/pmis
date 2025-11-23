import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { getStaffProfiles } from '../../services/auth/staffProfileService';
import type { StaffProfile } from '../../models/auth/staffProfile';

interface StaffSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  organizationFilter?: string;
  statusFilter?: 'pending' | 'active' | 'inactive' | 'suspended';
  availableOnly?: boolean;
}

export function StaffSelect({
  value,
  onValueChange,
  placeholder = 'Select staff...',
  disabled = false,
  className,
  organizationFilter,
  statusFilter,
  availableOnly,
}: StaffSelectProps) {
  const [open, setOpen] = useState(false);
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch staff profiles
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getStaffProfiles({
        search: debouncedSearch || undefined,
        organization: organizationFilter,
        status: statusFilter,
        is_available: availableOnly,
        page_size: 50,
      });
      setStaffList(response.results);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, organizationFilter, statusFilter, availableOnly]);

  // Fetch staff when filters change or dropdown opens
  useEffect(() => {
    if (open) {
      fetchStaff();
    }
  }, [open, fetchStaff]);

  // Get selected staff display name
  const selectedStaff = staffList.find((staff) => staff.id === value);
  const displayValue = selectedStaff
    ? `${selectedStaff.staff_id} - ${selectedStaff.user_email}`
    : placeholder;

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
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by staff ID or email..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading staff...
                </span>
              </div>
            ) : (
              'No staff found.'
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {loading && staffList.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              staffList.map((staff) => (
                <CommandItem
                  key={staff.id}
                  value={staff.id}
                  onSelect={(currentValue: string) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === staff.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{staff.staff_id}</span>
                      {staff.is_available && (
                        <span className="h-2 w-2 rounded-full bg-green-500" title="Available" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {staff.user_email}
                      {staff.organization_name && ` • ${staff.organization_name}`}
                    </span>
                  </div>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default StaffSelect;

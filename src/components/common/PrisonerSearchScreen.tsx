import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  Search, 
  User, 
  ChevronsUpDown,
  Check,
  UserCircle,
  Calendar,
  CreditCard,
  MapPin,
  Users
} from 'lucide-react';
import { cn } from '../ui/utils';
import { getPrisoners } from '../../services/admission';
import { Prisoner, PrisonerFilters } from '../../models/admission';

interface PrisonerSearchScreenProps {
  value?: string; // Selected prisoner ID
  onChange?: (prisonerId: string, prisoner: Prisoner | null) => void;
  onPrisonerSelect?: (prisoner: Prisoner) => void;
  disabled?: boolean;
  showTitle?: boolean;
  label?: string;
  required?: boolean;
}


export default function PrisonerSearchScreen({ 
  value,
  onChange,
  onPrisonerSelect,
  disabled = false,
  showTitle = true,
  label = 'Search Prisoner',
  required = false
}: PrisonerSearchScreenProps) {
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string>(value || '');
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load prisoner data from API with debounce
  useEffect(() => {
    const loadPrisoners = async () => {
      setIsLoading(true);
      try {
        const filters: PrisonerFilters = {
          is_active: true,
          ordering: 'full_name',
        };
        
        if (searchQuery) {
          filters.search = searchQuery;
        }
        
        const response = await getPrisoners(filters);
        setPrisoners(response.results);
      } catch (error) {
        console.error('Error fetching prisoners:', error);
        toast.error('Failed to load prisoners');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      loadPrisoners();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update selected prisoner when value changes
  useEffect(() => {
    if (value) {
      const prisoner = prisoners.find(p => p.id === value);
      setSelectedPrisonerId(value);
      setSelectedPrisoner(prisoner || null);
    } else {
      setSelectedPrisonerId('');
      setSelectedPrisoner(null);
    }
  }, [value, prisoners]);

  // Handle prisoner selection
  const handleSelectPrisoner = (prisoner: Prisoner) => {
    setSelectedPrisonerId(prisoner.id);
    setSelectedPrisoner(prisoner);
    setOpenDropdown(false);
    
    if (onChange) {
      onChange(prisoner.id, prisoner);
    }
    
    if (onPrisonerSelect) {
      onPrisonerSelect(prisoner);
    }
    
    toast.success(`Selected prisoner: ${prisoner.full_name}`);
  };

  // Clear selection
  const handleClear = () => {
    setSelectedPrisonerId('');
    setSelectedPrisoner(null);
    
    if (onChange) {
      onChange('', null);
    }
    
    toast.info('Prisoner selection cleared');
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {showTitle && (
        <div className="flex items-center gap-2 text-lg" style={{ color: '#650000' }}>
          <Search className="h-5 w-5" />
          <h2>Prisoner Search</h2>
        </div>
      )}

      {/* Search Dropdown */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="prisoner-search">
              {label} {required && <span className="text-red-600">*</span>}
            </Label>
            <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDropdown}
                  className="w-full justify-between"
                  type="button"
                  disabled={disabled}
                  style={{ 
                    borderColor: selectedPrisoner ? '#650000' : undefined,
                    borderWidth: selectedPrisoner ? '2px' : '1px'
                  }}
                >
                  {selectedPrisoner ? (
                    <div className="flex items-center gap-2 flex-1 text-left text-sm">
                      <UserCircle className="h-4 w-4" style={{ color: '#650000' }} />
                      <div className="flex flex-col">
                        <span>{selectedPrisoner.full_name}</span>
                        <span className="text-xs text-gray-500">
                          {selectedPrisoner.prisoner_number_value} | {selectedPrisoner.prisoner_personal_number_value}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Search by prisoner number, name, personal number, or ID number...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Search prisoners..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisoners.map((prisoner) => (
                            <CommandItem
                              key={prisoner.id}
                              value={prisoner.id}
                              onSelect={() => handleSelectPrisoner(prisoner)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPrisonerId === prisoner.id ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: '#650000' }}
                              />
                              <div className="flex flex-col flex-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{prisoner.full_name}</span>
                                  {prisoner.is_active && (
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{ 
                                        borderColor: '#650000',
                                        color: '#650000'
                                      }}
                                    >
                                      Active
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                  <span>Number: {prisoner.prisoner_number_value}</span>
                                  <span>Personal: {prisoner.prisoner_personal_number_value}</span>
                                  {prisoner.current_station_name && (
                                    <span>Station: {prisoner.current_station_name}</span>
                                  )}
                                </div>
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
            
            {selectedPrisoner && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={disabled}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prisoner Details Display */}
      {selectedPrisoner && (
        <Card>
          <CardHeader style={{ borderBottom: '2px solid #650000' }}>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#650000' }}>
              <User className="h-5 w-5" />
              Prisoner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Prisoner Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CreditCard className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Prisoner Number</span>
                </div>
                <p className="font-medium text-sm">{selectedPrisoner.prisoner_number_value}</p>
              </div>

              {/* Personal Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CreditCard className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Personal Number</span>
                </div>
                <p className="font-medium text-sm">{selectedPrisoner.prisoner_personal_number_value}</p>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <UserCircle className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Full Name</span>
                </div>
                <p className="font-medium text-sm">{selectedPrisoner.full_name}</p>
              </div>

              {/* First Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <UserCircle className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>First Name</span>
                </div>
                <p className="font-medium text-sm">{selectedPrisoner.first_name}</p>
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <UserCircle className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Last Name</span>
                </div>
                <p className="font-medium text-sm">{selectedPrisoner.last_name}</p>
              </div>

              {/* Current Station */}
              {selectedPrisoner.current_station_name && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                    <span>Current Station</span>
                  </div>
                  <p className="font-medium text-sm">{selectedPrisoner.current_station_name}</p>
                </div>
              )}

              {/* Status */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Status</span>
                </div>
                <Badge className={selectedPrisoner.is_active ? "bg-green-600 text-xs" : "bg-gray-600 text-xs"}>
                  {selectedPrisoner.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Created Date */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Created Date</span>
                </div>
                <p className="font-medium text-sm">{formatDate(selectedPrisoner.created_datetime)}</p>
              </div>

              {/* Created By */}
              {selectedPrisoner.created_by_details && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <UserCircle className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                    <span>Created By</span>
                  </div>
                  <p className="font-medium text-sm">
                    {selectedPrisoner.created_by_details.first_name} {selectedPrisoner.created_by_details.last_name}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

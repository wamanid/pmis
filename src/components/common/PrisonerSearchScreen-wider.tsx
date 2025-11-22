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
  Users,
  Church
} from 'lucide-react';
import { cn } from '../ui/utils';
import { getPrisoners, getPrisonerBiodata } from '../../services/admission';
import {
  Prisoner,
  PrisonerFilters,
  PrisonerBiodata,
  PrisonerBiodataFilters,
} from '../../models/admission';
import { useFilterRefresh } from '../../hooks/useFilterRefresh';

interface PrisonerSearchScreenProps {
  value?: string; // Selected prisoner ID
  onChange?: (prisonerId: string, prisoner: Prisoner | null) => void;
  onPrisonerSelect?: (prisoner: Prisoner) => void;
  onPrisonerBiodataLoaded?: (biodata: PrisonerBiodata | null) => void;
  disabled?: boolean;
  showTitle?: boolean;
  label?: string;
  required?: boolean;
}

export default function PrisonerSearchScreenWider({ 
  value,
  onChange,
  onPrisonerSelect,
  onPrisonerBiodataLoaded,
  disabled = false,
  showTitle = true,
  label = 'Search Prisoner',
  required = false
}: PrisonerSearchScreenProps) {
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string>(value || '');
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [selectedPrisonerBiodata, setSelectedPrisonerBiodata] = useState<PrisonerBiodata | null>(null);
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
      setSelectedPrisonerBiodata(null);
    } else {
      setSelectedPrisonerId('');
      setSelectedPrisoner(null);
      setSelectedPrisonerBiodata(null);
    }
  }, [value, prisoners]);

  // Handle prisoner selection
  const handleSelectPrisoner = (prisoner: Prisoner) => {
    setSelectedPrisonerId(prisoner.id);
    setSelectedPrisoner(prisoner);
    setOpenDropdown(false);
    setSelectedPrisonerBiodata(null);
    
    if (onChange) {
      onChange(prisoner.id, prisoner);
    }
    
    if (onPrisonerSelect) {
      onPrisonerSelect(prisoner);
    }

    // Fetch prisoner biodata using list endpoint with prisoner filter
    const loadBiodata = async () => {
      try {
        const filters: PrisonerBiodataFilters = {
          prisoner: prisoner.id,
          is_active: true,
        };
        const response = await getPrisonerBiodata(filters);
        if (!response.results.length) {
          setSelectedPrisonerBiodata(null);
          onPrisonerBiodataLoaded?.(null);
          toast.info('No biodata found for this prisoner');
          return;
        }

        const biodata = response.results[0];
        setSelectedPrisonerBiodata(biodata);
        onPrisonerBiodataLoaded?.(biodata);
      } catch (error) {
        console.error('Error fetching prisoner biodata:', error);
        toast.error('Failed to load prisoner biodata');
      }
    };

    loadBiodata();
    
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

  // Calculate age
  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  return (
    <div className="space-y-4 w-full mx-auto">
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
                <Command>
                  <CommandInput
                    placeholder="Search prisoners..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No prisoner found.</CommandEmpty>
                    <CommandGroup>
                      {prisoners.map((prisoner) => (
                        <CommandItem
                          key={prisoner.id}
                          value={`${prisoner.prisoner_number_value} ${prisoner.full_name} ${prisoner.prisoner_personal_number_value}`}
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
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>Prisoner: {prisoner.prisoner_number_value}</span>
                              <span>Personal: {prisoner.prisoner_personal_number_value}</span>
                              {prisoner.current_station_name && (
                                <span>Station: {prisoner.current_station_name}</span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
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

      {/* Prisoner Details Display - 2 Rows × 5 Columns */}
      {selectedPrisoner && (
        <Card>
          <CardHeader style={{ borderBottom: '2px solid #650000' }}>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#650000' }}>
              <User className="h-5 w-5" />
              Prisoner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Row 1 - Column 1: Prisoner Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CreditCard className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Prisoner Number</span>
                </div>
                <p className="font-medium text-sm">{selectedPrisoner.prisoner_number_value}</p>
              </div>

              {/* Row 1 - Column 2: Personal Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CreditCard className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Personal Number</span>
                </div>
                <p className="font-medium text-sm">{selectedPrisoner.prisoner_personal_number_value}</p>
              </div>

              {/* Row 1 - Column 3: Prisoner Name */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <UserCircle className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Prisoner Name</span>
                </div>
                <p className="font-medium text-sm">{selectedPrisoner.full_name}</p>
              </div>

              {/* Row 1 - Column 4: Date of Birth */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Date of Birth</span>
                </div>
                <p className="font-medium text-sm">
                  {selectedPrisonerBiodata
                    ? formatDate(selectedPrisonerBiodata.date_of_birth)
                    : '-'}
                </p>
                {selectedPrisonerBiodata && (
                  <p className="text-xs text-gray-500">
                    Age: {calculateAge(selectedPrisonerBiodata.date_of_birth)}
                  </p>
                )}
              </div>

              {/* Row 1 - Column 5: ID Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CreditCard className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>ID Number</span>
                </div>
                <p className="font-medium text-sm">
                  {selectedPrisonerBiodata?.id_number || '-'}
                </p>
              </div>

              {/* Row 2 - Column 1: ID Type */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <CreditCard className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>ID Type</span>
                </div>
                <Badge className="text-xs" style={{ backgroundColor: '#650000' }}>
                  {selectedPrisonerBiodata?.id_type?.name || '-'}
                </Badge>
              </div>

              {/* Row 2 - Column 2: Gender */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Users className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Gender</span>
                </div>
                <p className="font-medium text-sm">
                  {selectedPrisonerBiodata?.sex_name || '-'}
                </p>
              </div>

              {/* Row 2 - Column 3: Tribe */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Tribe</span>
                </div>
                <p className="font-medium text-sm">
                  {selectedPrisonerBiodata?.tribe?.name || '-'}
                </p>
              </div>

              {/* Row 2 - Column 4: Religion */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Church className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Religion</span>
                </div>
                <p className="font-medium text-sm">
                  {selectedPrisonerBiodata?.religion?.name || '-'}
                </p>
              </div>

              {/* Row 2 - Column 5: Date of Admission */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="h-3.5 w-3.5" style={{ color: '#650000' }} />
                  <span>Date of Admission</span>
                </div>
                <p className="font-medium text-sm">
                  {selectedPrisonerBiodata
                    ? formatDate(selectedPrisonerBiodata.date_of_admission)
                    : '-'}
                </p>
              </div>
            </div>

            {/* Additional Info Row - Nationality and Status */}
            {(selectedPrisonerBiodata?.nationality_name || selectedPrisoner.is_active) && (
              <div className="mt-6 flex items-center gap-4">
                {selectedPrisonerBiodata?.nationality_name && (
                  <>
                    <span className="text-sm text-gray-600">Nationality:</span>
                    <Badge 
                      variant="outline"
                      className="text-xs"
                      style={{ 
                        borderColor: '#650000',
                        color: '#650000'
                      }}
                    >
                      {selectedPrisonerBiodata.nationality_name}
                    </Badge>
                  </>
                )}
                <>
                  <span className="text-sm text-gray-600 ml-4">Status:</span>
                  <Badge className={selectedPrisoner.is_active ? 'bg-green-600 text-xs' : 'bg-gray-600 text-xs'}>
                    {selectedPrisoner.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

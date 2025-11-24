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
  UserCheck, 
  ChevronsUpDown,
  Check,
  UserCircle,
  Calendar,
  CreditCard,
  Phone,
  Users,
  Heart
} from 'lucide-react';
import { cn } from '../ui/utils';

interface Visitor {
  id: string;
  visitor_names: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  relationship: string;
  phone_number: string;
  date_of_birth: string;
  id_number: string;
  id_type: string;
  gender: string;
  status: string;
  registration_date?: string;
  prisoner_name?: string;
}

interface VisitorSearchScreenProps {
  value?: string; // Selected visitor ID
  onChange?: (visitorId: string, visitor: Visitor | null) => void;
  onVisitorSelect?: (visitor: Visitor) => void;
  disabled?: boolean;
  showTitle?: boolean;
  label?: string;
  required?: boolean;
}

// Mock data for visitors
const mockVisitors: Visitor[] = [
  {
    id: 'vis1',
    visitor_names: 'Mary Jane Nabirye',
    first_name: 'Mary',
    middle_name: 'Jane',
    last_name: 'Nabirye',
    relationship: 'Wife',
    phone_number: '+256 700 123456',
    date_of_birth: '1992-06-15',
    id_number: 'CM92012345678N',
    id_type: 'National ID',
    gender: 'Female',
    status: 'Approved',
    registration_date: '2024-01-10',
    prisoner_name: 'John Doe Mukasa'
  },
  {
    id: 'vis2',
    visitor_names: 'James Paul Okello',
    first_name: 'James',
    middle_name: 'Paul',
    last_name: 'Okello',
    relationship: 'Brother',
    phone_number: '+256 701 234567',
    date_of_birth: '1988-03-22',
    id_number: 'CM88023456789N',
    id_type: 'National ID',
    gender: 'Male',
    status: 'Approved',
    registration_date: '2024-01-15',
    prisoner_name: 'Michael Peter Okello'
  },
  {
    id: 'vis3',
    visitor_names: 'Catherine Rose Namukasa',
    first_name: 'Catherine',
    middle_name: 'Rose',
    last_name: 'Namukasa',
    relationship: 'Mother',
    phone_number: '+256 702 345678',
    date_of_birth: '1965-09-10',
    id_number: 'CM65034567890N',
    id_type: 'National ID',
    gender: 'Female',
    status: 'Approved',
    registration_date: '2024-02-01',
    prisoner_name: 'Sarah Jane Nakato'
  },
  {
    id: 'vis4',
    visitor_names: 'Peter Mark Ssemakula',
    first_name: 'Peter',
    middle_name: 'Mark',
    last_name: 'Ssemakula',
    relationship: 'Lawyer',
    phone_number: '+256 703 456789',
    date_of_birth: '1980-11-30',
    id_number: 'CM80045678901N',
    id_type: 'National ID',
    gender: 'Male',
    status: 'Approved',
    registration_date: '2024-01-20',
    prisoner_name: 'David Emmanuel Musoke'
  },
  {
    id: 'vis5',
    visitor_names: 'Ruth Ann Achola',
    first_name: 'Ruth',
    middle_name: 'Ann',
    last_name: 'Achola',
    relationship: 'Sister',
    phone_number: '+256 704 567890',
    date_of_birth: '1990-07-18',
    id_number: 'CM90056789012N',
    id_type: 'National ID',
    gender: 'Female',
    status: 'Pending',
    registration_date: '2024-03-10',
    prisoner_name: 'Grace Mary Akello'
  },
  {
    id: 'vis6',
    visitor_names: 'Daniel John Mukasa',
    first_name: 'Daniel',
    middle_name: 'John',
    last_name: 'Mukasa',
    relationship: 'Father',
    phone_number: '+256 705 678901',
    date_of_birth: '1960-12-05',
    id_number: 'CM60067890123N',
    id_type: 'National ID',
    gender: 'Male',
    status: 'Approved',
    registration_date: '2024-02-15',
    prisoner_name: 'Robert James Tumwine'
  },
  {
    id: 'vis7',
    visitor_names: 'Florence Grace Nakimuli',
    first_name: 'Florence',
    middle_name: 'Grace',
    last_name: 'Nakimuli',
    relationship: 'Friend',
    phone_number: '+256 706 789012',
    date_of_birth: '1993-04-25',
    id_number: 'CM93078901234N',
    id_type: 'National ID',
    gender: 'Female',
    status: 'Rejected',
    registration_date: '2024-03-05',
    prisoner_name: 'Patricia Anne Nambi'
  },
  {
    id: 'vis8',
    visitor_names: 'Samuel Moses Waiswa',
    first_name: 'Samuel',
    middle_name: 'Moses',
    last_name: 'Waiswa',
    relationship: 'Cousin',
    phone_number: '+256 707 890123',
    date_of_birth: '1987-09-14',
    id_number: 'PP45678123',
    id_type: 'Passport',
    gender: 'Male',
    status: 'Approved',
    registration_date: '2024-02-20',
    prisoner_name: 'Andrew Simon Kaweesi'
  },
  {
    id: 'vis9',
    visitor_names: 'Agnes Hope Nantongo',
    first_name: 'Agnes',
    middle_name: 'Hope',
    last_name: 'Nantongo',
    relationship: 'Spouse',
    phone_number: '+256 708 901234',
    date_of_birth: '1991-02-28',
    id_number: 'CM91089012345N',
    id_type: 'National ID',
    gender: 'Female',
    status: 'Approved',
    registration_date: '2024-01-25',
    prisoner_name: 'Robert James Tumwine'
  },
  {
    id: 'vis10',
    visitor_names: 'Robert Charles Kibirige',
    first_name: 'Robert',
    middle_name: 'Charles',
    last_name: 'Kibirige',
    relationship: 'Uncle',
    phone_number: '+256 709 012345',
    date_of_birth: '1975-08-19',
    id_number: 'DL123987654',
    id_type: 'Driving Permit',
    gender: 'Male',
    status: 'Pending',
    registration_date: '2024-03-12',
    prisoner_name: 'Michael Peter Okello'
  }
];

export default function VisitorSearchScreen({ 
  value,
  onChange,
  onVisitorSelect,
  disabled = false,
  showTitle = true,
  label = 'Search Visitor',
  required = false
}: VisitorSearchScreenProps) {
  const [selectedVisitorId, setSelectedVisitorId] = useState<string>(value || '');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>(mockVisitors);
  const [isLoading, setIsLoading] = useState(false);

  // Load visitor data from API (currently using mock data)
  useEffect(() => {
    const fetchVisitors = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/visitors/');
        // const data = await response.json();
        // setVisitors(data.results || data);
        
        // Using mock data for now
        setVisitors(mockVisitors);
      } catch (error) {
        console.error('Error fetching visitors:', error);
        toast.error('Failed to load visitors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  // Update selected visitor when value changes
  useEffect(() => {
    if (value) {
      const visitor = visitors.find(v => v.id === value);
      setSelectedVisitorId(value);
      setSelectedVisitor(visitor || null);
    } else {
      setSelectedVisitorId('');
      setSelectedVisitor(null);
    }
  }, [value, visitors]);

  // Handle visitor selection
  const handleSelectVisitor = (visitor: Visitor) => {
    setSelectedVisitorId(visitor.id);
    setSelectedVisitor(visitor);
    setOpenDropdown(false);
    
    if (onChange) {
      onChange(visitor.id, visitor);
    }
    
    if (onVisitorSelect) {
      onVisitorSelect(visitor);
    }
    
    toast.success(`Selected visitor: ${visitor.visitor_names}`);
  };

  // Clear selection
  const handleClear = () => {
    setSelectedVisitorId('');
    setSelectedVisitor(null);
    
    if (onChange) {
      onChange('', null);
    }
    
    toast.info('Visitor selection cleared');
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

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-600">{status}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">{status}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{status}</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-600">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center gap-2" style={{ color: '#650000' }}>
          <Search className="h-6 w-6" />
          <h2>Visitor Search</h2>
        </div>
      )}

      {/* Search Dropdown */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="visitor-search">
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
                    borderColor: selectedVisitor ? '#650000' : undefined,
                    borderWidth: selectedVisitor ? '2px' : '1px'
                  }}
                >
                  {selectedVisitor ? (
                    <div className="flex items-center gap-2 flex-1 text-left">
                      <UserCheck className="h-4 w-4" style={{ color: '#650000' }} />
                      <div className="flex flex-col">
                        <span>{selectedVisitor.visitor_names}</span>
                        <span className="text-xs text-gray-500">
                          {selectedVisitor.phone_number} | {selectedVisitor.id_number}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Search by visitor name, phone number, or ID number...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <Command>
                  <CommandInput placeholder="Search visitors..." />
                  <CommandList>
                    <CommandEmpty>No visitor found.</CommandEmpty>
                    <CommandGroup>
                      {visitors.map((visitor) => (
                        <CommandItem
                          key={visitor.id}
                          value={`${visitor.visitor_names} ${visitor.phone_number} ${visitor.id_number}`}
                          onSelect={() => handleSelectVisitor(visitor)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedVisitorId === visitor.id ? "opacity-100" : "opacity-0"
                            )}
                            style={{ color: '#650000' }}
                          />
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-2">
                              <span>{visitor.visitor_names}</span>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                style={{ 
                                  borderColor: '#650000',
                                  color: '#650000'
                                }}
                              >
                                {visitor.relationship}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>Phone: {visitor.phone_number}</span>
                              <span>ID: {visitor.id_number}</span>
                              <span>Status: {visitor.status}</span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {selectedVisitor && (
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

      {/* Visitor Details Display */}
      {selectedVisitor && (
        <Card>
          <CardHeader style={{ borderBottom: '2px solid #650000' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <UserCheck className="h-5 w-5" />
              Visitor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Visitor Names */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCircle className="h-4 w-4" style={{ color: '#650000' }} />
                  <span>Visitor Names</span>
                </div>
                <p className="font-medium">{selectedVisitor.visitor_names}</p>
              </div>

              {/* Relationship */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Heart className="h-4 w-4" style={{ color: '#650000' }} />
                  <span>Relationship</span>
                </div>
                <Badge style={{ backgroundColor: '#650000' }}>
                  {selectedVisitor.relationship}
                </Badge>
              </div>

              {/* Visitor Phone Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" style={{ color: '#650000' }} />
                  <span>Phone Number</span>
                </div>
                <p className="font-medium">{selectedVisitor.phone_number}</p>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" style={{ color: '#650000' }} />
                  <span>Date of Birth</span>
                </div>
                <p className="font-medium">{formatDate(selectedVisitor.date_of_birth)}</p>
                <p className="text-xs text-gray-500">Age: {calculateAge(selectedVisitor.date_of_birth)}</p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* ID Number */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" style={{ color: '#650000' }} />
                  <span>ID Number</span>
                </div>
                <p className="font-medium">{selectedVisitor.id_number}</p>
              </div>

              {/* ID Type */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" style={{ color: '#650000' }} />
                  <span>ID Type</span>
                </div>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: '#650000',
                    color: '#650000'
                  }}
                >
                  {selectedVisitor.id_type}
                </Badge>
              </div>

              {/* Gender */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" style={{ color: '#650000' }} />
                  <span>Gender</span>
                </div>
                <p className="font-medium">{selectedVisitor.gender}</p>
              </div>

              {/* Visitor Status */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserCheck className="h-4 w-4" style={{ color: '#650000' }} />
                  <span>Visitor Status</span>
                </div>
                {getStatusBadge(selectedVisitor.status)}
              </div>
            </div>

            {/* Additional Info */}
            {selectedVisitor.prisoner_name && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border" style={{ borderColor: '#650000' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Visiting:</span>
                  <span className="font-medium">{selectedVisitor.prisoner_name}</span>
                </div>
                {selectedVisitor.registration_date && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600">Registered on:</span>
                    <span className="text-sm">{formatDate(selectedVisitor.registration_date)}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

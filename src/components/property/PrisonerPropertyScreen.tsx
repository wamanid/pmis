import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { 
  Search, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  ChevronLeft, 
  ChevronRight,
  Package,
  User,
  Tag,
  DollarSign,
  FileText,
  AlertCircle,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';

interface Property {
  id: string;
  prisoner_name: string;
  property_type_name: string;
  property_item_name: string;
  measurement_unit_name: string;
  property_bag_number: string;
  property_status_name: string;
  next_of_kin_name: string;
  visitor_name: string;
  quantity: string;
  amount: string;
  biometric_consent: boolean;
  note: string;
  destination: string;
  prisoner: string;
  property_type: string;
  property_item: string;
  measurement_unit: string;
  property_bag: string;
  next_of_kin: string;
  visitor: string;
  property_status: string;
}

interface PropertyType {
  id: string;
  name: string;
}

interface PropertyItem {
  id: string;
  name: string;
}

interface MeasurementUnit {
  id: string;
  name: string;
}

interface PropertyBag {
  id: string;
  bag_number: string;
}

interface PropertyStatus {
  id: string;
  name: string;
  description: string;
}

interface Prisoner {
  id: string;
  full_name: string;
  prisoner_number: string;
}

interface NextOfKin {
  id: string;
  full_name: string;
  relationship: string;
}

// Mock Data
const mockProperties: Property[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    property_type_name: 'Personal Items',
    property_item_name: 'Mobile Phone',
    measurement_unit_name: 'Piece',
    property_bag_number: 'BAG-001',
    property_status_name: 'Stored',
    next_of_kin_name: 'Jane Doe',
    visitor_name: '',
    quantity: '1',
    amount: '500000',
    biometric_consent: true,
    note: 'Samsung Galaxy S21',
    destination: 'Property Store',
    prisoner: 'pr1',
    property_type: 'pt1',
    property_item: 'pi1',
    measurement_unit: 'mu1',
    property_bag: 'pb1',
    next_of_kin: 'nok1',
    visitor: '',
    property_status: 'ps1'
  },
  {
    id: '2',
    prisoner_name: 'Michael Smith',
    property_type_name: 'Clothing',
    property_item_name: 'Leather Jacket',
    measurement_unit_name: 'Piece',
    property_bag_number: 'BAG-002',
    property_status_name: 'Released',
    next_of_kin_name: '',
    visitor_name: 'Sarah Smith',
    quantity: '1',
    amount: '300000',
    biometric_consent: true,
    note: 'Black leather jacket, size L',
    destination: 'Released to visitor',
    prisoner: 'pr2',
    property_type: 'pt2',
    property_item: 'pi2',
    measurement_unit: 'mu1',
    property_bag: 'pb2',
    next_of_kin: '',
    visitor: 'v1',
    property_status: 'ps2'
  },
  {
    id: '3',
    prisoner_name: 'David Wilson',
    property_type_name: 'Electronics',
    property_item_name: 'Laptop',
    measurement_unit_name: 'Piece',
    property_bag_number: 'BAG-003',
    property_status_name: 'Stored',
    next_of_kin_name: 'Mary Wilson',
    visitor_name: '',
    quantity: '1',
    amount: '1200000',
    biometric_consent: true,
    note: 'Dell Inspiron 15',
    destination: 'Property Store',
    prisoner: 'pr3',
    property_type: 'pt3',
    property_item: 'pi3',
    measurement_unit: 'mu1',
    property_bag: 'pb3',
    next_of_kin: 'nok2',
    visitor: '',
    property_status: 'ps1'
  },
  {
    id: '4',
    prisoner_name: 'James Taylor',
    property_type_name: 'Money',
    property_item_name: 'Cash',
    measurement_unit_name: 'UGX',
    property_bag_number: 'BAG-004',
    property_status_name: 'Stored',
    next_of_kin_name: '',
    visitor_name: '',
    quantity: '250000',
    amount: '250000',
    biometric_consent: false,
    note: 'Cash confiscated at admission',
    destination: 'Prison Safe',
    prisoner: 'pr4',
    property_type: 'pt4',
    property_item: 'pi4',
    measurement_unit: 'mu2',
    property_bag: 'pb4',
    next_of_kin: '',
    visitor: '',
    property_status: 'ps1'
  },
  {
    id: '5',
    prisoner_name: 'Robert Martinez',
    property_type_name: 'Documents',
    property_item_name: 'National ID',
    measurement_unit_name: 'Piece',
    property_bag_number: 'BAG-005',
    property_status_name: 'Damaged',
    next_of_kin_name: 'Anna Martinez',
    visitor_name: '',
    quantity: '1',
    amount: '0',
    biometric_consent: true,
    note: 'Slightly damaged',
    destination: 'Property Store',
    prisoner: 'pr5',
    property_type: 'pt5',
    property_item: 'pi5',
    measurement_unit: 'mu1',
    property_bag: 'pb5',
    next_of_kin: 'nok3',
    visitor: '',
    property_status: 'ps3'
  }
];

const mockPropertyTypes: PropertyType[] = [
  { id: 'pt1', name: 'Personal Items' },
  { id: 'pt2', name: 'Clothing' },
  { id: 'pt3', name: 'Electronics' },
  { id: 'pt4', name: 'Money' },
  { id: 'pt5', name: 'Documents' }
];

const mockPropertyItems: PropertyItem[] = [
  { id: 'pi1', name: 'Mobile Phone' },
  { id: 'pi2', name: 'Leather Jacket' },
  { id: 'pi3', name: 'Laptop' },
  { id: 'pi4', name: 'Cash' },
  { id: 'pi5', name: 'National ID' },
  { id: 'pi6', name: 'Watch' },
  { id: 'pi7', name: 'Wallet' },
  { id: 'pi8', name: 'Jewelry' }
];

const mockMeasurementUnits: MeasurementUnit[] = [
  { id: 'mu1', name: 'Piece' },
  { id: 'mu2', name: 'UGX' },
  { id: 'mu3', name: 'Kg' },
  { id: 'mu4', name: 'Pair' }
];

const mockPropertyBags: PropertyBag[] = [
  { id: 'pb1', bag_number: 'BAG-001' },
  { id: 'pb2', bag_number: 'BAG-002' },
  { id: 'pb3', bag_number: 'BAG-003' },
  { id: 'pb4', bag_number: 'BAG-004' },
  { id: 'pb5', bag_number: 'BAG-005' }
];

const mockPropertyStatuses: PropertyStatus[] = [
  { id: 'ps1', name: 'Stored', description: 'Property safely stored in facility' },
  { id: 'ps2', name: 'Released', description: 'Property released to authorized person' },
  { id: 'ps3', name: 'Damaged', description: 'Property is damaged or deteriorated' },
  { id: 'ps4', name: 'Lost', description: 'Property cannot be located' },
  { id: 'ps5', name: 'Destroyed', description: 'Property destroyed as per regulations' }
];

const mockPrisoners: Prisoner[] = [
  { id: 'pr1', full_name: 'John Doe', prisoner_number: 'PN-2024-001' },
  { id: 'pr2', full_name: 'Michael Smith', prisoner_number: 'PN-2024-002' },
  { id: 'pr3', full_name: 'David Wilson', prisoner_number: 'PN-2024-003' },
  { id: 'pr4', full_name: 'James Taylor', prisoner_number: 'PN-2024-004' },
  { id: 'pr5', full_name: 'Robert Martinez', prisoner_number: 'PN-2024-005' }
];

const mockNextOfKin: NextOfKin[] = [
  { id: 'nok1', full_name: 'Jane Doe', relationship: 'Spouse' },
  { id: 'nok2', full_name: 'Mary Wilson', relationship: 'Mother' },
  { id: 'nok3', full_name: 'Anna Martinez', relationship: 'Sister' }
];

export default function PrisonerPropertyScreen() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const [formData, setFormData] = useState({
    prisoner: '',
    property_type: '',
    property_item: '',
    measurement_unit: '',
    property_bag: '',
    next_of_kin: '',
    visitor: '',
    property_status: '',
    quantity: '',
    amount: '',
    biometric_consent: false,
    note: '',
    destination: ''
  });

  const itemsPerPage = 10;

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.property_item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.property_bag_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.note.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.property_status === statusFilter;
    const matchesType = typeFilter === 'all' || property.property_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setFormData({
      prisoner: '',
      property_type: '',
      property_item: '',
      measurement_unit: '',
      property_bag: '',
      next_of_kin: 'none',
      visitor: '',
      property_status: '',
      quantity: '',
      amount: '',
      biometric_consent: false,
      note: '',
      destination: ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      prisoner: property.prisoner,
      property_type: property.property_type,
      property_item: property.property_item,
      measurement_unit: property.measurement_unit,
      property_bag: property.property_bag,
      next_of_kin: property.next_of_kin || 'none',
      visitor: property.visitor,
      property_status: property.property_status,
      quantity: property.quantity,
      amount: property.amount,
      biometric_consent: property.biometric_consent,
      note: property.note,
      destination: property.destination
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (property: Property) => {
    setSelectedProperty(property);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (property: Property) => {
    setSelectedProperty(property);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProperty) {
      setProperties(properties.filter(p => p.id !== selectedProperty.id));
      toast.success('Property deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedProperty(null);
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const prisoner = mockPrisoners.find(p => p.id === formData.prisoner);
    const propertyType = mockPropertyTypes.find(pt => pt.id === formData.property_type);
    const propertyItem = mockPropertyItems.find(pi => pi.id === formData.property_item);
    const measurementUnit = mockMeasurementUnits.find(mu => mu.id === formData.measurement_unit);
    const propertyBag = mockPropertyBags.find(pb => pb.id === formData.property_bag);
    const propertyStatus = mockPropertyStatuses.find(ps => ps.id === formData.property_status);
    const nextOfKin = formData.next_of_kin !== 'none' ? mockNextOfKin.find(nok => nok.id === formData.next_of_kin) : undefined;

    const newProperty: Property = {
      id: Date.now().toString(),
      prisoner_name: prisoner?.full_name || '',
      property_type_name: propertyType?.name || '',
      property_item_name: propertyItem?.name || '',
      measurement_unit_name: measurementUnit?.name || '',
      property_bag_number: propertyBag?.bag_number || '',
      property_status_name: propertyStatus?.name || '',
      next_of_kin_name: nextOfKin?.full_name || '',
      visitor_name: formData.visitor,
      ...formData,
      next_of_kin: formData.next_of_kin === 'none' ? '' : formData.next_of_kin
    };

    setProperties([...properties, newProperty]);
    toast.success('Property created successfully');
    setIsCreateDialogOpen(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProperty) {
      const prisoner = mockPrisoners.find(p => p.id === formData.prisoner);
      const propertyType = mockPropertyTypes.find(pt => pt.id === formData.property_type);
      const propertyItem = mockPropertyItems.find(pi => pi.id === formData.property_item);
      const measurementUnit = mockMeasurementUnits.find(mu => mu.id === formData.measurement_unit);
      const propertyBag = mockPropertyBags.find(pb => pb.id === formData.property_bag);
      const propertyStatus = mockPropertyStatuses.find(ps => ps.id === formData.property_status);
      const nextOfKin = formData.next_of_kin !== 'none' ? mockNextOfKin.find(nok => nok.id === formData.next_of_kin) : undefined;

      const updatedProperty: Property = {
        ...selectedProperty,
        prisoner_name: prisoner?.full_name || '',
        property_type_name: propertyType?.name || '',
        property_item_name: propertyItem?.name || '',
        measurement_unit_name: measurementUnit?.name || '',
        property_bag_number: propertyBag?.bag_number || '',
        property_status_name: propertyStatus?.name || '',
        next_of_kin_name: nextOfKin?.full_name || '',
        visitor_name: formData.visitor,
        ...formData,
        next_of_kin: formData.next_of_kin === 'none' ? '' : formData.next_of_kin
      };

      setProperties(properties.map(p => p.id === selectedProperty.id ? updatedProperty : p));
      toast.success('Property updated successfully');
      setIsEditDialogOpen(false);
      setSelectedProperty(null);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseInt(amount);
    if (isNaN(num)) return 'UGX 0';
    return `UGX ${num.toLocaleString()}`;
  };

  const getStatusBadge = (statusName: string) => {
    const colorMap: Record<string, string> = {
      'Stored': 'bg-blue-600',
      'Released': 'bg-green-600',
      'Damaged': 'bg-orange-600',
      'Lost': 'bg-red-600',
      'Destroyed': 'bg-gray-600'
    };
    return (
      <Badge className={colorMap[statusName] || 'bg-gray-600'}>
        {statusName}
      </Badge>
    );
  };

  // Calculate statistics
  const totalProperties = properties.length;
  const storedProperties = properties.filter(p => p.property_status_name === 'Stored').length;
  const releasedProperties = properties.filter(p => p.property_status_name === 'Released').length;
  const totalValue = properties.reduce((sum, p) => sum + parseInt(p.amount || '0'), 0);

  const PropertyForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [openPropertyType, setOpenPropertyType] = useState(false);
    const [openPropertyItem, setOpenPropertyItem] = useState(false);
    const [openMeasurementUnit, setOpenMeasurementUnit] = useState(false);
    const [openPropertyBag, setOpenPropertyBag] = useState(false);
    const [openPropertyStatus, setOpenPropertyStatus] = useState(false);
    const [openNextOfKin, setOpenNextOfKin] = useState(false);

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Prisoner Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPrisoner}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.prisoner
                    ? mockPrisoners.find((p) => p.id === formData.prisoner)?.full_name + 
                      ' (' + mockPrisoners.find((p) => p.id === formData.prisoner)?.prisoner_number + ')'
                    : "Select prisoner..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search prisoner..." />
                  <CommandList>
                    <CommandEmpty>No prisoner found.</CommandEmpty>
                    <CommandGroup>
                      {mockPrisoners.map((prisoner) => (
                        <CommandItem
                          key={prisoner.id}
                          value={prisoner.full_name + ' ' + prisoner.prisoner_number}
                          onSelect={() => {
                            setFormData({...formData, prisoner: prisoner.id});
                            setOpenPrisoner(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.prisoner === prisoner.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {prisoner.full_name} ({prisoner.prisoner_number})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Property Type Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="property_type">Property Type *</Label>
            <Popover open={openPropertyType} onOpenChange={setOpenPropertyType}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPropertyType}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.property_type
                    ? mockPropertyTypes.find((t) => t.id === formData.property_type)?.name
                    : "Select property type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search property type..." />
                  <CommandList>
                    <CommandEmpty>No property type found.</CommandEmpty>
                    <CommandGroup>
                      {mockPropertyTypes.map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.name}
                          onSelect={() => {
                            setFormData({...formData, property_type: type.id});
                            setOpenPropertyType(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.property_type === type.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Property Item Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="property_item">Property Item *</Label>
            <Popover open={openPropertyItem} onOpenChange={setOpenPropertyItem}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPropertyItem}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.property_item
                    ? mockPropertyItems.find((i) => i.id === formData.property_item)?.name
                    : "Select property item..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search property item..." />
                  <CommandList>
                    <CommandEmpty>No property item found.</CommandEmpty>
                    <CommandGroup>
                      {mockPropertyItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => {
                            setFormData({...formData, property_item: item.id});
                            setOpenPropertyItem(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.property_item === item.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Measurement Unit Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="measurement_unit">Measurement Unit *</Label>
            <Popover open={openMeasurementUnit} onOpenChange={setOpenMeasurementUnit}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openMeasurementUnit}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.measurement_unit
                    ? mockMeasurementUnits.find((u) => u.id === formData.measurement_unit)?.name
                    : "Select unit..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search unit..." />
                  <CommandList>
                    <CommandEmpty>No unit found.</CommandEmpty>
                    <CommandGroup>
                      {mockMeasurementUnits.map((unit) => (
                        <CommandItem
                          key={unit.id}
                          value={unit.name}
                          onSelect={() => {
                            setFormData({...formData, measurement_unit: unit.id});
                            setOpenMeasurementUnit(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.measurement_unit === unit.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {unit.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Property Bag Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="property_bag">Property Bag *</Label>
            <Popover open={openPropertyBag} onOpenChange={setOpenPropertyBag}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPropertyBag}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.property_bag
                    ? mockPropertyBags.find((b) => b.id === formData.property_bag)?.bag_number
                    : "Select bag..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search bag..." />
                  <CommandList>
                    <CommandEmpty>No bag found.</CommandEmpty>
                    <CommandGroup>
                      {mockPropertyBags.map((bag) => (
                        <CommandItem
                          key={bag.id}
                          value={bag.bag_number}
                          onSelect={() => {
                            setFormData({...formData, property_bag: bag.id});
                            setOpenPropertyBag(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.property_bag === bag.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {bag.bag_number}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Property Status Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="property_status">Property Status *</Label>
            <Popover open={openPropertyStatus} onOpenChange={setOpenPropertyStatus}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPropertyStatus}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.property_status
                    ? mockPropertyStatuses.find((s) => s.id === formData.property_status)?.name
                    : "Select status..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search status..." />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {mockPropertyStatuses.map((status) => (
                        <CommandItem
                          key={status.id}
                          value={status.name}
                          onSelect={() => {
                            setFormData({...formData, property_status: status.id});
                            setOpenPropertyStatus(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.property_status === status.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {status.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="text"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="Enter quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="Enter amount"
            />
          </div>

          {/* Next of Kin Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="next_of_kin">Next of Kin</Label>
            <Popover open={openNextOfKin} onOpenChange={setOpenNextOfKin}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openNextOfKin}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.next_of_kin && formData.next_of_kin !== 'none'
                    ? mockNextOfKin.find((nok) => nok.id === formData.next_of_kin)?.full_name + 
                      ' (' + mockNextOfKin.find((nok) => nok.id === formData.next_of_kin)?.relationship + ')'
                    : "Select next of kin..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search next of kin..." />
                  <CommandList>
                    <CommandEmpty>No next of kin found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          setFormData({...formData, next_of_kin: 'none'});
                          setOpenNextOfKin(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.next_of_kin === 'none' ? "opacity-100" : "opacity-0"
                          )}
                        />
                        None
                      </CommandItem>
                      {mockNextOfKin.map((nok) => (
                        <CommandItem
                          key={nok.id}
                          value={nok.full_name + ' ' + nok.relationship}
                          onSelect={() => {
                            setFormData({...formData, next_of_kin: nok.id});
                            setOpenNextOfKin(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.next_of_kin === nok.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {nok.full_name} ({nok.relationship})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitor">Visitor Name</Label>
            <Input
              id="visitor"
              type="text"
              value={formData.visitor}
              onChange={(e) => setFormData({...formData, visitor: e.target.value})}
              placeholder="Enter visitor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({...formData, destination: e.target.value})}
              placeholder="Enter destination"
            />
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Checkbox
              id="biometric_consent"
              checked={formData.biometric_consent}
              onCheckedChange={(checked) => setFormData({...formData, biometric_consent: checked as boolean})}
            />
            <Label htmlFor="biometric_consent" className="cursor-pointer">
              Biometric Consent
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Notes</Label>
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) => setFormData({...formData, note: e.target.value})}
            placeholder="Enter any additional notes"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Property
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: '#650000' }}>Property and History</h1>
          <p className="text-gray-600">Manage prisoner property items and their history</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {totalProperties}
                </p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stored</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {storedProperties}
                </p>
              </div>
              <Tag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Released</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {releasedProperties}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-xl" style={{ color: '#650000' }}>
                  {formatCurrency(totalValue.toString())}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by prisoner, item, bag number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {mockPropertyStatuses.map(status => (
                      <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {mockPropertyTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleCreate} style={{ backgroundColor: '#650000' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Property Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prisoner</TableHead>
                      <TableHead>Property Type</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Bag Number</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProperties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No properties found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProperties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>
                            <div>
                              <p>{property.prisoner_name}</p>
                            </div>
                          </TableCell>
                          <TableCell>{property.property_type_name}</TableCell>
                          <TableCell>{property.property_item_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{property.property_bag_number}</Badge>
                          </TableCell>
                          <TableCell>
                            {property.quantity} {property.measurement_unit_name}
                          </TableCell>
                          <TableCell>{formatCurrency(property.amount)}</TableCell>
                          <TableCell>
                            {getStatusBadge(property.property_status_name)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(property)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(property)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(property)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Create New Property</DialogTitle>
            <DialogDescription>
              Add a new property item to the system
            </DialogDescription>
          </DialogHeader>
          <PropertyForm onSubmit={handleSubmitCreate} isEdit={false} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Edit Property</DialogTitle>
            <DialogDescription>
              Update property information
            </DialogDescription>
          </DialogHeader>
          <PropertyForm onSubmit={handleSubmitEdit} isEdit={true} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Property Details</DialogTitle>
            <DialogDescription>
              Complete information about the property item
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Basic Information</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Prisoner</p>
                        <p>{selectedProperty.prisoner_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Property Type</p>
                        <p>{selectedProperty.property_type_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Property Item</p>
                        <p>{selectedProperty.property_item_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bag Number</p>
                        <Badge variant="outline">{selectedProperty.property_bag_number}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p>{selectedProperty.quantity} {selectedProperty.measurement_unit_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p>{formatCurrency(selectedProperty.amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Biometric Consent</p>
                        <Badge className={selectedProperty.biometric_consent ? 'bg-green-600' : 'bg-gray-600'}>
                          {selectedProperty.biometric_consent ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Property Status Details */}
              <div>
                <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Property Status</h3>
                <Card>
                  <CardContent className="p-4">
                    {(() => {
                      const status = mockPropertyStatuses.find(s => s.id === selectedProperty.property_status);
                      return status ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">Status:</p>
                            {getStatusBadge(status.name)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Description</p>
                            <p>{status.description}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Destination</p>
                            <p>{selectedProperty.destination || '-'}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Status information not available</p>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Related Persons */}
              <div>
                <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Related Persons</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Next of Kin</p>
                        <p>{selectedProperty.next_of_kin_name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Visitor</p>
                        <p>{selectedProperty.visitor_name || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedProperty.note && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Notes</h3>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-gray-700">{selectedProperty.note}</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property record.
              {selectedProperty && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Item:</span> {selectedProperty.property_item_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Prisoner:</span> {selectedProperty.prisoner_name}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

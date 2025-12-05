import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import BiometricCapture from '../common/BiometricCapture';
import PropertyStatusChangeForm from './PropertyStatusChangeForm';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
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
  ChevronsUpDown,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../ui/utils';
import {
  fetchCounties,
  fetchDistricts, fetchParishes, fetchSubCounties, fetchVillages,
  handleCatchError,
  handleEmptyList, handleResponseError,
  handleServerError
} from "../../services/stationServices/utils";
import {
  DefaultPropertyItem, deleteProperty,
  getProperties, getPropertyBags,
  getPropertyItems, getPropertyStatuses,
  getPropertyTypes,
  PrisonerProperty, PropertyBag, PropertyItem
} from "../../services/stationServices/propertyService";
import {
  getIdTypes,
  getPrisoners, getRelationships,
  getStationVisitors2, IdType,
  PrisonerItem, Relationship, RelationShipItem, Visitor
} from "../../services/stationServices/visitorsServices/VisitorsService";
import {
  deleteVisitorItem,
  getVisitorItems2,
  Unit,
  VisitorItem
} from "../../services/stationServices/visitorsServices/visitorItem";
import {getSexes, Item} from "../../services/stationServices/manualLockupIntegration";
import {
  addNextOfKin,
  County,
  District, getNextOfKins,
  getRegions, NextOfKin, NextOfKinResponse,
  Parish,
  Region,
  SubCounty,
  Village
} from "../../services/admission/nextOfKinService";
import {getCurrentUser} from "../../services";
import NextOfKinScreen from "./NextOfKin";
import PropertyItemX from "./PropertyItem"
import CreatePropertyForm from "./CreatePropertyForm";

interface Property {
  id: string;
  prisoner_name: string;
  property_type_name: string;
  property_category_name: string;
  property_item_name: string;
  measurement_unit_name: string;
  property_bag_number: string;
  property_status_name: string;
  next_of_kin_name: string;
  visitor_name: string;
  quantity: string;
  amount: string;
  biometric_consent: boolean;
  biometric_data?: string;
  note: string;
  destination: string;
  prisoner: string;
  property_type: string;
  property_category: string;
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

// interface PropertyItem {
//   id: string;
//   name: string;
// }

interface PropertyCategory {
  id: string;
  name: string;
}

interface MeasurementUnit {
  id: string;
  name: string;
}

// interface PropertyBag {
//   id: string;
//   bag_number: string;
// }

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

// interface NextOfKin {
//   id: string;
//   full_name: string;
//   relationship: string;
// }

// interface Visitor {
//   id: string;
//   first_name: string;
//   middle_name: string;
//   last_name: string;
//   id_number: string;
//   phone_number: string;
//   visitor_type_name?: string;
// }

// Mock Data
const mockProperties: Property[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    property_type_name: 'Personal Items',
    property_category_name: 'Valuables',
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
    property_category: 'pc1',
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
    property_category_name: 'Personal Effects',
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
    property_category: 'pc3',
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
    property_category_name: 'Valuables',
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
    property_category: 'pc1',
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
    property_category_name: 'Confiscated',
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
    property_category: 'pc6',
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
    property_category_name: 'Legal Documents',
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
    property_category: 'pc4',
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

const mockPropertyCategories: PropertyCategory[] = [
  { id: 'pc1', name: 'Valuables' },
  { id: 'pc2', name: 'Contraband' },
  { id: 'pc3', name: 'Personal Effects' },
  { id: 'pc4', name: 'Legal Documents' },
  { id: 'pc5', name: 'Prohibited Items' },
  { id: 'pc6', name: 'Confiscated' }
];

const mockPropertyItems: PropertyItem[] = [
  // { id: 'pi1', name: 'Mobile Phone' },
  // { id: 'pi2', name: 'Leather Jacket' },
  // { id: 'pi3', name: 'Laptop' },
  // { id: 'pi4', name: 'Cash' },
  // { id: 'pi5', name: 'National ID' },
  // { id: 'pi6', name: 'Watch' },
  // { id: 'pi7', name: 'Wallet' },
  // { id: 'pi8', name: 'Jewelry' }
];

const mockMeasurementUnits: MeasurementUnit[] = [
  { id: 'mu1', name: 'Piece' },
  { id: 'mu2', name: 'UGX' },
  { id: 'mu3', name: 'Kg' },
  { id: 'mu4', name: 'Pair' }
];

const mockPropertyBags: PropertyBag[] = [
  // { id: 'pb1', bag_number: 'BAG-001' },
  // { id: 'pb2', bag_number: 'BAG-002' },
  // { id: 'pb3', bag_number: 'BAG-003' },
  // { id: 'pb4', bag_number: 'BAG-004' },
  // { id: 'pb5', bag_number: 'BAG-005' }
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

// const mockNextOfKin: NextOfKin[] = [
//   { id: 'nok1', full_name: 'Jane Doe', relationship: 'Spouse' },
//   { id: 'nok2', full_name: 'Mary Wilson', relationship: 'Mother' },
//   { id: 'nok3', full_name: 'Anna Martinez', relationship: 'Sister' }
// ];

// const mockVisitors: Visitor[] = [
//   { id: 'v1', first_name: 'Sarah', middle_name: 'Jane', last_name: 'Smith', id_number: 'CM123456789', phone_number: '0771234567', visitor_type_name: 'Family' },
//   { id: 'v2', first_name: 'John', middle_name: '', last_name: 'Brown', id_number: 'CM987654321', phone_number: '0752345678', visitor_type_name: 'Friend' },
//   { id: 'v3', first_name: 'Mary', middle_name: 'Ann', last_name: 'Johnson', id_number: 'CM456789123', phone_number: '0783456789', visitor_type_name: 'Family' },
//   { id: 'v4', first_name: 'David', middle_name: '', last_name: 'Williams', id_number: 'CM789123456', phone_number: '0704567890', visitor_type_name: 'Legal Representative' }
// ];

interface VisitorItemData {
  id: string;
  visitor_id: string;
  visitor_name: string;
  visitor_id_number: string;
  visitor_phone: string;
  item_name: string;
  category_name: string;
  bag_no: string;
  quantity: number;
  amount: string;
}

const mockVisitorItems: VisitorItemData[] = [
  {
    id: 'vi1',
    visitor_id: 'v1',
    visitor_name: 'Sarah Jane Smith',
    visitor_id_number: 'CM123456789',
    visitor_phone: '0771234567',
    item_name: 'Rice',
    category_name: 'Food Items',
    bag_no: 'BAG-V001',
    quantity: 5,
    amount: '25000'
  },
  {
    id: 'vi2',
    visitor_id: 'v2',
    visitor_name: 'John Brown',
    visitor_id_number: 'CM987654321',
    visitor_phone: '0752345678',
    item_name: 'T-Shirt',
    category_name: 'Clothing',
    bag_no: 'BAG-V002',
    quantity: 2,
    amount: '40000'
  },
  {
    id: 'vi3',
    visitor_id: 'v3',
    visitor_name: 'Mary Ann Johnson',
    visitor_id_number: 'CM456789123',
    visitor_phone: '0783456789',
    item_name: 'Soap',
    category_name: 'Personal Care',
    bag_no: 'BAG-V003',
    quantity: 3,
    amount: '15000'
  },
  {
    id: 'vi4',
    visitor_id: 'v4',
    visitor_name: 'David Williams',
    visitor_id_number: 'CM789123456',
    visitor_phone: '0704567890',
    item_name: 'Bible',
    category_name: 'Books & Magazines',
    bag_no: 'BAG-V004',
    quantity: 1,
    amount: '20000'
  },
  {
    id: 'vi5',
    visitor_id: 'v1',
    visitor_name: 'Sarah Jane Smith',
    visitor_id_number: 'CM123456789',
    visitor_phone: '0771234567',
    item_name: 'Beans',
    category_name: 'Food Items',
    bag_no: 'BAG-V005',
    quantity: 3,
    amount: '18000'
  }
];

const mockRelationships = [
  { id: '1', name: 'Spouse' },
  { id: '2', name: 'Parent' },
  { id: '3', name: 'Sibling' },
  { id: '4', name: 'Child' },
  { id: '5', name: 'Other Relative' },
  { id: '6', name: 'Friend' },
];

const mockSexTypes = [
  { id: '1', name: 'Male' },
  { id: '2', name: 'Female' },
];

const mockIdTypes = [
  { id: '1', name: 'National ID' },
  { id: '2', name: 'Passport' },
  { id: '3', name: 'Driving License' },
  { id: '4', name: 'Other' },
];

const mockRegions = [
  { id: '1', name: 'Central' },
  { id: '2', name: 'Eastern' },
  { id: '3', name: 'Western' },
  { id: '4', name: 'Northern' },
];

const mockDistricts = [
  { id: '1', name: 'Kampala', region_id: '1' },
  { id: '2', name: 'Wakiso', region_id: '1' },
  { id: '3', name: 'Mbale', region_id: '2' },
];

export default function PrisonerPropertyScreen() {
  const [properties, setProperties] = useState<PrisonerProperty[]>([]);
  const [prisoners, setPrisoners] = useState<PrisonerItem[]>([])
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isNextCreateDialogOpen, setIsNextCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNextOfKinDialogOpen, setIsNextOfKinDialogOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PrisonerProperty | null>(null);
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);
  const [previousPropertyStatus, setPreviousPropertyStatus] = useState('');
  const [statusChangeData, setStatusChangeData] = useState<any>(null);

  // APIs integration
  const [propertyLoading, setPropertyLoading] = useState(true)
  const [loading, setLoading] = useState({ visitor: false, property: false, type: false })
  const [newDialogLoader, setNewDialogLoader] = useState(false)
  const [loaderText, setLoaderText] = useState("")
  const [visitorItems, setVisitorItems] = useState<VisitorItem[]>([])

  const [nextOfKins, setNextOfKins] = useState<NextOfKinResponse[]>([])

  // Separate state for prisoner and visitor info (for create mode)
  const [prisonerInfo, setPrisonerInfo] = useState({
    prisoner: ''
  });

  const [visitorInfo, setVisitorInfo] = useState({
    visitor: ''
  });

  // State for multiple property items (for create mode)
  const [propertyItems, setPropertyItems] = useState<DefaultPropertyItem[]>([{
    id: '1',
    property_type: '',
    property_category: '',
    property_item: '',
    measurement_unit: '',
    property_bag: '',
    next_of_kin: '',
    property_status: '',
    quantity: '',
    amount: '',
    note: '',
    destination: '',
    visitor_item: '',
  }]);

  // State for biometric data (for create mode)
  const [biometricData, setBiometricData] = useState('');

  // State for collapsible property items section
  const [isPropertyItemsOpen, setIsPropertyItemsOpen] = useState(true);

  // State for editing single item (for edit mode)
  const [formData, setFormData] = useState({
    prisoner: '',
    property_type: '',
    property_category: '',
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

  // Fetch visitors from API
  // useEffect(() => {
  //   const fetchVisitors = async () => {
  //     setIsLoadingVisitors(true);
  //     try {
  //       const response = await fetch('/api/gate-management/visitors/');
  //       if (response.ok) {
  //         const data = await response.json();
  //         setVisitors(data.results || data);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching visitors:', error);
  //       toast.error('Failed to load visitors');
  //     } finally {
  //       setIsLoadingVisitors(false);
  //     }
  //   };
  //   fetchVisitors();
  // }, []);

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
    setPrisonerInfo({ prisoner: '' });
    setVisitorInfo({ visitor: '' });
    setPropertyItems([{
      id: '1',
      property_type: '',
      property_category: '',
      property_item: '',
      measurement_unit: '',
      property_bag: '',
      next_of_kin: 'none',
      property_status: '',
      quantity: '',
      amount: '',
      note: '',
      destination: ''
    }]);
    setBiometricData('');
    setIsCreateDialogOpen(true);
  };

  const handleAddPropertyItem = () => {
    const newItem = {
      id: Date.now().toString(),
      property_type: '',
      property_category: '',
      property_item: '',
      measurement_unit: '',
      property_bag: '',
      next_of_kin: 'none',
      property_status: '',
      quantity: '',
      amount: '',
      note: '',
      destination: ''
    };
    setPropertyItems([...propertyItems, newItem]);
  };

  const handleRemovePropertyItem = (itemId: string) => {
    if (propertyItems.length > 1) {
      setPropertyItems(propertyItems.filter(item => item.id !== itemId));
    }
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setPreviousPropertyStatus(property.property_status); // Store the original status
    setFormData({
      prisoner: property.prisoner,
      property_type: property.property_type,
      property_category: property.property_category,
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
    console.log(property)
    setIsViewDialogOpen(true);
  };

  const handleDelete = (property: Property) => {
    setSelectedProperty(property);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProperty) {
      return
    }

    const response = await deleteProperty(selectedProperty.id)
    if (handleResponseError(response)) return;
    setProperties(properties.filter(p => p.id !== selectedProperty.id));
    toast.success('Property deleted successfully');
    setIsDeleteDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleStatusChangeSubmit = (data: any) => {
    // Handle the status change submission
    console.log('Status change submitted:', data);
    toast.success('Property status change recorded successfully');
    // You can add API call here to save the status change
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const prisoner = mockPrisoners.find(p => p.id === prisonerInfo.prisoner);
    const visitor = visitors.find(v => v.id === visitorInfo.visitor);

    // Create multiple properties from propertyItems
    const newProperties: Property[] = propertyItems.map((item, index) => {
      const propertyType = mockPropertyTypes.find(pt => pt.id === item.property_type);
      const propertyCategory = mockPropertyCategories.find(pc => pc.id === item.property_category);
      const propertyItem = mockPropertyItems.find(pi => pi.id === item.property_item);
      const measurementUnit = mockMeasurementUnits.find(mu => mu.id === item.measurement_unit);
      const propertyBag = mockPropertyBags.find(pb => pb.id === item.property_bag);
      const propertyStatus = mockPropertyStatuses.find(ps => ps.id === item.property_status);
      const nextOfKin = item.next_of_kin !== 'none' ? nextOfKins.find(nok => nok.id === item.next_of_kin) : undefined;

      return {
        id: (Date.now() + index).toString(),
        prisoner: prisonerInfo.prisoner,
        prisoner_name: prisoner?.full_name || '',
        property_type: item.property_type,
        property_type_name: propertyType?.name || '',
        property_category: item.property_category,
        property_category_name: propertyCategory?.name || '',
        property_item: item.property_item,
        property_item_name: propertyItem?.name || '',
        measurement_unit: item.measurement_unit,
        measurement_unit_name: measurementUnit?.name || '',
        property_bag: item.property_bag,
        property_bag_number: propertyBag?.bag_number || '',
        property_status: item.property_status,
        property_status_name: propertyStatus?.name || '',
        next_of_kin: item.next_of_kin === 'none' ? '' : item.next_of_kin,
        next_of_kin_name: nextOfKin?.full_name || '',
        visitor: visitorInfo.visitor,
        visitor_name: visitor ? `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim() : '',
        quantity: item.quantity,
        amount: item.amount,
        biometric_consent: !!biometricData,
        biometric_data: biometricData,
        note: item.note,
        destination: item.destination
      };
    });

    setProperties([...properties, ...newProperties]);
    toast.success(`${newProperties.length} ${newProperties.length === 1 ? 'property' : 'properties'} created successfully`);
    setIsCreateDialogOpen(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProperty) {
      const prisoner = mockPrisoners.find(p => p.id === formData.prisoner);
      const propertyType = mockPropertyTypes.find(pt => pt.id === formData.property_type);
      const propertyCategory = mockPropertyCategories.find(pc => pc.id === formData.property_category);
      const propertyItem = mockPropertyItems.find(pi => pi.id === formData.property_item);
      const measurementUnit = mockMeasurementUnits.find(mu => mu.id === formData.measurement_unit);
      const propertyBag = mockPropertyBags.find(pb => pb.id === formData.property_bag);
      const propertyStatus = mockPropertyStatuses.find(ps => ps.id === formData.property_status);
      const nextOfKin = formData.next_of_kin !== 'none' ? nextOfKins.find(nok => nok.id === formData.next_of_kin) : undefined;
      const visitor = visitors.find(v => v.id === formData.visitor);

      const updatedProperty: Property = {
        ...selectedProperty,
        prisoner_name: prisoner?.full_name || '',
        property_type_name: propertyType?.name || '',
        property_category_name: propertyCategory?.name || '',
        property_item_name: propertyItem?.name || '',
        measurement_unit_name: measurementUnit?.name || '',
        property_bag_number: propertyBag?.bag_number || '',
        property_status_name: propertyStatus?.name || '',
        next_of_kin_name: nextOfKin?.full_name || '',
        visitor_name: visitor ? `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim() : '',
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
      // <Badge className={colorMap[statusName] || 'bg-gray-600'}>
        <Badge>
        {statusName}
      </Badge>
    );
  };

  // Calculate statistics
  const totalProperties = properties.length;
  const storedProperties = properties.filter(p => p.property_status_name === 'Stored').length;
  const releasedProperties = properties.filter(p => p.property_status_name === 'Released').length;
  const totalValue = properties.reduce((sum, p) => sum + parseInt(p.amount || '0'), 0);

  // Component for individual property item card
  const PropertyItemCard = ({ item, index, onUpdate, onRemove, canRemove }: {
    item: any;
    index: number;
    onUpdate: (id: string, updatedFields: Partial<typeof item>) => void;
    onRemove: (id: string) => void;
    canRemove: boolean;
  }) => {
    const [isItemOpen, setIsItemOpen] = useState(true);
    const [openPropertyType, setOpenPropertyType] = useState(false);
    const [openPropertyCategory, setOpenPropertyCategory] = useState(false);
    const [openPropertyItem, setOpenPropertyItem] = useState(false);
    const [openMeasurementUnit, setOpenMeasurementUnit] = useState(false);
    const [openPropertyBag, setOpenPropertyBag] = useState(false);
    const [openPropertyStatus, setOpenPropertyStatus] = useState(false);
    const [openNextOfKin, setOpenNextOfKin] = useState(false);
    const [openVisitorItem, setOpenVisitorItem] = useState(false);
    const [visitorItemSearch, setVisitorItemSearch] = useState('');


    // Filter visitor items based on search
    const filteredVisitorItems = visitorItems.filter((visitorItem) => {
      const searchLower = visitorItemSearch.toLowerCase();
      return (
        visitorItem.visitor_name.toLowerCase().includes(searchLower) ||
        visitorItem.item_name.toLowerCase().includes(searchLower)
      );
    });

    const handleVisitorItemSelect = async (visitorItem: VisitorItem) => {
      // Populate fields from selected visitor item
      const name= `${visitorItem.item_name} (${visitorItem.category_name})`
      // onUpdate(item.id, 'quantity', visitorItem.quantity.toString());
      // onUpdate(item.id, 'amount', visitorItem.amount);

      // console.log(visitorItem)

      onUpdate(item.id, {
        quantity: visitorItem.quantity.toString(),
        amount: visitorItem.amount,
        visitor_item_name: name,
        visitor_item: visitorItem.item,
        property_category: visitorItem.item_category,
        property_category_name: visitorItem.category_name,
        measurement_unit: visitorItem.measurement_unit,
        measurement_unit_name: visitorItem.measurement_unit_name,
      });
      // toast.success(`Loaded item: ${name}`);
      setOpenVisitorItem(false);

      await fetchPropertyData(visitorItem)
    };

    async function fetchPropertyData(visitorItem: VisitorItem) {
       setNewDialogLoader(true)
       setLoaderText("Fetching Property information")
       setTypeLoader(false)
        try {
            const response1 = await getPropertyTypes()
            const ok1 = populateListX(response1, "There are no property types", setPropertyTypes)
            if(!ok1) return
            // const response2 = await getPropertyItems(visitorItem.item_category)
            // const ok2 = populateListX(response2, "There are no property items", setPropertyItems)
            // if(!ok2) return
            const response3 = await getPropertyStatuses()
            const ok3 = populateListX(response3, "There are no property statuses", setPropertyStatuses)
            if(!ok3) return
            // const response4 = await getPropertyBags(prisonerInfo.prisoner, visitorItem.item_category)
            // const ok4 = populateListX(response4, "There are no property bags for this prisoner", setPropertyBags)
            // if(!ok4) return

            setTypeLoader(true)

        }catch (error) {
          handleCatchError(error)
        }finally {
          setNewDialogLoader(false)
        }
    }

    function populateListX(response: any, msg: string, setData: any) {
      if(handleServerError(response, setNewDialogLoader)) return false

      if ("results" in response) {
        const data = response.results
        if (handleEmptyList(data, msg, setNewDialogLoader)) return false
        setData(data)
        return true
      }

      return false
    }

    // Get summary info for collapsed state
    const propertyTypeName = item.property_type
      ? mockPropertyTypes.find((t) => t.id === item.property_type)?.name
      : null;
    const propertyItemName = item.property_item
      ? mockPropertyItems.find((i) => i.id === item.property_item)?.name
      : null;

    return (
      <Collapsible open={isItemOpen} onOpenChange={setIsItemOpen}>
        <Card className="relative border-2" style={{ borderColor: isItemOpen ? '#650000' : '#e5e7eb' }}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" style={{ color: '#650000' }} />
                  {/*<h4 className="font-medium">Item #{index + 1}</h4>*/}
                  <h4 className="font-medium">Item Details</h4>
                </div>
                {!isItemOpen && (propertyTypeName || propertyItemName) && (
                  <div className="flex gap-2">
                    {propertyTypeName && (
                      <Badge variant="secondary">{propertyTypeName}</Badge>
                    )}
                    {propertyItemName && (
                      <Badge variant="outline">{propertyItemName}</Badge>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
                {isItemOpen ? (
                  <ChevronUp className="h-5 w-5" style={{ color: '#650000' }} />
                ) : (
                  <ChevronDown className="h-5 w-5" style={{ color: '#650000' }} />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4">{/* Content wrapper */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Visitor Items */}
              <div className="space-y-2 md:col-span-2">
                <Label>Select Visitor Item *</Label>
                <Popover open={openVisitorItem} onOpenChange={setOpenVisitorItem}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                      <span className="text-gray-500">
                        {
                          !item.visitor_item_name ? (
                              "Search by item name..."
                          ) : (
                              item.visitor_item_name
                          )
                        }
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" style={{ width: '600px' }}>
                    <Command>
                      <CommandInput
                        placeholder="Search by item name..."
                        value={visitorItemSearch}
                        onValueChange={setVisitorItemSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No visitor items found.</CommandEmpty>
                        <CommandGroup>
                          {filteredVisitorItems.map((visitorItem) => (
                            <CommandItem
                              key={visitorItem.id}
                              value={`${visitorItem.item_name}`}
                              onSelect={() => handleVisitorItemSelect(visitorItem)}
                            >
                              <div className="flex flex-col w-full mb-5">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{visitorItem.item_name} ({visitorItem.category_name})</span>
                                  {/*<Badge variant="secondary">{visitorItem.item_name}</Badge>*/}
                                </div>
                                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                  {/*<span>ID: {visitorItem.visitor_id_number}</span>*/}
                                  {/*<span>Phone: {visitorItem.visitor_phone}</span>*/}
                                  <span>Bag: {visitorItem.bag_no}</span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {
                typeLoader && (
                    <>
                       {/* Property Type */}
                        <div className="space-y-2">
                          <Label>Property Type *</Label>
                          <Popover open={openPropertyType} onOpenChange={setOpenPropertyType}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                                {item.property_type
                                  ? propertyTypes.find((t) => t.id === item.property_type)?.name
                                  : "Select property type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search property type..." />
                                <CommandList>
                                  <CommandEmpty>No type found.</CommandEmpty>
                                  <CommandGroup>
                                    {propertyTypes.map((type) => (
                                      <CommandItem
                                        key={type.id}
                                        value={type.name}
                                        onSelect={() => {
                                          onUpdate(item.id, {
                                            property_type: type.id
                                          })
                                          setOpenPropertyType(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_type === type.id ? "opacity-100" : "opacity-0")} />
                                        {type.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Property Category */}
                        <div className="space-y-2">
                          <Label>Property Category *</Label>
                          <Popover open={openPropertyCategory} onOpenChange={setOpenPropertyCategory}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button" disabled={true}>
                                {item.property_category_name}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search category..." />
                                <CommandList>
                                  <CommandEmpty>No category found.</CommandEmpty>
                                  <CommandGroup>
                                    {mockPropertyCategories.map((category) => (
                                      <CommandItem
                                        key={category.id}
                                        value={category.name}
                                        onSelect={() => {
                                          onUpdate(item.id, 'property_category', category.id);
                                          setOpenPropertyCategory(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_category === category.id ? "opacity-100" : "opacity-0")} />
                                        {category.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Property Item */}
                        <div className="space-y-2">
                          <Label>Property Item *</Label>
                          <Popover open={openPropertyItem} onOpenChange={setOpenPropertyItem}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                                {item.property_item
                                  ? mockPropertyItems.find((i) => i.id === item.property_item)?.name
                                  : "Select item..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search item..." />
                                <CommandList>
                                  <CommandEmpty>No item found.</CommandEmpty>
                                  <CommandGroup>
                                    {mockPropertyItems.map((propertyItem) => (
                                      <CommandItem
                                        key={propertyItem.id}
                                        value={propertyItem.name}
                                        onSelect={() => {
                                          onUpdate(item.id, 'property_item', propertyItem.id);
                                          setOpenPropertyItem(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_item === propertyItem.id ? "opacity-100" : "opacity-0")} />
                                        {propertyItem.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Measurement Unit */}
                        <div className="space-y-2">
                          <Label>Measurement Unit</Label>
                          <Popover open={openMeasurementUnit} onOpenChange={setOpenMeasurementUnit}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button" disabled={true}>
                                {/*{item.measurement_unit*/}
                                {/*  ? mockMeasurementUnits.find((u) => u.id === item.measurement_unit)?.name*/}
                                {/*  : "Select unit..."}*/}
                                {item.measurement_unit_name}
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
                                          onUpdate(item.id, 'measurement_unit', unit.id);
                                          setOpenMeasurementUnit(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.measurement_unit === unit.id ? "opacity-100" : "opacity-0")} />
                                        {unit.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="text"
                            value={item.quantity}
                            placeholder="Enter quantity"
                            required
                            disabled={true}
                          />
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                          <Label>Amount (UGX)</Label>
                          <Input
                            type="number"
                            value={item.amount}
                            placeholder="Enter amount"
                            disabled={true}
                          />
                        </div>

                        {/* Property Bag */}
                        <div className="space-y-2">
                          <Label>Property Bag *</Label>
                          <Popover open={openPropertyBag} onOpenChange={setOpenPropertyBag}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                                {item.property_bag
                                  ? mockPropertyBags.find((b) => b.id === item.property_bag)?.bag_number
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
                                          onUpdate(item.id, 'property_bag', bag.id);
                                          setOpenPropertyBag(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_bag === bag.id ? "opacity-100" : "opacity-0")} />
                                        {bag.bag_number}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Property Status */}
                        <div className="space-y-2">
                          <Label>Property Status *</Label>
                          <Popover open={openPropertyStatus} onOpenChange={setOpenPropertyStatus}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="w-full justify-between" type="button">
                                {item.property_status
                                  ? propertyStatuses.find((s) => s.id === item.property_status)?.name
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
                                    {propertyStatuses.map((status) => (
                                      <CommandItem
                                        key={status.id}
                                        value={status.name}
                                        onSelect={() => {
                                          onUpdate(item.id, {
                                            property_status: status.id
                                          });
                                          setOpenPropertyStatus(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.property_status === status.id ? "opacity-100" : "opacity-0")} />
                                        {status.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Next of Kin */}
                        <div className="space-y-2">
                          <Label>Next of Kin</Label>
                          <div className="flex gap-2">
                            <Popover open={openNextOfKin} onOpenChange={setOpenNextOfKin}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="flex-1 justify-between" type="button">
                                  {item.next_of_kin && item.next_of_kin !== 'none'
                                    ? nextOfKins.find((nok) => nok.id === item.next_of_kin)?.full_name + ' (' + nextOfKins.find((nok) => nok.id === item.next_of_kin)?.relationship_name + ')'
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
                                        onUpdate(item.id, 'next_of_kin', 'none');
                                        setOpenNextOfKin(false);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", item.next_of_kin === 'none' ? "opacity-100" : "opacity-0")} />
                                      None
                                    </CommandItem>
                                    {nextOfKins.map((nok) => (
                                      <CommandItem
                                        key={nok.id}
                                        value={nok.full_name + ' ' + nok.relationship}
                                        onSelect={() => {
                                          onUpdate(item.id, {
                                            next_of_kin: nok.id,
                                          });
                                          setOpenNextOfKin(false);
                                        }}
                                      >
                                        <Check className={cn("mr-2 h-4 w-4", item.next_of_kin === nok.id ? "opacity-100" : "opacity-0")} />
                                        {nok.full_name} ({nok.relationship_name})
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {/*<Button*/}
                          {/*  type="button"*/}
                          {/*  variant="outline"*/}
                          {/*  size="icon"*/}
                          {/*  className="shrink-0"*/}
                          {/*  onClick={() => setIsNextOfKinDialogOpen(true)}*/}
                          {/*  title="Add New Next of Kin"*/}
                          {/*  style={{ borderColor: '#650000' }}*/}
                          {/*>*/}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => setIsNextCreateDialogOpen(true)}
                            title="Add New Next of Kin"
                            style={{ borderColor: '#650000' }}
                          >
                            <Plus className="h-5 w-5" style={{ color: '#650000' }} />
                          </Button>
                        </div>
                      </div>

                        {/* Destination */}
                        <div className="space-y-2">
                          <Label>Destination</Label>
                          <Input
                            type="text"
                            value={item.destination}
                            onChange={(e) => onUpdate(item.id, {destination: e.target.value})}
                            placeholder="Enter destination"
                          />
                        </div>

                        {/* Note */}
                        <div className="space-y-2 md:col-span-2">
                          <Label>Notes</Label>
                          <Textarea
                            value={item.note}
                            onChange={(e) => onUpdate(item.id, {note: e.target.value})}
                            placeholder="Enter any additional notes"
                            rows={2}
                          />
                        </div>
                    </>
                )
              }
            </div>
            </div>{/* End content wrapper */}
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  const PropertyForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [openPropertyType, setOpenPropertyType] = useState(false);
    const [openPropertyCategory, setOpenPropertyCategory] = useState(false);
    const [openPropertyItem, setOpenPropertyItem] = useState(false);
    const [openMeasurementUnit, setOpenMeasurementUnit] = useState(false);
    const [openPropertyBag, setOpenPropertyBag] = useState(false);
    const [openPropertyStatus, setOpenPropertyStatus] = useState(false);
    const [openNextOfKin, setOpenNextOfKin] = useState(false);
    const [openVisitor, setOpenVisitor] = useState(false);

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

          {/* Property Category Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="property_category">Property Category *</Label>
            <Popover open={openPropertyCategory} onOpenChange={setOpenPropertyCategory}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPropertyCategory}
                  className="w-full justify-between"
                  type="button"
                >
                  {formData.property_category
                    ? mockPropertyCategories.find((c) => c.id === formData.property_category)?.name
                    : "Select property category..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search property category..." />
                  <CommandList>
                    <CommandEmpty>No property category found.</CommandEmpty>
                    <CommandGroup>
                      {mockPropertyCategories.map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            setFormData({...formData, property_category: category.id});
                            setOpenPropertyCategory(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.property_category === category.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category.name}
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
                            // Check if this is an edit mode and status is changing
                            if (isEdit && previousPropertyStatus && previousPropertyStatus !== status.id) {
                              // Prepare status change data
                              const changeData = {
                                property: selectedProperty?.id,
                                property_status: status.id,
                                date_of_status_change: new Date(),
                                reason_for_status_change: '',
                                destination: ''
                              };
                              setStatusChangeData(changeData);
                              setFormData({...formData, property_status: status.id});
                              setOpenPropertyStatus(false);
                              setIsStatusChangeDialogOpen(true);
                            } else {
                              setFormData({...formData, property_status: status.id});
                              setOpenPropertyStatus(false);
                            }
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
                    ? nextOfKins.find((nok) => nok.id === formData.next_of_kin)?.full_name +
                      ' (' + nextOfKins.find((nok) => nok.id === formData.next_of_kin)?.relationship + ')'
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
                      {nextOfKins.map((nok) => (
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

          {/* Visitor Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="visitor">Visitor</Label>
            <Popover open={openVisitor} onOpenChange={setOpenVisitor}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openVisitor}
                  className="w-full justify-between"
                  type="button"
                  disabled={isLoadingVisitors}
                >
                  {formData.visitor
                    ? (() => {
                        const visitor = visitors.find((v) => v.id === formData.visitor);
                        return visitor 
                          ? `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim()
                          : "Select visitor...";
                      })()
                    : "Select visitor..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search by name, ID, or phone..." />
                  <CommandList>
                    <CommandEmpty>
                      {isLoadingVisitors ? "Loading visitors..." : "No visitor found."}
                    </CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          setFormData({...formData, visitor: ''});
                          setOpenVisitor(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.visitor === '' ? "opacity-100" : "opacity-0"
                          )}
                        />
                        None
                      </CommandItem>
                      {visitors.map((visitor) => {
                        const fullName = `${visitor.first_name} ${visitor.middle_name} ${visitor.last_name}`.replace(/\s+/g, ' ').trim();
                        const searchValue = `${fullName} ${visitor.id_number} ${visitor.phone_number}`;
                        return (
                          <CommandItem
                            key={visitor.id}
                            value={searchValue}
                            onSelect={() => {
                              setFormData({...formData, visitor: visitor.id});
                              setOpenVisitor(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.visitor === visitor.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{fullName}</span>
                              <span className="text-xs text-gray-500">
                                ID: {visitor.id_number} | Phone: {visitor.phone_number}
                              </span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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

  // APIs integration
  function populateList(response: any, msg: string, setData: any) {
    if(handleServerError(response, setPropertyLoading)) return

    if ("results" in response) {
      const data = response.results
      handleEmptyList(data, msg, setPropertyLoading)
      if (msg === "There are no visitors for the selected prisoner" && data.length) {
        setLoading(prev => ({...prev, visitor: true}))
      }
      if (msg === "There are no visitor items for the selected visitor" && data.length) {
        setLoading(prev => ({...prev, property: true}))
      }
      setData(data)
    }
  }

  function populateListX(response: any, msg: string, setData: any) {
      if(handleServerError(response, setPropertyLoading)) return false

      if ("results" in response) {
        const data = response.results
        if (handleEmptyList(data, msg, setPropertyLoading)) return false
        setData(data)
        return true
      }

      return false
    }

  useEffect(() => {
    if (propertyLoading){
      async function fetchData () {
         try {

           const response1 = await getPrisoners()
           const ok1 = populateListX(response1, "There are no prisoners", setPrisoners)
           if (!ok1) return

           const response = await getProperties()
           populateList(response, "There are no prisoner properties", setProperties)

           setPropertyLoading(false)

         }catch (error) {
           handleCatchError(error)
           setPropertyLoading(false)
         }
      }

      fetchData()
    }
  }, [propertyLoading]);

  useEffect(() => {
    if (isCreateDialogOpen){
      setLoading({visitor: false, property: false, type: false})
      if (!prisoners.length){
        setIsCreateDialogOpen(false)
        toast.error("There are no prisoners, You can't create a property without prisoners");
        return
      }

    }
  }, [isCreateDialogOpen]);

  useEffect(() => {
    console.log(isNextCreateDialogOpen)
  }, [isNextCreateDialogOpen]);


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: '#650000' }}>Property and History</h1>
          <p className="text-gray-600">Manage prisoner property items and their history</p>
        </div>
      </div>

      {
        propertyLoading ? (
          <div className="size-full flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-sm">
                  Fetching Prisoner Property Information, Please wait...
                </p>
            </div>
          </div>
        ) : (
          <>
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
                    <TableRow style={{ backgroundColor: '#650000' }}>
                      <TableHead className="text-white">Prisoner</TableHead>
                      <TableHead className="text-white">Property Type</TableHead>
                      <TableHead className="text-white">Item</TableHead>
                      <TableHead className="text-white">Bag Number</TableHead>
                      <TableHead className="text-white">Quantity</TableHead>
                      <TableHead className="text-white">Amount</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-right text-white">Actions</TableHead>
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
          </>
        )
      }

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        {/*<DialogContent className="max-w-[95vw] w-[1300px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">*/}
        {/*  <div className="flex-1 max-h-[80vh] overflow-y-auto p-6">*/}
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex-1 max-h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Create New Property</DialogTitle>
            <DialogDescription>
              Add property items for a prisoner and visitor
            </DialogDescription>
          </DialogHeader>
          {/*<CreatePropertyForm onSubmit={handleSubmitCreate} />*/}
            <CreatePropertyForm prisoners={prisoners} setIsCreateDialogOpen={setIsCreateDialogOpen}
              setNewDialogLoader={setNewDialogLoader} setLoaderText={setLoaderText}
              setIsNextCreateDialogOpen={setIsNextCreateDialogOpen} setProperties={setProperties}/>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1300px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Edit Property</DialogTitle>
            <DialogDescription>
              Update property information
            </DialogDescription>
          </DialogHeader>
          <PropertyForm onSubmit={handleSubmitEdit} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex-1 max-h-[90vh] p-6">
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
                        {/*<Badge className={!selectedProperty.biometric_consent ? 'bg-green-600' : 'bg-gray-600'}>*/}
                       <Badge>
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
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-600">Status:</p>
                        {getStatusBadge(selectedProperty.property_status_name)}
                      </div>
                      {/*<div>*/}
                      {/*  <p className="text-sm text-gray-600">Description</p>*/}
                      {/*  <p>{status.description}</p>*/}
                      {/*</div>*/}
                      <div>
                        <p className="text-sm text-gray-600">Destination</p>
                        <p>{selectedProperty.destination || '-'}</p>
                      </div>
                    </div>
                    {/*{(() => {*/}
                    {/*  const status = mockPropertyStatuses.find(s => s.id === selectedProperty.property_status);*/}
                    {/*  return status ? (*/}
                    {/*    <div className="space-y-3">*/}
                    {/*      <div className="flex items-center gap-2">*/}
                    {/*        <p className="text-sm text-gray-600">Status:</p>*/}
                    {/*        {getStatusBadge(status.name)}*/}
                    {/*      </div>*/}
                    {/*      <div>*/}
                    {/*        <p className="text-sm text-gray-600">Description</p>*/}
                    {/*        <p>{status.description}</p>*/}
                    {/*      </div>*/}
                    {/*      <div>*/}
                    {/*        <p className="text-sm text-gray-600">Destination</p>*/}
                    {/*        <p>{selectedProperty.destination || '-'}</p>*/}
                    {/*      </div>*/}
                    {/*    </div>*/}
                    {/*  ) : (*/}
                    {/*    <p className="text-gray-500">Status information not available</p>*/}
                    {/*  );*/}
                    {/*})()}*/}
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

              {/* Biometric Data */}
              {selectedProperty.biometric_data && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Biometric Verification</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600">Verified</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Fingerprint Data</p>
                            <div className="mt-2 p-3 bg-gray-50 rounded border text-xs text-gray-600 font-mono break-all">
                              {selectedProperty.biometric_data}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}
          </div>
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

      {/* Next of Kin Management Dialog */}
      <Dialog open={isNextOfKinDialogOpen} onOpenChange={setIsNextOfKinDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize" style={{ resize: 'both' }}>
          <div className="flex-1 overflow-y-auto">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <NextOfKinScreen />
            {/*Next of Kin chodrine*/}
          </div>
        </DialogContent>
      </Dialog>

      {/* Property Status Change Dialog */}
      <PropertyStatusChangeForm
        open={isStatusChangeDialogOpen}
        onOpenChange={setIsStatusChangeDialogOpen}
        onSubmit={handleStatusChangeSubmit}
        editData={statusChangeData}
      />

      {/* Loading Dialog */}
      <Dialog open={newDialogLoader} onOpenChange={setNewDialogLoader}>
        <DialogContent className="max-w-[95vw] w-[1300px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle style={{ color: '#650000' }}></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                    {loaderText}
                  </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Next of Kin create Dialog */}
      <Dialog open={isNextCreateDialogOpen} onOpenChange={setIsNextCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex-1 max-h-[90vh] p-6">
            <DialogHeader>
              <DialogTitle>Add Next of Kin</DialogTitle>
              <DialogDescription>Add a new next of kin contact for a prisoner</DialogDescription>
            </DialogHeader>
            <NextOfKinScreen setNewDialogLoader={setNewDialogLoader} setLoaderText={setLoaderText} isNextCreateDialogOpen={isNextCreateDialogOpen}
                             setIsNextCreateDialogOpen={setIsNextCreateDialogOpen} prisoner={prisonerInfo.prisoner} setNextOfKins={setNextOfKins}/>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

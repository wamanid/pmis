import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import BiometricCapture from '../common/BiometricCapture';
import PropertyStatusChangeForm from './PropertyStatusChangeForm';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
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
  Users,
  List,
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
  PrisonerProperty, PropertyBag, PropertyItem, fetchPropertyById
} from "../../services/propertyServices/propertyService";
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
import { DataTable } from '../common/DataTable';
import type { DataTableColumn } from '../common/DataTable.types';

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

// interface PropertyType {
//   id: string;
//   name: string;
// }

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

// interface PropertyStatus {
//   id: string;
//   name: string;
//   description: string;
// }

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

// const mockPropertyTypes: PropertyType[] = [
//   { id: 'pt1', name: 'Personal Items' },
//   { id: 'pt2', name: 'Clothing' },
//   { id: 'pt3', name: 'Electronics' },
//   { id: 'pt4', name: 'Money' },
//   { id: 'pt5', name: 'Documents' }
// ];

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

// const mockPropertyStatuses: PropertyStatus[] = [
//   { id: 'ps1', name: 'Stored', description: 'Property safely stored in facility' },
//   { id: 'ps2', name: 'Released', description: 'Property released to authorized person' },
//   { id: 'ps3', name: 'Damaged', description: 'Property is damaged or deteriorated' },
//   { id: 'ps4', name: 'Lost', description: 'Property cannot be located' },
//   { id: 'ps5', name: 'Destroyed', description: 'Property destroyed as per regulations' }
// ];

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isNextCreateDialogOpen, setIsNextCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNextOfKinDialogOpen, setIsNextOfKinDialogOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PrisonerProperty | null>(null);
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);
  const [dataTableRefreshKey, setDataTableRefreshKey] = useState(0);
  const [previousPropertyStatus, setPreviousPropertyStatus] = useState('');
  const [statusChangeData, setStatusChangeData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped');

  // APIs integration
  const [propertyLoading, setPropertyLoading] = useState(true)
  const [loading, setLoading] = useState({ visitor: false, property: false, type: false })
  const [newDialogLoader, setNewDialogLoader] = useState(false)
  const [loaderText, setLoaderText] = useState("")
  const [visitorItems, setVisitorItems] = useState<VisitorItem[]>([])
  const [propertyTypes, setPropertyTypes] = useState<Unit[]>([])
  const [propertyStatuses, setPropertyStatuses] = useState<Unit[]>([])
  const [nextOfKins, setNextOfKins] = useState<NextOfKinResponse[]>([])

  // Separate state for prisoner and visitor info (for create mode)
  const [prisonerInfo, setPrisonerInfo] = useState({
    prisoner: '',
    prisonerName: '',
    prisonerNumber: ''
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

  const handleCreate = () => {
    setPrisonerInfo({ prisoner: '' });
    setVisitorInfo({ visitor: '' });
    setBiometricData('');
    setIsCreateDialogOpen(true);
  };

  // const handleAddPropertyItem = () => {
  //   const newItem = {
  //     id: Date.now().toString(),
  //     property_type: '',
  //     property_category: '',
  //     property_item: '',
  //     measurement_unit: '',
  //     property_bag: '',
  //     next_of_kin: 'none',
  //     property_status: '',
  //     quantity: '',
  //     amount: '',
  //     note: '',
  //     destination: ''
  //   };
  //   setPropertyItems([...propertyItems, newItem]);
  // };
  //
  // const handleRemovePropertyItem = (itemId: string) => {
  //   if (propertyItems.length > 1) {
  //     setPropertyItems(propertyItems.filter(item => item.id !== itemId));
  //   }
  // };

  const handleEdit = async (property: PrisonerProperty) => {
    try {
      // Fetch fresh property data from API (Option B pattern)
      const response = await fetchPropertyById(property.id);
      
      if ('error' in response) {
        toast.error(`Failed to fetch property data: ${response.error}`);
        return;
      }
      
      // Set the property data and open dialog
      setSelectedProperty(response);
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property data for editing');
    }

    // setPreviousPropertyStatus(property.property_status); // Store the original status
    // setFormData({
    //   prisoner: property.prisoner,
    //   property_type: property.property_type,
    //   property_category: property.property_category,
    //   property_item: property.property_item,
    //   measurement_unit: property.measurement_unit,
    //   property_bag: property.property_bag,
    //   next_of_kin: property.next_of_kin || 'none',
    //   visitor: property.visitor,
    //   property_status: property.property_status,
    //   quantity: property.quantity,
    //   amount: property.amount,
    //   biometric_consent: property.biometric_consent,
    //   note: property.note,
    //   destination: property.destination
    // });
    // setIsEditDialogOpen(true);

  };

  const handleView = (property: PrisonerProperty) => {
    setSelectedProperty(property);
    setIsViewDialogOpen(true);
  };

  useEffect(() => {
    const anyOpen = isViewDialogOpen || isDeleteDialogOpen || isCreateDialogOpen;
    if (!anyOpen) setSelectedProperty(null);
  }, [isViewDialogOpen, isDeleteDialogOpen, isCreateDialogOpen]);

  const handleDelete = (property: PrisonerProperty) => {
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
    
    // Trigger DataTable refresh by incrementing key
    setDataTableRefreshKey(prev => prev + 1);
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

  // Calculate statistics with memoization for performance
  const { totalProperties, storedProperties, releasedProperties, totalValueDisplay } = useMemo(() => {
    const total = properties.length;
    const stored = properties.filter(p => p.property_status_name === 'Stored').length;
    const released = properties.filter(p => p.property_status_name === 'Released').length;
    
    // Calculate totals per currency
    const currencyTotals: Record<string, { symbol: string; total: number }> = {};
    properties.forEach((property) => {
      if (property.currency_name && property.amount) {
        const currencyName = property.currency_name;
        const currencySymbol = property.currency_symbol || currencyName;
        const amount = parseFloat(property.amount) || 0;
        
        if (!currencyTotals[currencyName]) {
          currencyTotals[currencyName] = { symbol: currencySymbol, total: 0 };
        }
        currencyTotals[currencyName].total += amount;
      }
    });
    
    // Format totals display
    const currencyKeys = Object.keys(currencyTotals);
    let display = '';
    if (currencyKeys.length > 0) {
      display = currencyKeys
        .map(currencyName => {
          const { symbol, total } = currencyTotals[currencyName];
          const formattedTotal = total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
          return `${symbol} ${formattedTotal}`;
        })
        .join(' | ');
    } else {
      display = 'No value';
    }
    
    return {
      totalProperties: total,
      storedProperties: stored,
      releasedProperties: released,
      totalValueDisplay: display
    };
  }, [properties]); // Only recalculate when properties array changes

  // Define DataTable columns
  const columns: DataTableColumn[] = [
    { 
      key: 'prisoner_number', 
      label: 'Prisoner',
      render: (v: any, r: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{v}</span>
          <span className="text-xs text-gray-500">{r.prisoner_name}</span>
        </div>
      ),
      sortable: true,
      filterable: true
    },
    { 
      key: 'property_type_name', 
      label: 'Property Type', 
      sortable: true,
      filterable: true
    },
    { 
      key: 'property_item_name', 
      label: 'Item', 
      sortable: true,
      filterable: true
    },
    { 
      key: 'property_bag_number', 
      label: 'Bag Number', 
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    { 
      key: 'quantity', 
      label: 'Quantity', 
      sortable: true,
      render: (value, row) => `${value} ${row.measurement_unit_name}`
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (value, row) => {
        const amount = formatCurrency(value);
        const symbol = row.currency_symbol || '';
        return symbol ? `${symbol} ${amount}` : amount;
      }
    },
    { 
      key: 'property_status_name', 
      label: 'Status', 
      sortable: true,
      filterable: true,
      render: (value) => getStatusBadge(value)
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )
    },
  ];


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
      fetchData()
    }
  }, [propertyLoading]);

  function populateLists(response: any, msg: string, setData: any) {
    if(handleServerError(response, setPropertyLoading)) return

    if ("results" in response) {
      const data = response.results
      setData(data)
    }
  }

  async function fetchData () {
    try {

     const response1 = await getPrisoners()
     const ok1 = populateListX(response1, "There are no prisoners", setPrisoners)
     if (!ok1) return

     const response = await getProperties()
     populateList(response, "There are no prisoner properties", setProperties)

      const response11 = await getPropertyTypes()
      populateLists(response11, "There are no property types", setPropertyTypes)

      const response31 = await getPropertyStatuses()
      populateLists(response31, "There are no property statuses", setPropertyStatuses)

     setPropertyLoading(false)

   }catch (error) {
     handleCatchError(error)
     setPropertyLoading(false)
   }
  }

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
    console.log("Next of Kin dialog state:", isNextCreateDialogOpen)
    // Stop unnecessary API calls when Next of Kin dialog is open
    if (isNextCreateDialogOpen) {
      console.log("Next of Kin dialog opened - property screen should minimize API calls")
    }
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">Total Value</p>
                      <p className="text-lg font-semibold" style={{ color: '#650000' }}>
                        {totalValueDisplay}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Property Button */}
            <div className="flex justify-end">
              <Button onClick={handleCreate} style={{ backgroundColor: '#650000' }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            {/* Properties DataTable */}
            <Card>
              <CardContent className="pt-6">
                {/* View Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Property Records</h3>
                  <Tabs value={viewMode} onValueChange={(v: string) => setViewMode(v as 'flat' | 'grouped')}>
                    <TabsList>
                      <TabsTrigger value="grouped" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Grouped
                      </TabsTrigger>
                      <TabsTrigger value="flat" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        Flat
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <DataTable
                  key={dataTableRefreshKey}
                  url="/property-management/properties/"
              title="Property Records"
              columns={columns}
              config={{
                search: true,
                export: {
                  pdf: true,
                  csv: true,
                  print: true,
                },
                lengthMenu: [10, 25, 50, 100, -1],
                pagination: true,
                summary: true,
                ...(viewMode === 'grouped' ? {
                  grouping: {
                    groupBy: 'prisoner_number',
                    defaultExpanded: false,

                    renderGroupHeader: (groupValue, items) => {
                      const firstItem = items[0];
                  // Calculate totals per currency
                  const currencyTotals: Record<string, { symbol: string; total: number }> = {};
                  
                  items.forEach((item: any) => {
                    if (item.currency_name && item.amount) {
                      const currencyName = item.currency_name;
                      const currencySymbol = item.currency_symbol || currencyName;
                      const amount = parseFloat(item.amount) || 0;
                      
                      if (!currencyTotals[currencyName]) {
                        currencyTotals[currencyName] = { symbol: currencySymbol, total: 0 };
                      }
                      currencyTotals[currencyName].total += amount;
                    }
                  });
                  
                  // Format totals display
                  const currencyKeys = Object.keys(currencyTotals);
                  let totalsDisplay = '';
                  
                  if (currencyKeys.length > 0) {
                    totalsDisplay = currencyKeys.map(currencyName => {
                      const { symbol, total } = currencyTotals[currencyName];
                      const formattedTotal = new Intl.NumberFormat('en-US').format(total);
                      return `${symbol} ${formattedTotal}`;
                    }).join(' | ');
                  } else {
                    totalsDisplay = 'No currency items';
                  }
                  
                  const statusCounts = items.reduce((acc, item) => {
                    acc[item.property_status_name] = (acc[item.property_status_name] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  return (
                    <div className="flex items-center justify-between w-full py-1">
                      <div className="flex items-center gap-4">
                        <Users className="h-5 w-5" style={{ color: '#650000' }} />
                        <span className="font-semibold text-base">
                          {groupValue} | {firstItem?.prisoner_name || 'Unknown'}
                        </span>
                        <span className="text-sm text-muted-foreground font-normal">
                          {items.length} {items.length === 1 ? 'property' : 'properties'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">
                          Total: {totalsDisplay}
                        </span>
                        <div className="flex gap-2">
                          {Object.entries(statusCounts).map(([status, count]) => (
                            <Badge key={status} variant="outline" className="text-xs">
                              {status}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                  },
                }
                } : {})
              }}
            />
              </CardContent>
            </Card>
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
            <DialogTitle style={{ color: '#650000' }}>
              {selectedProperty ? 'Edit Property' : 'Create New Property'}
            </DialogTitle>
            <DialogDescription>
              {selectedProperty ? 'Update property information' : 'Add property items for a prisoner and visitor'}
            </DialogDescription>
          </DialogHeader>
          {/*<CreatePropertyForm onSubmit={handleSubmitCreate} />*/}
            <CreatePropertyForm prisoners={prisoners} setIsCreateDialogOpen={setIsCreateDialogOpen}
              setNewDialogLoader={setNewDialogLoader} setLoaderText={setLoaderText}
              setIsNextCreateDialogOpen={setIsNextCreateDialogOpen} setProperties={setProperties}
              selectedProperty={selectedProperty} propertyTypes={propertyTypes} propertyStatuses={propertyStatuses}
              setDataTableRefreshKey={setDataTableRefreshKey} setPrisonerInfo={setPrisonerInfo}/>
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
        <DialogContent className="max-w-sm max-h-[95vh] overflow-hidden p-0 flex flex-col">
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
            <NextOfKinScreen 
              setNewDialogLoader={setNewDialogLoader} 
              setLoaderText={setLoaderText} 
              isNextCreateDialogOpen={isNextCreateDialogOpen}
              setIsNextCreateDialogOpen={setIsNextCreateDialogOpen} 
              prisoner={prisonerInfo.prisoner} 
              setNextOfKins={setNextOfKins}
              prisonerName={prisonerInfo.prisonerName || selectedProperty?.prisoner_name}
              prisonerNumber={prisonerInfo.prisonerNumber}
            />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

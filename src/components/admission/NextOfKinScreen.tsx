import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
  Users,
  Phone,
  MapPin,
  UserCheck,
  Check,
  ChevronsUpDown,
  FileText,
  IdCard
} from 'lucide-react';
import { cn } from '../ui/utils';

interface NextOfKin {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  surname: string;
  phone_number: string;
  alternate_phone_number: string;
  id_number: string;
  lc1: string;
  discharge_property: boolean;
  relationship: string;
  sex: string;
  id_type: string;
  address_region: string;
  address_district: string;
  address_county: string;
  address_sub_county: string;
  address_parish: string;
  address_village: string;
  prisoner: string;
  relationship_type: string;
  sex_type: string;
  id_type_value: string;
}

// Mock data
const mockPrisoners = [
  { id: '1', full_name: 'John Doe', prisoner_number: 'P001' },
  { id: '2', full_name: 'Jane Smith', prisoner_number: 'P002' },
  { id: '3', full_name: 'Bob Johnson', prisoner_number: 'P003' },
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

const mockNextOfKin: NextOfKin[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    prisoner_number: 'P001',
    full_name: 'Mary Doe',
    first_name: 'Mary',
    middle_name: 'Ann',
    surname: 'Doe',
    phone_number: '0700123456',
    alternate_phone_number: '0750123456',
    id_number: 'CM12345678901234',
    lc1: 'LC1 Chairman - Village A',
    discharge_property: true,
    relationship: 'Spouse',
    sex: 'Female',
    id_type: 'National ID',
    address_region: 'Central',
    address_district: 'Kampala',
    address_county: 'Kampala Central',
    address_sub_county: 'Central Division',
    address_parish: 'Industrial Area',
    address_village: 'Nakawa Estate',
    prisoner: '1',
    relationship_type: '1',
    sex_type: '2',
    id_type_value: '1',
  },
  {
    id: '2',
    prisoner_name: 'Jane Smith',
    prisoner_number: 'P002',
    full_name: 'Robert Smith',
    first_name: 'Robert',
    middle_name: 'James',
    surname: 'Smith',
    phone_number: '0701234567',
    alternate_phone_number: '',
    id_number: 'CM98765432109876',
    lc1: 'LC1 Chairman - Village B',
    discharge_property: false,
    relationship: 'Parent',
    sex: 'Male',
    id_type: 'National ID',
    address_region: 'Eastern',
    address_district: 'Mbale',
    address_county: 'Mbale Municipality',
    address_sub_county: 'Industrial Division',
    address_parish: 'Naboa',
    address_village: 'Naboa Trading Center',
    prisoner: '2',
    relationship_type: '2',
    sex_type: '1',
    id_type_value: '1',
  },
];

const NextOfKinScreen: React.FC = () => {
  const [nextOfKinRecords, setNextOfKinRecords] = useState<NextOfKin[]>(mockNextOfKin);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<NextOfKin | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    prisoner: '',
    first_name: '',
    middle_name: '',
    surname: '',
    phone_number: '',
    alternate_phone_number: '',
    id_number: '',
    lc1: '',
    discharge_property: false,
    relationship_type: '',
    sex_type: '',
    id_type_value: '',
    address_region: '',
    address_district: '',
    address_county: '',
    address_sub_county: '',
    address_parish: '',
    address_village: '',
  });

  // CRUD operations
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const prisoner = mockPrisoners.find(p => p.id === formData.prisoner);
    const relationship = mockRelationships.find(r => r.id === formData.relationship_type);
    const sex = mockSexTypes.find(s => s.id === formData.sex_type);
    const idType = mockIdTypes.find(it => it.id === formData.id_type_value);
    const region = mockRegions.find(r => r.id === formData.address_region);
    const district = mockDistricts.find(d => d.id === formData.address_district);
    
    const newRecord: NextOfKin = {
      id: (nextOfKinRecords.length + 1).toString(),
      prisoner_name: prisoner?.full_name || '',
      prisoner_number: prisoner?.prisoner_number || '',
      full_name: `${formData.first_name} ${formData.middle_name} ${formData.surname}`.trim(),
      first_name: formData.first_name,
      middle_name: formData.middle_name,
      surname: formData.surname,
      phone_number: formData.phone_number,
      alternate_phone_number: formData.alternate_phone_number,
      id_number: formData.id_number,
      lc1: formData.lc1,
      discharge_property: formData.discharge_property,
      relationship: relationship?.name || '',
      sex: sex?.name || '',
      id_type: idType?.name || '',
      address_region: region?.name || '',
      address_district: district?.name || '',
      address_county: formData.address_county,
      address_sub_county: formData.address_sub_county,
      address_parish: formData.address_parish,
      address_village: formData.address_village,
      prisoner: formData.prisoner,
      relationship_type: formData.relationship_type,
      sex_type: formData.sex_type,
      id_type_value: formData.id_type_value,
    };
    
    setNextOfKinRecords([...nextOfKinRecords, newRecord]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('Next of Kin added successfully');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord) {
      const prisoner = mockPrisoners.find(p => p.id === formData.prisoner);
      const relationship = mockRelationships.find(r => r.id === formData.relationship_type);
      const sex = mockSexTypes.find(s => s.id === formData.sex_type);
      const idType = mockIdTypes.find(it => it.id === formData.id_type_value);
      const region = mockRegions.find(r => r.id === formData.address_region);
      const district = mockDistricts.find(d => d.id === formData.address_district);
      
      const updatedRecords = nextOfKinRecords.map(record =>
        record.id === selectedRecord.id
          ? {
              ...record,
              prisoner_name: prisoner?.full_name || record.prisoner_name,
              prisoner_number: prisoner?.prisoner_number || record.prisoner_number,
              full_name: `${formData.first_name} ${formData.middle_name} ${formData.surname}`.trim(),
              first_name: formData.first_name,
              middle_name: formData.middle_name,
              surname: formData.surname,
              phone_number: formData.phone_number,
              alternate_phone_number: formData.alternate_phone_number,
              id_number: formData.id_number,
              lc1: formData.lc1,
              discharge_property: formData.discharge_property,
              relationship: relationship?.name || record.relationship,
              sex: sex?.name || record.sex,
              id_type: idType?.name || record.id_type,
              address_region: region?.name || record.address_region,
              address_district: district?.name || record.address_district,
              address_county: formData.address_county,
              address_sub_county: formData.address_sub_county,
              address_parish: formData.address_parish,
              address_village: formData.address_village,
              prisoner: formData.prisoner,
              relationship_type: formData.relationship_type,
              sex_type: formData.sex_type,
              id_type_value: formData.id_type_value,
            }
          : record
      );
      setNextOfKinRecords(updatedRecords);
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      resetForm();
      toast.success('Next of Kin updated successfully');
    }
  };

  const handleDelete = () => {
    if (deleteRecordId) {
      setNextOfKinRecords(nextOfKinRecords.filter(record => record.id !== deleteRecordId));
      setDeleteRecordId(null);
      toast.success('Next of Kin deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      prisoner: '',
      first_name: '',
      middle_name: '',
      surname: '',
      phone_number: '',
      alternate_phone_number: '',
      id_number: '',
      lc1: '',
      discharge_property: false,
      relationship_type: '',
      sex_type: '',
      id_type_value: '',
      address_region: '',
      address_district: '',
      address_county: '',
      address_sub_county: '',
      address_parish: '',
      address_village: '',
    });
  };

  // Pagination
  const filteredRecords = nextOfKinRecords.filter(record =>
    record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.prisoner_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.phone_number.includes(searchTerm) ||
    record.relationship.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const totalRecords = nextOfKinRecords.length;
  const totalPrisoners = new Set(nextOfKinRecords.map(r => r.prisoner)).size;
  const authorizedForDischarge = nextOfKinRecords.filter(r => r.discharge_property).length;

  const NextOfKinForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [openRelationship, setOpenRelationship] = useState(false);
    const [openSex, setOpenSex] = useState(false);
    const [openIdType, setOpenIdType] = useState(false);

    return (
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Prisoner Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Prisoner Information</h3>
          <Separator />
          
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
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Personal Information</h3>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                value={formData.middle_name}
                onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                placeholder="Enter middle name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                placeholder="Enter surname"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex_type">Sex *</Label>
              <Popover open={openSex} onOpenChange={setOpenSex}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSex}
                    className="w-full justify-between"
                    type="button"
                  >
                    {formData.sex_type
                      ? mockSexTypes.find((s) => s.id === formData.sex_type)?.name
                      : "Select sex..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No sex found.</CommandEmpty>
                      <CommandGroup>
                        {mockSexTypes.map((sex) => (
                          <CommandItem
                            key={sex.id}
                            value={sex.name}
                            onSelect={() => {
                              setFormData({...formData, sex_type: sex.id});
                              setOpenSex(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.sex_type === sex.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {sex.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_type">Relationship *</Label>
              <Popover open={openRelationship} onOpenChange={setOpenRelationship}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openRelationship}
                    className="w-full justify-between"
                    type="button"
                  >
                    {formData.relationship_type
                      ? mockRelationships.find((r) => r.id === formData.relationship_type)?.name
                      : "Select relationship..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No relationship found.</CommandEmpty>
                      <CommandGroup>
                        {mockRelationships.map((relationship) => (
                          <CommandItem
                            key={relationship.id}
                            value={relationship.name}
                            onSelect={() => {
                              setFormData({...formData, relationship_type: relationship.id});
                              setOpenRelationship(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.relationship_type === relationship.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {relationship.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Contact Information</h3>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternate_phone_number">Alternate Phone Number</Label>
              <Input
                id="alternate_phone_number"
                value={formData.alternate_phone_number}
                onChange={(e) => setFormData({...formData, alternate_phone_number: e.target.value})}
                placeholder="Enter alternate phone number"
              />
            </div>
          </div>
        </div>

        {/* Identification */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Identification</h3>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_type_value">ID Type</Label>
              <Popover open={openIdType} onOpenChange={setOpenIdType}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openIdType}
                    className="w-full justify-between"
                    type="button"
                  >
                    {formData.id_type_value
                      ? mockIdTypes.find((it) => it.id === formData.id_type_value)?.name
                      : "Select ID type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No ID type found.</CommandEmpty>
                      <CommandGroup>
                        {mockIdTypes.map((idType) => (
                          <CommandItem
                            key={idType.id}
                            value={idType.name}
                            onSelect={() => {
                              setFormData({...formData, id_type_value: idType.id});
                              setOpenIdType(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.id_type_value === idType.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {idType.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                placeholder="Enter ID number"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Address Information</h3>
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_region">Region</Label>
              <Select
                value={formData.address_region}
                onValueChange={(value) => setFormData({...formData, address_region: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {mockRegions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_district">District</Label>
              <Select
                value={formData.address_district}
                onValueChange={(value) => setFormData({...formData, address_district: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {mockDistricts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_county">County</Label>
              <Input
                id="address_county"
                value={formData.address_county}
                onChange={(e) => setFormData({...formData, address_county: e.target.value})}
                placeholder="Enter county"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_sub_county">Sub County</Label>
              <Input
                id="address_sub_county"
                value={formData.address_sub_county}
                onChange={(e) => setFormData({...formData, address_sub_county: e.target.value})}
                placeholder="Enter sub county"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_parish">Parish</Label>
              <Input
                id="address_parish"
                value={formData.address_parish}
                onChange={(e) => setFormData({...formData, address_parish: e.target.value})}
                placeholder="Enter parish"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_village">Village</Label>
              <Input
                id="address_village"
                value={formData.address_village}
                onChange={(e) => setFormData({...formData, address_village: e.target.value})}
                placeholder="Enter village"
              />
            </div>
          </div>
        </div>

        {/* Other Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Other Information</h3>
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="lc1">LC1 Chairman</Label>
            <Input
              id="lc1"
              value={formData.lc1}
              onChange={(e) => setFormData({...formData, lc1: e.target.value})}
              placeholder="Enter LC1 chairman name"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="discharge_property"
              checked={formData.discharge_property}
              onCheckedChange={(checked) => setFormData({...formData, discharge_property: checked as boolean})}
            />
            <Label htmlFor="discharge_property" className="cursor-pointer">
              Authorized to Collect Discharge Property
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Next of Kin
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
          <h1 className="text-3xl" style={{ color: '#650000' }}>Next of Kin Management</h1>
          <p className="text-gray-600">Manage prisoner next of kin contacts and information</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Next of Kin</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalRecords}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Prisoners with Next of Kin</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalPrisoners}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Authorized for Discharge</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{authorizedForDischarge}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search next of kin..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              style={{ backgroundColor: '#650000' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Next of Kin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next of Kin Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prisoner</TableHead>
                <TableHead>Next of Kin Name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>ID Number</TableHead>
                <TableHead>Discharge Auth</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No next of kin records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div>{record.prisoner_name}</div>
                        <div className="text-sm text-gray-500">{record.prisoner_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.relationship}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {record.phone_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{record.address_district}, {record.address_region}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{record.id_number || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.discharge_property ? (
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setFormData({
                              prisoner: record.prisoner,
                              first_name: record.first_name,
                              middle_name: record.middle_name,
                              surname: record.surname,
                              phone_number: record.phone_number,
                              alternate_phone_number: record.alternate_phone_number,
                              id_number: record.id_number,
                              lc1: record.lc1,
                              discharge_property: record.discharge_property,
                              relationship_type: record.relationship_type,
                              sex_type: record.sex_type,
                              id_type_value: record.id_type_value,
                              address_region: record.address_region,
                              address_district: record.address_district,
                              address_county: record.address_county,
                              address_sub_county: record.address_sub_county,
                              address_parish: record.address_parish,
                              address_village: record.address_village,
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteRecordId(record.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex-1 max-h-[90vh] p-6">
            <DialogHeader>
              <DialogTitle>Add Next of Kin</DialogTitle>
              <DialogDescription>Add a new next of kin contact for a prisoner</DialogDescription>
            </DialogHeader>
            <NextOfKinForm onSubmit={handleCreate} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Next of Kin</DialogTitle>
              <DialogDescription>Update next of kin information</DialogDescription>
            </DialogHeader>
            <NextOfKinForm onSubmit={handleUpdate} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Next of Kin Details</DialogTitle>
              <DialogDescription>View next of kin information</DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6 mt-4">
                {/* Prisoner Information */}
                <div className="space-y-4">
                  <h3 className="text-lg" style={{ color: '#650000' }}>Prisoner Information</h3>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Prisoner Name</Label>
                      <p>{selectedRecord.prisoner_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Prisoner Number</Label>
                      <p>{selectedRecord.prisoner_number}</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg" style={{ color: '#650000' }}>Personal Information</h3>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Full Name</Label>
                      <p>{selectedRecord.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Sex</Label>
                      <p>{selectedRecord.sex}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Relationship</Label>
                      <Badge variant="outline">{selectedRecord.relationship}</Badge>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg" style={{ color: '#650000' }}>Contact Information</h3>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Phone Number</Label>
                      <p>{selectedRecord.phone_number}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Alternate Phone Number</Label>
                      <p>{selectedRecord.alternate_phone_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Identification */}
                <div className="space-y-4">
                  <h3 className="text-lg" style={{ color: '#650000' }}>Identification</h3>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">ID Type</Label>
                      <p>{selectedRecord.id_type || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">ID Number</Label>
                      <p>{selectedRecord.id_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg" style={{ color: '#650000' }}>Address Information</h3>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Region</Label>
                      <p>{selectedRecord.address_region}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">District</Label>
                      <p>{selectedRecord.address_district}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">County</Label>
                      <p>{selectedRecord.address_county}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Sub County</Label>
                      <p>{selectedRecord.address_sub_county}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Parish</Label>
                      <p>{selectedRecord.address_parish}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Village</Label>
                      <p>{selectedRecord.address_village}</p>
                    </div>
                  </div>
                </div>

                {/* Other Information */}
                <div className="space-y-4">
                  <h3 className="text-lg" style={{ color: '#650000' }}>Other Information</h3>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">LC1 Chairman</Label>
                      <p>{selectedRecord.lc1 || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Authorized for Discharge Property</Label>
                      <p>{selectedRecord.discharge_property ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the next of kin record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NextOfKinScreen;

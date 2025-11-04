import {useCallback, useEffect, useState} from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Users, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Switch } from '../ui/switch';
import { ManualLockupTableForm } from './ManualLockupTableForm';
import { ManualLockupTableView } from './ManualLockupTableView';

import {
  addLockUpRecord,
  getLockType, getManualLockup, getPrisonerCategories, getSexes,
  getStation, ManualLockUpItem,
} from '../../services/otherServices/manualLockupIntegration';
import axiosInstance from "../../services/axiosInstance";

// Mock data for foreign key references
const mockStations = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Central Station' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'East Wing Station' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'West Wing Station' },
];

const mockLockupTypes = [
  { id: '660e8400-e29b-41d4-a716-446655440001', name: 'Morning Lockup' },
  { id: '660e8400-e29b-41d4-a716-446655440002', name: 'Midday Lockup' },
  { id: '660e8400-e29b-41d4-a716-446655440003', name: 'Evening Lockup' },
];

const mockPrisonerCategories = [
  { id: '770e8400-e29b-41d4-a716-446655440001', name: 'Convict' },
  { id: '770e8400-e29b-41d4-a716-446655440002', name: 'Remand' },
  { id: '770e8400-e29b-41d4-a716-446655440003', name: 'Civil Debtor' },
  { id: '770e8400-e29b-41d4-a716-446655440004', name: 'Awaiting Trial' },
];

const mockSexOptions = [
  { id: '880e8400-e29b-41d4-a716-446655440001', name: 'Male' },
  { id: '880e8400-e29b-41d4-a716-446655440002', name: 'Female' },
];

interface ManualLockup {
  id: string;
  is_active: boolean;
  date: string;
  lockup_time: string;
  location: 'court' | 'labour' | 'station';
  count: number;
  station: string;
  type: string;
  prisoner_category: string;
  sex: string;
}

// Mock existing lockup data
const mockLockupData: ManualLockup[] = [
  {
    id: '1',
    is_active: true,
    date: '2025-10-16',
    lockup_time: '06:00',
    location: 'station',
    count: 45,
    station: '550e8400-e29b-41d4-a716-446655440001',
    type: '660e8400-e29b-41d4-a716-446655440001',
    prisoner_category: '770e8400-e29b-41d4-a716-446655440001',
    sex: '880e8400-e29b-41d4-a716-446655440001',
  },
  {
    id: '2',
    is_active: true,
    date: '2025-10-16',
    lockup_time: '12:00',
    location: 'labour',
    count: 32,
    station: '550e8400-e29b-41d4-a716-446655440002',
    type: '660e8400-e29b-41d4-a716-446655440002',
    prisoner_category: '770e8400-e29b-41d4-a716-446655440002',
    sex: '880e8400-e29b-41d4-a716-446655440001',
  },
  {
    id: '3',
    is_active: true,
    date: '2025-10-16',
    lockup_time: '18:00',
    location: 'court',
    count: 28,
    station: '550e8400-e29b-41d4-a716-446655440001',
    type: '660e8400-e29b-41d4-a716-446655440003',
    prisoner_category: '770e8400-e29b-41d4-a716-446655440004',
    sex: '880e8400-e29b-41d4-a716-446655440002',
  },
];

export function ManualLockupScreen() {
  const [lockups, setLockups] = useState<ManualLockUpItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stationDataLoading, setStationDataLoading] = useState(true);
  const [recordsListLoading, setRecordsListLoading] = useState(true)
  const [stations, setStations] = useState([])
  const [lockTypes, setLockTypes] = useState([])
  const [sexes, setSexes] = useState([])
  const [prisonerCategories, setPrisonerCategories] = useState([])

  // Callback to handle records created from the table form
  const handleRecordsCreated = (records: ManualLockup[]) => {
    setLockups([...records, ...lockups]);
  };

  // Form state
  const [formData, setFormData] = useState({
    is_active: true,
    date: new Date().toISOString().split('T')[0],
    lockup_time: '',
    location: '',
    count: '',
    station: '',
    type: '',
    prisoner_category: '',
    sex: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.date || !formData.lockup_time || !formData.location || 
        !formData.count || !formData.station || !formData.type || 
        !formData.prisoner_category || !formData.sex) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    // await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newLockup: ManualLockup = {
      id: Date.now().toString(),
      is_active: formData.is_active,
      date: formData.date,
      lockup_time: formData.lockup_time,
      location: formData.location as 'court' | 'labour' | 'station',
      count: parseInt(formData.count),
      station: formData.station,
      type: formData.type,
      prisoner_category: formData.prisoner_category,
      sex: formData.sex,
    };

    try {
      const response = await addLockUpRecord(newLockup)
      if ('error' in response){
           toast.error(response.error);
           return
      }

      setLockups([response, ...lockups]);
      setDialogOpen(false);
      toast.success('Manual lockup record added successfully');

      // Reset form
      setFormData({
        is_active: true,
        date: new Date().toISOString().split('T')[0],
        lockup_time: '',
        location: '',
        count: '',
        station: '',
        type: '',
        prisoner_category: '',
        sex: '',
      });

    } catch (error: any) {
      if (!error?.response) {
        toast.error('Failed to connect to server. Please try again.');
      }
    } finally {
      setLoading(false)
    }

  };

  const getStationName = (id: string) => mockStations.find(s => s.id === id)?.name || 'Unknown';
  const getTypeName = (id: string) => mockLockupTypes.find(t => t.id === id)?.name || 'Unknown';
  const getCategoryName = (id: string) => mockPrisonerCategories.find(c => c.id === id)?.name || 'Unknown';
  const getSexName = (id: string) => mockSexOptions.find(s => s.id === id)?.name || 'Unknown';

  const filteredLockups = lockups.filter(lockup => {
    const searchLower = searchTerm.toLowerCase();
    return (
      getStationName(lockup.station).toLowerCase().includes(searchLower) ||
      getTypeName(lockup.type).toLowerCase().includes(searchLower) ||
      getCategoryName(lockup.prisoner_category).toLowerCase().includes(searchLower) ||
      lockup.location.toLowerCase().includes(searchLower) ||
      lockup.date.includes(searchLower)
    );
  });

  const getLocationBadgeColor = (location: string) => {
    switch (location) {
      case 'court': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'labour': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'station': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default: return '';
    }
  };

  useEffect(() => {
    async function fetchData(){
      if (dialogOpen){
       try {

         const response1 = await getStation()
         if ('error' in response1){
           toast.error(response1.error);
           setDialogOpen(false);
           return
         }
         const data1 = response1.results
         if (data1.length === 0){
           toast.error("There are no stations")
           setDialogOpen(false);
           return
         }
         setStations(data1)

         const response2 = await getLockType()
         if ('error' in response2){
           toast.error(response2.error);
           setDialogOpen(false);
           return
         }
         const data2 = response2.results
         if (data2.length === 0){
           toast.error("There are no lock types")
           setDialogOpen(false);
           return
         }
         setLockTypes(data2)

         const response3 = await getPrisonerCategories()
         if ('error' in response3){
           toast.error(response3.error);
           setDialogOpen(false);
           return
         }
         const data3 = response3.results
         if (data3.length === 0){
           toast.error("There are no prisoner categories")
           setDialogOpen(false);
           return
         }
         setPrisonerCategories(data3)

         const response4 = await getSexes()
         if ('error' in response4){
           toast.error(response4.error);
           setDialogOpen(false);
           return
         }
         const data4 = response4.results
         if (data1.length === 0){
           toast.error("There are no sex categories")
           setDialogOpen(false);
           return
         }
         setSexes(data4)

         setStationDataLoading(false)

       } catch (error) {
          if (!error?.response) {
            toast.error('Failed to connect to server. Please try again.');
          }
       }
     }
    }
     fetchData()
  }, [dialogOpen]);

  useEffect(() => {
    const fetchData = async () => {
      if (recordsListLoading){
        try {
          const response = await getManualLockup()
           if ('error' in response){
             toast.error(response.error);
             return
           }
           const data = response.results
           setLockups(data)

        } catch (error) {
          if (!error?.response) {
              toast.error('Failed to connect to server. Please try again.');
          }
        }finally {
          setRecordsListLoading(false)
        }
      }
    }
    fetchData()
  }, []);


  if (recordsListLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">
            Fetching lockups
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[#650000] mb-2">Manual Lockup Management</h1>
          <p className="text-muted-foreground">Record and manage manual lockup counts</p>
        </div>
      </div>

      {/* Tabs for switching between forms */}
      <Tabs defaultValue="table-form" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="table-form">Table Form</TabsTrigger>
          <TabsTrigger value="table-view">Table View</TabsTrigger>
          <TabsTrigger value="records">Records List</TabsTrigger>
        </TabsList>

        {/* Table Form Tab */}
        <TabsContent value="table-form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Manual Lockup</CardTitle>
              <CardDescription>
                Enter lockup counts by location and prisoner category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualLockupTableForm onRecordsCreated={handleRecordsCreated} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table View Tab */}
        <TabsContent value="table-view" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Lockup Summary</CardTitle>
              <CardDescription>
                View grouped lockup entries with expandable details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualLockupTableView lockups={lockups} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Records List Tab */}
        <TabsContent value="records" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Records</CardDescription>
                <CardTitle className="text-3xl text-[#650000]">{lockups.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Records</CardDescription>
                <CardTitle className="text-3xl text-[#650000]">
                  {lockups.filter(l => l.is_active).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Count</CardDescription>
                <CardTitle className="text-3xl text-[#650000]">
                  {lockups.reduce((sum, l) => sum + l.count, 0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Today's Records</CardDescription>
                <CardTitle className="text-3xl text-[#650000]">
                  {lockups.filter(l => l.date === new Date().toISOString().split('T')[0]).length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          {/* Add Lockup Dialog Button */}
          <div className="flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lockup (Legacy Form)
                </Button>
              </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <>
              {
                stationDataLoading ? (
                    <div className="size-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground text-sm">
                          Fetching station data, Please wait...
                        </p>
                      </div>
                    </div>
                ) : (
                    <>
                      <DialogHeader>
              <DialogTitle>Add Manual Lockup Record</DialogTitle>
              <DialogDescription>
                Enter the details for the manual lockup count
              </DialogDescription>
            </DialogHeader>
                      <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Is Active Switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Mark this record as active
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-9"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Lockup Time */}
                  <div className="space-y-2">
                    <Label htmlFor="lockup_time">
                      Lockup Time <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lockup_time"
                        type="time"
                        className="pl-9"
                        value={formData.lockup_time}
                        onChange={(e) => setFormData({ ...formData, lockup_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                      required
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="court">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Court
                          </div>
                        </SelectItem>
                        <SelectItem value="labour">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Labour
                          </div>
                        </SelectItem>
                        <SelectItem value="station">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Station
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Count */}
                  <div className="space-y-2">
                    <Label htmlFor="count">
                      Count <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="count"
                        type="number"
                        min="0"
                        className="pl-9"
                        placeholder="Enter count"
                        value={formData.count}
                        onChange={(e) => setFormData({ ...formData, count: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Station */}
                <div className="space-y-2">
                  <Label htmlFor="station">
                    Station <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.station}
                    onValueChange={(value) => setFormData({ ...formData, station: value })}
                    required
                  >
                    <SelectTrigger id="station">
                      <SelectValue placeholder="Select station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lockup Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Lockup Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select lockup type" />
                    </SelectTrigger>
                    <SelectContent>
                      {lockTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prisoner Category */}
                <div className="space-y-2">
                  <Label htmlFor="prisoner_category">
                    Prisoner Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.prisoner_category}
                    onValueChange={(value) => setFormData({ ...formData, prisoner_category: value })}
                    required
                  >
                    <SelectTrigger id="prisoner_category">
                      <SelectValue placeholder="Select prisoner category" />
                    </SelectTrigger>
                    <SelectContent>
                      {prisonerCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sex */}
                <div className="space-y-2">
                  <Label htmlFor="sex">
                    Sex <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => setFormData({ ...formData, sex: value })}
                    required
                  >
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      {sexes.map((sex) => (
                        <SelectItem key={sex.id} value={sex.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {sex.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading ? 'Adding...' : 'Add Lockup'}
                </Button>
              </DialogFooter>
            </form>
                    </>
                )
              }
            </>
          </DialogContent>
        </Dialog>
          </div>
          {/* Table Card */}
          <Card>
                      <CardHeader>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>Manual Lockup Records</CardTitle>
                        <CardDescription>View and manage all manual lockup entries</CardDescription>
                      </div>
                      <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search lockups..."
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      </div>
                      </CardHeader>
                      <CardContent>
                    <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Station</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Sex</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLockups.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground h-24">
                              No lockup records found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLockups.map((lockup) => (
                            <TableRow key={lockup.id}>
                              <TableCell>
                                <Badge variant={lockup.is_active ? 'default' : 'secondary'}>
                                  {lockup.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>{lockup.date}</TableCell>
                              <TableCell>{lockup.lockup_time}</TableCell>
                              <TableCell>
                                <Badge className={getLocationBadgeColor(lockup.location)}>
                                  {lockup.location.charAt(0).toUpperCase() + lockup.location.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{lockup.station_name}</TableCell>
                              <TableCell>{lockup.type_name}</TableCell>
                              <TableCell>{lockup.prisoner_category_name}</TableCell>
                              <TableCell>{lockup.sex_name}</TableCell>
                              <TableCell className="text-right">{lockup.count}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    </div>
                    </CardContent>
                    </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

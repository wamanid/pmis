import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Users, Search, UserPlus, Building2, MapPin, Calendar, CheckIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  fetchStaffDeployments,
  fetchStaffDeploymentSummary,
  fetchStations,
  searchHRMISStaff,
  createStaffDeployment,
  StaffDeploymentRecord,
  StaffDeploymentSummary,
  Station,
  HRMISStaff
} from '../../services/mockApi';
import { cn } from '../ui/utils';
import {
  addStaffDeployment, getStaffDeployment,
  getStaffProfile,
  StaffDeployment, StaffDeploymentResponse,
  StaffItem
} from "../../services/otherServices/staffDeploymentIntegration";
import {getStation} from "../../services/otherServices/manualLockupIntegration";

export function StaffDeploymentScreen() {
  const [deployments, setDeployments] = useState<StaffDeploymentResponse[]>([]);
  const [summary, setSummary] = useState<StaffDeploymentSummary | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deployOpen, setDeployOpen] = useState(false);
  
  // HRMIS Staff Search
  const [hrmisSearchOpen, setHrmisSearchOpen] = useState(false);
  const [hrmisSearchQuery, setHrmisSearchQuery] = useState('');
  const [hrmisResults, setHrmisResults] = useState<StaffItem[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);
  const [loadingHRMIS, setLoadingHRMIS] = useState(false);
  
  // Station Search for deployment
  const [stationSearchOpen, setStationSearchOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [summaryX, setSummaryX] = useState({staff: 0, deployed: 0, stations: 0})
  
  // Form data
  const [deployFormData, setDeployFormData] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const [staffProfile, setStaffProfile] = useState<StaffItem[]>([])
  const [staffProfileLoading, setStaffProfileLoading] = useState(true)
  const [stationsX, setStationsX] = useState([])

  useEffect(() => {
    // loadData();
    fetchData()
  }, []);

  // useEffect(() => {
  //   const searchHRMIS = async () => {
  //     if (hrmisSearchQuery.length >= 2) {
  //       setLoadingHRMIS(true);
  //       try {
  //         const results = await searchHRMISStaff(hrmisSearchQuery);
  //         setHrmisResults(results);
  //       } catch (error) {
  //         console.error('Failed to search HRMIS:', error);
  //       } finally {
  //         setLoadingHRMIS(false);
  //       }
  //     } else {
  //       setHrmisResults([]);
  //     }
  //   };
  //
  //   const debounce = setTimeout(searchHRMIS, 300);
  //   return () => clearTimeout(debounce);
  // }, [hrmisSearchQuery]);
  const fetchData = async () => {
    setLoading(true);
    try {

      let data1 = []
      let data = []
      let data2 = []

      const response = await getStaffDeployment()
      if ('error' in response){
         toast.error(response.error);
      }

      if ("results" in response) {
        data = response.results
         setDeployments(data)
        // console.log(data)
      }

      const response1 = await getStaffProfile()
       if ('error' in response1){
         toast.error(response1.error)
       }
      if ("results" in response1) {
        data1 = response1.results
        if (data1.length === 0){
          toast.error("There are no staff members")
        }
        setStaffProfile(data1)
        setHrmisResults(data1)
      }

      const response2 = await getStation()

       if ('error' in response2){
         toast.error(response2.error)
       }
      if ("results" in response2) {
        data2 = response2.results
        if (data2.length === 0){
         toast.error("There are no staff members")
       }
        setStationsX(data2)
      }

      handleSummary(data, data1, data2)

    }catch (error) {
      if (!error?.response) {
        toast.error('Failed to connect to server. Please try again.');
      }
    }finally {
      setLoading(false)
    }
  }

  const handleSummary = (data: [], data1: [], data2: []) => {
      const is_active = (data ?? []).filter(da => da.is_active).length
      const uniqueStations = new Set(data.map(item => item.station_name));
      const uniqueStationCount = uniqueStations.size;
      setSummaryX({staff: data1.length, deployed: is_active, stations: uniqueStationCount})
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [deploymentsData, summaryData, stationsData] = await Promise.all([
        fetchStaffDeployments({ is_active: true }),
        fetchStaffDeploymentSummary(),
        fetchStations()
      ]);
      setDeployments(deploymentsData.results);
      setSummary(summaryData);
      setStations(stationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load staff deployment data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member from HRMIS');
      return;
    }

    if (!selectedStation) {
      toast.error('Please select a station');
      return;
    }

    if (!deployFormData.start_date) {
      toast.error('Please select a start date');
      return;
    }

    try {

      const deployment : StaffDeployment = {
        is_active: true,
        start_date: deployFormData.start_date,
        end_date: deployFormData.end_date,
        station: selectedStation.id,
        profile: selectedStaff.id
      }

      const response = await addStaffDeployment(deployment)
      if ('error' in response){
         toast.error(response.error);
         return
      }

      toast.success('Staff member deployed successfully');
      setDeployOpen(false);
      resetForm();
      setDeployments((prev) => [...prev, response as StaffDeploymentResponse]);
      // loadData()

      // Split name into parts
      // const nameParts = selectedStaff.name.trim().split(' ');
      // const first_name = nameParts[0] || '';
      // const last_name = nameParts[nameParts.length - 1] || '';
      // const middle_name = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
      //
      // await createStaffDeployment({
      //   first_name,
      //   middle_name,
      //   last_name,
      //   force_number: selectedStaff.force_number,
      //   date_of_birth: selectedStaff.dob,
      //   rank: selectedStaff.rank,
      //   station: selectedStation.id.toString(),
      //   start_date: deployFormData.start_date,
      //   end_date: deployFormData.end_date || undefined
      // });
      //
      // toast.success('Staff member deployed successfully');
      // setDeployOpen(false);
      // resetForm();
      // loadData();
    } catch (error) {
      if (!error?.response) {
        toast.error('Failed to connect to server. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setSelectedStaff(null);
    setSelectedStation(null);
    setHrmisSearchQuery('');
    setDeployFormData({
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
  };

  const filteredDeployments = deployments.filter(deployment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      deployment.full_name.toLowerCase().includes(query) ||
      deployment.force_number.toLowerCase().includes(query) ||
      deployment.station_name.toLowerCase().includes(query) ||
      deployment.rank.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
      const fetchData = async () => {
        setStaffProfileLoading(true)
        if(deployOpen){
          if (staffProfile.length == 0){
             toast.error("There are no staff members")
             setDeployOpen(false);
             return
          }

          if (stationsX.length == 0){
             toast.error("There are no stations")
             setDeployOpen(false);
             return
          }
           setStaffProfileLoading(false)
        }
      }
      fetchData()
  }, [deployOpen]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1>Staff Deployments</h1>
            <p className="text-muted-foreground">Manage staff deployments across stations</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1>Staff Deployments</h1>
          <p className="text-muted-foreground">Manage staff deployments across stations, districts, and regions</p>
        </div>
        <Dialog open={deployOpen} onOpenChange={setDeployOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: '#650000' }} className="hover:opacity-90">
              <UserPlus className="h-4 w-4 mr-2" />
              Deploy Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            {
              staffProfileLoading ? (
                  <>
                    <DialogHeader>
                      <DialogTitle></DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div className="size-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground text-sm">
                        Fetching station data, Please wait...
                      </p>
                    </div>
                  </div>
                  </>

              ) : (
                 <>
                   <DialogHeader>
                    <DialogTitle>Deploy Staff Member</DialogTitle>
                    <DialogDescription>Search HRMIS and assign a staff member to a station</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* HRMIS Staff Search */}
                    <div className="space-y-2">
                      <Label>Staff Member (from HRMIS)</Label>
                      <Popover open={hrmisSearchOpen} onOpenChange={setHrmisSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={hrmisSearchOpen}
                            className="w-full justify-between"
                          >
                            {selectedStaff ? (
                              <span>{selectedStaff.force_number} - {selectedStaff.first_name} {selectedStaff.first_name}</span>
                            ) : (
                              <span className="text-muted-foreground">Search by force number or name...</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search staff..."
                              value={hrmisSearchQuery}
                              onValueChange={setHrmisSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {loadingHRMIS ? 'Searching HRMIS...' : 'No staff found. Try searching by force number or name.'}
                              </CommandEmpty>
                              <CommandGroup>
                                {hrmisResults.map((staff) => (
                                  <CommandItem
                                    key={staff.force_number}
                                    value={staff.force_number}
                                    onSelect={() => {
                                      setSelectedStaff(staff);
                                      setHrmisSearchOpen(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedStaff?.force_number === staff.force_number
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{staff.force_number} - {staff.first_name} {staff.last_name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {staff.rank_name} • DOB: {staff.date_of_birth}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Display selected staff details */}
                    {selectedStaff && (
                      <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                        <div><span className="font-medium">Force Number:</span> {selectedStaff.force_number}</div>
                        <div><span className="font-medium">Name:</span> {selectedStaff.first_name} {selectedStaff.last_name}</div>
                        <div><span className="font-medium">Rank:</span> {selectedStaff.rank_name}</div>
                        <div><span className="font-medium">Date of Birth:</span> {selectedStaff.date_of_birth}</div>
                      </div>
                    )}

                    {/* Station Selection */}
                    <div className="space-y-2">
                      <Label>Station</Label>
                      <Popover open={stationSearchOpen} onOpenChange={setStationSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={stationSearchOpen}
                            className="w-full justify-between"
                          >
                            {selectedStation ? selectedStation.name : "Select station..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search station..." />
                            <CommandList>
                              <CommandEmpty>No station found.</CommandEmpty>
                              <CommandGroup>
                                {stationsX.map((station) => (
                                  <CommandItem
                                    key={station.id}
                                    value={station.name}
                                    onSelect={() => {
                                      setSelectedStation(station);
                                      setStationSearchOpen(false);
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedStation?.id === station.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {station.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={deployFormData.start_date}
                          onChange={(e) => setDeployFormData({ ...deployFormData, start_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date (Optional)</Label>
                        <Input
                          type="date"
                          value={deployFormData.end_date}
                          onChange={(e) => setDeployFormData({ ...deployFormData, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
              <Button variant="outline" onClick={() => { setDeployOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleDeploy} style={{ backgroundColor: '#650000' }} className="hover:opacity-90">
                Deploy Staff
              </Button>
            </DialogFooter>
                 </>
              )
            }
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-2xl">{summaryX.staff}</div>
                <p className="text-xs text-muted-foreground">All deployed staff</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8" style={{ color: '#650000' }} />
              <div>
                <div className="text-2xl">{summaryX.deployed}</div>
                <p className="text-xs text-muted-foreground">Currently deployed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl">{summaryX.stations}</div>
                <p className="text-xs text-muted-foreground">Stations with staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="staff-list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff-list">Staff List</TabsTrigger>
          <TabsTrigger value="by-station">By Station</TabsTrigger>
          <TabsTrigger value="by-district">By District</TabsTrigger>
          <TabsTrigger value="by-region">By Region</TabsTrigger>
        </TabsList>

        {/* Staff List Tab */}
        <TabsContent value="staff-list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Staff Deployment List</CardTitle>
                  <CardDescription>View all staff deployments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, force number, station..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Deployments Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Force Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Age at Deployment</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeployments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No staff deployments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeployments.map(deployment => (
                        <TableRow key={deployment.id}>
                          <TableCell className="font-mono text-sm">{deployment.force_number}</TableCell>
                          <TableCell>{deployment.full_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{deployment.rank}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{deployment.station_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{new Date(deployment.start_date).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {deployment.end_date ? (
                              <span className="text-sm">{new Date(deployment.end_date).toLocaleDateString()}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{deployment.age_at_deployment}</span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={deployment.is_active ? 'default' : 'secondary'}
                              style={deployment.is_active ? { backgroundColor: '#650000' } : {}}
                            >
                              {deployment.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Station Tab */}
        <TabsContent value="by-station">
          <Card>
            <CardHeader>
              <CardTitle>Staff by Station</CardTitle>
              <CardDescription>Summary of staff deployment per station</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Station</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Staff Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.by_station.map(item => (
                      <TableRow key={item.station_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" style={{ color: '#650000' }} />
                            <span>{item.station_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.district_name}</TableCell>
                        <TableCell>{item.region_name}</TableCell>
                        <TableCell className="text-right">
                          <Badge style={{ backgroundColor: '#650000' }}>{item.staff_count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By District Tab */}
        <TabsContent value="by-district">
          <Card>
            <CardHeader>
              <CardTitle>Staff by District</CardTitle>
              <CardDescription>Summary of staff deployment per district</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>District</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Staff Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.by_district.map(item => (
                      <TableRow key={item.district_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>{item.district_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.region_name}</TableCell>
                        <TableCell className="text-right">
                          <Badge style={{ backgroundColor: '#650000' }}>{item.staff_count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Region Tab */}
        <TabsContent value="by-region">
          <Card>
            <CardHeader>
              <CardTitle>Staff by Region</CardTitle>
              <CardDescription>Summary of staff deployment per region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Staff Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.by_region.map(item => (
                      <TableRow key={item.region_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-500" />
                            <span>{item.region_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge style={{ backgroundColor: '#650000' }}>{item.staff_count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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

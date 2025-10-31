import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Users,
  Calendar as CalendarIcon,
  Upload,
  Check,
  ChevronsUpDown,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";

// Types based on API
interface ShiftDetail {
  id: string;
  station_name: string;
  shift_name: string;
  shift_leader_username: string;
  shift_leader_full_name: string;
  created_by_name: string;
  deployments: string;
  deployment_count: string;
  handover_report: string;
  handover_report_doc: string;
  station: string;
  shift: string;
  shift_leader: number;
}

interface ShiftDeployment {
  id: string;
  station_name: string;
  shift_name: string;
  staff_username: string;
  deployment_area_name: string;
  name: string;
  force_number: string;
  rank: string;
  shift_date: string;
  end_date: string;
  report: string;
  station: string;
  shift: string;
  staff: number;
  deployment_area: string;
}

interface Region {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  region: string;
}

interface Station {
  id: string;
  name: string;
  district: string;
}

interface Shift {
  id: string;
  name: string;
}

interface DeploymentArea {
  id: string;
  name: string;
}

interface Staff {
  id: number;
  force_number: string;
  name: string;
  rank: string;
}

export default function ShiftDeploymentsScreen() {
  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState<string>("");
  
  // Data states
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [deploymentAreas, setDeploymentAreas] = useState<DeploymentArea[]>([]);
  const [shiftDetails, setShiftDetails] = useState<ShiftDetail[]>([]);
  const [shiftDeployments, setShiftDeployments] = useState<ShiftDeployment[]>([]);
  
  // UI states
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedShiftDetail, setSelectedShiftDetail] = useState<ShiftDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Form states for shift detail
  const [shiftForm, setShiftForm] = useState({
    station: "",
    shift: "",
    shift_leader: "",
    handover_report: "",
    handover_report_doc: null as File | null,
  });
  
  // Form states for staff deployment
  const [staffForm, setStaffForm] = useState({
    station: "",
    shift: "",
    staff: "",
    deployment_area: "",
    shift_date: new Date(),
    end_date: new Date(),
    report: "",
  });
  
  // Combobox states
  const [openStationCombo, setOpenStationCombo] = useState(false);
  const [openShiftCombo, setOpenShiftCombo] = useState(false);
  const [openStaffCombo, setOpenStaffCombo] = useState(false);
  const [openDeploymentAreaCombo, setOpenDeploymentAreaCombo] = useState(false);
  const [openShiftLeaderCombo, setOpenShiftLeaderCombo] = useState(false);
  
  // Dates for calendar
  const [shiftDateOpen, setShiftDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Mock data
  useEffect(() => {
    // Load regions
    setRegions([
      { id: "1", name: "Central Region" },
      { id: "2", name: "Western Region" },
      { id: "3", name: "Eastern Region" },
    ]);
    
    // Load shifts
    setShifts([
      { id: "1", name: "Morning Shift (6AM - 2PM)" },
      { id: "2", name: "Afternoon Shift (2PM - 10PM)" },
      { id: "3", name: "Night Shift (10PM - 6AM)" },
    ]);
    
    // Load deployment areas
    setDeploymentAreas([
      { id: "1", name: "Reception" },
      { id: "2", name: "Prison Farm" },
      { id: "3", name: "Escort" },
      { id: "4", name: "Labour" },
      { id: "5", name: "Security Gate" },
      { id: "6", name: "Administration Block" },
    ]);
    
    // Load mock shift details
    setShiftDetails([
      {
        id: "1",
        station_name: "Luzira Prison",
        shift_name: "Morning Shift (6AM - 2PM)",
        shift_leader_username: "john.doe",
        shift_leader_full_name: "John Doe",
        created_by_name: "Admin User",
        deployments: "12",
        deployment_count: "12",
        handover_report: "All areas covered, no incidents",
        handover_report_doc: "",
        station: "1",
        shift: "1",
        shift_leader: 1,
      },
      {
        id: "2",
        station_name: "Luzira Prison",
        shift_name: "Afternoon Shift (2PM - 10PM)",
        shift_leader_username: "jane.smith",
        shift_leader_full_name: "Jane Smith",
        created_by_name: "Admin User",
        deployments: "10",
        deployment_count: "10",
        handover_report: "Smooth transition, 2 prisoners in medical",
        handover_report_doc: "",
        station: "1",
        shift: "2",
        shift_leader: 2,
      },
    ]);
  }, []);

  // Load districts when region changes
  useEffect(() => {
    if (selectedRegion) {
      const mockDistricts: District[] = [
        { id: "1", name: "Kampala", region: "1" },
        { id: "2", name: "Wakiso", region: "1" },
        { id: "3", name: "Masaka", region: "2" },
      ];
      setDistricts(mockDistricts.filter(d => d.region === selectedRegion));
      setSelectedDistrict("");
      setSelectedStation("");
    } else {
      setDistricts([]);
    }
  }, [selectedRegion]);

  // Load stations when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const mockStations: Station[] = [
        { id: "1", name: "Luzira Prison", district: "1" },
        { id: "2", name: "Kitalya Prison", district: "2" },
        { id: "3", name: "Masaka Prison", district: "3" },
      ];
      setStations(mockStations.filter(s => s.district === selectedDistrict));
      setSelectedStation("");
    } else {
      setStations([]);
    }
  }, [selectedDistrict]);

  // Filter shift details by selected station
  const filteredShiftDetails = shiftDetails.filter(shift => {
    if (selectedStation && shift.station !== selectedStation) return false;
    if (searchQuery) {
      return (
        shift.shift_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.shift_leader_full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.station_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append('station', shiftForm.station);
      // formData.append('shift', shiftForm.shift);
      // formData.append('shift_leader', shiftForm.shift_leader);
      // formData.append('handover_report', shiftForm.handover_report);
      // if (shiftForm.handover_report_doc) {
      //   formData.append('handover_report_doc', shiftForm.handover_report_doc);
      // }
      // const response = await fetch('/api/station-management/api/shift-details/', {
      //   method: 'POST',
      //   body: formData
      // });
      
      toast.success("Shift created successfully");
      setIsShiftDialogOpen(false);
      setShiftForm({
        station: "",
        shift: "",
        shift_leader: "",
        handover_report: "",
        handover_report_doc: null,
      });
    } catch (error) {
      toast.error("Failed to create shift");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaffToShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual API call
      // const payload = {
      //   station: staffForm.station,
      //   shift: staffForm.shift,
      //   staff: staffForm.staff,
      //   deployment_area: staffForm.deployment_area,
      //   shift_date: format(staffForm.shift_date, 'yyyy-MM-dd'),
      //   end_date: format(staffForm.end_date, 'yyyy-MM-dd'),
      //   report: staffForm.report
      // };
      // const response = await fetch('/api/station-management/api/shift-deployments/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      
      toast.success("Staff member added to shift successfully");
      setIsStaffDialogOpen(false);
      setStaffForm({
        station: "",
        shift: "",
        staff: "",
        deployment_area: "",
        shift_date: new Date(),
        end_date: new Date(),
        report: "",
      });
    } catch (error) {
      toast.error("Failed to add staff to shift");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeployments = (shift: ShiftDetail) => {
    setSelectedShiftDetail(shift);
    // Load deployments for this shift
    // TODO: Fetch from API
    const mockDeployments: ShiftDeployment[] = [
      {
        id: "1",
        station_name: "Luzira Prison",
        shift_name: shift.shift_name,
        staff_username: "officer1",
        deployment_area_name: "Reception",
        name: "Officer James",
        force_number: "UPS001",
        rank: "Corporal",
        shift_date: "2025-10-25",
        end_date: "2025-10-25",
        report: "All duties completed",
        station: shift.station,
        shift: shift.id,
        staff: 1,
        deployment_area: "1",
      },
    ];
    setShiftDeployments(mockDeployments);
  };

  const mockStaff: Staff[] = [
    { id: 1, force_number: "UPS001", name: "Officer James", rank: "Corporal" },
    { id: 2, force_number: "UPS002", name: "Officer Mary", rank: "Sergeant" },
    { id: 3, force_number: "UPS003", name: "Officer John", rank: "Inspector" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Shift Deployments</h1>
        <p className="text-muted-foreground">
          Manage shift schedules and staff deployments
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={!selectedRegion}
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="station">Station</Label>
              <Select
                value={selectedStation}
                onValueChange={setSelectedStation}
                disabled={!selectedDistrict}
              >
                <SelectTrigger id="station">
                  <SelectValue placeholder="Select Station" />
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
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by shift name, leader, or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
                <DialogDescription>
                  Create a new shift and assign a shift leader
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateShift} className="space-y-4 mt-4">
                {/* Station - Searchable */}
                <div className="space-y-2">
                  <Label>Station *</Label>
                  <Popover open={openStationCombo} onOpenChange={setOpenStationCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openStationCombo}
                        className="w-full justify-between"
                      >
                        {shiftForm.station
                          ? stations.find((s) => s.id === shiftForm.station)?.name
                          : "Select station..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search station..." />
                        <CommandEmpty>No station found.</CommandEmpty>
                        <CommandGroup>
                          {stations.map((station) => (
                            <CommandItem
                              key={station.id}
                              value={station.name}
                              onSelect={() => {
                                setShiftForm({ ...shiftForm, station: station.id });
                                setOpenStationCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  shiftForm.station === station.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {station.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Shift - Searchable */}
                <div className="space-y-2">
                  <Label>Shift *</Label>
                  <Popover open={openShiftCombo} onOpenChange={setOpenShiftCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openShiftCombo}
                        className="w-full justify-between"
                      >
                        {shiftForm.shift
                          ? shifts.find((s) => s.id === shiftForm.shift)?.name
                          : "Select shift..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search shift..." />
                        <CommandEmpty>No shift found.</CommandEmpty>
                        <CommandGroup>
                          {shifts.map((shift) => (
                            <CommandItem
                              key={shift.id}
                              value={shift.name}
                              onSelect={() => {
                                setShiftForm({ ...shiftForm, shift: shift.id });
                                setOpenShiftCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  shiftForm.shift === shift.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {shift.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Shift Leader - Searchable */}
                <div className="space-y-2">
                  <Label>Shift Leader *</Label>
                  <Popover open={openShiftLeaderCombo} onOpenChange={setOpenShiftLeaderCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openShiftLeaderCombo}
                        className="w-full justify-between"
                      >
                        {shiftForm.shift_leader
                          ? mockStaff.find((s) => s.id.toString() === shiftForm.shift_leader)?.name
                          : "Select shift leader..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search staff..." />
                        <CommandEmpty>No staff found.</CommandEmpty>
                        <CommandGroup>
                          {mockStaff.map((staff) => (
                            <CommandItem
                              key={staff.id}
                              value={staff.name}
                              onSelect={() => {
                                setShiftForm({ ...shiftForm, shift_leader: staff.id.toString() });
                                setOpenShiftLeaderCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  shiftForm.shift_leader === staff.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {staff.name} ({staff.force_number}) - {staff.rank}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Handover Report */}
                <div className="space-y-2">
                  <Label htmlFor="handover_report">Handover Report</Label>
                  <Textarea
                    id="handover_report"
                    placeholder="Enter handover report details..."
                    value={shiftForm.handover_report}
                    onChange={(e) => setShiftForm({ ...shiftForm, handover_report: e.target.value })}
                    rows={4}
                  />
                </div>

                {/* Handover Report Document */}
                <div className="space-y-2">
                  <Label htmlFor="handover_doc">Handover Report Document</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="handover_doc"
                      type="file"
                      onChange={(e) => setShiftForm({ 
                        ...shiftForm, 
                        handover_report_doc: e.target.files?.[0] || null 
                      })}
                      accept=".pdf,.doc,.docx"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, DOC, DOCX
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsShiftDialogOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={loading || !shiftForm.station || !shiftForm.shift || !shiftForm.shift_leader}
                  >
                    {loading ? "Creating..." : "Create Shift"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff to Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Staff Member to Shift</DialogTitle>
                <DialogDescription>
                  Deploy a staff member to a specific shift and area
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStaffToShift} className="space-y-4 mt-4">
                {/* Station - Defaults to selected station */}
                <div className="space-y-2">
                  <Label>Station *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {staffForm.station
                          ? stations.find((s) => s.id === staffForm.station)?.name
                          : selectedStation 
                            ? stations.find((s) => s.id === selectedStation)?.name
                            : "Select station..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search station..." />
                        <CommandEmpty>No station found.</CommandEmpty>
                        <CommandGroup>
                          {stations.map((station) => (
                            <CommandItem
                              key={station.id}
                              value={station.name}
                              onSelect={() => {
                                setStaffForm({ ...staffForm, station: station.id });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  (staffForm.station || selectedStation) === station.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {station.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Shift - Searchable */}
                <div className="space-y-2">
                  <Label>Shift *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {staffForm.shift
                          ? shiftDetails.find((s) => s.id === staffForm.shift)?.shift_name
                          : "Select shift..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search shift..." />
                        <CommandEmpty>No shift found.</CommandEmpty>
                        <CommandGroup>
                          {filteredShiftDetails.map((shift) => (
                            <CommandItem
                              key={shift.id}
                              value={shift.shift_name}
                              onSelect={() => {
                                setStaffForm({ ...staffForm, shift: shift.id });
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  staffForm.shift === shift.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {shift.shift_name} - {shift.station_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Staff - Searchable */}
                <div className="space-y-2">
                  <Label>Staff Member *</Label>
                  <Popover open={openStaffCombo} onOpenChange={setOpenStaffCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openStaffCombo}
                        className="w-full justify-between"
                      >
                        {staffForm.staff
                          ? mockStaff.find((s) => s.id.toString() === staffForm.staff)?.name
                          : "Select staff..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search staff..." />
                        <CommandEmpty>No staff found.</CommandEmpty>
                        <CommandGroup>
                          {mockStaff.map((staff) => (
                            <CommandItem
                              key={staff.id}
                              value={staff.name}
                              onSelect={() => {
                                setStaffForm({ ...staffForm, staff: staff.id.toString() });
                                setOpenStaffCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  staffForm.staff === staff.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {staff.name} ({staff.force_number}) - {staff.rank}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Deployment Area - Searchable */}
                <div className="space-y-2">
                  <Label>Deployment Area *</Label>
                  <Popover open={openDeploymentAreaCombo} onOpenChange={setOpenDeploymentAreaCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDeploymentAreaCombo}
                        className="w-full justify-between"
                      >
                        {staffForm.deployment_area
                          ? deploymentAreas.find((a) => a.id === staffForm.deployment_area)?.name
                          : "Select deployment area..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search area..." />
                        <CommandEmpty>No area found.</CommandEmpty>
                        <CommandGroup>
                          {deploymentAreas.map((area) => (
                            <CommandItem
                              key={area.id}
                              value={area.name}
                              onSelect={() => {
                                setStaffForm({ ...staffForm, deployment_area: area.id });
                                setOpenDeploymentAreaCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  staffForm.deployment_area === area.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {area.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Shift Date */}
                <div className="space-y-2">
                  <Label>Shift Date *</Label>
                  <Popover open={shiftDateOpen} onOpenChange={setShiftDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left",
                          !staffForm.shift_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {staffForm.shift_date ? (
                          format(staffForm.shift_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={staffForm.shift_date}
                        onSelect={(date) => {
                          if (date) {
                            setStaffForm({ ...staffForm, shift_date: date });
                            setShiftDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left",
                          !staffForm.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {staffForm.end_date ? (
                          format(staffForm.end_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={staffForm.end_date}
                        onSelect={(date) => {
                          if (date) {
                            setStaffForm({ ...staffForm, end_date: date });
                            setEndDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Report */}
                <div className="space-y-2">
                  <Label htmlFor="report">Report</Label>
                  <Textarea
                    id="report"
                    placeholder="Enter deployment report..."
                    value={staffForm.report}
                    onChange={(e) => setStaffForm({ ...staffForm, report: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsStaffDialogOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={loading || !staffForm.shift || !staffForm.staff || !staffForm.deployment_area}
                  >
                    {loading ? "Adding..." : "Add to Shift"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Shift Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Shift Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Shift Leader</TableHead>
                  <TableHead>Staff Count</TableHead>
                  <TableHead>Handover Report</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShiftDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No shift details found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShiftDetails.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{shift.station_name}</TableCell>
                      <TableCell>{shift.shift_name}</TableCell>
                      <TableCell>
                        <div>
                          <p>{shift.shift_leader_full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            @{shift.shift_leader_username}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {shift.deployment_count} staff
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {shift.handover_report || "No report"}
                        </div>
                      </TableCell>
                      <TableCell>{shift.created_by_name}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDeployments(shift)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          View Staff
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Deployments Table (shown when a shift is selected) */}
      {selectedShiftDetail && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Deployments - {selectedShiftDetail.shift_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Force Number</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Deployment Area</TableHead>
                    <TableHead>Shift Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Report</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftDeployments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No staff deployments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    shiftDeployments.map((deployment) => (
                      <TableRow key={deployment.id}>
                        <TableCell>{deployment.name}</TableCell>
                        <TableCell>{deployment.force_number}</TableCell>
                        <TableCell>{deployment.rank}</TableCell>
                        <TableCell>{deployment.deployment_area_name}</TableCell>
                        <TableCell>{deployment.shift_date}</TableCell>
                        <TableCell>{deployment.end_date}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {deployment.report || "No report"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

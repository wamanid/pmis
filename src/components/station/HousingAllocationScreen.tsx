import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
import {
  Home,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Users,
  Building,
  AlertTriangle,
  Grid3x3,
  Layers,
  DoorClosed,
  Filter,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { toast } from "sonner@2.0.3";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {useFilterRefresh} from "../../hooks/useFilterRefresh";
import {useFilters} from "../../contexts/FilterContext";

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

interface Block {
  id: string;
  name: string;
  station: string;
}

interface Ward {
  id: string;
  station_name?: string;
  ward_type_name?: string;
  block_name?: string;
  security_classification_name?: string;
  created_by_name?: string;
  ward_capacity?: string;
  occupancy?: string;
  congestion?: string;
  name: string;
  ward_number: string;
  ward_area?: string;
  description?: string;
  station: string;
  ward_type: string;
  block: string;
  security_classification: string;
}

interface Cell {
  id: string;
  name: string;
  ward: string;
}

interface WardType {
  id: string;
  name: string;
}

interface SecurityClassification {
  id: string;
  name: string;
}

interface Prisoner {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
}

interface HousingAssignment {
  id?: string;
  prisoner: string;
  prisoner_name?: string;
  ward: string;
  ward_name?: string;
  cell: string;
  cell_name?: string;
}

interface OverviewData {
  capacity: number;
  occupancy: number;
  congestion_level: number;
  blocks: number;
  wards: number;
  cells: number;
}

export default function HousingAllocationScreen() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [searchTerm, setSearchTerm] = useState("");

  // Filters
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedStation, setSelectedStation] = useState("");

  // Data
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [wardTypes, setWardTypes] = useState<WardType[]>([]);
  const [securityClassifications, setSecurityClassifications] = useState<
    SecurityClassification[]
  >([]);
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [housingAssignments, setHousingAssignments] = useState<
    HousingAssignment[]
  >([]);
  const [overviewData, setOverviewData] = useState<OverviewData>({
    capacity: 0,
    occupancy: 0,
    congestion_level: 0,
    blocks: 0,
    wards: 0,
    cells: 0,
  });

  // Dialog states
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isWardDialogOpen, setIsWardDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<HousingAssignment | null>(null);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(false);

  // Searchable select states
  const [prisonerSearchOpen, setPrisonerSearchOpen] = useState(false);
  const [wardSearchOpen, setWardSearchOpen] = useState(false);
  const [cellSearchOpen, setCellSearchOpen] = useState(false);
  const [selectedWardForCells, setSelectedWardForCells] = useState("");

  const [housingLoading, setHousingLoading] = useState(false)
  const { region, district, station } = useFilters();

  // Forms
  const {
    register: registerAssignment,
    handleSubmit: handleSubmitAssignment,
    reset: resetAssignment,
    control: controlAssignment,
    formState: { errors: assignmentErrors },
  } = useForm<HousingAssignment>();

  const {
    register: registerWard,
    handleSubmit: handleSubmitWard,
    reset: resetWard,
    setValue: setWardValue,
    control: controlWard,
    formState: { errors: wardErrors },
  } = useForm<Ward>();

  // Load mock data
  useEffect(() => {
    loadMockData();
  }, []);

  // Load overview data on mount and when filters change
  useEffect(() => {
    loadOverviewData();
  }, [selectedRegion, selectedDistrict, selectedStation]);

  // Reset dependent filters when parent filter changes
  useEffect(() => {
    if (selectedRegion) {
      setSelectedDistrict("");
      setSelectedStation("");
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedDistrict) {
      setSelectedStation("");
    }
  }, [selectedDistrict]);

  const loadMockData = () => {
    // Mock regions
    const mockRegions: Region[] = [
      { id: "reg-1", name: "Central Region" },
      { id: "reg-2", name: "Eastern Region" },
      { id: "reg-3", name: "Western Region" },
    ];
    setRegions(mockRegions);

    // Mock districts
    const mockDistricts: District[] = [
      { id: "dist-1", name: "Kampala", region: "reg-1" },
      { id: "dist-2", name: "Wakiso", region: "reg-1" },
      { id: "dist-3", name: "Mbale", region: "reg-2" },
      { id: "dist-4", name: "Jinja", region: "reg-2" },
    ];
    setDistricts(mockDistricts);

    // Mock stations
    const mockStations: Station[] = [
      { id: "st-1", name: "Luzira Prison", district: "dist-1" },
      { id: "st-2", name: "Kitalya Prison", district: "dist-2" },
      { id: "st-3", name: "Mbale Prison", district: "dist-3" },
    ];
    setStations(mockStations);

    // Mock blocks
    const mockBlocks: Block[] = [
      { id: "blk-1", name: "Block A", station: "st-1" },
      { id: "blk-2", name: "Block B", station: "st-1" },
      { id: "blk-3", name: "Block C", station: "st-1" },
    ];
    setBlocks(mockBlocks);

    // Mock ward types
    const mockWardTypes: WardType[] = [
      { id: "wt-1", name: "Male Ward" },
      { id: "wt-2", name: "Female Ward" },
      { id: "wt-3", name: "Juvenile Ward" },
      { id: "wt-4", name: "Remand Ward" },
    ];
    setWardTypes(mockWardTypes);

    // Mock security classifications
    const mockSecurityClassifications: SecurityClassification[] = [
      { id: "sc-1", name: "Maximum Security" },
      { id: "sc-2", name: "Medium Security" },
      { id: "sc-3", name: "Minimum Security" },
    ];
    setSecurityClassifications(mockSecurityClassifications);

    // Mock wards
    const mockWards: Ward[] = [
      {
        id: "ward-1",
        station_name: "Luzira Prison",
        ward_type_name: "Male Ward",
        block_name: "Block A",
        security_classification_name: "Maximum Security",
        created_by_name: "Admin User",
        ward_capacity: "100",
        occupancy: "85",
        congestion: "85",
        name: "Ward A1",
        ward_number: "WA-001",
        ward_area: "500 sq m",
        description: "Maximum security male ward",
        station: "st-1",
        ward_type: "wt-1",
        block: "blk-1",
        security_classification: "sc-1",
      },
      {
        id: "ward-2",
        station_name: "Luzira Prison",
        ward_type_name: "Female Ward",
        block_name: "Block B",
        security_classification_name: "Medium Security",
        created_by_name: "Admin User",
        ward_capacity: "50",
        occupancy: "42",
        congestion: "84",
        name: "Ward B1",
        ward_number: "WB-001",
        ward_area: "300 sq m",
        description: "Medium security female ward",
        station: "st-1",
        ward_type: "wt-2",
        block: "blk-2",
        security_classification: "sc-2",
      },
    ];
    setWards(mockWards);

    // Mock cells
    const mockCells: Cell[] = [
      { id: "cell-1", name: "Cell A1-01", ward: "ward-1" },
      { id: "cell-2", name: "Cell A1-02", ward: "ward-1" },
      { id: "cell-3", name: "Cell B1-01", ward: "ward-2" },
      { id: "cell-4", name: "Cell B1-02", ward: "ward-2" },
    ];
    setCells(mockCells);

    // Mock prisoners
    const mockPrisoners: Prisoner[] = [
      { id: "p-1", prisoner_name: "John Doe", prisoner_number: "P001" },
      { id: "p-2", prisoner_name: "Jane Smith", prisoner_number: "P002" },
      { id: "p-3", prisoner_name: "Robert Johnson", prisoner_number: "P003" },
    ];
    setPrisoners(mockPrisoners);

    // Mock housing assignments
    const mockAssignments: HousingAssignment[] = [
      {
        id: "ha-1",
        prisoner: "p-1",
        prisoner_name: "John Doe (P001)",
        ward: "ward-1",
        ward_name: "Ward A1 (WA-001)",
        cell: "cell-1",
        cell_name: "Cell A1-01",
      },
      {
        id: "ha-2",
        prisoner: "p-2",
        prisoner_name: "Jane Smith (P002)",
        ward: "ward-2",
        ward_name: "Ward B1 (WB-001)",
        cell: "cell-3",
        cell_name: "Cell B1-01",
      },
    ];
    setHousingAssignments(mockAssignments);
  };

  const loadOverviewData = () => {
    // Mock overview data based on selected filters
    // Different data based on filter selections
    let mockOverview: OverviewData;

    if (selectedStation) {
      // Station-specific data
      mockOverview = {
        capacity: 1200,
        occupancy: 1008,
        congestion_level: 84,
        blocks: 3,
        wards: 12,
        cells: 48,
      };
    } else if (selectedDistrict) {
      // District-level data
      mockOverview = {
        capacity: 3500,
        occupancy: 3150,
        congestion_level: 90,
        blocks: 8,
        wards: 32,
        cells: 128,
      };
    } else if (selectedRegion) {
      // Region-level data
      mockOverview = {
        capacity: 5000,
        occupancy: 4200,
        congestion_level: 84,
        blocks: 12,
        wards: 48,
        cells: 200,
      };
    } else {
      // National-level data (no filters)
      mockOverview = {
        capacity: 15000,
        occupancy: 13500,
        congestion_level: 90,
        blocks: 36,
        wards: 144,
        cells: 600,
      };
    }

    setOverviewData(mockOverview);
  };

  // Get filtered districts based on selected region
  const filteredDistricts = selectedRegion
    ? districts.filter((d) => d.region === selectedRegion)
    : [];

  // Get filtered stations based on selected district
  const filteredStations = selectedDistrict
    ? stations.filter((s) => s.district === selectedDistrict)
    : [];

  // Get filtered blocks based on selected station
  const filteredBlocks = selectedStation
    ? blocks.filter((b) => b.station === selectedStation)
    : blocks;

  // Get filtered wards based on selected station
  const filteredWards = selectedStation
    ? wards.filter((w) => w.station === selectedStation)
    : wards;

  // Get filtered cells based on selected ward
  const getFilteredCells = (wardId: string) => {
    return cells.filter((c) => c.ward === wardId);
  };

  // Housing Assignment CRUD
  const handleAddAssignment = () => {
    if (!selectedStation) {
      toast.error("Please select a station first");
      return;
    }
    setEditingAssignment(null);
    setSelectedWardForCells("");
    resetAssignment();
    setIsAssignmentDialogOpen(true);
  };

  const handleEditAssignment = (assignment: HousingAssignment) => {
    setEditingAssignment(assignment);
    setSelectedWardForCells(assignment.ward);
    Object.keys(assignment).forEach((key) => {
      // Use type assertion for the form value setting
      const value = assignment[key as keyof HousingAssignment];
      if (value !== undefined) {
        resetAssignment({ [key]: value } as any);
      }
    });
    setIsAssignmentDialogOpen(true);
  };

  const handleDeleteAssignment = (id: string) => {
    setHousingAssignments(housingAssignments.filter((a) => a.id !== id));
    toast.success("Housing assignment deleted successfully");
  };

  const onSubmitAssignment = (data: HousingAssignment) => {
    setLoading(true);

    const prisoner = prisoners.find((p) => p.id === data.prisoner);
    const ward = wards.find((w) => w.id === data.ward);
    const cell = cells.find((c) => c.id === data.cell);

    const assignmentData = {
      ...data,
      prisoner_name: prisoner
        ? `${prisoner.prisoner_name} (${prisoner.prisoner_number})`
        : "",
      ward_name: ward ? `${ward.name} (${ward.ward_number})` : "",
      cell_name: cell?.name || "",
    };

    setTimeout(() => {
      if (editingAssignment) {
        setHousingAssignments(
          housingAssignments.map((a) =>
            a.id === editingAssignment.id
              ? { ...assignmentData, id: editingAssignment.id }
              : a
          )
        );
        toast.success("Housing assignment updated successfully");
      } else {
        setHousingAssignments([
          ...housingAssignments,
          { ...assignmentData, id: `ha-${Date.now()}` },
        ]);
        toast.success("Housing assignment created successfully");
      }
      setIsAssignmentDialogOpen(false);
      setSelectedWardForCells("");
      resetAssignment();
      setLoading(false);
    }, 500);
  };

  // Ward CRUD
  const handleAddWard = () => {
    if (!selectedStation) {
      toast.error("Please select a station first");
      return;
    }
    setEditingWard(null);
    resetWard();
    setWardValue("station", selectedStation);
    setIsWardDialogOpen(true);
  };

  const handleEditWard = (ward: Ward) => {
    setEditingWard(ward);
    Object.keys(ward).forEach((key) => {
      setWardValue(key as keyof Ward, ward[key as keyof Ward]);
    });
    setIsWardDialogOpen(true);
  };

  const handleDeleteWard = (id: string) => {
    setWards(wards.filter((w) => w.id !== id));
    toast.success("Ward deleted successfully");
  };

  const onSubmitWard = (data: Ward) => {
    setLoading(true);

    const station = stations.find((s) => s.id === data.station);
    const wardType = wardTypes.find((wt) => wt.id === data.ward_type);
    const block = blocks.find((b) => b.id === data.block);
    const securityClass = securityClassifications.find(
      (sc) => sc.id === data.security_classification
    );

    const wardData = {
      ...data,
      station_name: station?.name || "",
      ward_type_name: wardType?.name || "",
      block_name: block?.name || "",
      security_classification_name: securityClass?.name || "",
      created_by_name: "Current User",
      occupancy: "0",
      congestion: "0",
    };

    setTimeout(() => {
      if (editingWard) {
        setWards(
          wards.map((w) =>
            w.id === editingWard.id ? { ...wardData, id: editingWard.id } : w
          )
        );
        toast.success("Ward updated successfully");
      } else {
        setWards([...wards, { ...wardData, id: `ward-${Date.now()}` }]);
        toast.success("Ward created successfully");
      }
      setIsWardDialogOpen(false);
      resetWard();
      setLoading(false);
    }, 500);
  };

  // Search filtering
  const filteredAssignments = housingAssignments.filter(
    (a) =>
      a.prisoner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ward_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cell_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWardsSearch = filteredWards.filter(
    (w) =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ward_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.block_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCongestionColor = (level: number) => {
    if (level >= 90) return "text-red-600";
    if (level >= 75) return "text-orange-500";
    if (level >= 50) return "text-yellow-500";
    return "text-green-600";
  };

  const getCongestionBadgeVariant = (level: number) => {
    if (level >= 90) return "destructive";
    if (level >= 75) return "default";
    return "secondary";
  };

  //API Integration

  const loadData = async () => {

    // console.log("hhheheh")
    // console.log("Loading with filters:", region, district, station);
    setHousingLoading(true);
    if (station){
      fetchData()
      // setHousingLoading(false);
    }
    else {
      toast.error("Please select a station first");
    }
  };

  useFilterRefresh(loadData, [region, district, station]);

  async function fetchData () {

  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#650000]">Housing Allocation & Congestion Levels</h1>
          <p className="text-gray-600 mt-1">
            Manage prisoner housing assignments and monitor congestion levels
          </p>
        </div>
      </div>

      {
        housingLoading ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching Housing Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
           <>
              {/* Overview Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600">Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-[#650000]" />
                        <span className="text-2xl">{overviewData.capacity.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600">Occupancy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#650000]" />
                        <span className="text-2xl">{overviewData.occupancy.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600">
                        Congestion Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-5 w-5 ${getCongestionColor(
                              overviewData.congestion_level
                            )}`}
                          />
                          <span
                            className={`text-2xl ${getCongestionColor(
                              overviewData.congestion_level
                            )}`}
                          >
                            {overviewData.congestion_level}%
                          </span>
                        </div>
                        <Progress
                          value={overviewData.congestion_level}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600">Blocks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-[#650000]" />
                        <span className="text-2xl">{overviewData.blocks}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600">Wards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-[#650000]" />
                        <span className="text-2xl">{overviewData.wards}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-600">Cells</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <DoorClosed className="h-5 w-5 text-[#650000]" />
                        <span className="text-2xl">{overviewData.cells}</span>
                      </div>
                    </CardContent>
                  </Card>
              </div>

              {/* Search and Add */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {activeTab === "assignments" && (
                  <Button
                    onClick={handleAddAssignment}
                    className="bg-[#650000] hover:bg-[#4a0000]"
                    disabled={!selectedStation}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Assign Prisoner
                  </Button>
                )}
              </div>

              { /* Tabs */}
              <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b">
            <button
              onClick={() => setActiveTab("assignments")}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 ${
                activeTab === "assignments"
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === "assignments" ? '#650000' : undefined,
              }}
            >
              <Users className="h-4 w-4" />
              Housing Assignments ({filteredAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab("wards")}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 ${
                activeTab === "wards"
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === "wards" ? '#650000' : undefined,
              }}
            >
              <Home className="h-4 w-4" />
              Wards ({filteredWardsSearch.length})
            </button>
          </div>

        {/* Housing Assignments Table */}
        {activeTab === "assignments" && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prisoner</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Cell</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        {selectedStation
                          ? "No housing assignments found"
                          : "Please select a station to view housing assignments"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>{assignment.prisoner_name}</TableCell>
                        <TableCell>{assignment.ward_name}</TableCell>
                        <TableCell>{assignment.cell_name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAssignment(assignment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteAssignment(assignment.id!)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Wards Table */}
        {activeTab === "wards" && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ward Number</TableHead>
                    <TableHead>Ward Name</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Security Level</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Congestion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWardsSearch.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-gray-500"
                      >
                        {selectedStation
                          ? "No wards found"
                          : "Please select a station to view wards"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWardsSearch.map((ward) => {
                      const congestion = parseInt(ward.congestion || "0");
                      return (
                        <TableRow key={ward.id}>
                          <TableCell>
                            <Badge className="bg-[#650000]">
                              {ward.ward_number}
                            </Badge>
                          </TableCell>
                          <TableCell>{ward.name}</TableCell>
                          <TableCell>{ward.block_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ward.ward_type_name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {ward.security_classification_name}
                            </Badge>
                          </TableCell>
                          <TableCell>{ward.ward_capacity}</TableCell>
                          <TableCell>{ward.occupancy}</TableCell>
                          <TableCell>
                            <Badge variant={getCongestionBadgeVariant(congestion)}>
                              {congestion}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditWard(ward)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteWard(ward.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        </CardContent>
      </Card>
            </>
        )
      }

      {/* Housing Assignment Dialog */}
      <Dialog
        open={isAssignmentDialogOpen}
        onOpenChange={setIsAssignmentDialogOpen}
      >
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <Users className="h-5 w-5" />
              {editingAssignment ? "Edit Housing Assignment" : "Assign Prisoner"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmitAssignment(onSubmitAssignment)}
            className="space-y-4"
          >
            {/* Prisoner Selection */}
            <div>
              <Label htmlFor="prisoner">
                Prisoner <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="prisoner"
                control={controlAssignment}
                rules={{ required: "Prisoner is required" }}
                render={({ field }) => (
                  <Popover open={prisonerSearchOpen} onOpenChange={setPrisonerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={prisonerSearchOpen}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? prisoners.find((p) => p.id === field.value)?.prisoner_name +
                            " (" +
                            prisoners.find((p) => p.id === field.value)?.prisoner_number +
                            ")"
                          : "Search prisoner..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search prisoner..." />
                        <CommandList>
                          <CommandEmpty>No prisoner found.</CommandEmpty>
                          <CommandGroup>
                            {prisoners.map((prisoner) => (
                              <CommandItem
                                key={prisoner.id}
                                value={`${prisoner.prisoner_name} ${prisoner.prisoner_number}`}
                                onSelect={() => {
                                  field.onChange(prisoner.id);
                                  setPrisonerSearchOpen(false);
                                }}
                              >
                                {prisoner.prisoner_name} ({prisoner.prisoner_number})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {assignmentErrors.prisoner && (
                <p className="text-red-500 text-sm mt-1">
                  {assignmentErrors.prisoner.message}
                </p>
              )}
            </div>

            {/* Ward Selection */}
            <div>
              <Label htmlFor="ward">
                Ward <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="ward"
                control={controlAssignment}
                rules={{ required: "Ward is required" }}
                render={({ field }) => (
                  <Popover open={wardSearchOpen} onOpenChange={setWardSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={wardSearchOpen}
                        className="w-full justify-between"
                      >
                        {field.value
                          ? (() => {
                              const ward = filteredWards.find((w) => w.id === field.value);
                              return ward
                                ? `${ward.name} (${ward.ward_number}) - ${ward.block_name}`
                                : "Select ward...";
                            })()
                          : "Search ward..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search ward..." />
                        <CommandList>
                          <CommandEmpty>No ward found.</CommandEmpty>
                          <CommandGroup>
                            {filteredWards.map((ward) => (
                              <CommandItem
                                key={ward.id}
                                value={`${ward.name} ${ward.ward_number} ${ward.block_name}`}
                                onSelect={() => {
                                  field.onChange(ward.id);
                                  setSelectedWardForCells(ward.id);
                                  setWardSearchOpen(false);
                                }}
                              >
                                {ward.name} ({ward.ward_number}) - {ward.block_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {assignmentErrors.ward && (
                <p className="text-red-500 text-sm mt-1">
                  {assignmentErrors.ward.message}
                </p>
              )}
            </div>

            {/* Cell Selection */}
            <div>
              <Label htmlFor="cell">
                Cell <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="cell"
                control={controlAssignment}
                rules={{ required: "Cell is required" }}
                render={({ field }) => {
                  const availableCells = selectedWardForCells
                    ? getFilteredCells(selectedWardForCells)
                    : cells;
                  return (
                    <Popover open={cellSearchOpen} onOpenChange={setCellSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={cellSearchOpen}
                          className="w-full justify-between"
                          disabled={!selectedWardForCells}
                        >
                          {field.value
                            ? availableCells.find((c) => c.id === field.value)?.name ||
                              "Select cell..."
                            : selectedWardForCells
                            ? "Search cell..."
                            : "Select ward first"}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search cell..." />
                          <CommandList>
                            <CommandEmpty>No cell found.</CommandEmpty>
                            <CommandGroup>
                              {availableCells.map((cell) => (
                                <CommandItem
                                  key={cell.id}
                                  value={cell.name}
                                  onSelect={() => {
                                    field.onChange(cell.id);
                                    setCellSearchOpen(false);
                                  }}
                                >
                                  {cell.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
              {assignmentErrors.cell && (
                <p className="text-red-500 text-sm mt-1">
                  {assignmentErrors.cell.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAssignmentDialogOpen(false);
                  setSelectedWardForCells("");
                  resetAssignment();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : editingAssignment ? "Update" : "Save"}
              </Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ward Dialog */}
      <Dialog open={isWardDialogOpen} onOpenChange={setIsWardDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1300px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <Home className="h-5 w-5" />
              {editingWard ? "Edit Ward" : "Add Ward"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmitWard(onSubmitWard)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ward Name */}
              <div>
                <Label htmlFor="name">
                  Ward Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...registerWard("name", { required: "Ward name is required" })}
                  placeholder="Enter ward name"
                />
                {wardErrors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {wardErrors.name.message}
                  </p>
                )}
              </div>

              {/* Ward Number */}
              <div>
                <Label htmlFor="ward_number">
                  Ward Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ward_number"
                  {...registerWard("ward_number", {
                    required: "Ward number is required",
                  })}
                  placeholder="e.g., WA-001"
                />
                {wardErrors.ward_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {wardErrors.ward_number.message}
                  </p>
                )}
              </div>

              {/* Block Selection */}
              <div>
                <Label htmlFor="block">
                  Block <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="block"
                  control={controlWard}
                  rules={{ required: "Block is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredBlocks.map((block) => (
                          <SelectItem key={block.id} value={block.id}>
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {wardErrors.block && (
                  <p className="text-red-500 text-sm mt-1">
                    {wardErrors.block.message}
                  </p>
                )}
              </div>

              {/* Ward Type */}
              <div>
                <Label htmlFor="ward_type">
                  Ward Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="ward_type"
                  control={controlWard}
                  rules={{ required: "Ward type is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ward type" />
                      </SelectTrigger>
                      <SelectContent>
                        {wardTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {wardErrors.ward_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {wardErrors.ward_type.message}
                  </p>
                )}
              </div>

              {/* Security Classification */}
              <div>
                <Label htmlFor="security_classification">
                  Security Classification <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="security_classification"
                  control={controlWard}
                  rules={{ required: "Security classification is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select security level" />
                      </SelectTrigger>
                      <SelectContent>
                        {securityClassifications.map((sc) => (
                          <SelectItem key={sc.id} value={sc.id}>
                            {sc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {wardErrors.security_classification && (
                  <p className="text-red-500 text-sm mt-1">
                    {wardErrors.security_classification.message}
                  </p>
                )}
              </div>

              {/* Ward Capacity */}
              <div>
                <Label htmlFor="ward_capacity">
                  Ward Capacity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ward_capacity"
                  type="number"
                  {...registerWard("ward_capacity", {
                    required: "Ward capacity is required",
                  })}
                  placeholder="Enter capacity"
                />
                {wardErrors.ward_capacity && (
                  <p className="text-red-500 text-sm mt-1">
                    {wardErrors.ward_capacity.message}
                  </p>
                )}
              </div>

              {/* Ward Area */}
              <div>
                <Label htmlFor="ward_area">Ward Area</Label>
                <Input
                  id="ward_area"
                  {...registerWard("ward_area")}
                  placeholder="e.g., 500 sq m"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...registerWard("description")}
                placeholder="Enter ward description"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsWardDialogOpen(false);
                  resetWard();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : editingWard ? "Update" : "Save"}
              </Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

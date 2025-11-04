import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { StatCard } from "../common/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Lock,
  AlertTriangle,
  MessageSquare,
  Building2,
  Users,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchLockupCount,
  fetchCongestionLevel,
  fetchComplaintStats,
  fetchAdmissionDischarge,
  fetchBlockAllocation,
  fetchStaffDeployment,
  fetchRegions,
  fetchDistricts,
  fetchStations,
  fetchManualLockups,
  fetchSystemLockups,
  LockupData,
  CongestionLevel,
  ComplaintStats,
  AdmissionDischarge,
  BlockAllocation,
  StaffDeployment,
  Region,
  District,
  Station,
  StationManualLockup,
  StationSystemLockup,
} from "../../services/mockApi";
import { LockupTable } from "./LockupTable";

export function StationDashboard() {
  const navigate = useNavigate();
  const [lockupData, setLockupData] =
    useState<LockupData | null>(null);
  const [congestionData, setCongestionData] =
    useState<CongestionLevel | null>(null);
  const [complaintData, setComplaintData] =
    useState<ComplaintStats | null>(null);
  const [admissionData, setAdmissionData] = useState<
    AdmissionDischarge[]
  >([]);
  const [blockData, setBlockData] = useState<BlockAllocation[]>(
    [],
  );
  const [staffData, setStaffData] = useState<StaffDeployment[]>(
    [],
  );
  const [manualLockups, setManualLockups] = useState<
    StationManualLockup[]
  >([]);
  const [systemLockups, setSystemLockups] = useState<
    StationSystemLockup[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedRegion, setSelectedRegion] =
    useState<string>("");
  const [selectedDistrict, setSelectedDistrict] =
    useState<string>("");
  const [selectedStation, setSelectedStation] =
    useState<string>("");
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Load filter options
  useEffect(() => {
    const loadFilters = async () => {
      setFiltersLoading(true);
      try {
        const regionsData = await fetchRegions();
        setRegions(regionsData);
      } catch (error) {
        console.error("Error loading filters:", error);
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilters();
  }, []);

  // Load districts when region changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedRegion) {
        try {
          const districtsData = await fetchDistricts(
            parseInt(selectedRegion),
          );
          setDistricts(districtsData);
          setSelectedDistrict(""); // Reset district selection
          setSelectedStation(""); // Reset station selection
        } catch (error) {
          console.error("Error loading districts:", error);
        }
      } else {
        setDistricts([]);
        setSelectedDistrict("");
        setSelectedStation("");
      }
    };

    loadDistricts();
  }, [selectedRegion]);

  // Load stations when district changes
  useEffect(() => {
    const loadStations = async () => {
      if (selectedDistrict) {
        try {
          const stationsData = await fetchStations(
            parseInt(selectedDistrict),
          );
          setStations(stationsData);
          setSelectedStation(""); // Reset station selection
        } catch (error) {
          console.error("Error loading stations:", error);
        }
      } else {
        setStations([]);
        setSelectedStation("");
      }
    };

    loadStations();
  }, [selectedDistrict]);

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          lockup,
          congestion,
          complaints,
          admissions,
          blocks,
          staff,
          manual,
          system,
        ] = await Promise.all([
          fetchLockupCount(),
          fetchCongestionLevel(),
          fetchComplaintStats(),
          fetchAdmissionDischarge(),
          fetchBlockAllocation(),
          fetchStaffDeployment(),
          fetchManualLockups(),
          fetchSystemLockups(),
        ]);

        setLockupData(lockup);
        setCongestionData(congestion);
        setComplaintData(complaints);
        setAdmissionData(admissions);
        setBlockData(blocks);
        setStaffData(staff);
        setManualLockups(manual);
        setSystemLockups(system);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedRegion, selectedDistrict, selectedStation]);

  const getCongestionBadgeVariant = (
    level: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case "Critical":
        return "destructive";
      case "High":
        return "default";
      default:
        return "secondary";
    }
  };

  // Transform API lockup data to match ManualLockupTableView interface
  const transformLockupData = (
    lockups: StationManualLockup[] | StationSystemLockup[],
  ) => {
    // Map station IDs to UUIDs used in ManualLockupTableView
    const stationIdMap: { [key: number]: string } = {
      1: "550e8400-e29b-41d4-a716-446655440001", // Central Station
      2: "550e8400-e29b-41d4-a716-446655440002", // East Wing Station
      3: "550e8400-e29b-41d4-a716-446655440003", // West Wing Station
    };

    // Map type/category/sex IDs to UUIDs
    const typeIdMap: { [key: number]: string } = {
      660: "660e8400-e29b-41d4-a716-446655440001", // Morning Lockup
      661: "660e8400-e29b-41d4-a716-446655440002", // Midday
      662: "660e8400-e29b-41d4-a716-446655440003", // Evening Lockup
    };

    const categoryIdMap: { [key: number]: string } = {
      770: "770e8400-e29b-41d4-a716-446655440001", // Convict
      771: "770e8400-e29b-41d4-a716-446655440002", // Remand
      772: "770e8400-e29b-41d4-a716-446655440003", // Debtor
      773: "770e8400-e29b-41d4-a716-446655440004", // Lodger
    };

    const sexIdMap: { [key: number]: string } = {
      880: "880e8400-e29b-41d4-a716-446655440001", // Male
      881: "880e8400-e29b-41d4-a716-446655440002", // Female
    };

    return lockups.map((lockup) => ({
      id: lockup.id.toString(),
      is_active: true,
      date: lockup.date,
      lockup_time: lockup.lockup_time,
      location: lockup.location,
      count: lockup.count,
      station:
        stationIdMap[lockup.station] ||
        lockup.station.toString(),
      type:
        typeIdMap[lockup.type.id] || lockup.type.id.toString(),
      prisoner_category:
        categoryIdMap[lockup.prisoner_category.id] ||
        lockup.prisoner_category.id.toString(),
      sex: sexIdMap[lockup.sex.id] || lockup.sex.id.toString(),
    }));
  };

  const COLORS = [
    "#650000",
    "#8b0000",
    "#a52a2a",
    "#dc143c",
    "#ff6347",
  ];

  const totalStaff = staffData.reduce(
    (acc, curr) => acc + curr.assigned,
    0,
  );
  const presentStaff = staffData.reduce(
    (acc, curr) => acc + curr.present,
    0,
  );
  const absentStaff = staffData.reduce(
    (acc, curr) => acc + curr.absent,
    0,
  );

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const handleAddManualLockup = () => {
    navigate('/station-management/lockup/manual');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Station Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and analytics
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Filters and Action Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-end gap-4 flex-1">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm mb-2 block">
                  Region
                </label>
                <Select
                  value={selectedRegion}
                  onValueChange={setSelectedRegion}
                  disabled={filtersLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Regions
                    </SelectItem>
                    {regions.map((region) => (
                      <SelectItem
                        key={region.id}
                        value={region.id.toString()}
                      >
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm mb-2 block">
                  District
                </label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                  disabled={
                    !selectedRegion ||
                    selectedRegion === "all" ||
                    filtersLoading
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Districts
                    </SelectItem>
                    {districts.map((district) => (
                      <SelectItem
                        key={district.id}
                        value={district.id.toString()}
                      >
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm mb-2 block">
                  Station
                </label>
                <Select
                  value={selectedStation}
                  onValueChange={setSelectedStation}
                  disabled={
                    !selectedDistrict ||
                    selectedDistrict === "all" ||
                    filtersLoading
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Stations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Stations
                    </SelectItem>
                    {stations.map((station) => (
                      <SelectItem
                        key={station.id}
                        value={station.id.toString()}
                      >
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Manual Lockup Button */}
            <Button
              onClick={handleAddManualLockup}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Lockup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Lockup Tables - System and Manual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Lockup Table */}
        <Card>
          <CardHeader>
            <CardTitle>System Lockup</CardTitle>
          </CardHeader>
          <CardContent>
            <LockupTable
              lockups={transformLockupData(systemLockups)}
            />
          </CardContent>
        </Card>

        {/* Manual Lockup Table */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Lockup</CardTitle>
          </CardHeader>
          <CardContent>
            <LockupTable
              lockups={transformLockupData(manualLockups)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Lockups"
          value={lockupData?.total || 0}
          subtitle={`Manual: ${lockupData?.manual} | System: ${lockupData?.system}`}
          icon={Lock}
          trend={lockupData?.trend}
          iconColor="text-primary"
        />

        <StatCard
          title="Congestion Level"
          value={`${congestionData?.percentage}%`}
          subtitle={`${congestionData?.current}/${congestionData?.capacity} capacity`}
          icon={AlertTriangle}
          iconColor="text-orange-500"
        />

        <StatCard
          title="Total Complaints"
          value={complaintData?.total || 0}
          subtitle={`Pending: ${complaintData?.pending} | Resolved: ${complaintData?.resolved}`}
          icon={MessageSquare}
          iconColor="text-blue-500"
        />

        <StatCard
          title="Total Staff"
          value={totalStaff}
          subtitle={`Present: ${presentStaff} | Absent: ${absentStaff}`}
          icon={Users}
          iconColor="text-green-600"
        />
      </div>

      {/* Lockup Breakdown & Congestion Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Lockup Count Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Manual Lockups</span>
                  <span className="font-semibold">
                    {lockupData?.manual}
                  </span>
                </div>
                <Progress
                  value={
                    lockupData
                      ? (lockupData.manual / lockupData.total) *
                        100
                      : 0
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>System Lockups</span>
                  <span className="font-semibold">
                    {lockupData?.system}
                  </span>
                </div>
                <Progress
                  value={
                    lockupData
                      ? (lockupData.system / lockupData.total) *
                        100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Congestion Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Current Level:</span>
                <Badge
                  variant={getCongestionBadgeVariant(
                    congestionData?.level || "Low",
                  )}
                >
                  {congestionData?.level}
                </Badge>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Occupancy Rate</span>
                  <span className="font-semibold">
                    {congestionData?.percentage}%
                  </span>
                </div>
                <Progress
                  value={congestionData?.percentage || 0}
                  className="h-3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Capacity
                  </div>
                  <div className="text-xl">
                    {congestionData?.capacity}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Current
                  </div>
                  <div className="text-xl">
                    {congestionData?.current}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lockup by Prisoner Category & Lockup Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Lockup by Prisoner Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={lockupData?.by_prisoner_category || []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="manual_count"
                  fill="#650000"
                  name="Manual"
                />
                <Bar
                  dataKey="system_count"
                  fill="#dc143c"
                  name="System"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lockup by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lockupData?.by_lockup_type || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="manual_count"
                  fill="#650000"
                  name="Manual"
                />
                <Bar
                  dataKey="system_count"
                  fill="#dc143c"
                  name="System"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Lockup Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Lockup Details by Prisoner Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">
                    Manual
                  </TableHead>
                  <TableHead className="text-right">
                    System
                  </TableHead>
                  <TableHead className="text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lockupData?.by_prisoner_category.map(
                  (item) => (
                    <TableRow key={item.category}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.manual_count}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.system_count}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.total}
                      </TableCell>
                    </TableRow>
                  ),
                )}
                {lockupData?.by_prisoner_category && (
                  <TableRow className="bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {lockupData.by_prisoner_category.reduce(
                        (sum, item) => sum + item.manual_count,
                        0,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {lockupData.by_prisoner_category.reduce(
                        (sum, item) => sum + item.system_count,
                        0,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {lockupData.by_prisoner_category.reduce(
                        (sum, item) => sum + item.total,
                        0,
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lockup Details by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lockup Type</TableHead>
                  <TableHead className="text-right">
                    Manual
                  </TableHead>
                  <TableHead className="text-right">
                    System
                  </TableHead>
                  <TableHead className="text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lockupData?.by_lockup_type.map((item) => (
                  <TableRow key={item.type}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="text-right">
                      {item.manual_count}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.system_count}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.total}
                    </TableCell>
                  </TableRow>
                ))}
                {lockupData?.by_lockup_type && (
                  <TableRow className="bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {lockupData.by_lockup_type.reduce(
                        (sum, item) => sum + item.manual_count,
                        0,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {lockupData.by_lockup_type.reduce(
                        (sum, item) => sum + item.system_count,
                        0,
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {lockupData.by_lockup_type.reduce(
                        (sum, item) => sum + item.total,
                        0,
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              Admissions & Discharges (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={admissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="admissions"
                  stroke="#650000"
                  strokeWidth={2}
                  name="Admissions"
                />
                <Line
                  type="monotone"
                  dataKey="discharges"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Discharges"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complaint Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complaintData?.by_nature || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(complaintData?.by_nature || []).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ),
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Block Allocation Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Block Allocation Summary</CardTitle>
          <Building2 className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Block Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Occupied</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Occupancy Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockData.map((block) => {
                const occupancyRate = (
                  (block.occupied / block.capacity) *
                  100
                ).toFixed(1);
                return (
                  <TableRow key={block.blockNumber}>
                    <TableCell>
                      <div>
                        <div>{block.blockName}</div>
                        <div className="text-xs text-muted-foreground">
                          {block.blockNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{block.capacity}</TableCell>
                    <TableCell>{block.occupied}</TableCell>
                    <TableCell>{block.available}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={parseFloat(occupancyRate)}
                          className="h-2 w-24"
                        />
                        <span className="text-sm">
                          {occupancyRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Staff Deployment Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff Deployment by Area</CardTitle>
          <Users className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deployment Area</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffData.map((dept) => {
                const attendanceRate = (
                  (dept.present / dept.assigned) *
                  100
                ).toFixed(1);
                return (
                  <TableRow key={dept.deployment_area}>
                    <TableCell>
                      {dept.deployment_area}
                    </TableCell>
                    <TableCell>{dept.assigned}</TableCell>
                    <TableCell className="text-green-600">
                      {dept.present}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {dept.absent}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={parseFloat(attendanceRate)}
                          className="h-2 w-24"
                        />
                        <span className="text-sm">
                          {attendanceRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
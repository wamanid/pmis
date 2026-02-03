import React, { useState, useEffect } from "react";
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
  DialogContent, DialogDescription,
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
import { toast } from "sonner";
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
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";
import SearchableSelect from "../common/SearchableSelect";
import {getPrisoners, PrisonerItem} from "../../services/stationServices/visitorsServices/VisitorsService";
import {
  addHousingAssignment,
  Assignment, AssignmentResponse,
  Cell, deleteHousingAssignment, deleteWardById, getHousingAssignments,
  getStationWards,
  getWardCells, HousingAssignment, updateHousingAssignment,
  Ward,
  HOUSING_API_ENDPOINTS,
  fetchAssignmentById,
  fetchWardById
} from "../../services/stationServices/housingService";
import { DataTable } from "../common/DataTable";
import axiosInstance from "../../services/axiosInstance";
import { useCallback } from "react";
import {handleCatchError, handleEffectLoad, handleResponseError} from "../../services/stationServices/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../ui/alert-dialog";
import {VisitorItem} from "../../services/stationServices/visitorsServices/visitorItem";

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

// interface Ward {
//   id: string;
//   station_name?: string;
//   ward_type_name?: string;
//   block_name?: string;
//   security_classification_name?: string;
//   created_by_name?: string;
//   ward_capacity?: string;
//   occupancy?: string;
//   congestion?: string;
//   name: string;
//   ward_number: string;
//   ward_area?: string;
//   description?: string;
//   station: string;
//   ward_type: string;
//   block: string;
//   security_classification: string;
// }

// interface Cell {
//   id: string;
//   name: string;
//   ward: string;
// }

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

// interface HousingAssignment {
//   id?: string;
//   prisoner: string;
//   prisoner_name?: string;
//   ward: string;
//   ward_name?: string;
//   cell: string;
//   cell_name?: string;
// }

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

  // Data
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [wardTypes, setWardTypes] = useState<WardType[]>([]);
  const [securityClassifications, setSecurityClassifications] = useState<
    SecurityClassification[]
  >([]);

  const [deleteAssignment, setDeleteAssignment] = useState<HousingAssignment | null>(null);
  const [deleteWard, setDeleteWard] = useState<Ward | null>(null);

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
  const [selectedWardForCells, setSelectedWardForCells] = useState("");

  const [housingLoading, setHousingLoading] = useState(false)
  const { region, district, station } = useFilters();
  const [cellVisible, setCellVisible] = useState(false)
  const [cellLoading, setCellLoading] = useState(false)

  // DataTable states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filtersReloadKey, setFiltersReloadKey] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

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

  // Load lookup data (blocks, ward types, security classifications)
  useEffect(() => {
    loadLookupData();
  }, []);

  const loadLookupData = async () => {
    try {
      // Load blocks from API
      const blocksResponse = await axiosInstance.get(HOUSING_API_ENDPOINTS.BLOCKS, {
        params: { page_size: 100 }
      });
      const blocksData = blocksResponse?.data?.results ?? blocksResponse?.data ?? [];
      setBlocks(Array.isArray(blocksData) ? blocksData : []);

      // Load ward types from API
      const wardTypesResponse = await axiosInstance.get(HOUSING_API_ENDPOINTS.WARD_TYPES, {
        params: { page_size: 100 }
      });
      const wardTypesData = wardTypesResponse?.data?.results ?? wardTypesResponse?.data ?? [];
      setWardTypes(Array.isArray(wardTypesData) ? wardTypesData : []);

      // Load security classifications from API
      const securityResponse = await axiosInstance.get(HOUSING_API_ENDPOINTS.SECURITY_CLASSIFICATIONS, {
        params: { page_size: 100 }
      });
      const securityData = securityResponse?.data?.results ?? securityResponse?.data ?? [];
      setSecurityClassifications(Array.isArray(securityData) ? securityData : []);
    } catch (error) {
      console.error("Failed to load lookup data:", error);
      toast.error("Failed to load ward configuration data");
    }
  };

  // Paginated fetch callbacks for server-side pagination (14M+ ready)
  const fetchWardsPaginated = useCallback(async (opts: any, signal?: AbortSignal) => {
    try {
      const response = await axiosInstance.get(HOUSING_API_ENDPOINTS.WARDS, {
        params: {
          search: opts?.search || "",
          page: opts?.page || 1,
          page_size: opts?.page_size || 50,
          region: region || undefined,
          district: district || undefined,
          station: station || undefined,
        },
        signal,
      });
      const payload = response?.data ?? response ?? {};
      return {
        items: payload?.results ?? [],
        count: payload?.count ?? 0,
        next: payload?.next ?? null,
      };
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        return { items: [], count: 0, next: null };
      }
      console.error("fetchWardsPaginated error", error);
      return { items: [], count: 0, next: null };
    }
  }, [region, district, station]);

  const fetchCellsPaginated = useCallback(async (opts: any, signal?: AbortSignal) => {
    try {
      const response = await axiosInstance.get(HOUSING_API_ENDPOINTS.CELLS, {
        params: {
          search: opts?.search || "",
          page: opts?.page || 1,
          page_size: opts?.page_size || 50,
          ward: selectedWardForCells || undefined,
          region: region || undefined,
          district: district || undefined,
          station: station || undefined,
        },
        signal,
      });
      const payload = response?.data ?? response ?? {};
      return {
        items: payload?.results ?? [],
        count: payload?.count ?? 0,
        next: payload?.next ?? null,
      };
    } catch (error: any) {
      if (error.name === "AbortError" || error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        return { items: [], count: 0, next: null };
      }
      console.error("fetchCellsPaginated error", error);
      return { items: [], count: 0, next: null };
    }
  }, [selectedWardForCells, region, district, station]);

  // Integrate global filters to trigger table refresh
  useFilterRefresh(() => {
    setPage(1);
    setFiltersReloadKey(k => k + 1);
  }, [region, district, station]);

  // Housing Assignment CRUD
  const handleAddAssignment = () => {
    if (!station) {
      toast.error("Please select a station first");
      return;
    }
    setEditingAssignment(null);
    setSelectedWardForCells("");
    resetAssignment();
    setIsAssignmentDialogOpen(true);
  };

  const handleEditAssignment = async (assignment: HousingAssignment) => {
    try {
      // Option B: Fetch fresh data from API
      const freshAssignment = await fetchAssignmentById(assignment.id);
      setEditingAssignment(freshAssignment);
      resetAssignment({
        prisoner: freshAssignment.prisoner,
        ward: freshAssignment.ward,
        cell: freshAssignment.cell,
        is_active: freshAssignment.is_active,
        created_by: null,
      });
      setSelectedWardForCells(freshAssignment.ward);
      setIsAssignmentDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch assignment details:', error);
      toast.error('Failed to load assignment details. Please try again.');
    }
  };

  const onSubmitAssignment = async (data: HousingAssignment) => {
    setLoading(true);

    const assignmentData: Assignment = {
      prisoner: data.prisoner || '',
      ward: data.ward || "",
      cell: data.cell || "",
      is_active: true,
      created_by: null
    }

    try {
        if (editingAssignment) {
           const response = await updateHousingAssignment(assignmentData, editingAssignment.id)
           if (handleResponseError(response)) return

            toast.success("Housing assignment updated successfully");
        }
        else {
          const response = await addHousingAssignment(assignmentData)
          if (handleResponseError(response)) return

          toast.success("Housing assignment created successfully")
        }

        setIsAssignmentDialogOpen(false);
        setSelectedWardForCells("");
        setEditingAssignment(null)
        resetAssignment();
        setFiltersReloadKey(k => k + 1); // Refresh table

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoading(false)
    }
  };

  // Ward CRUD
  const handleAddWard = () => {
    if (!station) {
      toast.error("Please select a station first");
      return;
    }
    setEditingWard(null);
    resetWard();
    setWardValue("station", station);
    setIsWardDialogOpen(true);
  };

  const handleEditWard = async (ward: Ward) => {
    try {
      // Option B: Fetch fresh data from API
      const freshWard = await fetchWardById(ward.id);
      setEditingWard(freshWard);
      resetWard({
        name: freshWard.name,
        ward_number: freshWard.ward_number,
        block: freshWard.block,
        ward_type: freshWard.ward_type,
        security_classification: freshWard.security_classification,
        ward_capacity: freshWard.ward_capacity?.toString() || "",
        ward_area: freshWard.ward_area || "",
        description: freshWard.description || "",
      });
      setIsWardDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch ward details:', error);
      toast.error('Failed to load ward details. Please try again.');
    }
  };

  const onSubmitWard = (data: Ward) => {
    setLoading(true);

    const wardType = wardTypes.find((wt) => wt.id === data.ward_type);
    const block = blocks.find((b) => b.id === data.block);
    const securityClass = securityClassifications.find(
      (sc) => sc.id === data.security_classification
    );

    const wardData = {
      ...data,
      ward_type_name: wardType?.name || "",
      block_name: block?.name || "",
      security_classification_name: securityClass?.name || "",
      created_by_name: "Current User",
      occupancy: "0",
      congestion: "0",
    };

    setTimeout(() => {
      if (editingWard) {
        toast.success("Ward updated successfully");
      } else {
        toast.success("Ward created successfully");
      }
      setIsWardDialogOpen(false);
      resetWard();
      setLoading(false);
      setFiltersReloadKey(k => k + 1); // Refresh table
    }, 500);
  };

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

  async function handleDeleteAssignment () {
      if (!deleteAssignment) return;
      setLoading(true);

      try {
          await deleteHousingAssignment(deleteAssignment.id)
          toast.success("Housing assignment deleted successfully")
          setDeleteAssignment(null);
          setFiltersReloadKey(k => k + 1); // Refresh table
      }catch (error: any){
        toast.error(error?.response?.data?.detail || "Failed to delete assignment")
      }finally {
        setLoading(false)
      }
  }

  async function handleDeleteWard () {
      if (!deleteWard) return;
      setLoading(true);

      try {
          await deleteWardById(deleteWard.id)
          toast.success("Ward deleted successfully")
          setDeleteWard(null);
          setFiltersReloadKey(k => k + 1); // Refresh table
      }catch (error: any){
        toast.error(error?.response?.data?.detail || "Failed to delete ward")
      }finally {
        setLoading(false)
      }
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
              <div className="flex gap-4 justify-end">
                {/* <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div> */}
                {activeTab === "assignments" && (
                  <Button
                    onClick={handleAddAssignment}
                    className="bg-[#650000] hover:bg-[#4a0000] "
                    disabled={!station}
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
                      Housing Assignments
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
                      Wards
                    </button>
                  </div>

                {/* Housing Assignments Table with DataTable */}
                {activeTab === "assignments" && (
                  <Card>
                    <CardContent className="p-0">
                      <DataTable
                        key={`assignments-${filtersReloadKey}-${station ?? ''}-${district ?? ''}-${region ?? ''}`}
                        url={`${HOUSING_API_ENDPOINTS.ASSIGNMENTS}?${station ? `station=${encodeURIComponent(station)}&` : ''}${district ? `district=${encodeURIComponent(district)}&` : ''}${region ? `region=${encodeURIComponent(region)}&` : ''}`}
                        columns={[
                          {
                            key: "prisoner_name",
                            label: "Prisoner",
                            render: (value: any, row: AssignmentResponse) => row.prisoner_name || row.prisoner_number || "—"
                          },
                          {
                            key: "ward_name",
                            label: "Ward",
                            render: (value: any, row: AssignmentResponse) => row.ward_name || "—"
                          },
                          {
                            key: "cell_name",
                            label: "Cell",
                            render: (value: any, row: AssignmentResponse) => row.cell_name || "—"
                          },
                          {
                            key: "actions",
                            label: "Actions",
                            render: (value: any, row: AssignmentResponse) => (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditAssignment(row)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeleteAssignment(row)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          }
                        ]}
                        onSearch={(v: string) => setSearchTerm(v)}
                        onPageChange={(p: number) => setPage(p)}
                        onPageSizeChange={(ps: number) => setPageSize(ps)}
                        page={page}
                        pageSize={pageSize}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Wards Table with DataTable */}
                {activeTab === "wards" && (
                  <Card>
                    <CardContent className="p-0">
                      <DataTable
                        key={`wards-${filtersReloadKey}-${station ?? ''}-${district ?? ''}-${region ?? ''}`}
                        url={`${HOUSING_API_ENDPOINTS.WARDS}?${station ? `station=${encodeURIComponent(station)}&` : ''}${district ? `district=${encodeURIComponent(district)}&` : ''}${region ? `region=${encodeURIComponent(region)}&` : ''}`}
                        columns={[
                          {
                            key: "ward_number",
                            label: "Ward Number",
                            render: (value: any, row: Ward) => (
                              <Badge className="bg-[#650000]">
                                {row.ward_number}
                              </Badge>
                            )
                          },
                          {
                            key: "name",
                            label: "Ward Name"
                          },
                          {
                            key: "block_name",
                            label: "Block"
                          },
                          {
                            key: "ward_type_name",
                            label: "Type",
                            render: (value: any, row: Ward) => (
                              <Badge variant="outline">{row.ward_type_name}</Badge>
                            )
                          },
                          {
                            key: "security_classification_name",
                            label: "Security Level",
                            render: (value: any, row: Ward) => (
                              <Badge variant="secondary">{row.security_classification_name}</Badge>
                            )
                          },
                          {
                            key: "ward_capacity",
                            label: "Capacity"
                          },
                          {
                            key: "occupancy",
                            label: "Occupancy"
                          },
                          {
                            key: "congestion",
                            label: "Congestion",
                            render: (value: any, row: Ward) => {
                              const congestion = parseInt(row.congestion || "0");
                              return (
                                <Badge variant={getCongestionBadgeVariant(congestion)}>
                                  {congestion}%
                                </Badge>
                              );
                            }
                          },
                          {
                            key: "actions",
                            label: "Actions",
                            render: (value: any, row: Ward) => (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditWard(row)}
                                  // disabled
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setDeleteWard(row)}
                                  disabled
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          }
                        ]}
                        onSearch={(v: string) => setSearchTerm(v)}
                        onPageChange={(p: number) => setPage(p)}
                        onPageSizeChange={(ps: number) => setPageSize(ps)}
                        page={page}
                        pageSize={pageSize}
                      />
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
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <Users className="h-5 w-5" />
              {editingAssignment ? "Edit Housing Assignment" : "Assign Prisoner"}
            </DialogTitle>
            <DialogDescription></DialogDescription>
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
                  <CustomPrisonerSearch
                    value={field.value ?? null}
                    onChange={(v) => field.onChange(v ?? null)}
                    onSelectItem={(p: any) => {
                      field.onChange(p?.id ?? null);
                    }}
                    placeholder="Select prisoner"
                    idField="id"
                    labelField="full_name"
                    pageSize={50}
                  />
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
                  <SearchableSelect
                    fetchPaginated={fetchWardsPaginated}
                    value={field.value}
                    onChange={(id) => {
                      field.onChange(id);
                      setSelectedWardForCells(id || "");
                    }}
                    placeholder="Select ward..."
                    idField="id"
                    labelField="name"
                    renderItem={(ward: any) => (
                      <div>{ward.name} ({ward.ward_number}) - {ward.block_name}</div>
                    )}
                    pageSize={50}
                    minQueryLength={0}
                  />
                )}
              />
              {assignmentErrors.ward && (
                <p className="text-red-500 text-sm mt-1">
                  {assignmentErrors.ward.message}
                </p>
              )}
            </div>

            {/* Cell Selection */}
            {selectedWardForCells && (
              <div>
                <Label htmlFor="cell">
                  Cell <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="cell"
                  control={controlAssignment}
                  rules={{ required: "Cell is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      fetchPaginated={fetchCellsPaginated}
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      placeholder="Select cell..."
                      idField="id"
                      labelField="name"
                      pageSize={50}
                      minQueryLength={0}
                    />
                  )}
                />
                {assignmentErrors.cell && (
                  <p className="text-red-500 text-sm mt-1">
                    {assignmentErrors.cell.message}
                  </p>
                )}
              </div>
            )}

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
        <DialogContent className="max-w-[95vw] w-[1000px] max-h-[95vh] overflow-hidden p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <Home className="h-5 w-5" />
              {editingWard ? "Edit Ward" : "Add Ward"}
            </DialogTitle>
            <DialogDescription></DialogDescription>
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
                        {blocks.map((block) => (
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

      {/* Cell Loading Dialog */}
      <Dialog open={cellLoading} onOpenChange={setCellLoading}>
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
                    Fetching Cells' information, Please wait...
                  </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAssignment} onOpenChange={() => setDeleteAssignment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Housing Assignment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Are you sure you want to delete this housing Assignment? <strong>This action cannot be undone.</strong></p>
                {deleteAssignment && (
                  <div className="mt-2 p-3 bg-muted rounded">
                    <p>
                      <strong>Prisoner:</strong> {deleteAssignment.prisoner_name}
                    </p>
                    <p>
                      <strong>Ward:</strong> {deleteAssignment.ward_name}
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssignment}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteWard} onOpenChange={() => setDeleteWard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ward</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Are you sure you want to delete this ward? <strong>This action cannot be undone.</strong></p>
                {deleteWard && (
                  <div className="mt-2 p-3 bg-muted rounded">
                    <p>
                      <strong>Ward:</strong> {deleteWard.name}
                    </p>
                    <p>
                      <strong>Block:</strong> {deleteWard.block_name}
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWard}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

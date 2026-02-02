import { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "../common/DataTable";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {useFilterRefresh} from "../../hooks/useFilterRefresh";
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";
import StaffProfileSelect from "../common/StaffProfileSelect";
import SearchableSelect from "../common/SearchableSelect";
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Users,
  Calendar as CalendarIcon,
  Upload,
  Check,
  ChevronsUpDown,
  Camera,
  Clock,
  LogIn,
  LogOut,
  Edit,
  Eye,
  FileText,
  Image,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import VisitorPassForm from "../gate/VisitorPassForm";
import VisitorItemList from "./VisitorItemList";
import VisitorRegistrationDialog from "./VisitorRegistrationDialog";
import {getStationVisitors, Visitor, VISITOR_API_ENDPOINTS} from "../../services/stationServices/visitorsServices/VisitorsService";
import axiosInstance from "../../services/axiosInstance"; // << ensure path matches your project
import {handleResponseError} from "../../services/stationServices/utils";
import {getVisitorItems, VisitorItem} from "../../services/stationServices/visitorsServices/visitorItem";

// NOTE: API endpoints now centralized in service files (VISITOR_API_ENDPOINTS imported above)
// Red "NS_BINDING_ABORTED" errors in console are NORMAL - they occur when AbortController
// cancels requests (e.g., when user types quickly or navigates away). This is expected behavior.

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

interface Gate {
  id: string;
  name: string;
}

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
}

interface VisitorType {
  id: string;
  name: string;
}

interface Relationship {
  id: string;
  name: string;
}

interface IDType {
  id: string;
  name: string;
}

interface VisitorStatus {
  id: string;
  name: string;
  color: string;
}

interface Staff {
  id: string;
  force_number: string;
  name: string;
  rank: string;
}

export default function VisitationsScreen() {
  // bump this when global filters change so DataTable remounts & refetches
  const [filtersReloadKey, setFiltersReloadKey] = useState(0);

  // useFilterRefresh should call this callback when global filters (region/district/station/all) change
  useFilterRefresh(() => {
    setPage(1);
    setFiltersReloadKey((k) => k + 1);
  });

  // Filter & data states
  const [items, setItems] = useState<VisitorItem[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [idTypes, setIDTypes] = useState<IDType[]>([]);
  const [visitorStatuses, setVisitorStatuses] = useState<VisitorStatus[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  // UI states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  // external search (shown in header). Debounced before triggering API.
  const [searchQuery, setSearchQuery] = useState("");
  // Debounced search so we don't call API on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => window.clearTimeout(id);
  }, [searchQuery]);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Visitor Pass Dialog states
  const [isVisitorPassDialogOpen, setIsVisitorPassDialogOpen] = useState(false);
  const [selectedVisitorForPass, setSelectedVisitorForPass] = useState<Visitor | null>(null);
  
  // Photo viewing state
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");

  // Form states
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    organisation: "",
    vehicle_no: "",
    reason_of_visitation: "",
    id_number: "",
    address: "",
    contact_no: "",
    place_visited: "",
    remarks: "",
    blacklist_reason: "",
    photo: null as File | null,
    gate: "",
    prisoner: "",
    visitor_type: "",
    gate_keeper: "",
    relation: "",
    id_type: "",
    visitor_status: "",
    visitation_datetime: new Date(),
    time_in: "",
    time_out: "",
  });

  // Combobox states
  const [openGateCombo, setOpenGateCombo] = useState(false);
  const [openPrisonerCombo, setOpenPrisonerCombo] = useState(false);
  const [openVisitorTypeCombo, setOpenVisitorTypeCombo] = useState(false);
  // openGateKeeper/openPrisoner state removed — using reusable selects instead
  const [openRelationCombo, setOpenRelationCombo] = useState(false);
  const [openIDTypeCombo, setOpenIDTypeCombo] = useState(false);
  const [openVisitorStatusCombo, setOpenVisitorStatusCombo] = useState(false);

  const [visitorRecordsLoading, setVisitorRecordsLoading] = useState(false)
  // DataTable: let the shared DataTable component handle loading/paging/sorting
  const [tableData, setTableData] = useState<Visitor[]>([]); // kept for other code that may read it
  const [tableLoading, setTableLoading] = useState<boolean>(false); // DataTable handles its own loading when using url
  const [total, setTotal] = useState<number>(0); // not used by url mode but kept for compatibility
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // Calendar state
  const [calendarOpen, setCalendarOpen] = useState(false);


  // TODO: fetch gates/prisoners/visitorTypes/relationships/idTypes/visitorStatuses/staffList from API services here.
  useEffect(() => {
    // intentionally left blank: lookups should be loaded from services instead of hardcoded data
  }, []);

  // debounced search (avoid API calls on every keystroke)
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  // Map / normalize server item -> table row (we keep original fields, renderers read them)
  const mapVisitor = useCallback((it: any): Visitor => ({
    ...it,
  }), []);

  // Paginated fetch callbacks for dropdowns
  const fetchGatesPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_API_ENDPOINTS.GATES, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      toast.error('Failed to load gates');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchRelationshipsPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_API_ENDPOINTS.RELATIONSHIPS, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      toast.error('Failed to load relationships');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchVisitorTypesPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_API_ENDPOINTS.VISITOR_TYPES, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      toast.error('Failed to load visitor types');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchVisitorStatusesPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_API_ENDPOINTS.VISITOR_STATUSES, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      toast.error('Failed to load visitor statuses');
      return { items: [], count: 0, next: null };
    }
  }, []);

  const fetchIDTypesPaginated = useCallback(async (opts: { search?: string; page?: number; page_size?: number; [key: string]: any }, signal?: AbortSignal) => {
    try {
      const res = await axiosInstance.get(VISITOR_API_ENDPOINTS.ID_TYPES, {
        params: { search: opts.search || '', page: opts.page || 1, page_size: opts.page_size || 50 },
        signal
      });
      return {
        items: res.data?.results ?? [],
        count: res.data?.count ?? 0,
        next: res.data?.next ?? null
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        throw error;
      }
      toast.error('Failed to load ID types');
      return { items: [], count: 0, next: null };
    }
  }, []);

  // NOTE: DataTable handles fetching when you supply the `url` prop.
  // Manual loadTable + effects are intentionally disabled to avoid double-fetch / shape mismatch.
  // If you need server-side params (search/paging) coordinated, extend the shared DataTable to accept them.
  // loadTable: server-side load with abort + request id guard
  const loadTable = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setTableLoading(true);
    try {
      const params: Record<string, any> = {};
      params.page = Math.max(1, Number(_page) || 1);
      params.page_size = Number(_pageSize) || 10;
      if (_sortField) params.ordering = _sortDir === 'desc' ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;

      // const res = await getStationVisitors(params, controller.signal);
      // const itemsRes = res?.results ?? res ?? [];

      // DEBUG: log params so we can inspect what the UI is sending
      // call axios directly so query params are forwarded exactly
      console.debug("calling API with params:", params);
      const apiRes = await axiosInstance.get(VISITOR_API_ENDPOINTS.STATION_VISITORS, { params });
      const res = apiRes.data;
      console.debug("loadTable response:", res);
      const itemsRes = res?.results ?? res ?? [];
      const count = Number(res?.count ?? itemsRes.length ?? 0);

      if (requestIdRef.current === reqId) {
        setTableData((itemsRes || []).map(mapVisitor));
        setVisitors(itemsRes || []); // keep visitors state for VisitorItemList
        setTotal(count);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
      console.error('load visitors error', err?.response ?? err);
      toast.error('Failed to load visitor records');
    } finally {
      if (requestIdRef.current === reqId) setTableLoading(false);
      setVisitorRecordsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, mapVisitor]);

  // trigger load handled by DataTable (url prop). If you previously relied on loadTable, add server-side props support
  // useEffect(() => {
  //   loadTable(page, pageSize, sortField, sortDir, debouncedSearch);
  // }, [page, pageSize, sortField, sortDir, debouncedSearch, loadTable]);

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setUseCamera(true);
    } catch (error) {
      toast.error("Failed to access camera");
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "visitor-photo.jpg", {
              type: "image/jpeg",
            });
            setForm({ ...form, photo: file });
            setPhotoPreview(canvas.toDataURL("image/jpeg"));
            stopCamera();
            toast.success("Photo captured successfully");
          }
        }, "image/jpeg");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      organisation: "",
      vehicle_no: "",
      reason_of_visitation: "",
      id_number: "",
      address: "",
      contact_no: "",
      place_visited: "",
      remarks: "",
      blacklist_reason: "",
      photo: null,
      gate: "",
      prisoner: "",
      visitor_type: "",
      gate_keeper: "",
      relation: "",
      id_type: "",
      visitor_status: "",
      visitation_datetime: new Date(),
      time_in: "",
      time_out: "",
    });
    setPhotoPreview("");
    setEditingVisitor(null);
    stopCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // const formData = new FormData();
      // Object.entries(form).forEach(([key, value]) => {
      //   if (value !== null && value !== "") {
      //     if (key === "visitation_datetime") {
      //       formData.append(key, format(value as Date, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
      //     } else {
      //       formData.append(key, value);
      //     }
      //   }
      // });
      // const response = await fetch('/api/gate-management/visitors/', {
      //   method: editingVisitor ? 'PUT' : 'POST',
      //   body: formData
      // });

      toast.success(
        editingVisitor
          ? "Visitor updated successfully"
          : "Visitor registered successfully"
      );
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save visitor");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visitor: Visitor) => {
    // console.log(visitor)
    setEditingVisitor(visitor);

    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusObj = visitorStatuses.find((s) => s.name === status);
    const variant =
      statusObj?.color === "green"
        ? "default"
        : statusObj?.color === "red"
        ? "destructive"
        : statusObj?.color === "yellow"
        ? "secondary"
        : "default";
    return (
      <Badge variant={variant}>
        {status}
      </Badge>
    );
  };

  const handleGenerateVisitorPass = (visitor: Visitor) => {
    setSelectedVisitorForPass(visitor);
    setIsVisitorPassDialogOpen(true);
  };

  const handleVisitorPassSubmit = (data: any) => {
    toast.success('Visitor pass generated successfully');
    setIsVisitorPassDialogOpen(false);
    setSelectedVisitorForPass(null);
  };

  // APIs integration
  useEffect(() => {
      if (visitorRecordsLoading) {
        async function fetchData() {
          // setVisitorRecordsLoading(true)
            try {
              const response = await getStationVisitors('')
              if (handleResponseError(response)) return

              if ("results" in response) {
                const data = response.results
                if (!data.length){
                    toast.error("There are no visitor records");
                    return true
                }
                setVisitors(data)
                // console.log(data)
              }

              const response2 = await getVisitorItems()
              if (handleResponseError(response2)) return
              if ("results" in response2) {
                const data = response2.results
                setItems(data)
                console.log(data)
              }

            }catch (error: any) {
              if (!error?.response) {
                toast.error('Failed to connect to server. Please try again.');
              }

            }finally {
              setVisitorRecordsLoading(false)
            }
        }

        fetchData()
      }
  }, [setVisitorRecordsLoading]);

  useEffect(() => {
    if (!isDialogOpen){
      setEditingVisitor(null)
    }
  }, [isDialogOpen]);

  function extractTimeHHMM(isoString: string): string {
    const d = new Date(isoString);

    if (isNaN(d.getTime())) return ""; // invalid date

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Visitations Management</h1>
        <p className="text-muted-foreground">
          Manage visitor check-in and check-out records
        </p>
      </div>

      {/* Filters removed — global filtering is provided by top nav via useFilterRefresh */}

      {/* Main Tabs */}
      <Tabs defaultValue="records" className="w-full">
        {/* <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
          <TabsTrigger 
            value="records" 
            className="text-base data-[state=active]:bg-[#650000] data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
          >
            <Users className="h-4 w-4 mr-2" />
            Visitor Records
          </TabsTrigger>
          <TabsTrigger 
            value="items" 
            className="text-base data-[state=active]:bg-[#650000] data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Visitor Items
          </TabsTrigger>
        </TabsList> */}

        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
          <TabsTrigger
            value="records"
            className="text-base data-[state=active]:bg-[#650000] data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
             <Users className="h-4 w-4 mr-2" />
             Visitor Records
           </TabsTrigger>
          <TabsTrigger
            value="items"
            className="text-base data-[state=active]:bg-[#650000] data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
             <FileText className="h-4 w-4 mr-2" />
             Visitor Items
           </TabsTrigger>
        </TabsList>

        {/* Visitor Records Tab */}
        <TabsContent value="records" className="space-y-6 mt-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID number, or contact..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10"
              /> */}
            </div>

            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Register Visitor
            </Button>
          </div>

          <VisitorRegistrationDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingVisitor(null);
              }
            }}
            setVisitors={setVisitors}
            editingVisitor={editingVisitor}
            onSaved={() => {
              // Reload table immediately using the existing loadTable() helper
              setPage(1);
              setVisitorRecordsLoading(true);
              // ensure we use current sort/search params
              loadTable(1, pageSize, sortField, sortDir, debouncedSearch)
                .catch((e) => console.error("reload after save failed", e))
                .finally(() => setVisitorRecordsLoading(false));
            }}
          />

          {/* Placeholder for form - will be removed */}
          <div style={{display: 'none'}}>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="visit">Visit Details</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="photo">Photo</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="first_name"
                        value={form.first_name}
                        onChange={(e) =>
                          setForm({ ...form, first_name: e.target.value })
                        }
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        value={form.middle_name}
                        onChange={(e) =>
                          setForm({ ...form, middle_name: e.target.value })
                        }
                        placeholder="Enter middle name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="last_name"
                        value={form.last_name}
                        onChange={(e) =>
                          setForm({ ...form, last_name: e.target.value })
                        }
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_no">Contact Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="contact_no"
                        value={form.contact_no}
                        onChange={(e) =>
                          setForm({ ...form, contact_no: e.target.value })
                        }
                        placeholder="+256700123456"
                        required
                      />
            
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organisation">Organisation</Label>
                      <Input
                        id="organisation"
                        value={form.organisation}
                        onChange={(e) =>
                          setForm({ ...form, organisation: e.target.value })
                        }
                        placeholder="Enter organisation name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="address"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Enter full address"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID Type */}
                    <div className="space-y-2">
                      <Label>ID Type <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={form.id_type}
                        onChange={(val) => setForm({ ...form, id_type: String(val ?? "") })}
                        fetchPaginated={fetchIDTypesPaginated}
                        idField="id"
                        labelField="name"
                        placeholder="Select ID type..."
                        pageSize={50}
                        minQueryLength={0}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_number">ID Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="id_number"
                        value={form.id_number}
                        onChange={(e) =>
                          setForm({ ...form, id_number: e.target.value })
                        }
                        placeholder="Enter ID number"
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Visit Details Tab */}
                <TabsContent value="visit" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gate */}
                    <div className="space-y-2">
                      <Label>Gate <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={form.gate}
                        onChange={(val) => setForm({ ...form, gate: String(val ?? "") })}
                        fetchPaginated={fetchGatesPaginated}
                        idField="id"
                        labelField="name"
                        placeholder="Select gate..."
                        pageSize={50}
                        minQueryLength={0}
                      />
                    </div>

                    {/* Gate Keeper */}
                    <div className="space-y-2">
                      <Label>Gate Keeper <span className="text-red-500">*</span></Label>
                      <StaffProfileSelect
                        value={form.gate_keeper ? String(form.gate_keeper) : ""}
                        onChange={(val) => setForm(prev => ({ ...prev, gate_keeper: String(val ?? "") }))}
                        placeholder="Select gate keeper..."
                        initialItems={staffList}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prisoner */}
                    <div className="space-y-2">
                      <Label>Prisoner to Visit <span className="text-red-500">*</span></Label>
                      <CustomPrisonerSearch
                        value={form.prisoner ? String(form.prisoner) : null}
                        onChange={(val) => setForm(prev => ({ ...prev, prisoner: String(val ?? "") }))}
                        onSelectItem={(p: any) => setForm(prev => ({ ...prev, prisoner: String(p?.id ?? "") }))}
                        placeholder="Select prisoner..."
                        idField="id"
                        labelField="full_name"
                        initialItems={prisoners}
                        pageSize={25}
                      />
                    </div>

                    {/* Relationship */}
                    <div className="space-y-2">
                      <Label>Relationship <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={form.relation}
                        onChange={(val) => setForm({ ...form, relation: String(val ?? "") })}
                        fetchPaginated={fetchRelationshipsPaginated}
                        idField="id"
                        labelField="name"
                        placeholder="Select relationship..."
                        pageSize={50}
                        minQueryLength={0}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visitor Type */}
                    <div className="space-y-2">
                      <Label>Visitor Type <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={form.visitor_type}
                        onChange={(val) => setForm({ ...form, visitor_type: String(val ?? "") })}
                        fetchPaginated={fetchVisitorTypesPaginated}
                        idField="id"
                        labelField="name"
                        placeholder="Select visitor type..."
                        pageSize={50}
                        minQueryLength={0}
                      />
                    </div>

                    {/* Visitor Status */}
                    <div className="space-y-2">
                      <Label>Visitor Status <span className="text-red-500">*</span></Label>
                      <SearchableSelect
                        value={form.visitor_status}
                        onChange={(val) => setForm({ ...form, visitor_status: String(val ?? "") })}
                        fetchPaginated={fetchVisitorStatusesPaginated}
                        idField="id"
                        labelField="name"
                        placeholder="Select status..."
                        pageSize={50}
                        minQueryLength={0}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Visitation Date */}
                    <div className="space-y-2">
                      <Label>Visitation Date <span className="text-red-500">*</span></Label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left",
                              !form.visitation_datetime &&
                                "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.visitation_datetime ? (
                              format(form.visitation_datetime, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.visitation_datetime}
                            onSelect={(date: Date | undefined) => {
                              if (date) {
                                setForm({ ...form, visitation_datetime: date });
                                setCalendarOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time In */}
                    <div className="space-y-2">
                      <Label htmlFor="time_in">Time In</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time_in"
                          type="time"
                          value={form.time_in}
                          onChange={(e) =>
                            setForm({ ...form, time_in: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* Time Out */}
                    <div className="space-y-2">
                      <Label htmlFor="time_out">Time Out</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="time_out"
                          type="time"
                          value={form.time_out}
                          onChange={(e) =>
                            setForm({ ...form, time_out: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_no">Vehicle Number</Label>
                      <Input
                        id="vehicle_no"
                        value={form.vehicle_no}
                        onChange={(e) =>
                          setForm({ ...form, vehicle_no: e.target.value })
                        }
                        placeholder="e.g., UAH 123X"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="place_visited">Place Visited</Label>
                      <Input
                        id="place_visited"
                        value={form.place_visited}
                        onChange={(e) =>
                          setForm({ ...form, place_visited: e.target.value })
                        }
                        placeholder="e.g., Visitor's Hall"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason_of_visitation">
                      Reason of Visitation
                    </Label>
                    <Textarea
                      id="reason_of_visitation"
                      value={form.reason_of_visitation}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          reason_of_visitation: e.target.value,
                        })
                      }
                      placeholder="Enter reason for visit"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={form.remarks}
                      onChange={(e) =>
                        setForm({ ...form, remarks: e.target.value })
                      }
                      placeholder="Additional remarks or notes"
                      rows={2}
                    />
                  </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="blacklist_reason">
                      Blacklist Reason (if applicable)
                    </Label>
                    <Textarea
                      id="blacklist_reason"
                      value={form.blacklist_reason}
                      onChange={(e) =>
                        setForm({ ...form, blacklist_reason: e.target.value })
                      }
                      placeholder="Enter reason if visitor is blacklisted"
                      rows={3}
                    />
                  </div>

                  <div className="p-4 border rounded-lg bg-amber-50">
                    <p className="text-sm text-amber-800">
                      <strong>Security Note:</strong> Ensure all visitor
                      information is verified before granting access. Check ID
                      documents and compare with photo.
                    </p>
                  </div>
                </TabsContent>

                {/* Photo Tab */}
                <TabsContent value="photo" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    {!useCamera && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startCamera}
                          className="flex-1"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Use Camera
                        </Button>
                        <Label
                          htmlFor="photo-upload"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2 h-10 px-4 py-2 bg-white border border-input rounded-md hover:bg-accent hover:text-accent-foreground">
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </div>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </Label>
                      </div>
                    )}

                    {useCamera && (
                      <div className="space-y-2">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg border"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Capture Photo
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={stopCamera}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {photoPreview && (
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <img
                          src={photoPreview}
                          alt="Visitor"
                          className="w-full max-w-sm rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPhotoPreview("");
                            setForm({ ...form, photo: null });
                          }}
                        >
                          Remove Photo
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={
                    loading ||
                    !form.first_name ||
                    !form.last_name ||
                    !form.contact_no ||
                    !form.id_number ||
                    !form.gate ||
                    !form.prisoner ||
                    !form.visitor_type
                  }
                >
                  {loading
                    ? "Saving..."
                    : editingVisitor
                    ? "Update Visitor"
                    : "Register Visitor"}
                </Button>
              </div>
            </form>
          </div>

      {/* Visitors Table */}
          <div>
            {visitorRecordsLoading || tableLoading ? (
              <div className="size-full flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">Fetching visitor records, Please wait...</p>
                </div>
              </div>
            ) : (
              <DataTable
                key={`visitors-${filtersReloadKey}`} // force remount/refetch when filters change
                url="/gate-management/station-visitors/"
                // externalSearch={debouncedSearch}
                 title="Visitor Records"
                 columns={[
                  { key: 'first_name', label: 'Visitor Name', sortable: true, render: (_v: any, row: any) => {
                      const r = row ?? {};
                      return (<div><p>{`${r.first_name ?? ''} ${r.middle_name ?? ''} ${r.last_name ?? ''}`.trim()}</p>{r.organisation ? <p className="text-xs text-muted-foreground">{String(r.organisation)}</p> : null}</div>);
                    }
                  },
                  { key: 'id_number', label: 'ID Number', sortable: true, render: (_v:any,row:any) => String((row ?? {})?.id_number ?? '-') },
                  { key: 'contact_no', label: 'Contact', sortable: true, render: (_v:any,row:any) => String((row ?? {})?.contact_no ?? '-') },
                  { key: 'prisoner_name', label: 'Prisoner', sortable: true, render: (_v:any,row:any) => String((row ?? {})?.prisoner_name ?? '-') },
                  { key: 'visitor_type_name', label: 'Visitor Type', sortable: true, render: (_v:any,row:any) => String((row ?? {})?.visitor_type_name ?? '-') },
                  { key: 'gate_name', label: 'Gate', sortable: true, render: (_v:any,row:any) => String((row ?? {})?.gate_name ?? '-') },
                  { key: 'time_in', label: 'Time In', sortable: true, render: (_v: any, row: any) => {
                      const r = row ?? {};
                      return r.time_in ? (<div className="flex items-center gap-1 text-green-600"><LogIn className="h-3 w-3" />{extractTimeHHMM(r.time_in)}</div>) : '-';
                  }},
                  { key: 'time_out', label: 'Time Out', sortable: true, render: (_v: any, row: any) => {
                      const r = row ?? {};
                      return r.time_out ? (<div className="flex items-center gap-1 text-red-600"><LogOut className="h-3 w-3" />{extractTimeHHMM(r.time_out)}</div>) : '-';
                  }},
                  { key: 'visitor_status_name', label: 'Status', sortable: true, render: (_v:any,row:any) => getStatusBadge(String((row ?? {})?.visitor_status_name ?? '')) },
                  { key: 'actions', label: 'Actions', sortable: false, render: (_v:any,row:any) => {
                      const r = row ?? {};
                      return (<div className="flex gap-1 justify-start"><Button variant="ghost" size="sm" onClick={() => handleEdit(r)} title="Edit visitor"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleGenerateVisitorPass(r)} style={{ color: '#650000' }} title="Generate visitor pass"><FileText className="h-4 w-4" /></Button>{r.photo && <Button variant="ghost" size="sm" onClick={() => { setSelectedPhotoUrl(r.photo); setIsPhotoDialogOpen(true); }} title="View photo"><Image className="h-4 w-4" /></Button>}</div>);
                  }},
                ]}
                // externalSearch={searchQuery}
              />
             )}
           </div>
        </TabsContent>

        {/* Visitor Items Tab */}
        <TabsContent value="items" className="mt-6">
          <VisitorItemList visitors={visitors} items={items} setItems={setItems} />
        </TabsContent>
      </Tabs>

      {/* Visitor Pass Generation Dialog */}
      <Dialog 
        open={isVisitorPassDialogOpen} 
        onOpenChange={(open) => {
          setIsVisitorPassDialogOpen(open);
          if (!open) {
            setSelectedVisitorForPass(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>
              Generate Visitor Pass
            </DialogTitle>
            <DialogDescription>
              Create a visitor pass for {selectedVisitorForPass ? `${selectedVisitorForPass.first_name} ${selectedVisitorForPass.last_name}` : 'selected visitor'}
            </DialogDescription>
          </DialogHeader>

          {selectedVisitorForPass && (
            <VisitorPassForm
              pass={{
                visitor_tag_number: '',
                valid_from: '',
                valid_until: '',
                purpose: selectedVisitorForPass.reason_of_visitation || '',
                issue_date: new Date().toISOString().slice(0, 16),
                is_suspended: false,
                suspended_date: '',
                suspended_reason: '',
                prisoner: selectedVisitorForPass.prisoner,
                visitor: selectedVisitorForPass.id,
                suspended_by: 0,
                prisoner_name: selectedVisitorForPass.prisoner_name,
                visitor_name: `${selectedVisitorForPass.first_name} ${selectedVisitorForPass.middle_name} ${selectedVisitorForPass.last_name}`.trim()
              }}
              onSubmit={handleVisitorPassSubmit}
              onCancel={() => {
                setIsVisitorPassDialogOpen(false);
                setSelectedVisitorForPass(null);
              }}
              disabledFields={{
                prisoner: true,
                visitor: false
              }}
              onAddNewVisitor={() => {
                setIsDialogOpen(true);
                setEditingVisitor(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Viewing Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Visitor Photo</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            {selectedPhotoUrl ? (
              <img 
                src={selectedPhotoUrl} 
                alt="Visitor photo" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <p className="text-muted-foreground">No photo available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
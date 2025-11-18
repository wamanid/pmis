import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
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
import { toast } from "sonner";
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
import * as svc from '../../services/stationServices/shiftDeploymentsService';
import { DataTable } from '../common/DataTable';

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
  handover_report_doc?: string | null;
  station: string;
  shift: string;
  shift_leader: number | string;
  created_datetime?: string;
  updated_datetime?: string;
  is_active?: boolean;
  [k: string]: any;
}

interface ShiftDeployment {
  id: string;
  station_name: string;
  shift_name: string;
  staff_username?: string;
  deployment_area_name?: string;
  name?: string;
  force_number?: string;
  rank?: string;
  rank_name?: string;
  shift_date?: string;
  end_date?: string;
  report?: string;
  station?: string;
  shift?: string;
  staff?: number | string;
  deployment_area?: string;
  [k: string]: any;
}

interface Region {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  region?: string;
}

interface Station {
  id: string;
  name: string;
  district?: string;
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
  id: number | string;
  force_number?: string;
  name?: string;
  rank?: string;
  rank_name?: string;
  station?: string;
  station_name?: string;
  [k: string]: any;
}

// lightweight classNames helper to avoid a runtime dependency on "classnames"
const cn = (...args: Array<string | false | null | undefined>) => args.filter(Boolean).join(' ');

export default function ShiftDeploymentsScreen() {
  // Normalize different API shapes into the fields the UI expects
  const normalizeShiftDetail = (raw: any): ShiftDetail => {
    const shiftLeaderFull =
      raw.shift_leader_full_name ??
      raw.shift_leader_name ??
      raw.shift_leader?.full_name ??
      raw.shift_leader?.name ??
      raw.shift_leader?.username ?? // last-resort fallback
      "";

    const shiftLeaderUsername =
      raw.shift_leader_username ??
      raw.shift_leader?.username ??
      raw.shift_leader?.user_name ??
      "";

    const createdByName =
      raw.created_by_name ??
      raw.created_by?.name ??
      raw.created_by?.full_name ??
      "";

    return {
      ...raw,
      shift_leader_full_name: shiftLeaderFull,
      shift_leader_username: shiftLeaderUsername,
      created_by_name: createdByName,
    };
  };

  // normalize a deployment row (fill missing staff fields from staff list)
  const normalizeDeployment = (raw: any): ShiftDeployment => {
    const base: ShiftDeployment = { ...(raw || {}) };
    // if API returns staff object or id, try to resolve via staff lookup
    const staffId = raw?.staff ?? raw?.staff_id ?? (raw?.staff?.id ? raw.staff.id : undefined);
    let staffObj = undefined;
    if (staffId !== undefined) staffObj = staff.find(s => String(s.id) === String(staffId));

    base.name = raw.name ?? staffObj?.name ?? raw?.staff?.name ?? base.name;
    base.force_number = raw.force_number ?? staffObj?.force_number ?? raw?.staff?.force_number ?? base.force_number;
    base.rank_name = raw.rank_name ?? staffObj?.rank_name ?? raw?.staff?.rank_name ?? raw?.rank ?? base.rank_name;
    base.staff = staffId ?? base.staff;
    return base;
  };

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedStation, setSelectedStation] = useState<string>("");

  // Data states
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [deploymentAreas, setDeploymentAreas] = useState<DeploymentArea[]>([]);
  const [shiftDetails, setShiftDetails] = useState<ShiftDetail[]>([]);
  const [shiftDeployments, setShiftDeployments] = useState<ShiftDeployment[]>([]);
  // total count for server-side shift-details (used by DataTable)
  const [shiftTotal, setShiftTotal] = useState<number>(0);

  // UI states
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedShiftDetail, setSelectedShiftDetail] = useState<ShiftDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);

  // Pagination / sorting for shift-details
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);

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

  // request guards
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  // deployments request guards (separate to avoid races)
  const deployRequestIdRef = useRef(0);
  const deployAbortRef = useRef<AbortController | null>(null);

  // initial startup: load lookups + shift-details (derives shifts)
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();

    (async () => {
      try {
        const [regs, stns, stf, areas, details] = await Promise.all([
          svc.fetchRegions(undefined, c.signal),
          svc.fetchStations(undefined, c.signal),
          svc.fetchStaffProfiles(undefined, c.signal),
          svc.fetchDeploymentAreas(undefined, c.signal),
          svc.fetchShiftDetails({ page_size: -1 }, c.signal),
        ]);
        if (!mounted) return;
 
        setRegions(regs ?? []);
        setStations(stns ?? []);
        setStaff(stf ?? []);
        setDeploymentAreas(areas ?? []);
        const allDetails = details?.results ?? [];
        const normalized = (allDetails || []).map(normalizeShiftDetail);
        setShiftDetails(normalized);
 
         // derive unique shifts from shift-details
        const uniq: Record<string, string> = {};
        normalized.forEach((d: any) => {
          if (d.shift && d.shift_name) uniq[d.shift] = d.shift_name;
        });
        setShifts(Object.entries(uniq).map(([id, name]) => ({ id, name })));
      } catch (err) {
        console.error('initial lookups error', err);
        toast.error('Failed to load initial lookup data');
      }
    })();

    return () => { mounted = false; c.abort(); };
  }, []);

  // Load districts when region changes
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();

    (async () => {
      if (!selectedRegion) {
        setDistricts([]);
        setSelectedDistrict("");
        setSelectedStation("");
        return;
      }
      try {
        const ds = await svc.fetchDistricts({ region: selectedRegion }, c.signal);
        if (!mounted) return;
        setDistricts(ds ?? []);
        setSelectedDistrict("");
        setSelectedStation("");
      } catch (err) {
        console.error('fetchDistricts error', err);
        toast.error('Failed to load districts');
      }
    })();

    return () => { mounted = false; c.abort(); };
  }, [selectedRegion]);

  // Load stations when district changes
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();

    (async () => {
      try {
        if (!selectedDistrict) {
          // keep existing stations loaded on startup; only clear selected station
          setSelectedStation("");
          return;
        }
        const stns = await svc.fetchStations({ district: selectedDistrict }, c.signal);
        if (!mounted) return;
        setStations(stns ?? []);
        setSelectedStation("");
      } catch (err) {
        console.error('fetchStations error', err);
        toast.error('Failed to load stations');
      }
    })();

    return () => { mounted = false; c.abort(); };
  }, [selectedDistrict]);

  // loadShiftDetails: cancellable, request-id guarded to avoid stale responses
  const loadShiftDetails = useCallback(async (p = 1, ps = 10, sf?: string, sd?: 'asc'|'desc', q?: string) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLoading(true);

    try {
      const params: Record<string, any> = { page: Math.max(1, Number(p) || 1), page_size: Number(ps) || 10 };
      if (sf) params.ordering = sd === 'desc' ? `-${sf}` : sf;
      if (q) params.search = q;
      params._t = Date.now();

      const res = await svc.fetchShiftDetails(params, controller.signal);
      const rawItems = res?.results ?? [];
      const items = (rawItems || []).map(normalizeShiftDetail);
      const count = Number(res?.count ?? items.length ?? 0);
      // only apply if latest request
      if (requestIdRef.current === reqId) {
        setShiftDetails(items);
        setShiftTotal(count);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
        return;
      }
      console.error('loadShiftDetails error', err);
      toast.error('Failed to load shifts');
    } finally {
      if (requestIdRef.current === reqId) setLoading(false);
    }
  }, []);

  // initial/load on page/search/sort change
  useEffect(() => {
    loadShiftDetails(page, pageSize, sortField, sortDir, searchQuery);
  }, [page, pageSize, sortField, sortDir, searchQuery, loadShiftDetails]);

  // client-side filtered list (keeps UI filters)
  const filteredShiftDetails = shiftDetails.filter(shift => {
    if (selectedStation && shift.station !== selectedStation) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        String(shift.shift_name ?? '').toLowerCase().includes(q) ||
        String(shift.shift_leader_full_name ?? '').toLowerCase().includes(q) ||
        String(shift.station_name ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // create shift - posts FormData if document present
  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('station', shiftForm.station);
      fd.append('shift', shiftForm.shift);
      fd.append('shift_leader', shiftForm.shift_leader);
      fd.append('handover_report', shiftForm.handover_report || '');
      if (shiftForm.handover_report_doc) fd.append('handover_report_doc', shiftForm.handover_report_doc);
      await svc.createShiftDetail(fd as any);
      toast.success("Shift created successfully");
      setIsShiftDialogOpen(false);
      setShiftForm({
        station: "",
        shift: "",
        shift_leader: "",
        handover_report: "",
        handover_report_doc: null,
      });
      // refresh list (first page)
      setPage(1);
      await loadShiftDetails(1, pageSize, sortField, sortDir, searchQuery);
    } catch (error: any) {
      console.error('createShift error', error?.response ?? error);
      const msg = error?.response?.data ? JSON.stringify(error.response.data) : 'Failed to create shift';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaffToShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // find staff details (must exist; staff list loaded at startup)
      const staffObj = staff.find(s => String(s.id) === String(staffForm.staff));
      const payload: Record<string, any> = {
        station: staffForm.station || selectedStation,
        shift: staffForm.shift,
        staff: staffForm.staff,
        deployment_area: staffForm.deployment_area,
        shift_date: format(staffForm.shift_date, 'yyyy-MM-dd'),
        end_date: format(staffForm.end_date, 'yyyy-MM-dd'),
        report: staffForm.report || '',
      };
 
      // Backend requires these fields according to validation error: include them from staff profile
      if (staffObj) {
        payload.name = staffObj.name ?? `${staffObj.first_name ?? ''} ${staffObj.last_name ?? ''}`.trim();
        if (staffObj.force_number) payload.force_number = staffObj.force_number;
        // include rank id if available, else include display name
        if (staffObj.rank) payload.rank = staffObj.rank;
        else if (staffObj.rank_name) payload.rank = staffObj.rank_name;
      }
 
      await svc.createDeployment(payload);
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
      // refresh deployments for the shift we added to (prefer staffForm.shift if set)
      const targetShiftId = staffForm.shift || selectedShiftDetail?.id;
      if (targetShiftId) {
        await loadDeployments(targetShiftId);
      }
      // refresh shift-details counts so staff count updates immediately
      await loadShiftDetails(page, pageSize, sortField, sortDir, searchQuery);
    } catch (error: any) {
      console.error('createDeployment error', error?.response ?? error);
      const data = error?.response?.data;
      if (data && typeof data === 'object') {
        // join backend field errors for user
        const msgs = Object.values(data).flat().filter(Boolean).join(' — ');
        toast.error(msgs || 'Failed to add staff to shift');
      } else {
        const msg = error?.response?.data ? JSON.stringify(error.response.data) : 'Failed to add staff to shift';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDeployments = useCallback(async (shiftId: string) => {
    try { deployAbortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    deployAbortRef.current = controller;
    const reqId = ++deployRequestIdRef.current;
    setDeployLoading(true);

    try {
      // Try nested endpoint first (shift-details/{id}/deployments/)
      let res: any = null;
      try {
        res = await svc.fetchShiftDetailDeployments(shiftId, undefined, controller.signal);
      } catch (err) {
        // ignore and fallback
        res = null;
      }

      // if nested returned nothing or is not expected, fallback to shift-deployments?shift=<id>
      if (!res || (!res.results && !Array.isArray(res))) {
        const fallback = await svc.fetchShiftDeployments({ shift: shiftId }, controller.signal);
        // some APIs return results, some return array directly
        res = fallback;
      }

      const rawItems = res?.results ?? (Array.isArray(res) ? res : []);
      // normalize each deployment using staff lookup
      const items = (rawItems || []).map(normalizeDeployment);
      if (deployRequestIdRef.current === reqId) {
        setShiftDeployments(items);
      }
    } catch (err) {
      if ((err as any)?.name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
      console.error('deployments load error', err);
      toast.error('Failed to load deployments');
    } finally {
      if (deployRequestIdRef.current === reqId) setDeployLoading(false);
    }
  }, [staff]);

  const handleViewDeployments = (shift: ShiftDetail) => {
    setSelectedShiftDetail(shift);
    loadDeployments(shift.id);
  };

  // staff list is loaded from backend into `staff`

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
            <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
              <div className="flex-1 overflow-y-auto p-6">
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
                          ? staff.find((s) => String(s.id) === String(shiftForm.shift_leader))?.name
                          : "Select shift leader..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search staff..." />
                        <CommandEmpty>No staff found.</CommandEmpty>
                        <CommandGroup>
                          {staff.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={s.name}
                              onSelect={() => {
                                setShiftForm({ ...shiftForm, shift_leader: String(s.id) });
                                setOpenShiftLeaderCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  shiftForm.shift_leader === String(s.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {s.name} ({s.force_number}) - {s.rank_name ?? s.rank}
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
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff to Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
              <div className="flex-1 overflow-y-auto p-6">
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
                          ? staff.find((s) => String(s.id) === staffForm.staff)?.name
                          : "Select staff..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search staff..." />
                        <CommandEmpty>No staff found.</CommandEmpty>
                        <CommandGroup>
                          {staff.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={s.name}
                              onSelect={() => {
                                setStaffForm({ ...staffForm, staff: String(s.id) });
                                setOpenStaffCombo(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  staffForm.staff === String(s.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {s.name} ({s.force_number}) - {s.rank_name ?? s.rank}
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
              </div>
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
          <div className="">
            {/* DataTable for Shift Details (server-side paging/sort) */}
            <DataTable
              title="Shift Details"
              data={shiftDetails}
              loading={loading}
              total={shiftTotal}
              columns={[
                { key: 'station_name', label: 'Station', sortable: true },
                { key: 'shift_name', label: 'Shift', sortable: true },
                {
                  key: 'shift_leader_full_name',
                  label: 'Shift Leader',
                  sortable: true,
                  render: (_v: any, r: ShiftDetail) => (
                    <div>
                      <div>{r.shift_leader_full_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">@{r.shift_leader_username}</div>
                    </div>
                  )
                },
                { key: 'deployment_count', label: 'Staff Count', render: (_v:any, r:ShiftDetail) => <Badge variant="secondary">{r.deployment_count ?? r.deployments ?? '0'} staff</Badge> },
                { key: 'handover_report', label: 'Handover Report', render: (v: any) => <div className="max-w-xs truncate">{v ?? 'No report'}</div> },
                { key: 'created_by_name', label: 'Created By' },
                { key: 'id', label: 'Actions', render: (_v:any, r:ShiftDetail) => (
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleViewDeployments(r)}><Users className="h-4 w-4 mr-1" />View Staff</Button>
                    </div>
                  )}
              ]}
              externalSearch={searchQuery}
              onSearch={(q) => { setSearchQuery(q); setPage(1); }}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              onSort={(f,d) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff Deployments Table (DataTable) */}
      {selectedShiftDetail && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Deployments - {selectedShiftDetail.shift_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="">
              <DataTable
                title="Deployments"
                data={shiftDeployments}
                loading={deployLoading}
                total={shiftDeployments?.length ?? 0}
                columns={[
                  { key: 'name', label: 'Staff Name' },
                  { key: 'force_number', label: 'Force Number' },
                  { key: 'rank_name', label: 'Rank' },
                  { key: 'deployment_area_name', label: 'Deployment Area' },
                  { key: 'shift_date', label: 'Shift Date' },
                  { key: 'end_date', label: 'End Date' },
                  { key: 'report', label: 'Report', render: (v:any) => <div className="max-w-xs truncate">{v ?? 'No report'}</div> },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

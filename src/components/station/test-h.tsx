
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










-----------


Fileupload service b4 robinson

import axiosInstance from "./axiosInstance";
import type { UploadOptions } from "./fileUploadService";

/**
 * fileUploadService
 *
 * Small upload helper to centralize multipart/form-data uploads.
 * - Accepts a single File and optional metadata.
 * - Supports onProgress callback and AbortSignal for cancellation.
 * - Returns server response (or throws an Error with details).
 *
 * Usage:
 *   uploadFile(file, { url: "/some/upload/", fieldName: "file", extraData: { foo: "bar" }, onProgress, signal })
 */

export interface UploadOptions {
  url?: string; // full endpoint or relative to axiosInstance baseURL; default must be provided by caller
  fieldName?: string; // form field name for file; default "file"
  extraData?: Record<string, any>; // additional form fields
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export async function uploadFile(file: File, options: UploadOptions = {}) {
  const {
    url = "/uploads/",
    fieldName = "file",
    extraData,
    onProgress,
    signal,
    headers,
  } = options;

  const fd = new FormData();
  fd.append(fieldName, file);

  if (extraData) {
    Object.keys(extraData).forEach((k) => {
      const v = extraData[k];
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
  }

  try {
    // Debug FormData keys (no file contents)
    try {
      const fdKeys: string[] = [];
      for (const pair of (fd as any).entries()) fdKeys.push(String(pair[0]));
      console.debug("[uploadFile] FormData keys:", fdKeys);
    } catch (e) { /* ignore */ }

    // Build outgoing headers but DO NOT set Content-Type.
    // Also merge auth headers from axiosInstance.defaults so XHR uses same Authorization/Cookie.
    const outgoingHeaders = { ...(headers ?? {}) } as Record<string, any>;
    try {
      const axiosHdrs = (axiosInstance && (axiosInstance.defaults as any)?.headers) ?? {};
      const common = axiosHdrs.common ?? axiosHdrs;
      Object.assign(outgoingHeaders, { ...common, ...outgoingHeaders });
    } catch (e) {
      /* ignore if axiosInstance not available or shape differs */
    }
    if ("Content-Type" in outgoingHeaders) delete outgoingHeaders["Content-Type"];
    outgoingHeaders["Accept"] = outgoingHeaders["Accept"] ?? "application/json";

    // Fallback: if no Authorization header found, try to read common localStorage keys used by auth
    if (!outgoingHeaders["Authorization"] && !outgoingHeaders["authorization"]) {
      const token =
        localStorage.getItem("access_token") ??
        localStorage.getItem("token") ??
        localStorage.getItem("auth_token") ??
        localStorage.getItem("authToken") ??
        null;
      if (token) {
        outgoingHeaders["Authorization"] = token.startsWith("Bearer") ? token : `Bearer ${token}`;
      }
    }

    // Debug headers
    try { console.debug("[uploadFile] outgoingHeaders:", outgoingHeaders); } catch (e) {}
 
    // Resolve full URL against axiosInstance.baseURL (preferred) then VITE_API_BASE_URL.
    // This ensures XHR multipart uploads go to the same backend as axiosInstance requests.
    const configuredBase =
      (axiosInstance && (axiosInstance.defaults as any)?.baseURL) ??
      ((import.meta as any).env?.VITE_API_BASE_URL ?? "");

    let fullUrl: string;
    if (/^https?:\/\//i.test(url)) {
      fullUrl = url;
    } else {
      const baseNormalized = String(configuredBase ?? "").replace(/\/$/, "");
      const pathNormalized = url.startsWith("/") ? url : `/${url}`;
      fullUrl = baseNormalized ? `${baseNormalized}${pathNormalized}` : pathNormalized;
    }
    console.debug("[uploadFile] full upload URL =", fullUrl);

    // Use XMLHttpRequest directly to avoid axiosInstance interceptors that may force JSON headers
    const xhrResult = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", fullUrl, true);
      // include credentials (cookies) for same auth flows that rely on cookies
      xhr.withCredentials = true;

      // Set any non-Content-Type headers (Accept etc.)
      try {
        Object.entries(outgoingHeaders).forEach(([k, v]) => {
          if (v != null) xhr.setRequestHeader(k, String(v));
        });
      } catch (e) {
        /* ignore header set errors */
      }

      xhr.upload.onprogress = (ev: ProgressEvent) => {
        if (ev.lengthComputable && onProgress) {
          const percent = Math.round((ev.loaded * 100) / ev.total);
          onProgress(percent);
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed: Network / no response"));
      xhr.ontimeout = () => reject(new Error("Upload failed: timeout"));

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        const status = xhr.status;
        const text = xhr.responseText;
        let parsed: any = null;
        try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = text; }
        if (status >= 200 && status < 300) resolve(parsed);
        else {
          const err = new Error(`Upload failed: HTTP ${status}`);
          (err as any).status = status;
          (err as any).data = parsed;
          reject(err);
        }
      };

      if (signal) {
        if (signal.aborted) {
          xhr.abort();
          return reject(new DOMException("Aborted", "AbortError"));
        }
        const onAbort = () => {
          try { xhr.abort(); } catch {}
          reject(new DOMException("Aborted", "AbortError"));
        };
        signal.addEventListener("abort", onAbort, { once: true });
      }

      xhr.send(fd);
    });

    return xhrResult;
  } catch (err: any) {
    if ((err as any)?.status) {
      const e = new Error(`Upload failed: HTTP ${(err as any).status}`);
      (e as any).status = (err as any).status;
      (e as any).data = (err as any).data;
      throw e;
    } else if ((err as any)?.name === "AbortError") {
      const e = new Error("Upload failed: aborted");
      (e as any).name = "AbortError";
      throw e;
    } else {
      throw err;
    }
  }
}

// New helper: read a File into a base64-encoded string.
// Returns { base64, filename, mimeType } so callers can include in JSON payloads.
export async function readFileAsBase64(file: File): Promise<{ base64: string; filename: string; mimeType: string }> {
  // Use FileReader for browser compatibility
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Failed to read file"));
    };
    reader.onload = () => {
      const result = reader.result as string; // data:[mime];base64,XXXX
      // strip the "data:*/*;base64," prefix if present
      const comma = result.indexOf(",");
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({ base64, filename: file.name, mimeType: file.type || "application/octet-stream" });
    };
    reader.readAsDataURL(file);
  });
}



----------
Letters b4 robinson

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Search, Edit, Trash2, X, Save, Calendar as CalendarIcon, Upload, Phone, Mail } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner"; // fixed import
import SearchableSelect from "../common/SearchableSelect";
import FileUploader from "../common/FileUploader";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "../ui/switch";
import { DataTable } from "../common/DataTable";
import * as PhoneService from "../../services/stationServices/phoneService";
import * as LetterService from "../../services/stationServices/letterService";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from "../../services/axiosInstance";
// use the typed/custom prisoners service (returns { items, count })
import { fetchPrisoners as fetchPrisonersService } from "../../services/customPrisonersService";
import { sendFile, AUDIO_EXTS, LETTER_ALLOWED_EXTS } from "../../services/uploadStrategyService";
import { readFileAsBase64 } from "../../services/fileUploadService"; // keep if used elsewhere
import StaffProfileSelect from "../common/StaffProfileSelect";
import ConfirmDialog from "../common/ConfirmDialog";

/**
 * Centralized API endpoints (single source of truth).
 * Update these values to match backend routes. Use these variables
 * everywhere instead of hardcoding strings.
 */
const API_ENDPOINTS = {
  createLetter: "/rehabilitation/eletters/",        // POST to create letter (JSON)
  createCall: "/rehabilitation/call-records/",      // POST to create call record (JSON)
  // Upload endpoints used by uploadStrategyService.
  // If your backend has dedicated upload endpoints, set them here.
  // Otherwise uploadStrategyService will post base64 JSON to `doc` endpoint
  // or multipart to `audio` endpoint depending on file type.

};

// create accept strings for inputs from the extension lists
// keep these centralized so future devs can change formats in one place
const AUDIO_UPLOAD_ACCEPT = "." + AUDIO_EXTS.join(".,");
const LETTER_UPLOAD_ACCEPT = "." + LETTER_ALLOWED_EXTS.join(".,");
;

// helper: get extension in lowercase (without dot)
function fileExt(file: File | null) {
  if (!file) return "";
  return (file.name.split(".").pop() || "").toLowerCase();
}

// new helper: format ISO -> "YYYY-MM-DDTHH:MM" for datetime-local inputs
function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// helper: extract a usable file reference from uploadStrategyService response
function extractFileRefFromSendResult(res: any): string | null {
  // backends vary; check common shapes and return a string usable by create endpoints
  if (!res) return null;
  // sometimes service returns normalized { ok, data }
  const data = res.data ?? res;
  if (!data) return null;
  // common fields
  if (typeof data === "string") return data;               // maybe base64 or URL string
  if (data.file_identifier) return data.file_identifier;   // custom
  if (data.id) return String(data.id);
  if (data.url) return data.url;
  if (data.path) return data.path;
  // if API returned structure with file.content_base64
  if (data.file && data.file.content_base64) return data.file.content_base64;
  // fallback — caller can inspect res.data manually in logs
  return null;
}

// helper: convert "YYYY-MM-DDTHH:MM" (datetime-local) to ISO string (UTC)
function localToISOString(dtLocal?: string | null) {
  if (!dtLocal) return null;
  // expected format "YYYY-MM-DDTHH:MM" or "YYYY-MM-DDTHH:MM:SS"
  const parts = dtLocal.split("T");
  if (parts.length !== 2) return null;
  const [y, m, d] = parts[0].split("-").map(Number);
  const [hh, mmSec] = parts[1].split(":");
  const hhNum = Number(hh);
  const mmNum = Number(mmSec?.split(":")[0] ?? 0);
  const ssNum = Number(mmSec?.split(":")[1] ?? 0);
  const dt = new Date(y, (m || 1) - 1, d, hhNum, mmNum, ssNum);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

// add near other helpers (fileExt, toDatetimeLocal, localToISOString, etc.)
function normalizeSelectToId(v: any) {
  if (v === null || v === undefined) return v;
  if (typeof v === "object") return v.id ?? v.value ?? v;
  return v;
}

function normalizeLetterForSubmit(raw: any) {
  if (!raw) return raw;
  const out: any = { ...raw };

  out.prisoner = normalizeSelectToId(raw.prisoner);
  out.letter_type = normalizeSelectToId(raw.letter_type);
  out.relation_to_prisoner = normalizeSelectToId(raw.relation_to_prisoner);
  out.welfare_officer = normalizeSelectToId(raw.welfare_officer);

  // ensure ISO date
  if (raw.letter_date) {
    const iso = localToISOString(typeof raw.letter_date === "string" ? raw.letter_date : String(raw.letter_date));
    if (iso) out.letter_date = iso;
  }

  // remove File before JSON submit (sendFile handles uploads)
  if (out.letter_document instanceof File) delete out.letter_document;

  return out;
}

type Tab = "calls" | "letters";

export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>("calls");

  // shared table state (calls)
  const [callsData, setCallsData] = useState<PhoneService.CallRecordItem[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsTotal, setCallsTotal] = useState(0);

  // shared table state (letters)
  const [lettersData, setLettersData] = useState<LetterService.ELetterItem[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersTotal, setLettersTotal] = useState(0);

  // paging / sort / search (shared pattern, separate state per table)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // lookups for selects
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);

  // dialog / form state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PhoneService.CallRecordItem | null>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterService.ELetterItem | null>(null);

  // forms
  const callForm = useForm<any>({ defaultValues: {} });
  const letterForm = useForm<any>({ defaultValues: {} });

  // Map API item -> table row (if you need normalization)
  const mapCall = useCallback((it: any): PhoneService.CallRecordItem => ({ ...it }), []);
  const mapLetter = useCallback((it: any): LetterService.ELetterItem => ({ ...it }), []);

  // load lookups used in searchable selects
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [lt, rel] = await Promise.all([
          LetterService.fetchLetterTypes(undefined, c.signal),
          LetterService.fetchRelationships(undefined, c.signal),
        ]);
        if (!mounted) return;
        setLetterTypes(lt ?? []);
        setRelationships(rel ?? []);
      } catch (err) {
        console.error("lookup error", err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Parent-controlled loadTable for calls
  const loadCalls = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setCallsLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      // include location filters from top nav if present
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await PhoneService.fetchCallRecords(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setCallsData((items || []).map(mapCall));
        setCallsTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadCalls error", err);
      toast.error("Failed to load call records");
    } finally {
      if (requestIdRef.current === reqId) setCallsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapCall]);

  // Parent-controlled loadTable for letters
  const loadLetters = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLettersLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await LetterService.fetchLetters(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setLettersData((items || []).map(mapLetter));
        setLettersTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadLetters error", err);
      toast.error("Failed to load letters");
    } finally {
      if (requestIdRef.current === reqId) setLettersLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapLetter]);

  // reload when filters or debounce/search change
  useEffect(() => {
    if (activeTab === "calls") {
      loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    } else {
      loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
    }
  }, [activeTab, page, pageSize, sortField, sortDir, debouncedSearch, loadCalls, loadLetters]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    if (activeTab === "calls") loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    else loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
  }, [region, district, station]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => setPage(p);
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: "asc" | "desc" | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // columns
  const callsColumns = [
    { key: "call_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{row.call_date ? new Date(row.call_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "caller", label: "Caller" },
    { key: "phone_number", label: "Phone" },
    { key: "call_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "call_duration", label: "Duration" },
    { key: "call_notes", label: "Notes", render: (v: any) => (<div className="max-w-xs truncate">{v || "-"}</div>) },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => {
        setEditingCall(r);
        // ensure call_date is in datetime-local format
        callForm.reset({ ...r, call_date: toDatetimeLocal(r?.call_date) });
        setCallDialogOpen(true);
      }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={() => {
        // open confirm dialog for delete
        confirmActionRef.current = {
          title: "Delete Call Record",
          description: `Delete call record for "${r.prisoner_name ?? r.caller ?? r.id}"? This action cannot be undone.`,
          onConfirm: async () => {
            try {
              await PhoneService.deleteCallRecord(r.id);
              toast.success("Call record deleted");
              loadCalls(page, pageSize);
            } catch (err) {
              console.error("delete call error", err);
              toast.error("Failed to delete call record");
            }
          },
        };
        setConfirmOpen(true);
      }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  const lettersColumns = [
    { key: "letter_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div>{row.letter_date ? new Date(row.letter_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "letter_tracking_number", label: "Tracking No." },
    { key: "subject", label: "Subject" },
    { key: "letter_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => {
        setEditingLetter(r);
        // ensure letter_date is in datetime-local format
        letterForm.reset({
          ...r,
          prisoner: normalizeSelectToId(r.prisoner),
          letter_type: normalizeSelectToId(r.letter_type),
          relation_to_prisoner: normalizeSelectToId(r.relation_to_prisoner),
          welfare_officer: normalizeSelectToId(r.welfare_officer),
          letter_date: toDatetimeLocal(r?.letter_date),
        });
        setLetterDialogOpen(true);
      }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={() => {
        confirmActionRef.current = {
          title: "Delete Letter",
          description: `Delete letter "${r.subject ?? r.letter_tracking_number ?? r.id}" for "${r.prisoner_name ?? r.id}"? This action cannot be undone.`,
          onConfirm: async () => {
            try {
              await LetterService.deleteLetter(r.id);
              toast.success("Letter deleted");
              loadLetters(page, pageSize);
            } catch (err) {
              console.error("delete letter error", err);
              toast.error("Failed to delete letter");
            }
          },
        };
        setConfirmOpen(true);
      }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  // wrapper that forwards current filter context to centralized service
  const fetchPrisoners = useCallback(async (q = "", signal?: AbortSignal) => {
    try {
      const res = await fetchPrisonersService(
        { search: q || "", station: station ?? null, district: district ?? null, region: region ?? null, page_size: 100 },
        signal
      );

      // NORMALIZE: service may return { items, count } or an array
      const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);

      // safety: ensure we always operate on an array
      if (!Array.isArray(items)) return [];

      const qlc = (q || "").trim().toLowerCase();
      if (!qlc) return items;

      return items.filter((it: any) => {
        return String(it.full_name ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number_value ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number ?? "").toLowerCase().includes(qlc);
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      console.error("prisoners lookup error", err);
      toast.error("Failed to load prisoners (network).");
      // toast.error("Failed to load prisoners (network). Check CORS / backend or use dev proxy.");
      return [];
    }
  }, [station, district, region]);

  const fetchCallTypes = useCallback(async (q = "", signal?: AbortSignal) => {
    const res = await axiosInstance.get("/rehabilitation/call-types/", { params: { search: q, page_size: 50 }, signal });
    return res.data?.results ?? [];
  }, []);

  // small wrappers for preloaded lists (relationships, letterTypes)
  const fetchRelationshipsLocal = useCallback(async (q = "") => {
    if (!q) return relationships;
    const qlc = q.toLowerCase();
    return relationships.filter((r:any) => String(r.name ?? "").toLowerCase().includes(qlc));
  }, [relationships]);

  const fetchLetterTypesLocal = useCallback(async (q = "") => {
    if (!q) return letterTypes;
    const qlc = q.toLowerCase();
    return letterTypes.filter((t:any) => String(t.name ?? "").toLowerCase().includes(qlc));
  }, [letterTypes]);

  // form submit handlers
  const onSubmitCall = async (data: any) => {
    try {

      // normalize call_date to ISO if present
      if (data?.call_date) {
        const iso = localToISOString(data.call_date);
        if (iso) data.call_date = iso;
      }

      const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

      // If file present validate extension
      if (file) {
        const ext = fileExt(file);
        if (!AUDIO_EXTS.includes(ext)) {
          toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
        // so sendFile will post multipart with meta (other fields) to that endpoint.
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
          meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
        });

        if (!sendRes.ok) {
          console.error("call file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload recorded call");
          return;
        }

        // If the upload endpoint created the record, we're done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
          toast.success(editingCall?.id ? "Call updated" : "Call created");
        } else {
          // Otherwise, try to extract a file reference and post the record normally.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.recorded_call = fileRef;
          else data.recorded_call = sendRes.data ?? null;

          if (editingCall?.id) {
            await PhoneService.updateCallRecord(editingCall.id, data);
            toast.success("Call updated");
          } else {
            await PhoneService.createCallRecord(data);
            toast.success("Call created");
          }
        }
      } else {
        // No file -> send JSON via existing service
        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }

      setCallDialogOpen(false);
      loadCalls(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save call");
    }
  };

  const onSubmitLetter = async (data: any) => {
    try {

      // normalize call_date to ISO if present
      if (data?.call_date) {
        const iso = localToISOString(data.call_date);
        if (iso) data.call_date = iso;
      }

      const file = data?.letter_document instanceof File ? data.letter_document as File : null;
  
      if (file) {
        const ext = fileExt(file);
        if (!LETTER_ALLOWED_EXTS.includes(ext)) {
          toast.error(`Letter document must be one of: ${LETTER_ALLOWED_EXTS.join(", ")}`);
          return;
        }
  
        // Use upload strategy service:
        // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
        // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
        const sendRes = await sendFile(file, {
          // endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
          endpoints: { doc: API_ENDPOINTS.createLetter },
          meta: { ...data },
        });
  
        if (!sendRes.ok) {
          console.error("letter file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload letter document");
          return;
        }
  
        // If endpoint returned created resource, done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
          toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
        } else {
          // Otherwise extract file ref and include in JSON create call.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.letter_document = fileRef;
          else data.letter_document = sendRes.data ?? null;
  
          if (editingLetter?.id) {
            await LetterService.updateLetter(editingLetter.id, data);
            toast.success("Letter updated");
          } else {
            await LetterService.createLetter(data);
            toast.success("Letter created");
          }
        }
      } else {
        // No file -> send JSON as before
        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }
  
      setLetterDialogOpen(false);
      loadLetters(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save letter");
    }
  };
  

  // confirm dialog state & holder for dynamic confirm action
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmActionRef = useRef<null | { title?: string; description?: string; onConfirm: () => Promise<void> }>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#650000]">Letters & Phone Calls</h1>
        <p className="text-muted-foreground">Manage prisoner communications and correspondence</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab === "calls" ? "calls" : "letters"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button className="bg-primary" 
          onClick={() => { 
            if (activeTab === "calls") { 
              setEditingCall(null); callForm.reset({}); setCallDialogOpen(true); 
            } else { 
              setEditingLetter(null); letterForm.reset({}); setLetterDialogOpen(true); 
            } 
          }}><Plus className="h-4 w-4 mr-2" />
          {activeTab === "calls" ? "Add Call Record" : "Add Letter"}
        </Button>
      </div>

      {/* Restored original-style tabs with counts (icons + label + count). */}
      <Tabs value={activeTab} onValueChange={(v: Tab) => setActiveTab(v)}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Calls ({callsTotal ?? 0})
          </TabsTrigger>
          <TabsTrigger value="letters" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Letters ({lettersTotal ?? 0})
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>{activeTab === "calls" ? "Call Records" : "Letters"}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "calls" ? (
              <DataTable
                data={callsData}
                loading={callsLoading}
                total={callsTotal}
                title="Call Records"
                columns={callsColumns}
                externalSearch={searchTerm}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            ) : (
              <DataTable
                data={lettersData}
                loading={lettersLoading}
                total={lettersTotal}
                title="Letters"
                columns={lettersColumns}
                externalSearch={searchTerm}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Call dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCall ? "Edit Call Record" : "Add Call Record"}</DialogTitle></DialogHeader>
          <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      key={`prisoner-select-${region ?? ""}-${district ?? ""}-${station ?? ""}`}
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {callForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Caller Name (required) */}
              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="caller"
                  {...callForm.register("caller", { required: "Caller name is required" })}
                  placeholder="Enter caller name"
                />
                {callForm.formState.errors.caller && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.caller as any).message}</p>
                )}
              </div>

              {/* Phone Number (required) */}
              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  {...callForm.register("phone_number", { ...phoneNumberValidation, required: "Phone number is required" })}
                  placeholder="+256700000000"
                />
                {callForm.formState.errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.phone_number as any).message}</p>
                )}
              </div>

              {/* Call Type (required) */}
              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="call_type"
                  control={callForm.control}
                  rules={requiredValidation("Call type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchCallTypes}
                      placeholder="Select call type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.call_type && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_type as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="relation_to_prisoner">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Welfare Officer (required) */}
              <div>
                <Label htmlFor="welfare_officer">
                  Welfare Officer <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="welfare_officer"
                  control={callForm.control}
                  rules={requiredValidation("Welfare officer")}
                  render={({ field }) => (
                    <StaffProfileSelect
                      value={field.value}
                      onChange={(forceNumber) => field.onChange(forceNumber)}
                      placeholder="Select welfare officer"
                    />
                  )}
                />
                {callForm.formState.errors.welfare_officer && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.welfare_officer as any).message}</p>
                )}
              </div>

              {/* Call Date & Time (required) */}
              <div>
                <Label htmlFor="call_date">
                  Call Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_date"
                  type="datetime-local"
                  {...callForm.register("call_date", { required: "Call date is required" })}
                />
                {callForm.formState.errors.call_date && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_date as any).message}</p>
                )}
              </div>

              {/* Call Duration (required) */}
              <div>
                <Label htmlFor="call_duration">
                  Call Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_duration"
                  type="number"
                  {...callForm.register("call_duration", {
                    required: "Call duration is required",
                    valueAsNumber: true,
                  })}
                  placeholder="Enter duration in minutes"
                />
                {callForm.formState.errors.call_duration && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_duration as any).message}</p>
                )}
              </div>

              {/* Recorded Call (optional upload) */}
              <div>
                <Label htmlFor="recorded_call">Recorded Call (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Upload audio recording (optional)</p>
                  {/* FileUploader provides client-side validation + UX.
                      For recorded calls we allow common audio formats; change list below if needed. */}
                  <FileUploader
                    id="recorded_call"
                    accept={AUDIO_UPLOAD_ACCEPT}
                    allowedExts={AUDIO_EXTS}
                    maxSizeBytes={10 * 1024 * 1024} // 10 MB
                    onChange={(files) => {
                      if (files && files.length) callForm.setValue("recorded_call", files[0]);
                      else callForm.setValue("recorded_call", null);
                    }}
                  />
                </div>
              </div>
              {/* Call Notes */}
              <div>
                <Label htmlFor="call_notes">Call Notes</Label>
                <Textarea
                  id="call_notes"
                  {...callForm.register("call_notes")}
                  placeholder="Enter any notes about the call"
                  rows={6}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingCall ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
       </Dialog>

      {/* Letter dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLetter ? "Edit Letter" : "Add Letter"}</DialogTitle></DialogHeader>
          <form onSubmit={letterForm.handleSubmit(onSubmitLetter)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {letterForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Letter Type (required) */}
              <div>
                <Label htmlFor="letter_type">
                  Letter Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="letter_type"
                  control={letterForm.control}
                  rules={requiredValidation("Letter type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      items={letterTypes}
                      placeholder="Select letter type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.letter_type && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_type as any).message}</p>
                )}
              </div>

              {/* Subject (required) */}
              <div className="md:col-span-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  {...letterForm.register("subject", { required: "Subject is required" })}
                  placeholder="Enter letter subject"
                />
                {letterForm.formState.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.subject as any).message}</p>
                )}
              </div>

              {/* Letter Date (required) */}
              <div>
                <Label htmlFor="letter_date">
                  Letter Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="letter_date"
                  type="datetime-local"
                  {...letterForm.register("letter_date", { required: "Letter date is required" })}
                />
                {letterForm.formState.errors.letter_date && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_date as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="letter_relation">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Welfare Officer */}
              <div>
                <Label htmlFor="welfare_officer">Welfare Officer</Label>
                <Controller
                  name="welfare_officer"
                  control={letterForm.control}
                  render={({ field }) => (
                    <StaffProfileSelect
                      value={field.value}
                      onChange={(forceNumber) => field.onChange(forceNumber)}
                      placeholder="Select welfare officer"
                    />
                  )}
                />
              </div>

              {/* Sender Name */}
              <div>
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  {...letterForm.register("sender_name")}
                  placeholder="Enter sender name"
                />
              </div>

              {/* Sender Email */}
              <div>
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  {...letterForm.register("sender_email", emailValidation)}
                  placeholder="sender@example.com"
                />
                {letterForm.formState.errors.sender_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {(letterForm.formState.errors.sender_email as any).message || "Invalid email"}
                  </p>
                )}
              </div>

              {/* Recipient Name */}
              <div>
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  {...letterForm.register("recipient_name")}
                  placeholder="Enter recipient name"
                />
              </div>

              {/* Recipient Email */}
              <div>
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  {...letterForm.register("recipient_email", emailValidation)}
                  placeholder="recipient@example.com"
                />
                {letterForm.formState.errors.recipient_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {(letterForm.formState.errors.recipient_email as any).message || "Invalid email"}
                  </p>
                )}
              </div>

            </div>

            {/* Letter Content */}
            <div>
              <Label htmlFor="letter_content">Letter Content</Label>
              <Textarea
                id="letter_content"
                {...letterForm.register("letter_content")}
                placeholder="Enter letter content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Letter Document */}
              <div>
                <Label htmlFor="letter_document">Letter Document (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload scanned letter or PDF (optional)</p>

                  {/* Reusable FileUploader with the centralized allowed extensions constant.
                      onChange updates react-hook-form value to the selected File (or null). */}
                  <FileUploader
                    id="letter_document"
                    accept={LETTER_UPLOAD_ACCEPT}
                    allowedExts={LETTER_ALLOWED_EXTS}
                    maxSizeBytes={15 * 1024 * 1024} // 15 MB, adjust as needed
                    onChange={(files) => {
                      if (files && files.length) letterForm.setValue("letter_document", files[0]);
                      else letterForm.setValue("letter_document", null);
                      // clear previous validation errors if any
                      letterForm.clearErrors("letter_document");
                    }}
                  />
                  {/* still show react-hook-form validation error if present */}
                  {letterForm.formState.errors.letter_document && (
                    <p className="text-red-500 text-sm mt-1">
                      {(letterForm.formState.errors.letter_document as any).message ||
                        (letterForm.formState.errors.letter_document as any)}
                    </p>
                  )}

                   {/* UX hint listing allowed formats */}
                   <p className="text-xs text-muted-foreground mt-2">
                     Allowed formats: {LETTER_ALLOWED_EXTS.join(", ")}. You can change the allowed list in code if needed.
                   </p>
                 </div>
               </div>

               {/* Comment */}
               <div>
                 <Label htmlFor="comment">Censor Comments</Label>
                 <Textarea
                   id="comment"
                   {...letterForm.register("comment")}
                   placeholder="Enter censor comments or notes"
                   rows={9}
                 />
               </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingLetter ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm dialog - rendered once per screen */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(v) => {
          setConfirmOpen(v);
          if (!v) confirmActionRef.current = null;
        }}
        title={confirmActionRef.current?.title}
        description={confirmActionRef.current?.description}
        onConfirm={async () => {
          if (confirmActionRef.current?.onConfirm) {
            await confirmActionRef.current.onConfirm();
          }
        }}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}





--------





// staffentry b4 case senstive update

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Plus, Search, Scan, CheckCircle2, XCircle, Clock, User, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '../ui/alert-dialog';
import { DataTable } from '../common/DataTable';
import type { DataTableColumn } from '../common/DataTable.types';
import * as StaffEntryService from '../../services/stationServices/staffEntryService';

interface StaffEntryRow {
  id: string;
  // match backend: use created_datetime (ISO) and station_name / staff_rank_name etc.
  created_datetime?: string | null;
  staff_name: string;
  staff_force_number: string;
  senior?: boolean | null;
  time_in?: string | null;
  time_out?: string | null;
  attendance_type?: 'PRESENT' | 'ABSENT' | null;
  station_name?: string;
  staff_rank_name?: string;
  remark?: string;
}

// small hook: detect barcode scanner by fast key input
function useBarcodeScanner(onScan: (code: string) => void, enabled: boolean) {
  const bufferRef = useRef<{ chars: string[]; lastTime: number }>({ chars: [], lastTime: 0 });
  useEffect(() => {
    if (!enabled) return;
    const handleKey = (e: KeyboardEvent) => {
      const now = Date.now();
      // ignore meta keys
      if (e.key.length > 1 && e.key !== 'Enter') return;
      if (now - bufferRef.current.lastTime > 100) {
        // reset if pause > 100ms
        bufferRef.current.chars = [];
      }
      bufferRef.current.lastTime = now;
      if (e.key === 'Enter') {
        const code = bufferRef.current.chars.join('');
        bufferRef.current.chars = [];
        if (code) onScan(code);
      } else {
        bufferRef.current.chars.push(e.key);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enabled, onScan]);
}

export function StaffEntryExitScreen() {
  const [dialogOpen, setDialogOpen] = useState(false);
  // split loading states so fetch and submit don't share the same spinner
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [scanningMode, setScanningMode] = useState(false);
  const [forceInput, setForceInput] = useState('');
  const [staffDetails, setStaffDetails] = useState<StaffEntryService.StaffProfile | null>(null);
  const [stationOptions, setStationOptions] = useState<any[]>([]);
  const [attendanceType, setAttendanceType] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [timeOut, setTimeOut] = useState('');
  const [remark, setRemark] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  // whether we've fetched staff details successfully (freeze inputs)
  const [hasFetched, setHasFetched] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  // always controlled: '' means "no selection" so SelectValue placeholder shows
  const [selectedStation, setSelectedStation] = useState<string>('');
  // local search text used inside the station Select (matches complaints implementation)
  const [stationSearch, setStationSearch] = useState('');
  const stationSearchRef = useRef<HTMLInputElement | null>(null);
  // form validation errors (reactive)
  const [formErrors, setFormErrors] = useState<{ station?: string; attendanceType?: string } | null>(null);

  // table load error (log details to console; show small inline message instead of toast)
  const [loadError, setLoadError] = useState<string | null>(null);

  // DataTable server state
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<StaffEntryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);
  const [search, setSearch] = useState('');

  // derived stats for cards
  const presentCount = tableData.filter((t) => t.attendance_type === 'PRESENT').length;
  const absentCount = tableData.filter((t) => t.attendance_type === 'ABSENT').length;
  const onDutyCount = tableData.filter((t) => !t.time_out || t.time_out === '').length;

  const loadStations = useCallback(async () => {
    const s = await StaffEntryService.fetchStations();
    setStationOptions(s || []);
  }, []);

  // helpers
  // when staffDetails is set, initialize selectedStation and reset fetchFailed
  useEffect(() => {
    // Do NOT auto-select the first station. The station dropdown is not "attached"
    // to staff here — user must explicitly pick a station. If the staff profile
    // already has an assigned station id and you want to prefill, change this.
    if (staffDetails) {
      // only prefill if staffDetails explicitly contains a station id
      if (staffDetails.station) {
        setSelectedStation(staffDetails.station ?? '');
      } else {
        setSelectedStation('');
      }
      setFetchFailed(false);
    } else {
      setSelectedStation('');
    }
  }, [staffDetails, stationOptions]);

  const resetForm = () => {
    setHasFetched(false);
    setScanningMode(false);
    setForceInput('');
    setStaffDetails(null);
    setRemark('');
    setTimeOut('');
    setAttendanceType('PRESENT');
    setFormErrors(null);
    setFetchLoading(false);
    setSubmitLoading(false);
    setFetchFailed(false);
    setSelectedStation('');
    setStationSearch('');
    if (stationSearchRef.current) stationSearchRef.current.blur();
  };

  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('user_data') || localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      return parsed?.id ?? parsed?.user?.id ?? parsed?.pk ?? undefined;
    } catch {
      return undefined;
    }
  };

  // load table data from backend
// load table data: abort previous requests, debounce handled by effect, safe page handling
  const abortRef = useRef<AbortController | null>(null);
  const loadTable = useCallback(async (p = page, ps = pageSize, sf?: string, sd?: string, q?: string) => {
    // cancel previous
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setTableLoading(true);
    setLoadError(null);
    try {
      const params: Record<string, any> = {};
      if (ps !== -1) {
        params.page = Math.max(1, Number(p) || 1);
        params.page_size = Number(ps) || 10;
      }
      if (sf) params.ordering = sd === 'desc' ? `-${sf}` : sf;
      if (q) params.search = q;

      const res = await StaffEntryService.fetchEntries(params, controller.signal);
      const items = res.results ?? res ?? [];
      const totalCount = Number(res.count ?? (items.length || 0));

      const mapped = (items || []).map((it: any): StaffEntryRow => ({
        id: it.id,
        created_datetime: it.created_datetime ?? null,
        staff_name: it.staff_name ?? '',
        staff_force_number: it.staff_force_number ?? '',
        senior: typeof it.senior === 'boolean' ? it.senior : null,
        staff_rank_name: it.staff_rank_name ?? it.staff_rank ?? '',
        station_name: it.station_name ?? it.station ?? '',
        time_in: it.time_in ?? null,
        time_out: it.time_out ?? null,
        attendance_type: it.attendance_type ?? null,
        remark: it.remark ?? '',
      }));

      // compute total pages and guard against invalid page requests
      const effectivePageSize = ps === -1 ? totalCount || mapped.length : ps;
      const totalPages = effectivePageSize > 0 ? Math.max(1, Math.ceil(totalCount / effectivePageSize)) : 1;
      if (ps !== -1 && params.page && params.page > totalPages) {
        setPage(totalPages);
        return; // effect will re-run and fetch safe page
      }

      setTableData(mapped);
      setTotal(totalCount);
      setPage(params.page ?? 1);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message === 'canceled') return;
      console.error('loadTable error:', err?.response ?? err);
      const status = err?.response?.status;
      const detail = String(err?.response?.data?.detail ?? '').toLowerCase();
      if (status === 404 && detail.includes('invalid page')) {
        setPage(1); // safe fallback
        return;
      }
      setLoadError(status ? `Failed to load records (status ${status}).` : 'Failed to load records (network error).');
    } finally {
      setTableLoading(false);
    }
  }, []);

  // load stations once
  useEffect(() => { loadStations(); }, [loadStations]);

  // debounced / single effect to fetch table whenever page/pageSize/sort/search change
  const searchDebounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    // 300ms debounce for search + avoid double calls during quick UI interactions
    searchDebounceRef.current = window.setTimeout(() => {
      const usePage = Math.max(1, page || 1);
      loadTable(usePage, pageSize, sortField, sortDir, search || undefined);
    }, 300);
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, [page, pageSize, sortField, sortDir, search, loadTable]);

  // barcode scanner hook: when enabled, global key capture sends scanned value to onScan
  useBarcodeScanner(async (code) => {
    // treat scanned code as force number and auto fetch
    setForceInput(code);
    await fetchStaffDetails(code);
  }, scanningMode);

  const fetchStaffDetails = async (forceNumber: string) => {
    setFetchLoading(true);
    setFetchFailed(false);
    try {
      // try server search by force_number param
      const profiles = await StaffEntryService.fetchStaffProfiles({ force_number: forceNumber });
      // server may return multiple or none; our service now returns exact-match array if provided
      const staff = profiles[0] ?? null;
      if (!staff) {
        // no exact match -> show failed banner and return
        setStaffDetails(null);
        setHasFetched(false);
        setFetchFailed(true);
        toast.error('No staff found for that force number.');
        return null;
      }
      setStaffDetails(staff);
      setHasFetched(true);
      setScanningMode(false); // stop scanning once we have a valid staff
      setFetchFailed(false);
      toast.success('Staff details retrieved successfully');
      return staff;
    } catch (err) {
      console.error('fetchStaffDetails error', err?.response ?? err);
      setFetchFailed(true);
      toast.error('Failed to fetch staff details');
      return null;
    } finally {
      setFetchLoading(false);
    }
  };

  const handleBarcodeModeToggle = () => {
    if (hasFetched) return; // freeze toggle after fetch
    setScanningMode((s) => !s);
    setStaffDetails(null);
    setForceInput('');
  };

  const handleFetchClick = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!forceInput.trim()) {
      toast.error('Please enter a force number');
      return;
    }
    await fetchStaffDetails(forceInput.trim());
  };

  const handleConfirmEntry = async () => {
    // basic client-side validation
    if (!staffDetails) {
      toast.error('No staff details available');
      return;
    }

    // station must be chosen (selectedStation holds the chosen value)
    const stationToSend = selectedStation ?? staffDetails.station ?? stationOptions[0]?.id;
    if (!stationToSend) {
      setFormErrors({ station: 'Station is required' });
      toast.error('Please select a station.');
      return;
    }

    if (!attendanceType) {
      setFormErrors({ attendanceType: 'Attendance type is required' });
      toast.error('Please select attendance type.');
      return;
    }

    // clear previous errors once validation passed
    setFormErrors(null);
    setSubmitLoading(true);
    try {
      const now = new Date();
      const currentUserId = getCurrentUserId();

      // map senior boolean to staff_category expected by backend (adjust values if backend expects different strings)
      const staffCategory = staffDetails.raw?.senior === true ? 'SENIOR' : 'JUNIOR';

      const payload: StaffEntryService.StaffEntryPayload = {
        staff: staffDetails.id,
        station: stationToSend,
        time_in: now.toTimeString().slice(0,5),
        time_out: timeOut || null,
        remark: remark || null,
        attendance_type: attendanceType,
        date: now.toISOString().split('T')[0],
        // ...(currentUserId ? { gate_keeper: currentUserId } : {}),
        staff_rank: staffDetails.rank,
        staff_name: `${staffDetails.first_name ?? ''} ${staffDetails.last_name ?? ''}`.trim(),
        staff_force_number: staffDetails.force_number,
        staff_category: staffCategory,
      };

      await StaffEntryService.createEntry(payload);
      toast.success('Staff entry recorded successfully');
      loadTable(1, pageSize, sortField, sortDir, search);
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('createEntry error', err?.response ?? err);
      if (err?.response?.data) {
        console.error('createEntry validation errors:', err.response.data);
        toast.error('Failed to save entry. Check required fields.');
      } else {
        toast.error('Failed to save entry.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      await StaffEntryService.deleteEntry(recordToDelete);
      toast.success('Record deleted');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      loadTable(1, pageSize, sortField, sortDir, search);
    } catch (err) {
      console.error('delete error', err?.response ?? err);
      toast.error('Failed to delete record');
    }
  };

  const formatTime = (t?: string | null) => {
  if (!t) return '-';
  try {
    const date = new Date(`1970-01-01T${t}`);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return t;
  }
};

// keys must match the API fields (created_datetime, staff_force_number, staff_name, senior, staff_rank_name, station_name, remark)
  const userColumns: DataTableColumn[] = [
    // { key: 'created_datetime', label: 'Date', sortable: true },
    {
      key: 'created_datetime',
      label: 'Date',
      sortable: true,
      render: (value: string | null) => (value ? String(value).split('T')[0] : '-'),
    },
    { key: 'staff_force_number', label: 'Force Number', sortable: true },
    { key: 'staff_name', label: 'Staff Name', sortable: true },
    {
      key: 'senior',
      label: 'Category',
      sortable: true,
      render: (value) => (typeof value === 'boolean' ? (value ? 'Senior' : 'Junior') : (value ?? '-')),
    },
    { key: 'staff_rank_name', label: 'Rank', sortable: true },
    { key: 'station_name', label: 'Station', sortable: true }, 
    {
      key: 'time_in',
      label: 'Time In',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {formatTime(value)}
        </div>
      ),
    },
    {
      key: 'time_out',
      label: 'Time Out',
      sortable: true,
      render: (value) =>
        value ? (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {formatTime(value)}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      key: 'attendance_type',
      label: 'Attendance',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            value === 'PRESENT'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {value === 'PRESENT' ? (
            <>
              <CheckCircle2 className="h-3 w-3" /> Present
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" /> Absent
            </>
          )}
        </span>
      ),
    },

    {
      key: 'remark',
      label: 'Remarks',
      sortable: true,
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRecordToDelete(row.id);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#650000] mb-1">Staff Entry & Exit</h1>
          <p className="text-muted-foreground">Track staff attendance and movements</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Record Entry/Exit
            </Button>
          </DialogTrigger>
          {/* provide aria-describedby + sr-only description to satisfy accessibility check */}
          <DialogContent className="max-w-2xl" aria-describedby="record-entry-desc">
            <DialogHeader>
              <DialogTitle>Record Staff Entry/Exit</DialogTitle>
              <DialogDescription>
                Fill in the staff attendance details before submitting.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* hide scan/manual inputs once we have fetched a valid staff */}
              {!hasFetched && (
                <>
                  <div className="flex items-center gap-4">
                    <Button variant={scanningMode ? 'default' : 'outline'} onClick={handleBarcodeModeToggle} disabled={hasFetched}>
                      <Scan className="mr-2 h-4 w-4" />
                      {scanningMode ? 'Scanning (press Esc to stop)' : 'Scan Barcode'}
                    </Button>
                    <div className="text-sm text-muted-foreground">Or enter force number manually</div>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleFetchClick(e); }} className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Force number / Barcode"
                        value={forceInput}
                        onChange={(e) => setForceInput(e.target.value)}
                        disabled={scanningMode || hasFetched}
                        autoFocus={!scanningMode && !hasFetched}
                      />
                      <Button type="submit" disabled={!forceInput.trim() || fetchLoading || hasFetched}>
                        {fetchLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Fetch</> : 'Fetch'}
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {/* success / failure banners */}
              {hasFetched && staffDetails && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-900">Staff details verified and loaded</p>
                    {/* <p className="text-xs text-green-800">{`${staffDetails.first_name ?? ''} ${staffDetails.last_name ?? ''}`.trim()} • {staffDetails.force_number} • {staffDetails.rank_name ?? staffDetails.rank}</p> */}
                  </div>
                </div>
              )}

              {fetchFailed && !staffDetails && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-900">No staff found for that force number</p>
                </div>
              )}

              {/* fetched staff details + form */}
              {staffDetails && (
                <div className="p-4 border rounded-md space-y-3">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                    <div>
                      <Label className="text-muted-foreground text-xs">Full Name</Label>
                      <p className="mt-1">{`${staffDetails.first_name ?? ''} ${staffDetails.last_name ?? ''}`.trim()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Force Number</Label>
                      <p className="mt-1">{staffDetails.force_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Rank</Label>
                      <p className="mt-1">{staffDetails.rank_name ?? staffDetails.rank}</p>
                    </div>
 
                    <div>
                      <Label className="text-muted-foreground text-xs">Category</Label>
                      <p className="mt-1">
                        {(() => {
                          const rawSenior = staffDetails?.raw?.senior;
                          const topSenior = (staffDetails as any)?.senior;
                          if (typeof rawSenior === 'boolean') return rawSenior ? 'Senior' : 'Junior';
                          if (typeof topSenior === 'boolean') return topSenior ? 'Senior' : 'Junior';
                          // fallback to any existing string value
                          const maybe = (staffDetails as any)?.staff_category ?? staffDetails?.raw?.staff_category;
                          return maybe ?? '-';
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Station <span className="text-red-500">*</span></Label>
                      <Select
                        value={selectedStation}
                        onValueChange={(v) => { setSelectedStation(v || ''); setFormErrors(null); }}
                        // focus the internal search input when the menu opens
                        onOpenChange={(open) => {
                          if (open) {
                            // small delay to wait until SelectContent is mounted
                            setTimeout(() => stationSearchRef.current?.focus(), 60);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a station" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-3 py-2">
                            <Input
                              ref={stationSearchRef}
                              placeholder="Search station..."
                              value={stationSearch}
                              onChange={(e) => setStationSearch(e.target.value)}
                              className="mb-2"
                              // prevent clicks/typing in this input from closing the Select
                              onMouseDown={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                          {stationOptions
                            .filter((s: any) => {
                              if (!stationSearch) return true;
                              return s.name?.toLowerCase().includes(stationSearch.toLowerCase());
                            })
                            .map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {formErrors?.station && <p className="text-xs text-red-600 mt-1">{formErrors.station}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Attendance Type <span className="text-red-500">*</span></Label>
                        <Select value={attendanceType} onValueChange={(v) => { setAttendanceType(v as any); setFormErrors(null); }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Present
                              </div>
                            </SelectItem>
                            <SelectItem value="ABSENT">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                Absent
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors?.attendanceType && <p className="text-xs text-red-600 mt-1">{formErrors.attendanceType}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label>Time Out (Optional)</Label>
                        <Input type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} />
                      </div>

                    </div>

                    <div className="space-y-2">
                      <Label>Remark (Optional)</Label>
                      <Textarea
                        placeholder="Enter any remarks here..."
                        rows={3}
                        value={remark} onChange={(e) => setRemark(e.target.value)}
                      />
                    </div>

                  </div>

                  <div className="flex gap-2 justify-end mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={fetchLoading || submitLoading}
                      onClick={() => { setDialogOpen(false); resetForm(); }}
                    >
                      Cancel
                    </Button>
                    <Button variant="outline" onClick={() => { resetForm(); }}>
                      Scan Another
                    </Button>
                    <Button onClick={handleConfirmEntry} className="bg-primary hover:bg-primary/90" disabled={submitLoading}>
                      {submitLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Recording...</> : <> <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Entry</>}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Total Records</CardTitle></CardHeader>
          <CardContent><div className="text-2xl text-[#650000]">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Present</CardTitle></CardHeader>
          <CardContent><div className="text-2xl text-green-600">{presentCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Absent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl text-red-600">{absentCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">On Duty</CardTitle></CardHeader>
          <CardContent><div className="text-2xl text-blue-600">{onDutyCount}</div></CardContent>
        </Card>
      </div>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Entry & Exit Records</CardTitle>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadError && (
            <div className="mb-3 text-sm text-red-600">
              {loadError}
            </div>
          )}

          {/* <DataTable
            url="/station-management/api/attendance/"
            title="Staff Entry & Exit Records"
            columns={userColumns}
          /> */}

          <DataTable
            /* controlled mode: we already fetch server data in this component (loadTable) */
            data={tableData}
            loading={tableLoading}
            total={total}
            title="Staff Entry & Exit Records"
            columns={userColumns}
            externalSearch={search}


            
          />
          
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff entry/exit record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default StaffEntryExitScreen;









-----------



import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Filter,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ComplaintForm from "./ComplaintForm";
import * as ComplaintsService from '../../services/stationServices/complaintsService';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { DataTable } from "../common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface ComplaintAction {
  id: string;
  created_by_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  action: string;
  action_date: string;
  action_status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  action_remark: string;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  complaint: string;
}

interface Complaint {
  id: string;
  station_name: string;
  prisoner_name: string;
  nature_of_complaint_name: string;
  complaint_priority_name: string;
  officer_requested_username: string;
  rank_name: string;
  created_by_name: string;
  actions: ComplaintAction[];
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  complaint: string;
  complaint_date: string;
  complaint_status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  complaint_remark: string;
  date_of_response: string | null;
  force_number: string;
  response: string;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  station: string;
  prisoner: string;
  nature_of_complaint: string;
  complaint_priority: string;
  officer_requested: number;
  rank: string;
}

export function ComplaintsScreen() {
  // data table / server side
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const [stations, setStations] = useState<any[]>([]);
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [natures, setNatures] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [ranks, setRanks] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(
    null,
  );
  const [complaintStatuses, setComplaintStatuses] = useState<any[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<any[]>([]);

  // load complaint statuses once
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const sts = await ComplaintsService.fetchComplaintStatuses(c.signal);
        if (!mounted) return;
        setComplaintStatuses(sts || []);
      } catch (err) {
        console.error('load complaint statuses error', err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // load statuses & priorities when component mounts (inside existing load() or separate)
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [sts, prios] = await Promise.all([
          ComplaintsService.fetchComplaintStatuses(c.signal),
          ComplaintsService.fetchPriorities()
        ]);
        if (!mounted) return;
        setComplaintStatuses(sts || []);
        setPriorityOptions(prios || []);
      } catch (err) {
        console.error('load statuses/priorities error', err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // client-side resolved fields (keeps existing resolved name helpers)
  const resolvedComplaints = complaints.map((cmp) => {
    const statusObj = complaintStatuses.find((s) => String(s.id) === String(cmp.complaint_status));
    const statusName = statusObj?.name ?? cmp.complaint_status;
    const priorityObj = priorityOptions.find((p) => String(p.id) === String(cmp.complaint_priority));
    const priorityName = priorityObj?.name ?? cmp.complaint_priority_name ?? cmp.complaint_priority_name;
    return { ...cmp, _statusName: statusName, _priorityName: priorityName };
  });

  // Get status badge
  const getStatusBadge = (status?: string | number) => {
    // Try to resolve status object from API list (match id or name)
    const resolved = complaintStatuses.find(s =>
      String(s.id) === String(status) || String(s.name) === String(status)
    );
    const name = resolved?.name ?? (typeof status === 'string' ? status : undefined);

    // derive visual style from name (fallbacks provided)
    const n = (name || '').toLowerCase();
    const isOpen = n.includes('open');
    const isInProgress = n.includes('progress') || n.includes('in_progress');
    const isResolved = n.includes('resolve') || n.includes('resolved');
    const isClosed = n.includes('close') || n.includes('closed');

    const config = isOpen
      ? { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
      : isInProgress
      ? { color: 'bg-blue-100 text-blue-800', icon: Clock }
      : isResolved
      ? { color: 'bg-green-100 text-green-800', icon: CheckCircle }
      : isClosed
      ? { color: 'bg-gray-100 text-gray-800', icon: XCircle }
      : { color: 'bg-gray-100 text-gray-700', icon: AlertCircle };

    const Icon = config.icon;
    const label = name ? String(name).replace(/_/g, ' ') : 'Unknown';

    return (
      <Badge className={`${config.color} flex items-center gap-1`} variant="secondary">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<
      string,
      { color: string; bgColor: string }
    > = {
      Critical: { color: "text-red-800", bgColor: "bg-red-100" },
      High: { color: "text-orange-800", bgColor: "bg-orange-100" },
      Medium: { color: "text-yellow-800", bgColor: "bg-yellow-100" },
      Low: { color: "text-green-800", bgColor: "bg-green-100" },
    };

    const config = priorityConfig[priority] || {
      color: "text-gray-800",
      bgColor: "bg-gray-100",
    };

    return (
      <Badge className={`${config.bgColor} ${config.color}`} variant="secondary">
        {priority}
      </Badge>
    );
  };

  // Get action status badge
  const getActionStatusBadge = (
    status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  ) => {
    const statusConfig = {
      OPEN: { color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      IN_PROGRESS: { color: "bg-blue-50 text-blue-700 border-blue-200" },
      COMPLETED: { color: "bg-green-50 text-green-700 border-green-200" },
      CANCELLED: { color: "bg-red-50 text-red-700 border-red-200" },
    };

    const config = statusConfig[status];

    return (
      <Badge className={`${config.color} border`} variant="outline">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // View complaint details
  const viewComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };

  // Open add complaint form
  const handleAddComplaint = () => {
    setEditingComplaint(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  // Open edit complaint form
  const handleEditComplaint = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  // Save complaint (add or edit) — persists via API
  const handleSaveComplaint = async (complaint: any) => {
    try {
      if (formMode === "add") {
        const created = await ComplaintsService.createComplaint(complaint);
        const newItem = created?.results ? created.results[0] : created;
        setComplaints((prev) => [newItem || complaint, ...prev]);
        return newItem || created;
      } else {
        const updated = await ComplaintsService.updateComplaint(complaint.id, complaint);
        const updatedItem = updated?.results ? updated.results[0] : updated;
        setComplaints((prev) => prev.map((c) => (c.id === (updatedItem?.id ?? complaint.id) ? (updatedItem || complaint) : c)));
        return updatedItem || updated;
      }
    } catch (err: any) {
      // show full error details in console to inspect validation messages
      console.error('Save complaint error:', err?.response?.data ?? err);
      throw err;
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!confirm('Delete this complaint?')) return;
    try {
      await ComplaintsService.deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      setIsDetailsOpen(false);
    } catch (err) { /* axios will show error */ }
  };

  // Load data on mount
  // server-side load function (pagination, sorting, search)
  const loadComplaints = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = searchTerm) => {
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

      const res = await ComplaintsService.fetchComplaints(params);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setComplaints(items);
        setTotal(count);
      }
    } catch (err: any) {
      if ((err as any)?.name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
      console.error('load complaints error', err?.response ?? err);
      // axiosInstance already toasts
    } finally {
      if (requestIdRef.current === reqId) setTableLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, searchTerm]);

  // initial lookups (stations/prisoners/natures/priorities/ranks) and first load
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        const [stationsRes, prisonersRes, naturesRes, prioritiesRes, ranksRes] = await Promise.all([
          ComplaintsService.fetchStations(),
          ComplaintsService.fetchPrisoners(),
          ComplaintsService.fetchComplaintNatures(),
          ComplaintsService.fetchPriorities(),
          ComplaintsService.fetchRanks(),
        ]);
        if (!mounted) return;
        setStations(stationsRes || []);
        setPrisoners(prisonersRes || []);
        setNatures(naturesRes || []);
        setPriorities(prioritiesRes || []);
        setRanks(ranksRes || []);
      } catch (err) {
        // handled by services
      }
      // load first page
      loadComplaints(page, pageSize, sortField, sortDir, searchTerm);
    })();
    return () => { mounted = false; controller.abort(); };
  }, []); // run once

  // reload when pagination/sort/search changes
  useEffect(() => {
    loadComplaints(page, pageSize, sortField, sortDir, searchTerm);
  }, [page, pageSize, sortField, sortDir, searchTerm, loadComplaints]);

  // Statistics (derived from current in-memory resolved list)
  const stats = {
    total: complaints.length > 0 ? total : 0,
    open: resolvedComplaints.filter((c) =>
      (c._statusName ?? "").toLowerCase().includes("open")
    ).length,
    inProgress: resolvedComplaints.filter((c) => {
      const n = (c._statusName ?? "").toLowerCase();
      return n.includes("progress") || n.includes("in progress") || n.includes("in_progress");
    }).length,
    resolved: resolvedComplaints.filter((c) =>
      (c._statusName ?? "").toLowerCase().includes("resolve")
    ).length,
    closed: resolvedComplaints.filter((c) =>
      (c._statusName ?? "").toLowerCase().includes("close")
    ).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#650000]">Complaints Management</h1>
          <p className="text-gray-600">
            Track and manage prisoner complaints and resolutions
          </p>
        </div>
        <Button
          onClick={handleAddComplaint}
          className="bg-[#650000] hover:bg-[#4a0000]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Complaint
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-[#650000]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-600">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by prisoner, complaint, or station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {complaintStatuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorityOptions.map(p => <SelectItem key={p.id} value={p.id}>{p.name ?? p.display ?? p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints DataTable (server-side) */}
      <Card className="pt-6">
        <CardContent>
          <DataTable
            data={resolvedComplaints}
            loading={tableLoading}
            total={total}
            title="Complaints"
            columns={[
              { key: 'prisoner_name', label: 'Prisoner' },
              { key: 'station_name', label: 'Station' },
              { key: 'complaint', label: 'Complaint', render: (v: any, row: any) => <div className="truncate max-w-xs" title={row.complaint}>{row.complaint}</div> },
              { key: 'nature_of_complaint_name', label: 'Nature' },
              { key: '_priorityName', label: 'Priority', render: (v: any) => getPriorityBadge(v) },
              { key: '_statusName', label: 'Status', render: (v: any, row: any) => getStatusBadge(row.complaint_status) },
              { key: 'complaint_date', label: 'Date' },
              { key: 'actions', label: 'Actions', sortable: false, render: (_v: any, row: any) => (
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => viewComplaintDetails(row)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditComplaint(row)} className="text-[#650000] border-[#650000] hover:bg-[#650000] hover:text-white"><Edit className="h-4 w-4" /></Button>
                  </div>
                )},
            ]}
            externalSearch={searchTerm}
            onSearch={(q: string) => { setSearchTerm(q); setPage(1); }}
            onPageChange={(p: number) => setPage(p)}
            onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }}
            onSort={(f: string | null, d: 'asc' | 'desc' | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); }}
            // optional server-side props the DataTable supports: page, pageSize
            page={page}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>

      {/* Complaint Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#650000]">
              Complaint Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this complaint and its actions
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-[#650000] mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Prisoner</label>
                    <p>{selectedComplaint.prisoner_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Station</label>
                    <p>{selectedComplaint.station_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Nature of Complaint
                    </label>
                    <p>{selectedComplaint.nature_of_complaint_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Priority</label>
                    <div className="mt-1">
                      {getPriorityBadge(
                        selectedComplaint.complaint_priority_name,
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedComplaint.complaint_status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Complaint Date
                    </label>
                    <p>{formatDate(selectedComplaint.complaint_date)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Complaint Details */}
              <div>
                <h3 className="text-[#650000] mb-3">Complaint Description</h3>
                <p className="bg-gray-50 p-4 rounded-lg">
                  {selectedComplaint.complaint}
                </p>
                {selectedComplaint.complaint_remark && (
                  <div className="mt-2">
                    <label className="text-sm text-gray-600">Remarks</label>
                    <p className="text-sm mt-1">
                      {selectedComplaint.complaint_remark}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Officer Information */}
              <div>
                <h3 className="text-[#650000] mb-3">Assigned Officer</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Officer</label>
                    <p>{selectedComplaint.officer_requested_username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Rank</label>
                    <p>{selectedComplaint.rank_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Force Number</label>
                    <p>{selectedComplaint.force_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Date of Response
                    </label>
                    <p>
                      {selectedComplaint.date_of_response
                        ? formatDate(selectedComplaint.date_of_response)
                        : "Pending"}
                    </p>
                  </div>
                </div>
                {selectedComplaint.response && (
                  <div className="mt-4">
                    <label className="text-sm text-gray-600">Response</label>
                    <p className="bg-green-50 p-4 rounded-lg mt-1">
                      {selectedComplaint.response}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div>
                <h3 className="text-[#650000] mb-3">
                  Actions ({selectedComplaint.actions.length})
                </h3>
                {selectedComplaint.actions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No actions taken yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedComplaint.actions.map((action, index) => (
                      <div
                        key={action.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#650000] text-white text-sm">
                              {index + 1}
                            </span>
                            <div>
                              <p>{action.action}</p>
                              <p className="text-sm text-gray-600">
                                by {action.created_by_name}
                              </p>
                            </div>
                          </div>
                          {getActionStatusBadge(action.action_status)}
                        </div>
                        <div className="ml-8 space-y-1">
                          <p className="text-sm text-gray-600">
                            {action.action_remark}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(action.action_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Audit Information */}
              <div>
                <h3 className="text-[#650000] mb-3">Audit Trail</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Created By</label>
                    <p>{selectedComplaint.created_by_name}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Created Date</label>
                    <p>{formatDate(selectedComplaint.created_datetime)}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Last Updated</label>
                    <p>{formatDate(selectedComplaint.updated_datetime)}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Status</label>
                    <p>{selectedComplaint.is_active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Complaint Form */}
      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveComplaint}
        complaint={editingComplaint}
        mode={formMode}
        stations={stations}
        prisoners={prisoners}
        complaintNatures={natures}
        priorities={priorities}
        ranks={ranks}
      />
    </div>
  );
};

export default ComplaintsScreen;















--------------




import {useCallback, useEffect, useState, useRef} from 'react';
import { useFilterRefresh } from '../../hooks/useFilterRefresh';
import { useFilters } from '../../contexts/FilterContext';
import { useForm, Controller } from "react-hook-form";
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import SearchableSelect from "../common/SearchableSelect";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DataTable } from '../common/DataTable';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Users, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Switch } from '../ui/switch';

// validation utils
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  pastDateValidation,
  normalizePhoneNumber,
} from "../../utils/validation";
import { ManualLockupTableForm } from './ManualLockupTableForm';
import { ManualLockupTableView } from './ManualLockupTableView';

import {
  addLockUpRecord,
  getLockType, getManualLockup, getPrisonerCategories, getSexes,
  getStation, ManualLockUpItem,
} from '../../services/stationServices/manualLockupIntegration';
import axiosInstance from "../../services/axiosInstance";

// Mock data for foreign key references
const mockStations = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Central Station' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'East Wing Station' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'West Wing Station' },
];

// const mockLockupTypes = [
//   { id: '660e8400-e29b-41d4-a716-446655440001', name: 'Morning Lockup' },
//   { id: '660e8400-e29b-41d4-a716-446655440002', name: 'Middayz Lockup' },
//   { id: '660e8400-e29b-41d4-a716-446655440003', name: 'Evening Lockup' },
// ];

// const mockPrisonerCategories = [
//   { id: '770e8400-e29b-41d4-a716-446655440001', name: 'Convict' },
//   { id: '770e8400-e29b-41d4-a716-446655440002', name: 'Remand' },
//   { id: '770e8400-e29b-41d4-a716-446655440003', name: 'Civil Debtor' },
//   { id: '770e8400-e29b-41d4-a716-446655440004', name: 'Awaiting Trial' },
// ];

// const mockSexOptions = [
//   { id: '880e8400-e29b-41d4-a716-446655440001', name: 'Male' },
//   { id: '880e8400-e29b-41d4-a716-446655440002', name: 'Female' },
// ];

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

export function ManualLockupScreen() {
  const { region, district, station } = useFilters();
  const abortRef = useRef<AbortController | null>(null);

  const [lockups, setLockups] = useState<ManualLockUpItem[]>([]);
  const [tableData, setTableData] = useState<ManualLockUpItem[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stationDataLoading, setStationDataLoading] = useState(true);
  const [recordsListLoading, setRecordsListLoading] = useState(true)
  const [stations, setStations] = useState<any[]>([])
  const [lockTypes, setLockTypes] = useState<any[]>([])
  const [sexes, setSexes] = useState<any[]>([])
  const [prisonerCategories, setPrisonerCategories] = useState<any[]>([])

  // load table from API (used by initial load, pagination, search, filters, and after saves)
  const loadTable = useCallback(async (p = 1, ps = pageSize, q = '') => {
    try {
      // cancel ongoing
      try { abortRef.current?.abort(); } catch {}
      const controller = new AbortController();
      abortRef.current = controller;

      setRecordsListLoading(true);
      const params: any = { page: p, page_size: ps };
      if (q) params.search = q;
      const res = await getManualLockup(params, controller.signal);
      if ('error' in res) throw res;
      const items = res.results ?? res ?? [];
      setLockups(items);
      setTableData(items);
      setTotal(Number(res.count ?? items.length ?? 0));
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
      console.error('load manual lockup error', err);
      toast.error('Failed to load manual lockups');
    } finally {
      setRecordsListLoading(false);
    }
  }, [pageSize]);

  // Callback to handle records created from the table form (refresh server page 1)
  const handleRecordsCreated = useCallback(async (records: ManualLockup[]) => {
    // optimistic local update for instant UX
    setLockups(prev => [...records, ...prev]);
    // prefer server-authoritative load so paging/filtering remains correct
    await loadTable(1, pageSize, searchTerm);
    setPage(1);
  }, [loadTable, pageSize, searchTerm]);

  // react-hook-form for the modal form (so we can reuse requiredValidation helpers)
  const form = useForm({
    mode: "onTouched",
    defaultValues: {
      is_active: true,
      date: new Date().toISOString().split("T")[0],
      lockup_time: "",
      location: "",
      count: "",
      station: null,
      type: null,
      prisoner_category: null,
      sex: null,
    },
  });
  // const { register, handleSubmit, control, reset, formState } = form;
  const { register, handleSubmit, control, reset, formState, setValue, watch } = form;

  // onSubmit using react-hook-form
  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      // date: block future dates (extra defensive server-side check already exists)
      const selected = new Date(values.date);
      const today = new Date();
      selected.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      if (selected > today) {
        toast.error("Date cannot be in the future");
        setLoading(false);
        return;
      }

      const newLockup: any = {
        id: Date.now().toString(),
        is_active: !!values.is_active,
        date: values.date,
        lockup_time: values.lockup_time,
        location: values.location,
        count: Number(values.count),
        station: typeof values.station === "object" ? values.station.id ?? values.station : values.station,
        type: typeof values.type === "object" ? values.type.id ?? values.type : values.type,
        prisoner_category: typeof values.prisoner_category === "object" ? values.prisoner_category.id ?? values.prisoner_category : values.prisoner_category,
        sex: typeof values.sex === "object" ? values.sex.id ?? values.sex : values.sex,
      };

      const response = await addLockUpRecord(newLockup);
      if ('error' in response) {
        toast.error(response.error);
        return;
      }

      // update local list optimistically then refresh server-backed table
      setLockups((prev) => [response, ...prev]);
      toast.success('Manual lockup record added successfully');
      // reload server data so pagination/filters remain correct
      try {
        await loadTable(1, pageSize, searchTerm);
        setPage(1);
      } catch (e) {
        console.error("Failed to reload table after save", e);
      }
      setDialogOpen(false);
      reset(); // reset to default values
    } catch (error: any) {
      if (!error?.response) toast.error('Failed to connect to server. Please try again.');
      else toast.error('Failed to save record');
    } finally {
      setLoading(false);
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
    // load lookups whenever the dialog opens (ensures fresh lists) OR on mount
    const loadLookups = async () => {
      setStationDataLoading(true);
      try {
        const [stnsRes, typesRes, categoriesRes, sexesRes] = await Promise.all([
          getStation(undefined, undefined),
          getLockType(undefined, undefined),
          getPrisonerCategories(undefined, undefined),
          getSexes(undefined, undefined),
        ]);
        if ('error' in stnsRes) throw stnsRes;
        if ('error' in typesRes) throw typesRes;
        if ('error' in categoriesRes) throw categoriesRes;
        if ('error' in sexesRes) throw sexesRes;
        setStations(stnsRes.results ?? stnsRes ?? []);
        setLockTypes(typesRes.results ?? typesRes ?? []);
        setPrisonerCategories(categoriesRes.results ?? categoriesRes ?? []);
        setSexes(sexesRes.results ?? sexesRes ?? []);
      } catch (err) {
        console.error('lookup load error', err);
        toast.error('Failed to load lookup data');
      } finally {
        setStationDataLoading(false);
      }
    };
    loadLookups();
   }, [dialogOpen]);

  // initial load
  useEffect(() => { loadTable(1, pageSize, searchTerm); }, [loadTable, pageSize, searchTerm]);

  // auto reload when global location filters change
  useFilterRefresh(() => loadTable(1, pageSize, searchTerm), [region, district, station, pageSize, searchTerm]);

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
            <DialogHeader>
              <DialogTitle>Add Manual Lockup Record</DialogTitle>
              <DialogDescription>
                Enter the details for the manual lockup count
              </DialogDescription>
            </DialogHeader>

            {stationDataLoading ? (
               <div className="size-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                    Fetching station data, Please wait...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
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
                      checked={formState.defaultValues.is_active}
                      onCheckedChange={(checked) => setValue("is_active", checked)}
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
                          {...register("date", {
                            required: "Date is required",
                            validate: (v) => {
                              if (!v) return "Date is required";
                              const sel = new Date(v); const t = new Date(); sel.setHours(0,0,0,0); t.setHours(0,0,0,0);
                              return sel > t ? "Date cannot be in the future" : true;
                            }
                          })}
                        />
                      </div>
                      {formState.errors.date && <p className="text-red-500 text-sm mt-1">{(formState.errors.date as any).message}</p>}
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
                          {...register("lockup_time", { required: "Lockup time is required" })}
                        />
                        {formState.errors.lockup_time && <p className="text-red-500 text-sm mt-1">{(formState.errors.lockup_time as any).message}</p>}
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
                          value={String(watch("location") ?? "")}
                          onValueChange={(value) => setValue("location", value)}
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
                       <input type="hidden" {...register("location", { required: "Location is required" })} />
                       
                       {formState.errors.location && <p className="text-red-500 text-sm mt-1">{(formState.errors.location as any).message}</p>}
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
                           {...register("count", { required: "Count is required", valueAsNumber: true })}
                         />
                         {formState.errors.count && <p className="text-red-500 text-sm mt-1">{(formState.errors.count as any).message}</p>}
                       </div>
                     </div>
 
                     {/* Station */}
                     <div className="space-y-2">
                       <Label htmlFor="station">
                         Station <span className="text-red-500">*</span>
                       </Label>
                       <Controller
                         control={control}
                         name="station"
                         rules={{ required: "Station is required" }}
                         render={({ field }) => (
                           <SearchableSelect
                             items={stations}
                             value={field.value}
                             onChange={(v) => field.onChange(v)}
                             placeholder="Select station"
                             idField="id"
                             labelField="name"
                             className="w-full"
                           />
                         )}
                       />
                       {formState.errors.station && <p className="text-red-500 text-sm mt-1">{(formState.errors.station as any).message}</p>}
                     </div>
 
                     {/* Lockup Type */}
                     <div className="space-y-2">
                       <Label htmlFor="type">
                         Lockup Type <span className="text-red-500">*</span>
                       </Label>
                       <Controller
                         control={control}
                         name="type"
                         rules={{ required: "Lockup type is required" }}
                         render={({ field }) => (
                           <Select value={field.value || ""} onValueChange={(v) => field.onChange(v)}>
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
                         )}
                       />
                       {formState.errors.type && <p className="text-red-500 text-sm mt-1">{(formState.errors.type as any).message}</p>}
                     </div>
 
                     {/* Prisoner Category */}
                     <div className="space-y-2">
                       <Label htmlFor="prisoner_category">
                         Prisoner Category <span className="text-red-500">*</span>
                       </Label>
                       <Controller
                         control={control}
                         name="prisoner_category"
                         rules={{ required: "Prisoner category is required" }}
                         render={({ field }) => (
                           <Select value={field.value || ""} onValueChange={(v) => field.onChange(v)}>
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
                         )}
                       />
                       {formState.errors.prisoner_category && <p className="text-red-500 text-sm mt-1">{(formState.errors.prisoner_category as any).message}</p>}
                     </div>
 
                     {/* Sex */}
                     <div className="space-y-2">
                       <Label htmlFor="sex">
                         Sex <span className="text-red-500">*</span>
                       </Label>
                       <Controller
                         control={control}
                         name="sex"
                         rules={{ required: "Sex is required" }}
                         render={({ field }) => (
                           <Select value={field.value || ""} onValueChange={(v) => field.onChange(v)}>
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
                         )}
                       />
                       {formState.errors.sex && <p className="text-red-500 text-sm mt-1">{(formState.errors.sex as any).message}</p>}
                     </div>
                   </div>
 
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        reset();
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                      {loading ? 'Adding...' : 'Add Lockup'}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
             )}
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
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={tableData}
                loading={recordsListLoading}
                total={total}
                title="Manual Lockups"
                columns={[
                  { key: 'is_active', label: 'Status', render: (_v:any, r:any) => <Badge variant={r.is_active ? 'default' : 'secondary'}>{r.is_active ? 'Active' : 'Inactive'}</Badge> },
                  { key: 'date', label: 'Date', sortable: true },
                  { key: 'lockup_time', label: 'Time' },
                  { key: 'location', label: 'Location', render: (_v:any, r:any) => <Badge className={getLocationBadgeColor(r.location)}>{r.location}</Badge> },
                  { key: 'station_name', label: 'Station' },
                  { key: 'type_name', label: 'Type' },
                  { key: 'prisoner_category_name', label: 'Category' },
                  { key: 'sex_name', label: 'Sex' },
                  { key: 'count', label: 'Count', align: 'right' },
                ]}
                externalSearch={searchTerm}
                onSearch={(q) => { setSearchTerm(q); setPage(1); loadTable(1, pageSize, q); }}
                onPageChange={(p) => { setPage(p); loadTable(p, pageSize, searchTerm); }}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); loadTable(1, s, searchTerm); }}
                onSort={(f, d) => { /* implement ordering if API supports */ loadTable(1, pageSize, searchTerm); }}
              />
            </CardContent>
          </Card>
         </TabsContent>
      </Tabs>
    </div>
  );
}


















-------------


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
} from '../../services/stationServices/manualLockupIntegration';
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
      setStationDataLoading(true)
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

       } catch (error) {
          if (!error?.response) {
            setDialogOpen(false);
            toast.error('Failed to connect to server. Please try again.');
          }
       }finally {
         setStationDataLoading(false)
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
          console.log(data)

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








import {useCallback, useEffect, useState} from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import SearchableSelect from "../common/SearchableSelect";
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
} from '../../services/stationServices/manualLockupIntegration';
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
  const [errors, setErrors] = useState<Record<string,string>>({});
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
    
    // Validation (field-level with inline messages)
    const errs: Record<string,string> = {};
    if (!formData.date) errs.date = "Date is required";
    else {
      const selected = new Date(formData.date);
      const today = new Date();
      // reset time portions for accurate comparison
      selected.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      if (selected > today) errs.date = "Date cannot be in the future";
    }
    if (!formData.lockup_time) errs.lockup_time = "Lockup time is required";
    if (!formData.location) errs.location = "Location is required";
    if (!formData.count) errs.count = "Count is required";
    if (!formData.station) errs.station = "Station is required";
    if (!formData.type) errs.type = "Lockup type is required";
    if (!formData.prisoner_category) errs.prisoner_category = "Prisoner category is required";
    if (!formData.sex) errs.sex = "Sex is required";

    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    
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
      setStationDataLoading(true)
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

       } catch (error) {
          if (!error?.response) {
            setDialogOpen(false);
            toast.error('Failed to connect to server. Please try again.');
          }
       }finally {
         setStationDataLoading(false)
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
          console.log(data)

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
            <DialogHeader>
              <DialogTitle>Add Manual Lockup Record</DialogTitle>
              <DialogDescription>
                Enter the details for the manual lockup count
              </DialogDescription>
            </DialogHeader>

            {stationDataLoading ? (
              <div className="size-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                    Fetching station data, Please wait...
                  </p>
                </div>
              </div>
            ) : (
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
                      {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
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
                        {errors.lockup_time && <p className="text-red-500 text-sm mt-1">{errors.lockup_time}</p>}
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
                          {errors.count && <p className="text-red-500 text-sm mt-1">{errors.count}</p>}
                        </div>
                      </div>

                      {/* Station */}
                      <div className="space-y-2">
                        <Label htmlFor="station">
                          Station <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                          items={stations}
                          value={formData.station || null}
                          onChange={(v) => setFormData({ ...formData, station: v || "" })}
                          placeholder="Select station"
                          idField="id"
                          labelField="name"
                          className="w-full"
                        />
                        {errors.station && <p className="text-red-500 text-sm mt-1">{errors.station}</p>}
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
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
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
                        {errors.prisoner_category && <p className="text-red-500 text-sm mt-1">{errors.prisoner_category}</p>}
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
                        {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
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
                  </div>
                </div>
              </form>
            )}
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






---------------




b4 use of resuable image and table refresh after data entry - VisitorRegistrationDialog

import React, { useState, useEffect, useRef } from "react";
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
} from "../ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";
import {
  ChevronsUpDown,
  Check,
  Calendar as CalendarIcon,
  Clock,
  Camera,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
   addStationVisitor,
   GateItem,
   getGates,
   getIdTypes,
   getPrisoners, getRelationships, getVisitorStatus,
   getVisitorTypes, IdType, Prisoner, PrisonerItem, RelationShipItem,
   StationVisitor, updateStationVisitor, VisitorStatusItem, VisitorTypeItem
 } from "../../services/stationServices/visitorsServices/VisitorsService";
// validation utils
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  pastDateValidation,
  normalizePhoneNumber,
} from "../../utils/validation";
 import {getStaffProfile, StaffItem} from "../../services/stationServices/staffDeploymentService";
 import {fileToBinaryString, handleResponseError} from "../../services/stationServices/utils";
import axiosInstance from "../../services/axiosInstance";

// Types
interface Visitor {
  id?: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  organisation: string;
  vehicle_no: string;
  reason_of_visitation: string;
  id_number: string;
  address: string;
  contact_no: string;
  place_visited: string;
  remarks: string;
  blacklist_reason: string;
  photo: File | null;
  gate: string;
  prisoner: string;
  visitor_type: string;
  gate_keeper: string;
  relation: string;
  id_type: string;
  visitor_status: string;
  visitation_datetime: Date;
  time_in: string;
  time_out: string;
}

interface VisitorRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisitorCreated?: (visitor: Visitor) => void;
  setVisitors?: React.Dispatch<React.SetStateAction<Visitor[]>>;
  editingVisitor?: Visitor | null;
}

// Mock data
// const mockGates = [
//   { id: "1", name: "Main Gate" },
//   { id: "2", name: "East Gate" },
//   { id: "3", name: "West Gate" },
// ];

// const mockPrisoners = [
//   { id: "1", name: "John Doe", prisoner_number: "P-2024-001" },
//   { id: "2", name: "Jane Smith", prisoner_number: "P-2024-002" },
//   { id: "3", name: "Michael Johnson", prisoner_number: "P-2024-003" },
// ];

// const mockVisitorTypes = [
//   { id: "1", name: "Family Member" },
//   { id: "2", name: "Legal Representative" },
//   { id: "3", name: "Religious Leader" },
//   { id: "4", name: "Official" },
// ];

// const mockRelationships = [
//   { id: "1", name: "Spouse" },
//   { id: "2", name: "Parent" },
//   { id: "3", name: "Child" },
//   { id: "4", name: "Sibling" },
//   { id: "5", name: "Friend" },
//   { id: "6", name: "Lawyer" },
// ];

// const mockIDTypes = [
//   { id: "1", name: "National ID" },
//   { id: "2", name: "Passport" },
//   { id: "3", name: "Driver's License" },
//   { id: "4", name: "Work Permit" },
// ];

// const mockVisitorStatuses = [
//   { id: "1", name: "Checked In", color: "green" },
//   { id: "2", name: "Checked Out", color: "gray" },
//   { id: "3", name: "Blacklisted", color: "red" },
// ];

// const mockStaff = [
//   { id: "1", force_number: "F-001", name: "Officer Smith", rank: "Sergeant" },
//   { id: "2", force_number: "F-002", name: "Officer Jones", rank: "Corporal" },
// ];

export default function VisitorRegistrationDialog({
  open,
  onOpenChange,
  setVisitors,
  editingVisitor,
}: VisitorRegistrationDialogProps) {
  const [form, setForm] = useState<StationVisitor>({
  is_active: true,
  deleted_datetime: null,
  visitation_datetime: new Date().toISOString().split('T')[0],
  first_name: "",
  middle_name: "",
  last_name: "",
  organisation: "",
  id_number: "",
  contact_no: "",
  remarks: "",
  vehicle_no: "",
  time_in: "",
  time_out: "",
  reason_of_visitation: "",
  address: "",
  place_visited: "",
  blacklist_reason: "",
  photo: "",
  deleted_by: null,
  visit_location: "",
  prisoner: "",
  visitor_type: "",
  relation: "",
  visitor_status: "",
  id_type: "",
  gate: "",
  gate_keeper: "",
});

  // inline validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Combobox states
  const [openGateCombo, setOpenGateCombo] = useState(false);
  const [openPrisonerCombo, setOpenPrisonerCombo] = useState(false);
  const [openVisitorTypeCombo, setOpenVisitorTypeCombo] = useState(false);
  const [openGateKeeperCombo, setOpenGateKeeperCombo] = useState(false);
  const [openRelationCombo, setOpenRelationCombo] = useState(false);
  const [openIDTypeCombo, setOpenIDTypeCombo] = useState(false);
  const [openVisitorStatusCombo, setOpenVisitorStatusCombo] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formDataLoading, setFormDataLoading] = useState(false)

  // APIs declarations
  const [mockIDTypes, setMockIDTypes] = useState<IdType[]>([])
  const [mockPrisoners, setMockPrisoners] = useState<PrisonerItem[]>([])
  const [mockGates, setMockGates] = useState<GateItem[]>([])
  const [mockStaff, setMockStaff] = useState<StaffItem[]>([])
  const [mockVisitorTypes, setMockVisitorTypes] = useState<VisitorTypeItem[]>([])
  const [mockRelationships, setMockRelationships] = useState<RelationShipItem[]>([])
  const [mockVisitorStatuses, setMockVisitorStatuses] = useState<VisitorStatusItem[]>([])

  useEffect(() => {
    if (editingVisitor) {
      setForm({
        ...editingVisitor,
        time_in: extractTimeHHMM(editingVisitor?.time_in),
        time_out: extractTimeHHMM(editingVisitor?.time_out ?? ""),
      });
      setPhotoPreview(editingVisitor.photo)
    }
  }, [editingVisitor]);

  function extractTimeHHMM(isoString: string): string {
    const d = new Date(isoString);

    if (isNaN(d.getTime())) return ""; // invalid date

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  }

  const resetForm = () => {
    setForm({
      is_active: true,
      deleted_datetime: "",
      visitation_datetime: new Date().toISOString().split('T')[0],
      first_name: "",
      middle_name: "",
      last_name: "",
      organisation: "",
      id_number: "",
      contact_no: "",
      remarks: "",
      vehicle_no: "",
      time_in: "",
      time_out: "",
      reason_of_visitation: "",
      address: "",
      place_visited: "",
      blacklist_reason: "",
      photo: "",
      deleted_by: 0,
      visit_location: "",
      prisoner: "",
      visitor_type: "",
      relation: "",
      visitor_status: "",
      id_type: "",
      gate: "",
      gate_keeper: "",
    });
    setPhotoPreview("");
    stopCamera();
  };

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
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = async () => {
     if (videoRef.current && canvasRef.current) {
       const video = videoRef.current;
       const canvas = canvasRef.current;
       canvas.width = video.videoWidth;
       canvas.height = video.videoHeight;
       const ctx = canvas.getContext("2d");
       if (ctx) {
         ctx.drawImage(video, 0, 0);
         const blob = await new Promise<Blob | null>((resolve) =>
           canvas.toBlob(resolve, "image/jpeg")
         );

        if (!blob) return;

        const file = new File([blob], `visitor-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        // store File so we can append to FormData
        setForm({ ...form, photo: file as any });
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
        toast.success("Photo captured successfully");
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
      // store File directly for upload
      setForm({ ...form, photo: file as any });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
       toast.success("Photo uploaded successfully");
    }
  };

  function combineDateAndTimeToIso(dateStr?: string, timeStr?: string) {
    if (!dateStr) return undefined;
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh = 0, mm = 0] = (timeStr || "").split(":").map((v) => Number(v || 0));
    const dt = new Date(y, (m || 1) - 1, d, Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
    if (Number.isNaN(dt.getTime())) return undefined;
    return dt.toISOString();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // client-side validation (show inline messages)
    const errs: Record<string,string> = {};

    // required / name validations
    if (!form.first_name || !form.first_name.trim()) errs.first_name = "First name is required";
    else if (!nameValidation.pattern.value.test(form.first_name.trim())) errs.first_name = nameValidation.pattern.message;

    if (!form.last_name || !form.last_name.trim()) errs.last_name = "Last name is required";
    else if (!nameValidation.pattern.value.test(form.last_name.trim())) errs.last_name = nameValidation.pattern.message;

    // contact number validation
    if (!form.contact_no || !String(form.contact_no).trim()) errs.contact_no = "Contact number is required";
    else if (!phoneNumberValidation.pattern.value.test(String(form.contact_no).trim())) errs.contact_no = phoneNumberValidation.pattern.message;

    // id type dependent validation
    const selectedIdType = mockIDTypes.find(t => t.id === form.id_type)?.name?.toLowerCase() ?? "";
    if (!form.id_number || !String(form.id_number).trim()) {
      errs.id_number = "ID / Passport number is required";
    } else {
      const idVal = String(form.id_number).trim();
      if (selectedIdType.includes("passport")) {
        if (!passportValidation.pattern.value.test(idVal)) errs.id_number = passportValidation.pattern.message;
      } else if (selectedIdType.includes("national") || selectedIdType.includes("id")) {
        if (!nationalIdValidation.pattern.value.test(idVal)) errs.id_number = nationalIdValidation.pattern.message;
      }
    }

    // visitation date must not be in the future
    if (!form.visitation_datetime) {
      errs.visitation_datetime = "Visitation date is required";
    } else {
      const ok = pastDateValidation.validate(String(form.visitation_datetime));
      if (ok !== true) errs.visitation_datetime = String(ok);
    }

    // required selects
    if (!form.gate) errs.gate = "Gate is required";
    if (!form.prisoner) errs.prisoner = "Prisoner is required";
    if (!form.visitor_type) errs.visitor_type = "Visitor type is required";
    if (!form.place_visited || !String(form.place_visited).trim()) errs.place_visited = "Place visited is required";
    if (!form.reason_of_visitation || !String(form.reason_of_visitation).trim()) errs.reason_of_visitation = "Reason for visit is required";

    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // normalize phone for backend
      const normalizedPhone = normalizePhoneNumber(String(form.contact_no || ""));
      const payload = { ...form, contact_no: normalizedPhone };

      // Build FormData for multipart upload (works with or without photo)
      const formData = new FormData();
      // required/standard fields (append strings only)
      formData.append("first_name", payload.first_name || "");
      formData.append("middle_name", payload.middle_name || "");
      formData.append("last_name", payload.last_name || "");
      formData.append("organisation", payload.organisation || "");
      formData.append("id_number", payload.id_number || "");
      formData.append("contact_no", payload.contact_no || "");
      formData.append("remarks", payload.remarks || "");
      formData.append("vehicle_no", payload.vehicle_no || "");
      formData.append("reason_of_visitation", payload.reason_of_visitation || "");
      formData.append("address", payload.address || "");
      formData.append("place_visited", payload.place_visited || "");
      formData.append("blacklist_reason", payload.blacklist_reason || "");
      formData.append("visit_location", payload.visit_location || "");
      formData.append("prisoner", payload.prisoner || "");
      formData.append("visitor_type", payload.visitor_type || "");
      formData.append("relation", payload.relation || "");
      formData.append("visitor_status", payload.visitor_status || "");
      formData.append("id_type", payload.id_type || "");
      formData.append("gate", payload.gate || "");
      formData.append("gate_keeper", payload.gate_keeper || "");

      // datetime conversions: visitation_datetime should be date-time (combine date + time_in if present)
      const visitationIso = combineDateAndTimeToIso(String(payload.visitation_datetime), payload.time_in);
      if (visitationIso) formData.append("visitation_datetime", visitationIso);

      // time_in is required (api expects date-time)
      const timeInIso = combineDateAndTimeToIso(String(payload.visitation_datetime), payload.time_in) ?? timeToIso(payload.time_in || "");
      if (timeInIso) formData.append("time_in", timeInIso);

      // time_out is optional: append only if provided
      if (payload.time_out) {
        const timeOutIso = combineDateAndTimeToIso(String(payload.visitation_datetime), payload.time_out) ?? timeToIso(payload.time_out);
        if (timeOutIso) formData.append("time_out", timeOutIso);
      }

      // Append photo file only if it's a File instance
      if (payload.photo && payload.photo instanceof File) {
        formData.append("photo", payload.photo as File);
      }

      // decide endpoint and method (create vs update)
      try {
        let res;
        if (!editingVisitor) {
          res = await axiosInstance.post("/gate-management/station-visitors/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          res = await axiosInstance.put(`/gate-management/station-visitors/${editingVisitor.id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        const responseData = res.data;
        if (handleResponseError(responseData)) return;
        if (!editingVisitor) {
          if (typeof setVisitors === "function") setVisitors((prev = []) => [responseData, ...prev]);
        } else {
          if (typeof setVisitors === "function") setVisitors((prev = []) => prev.map((v: any) => (v.id === responseData.id ? responseData : v)));
        }
        if (typeof onVisitorCreated === "function") onVisitorCreated(responseData);
      } catch (err: any) {
        console.error("Submit error:", err);
        const serverBody = err?.response?.data ?? err?.message ?? err;
        toast.error(typeof serverBody === "string" ? serverBody : JSON.stringify(serverBody));
        return;
      }

      toast.success(
        editingVisitor
          ? "Visitor updated successfully"
          : "Visitor registered successfully"
      );

      // if (onVisitorCreated) {
      //   onVisitorCreated(newVisitor);
      // }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save visitor");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  // APIS begin from here
  function handleServerError (response: any) {
    if ('error' in response){
          onOpenChange(false)
          setFormDataLoading(false)
          toast.error(response.error);
          return true
    }
    return false
  }

  function handleEmptyList (data: any, msg: string) {
    if (!data.length){
          onOpenChange(false)
          setFormDataLoading(false)
          toast.error(msg);
          return true
    }
    return false
  }

  function populateList(response: any, msg: string, setData: any) {
    if (handleServerError(response)) return

    if ("results" in response) {
      const data = response.results
      if(handleEmptyList(data, msg)) return
      setData(data)
    }
  }

  useEffect(() => {
    if (open){
      const fetchData =  async () => {
        setFormDataLoading(true)
        try {
          const response1 = await getIdTypes()
          populateList(response1, "There are no ID Types", setMockIDTypes)
        
          const response2 = await getPrisoners()
          populateList(response2, "There are no Prisoners", setMockPrisoners)
          // console.log(response2)
        
          const response3 = await getGates()
          populateList(response3, "There are no gates", setMockGates)
        
          const response4 = await getStaffProfile()
          populateList(response4, "There are no staff", setMockStaff)
          // console.log(response4)
        
          const response5 = await getVisitorTypes()
          populateList(response5, "There are no visitor types", setMockVisitorTypes)
          // console.log(response5)
        
          const response6 = await getVisitorStatus()
          populateList(response6, "There are no visitor statuses", setMockVisitorStatuses)
          // console.log(response6)
        
          const response7 = await getRelationships()
          populateList(response7, "There are no visitor-prisoner relationships", setMockRelationships)
          // console.log(response7)

          setFormDataLoading(false)

        }catch (error) {
          if (!error?.response) {
            toast.error('Failed to connect to server. Please try again.');
          }
          onOpenChange(false);
          setFormDataLoading(false)
        }
      }

      fetchData()
    }
  }, [open]);

  function timeToIso(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);

    const now = new Date();
    now.setHours(hours, minutes, 0, 0); // set hours, minutes, seconds, milliseconds

    return now.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {
          formDataLoading ? (
              <div className="flex-1 max-h-[90vh] p-6">
                <DialogHeader>
                      <DialogTitle></DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                <div className="size-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching some data, Please wait...
                    </p>
                  </div>
                </div>
              </div>
          ) : (
              <div className="flex-1 max-h-[90vh] p-6">
                <DialogHeader>
                  <DialogTitle>
                    {editingVisitor ? "Edit Visitor" : "Register New Visitor"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVisitor
                      ? "Update visitor information"
                      : "Register a new visitor and manage check-in/check-out"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="flex w-full">
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
                         {errors.contact_no && <p className="text-red-500 text-sm mt-1">{errors.contact_no}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="organisation">Organisation <span className="text-red-500">*</span></Label>
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
                          <Popover
                            open={openIDTypeCombo}
                            onOpenChange={setOpenIDTypeCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openIDTypeCombo}
                                className="w-full justify-between"
                              >
                                {form.id_type
                                  ? mockIDTypes.find((t) => t.id === form.id_type)
                                      ?.name
                                  : "Select ID type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search ID type..." />
                                <CommandEmpty>No ID type found.</CommandEmpty>
                                <CommandGroup>
                                  {mockIDTypes.map((type) => (
                                    <CommandItem
                                      key={type.id}
                                      value={type.name}
                                      onSelect={() => {
                                        setForm({ ...form, id_type: type.id });
                                        setOpenIDTypeCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.id_type === type.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {type.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                         {errors.id_number && <p className="text-red-500 text-sm mt-1">{errors.id_number}</p>}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Visit Details Tab */}
                    <TabsContent value="visit" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gate */}
                        <div className="space-y-2">
                          <Label>Gate <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openGateCombo}
                            onOpenChange={setOpenGateCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openGateCombo}
                                className="w-full justify-between"
                              >
                                {form.gate
                                  ? mockGates.find((g) => g.id === form.gate)?.name
                                  : "Select gate..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search gate..." />
                                <CommandEmpty>No gate found.</CommandEmpty>
                                <CommandGroup>
                                  {mockGates.map((gate) => (
                                    <CommandItem
                                      key={gate.id}
                                      value={gate.name}
                                      onSelect={() => {
                                        setForm({ ...form, gate: gate.id });
                                        setOpenGateCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.gate === gate.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {gate.name} ({gate.station_name})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Gate Keeper */}
                        <div className="space-y-2">
                          <Label>Gate Keeper <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openGateKeeperCombo}
                            onOpenChange={setOpenGateKeeperCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openGateKeeperCombo}
                                className="w-full justify-between"
                              >
                                {form.gate_keeper
                                  ? (() => {
                                    const staff = mockStaff.find((s) => s.id === form.gate_keeper);
                                    return staff ? `${staff.first_name} ${staff.last_name}` : "";
                                  })()
                                  : "Select gate keeper..."}
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
                                      value={`${staff.first_name} ${staff.last_name}`}
                                      onSelect={() => {
                                        setForm({ ...form, gate_keeper: staff.id });
                                        setOpenGateKeeperCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.gate_keeper === staff.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {staff.first_name} {staff.last_name} ({staff.force_number})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Prisoner */}
                        <div className="space-y-2">
                          <Label>Prisoner <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openPrisonerCombo}
                            onOpenChange={setOpenPrisonerCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openPrisonerCombo}
                                className="w-full justify-between"
                              >
                                {form.prisoner
                                  ? mockPrisoners.find((p) => p.id === form.prisoner)
                                      ?.full_name
                                  : "Select prisoner..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search prisoner..." />
                                <CommandEmpty>No prisoner found.</CommandEmpty>
                                <CommandGroup>
                                  {mockPrisoners.map((prisoner) => (
                                    <CommandItem
                                      key={prisoner.id}
                                      value={prisoner.full_name}
                                      onSelect={() => {
                                        setForm({ ...form, prisoner: prisoner.id });
                                        setOpenPrisonerCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.prisoner === prisoner.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {prisoner.full_name} ({prisoner.prisoner_number_value})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Visitor Type */}
                        <div className="space-y-2">
                          <Label>Visitor Type <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openVisitorTypeCombo}
                            onOpenChange={setOpenVisitorTypeCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openVisitorTypeCombo}
                                className="w-full justify-between"
                              >
                                {form.visitor_type
                                  ? mockVisitorTypes.find(
                                      (t) => t.id === form.visitor_type
                                    )?.name
                                  : "Select visitor type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search visitor type..." />
                                <CommandEmpty>No visitor type found.</CommandEmpty>
                                <CommandGroup>
                                  {mockVisitorTypes.map((type) => (
                                    <CommandItem
                                      key={type.id}
                                      value={type.name}
                                      onSelect={() => {
                                        setForm({ ...form, visitor_type: type.id });
                                        setOpenVisitorTypeCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.visitor_type === type.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {type.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Relationship */}
                        <div className="space-y-2">
                          <Label>Relationship <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openRelationCombo}
                            onOpenChange={setOpenRelationCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openRelationCombo}
                                className="w-full justify-between"
                              >
                                {form.relation
                                  ? mockRelationships.find(
                                      (r) => r.id === form.relation
                                    )?.name
                                  : "Select relationship..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search relationship..." />
                                <CommandEmpty>No relationship found.</CommandEmpty>
                                <CommandGroup>
                                  {mockRelationships.map((rel) => (
                                    <CommandItem
                                      key={rel.id}
                                      value={rel.name}
                                      onSelect={() => {
                                        setForm({ ...form, relation: rel.id });
                                        setOpenRelationCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.relation === rel.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {rel.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Visitor Status */}
                        <div className="space-y-2">
                          <Label>Visitor Status <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openVisitorStatusCombo}
                            onOpenChange={setOpenVisitorStatusCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openVisitorStatusCombo}
                                className="w-full justify-between"
                              >
                                {form.visitor_status
                                  ? mockVisitorStatuses.find(
                                      (s) => s.id === form.visitor_status
                                    )?.name
                                  : "Select status..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search status..." />
                                <CommandEmpty>No status found.</CommandEmpty>
                                <CommandGroup>
                                  {mockVisitorStatuses.map((status) => (
                                    <CommandItem
                                      key={status.id}
                                      value={status.name}
                                      onSelect={() => {
                                        setForm({
                                          ...form,
                                          visitor_status: status.id,
                                        });
                                        setOpenVisitorStatusCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.visitor_status === status.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {status.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Visitation Date */}
                        <div className="space-y-2">
                          <Label>Visitation Date <span className="text-red-500">*</span></Label>
                          <Input
                            type="date"
                            value={form.visitation_datetime}
                            onChange={(e) => setForm({ ...form, visitation_datetime: e.target.value })}
                          />
                         {errors.visitation_datetime && <p className="text-red-500 text-sm mt-1">{errors.visitation_datetime}</p>}
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
                          <Label htmlFor="place_visited">Place Visited <span className="text-red-500">*</span></Label>
                          <Input
                            id="place_visited"
                            value={form.place_visited}
                            onChange={(e) =>
                              setForm({ ...form, place_visited: e.target.value })
                            }
                            placeholder="e.g., Visitor's Hall"
                          />
                         {errors.place_visited && <p className="text-red-500 text-sm mt-1">{errors.place_visited}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reason_of_visitation">
                          Reason for Visitation <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="reason_of_visitation"
                          value={form.reason_of_visitation}
                          onChange={(e) =>
                            setForm({ ...form, reason_of_visitation: e.target.value })
                          }
                          placeholder="Enter reason for visit"
                          rows={2}
                        />
                       {errors.reason_of_visitation && <p className="text-red-500 text-sm mt-1">{errors.reason_of_visitation}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                          id="remarks"
                          value={form.remarks}
                          onChange={(e) =>
                            setForm({ ...form, remarks: e.target.value })
                          }
                          placeholder="Enter any remarks"
                          rows={2}
                        />
                      </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="blacklist_reason">Blacklist Reason</Label>
                        <Textarea
                          id="blacklist_reason"
                          value={form.blacklist_reason}
                          onChange={(e) =>
                            setForm({ ...form, blacklist_reason: e.target.value })
                          }
                          placeholder="If visitor is blacklisted, enter reason"
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    {/* Photo Tab */}
                    <TabsContent value="photo" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={startCamera}
                            disabled={useCamera}
                            className="flex-1"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Use Camera
                          </Button>
                          <label className="flex-1">
                            <Button type="button" className="w-full" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

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
                        onOpenChange(false);
                        resetForm();
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      style={{ backgroundColor: '#650000' }}
                      className="hover:opacity-90"
                      disabled={
                        loading ||
                        !form.first_name ||
                        !form.place_visited ||
                        !form.organisation ||
                        !form.reason_of_visitation ||
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
          )
        }

      </DialogContent>
    </Dialog>
  );
}







------------------


VisitorRegistrationDialog b4 updates 


import React, { useState, useEffect, useRef } from "react";
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
} from "../ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";
import {
  ChevronsUpDown,
  Check,
  Calendar as CalendarIcon,
  Clock,
  Camera,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  addStationVisitor,
  GateItem,
  getGates,
  getIdTypes,
  getPrisoners, getRelationships, getVisitorStatus,
  getVisitorTypes, IdType, Prisoner, PrisonerItem, RelationShipItem,
  StationVisitor, updateStationVisitor, VisitorStatusItem, VisitorTypeItem
} from "../../services/stationServices/visitorsServices/VisitorsService";
import {getStaffProfile, StaffItem} from "../../services/stationServices/staffDeploymentService";
import {fileToBinaryString, handleResponseError} from "../../services/stationServices/utils";

// Types
interface Visitor {
  id?: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  organisation: string;
  vehicle_no: string;
  reason_of_visitation: string;
  id_number: string;
  address: string;
  contact_no: string;
  place_visited: string;
  remarks: string;
  blacklist_reason: string;
  photo: File | null;
  gate: string;
  prisoner: string;
  visitor_type: string;
  gate_keeper: string;
  relation: string;
  id_type: string;
  visitor_status: string;
  visitation_datetime: Date;
  time_in: string;
  time_out: string;
}

interface VisitorRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisitorCreated?: (visitor: Visitor) => void;
  setVisitors?: React.Dispatch<React.SetStateAction<Visitor[]>>;
  editingVisitor?: Visitor | null;
}

// Mock data
// const mockGates = [
//   { id: "1", name: "Main Gate" },
//   { id: "2", name: "East Gate" },
//   { id: "3", name: "West Gate" },
// ];

// const mockPrisoners = [
//   { id: "1", name: "John Doe", prisoner_number: "P-2024-001" },
//   { id: "2", name: "Jane Smith", prisoner_number: "P-2024-002" },
//   { id: "3", name: "Michael Johnson", prisoner_number: "P-2024-003" },
// ];

// const mockVisitorTypes = [
//   { id: "1", name: "Family Member" },
//   { id: "2", name: "Legal Representative" },
//   { id: "3", name: "Religious Leader" },
//   { id: "4", name: "Official" },
// ];

// const mockRelationships = [
//   { id: "1", name: "Spouse" },
//   { id: "2", name: "Parent" },
//   { id: "3", name: "Child" },
//   { id: "4", name: "Sibling" },
//   { id: "5", name: "Friend" },
//   { id: "6", name: "Lawyer" },
// ];

// const mockIDTypes = [
//   { id: "1", name: "National ID" },
//   { id: "2", name: "Passport" },
//   { id: "3", name: "Driver's License" },
//   { id: "4", name: "Work Permit" },
// ];

// const mockVisitorStatuses = [
//   { id: "1", name: "Checked In", color: "green" },
//   { id: "2", name: "Checked Out", color: "gray" },
//   { id: "3", name: "Blacklisted", color: "red" },
// ];

// const mockStaff = [
//   { id: "1", force_number: "F-001", name: "Officer Smith", rank: "Sergeant" },
//   { id: "2", force_number: "F-002", name: "Officer Jones", rank: "Corporal" },
// ];

export default function VisitorRegistrationDialog({
  open,
  onOpenChange,
  setVisitors,
  editingVisitor,
}: VisitorRegistrationDialogProps) {
  const [form, setForm] = useState<StationVisitor>({
  is_active: true,
  deleted_datetime: null,
  visitation_datetime: new Date().toISOString().split('T')[0],
  first_name: "",
  middle_name: "",
  last_name: "",
  organisation: "",
  id_number: "",
  contact_no: "",
  remarks: "",
  vehicle_no: "",
  time_in: "",
  time_out: "",
  reason_of_visitation: "",
  address: "",
  place_visited: "",
  blacklist_reason: "",
  photo: "",
  deleted_by: null,
  visit_location: "",
  prisoner: "",
  visitor_type: "",
  relation: "",
  visitor_status: "",
  id_type: "",
  gate: "",
  gate_keeper: "",
});

  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Combobox states
  const [openGateCombo, setOpenGateCombo] = useState(false);
  const [openPrisonerCombo, setOpenPrisonerCombo] = useState(false);
  const [openVisitorTypeCombo, setOpenVisitorTypeCombo] = useState(false);
  const [openGateKeeperCombo, setOpenGateKeeperCombo] = useState(false);
  const [openRelationCombo, setOpenRelationCombo] = useState(false);
  const [openIDTypeCombo, setOpenIDTypeCombo] = useState(false);
  const [openVisitorStatusCombo, setOpenVisitorStatusCombo] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formDataLoading, setFormDataLoading] = useState(false)

  // APIs declarations
  const [mockIDTypes, setMockIDTypes] = useState<IdType[]>([])
  const [mockPrisoners, setMockPrisoners] = useState<PrisonerItem[]>([])
  const [mockGates, setMockGates] = useState<GateItem[]>([])
  const [mockStaff, setMockStaff] = useState<StaffItem[]>([])
  const [mockVisitorTypes, setMockVisitorTypes] = useState<VisitorTypeItem[]>([])
  const [mockRelationships, setMockRelationships] = useState<RelationShipItem[]>([])
  const [mockVisitorStatuses, setMockVisitorStatuses] = useState<VisitorStatusItem[]>([])

  useEffect(() => {
    if (editingVisitor) {
      setForm({
        ...editingVisitor,
        time_in: extractTimeHHMM(editingVisitor?.time_in),
        time_out: extractTimeHHMM(editingVisitor?.time_out ?? ""),
      });
      setPhotoPreview(editingVisitor.photo)
    }
  }, [editingVisitor]);

  function extractTimeHHMM(isoString: string): string {
    const d = new Date(isoString);

    if (isNaN(d.getTime())) return ""; // invalid date

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  }

  const resetForm = () => {
    setForm({
      is_active: true,
      deleted_datetime: "",
      visitation_datetime: new Date().toISOString().split('T')[0],
      first_name: "",
      middle_name: "",
      last_name: "",
      organisation: "",
      id_number: "",
      contact_no: "",
      remarks: "",
      vehicle_no: "",
      time_in: "",
      time_out: "",
      reason_of_visitation: "",
      address: "",
      place_visited: "",
      blacklist_reason: "",
      photo: "",
      deleted_by: 0,
      visit_location: "",
      prisoner: "",
      visitor_type: "",
      relation: "",
      visitor_status: "",
      id_type: "",
      gate: "",
      gate_keeper: "",
    });
    setPhotoPreview("");
    stopCamera();
  };

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
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg")
        );

        if (!blob) return;

        const file = new File([blob], "visitor-photo.jpg", { type: "image/jpeg" });
        const binaryString = await fileToBinaryString(file);
        setForm({ ...form, photo: binaryString });
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
        toast.success("Photo captured successfully");
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      const binaryString = await fileToBinaryString(file);
      setForm({ ...form, photo: binaryString });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Photo uploaded successfully");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      const newVisitor = {
        ...form,
        time_in: timeToIso(form.time_in),
        time_out: timeToIso(form.time_out),
        id: editingVisitor?.id || `visitor-${Date.now()}`,
      };

      if (newVisitor.photo?.startsWith("https://")) {
        delete newVisitor.photo;
      }

      // console.log(newVisitor)

      if (!editingVisitor) {
         const response = await addStationVisitor(newVisitor)
         if (handleResponseError(response)) return
         setVisitors(prev => ([response, ...prev]))
      }
      else {
         const response = await updateStationVisitor(newVisitor, editingVisitor.id)
         if (handleResponseError(response)) return
         if ("id" in response) {
           setVisitors(prev => prev.map(v => (v.id === response.id ? response : v)))
         }
      }

      toast.success(
        editingVisitor
          ? "Visitor updated successfully"
          : "Visitor registered successfully"
      );

      // if (onVisitorCreated) {
      //   onVisitorCreated(newVisitor);
      // }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save visitor");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  // APIS begin from here
  function handleServerError (response: any) {
    if ('error' in response){
          onOpenChange(false)
          setFormDataLoading(false)
          toast.error(response.error);
          return true
    }
    return false
  }

  function handleEmptyList (data: any, msg: string) {
    if (!data.length){
          onOpenChange(false)
          setFormDataLoading(false)
          toast.error(msg);
          return true
    }
    return false
  }

  function populateList(response: any, msg: string, setData: any) {
    if (handleServerError(response)) return

    if ("results" in response) {
      const data = response.results
      if(handleEmptyList(data, msg)) return
      setData(data)
    }
  }

  useEffect(() => {
    if (open){
      const fetchData =  async () => {
        setFormDataLoading(true)
        try {
          const response1 = await getIdTypes()
          populateList(response1, "There are no ID Types", setMockIDTypes)
        
          const response2 = await getPrisoners()
          populateList(response2, "There are no Prisoners", setMockPrisoners)
          // console.log(response2)
        
          const response3 = await getGates()
          populateList(response3, "There are no gates", setMockGates)
        
          const response4 = await getStaffProfile()
          populateList(response4, "There are no staff", setMockStaff)
          // console.log(response4)
        
          const response5 = await getVisitorTypes()
          populateList(response5, "There are no visitor types", setMockVisitorTypes)
          // console.log(response5)
        
          const response6 = await getVisitorStatus()
          populateList(response6, "There are no visitor statuses", setMockVisitorStatuses)
          // console.log(response6)
        
          const response7 = await getRelationships()
          populateList(response7, "There are no visitor-prisoner relationships", setMockRelationships)
          // console.log(response7)

          setFormDataLoading(false)

        }catch (error) {
          if (!error?.response) {
            toast.error('Failed to connect to server. Please try again.');
          }
          onOpenChange(false);
          setFormDataLoading(false)
        }
      }

      fetchData()
    }
  }, [open]);

  function timeToIso(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);

    const now = new Date();
    now.setHours(hours, minutes, 0, 0); // set hours, minutes, seconds, milliseconds

    return now.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {
          formDataLoading ? (
              <div className="flex-1 max-h-[90vh] p-6">
                <DialogHeader>
                      <DialogTitle></DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                <div className="size-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching some data, Please wait...
                    </p>
                  </div>
                </div>
              </div>
          ) : (
              <div className="flex-1 max-h-[90vh] p-6">
                <DialogHeader>
                  <DialogTitle>
                    {editingVisitor ? "Edit Visitor" : "Register New Visitor"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVisitor
                      ? "Update visitor information"
                      : "Register a new visitor and manage check-in/check-out"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="flex w-full">
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
                          <Label htmlFor="organisation">Organisation <span className="text-red-500">*</span></Label>
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
                          <Popover
                            open={openIDTypeCombo}
                            onOpenChange={setOpenIDTypeCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openIDTypeCombo}
                                className="w-full justify-between"
                              >
                                {form.id_type
                                  ? mockIDTypes.find((t) => t.id === form.id_type)
                                      ?.name
                                  : "Select ID type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search ID type..." />
                                <CommandEmpty>No ID type found.</CommandEmpty>
                                <CommandGroup>
                                  {mockIDTypes.map((type) => (
                                    <CommandItem
                                      key={type.id}
                                      value={type.name}
                                      onSelect={() => {
                                        setForm({ ...form, id_type: type.id });
                                        setOpenIDTypeCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.id_type === type.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {type.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                          <Popover
                            open={openGateCombo}
                            onOpenChange={setOpenGateCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openGateCombo}
                                className="w-full justify-between"
                              >
                                {form.gate
                                  ? mockGates.find((g) => g.id === form.gate)?.name
                                  : "Select gate..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search gate..." />
                                <CommandEmpty>No gate found.</CommandEmpty>
                                <CommandGroup>
                                  {mockGates.map((gate) => (
                                    <CommandItem
                                      key={gate.id}
                                      value={gate.name}
                                      onSelect={() => {
                                        setForm({ ...form, gate: gate.id });
                                        setOpenGateCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.gate === gate.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {gate.name} ({gate.station_name})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Gate Keeper */}
                        <div className="space-y-2">
                          <Label>Gate Keeper <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openGateKeeperCombo}
                            onOpenChange={setOpenGateKeeperCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openGateKeeperCombo}
                                className="w-full justify-between"
                              >
                                {form.gate_keeper
                                  ? (() => {
                                    const staff = mockStaff.find((s) => s.id === form.gate_keeper);
                                    return staff ? `${staff.first_name} ${staff.last_name}` : "";
                                  })()
                                  : "Select gate keeper..."}
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
                                      value={`${staff.first_name} ${staff.last_name}`}
                                      onSelect={() => {
                                        setForm({ ...form, gate_keeper: staff.id });
                                        setOpenGateKeeperCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.gate_keeper === staff.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {staff.first_name} {staff.last_name} ({staff.force_number})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Prisoner */}
                        <div className="space-y-2">
                          <Label>Prisoner <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openPrisonerCombo}
                            onOpenChange={setOpenPrisonerCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openPrisonerCombo}
                                className="w-full justify-between"
                              >
                                {form.prisoner
                                  ? mockPrisoners.find((p) => p.id === form.prisoner)
                                      ?.full_name
                                  : "Select prisoner..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search prisoner..." />
                                <CommandEmpty>No prisoner found.</CommandEmpty>
                                <CommandGroup>
                                  {mockPrisoners.map((prisoner) => (
                                    <CommandItem
                                      key={prisoner.id}
                                      value={prisoner.full_name}
                                      onSelect={() => {
                                        setForm({ ...form, prisoner: prisoner.id });
                                        setOpenPrisonerCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.prisoner === prisoner.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {prisoner.full_name} ({prisoner.prisoner_number_value})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Visitor Type */}
                        <div className="space-y-2">
                          <Label>Visitor Type <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openVisitorTypeCombo}
                            onOpenChange={setOpenVisitorTypeCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openVisitorTypeCombo}
                                className="w-full justify-between"
                              >
                                {form.visitor_type
                                  ? mockVisitorTypes.find(
                                      (t) => t.id === form.visitor_type
                                    )?.name
                                  : "Select visitor type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search visitor type..." />
                                <CommandEmpty>No visitor type found.</CommandEmpty>
                                <CommandGroup>
                                  {mockVisitorTypes.map((type) => (
                                    <CommandItem
                                      key={type.id}
                                      value={type.name}
                                      onSelect={() => {
                                        setForm({ ...form, visitor_type: type.id });
                                        setOpenVisitorTypeCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.visitor_type === type.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {type.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Relationship */}
                        <div className="space-y-2">
                          <Label>Relationship <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openRelationCombo}
                            onOpenChange={setOpenRelationCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openRelationCombo}
                                className="w-full justify-between"
                              >
                                {form.relation
                                  ? mockRelationships.find(
                                      (r) => r.id === form.relation
                                    )?.name
                                  : "Select relationship..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search relationship..." />
                                <CommandEmpty>No relationship found.</CommandEmpty>
                                <CommandGroup>
                                  {mockRelationships.map((rel) => (
                                    <CommandItem
                                      key={rel.id}
                                      value={rel.name}
                                      onSelect={() => {
                                        setForm({ ...form, relation: rel.id });
                                        setOpenRelationCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.relation === rel.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {rel.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Visitor Status */}
                        <div className="space-y-2">
                          <Label>Visitor Status <span className="text-red-500">*</span></Label>
                          <Popover
                            open={openVisitorStatusCombo}
                            onOpenChange={setOpenVisitorStatusCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openVisitorStatusCombo}
                                className="w-full justify-between"
                              >
                                {form.visitor_status
                                  ? mockVisitorStatuses.find(
                                      (s) => s.id === form.visitor_status
                                    )?.name
                                  : "Select status..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search status..." />
                                <CommandEmpty>No status found.</CommandEmpty>
                                <CommandGroup>
                                  {mockVisitorStatuses.map((status) => (
                                    <CommandItem
                                      key={status.id}
                                      value={status.name}
                                      onSelect={() => {
                                        setForm({
                                          ...form,
                                          visitor_status: status.id,
                                        });
                                        setOpenVisitorStatusCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.visitor_status === status.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {status.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Visitation Date */}
                        <div className="space-y-2">
                          <Label>Visitation Date <span className="text-red-500">*</span></Label>
                          <Input
                            type="date"
                            value={form.visitation_datetime}
                            onChange={(e) => setForm({ ...form, visitation_datetime: e.target.value })}
                          />
                          {/*<Popover open={calendarOpen} onOpenChange={setCalendarOpen}>*/}
                          {/*  <PopoverTrigger asChild>*/}
                          {/*    <Button*/}
                          {/*      variant="outline"*/}
                          {/*      className={cn(*/}
                          {/*        "w-full justify-start text-left",*/}
                          {/*        !form.visitation_datetime &&*/}
                          {/*          "text-muted-foreground"*/}
                          {/*      )}*/}
                          {/*    >*/}
                          {/*      <CalendarIcon className="mr-2 h-4 w-4" />*/}
                          {/*      {form.visitation_datetime ? (*/}
                          {/*        format(form.visitation_datetime, "PPP")*/}
                          {/*      ) : (*/}
                          {/*        <span>Pick a date</span>*/}
                          {/*      )}*/}
                          {/*    </Button>*/}
                          {/*  </PopoverTrigger>*/}
                          {/*  <PopoverContent className="w-auto p-0" align="start">*/}
                          {/*    <Calendar*/}
                          {/*      mode="single"*/}
                          {/*      selected={form.visitation_datetime}*/}
                          {/*      onSelect={(date: Date | undefined) => {*/}
                          {/*        if (date) {*/}
                          {/*          setForm({ ...form, visitation_datetime: date });*/}
                          {/*          setCalendarOpen(false);*/}
                          {/*        }*/}
                          {/*      }}*/}
                          {/*      initialFocus*/}
                          {/*    />*/}
                          {/*  </PopoverContent>*/}
                          {/*</Popover>*/}
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
                          <Label htmlFor="place_visited">Place Visited <span className="text-red-500">*</span></Label>
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
                          Reason for Visitation <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="reason_of_visitation"
                          value={form.reason_of_visitation}
                          onChange={(e) =>
                            setForm({ ...form, reason_of_visitation: e.target.value })
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
                          placeholder="Enter any remarks"
                          rows={2}
                        />
                      </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="blacklist_reason">Blacklist Reason</Label>
                        <Textarea
                          id="blacklist_reason"
                          value={form.blacklist_reason}
                          onChange={(e) =>
                            setForm({ ...form, blacklist_reason: e.target.value })
                          }
                          placeholder="If visitor is blacklisted, enter reason"
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    {/* Photo Tab */}
                    <TabsContent value="photo" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={startCamera}
                            disabled={useCamera}
                            className="flex-1"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Use Camera
                          </Button>
                          <label className="flex-1">
                            <Button type="button" className="w-full" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

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
                        onOpenChange(false);
                        resetForm();
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      style={{ backgroundColor: '#650000' }}
                      className="hover:opacity-90"
                      disabled={
                        loading ||
                        !form.first_name ||
                        !form.place_visited ||
                        !form.organisation ||
                        !form.reason_of_visitation ||
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
          )
        }

      </DialogContent>
    </Dialog>
  );
}










----------------------------


audio wrking upload strategy service

import axiosInstance from "./axiosInstance";
import { uploadFile, readFileAsBase64 } from "./fileUploadService";

/**
 * uploadStrategyService
 *
 * See earlier docstring...
 */

export type Endpoints = { audio: string; doc: string };

export interface SendOptions {
endpoints: Endpoints;
meta?: Record<string, any>;
onProgress?: (percent: number) => void;
signal?: AbortSignal;
forceBase64?: boolean;
}

export interface SendResult {
ok: boolean;
status?: number;
data?: any;
fileRef?: string | null;
error?: any;
}

// small audio extension fallback (kept local to avoid circular deps)
const AUDIO_EXTS_FALLBACK = ["mp3", "wav", "m4a", "aac", "ogg", "flac", "mpeg"];

function getFileExtLower(file: File) {
return (file.name.split(".").pop() || "").toLowerCase();
}

export async function sendFile(file: File, opts: SendOptions): Promise<SendResult> {
  const { endpoints, meta = {}, onProgress, signal, forceBase64 } = opts;

  try {
    const debugInfo = { filename: file?.name, size: file?.size, type: file?.type };
    console.debug("[uploadStrategy] sendFile called", debugInfo);
  } catch (e) { /* ignore debug errors */ }

  try {
    let fileKey: string | null = null;
    for (const k of Object.keys(meta)) {
      try {
        if (meta[k] === file) { fileKey = k; break; }
      } catch {}
    }

    const ext = getFileExtLower(file);
    const mimeType = (file.type || "").toLowerCase();
    const isAudioMime = mimeType.startsWith("audio/");
    const isAudioExt = AUDIO_EXTS_FALLBACK.includes(ext);
    const isAudio = !forceBase64 && (isAudioMime || isAudioExt);

    console.debug("[uploadStrategy] file detection", { ext, mimeType, isAudioMime, isAudioExt, isAudio });

    // STRICT RULE: multipart only for audio files.
    if (isAudio) {
      const targetField = fileKey ?? "recorded_call";
      const extraData: Record<string, any> = {};
      Object.entries(meta).forEach(([k, v]) => {
        if (k === fileKey) return;
        if (v === undefined || v === null) return;
        extraData[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
      });

      console.debug("[uploadStrategy] using multipart (audio)", { targetField, url: endpoints.audio });

      try {
        const data = await uploadFile(file, {
          url: endpoints.audio,
          fieldName: targetField,
          extraData,
          onProgress,
          signal,
        });
        console.debug("[uploadStrategy] multipart upload response received", { url: endpoints.audio });
        const fileRef = extractFileRefFromResp(data);
        return { ok: true, status: 200, data, fileRef };
      } catch (err: any) {
        console.debug("[uploadStrategy] multipart upload error", { url: endpoints.audio, err: err?.message ?? err });
        if (err?.status) return { ok: false, status: err.status, data: err.data, error: err };
        return { ok: false, error: err };
      }
    }

    // NON-AUDIO: always send as base64 JSON payload to endpoints.doc
    console.debug("[uploadStrategy] using base64 JSON payload (non-audio)", { url: endpoints.doc });
    const { base64, filename, mimeType: mt } = await readFileAsBase64(file);

    const payload: Record<string, any> = { ...meta };
    const targetKey = fileKey ?? "file";
    payload[targetKey] = {
      filename,
      content_base64: base64,
      content_type: mt,
    };

    try {
      const resp = await axiosInstance.post(endpoints.doc, payload, { signal });
      console.debug("[uploadStrategy] base64 JSON response received", { url: endpoints.doc, status: resp.status });
      const fileRef = extractFileRefFromResp(resp.data);
      return { ok: true, status: resp.status, data: resp.data, fileRef };
    } catch (err: any) {
      console.debug("[uploadStrategy] base64 JSON upload error", { url: endpoints.doc, err: err?.message ?? err });
      if (err?.response) {
        return { ok: false, status: err.response.status, data: err.response.data, error: err.response.data };
      } else if (err?.request) {
        return { ok: false, error: new Error("Network / no response") };
      }
      return { ok: false, error: err };
    }
  } catch (err: any) {
    console.debug("[uploadStrategy] unexpected error in sendFile", { err: err?.message ?? err });
    return { ok: false, error: err };
  }
}

// helper used above (re-add if not present)
function extractFileRefFromResp(data: any): string | null {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (data.file_identifier) return data.file_identifier;
    if (data.recorded_call && typeof data.recorded_call === "string") return data.recorded_call;
    if (data.letter_document && typeof data.letter_document === "string") return data.letter_document;
    if (data.id) return String(data.id);
    if (data.url) return data.url;
    if (data.path) return data.path;
    return null;
}












import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Search, Edit, Trash2, X, Save, Calendar as CalendarIcon, Upload, Phone, Mail } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner"; // fixed import
import SearchableSelect from "../common/SearchableSelect";
import FileUploader from "../common/FileUploader";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "../ui/switch";
import { DataTable } from "../common/DataTable";
import * as PhoneService from "../../services/stationServices/phoneService";
import * as LetterService from "../../services/stationServices/letterService";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from "../../services/axiosInstance";
// use the typed/custom prisoners service (returns { items, count })
import { fetchPrisoners as fetchPrisonersService } from "../../services/customPrisonersService";
import { sendFile } from "../../services/uploadStrategyService";
import { readFileAsBase64 } from "../../services/fileUploadService"; // new import

/**
 * Centralized API endpoints (single source of truth).
 * Update these values to match backend routes. Use these variables
 * everywhere instead of hardcoding strings.
 */
const API_ENDPOINTS = {
  createLetter: "/rehabilitation/eletters/",        // POST to create letter (JSON)
  createCall: "/rehabilitation/call-records/",      // POST to create call record (JSON)
  // Upload endpoints used by uploadStrategyService.
  // If your backend has dedicated upload endpoints, set them here.
  // Otherwise uploadStrategyService will post base64 JSON to `doc` endpoint
  // or multipart to `audio` endpoint depending on file type.

};

const AUDIO_EXTS = ["mp3","wav","m4a","aac","ogg","flac"];

// create accept strings for inputs from the extension lists
// keep these centralized so future devs can change formats in one place
const AUDIO_UPLOAD_ACCEPT = "." + AUDIO_EXTS.join(",.");
const LETTER_UPLOAD_ALLOWED_EXTS = [
  // Document formats
  "pdf", "doc", "docx", "txt", "odt",
  // Image formats
  "jpg", "jpeg", "png", "tif", "tiff", "bmp",
];
// accept string used on <input accept="...">
const LETTER_UPLOAD_ACCEPT = "." + LETTER_UPLOAD_ALLOWED_EXTS.join(",.");

// helper: get extension in lowercase (without dot)
function fileExt(file: File | null) {
  if (!file) return "";
  return (file.name.split(".").pop() || "").toLowerCase();
}

// helper: extract a usable file reference from uploadStrategyService response
function extractFileRefFromSendResult(res: any): string | null {
  // backends vary; check common shapes and return a string usable by create endpoints
  if (!res) return null;
  // sometimes service returns normalized { ok, data }
  const data = res.data ?? res;
  if (!data) return null;
  // common fields
  if (typeof data === "string") return data;               // maybe base64 or URL string
  if (data.file_identifier) return data.file_identifier;   // custom
  if (data.id) return String(data.id);
  if (data.url) return data.url;
  if (data.path) return data.path;
  // if API returned structure with file.content_base64
  if (data.file && data.file.content_base64) return data.file.content_base64;
  // fallback — caller can inspect res.data manually in logs
  return null;
}

// Replace onSubmitCall with centralized sendFile usage
const onSubmitCall = async (data: any) => {
  try {
    const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

    // If file present validate extension
    if (file) {
      const ext = fileExt(file);
      if (!AUDIO_EXTS.includes(ext)) {
        toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
        return;
      }

      // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
      // so sendFile will post multipart with meta (other fields) to that endpoint.
      const sendRes = await sendFile(file, {
        endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
        meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
      });

      if (!sendRes.ok) {
        console.error("call file upload failed", sendRes.error ?? sendRes);
        toast.error("Failed to upload recorded call");
        return;
      }

      // If the upload endpoint created the record, we're done.
      if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
        toast.success(editingCall?.id ? "Call updated" : "Call created");
      } else {
        // Otherwise, try to extract a file reference and post the record normally.
        const fileRef = extractFileRefFromSendResult(sendRes);
        if (fileRef) data.recorded_call = fileRef;
        else data.recorded_call = sendRes.data ?? null;

        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }
    } else {
      // No file -> send JSON via existing service
      if (editingCall?.id) {
        await PhoneService.updateCallRecord(editingCall.id, data);
        toast.success("Call updated");
      } else {
        await PhoneService.createCallRecord(data);
        toast.success("Call created");
      }
    }

    setCallDialogOpen(false);
    loadCalls(page, pageSize);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save call");
  }
};

// Replace onSubmitLetter with centralized sendFile usage
const onSubmitLetter = async (data: any) => {
  try {
    const file = data?.letter_document instanceof File ? data.letter_document as File : null;

    if (file) {
      const ext = fileExt(file);
      if (!LETTER_UPLOAD_ALLOWED_EXTS.includes(ext)) {
        toast.error(`Letter document must be one of: ${LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}`);
        return;
      }

      // Use upload strategy service:
      // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
      // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
      const sendRes = await sendFile(file, {
        endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
        meta: { ...data },
      });

      if (!sendRes.ok) {
        console.error("letter file upload failed", sendRes.error ?? sendRes);
        toast.error("Failed to upload letter document");
        return;
      }

      // If endpoint returned created resource, done.
      if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
        toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
      } else {
        // Otherwise extract file ref and include in JSON create call.
        const fileRef = extractFileRefFromSendResult(sendRes);
        if (fileRef) data.letter_document = fileRef;
        else data.letter_document = sendRes.data ?? null;

        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }
    } else {
      // No file -> send JSON as before
      if (editingLetter?.id) {
        await LetterService.updateLetter(editingLetter.id, data);
        toast.success("Letter updated");
      } else {
        await LetterService.createLetter(data);
        toast.success("Letter created");
      }
    }

    setLetterDialogOpen(false);
    loadLetters(page, pageSize);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save letter");
  }
};

type Tab = "calls" | "letters";

export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>("calls");

  // shared table state (calls)
  const [callsData, setCallsData] = useState<PhoneService.CallRecordItem[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsTotal, setCallsTotal] = useState(0);

  // shared table state (letters)
  const [lettersData, setLettersData] = useState<LetterService.ELetterItem[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersTotal, setLettersTotal] = useState(0);

  // paging / sort / search (shared pattern, separate state per table)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // lookups for selects
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);

  // dialog / form state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PhoneService.CallRecordItem | null>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterService.ELetterItem | null>(null);

  // forms
  const callForm = useForm<any>({ defaultValues: {} });
  const letterForm = useForm<any>({ defaultValues: {} });

  // Map API item -> table row (if you need normalization)
  const mapCall = useCallback((it: any): PhoneService.CallRecordItem => ({ ...it }), []);
  const mapLetter = useCallback((it: any): LetterService.ELetterItem => ({ ...it }), []);

  // load lookups used in searchable selects
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [lt, rel] = await Promise.all([
          LetterService.fetchLetterTypes(undefined, c.signal),
          LetterService.fetchRelationships(undefined, c.signal),
        ]);
        if (!mounted) return;
        setLetterTypes(lt ?? []);
        setRelationships(rel ?? []);
      } catch (err) {
        console.error("lookup error", err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Parent-controlled loadTable for calls
  const loadCalls = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setCallsLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      // include location filters from top nav if present
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await PhoneService.fetchCallRecords(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setCallsData((items || []).map(mapCall));
        setCallsTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadCalls error", err);
      toast.error("Failed to load call records");
    } finally {
      if (requestIdRef.current === reqId) setCallsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapCall]);

  // Parent-controlled loadTable for letters
  const loadLetters = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLettersLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await LetterService.fetchLetters(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setLettersData((items || []).map(mapLetter));
        setLettersTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadLetters error", err);
      toast.error("Failed to load letters");
    } finally {
      if (requestIdRef.current === reqId) setLettersLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapLetter]);

  // reload when filters or debounce/search change
  useEffect(() => {
    if (activeTab === "calls") {
      loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    } else {
      loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
    }
  }, [activeTab, page, pageSize, sortField, sortDir, debouncedSearch, loadCalls, loadLetters]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    if (activeTab === "calls") loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    else loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
  }, [region, district, station]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => setPage(p);
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: "asc" | "desc" | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // columns
  const callsColumns = [
    { key: "call_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{row.call_date ? new Date(row.call_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "caller", label: "Caller" },
    { key: "phone_number", label: "Phone" },
    { key: "call_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "call_duration", label: "Duration" },
    { key: "call_notes", label: "Notes", render: (v: any) => (<div className="max-w-xs truncate">{v || "-"}</div>) },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingCall(r); callForm.reset(r); setCallDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await PhoneService.deleteCallRecord(r.id); toast.success("Deleted"); loadCalls(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  const lettersColumns = [
    { key: "letter_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div>{row.letter_date ? new Date(row.letter_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "letter_tracking_number", label: "Tracking No." },
    { key: "subject", label: "Subject" },
    { key: "letter_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingLetter(r); letterForm.reset(r); setLetterDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await LetterService.deleteLetter(r.id); toast.success("Deleted"); loadLetters(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  // wrapper that forwards current filter context to centralized service
  const fetchPrisoners = useCallback(async (q = "", signal?: AbortSignal) => {
    try {
      const res = await fetchPrisonersService(
        { search: q || "", station: station ?? null, district: district ?? null, region: region ?? null, page_size: 100 },
        signal
      );

      // NORMALIZE: service may return { items, count } or an array
      const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);

      // safety: ensure we always operate on an array
      if (!Array.isArray(items)) return [];

      const qlc = (q || "").trim().toLowerCase();
      if (!qlc) return items;

      return items.filter((it: any) => {
        return String(it.full_name ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number_value ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number ?? "").toLowerCase().includes(qlc);
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      console.error("prisoners lookup error", err);
      toast.error("Failed to load prisoners (network).");
      // toast.error("Failed to load prisoners (network). Check CORS / backend or use dev proxy.");
      return [];
    }
  }, [station, district, region]);

  const fetchCallTypes = useCallback(async (q = "", signal?: AbortSignal) => {
    const res = await axiosInstance.get("/rehabilitation/call-types/", { params: { search: q, page_size: 50 }, signal });
    return res.data?.results ?? [];
  }, []);

  // small wrappers for preloaded lists (relationships, letterTypes)
  const fetchRelationshipsLocal = useCallback(async (q = "") => {
    if (!q) return relationships;
    const qlc = q.toLowerCase();
    return relationships.filter((r:any) => String(r.name ?? "").toLowerCase().includes(qlc));
  }, [relationships]);

  const fetchLetterTypesLocal = useCallback(async (q = "") => {
    if (!q) return letterTypes;
    const qlc = q.toLowerCase();
    return letterTypes.filter((t:any) => String(t.name ?? "").toLowerCase().includes(qlc));
  }, [letterTypes]);

  // form submit handlers
  const onSubmitCall = async (data: any) => {
    try {
      const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

      // If file present validate extension
      if (file) {
        const ext = fileExt(file);
        if (!AUDIO_EXTS.includes(ext)) {
          toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
        // so sendFile will post multipart with meta (other fields) to that endpoint.
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
          meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
        });

        if (!sendRes.ok) {
          console.error("call file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload recorded call");
          return;
        }

        // If the upload endpoint created the record, we're done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
          toast.success(editingCall?.id ? "Call updated" : "Call created");
        } else {
          // Otherwise, try to extract a file reference and post the record normally.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.recorded_call = fileRef;
          else data.recorded_call = sendRes.data ?? null;

          if (editingCall?.id) {
            await PhoneService.updateCallRecord(editingCall.id, data);
            toast.success("Call updated");
          } else {
            await PhoneService.createCallRecord(data);
            toast.success("Call created");
          }
        }
      } else {
        // No file -> send JSON via existing service
        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }

      setCallDialogOpen(false);
      loadCalls(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save call");
    }
  };

  const onSubmitLetter = async (data: any) => {
    try {
      const file = data?.letter_document instanceof File ? data.letter_document as File : null;

      if (file) {
        const ext = fileExt(file);
        if (!LETTER_UPLOAD_ALLOWED_EXTS.includes(ext)) {
          toast.error(`Letter document must be one of: ${LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service:
        // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
        // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
          meta: { ...data },
        });

        if (!sendRes.ok) {
          console.error("letter file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload letter document");
          return;
        }

        // If endpoint returned created resource, done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
          toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
        } else {
          // Otherwise extract file ref and include in JSON create call.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.letter_document = fileRef;
          else data.letter_document = sendRes.data ?? null;

          if (editingLetter?.id) {
            await LetterService.updateLetter(editingLetter.id, data);
            toast.success("Letter updated");
          } else {
            await LetterService.createLetter(data);
            toast.success("Letter created");
          }
        }
      } else {
        // No file -> send JSON as before
        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }

      setLetterDialogOpen(false);
      loadLetters(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save letter");
    }
  };

  // Prefetch both tables on mount so counts for inactive tab are available immediately.
  useEffect(() => {
    // use the existing load functions (they are stable via useCallback)
    loadCalls(1, pageSize, sortField, sortDir, debouncedSearch).catch(() => {});
    loadLetters(1, pageSize, sortField, sortDir, debouncedSearch).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCalls, loadLetters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#650000]">Letters & Phone Calls</h1>
        <p className="text-muted-foreground">Manage prisoner communications and correspondence</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab === "calls" ? "calls" : "letters"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button
          className="bg-primary"
          onClick={() => {
            if (activeTab === "calls") {
              setEditingCall(null);
              callForm.reset({});
              setCallDialogOpen(true);
            } else {
              setEditingLetter(null);
              letterForm.reset({});
              setLetterDialogOpen(true);
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === "calls" ? "Add Call Record" : "Add Letter"}
        </Button>
      </div>

      {/* Big pill-style tabs with icon + count */}
      <Tabs value={activeTab} onValueChange={(v: Tab) => setActiveTab(v)}>
        <TabsList className="grid w-full grid-cols-2 gap-4 mb-4">
          <TabsTrigger
            value="calls"
            className={`flex items-center justify-center gap-3 py-4 px-6 text-lg rounded-xl shadow-md transition-colors ${
              activeTab === "calls" ? "bg-[#650000] text-white ring-2 ring-[#2a0000]" : "bg-white text-gray-700"
            }`}
          >
            <Phone className="h-5 w-5" />
            Phone Calls ({callsTotal ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="letters"
            className={`flex items-center justify-center gap-3 py-4 px-6 text-lg rounded-xl shadow-md transition-colors ${
              activeTab === "letters" ? "bg-[#650000] text-white ring-2 ring-[#2a0000]" : "bg-white text-gray-700"
            }`}
          >
            <Mail className="h-5 w-5" />
            Letters ({lettersTotal ?? 0})
          </TabsTrigger>
        </TabsList>

        <Card>
           <CardHeader>
             <CardTitle>{activeTab === "calls" ? "Call Records" : "Letters"}</CardTitle>
           </CardHeader>
           <CardContent>
             {activeTab === "calls" ? (
               <DataTable
                 data={callsData}
                 loading={callsLoading}
                 total={callsTotal}
                 title="Call Records"
                 columns={callsColumns}
                 externalSearch={searchTerm}
                 onSearch={onSearch}
                 onPageChange={onPageChange}
                 onPageSizeChange={onPageSizeChange}
                 onSort={onSort}
                 page={page}
                 pageSize={pageSize}
               />
             ) : (
               <DataTable
                 data={lettersData}
                 loading={lettersLoading}
                 total={lettersTotal}
                 title="Letters"
                 columns={lettersColumns}
                 externalSearch={searchTerm}
                 onSearch={onSearch}
                 onPageChange={onPageChange}
                 onPageSizeChange={onPageSizeChange}
                 onSort={onSort}
                 page={page}
                 pageSize={pageSize}
               />
             )}
           </CardContent>
         </Card>
       </Tabs>

      {/* Call dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCall ? "Edit Call Record" : "Add Call Record"}</DialogTitle></DialogHeader>
          <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      key={`prisoner-select-${region ?? ""}-${district ?? ""}-${station ?? ""}`}
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {callForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Caller Name (required) */}
              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="caller"
                  {...callForm.register("caller", { required: "Caller name is required" })}
                  placeholder="Enter caller name"
                />
                {callForm.formState.errors.caller && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.caller as any).message}</p>
                )}
              </div>

              {/* Phone Number (required) */}
              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  {...callForm.register("phone_number", { ...phoneNumberValidation, required: "Phone number is required" })}
                  placeholder="+256700000000"
                />
                {callForm.formState.errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.phone_number as any).message}</p>
                )}
              </div>

              {/* Call Type (required) */}
              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="call_type"
                  control={callForm.control}
                  rules={requiredValidation("Call type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchCallTypes}
                      placeholder="Select call type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.call_type && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_type as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="relation_to_prisoner">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    // use local preloaded list for relationships
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Call Date & Time (required) */}
              <div>
                <Label htmlFor="call_date">
                  Call Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_date"
                  type="datetime-local"
                  {...callForm.register("call_date", { required: "Call date is required" })}
                />
                {callForm.formState.errors.call_date && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_date as any).message}</p>
                )}
              </div>

              {/* Call Duration (required) */}
              <div>
                <Label htmlFor="call_duration">
                  Call Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_duration"
                  type="number"
                  {...callForm.register("call_duration", {
                    required: "Call duration is required",
                    valueAsNumber: true,
                  })}
                  placeholder="Enter duration in minutes"
                />
                {callForm.formState.errors.call_duration && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_duration as any).message}</p>
                )}
              </div>

              {/* Recorded Call (optional upload) */}
              <div>
                <Label htmlFor="recorded_call">Recorded Call (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Upload audio recording (optional)</p>
                  {/* FileUploader provides client-side validation + UX.
                      For recorded calls we allow common audio formats; change list below if needed. */}
                  <FileUploader
                    id="recorded_call"
                    accept={AUDIO_UPLOAD_ACCEPT}
                    allowedExts={AUDIO_EXTS}
                    maxSizeBytes={10 * 1024 * 1024} // 10 MB
                    onChange={(files) => {
                      if (files && files.length) callForm.setValue("recorded_call", files[0]);
                      else callForm.setValue("recorded_call", null);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Call Notes */}
            <div>
              <Label htmlFor="call_notes">Call Notes</Label>
              <Textarea
                id="call_notes"
                {...callForm.register("call_notes")}
                placeholder="Enter any notes about the call"
                rows={4}
              />
            </div>
             <div className="flex justify-end gap-2">
               <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
               <Button type="submit" className="bg-primary">{editingCall ? "Update" : "Create"}</Button>
             </div>
           </form>
        </DialogContent>
       </Dialog>

      {/* Letter dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLetter ? "Edit Letter" : "Add Letter"}</DialogTitle></DialogHeader>
          <form onSubmit={letterForm.handleSubmit(onSubmitLetter)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {letterForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Letter Type (required) */}
              <div>
                <Label htmlFor="letter_type">
                  Letter Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="letter_type"
                  control={letterForm.control}
                  rules={requiredValidation("Letter type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      items={letterTypes}
                      placeholder="Select letter type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.letter_type && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_type as any).message}</p>
                )}
              </div>

              {/* Subject (required) */}
              <div className="md:col-span-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  {...letterForm.register("subject", { required: "Subject is required" })}
                  placeholder="Enter letter subject"
                />
                {letterForm.formState.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.subject as any).message}</p>
                )}
              </div>

              {/* Letter Date (required) */}
              <div>
                <Label htmlFor="letter_date">
                  Letter Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="letter_date"
                  type="datetime-local"
                  {...letterForm.register("letter_date", { required: "Letter date is required" })}
                />
                {letterForm.formState.errors.letter_date && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_date as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="letter_relation">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Sender Name */}
              <div>
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  {...letterForm.register("sender_name")}
                  placeholder="Enter sender name"
                />
              </div>

              {/* Sender Email */}
              <div>
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  {...letterForm.register("sender_email", emailValidation)}
                  placeholder="sender@example.com"
                />
              </div>

              {/* Recipient Name */}
              <div>
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  {...letterForm.register("recipient_name")}
                  placeholder="Enter recipient name"
                />
              </div>

              {/* Recipient Email */}
              <div>
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  {...letterForm.register("recipient_email", emailValidation)}
                  placeholder="recipient@example.com"
                />
              </div>

            </div>

            {/* Letter Content */}
            <div>
              <Label htmlFor="letter_content">Letter Content</Label>
              <Textarea
                id="letter_content"
                {...letterForm.register("letter_content")}
                placeholder="Enter letter content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Letter Document */}
              <div>
                <Label htmlFor="letter_document">Letter Document (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload scanned letter or PDF (optional)</p>

                  {/* Reusable FileUploader with the centralized allowed extensions constant.
                      onChange updates react-hook-form value to the selected File (or null). */}
                  <FileUploader
                    id="letter_document"
                    accept={LETTER_UPLOAD_ACCEPT}
                    allowedExts={LETTER_UPLOAD_ALLOWED_EXTS}
                    maxSizeBytes={15 * 1024 * 1024} // 15 MB, adjust as needed
                    onChange={(files) => {
                      if (files && files.length) letterForm.setValue("letter_document", files[0]);
                      else letterForm.setValue("letter_document", null);
                      // clear previous validation errors if any
                      letterForm.clearErrors("letter_document");
                    }}
                  />
                  {/* still show react-hook-form validation error if present */}
                  {letterForm.formState.errors.letter_document && (
                    <p className="text-red-500 text-sm mt-1">
                      {(letterForm.formState.errors.letter_document as any).message ||
                        (letterForm.formState.errors.letter_document as any)}
                    </p>
                  )}

                   {/* UX hint listing allowed formats */}
                   <p className="text-xs text-muted-foreground mt-2">
                     Allowed formats: {LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}. You can change the allowed list in code if needed.
                   </p>
                 </div>
               </div>

               {/* Comment */}
               <div>
                 <Label htmlFor="comment">Censor Comments</Label>
                 <Textarea
                   id="comment"
                   {...letterForm.register("comment")}
                   placeholder="Enter censor comments or notes"
                   rows={9}
                 />
               </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingLetter ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


















import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Search, Edit, Trash2, X, Save, Calendar as CalendarIcon, Upload, Phone, Mail } from "lucide-react";
import { toast } from "sonner"; // fixed import
import SearchableSelect from "../common/SearchableSelect";
import FileUploader from "../common/FileUploader";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "../ui/switch";
import { DataTable } from "../common/DataTable";
import * as PhoneService from "../../services/stationServices/phoneService";
import * as LetterService from "../../services/stationServices/letterService";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from "../../services/axiosInstance";
// use the typed/custom prisoners service (returns { items, count })
import { fetchPrisoners as fetchPrisonersService } from "../../services/customPrisonersService";
import { sendFile } from "../../services/uploadStrategyService";
import { readFileAsBase64 } from "../../services/fileUploadService"; // new import

/**
 * Centralized API endpoints (single source of truth).
 * Update these values to match backend routes. Use these variables
 * everywhere instead of hardcoding strings.
 */
const API_ENDPOINTS = {
  createLetter: "/rehabilitation/eletters/",        // POST to create letter (JSON)
  createCall: "/rehabilitation/call-records/",      // POST to create call record (JSON)
  // Upload endpoints used by uploadStrategyService.
  // If your backend has dedicated upload endpoints, set them here.
  // Otherwise uploadStrategyService will post base64 JSON to `doc` endpoint
  // or multipart to `audio` endpoint depending on file type.

};

const AUDIO_EXTS = ["mp3","wav","m4a","aac","ogg","flac"];

// create accept strings for inputs from the extension lists
// keep these centralized so future devs can change formats in one place
const AUDIO_UPLOAD_ACCEPT = "." + AUDIO_EXTS.join(",.");
const LETTER_UPLOAD_ALLOWED_EXTS = [
  // Document formats
  "pdf", "doc", "docx", "txt", "odt",
  // Image formats
  "jpg", "jpeg", "png", "tif", "tiff", "bmp",
];
// accept string used on <input accept="...">
const LETTER_UPLOAD_ACCEPT = "." + LETTER_UPLOAD_ALLOWED_EXTS.join(",.");

// helper: get extension in lowercase (without dot)
function fileExt(file: File | null) {
  if (!file) return "";
  return (file.name.split(".").pop() || "").toLowerCase();
}

// helper: extract a usable file reference from uploadStrategyService response
function extractFileRefFromSendResult(res: any): string | null {
  // backends vary; check common shapes and return a string usable by create endpoints
  if (!res) return null;
  // sometimes service returns normalized { ok, data }
  const data = res.data ?? res;
  if (!data) return null;
  // common fields
  if (typeof data === "string") return data;               // maybe base64 or URL string
  if (data.file_identifier) return data.file_identifier;   // custom
  if (data.id) return String(data.id);
  if (data.url) return data.url;
  if (data.path) return data.path;
  // if API returned structure with file.content_base64
  if (data.file && data.file.content_base64) return data.file.content_base64;
  // fallback — caller can inspect res.data manually in logs
  return null;
}

// Replace onSubmitCall with centralized sendFile usage
const onSubmitCall = async (data: any) => {
  try {
    const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

    // If file present validate extension
    if (file) {
      const ext = fileExt(file);
      if (!AUDIO_EXTS.includes(ext)) {
        toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
        return;
      }

      // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
      // so sendFile will post multipart with meta (other fields) to that endpoint.
      const sendRes = await sendFile(file, {
        endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
        meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
      });

      if (!sendRes.ok) {
        console.error("call file upload failed", sendRes.error ?? sendRes);
        toast.error("Failed to upload recorded call");
        return;
      }

      // If the upload endpoint created the record, we're done.
      if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
        toast.success(editingCall?.id ? "Call updated" : "Call created");
      } else {
        // Otherwise, try to extract a file reference and post the record normally.
        const fileRef = extractFileRefFromSendResult(sendRes);
        if (fileRef) data.recorded_call = fileRef;
        else data.recorded_call = sendRes.data ?? null;

        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }
    } else {
      // No file -> send JSON via existing service
      if (editingCall?.id) {
        await PhoneService.updateCallRecord(editingCall.id, data);
        toast.success("Call updated");
      } else {
        await PhoneService.createCallRecord(data);
        toast.success("Call created");
      }
    }

    setCallDialogOpen(false);
    loadCalls(page, pageSize);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save call");
  }
};

// Replace onSubmitLetter with centralized sendFile usage
const onSubmitLetter = async (data: any) => {
  try {
    const file = data?.letter_document instanceof File ? data.letter_document as File : null;

    if (file) {
      const ext = fileExt(file);
      if (!LETTER_UPLOAD_ALLOWED_EXTS.includes(ext)) {
        toast.error(`Letter document must be one of: ${LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}`);
        return;
      }

      // Use upload strategy service:
      // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
      // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
      const sendRes = await sendFile(file, {
        endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
        meta: { ...data },
      });

      if (!sendRes.ok) {
        console.error("letter file upload failed", sendRes.error ?? sendRes);
        toast.error("Failed to upload letter document");
        return;
      }

      // If endpoint returned created resource, done.
      if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
        toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
      } else {
        // Otherwise extract file ref and include in JSON create call.
        const fileRef = extractFileRefFromSendResult(sendRes);
        if (fileRef) data.letter_document = fileRef;
        else data.letter_document = sendRes.data ?? null;

        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }
    } else {
      // No file -> send JSON as before
      if (editingLetter?.id) {
        await LetterService.updateLetter(editingLetter.id, data);
        toast.success("Letter updated");
      } else {
        await LetterService.createLetter(data);
        toast.success("Letter created");
      }
    }

    setLetterDialogOpen(false);
    loadLetters(page, pageSize);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save letter");
  }
};

type Tab = "calls" | "letters";

export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>("calls");

  // shared table state (calls)
  const [callsData, setCallsData] = useState<PhoneService.CallRecordItem[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsTotal, setCallsTotal] = useState(0);

  // shared table state (letters)
  const [lettersData, setLettersData] = useState<LetterService.ELetterItem[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersTotal, setLettersTotal] = useState(0);

  // paging / sort / search (shared pattern, separate state per table)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // lookups for selects
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);

  // dialog / form state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PhoneService.CallRecordItem | null>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterService.ELetterItem | null>(null);

  // forms
  const callForm = useForm<any>({ defaultValues: {} });
  const letterForm = useForm<any>({ defaultValues: {} });

  // Map API item -> table row (if you need normalization)
  const mapCall = useCallback((it: any): PhoneService.CallRecordItem => ({ ...it }), []);
  const mapLetter = useCallback((it: any): LetterService.ELetterItem => ({ ...it }), []);

  // load lookups used in searchable selects
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [lt, rel] = await Promise.all([
          LetterService.fetchLetterTypes(undefined, c.signal),
          LetterService.fetchRelationships(undefined, c.signal),
        ]);
        if (!mounted) return;
        setLetterTypes(lt ?? []);
        setRelationships(rel ?? []);
      } catch (err) {
        console.error("lookup error", err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Parent-controlled loadTable for calls
  const loadCalls = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setCallsLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      // include location filters from top nav if present
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await PhoneService.fetchCallRecords(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setCallsData((items || []).map(mapCall));
        setCallsTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadCalls error", err);
      toast.error("Failed to load call records");
    } finally {
      if (requestIdRef.current === reqId) setCallsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapCall]);

  // Parent-controlled loadTable for letters
  const loadLetters = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLettersLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await LetterService.fetchLetters(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setLettersData((items || []).map(mapLetter));
        setLettersTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadLetters error", err);
      toast.error("Failed to load letters");
    } finally {
      if (requestIdRef.current === reqId) setLettersLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapLetter]);

  // reload when filters or debounce/search change
  useEffect(() => {
    if (activeTab === "calls") {
      loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    } else {
      loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
    }
  }, [activeTab, page, pageSize, sortField, sortDir, debouncedSearch, loadCalls, loadLetters]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    if (activeTab === "calls") loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    else loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
  }, [region, district, station]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => setPage(p);
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: "asc" | "desc" | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // columns
  const callsColumns = [
    { key: "call_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{row.call_date ? new Date(row.call_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "caller", label: "Caller" },
    { key: "phone_number", label: "Phone" },
    { key: "call_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "call_duration", label: "Duration" },
    { key: "call_notes", label: "Notes", render: (v: any) => (<div className="max-w-xs truncate">{v || "-"}</div>) },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingCall(r); callForm.reset(r); setCallDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await PhoneService.deleteCallRecord(r.id); toast.success("Deleted"); loadCalls(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  const lettersColumns = [
    { key: "letter_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div>{row.letter_date ? new Date(row.letter_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "letter_tracking_number", label: "Tracking No." },
    { key: "subject", label: "Subject" },
    { key: "letter_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingLetter(r); letterForm.reset(r); setLetterDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await LetterService.deleteLetter(r.id); toast.success("Deleted"); loadLetters(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  // wrapper that forwards current filter context to centralized service
  const fetchPrisoners = useCallback(async (q = "", signal?: AbortSignal) => {
    try {
      const res = await fetchPrisonersService(
        { search: q || "", station: station ?? null, district: district ?? null, region: region ?? null, page_size: 100 },
        signal
      );

      // NORMALIZE: service may return { items, count } or an array
      const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);

      // safety: ensure we always operate on an array
      if (!Array.isArray(items)) return [];

      const qlc = (q || "").trim().toLowerCase();
      if (!qlc) return items;

      return items.filter((it: any) => {
        return String(it.full_name ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number_value ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number ?? "").toLowerCase().includes(qlc);
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      console.error("prisoners lookup error", err);
      toast.error("Failed to load prisoners (network).");
      // toast.error("Failed to load prisoners (network). Check CORS / backend or use dev proxy.");
      return [];
    }
  }, [station, district, region]);

  const fetchCallTypes = useCallback(async (q = "", signal?: AbortSignal) => {
    const res = await axiosInstance.get("/rehabilitation/call-types/", { params: { search: q, page_size: 50 }, signal });
    return res.data?.results ?? [];
  }, []);

  // small wrappers for preloaded lists (relationships, letterTypes)
  const fetchRelationshipsLocal = useCallback(async (q = "") => {
    if (!q) return relationships;
    const qlc = q.toLowerCase();
    return relationships.filter((r:any) => String(r.name ?? "").toLowerCase().includes(qlc));
  }, [relationships]);

  const fetchLetterTypesLocal = useCallback(async (q = "") => {
    if (!q) return letterTypes;
    const qlc = q.toLowerCase();
    return letterTypes.filter((t:any) => String(t.name ?? "").toLowerCase().includes(qlc));
  }, [letterTypes]);

  // form submit handlers
  const onSubmitCall = async (data: any) => {
    try {
      const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

      // If file present validate extension
      if (file) {
        const ext = fileExt(file);
        if (!AUDIO_EXTS.includes(ext)) {
          toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
        // so sendFile will post multipart with meta (other fields) to that endpoint.
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
          meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
        });

        if (!sendRes.ok) {
          console.error("call file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload recorded call");
          return;
        }

        // If the upload endpoint created the record, we're done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
          toast.success(editingCall?.id ? "Call updated" : "Call created");
        } else {
          // Otherwise, try to extract a file reference and post the record normally.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.recorded_call = fileRef;
          else data.recorded_call = sendRes.data ?? null;

          if (editingCall?.id) {
            await PhoneService.updateCallRecord(editingCall.id, data);
            toast.success("Call updated");
          } else {
            await PhoneService.createCallRecord(data);
            toast.success("Call created");
          }
        }
      } else {
        // No file -> send JSON via existing service
        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }

      setCallDialogOpen(false);
      loadCalls(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save call");
    }
  };

  const onSubmitLetter = async (data: any) => {
    try {
      const file = data?.letter_document instanceof File ? data.letter_document as File : null;

      if (file) {
        const ext = fileExt(file);
        if (!LETTER_UPLOAD_ALLOWED_EXTS.includes(ext)) {
          toast.error(`Letter document must be one of: ${LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service:
        // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
        // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
          meta: { ...data },
        });

        if (!sendRes.ok) {
          console.error("letter file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload letter document");
          return;
        }

        // If endpoint returned created resource, done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
          toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
        } else {
          // Otherwise extract file ref and include in JSON create call.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.letter_document = fileRef;
          else data.letter_document = sendRes.data ?? null;

          if (editingLetter?.id) {
            await LetterService.updateLetter(editingLetter.id, data);
            toast.success("Letter updated");
          } else {
            await LetterService.createLetter(data);
            toast.success("Letter created");
          }
        }
      } else {
        // No file -> send JSON as before
        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }

      setLetterDialogOpen(false);
      loadLetters(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save letter");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#650000]">Letters & Phone Calls</h1>
        <p className="text-muted-foreground">Manage prisoner communications and correspondence</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab === "calls" ? "calls" : "letters"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button className="bg-primary" onClick={() => { if (activeTab === "calls") { setEditingCall(null); callForm.reset({}); setCallDialogOpen(true); } else { setEditingLetter(null); letterForm.reset({}); setLetterDialogOpen(true); } }}><Plus className="h-4 w-4 mr-2" />Add</Button>
      </div>

      {/* Restored original-style tabs with counts (icons + label + count). */}
      <Tabs value={activeTab} onValueChange={(v: Tab) => setActiveTab(v)}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Calls ({callsTotal ?? 0})
          </TabsTrigger>
          <TabsTrigger value="letters" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Letters ({lettersTotal ?? 0})
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>{activeTab === "calls" ? "Call Records" : "Letters"}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "calls" ? (
              <DataTable
                data={callsData}
                loading={callsLoading}
                total={callsTotal}
                title="Call Records"
                columns={callsColumns}
                externalSearch={searchTerm}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            ) : (
              <DataTable
                data={lettersData}
                loading={lettersLoading}
                total={lettersTotal}
                title="Letters"
                columns={lettersColumns}
                externalSearch={searchTerm}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Call dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCall ? "Edit Call Record" : "Add Call Record"}</DialogTitle></DialogHeader>
          <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      key={`prisoner-select-${region ?? ""}-${district ?? ""}-${station ?? ""}`}
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {callForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Caller Name (required) */}
              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="caller"
                  {...callForm.register("caller", { required: "Caller name is required" })}
                  placeholder="Enter caller name"
                />
                {callForm.formState.errors.caller && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.caller as any).message}</p>
                )}
              </div>

              {/* Phone Number (required) */}
              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  {...callForm.register("phone_number", { ...phoneNumberValidation, required: "Phone number is required" })}
                  placeholder="+256700000000"
                />
                {callForm.formState.errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.phone_number as any).message}</p>
                )}
              </div>

              {/* Call Type (required) */}
              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="call_type"
                  control={callForm.control}
                  rules={requiredValidation("Call type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchCallTypes}
                      placeholder="Select call type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.call_type && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_type as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="relation_to_prisoner">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    // use local preloaded list for relationships
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Call Date & Time (required) */}
              <div>
                <Label htmlFor="call_date">
                  Call Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_date"
                  type="datetime-local"
                  {...callForm.register("call_date", { required: "Call date is required" })}
                />
                {callForm.formState.errors.call_date && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_date as any).message}</p>
                )}
              </div>

              {/* Call Duration (required) */}
              <div>
                <Label htmlFor="call_duration">
                  Call Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_duration"
                  type="number"
                  {...callForm.register("call_duration", {
                    required: "Call duration is required",
                    valueAsNumber: true,
                  })}
                  placeholder="Enter duration in minutes"
                />
                {callForm.formState.errors.call_duration && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_duration as any).message}</p>
                )}
              </div>

              {/* Recorded Call (optional upload) */}
              <div>
                <Label htmlFor="recorded_call">Recorded Call (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Upload audio recording (optional)</p>
                  {/* FileUploader provides client-side validation + UX.
                      For recorded calls we allow common audio formats; change list below if needed. */}
                  <FileUploader
                    id="recorded_call"
                    accept={AUDIO_UPLOAD_ACCEPT}
                    allowedExts={AUDIO_EXTS}
                    maxSizeBytes={10 * 1024 * 1024} // 10 MB
                    onChange={(files) => {
                      if (files && files.length) callForm.setValue("recorded_call", files[0]);
                      else callForm.setValue("recorded_call", null);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Call Notes */}
            <div>
              <Label htmlFor="call_notes">Call Notes</Label>
              <Textarea
                id="call_notes"
                {...callForm.register("call_notes")}
                placeholder="Enter any notes about the call"
                rows={4}
              />
            </div>
             <div className="flex justify-end gap-2">
               <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
               <Button type="submit" className="bg-primary">{editingCall ? "Update" : "Create"}</Button>
             </div>
           </form>
        </DialogContent>
       </Dialog>

      {/* Letter dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLetter ? "Edit Letter" : "Add Letter"}</DialogTitle></DialogHeader>
          <form onSubmit={letterForm.handleSubmit(onSubmitLetter)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {letterForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Letter Type (required) */}
              <div>
                <Label htmlFor="letter_type">
                  Letter Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="letter_type"
                  control={letterForm.control}
                  rules={requiredValidation("Letter type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      items={letterTypes}
                      placeholder="Select letter type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.letter_type && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_type as any).message}</p>
                )}
              </div>

              {/* Subject (required) */}
              <div className="md:col-span-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  {...letterForm.register("subject", { required: "Subject is required" })}
                  placeholder="Enter letter subject"
                />
                {letterForm.formState.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.subject as any).message}</p>
                )}
              </div>

              {/* Letter Date (required) */}
              <div>
                <Label htmlFor="letter_date">
                  Letter Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="letter_date"
                  type="datetime-local"
                  {...letterForm.register("letter_date", { required: "Letter date is required" })}
                />
                {letterForm.formState.errors.letter_date && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_date as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="letter_relation">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Sender Name */}
              <div>
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  {...letterForm.register("sender_name")}
                  placeholder="Enter sender name"
                />
              </div>

              {/* Sender Email */}
              <div>
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  {...letterForm.register("sender_email", emailValidation)}
                  placeholder="sender@example.com"
                />
              </div>

              {/* Recipient Name */}
              <div>
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  {...letterForm.register("recipient_name")}
                  placeholder="Enter recipient name"
                />
              </div>

              {/* Recipient Email */}
              <div>
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  {...letterForm.register("recipient_email", emailValidation)}
                  placeholder="recipient@example.com"
                />
              </div>

            </div>

            {/* Letter Content */}
            <div>
              <Label htmlFor="letter_content">Letter Content</Label>
              <Textarea
                id="letter_content"
                {...letterForm.register("letter_content")}
                placeholder="Enter letter content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Letter Document */}
              <div>
                <Label htmlFor="letter_document">Letter Document (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload scanned letter or PDF (optional)</p>

                  {/* Reusable FileUploader with the centralized allowed extensions constant.
                      onChange updates react-hook-form value to the selected File (or null). */}
                  <FileUploader
                    id="letter_document"
                    accept={LETTER_UPLOAD_ACCEPT}
                    allowedExts={LETTER_UPLOAD_ALLOWED_EXTS}
                    maxSizeBytes={15 * 1024 * 1024} // 15 MB, adjust as needed
                    onChange={(files) => {
                      if (files && files.length) letterForm.setValue("letter_document", files[0]);
                      else letterForm.setValue("letter_document", null);
                      // clear previous validation errors if any
                      letterForm.clearErrors("letter_document");
                    }}
                  />
                  {/* still show react-hook-form validation error if present */}
                  {letterForm.formState.errors.letter_document && (
                    <p className="text-red-500 text-sm mt-1">
                      {(letterForm.formState.errors.letter_document as any).message ||
                        (letterForm.formState.errors.letter_document as any)}
                    </p>
                  )}

                   {/* UX hint listing allowed formats */}
                   <p className="text-xs text-muted-foreground mt-2">
                     Allowed formats: {LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}. You can change the allowed list in code if needed.
                   </p>
                 </div>
               </div>

               {/* Comment */}
               <div>
                 <Label htmlFor="comment">Censor Comments</Label>
                 <Textarea
                   id="comment"
                   {...letterForm.register("comment")}
                   placeholder="Enter censor comments or notes"
                   rows={9}
                 />
               </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingLetter ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}












// PhonesLettersScreen before edit
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Search, Edit, Trash2, X, Save, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner"; // fixed import
import SearchableSelect from "../common/SearchableSelect";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "../ui/switch";
import { DataTable } from "../common/DataTable";
import * as PhoneService from "../../services/stationServices/phoneService";
import * as LetterService from "../../services/stationServices/letterService";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from "../../services/axiosInstance";
// use the typed/custom prisoners service (returns { items, count })
import { fetchPrisoners as fetchPrisonersService } from "../../services/customPrisonersService";
// API endpoints (centralize for easy updates)
const PRISONERS_ENDPOINT = "/admission/prisoners/";

type Tab = "calls" | "letters";

export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>("calls");

  // shared table state (calls)
  const [callsData, setCallsData] = useState<PhoneService.CallRecordItem[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsTotal, setCallsTotal] = useState(0);

  // shared table state (letters)
  const [lettersData, setLettersData] = useState<LetterService.ELetterItem[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersTotal, setLettersTotal] = useState(0);

  // paging / sort / search (shared pattern, separate state per table)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // lookups for selects
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);

  // dialog / form state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PhoneService.CallRecordItem | null>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterService.ELetterItem | null>(null);

  // forms
  const callForm = useForm<any>({ defaultValues: {} });
  const letterForm = useForm<any>({ defaultValues: {} });

  // Map API item -> table row (if you need normalization)
  const mapCall = useCallback((it: any): PhoneService.CallRecordItem => ({ ...it }), []);
  const mapLetter = useCallback((it: any): LetterService.ELetterItem => ({ ...it }), []);

  // load lookups used in searchable selects
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [lt, rel] = await Promise.all([
          LetterService.fetchLetterTypes(undefined, c.signal),
          LetterService.fetchRelationships(undefined, c.signal),
        ]);
        if (!mounted) return;
        setLetterTypes(lt ?? []);
        setRelationships(rel ?? []);
      } catch (err) {
        console.error("lookup error", err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Parent-controlled loadTable for calls
  const loadCalls = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setCallsLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      // include location filters from top nav if present
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await PhoneService.fetchCallRecords(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setCallsData((items || []).map(mapCall));
        setCallsTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadCalls error", err);
      toast.error("Failed to load call records");
    } finally {
      if (requestIdRef.current === reqId) setCallsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapCall]);

  // Parent-controlled loadTable for letters
  const loadLetters = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLettersLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await LetterService.fetchLetters(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setLettersData((items || []).map(mapLetter));
        setLettersTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadLetters error", err);
      toast.error("Failed to load letters");
    } finally {
      if (requestIdRef.current === reqId) setLettersLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapLetter]);

  // reload when filters or debounce/search change
  useEffect(() => {
    if (activeTab === "calls") {
      loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    } else {
      loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
    }
  }, [activeTab, page, pageSize, sortField, sortDir, debouncedSearch, loadCalls, loadLetters]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    if (activeTab === "calls") loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    else loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
  }, [region, district, station]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => setPage(p);
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: "asc" | "desc" | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // columns
  const callsColumns = [
    { key: "call_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{row.call_date ? new Date(row.call_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "caller", label: "Caller" },
    { key: "phone_number", label: "Phone" },
    { key: "call_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "call_duration", label: "Duration" },
    { key: "call_notes", label: "Notes", render: (v: any) => (<div className="max-w-xs truncate">{v || "-"}</div>) },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingCall(r); callForm.reset(r); setCallDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await PhoneService.deleteCallRecord(r.id); toast.success("Deleted"); loadCalls(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  const lettersColumns = [
    { key: "letter_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div>{row.letter_date ? new Date(row.letter_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "letter_tracking_number", label: "Tracking No." },
    { key: "subject", label: "Subject" },
    { key: "letter_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingLetter(r); letterForm.reset(r); setLetterDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await LetterService.deleteLetter(r.id); toast.success("Deleted"); loadLetters(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  // wrapper that forwards current filter context to centralized service
  const fetchPrisoners = useCallback(async (q = "", signal?: AbortSignal) => {
    try {
      const res = await fetchPrisonersService(
        { search: q || "", station: station ?? null, district: district ?? null, region: region ?? null, page_size: 100 },
        signal
      );

      // NORMALIZE: service may return { items, count } or an array
      const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);

      // safety: ensure we always operate on an array
      if (!Array.isArray(items)) return [];

      const qlc = (q || "").trim().toLowerCase();
      if (!qlc) return items;

      return items.filter((it: any) => {
        return String(it.full_name ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number_value ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number ?? "").toLowerCase().includes(qlc);
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      console.error("prisoners lookup error", err);
      toast.error("Failed to load prisoners (network).");
      // toast.error("Failed to load prisoners (network). Check CORS / backend or use dev proxy.");
      return [];
    }
  }, [station, district, region]);

  const fetchCallTypes = useCallback(async (q = "", signal?: AbortSignal) => {
    const res = await axiosInstance.get("/rehabilitation/call-types/", { params: { search: q, page_size: 50 }, signal });
    return res.data?.results ?? [];
  }, []);

  // small wrappers for preloaded lists (relationships, letterTypes)
  const fetchRelationshipsLocal = useCallback(async (q = "") => {
    if (!q) return relationships;
    const qlc = q.toLowerCase();
    return relationships.filter((r:any) => String(r.name ?? "").toLowerCase().includes(qlc));
  }, [relationships]);

  const fetchLetterTypesLocal = useCallback(async (q = "") => {
    if (!q) return letterTypes;
    const qlc = q.toLowerCase();
    return letterTypes.filter((t:any) => String(t.name ?? "").toLowerCase().includes(qlc));
  }, [letterTypes]);

  // form submit handlers
  const onSubmitCall = async (data: any) => {
    try {
      if (editingCall?.id) {
        await PhoneService.updateCallRecord(editingCall.id, data);
        toast.success("Call updated");
      } else {
        await PhoneService.createCallRecord(data);
        toast.success("Call created");
      }
      setCallDialogOpen(false);
      loadCalls(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save call");
    }
  };

  const onSubmitLetter = async (data: any) => {
    try {
      if (editingLetter?.id) {
        await LetterService.updateLetter(editingLetter.id, data);
        toast.success("Letter updated");
      } else {
        await LetterService.createLetter(data);
        toast.success("Letter created");
      }
      setLetterDialogOpen(false);
      loadLetters(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save letter");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#650000]">Letters & Phone Calls</h1>
        <p className="text-muted-foreground">Manage prisoner communications and correspondence</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab === "calls" ? "calls" : "letters"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button className="bg-primary" onClick={() => { if (activeTab === "calls") { setEditingCall(null); callForm.reset({}); setCallDialogOpen(true); } else { setEditingLetter(null); letterForm.reset({}); setLetterDialogOpen(true); } }}><Plus className="h-4 w-4 mr-2" />Add</Button>
      </div>

      <div className="flex gap-2">
        <button className={`px-4 py-2 rounded ${activeTab === "calls" ? "bg-[#650000] text-white" : "bg-white"}`} onClick={() => setActiveTab("calls")}>Phone Calls</button>
        <button className={`px-4 py-2 rounded ${activeTab === "letters" ? "bg-[#650000] text-white" : "bg-white"}`} onClick={() => setActiveTab("letters")}>Letters</button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab === "calls" ? "Call Records" : "Letters"}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === "calls" ? (
            <DataTable
              data={callsData}
              loading={callsLoading}
              total={callsTotal}
              title="Call Records"
              columns={callsColumns}
              externalSearch={searchTerm}
              onSearch={onSearch}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              onSort={onSort}
              page={page}
              pageSize={pageSize}
            />
          ) : (
            <DataTable
              data={lettersData}
              loading={lettersLoading}
              total={lettersTotal}
              title="Letters"
              columns={lettersColumns}
              externalSearch={searchTerm}
              onSearch={onSearch}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              onSort={onSort}
              page={page}
              pageSize={pageSize}
            />
          )}
        </CardContent>
      </Card>

      {/* Call dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCall ? "Edit Call Record" : "Add Call Record"}</DialogTitle></DialogHeader>
          <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Prisoner</Label>
                <Controller name="prisoner" control={callForm.control} rules={requiredValidation("Prisoner")} render={({ field }) => (
                  <SearchableSelect
                    key={`prisoner-select-${region ?? ""}-${district ?? ""}-${station ?? ""}`}
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    fetchOptions={fetchPrisoners}
                    placeholder="Search name or prisoner number"
                    idField="id"
                    labelField="full_name"
                    renderItem={(p: any) => {
                      const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                      const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                      const stationName = p.current_station_name ?? p.station_name ?? "";
                      return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                    }}
                  />
                )} />
              </div>

              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input {...callForm.register("caller", { required: "Caller is required" })} />
              </div>

              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input {...callForm.register("phone_number", phoneNumberValidation)} placeholder="+256700000000" />
              </div>

              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller name="call_type" control={callForm.control} render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    fetchOptions={fetchCallTypes}
                    placeholder="Call type"
                    idField="id"
                    labelField="name"
                  />
                )} />
              </div>

              <div>
                <Label>Call Date</Label>
                <Input type="datetime-local" {...callForm.register("call_date")} />
              </div>

              <div>
                <Label>Duration (min)</Label>
                <Input type="number" {...callForm.register("call_duration")} />
              </div>

              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea {...callForm.register("call_notes")} rows={4} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingCall ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Letter dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLetter ? "Edit Letter" : "Add Letter"}</DialogTitle></DialogHeader>
          <form onSubmit={letterForm.handleSubmit(onSubmitLetter)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Prisoner</Label>
                <Controller name="prisoner" control={letterForm.control} rules={requiredValidation("Prisoner")} render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    fetchOptions={fetchPrisoners}
                    placeholder="Search name or prisoner number"
                    idField="id"
                    labelField="full_name"
                    renderItem={(p: any) => {
                      const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                      const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                      const stationName = p.current_station_name ?? p.station_name ?? "";
                      return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                    }}
                  />
                )} />
              </div>

              <div>
                <Label>Subject</Label>
                <Input {...letterForm.register("subject", { required: "Subject required" })} />
              </div>

              <div>
                <Label>Letter Type</Label>
                <Controller name="letter_type" control={letterForm.control} render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    items={letterTypes}
                    placeholder="Letter type"
                    idField="id"
                    labelField="name"
                  />
                )} />
              </div>

              <div>
                <Label>Letter Date</Label>
                <Input type="datetime-local" {...letterForm.register("letter_date")} />
              </div>

              <div>
                <Label>Sender Email</Label>
                <Input {...letterForm.register("sender_email", emailValidation)} placeholder="sender@example.com" />
              </div>

              <div>
                <Label>Recipient Email</Label>
                <Input {...letterForm.register("recipient_email", emailValidation)} placeholder="recipient@example.com" />
              </div>

              <div className="md:col-span-2">
                <Label>Content</Label>
                <Textarea {...letterForm.register("letter_content")} rows={6} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingLetter ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

















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
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
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
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import VisitorPassForm from "../gate/VisitorPassForm";
import VisitorItemList from "./VisitorItemList";
import VisitorRegistrationDialog from "./VisitorRegistrationDialog";
import {getStationVisitors, Visitor} from "../../services/stationServices/visitorsServices/VisitorsService";
<<<<<<< HEAD
import {handleCatchError, handleEffectLoad, handleResponseError} from "../../services/stationServices/utils";
=======
import axiosInstance from "../../services/axiosInstance"; // << ensure path matches your project
import {handleResponseError} from "../../services/stationServices/utils";
>>>>>>> dev_env
import {getVisitorItems, VisitorItem} from "../../services/stationServices/visitorsServices/visitorItem";
import {useFilters} from "../../contexts/FilterContext";
import {useFilterRefresh} from "../../hooks/useFilterRefresh";



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
  const [openGateKeeperCombo, setOpenGateKeeperCombo] = useState(false);
  const [openRelationCombo, setOpenRelationCombo] = useState(false);
  const [openIDTypeCombo, setOpenIDTypeCombo] = useState(false);
  const [openVisitorStatusCombo, setOpenVisitorStatusCombo] = useState(false);

<<<<<<< HEAD
  const [visitorRecordsLoading, setVisitorRecordsLoading] = useState(false)
=======
  const [visitorRecordsLoading, setVisitorRecordsLoading] = useState(true)
  // DataTable states
  const [tableData, setTableData] = useState<Visitor[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
>>>>>>> dev_env

  // Calendar state
  const [calendarOpen, setCalendarOpen] = useState(false);

<<<<<<< HEAD
  const { region, district, station } = useFilters();

  // Mock data
=======

  // TODO: fetch gates/prisoners/visitorTypes/relationships/idTypes/visitorStatuses/staffList from API services here.
>>>>>>> dev_env
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
      const apiRes = await axiosInstance.get("/gate-management/station-visitors/", { params });
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

  // trigger load when paging/sorting/search change
  useEffect(() => {
    loadTable(page, pageSize, sortField, sortDir, debouncedSearch);
  }, [page, pageSize, sortField, sortDir, debouncedSearch, loadTable]);

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
  async function fetchData() {
    // setVisitorRecordsLoading(true)
      try {
        console.log(station)
        const response = await getStationVisitors(station)
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
          // console.log(data)
        }

      }catch (error) {
          handleCatchError(error)
      }finally {
        setVisitorRecordsLoading(false)
      }
  }

  const loadData = async () => {
    // console.log("Loading with filters:", region, district, station);
    // const reload = handleEffectLoad(region, district, station, setVisitorRecordsLoading, fetchData)
    // if (!reload) {
    //   setItems([])
    //   setVisitors([])
    // }
    fetchData()
  };

  useFilterRefresh(loadData, [region, district, station]);

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

<<<<<<< HEAD
      {/* Main Tabs */}
      {
        visitorRecordsLoading ? (
            <div className="size-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                      Fetching visitor records, Please wait...
                  </p>
                </div>
=======
      {/* Filters removed — global filtering is provided by top nav via useFilterRefresh */}

      {/* Main Tabs */}
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
          <TabsTrigger 
            value="records" 
            className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
          >
            <Users className="h-4 w-4 mr-2" />
            Visitor Records
          </TabsTrigger>
          <TabsTrigger 
            value="items" 
            className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID number, or contact..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10"
              />
>>>>>>> dev_env
            </div>
        ) : (
           <Tabs defaultValue="records" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
                <TabsTrigger
                  value="records"
                  className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Visitor Records
                </TabsTrigger>
                <TabsTrigger
                  value="items"
                  className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, ID number, or contact..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
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
                      resetForm();
                    }
                  }}
                  setVisitors={setVisitors}
                  editingVisitor={editingVisitor}
                />

<<<<<<< HEAD
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
                            <Label htmlFor="first_name">First Name *</Label>
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
                            <Label htmlFor="last_name">Last Name *</Label>
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
                            <Label htmlFor="contact_no">Contact Number *</Label>
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
                          <Label htmlFor="address">Address *</Label>
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
                            <Label>ID Type *</Label>
                            <Popover
                              open={openIDTypeCombo}
                              onOpenChange={setOpenIDTypeCombo}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openIDTypeCombo}
                                  className="w-full justify-between"
                                >
                                  {form.id_type
                                    ? idTypes.find((t) => t.id === form.id_type)?.name
                                    : "Select ID type..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search ID type..." />
                                  <CommandEmpty>No ID type found.</CommandEmpty>
                                  <CommandGroup>
                                    {idTypes.map((type) => (
                                      <CommandItem
                                        key={type.id}
                                        value={type.name}
                                        onSelect={() => {
                                          setForm({ ...form, id_type: type.id });
                                          setOpenIDTypeCombo(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            form.id_type === type.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {type.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="id_number">ID Number *</Label>
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
                            <Label>Gate *</Label>
                            <Popover
                              open={openGateCombo}
                              onOpenChange={setOpenGateCombo}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openGateCombo}
                                  className="w-full justify-between"
                                >
                                  {form.gate
                                    ? gates.find((g) => g.id === form.gate)?.name
                                    : "Select gate..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search gate..." />
                                  <CommandEmpty>No gate found.</CommandEmpty>
                                  <CommandGroup>
                                    {gates.map((gate) => (
                                      <CommandItem
                                        key={gate.id}
                                        value={gate.name}
                                        onSelect={() => {
                                          setForm({ ...form, gate: gate.id });
                                          setOpenGateCombo(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            form.gate === gate.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {gate.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Gate Keeper */}
                          <div className="space-y-2">
                            <Label>Gate Keeper *</Label>
                            <Popover
                              open={openGateKeeperCombo}
                              onOpenChange={setOpenGateKeeperCombo}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openGateKeeperCombo}
                                  className="w-full justify-between"
                                >
                                  {form.gate_keeper
                                    ? staffList.find((s) => s.id === form.gate_keeper)
                                        ?.name
                                    : "Select gate keeper..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search staff..." />
                                  <CommandEmpty>No staff found.</CommandEmpty>
                                  <CommandGroup>
                                    {staffList.map((staff) => (
                                      <CommandItem
                                        key={staff.id}
                                        value={staff.name}
                                        onSelect={() => {
                                          setForm({ ...form, gate_keeper: staff.id });
                                          setOpenGateKeeperCombo(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            form.gate_keeper === staff.id
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Prisoner */}
                          <div className="space-y-2">
                            <Label>Prisoner to Visit *</Label>
                            <Popover
                              open={openPrisonerCombo}
                              onOpenChange={setOpenPrisonerCombo}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openPrisonerCombo}
                                  className="w-full justify-between"
                                >
                                  {form.prisoner
                                    ? prisoners.find((p) => p.id === form.prisoner)
                                        ?.full_name
                                    : "Select prisoner..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search prisoner..." />
                                  <CommandEmpty>No prisoner found.</CommandEmpty>
                                  <CommandGroup>
                                    {prisoners.map((prisoner) => (
                                      <CommandItem
                                        key={prisoner.id}
                                        value={prisoner.full_name}
                                        onSelect={() => {
                                          setForm({ ...form, prisoner: prisoner.id });
                                          setOpenPrisonerCombo(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            form.prisoner === prisoner.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {prisoner.full_name} ({prisoner.prisoner_number})
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Relationship */}
                          <div className="space-y-2">
                            <Label>Relationship *</Label>
                            <Popover
                              open={openRelationCombo}
                              onOpenChange={setOpenRelationCombo}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openRelationCombo}
                                  className="w-full justify-between"
                                >
                                  {form.relation
                                    ? relationships.find((r) => r.id === form.relation)
                                        ?.name
                                    : "Select relationship..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search relationship..." />
                                  <CommandEmpty>No relationship found.</CommandEmpty>
                                  <CommandGroup>
                                    {relationships.map((relation) => (
                                      <CommandItem
                                        key={relation.id}
                                        value={relation.name}
                                        onSelect={() => {
                                          setForm({ ...form, relation: relation.id });
                                          setOpenRelationCombo(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            form.relation === relation.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {relation.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Visitor Type */}
                          <div className="space-y-2">
                            <Label>Visitor Type *</Label>
                            <Popover
                              open={openVisitorTypeCombo}
                              onOpenChange={setOpenVisitorTypeCombo}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openVisitorTypeCombo}
                                  className="w-full justify-between"
                                >
                                  {form.visitor_type
                                    ? visitorTypes.find(
                                        (t) => t.id === form.visitor_type
                                      )?.name
                                    : "Select visitor type..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search visitor type..." />
                                  <CommandEmpty>No visitor type found.</CommandEmpty>
                                  <CommandGroup>
                                    {visitorTypes.map((type) => (
                                      <CommandItem
                                        key={type.id}
                                        value={type.name}
                                        onSelect={() => {
                                          setForm({ ...form, visitor_type: type.id });
                                          setOpenVisitorTypeCombo(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            form.visitor_type === type.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {type.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Visitor Status */}
                          <div className="space-y-2">
                            <Label>Visitor Status *</Label>
                            <Popover
                              open={openVisitorStatusCombo}
                              onOpenChange={setOpenVisitorStatusCombo}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openVisitorStatusCombo}
                                  className="w-full justify-between"
                                >
                                  {form.visitor_status
                                    ? visitorStatuses.find(
                                        (s) => s.id === form.visitor_status
                                      )?.name
                                    : "Select status..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search status..." />
                                  <CommandEmpty>No status found.</CommandEmpty>
                                  <CommandGroup>
                                    {visitorStatuses.map((status) => (
                                      <CommandItem
                                        key={status.id}
                                        value={status.name}
                                        onSelect={() => {
                                          setForm({
                                            ...form,
                                            visitor_status: status.id,
                                          });
                                          setOpenVisitorStatusCombo(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            form.visitor_status === status.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {status.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Visitation Date */}
                          <div className="space-y-2">
                            <Label>Visitation Date *</Label>
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
                                  onSelect={(date) => {
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Visitor Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Visitor Name</TableHead>
                                  <TableHead>ID Number</TableHead>
                                  <TableHead>Contact</TableHead>
                                  <TableHead>Prisoner</TableHead>
                                  <TableHead>Visitor Type</TableHead>
                                  <TableHead>Gate</TableHead>
                                  <TableHead>Time In</TableHead>
                                  <TableHead>Time Out</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredVisitors.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={10}
                                      className="text-center py-8 text-muted-foreground"
                                    >
                                      No visitor records found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  filteredVisitors.map((visitor) => (
                                    <TableRow key={visitor.id}>
                                      <TableCell>
                                        <div>
                                          <p>
                                            {visitor.first_name} {visitor.middle_name}{" "}
                                            {visitor.last_name}
                                          </p>
                                          {visitor.organisation && (
                                            <p className="text-xs text-muted-foreground">
                                              {visitor.organisation}
                                            </p>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>{visitor.id_number}</TableCell>
                                      <TableCell>{visitor.contact_no}</TableCell>
                                      <TableCell>{visitor.prisoner_name}</TableCell>
                                      <TableCell>{visitor.visitor_type_name}</TableCell>
                                      <TableCell>{visitor.gate_name}</TableCell>
                                      <TableCell>
                                        {visitor.time_in ? (
                                          <div className="flex items-center gap-1 text-green-600">
                                            <LogIn className="h-3 w-3" />
                                            {extractTimeHHMM(visitor.time_in)}
                                          </div>
                                        ) : (
                                          "-"
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {visitor.time_out ? (
                                          <div className="flex items-center gap-1 text-red-600">
                                            <LogOut className="h-3 w-3" />
                                            {extractTimeHHMM(visitor.time_out)}
                                          </div>
                                        ) : (
                                          "-"
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {getStatusBadge(visitor.visitor_status_name)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(visitor)}
                                            title="Edit visitor"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleGenerateVisitorPass(visitor)}
                                            style={{ color: '#650000' }}
                                            title="Generate visitor pass"
                                          >
                                            <FileText className="h-4 w-4" />
                                          </Button>
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
              </TabsContent>

              {/* Visitor Items Tab */}
              <TabsContent value="items" className="mt-6">
                <VisitorItemList visitors={visitors} items={items} setItems={setItems} />
              </TabsContent>
            </Tabs>
        )
      }
=======
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
                data={tableData}
                loading={tableLoading}
                total={total}
                title="Visitor Records"
                columns={[
                  { key: 'full_name', label: 'Visitor Name', sortable: true, render: (_v: any, row: any) => (<div><p>{`${row.first_name ?? ''} ${row.middle_name ?? ''} ${row.last_name ?? ''}`.trim()}</p>{row.organisation && <p className="text-xs text-muted-foreground">{row.organisation}</p>}</div>) },
                  { key: 'id_number', label: 'ID Number', sortable: true },
                  { key: 'contact_no', label: 'Contact', sortable: true },
                  { key: 'prisoner_name', label: 'Prisoner', sortable: true },
                  { key: 'visitor_type_name', label: 'Visitor Type', sortable: true },
                  { key: 'gate_name', label: 'Gate', sortable: true },
                  { key: 'time_in', label: 'Time In', sortable: true, render: (_v: any, row: any) => row.time_in ? (<div className="flex items-center gap-1 text-green-600"><LogIn className="h-3 w-3" />{extractTimeHHMM(row.time_in)}</div>) : '-' },
                  { key: 'time_out', label: 'Time Out', sortable: true, render: (_v: any, row: any) => row.time_out ? (<div className="flex items-center gap-1 text-red-600"><LogOut className="h-3 w-3" />{extractTimeHHMM(row.time_out)}</div>) : '-' },
                  { key: 'visitor_status_name', label: 'Status', sortable: true, render: (v: any) => getStatusBadge(v) },
                  { key: 'id', label: 'Actions', sortable: false, render: (_v: any, row: any) => (<div className="flex gap-1 justify-end"><Button variant="ghost" size="sm" onClick={() => handleEdit(row)} title="Edit visitor"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleGenerateVisitorPass(row)} style={{ color: '#650000' }} title="Generate visitor pass"><FileText className="h-4 w-4" /></Button></div>)},
                ]}
                // externalSearch={searchQuery}
                onSearch={(q: string) => { setSearchQuery(q); setPage(1); }}
                onPageChange={(p: number) => setPage(p)}
                onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }}
                onSort={(f: string | null, d: 'asc' | 'desc' | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); }}
                page={page}
                pageSize={pageSize}
              />
            )}
          </div>
        </TabsContent>
>>>>>>> dev_env


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
        <DialogContent className="max-w-[900px] max-h-[85vh] overflow-y-auto">
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
    </div>
  );
}



























import { useState, useEffect, useRef } from "react";
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
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
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
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import VisitorPassForm from "../gate/VisitorPassForm";
import VisitorItemList from "./VisitorItemList";
import VisitorRegistrationDialog from "./VisitorRegistrationDialog";
import {getStationVisitors, Visitor} from "../../services/stationServices/visitorsServices/VisitorsService";
import {handleResponseError} from "../../services/stationServices/utils";
import {getVisitorItems, VisitorItem} from "../../services/stationServices/visitorsServices/visitorItem";
import PhonesLettersScreen from "./PhonesLettersScreen";



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
  // Filter & data states
  const [items, setItems] = useState<VisitorItem[]>([]);

  // Note: region/district/station filter UI removed — filters are handled globally via useFilterRefresh in the top nav.
  // If you still need these data arrays for other UI parts, re-introduce them; currently we keep only the states used elsewhere.
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Visitor Pass Dialog states
  const [isVisitorPassDialogOpen, setIsVisitorPassDialogOpen] = useState(false);
  const [selectedVisitorForPass, setSelectedVisitorForPass] = useState<Visitor | null>(null);

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
  const [openGateKeeperCombo, setOpenGateKeeperCombo] = useState(false);
  const [openRelationCombo, setOpenRelationCombo] = useState(false);
  const [openIDTypeCombo, setOpenIDTypeCombo] = useState(false);
  const [openVisitorStatusCombo, setOpenVisitorStatusCombo] = useState(false);

  const [visitorRecordsLoading, setVisitorRecordsLoading] = useState(true)

  // Calendar state
  const [calendarOpen, setCalendarOpen] = useState(false);


  // TODO: fetch gates/prisoners/visitorTypes/relationships/idTypes/visitorStatuses/staffList from API services here.
  useEffect(() => {
    // intentionally left blank: lookups should be loaded from services instead of hardcoded data
  }, []);

  // Filter visitors
  const filteredVisitors = visitors.filter((visitor) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        visitor.first_name.toLowerCase().includes(query) ||
        visitor.last_name.toLowerCase().includes(query) ||
        visitor.prisoner_name.toLowerCase().includes(query) ||
        visitor.id_number.toLowerCase().includes(query) ||
        visitor.contact_no.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
              const response = await getStationVisitors()
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

            }catch (error) {
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
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
          <TabsTrigger 
            value="records" 
            className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
          >
            <Users className="h-4 w-4 mr-2" />
            Visitor Records
          </TabsTrigger>
          <TabsTrigger 
            value="items" 
            className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID number, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
                resetForm();
              }
            }}
            setVisitors={setVisitors}
            editingVisitor={editingVisitor}
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
                      <Label htmlFor="first_name">First Name *</Label>
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
                      <Label htmlFor="last_name">Last Name *</Label>
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
                      <Label htmlFor="contact_no">Contact Number *</Label>
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
                    <Label htmlFor="address">Address *</Label>
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
                      <Label>ID Type *</Label>
                      <Popover
                        open={openIDTypeCombo}
                        onOpenChange={setOpenIDTypeCombo}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openIDTypeCombo}
                            className="w-full justify-between"
                          >
                            {form.id_type
                              ? idTypes.find((t) => t.id === form.id_type)?.name
                              : "Select ID type..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search ID type..." />
                            <CommandEmpty>No ID type found.</CommandEmpty>
                            <CommandGroup>
                              {idTypes.map((type) => (
                                <CommandItem
                                  key={type.id}
                                  value={type.name}
                                  onSelect={() => {
                                    setForm({ ...form, id_type: type.id });
                                    setOpenIDTypeCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.id_type === type.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {type.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="id_number">ID Number *</Label>
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
                      <Label>Gate *</Label>
                      <Popover
                        open={openGateCombo}
                        onOpenChange={setOpenGateCombo}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openGateCombo}
                            className="w-full justify-between"
                          >
                            {form.gate
                              ? gates.find((g) => g.id === form.gate)?.name
                              : "Select gate..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search gate..." />
                            <CommandEmpty>No gate found.</CommandEmpty>
                            <CommandGroup>
                              {gates.map((gate) => (
                                <CommandItem
                                  key={gate.id}
                                  value={gate.name}
                                  onSelect={() => {
                                    setForm({ ...form, gate: gate.id });
                                    setOpenGateCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.gate === gate.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {gate.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Gate Keeper */}
                    <div className="space-y-2">
                      <Label>Gate Keeper *</Label>
                      <Popover
                        open={openGateKeeperCombo}
                        onOpenChange={setOpenGateKeeperCombo}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openGateKeeperCombo}
                            className="w-full justify-between"
                          >
                            {form.gate_keeper
                              ? staffList.find((s) => s.id === form.gate_keeper)
                                  ?.name
                              : "Select gate keeper..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search staff..." />
                            <CommandEmpty>No staff found.</CommandEmpty>
                            <CommandGroup>
                              {staffList.map((staff) => (
                                <CommandItem
                                  key={staff.id}
                                  value={staff.name}
                                  onSelect={() => {
                                    setForm({ ...form, gate_keeper: staff.id });
                                    setOpenGateKeeperCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.gate_keeper === staff.id
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prisoner */}
                    <div className="space-y-2">
                      <Label>Prisoner to Visit *</Label>
                      <Popover
                        open={openPrisonerCombo}
                        onOpenChange={setOpenPrisonerCombo}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPrisonerCombo}
                            className="w-full justify-between"
                          >
                            {form.prisoner
                              ? prisoners.find((p) => p.id === form.prisoner)
                                  ?.full_name
                              : "Select prisoner..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search prisoner..." />
                            <CommandEmpty>No prisoner found.</CommandEmpty>
                            <CommandGroup>
                              {prisoners.map((prisoner) => (
                                <CommandItem
                                  key={prisoner.id}
                                  value={prisoner.full_name}
                                  onSelect={() => {
                                    setForm({ ...form, prisoner: prisoner.id });
                                    setOpenPrisonerCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.prisoner === prisoner.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {prisoner.full_name} ({prisoner.prisoner_number})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Relationship */}
                    <div className="space-y-2">
                      <Label>Relationship *</Label>
                      <Popover
                        open={openRelationCombo}
                        onOpenChange={setOpenRelationCombo}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openRelationCombo}
                            className="w-full justify-between"
                          >
                            {form.relation
                              ? relationships.find((r) => r.id === form.relation)
                                  ?.name
                              : "Select relationship..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search relationship..." />
                            <CommandEmpty>No relationship found.</CommandEmpty>
                            <CommandGroup>
                              {relationships.map((relation) => (
                                <CommandItem
                                  key={relation.id}
                                  value={relation.name}
                                  onSelect={() => {
                                    setForm({ ...form, relation: relation.id });
                                    setOpenRelationCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.relation === relation.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {relation.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visitor Type */}
                    <div className="space-y-2">
                      <Label>Visitor Type *</Label>
                      <Popover
                        open={openVisitorTypeCombo}
                        onOpenChange={setOpenVisitorTypeCombo}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openVisitorTypeCombo}
                            className="w-full justify-between"
                          >
                            {form.visitor_type
                              ? visitorTypes.find(
                                  (t) => t.id === form.visitor_type
                                )?.name
                              : "Select visitor type..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search visitor type..." />
                            <CommandEmpty>No visitor type found.</CommandEmpty>
                            <CommandGroup>
                              {visitorTypes.map((type) => (
                                <CommandItem
                                  key={type.id}
                                  value={type.name}
                                  onSelect={() => {
                                    setForm({ ...form, visitor_type: type.id });
                                    setOpenVisitorTypeCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.visitor_type === type.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {type.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Visitor Status */}
                    <div className="space-y-2">
                      <Label>Visitor Status *</Label>
                      <Popover
                        open={openVisitorStatusCombo}
                        onOpenChange={setOpenVisitorStatusCombo}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openVisitorStatusCombo}
                            className="w-full justify-between"
                          >
                            {form.visitor_status
                              ? visitorStatuses.find(
                                  (s) => s.id === form.visitor_status
                                )?.name
                              : "Select status..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search status..." />
                            <CommandEmpty>No status found.</CommandEmpty>
                            <CommandGroup>
                              {visitorStatuses.map((status) => (
                                <CommandItem
                                  key={status.id}
                                  value={status.name}
                                  onSelect={() => {
                                    setForm({
                                      ...form,
                                      visitor_status: status.id,
                                    });
                                    setOpenVisitorStatusCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.visitor_status === status.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {status.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Visitation Date */}
                    <div className="space-y-2">
                      <Label>Visitation Date *</Label>
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
                            onSelect={(date) => {
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Visitor Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {
                visitorRecordsLoading ? (
                    <div className="size-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground text-sm">
                              Fetching visitor records, Please wait...
                          </p>
                        </div>
                    </div>
                ) : (
                   <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Visitor Name</TableHead>
                            <TableHead>ID Number</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Prisoner</TableHead>
                            <TableHead>Visitor Type</TableHead>
                            <TableHead>Gate</TableHead>
                            <TableHead>Time In</TableHead>
                            <TableHead>Time Out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVisitors.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={10}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No visitor records found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredVisitors.map((visitor) => (
                              <TableRow key={visitor.id}>
                                <TableCell>
                                  <div>
                                    <p>
                                      {visitor.first_name} {visitor.middle_name}{" "}
                                      {visitor.last_name}
                                    </p>
                                    {visitor.organisation && (
                                      <p className="text-xs text-muted-foreground">
                                        {visitor.organisation}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{visitor.id_number}</TableCell>
                                <TableCell>{visitor.contact_no}</TableCell>
                                <TableCell>{visitor.prisoner_name}</TableCell>
                                <TableCell>{visitor.visitor_type_name}</TableCell>
                                <TableCell>{visitor.gate_name}</TableCell>
                                <TableCell>
                                  {visitor.time_in ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <LogIn className="h-3 w-3" />
                                      {extractTimeHHMM(visitor.time_in)}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {visitor.time_out ? (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <LogOut className="h-3 w-3" />
                                      {extractTimeHHMM(visitor.time_out)}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(visitor.visitor_status_name)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(visitor)}
                                      title="Edit visitor"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGenerateVisitorPass(visitor)}
                                      style={{ color: '#650000' }}
                                      title="Generate visitor pass"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                   </div>
                )
              }
            </CardContent>
          </Card>
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
        <DialogContent className="max-w-[900px] max-h-[85vh] overflow-y-auto">
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
    </div>
  );
}

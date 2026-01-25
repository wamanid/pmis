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
import DatePicker from "../common/DatePicker";
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
import ConfirmDialog from '../common/ConfirmDialog';
import { Edit, Trash2, Download } from "lucide-react";
import { useFilterRefresh } from '../../hooks/useFilterRefresh';
import { useFilters } from '../../contexts/FilterContext';
import { phoneNumberValidation, emailValidation, requiredValidation, nameValidation } from "../../utils/validation";
import SearchableSelect from '../common/SearchableSelect';
import { cn } from "../ui/utils";

import axiosInstance from '../../services/axiosInstance';
import { uploadFile } from '../../services/fileUploadService';
// API endpoints (centralised for easy management)
const API_ENDPOINTS = {
  SHIFT_DETAILS: '/station-management/api/shift-details/',
};
// Allowed file types for handover report (multipart uploads only)
const SHIFT_REPORT_ALLOWED_EXTS = ['pdf','png','jpg','jpeg','doc','docx'];
const SHIFT_REPORT_ALLOWED_MIMES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const SHIFT_REPORT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Types based on API
interface ShiftDetail {
  id: string;
  station_name: string;
  shift_name: string;
  shift_leader_username: string;
  shift_leader_full_name: string;
  shift_leader_force_number?: string;
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
  shift_name: string;
  start_time: string;
  end_time: string;
  station: string;
  station_name?: string;
  is_active?: boolean;
  created_by?: number;
  created_by_name?: string;
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

export default function ShiftDeploymentsScreen() {
  // global location filters (TopBar)
  const { region: globalRegion, district: globalDistrict, station: globalStation } = useFilters();
  // reload keys to force DataTable to refetch when lookups/filters change
  const [shiftTableKey, setShiftTableKey] = useState(0);
  const [deploymentTableKey, setDeploymentTableKey] = useState(0);
// Normalize different API shapes into the fields the UI expects.
// Resolve leader name/username from in-memory staff lookup if API returns only id.
const normalizeShiftDetail = (raw: any): ShiftDetail => {
  const leaderId = raw?.shift_leader;
  const leaderObj = leaderId ? staff.find((s) => String(s.id) === String(leaderId)) : undefined;

  const shiftLeaderFull =
    (raw.shift_leader_full_name && String(raw.shift_leader_full_name).trim()) ||
    (raw.shift_leader_name && String(raw.shift_leader_name).trim()) ||
    leaderObj?.name ||
    leaderObj?.full_name ||
    "";

  const shiftLeaderUsername =
    (raw.shift_leader_username && String(raw.shift_leader_username).trim()) ||
    leaderObj?.username ||
    leaderObj?.user_name ||
    "";

  const shiftLeaderForceNumber =
    (raw.shift_leader_force_number && String(raw.shift_leader_force_number).trim()) ||
    leaderObj?.force_number ||
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
    shift_leader_force_number: shiftLeaderForceNumber,
    created_by_name: createdByName,
  } as ShiftDetail;
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
// local UI selection (we'll default to global filters; local selects removed from page)
const [selectedRegion, setSelectedRegion] = useState<string>(globalRegion || "");
const [selectedDistrict, setSelectedDistrict] = useState<string>(globalDistrict || "");
const [selectedStation, setSelectedStation] = useState<string>(globalStation || "");

// Data states
const [regions, setRegions] = useState<Region[]>([]);
const [districts, setDistricts] = useState<District[]>([]);
const [stations, setStations] = useState<Station[]>([]);
const [staff, setStaff] = useState<Staff[]>([]);
const [shifts, setShifts] = useState<Shift[]>([]);
const [shiftsForStaffForm, setShiftsForStaffForm] = useState<Shift[]>([]);
const [shiftsForSelectedStation, setShiftsForSelectedStation] = useState<Shift[]>([]);
const [deploymentAreas, setDeploymentAreas] = useState<DeploymentArea[]>([]);
const [shiftDetails, setShiftDetails] = useState<ShiftDetail[]>([]);
const [shiftDeployments, setShiftDeployments] = useState<ShiftDeployment[]>([]);
// total count for server-side shift-details (used by DataTable)
const [shiftTotal, setShiftTotal] = useState<number>(0);

// UI states
const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
const [isEditMode, setIsEditMode] = useState(false);
const [editingShiftDetail, setEditingShiftDetail] = useState<ShiftDetail | null>(null);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [deletingShiftDetail, setDeletingShiftDetail] = useState<ShiftDetail | null>(null);
const [isDeleteDeploymentDialogOpen, setIsDeleteDeploymentDialogOpen] = useState(false);
const [deletingDeployment, setDeletingDeployment] = useState<ShiftDeployment | null>(null);
const [selectedShiftDetail, setSelectedShiftDetail] = useState<ShiftDetail | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [loading, setLoading] = useState(false);
const [deployLoading, setDeployLoading] = useState(false);
// form validation errors
const [shiftFormErrors, setShiftFormErrors] = useState<Record<string,string>>({});
const [staffFormErrors, setStaffFormErrors] = useState<Record<string,string>>({});

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

// Custom searchable station dropdown states
const [openStationSearch, setOpenStationSearch] = useState(false);
const [stationSearchQuery, setStationSearchQuery] = useState("");
const [stationSearchResults, setStationSearchResults] = useState<Station[]>([]);
const [stationSearchLoading, setStationSearchLoading] = useState(false);
const stationSearchTimeoutRef = useRef<number | null>(null);

// Dates for calendar
const [shiftDateOpen, setShiftDateOpen] = useState(false);
const [endDateOpen, setEndDateOpen] = useState(false);

// request guards
const requestIdRef = useRef(0);
const abortRef = useRef<AbortController | null>(null);
// deployments request guards (separate to avoid races)
const deployRequestIdRef = useRef(0);
const deployAbortRef = useRef<AbortController | null>(null);

// initial startup: load lookups + shift-details (used to derive shifts list for pickers)
// NOTE: the Shift Details DataTable now fetches server-side from its `url` prop.
useEffect(() => {
  let mounted = true;
  const c = new AbortController();

  (async () => {
    try {
      // include global filters when fetching stations/details so lookups reflect TopBar selection
      const [regs, stns, stf, areas, details] = await Promise.all([
        svc.fetchRegions(undefined, c.signal),
        svc.fetchStations({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
        svc.fetchStaffProfiles({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
        svc.fetchDeploymentAreas(undefined, c.signal),
        // fetch full list once for pickers/derived shifts
        svc.fetchShiftDetails({ page_size: -1, region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
      ]);
      if (!mounted) return;

      setRegions(regs ?? []);
      setStations(stns ?? []);
      setStaff(stf ?? []);
      setDeploymentAreas(areas ?? []);

      // Normalize using the staff list returned above (stf) so we can resolve shift_leader name/username
      const allDetails = details?.results ?? [];
      const normalized = (allDetails || []).map((raw: any) => {
        const leaderId = raw?.shift_leader;
        const leaderObj = Array.isArray(stf) ? stf.find((s: any) => String(s.id) === String(leaderId)) : undefined;
        return {
          ...raw,
          shift_leader_full_name: raw.shift_leader_full_name ?? raw.shift_leader_name ?? leaderObj?.name ?? leaderObj?.full_name ?? '',
          shift_leader_username: raw.shift_leader_username ?? leaderObj?.username ?? leaderObj?.user_name ?? '',
          created_by_name: raw.created_by_name ?? raw.created_by?.name ?? '',
        } as ShiftDetail;
      });
      setShiftDetails(normalized);

        // derive unique shifts from shift-details
      const uniq: Record<string, string> = {};
      normalized.forEach((d: any) => {
        if (d.shift && d.shift_name) uniq[d.shift] = d.shift_name;
      });
      setShifts(Object.entries(uniq).map(([id, name]) => ({ id, name })));
    } catch (err) {
      // ignore cancellations, show other errors
      if ((err as any)?.name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
      console.error('initial lookups error', err);
      toast.error('Failed to load initial lookup data');
    }
  })();

  return () => { mounted = false; c.abort(); };
}, [globalRegion, globalDistrict, globalStation]);

// Load districts when region changes
useEffect(() => {
  let mounted = true;
  const c = new AbortController();

  (async () => {
    // If global region exists prefer it; otherwise use local selection
    const regionToUse = globalRegion || selectedRegion;
    if (!regionToUse) {
      setDistricts([]);
      setSelectedDistrict(globalDistrict || "");
      setSelectedStation(globalStation || "");
      return;
    }
    try {
      const ds = await svc.fetchDistricts({ region: regionToUse }, c.signal);
      if (!mounted) return;
      setDistricts(ds ?? []);
      // if global district is present, set it
      setSelectedDistrict(globalDistrict || "");
      setSelectedStation(globalStation || "");
    } catch (err) {
      if ((err as any)?.name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
      console.error('fetchDistricts error', err);
      toast.error('Failed to load districts');
    }
  })();

  return () => { mounted = false; c.abort(); };
}, [selectedRegion, globalRegion, globalDistrict, globalStation]);

// Load stations when district changes
useEffect(() => {
  let mounted = true;
  const c = new AbortController();

  (async () => {
    try {
      const districtToUse = globalDistrict || selectedDistrict;
      if (!districtToUse) {
        setSelectedStation(globalStation || "");
        return;
      }
      const stns = await svc.fetchStations({ district: districtToUse, region: globalRegion }, c.signal);
      if (!mounted) return;
      setStations(stns ?? []);
      setSelectedStation(globalStation || "");
    } catch (err) {
      if ((err as any)?.name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
      console.error('fetchStations error', err);
      toast.error('Failed to load stations');
    }
  })();

  return () => { mounted = false; c.abort(); };
}, [selectedDistrict, globalRegion, globalDistrict, globalStation]);

// Load shifts when station changes in the create shift form
useEffect(() => {
  let mounted = true;
  const c = new AbortController();

  (async () => {
    if (!shiftForm.station) {
      setShifts([]);
      return;
    }
    try {
      const res = await svc.fetchShifts({ station: shiftForm.station, page_size: -1 }, c.signal);
      if (!mounted) return;
      const items = res?.results ?? [];
      setShifts(items);
    } catch (err) {
      if ((err as any)?.name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
      console.error('fetchShifts error', err);
      toast.error('Failed to load shifts');
    }
  })();

  return () => { mounted = false; c.abort(); };
}, [shiftForm.station]);

// Load shifts for Add Staff form when station changes
useEffect(() => {
  let mounted = true;
  const c = new AbortController();

  (async () => {
    const stationToUse = staffForm.station || selectedStation || globalStation;
    if (!stationToUse) {
      setShiftsForStaffForm([]);
      return;
    }
    try {
      const res = await svc.fetchShifts({ station: stationToUse, page_size: -1 }, c.signal);
      if (!mounted) return;
      const items = res?.results ?? [];
      setShiftsForStaffForm(items);
    } catch (err) {
      if ((err as any)?.name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
      console.error('fetchShifts error', err);
      toast.error('Failed to load shifts');
    }
  })();

  return () => { mounted = false; c.abort(); };
}, [staffForm.station, selectedStation, globalStation]);

// Shifts for Add Staff form are now populated from shift_details API when station is selected

// Debounced station search for staff form - handles server-side search efficiently
useEffect(() => {
  if (!openStationSearch) return;

  // Clear previous timeout
  if (stationSearchTimeoutRef.current) {
    window.clearTimeout(stationSearchTimeoutRef.current);
  }

  // Debounce search by 500ms
  stationSearchTimeoutRef.current = window.setTimeout(async () => {
    setStationSearchLoading(true);
    try {
      const params: any = { page_size: 50 };
      
      // Add search filter if query exists
      if (stationSearchQuery.trim()) {
        params.station_name__icontains = stationSearchQuery.trim();
      }
      
      const res = await svc.fetchShiftDetails(params);
      const details = res?.results ?? [];
      
      // Extract unique stations
      const stationMap: Record<string, Station> = {};
      details.forEach((detail: any) => {
        if (detail.station && detail.station_name && !stationMap[detail.station]) {
          stationMap[detail.station] = {
            id: detail.station,
            name: detail.station_name,
          };
        }
      });
      
      setStationSearchResults(Object.values(stationMap));
    } catch (err) {
      console.error('Station search error:', err);
      setStationSearchResults([]);
    } finally {
      setStationSearchLoading(false);
    }
  }, 500); // 500ms debounce

  return () => {
    if (stationSearchTimeoutRef.current) {
      window.clearTimeout(stationSearchTimeoutRef.current);
    }
  };
}, [stationSearchQuery, openStationSearch]);

// NOTE: Shift Details DataTable is server-driven via its `url` prop.
// We no longer perform manual server fetches for table rows here.

// reload when TopBar global location filters change
useFilterRefresh(() => {
  // refresh lookups and tell DataTables to reload using the reload keys
  setPage(1);
  setShiftTableKey(k => k + 1);
  setDeploymentTableKey(k => k + 1);
  (async () => {
    try {
      const c = new AbortController();
      const [stns, stf] = await Promise.all([
        svc.fetchStations({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
        svc.fetchStaffProfiles({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
      ]);
      setStations(stns ?? []);
      setStaff(stf ?? []);
    } catch (e) { /* ignore */ }
  })();
  return Promise.resolve();
}, [globalRegion, globalDistrict, globalStation]);

// client-side filtered list (keeps UI filters)
const filteredShiftDetails = shiftDetails.filter(shift => {
  // prefer globalStation filter when provided
  const stationFilter = globalStation || selectedStation;
  if (stationFilter && shift.station !== stationFilter) return false;
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
    // validation
    const errors: Record<string,string> = {};
    if (!requiredValidation(shiftForm.station || globalStation)) errors.station = 'Station is required';
    if (!requiredValidation(shiftForm.shift)) errors.shift = 'Shift is required';
    if (!requiredValidation(shiftForm.shift_leader)) errors.shift_leader = 'Shift leader is required';
    setShiftFormErrors(errors);
    if (Object.keys(errors).length) {
      setLoading(false);
      return;
    }

    // If there's a document, upload multipart locally (no base64). Otherwise JSON create.
    let createdItem: any = null;
    if (shiftForm.handover_report_doc) {
      const file = shiftForm.handover_report_doc;
      // Basic validation
      const name = file.name || '';
      const ext = name.split('.').pop()?.toLowerCase() ?? '';
      if (!SHIFT_REPORT_ALLOWED_EXTS.includes(ext)) {
        throw new Error(`Invalid file type. Allowed: ${SHIFT_REPORT_ALLOWED_EXTS.join(', ')}`);
      }
      if (!SHIFT_REPORT_ALLOWED_MIMES.includes(file.type)) {
        throw new Error('Invalid file mime type.');
      }
      if (file.size > SHIFT_REPORT_MAX_BYTES) {
        throw new Error('File exceeds maximum size of 10MB.');
      }

      // Use the app's uploadFile helper (same pattern uploadStrategyService uses).
      // This ensures the same auth/headers/interceptor behavior used elsewhere.
      const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
      const base = String(baseUrl || '').replace(/\/$/, '');
      const url = base ? `${base}${API_ENDPOINTS.SHIFT_DETAILS}` : API_ENDPOINTS.SHIFT_DETAILS;

      const extraData: Record<string,string> = {
        station: shiftForm.station || globalStation || '',
        shift: shiftForm.shift,
        shift_leader: shiftForm.shift_leader,
        handover_report: shiftForm.handover_report || '',
        is_active: 'true',
      };

      try {
        const uploadResp = await uploadFile(file, {
          url,
          fieldName: 'handover_report_doc',
          extraData,
          signal: undefined,
        });
        // uploadFile should return parsed server response on success
        // If it returned the created resource, use it
        createdItem = uploadResp ?? null;
      } catch (err: any) {
        // uploadFile may throw an object with response/data — normalize and rethrow for existing error handling
        const respErr = err?.response ?? err;
        throw respErr;
      }
    } else {
      // no file: fallback to service JSON create
      createdItem = await svc.createShiftDetail({
        station: shiftForm.station || globalStation || '',
        shift: shiftForm.shift,
        shift_leader: shiftForm.shift_leader,
        handover_report: shiftForm.handover_report || '',
        is_active: true,
      } as any);
    }

    // If backend returned created item, insert to UI immediately; else reload
    if (createdItem && createdItem.id) {
      // prefer telling the Shift Details table to refetch from server
      setShiftTableKey(k => k + 1);
    } else {
      // fallback: force reload key
      setShiftTableKey(k => k + 1);
    }
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
    //        setPage(1);
    //        await loadShiftDetails(1, pageSize, sortField, sortDir, searchQuery);
    } catch (error: any) {
      console.error('createShift error', error?.response ?? error);
      const msg = error?.response?.data ? JSON.stringify(error.response.data) : (error?.message ?? 'Failed to create shift');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaffToShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
    // validation
    const errors: Record<string,string> = {};
    if (!requiredValidation(staffForm.station || selectedStation || globalStation)) errors.station = 'Station is required';
    if (!requiredValidation(staffForm.shift)) errors.shift = 'Shift is required';
    if (!requiredValidation(staffForm.staff)) errors.staff = 'Staff member is required';
    if (!requiredValidation(staffForm.deployment_area)) errors.deployment_area = 'Deployment area is required';
    // date validation
    if (!staffForm.shift_date || !staffForm.end_date) {
      errors.shift_date = 'Shift dates are required';
    } else if (new Date(staffForm.shift_date) > new Date(staffForm.end_date)) {
      errors.end_date = 'End date must be after start date';
    }
    setStaffFormErrors(errors);
    if (Object.keys(errors).length) {
      setLoading(false);
      return;
    }

      // find staff details (must exist; staff list loaded at startup)
      const staffObj = staff.find(s => String(s.id) === String(staffForm.staff));
      const payload: Record<string, any> = {
      station: staffForm.station || selectedStation || globalStation || '',
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
    // tell DataTables to refresh
    setDeploymentTableKey(k => k + 1);
    setShiftTableKey(k => k + 1);
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

// With server-driven DataTable we simply set the selected shift and bump reload key.
const handleViewDeployments = (shift: ShiftDetail) => {
    setSelectedShiftDetail(shift);
    // bump table key to force DataTable to re-request the deployments url
    setDeploymentTableKey(k => k + 1);
  };

const openEditDialog = (shift: ShiftDetail) => {
  setIsEditMode(true);
  setEditingShiftDetail(shift);
  setShiftForm({
    station: shift.station,
    shift: shift.shift,
    shift_leader: String(shift.shift_leader),
    handover_report: shift.handover_report || "",
    handover_report_doc: null,
  });
  setIsShiftDialogOpen(true);
};

const handleEditShift = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingShiftDetail) return;
  
  setLoading(true);
  try {
    const fd = new FormData();
    fd.append('station', shiftForm.station);
    fd.append('shift', shiftForm.shift);
    fd.append('shift_leader', shiftForm.shift_leader);
    fd.append('handover_report', shiftForm.handover_report || '');
    if (shiftForm.handover_report_doc) fd.append('handover_report_doc', shiftForm.handover_report_doc);
    
    await svc.updateShiftDetail(editingShiftDetail.id, fd as any);
    toast.success("Shift updated successfully");
    setIsShiftDialogOpen(false);
    setIsEditMode(false);
    setEditingShiftDetail(null);
    setShiftForm({
      station: "",
      shift: "",
      shift_leader: "",
      handover_report: "",
      handover_report_doc: null,
    });
    setShiftTableKey(k => k + 1);
  } catch (error: any) {
    console.error('updateShift error', error?.response ?? error);
    const msg = error?.response?.data ? JSON.stringify(error.response.data) : 'Failed to update shift';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

const handleDeleteShift = async () => {
  if (!deletingShiftDetail) return;
  
  // Prevent deletion if shift has staff
  const staffCount = Number(deletingShiftDetail.deployment_count ?? deletingShiftDetail.deployments ?? 0);
  if (staffCount > 0) {
    toast.error(`Cannot delete shift with ${staffCount} staff member${staffCount > 1 ? 's' : ''} assigned. Please remove all staff from the shift first.`);
    setIsDeleteDialogOpen(false);
    setDeletingShiftDetail(null);
    return;
  }
  
  setLoading(true);
  try {
    await svc.deleteShiftDetail(deletingShiftDetail.id);
    toast.success("Shift deleted successfully");
    setIsDeleteDialogOpen(false);
    setDeletingShiftDetail(null);
    setShiftTableKey(k => k + 1);
  } catch (error: any) {
    console.error('deleteShift error', error?.response ?? error);
    const msg = error?.response?.data ? JSON.stringify(error.response.data) : 'Failed to delete shift';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

const openDeleteDialog = (shift: ShiftDetail) => {
  setDeletingShiftDetail(shift);
  setIsDeleteDialogOpen(true);
};

const openDeleteDeploymentDialog = (deployment: ShiftDeployment) => {
  setDeletingDeployment(deployment);
  setIsDeleteDeploymentDialogOpen(true);
};

const handleDeleteDeployment = async () => {
  if (!deletingDeployment) return;
  
  setLoading(true);
  try {
    await svc.deleteDeployment(deletingDeployment.id);
    toast.success("Staff removed from shift successfully");
    setIsDeleteDeploymentDialogOpen(false);
    setDeletingDeployment(null);
    // Refresh both tables (deployment count in shift details will update)
    setDeploymentTableKey(k => k + 1);
    setShiftTableKey(k => k + 1);
  } catch (error: any) {
    console.error('deleteDeployment error', error?.response ?? error);
    const msg = error?.response?.data ? JSON.stringify(error.response.data) : 'Failed to remove staff from shift';
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Shift Deployments</h1>
        <p className="text-muted-foreground">
          Manage shift schedules and staff deployments
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by shift name, leader, or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          /> */}
        </div>

        <div className="flex gap-2">
          <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col">
              <div className="flex-1 overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'Update shift details and leader assignment' : 'Create a new shift and assign a shift leader'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={isEditMode ? handleEditShift : handleCreateShift} className="space-y-4 mt-4">
                {/* Station - Searchable */}
                <div className="space-y-2">
                  <Label>Station <span className="text-red-500">*</span></Label>
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
                                setShiftForm({ ...shiftForm, station: station.id, shift: "" });
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
                  <Label>Shift <span className="text-red-500">*</span></Label>
                  <Popover open={openShiftCombo} onOpenChange={setOpenShiftCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openShiftCombo}
                        className="w-full justify-between"
                      >
                        {shiftForm.shift
                          ? shifts.find((s) => s.id === shiftForm.shift)?.shift_name
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
                              value={shift.shift_name}
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
                              {shift.shift_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Shift Leader - Searchable */}
                <div className="space-y-2">
                  <Label>Shift Leader <span className="text-red-500">*</span></Label>
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
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
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
                    onClick={() => {
                      setIsShiftDialogOpen(false);
                      setIsEditMode(false);
                      setEditingShiftDetail(null);
                      setShiftForm({
                        station: "",
                        shift: "",
                        shift_leader: "",
                        handover_report: "",
                        handover_report_doc: null,
                      });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={loading || !shiftForm.station || !shiftForm.shift || !shiftForm.shift_leader}
                  >
                    {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Shift" : "Create Shift")}
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
            <DialogContent className="max-w-md w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col">
              <div className="flex-1 overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle>Add Staff Member to Shift</DialogTitle>
                <DialogDescription>
                  Deploy a staff member to a specific shift and area
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStaffToShift} className="space-y-4 mt-4">
                {/* Station - Custom server-side searchable dropdown */}
                <div className="space-y-2">
                  <Label>Station <span className="text-red-500">*</span></Label>
                  <Popover open={openStationSearch} onOpenChange={(open: boolean) => {
                    setOpenStationSearch(open);
                    if (open && stationSearchResults.length === 0) {
                      // Trigger initial load
                      setStationSearchQuery("");
                    }
                  }}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openStationSearch}
                        className="w-full justify-between"
                      >
                        {staffForm.station
                          ? stationSearchResults.find((s) => s.id === staffForm.station)?.name || "Station selected"
                          : "Search station..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command shouldFilter={false}>
                        <div className="flex items-center border-b px-3">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <input
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Type to search stations..."
                            value={stationSearchQuery}
                            onChange={(e) => setStationSearchQuery(e.target.value)}
                          />
                        </div>
                        {stationSearchLoading ? (
                          <div className="p-4 text-sm text-center text-muted-foreground">
                            Searching...
                          </div>
                        ) : stationSearchResults.length === 0 ? (
                          <div className="p-4 text-sm text-center text-muted-foreground">
                            {stationSearchQuery ? "No stations found" : "Type to search"}
                          </div>
                        ) : (
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {stationSearchResults.map((station) => (
                              <CommandItem
                                key={station.id}
                                value={station.id}
                                onSelect={async () => {
                                  setStaffForm({ ...staffForm, station: station.id, shift: '' });
                                  setOpenStationSearch(false);
                                  
                                  // Fetch shifts for selected station from shift-details API
                                  try {
                                    const res = await svc.fetchShiftDetails({ station: station.id, page_size: -1 });
                                    const details = res?.results ?? [];
                                    // Map shift-details to dropdown options (use shift-detail ID, not shift ID)
                                    const shiftOptions = details.map((detail: any) => ({
                                      id: detail.id, // shift-detail ID (what backend expects)
                                      shift_name: detail.shift_name,
                                      start_time: '',
                                      end_time: '',
                                      station: station.id,
                                    }));
                                    setShiftsForSelectedStation(shiftOptions);
                                  } catch (err) {
                                    console.error('Failed to fetch shifts for station', err);
                                    setShiftsForSelectedStation([]);
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    staffForm.station === station.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {station.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {staffFormErrors.station && (
                    <p className="text-red-500 text-sm mt-1">{staffFormErrors.station}</p>
                  )}
                </div>

                {/* Shift - Populated from selected station's shift_details */}
                <div className="space-y-2">
                  <Label>Shift <span className="text-red-500">*</span></Label>
                  <Select 
                    value={staffForm.shift} 
                    onValueChange={(value) => setStaffForm({ ...staffForm, shift: value })}
                    disabled={!staffForm.station || shiftsForSelectedStation.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={!staffForm.station ? "Select station first..." : "Select shift..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {shiftsForSelectedStation.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.shift_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {staffFormErrors.shift && (
                    <p className="text-red-500 text-sm mt-1">{staffFormErrors.shift}</p>
                  )}
                </div>

                {/* Staff - Searchable */}
                <div className="space-y-2">
                  <Label>Staff Member <span className="text-red-500">*</span></Label>
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
                  <Label>Deployment Area <span className="text-red-500">*</span></Label>
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
                {/* <div className="space-y-2">
                  <Label>Shift Date <span className="text-red-500">*</span></Label>
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
                </div> */}

                <DatePicker
                  label="Shift Date"
                  required
                  value={staffForm.shift_date}
                  onChange={(d) => setStaffForm({ ...staffForm, shift_date: d ?? new Date() })}
                  placeholder="Pick a date"
                />

                {/* End Date */}
                {/* <div className="space-y-2">
                  <Label>End Date <span className="text-red-500">*</span></Label>
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
                </div> */}
                <DatePicker
                  label="End Date"
                  required
                  value={staffForm.end_date}
                  onChange={(d) => setStaffForm({ ...staffForm, end_date: d ?? new Date() })}
                  placeholder="Pick a date"
                />

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
              // server-side: DataTable will fetch this URL and handle paging/sort
              url={`${API_ENDPOINTS.SHIFT_DETAILS}?region=${encodeURIComponent(globalRegion || '')}&district=${encodeURIComponent(globalDistrict || '')}&station=${encodeURIComponent(globalStation || '')}&_t=${shiftTableKey}`}
              title="Shift Details"
              columns={[
                { key: 'station_name', label: 'Station', sortable: true },
                { key: 'shift_name', label: 'Shift', sortable: true },
                {
                  key: 'shift_leader_full_name',
                  label: 'Shift Leader',
                  sortable: true,
                  render: (_v: any, r: ShiftDetail) => (
                    <div>
                      <div>{r.shift_leader_full_name || '—'}</div>
                      {r.shift_leader_force_number ? (
                        <div className="text-xs text-muted-foreground font-mono">@{r.shift_leader_force_number}</div>
                      ) : null}
                    </div>
                  )
                },
                { key: 'deployment_count', label: 'Staff Count', render: (_v:any, r:ShiftDetail) => <Badge variant="secondary">{r.deployment_count ?? r.deployments ?? '0'} staff</Badge> },
                { key: 'handover_report', label: 'Handover Report', render: (v: any) => <div className="max-w-xs truncate">{v ?? 'No report'}</div> },
                { key: 'created_by_name', label: 'Created By' },
                { key: 'id', label: 'Actions', render: (_v:any, r:ShiftDetail) => (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => handleViewDeployments(r)} title="View Staff">View <Users className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(r)} title="Edit Shift"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(r)} title="Delete Shift"><Trash2 className="h-4 w-4" /></Button>
                      {r.handover_report_doc && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = r.handover_report_doc!;
                            link.download = `handover_report_${r.shift_name}_${r.station_name}.pdf`;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success('Download started');
                          }} 
                          title="Download Handover Report"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
              ]}
              externalSearch={searchQuery}
              onSearch={(q) => { setSearchQuery(q); setPage(1); setShiftTableKey(k => k + 1); }}
              onPageChange={(p) => { setPage(p); setShiftTableKey(k => k + 1); }}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); setShiftTableKey(k => k + 1); }}
              onSort={(f,d) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); setShiftTableKey(k => k + 1); }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Shift Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Shift"
        description="Are you sure you want to delete this shift?"
        details={deletingShiftDetail ? (
          <div className="space-y-2 text-sm">
            <div><strong>Station:</strong> {deletingShiftDetail.station_name}</div>
            <div><strong>Shift:</strong> {deletingShiftDetail.shift_name}</div>
            <div><strong>Leader:</strong> {deletingShiftDetail.shift_leader_full_name || '—'}</div>
            <div><strong>Staff Assigned:</strong> {deletingShiftDetail.deployment_count ?? deletingShiftDetail.deployments ?? '0'}</div>
          </div>
        ) : null}
        confirmLabel="Delete Shift"
        cancelLabel="Cancel"
        onConfirm={handleDeleteShift}
      />

      {/* Delete Deployment Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDeploymentDialogOpen}
        onOpenChange={setIsDeleteDeploymentDialogOpen}
        title="Remove Staff from Shift"
        description="Are you sure you want to remove this staff member from the shift?"
        details={deletingDeployment ? (
          <div className="space-y-2 text-sm">
            <div><strong>Staff:</strong> {deletingDeployment.name || '—'}</div>
            <div><strong>Force Number:</strong> {deletingDeployment.force_number || '—'}</div>
            <div><strong>Rank:</strong> {deletingDeployment.rank_name || '—'}</div>
            <div><strong>Area:</strong> {deletingDeployment.deployment_area_name || '—'}</div>
          </div>
        ) : null}
        confirmLabel="Remove Staff"
        cancelLabel="Cancel"
        onConfirm={handleDeleteDeployment}
      />

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
                // server-driven deployments endpoint for the selected shift
                url={`${API_ENDPOINTS.SHIFT_DETAILS}${selectedShiftDetail.id}/deployments/?region=${encodeURIComponent(globalRegion || '')}&district=${encodeURIComponent(globalDistrict || '')}&station=${encodeURIComponent(globalStation || '')}&_t=${deploymentTableKey}`}
                title="Deployments"
                columns={[
                  { key: 'name', label: 'Staff Name' },
                  { key: 'force_number', label: 'Force Number' },
                  { key: 'rank_name', label: 'Rank', render: (_v:any, r:ShiftDeployment) => r.rank_name || r.rank || '—' },
                  { key: 'deployment_area_name', label: 'Deployment Area' },
                  { key: 'shift_date', label: 'Shift Date' },
                  { key: 'end_date', label: 'End Date' },
                  { key: 'report', label: 'Report', render: (v:any) => <div className="max-w-xs truncate">{v ?? 'No report'}</div> },
                  { key: 'id', label: 'Actions', render: (_v:any, r:ShiftDeployment) => (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => openDeleteDeploymentDialog(r)} 
                      title="Remove from shift"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                ]}
                // when table internally fetches it will use the url above; provide external controls if required
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

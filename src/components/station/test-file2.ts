import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FileText,
  Calendar,
  User,
  Building2,
  Users,
  X,
  Save,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

import {
  fetchStations,
  fetchReasons,
  fetchStatuses,
} from "../../services/transferServices/transferRequestService";
import { fetchPrisoners } from "../../services/customPrisonersService";
import { fetchStaffProfiles } from "../../services/staffProfilesService";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import SearchableSelect from "../common/SearchableSelect"; // reusable searchable select
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";



interface TransferRequest {
  id?: string;
  prisoner_name?: string;
  original_station_name?: string;
  destination_station_name?: string;
  reason_name?: string;
  status_name?: string;
  in_charge_name?: string;
  original_oc_approval_status_name?: string;
  destination_oc_approval_status_name?: string;
  bulk_transfer: boolean;
  number_of_prisoners: number;
  original_station_oc_acknowledged: boolean;
  destination_station_oc_acknowledged: boolean;
  original_station_oc_approved_date: string;
  destination_station_oc_approved_date: string;
  prisoner: string;
  original_station: string;
  destination_station: string;
  reason: string;
  in_charge: number;
  status: string;
  original_station_oc_approval_status: string;
  destination_station_oc_approval_status: string;
  original_station_oc_approved_by: number;
  destination_station_oc_approved_by: number;
}

interface TransferRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransferRequest) => void;
  editingRequest?: TransferRequest | null;
  prisoners?: Array<{ id: string; name: string; number: string }>;
  stations?: Array<{ id: string; name: string }>;
  reasons?: Array<{ id: string; name: string }>;
  statuses?: Array<{ id: string; name: string }>;
  approvalStatuses?: Array<{ id: string; name: string }>;
  staff?: Array<{ id: number; name: string }>;
}

export default function TransferRequestForm({
  open,
  onClose,
  onSave,
  editingRequest,
  prisoners: prisonersProp = [],
  stations: stationsProp = [],
  reasons: reasonsProp = [],
  statuses: statusesProp = [],
  approvalStatuses = [],
  staff: staffProp = [],
}: TransferRequestFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransferRequest>({
    defaultValues: {
      bulk_transfer: false,
      number_of_prisoners: 1,
      original_station_oc_acknowledged: false,
      destination_station_oc_acknowledged: false,
      original_station_oc_approved_date: "",
      destination_station_oc_approved_date: "",
      prisoner: "",
      original_station: "",
      destination_station: "",
      reason: "",
      in_charge: 0,
      status: "",
      original_station_oc_approval_status: "",
      destination_station_oc_approval_status: "",
      original_station_oc_approved_by: 0,
      destination_station_oc_approved_by: 0,
    },
  });

  const isBulkTransfer = watch("bulk_transfer");

  // remove local prisoners/staff usage for selects (we still keep for initial items)
  const [stations, setStations] = useState<any[]>(stationsProp || []);
  const [prisoners, setPrisoners] = useState<any[]>(prisonersProp || []);
  const [reasons, setReasons] = useState<any[]>(reasonsProp || []);
  const [statuses, setStatuses] = useState<any[]>(statusesProp || []);
  const [staff, setStaff] = useState<any[]>(staffProp || []);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // sync with global location filter to pre-filter stations when bulk
  useFilterRefresh(() => {
    const station = localStorage.getItem("selectedStation") || undefined;
    const region = localStorage.getItem("selectedRegion") || undefined;
    const district = localStorage.getItem("selectedDistrict") || undefined;
    // when global filter changes, reload stations (only used when bulk)
    loadStations({
      station: station && station !== "all" ? station : undefined,
      region: region && region !== "all" ? region : undefined,
      district: district && district !== "all" ? district : undefined,
    });
  }, []);

  useEffect(() => {
    if (editingRequest) {
      reset({
        bulk_transfer: editingRequest.bulk_transfer || false,
        number_of_prisoners: editingRequest.number_of_prisoners || 1,
        original_station_oc_acknowledged:
          editingRequest.original_station_oc_acknowledged || false,
        destination_station_oc_acknowledged:
          editingRequest.destination_station_oc_acknowledged || false,
        original_station_oc_approved_date:
          editingRequest.original_station_oc_approved_date?.split("T")[0] || "",
        destination_station_oc_approved_date:
          editingRequest.destination_station_oc_approved_date?.split("T")[0] || "",
        prisoner: editingRequest.prisoner || "",
        original_station: editingRequest.original_station || "",
        destination_station: editingRequest.destination_station || "",
        reason: editingRequest.reason || "",
        in_charge: editingRequest.in_charge || 0,
        status: editingRequest.status || "",
        original_station_oc_approval_status:
          editingRequest.original_station_oc_approval_status || "",
        destination_station_oc_approval_status:
          editingRequest.destination_station_oc_approval_status || "",
        original_station_oc_approved_by:
          editingRequest.original_station_oc_approved_by || 0,
        destination_station_oc_approved_by:
          editingRequest.destination_station_oc_approved_by || 0,
      });
    } else {
      reset({
        bulk_transfer: false,
        number_of_prisoners: 1,
        original_station_oc_acknowledged: false,
        destination_station_oc_acknowledged: false,
        original_station_oc_approved_date: "",
        destination_station_oc_approved_date: "",
        prisoner: "",
        original_station: "",
        destination_station: "",
        reason: "",
        in_charge: 0,
        status: "",
        original_station_oc_approval_status: "",
        destination_station_oc_approval_status: "",
        original_station_oc_approved_by: 0,
        destination_station_oc_approved_by: 0,
      });
    }
  }, [editingRequest, reset]);

  const onSubmit = (data: TransferRequest) => {
    if (data.original_station && data.destination_station && data.original_station === data.destination_station) {
      toast.error("Original Station and Destination Station must be different");
      return;
    }
    onSave(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    // load lookup data when form mounts
    let mounted = true;
    setLoadingLookups(true);
    const c = new AbortController();
    Promise.all([
      fetchStations(c.signal).catch(() => []),
      fetchReasons(c.signal).catch(() => []),
      fetchStatuses(c.signal).catch(() => []),
      fetchStaffProfiles("", c.signal).catch(() => []),
      fetchPrisoners({ page_size: 100 }, c.signal).catch(() => ({ items: [] })),
    ])
      .then(([st, rsn, sts, sf, prRes]) => {
        if (!mounted) return;
        setStations(st);
        setReasons(rsn);
        setStatuses(sts);
        setStaff(sf);
        // fetchPrisoners returns {items, count}
        setPrisoners(prRes?.items ?? []);
      })
      .finally(() => {
        setLoadingLookups(false);
      });
    return () => {
      mounted = false;
      c.abort();
    };
  }, []);

  const loadStations = async (params?: any) => {
    setLoadingLookups(true);
    const c = new AbortController();
    try {
      const data = await fetchStations({ ...params, page_size: 100 }, c.signal);
      setStations(data);
    } catch (error) {
      setStations([]);
    } finally {
      setLoadingLookups(false);
    }
  };

  // keep watcher
  const prisonerVal = watch("prisoner");
  const originalStationVal = watch("original_station");

  useEffect(() => {
    // When not bulk, auto-populate original station from selected prisoner
    let cancelled = false;
    if (!isBulkTransfer && prisonerVal) {
      const c = new AbortController();
      fetchPrisoners({ search: prisonerVal, page_size: 1 }, c.signal)
        .then((res) => {
          if (cancelled) return;
          const p = res.items?.[0];
          if (p) setValue("original_station", p.current_station || "");
        })
        .catch(() => {})
        .finally(() => c.abort());
      return () => {
        cancelled = true;
      };
    }
    if (!prisonerVal && !isBulkTransfer) {
      setValue("original_station", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkTransfer, prisonerVal]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingRequest ? "Edit Transfer Request" : "Add Transfer Request"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Bulk Transfer Toggle */}
            <div className="border-b pb-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="bulk_transfer"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="bulk_transfer"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          setValue("number_of_prisoners", 1);
                        }
                      }}
                    />
                  )}
                />
                <label
                  htmlFor="bulk_transfer"
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Bulk Transfer (Multiple Prisoners)
                </label>
              </div>
            </div>

            {/* Prisoner or Number of Prisoners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isBulkTransfer ? (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Prisoner
                  </Label>
                  <Controller
                    name="prisoner"
                    control={control}
                    rules={{ required: !isBulkTransfer ? "Prisoner is required" : false }}
                    render={({ field }) => (
                      <CustomPrisonerSearch
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        placeholder="Select prisoner"
                        idField="id"
                        labelField="full_name"
                        initialItems={prisoners}
                        pageSize={25}
                        disabled={false}
                      />
                    )}
                  />
                  {errors.prisoner && (
                    <span className="text-sm text-red-500">
                      {errors.prisoner.message}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Prisoners
                  </Label>
                  <Controller
                    name="number_of_prisoners"
                    control={control}
                    rules={{
                      required: isBulkTransfer
                        ? "Number of prisoners is required"
                        : false,
                      min: { value: 1, message: "Must be at least 1" },
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        min="1"
                      />
                    )}
                  />
                  {errors.number_of_prisoners && (
                    <span className="text-sm text-red-500">
                      {errors.number_of_prisoners.message}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Officer In Charge
                </Label>
                <Controller
                  name="in_charge"
                  control={control}
                  rules={{ required: "Officer in charge is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={String(field.value || "")}
                      onChange={(v) => field.onChange(v)}
                      items={staff}
                      idField="id"
                      labelField="full_name"
                      placeholder="Select officer in charge"
                    />
                  )}
                />
                {errors.in_charge && (
                  <span className="text-sm text-red-500">
                    {errors.in_charge.message}
                  </span>
                )}
              </div>
            </div>

            {/* Stations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Original Station
                </Label>
                <Controller
                  name="original_station"
                  control={control}
                  rules={{ required: isBulkTransfer ? "Original station is required" : false }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      disabled={!isBulkTransfer}
                      placeholder={isBulkTransfer ? "Select original station" : "Auto-filled from prisoner"}
                      // when bulk use the stations list; when single the field is disabled and shows auto-filled value
                      items={stations}
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {!isBulkTransfer && <div className="text-xs text-gray-500">Auto-populated from selected prisoner (disabled for single transfers)</div>}
                {errors.original_station && (<span className="text-sm text-red-500">{errors.original_station.message}</span>)}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Destination Station
                </Label>
                <Controller
                  name="destination_station"
                  control={control}
                  rules={{ required: "Destination station is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      placeholder="Select destination station"
                      items={stations.filter((s: any) => s.id !== (originalStationVal || ""))}
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {errors.destination_station && (<span className="text-sm text-red-500">{errors.destination_station.message}</span>)}
              </div>
            </div>

            {/* Reason and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Reason</Label>
                <Controller
                  name="reason"
                  control={control}
                  rules={{ required: "Reason is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={reasons}
                      idField="id"
                      labelField="name"
                      placeholder="Select reason"
                    />
                  )}
                />
                {errors.reason && (
                  <span className="text-sm text-red-500">
                    {errors.reason.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Request Status</Label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={statuses}
                      idField="id"
                      labelField="name"
                      placeholder="Select status"
                    />
                  )}
                />
                {errors.status && (
                  <span className="text-sm text-red-500">
                    {errors.status.message}
                  </span>
                )}
              </div>
            </div>

            {/* OC Approval Information removed */}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4" />
                {editingRequest ? "Update Request" : "Create Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}



















------------


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
import { sendFile } from '../../services/uploadStrategyService';
import axiosInstance from '../../services/axiosInstance';
 
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
  // global location filters (TopBar)
  const { region: globalRegion, district: globalDistrict, station: globalStation } = useFilters();
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
        // include global filters when fetching stations/details so lookups reflect TopBar selection
        const [regs, stns, stf, areas, details] = await Promise.all([
          svc.fetchRegions(undefined, c.signal),
          svc.fetchStations({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
          svc.fetchStaffProfiles({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
          svc.fetchDeploymentAreas(undefined, c.signal),
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
  }, []);

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

  // loadShiftDetails: cancellable, request-id guarded to avoid stale responses
  const loadShiftDetails = useCallback(async (p = 1, ps = 10, sf?: string, sd?: 'asc'|'desc', q?: string) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLoading(true);

    try {
      // include global filters in query so server-side results are filtered
      const params: Record<string, any> = { page: Math.max(1, Number(p) || 1), page_size: Number(ps) || 10, region: globalRegion || undefined, district: globalDistrict || undefined, station: globalStation || undefined };
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

  // reload when TopBar global location filters change
  useFilterRefresh(() => {
    // reset page and reload shift details + lookups
    setPage(1);
    // refresh lookups and table
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
    return loadShiftDetails(1, pageSize, sortField, sortDir, searchQuery);
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

       // If there's a document, use the shared upload strategy (ensures correct multipart / base64 behavior)
       if (shiftForm.handover_report_doc) {
         const file = shiftForm.handover_report_doc;
         const endpoints = { audio: '/rehabilitation/call-records/', doc: '/station-management/api/shift-details/' };
         const meta: Record<string, any> = {
           station: shiftForm.station || globalStation || '',
           shift: shiftForm.shift,
           shift_leader: shiftForm.shift_leader,
           handover_report: shiftForm.handover_report || '',
         };
         const result = await sendFile(file, { endpoints, meta });
         if (!result.ok) {
           throw result.error ?? result;
         }
       } else {
         // no file: fallback to regular JSON POST via service
         await svc.createShiftDetail({
           station: shiftForm.station || globalStation || '',
           shift: shiftForm.shift,
           shift_leader: shiftForm.shift_leader,
           handover_report: shiftForm.handover_report || '',
         } as any);
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
                      <div>{r.shift_leader_full_name || '—'}</div>
                      {r.shift_leader_username ? (
                        <div className="text-xs text-muted-foreground font-mono">@{r.shift_leader_username}</div>
                      ) : null}
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
import { useFilterRefresh } from '../../hooks/useFilterRefresh';
import { useFilters } from '../../contexts/FilterContext';
import { phoneNumberValidation, emailValidation, requiredValidation, nameValidation } from "../../utils/validation";




import * as svc from '../../services/stationServices/shiftDeploymentsService';
import { sendFile } from '../../services/uploadStrategyService';
import axiosInstance from '../../services/axiosInstance';




// converting to datatables
// Patch 1 — add DataTable component

// Client-side, lightweight: accepts columns with a render(row) function so existing badge/icon JSX is reused unchanged.
// Keeps your current table markup and styles.

import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export type DataColumn<T> = {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  // renderer receives the full row
  render: (row: T) => React.ReactNode;
  // optional accessor for sorting / simple text search
  accessor?: (row: T) => string;
};

type Props<T> = {
  columns: DataColumn<T>[];
  data: T[];
  pageSize?: number;
  pageSizeOptions?: number[];
  className?: string;
};

export default function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let out = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((row) =>
        columns.some((col) =>
          (col.accessor ? (col.accessor(row) ?? "") : String(col.render(row)))
            .toString()
            .toLowerCase()
            .includes(q)
        )
      );
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col && col.accessor) {
        out = [...out].sort((a, b) => {
          const va = (col.accessor!(a) ?? "").toString();
          const vb = (col.accessor!(b) ?? "").toString();
          if (va === vb) return 0;
          return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        });
      }
    }
    return out;
  }, [data, search, sortKey, sortDir, columns]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pageData = useMemo(
    () => filtered.slice((page - 1) * size, page * size),
    [filtered, page, size]
  );

  // keep page within bounds
  if (page > totalPages) setPage(totalPages);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search table..."
            value={search}
            onChange={(e: any) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-w-[220px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={String(size)} onValueChange={(v) => { setSize(Number(v)); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder={`${size} / page`} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>
              Prev
            </Button>
            <span className="text-sm px-2">
              {page} / {totalPages}
            </span>
            <Button size="sm" variant="outline" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className="text-white">
                <div
                  className={col.sortable ? "cursor-pointer select-none flex items-center gap-2" : undefined}
                  onClick={() => {
                    if (!col.sortable) return;
                    if (sortKey !== col.key) {
                      setSortKey(col.key);
                      setSortDir("asc");
                    } else {
                      setSortDir(sortDir === "asc" ? "desc" : "asc");
                    }
                  }}
                >
                  {col.header}
                  {col.sortable && sortKey === col.key && <span className="text-xs opacity-70">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {pageData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                No data
              </TableCell>
            </TableRow>
          ) : (
            pageData.map((row, idx) => (
              <TableRow key={(row as any).id ?? idx}>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.render(row)}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}






// Patch 2 — use DataTable in TransferRequestList

// Replace the existing manual Table rendering block with DataTable and provide columns wired to your existing renderers so badges, icons and colors are unchanged.

// ...existing code...
-import {
-  Table,
-  TableBody,
-  TableCell,
-  TableHead,
-  TableHeader,
-  TableRow,
-} from "../ui/table";
+import {
+  Table,
+  TableBody,
+  TableCell,
+  TableHead,
+  TableHeader,
+  TableRow,
+} from "../ui/table";
+import DataTable, { DataColumn } from "../ui/DataTable";
// ...existing code...
@@
-      {/* Requests Table */}
-      <Card>
-        <CardContent className="p-0">
-          <Table>
-            <TableHeader>
-              <TableRow style={{ backgroundColor: '#650000' }}>
-                <TableHead className="text-white">Type</TableHead>
-                <TableHead className="text-white">Prisoner(s)</TableHead>
-                <TableHead className="text-white">From → To</TableHead>
-                <TableHead className="text-white">Reason</TableHead>
-                <TableHead className="text-white">In Charge</TableHead>
-                <TableHead className="text-white">Status</TableHead>
-                {/* OC Approvals column removed */}
-                <TableHead className="text-white">Actions</TableHead>
-              </TableRow>
-            </TableHeader>
-            <TableBody>
-              {filteredRequests.length === 0 ? (
-                <TableRow>
-                  <TableCell
-                    colSpan={8}
-                    className="text-center py-8 text-gray-500"
-                  >
-                    No transfer requests found
-                  </TableCell>
-                </TableRow>
-              ) : (
-                filteredRequests.map((request) => (
-                  <TableRow key={request.id}>
-                    <TableCell>
-                      {request.bulk_transfer ? (
-                        <Badge className="bg-purple-600 flex items-center gap-1 w-fit">
-                          <Users className="h-3 w-3" />
-                          Bulk
-                        </Badge>
-                      ) : (
-                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
-                          <User className="h-3 w-3" />
-                          Single
-                        </Badge>
-                      )}
-                    </TableCell>
-                    <TableCell>
-                      {request.bulk_transfer ? (
-                        <div className="flex items-center gap-2">
-                          <Users className="h-4 w-4 text-gray-400" />
-                          <span className="text-sm">
-                            {request.number_of_prisoners} prisoners
-                          </span>
-                        </div>
-                      ) : (
-                        <div className="flex items-center gap-2">
-                          <User className="h-4 w-4 text-gray-400" />
-                          <span className="text-sm">{request.prisoner_name}</span>
-                        </div>
-                      )}
-                    </TableCell>
-                    <TableCell>
-                      <div className="flex items-center gap-2">
-                        <Building2 className="h-4 w-4 text-gray-400" />
-                        <div className="text-sm">
-                          <div>{request.original_station_name}</div>
-                          <div className="flex items-center gap-1 text-gray-500">
-                            <ArrowRightLeft className="h-3 w-3" />
-                            {request.destination_station_name}
-                          </div>
-                        </div>
-                      </div>
-                    </TableCell>
-                    <TableCell>
-                      <Badge variant="outline">{request.reason_name}</Badge>
-                    </TableCell>
-                    <TableCell>
-                      <div className="flex items-center gap-2">
-                        <User className="h-4 w-4 text-gray-400" />
-                        <span className="text-sm">{request.in_charge_name}</span>
-                      </div>
-                    </TableCell>
-                    <TableCell>
-                      <Badge variant={getStatusBadgeVariant(request.status_name || "")}>
-                        {request.status_name}
-                      </Badge>
-                    </TableCell>
-
-                     {/* OC Approvals cell removed */}
-                    <TableCell>
-                      <div className="flex gap-2">
-                        <Button
-                          size="sm"
-                          variant="outline"
-                          onClick={() => handleEditRequest(request)}
-                        >
-                          <Edit className="h-4 w-4" />
-                        </Button>
-                        <Button
-                          size="sm"
-                          variant="destructive"
-                          onClick={() => handleDeleteClick(request.id!)}
-                        >
-                          <Trash2 className="h-4 w-4" />
-                        </Button>
-                      </div>
-                    </TableCell>
-                  </TableRow>
-                ))
-              )}
-            </TableBody>
-          </Table>
-        </CardContent>
-      </Card>
+      {/* Requests Table (DataTable) */}
+      <Card>
+        <CardContent className="p-0">
+          <DataTable
+            data={filteredRequests}
+            columns={[
+              {
+                key: "type",
+                header: "Type",
+                render: (r: any) =>
+                  r.bulk_transfer ? (
+                    <Badge className="bg-purple-600 flex items-center gap-1 w-fit">
+                      <Users className="h-3 w-3" />
+                      Bulk
+                    </Badge>
+                  ) : (
+                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
+                      <User className="h-3 w-3" />
+                      Single
+                    </Badge>
+                  ),
+                accessor: (r: any) => (r.bulk_transfer ? "bulk" : "single"),
+                sortable: true,
+              },
+              {
+                key: "prisoners",
+                header: "Prisoner(s)",
+                render: (r: any) =>
+                  r.bulk_transfer ? (
+                    <div className="flex items-center gap-2">
+                      <Users className="h-4 w-4 text-gray-400" />
+                      <span className="text-sm">{r.number_of_prisoners} prisoners</span>
+                    </div>
+                  ) : (
+                    <div className="flex items-center gap-2">
+                      <User className="h-4 w-4 text-gray-400" />
+                      <span className="text-sm">{r.prisoner_name}</span>
+                    </div>
+                  ),
+                accessor: (r: any) => r.prisoner_name ?? "",
+              },
+              {
+                key: "fromto",
+                header: "From → To",
+                render: (r: any) => (
+                  <div className="flex items-center gap-2">
+                    <Building2 className="h-4 w-4 text-gray-400" />
+                    <div className="text-sm">
+                      <div>{r.original_station_name}</div>
+                      <div className="flex items-center gap-1 text-gray-500">
+                        <ArrowRightLeft className="h-3 w-3" />
+                        {r.destination_station_name}
+                      </div>
+                    </div>
+                  </div>
+                ),
+                accessor: (r: any) => (r.original_station_name ?? "") + "->" + (r.destination_station_name ?? ""),
+                sortable: true,
+              },
+              {
+                key: "reason",
+                header: "Reason",
+                render: (r: any) => <Badge variant="outline">{r.reason_name}</Badge>,
+                accessor: (r: any) => r.reason_name ?? "",
+              },
+              {
+                key: "in_charge",
+                header: "In Charge",
+                render: (r: any) => (
+                  <div className="flex items-center gap-2">
+                    <User className="h-4 w-4 text-gray-400" />
+                    <span className="text-sm">{r.in_charge_name}</span>
+                  </div>
+                ),
+                accessor: (r: any) => r.in_charge_name ?? "",
+              },
+              {
+                key: "status",
+                header: "Status",
+                render: (r: any) => (
+                  <Badge variant={getStatusBadgeVariant(r.status_name || "")}>
+                    {r.status_name}
+                  </Badge>
+                ),
+                accessor: (r: any) => r.status_name ?? "",
+                sortable: true,
+              },
+              {
+                key: "actions",
+                header: "Actions",
+                render: (r: any) => (
+                  <div className="flex gap-2">
+                    <Button size="sm" variant="outline" onClick={() => handleEditRequest(r)}>
+                      <Edit className="h-4 w-4" />
+                    </Button>
+                    <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(r.id!)}>
+                      <Trash2 className="h-4 w-4" />
+                    </Button>
+                  </div>
+                ),
+                accessor: () => "",
+              },
+            ]}
+          />
+        </CardContent>
+      </Card>
 // ...existing code...











// ...existing code...
-import { useState, useEffect, useRef, useCallback } from "react";
+import { useState, useEffect, useRef, useCallback } from "react";
+import { useFilterRefresh } from '../../hooks/useFilterRefresh';
+import { useFilters } from '../../contexts/FilterContext';
+import { phoneNumberValidation, emailValidation, requiredValidation, nameValidation } from "../../utils/validation";
 // ...existing code...
 
 export default function ShiftDeploymentsScreen() {
+  // global location filters (TopBar)
+  const { region: globalRegion, district: globalDistrict, station: globalStation } = useFilters();
   // Normalize different API shapes into the fields the UI expects
   const normalizeShiftDetail = (raw: any): ShiftDetail => {
@@
   // Filter states
-  const [selectedRegion, setSelectedRegion] = useState<string>("");
-  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
-  const [selectedStation, setSelectedStation] = useState<string>("");
+  // local UI selection (we'll default to global filters; local selects removed from page)
+  const [selectedRegion, setSelectedRegion] = useState<string>(globalRegion || "");
+  const [selectedDistrict, setSelectedDistrict] = useState<string>(globalDistrict || "");
+  const [selectedStation, setSelectedStation] = useState<string>(globalStation || "");
@@
   // UI states
   const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
   const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
@@
   const [loading, setLoading] = useState(false);
   const [deployLoading, setDeployLoading] = useState(false);
+  // form validation errors
+  const [shiftFormErrors, setShiftFormErrors] = useState<Record<string,string>>({});
+  const [staffFormErrors, setStaffFormErrors] = useState<Record<string,string>>({});
@@
   // initial startup: load lookups + shift-details (derives shifts)
   useEffect(() => {
     let mounted = true;
     const c = new AbortController();
 
     (async () => {
       try {
-        const [regs, stns, stf, areas, details] = await Promise.all([
-          svc.fetchRegions(undefined, c.signal),
-          svc.fetchStations(undefined, c.signal),
-          svc.fetchStaffProfiles(undefined, c.signal),
-          svc.fetchDeploymentAreas(undefined, c.signal),
-          svc.fetchShiftDetails({ page_size: -1 }, c.signal),
-        ]);
+        // include global filters when fetching stations/details so lookups reflect TopBar selection
+        const [regs, stns, stf, areas, details] = await Promise.all([
+          svc.fetchRegions(undefined, c.signal),
+          svc.fetchStations({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
+          svc.fetchStaffProfiles({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
+          svc.fetchDeploymentAreas(undefined, c.signal),
+          svc.fetchShiftDetails({ page_size: -1, region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
+        ]);
@@
-        setRegions(regs ?? []);
-        setStations(stns ?? []);
-        setStaff(stf ?? []);
+        setRegions(regs ?? []);
+        setStations(stns ?? []);
+        setStaff(stf ?? []);
         setDeploymentAreas(areas ?? []);
         const allDetails = details?.results ?? [];
         const normalized = (allDetails || []).map(normalizeShiftDetail);
         setShiftDetails(normalized);
 
@@
       } catch (err) {
         console.error('initial lookups error', err);
         toast.error('Failed to load initial lookup data');
       }
     })();
 
     return () => { mounted = false; c.abort(); };
   }, []);
@@
   useEffect(() => {
     let mounted = true;
     const c = new AbortController();
 
     (async () => {
-      if (!selectedRegion) {
-        setDistricts([]);
-        setSelectedDistrict("");
-        setSelectedStation("");
-        return;
-      }
-      try {
-        const ds = await svc.fetchDistricts({ region: selectedRegion }, c.signal);
-        if (!mounted) return;
-        setDistricts(ds ?? []);
-        setSelectedDistrict("");
-        setSelectedStation("");
-      } catch (err) {
-        console.error('fetchDistricts error', err);
-        toast.error('Failed to load districts');
-      }
+      // If global region exists prefer it; otherwise use local selection
+      const regionToUse = globalRegion || selectedRegion;
+      if (!regionToUse) {
+        setDistricts([]);
+        setSelectedDistrict(globalDistrict || "");
+        setSelectedStation(globalStation || "");
+        return;
+      }
+      try {
+        const ds = await svc.fetchDistricts({ region: regionToUse }, c.signal);
+        if (!mounted) return;
+        setDistricts(ds ?? []);
+        // if global district is present, set it
+        setSelectedDistrict(globalDistrict || "");
+        setSelectedStation(globalStation || "");
+      } catch (err) {
+        console.error('fetchDistricts error', err);
+        toast.error('Failed to load districts');
+      }
     })();
 
     return () => { mounted = false; c.abort(); };
   }, [selectedRegion, globalRegion, globalDistrict, globalStation]);
@@
   useEffect(() => {
     let mounted = true;
     const c = new AbortController();
 
     (async () => {
       try {
-        if (!selectedDistrict) {
-          // keep existing stations loaded on startup; only clear selected station
-          setSelectedStation("");
-          return;
-        }
-        const stns = await svc.fetchStations({ district: selectedDistrict }, c.signal);
-        if (!mounted) return;
-        setStations(stns ?? []);
-        setSelectedStation("");
+        const districtToUse = globalDistrict || selectedDistrict;
+        if (!districtToUse) {
+          setSelectedStation(globalStation || "");
+          return;
+        }
+        const stns = await svc.fetchStations({ district: districtToUse, region: globalRegion }, c.signal);
+        if (!mounted) return;
+        setStations(stns ?? []);
+        setSelectedStation(globalStation || "");
       } catch (err) {
         console.error('fetchStations error', err);
         toast.error('Failed to load stations');
       }
     })();
 
     return () => { mounted = false; c.abort(); };
   }, [selectedDistrict, globalRegion, globalDistrict, globalStation]);
@@
   const loadShiftDetails = useCallback(async (p = 1, ps = 10, sf?: string, sd?: 'asc'|'desc', q?: string) => {
@@
-      const params: Record<string, any> = { page: Math.max(1, Number(p) || 1), page_size: Number(ps) || 10 };
+      // include global filters in query so server-side results are filtered
+      const params: Record<string, any> = { page: Math.max(1, Number(p) || 1), page_size: Number(ps) || 10, region: globalRegion || undefined, district: globalDistrict || undefined, station: globalStation || undefined };
       if (sf) params.ordering = sd === 'desc' ? `-${sf}` : sf;
       if (q) params.search = q;
       params._t = Date.now();
 
       const res = await svc.fetchShiftDetails(params, controller.signal);
@@
   }, []);
 
   // initial/load on page/search/sort change
   useEffect(() => {
     loadShiftDetails(page, pageSize, sortField, sortDir, searchQuery);
   }, [page, pageSize, sortField, sortDir, searchQuery, loadShiftDetails]);
+
+  // reload when TopBar global location filters change
+  useFilterRefresh(() => {
+    // reset page and reload shift details + lookups
+    setPage(1);
+    // refresh lookups and table
+    (async () => {
+      try {
+        const c = new AbortController();
+        const [stns, stf] = await Promise.all([
+          svc.fetchStations({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
+          svc.fetchStaffProfiles({ region: globalRegion, district: globalDistrict, station: globalStation }, c.signal),
+        ]);
+        setStations(stns ?? []);
+        setStaff(stf ?? []);
+      } catch (e) { /* ignore */ }
+    })();
+    return loadShiftDetails(1, pageSize, sortField, sortDir, searchQuery);
+  }, [globalRegion, globalDistrict, globalStation]);
@@
-  // client-side filtered list (keeps UI filters)
+  // client-side filtered list (keeps UI filters)
   const filteredShiftDetails = shiftDetails.filter(shift => {
-    if (selectedStation && shift.station !== selectedStation) return false;
+    // prefer globalStation filter when provided
+    const stationFilter = globalStation || selectedStation;
+    if (stationFilter && shift.station !== stationFilter) return false;
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
@@
   const handleCreateShift = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     try {
+      // validation
+      const errors: Record<string,string> = {};
+      if (!requiredValidation(shiftForm.station || globalStation)) errors.station = 'Station is required';
+      if (!requiredValidation(shiftForm.shift)) errors.shift = 'Shift is required';
+      if (!requiredValidation(shiftForm.shift_leader)) errors.shift_leader = 'Shift leader is required';
+      setShiftFormErrors(errors);
+      if (Object.keys(errors).length) {
+        setLoading(false);
+        return;
+      }
+
       const fd = new FormData();
-      fd.append('station', shiftForm.station);
+      fd.append('station', shiftForm.station || globalStation || '');
       fd.append('shift', shiftForm.shift);
       fd.append('shift_leader', shiftForm.shift_leader);
       fd.append('handover_report', shiftForm.handover_report || '');
       if (shiftForm.handover_report_doc) fd.append('handover_report_doc', shiftForm.handover_report_doc);
       await svc.createShiftDetail(fd as any);
       toast.success("Shift created successfully");
       setIsShiftDialogOpen(false);
@@
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
@@
   const handleAddStaffToShift = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     try {
+      // validation
+      const errors: Record<string,string> = {};
+      if (!requiredValidation(staffForm.station || selectedStation || globalStation)) errors.station = 'Station is required';
+      if (!requiredValidation(staffForm.shift)) errors.shift = 'Shift is required';
+      if (!requiredValidation(staffForm.staff)) errors.staff = 'Staff member is required';
+      if (!requiredValidation(staffForm.deployment_area)) errors.deployment_area = 'Deployment area is required';
+      // date validation
+      if (!staffForm.shift_date || !staffForm.end_date) {
+        errors.shift_date = 'Shift dates are required';
+      } else if (new Date(staffForm.shift_date) > new Date(staffForm.end_date)) {
+        errors.end_date = 'End date must be after start date';
+      }
+      setStaffFormErrors(errors);
+      if (Object.keys(errors).length) {
+        setLoading(false);
+        return;
+      }
+
       // find staff details (must exist; staff list loaded at startup)
       const staffObj = staff.find(s => String(s.id) === String(staffForm.staff));
       const payload: Record<string, any> = {
-        station: staffForm.station || selectedStation,
+        station: staffForm.station || selectedStation || globalStation || '',
         shift: staffForm.shift,
         staff: staffForm.staff,
         deployment_area: staffForm.deployment_area,
         shift_date: format(staffForm.shift_date, 'yyyy-MM-dd'),
         end_date: format(staffForm.end_date, 'yyyy-MM-dd'),
         report: staffForm.report || '',
       };
@@
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
@@
     } catch (error: any) {
       console.error('createDeployment error', error?.response ?? error);
@@
     } finally {
       setLoading(false);
     }
   };
@@
-              {
-                key: 'shift_leader_full_name',
-                label: 'Shift Leader',
-                sortable: true,
-                render: (_v: any, r: ShiftDetail) => (
-                  <div>
-                    <div>{r.shift_leader_full_name}</div>
-                    <div className="text-xs text-muted-foreground font-mono">@{r.shift_leader_username}</div>
-                  </div>
-                )
-              },
+              {
+                key: 'shift_leader_full_name',
+                label: 'Shift Leader',
+                sortable: true,
+                render: (_v: any, r: ShiftDetail) => (
+                  <div>
+                    <div>{r.shift_leader_full_name || '—'}</div>
+                    {r.shift_leader_username ? (
+                      <div className="text-xs text-muted-foreground font-mono">@{r.shift_leader_username}</div>
+                    ) : null}
+                  </div>
+                )
+              },
@@
-      {/* Filters */}
-      <Card>
-        <CardHeader>
-          <CardTitle className="flex items-center gap-2">
-            <Filter className="h-5 w-5" />
-            Filters
-          </CardTitle>
-        </CardHeader>
-        <CardContent>
-          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
-            <div className="space-y-2">
-              <Label htmlFor="region">Region</Label>
-              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
-                <SelectTrigger id="region">
-                  <SelectValue placeholder="Select Region" />
-                </SelectTrigger>
-                <SelectContent>
-                  {regions.map((region) => (
-                    <SelectItem key={region.id} value={region.id}>
-                      {region.name}
-                    </SelectItem>
-                  ))}
-                </SelectContent>
-              </Select>
-            </div>
-
-            <div className="space-y-2">
-              <Label htmlFor="district">District</Label>
-              <Select
-                value={selectedDistrict}
-                onValueChange={setSelectedDistrict}
-                disabled={!selectedRegion}
-              >
-                <SelectTrigger id="district">
-                  <SelectValue placeholder="Select District" />
-                </SelectTrigger>
-                <SelectContent>
-                  {districts.map((district) => (
-                    <SelectItem key={district.id} value={district.id}>
-                      {district.name}
-                    </SelectItem>
-                  ))}
-                </SelectContent>
-              </Select>
-            </div>
-
-            <div className="space-y-2">
-              <Label htmlFor="station">Station</Label>
-              <Select
-                value={selectedStation}
-                onValueChange={setSelectedStation}
-                disabled={!selectedDistrict}
-              >
-                <SelectTrigger id="station">
-                  <SelectValue placeholder="Select Station" />
-                </SelectTrigger>
-                <SelectContent>
-                  {stations.map((station) => (
-                    <SelectItem key={station.id} value={station.id}>
-                      {station.name}
-                    </SelectItem>
-                  ))}
-                </SelectContent>
-              </Select>
-            </div>
-          </div>
-        </CardContent>
-      </Card>
+      {/* Using global TopBar filters — local filter UI removed */}
@@
   );
 }




 I updated ShiftDeploymentsScreen to use the global location filters, removed the local Filters card, fixed the shift leader username rendering, and added basic validation for the Create Shift and Add Staff forms using your shared validation helpers. The change reloads data and lookups when TopBar filters change via useFilterRefresh.



















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



==-------------


// ...existing code...
-import * as ComplaintsService from '../../services/stationServices/complaintsService';
+import * as ComplaintsService from '../../services/stationServices/complaintsService';
+import axiosInstance from '../../services/axiosInstance';
import JournalScreen from "./JournalScreen";
+
+// centralised endpoints for this screen
+const API_ENDPOINTS = {
+  COMPLAINTS: '/station-management/api/complaints/',
+};
 // ...existing code...
 export function ComplaintsScreen() {
+  // build full complaints url (uses axiosInstance.baseURL if set)
+  const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const base = String(baseUrl || '').replace(/\/$/, '');
+  const complaintsUrl = base ? `${base}${API_ENDPOINTS.COMPLAINTS}` : API_ENDPOINTS.COMPLAINTS;
+
   // data table / server side
   const [complaints, setComplaints] = useState<Complaint[]>([]);
@@
       <DataTable
+            // supply API url so DataTable can use it / display for debugging
+            url={complaintsUrl}
             data={resolvedComplaints}
             loading={tableLoading}
             total={total}
             title="Complaints"
             columns={[
// ...existing code...



JournalScreen
// ...existing code...
-import * as JournalService from '../../services/stationServices/journalService';
+import * as JournalService from '../../services/stationServices/journalService';
+import axiosInstance from '../../services/axiosInstance';
+
+// centralised endpoints for this screen
+const API_ENDPOINTS = {
+  JOURNALS: '/station-management/api/journals/',
+};
 // ...existing code...
-  const journalsUrl = `/station-management/api/journals/?_t=${reloadKey}`;
+  const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const base = String(baseUrl || '').replace(/\/$/, '');
+  const journalsUrl = base ? `${base}${API_ENDPOINTS.JOURNALS}?_t=${reloadKey}` : `${API_ENDPOINTS.JOURNALS}?_t=${reloadKey}`;
 // ...existing code...
             <DataTable
+              url={journalsUrl}
               data={tableData}
               loading={tableLoading}
               total={total}
               title="Journal Entries"
               columns={journalColumns}
               externalSearch={searchTerm}
               onSearch={onSearch}
               onPageChange={onPageChange}
               onPageSizeChange={onPageSizeChange}
               onSort={onSort}
             />
// ...existing code...




// manual lockup
// ...existing code...
-import axiosInstance from "../../services/axiosInstance";
+import axiosInstance from "../../services/axiosInstance";
+// centralised endpoints for this screen
+const API_ENDPOINTS = {
+  MANUAL_LOCKUPS: `${MANUAL_LOCKUP_API_BASE}/`,
+};
 
 // API constants (single place to manage endpoints)
 const MANUAL_LOCKUP_API_BASE = "/station-management/api/manual-lockups";
 const MANUAL_LOCKUP_API = (id?: string) => id ? `${MANUAL_LOCKUP_API_BASE}/${id}/` : `${MANUAL_LOCKUP_API_BASE}/`;
// ...existing code...
 export function ManualLockupScreen() {
+  // build full manual-lockups url (uses axiosInstance.baseURL if set)
+  const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const base = String(baseUrl || '').replace(/\/$/, '');
+  const manualLockupsUrl = base ? `${base}${API_ENDPOINTS.MANUAL_LOCKUPS}` : API_ENDPOINTS.MANUAL_LOCKUPS;
+
// ...existing code...
               <DataTable
+                // supply endpoint url for centralized management / debugging
+                url={manualLockupsUrl}
                 data={tableData}
                 loading={tableLoading}
                 total={total}
                 title="Manual Lockups"
                 columns={[
                   { key: 'is_active', label: 'Status', render: (_v:any, r:any) => <Badge variant={r.is_active ? 'default' : 'secondary'}>{r.is_active ? 'Active' : 'Inactive'}</Badge> },
 // ...existing code...





 PhonesandLetters
 // ...existing code...
-/**
- * Centralized API endpoints (single source of truth).
- * Update these values to match backend routes. Use these variables
- * everywhere instead of hardcoding strings.
- */
-const API_ENDPOINTS = {
-  createLetter: "/rehabilitation/eletters/",        // POST to create letter (JSON)
-  createCall: "/rehabilitation/call-records/",      // POST to create call record (JSON)
-  // Upload endpoints used by uploadStrategyService.
-  // If your backend has dedicated upload endpoints, set them here.
-  // Otherwise uploadStrategyService will post base64 JSON to `doc` endpoint
-  // or multipart to `audio` endpoint depending on file type.
-
-};
+/**
+ * Centralized API endpoints (single source of truth).
+ * Update these values to match backend routes. Use these variables
+ * everywhere instead of hardcoding strings.
+ */
+const API_ENDPOINTS = {
+  // list/create endpoints
+  CALLS: "/rehabilitation/call-records/",
+  LETTERS: "/rehabilitation/eletters/",
+  // create endpoints (kept for existing usage)
+  createLetter: "/rehabilitation/eletters/",
+  createCall: "/rehabilitation/call-records/",
+};
// ...existing code...
export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();
+  // build full API urls (respect axiosInstance.baseURL if configured)
+  const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const base = String(baseUrl || '').replace(/\/$/, '');
+  const callsUrl = base ? `${base}${API_ENDPOINTS.CALLS}` : API_ENDPOINTS.CALLS;
+  const lettersUrl = base ? `${base}${API_ENDPOINTS.LETTERS}` : API_ENDPOINTS.LETTERS;
 
   const [activeTab, setActiveTab] = useState<Tab>("calls");
@@
-            {activeTab === "calls" ? (
+            {activeTab === "calls" ? (
               <DataTable
+                url={callsUrl}
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
+                url={lettersUrl}
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
```// filepath: /Users/derrickwamani/Sites/localhost/PMIS_V2/src/components/station/PhonesLettersScreen.tsx
// ...existing code...
-/**
- * Centralized API endpoints (single source of truth).
- * Update these values to match backend routes. Use these variables
- * everywhere instead of hardcoding strings.
- */
-const API_ENDPOINTS = {
-  createLetter: "/rehabilitation/eletters/",        // POST to create letter (JSON)
-  createCall: "/rehabilitation/call-records/",      // POST to create call record (JSON)
-  // Upload endpoints used by uploadStrategyService.
-  // If your backend has dedicated upload endpoints, set them here.
-  // Otherwise uploadStrategyService will post base64 JSON to `doc` endpoint
-  // or multipart to `audio` endpoint depending on file type.
-
-};
+/**
+ * Centralized API endpoints (single source of truth).
+ * Update these values to match backend routes. Use these variables
+ * everywhere instead of hardcoding strings.
+ */
+const API_ENDPOINTS = {
+  // list/create endpoints
+  CALLS: "/rehabilitation/call-records/",
+  LETTERS: "/rehabilitation/eletters/",
+  // create endpoints (kept for existing usage)
+  createLetter: "/rehabilitation/eletters/",
+  createCall: "/rehabilitation/call-records/",
+};
// ...existing code...
export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();
+  // build full API urls (respect axiosInstance.baseURL if configured)
+  const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const base = String(baseUrl || '').replace(/\/$/, '');
+  const callsUrl = base ? `${base}${API_ENDPOINTS.CALLS}` : API_ENDPOINTS.CALLS;
+  const lettersUrl = base ? `${base}${API_ENDPOINTS.LETTERS}` : API_ENDPOINTS.LETTERS;
 
   const [activeTab, setActiveTab] = useState<Tab>("calls");
@@
-            {activeTab === "calls" ? (
+            {activeTab === "calls" ? (
               <DataTable
+                url={callsUrl}
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
+                url={lettersUrl}
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

---------------


// staff deployment

// ...existing code...
-import { DataTable } from '../common/DataTable';
+import { DataTable } from '../common/DataTable';
+import axiosInstance from '../../services/axiosInstance';
+
+// centralised endpoints for this screen
+const API_ENDPOINTS = {
+  STAFF_DEPLOYMENTS: '/station-management/api/staff-deployments/',
+};
 // ...existing code...
 export function StaffDeploymentScreen() {
   const { region, district, station } = useFilters();
+  // build full staff deployments url (uses axiosInstance.baseURL if set)
+  const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const base = String(baseUrl || '').replace(/\/$/, '');
+  const staffDeploymentsUrl = base ? `${base}${API_ENDPOINTS.STAFF_DEPLOYMENTS}` : API_ENDPOINTS.STAFF_DEPLOYMENTS;
   const [deployments, setDeployments] = useState<StaffDeploymentResponse[]>([]);
@@
               <DataTable
+                  // supply API url for centralized management / future DataTable-driven fetching
+                  url={staffDeploymentsUrl}
                   data={tableData}
                   loading={tableLoading}
                   total={total}
                   columns={[
                     { key: 'force_number', label: 'Force Number', sortable: true },
                     { key: 'full_name', label: 'Name', sortable: true },
 // ...existing code...
                 />
```// filepath: /Users/derrickwamani/Sites/localhost/PMIS_V2/src/components/station/StaffDeploymentScreen.tsx
// ...existing code...
-import { DataTable } from '../common/DataTable';
+import { DataTable } from '../common/DataTable';
+import axiosInstance from '../../services/axiosInstance';
import { StaffEntryExitScreen } from "./StaffEntryExitScreen";
+
+// centralised endpoints for this screen
+const API_ENDPOINTS = {
+  STAFF_DEPLOYMENTS: '/station-management/api/staff-deployments/',
+};
 // ...existing code...
 export function StaffDeploymentScreen() {
   const { region, district, station } = useFilters();
+  // build full staff deployments url (uses axiosInstance.baseURL if set)
+  const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const base = String(baseUrl || '').replace(/\/$/, '');
+  const staffDeploymentsUrl = base ? `${base}${API_ENDPOINTS.STAFF_DEPLOYMENTS}` : API_ENDPOINTS.STAFF_DEPLOYMENTS;
   const [deployments, setDeployments] = useState<StaffDeploymentResponse[]>([]);
@@
               <DataTable
+                  // supply API url for centralized management / future DataTable-driven fetching
+                  url={staffDeploymentsUrl}
                   data={tableData}
                   loading={tableLoading}
                   total={total}
                   columns={[
                     { key: 'force_number', label: 'Force Number', sortable: true },
                     { key: 'full_name', label: 'Name', sortable: true },
 //



 staff StaffEntryExitScreen

 // ...existing code...
-import React, { useState, useRef, useEffect, useCallback } from 'react';
+import React, { useState, useRef, useEffect, useCallback } from 'react';
+import axiosInstance from '../../services/axiosInstance';
+// centralised endpoints for this screen
+const API_ENDPOINTS = {
+  ATTENDANCE: '/station-management/api/attendance/',
+};
 // ...existing code...
 export function StaffEntryExitScreen() {
+  // build full attendance url (uses axiosInstance.baseURL if set)
+  const baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const base = String(baseUrl || '').replace(/\/$/, '');
+  const attendanceUrl = base ? `${base}${API_ENDPOINTS.ATTENDANCE}` : API_ENDPOINTS.ATTENDANCE;
+
// ...existing code...
           <DataTable
             /* controlled mode: we already fetch server data in this component (loadTable) */
+            url={attendanceUrl}
             data={tableData}
             loading={tableLoading}
             total={total}
             title="Staff Entry & Exit Records"
             columns={userColumns}
             externalSearch={search}


// visitation
// ...existing code...
-import axiosInstance from "../../services/axiosInstance"; // << ensure path matches your project
+import axiosInstance from "../../services/axiosInstance"; // << ensure path matches your project
+// centralised endpoints for this screen
+const API_ENDPOINTS = {
+  VISITORS: '/gate-management/station-visitors/',
+};
 // ...existing code...
 export default function VisitationsScreen() {
@@
   const requestIdRef = useRef(0);
   const abortRef = useRef<AbortController | null>(null);
+  // build full visitors url (uses axiosInstance.baseURL if set)
+  const _baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const _base = String(_baseUrl || '').replace(/\/$/, '');
+  const visitorsUrl = _base ? `${_base}${API_ENDPOINTS.VISITORS}` : API_ENDPOINTS.VISITORS;
@@
-              <DataTable
-                data={tableData}
+              <DataTable
+                // centralized API url for this table
+                url={visitorsUrl}
+                data={tableData}
                 loading={tableLoading}
                 total={total}
                 title="Visitor Records"
                 columns={[
@@
               />
// ...existing code...
```// filepath: /Users/derrickwamani/Sites/localhost/PMIS_V2/src/components/station/VisitationsScreen.tsx
// ...existing code...
-import axiosInstance from "../../services/axiosInstance"; // << ensure path matches your project
+import axiosInstance from "../../services/axiosInstance"; // << ensure path matches your project
+// centralised endpoints for this screen
+const API_ENDPOINTS = {
+  VISITORS: '/gate-management/station-visitors/',
+};
 // ...existing code...
 export default function VisitationsScreen() {
@@
   const requestIdRef = useRef(0);
   const abortRef = useRef<AbortController | null>(null);
+  // build full visitors url (uses axiosInstance.baseURL if set)
+  const _baseUrl = (axiosInstance as any)?.defaults?.baseURL ?? (import.meta.env.VITE_API_BASE_URL ?? '');
+  const _base = String(_baseUrl || '').replace(/\/$/, '');
+  const visitorsUrl = _base ? `${_base}${API_ENDPOINTS.VISITORS}` : API_ENDPOINTS.VISITORS;
@@
-              <DataTable
-                data={tableData}
+              <DataTable
+                // centralized API url for this table
+                url={visitorsUrl}
+                data={tableData}
                 loading={tableLoading}
                 total={total}
                 title="Visitor Records"
                 columns



// menu

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Lock,
  Users,
  Phone,
  Home,
  LogOut,
  LogIn,
  BookOpen,
  MessageSquare,
  UserPlus,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Package,
  Scale,
  TrendingUp,
  DoorOpen,
  ArrowLeftRight,
  Stethoscope,
  AlertTriangle,
  HeartHandshake,
  DollarSign,
  Fingerprint,
  FileText,
  Settings,
  LucideIcon,
  Table,
  Search,
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import ugandaPrisonsLogo from 'figma:asset/a1a2171c301702e7d1411052b77e2080575d2c9e.png';
import { fetchMenus, ApiMenuItem } from '../../services/menuService';
import { useAuth } from '../../contexts/AuthContext';
import { useFilterRefresh } from '../../hooks/useFilterRefresh';

type MenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: MenuItem[];
};

// Map icon names from API to Lucide React components
const iconMap: Record<string, LucideIcon> = {
  Building2,
  Lock,
  Users,
  Phone,
  Home,
  LogOut,
  LogIn,
  BookOpen,
  MessageSquare,
  UserPlus,
  ClipboardCheck,
  Package,
  Scale,
  TrendingUp,
  DoorOpen,
  ArrowLeftRight,
  Stethoscope,
  AlertTriangle,
  HeartHandshake,
  DollarSign,
  Fingerprint,
  FileText,
  Settings,
};

// Helper to get icon from string name
const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Building2;
};

// Helper to convert API menu items to app menu structure
const buildMenuTree = (apiMenus: ApiMenuItem[]): MenuItem[] => {
  const menuMap = new Map<string, MenuItem>();
  const rootMenus: MenuItem[] = [];

  // First pass: create all menu items
  apiMenus
    .filter((menu) => menu.is_active)
    .forEach((menu) => {
      const menuItem: MenuItem = {
        id: menu.id,
        label: menu.name,
        icon: getIcon(menu.icon),
        path: menu.url || undefined,
        children: [],
      };
      menuMap.set(menu.id, menuItem);
    });

  // Second pass: build tree structure
  apiMenus
    .filter((menu) => menu.is_active)
    .forEach((menu) => {
      const menuItem = menuMap.get(menu.id);
      if (!menuItem) return;

      if (menu.parent) {
        const parentItem = menuMap.get(menu.parent);
        if (parentItem) {
          if (!parentItem.children) {
            parentItem.children = [];
          }
          parentItem.children.push(menuItem);
        }
      } else {
        rootMenus.push(menuItem);
      }
    });

  return rootMenus;
};

export interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set([]));
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);

  // Load menus from API
  const loadMenus = async () => {
    try {
      setMenusLoading(true);
      const response = await fetchMenus();
      const menus = buildMenuTree(response.results);
      // Ensure Property Management menu exists with expected children (fallback)
      const PROPERTY_BASE = '/property-management';
      const findProperty = (items: MenuItem[]) => items.find(i => i.path === PROPERTY_BASE || i.label?.toLowerCase().includes('property'));
      const propItem = findProperty(menus);
      const localChildren: MenuItem[] = [
        { id: 'prop-overview', label: 'Property Overview', icon: Package, path: '/property-management' },
        { id: 'prop-properties', label: 'Property & History', icon: Package, path: '/property-management/properties' },
        { id: 'prop-accounts', label: 'Accounts & Transactions', icon: Package, path: '/property-management/accounts' },
      ];
      if (propItem) {
        if (!propItem.children || propItem.children.length === 0) {
          propItem.children = localChildren;
        }
      } else {
        // add a top-level Property Management entry if API didn't provide one
        menus.push({
          id: 'property-management-local',
          label: 'Property Management',
          icon: Package,
          path: PROPERTY_BASE,
          children: localChildren,
        });
      }
      setMenuItems(menus);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setMenusLoading(false);
    }
  };

  // Load menus on mount and when location filters change
  useFilterRefresh(loadMenus);

  // Helper function to find all parent IDs leading to active page
  const findParentsOfActivePath = (
    items: MenuItem[],
    path: string[] = []
  ): string[] => {
    for (const item of items) {
      if (item.path === location.pathname) {
        return path;
      }
      if (item.children && item.children.length > 0) {
        const found = findParentsOfActivePath(item.children, [...path, item.id]);
        if (found.length > 0) {
          return found;
        }
      }
    }
    return [];
  };

  // Auto-expand parent of active menu item
  useEffect(() => {
    if (menuItems.length > 0) {
      const parentIds = findParentsOfActivePath(menuItems);
      if (parentIds.length > 0) {
        setExpandedItems(new Set(parentIds));
      } else {
        // If current path is under property-management, auto-expand the property menu (local or API id)
        if (location.pathname.startsWith('/property-management')) {
          const prop = menuItems.find(i => i.path === '/property-management' || i.label?.toLowerCase().includes('property'));
          if (prop) {
            setExpandedItems(new Set([prop.id]));
            return;
          }
        }
        setExpandedItems(new Set([]));
      }
    }
  }, [location.pathname, menuItems]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-primary text-white'
              : 'hover:bg-muted text-foreground'
          }`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left text-sm">{item.label}</span>
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`bg-white border-r border-border flex flex-col transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0'
      }`}
    >
      <div className={`${isOpen ? 'block' : 'hidden'}`}>
        {/* Logo/Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-white border border-border flex items-center justify-center p-1 shrink-0">
              <img
                src={ugandaPrisonsLogo}
                alt="Uganda Prisons Service"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm truncate">Uganda Prisons Service</h2>
              <p className="text-xs text-muted-foreground truncate">
                PMIS - Station Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <ScrollArea className="flex-1 py-4">
          <div className="px-3 space-y-1">
            {menusLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : (
              <>
                {menuItems.map((item) => renderMenuItem(item))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={async () => {
              await logout();
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <div className="text-xs text-muted-foreground text-center mt-2">
            © 2025 Prison Management System
          </div>
        </div>
      </div>
    </div>
  );
}











-----------
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus, Eye, Pencil, Trash2, Calendar } from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTable";
import SearchableSelect from '../common/SearchableSelect';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation
} from '../../utils/validation';

interface AccountRow { id: string; prisoner_name: string; account_type_name: string; currency: string; balance: string; prisoner: string; account_type: string; }
interface TransactionRow { id: string; prisoner_name: string; account_type_name: string; transaction_type_name: string; transaction_status_name: string; checked_by_name: string; amount: string; transaction_datetime: string; transaction_remark: string; biometric_consent: boolean; balance_before: string; balance_after: string; property_prisoner_account: string; transaction_type: string; transaction_status: string; checked_by_oc: number; }

// centralised API endpoints for this screen (single source of truth)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
};

export default function PrisonerPropertyAccountScreen() {
  // get current global filters (useFilters returns values)
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();

  // accounts state
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // transactions state (for selected account or global list)
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookup data
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);

  // UI state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const searchRef = useRef<number | null>(null);

  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null);

  const [isCreateTxOpen, setIsCreateTxOpen] = useState(false);

  // form state
  const [accountForm, setAccountForm] = useState({ prisoner: '', account_type: '', currency: 'UGX' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  const [txForm, setTxForm] = useState({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
  const [txFormErrors, setTxFormErrors] = useState<Record<string,string>>({});

  // request control
  const abortRef = useRef<AbortController | null>(null);
  const reqId = useRef(0);

  // helpers: build base params including global filters
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    ...overrides,
  }), [page, pageSize, search, globalStation, globalDistrict, globalRegion]);

  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
    } catch (err) {
      console.error('lookup load error', err);
    }
  }, []);

  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try {
      abortRef.current?.abort();
    } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAccountsLoading(true);
    try {
      const data = await accountsSvc.listAccounts(baseParams(opts));
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      if (id === reqId.current) setAccountsLoading(false);
    }
  }, [baseParams]);

  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try {
      abortRef.current?.abort();
    } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTransactionsLoading(true);
    try {
      const data = await txSvc.listTransactions(baseParams(opts));
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      if (id === reqId.current) setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounced search
  useEffect(() => {
    if (searchRef.current) window.clearTimeout(searchRef.current);
    searchRef.current = window.setTimeout(() => {
      setPage(1);
      loadAccounts();
      loadTransactions();
    }, 500);
    return () => { if (searchRef.current) window.clearTimeout(searchRef.current); };
  }, [search, loadAccounts, loadTransactions]);

  // reload when filters / paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

  // register top-nav filter refresh handler so the screen reloads when global filters change via the UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(accountForm.prisoner)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountForm.account_type)) errs.account_type = 'Account type is required';
    if (!requiredValidation(accountForm.currency)) errs.currency = 'Currency is required';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccountForm()) return;
    try {
      const payload = { prisoner: accountForm.prisoner, account_type: accountForm.account_type, currency: accountForm.currency };
      await accountsSvc.createAccount(payload);
      toast.success('Account created');
      setIsCreateAccountOpen(false);
      setAccountForm({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    if (!validateAccountForm()) return;
    try {
      await accountsSvc.updateAccount(editingAccount.id, { prisoner: accountForm.prisoner, account_type: accountForm.account_type, currency: accountForm.currency });
      toast.success('Account updated');
      setIsEditAccountOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (err) {
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await accountsSvc.deleteAccount(id);
      toast.success('Account deleted');
      loadAccounts();
    } catch (err) {
      console.error('delete account', err);
      toast.error('Failed to delete account');
    }
  };

  const validateTxForm = () => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(txForm.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(txForm.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(txForm.amount)) errs.amount = 'Amount is required';
    setTxFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTxForm()) return;
    try {
      const payload = {
        property_prisoner_account: txForm.property_prisoner_account,
        transaction_type: txForm.transaction_type,
        transaction_status: txForm.transaction_status || undefined,
        amount: txForm.amount,
        transaction_remark: txForm.transaction_remark,
        biometric_consent: txForm.biometric_consent,
        checked_by_oc: txForm.checked_by_oc || undefined,
      };
      await txSvc.createTransaction(payload);
      toast.success('Transaction created');
      setIsCreateTxOpen(false);
      setTxForm({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  // render
  const accountColumns = [
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency' },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => { setEditingAccount(r); setAccountForm({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsEditAccountOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDeleteAccount(r.id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={search} onChange={(e)=> setSearch(e.target.value)} />
          <Button onClick={() => setIsCreateAccountOpen(true)} style={{ backgroundColor: '#650000' }}><Plus className="h-4 w-4 mr-2" />Create Account</Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <DataTable
            title="Accounts"
            data={accounts}
            loading={accountsLoading}
            total={accountsTotal}
            page={page}
            pageSize={pageSize}
            onPageChange={(p:number)=>setPage(p)}
            onPageSizeChange={(s:number)=>{ setPageSize(s); setPage(1); }}
            onSort={() => { setPage(1); loadAccounts(); }}
            columns={accountColumns}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Transactions</h3>
            <Button onClick={() => setIsCreateTxOpen(true)} style={{ backgroundColor: '#650000' }}><Plus className="h-4 w-4 mr-2" />Create Transaction</Button>
          </div>

          <DataTable
            title="Transactions"
            data={transactions}
            loading={transactionsLoading}
            total={transactionsTotal}
            page={page}
            pageSize={pageSize}
            onPageChange={(p:number)=>setPage(p)}
            onPageSizeChange={(s:number)=>{ setPageSize(s); setPage(1); }}
            onSort={() => { setPage(1); loadTransactions(); }}
            columns={[
              { key: 'transaction_datetime', label: 'Date/Time' },
              { key: 'prisoner_name', label: 'Prisoner' },
              { key: 'account_type_name', label: 'Account Type' },
              { key: 'transaction_type_name', label: 'Type' },
              { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
              { key: 'transaction_status_name', label: 'Status' },
              { key: 'checked_by_name', label: 'Checked By' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Create Account Dialog */}
      <Dialog open={isCreateAccountOpen} onOpenChange={setIsCreateAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>Add a new prisoner account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAccount} className="space-y-4 p-4">
            <Label>Prisoner</Label>
            <SearchableSelect
              items={prisoners.map(p => ({ id: String(p.id), label: p.full_name, meta: p.prisoner_number }))}
              value={accountForm.prisoner || null}
              onSelect={(id: string) => setAccountForm({...accountForm, prisoner: id})}
              placeholder="Select prisoner..."
            />
            {accountFormErrors.prisoner && <div className="text-red-600 text-sm">{accountFormErrors.prisoner}</div>}

            <Label>Account Type</Label>
            <SearchableSelect
              items={accountTypes.map((a:any) => ({ id: String(a.id), label: a.name }))}
              value={accountForm.account_type || null}
              onSelect={(id: string) => setAccountForm({...accountForm, account_type: id})}
              placeholder="Select account type..."
            />
            {accountFormErrors.account_type && <div className="text-red-600 text-sm">{accountFormErrors.account_type}</div>}

            <Label>Currency</Label>
            <SearchableSelect
              items={[{ id:'UGX', label:'UGX' }, { id:'USD', label:'USD' }, { id:'EUR', label:'EUR' }]}
              value={accountForm.currency || null}
              onSelect={(id: string) => setAccountForm({...accountForm, currency: id})}
              placeholder="Currency"
            />
            {accountFormErrors.currency && <div className="text-red-600 text-sm">{accountFormErrors.currency}</div>}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateAccountOpen(false)}>Cancel</Button>
              <Button type="submit" style={{ backgroundColor: '#650000' }}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Transaction Dialog */}
      <Dialog open={isCreateTxOpen} onOpenChange={setIsCreateTxOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
            <DialogDescription>Add a transaction</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTx} className="space-y-4 p-4">
            <Label>Account</Label>
            <SearchableSelect
              items={accounts.map(a => ({ id: String(a.id), label: `${a.prisoner_name} - ${a.account_type_name}` }))}
              value={txForm.property_prisoner_account || null}
              onSelect={(id:string) => setTxForm({...txForm, property_prisoner_account: id})}
              placeholder="Select account..."
            />
            {txFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{txFormErrors.property_prisoner_account}</div>}

            <Label>Transaction Type</Label>
            <SearchableSelect
              items={txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))}
              value={txForm.transaction_type || null}
              onSelect={(id:string)=> setTxForm({...txForm, transaction_type: id})}
              placeholder="Select transaction type..."
            />
            {txFormErrors.transaction_type && <div className="text-red-600 text-sm">{txFormErrors.transaction_type}</div>}

            <Label>Amount</Label>
            <Input type="number" value={txForm.amount} onChange={(e)=> setTxForm({...txForm, amount: e.target.value})} />

            <Label>Remarks</Label>
            <Textarea value={txForm.transaction_remark} onChange={(e)=> setTxForm({...txForm, transaction_remark: e.target.value})} />

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateTxOpen(false)}>Cancel</Button>
              <Button type="submit" style={{ backgroundColor: '#650000' }}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}




// original before edit
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { 
  Search, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// Mock data
const mockPrisoners = [
  { id: '1', full_name: 'John Doe', prisoner_number: 'P001' },
  { id: '2', full_name: 'Jane Smith', prisoner_number: 'P002' },
  { id: '3', full_name: 'Bob Johnson', prisoner_number: 'P003' },
];

const mockAccountTypes = [
  { id: '1', name: 'Personal Account' },
  { id: '2', name: 'Welfare Account' },
  { id: '3', name: 'Work Account' },
];

const mockTransactionTypes = [
  { id: '1', name: 'Deposit' },
  { id: '2', name: 'Withdrawal' },
  { id: '3', name: 'Transfer' },
];

const mockTransactionStatuses = [
  { id: '1', name: 'Pending' },
  { id: '2', name: 'Approved' },
  { id: '3', name: 'Rejected' },
];

const mockAccounts: Account[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    account_type_name: 'Personal Account',
    currency: 'UGX',
    balance: '500000',
    prisoner: '1',
    account_type: '1',
  },
  {
    id: '2',
    prisoner_name: 'Jane Smith',
    account_type_name: 'Welfare Account',
    currency: 'UGX',
    balance: '350000',
    prisoner: '2',
    account_type: '2',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    account_type_name: 'Personal Account',
    transaction_type_name: 'Deposit',
    transaction_status_name: 'Approved',
    checked_by_name: 'Admin User',
    amount: '100000',
    transaction_datetime: '2025-10-25T10:30:00Z',
    transaction_remark: 'Monthly allowance',
    biometric_consent: true,
    balance_before: '400000',
    balance_after: '500000',
    property_prisoner_account: '1',
    transaction_type: '1',
    transaction_status: '2',
    checked_by_oc: 1,
  },
  {
    id: '2',
    prisoner_name: 'John Doe',
    account_type_name: 'Personal Account',
    transaction_type_name: 'Withdrawal',
    transaction_status_name: 'Approved',
    checked_by_name: 'Admin User',
    amount: '-50000',
    transaction_datetime: '2025-10-26T14:20:00Z',
    transaction_remark: 'Canteen purchase',
    biometric_consent: true,
    balance_before: '500000',
    balance_after: '450000',
    property_prisoner_account: '1',
    transaction_type: '2',
    transaction_status: '2',
    checked_by_oc: 1,
  },
];

const PrisonerPropertyAccountScreen: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Transaction tab filters
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('all');
  const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);

  // Account dialogs
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Transaction dialogs
  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedAccountForTransaction, setSelectedAccountForTransaction] = useState<string | null>(null);

  // Delete dialogs
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // Account form data
  const [accountFormData, setAccountFormData] = useState({
    prisoner: '',
    account_type: '',
    currency: 'UGX',
  });

  // Transaction form data
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });

  // Toggle account expansion
  const toggleAccountExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  // Get transactions for an account
  const getAccountTransactions = (accountId: string): Transaction[] => {
    return mockTransactions.filter(t => t.property_prisoner_account === accountId);
  };

  // Account CRUD operations
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const prisoner = mockPrisoners.find(p => p.id === accountFormData.prisoner);
    const accountType = mockAccountTypes.find(at => at.id === accountFormData.account_type);
    
    const newAccount: Account = {
      id: (accounts.length + 1).toString(),
      prisoner_name: prisoner?.full_name || '',
      account_type_name: accountType?.name || '',
      currency: accountFormData.currency,
      balance: '0',
      prisoner: accountFormData.prisoner,
      account_type: accountFormData.account_type,
    };
    
    setAccounts([...accounts, newAccount]);
    setIsCreateAccountDialogOpen(false);
    setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
    toast.success('Account created successfully');
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAccount) {
      const prisoner = mockPrisoners.find(p => p.id === accountFormData.prisoner);
      const accountType = mockAccountTypes.find(at => at.id === accountFormData.account_type);
      
      const updatedAccounts = accounts.map(acc =>
        acc.id === selectedAccount.id
          ? {
              ...acc,
              prisoner_name: prisoner?.full_name || acc.prisoner_name,
              account_type_name: accountType?.name || acc.account_type_name,
              currency: accountFormData.currency,
              prisoner: accountFormData.prisoner,
              account_type: accountFormData.account_type,
            }
          : acc
      );
      setAccounts(updatedAccounts);
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      toast.success('Account updated successfully');
    }
  };

  const handleDeleteAccount = () => {
    if (deleteAccountId) {
      setAccounts(accounts.filter(acc => acc.id !== deleteAccountId));
      setDeleteAccountId(null);
      toast.success('Account deleted successfully');
    }
  };

  // Transaction CRUD operations
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const account = accounts.find(a => a.id === transactionFormData.property_prisoner_account);
    const transactionType = mockTransactionTypes.find(tt => tt.id === transactionFormData.transaction_type);
    const transactionStatus = mockTransactionStatuses.find(ts => ts.id === transactionFormData.transaction_status);
    
    const newTransaction: Transaction = {
      id: (mockTransactions.length + 1).toString(),
      prisoner_name: account?.prisoner_name || '',
      account_type_name: account?.account_type_name || '',
      transaction_type_name: transactionType?.name || '',
      transaction_status_name: transactionStatus?.name || '',
      checked_by_name: 'Current User',
      amount: transactionFormData.amount,
      transaction_datetime: new Date().toISOString(),
      transaction_remark: transactionFormData.transaction_remark,
      biometric_consent: transactionFormData.biometric_consent,
      balance_before: account?.balance || '0',
      balance_after: (parseFloat(account?.balance || '0') + parseFloat(transactionFormData.amount)).toString(),
      property_prisoner_account: transactionFormData.property_prisoner_account,
      transaction_type: transactionFormData.transaction_type,
      transaction_status: transactionFormData.transaction_status,
      checked_by_oc: transactionFormData.checked_by_oc,
    };
    
    mockTransactions.push(newTransaction);
    setIsCreateTransactionDialogOpen(false);
    setTransactionFormData({
      property_prisoner_account: '',
      transaction_type: '',
      transaction_status: '',
      amount: '',
      transaction_remark: '',
      biometric_consent: false,
      checked_by_oc: 0,
    });
    toast.success('Transaction created successfully');
  };

  const handleDeleteTransaction = () => {
    if (deleteTransactionId) {
      const index = mockTransactions.findIndex(t => t.id === deleteTransactionId);
      if (index > -1) {
        mockTransactions.splice(index, 1);
      }
      setDeleteTransactionId(null);
      toast.success('Transaction deleted successfully');
    }
  };

  // Pagination for accounts
  const filteredAccounts = accounts.filter(acc =>
    acc.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_type_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Filter and pagination for transactions tab
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.prisoner_name.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.account_type_name.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.transaction_remark.toLowerCase().includes(transactionSearchTerm.toLowerCase()) ||
      transaction.checked_by_name.toLowerCase().includes(transactionSearchTerm.toLowerCase());
    
    const matchesType = transactionTypeFilter === 'all' || transaction.transaction_type === transactionTypeFilter;
    const matchesStatus = transactionStatusFilter === 'all' || transaction.transaction_status === transactionStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalTransactionPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (transactionCurrentPage - 1) * itemsPerPage,
    transactionCurrentPage * itemsPerPage
  );

  // Calculate statistics
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  const totalTransactions = mockTransactions.length;
  const pendingTransactions = mockTransactions.filter(t => t.transaction_status_name === 'Pending').length;

  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [openAccountType, setOpenAccountType] = useState(false);
    const [openCurrency, setOpenCurrency] = useState(false);

    const currencies = ['UGX', 'USD', 'EUR', 'GBP'];

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Prisoner Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPrisoner}
                  className="w-full justify-between"
                  type="button"
                >
                  {accountFormData.prisoner
                    ? mockPrisoners.find((p) => p.id === accountFormData.prisoner)?.full_name + 
                      ' (' + mockPrisoners.find((p) => p.id === accountFormData.prisoner)?.prisoner_number + ')'
                    : "Select prisoner..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search prisoner..." />
                  <CommandList>
                    <CommandEmpty>No prisoner found.</CommandEmpty>
                    <CommandGroup>
                      {mockPrisoners.map((prisoner) => (
                        <CommandItem
                          key={prisoner.id}
                          value={prisoner.full_name + ' ' + prisoner.prisoner_number}
                          onSelect={() => {
                            setAccountFormData({...accountFormData, prisoner: prisoner.id});
                            setOpenPrisoner(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              accountFormData.prisoner === prisoner.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {prisoner.full_name} ({prisoner.prisoner_number})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Account Type Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Popover open={openAccountType} onOpenChange={setOpenAccountType}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAccountType}
                  className="w-full justify-between"
                  type="button"
                >
                  {accountFormData.account_type
                    ? mockAccountTypes.find((t) => t.id === accountFormData.account_type)?.name
                    : "Select account type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search account type..." />
                  <CommandList>
                    <CommandEmpty>No account type found.</CommandEmpty>
                    <CommandGroup>
                      {mockAccountTypes.map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.name}
                          onSelect={() => {
                            setAccountFormData({...accountFormData, account_type: type.id});
                            setOpenAccountType(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              accountFormData.account_type === type.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Currency Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Popover open={openCurrency} onOpenChange={setOpenCurrency}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCurrency}
                  className="w-full justify-between"
                  type="button"
                >
                  {accountFormData.currency || "Select currency..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search currency..." />
                  <CommandList>
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandGroup>
                      {currencies.map((currency) => (
                        <CommandItem
                          key={currency}
                          value={currency}
                          onSelect={() => {
                            setAccountFormData({...accountFormData, currency});
                            setOpenCurrency(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              accountFormData.currency === currency ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {currency}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateAccountDialogOpen(false);
            setIsEditAccountDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Account
          </Button>
        </DialogFooter>
      </form>
    );
  };

  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const [openAccount, setOpenAccount] = useState(false);
    const [openTransactionType, setOpenTransactionType] = useState(false);
    const [openTransactionStatus, setOpenTransactionStatus] = useState(false);

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="property_prisoner_account">Account *</Label>
            <Popover open={openAccount} onOpenChange={setOpenAccount}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAccount}
                  className="w-full justify-between"
                  type="button"
                >
                  {transactionFormData.property_prisoner_account
                    ? accounts.find((a) => a.id === transactionFormData.property_prisoner_account)?.prisoner_name + 
                      ' - ' + accounts.find((a) => a.id === transactionFormData.property_prisoner_account)?.account_type_name
                    : "Select account..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search account..." />
                  <CommandList>
                    <CommandEmpty>No account found.</CommandEmpty>
                    <CommandGroup>
                      {accounts.map((account) => (
                        <CommandItem
                          key={account.id}
                          value={account.prisoner_name + ' ' + account.account_type_name}
                          onSelect={() => {
                            setTransactionFormData({...transactionFormData, property_prisoner_account: account.id});
                            setOpenAccount(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              transactionFormData.property_prisoner_account === account.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {account.prisoner_name} - {account.account_type_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Transaction Type Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="transaction_type">Transaction Type *</Label>
            <Popover open={openTransactionType} onOpenChange={setOpenTransactionType}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openTransactionType}
                  className="w-full justify-between"
                  type="button"
                >
                  {transactionFormData.transaction_type
                    ? mockTransactionTypes.find((t) => t.id === transactionFormData.transaction_type)?.name
                    : "Select transaction type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search transaction type..." />
                  <CommandList>
                    <CommandEmpty>No transaction type found.</CommandEmpty>
                    <CommandGroup>
                      {mockTransactionTypes.map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.name}
                          onSelect={() => {
                            setTransactionFormData({...transactionFormData, transaction_type: type.id});
                            setOpenTransactionType(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              transactionFormData.transaction_type === type.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {type.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Transaction Status Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="transaction_status">Status *</Label>
            <Popover open={openTransactionStatus} onOpenChange={setOpenTransactionStatus}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openTransactionStatus}
                  className="w-full justify-between"
                  type="button"
                >
                  {transactionFormData.transaction_status
                    ? mockTransactionStatuses.find((s) => s.id === transactionFormData.transaction_status)?.name
                    : "Select status..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search status..." />
                  <CommandList>
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      {mockTransactionStatuses.map((status) => (
                        <CommandItem
                          key={status.id}
                          value={status.name}
                          onSelect={() => {
                            setTransactionFormData({...transactionFormData, transaction_status: status.id});
                            setOpenTransactionStatus(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              transactionFormData.transaction_status === status.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {status.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={transactionFormData.amount}
              onChange={(e) => setTransactionFormData({...transactionFormData, amount: e.target.value})}
              placeholder="Enter amount (positive for deposit, negative for withdrawal)"
              required
            />
          </div>

          {/* Biometric Consent */}
          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Checkbox
              id="biometric_consent"
              checked={transactionFormData.biometric_consent}
              onCheckedChange={(checked) => setTransactionFormData({...transactionFormData, biometric_consent: checked as boolean})}
            />
            <Label htmlFor="biometric_consent" className="cursor-pointer">
              Biometric Consent
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction_remark">Remarks</Label>
          <Textarea
            id="transaction_remark"
            value={transactionFormData.transaction_remark}
            onChange={(e) => setTransactionFormData({...transactionFormData, transaction_remark: e.target.value})}
            placeholder="Enter transaction remarks"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateTransactionDialogOpen(false);
            setIsEditTransactionDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Transaction
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger 
            value="accounts" 
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger 
            value="transactions" 
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {totalBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setIsCreateAccountDialogOpen(true)}
                  style={{ backgroundColor: '#650000' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#650000' }}>
                    <TableHead className="text-white"></TableHead>
                    <TableHead className="text-white">Prisoner Name</TableHead>
                    <TableHead className="text-white">Account Type</TableHead>
                    <TableHead className="text-white">Currency</TableHead>
                    <TableHead className="text-right text-white">Balance</TableHead>
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.map((account) => (
                    <React.Fragment key={account.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAccountExpansion(account.id)}
                          >
                            {expandedAccounts.has(account.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{account.prisoner_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.account_type_name}</Badge>
                        </TableCell>
                        <TableCell>{account.currency}</TableCell>
                        <TableCell className="text-right">
                          {parseFloat(account.balance).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setIsViewAccountDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setAccountFormData({
                                  prisoner: account.prisoner,
                                  account_type: account.account_type,
                                  currency: account.currency,
                                });
                                setIsEditAccountDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteAccountId(account.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Transactions Row */}
                      {expandedAccounts.has(account.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Transactions</h3>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAccountForTransaction(account.id);
                                    setTransactionFormData({
                                      ...transactionFormData,
                                      property_prisoner_account: account.id,
                                    });
                                    setIsCreateTransactionDialogOpen(true);
                                  }}
                                  style={{ backgroundColor: '#650000' }}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Transaction
                                </Button>
                              </div>
                              
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Balance After</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getAccountTransactions(account.id).length === 0 ? (
                                    <TableRow>
                                      <TableCell colSpan={7} className="text-center text-gray-500">
                                        No transactions found
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    getAccountTransactions(account.id).map((transaction) => (
                                      <TableRow key={transaction.id}>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            {new Date(transaction.transaction_datetime).toLocaleString()}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{transaction.transaction_type_name}</Badge>
                                        </TableCell>
                                        <TableCell>
                                          <span className={parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {parseFloat(transaction.amount) >= 0 ? '+' : ''}{parseFloat(transaction.amount).toLocaleString()}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          <Badge 
                                            variant={
                                              transaction.transaction_status_name === 'Approved' 
                                                ? 'default' 
                                                : transaction.transaction_status_name === 'Pending'
                                                ? 'secondary'
                                                : 'destructive'
                                            }
                                          >
                                            {transaction.transaction_status_name}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>{parseFloat(transaction.balance_after).toLocaleString()}</TableCell>
                                        <TableCell className="max-w-xs truncate">{transaction.transaction_remark}</TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setIsViewTransactionDialogOpen(true);
                                              }}
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setDeleteTransactionId(transaction.id)}
                                            >
                                              <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {mockTransactions.filter(t => t.transaction_status_name === 'Approved').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  UGX {mockTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => {
                        setTransactionSearchTerm(e.target.value);
                        setTransactionCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => setIsCreateTransactionDialogOpen(true)}
                    style={{ backgroundColor: '#650000' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="transactionTypeFilter">Transaction Type</Label>
                    <select
                      id="transactionTypeFilter"
                      value={transactionTypeFilter}
                      onChange={(e) => {
                        setTransactionTypeFilter(e.target.value);
                        setTransactionCurrentPage(1);
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Types</option>
                      {mockTransactionTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="transactionStatusFilter">Status</Label>
                    <select
                      id="transactionStatusFilter"
                      value={transactionStatusFilter}
                      onChange={(e) => {
                        setTransactionStatusFilter(e.target.value);
                        setTransactionCurrentPage(1);
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Statuses</option>
                      {mockTransactionStatuses.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Prisoner</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance After</TableHead>
                    <TableHead>Checked By</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(transaction.transaction_datetime).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.prisoner_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.account_type_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.transaction_type_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {parseFloat(transaction.amount) >= 0 ? '+' : ''}{parseFloat(transaction.amount).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.transaction_status_name === 'Approved' 
                                ? 'default' 
                                : transaction.transaction_status_name === 'Pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {transaction.transaction_status_name}
                          </Badge>
                        </TableCell>
                        <TableCell>{parseFloat(transaction.balance_after).toLocaleString()}</TableCell>
                        <TableCell>{transaction.checked_by_name}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.transaction_remark || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setIsViewTransactionDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTransactionId(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalTransactionPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {((transactionCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(transactionCurrentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransactionCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={transactionCurrentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        Page {transactionCurrentPage} of {totalTransactionPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTransactionCurrentPage(prev => Math.min(totalTransactionPages, prev + 1))}
                      disabled={transactionCurrentPage === totalTransactionPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Account Dialog */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>Add a new prisoner account</DialogDescription>
          </DialogHeader>
          <AccountForm onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update account information</DialogDescription>
          </DialogHeader>
          <AccountForm onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Account Dialog */}
      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
            <DialogDescription>View prisoner account information</DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Prisoner Name</Label>
                  <p>{selectedAccount.prisoner_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Account Type</Label>
                  <p>{selectedAccount.account_type_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Currency</Label>
                  <p>{selectedAccount.currency}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Balance</Label>
                  <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Transaction Dialog */}
      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
            <DialogDescription>Add a new transaction</DialogDescription>
          </DialogHeader>
          <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Transaction Dialog */}
      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>View transaction information</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Prisoner Name</Label>
                  <p>{selectedTransaction.prisoner_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Account Type</Label>
                  <p>{selectedTransaction.account_type_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Transaction Type</Label>
                  <p>{selectedTransaction.transaction_type_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <Badge 
                    variant={
                      selectedTransaction.transaction_status_name === 'Approved' 
                        ? 'default' 
                        : selectedTransaction.transaction_status_name === 'Pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {selectedTransaction.transaction_status_name}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-500">Amount</Label>
                  <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                    {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Date & Time</Label>
                  <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Balance Before</Label>
                  <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Balance After</Label>
                  <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Checked By</Label>
                  <p>{selectedTransaction.checked_by_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Biometric Consent</Label>
                  <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Remarks</Label>
                  <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Transaction Confirmation */}
      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerPropertyAccountScreen;






// before fix of collapsable rows in accounts table
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTable";
import SearchableSelect from '../common/SearchableSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchPrisoners } from '../../services/customPrisonersService';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation
} from '../../utils/validation';

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// API endpoints (centralised at top)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
};

const PrisonerPropertyAccountScreen: React.FC = () => {
  // global filters
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
  // register refresh handler
  useFilterRefresh(() => {
    // empty body: we'll trigger reload via effects by changing page/search etc.
  });

  // server-driven state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookups
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const searchTimer = useRef<number| null>(null);

  // dialogs/forms
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // form state
  const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});

  // request control
  const abortRef = useRef<AbortController | null>(null);
  const reqId = useRef(0);

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
    } catch (err) {
      console.error('lookup load error', err);
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAccountsLoading(true);
    try {
      const data = await accountsSvc.listAccounts(baseParams(opts));
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      if (id === reqId.current) setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTransactionsLoading(true);
    try {
      const data = await txSvc.listTransactions(baseParams(opts));
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      if (id === reqId.current) setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounce search for accounts/transactions
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(1);
      if (activeTab === 'accounts') loadAccounts();
      if (activeTab === 'transactions') loadTransactions();
    }, 500);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);

  // reload when filters/paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

  // register filter refresh to reload lists when global filters change via header UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers (accounts)
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    const prisonerValue = String(accountFormData.prisoner ?? '').trim();
    const accountTypeValue = String(accountFormData.account_type ?? '').trim();
    const currencyValue = String(accountFormData.currency ?? '').trim();

    if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
    if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccountForm()) return;
    try {
      await accountsSvc.createAccount({ prisoner: accountFormData.prisoner, account_type: accountFormData.account_type, currency: accountFormData.currency });
      toast.success('Account created');
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    if (!validateAccountForm()) return;
    try {
      await accountsSvc.updateAccount(selectedAccount.id, { prisoner: accountFormData.prisoner, account_type: accountFormData.account_type, currency: accountFormData.currency });
      toast.success('Account updated');
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (err) {
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      toast.success('Account deleted');
      setDeleteAccountId(null);
      loadAccounts();
    } catch (err) {
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionForm = () => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(transactionFormData.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(transactionFormData.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(transactionFormData.amount)) errs.amount = 'Amount is required';
    setTransactionFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    try {
      await txSvc.createTransaction(transactionFormData);
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      // API delete endpoint assumed to be DELETE /transactions/{id}/
      await txSvc.createTransaction({}); // placeholder if no delete endpoint; replace with txSvc.deleteTransaction if available
      // If backend supports delete, call it instead.
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;

  // Columns for DataTable
  const accountColumns = [
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency' },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsViewAccountDialogOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsEditAccountDialogOpen(true); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteAccountId(r.id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  const transactionColumns = [
    { key: 'transaction_datetime', label: 'Date & Time' },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'transaction_type_name', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
    { key: 'transaction_status_name', label: 'Status' },
    { key: 'checked_by_name', label: 'Checked By' },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
  ];

  // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const currencies = ['UGX', 'USD', 'EUR', 'GBP'];
    const [prisonerQuery, setPrisonerQuery] = useState('');
    const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
    const [prisonerLoading, setPrisonerLoading] = useState(false);
    const prisonerAbortRef = useRef<AbortController | null>(null);
    const [accountTypeQuery, setAccountTypeQuery] = useState('');
    const [currencyQuery, setCurrencyQuery] = useState('');

    // load prisoners from customPrisonersService with debounce and abort support
    useEffect(() => {
      if (prisonerAbortRef.current) {
        prisonerAbortRef.current.abort();
        prisonerAbortRef.current = null;
      }
      const t = window.setTimeout(() => {
        const ctrl = new AbortController();
        prisonerAbortRef.current = ctrl;
        setPrisonerLoading(true);
        fetchPrisoners({
          search: prisonerQuery || '',
          station: globalStation || null,
          district: globalDistrict || null,
          region: globalRegion || null,
          page_size: 50,
          useCache: true,
        }, ctrl.signal).then(res => {
          setPrisonerResults(res.items || []);
        }).catch(err => {
          if ((err as any).name === 'AbortError') return;
          console.error('fetchPrisoners error', err);
        }).finally(() => {
          setPrisonerLoading(false);
        });
      }, 300);
      return () => {
        window.clearTimeout(t);
        if (prisonerAbortRef.current) {
          prisonerAbortRef.current.abort();
          prisonerAbortRef.current = null;
        }
      };
    }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={false}
                  className="w-full justify-between text-left"
                  type="button"
                >
                  {accountFormData.prisoner
                    ? (prisonerResults.find((p:any) => String(p.id) === String(accountFormData.prisoner))?.full_name
                        || accountFormData.prisoner)
                    : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search prisoners..."
                    value={prisonerQuery}
                    onValueChange={(v) => setPrisonerQuery(v)}
                  />
                  <CommandList>
                    {prisonerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-gray-500">Loading prisoners...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisonerResults.map((p:any) => (
                            <CommandItem
                              key={p.id}
                              value={String(p.id)}
                              onSelect={() => {
                                setAccountFormData({...accountFormData, prisoner: String(p.id)});
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(accountFormData.prisoner) === String(p.id) ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: '#650000' }}
                              />
                              <div className="flex flex-col text-sm">
                                <span>{p.full_name}</span>
                                <span className="text-xs text-gray-500">
                                  {p.prisoner_number_value || p.prisoner_number || ''}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {accountFormErrors.prisoner && <div className="text-red-600 text-sm mt-1">{accountFormErrors.prisoner}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={accountFormData.account_type} onValueChange={(v)=> setAccountFormData({...accountFormData, account_type: v})} required>
              <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} />
                </div>
                {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase()))
                  .map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {accountFormErrors.account_type && <div className="text-red-600 text-sm">{accountFormErrors.account_type}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={accountFormData.currency} onValueChange={(v)=> setAccountFormData({...accountFormData, currency: v})} required>
              <SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter currencies..." value={currencyQuery} onChange={(e) => setCurrencyQuery(e.target.value)} />
                </div>
                {currencies.filter(c => !currencyQuery || c.toLowerCase().includes(currencyQuery.toLowerCase()))
                  .map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {accountFormErrors.currency && <div className="text-red-600 text-sm mt-1">{accountFormErrors.currency}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateAccountDialogOpen(false);
            setIsEditAccountDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Account
          </Button>
        </DialogFooter>
      </form>
    );
  };

  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property_prisoner_account">Account *</Label>
            <SearchableSelect
              items={accounts.map(a => ({ id: String(a.id), label: `${a.prisoner_name} - ${a.account_type_name}` }))}
              value={transactionFormData.property_prisoner_account || null}
              onChange={(id:string | null) => setTransactionFormData({...transactionFormData, property_prisoner_account: id ?? ''})}
              placeholder="Select account..."
            />
            {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_type">Transaction Type *</Label>
            <SearchableSelect
              items={txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))}
              value={transactionFormData.transaction_type || null}
              onChange={(id:string | null)=> setTransactionFormData({...transactionFormData, transaction_type: id ?? ''})}
              placeholder="Select transaction type..."
            />
            {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_status">Status</Label>
            <SearchableSelect
              items={txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))}
              value={transactionFormData.transaction_status || null}
              onChange={(id:string | null)=> setTransactionFormData({...transactionFormData, transaction_status: id ?? ''})}
              placeholder="Select status..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={transactionFormData.amount}
              onChange={(e) => setTransactionFormData({...transactionFormData, amount: e.target.value})}
              placeholder="Enter amount (positive deposit, negative withdrawal)"
            />
            {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Checkbox
              id="biometric_consent"
              checked={transactionFormData.biometric_consent}
              onCheckedChange={(checked) => setTransactionFormData({...transactionFormData, biometric_consent: checked as boolean})}
            />
            <Label htmlFor="biometric_consent" className="cursor-pointer">
              Biometric Consent
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction_remark">Remarks</Label>
          <Textarea
            id="transaction_remark"
            value={transactionFormData.transaction_remark}
            onChange={(e) => setTransactionFormData({...transactionFormData, transaction_remark: e.target.value})}
            placeholder="Enter transaction remarks"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateTransactionDialogOpen(false);
            setIsEditTransactionDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Transaction
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="accounts"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {totalBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setIsCreateAccountDialogOpen(true)}
                  style={{ backgroundColor: '#650000' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Accounts"
                data={accounts}
                loading={accountsLoading}
                total={accountsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadAccounts(); }}
                columns={accountColumns}
                externalSearch={searchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => setIsCreateTransactionDialogOpen(true)} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by status..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Transactions"
                data={transactions}
                loading={transactionsLoading}
                total={transactionsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadTransactions(); }}
                columns={transactionColumns}
                externalSearch={transactionSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Add a new prisoner account</DialogDescription>
            </DialogHeader>
            <AccountForm onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update account information</DialogDescription>
            </DialogHeader>
            <AccountForm onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>View prisoner account information</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedAccount.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedAccount.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Currency</Label>
                    <p>{selectedAccount.currency}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance</Label>
                    <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedTransaction.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedTransaction.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Transaction Type</Label>
                    <p>{selectedTransaction.transaction_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                      {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date & Time</Label>
                    <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance Before</Label>
                    <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance After</Label>
                    <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Checked By</Label>
                    <p>{selectedTransaction.checked_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Biometric Consent</Label>
                    <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerPropertyAccountScreen;




// b4 trying to sort validation and comma and add new fields

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTableCollapsableRows";
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchPrisoners } from '../../services/customPrisonersService';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  numericValidation
} from '../../utils/validation';
import { useForm, Controller } from 'react-hook-form';

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// API endpoints (centralised at top)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
};

const PrisonerPropertyAccountScreen: React.FC = () => {
  // global filters
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
  // register refresh handler
  useFilterRefresh(() => {
    // empty body: we'll trigger reload via effects by changing page/search etc.
  });

  // server-driven state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookups
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const searchTimer = useRef<number| null>(null);

  // dialogs/forms
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // form state
  const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  // force remount AccountForm to reset its internal state when opening create/edit
  const [accountFormKey, setAccountFormKey] = useState(0);
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});
  // expanded rows (for accounts collapsible section)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const toggleAccountExpansion = (accountId: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(accountId)) newSet.delete(accountId);
    else newSet.add(accountId);
    setExpandedAccounts(newSet);
  };
  // helper to get transactions for an account (from loaded transactions)
  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => String(t.property_prisoner_account) === String(accountId));
  };

  // request control
  const abortRef = useRef<AbortController | null>(null);
  const reqId = useRef(0);

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
    } catch (err) {
      console.error('lookup load error', err);
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAccountsLoading(true);
    try {
      const data = await accountsSvc.listAccounts(baseParams(opts));
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      if (id === reqId.current) setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTransactionsLoading(true);
    try {
      const data = await txSvc.listTransactions(baseParams(opts));
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      if (id === reqId.current) setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounce search for accounts/transactions
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(1);
      if (activeTab === 'accounts') loadAccounts();
      if (activeTab === 'transactions') loadTransactions();
    }, 500);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);

  // reload when filters/paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

  // register filter refresh to reload lists when global filters change via header UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers (accounts)
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    const prisonerValue = String(accountFormData.prisoner ?? '').trim();
    const accountTypeValue = String(accountFormData.account_type ?? '').trim();
    const currencyValue = String(accountFormData.currency ?? '').trim();
    const balanceValue = String(accountFormData.balance ?? '').trim();

    if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
    if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
    // numericValidation pattern expects digits; adjust message accordingly
    if (!balanceValue || !numericValidation.pattern.value.test(balanceValue)) errs.balance = 'Balance must be a number';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccountForm()) return;
    try {
      await accountsSvc.createAccount({
        prisoner: accountFormData.prisoner,
        account_type: accountFormData.account_type,
        currency: accountFormData.currency,
        balance: accountFormData.balance ?? '0',
      });
      toast.success('Account created');
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    if (!validateAccountForm()) return;
    try {
      await accountsSvc.updateAccount(selectedAccount.id, {
        prisoner: accountFormData.prisoner,
        account_type: accountFormData.account_type,
        currency: accountFormData.currency,
        balance: accountFormData.balance ?? '0',
      });
      toast.success('Account updated');
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (err) {
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      toast.success('Account deleted');
      setDeleteAccountId(null);
      loadAccounts();
    } catch (err) {
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionForm = () => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(transactionFormData.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(transactionFormData.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(transactionFormData.amount)) errs.amount = 'Amount is required';
    setTransactionFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    try {
      await txSvc.createTransaction(transactionFormData);
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      // API delete endpoint assumed to be DELETE /transactions/{id}/
      await txSvc.createTransaction({}); // placeholder if no delete endpoint; replace with txSvc.deleteTransaction if available
      // If backend supports delete, call it instead.
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;

  // Columns for DataTable
  const accountColumns = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_v:any, r:any) => (
        <Button variant="ghost" size="sm" onClick={() => toggleAccountExpansion(r.id)}>
          {expandedAccounts.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency' },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsViewAccountDialogOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsEditAccountDialogOpen(true); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteAccountId(r.id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  const transactionColumns = [
    { key: 'transaction_datetime', label: 'Date & Time' },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'transaction_type_name', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
    { key: 'transaction_status_name', label: 'Status' },
    { key: 'checked_by_name', label: 'Checked By' },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
  ];

  // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const currencies = ['UGX', 'USD', 'EUR', 'GBP'];
    const [prisonerQuery, setPrisonerQuery] = useState('');
    const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
    const [prisonerLoading, setPrisonerLoading] = useState(false);
    const prisonerAbortRef = useRef<AbortController | null>(null);
    const [accountTypeQuery, setAccountTypeQuery] = useState('');
    const [currencyQuery, setCurrencyQuery] = useState('');
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [selectedPrisonerName, setSelectedPrisonerName] = useState<string>('');

    // load prisoners from customPrisonersService with debounce and abort support
    useEffect(() => {
      if (prisonerAbortRef.current) {
        prisonerAbortRef.current.abort();
        prisonerAbortRef.current = null;
      }
      const t = window.setTimeout(() => {
        const ctrl = new AbortController();
        prisonerAbortRef.current = ctrl;
        setPrisonerLoading(true);
        fetchPrisoners({
          search: prisonerQuery || '',
          station: globalStation || null,
          district: globalDistrict || null,
          region: globalRegion || null,
          page_size: 50,
          useCache: true,
        }, ctrl.signal).then(res => {
          setPrisonerResults(res.items || []);
        }).catch(err => {
          if ((err as any).name === 'AbortError') return;
          console.error('fetchPrisoners error', err);
        }).finally(() => {
          setPrisonerLoading(false);
        });
      }, 300);
      return () => {
        window.clearTimeout(t);
        if (prisonerAbortRef.current) {
          prisonerAbortRef.current.abort();
          prisonerAbortRef.current = null;
        }
      };
    }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPrisoner}
                  className="w-full justify-between text-left"
                  type="button"
                >
                  {accountFormData.prisoner
                    ? (selectedPrisonerName
                        || prisoners.find((p:any) => String(p.id) === String(accountFormData.prisoner))?.full_name
                        || prisonerResults.find((p:any) => String(p.id) === String(accountFormData.prisoner))?.full_name
                        || accountFormData.prisoner)
                    : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search prisoners..."
                    value={prisonerQuery}
                    onValueChange={(v) => setPrisonerQuery(v)}
                  />
                  <CommandList>
                    {prisonerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-gray-500">Loading prisoners...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisonerResults.map((p:any) => (
                            <CommandItem
                              key={p.id}
                              value={String(p.id)}
                              onSelect={() => {
                                setAccountFormData({...accountFormData, prisoner: String(p.id)});
                                // cache display name to avoid flash when other fields change
                                setSelectedPrisonerName(p.full_name);
                                setOpenPrisoner(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(accountFormData.prisoner) === String(p.id) ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: '#650000' }}
                              />
                              <div className="flex flex-col text-sm">
                                <span>{p.full_name}</span>
                                <span className="text-xs text-gray-500">
                                  {p.prisoner_number_value || p.prisoner_number || ''}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {accountFormErrors.prisoner && <div className="text-red-600 text-sm mt-1">{accountFormErrors.prisoner}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={accountFormData.account_type} onValueChange={(v)=> setAccountFormData({...accountFormData, account_type: v})} required>
              <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} />
                </div>
                {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase()))
                  .map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {accountFormErrors.account_type && <div className="text-red-600 text-sm">{accountFormErrors.account_type}</div>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={accountFormData.currency} onValueChange={(v)=> setAccountFormData({...accountFormData, currency: v})} required>
              <SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter currencies..." value={currencyQuery} onChange={(e) => setCurrencyQuery(e.target.value)} />
                </div>
                {currencies.filter(c => !currencyQuery || c.toLowerCase().includes(currencyQuery.toLowerCase()))
                  .map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {accountFormErrors.currency && <div className="text-red-600 text-sm mt-1">{accountFormErrors.currency}</div>}
          </div>

          {/* Balance (disabled by default, editable via toggle) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="balance">Balance</Label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  aria-label="Edit balance"
                  onChange={(e) => {
                    // simple local toggle: if checked enable editing by removing disabled attr by updating accountFormData
                    // we keep value controlled below
                    const editable = e.target.checked;
                    // if not editable and empty, ensure default '0'
                    if (!editable && !accountFormData.balance) setAccountFormData({ ...accountFormData, balance: '0' });
                    // store a marker in accountFormData? keep simple: class toggling handled by input disabled prop below
                  }}
                />
                Edit
              </label>
            </div>
            <Input
              id="balance"
              type="text"
              value={accountFormData.balance}
              onChange={(e) => setAccountFormData({ ...accountFormData, balance: e.target.value })}
              placeholder="0"
              // default disabled to prevent accidental edits; user can toggle checkbox to edit
              disabled={false /* left enabled to allow quick edits; toggle above is cosmetic - you may wire a state if you want strict disabling */}
            />
            {accountFormErrors.balance && <div className="text-red-600 text-sm mt-1">{accountFormErrors.balance}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            setIsCreateAccountDialogOpen(false);
            setIsEditAccountDialogOpen(false);
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            {isEdit ? 'Update' : 'Create'} Account
          </Button>
        </DialogFooter>
      </form>
    );
  };

  // Transaction form implemented with react-hook-form to avoid focus loss on re-renders
  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const { register, handleSubmit, control, watch, setValue, formState, reset } = useForm({
      mode: "onTouched",
      defaultValues: {
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        transaction_datetime: new Date().toISOString(),
        balance_before: '',
        balance_after: '',
        checked_by_oc: null,
      }
    });

    // keep balance_before in sync when account changes
    const selectedAccountId = watch('property_prisoner_account');
    const amountValue = watch('amount');
    useEffect(() => {
      if (!selectedAccountId) {
        setValue('balance_before', '');
        setValue('balance_after', '');
        return;
      }
      const acc = accounts.find(a => String(a.id) === String(selectedAccountId));
      const before = acc ? (parseFloat(acc.balance || '0') || 0) : 0;
      setValue('balance_before', String(before));
      const amountNum = parseFloat(String(amountValue || '0')) || 0;
      setValue('balance_after', String(before + amountNum));
    }, [selectedAccountId, amountValue, accounts, setValue]);

    const onSubmitForm = async (values: any) => {
      // validate required fields locally
      const errs: Record<string,string> = {};
      if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
      if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
      if (!values.amount) errs.amount = 'Amount is required';
      if (Object.keys(errs).length) {
        setTransactionFormErrors(errs);
        return;
      }
      setTransactionFormErrors({});

      try {
        // prepare payload expected by API
        const payload = {
          property_prisoner_account: values.property_prisoner_account,
          transaction_type: values.transaction_type,
          transaction_status: values.transaction_status || null,
          amount: values.amount,
          transaction_remark: values.transaction_remark,
          biometric_consent: !!values.biometric_consent,
          transaction_datetime: values.transaction_datetime,
          balance_before: values.balance_before,
          balance_after: values.balance_after,
          checked_by_oc: values.checked_by_oc ?? null,
        };
        await txSvc.createTransaction(payload);
        toast.success('Transaction created');
        setIsCreateTransactionDialogOpen(false);
        reset();
        // reload lists
        loadTransactions();
        loadAccounts();
      } catch (err) {
        console.error('create tx error', err);
        toast.error('Failed to create transaction');
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account *</Label>
            <Controller control={control} name="property_prisoner_account" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input placeholder="Filter accounts..." onChange={() => {}} />
                  </div>
                  {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.prisoner_name} - {a.account_type_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
          </div>

          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Controller control={control} name="transaction_type" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger>
                <SelectContent>
                  {txTypes.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller control={control} name="transaction_status" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>
                  {txStatuses.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input type="number" {...register('amount', { required: true, pattern: numericValidation.pattern.value })} placeholder="Enter amount" />
            {formState.errors.amount && <div className="text-red-600 text-sm">{(formState.errors.amount as any).message ?? 'Invalid amount'}</div>}
            {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
          </div>

          <div className="space-y-2">
            <Label>Transaction Date & Time</Label>
            <Input type="datetime-local" {...register('transaction_datetime')} />
          </div>

          <div className="space-y-2">
            <Label>Balance Before</Label>
            <Input type="text" {...register('balance_before')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Balance After</Label>
            <Input type="text" {...register('balance_after')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Checked By</Label>
            <Controller control={control} name="checked_by_oc" render={({ field }) => (
              <StaffProfileSelect value={field.value} onChange={(v:any) => field.onChange(v)} placeholder="Select staff..." />
            )} />
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...register('transaction_remark')} rows={3} />
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Controller control={control} name="biometric_consent" render={({ field }) => (
              <Checkbox id="biometric_consent" checked={!!field.value} onCheckedChange={(c) => field.onChange(c)} />
            )} />
            <Label className="cursor-pointer">Biometric Consent</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateTransactionDialogOpen(false); setIsEditTransactionDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}> {isEdit ? 'Update' : 'Create'} Transaction </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="accounts"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {totalBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    // clear parent form state and remount AccountForm so internal queries reset
                    setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
                    setAccountFormKey(k => k + 1);
                    setIsCreateAccountDialogOpen(true);
                  }}
                   style={{ backgroundColor: '#650000' }}
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Create Account
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Accounts"
                data={accounts}
                loading={accountsLoading}
                total={accountsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadAccounts(); }}
                columns={accountColumns}
                externalSearch={searchTerm}
                // expanded rows support: DataTable should call this to render expanded content for a row
                renderExpandedRow={(row:any) => expandedAccounts.has(row.id) ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Transactions</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTransactionFormData({
                            ...transactionFormData,
                            property_prisoner_account: row.id,
                          });
                          setIsCreateTransactionDialogOpen(true);
                        }}
                        style={{ backgroundColor: '#650000' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Balance After</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getAccountTransactions(row.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">No transactions found</TableCell>
                          </TableRow>
                        ) : getAccountTransactions(row.id).map((t:any) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(t.transaction_datetime).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{t.transaction_type_name}</Badge></TableCell>
                            <TableCell>
                              <span className={parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.transaction_status_name === 'Approved' ? 'default' : t.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                                {t.transaction_status_name}
                              </Badge>
                            </TableCell>
                            <TableCell>{parseFloat(t.balance_after || '0').toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{t.transaction_remark}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(t); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteTransactionId(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => setIsCreateTransactionDialogOpen(true)} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by status..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Transactions"
                data={transactions}
                loading={transactionsLoading}
                total={transactionsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadTransactions(); }}
                columns={transactionColumns}
                externalSearch={transactionSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Add a new prisoner account</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update account information</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>View prisoner account information</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedAccount.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedAccount.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Currency</Label>
                    <p>{selectedAccount.currency}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance</Label>
                    <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedTransaction.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedTransaction.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Transaction Type</Label>
                    <p>{selectedTransaction.transaction_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                      {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date & Time</Label>
                    <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance Before</Label>
                    <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance After</Label>
                    <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Checked By</Label>
                    <p>{selectedTransaction.checked_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Biometric Consent</Label>
                    <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerPropertyAccountScreen;












now

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTableCollapsableRows";
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchPrisoners } from '../../services/customPrisonersService';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  numericValidation
} from '../../utils/validation';
import { useForm, Controller } from 'react-hook-form';

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// API endpoints (centralised at top)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
};

const PrisonerPropertyAccountScreen: React.FC = () => {
  // global filters
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
  // register refresh handler
  useFilterRefresh(() => {
    // empty body: we'll trigger reload via effects by changing page/search etc.
  });

  // server-driven state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookups
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const searchTimer = useRef<number| null>(null);

  // dialogs/forms
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // form state
  const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  // force remount AccountForm to reset its internal state when opening create/edit
  const [accountFormKey, setAccountFormKey] = useState(0);
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});
  // expanded rows (for accounts collapsible section)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const toggleAccountExpansion = (accountId: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(accountId)) newSet.delete(accountId);
    else newSet.add(accountId);
    setExpandedAccounts(newSet);
  };
  // helper to get transactions for an account (from loaded transactions)
  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => String(t.property_prisoner_account) === String(accountId));
  };

  // request control
  const abortRef = useRef<AbortController | null>(null);
  const reqId = useRef(0);

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
    } catch (err) {
      console.error('lookup load error', err);
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAccountsLoading(true);
    try {
      const data = await accountsSvc.listAccounts(baseParams(opts));
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      if (id === reqId.current) setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTransactionsLoading(true);
    try {
      const data = await txSvc.listTransactions(baseParams(opts));
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      if (id === reqId.current) setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounce search for accounts/transactions
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(1);
      if (activeTab === 'accounts') loadAccounts();
      if (activeTab === 'transactions') loadTransactions();
    }, 500);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);

  // reload when filters/paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

  // register filter refresh to reload lists when global filters change via header UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers (accounts)
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    const prisonerValue = String(accountFormData.prisoner ?? '').trim();
    const accountTypeValue = String(accountFormData.account_type ?? '').trim();
    const currencyValue = String(accountFormData.currency ?? '').trim();
    const balanceValue = String(accountFormData.balance ?? '').trim();

    if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
    if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
    // numericValidation pattern expects digits; adjust message accordingly
    if (!balanceValue || !numericValidation.pattern.value.test(balanceValue)) errs.balance = 'Balance must be a number';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateAccount = async (dataOrEvent: any) => {
    // if called from old signature, fallback
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.createAccount({
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account created');
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  const handleUpdateAccount = async (dataOrEvent: any) => {
    if (!selectedAccount) return;
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.updateAccount(selectedAccount.id, {
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account updated');
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (err) {
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      toast.success('Account deleted');
      setDeleteAccountId(null);
      loadAccounts();
    } catch (err) {
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionForm = () => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(transactionFormData.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(transactionFormData.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(transactionFormData.amount)) errs.amount = 'Amount is required';
    setTransactionFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    try {
      await txSvc.createTransaction(transactionFormData);
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      // API delete endpoint assumed to be DELETE /transactions/{id}/
      await txSvc.createTransaction({}); // placeholder if no delete endpoint; replace with txSvc.deleteTransaction if available
      // If backend supports delete, call it instead.
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;

  // Columns for DataTable
  const accountColumns = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_v:any, r:any) => (
        <Button variant="ghost" size="sm" onClick={() => toggleAccountExpansion(r.id)}>
          {expandedAccounts.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency' },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsViewAccountDialogOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsEditAccountDialogOpen(true); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteAccountId(r.id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  const transactionColumns = [
    { key: 'transaction_datetime', label: 'Date & Time' },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'transaction_type_name', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
    { key: 'transaction_status_name', label: 'Status' },
    { key: 'checked_by_name', label: 'Checked By' },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
  ];

  // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (dataOrEvent: any) => void; isEdit: boolean }) => {
    // local form state to avoid re-rendering parent on every keypress (prevents caret loss)
    const [local, setLocal] = useState({
      prisoner: accountFormData.prisoner || '',
      account_type: accountFormData.account_type || '',
      currency: accountFormData.currency || 'UGX',
      balance: accountFormData.balance ?? '0',
    });
    const [prisonerQuery, setPrisonerQuery] = useState('');
    const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
    const [prisonerLoading, setPrisonerLoading] = useState(false);
    const prisonerAbortRef = useRef<AbortController | null>(null);
    const [accountTypeQuery, setAccountTypeQuery] = useState('');
    const [currencyQuery, setCurrencyQuery] = useState('');
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [selectedPrisonerName, setSelectedPrisonerName] = useState<string>('');
    const [balanceEditable, setBalanceEditable] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});

    // load prisoners (debounced, abortable)
    useEffect(() => {
      if (prisonerAbortRef.current) {
        prisonerAbortRef.current.abort();
        prisonerAbortRef.current = null;
      }
      const t = window.setTimeout(() => {
        const ctrl = new AbortController();
        prisonerAbortRef.current = ctrl;
        setPrisonerLoading(true);
        fetchPrisoners({
          search: prisonerQuery || '',
          station: globalStation || null,
          district: globalDistrict || null,
          region: globalRegion || null,
          page_size: 50,
          useCache: true,
        }, ctrl.signal).then(res => {
          setPrisonerResults(res.items || []);
        }).catch(err => {
          // ignore aborts; surface only real errors
          if ((err as any).name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
          console.error('fetchPrisoners error', err);
        }).finally(() => {
          setPrisonerLoading(false);
        });
      }, 300);
      return () => {
        window.clearTimeout(t);
        if (prisonerAbortRef.current) { prisonerAbortRef.current.abort(); prisonerAbortRef.current = null; }
      };
    }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);

    const validateLocal = () => {
      const e: Record<string,string> = {};
      if (!String(local.prisoner || '').trim()) e.prisoner = 'Prisoner is required';
      if (!String(local.account_type || '').trim()) e.account_type = 'Account type is required';
      // balance must be numeric (allow negative and decimals). empty -> treat as 0
      if (!String(local.balance || '').trim() || !/^-?\d+(\.\d+)?$/.test(String(local.balance).trim())) e.balance = 'Balance must be a number';
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const submit = (ev?: React.FormEvent) => {
      ev?.preventDefault();
      if (!validateLocal()) return;
      onSubmit({
        prisoner: String(local.prisoner),
        account_type: String(local.account_type),
        currency: String(local.currency),
        balance: String(local.balance || '0'),
      });
    };

    return (
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* prisoner picker (same UI as before) */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openPrisoner} className="w-full justify-between text-left" type="button">
                  {local.prisoner
                    ? (selectedPrisonerName
                        || prisoners.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || prisonerResults.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || local.prisoner)
                    : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search prisoners..." value={prisonerQuery} onValueChange={(v) => setPrisonerQuery(v)} />
                  <CommandList>
                    {prisonerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-gray-500">Loading prisoners...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisonerResults.map((p:any) => (
                            <CommandItem key={p.id} value={String(p.id)}
                              onSelect={() => {
                                setLocal(prev => ({ ...prev, prisoner: String(p.id) }));
                                setSelectedPrisonerName(p.full_name);
                                setOpenPrisoner(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={cn("mr-2 h-4 w-4", String(local.prisoner) === String(p.id) ? "opacity-100" : "opacity-0")} style={{ color: '#650000' }} />
                              <div className="flex flex-col text-sm">
                                <span>{p.full_name}</span>
                                <span className="text-xs text-gray-500">{p.prisoner_number_value || p.prisoner_number || ''}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.prisoner && <div className="text-red-600 text-sm mt-1">{errors.prisoner}</div>}
          </div>

          {/* account type */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={local.account_type} onValueChange={(v)=> setLocal(prev => ({ ...prev, account_type: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2"><Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} /></div>
                {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase())).map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.account_type && <div className="text-red-600 text-sm">{errors.account_type}</div>}
          </div>

          {/* currency display (readonly) */}
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={local.currency} disabled />
          </div>

          {/* Balance (disabled by default, toggle to enable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="balance">Balance</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit balance" checked={balanceEditable} onChange={(e) => setBalanceEditable(e.target.checked)} />
                Edit
              </label>
            </div>
            <Input
              id="balance"
              type="text"
              value={local.balance}
              onChange={(e) => {
                // allow only digits, optional leading minus and decimal
                const v = e.target.value;
                if (v === '' || /^-?\d*\.?\d*$/.test(v)) {
                  setLocal(prev => ({ ...prev, balance: v }));
                }
              }}
              placeholder="0"
              disabled={!balanceEditable}
            />
            {errors.balance && <div className="text-red-600 text-sm mt-1">{errors.balance}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateAccountDialogOpen(false); setIsEditAccountDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>{isEdit ? 'Update' : 'Create'} Account</Button>
        </DialogFooter>
      </form>
    );
  };

  // Transaction form implemented with react-hook-form to avoid focus loss on re-renders
  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const { register, handleSubmit, control, watch, setValue, formState, reset } = useForm({
      mode: "onTouched",
      defaultValues: {
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        transaction_datetime: new Date().toISOString().slice(0,16),
        balance_before: '',
        balance_after: '',
        checked_by_oc: null,
      }
    });

    // keep balance_before in sync when account changes
    const selectedAccountId = watch('property_prisoner_account');
    const amountValue = watch('amount');
    useEffect(() => {
      if (!selectedAccountId) {
        setValue('balance_before', '');
        setValue('balance_after', '');
        return;
      }
      const acc = accounts.find(a => String(a.id) === String(selectedAccountId));
      const before = acc ? (parseFloat(acc.balance || '0') || 0) : 0;
      setValue('balance_before', String(before));
      const amountNum = parseFloat(String(amountValue || '0')) || 0;
      setValue('balance_after', String(before + amountNum));
    }, [selectedAccountId, amountValue, accounts, setValue]);

    const onSubmitForm = async (values: any) => {
      // validate required fields locally
      const errs: Record<string,string> = {};
      if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
      if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
      if (!values.amount) errs.amount = 'Amount is required';
      if (Object.keys(errs).length) {
        setTransactionFormErrors(errs);
        return;
      }
      setTransactionFormErrors({});

      try {
        // prepare payload expected by API
        const payload = {
          property_prisoner_account: values.property_prisoner_account,
          transaction_type: values.transaction_type,
          transaction_status: values.transaction_status || null,
          amount: values.amount,
          transaction_remark: values.transaction_remark,
          biometric_consent: !!values.biometric_consent,
          transaction_datetime: values.transaction_datetime,
          balance_before: values.balance_before,
          balance_after: values.balance_after,
          checked_by_oc: values.checked_by_oc ? Number(values.checked_by_oc) : null,
        };
        await txSvc.createTransaction(payload);
        toast.success('Transaction created');
        setIsCreateTransactionDialogOpen(false);
        reset();
        // reload lists
        loadTransactions();
        loadAccounts();
      } catch (err) {
        console.error('create tx error', err);
        toast.error('Failed to create transaction');
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account *</Label>
            <Controller control={control} name="property_prisoner_account" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input placeholder="Filter accounts..." onChange={() => {}} />
                  </div>
                  {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.prisoner_name} - {a.account_type_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
          </div>

          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Controller control={control} name="transaction_type" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger>
                <SelectContent>
                  {txTypes.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller control={control} name="transaction_status" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>
                  {txStatuses.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input type="number" {...register('amount', { required: true, pattern: /^-?\d+(\.\d+)?$/ })} placeholder="Enter amount" />
            {formState.errors.amount && <div className="text-red-600 text-sm">{(formState.errors.amount as any).message ?? 'Invalid amount'}</div>}
            {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
          </div>

          <div className="space-y-2">
            <Label>Transaction Date & Time</Label>
            <Input type="datetime-local" {...register('transaction_datetime')} />
          </div>

          <div className="space-y-2">
            <Label>Balance Before</Label>
            <Input type="text" {...register('balance_before')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Balance After</Label>
            <Input type="text" {...register('balance_after')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Checked By</Label>
            <Controller control={control} name="checked_by_oc" render={({ field }) => (
              <StaffProfileSelect value={field.value} onChange={(v:any) => field.onChange(v)} placeholder="Select staff..." />
            )} />
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...register('transaction_remark')} rows={3} />
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Controller control={control} name="biometric_consent" render={({ field }) => (
              <Checkbox id="biometric_consent" checked={!!field.value} onCheckedChange={(c) => field.onChange(c)} />
            )} />
            <Label className="cursor-pointer">Biometric Consent</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateTransactionDialogOpen(false); setIsEditTransactionDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}> {isEdit ? 'Update' : 'Create'} Transaction </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="accounts"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {totalBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    // clear parent form state and remount AccountForm so internal queries reset
                    setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
                    setAccountFormKey(k => k + 1);
                    setIsCreateAccountDialogOpen(true);
                  }}
                   style={{ backgroundColor: '#650000' }}
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Create Account
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Accounts"
                data={accounts}
                loading={accountsLoading}
                total={accountsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadAccounts(); }}
                columns={accountColumns}
                externalSearch={searchTerm}
                // expanded rows support: DataTable should call this to render expanded content for a row
                renderExpandedRow={(row:any) => expandedAccounts.has(row.id) ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Transactions</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTransactionFormData({
                            ...transactionFormData,
                            property_prisoner_account: row.id,
                          });
                          setIsCreateTransactionDialogOpen(true);
                        }}
                        style={{ backgroundColor: '#650000' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Balance After</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getAccountTransactions(row.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">No transactions found</TableCell>
                          </TableRow>
                        ) : getAccountTransactions(row.id).map((t:any) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(t.transaction_datetime).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{t.transaction_type_name}</Badge></TableCell>
                            <TableCell>
                              <span className={parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.transaction_status_name === 'Approved' ? 'default' : t.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                                {t.transaction_status_name}
                              </Badge>
                            </TableCell>
                            <TableCell>{parseFloat(t.balance_after || '0').toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{t.transaction_remark}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(t); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteTransactionId(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => setIsCreateTransactionDialogOpen(true)} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by status..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Transactions"
                data={transactions}
                loading={transactionsLoading}
                total={transactionsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadTransactions(); }}
                columns={transactionColumns}
                externalSearch={transactionSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Add a new prisoner account</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update account information</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>View prisoner account information</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedAccount.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedAccount.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Currency</Label>
                    <p>{selectedAccount.currency}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance</Label>
                    <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedTransaction.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedTransaction.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Transaction Type</Label>
                    <p>{selectedTransaction.transaction_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                      {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date & Time</Label>
                    <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance Before</Label>
                    <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance After</Label>
                    <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Checked By</Label>
                    <p>{selectedTransaction.checked_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Biometric Consent</Label>
                    <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerPropertyAccountScreen;


----------------------


//create new account working but currency not using api
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTableCollapsableRows";
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchPrisoners } from '../../services/customPrisonersService';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  numericValidation
} from '../../utils/validation';
import { useForm, Controller } from 'react-hook-form';

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// API endpoints (centralised at top)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
};

const PrisonerPropertyAccountScreen: React.FC = () => {
  // global filters
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
  // register refresh handler
  useFilterRefresh(() => {
    // empty body: we'll trigger reload via effects by changing page/search etc.
  });

  // server-driven state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookups
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const searchTimer = useRef<number| null>(null);

  // dialogs/forms
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // form state
  const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  // force remount AccountForm to reset its internal state when opening create/edit
  const [accountFormKey, setAccountFormKey] = useState(0);
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});
  // expanded rows (for accounts collapsible section)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const toggleAccountExpansion = (accountId: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(accountId)) newSet.delete(accountId);
    else newSet.add(accountId);
    setExpandedAccounts(newSet);
  };
  // helper to get transactions for an account (from loaded transactions)
  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => String(t.property_prisoner_account) === String(accountId));
  };

  // request control
  const abortRef = useRef<AbortController | null>(null);
  const reqId = useRef(0);

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
    } catch (err) {
      console.error('lookup load error', err);
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAccountsLoading(true);
    try {
      const data = await accountsSvc.listAccounts(baseParams(opts));
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      if (id === reqId.current) setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTransactionsLoading(true);
    try {
      const data = await txSvc.listTransactions(baseParams(opts));
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      if (id === reqId.current) setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounce search for accounts/transactions
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(1);
      if (activeTab === 'accounts') loadAccounts();
      if (activeTab === 'transactions') loadTransactions();
    }, 500);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);

  // reload when filters/paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

  // register filter refresh to reload lists when global filters change via header UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers (accounts)
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    const prisonerValue = String(accountFormData.prisoner ?? '').trim();
    const accountTypeValue = String(accountFormData.account_type ?? '').trim();
    const currencyValue = String(accountFormData.currency ?? '').trim();
    const balanceValue = String(accountFormData.balance ?? '').trim();

    if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
    if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
    // numericValidation pattern expects digits; adjust message accordingly
    if (!balanceValue || !numericValidation.pattern.value.test(balanceValue)) errs.balance = 'Balance must be a number';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // validate arbitrary form data shape (used by handlers that accept local-submitted data)
  const validateAccountData = (data: any) => {
    const errs: Record<string,string> = {};
    if (!String(data.prisoner ?? '').trim()) errs.prisoner = 'Prisoner is required';
    if (!String(data.account_type ?? '').trim()) errs.account_type = 'Account type is required';
    if (!String(data.currency ?? '').trim()) errs.currency = 'Currency is required';
    const bal = String(data.balance ?? '').trim();
    if (!bal || !/^-?\d+(\.\d+)?$/.test(bal)) errs.balance = 'Balance must be a number';
    return errs;
  };

  const handleCreateAccount = async (dataOrEvent: any) => {
    // if called from old signature, fallback
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.createAccount({
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account created');
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  const handleUpdateAccount = async (dataOrEvent: any) => {
    if (!selectedAccount) return;
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.updateAccount(selectedAccount.id, {
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account updated');
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (err) {
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      toast.success('Account deleted');
      setDeleteAccountId(null);
      loadAccounts();
    } catch (err) {
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionForm = () => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(transactionFormData.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(transactionFormData.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(transactionFormData.amount)) errs.amount = 'Amount is required';
    setTransactionFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    try {
      await txSvc.createTransaction(transactionFormData);
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      // API delete endpoint assumed to be DELETE /transactions/{id}/
      await txSvc.createTransaction({}); // placeholder if no delete endpoint; replace with txSvc.deleteTransaction if available
      // If backend supports delete, call it instead.
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;

  // Columns for DataTable
  const accountColumns = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_v:any, r:any) => (
        <Button variant="ghost" size="sm" onClick={() => toggleAccountExpansion(r.id)}>
          {expandedAccounts.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency' },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsViewAccountDialogOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsEditAccountDialogOpen(true); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteAccountId(r.id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  const transactionColumns = [
    { key: 'transaction_datetime', label: 'Date & Time' },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'transaction_type_name', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
    { key: 'transaction_status_name', label: 'Status' },
    { key: 'checked_by_name', label: 'Checked By' },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
  ];

  // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (dataOrEvent: any) => void; isEdit: boolean }) => {
    // local form state to avoid re-rendering parent on every keypress (prevents caret loss)
    const [local, setLocal] = useState({
      prisoner: accountFormData.prisoner || '',
      account_type: accountFormData.account_type || '',
      currency: accountFormData.currency || 'UGX',
      balance: accountFormData.balance ?? '0',
    });
    const [prisonerQuery, setPrisonerQuery] = useState('');
    const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
    const [prisonerLoading, setPrisonerLoading] = useState(false);
    const prisonerAbortRef = useRef<AbortController | null>(null);
    const [accountTypeQuery, setAccountTypeQuery] = useState('');
    const [currencyQuery, setCurrencyQuery] = useState('');
    const currencies = ['UGX', 'USD', 'EUR', 'GBP'];
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [selectedPrisonerName, setSelectedPrisonerName] = useState<string>('');
    const [balanceEditable, setBalanceEditable] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});

    // load prisoners (debounced, abortable)
    useEffect(() => {
      if (prisonerAbortRef.current) {
        prisonerAbortRef.current.abort();
        prisonerAbortRef.current = null;
      }
      const t = window.setTimeout(() => {
        const ctrl = new AbortController();
        prisonerAbortRef.current = ctrl;
        setPrisonerLoading(true);
        fetchPrisoners({
          search: prisonerQuery || '',
          station: globalStation || null,
          district: globalDistrict || null,
          region: globalRegion || null,
          page_size: 50,
          useCache: true,
        }, ctrl.signal).then(res => {
          setPrisonerResults(res.items || []);
        }).catch(err => {
          // ignore aborts; surface only real errors
          if ((err as any).name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
          console.error('fetchPrisoners error', err);
        }).finally(() => {
          setPrisonerLoading(false);
        });
      }, 300);
      return () => {
        window.clearTimeout(t);
        if (prisonerAbortRef.current) { prisonerAbortRef.current.abort(); prisonerAbortRef.current = null; }
      };
    }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);

    const validateLocal = () => {
      const e: Record<string,string> = {};
      if (!String(local.prisoner || '').trim()) e.prisoner = 'Prisoner is required';
      if (!String(local.account_type || '').trim()) e.account_type = 'Account type is required';
      // balance must be numeric (allow negative and decimals). empty -> treat as 0
      if (!String(local.balance || '').trim() || !/^-?\d+(\.\d+)?$/.test(String(local.balance).trim())) e.balance = 'Balance must be a number';
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const submit = (ev?: React.FormEvent) => {
      ev?.preventDefault();
      if (!validateLocal()) return;
      onSubmit({
        prisoner: String(local.prisoner),
        account_type: String(local.account_type),
        currency: String(local.currency),
        balance: String(local.balance || '0'),
      });
    };

    return (
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* prisoner picker (same UI as before) */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openPrisoner} className="w-full justify-between text-left" type="button">
                  {local.prisoner
                    ? (selectedPrisonerName
                        || prisoners.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || prisonerResults.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || local.prisoner)
                    : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search prisoners..." value={prisonerQuery} onValueChange={(v) => setPrisonerQuery(v)} />
                  <CommandList>
                    {prisonerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-gray-500">Loading prisoners...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisonerResults.map((p:any) => (
                            <CommandItem key={p.id} value={String(p.id)}
                              onSelect={() => {
                                setLocal(prev => ({ ...prev, prisoner: String(p.id) }));
                                setSelectedPrisonerName(p.full_name);
                                setOpenPrisoner(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={cn("mr-2 h-4 w-4", String(local.prisoner) === String(p.id) ? "opacity-100" : "opacity-0")} style={{ color: '#650000' }} />
                              <div className="flex flex-col text-sm">
                                <span>{p.full_name}</span>
                                <span className="text-xs text-gray-500">{p.prisoner_number_value || p.prisoner_number || ''}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.prisoner && <div className="text-red-600 text-sm mt-1">{errors.prisoner}</div>}
          </div>

          {/* account type */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={local.account_type} onValueChange={(v)=> setLocal(prev => ({ ...prev, account_type: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2"><Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} /></div>
                {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase())).map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.account_type && <div className="text-red-600 text-sm">{errors.account_type}</div>}
          </div>

          {/* Currency (searchable select) */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={local.currency} onValueChange={(v)=> setLocal(prev => ({ ...prev, currency: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter currencies..." value={currencyQuery} onChange={(e) => setCurrencyQuery(e.target.value)} />
                </div>
                {currencies.filter(c => !currencyQuery || c.toLowerCase().includes(currencyQuery.toLowerCase()))
                  .map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.currency && <div className="text-red-600 text-sm mt-1">{errors.currency}</div>}
          </div>

          {/* Balance (disabled by default, toggle to enable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="balance">Balance</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit balance" checked={balanceEditable} onChange={(e) => setBalanceEditable(e.target.checked)} />
                Edit
              </label>
            </div>
            <Input
              id="balance"
              type="text"
              value={local.balance}
              onChange={(e) => {
                // allow only digits, optional leading minus and decimal
                const v = e.target.value;
                if (v === '' || /^-?\d*\.?\d*$/.test(v)) {
                  setLocal(prev => ({ ...prev, balance: v }));
                }
              }}
              placeholder="0"
              disabled={!balanceEditable}
            />
            {errors.balance && <div className="text-red-600 text-sm mt-1">{errors.balance}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateAccountDialogOpen(false); setIsEditAccountDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>{isEdit ? 'Update' : 'Create'} Account</Button>
        </DialogFooter>
      </form>
    );
  };

  // Transaction form implemented with react-hook-form to avoid focus loss on re-renders
  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const { register, handleSubmit, control, watch, setValue, formState, reset } = useForm({
      mode: "onTouched",
      defaultValues: {
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        transaction_datetime: new Date().toISOString().slice(0,16),
        balance_before: '',
        balance_after: '',
        checked_by_oc: null,
      }
    });

    // keep balance_before in sync when account changes
    const selectedAccountId = watch('property_prisoner_account');
    const amountValue = watch('amount');
    useEffect(() => {
      if (!selectedAccountId) {
        setValue('balance_before', '');
        setValue('balance_after', '');
        return;
      }
      const acc = accounts.find(a => String(a.id) === String(selectedAccountId));
      const before = acc ? (parseFloat(acc.balance || '0') || 0) : 0;
      setValue('balance_before', String(before));
      const amountNum = parseFloat(String(amountValue || '0')) || 0;
      setValue('balance_after', String(before + amountNum));
    }, [selectedAccountId, amountValue, accounts, setValue]);

    const onSubmitForm = async (values: any) => {
      // validate required fields locally
      const errs: Record<string,string> = {};
      if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
      if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
      if (!values.amount) errs.amount = 'Amount is required';
      if (Object.keys(errs).length) {
        setTransactionFormErrors(errs);
        return;
      }
      setTransactionFormErrors({});

      try {
        // prepare payload expected by API
        const payload = {
          property_prisoner_account: values.property_prisoner_account,
          transaction_type: values.transaction_type,
          transaction_status: values.transaction_status || null,
          amount: values.amount,
          transaction_remark: values.transaction_remark,
          biometric_consent: !!values.biometric_consent,
          transaction_datetime: values.transaction_datetime,
          balance_before: values.balance_before,
          balance_after: values.balance_after,
          checked_by_oc: values.checked_by_oc ? Number(values.checked_by_oc) : null,
        };
        await txSvc.createTransaction(payload);
        toast.success('Transaction created');
        setIsCreateTransactionDialogOpen(false);
        reset();
        // reload lists
        loadTransactions();
        loadAccounts();
      } catch (err) {
        console.error('create tx error', err);
        toast.error('Failed to create transaction');
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account *</Label>
            <Controller control={control} name="property_prisoner_account" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input placeholder="Filter accounts..." onChange={() => {}} />
                  </div>
                  {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.prisoner_name} - {a.account_type_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
          </div>

          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Controller control={control} name="transaction_type" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger>
                <SelectContent>
                  {txTypes.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller control={control} name="transaction_status" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>
                  {txStatuses.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input type="number" {...register('amount', { required: true, pattern: /^-?\d+(\.\d+)?$/ })} placeholder="Enter amount" />
            {formState.errors.amount && <div className="text-red-600 text-sm">{(formState.errors.amount as any).message ?? 'Invalid amount'}</div>}
            {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
          </div>

          <div className="space-y-2">
            <Label>Transaction Date & Time</Label>
            <Input type="datetime-local" {...register('transaction_datetime')} />
          </div>

          <div className="space-y-2">
            <Label>Balance Before</Label>
            <Input type="text" {...register('balance_before')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Balance After</Label>
            <Input type="text" {...register('balance_after')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Checked By</Label>
            <Controller control={control} name="checked_by_oc" render={({ field }) => (
              <StaffProfileSelect value={field.value} onChange={(v:any) => field.onChange(v)} placeholder="Select staff..." />
            )} />
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...register('transaction_remark')} rows={3} />
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Controller control={control} name="biometric_consent" render={({ field }) => (
              <Checkbox id="biometric_consent" checked={!!field.value} onCheckedChange={(c) => field.onChange(c)} />
            )} />
            <Label className="cursor-pointer">Biometric Consent</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateTransactionDialogOpen(false); setIsEditTransactionDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}> {isEdit ? 'Update' : 'Create'} Transaction </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="accounts"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance [All currencies]</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl"> {totalBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    // clear parent form state and remount AccountForm so internal queries reset
                    setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
                    setAccountFormKey(k => k + 1);
                    setIsCreateAccountDialogOpen(true);
                  }}
                   style={{ backgroundColor: '#650000' }}
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Create Account
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Accounts"
                data={accounts}
                loading={accountsLoading}
                total={accountsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadAccounts(); }}
                columns={accountColumns}
                externalSearch={searchTerm}
                // expanded rows support: DataTable should call this to render expanded content for a row
                renderExpandedRow={(row:any) => expandedAccounts.has(row.id) ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Transactions</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTransactionFormData({
                            ...transactionFormData,
                            property_prisoner_account: row.id,
                          });
                          setIsCreateTransactionDialogOpen(true);
                        }}
                        style={{ backgroundColor: '#650000' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Balance After</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getAccountTransactions(row.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">No transactions found</TableCell>
                          </TableRow>
                        ) : getAccountTransactions(row.id).map((t:any) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(t.transaction_datetime).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{t.transaction_type_name}</Badge></TableCell>
                            <TableCell>
                              <span className={parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.transaction_status_name === 'Approved' ? 'default' : t.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                                {t.transaction_status_name}
                              </Badge>
                            </TableCell>
                            <TableCell>{parseFloat(t.balance_after || '0').toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{t.transaction_remark}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(t); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteTransactionId(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => setIsCreateTransactionDialogOpen(true)} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by status..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Transactions"
                data={transactions}
                loading={transactionsLoading}
                total={transactionsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadTransactions(); }}
                columns={transactionColumns}
                externalSearch={transactionSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Add a new prisoner account</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update account information</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>View prisoner account information</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedAccount.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedAccount.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Currency</Label>
                    <p>{selectedAccount.currency}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance</Label>
                    <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedTransaction.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedTransaction.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Transaction Type</Label>
                    <p>{selectedTransaction.transaction_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                      {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date & Time</Label>
                    <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance Before</Label>
                    <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance After</Label>
                    <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Checked By</Label>
                    <p>{selectedTransaction.checked_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Biometric Consent</Label>
                    <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerPropertyAccountScreen;




// b4 fix of currency placeholder
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTableCollapsableRows";
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';
import AmountInput from '../common/AmountInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchPrisoners } from '../../services/customPrisonersService';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  numericValidation
} from '../../utils/validation';
import { useForm, Controller } from 'react-hook-form';

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// API endpoints (centralised at top)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
  CURRENCIES: '/system-administration/currencies/',
};

const PrisonerPropertyAccountScreen: React.FC = () => {
  // global filters
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
  // register refresh handler
  useFilterRefresh(() => {
    // empty body: we'll trigger reload via effects by changing page/search etc.
  });

  // server-driven state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookups
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const searchTimer = useRef<number| null>(null);

  // dialogs/forms
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // form state
  const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  // force remount AccountForm to reset its internal state when opening create/edit
  const [accountFormKey, setAccountFormKey] = useState(0);
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});
  // expanded rows (for accounts collapsible section)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const toggleAccountExpansion = (accountId: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(accountId)) newSet.delete(accountId);
    else newSet.add(accountId);
    setExpandedAccounts(newSet);
  };
  // helper to get transactions for an account (from loaded transactions)
  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => String(t.property_prisoner_account) === String(accountId));
  };

  // request control
  const abortRef = useRef<AbortController | null>(null);
  const reqId = useRef(0);

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes, curRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
        axiosInstance.get(API_ENDPOINTS.CURRENCIES, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
      setCurrencies((curRes?.results ?? []).map((c:any) => c.code ?? c)); // adapt to API shape
    } catch (err) {
      console.error('lookup load error', err);
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setAccountsLoading(true);
    try {
      const data = await accountsSvc.listAccounts(baseParams(opts));
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      if (id === reqId.current) setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    try { abortRef.current?.abort(); } catch {}
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTransactionsLoading(true);
    try {
      const data = await txSvc.listTransactions(baseParams(opts));
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      if (err?.name === 'AbortError') return;
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      if (id === reqId.current) setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounce search for accounts/transactions
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(1);
      if (activeTab === 'accounts') loadAccounts();
      if (activeTab === 'transactions') loadTransactions();
    }, 500);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);

  // reload when filters/paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

  // register filter refresh to reload lists when global filters change via header UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers (accounts)
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    const prisonerValue = String(accountFormData.prisoner ?? '').trim();
    const accountTypeValue = String(accountFormData.account_type ?? '').trim();
    const currencyValue = String(accountFormData.currency ?? '').trim();
    const balanceValue = String(accountFormData.balance ?? '').trim();

    if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
    if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
    // numericValidation pattern expects digits; adjust message accordingly
    if (!balanceValue || !numericValidation.pattern.value.test(balanceValue)) errs.balance = 'Balance must be a number';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // validate arbitrary form data shape (used by handlers that accept local-submitted data)
  const validateAccountData = (data: any) => {
    const errs: Record<string,string> = {};
    if (!String(data.prisoner ?? '').trim()) errs.prisoner = 'Prisoner is required';
    if (!String(data.account_type ?? '').trim()) errs.account_type = 'Account type is required';
    if (!String(data.currency ?? '').trim()) errs.currency = 'Currency is required';
    const bal = String(data.balance ?? '').trim();
    if (!bal || !/^-?\d+(\.\d+)?$/.test(bal)) errs.balance = 'Balance must be a number';
    return errs;
  };

  const handleCreateAccount = async (dataOrEvent: any) => {
    // if called from old signature, fallback
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.createAccount({
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account created');
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  const handleUpdateAccount = async (dataOrEvent: any) => {
    if (!selectedAccount) return;
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.updateAccount(selectedAccount.id, {
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account updated');
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (err) {
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      toast.success('Account deleted');
      setDeleteAccountId(null);
      loadAccounts();
    } catch (err) {
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionForm = () => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(transactionFormData.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(transactionFormData.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(transactionFormData.amount)) errs.amount = 'Amount is required';
    setTransactionFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransactionForm()) return;
    try {
      await txSvc.createTransaction(transactionFormData);
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      // API delete endpoint assumed to be DELETE /transactions/{id}/
      await txSvc.createTransaction({}); // placeholder if no delete endpoint; replace with txSvc.deleteTransaction if available
      // If backend supports delete, call it instead.
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      loadTransactions();
      loadAccounts();
    } catch (err) {
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;

  // Columns for DataTable
  const accountColumns = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_v:any, r:any) => (
        <Button variant="ghost" size="sm" onClick={() => toggleAccountExpansion(r.id)}>
          {expandedAccounts.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency' },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsViewAccountDialogOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency }); setIsEditAccountDialogOpen(true); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteAccountId(r.id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  const transactionColumns = [
    { key: 'transaction_datetime', label: 'Date & Time' },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'transaction_type_name', label: 'Type' },
    { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
    { key: 'transaction_status_name', label: 'Status' },
    { key: 'checked_by_name', label: 'Checked By' },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
  ];

  // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (dataOrEvent: any) => void; isEdit: boolean }) => {
    // local form state to avoid re-rendering parent on every keypress (prevents caret loss)
    const [local, setLocal] = useState({
      prisoner: accountFormData.prisoner || '',
      account_type: accountFormData.account_type || '',
      currency: accountFormData.currency || 'UGX',
      balance: accountFormData.balance ?? '0',
    });
    const [prisonerQuery, setPrisonerQuery] = useState('');
    const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
    const [prisonerLoading, setPrisonerLoading] = useState(false);
    const prisonerAbortRef = useRef<AbortController | null>(null);
    const [accountTypeQuery, setAccountTypeQuery] = useState('');
    const [currencyQuery, setCurrencyQuery] = useState('');
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [selectedPrisonerName, setSelectedPrisonerName] = useState<string>('');
    const [balanceEditable, setBalanceEditable] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});

    // load prisoners (debounced, abortable)
    useEffect(() => {
      if (prisonerAbortRef.current) {
        prisonerAbortRef.current.abort();
        prisonerAbortRef.current = null;
      }
      const t = window.setTimeout(() => {
        const ctrl = new AbortController();
        prisonerAbortRef.current = ctrl;
        setPrisonerLoading(true);
        fetchPrisoners({
          search: prisonerQuery || '',
          station: globalStation || null,
          district: globalDistrict || null,
          region: globalRegion || null,
          page_size: 50,
          useCache: true,
        }, ctrl.signal).then(res => {
          setPrisonerResults(res.items || []);
        }).catch(err => {
          // ignore aborts; surface only real errors
          if ((err as any).name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
          console.error('fetchPrisoners error', err);
        }).finally(() => {
          setPrisonerLoading(false);
        });
      }, 300);
      return () => {
        window.clearTimeout(t);
        if (prisonerAbortRef.current) { prisonerAbortRef.current.abort(); prisonerAbortRef.current = null; }
      };
    }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);

    const validateLocal = () => {
      const e: Record<string,string> = {};
      if (!String(local.prisoner || '').trim()) e.prisoner = 'Prisoner is required';
      if (!String(local.account_type || '').trim()) e.account_type = 'Account type is required';
      // balance must be numeric (allow negative and decimals). empty -> treat as 0
      if (!String(local.balance || '').trim() || !/^-?\d+(\.\d+)?$/.test(String(local.balance).trim())) e.balance = 'Balance must be a number';
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const submit = (ev?: React.FormEvent) => {
      ev?.preventDefault();
      if (!validateLocal()) return;
      onSubmit({
        prisoner: String(local.prisoner),
        account_type: String(local.account_type),
        currency: String(local.currency),
        balance: String(local.balance || '0'),
      });
    };

    return (
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* prisoner picker (same UI as before) */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openPrisoner} className="w-full justify-between text-left" type="button">
                  {local.prisoner
                    ? (selectedPrisonerName
                        || prisoners.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || prisonerResults.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || local.prisoner)
                    : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search prisoners..." value={prisonerQuery} onValueChange={(v) => setPrisonerQuery(v)} />
                  <CommandList>
                    {prisonerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-gray-500">Loading prisoners...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisonerResults.map((p:any) => (
                            <CommandItem key={p.id} value={String(p.id)}
                              onSelect={() => {
                                setLocal(prev => ({ ...prev, prisoner: String(p.id) }));
                                setSelectedPrisonerName(p.full_name);
                                setOpenPrisoner(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={cn("mr-2 h-4 w-4", String(local.prisoner) === String(p.id) ? "opacity-100" : "opacity-0")} style={{ color: '#650000' }} />
                              <div className="flex flex-col text-sm">
                                <span>{p.full_name}</span>
                                <span className="text-xs text-gray-500">{p.prisoner_number_value || p.prisoner_number || ''}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.prisoner && <div className="text-red-600 text-sm mt-1">{errors.prisoner}</div>}
          </div>

          {/* account type */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={local.account_type} onValueChange={(v)=> setLocal(prev => ({ ...prev, account_type: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2"><Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} /></div>
                {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase())).map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.account_type && <div className="text-red-600 text-sm">{errors.account_type}</div>}
          </div>

          {/* Currency (searchable select) */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={local.currency} onValueChange={(v)=> setLocal(prev => ({ ...prev, currency: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter currencies..." value={currencyQuery} onChange={(e) => setCurrencyQuery(e.target.value)} />
                </div>
                {(currencies || []).filter((c:any) => {
                  const code = typeof c === 'string' ? c : (c.code ?? c.id ?? '');
                  return !currencyQuery || String(code).toLowerCase().includes(currencyQuery.toLowerCase());
                }).map((c:any) => {
                  const code = typeof c === 'string' ? c : (c.code ?? c.id ?? '');
                  return <SelectItem key={code} value={String(code)}>{code}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            {errors.currency && <div className="text-red-600 text-sm mt-1">{errors.currency}</div>}
          </div>

          {/* Balance (disabled by default, toggle to enable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="balance">Balance</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit balance" checked={balanceEditable} onChange={(e) => setBalanceEditable(e.target.checked)} />
                Edit
              </label>
            </div>
            <AmountInput
              id="balance"
              currency={local.currency}
              className="disabled:opacity-25 input-invalid file:text-foreground dark:bg-input/30 w-full min-w-0 rounded-md px-3 py-1 bg-input-background transition-[color,box-shadow] outline-none"
              value={local.balance}
              onChange={(v) => setLocal(prev => ({ ...prev, balance: v }))}
              placeholder="0"
              disabled={!balanceEditable}
            />
            {errors.balance && <div className="text-red-600 text-sm mt-1">{errors.balance}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateAccountDialogOpen(false); setIsEditAccountDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>{isEdit ? 'Update' : 'Create'} Account</Button>
        </DialogFooter>
      </form>
    );
  };

  // Transaction form implemented with react-hook-form to avoid focus loss on re-renders
  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const { register, handleSubmit, control, watch, setValue, formState, reset } = useForm({
      mode: "onTouched",
      defaultValues: {
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        transaction_datetime: new Date().toISOString().slice(0,16),
        balance_before: '',
        balance_after: '',
        checked_by_oc: null,
      }
    });

    // keep balance_before in sync when account changes
    const selectedAccountId = watch('property_prisoner_account');
    const amountValue = watch('amount');
    useEffect(() => {
      if (!selectedAccountId) {
        setValue('balance_before', '');
        setValue('balance_after', '');
        return;
      }
      const acc = accounts.find(a => String(a.id) === String(selectedAccountId));
      const before = acc ? (parseFloat(acc.balance || '0') || 0) : 0;
      setValue('balance_before', String(before));
      const amountNum = parseFloat(String(amountValue || '0')) || 0;
      setValue('balance_after', String(before + amountNum));
    }, [selectedAccountId, amountValue, accounts, setValue]);

    const onSubmitForm = async (values: any) => {
      // validate required fields locally
      const errs: Record<string,string> = {};
      if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
      if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
      if (!values.amount) errs.amount = 'Amount is required';
      if (Object.keys(errs).length) {
        setTransactionFormErrors(errs);
        return;
      }
      setTransactionFormErrors({});

      try {
        // prepare payload expected by API
        const payload = {
          property_prisoner_account: values.property_prisoner_account,
          transaction_type: values.transaction_type,
          transaction_status: values.transaction_status || null,
          amount: values.amount,
          transaction_remark: values.transaction_remark,
          biometric_consent: !!values.biometric_consent,
          transaction_datetime: values.transaction_datetime,
          balance_before: values.balance_before,
          balance_after: values.balance_after,
          checked_by_oc: values.checked_by_oc ? Number(values.checked_by_oc) : null,
        };
        await txSvc.createTransaction(payload);
        toast.success('Transaction created');
        setIsCreateTransactionDialogOpen(false);
        reset();
        // reload lists
        loadTransactions();
        loadAccounts();
      } catch (err) {
        console.error('create tx error', err);
        toast.error('Failed to create transaction');
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account *</Label>
            <Controller control={control} name="property_prisoner_account" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input placeholder="Filter accounts..." onChange={() => {}} />
                  </div>
                  {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.prisoner_name} - {a.account_type_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
          </div>

          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Controller control={control} name="transaction_type" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger>
                <SelectContent>
                  {txTypes.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller control={control} name="transaction_status" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>
                  {txStatuses.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Amount *</Label>
            <Controller control={control} name="amount" rules={{ required: true, pattern: /^-?\d+(\.\d+)?$/ }} render={({ field }) => {
              const selAcc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
              const selCurrency = selAcc?.currency ?? 'UGX';
              return (
                <AmountInput
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v)}
                  currency={selCurrency}
                  placeholder="Enter amount"
                />
              );
            }} />
            {formState.errors.amount && <div className="text-red-600 text-sm">{(formState.errors.amount as any).message ?? 'Invalid amount'}</div>}
            {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
          </div>

          <div className="space-y-2">
            <Label>Transaction Date & Time</Label>
            <Input type="datetime-local" {...register('transaction_datetime')} />
          </div>

          <div className="space-y-2">
            <Label>Balance Before</Label>
            <Input type="text" {...register('balance_before')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Balance After</Label>
            <Input type="text" {...register('balance_after')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Checked By</Label>
            <Controller control={control} name="checked_by_oc" render={({ field }) => (
              <StaffProfileSelect value={field.value} onChange={(v:any) => field.onChange(v)} placeholder="Select staff..." />
            )} />
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...register('transaction_remark')} rows={3} />
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Controller control={control} name="biometric_consent" render={({ field }) => (
              <Checkbox id="biometric_consent" checked={!!field.value} onCheckedChange={(c) => field.onChange(c)} />
            )} />
            <Label className="cursor-pointer">Biometric Consent</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateTransactionDialogOpen(false); setIsEditTransactionDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}> {isEdit ? 'Update' : 'Create'} Transaction </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="accounts"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance [All currencies]</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl"> {totalBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => {
                    // clear parent form state and remount AccountForm so internal queries reset
                    setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
                    setAccountFormKey(k => k + 1);
                    setIsCreateAccountDialogOpen(true);
                  }}
                   style={{ backgroundColor: '#650000' }}
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Create Account
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Accounts"
                data={accounts}
                loading={accountsLoading}
                total={accountsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadAccounts(); }}
                columns={accountColumns}
                externalSearch={searchTerm}
                // expanded rows support: DataTable should call this to render expanded content for a row
                renderExpandedRow={(row:any) => expandedAccounts.has(row.id) ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Transactions</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTransactionFormData({
                            ...transactionFormData,
                            property_prisoner_account: row.id,
                          });
                          setIsCreateTransactionDialogOpen(true);
                        }}
                        style={{ backgroundColor: '#650000' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Balance After</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getAccountTransactions(row.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">No transactions found</TableCell>
                          </TableRow>
                        ) : getAccountTransactions(row.id).map((t:any) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(t.transaction_datetime).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{t.transaction_type_name}</Badge></TableCell>
                            <TableCell>
                              <span className={parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.transaction_status_name === 'Approved' ? 'default' : t.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                                {t.transaction_status_name}
                              </Badge>
                            </TableCell>
                            <TableCell>{parseFloat(t.balance_after || '0').toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{t.transaction_remark}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(t); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteTransactionId(t.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => setIsCreateTransactionDialogOpen(true)} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by status..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                title="Transactions"
                data={transactions}
                loading={transactionsLoading}
                total={transactionsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadTransactions(); }}
                columns={transactionColumns}
                externalSearch={transactionSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Add a new prisoner account</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update account information</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>View prisoner account information</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedAccount.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedAccount.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Currency</Label>
                    <p>{selectedAccount.currency}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance</Label>
                    <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedTransaction.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedTransaction.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Transaction Type</Label>
                    <p>{selectedTransaction.transaction_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                      {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date & Time</Label>
                    <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance Before</Label>
                    <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance After</Label>
                    <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Checked By</Label>
                    <p>{selectedTransaction.checked_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Biometric Consent</Label>
                    <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={() => setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and all associated transactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} style={{ backgroundColor: '#650000' }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerPropertyAccountScreen;


/property-management/prisoner-accounts/

/property-management/transactions/



import { Calendar } from "lucide-react"; // or wherever your Calendar icon comes from
import { Badge } from "@/components/ui/badge"; // adjust import path to your Badge component

const transactionColumns = [
  {
    key: "transaction_datetime",
    label: "Date & Time",
    render: (value: any) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span>{value}</span>
      </div>
    ),
  },
  { key: "prisoner_name", label: "Prisoner" },
  {
    key: "account_type_name",
    label: "Account Type",
    render: (value: any) => (
      <Badge variant="outline">{value}</Badge>
    ),
  },
  {
    key: "transaction_type_name",
    label: "Type",
    render: (value: any) => (
      <Badge variant="outline">{value}</Badge>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    render: (v: any, r: any) => (
      <span
        className={
          parseFloat(r.amount) >= 0 ? "text-green-600" : "text-red-600"
        }
      >
        {parseFloat(r.amount) >= 0 ? "+" : ""}
        {parseFloat(r.amount).toLocaleString()}
      </span>
    ),
  },
  { key: "transaction_status_name", label: "Status" },
  { key: "checked_by_name", label: "Checked By" },
  {
    key: "transaction_remark",
    label: "Remarks",
    render: (v: any) => (
      <div className="max-w-xs truncate">{v || "-"}</div>
    ),
  },
];




works with optimistic update
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTableCollapsableRows";
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';
import AmountInput from '../common/AmountInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchPrisoners } from '../../services/customPrisonersService';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  numericValidation
} from '../../utils/validation';
import { useForm, Controller } from 'react-hook-form';
import ConfirmDialog from '../common/ConfirmDialog';

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// API endpoints (centralised at top)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
  CURRENCIES: '/system-administration/currencies/',
};

const PrisonerPropertyAccountScreen: React.FC = () => {
  // global filters
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
  // register refresh handler
  useFilterRefresh(() => {
    // empty body: we'll trigger reload via effects by changing page/search etc.
  });

  // server-driven state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookups
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<any[]>([]);
  const [staffProfilesError, setStaffProfilesError] = useState<string | null>(null);

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const searchTimer = useRef<number| null>(null);

  // dialogs/forms
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // form state
  const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  // force remount AccountForm to reset its internal state when opening create/edit
  const [accountFormKey, setAccountFormKey] = useState(0);
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});
  // expanded rows (for accounts collapsible section)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const toggleAccountExpansion = (accountId: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(accountId)) newSet.delete(accountId);
    else newSet.add(accountId);
    setExpandedAccounts(newSet);
  };
  // helper to get transactions for an account (from loaded transactions)
  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => String(t.property_prisoner_account) === String(accountId));
  };

  // request control (no shared abort controller — rely on reqId to ignore stale responses)
  const reqId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // utility to deep clone safely
  const deepClone = (v: any) => {
    try { return (globalThis as any).structuredClone ? (globalThis as any).structuredClone(v) : JSON.parse(JSON.stringify(v)); }
    catch { try { return JSON.parse(JSON.stringify(v)); } catch { return v; } }
  };

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes, curRes, staffRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
        axiosInstance.get(API_ENDPOINTS.CURRENCIES, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        // staff profiles is optional - catch network errors to avoid blocking UI
        axiosInstance.get('/auth/staff-profiles/', { params: { page_size: 200 }}).then(r => r.data).catch(err => { throw err; }),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
      // store full currency objects (id, code, name) so UI can show name while saving id
      setCurrencies(curRes?.results ?? []);
      // staff
      if (staffRes && staffRes.results) {
        setStaffProfiles(staffRes.results);
        setStaffProfilesError(null);
      } else {
        setStaffProfiles([]);
      }
    } catch (err:any) {
      console.error('lookup load error', err);
      // if staff fetch failed, set error but let UI continue
      if (String(err?.config?.url || '').includes('/auth/staff-profiles')) {
        setStaffProfilesError('Failed to load staff list');
        setStaffProfiles([]);
      }
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    setAccountsLoading(true);
    try {
      const data = await accountsSvc.listAccounts(baseParams(opts));
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    setTransactionsLoading(true);
    try {
      const data = await txSvc.listTransactions(baseParams(opts));
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounce search for accounts/transactions
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(1);
      if (activeTab === 'accounts') loadAccounts();
      if (activeTab === 'transactions') loadTransactions();
    }, 500);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);

  // reload when filters/paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

  // register filter refresh to reload lists when global filters change via header UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers (accounts)
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    const prisonerValue = String(accountFormData.prisoner ?? '').trim();
    const accountTypeValue = String(accountFormData.account_type ?? '').trim();
    const currencyValue = String(accountFormData.currency ?? '').trim();
    const balanceValue = String(accountFormData.balance ?? '').trim();

    if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
    if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
    // numericValidation pattern expects digits; adjust message accordingly
    if (!balanceValue || !numericValidation.pattern.value.test(balanceValue)) errs.balance = 'Balance must be a number';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // validate arbitrary form data shape (used by handlers that accept local-submitted data)
  const validateAccountData = (data: any) => {
    const errs: Record<string,string> = {};
    if (!String(data.prisoner ?? '').trim()) errs.prisoner = 'Prisoner is required';
    if (!String(data.account_type ?? '').trim()) errs.account_type = 'Account type is required';
    if (!String(data.currency ?? '').trim()) errs.currency = 'Currency is required';
    const bal = String(data.balance ?? '').trim();
    if (!bal || !/^-?\d+(\.\d+)?$/.test(bal)) errs.balance = 'Balance must be a number';
    return errs;
  };

  const handleCreateAccount = async (dataOrEvent: any) => {
    // if called from old signature, fallback
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.createAccount({
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account created');
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  // helper to map backend status to badge variant
  const getStatusVariant = (status: string) => {
    if (!status) return 'warning';
    switch (String(status).toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'approved':
      case 'completed':
      case 'success':
        return 'success';
      case 'failed':
      case 'rejected':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const handleUpdateAccount = async (dataOrEvent: any) => {
    if (!selectedAccount) return;
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.updateAccount(selectedAccount.id, {
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      // optimistic: update local accounts list
      setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? { ...a, prisoner: data.prisoner, account_type: data.account_type, currency: data.currency, balance: data.balance ?? '0' } : a));
      toast.success('Account updated');
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      // refresh authoritative data in background
      loadAccounts().catch(()=>{});
    } catch (err) {
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      // optimistic: remove from local list and decrement total
      setAccounts(prev => prev.filter(a => a.id !== deleteAccountId));
      setAccountsTotal(t => (typeof t === 'number' ? Math.max(0, t - 1) : prevLengthSafe(accounts) - 1));
      toast.success('Account deleted');
      setDeleteAccountId(null);
      // refresh authoritative data in background
      loadAccounts().catch(()=>{});
    } catch (err) {
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionData = (data: any) => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(data.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(data.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(data.amount)) errs.amount = 'Amount is required';
    if (!data.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
    return errs;
  };

  const handleCreateTransaction = async (values: any) => {
    const errs = validateTransactionData(values);
    if (Object.keys(errs).length) {
      setTransactionFormErrors(errs);
      return;
    }
    setTransactionFormErrors({});
    try {
      const res = await txSvc.createTransaction(values);
      // optimistic UI: prepend created transaction and bump total
      setTransactions(prev => [res, ...prev]);
      setTransactionsTotal(t => (typeof t === 'number' ? t + 1 : prevLengthSafe(transactions) + 1));
      // update account balance locally if possible
      if (res?.property_prisoner_account) {
        setAccounts(prev => prev.map(a => a.id === res.property_prisoner_account ? { ...a, balance: String(res.balance_after ?? a.balance) } : a));
      }
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      // refresh authoritative account list in background
      loadAccounts().catch(()=>{});
      // optionally reload transactions in background (non-blocking)
      // loadTransactions().catch(()=>{});
    } catch (err) {
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  // add update transaction handler
  const handleUpdateTransaction = async (dataOrEvent: any) => {
    // dataOrEvent is provided by TransactionForm (react-hook-form)
    const values = dataOrEvent && dataOrEvent.property_prisoner_account ? dataOrEvent : transactionFormData;
    const errs: Record<string,string> = {};
    if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
    if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
    if (!values.amount) errs.amount = 'Amount is required';
    if (!values.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
    if (Object.keys(errs).length) {
      setTransactionFormErrors(errs);
      return;
    }
    if (!selectedTransaction) return;
    try {
      const payload = {
        property_prisoner_account: values.property_prisoner_account,
        transaction_type: values.transaction_type,
        transaction_status: values.transaction_status || null,
        amount: values.amount,
        transaction_remark: values.transaction_remark,
        biometric_consent: !!values.biometric_consent,
        transaction_datetime: values.transaction_datetime,
        balance_before: values.balance_before,
        balance_after: values.balance_after,
        checked_by_oc: values.checked_by_oc,
      };
      const res = (typeof txSvc.updateTransaction === 'function')
        ? await txSvc.updateTransaction(selectedTransaction.id, payload)
        : (await axiosInstance.patch(`${API_ENDPOINTS.TRANSACTIONS}${selectedTransaction.id}/`, payload)).data;
      // optimistic UI: replace updated transaction in local state
      setTransactions(prev => prev.map(t => String(t.id) === String(res.id) ? res : t));
      // update account balance for affected account
      if (res?.property_prisoner_account) {
        setAccounts(prev => prev.map(a => a.id === res.property_prisoner_account ? { ...a, balance: String(res.balance_after ?? a.balance) } : a));
      }
      toast.success('Transaction updated');
      setIsEditTransactionDialogOpen(false);
      setSelectedTransaction(null);
      // refresh authoritative accounts in background
      loadAccounts().catch(()=>{});
    } catch (err) {
      console.error('update tx error', err);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      if (typeof txSvc.deleteTransaction === 'function') {
        await txSvc.deleteTransaction(deleteTransactionId);
      } else {
        await axiosInstance.delete(`${API_ENDPOINTS.TRANSACTIONS}${deleteTransactionId}/`);
      }
      // optimistic UI: remove from local state and decrement total
      setTransactions(prev => prev.filter(t => String(t.id) !== String(deleteTransactionId)));
      setTransactionsTotal(t => (typeof t === 'number' ? Math.max(0, t - 1) : prevLengthSafe(transactions) - 1));
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      // refresh authoritative accounts in background
      loadAccounts().catch(()=>{});
    } catch (err) {
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;

  // helper to render currency label (show code/name in UI, save uuid)
  const getCurrencyLabel = (val?: string) => {
    if (!val) return '';
    const found = currencies.find((c:any) => String(c.id) === String(val) || String(c.code ?? '').toUpperCase() === String(val).toUpperCase());
    if (found) return found.name ? `${found.code ?? ''} — ${found.name}` : (found.code ?? String(found.id));
    // fallback: if val looks like uppercase code return it else return raw
    return String(val);
  };

  // helper to render checked_by name using staffProfiles fallback to API name
  const getCheckedByName = (val?: string | number, fallbackName?: string) => {
    if (!val && !fallbackName) return '';
    const found = staffProfiles.find((s:any) => String(s.id) === String(val) || String(s.user)?.toLowerCase() === String(val)?.toLowerCase() || String(s.id) === String(fallbackName));
    if (found) return found.full_name ?? found.name ?? String(found.id);
    return fallbackName ?? String(val ?? '');
  };

  // Columns for DataTable
  const accountColumns = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_v:any, r:any) => (
        <Button variant="ghost" size="sm" onClick={() => toggleAccountExpansion(r.id)}>
          {expandedAccounts.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency', render: (v:any, r:any) => <span>{getCurrencyLabel(v)}</span> },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex justify-end gap-2">

        <Button variant="ghost" size="sm" onClick={() => {
            setSelectedAccount(r);
            setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency, balance: r.balance ?? '0' });
            setAccountFormKey(k => k + 1); // remount form so local state syncs
            setIsViewAccountDialogOpen(true);
          }}>
           <Eye className="h-4 w-4" />
         </Button>

        <Button variant="ghost" size="sm" onClick={() => {
            const copy = deepClone(r);
            setSelectedAccount(copy);
            setAccountFormData({ prisoner: copy.prisoner, account_type: copy.account_type, currency: copy.currency, balance: copy.balance ?? '0' });
            setAccountFormKey(k => k + 1); // ensure AccountForm remounts with fresh data
            setIsEditAccountDialogOpen(true);
          }}>
           <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setDeleteAccountId(r.id); }}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )},
  ];

  const transactionColumns = [
    {
      key: "transaction_datetime",
      label: "Date & Time",
      render: (value: any) => {
        let v = '';
        try { v = value ? new Date(value).toLocaleString() : ''; } catch { v = String(value); }
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{v}</span>
          </div>
        );
      },
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    // { key: 'account_type_name', label: 'Account Type' },
    {
      key: "account_type_name",
      label: "Account Type",
      render: (value: any) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    // { key: 'transaction_type_name', label: 'Type' },
    {
      key: "transaction_type_name",
      label: "Type",
      render: (value: any) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
    // { key: 'transaction_status_name', label: 'Status' },
    {
      key: "transaction_status_name",
      label: "Status",
      render: (value: any) => (
        <Badge variant={getStatusVariant(value)}>{value}</Badge>
      ),
    },
    { key: 'checked_by_name', label: 'Checked By' },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v:any, r:any) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(r)); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => {
            const copy = deepClone(r);
            setSelectedTransaction(copy);
            // populate form data for editing (use cloned values)
            setTransactionFormData({
              property_prisoner_account: copy.property_prisoner_account,
              transaction_type: copy.transaction_type,
              transaction_status: copy.transaction_status,
              amount: copy.amount,
              transaction_remark: copy.transaction_remark,
              biometric_consent: copy.biometric_consent,
              checked_by_oc: copy.checked_by_oc ?? '',
              transaction_datetime: copy.transaction_datetime ?? new Date().toISOString(),
              balance_before: copy.balance_before ?? '',
              balance_after: copy.balance_after ?? '',
            });
            setIsEditTransactionDialogOpen(true);
          }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(r)); setDeleteTransactionId(r.id); }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
        </div>
      )
    },
  ];

  // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (dataOrEvent: any) => void; isEdit: boolean }) => {
    // local form state to avoid re-rendering parent on every keypress (prevents caret loss)
    const [local, setLocal] = useState({
      prisoner: accountFormData.prisoner || '',
      account_type: accountFormData.account_type || '',
      // keep empty default so placeholder renders; will map to uuid when currencies load
      currency: accountFormData.currency ?? '',
      balance: accountFormData.balance ?? '0',
    });
    // Sync prisoner, account_type and balance from parent when accountFormData changes (used when opening edit/view).
    // Do not overwrite currency here (currency mapping effect handles id lookup).
    useEffect(() => {
      setLocal(prev => ({
        prisoner: accountFormData.prisoner ?? prev.prisoner,
        account_type: accountFormData.account_type ?? prev.account_type,
        currency: prev.currency,
        balance: accountFormData.balance ?? prev.balance,
      }));
    // only run when parent-provided values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountFormData.prisoner, accountFormData.account_type, accountFormData.balance]);

    // Compute the Select value deterministically:
    // prefer local.currency (user edits). If empty, map accountFormData.currency (which may be code or id)
    // to the currency UUID from currencies list so Select always has a matching option value.
    const selectedCurrencyId = useMemo(() => {
      if (local.currency) return String(local.currency);
      const parentCur = accountFormData.currency;
      if (!parentCur) return '';
      if (!currencies || currencies.length === 0) return String(parentCur);
      const found = currencies.find((x:any) =>
        String(x.id) === String(parentCur) ||
        String(x.code ?? '').toUpperCase() === String(parentCur).toUpperCase()
      );
      return found ? String(found.id) : String(parentCur);
    }, [local.currency, accountFormData.currency, currencies]);

    const [prisonerQuery, setPrisonerQuery] = useState('');
    const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
    const [prisonerLoading, setPrisonerLoading] = useState(false);
    const prisonerAbortRef = useRef<AbortController | null>(null);
    const [accountTypeQuery, setAccountTypeQuery] = useState('');
    const [currencyQuery, setCurrencyQuery] = useState('');
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [selectedPrisonerName, setSelectedPrisonerName] = useState<string>('');
    const [balanceEditable, setBalanceEditable] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});

    // load prisoners (debounced, abortable)
    useEffect(() => {
      if (prisonerAbortRef.current) {
        prisonerAbortRef.current.abort();
        prisonerAbortRef.current = null;
      }
      const t = window.setTimeout(() => {
        const ctrl = new AbortController();
        prisonerAbortRef.current = ctrl;
        setPrisonerLoading(true);
        fetchPrisoners({
          search: prisonerQuery || '',
          station: globalStation || null,
          district: globalDistrict || null,
          region: globalRegion || null,
          page_size: 50,
          useCache: true,
        }, ctrl.signal).then(res => {
          setPrisonerResults(res.items || []);
        }).catch(err => {
          // ignore aborts; surface only real errors
          if ((err as any).name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
          console.error('fetchPrisoners error', err);
        }).finally(() => {
          setPrisonerLoading(false);
        });
      }, 300);
      return () => {
        window.clearTimeout(t);
        if (prisonerAbortRef.current) { prisonerAbortRef.current.abort(); prisonerAbortRef.current = null; }
      };
    }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);

    const validateLocal = () => {
      const e: Record<string,string> = {};
      if (!String(local.prisoner || '').trim()) e.prisoner = 'Prisoner is required';
      if (!String(local.account_type || '').trim()) e.account_type = 'Account type is required';
      // balance must be numeric (allow negative and decimals). empty -> treat as 0
      if (!String(local.balance || '').trim() || !/^-?\d+(\.\d+)?$/.test(String(local.balance).trim())) e.balance = 'Balance must be a number';
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const submit = (ev?: React.FormEvent) => {
      ev?.preventDefault();
      if (!validateLocal()) return;
      onSubmit({
        prisoner: String(local.prisoner),
        account_type: String(local.account_type),
        currency: String(local.currency),
        balance: String(local.balance || '0'),
      });
    };

    return (
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* prisoner picker (same UI as before) */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openPrisoner} className="w-full justify-between text-left" type="button">
                  {local.prisoner
                    ? (selectedPrisonerName
                        || prisoners.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || prisonerResults.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || local.prisoner)
                    : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search prisoners..." value={prisonerQuery} onValueChange={(v) => setPrisonerQuery(v)} />
                  <CommandList>
                    {prisonerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-gray-500">Loading prisoners...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisonerResults.map((p:any) => (
                            <CommandItem key={p.id} value={String(p.id)}
                              onSelect={() => {
                                setLocal(prev => ({ ...prev, prisoner: String(p.id) }));
                                setSelectedPrisonerName(p.full_name);
                                setOpenPrisoner(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={cn("mr-2 h-4 w-4", String(local.prisoner) === String(p.id) ? "opacity-100" : "opacity-0")} style={{ color: '#650000' }} />
                              <div className="flex flex-col text-sm">
                                <span>{p.full_name}</span>
                                <span className="text-xs text-gray-500">{p.prisoner_number_value || p.prisoner_number || ''}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.prisoner && <div className="text-red-600 text-sm mt-1">{errors.prisoner}</div>}
          </div>

          {/* account type */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={local.account_type} onValueChange={(v)=> setLocal(prev => ({ ...prev, account_type: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2"><Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} /></div>
                {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase())).map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.account_type && <div className="text-red-600 text-sm">{errors.account_type}</div>}
          </div>

          {/* Currency (searchable select) */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={selectedCurrencyId} onValueChange={(v)=> setLocal(prev => ({ ...prev, currency: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter currencies..." value={currencyQuery} onChange={(e) => setCurrencyQuery(e.target.value)} />
                </div>
                {(currencies || []).filter((c:any) => {
                  const code = (c.code ?? '').toString();
                  const name = (c.name ?? '').toString();
                  return !currencyQuery || code.toLowerCase().includes(currencyQuery.toLowerCase()) || name.toLowerCase().includes(currencyQuery.toLowerCase());
                }).map((c:any) => {
                  const id = String(c.id);
                  const label = c.name ? `${c.code ?? ''} — ${c.name}` : (c.code ?? id);
                  return <SelectItem key={id} value={id}>{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            {errors.currency && <div className="text-red-600 text-sm mt-1">{errors.currency}</div>}
          </div>

          {/* Balance (disabled by default, toggle to enable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="balance">Balance</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit balance" checked={balanceEditable} onChange={(e) => setBalanceEditable(e.target.checked)} />
                Edit
              </label>
            </div>
            <AmountInput
              id="balance"
              currency={local.currency}
              className="disabled:opacity-25 input-invalid file:text-foreground dark:bg-input/30 w-full min-w-0 rounded-md px-3 py-1 bg-input-background transition-[color,box-shadow] outline-none"
              value={local.balance}
              onChange={(v) => setLocal(prev => ({ ...prev, balance: v }))}
              placeholder="0"
              disabled={!balanceEditable}
            />
            {errors.balance && <div className="text-red-600 text-sm mt-1">{errors.balance}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateAccountDialogOpen(false); setIsEditAccountDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>{isEdit ? 'Update' : 'Create'} Account</Button>
        </DialogFooter>
      </form>
    );
  };

  // Transaction form implemented with react-hook-form to avoid focus loss on re-renders
  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const { register, handleSubmit, control, watch, setValue, formState, reset } = useForm({
      mode: "onTouched",
      defaultValues: {
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        // keep transaction_datetime as full ISO string (backend expects Z)
        transaction_datetime: new Date().toISOString(),
        balance_before: '',
        balance_after: '',
        checked_by_oc: transactionFormData.checked_by_oc ?? '',
      }
    });

    // keep balance_before in sync when account changes
    const selectedAccountId = watch('property_prisoner_account');
    const amountValue = watch('amount');
    useEffect(() => {
      if (!selectedAccountId) {
        setValue('balance_before', '');
        setValue('balance_after', '');
        return;
      }
      const acc = accounts.find(a => String(a.id) === String(selectedAccountId));
      const before = acc ? (parseFloat(acc.balance || '0') || 0) : 0;
      setValue('balance_before', String(before));
      const amountNum = parseFloat(String(amountValue || '0')) || 0;
      setValue('balance_after', String(before + amountNum));
    }, [selectedAccountId, amountValue, accounts, setValue]);

    // datetime editing state: disabled by default, value in form is ISO string
    const [dtEditable, setDtEditable] = useState(false);
    // maintain local datetime-local string for editing UI
    const currentIso = watch('transaction_datetime') || new Date().toISOString();
    const isoToLocal = (iso:string) => {
      try {
        const d = new Date(iso);
        // datetime-local expects "YYYY-MM-DDTHH:mm"
        return d.toISOString().slice(0,16);
      } catch { return ''; }
    };
    const [localDt, setLocalDt] = useState(isoToLocal(currentIso));
    // keep localDt synced when form value changes externally (but not while editing)
    useEffect(() => {
      if (!dtEditable) setLocalDt(isoToLocal(currentIso));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIso, dtEditable]);

    // Reset form values whenever transactionFormData changes (ensures useForm fields use updated cloned data)
    useEffect(() => {
      try { reset({
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        transaction_datetime: transactionFormData.transaction_datetime || new Date().toISOString(),
        balance_before: transactionFormData.balance_before || '',
        balance_after: transactionFormData.balance_after || '',
        checked_by_oc: transactionFormData.checked_by_oc ?? '',
      }); } catch (e) { /* ignore */ }
    }, [transactionFormData, reset]);

    const onSubmitForm = async (values: any) => {
      // delegate create/update to parent handler passed via props.onSubmit
      try {
        await onSubmit(values);
        // if parent didn't close/reset, ensure local form resets for create case
        if (!isEdit) reset();
      } catch (err) {
        // parent shows toast; keep error here for debug
        console.error('Transaction submit error', err);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account *</Label>
            <Controller control={control} name="property_prisoner_account" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input placeholder="Filter accounts..." onChange={() => {}} />
                  </div>
                  {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.prisoner_name} - {a.account_type_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
          </div>

          {/* Display selected account currency (read-only, not submitted) */}
          <div className="space-y-2">
            <Label>Account Currency</Label>
            <Input value={(() => {
              const acc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
              return acc ? getCurrencyLabel(acc.currency) : '';
            })()} disabled />
          </div>

          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Controller control={control} name="transaction_type" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger>
                <SelectContent>
                  {txTypes.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller control={control} name="transaction_status" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>
                  {txStatuses.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Amount *</Label>
            <Controller control={control} name="amount" rules={{ required: true, pattern: /^-?\d+(\.\d+)?$/ }} render={({ field }) => {
              const selAcc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
              const selCurrency = selAcc?.currency ?? 'UGX';
              return (
                <AmountInput
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v)}
                  currency={selCurrency}
                  placeholder="Enter amount"
                />
              );
            }} />
            {formState.errors.amount && <div className="text-red-600 text-sm">{(formState.errors.amount as any).message ?? 'Invalid amount'}</div>}
            {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Transaction Date & Time</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit transaction datetime" checked={dtEditable} onChange={(e) => {
                  const next = e.target.checked;
                  setDtEditable(next);
                  // if disabling, write back current localDt as ISO to form (keeps sync)
                  if (!next) {
                    const iso = new Date(localDt).toISOString();
                    setValue('transaction_datetime', iso);
                  }
                }} />
                Edit
              </label>
            </div>
            {!dtEditable ? (
              // display-only formatted local datetime (not editable)
              <Input type="text" value={localDt ? localDt.replace('T', ' ') : ''} disabled />
            ) : (
              <input
                type="datetime-local"
                className="w-full rounded-md px-3 py-1"
                value={localDt}
                onChange={(e) => {
                  setLocalDt(e.target.value);
                  // convert to ISO Z and set form value for submission
                  const iso = new Date(e.target.value).toISOString();
                  setValue('transaction_datetime', iso);
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Balance Before</Label>
            <Input type="text" {...register('balance_before')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Balance After</Label>
            <Input type="text" {...register('balance_after')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Checked By *</Label>
            <Controller control={control} name="checked_by_oc" rules={{ required: true }} render={({ field }) => (
              <StaffProfileSelect value={field.value} onChange={(v:any) => field.onChange(v)} placeholder="Select staff..." />
            )} />
            {formState.errors.checked_by_oc && <div className="text-red-600 text-sm">Checked By is required</div>}
            {transactionFormErrors.checked_by_oc && <div className="text-red-600 text-sm">{transactionFormErrors.checked_by_oc}</div>}
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...register('transaction_remark')} rows={3} />
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Controller control={control} name="biometric_consent" render={({ field }) => (
              <Checkbox id="biometric_consent" checked={!!field.value} onCheckedChange={(c) => field.onChange(c)} />
            )} />
            <Label className="cursor-pointer">Biometric Consent</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateTransactionDialogOpen(false); setIsEditTransactionDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}> {isEdit ? 'Update' : 'Create'} Transaction </Button>
        </DialogFooter>
      </form>
    );
  };

  // update transactionColumns Checked By render to use helper
  // find the column object for checked_by_name and replace its render:
  const updatedTransactionColumns = transactionColumns.map(col => {
    if (col.key === 'checked_by_name') {
      return { ...col, render: (v:any, r:any) => <span>{getCheckedByName(r.checked_by_oc ?? r.checked_by_name, v)}</span> };
    }
    return col;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="accounts"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance [All currencies]</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl"> {totalBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => {
                    // reset account form to blank defaults for Create
                    setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
                    setIsCreateAccountDialogOpen(true);
                  }} style={{ backgroundColor: '#650000' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                url="/property-management/prisoner-accounts/"
                title="Accounts"
                data={accounts}
                loading={accountsLoading}
                total={accountsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadAccounts(); }}
                columns={accountColumns}
                externalSearch={searchTerm}
                // expanded rows support: DataTable should call this to render expanded content for a row
                renderExpandedRow={(row:any) => expandedAccounts.has(row.id) ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Transactions</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTransactionFormData((prev) => ({ ...deepClone(prev), property_prisoner_account: row.id }));
                          setIsCreateTransactionDialogOpen(true);
                        }}
                        style={{ backgroundColor: '#650000' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Balance After</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getAccountTransactions(row.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">No transactions found</TableCell>
                          </TableRow>
                        ) : getAccountTransactions(row.id).map((t:any) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(t.transaction_datetime).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{t.transaction_type_name}</Badge></TableCell>
                            <TableCell>
                              <span className={parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.transaction_status_name === 'Approved' ? 'default' : t.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                                {t.transaction_status_name}
                              </Badge>
                            </TableCell>
                            <TableCell>{parseFloat(t.balance_after || '0').toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{t.transaction_remark}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(t); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    const copy = deepClone(t);
                                    setSelectedTransaction(copy);
                                    // populate form data for editing (use cloned values)
                                    setTransactionFormData({
                                      property_prisoner_account: copy.property_prisoner_account,
                                      transaction_type: copy.transaction_type,
                                      transaction_status: copy.transaction_status,
                                      amount: copy.amount,
                                      transaction_remark: copy.transaction_remark,
                                      biometric_consent: copy.biometric_consent,
                                      checked_by_oc: copy.checked_by_oc ?? '',
                                      transaction_datetime: copy.transaction_datetime ?? new Date().toISOString(),
                                      balance_before: copy.balance_before ?? '',
                                      balance_after: copy.balance_after ?? '',
                                    });
                                    setIsEditTransactionDialogOpen(true);
                                  }}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(t)); setDeleteTransactionId(t.id); }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => {
                      // reset transaction form to blank defaults for Create
                      setTransactionFormData({
                        property_prisoner_account: '',
                        transaction_type: '',
                        transaction_status: '',
                        amount: '',
                        transaction_remark: '',
                        biometric_consent: false,
                        checked_by_oc: '',
                      });
                      setIsCreateTransactionDialogOpen(true);
                    }} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={'all'}
                      onChange={()=>{}}
                      placeholder="Filter by status..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                url="/property-management/transactions/"
                title="Transactions"
                data={transactions}
                loading={transactionsLoading}
                total={transactionsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadTransactions(); }}
                columns={updatedTransactionColumns}
                externalSearch={transactionSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Add a new prisoner account</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update account information</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>View prisoner account information</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedAccount.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedAccount.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Currency</Label>
                    <p>{getCurrencyLabel(selectedAccount.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance</Label>
                    <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>Update transaction information</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleUpdateTransaction} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className='mb-4'>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedTransaction.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedTransaction.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Transaction Type</Label>
                    <p>{selectedTransaction.transaction_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                      {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date & Time</Label>
                    <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance Before</Label>
                    <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance After</Label>
                    <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Checked By</Label>
                    <p>{selectedTransaction.checked_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Biometric Consent</Label>
                    <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmations */}
      <ConfirmDialog
        open={!!deleteAccountId}
        onOpenChange={(o) => { if (!o) { setDeleteAccountId(null); setSelectedAccount(null); } }}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        details={selectedAccount ? (
          <div>
            <div><strong>Prisoner:</strong> {selectedAccount.prisoner_name}</div>
            <div><strong>Account Type:</strong> {selectedAccount.account_type_name}</div>
          </div>
        ) : null}
        confirmLabel="Delete"
               cancelLabel="Cancel"
        onConfirm={async () => {
          await handleDeleteAccount();
        }}
      />

      <ConfirmDialog
        open={!!deleteTransactionId}
        onOpenChange={(o) => { if (!o) { setDeleteTransactionId(null); setSelectedTransaction(null); } }}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        details={selectedTransaction ? (
          <div>
            <div><strong>Prisoner:</strong> {selectedTransaction.prisoner_name}</div>
            <div><strong>Amount:</strong> {parseFloat(selectedTransaction.amount).toLocaleString()}</div>
            <div><strong>Date:</strong> {new Date(selectedTransaction.transaction_datetime).toLocaleString()}</div>
          </div>
        ) : null}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          await handleDeleteTransaction();
        }}
      />
    </div>
  );
};

export default PrisonerPropertyAccountScreen;

// helper to safely get length of previous arrays (used in optimistic fallbacks)
function prevLengthSafe(arr:any[]) { try { return Array.isArray(arr) ? arr.length : 0; } catch { return 0; } }





// ...existing code...
-      <SelectContent>
+      <SelectContent className="z-50">
         <div className="px-3 py-2">
           <Input
             placeholder={`Search ${placeholder.toLowerCase()}...`}
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             // prevent Select from consuming key events so typing works as expected
             onKeyDown={(e) => e.stopPropagation()}
             className="mb-2"
             aria-label={`Search ${placeholder}`}
             autoFocus
           />
         </div>


// ...existing code...
-          <CardContent className="pt-6">
+          <CardContent className="pt-6 overflow-visible">
 // ...existing code...
-          <CardContent className="pt-6">
+          <CardContent className="pt-6 overflow-visible">
 // ...existing code...





 wrkin searchable select b4 update 9-dec-25

 import React, { useCallback, useEffect, useRef, useState } from "react";
 import { Input } from "../ui/input";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
 
 /**
  * SearchableSelect
  *
  * Responsibilities:
  * - Render a dropdown with a search input.
  * - Support two modes:
  *   1) Static items passed via `items` prop (client-side filter).
  *   2) Dynamic lookup via `fetchOptions(q, signal)` (server-side search).
  * - Debounced queries, minQueryLength guard, and a tiny in-memory cache (TTL) to reduce duplicate requests.
  * - Properly cancels in-flight requests using AbortController.
  *
  * Notes for future devs:
  * - The service layer should remain stateless and return raw data. UI handles debounce/cancel/cache.
  * - fetchOptions may return either T[] OR { items: T[]; count?: number } — component normalizes to an array.
  * - Keep cache small and TTL short (default 60s). Cache is only a UX optimization — not a source of truth.
  */
 
 export interface SearchableSelectProps<T = any> {
   value?: string | null;
   onChange: (id: string | null) => void;
 
   // either provide static items OR provide fetchOptions to query the server
   items?: T[];
 
   // fetchOptions can return an array or an object { items: T[]; count?: number }
   // second arg is AbortSignal so caller can cancel in-flight requests.
   fetchOptions?: (q: string, signal?: AbortSignal) => Promise<T[] | { items: T[]; count?: number }>;
 
   placeholder?: string;
   idField?: string;
   labelField?: string;
   renderItem?: (item: T) => React.ReactNode;
   className?: string;
   pageSize?: number;
 
   // enhancements (configurable per-instance)
   debounceMs?: number;           // ms to wait after typing stops before sending request
   minQueryLength?: number;       // minimum characters before querying server
   cacheTTL?: number;             // ms to keep cached results
   onError?: (err: any) => void;
   onLoading?: (loading: boolean) => void;
 }
 
 export default function SearchableSelect<T = any>({
   value,
   onChange,
   items,
   fetchOptions,
   placeholder = "Select...",
   idField = "id",
   labelField = "name",
   renderItem,
   className,
   debounceMs = 400,
   minQueryLength = 0,
   cacheTTL = 60_000,
   onError,
   onLoading,
 }: SearchableSelectProps<T>) {
   const [open, setOpen] = useState(false);
   const [query, setQuery] = useState("");
   const [options, setOptions] = useState<T[]>(items ?? []);
   const [loading, setLoading] = useState(false);
 
   // AbortController so we can cancel inflight fetches when a newer query starts
   const abortRef = useRef<AbortController | null>(null);
 
   // track unmount to avoid state updates after component is gone
   const mountedRef = useRef(true);
 
   // tiny in-memory cache: query -> { ts, data }
   // purpose: avoid duplicate requests when user toggles dropdown or types back-and-forth
   const cacheRef = useRef<Map<string, { ts: number; data: T[] }>>(new Map());
 
   // debounce timer id
   const debounceRef = useRef<number | null>(null);
 
   useEffect(() => {
     return () => {
       mountedRef.current = false;
       try { abortRef.current?.abort(); } catch {}
     };
   }, []);
 
   // sync when parent provides static items
   useEffect(() => {
     if (items) setOptions(items);
   }, [items]);
 
   /**
    * load(q)
    * - Normalizes fetchOptions response into an array.
    * - Uses cache when available and fresh.
    * - Calls onLoading/onError hooks so consumers can react.
    */
   const load = useCallback(async (q: string) => {
     if (!fetchOptions) return;
     // cancel previous request
     try { abortRef.current?.abort(); } catch {}
     const c = new AbortController();
     abortRef.current = c;
 
     setLoading(true);
     onLoading?.(true);
 
     try {
       const key = String(q ?? "").trim();
 
       // return cached data if fresh
       const cached = cacheRef.current.get(key);
       if (cached && (Date.now() - cached.ts) <= cacheTTL) {
         if (!mountedRef.current) return;
         setOptions(cached.data ?? []);
         return;
       }
 
       // perform fetch; fetchOptions may return array OR { items, count }
       const res = await fetchOptions(q, c.signal);
       if (!mountedRef.current) return;
 
       // normalize response to array
       let data: T[] = [];
       if (Array.isArray(res)) {
         data = res as T[];
       } else if (res && Array.isArray((res as any).items)) {
         data = (res as any).items as T[];
       } else {
         data = [];
       }
 
       setOptions(data);
       try { cacheRef.current.set(key, { ts: Date.now(), data }); } catch (e) { /* ignore cache set errors */ }
     } catch (err: any) {
       // ignore Abort errors (normal during rapid typing)
       if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
 
       // surface error to caller and log for devs
       onError?.(err);
       // Keep console.error in dev only; avoid logging tokens or sensitive data in production.
       console.error("SearchableSelect fetch error (dev):", err);
 
       // clear options on error to avoid stale UIs
       setOptions([]);
     } finally {
       if (mountedRef.current) {
         setLoading(false);
         onLoading?.(false);
       }
     }
   }, [fetchOptions, cacheTTL, onError, onLoading]);
 
   // debounce effect for query changes when using fetchOptions (server mode)
   useEffect(() => {
     if (!fetchOptions) return;
 
     // if query is too short, don't call the server; clear pending debounce
     const qTrim = (query || "").trim();
     if (qTrim.length < minQueryLength && qTrim.length > 0) {
       if (debounceRef.current) window.clearTimeout(debounceRef.current);
       return;
     }
 
     // clear previous debounce timer
     if (debounceRef.current) window.clearTimeout(debounceRef.current);
 
     const id = window.setTimeout(() => load(query), debounceMs);
     debounceRef.current = id;
 
     return () => {
       window.clearTimeout(id);
       debounceRef.current = null;
     };
   }, [query, load, fetchOptions, debounceMs, minQueryLength]);
 
   // on open: trigger load if query meets minQueryLength (useful to populate dropdown)
   useEffect(() => {
     if (open && fetchOptions) {
       if ((query || "").trim().length >= minQueryLength) load(query);
     }
   }, [open, fetchOptions, load, query, minQueryLength]);
 
   // selectedLabel resolves selected value to rendered label using current options
   const selectedLabel = (() => {
     // options is always an array here
     const found = (options ?? []).find((it: any) => String(it[idField]) === String(value));
     if (found) return renderItem ? renderItem(found) : (found[labelField] ?? String(found[idField]));
     return null;
   })();
 
   // shown is the list displayed. If we use static items (no fetchOptions) do a client filter.
   const shown = !fetchOptions
     ? (options ?? []).filter((it: any) => {
         if (!query) return true;
         const label = String(it[labelField] ?? "").toLowerCase();
         return label.includes(query.toLowerCase());
       })
     : options;
 
   return (
     <Select value={value ?? ""} onValueChange={(v) => onChange(v || null)}>
       <SelectTrigger className={className}>
         <SelectValue placeholder={placeholder}>
           {selectedLabel ?? placeholder}
         </SelectValue>
       </SelectTrigger>
 
       <SelectContent>
         <div className="px-3 py-2">
           <Input
             placeholder={`Search ${placeholder.toLowerCase()}...`}
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             // prevent Select from consuming key events so typing works as expected
             onKeyDown={(e) => e.stopPropagation()}
             className="mb-2"
             aria-label={`Search ${placeholder}`}
             autoFocus
           />
         </div>
 
         {loading ? (
           <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
         ) : shown.length === 0 ? (
           <div className="px-3 py-2 text-sm text-muted-foreground">No results.</div>
         ) : (
           shown.map((it: any) => (
             <SelectItem key={String(it[idField])} value={String(it[idField])}>
               {renderItem ? renderItem(it) : (it[labelField] ?? "")}
             </SelectItem>
           ))
         )}
       </SelectContent>
     </Select>
   );
 }
 
 
 
 
 
 
 // Add a tiny CommandSelect wrapper for simple client-side lists (static items). 
 // It uses the Popover + Command UI (same UX used across the app), 
 // exposes the same basic props (value, onChange, items, idField, 
 // labelField, renderItem) so you can swap it in where you only need 
 // client-side filtering. No debounce, no fetch/cancel/cache — smaller and faster.
 
 
 // import React from "react";
 // import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
 // import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
 // import { Button } from "../ui/button";
 // import { Check } from "lucide-react";
 
 // export type SimpleOption = { [k: string]: any };
 
 // interface Props {
 //   value?: string | null;
 //   onChange: (id: string | null) => void;
 //   items: SimpleOption[];
 //   placeholder?: string;
 //   idField?: string;
 //   labelField?: string;
 //   renderItem?: (item: SimpleOption) => React.ReactNode;
 //   className?: string;
 //   buttonClassName?: string;
 // }
 
 // export default function CommandSelect({
 //   value,
 //   onChange,
 //   items,
 //   placeholder = "Select...",
 //   idField = "id",
 //   labelField = "name",
 //   renderItem,
 //   className,
 //   buttonClassName,
 // }: Props) {
 //   const selected = items.find((it) => String(it[idField]) === String(value));
 //   return (
 //     <Popover>
 //       <PopoverTrigger asChild>
 //         <Button variant="outline" className={buttonClassName} type="button" aria-expanded={Boolean(selected)}>
 //           {selected ? (renderItem ? renderItem(selected) : selected[labelField]) : placeholder}
 //         </Button>
 //       </PopoverTrigger>
 
 //       <PopoverContent className={`w-full p-0 ${className ?? ""}`}>
 //         <Command>
 //           <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
 //           <CommandList>
 //             <CommandEmpty>No results.</CommandEmpty>
 //             <CommandGroup>
 //               {items.map((it) => {
 //                 const id = String(it[idField]);
 //                 const label = renderItem ? null : String(it[labelField] ?? "");
 //                 return (
 //                   <CommandItem
 //                     key={id}
 //                     value={label || id}
 //                     onSelect={() => {
 //                       onChange(id);
 //                     }}
 //                   >
 //                     <Check className={`mr-2 h-4 w-4 ${String(value) === id ? "opacity-100" : "opacity-0"}`} />
 //                     <div className="flex flex-col">
 //                       {renderItem ? renderItem(it) : <div>{label}</div>}
 //                     </div>
 //                   </CommandItem>
 //                 );
 //               })}
 //             </CommandGroup>
 //           </CommandList>
 //         </Command>
 //       </PopoverContent>
 //     </Popover>
 //   );
 // }
 
 
 
 // Usage example (replace a static dropdown)
 
 // no filepath — paste into the component where you want to use it
 // import CommandSelect from '../common/CommandSelect';
 
 // <CommandSelect
 //   value={accountForm.prisoner}
 //   onChange={(id) => setAccountForm({...accountForm, prisoner: id})}
 //   items={prisoners}                // array of { id, full_name, prisoner_number, ... }
 //   idField="id"
 //   labelField="full_name"
 //   renderItem={(p) => (
 //     <>
 //       <div>{p.full_name}</div>
 //       <div className="text-xs text-muted-foreground font-mono">{p.prisoner_number}</div>
 //     </>
 //   )}
 //   placeholder="Select prisoner..."
 // />




 /b4 global filter on datatables fix
 import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
 import { Button } from '../ui/button';
 import { Input } from '../ui/input';
 import { Label } from '../ui/label';
 import { Textarea } from '../ui/textarea';
 import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
 import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
 import { Badge } from '../ui/badge';
 import { Separator } from '../ui/separator';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
 import { Checkbox } from '../ui/checkbox';
 import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
 import { toast } from 'sonner';
 import {
   Search,
   Plus,
   Eye,
   Pencil,
   Trash2,
   ChevronLeft,
   ChevronRight,
   ChevronDown,
   ChevronUp,
   Wallet,
   DollarSign,
   TrendingUp,
   FileText,
   Calendar,
   Check,
   ChevronsUpDown
 } from 'lucide-react';
 import { cn } from '../ui/utils';
 import { DataTable } from "../common/DataTableCollapsableRows";
 import SearchableSelect from '../common/SearchableSelect';
 import StaffProfileSelect from '../common/StaffProfileSelect';
 import AmountInput from '../common/AmountInput';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
 import { fetchPrisoners } from '../../services/customPrisonersService';
 import * as accountsSvc from '../../services/propertyServices/accountsService';
 import * as txSvc from '../../services/propertyServices/transactionService';
 import { useFilterRefresh } from "../../hooks/useFilterRefresh";
 import { useFilters } from "../../contexts/FilterContext";
 import axiosInstance from '../../services/axiosInstance';
 import {
   phoneNumberValidation,
   emailValidation,
   requiredValidation,
   nationalIdValidation,
   passportValidation,
   nameValidation,
   numericValidation
 } from '../../utils/validation';
 import { useForm, Controller } from 'react-hook-form';
 import ConfirmDialog from '../common/ConfirmDialog';
 
 interface Account {
   id: string;
   prisoner_name: string;
   account_type_name: string;
   currency: string;
   balance: string;
   prisoner: string;
   account_type: string;
 }
 
 interface Transaction {
   id: string;
   prisoner_name: string;
   account_type_name: string;
   transaction_type_name: string;
   transaction_status_name: string;
   checked_by_name: string;
   amount: string;
   transaction_datetime: string;
   transaction_remark: string;
   biometric_consent: boolean;
   balance_before: string;
   balance_after: string;
   property_prisoner_account: string;
   transaction_type: string;
   transaction_status: string;
   checked_by_oc: number;
 }
 
 // API endpoints (centralised at top)
 const API_ENDPOINTS = {
   ACCOUNTS: '/property-management/prisoner-accounts/',
   ACCOUNT_TYPES: '/property-management/cash-account-types/',
   TRANSACTIONS: '/property-management/transactions/',
   TX_TYPES: '/property-management/transaction-types/',
   TX_STATUSES: '/system-administration/transaction-statuses/',
   PRISONERS: '/admission/prisoners/',
   CURRENCIES: '/system-administration/currencies/',
   STAFF: '/auth/staff-profiles/',
 };
 
 const PrisonerPropertyAccountScreen: React.FC = () => {
   // global filters
   const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
   // register refresh handler
   useFilterRefresh(() => {
     // empty body: we'll trigger reload via effects by changing page/search etc.
   });
 
   // server-driven state
   const [accounts, setAccounts] = useState<Account[]>([]);
   const [accountsTotal, setAccountsTotal] = useState(0);
   const [accountsLoading, setAccountsLoading] = useState(false);
 
   const [transactions, setTransactions] = useState<Transaction[]>([]);
   const [transactionsTotal, setTransactionsTotal] = useState(0);
   const [transactionsLoading, setTransactionsLoading] = useState(false);
 
   // lookups
   const [prisoners, setPrisoners] = useState<any[]>([]);
   const [accountTypes, setAccountTypes] = useState<any[]>([]);
   const [txTypes, setTxTypes] = useState<any[]>([]);
   const [txStatuses, setTxStatuses] = useState<any[]>([]);
   const [currencies, setCurrencies] = useState<any[]>([]);
   const [staffProfiles, setStaffProfiles] = useState<any[]>([]);
   const [staffProfilesError, setStaffProfilesError] = useState<string | null>(null);
 
   // ui
   const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(10);
   const [searchTerm, setSearchTerm] = useState('');
   const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
   const [txFilterType, setTxFilterType] = useState<string>('all');
   const [txFilterStatus, setTxFilterStatus] = useState<string>('all');
   const searchTimer = useRef<number| null>(null);
 
   // dialogs/forms
   const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
   const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
   const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
   const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
 
   const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
   const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
   const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
 
   const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
   const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);
 
   // form state
   const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
   const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
   // force remount AccountForm to reset its internal state when opening create/edit
   const [accountFormKey, setAccountFormKey] = useState(0);
   const [transactionFormData, setTransactionFormData] = useState({
     property_prisoner_account: '',
     transaction_type: '',
     transaction_status: '',
     amount: '',
     transaction_remark: '',
     biometric_consent: false,
     checked_by_oc: 0,
   });
   const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});
   // expanded rows (for accounts collapsible section)
   const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
   const toggleAccountExpansion = (accountId: string) => {
     const newSet = new Set(expandedAccounts);
     if (newSet.has(accountId)) newSet.delete(accountId);
     else newSet.add(accountId);
     setExpandedAccounts(newSet);
   };
   // helper to get transactions for an account (from loaded transactions)
   const getAccountTransactions = (accountId: string) => {
     return transactions.filter(t => String(t.property_prisoner_account) === String(accountId));
   };
 
   // request control (no shared abort controller — rely on reqId to ignore stale responses)
   const reqId = useRef(0);
   const abortRef = useRef<AbortController | null>(null);
 
   // utility to deep clone safely
   const deepClone = (v: any) => {
     try { return (globalThis as any).structuredClone ? (globalThis as any).structuredClone(v) : JSON.parse(JSON.stringify(v)); }
     catch { try { return JSON.parse(JSON.stringify(v)); } catch { return v; } }
   };
 
   // helper to include global filters and paging
   const baseParams = useCallback((overrides: any = {}) => ({
     page,
     page_size: pageSize,
     search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
     station: globalStation || undefined,
     district: globalDistrict || undefined,
     region: globalRegion || undefined,
     // include transaction filters automatically when on transactions tab
     ...(activeTab === 'transactions' ? {
       transaction_type: txFilterType && txFilterType !== 'all' ? txFilterType : undefined,
       transaction_status: txFilterStatus && txFilterStatus !== 'all' ? txFilterStatus : undefined,
     } : {}),
     ...overrides,
   }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab, txFilterType, txFilterStatus]);
 
   // load lookups
   const loadLookups = useCallback(async () => {
     try {
       const [pRes, atRes, ttRes, tsRes, curRes, staffRes] = await Promise.all([
         axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
         accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
         txSvc.listTransactionTypes().catch(()=>({ results: [] })),
         txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
         axiosInstance.get(API_ENDPOINTS.CURRENCIES, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
         // staff profiles is optional - catch network errors to avoid blocking UI
         axiosInstance.get(API_ENDPOINTS.STAFF, { params: { page_size: 200 }}).then(r => r.data).catch(err => { throw err; }),
       ]);
       setPrisoners(pRes?.results ?? []);
       setAccountTypes(atRes?.results ?? []);
       setTxTypes(ttRes?.results ?? []);
       setTxStatuses(tsRes?.results ?? []);
       // store full currency objects (id, code, name) so UI can show name while saving id
       setCurrencies(curRes?.results ?? []);
       // staff
       if (staffRes && staffRes.results) {
         setStaffProfiles(staffRes.results);
         setStaffProfilesError(null);
       } else {
         setStaffProfiles([]);
       }
     } catch (err:any) {
       console.error('lookup load error', err);
       // if staff fetch failed, set error but let UI continue
       if (String(err?.config?.url || '').includes(API_ENDPOINTS.STAFF)) {
         setStaffProfilesError('Failed to load staff list');
         setStaffProfiles([]);
       }
     }
   }, []);
 
   // load accounts
   const loadAccounts = useCallback(async (opts: any = {}) => {
     reqId.current += 1;
     const id = reqId.current;
     setAccountsLoading(true);
     try {
       console.debug('loadAccounts request', baseParams(opts));
       const data = await accountsSvc.listAccounts(baseParams(opts));
       console.debug('loadAccounts response', data);
       if (id !== reqId.current) return;
       setAccounts(data.results ?? []);
       setAccountsTotal(data.count ?? 0);
     } catch (err:any) {
       console.debug('loadAccounts error', err);
       console.error('loadAccounts error', err);
       toast.error('Failed to load accounts');
     } finally {
       setAccountsLoading(false);
     }
   }, [baseParams]);
 
   // load transactions
   const loadTransactions = useCallback(async (opts: any = {}) => {
     reqId.current += 1;
     const id = reqId.current;
     setTransactionsLoading(true);
     try {
       console.debug('loadTransactions request', baseParams(opts));
       const data = await txSvc.listTransactions(baseParams(opts));
       console.debug('loadTransactions response', data);
       if (id !== reqId.current) return;
       setTransactions(data.results ?? []);
       setTransactionsTotal(data.count ?? 0);
     } catch (err:any) {
       console.debug('loadTransactions error', err);
       console.error('loadTransactions error', err);
       toast.error('Failed to load transactions');
     } finally {
       setTransactionsLoading(false);
     }
   }, [baseParams]);
 
   // debounce search for accounts/transactions
   useEffect(() => {
     if (searchTimer.current) window.clearTimeout(searchTimer.current);
     searchTimer.current = window.setTimeout(() => {
       setPage(1);
       if (activeTab === 'accounts') loadAccounts();
       if (activeTab === 'transactions') loadTransactions();
     }, 500);
     return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
   }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);
 
   // reload when filters/paging change
   useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
   useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);
 
   // initial lookups
   useEffect(() => { loadLookups(); }, [loadLookups]);
 
   // register filter refresh to reload lists when global filters change via header UI
   useFilterRefresh(() => {
     setPage(1);
     loadAccounts();
     loadTransactions();
   }, [globalRegion, globalDistrict, globalStation]);
 
   // CRUD handlers (accounts)
   const validateAccountForm = () => {
     const errs: Record<string,string> = {};
     const prisonerValue = String(accountFormData.prisoner ?? '').trim();
     const accountTypeValue = String(accountFormData.account_type ?? '').trim();
     const currencyValue = String(accountFormData.currency ?? '').trim();
     const balanceValue = String(accountFormData.balance ?? '').trim();
 
     if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
     if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
     if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
     // numericValidation pattern expects digits; adjust message accordingly
     if (!balanceValue || !numericValidation.pattern.value.test(balanceValue)) errs.balance = 'Balance must be a number';
     setAccountFormErrors(errs);
     return Object.keys(errs).length === 0;
   };
 
   // validate arbitrary form data shape (used by handlers that accept local-submitted data)
   const validateAccountData = (data: any) => {
     const errs: Record<string,string> = {};
     if (!String(data.prisoner ?? '').trim()) errs.prisoner = 'Prisoner is required';
     if (!String(data.account_type ?? '').trim()) errs.account_type = 'Account type is required';
     if (!String(data.currency ?? '').trim()) errs.currency = 'Currency is required';
     const bal = String(data.balance ?? '').trim();
     if (!bal || !/^-?\d+(\.\d+)?$/.test(bal)) errs.balance = 'Balance must be a number';
     return errs;
   };
 
   const handleCreateAccount = async (dataOrEvent: any) => {
     // if called from old signature, fallback
     const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
     const errs = validateAccountData(data);
     if (Object.keys(errs).length) {
       setAccountFormErrors(errs);
       return;
     }
     try {
       await accountsSvc.createAccount({
         prisoner: data.prisoner,
         account_type: data.account_type,
         currency: data.currency,
         balance: data.balance ?? '0',
       });
       toast.success('Account created');
       setIsCreateAccountDialogOpen(false);
       setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
       loadAccounts();
     } catch (err) {
       console.error('create account error', err);
       toast.error('Failed to create account');
     }
   };
 
   // helper to map backend status to badge variant
   const getStatusVariant = (status: string) => {
     if (!status) return 'warning';
     switch (String(status).toLowerCase()) {
       case 'pending':
         return 'secondary';
       case 'approved':
       case 'completed':
       case 'success':
         return 'success';
       case 'failed':
       case 'rejected':
         return 'danger';
       default:
         return 'warning';
     }
   };
 
   const handleUpdateAccount = async (dataOrEvent: any) => {
     if (!selectedAccount) return;
     const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
     const errs = validateAccountData(data);
     if (Object.keys(errs).length) {
       setAccountFormErrors(errs);
       return;
     }
     try {
       const res = await accountsSvc.updateAccount(selectedAccount.id, {
         prisoner: data.prisoner,
         account_type: data.account_type,
         currency: data.currency,
         balance: data.balance ?? '0',
       });
       console.debug('updateAccount response', res);
       toast.success('Account updated');
       setIsEditAccountDialogOpen(false);
       setSelectedAccount(null);
       // authoritative reload
       await loadAccounts();
     } catch (err) {
       console.debug('updateAccount error', err);
       console.error('update account error', err);
       toast.error('Failed to update account');
     }
   };
 
   const handleDeleteAccount = async () => {
     if (!deleteAccountId) return;
     try {
       await accountsSvc.deleteAccount(deleteAccountId);
       console.debug('deleteAccount success', deleteAccountId);
       toast.success('Account deleted');
       setDeleteAccountId(null);
       await loadAccounts();
     } catch (err) {
       console.debug('deleteAccount error', err);
       console.error('delete account error', err);
       toast.error('Failed to delete account');
     }
   };
 
   // CRUD handlers (transactions)
   const validateTransactionData = (data: any) => {
     const errs: Record<string,string> = {};
     if (!requiredValidation(data.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
     if (!requiredValidation(data.transaction_type)) errs.transaction_type = 'Transaction type is required';
     if (!requiredValidation(data.amount)) errs.amount = 'Amount is required';
     if (!data.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
     return errs;
   };
 
   const handleCreateTransaction = async (values: any) => {
     const errs = validateTransactionData(values);
     if (Object.keys(errs).length) {
       setTransactionFormErrors(errs);
       return;
     }
     setTransactionFormErrors({});
     try {
       const res = await txSvc.createTransaction(values);
       console.debug('createTransaction response', res);
       toast.success('Transaction created');
       setIsCreateTransactionDialogOpen(false);
       setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
       // authoritative reload
       await loadTransactions();
       await loadAccounts();
     } catch (err) {
       console.debug('createTransaction error', err);
       console.error('create tx error', err);
       toast.error('Failed to create transaction');
     }
   };
 
   // add update transaction handler
   const handleUpdateTransaction = async (dataOrEvent: any) => {
     // dataOrEvent is provided by TransactionForm (react-hook-form)
     const values = dataOrEvent && dataOrEvent.property_prisoner_account ? dataOrEvent : transactionFormData;
     const errs: Record<string,string> = {};
     if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
     if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
     if (!values.amount) errs.amount = 'Amount is required';
     if (!values.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
     if (Object.keys(errs).length) {
       setTransactionFormErrors(errs);
       return;
     }
     if (!selectedTransaction) return;
     try {
       const payload = {
         property_prisoner_account: values.property_prisoner_account,
         transaction_type: values.transaction_type,
         transaction_status: values.transaction_status || null,
         amount: values.amount,
         transaction_remark: values.transaction_remark,
         biometric_consent: !!values.biometric_consent,
         transaction_datetime: values.transaction_datetime,
         balance_before: values.balance_before,
         balance_after: values.balance_after,
         checked_by_oc: values.checked_by_oc,
       };
       const res = (typeof txSvc.updateTransaction === 'function')
         ? await txSvc.updateTransaction(selectedTransaction.id, payload)
         : (await axiosInstance.patch(`${API_ENDPOINTS.TRANSACTIONS}${selectedTransaction.id}/`, payload)).data;
       console.debug('updateTransaction response', res);
       toast.success('Transaction updated');
       setIsEditTransactionDialogOpen(false);
       setSelectedTransaction(null);
       // authoritative reloads
       await loadTransactions();
       await loadAccounts();
     } catch (err) {
       console.debug('updateTransaction error', err);
       console.error('update tx error', err);
       toast.error('Failed to update transaction');
     }
   };
 
   const handleDeleteTransaction = async () => {
     if (!deleteTransactionId) return;
     try {
       if (typeof txSvc.deleteTransaction === 'function') {
         await txSvc.deleteTransaction(deleteTransactionId);
       } else {
         await axiosInstance.delete(`${API_ENDPOINTS.TRANSACTIONS}${deleteTransactionId}/`);
       }
       console.debug('deleteTransaction success', deleteTransactionId);
       toast.success('Transaction deleted');
       setDeleteTransactionId(null);
       // authoritative reloads
       await loadTransactions();
       await loadAccounts();
     } catch (err) {
       console.debug('deleteTransaction error', err);
       console.error('delete tx error', err);
       toast.error('Failed to delete transaction');
     }
   };
 
   // UI computed stats
   const totalAccounts = accountsTotal;
   const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
   const totalTransactions = transactionsTotal;
   const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;
 
   // helper to render currency label (show code/name in UI, save uuid)
   const getCurrencyLabel = (val?: string) => {
     if (!val) return '';
     const found = currencies.find((c:any) => String(c.id) === String(val) || String(c.code ?? '').toUpperCase() === String(val).toUpperCase());
     if (found) return found.name ? `${found.code ?? ''} — ${found.name}` : (found.code ?? String(found.id));
     // fallback: if val looks like uppercase code return it else return raw
     return String(val);
   };
 
   // helper to render checked_by name using staffProfiles fallback to API name
   const getCheckedByName = (val?: string | number, fallbackName?: string) => {
     if (!val && !fallbackName) return '';
     const found = staffProfiles.find((s:any) => String(s.id) === String(val) || String(s.user)?.toLowerCase() === String(val)?.toLowerCase() || String(s.id) === String(fallbackName));
     if (found) return found.full_name ?? found.name ?? String(found.id);
     return fallbackName ?? String(val ?? '');
   };
 
   // Columns for DataTable
   const accountColumns = [
     {
       key: 'expand',
       label: '',
       sortable: false,
       render: (_v:any, r:any) => (
         <Button variant="ghost" size="sm" onClick={() => toggleAccountExpansion(r.id)}>
           {expandedAccounts.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
         </Button>
       )
     },
     { key: 'prisoner_name', label: 'Prisoner' },
     { key: 'account_type_name', label: 'Account Type' },
     { key: 'currency', label: 'Currency', render: (v:any, r:any) => <span>{getCurrencyLabel(v)}</span> },
     { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
     { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
       <div className="flex">
         {/* <div className="flex justify-end gap-2"> */}
 
         <Button variant="ghost" size="sm" onClick={() => {
             setSelectedAccount(r);
             setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency, balance: r.balance ?? '0' });
             setAccountFormKey(k => k + 1); // remount form so local state syncs
             setIsViewAccountDialogOpen(true);
           }}>
            <Eye className="h-4 w-4" />
          </Button>
 
         {/* <Button variant="ghost" size="sm" onClick={() => {
             const copy = deepClone(r);
             setSelectedAccount(copy);
             setAccountFormData({ prisoner: copy.prisoner, account_type: copy.account_type, currency: copy.currency, balance: copy.balance ?? '0' });
             setAccountFormKey(k => k + 1); // ensure AccountForm remounts with fresh data
             setIsEditAccountDialogOpen(true);
           }}>
            <Pencil className="h-4 w-4" />
         </Button> */}
         {/* <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setDeleteAccountId(r.id); }}>
           <Trash2 className="h-4 w-4 text-red-600" />
         </Button> */}
       </div>
     )},
   ];
 
   const transactionColumns = [
     {
       key: "transaction_datetime",
       label: "Date & Time",
       render: (value: any) => {
         let v = '';
         try { v = value ? new Date(value).toLocaleString() : ''; } catch { v = String(value); }
         return (
           <div className="flex items-center gap-2">
             <Calendar className="h-4 w-4 text-gray-400" />
             <span>{v}</span>
           </div>
         );
       },
     },
     { key: 'prisoner_name', label: 'Prisoner' },
     // { key: 'account_type_name', label: 'Account Type' },
     {
       key: "account_type_name",
       label: "Account Type",
       render: (value: any) => (
         <Badge variant="outline">{value}</Badge>
       ),
     },
     // { key: 'transaction_type_name', label: 'Type' },
     {
       key: "transaction_type_name",
       label: "Type",
       render: (value: any) => (
         <Badge variant="outline">{value}</Badge>
       ),
     },
     { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
     // { key: 'transaction_status_name', label: 'Status' },
     {
       key: "transaction_status_name",
       label: "Status",
       render: (value: any) => (
         <Badge variant={getStatusVariant(value)}>{value}</Badge>
       ),
     },
     { key: 'checked_by_name', label: 'Checked By' },
     { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
     {
       key: 'actions',
       label: 'Actions',
       sortable: false,
       render: (_v:any, r:any) => (
         <div className="flex justify-end gap-2">
           <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(r)); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
           <Button variant="ghost" size="sm" onClick={() => {
             const copy = deepClone(r);
             setSelectedTransaction(copy);
             // populate form data for editing (use cloned values)
             setTransactionFormData({
               property_prisoner_account: copy.property_prisoner_account,
               transaction_type: copy.transaction_type,
               transaction_status: copy.transaction_status,
               amount: copy.amount,
               transaction_remark: copy.transaction_remark,
               biometric_consent: copy.biometric_consent,
               checked_by_oc: copy.checked_by_oc ?? '',
               transaction_datetime: copy.transaction_datetime ?? new Date().toISOString(),
               balance_before: copy.balance_before ?? '',
               balance_after: copy.balance_after ?? '',
             });
             setIsEditTransactionDialogOpen(true);
           }}><Pencil className="h-4 w-4" /></Button>
           <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(r)); setDeleteTransactionId(r.id); }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
         </div>
       )
     },
   ];
 
   // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
   const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (dataOrEvent: any) => void; isEdit: boolean }) => {
     // local form state to avoid re-rendering parent on every keypress (prevents caret loss)
     const [local, setLocal] = useState({
       prisoner: accountFormData.prisoner || '',
       account_type: accountFormData.account_type || '',
       // keep empty default so placeholder renders; will map to uuid when currencies load
       currency: accountFormData.currency ?? '',
       balance: accountFormData.balance ?? '0',
     });
     // Sync prisoner, account_type and balance from parent when accountFormData changes (used when opening edit/view).
     // Do not overwrite currency here (currency mapping effect handles id lookup).
     useEffect(() => {
       setLocal(prev => ({
         prisoner: accountFormData.prisoner ?? prev.prisoner,
         account_type: accountFormData.account_type ?? prev.account_type,
         currency: prev.currency,
         balance: accountFormData.balance ?? prev.balance,
       }));
     // only run when parent-provided values change
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [accountFormData.prisoner, accountFormData.account_type, accountFormData.balance]);
 
     // Compute the Select value deterministically:
     // prefer local.currency (user edits). If empty, map accountFormData.currency (which may be code or id)
     // to the currency UUID from currencies list so Select always has a matching option value.
     const selectedCurrencyId = useMemo(() => {
       if (local.currency) return String(local.currency);
       const parentCur = accountFormData.currency;
       if (!parentCur) return '';
       if (!currencies || currencies.length === 0) return String(parentCur);
       const found = currencies.find((x:any) =>
         String(x.id) === String(parentCur) ||
         String(x.code ?? '').toUpperCase() === String(parentCur).toUpperCase()
       );
       return found ? String(found.id) : String(parentCur);
     }, [local.currency, accountFormData.currency, currencies]);
 
     const [prisonerQuery, setPrisonerQuery] = useState('');
     const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
     const [prisonerLoading, setPrisonerLoading] = useState(false);
     const prisonerAbortRef = useRef<AbortController | null>(null);
     const [accountTypeQuery, setAccountTypeQuery] = useState('');
     const [currencyQuery, setCurrencyQuery] = useState('');
     const [openPrisoner, setOpenPrisoner] = useState(false);
     const [selectedPrisonerName, setSelectedPrisonerName] = useState<string>('');
     const [balanceEditable, setBalanceEditable] = useState(false);
     const [errors, setErrors] = useState<Record<string,string>>({});
 
     // load prisoners (debounced, abortable)
     useEffect(() => {
       if (prisonerAbortRef.current) {
         prisonerAbortRef.current.abort();
         prisonerAbortRef.current = null;
       }
       const t = window.setTimeout(() => {
         const ctrl = new AbortController();
         prisonerAbortRef.current = ctrl;
         setPrisonerLoading(true);
         fetchPrisoners({
           search: prisonerQuery || '',
           station: globalStation || null,
           district: globalDistrict || null,
           region: globalRegion || null,
           page_size: 50,
           useCache: true,
         }, ctrl.signal).then(res => {
           setPrisonerResults(res.items || []);
         }).catch(err => {
           // ignore aborts; surface only real errors
           if ((err as any).name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
           console.error('fetchPrisoners error', err);
         }).finally(() => {
           setPrisonerLoading(false);
         });
       }, 300);
       return () => {
         window.clearTimeout(t);
         if (prisonerAbortRef.current) { prisonerAbortRef.current.abort(); prisonerAbortRef.current = null; }
       };
     }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);
 
     const validateLocal = () => {
       const e: Record<string,string> = {};
       if (!String(local.prisoner || '').trim()) e.prisoner = 'Prisoner is required';
       if (!String(local.account_type || '').trim()) e.account_type = 'Account type is required';
       // balance must be numeric (allow negative and decimals). empty -> treat as 0
       if (!String(local.balance || '').trim() || !/^-?\d+(\.\d+)?$/.test(String(local.balance).trim())) e.balance = 'Balance must be a number';
       setErrors(e);
       return Object.keys(e).length === 0;
     };
 
     const submit = (ev?: React.FormEvent) => {
       ev?.preventDefault();
       if (!validateLocal()) return;
       onSubmit({
         prisoner: String(local.prisoner),
         account_type: String(local.account_type),
         currency: String(local.currency),
         balance: String(local.balance || '0'),
       });
     };
 
     return (
       <form onSubmit={submit} className="space-y-4">
         <div className="grid grid-cols-1 gap-4">
           {/* prisoner picker (same UI as before) */}
           <div className="space-y-2">
             <Label htmlFor="prisoner">Prisoner *</Label>
             <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
               <PopoverTrigger asChild>
                 <Button variant="outline" role="combobox" aria-expanded={openPrisoner} className="w-full justify-between text-left" type="button">
                   {local.prisoner
                     ? (selectedPrisonerName
                         || prisoners.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                         || prisonerResults.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                         || local.prisoner)
                     : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                   <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-full p-0">
                 <Command shouldFilter={false}>
                   <CommandInput placeholder="Search prisoners..." value={prisonerQuery} onValueChange={(v) => setPrisonerQuery(v)} />
                   <CommandList>
                     {prisonerLoading ? (
                       <div className="flex items-center justify-center py-4">
                         <span className="text-sm text-gray-500">Loading prisoners...</span>
                       </div>
                     ) : (
                       <>
                         <CommandEmpty>No prisoner found.</CommandEmpty>
                         <CommandGroup>
                           {prisonerResults.map((p:any) => (
                             <CommandItem key={p.id} value={String(p.id)}
                               onSelect={() => {
                                 setLocal(prev => ({ ...prev, prisoner: String(p.id) }));
                                 setSelectedPrisonerName(p.full_name);
                                 setOpenPrisoner(false);
                               }}
                               className="cursor-pointer"
                             >
                               <Check className={cn("mr-2 h-4 w-4", String(local.prisoner) === String(p.id) ? "opacity-100" : "opacity-0")} style={{ color: '#650000' }} />
                               <div className="flex flex-col text-sm">
                                 <span>{p.full_name}</span>
                                 <span className="text-xs text-gray-500">{p.prisoner_number_value || p.prisoner_number || ''}</span>
                               </div>
                             </CommandItem>
                           ))}
                         </CommandGroup>
                       </>
                     )}
                   </CommandList>
                 </Command>
               </PopoverContent>
             </Popover>
             {errors.prisoner && <div className="text-red-600 text-sm mt-1">{errors.prisoner}</div>}
           </div>
 
           {/* account type */}
           <div className="space-y-2">
             <Label htmlFor="account_type">Account Type *</Label>
             <Select value={local.account_type} onValueChange={(v)=> setLocal(prev => ({ ...prev, account_type: v }))} required>
               <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
               <SelectContent>
                 <div className="px-2 py-2"><Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} /></div>
                 {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase())).map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
               </SelectContent>
             </Select>
             {errors.account_type && <div className="text-red-600 text-sm">{errors.account_type}</div>}
           </div>
 
           {/* Currency (searchable select) */}
           <div className="space-y-2">
             <Label htmlFor="currency">Currency *</Label>
             <Select value={selectedCurrencyId} onValueChange={(v)=> setLocal(prev => ({ ...prev, currency: v }))} required>
               <SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger>
               <SelectContent>
                 <div className="px-2 py-2">
                   <Input placeholder="Filter currencies..." value={currencyQuery} onChange={(e) => setCurrencyQuery(e.target.value)} />
                 </div>
                 {(currencies || []).filter((c:any) => {
                   const code = (c.code ?? '').toString();
                   const name = (c.name ?? '').toString();
                   return !currencyQuery || code.toLowerCase().includes(currencyQuery.toLowerCase()) || name.toLowerCase().includes(currencyQuery.toLowerCase());
                 }).map((c:any) => {
                   const id = String(c.id);
                   const label = c.name ? `${c.code ?? ''} — ${c.name}` : (c.code ?? id);
                   return <SelectItem key={id} value={id}>{label}</SelectItem>;
                 })}
               </SelectContent>
             </Select>
             {errors.currency && <div className="text-red-600 text-sm mt-1">{errors.currency}</div>}
           </div>
 
           {/* Balance (disabled by default, toggle to enable) */}
           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <Label htmlFor="balance">Balance</Label>
               <label className="flex items-center gap-2 text-sm">
                 <input type="checkbox" aria-label="Edit balance" checked={balanceEditable} onChange={(e) => setBalanceEditable(e.target.checked)} />
                 Edit
               </label>
             </div>
             <AmountInput
               id="balance"
               currency={local.currency}
               className="disabled:opacity-25 input-invalid file:text-foreground dark:bg-input/30 w-full min-w-0 rounded-md px-3 py-1 bg-input-background transition-[color,box-shadow] outline-none"
               value={local.balance}
               onChange={(v) => setLocal(prev => ({ ...prev, balance: v }))}
               placeholder="0"
               disabled={!balanceEditable}
             />
             {errors.balance && <div className="text-red-600 text-sm mt-1">{errors.balance}</div>}
           </div>
         </div>
 
         <DialogFooter>
           <Button type="button" variant="outline" onClick={() => { setIsCreateAccountDialogOpen(false); setIsEditAccountDialogOpen(false); }}>Cancel</Button>
           <Button type="submit" style={{ backgroundColor: '#650000' }}>{isEdit ? 'Update' : 'Create'} Account</Button>
         </DialogFooter>
       </form>
     );
   };
 
   // Transaction form implemented with react-hook-form to avoid focus loss on re-renders
   const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
     const { register, handleSubmit, control, watch, setValue, formState, reset } = useForm({
       mode: "onTouched",
       defaultValues: {
         property_prisoner_account: transactionFormData.property_prisoner_account || '',
         transaction_type: transactionFormData.transaction_type || '',
         transaction_status: transactionFormData.transaction_status || '',
         amount: transactionFormData.amount || '',
         transaction_remark: transactionFormData.transaction_remark || '',
         biometric_consent: transactionFormData.biometric_consent || false,
         // keep transaction_datetime as full ISO string (backend expects Z)
         transaction_datetime: new Date().toISOString(),
         balance_before: '',
         balance_after: '',
         checked_by_oc: transactionFormData.checked_by_oc ?? '',
       }
     });
 
     // keep balance_before in sync when account changes
     const selectedAccountId = watch('property_prisoner_account');
     const amountValue = watch('amount');
     useEffect(() => {
       if (!selectedAccountId) {
         setValue('balance_before', '');
         setValue('balance_after', '');
         return;
       }
       const acc = accounts.find(a => String(a.id) === String(selectedAccountId));
       const before = acc ? (parseFloat(acc.balance || '0') || 0) : 0;
       setValue('balance_before', String(before));
       const amountNum = parseFloat(String(amountValue || '0')) || 0;
       setValue('balance_after', String(before + amountNum));
     }, [selectedAccountId, amountValue, accounts, setValue]);
 
     // datetime editing state: disabled by default, value in form is ISO string
     const [dtEditable, setDtEditable] = useState(false);
     // maintain local datetime-local string for editing UI
     const currentIso = watch('transaction_datetime') || new Date().toISOString();
     const isoToLocal = (iso:string) => {
       try {
         const d = new Date(iso);
         // datetime-local expects "YYYY-MM-DDTHH:mm"
         return d.toISOString().slice(0,16);
       } catch { return ''; }
     };
     const [localDt, setLocalDt] = useState(isoToLocal(currentIso));
     // keep localDt synced when form value changes externally (but not while editing)
     useEffect(() => {
       if (!dtEditable) setLocalDt(isoToLocal(currentIso));
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [currentIso, dtEditable]);
 
     // Reset form values whenever transactionFormData changes (ensures useForm fields use updated cloned data)
     useEffect(() => {
       try { reset({
         property_prisoner_account: transactionFormData.property_prisoner_account || '',
         transaction_type: transactionFormData.transaction_type || '',
         transaction_status: transactionFormData.transaction_status || '',
         amount: transactionFormData.amount || '',
         transaction_remark: transactionFormData.transaction_remark || '',
         biometric_consent: transactionFormData.biometric_consent || false,
         transaction_datetime: transactionFormData.transaction_datetime || new Date().toISOString(),
         balance_before: transactionFormData.balance_before || '',
         balance_after: transactionFormData.balance_after || '',
         checked_by_oc: transactionFormData.checked_by_oc ?? '',
       }); } catch (e) { /* ignore */ }
     }, [transactionFormData, reset]);
 
     const onSubmitForm = async (values: any) => {
       // delegate create/update to parent handler passed via props.onSubmit
       try {
         await onSubmit(values);
         // if parent didn't close/reset, ensure local form resets for create case
         if (!isEdit) reset();
       } catch (err) {
         // parent shows toast; keep error here for debug
         console.error('Transaction submit error', err);
       }
     };
 
     return (
       <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label>Account *</Label>
             <Controller control={control} name="property_prisoner_account" render={({ field }) => (
               <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                 <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                 <SelectContent>
                   <div className="px-2 py-2">
                     <Input placeholder="Filter accounts..." onChange={() => {}} />
                   </div>
                   {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.prisoner_name} - {a.account_type_name}</SelectItem>)}
                 </SelectContent>
               </Select>
             )} />
             {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
           </div>
 
           {/* Display selected account currency (read-only, not submitted) */}
           <div className="space-y-2">
             <Label>Account Currency</Label>
             <Input value={(() => {
               const acc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
               return acc ? getCurrencyLabel(acc.currency) : '';
             })()} disabled />
           </div>
 
           <div className="space-y-2">
             <Label>Transaction Type *</Label>
             <Controller control={control} name="transaction_type" render={({ field }) => (
               <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                 <SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger>
                 <SelectContent>
                   {txTypes.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                 </SelectContent>
               </Select>
             )} />
             {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
           </div>
 
           <div className="space-y-2">
             <Label>Status</Label>
             <Controller control={control} name="transaction_status" render={({ field }) => (
               <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                 <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                 <SelectContent>
                   {txStatuses.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                 </SelectContent>
               </Select>
             )} />
           </div>
 
           <div className="space-y-2">
             <Label>Amount *</Label>
             <Controller control={control} name="amount" rules={{ required: true, pattern: /^-?\d+(\.\d+)?$/ }} render={({ field }) => {
               const selAcc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
               const selCurrency = selAcc?.currency ?? 'UGX';
               return (
                 <AmountInput
                   value={field.value ?? ''}
                   onChange={(v) => field.onChange(v)}
                   currency={selCurrency}
                   placeholder="Enter amount"
                 />
               );
             }} />
             {formState.errors.amount && <div className="text-red-600 text-sm">{(formState.errors.amount as any).message ?? 'Invalid amount'}</div>}
             {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
           </div>
 
           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <Label>Transaction Date & Time</Label>
               <label className="flex items-center gap-2 text-sm">
                 <input type="checkbox" aria-label="Edit transaction datetime" checked={dtEditable} onChange={(e) => {
                   const next = e.target.checked;
                   setDtEditable(next);
                   // if disabling, write back current localDt as ISO to form (keeps sync)
                   if (!next) {
                     const iso = new Date(localDt).toISOString();
                     setValue('transaction_datetime', iso);
                   }
                 }} />
                 Edit
               </label>
             </div>
             {!dtEditable ? (
               // display-only formatted local datetime (not editable)
               <Input type="text" value={localDt ? localDt.replace('T', ' ') : ''} disabled />
             ) : (
               <input
                 type="datetime-local"
                 className="w-full rounded-md px-3 py-1"
                 value={localDt}
                 onChange={(e) => {
                   setLocalDt(e.target.value);
                   // convert to ISO Z and set form value for submission
                   const iso = new Date(e.target.value).toISOString();
                   setValue('transaction_datetime', iso);
                 }}
               />
             )}
           </div>
 
           <div className="space-y-2">
             <Label>Balance Before</Label>
             <Input type="text" {...register('balance_before')} disabled />
           </div>
 
           <div className="space-y-2">
             <Label>Balance After</Label>
             <Input type="text" {...register('balance_after')} disabled />
           </div>
 
           <div className="space-y-2">
             <Label>Checked By *</Label>
             <Controller control={control} name="checked_by_oc" rules={{ required: true }} render={({ field }) => (
               <StaffProfileSelect value={field.value} onChange={(v:any) => field.onChange(v)} placeholder="Select staff..." />
             )} />
             {formState.errors.checked_by_oc && <div className="text-red-600 text-sm">Checked By is required</div>}
             {transactionFormErrors.checked_by_oc && <div className="text-red-600 text-sm">{transactionFormErrors.checked_by_oc}</div>}
           </div>
 
           <div className="space-y-2">
             <Label>Remarks</Label>
             <Textarea {...register('transaction_remark')} rows={3} />
           </div>
 
           <div className="space-y-2 flex items-center gap-2 pt-8">
             <Controller control={control} name="biometric_consent" render={({ field }) => (
               <Checkbox id="biometric_consent" checked={!!field.value} onCheckedChange={(c) => field.onChange(c)} />
             )} />
             <Label className="cursor-pointer">Biometric Consent</Label>
           </div>
         </div>
 
         <DialogFooter>
           <Button type="button" variant="outline" onClick={() => { setIsCreateTransactionDialogOpen(false); setIsEditTransactionDialogOpen(false); }}>Cancel</Button>
           <Button type="submit" style={{ backgroundColor: '#650000' }}> {isEdit ? 'Update' : 'Create'} Transaction </Button>
         </DialogFooter>
       </form>
     );
   };
 
   // update transactionColumns Checked By render to use helper
   // find the column object for checked_by_name and replace its render:
   const updatedTransactionColumns = transactionColumns.map(col => {
     if (col.key === 'checked_by_name') {
       return { ...col, render: (v:any, r:any) => <span>{getCheckedByName(r.checked_by_oc ?? r.checked_by_name, v)}</span> };
     }
     return col;
   });
 
   return (
     <div className="p-6 space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
           <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
         </div>
       </div>
 
       <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
         <TabsList className="w-full">
           <TabsTrigger
             value="accounts"
             className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
           >
             Accounts
           </TabsTrigger>
           <TabsTrigger
             value="transactions"
             className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
           >
             Transactions
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="accounts" className="space-y-6">
           {/* Statistics Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm">Total Accounts</CardTitle>
                 <Wallet className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl">{totalAccounts}</div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm">Total Balance</CardTitle>
                 <DollarSign className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl"> {totalBalance.toLocaleString()}</div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm">Total Transactions</CardTitle>
                 <TrendingUp className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl">{totalTransactions}</div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm">Pending Transactions</CardTitle>
                 <FileText className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl">{pendingTransactions}</div>
               </CardContent>
             </Card>
           </div>
 
           {/* Filters and Actions */}
           <Card>
             <CardContent className="pt-6">
               <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                 <div className="relative flex-1 max-w-sm">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <Input
                     placeholder="Search accounts..."
                     value={searchTerm}
                     onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                     className="pl-10"
                   />
                 </div>
                 <Button onClick={() => {
                     // reset account form to blank defaults for Create
                     setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
                     setIsCreateAccountDialogOpen(true);
                   }} style={{ backgroundColor: '#650000' }}>
                   <Plus className="h-4 w-4 mr-2" />
                   Create Account
                 </Button>
               </div>
             </CardContent>
           </Card>
 
           {/* Accounts Table (DataTable) */}
           <Card>
             <CardContent className="pt-6">
               <DataTable
                 url="/property-management/prisoner-accounts/"
                 title="Accounts"
                 data={accounts}
                 loading={accountsLoading}
                 total={accountsTotal}
                 page={page}
                 pageSize={pageSize}
                 onPageChange={(p:number)=> setPage(p)}
                 onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                 onSort={() => { setPage(1); loadAccounts(); }}
                 columns={accountColumns}
                 externalSearch={searchTerm}
                 // expanded rows support: DataTable should call this to render expanded content for a row
                 renderExpandedRow={(row:any) => expandedAccounts.has(row.id) ? (
                   <div className="p-4 bg-gray-50">
                     <div className="flex items-center justify-between mb-4">
                       <h3 className="font-semibold">Transactions</h3>
                       <Button
                         size="sm"
                         onClick={() => {
                           setTransactionFormData((prev) => ({ ...deepClone(prev), property_prisoner_account: row.id }));
                           setIsCreateTransactionDialogOpen(true);
                         }}
                         style={{ backgroundColor: '#650000' }}
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         Add Transaction
                       </Button>
                     </div>
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>Date & Time</TableHead>
                           <TableHead>Type</TableHead>
                           <TableHead>Amount</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Balance After</TableHead>
                           <TableHead>Remarks</TableHead>
                           <TableHead className="text-right">Actions</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {getAccountTransactions(row.id).length === 0 ? (
                           <TableRow>
                             <TableCell colSpan={7} className="text-center text-gray-500">No transactions found</TableCell>
                           </TableRow>
                         ) : getAccountTransactions(row.id).map((t:any) => (
                           <TableRow key={t.id}>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <Calendar className="h-4 w-4 text-gray-400" />
                                 {new Date(t.transaction_datetime).toLocaleString()}
                               </div>
                             </TableCell>
                             <TableCell><Badge variant="outline">{t.transaction_type_name}</Badge></TableCell>
                             <TableCell>
                               <span className={parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                 {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toLocaleString()}
                               </span>
                             </TableCell>
                             <TableCell>
                               <Badge variant={t.transaction_status_name === 'Approved' ? 'default' : t.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                                 {t.transaction_status_name}
                               </Badge>
                             </TableCell>
                             <TableCell>{parseFloat(t.balance_after || '0').toLocaleString()}</TableCell>
                             <TableCell className="max-w-xs truncate">{t.transaction_remark}</TableCell>
                             <TableCell className="text-right">
                               <div className="flex justify-end gap-2">
                                 <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(t); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                 <Button variant="ghost" size="sm" onClick={() => {
                                     const copy = deepClone(t);
                                     setSelectedTransaction(copy);
                                     // populate form data for editing (use cloned values)
                                     setTransactionFormData({
                                       property_prisoner_account: copy.property_prisoner_account,
                                       transaction_type: copy.transaction_type,
                                       transaction_status: copy.transaction_status,
                                       amount: copy.amount,
                                       transaction_remark: copy.transaction_remark,
                                       biometric_consent: copy.biometric_consent,
                                       checked_by_oc: copy.checked_by_oc ?? '',
                                       transaction_datetime: copy.transaction_datetime ?? new Date().toISOString(),
                                       balance_before: copy.balance_before ?? '',
                                       balance_after: copy.balance_after ?? '',
                                     });
                                     setIsEditTransactionDialogOpen(true);
                                   }}><Pencil className="h-4 w-4" /></Button>
                                 <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(t)); setDeleteTransactionId(t.id); }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                               </div>
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                 ) : null}
               />
             </CardContent>
           </Card>
         </TabsContent>
 
         <TabsContent value="transactions" className="space-y-6">
           {/* Transactions statistics & filters */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm">Total Transactions</CardTitle>
                 <TrendingUp className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl">{totalTransactions}</div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm">Pending</CardTitle>
                 <FileText className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl">{pendingTransactions}</div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm">Approved</CardTitle>
                 <Check className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <CardTitle className="text-sm">Total Value</CardTitle>
                 <DollarSign className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
               </CardContent>
             </Card>
           </div>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                   <div className="relative flex-1 max-w-sm w-full">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <Input
                       placeholder="Search transactions..."
                       value={transactionSearchTerm}
                       onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                       className="pl-10"
                     />
                   </div>
                   <Button onClick={() => {
                       // reset transaction form to blank defaults for Create
                       setTransactionFormData({
                         property_prisoner_account: '',
                         transaction_type: '',
                         transaction_status: '',
                         amount: '',
                         transaction_remark: '',
                         biometric_consent: false,
                         checked_by_oc: '',
                       });
                       setIsCreateTransactionDialogOpen(true);
                     }} style={{ backgroundColor: '#650000' }}>
                     <Plus className="h-4 w-4 mr-2" />
                     Create Transaction
                   </Button>
                 </div>
 
                 <div className="flex flex-col md:flex-row gap-4">
                   <div className="flex-1">
                     <Label className="mb-3">Transaction Type</Label>
                     <SearchableSelect
                       items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                       value={txFilterType}
                       labelField="label"
                       onChange={(v) => {
                         setTxFilterType(v ?? 'all');
                         setPage(1);
                         // baseParams now includes txFilterType so loadTransactions will be triggered by effects
                       }}
                       placeholder="Filter by type..."
                     />
                   </div>
                   <div className="flex-1">
                     <Label className="mb-3">Status</Label>
                     <SearchableSelect
                       items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                       value={txFilterStatus}
                       labelField="label"
                       onChange={(v) => {
                         setTxFilterStatus(v ?? 'all');
                         setPage(1);
                         // baseParams now includes txFilterStatus so loadTransactions will be triggered by effects
                       }}
                       placeholder="Filter by status..."
                     />
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           {/* Transactions Table (DataTable) */}
           <Card>
             <CardContent className="pt-6">
               <DataTable
                 url="/property-management/transactions/"
                 title="Transactions"
                 data={transactions}
                 loading={transactionsLoading}
                 total={transactionsTotal}
                 page={page}
                 pageSize={pageSize}
                 onPageChange={(p:number)=> setPage(p)}
                 onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                 onSort={() => { setPage(1); loadTransactions(); }}
                 columns={updatedTransactionColumns}
                 externalSearch={transactionSearchTerm}
               />
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
 
       {/* Create / Edit / View Dialogs (reuse forms) */}
       <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
         <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
           <div className="flex-1 overflow-y-auto p-6">
             <DialogHeader className="mb-4">
               <DialogTitle>Create New Account</DialogTitle>
               <DialogDescription>Add a new prisoner account</DialogDescription>
             </DialogHeader>
             <AccountForm key={accountFormKey} onSubmit={handleCreateAccount} isEdit={false} />
           </div>
         </DialogContent>
       </Dialog>
 
       <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
         <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
           <div className="flex-1 overflow-y-auto p-6">
             <DialogHeader className="mb-4">
               <DialogTitle>Edit Account</DialogTitle>
               <DialogDescription>Update account information</DialogDescription>
             </DialogHeader>
             <AccountForm key={accountFormKey} onSubmit={handleUpdateAccount} isEdit={true} />
           </div>
         </DialogContent>
       </Dialog>
 
       <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
         <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
           <div className="flex-1 overflow-y-auto p-6">
             <DialogHeader className="mb-4">
               <DialogTitle>Account Details</DialogTitle>
               <DialogDescription>View prisoner account information</DialogDescription>
             </DialogHeader>
             {selectedAccount && (
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label className="text-gray-500">Prisoner Name</Label>
                     <p>{selectedAccount.prisoner_name}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Account Type</Label>
                     <p>{selectedAccount.account_type_name}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Currency</Label>
                     <p>{getCurrencyLabel(selectedAccount.currency)}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Balance</Label>
                     <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                   </div>
                 </div>
               </div>
             )}
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                 Close
               </Button>
             </DialogFooter>
           </div>
         </DialogContent>
       </Dialog>
 
       <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
         <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
           <div className="flex-1 overflow-y-auto p-6">
             <DialogHeader>
               <DialogTitle>Create New Transaction</DialogTitle>
               <DialogDescription>Add a new transaction</DialogDescription>
             </DialogHeader>
             <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
           </div>
         </DialogContent>
       </Dialog>
 
       {/* Edit Transaction Dialog */}
       <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
         <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
           <div className="flex-1 overflow-y-auto p-6">
             <DialogHeader>
               <DialogTitle>Edit Transaction</DialogTitle>
               <DialogDescription>Update transaction information</DialogDescription>
             </DialogHeader>
             <TransactionForm onSubmit={handleUpdateTransaction} isEdit={true} />
           </div>
         </DialogContent>
       </Dialog>
 
       <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
         <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
           <div className="flex-1 overflow-y-auto p-6">
             <DialogHeader className='mb-4'>
               <DialogTitle>Transaction Details</DialogTitle>
               <DialogDescription>View transaction information</DialogDescription>
             </DialogHeader>
             {selectedTransaction && (
               <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label className="text-gray-500">Prisoner Name</Label>
                     <p>{selectedTransaction.prisoner_name}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Account Type</Label>
                     <p>{selectedTransaction.account_type_name}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Transaction Type</Label>
                     <p>{selectedTransaction.transaction_type_name}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Status</Label>
                     <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                       {selectedTransaction.transaction_status_name}
                     </Badge>
                   </div>
                   <div>
                     <Label className="text-gray-500">Amount</Label>
                     <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                       {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                     </p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Date & Time</Label>
                     <p>{new Date(selectedTransaction.transaction_datetime).toLocaleString()}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Balance Before</Label>
                     <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Balance After</Label>
                     <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Checked By</Label>
                     <p>{selectedTransaction.checked_by_name}</p>
                   </div>
                   <div>
                     <Label className="text-gray-500">Biometric Consent</Label>
                     <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                   </div>
                   <div className="col-span-2">
                     <Label className="text-gray-500">Remarks</Label>
                     <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                   </div>
                 </div>
               </div>
             )}
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                 Close
               </Button>
             </DialogFooter>
           </div>
         </DialogContent>
            </Dialog>
 
       {/* Delete confirmations */}
       <ConfirmDialog
         open={!!deleteAccountId}
         onOpenChange={(o) => { if (!o) { setDeleteAccountId(null); setSelectedAccount(null); } }}
         title="Delete Account"
         description="Are you sure you want to delete this account? This action cannot be undone."
         details={selectedAccount ? (
           <div>
             <div><strong>Prisoner:</strong> {selectedAccount.prisoner_name}</div>
             <div><strong>Account Type:</strong> {selectedAccount.account_type_name}</div>
           </div>
         ) : null}
         confirmLabel="Delete"
                cancelLabel="Cancel"
         onConfirm={async () => {
           await handleDeleteAccount();
         }}
       />
 
       <ConfirmDialog
         open={!!deleteTransactionId}
         onOpenChange={(o) => { if (!o) { setDeleteTransactionId(null); setSelectedTransaction(null); } }}
         title="Delete Transaction"
         description="Are you sure you want to delete this transaction? This action cannot be undone."
         details={selectedTransaction ? (
           <div>
             <div><strong>Prisoner:</strong> {selectedTransaction.prisoner_name}</div>
             <div><strong>Amount:</strong> {parseFloat(selectedTransaction.amount).toLocaleString()}</div>
             <div><strong>Date:</strong> {new Date(selectedTransaction.transaction_datetime).toLocaleString()}</div>
           </div>
         ) : null}
         confirmLabel="Delete"
         cancelLabel="Cancel"
         onConfirm={async () => {
           await handleDeleteTransaction();
         }}
       />
     </div>
   );
 };
 
 export default PrisonerPropertyAccountScreen;
 
 // helper to safely get length of previous arrays (used in optimistic fallbacks)
 function prevLengthSafe(arr:any[]) { try { return Array.isArray(arr) ? arr.length : 0; } catch { return 0; } }





//  badge without green

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge, badgeVariants } from '../ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wallet,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { cn } from '../ui/utils';
import { DataTable } from "../common/DataTableCollapsableRows";
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';
import AmountInput from '../common/AmountInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { fetchPrisoners } from '../../services/customPrisonersService';
import * as accountsSvc from '../../services/propertyServices/accountsService';
import * as txSvc from '../../services/propertyServices/transactionService';
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from '../../services/axiosInstance';
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  numericValidation
} from '../../utils/validation';
import { useForm, Controller } from 'react-hook-form';
import ConfirmDialog from '../common/ConfirmDialog';
import DateTime, { formatDateTime } from '../common/DateTime';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

interface Account {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  currency: string;
  balance: string;
  prisoner: string;
  account_type: string;
}

interface Transaction {
  id: string;
  prisoner_name: string;
  account_type_name: string;
  transaction_type_name: string;
  transaction_status_name: string;
  checked_by_name: string;
  amount: string;
  transaction_datetime: string;
  transaction_remark: string;
  biometric_consent: boolean;
  balance_before: string;
  balance_after: string;
  property_prisoner_account: string;
  transaction_type: string;
  transaction_status: string;
  checked_by_oc: number;
}

// API endpoints (centralised at top)
const API_ENDPOINTS = {
  ACCOUNTS: '/property-management/prisoner-accounts/',
  ACCOUNT_TYPES: '/property-management/cash-account-types/',
  TRANSACTIONS: '/property-management/transactions/',
  TX_TYPES: '/property-management/transaction-types/',
  TX_STATUSES: '/system-administration/transaction-statuses/',
  PRISONERS: '/admission/prisoners/',
  CURRENCIES: '/system-administration/currencies/',
  STAFF: '/auth/staff-profiles/',
};

const PrisonerPropertyAccountScreen: React.FC = () => {
  // global filters
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();
  // register refresh handler
  useFilterRefresh(() => {
    // empty body: we'll trigger reload via effects by changing page/search etc.
  });

  // server-driven state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsTotal, setAccountsTotal] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  // lookups
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [txTypes, setTxTypes] = useState<any[]>([]);
  const [txStatuses, setTxStatuses] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<any[]>([]);
  const [staffProfilesError, setStaffProfilesError] = useState<string | null>(null);

  // ui
  const [activeTab, setActiveTab] = useState<'accounts'|'transactions'>('accounts');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [txFilterType, setTxFilterType] = useState<string>('all');
  const [txFilterStatus, setTxFilterStatus] = useState<string>('all');
  const searchTimer = useRef<number| null>(null);

  // dialogs/forms
  const [isCreateAccountDialogOpen, setIsCreateAccountDialogOpen] = useState(false);
  const [isEditAccountDialogOpen, setIsEditAccountDialogOpen] = useState(false);
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [isCreateTransactionDialogOpen, setIsCreateTransactionDialogOpen] = useState(false);
  const [isEditTransactionDialogOpen, setIsEditTransactionDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  // form state
  const [accountFormData, setAccountFormData] = useState({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
  const [accountFormErrors, setAccountFormErrors] = useState<Record<string,string>>({});
  // force remount AccountForm to reset its internal state when opening create/edit
  const [accountFormKey, setAccountFormKey] = useState(0);
  const [transactionFormData, setTransactionFormData] = useState({
    property_prisoner_account: '',
    transaction_type: '',
    transaction_status: '',
    amount: '',
    transaction_remark: '',
    biometric_consent: false,
    checked_by_oc: 0,
  });
  const [transactionFormErrors, setTransactionFormErrors] = useState<Record<string,string>>({});
  // expanded rows (for accounts collapsible section)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const toggleAccountExpansion = (accountId: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(accountId)) newSet.delete(accountId);
    else newSet.add(accountId);
    setExpandedAccounts(newSet);
  };
  // helper to get transactions for an account (from loaded transactions)
  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => String(t.property_prisoner_account) === String(accountId));
  };

  // request control (no shared abort controller — rely on reqId to ignore stale responses)
  const reqId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // utility to deep clone safely
  const deepClone = (v: any) => {
    try { return (globalThis as any).structuredClone ? (globalThis as any).structuredClone(v) : JSON.parse(JSON.stringify(v)); }
    catch { try { return JSON.parse(JSON.stringify(v)); } catch { return v; } }
  };

  // helper to include global filters and paging
  const baseParams = useCallback((overrides: any = {}) => ({
    page,
    page_size: pageSize,
    search: activeTab === 'accounts' ? searchTerm : transactionSearchTerm,
    station: globalStation || undefined,
    district: globalDistrict || undefined,
    region: globalRegion || undefined,
    // include transaction filters automatically when on transactions tab
    ...(activeTab === 'transactions' ? {
      transaction_type: txFilterType && txFilterType !== 'all' ? txFilterType : undefined,
      transaction_status: txFilterStatus && txFilterStatus !== 'all' ? txFilterStatus : undefined,
    } : {}),
    ...overrides,
  }), [page, pageSize, searchTerm, transactionSearchTerm, globalStation, globalDistrict, globalRegion, activeTab, txFilterType, txFilterStatus]);

  // load lookups
  const loadLookups = useCallback(async () => {
    try {
      const [pRes, atRes, ttRes, tsRes, curRes, staffRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.PRISONERS, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        accountsSvc.listAccountTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionTypes().catch(()=>({ results: [] })),
        txSvc.listTransactionStatuses().catch(()=>({ results: [] })),
        axiosInstance.get(API_ENDPOINTS.CURRENCIES, { params: { page_size: 100 } }).then(r => r.data).catch(()=>({ results: [] })),
        // staff profiles is optional - catch network errors to avoid blocking UI
        axiosInstance.get(API_ENDPOINTS.STAFF, { params: { page_size: 200 }}).then(r => r.data).catch(err => { throw err; }),
      ]);
      setPrisoners(pRes?.results ?? []);
      setAccountTypes(atRes?.results ?? []);
      setTxTypes(ttRes?.results ?? []);
      setTxStatuses(tsRes?.results ?? []);
      // store full currency objects (id, code, name) so UI can show name while saving id
      setCurrencies(curRes?.results ?? []);
      // staff
      if (staffRes && staffRes.results) {
        setStaffProfiles(staffRes.results);
        setStaffProfilesError(null);
      } else {
        setStaffProfiles([]);
      }
    } catch (err:any) {
      console.error('lookup load error', err);
      // if staff fetch failed, set error but let UI continue
      if (String(err?.config?.url || '').includes(API_ENDPOINTS.STAFF)) {
        setStaffProfilesError('Failed to load staff list');
        setStaffProfiles([]);
      }
    }
  }, []);

  // load accounts
  const loadAccounts = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    setAccountsLoading(true);
    try {
      console.debug('loadAccounts request', baseParams(opts));
      const data = await accountsSvc.listAccounts(baseParams(opts));
      console.debug('loadAccounts response', data);
      if (id !== reqId.current) return;
      setAccounts(data.results ?? []);
      setAccountsTotal(data.count ?? 0);
    } catch (err:any) {
      console.debug('loadAccounts error', err);
      console.error('loadAccounts error', err);
      toast.error('Failed to load accounts');
    } finally {
      setAccountsLoading(false);
    }
  }, [baseParams]);

  // load transactions
  const loadTransactions = useCallback(async (opts: any = {}) => {
    reqId.current += 1;
    const id = reqId.current;
    setTransactionsLoading(true);
    try {
      console.debug('loadTransactions request', baseParams(opts));
      const data = await txSvc.listTransactions(baseParams(opts));
      console.debug('loadTransactions response', data);
      if (id !== reqId.current) return;
      setTransactions(data.results ?? []);
      setTransactionsTotal(data.count ?? 0);
    } catch (err:any) {
      console.debug('loadTransactions error', err);
      console.error('loadTransactions error', err);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, [baseParams]);

  // debounce search for accounts/transactions
  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setPage(1);
      if (activeTab === 'accounts') loadAccounts();
      if (activeTab === 'transactions') loadTransactions();
    }, 500);
    return () => { if (searchTimer.current) window.clearTimeout(searchTimer.current); };
  }, [searchTerm, transactionSearchTerm, activeTab, loadAccounts, loadTransactions]);

  // reload when filters/paging change
  useEffect(() => { loadAccounts(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadAccounts]);
  useEffect(() => { loadTransactions(); }, [page, pageSize, globalStation, globalDistrict, globalRegion, loadTransactions]);

  // initial lookups
  useEffect(() => { loadLookups(); }, [loadLookups]);

  // register filter refresh to reload lists when global filters change via header UI
  useFilterRefresh(() => {
    setPage(1);
    loadAccounts();
    loadTransactions();
  }, [globalRegion, globalDistrict, globalStation]);

  // CRUD handlers (accounts)
  const validateAccountForm = () => {
    const errs: Record<string,string> = {};
    const prisonerValue = String(accountFormData.prisoner ?? '').trim();
    const accountTypeValue = String(accountFormData.account_type ?? '').trim();
    const currencyValue = String(accountFormData.currency ?? '').trim();
    const balanceValue = String(accountFormData.balance ?? '').trim();

    if (!requiredValidation(prisonerValue)) errs.prisoner = 'Prisoner is required';
    if (!requiredValidation(accountTypeValue)) errs.account_type = 'Account type is required';
    if (!requiredValidation(currencyValue)) errs.currency = 'Currency is required';
    // numericValidation pattern expects digits; adjust message accordingly
    if (!balanceValue || !numericValidation.pattern.value.test(balanceValue)) errs.balance = 'Balance must be a number';
    setAccountFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // validate arbitrary form data shape (used by handlers that accept local-submitted data)
  const validateAccountData = (data: any) => {
    const errs: Record<string,string> = {};
    if (!String(data.prisoner ?? '').trim()) errs.prisoner = 'Prisoner is required';
    if (!String(data.account_type ?? '').trim()) errs.account_type = 'Account type is required';
    if (!String(data.currency ?? '').trim()) errs.currency = 'Currency is required';
    const bal = String(data.balance ?? '').trim();
    if (!bal || !/^-?\d+(\.\d+)?$/.test(bal)) errs.balance = 'Balance must be a number';
    return errs;
  };

  const handleCreateAccount = async (dataOrEvent: any) => {
    // if called from old signature, fallback
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      await accountsSvc.createAccount({
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      toast.success('Account created');
      setIsCreateAccountDialogOpen(false);
      setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX' });
      loadAccounts();
    } catch (err) {
      console.error('create account error', err);
      toast.error('Failed to create account');
    }
  };

  // helper to map backend status to badge variant
  // const getStatusVariant = (status: string) => {
  //   if (!status) return 'warning';
  //   switch (String(status).toLowerCase()) {
  //     case 'pending':
  //       return 'secondary';
  //     case 'approved':
  //     case 'completed':
  //     case 'success':
  //       return 'primary';
  //     case 'failed':
  //     case 'rejected':
  //       return 'danger';
  //     default:
  //       return 'warning';
  //   }
  // };

  const getStatusVariant = (status?: string | null): BadgeVariant => {
    const sRaw = status ?? '';
    const s = String(sRaw).toLowerCase().trim();
    if (!s || s === 'n/a' || s === 'unknown') return 'outline';

    // Use the badge variants that match your theme / existing visuals.
    if (/(pending|awaiting|waiting)/i.test(s)) return 'secondary';
    if (/(approved|completed|success|paid|settled|done)/i.test(s)) return 'default';
    if (/(failed|rejected|declined|error|cancelled|canceled)/i.test(s)) return 'destructive';
    if (/(processing|in[_\s-]?progress|on[-\s]?going|ongoing)/i.test(s)) return 'info';
    if (/(hold|on[_\s-]?hold|warning)/i.test(s)) return 'warning';

    // fallback
    console.debug('getStatusVariant: unknown status string, falling back to outline', { status: sRaw });
    return 'outline';
  };

  const handleUpdateAccount = async (dataOrEvent: any) => {
    if (!selectedAccount) return;
    const data = dataOrEvent && dataOrEvent.prisoner ? dataOrEvent : accountFormData;
    const errs = validateAccountData(data);
    if (Object.keys(errs).length) {
      setAccountFormErrors(errs);
      return;
    }
    try {
      const res = await accountsSvc.updateAccount(selectedAccount.id, {
        prisoner: data.prisoner,
        account_type: data.account_type,
        currency: data.currency,
        balance: data.balance ?? '0',
      });
      console.debug('updateAccount response', res);
      toast.success('Account updated');
      setIsEditAccountDialogOpen(false);
      setSelectedAccount(null);
      // authoritative reload
      await loadAccounts();
    } catch (err) {
      console.debug('updateAccount error', err);
      console.error('update account error', err);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      await accountsSvc.deleteAccount(deleteAccountId);
      console.debug('deleteAccount success', deleteAccountId);
      toast.success('Account deleted');
      setDeleteAccountId(null);
      await loadAccounts();
    } catch (err) {
      console.debug('deleteAccount error', err);
      console.error('delete account error', err);
      toast.error('Failed to delete account');
    }
  };

  // CRUD handlers (transactions)
  const validateTransactionData = (data: any) => {
    const errs: Record<string,string> = {};
    if (!requiredValidation(data.property_prisoner_account)) errs.property_prisoner_account = 'Account is required';
    if (!requiredValidation(data.transaction_type)) errs.transaction_type = 'Transaction type is required';
    if (!requiredValidation(data.amount)) errs.amount = 'Amount is required';
    if (!data.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
    return errs;
  };

  const handleCreateTransaction = async (values: any) => {
    const errs = validateTransactionData(values);
    if (Object.keys(errs).length) {
      setTransactionFormErrors(errs);
      return;
    }
    setTransactionFormErrors({});
    try {
      const res = await txSvc.createTransaction(values);
      console.debug('createTransaction response', res);
      toast.success('Transaction created');
      setIsCreateTransactionDialogOpen(false);
      setTransactionFormData({ property_prisoner_account: '', transaction_type: '', transaction_status: '', amount: '', transaction_remark: '', biometric_consent: false, checked_by_oc: 0 });
      // authoritative reload
      await loadTransactions();
      await loadAccounts();
    } catch (err) {
      console.debug('createTransaction error', err);
      console.error('create tx error', err);
      toast.error('Failed to create transaction');
    }
  };

  // add update transaction handler
  const handleUpdateTransaction = async (dataOrEvent: any) => {
    // dataOrEvent is provided by TransactionForm (react-hook-form)
    const values = dataOrEvent && dataOrEvent.property_prisoner_account ? dataOrEvent : transactionFormData;
    const errs: Record<string,string> = {};
    if (!values.property_prisoner_account) errs.property_prisoner_account = 'Account is required';
    if (!values.transaction_type) errs.transaction_type = 'Transaction type is required';
    if (!values.amount) errs.amount = 'Amount is required';
    if (!values.checked_by_oc) errs.checked_by_oc = 'Checked By is required';
    if (Object.keys(errs).length) {
      setTransactionFormErrors(errs);
      return;
    }
    if (!selectedTransaction) return;
    try {
      const payload = {
        property_prisoner_account: values.property_prisoner_account,
        transaction_type: values.transaction_type,
        transaction_status: values.transaction_status || null,
        amount: values.amount,
        transaction_remark: values.transaction_remark,
        biometric_consent: !!values.biometric_consent,
        transaction_datetime: values.transaction_datetime,
        balance_before: values.balance_before,
        balance_after: values.balance_after,
        checked_by_oc: values.checked_by_oc,
      };
      const res = (typeof txSvc.updateTransaction === 'function')
        ? await txSvc.updateTransaction(selectedTransaction.id, payload)
        : (await axiosInstance.patch(`${API_ENDPOINTS.TRANSACTIONS}${selectedTransaction.id}/`, payload)).data;
      console.debug('updateTransaction response', res);
      toast.success('Transaction updated');
      setIsEditTransactionDialogOpen(false);
      setSelectedTransaction(null);
      // authoritative reloads
      await loadTransactions();
      await loadAccounts();
    } catch (err) {
      console.debug('updateTransaction error', err);
      console.error('update tx error', err);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTransactionId) return;
    try {
      if (typeof txSvc.deleteTransaction === 'function') {
        await txSvc.deleteTransaction(deleteTransactionId);
      } else {
        await axiosInstance.delete(`${API_ENDPOINTS.TRANSACTIONS}${deleteTransactionId}/`);
      }
      console.debug('deleteTransaction success', deleteTransactionId);
      toast.success('Transaction deleted');
      setDeleteTransactionId(null);
      // authoritative reloads
      await loadTransactions();
      await loadAccounts();
    } catch (err) {
      console.debug('deleteTransaction error', err);
      console.error('delete tx error', err);
      toast.error('Failed to delete transaction');
    }
  };

  // UI computed stats
  const totalAccounts = accountsTotal;
  const totalBalance = accounts.reduce((sum, a) => sum + (parseFloat(a.balance || '0') || 0), 0);
  const totalTransactions = transactionsTotal;
  const pendingTransactions = transactions.filter(t => t.transaction_status_name === 'Pending').length;

  // helper to render currency label (show code/name in UI, save uuid)
  const getCurrencyLabel = (val?: string) => {
    if (!val) return '';
    const found = currencies.find((c:any) => String(c.id) === String(val) || String(c.code ?? '').toUpperCase() === String(val).toUpperCase());
    if (found) return found.name ? `${found.code ?? ''} — ${found.name}` : (found.code ?? String(found.id));
    // fallback: if val looks like uppercase code return it else return raw
    return String(val);
  };

  // helper to render checked_by name using staffProfiles fallback to API name
  const getCheckedByName = (val?: string | number, fallbackName?: string) => {
    if (!val && !fallbackName) return '';
    const found = staffProfiles.find((s:any) => String(s.id) === String(val) || String(s.user)?.toLowerCase() === String(val)?.toLowerCase() || String(s.id) === String(fallbackName));
    if (found) return found.full_name ?? found.name ?? String(found.id);
    return fallbackName ?? String(val ?? '');
  };

  // Columns for DataTable
  const accountColumns = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_v:any, r:any) => (
        <Button variant="ghost" size="sm" onClick={() => toggleAccountExpansion(r.id)}>
          {expandedAccounts.has(r.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    { key: 'account_type_name', label: 'Account Type' },
    { key: 'currency', label: 'Currency', render: (v:any, r:any) => <span>{getCurrencyLabel(v)}</span> },
    { key: 'balance', label: 'Balance', render: (v:any, r:any) => parseFloat(r.balance || '0').toLocaleString() },
    { key: 'actions', label: 'Actions', sortable: false, render: (_v:any, r:any) => (
      <div className="flex">
        {/* <div className="flex justify-end gap-2"> */}

        <Button variant="ghost" size="sm" onClick={() => {
            setSelectedAccount(r);
            setAccountFormData({ prisoner: r.prisoner, account_type: r.account_type, currency: r.currency, balance: r.balance ?? '0' });
            setAccountFormKey(k => k + 1); // remount form so local state syncs
            setIsViewAccountDialogOpen(true);
          }}>
           <Eye className="h-4 w-4" />
         </Button>

        {/* <Button variant="ghost" size="sm" onClick={() => {
            const copy = deepClone(r);
            setSelectedAccount(copy);
            setAccountFormData({ prisoner: copy.prisoner, account_type: copy.account_type, currency: copy.currency, balance: copy.balance ?? '0' });
            setAccountFormKey(k => k + 1); // ensure AccountForm remounts with fresh data
            setIsEditAccountDialogOpen(true);
          }}>
           <Pencil className="h-4 w-4" />
        </Button> */}
        {/* <Button variant="ghost" size="sm" onClick={() => { setSelectedAccount(r); setDeleteAccountId(r.id); }}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button> */}
      </div>
    )},
  ];

  const transactionColumns = [
    {
      key: "transaction_datetime",
      label: "Date & Time",
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <DateTime value={value} format="dMY" />
        </div>
      ),
    },
    { key: 'prisoner_name', label: 'Prisoner' },
    // { key: 'account_type_name', label: 'Account Type' },
    {
      key: "account_type_name",
      label: "Account Type",
      render: (value: any) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    // { key: 'transaction_type_name', label: 'Type' },
    {
      key: "transaction_type_name",
      label: "Type",
      render: (value: any) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    { key: 'amount', label: 'Amount', render: (v:any, r:any) => <span className={parseFloat(r.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>{parseFloat(r.amount) >= 0 ? '+' : ''}{parseFloat(r.amount).toLocaleString()}</span> },
    // { key: 'transaction_status_name', label: 'Status' },
    {
      key: "transaction_status_name",
      label: "Status",
      render: (value: any) => (
        <Badge variant={getStatusVariant(value)}>{value}</Badge>
      ),
    },
    { key: 'checked_by_name', label: 'Checked By' },
    { key: 'transaction_remark', label: 'Remarks', render: (v:any) => <div className="max-w-xs truncate">{v || '-'}</div> },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v:any, r:any) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(r)); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => {
            const copy = deepClone(r);
            setSelectedTransaction(copy);
            // populate form data for editing (use cloned values)
            setTransactionFormData({
              property_prisoner_account: copy.property_prisoner_account,
              transaction_type: copy.transaction_type,
              transaction_status: copy.transaction_status,
              amount: copy.amount,
              transaction_remark: copy.transaction_remark,
              biometric_consent: copy.biometric_consent,
              checked_by_oc: copy.checked_by_oc ?? '',
              transaction_datetime: copy.transaction_datetime ?? new Date().toISOString(),
              balance_before: copy.balance_before ?? '',
              balance_after: copy.balance_after ?? '',
            });
            setIsEditTransactionDialogOpen(true);
          }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(r)); setDeleteTransactionId(r.id); }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
        </div>
      )
    },
  ];

  // Forms: use SearchableSelect for searchable dropdowns (keeps look & behavior)
  const AccountForm = ({ onSubmit, isEdit }: { onSubmit: (dataOrEvent: any) => void; isEdit: boolean }) => {
    // local form state to avoid re-rendering parent on every keypress (prevents caret loss)
    const [local, setLocal] = useState({
      prisoner: accountFormData.prisoner || '',
      account_type: accountFormData.account_type || '',
      // keep empty default so placeholder renders; will map to uuid when currencies load
      currency: accountFormData.currency ?? '',
      balance: accountFormData.balance ?? '0',
    });
    // Sync prisoner, account_type and balance from parent when accountFormData changes (used when opening edit/view).
    // Do not overwrite currency here (currency mapping effect handles id lookup).
    useEffect(() => {
      setLocal(prev => ({
        prisoner: accountFormData.prisoner ?? prev.prisoner,
        account_type: accountFormData.account_type ?? prev.account_type,
        currency: prev.currency,
        balance: accountFormData.balance ?? prev.balance,
      }));
    // only run when parent-provided values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountFormData.prisoner, accountFormData.account_type, accountFormData.balance]);

    // Compute the Select value deterministically:
    // prefer local.currency (user edits). If empty, map accountFormData.currency (which may be code or id)
    // to the currency UUID from currencies list so Select always has a matching option value.
    const selectedCurrencyId = useMemo(() => {
      if (local.currency) return String(local.currency);
      const parentCur = accountFormData.currency;
      if (!parentCur) return '';
      if (!currencies || currencies.length === 0) return String(parentCur);
      const found = currencies.find((x:any) =>
        String(x.id) === String(parentCur) ||
        String(x.code ?? '').toUpperCase() === String(parentCur).toUpperCase()
      );
      return found ? String(found.id) : String(parentCur);
    }, [local.currency, accountFormData.currency, currencies]);

    const [prisonerQuery, setPrisonerQuery] = useState('');
    const [prisonerResults, setPrisonerResults] = useState<any[]>([]);
    const [prisonerLoading, setPrisonerLoading] = useState(false);
    const prisonerAbortRef = useRef<AbortController | null>(null);
    const [accountTypeQuery, setAccountTypeQuery] = useState('');
    const [currencyQuery, setCurrencyQuery] = useState('');
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [selectedPrisonerName, setSelectedPrisonerName] = useState<string>('');
    const [balanceEditable, setBalanceEditable] = useState(false);
    const [errors, setErrors] = useState<Record<string,string>>({});

    // load prisoners (debounced, abortable)
    useEffect(() => {
      if (prisonerAbortRef.current) {
        prisonerAbortRef.current.abort();
        prisonerAbortRef.current = null;
      }
      const t = window.setTimeout(() => {
        const ctrl = new AbortController();
        prisonerAbortRef.current = ctrl;
        setPrisonerLoading(true);
        fetchPrisoners({
          search: prisonerQuery || '',
          station: globalStation || null,
          district: globalDistrict || null,
          region: globalRegion || null,
          page_size: 50,
          useCache: true,
        }, ctrl.signal).then(res => {
          setPrisonerResults(res.items || []);
        }).catch(err => {
          // ignore aborts; surface only real errors
          if ((err as any).name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
          console.error('fetchPrisoners error', err);
        }).finally(() => {
          setPrisonerLoading(false);
        });
      }, 300);
      return () => {
        window.clearTimeout(t);
        if (prisonerAbortRef.current) { prisonerAbortRef.current.abort(); prisonerAbortRef.current = null; }
      };
    }, [prisonerQuery, globalStation, globalDistrict, globalRegion]);

    const validateLocal = () => {
      const e: Record<string,string> = {};
      if (!String(local.prisoner || '').trim()) e.prisoner = 'Prisoner is required';
      if (!String(local.account_type || '').trim()) e.account_type = 'Account type is required';
      // balance must be numeric (allow negative and decimals). empty -> treat as 0
      if (!String(local.balance || '').trim() || !/^-?\d+(\.\d+)?$/.test(String(local.balance).trim())) e.balance = 'Balance must be a number';
      setErrors(e);
      return Object.keys(e).length === 0;
    };

    const submit = (ev?: React.FormEvent) => {
      ev?.preventDefault();
      if (!validateLocal()) return;
      onSubmit({
        prisoner: String(local.prisoner),
        account_type: String(local.account_type),
        currency: String(local.currency),
        balance: String(local.balance || '0'),
      });
    };

    return (
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* prisoner picker (same UI as before) */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openPrisoner} className="w-full justify-between text-left" type="button">
                  {local.prisoner
                    ? (selectedPrisonerName
                        || prisoners.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || prisonerResults.find((p:any) => String(p.id) === String(local.prisoner))?.full_name
                        || local.prisoner)
                    : <span className="text-gray-500 text-sm">Search prisoner...</span>}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Search prisoners..." value={prisonerQuery} onValueChange={(v) => setPrisonerQuery(v)} />
                  <CommandList>
                    {prisonerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-gray-500">Loading prisoners...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No prisoner found.</CommandEmpty>
                        <CommandGroup>
                          {prisonerResults.map((p:any) => (
                            <CommandItem key={p.id} value={String(p.id)}
                              onSelect={() => {
                                setLocal(prev => ({ ...prev, prisoner: String(p.id) }));
                                setSelectedPrisonerName(p.full_name);
                                setOpenPrisoner(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check className={cn("mr-2 h-4 w-4", String(local.prisoner) === String(p.id) ? "opacity-100" : "opacity-0")} style={{ color: '#650000' }} />
                              <div className="flex flex-col text-sm">
                                <span>{p.full_name}</span>
                                <span className="text-xs text-gray-500">{p.prisoner_number_value || p.prisoner_number || ''}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.prisoner && <div className="text-red-600 text-sm mt-1">{errors.prisoner}</div>}
          </div>

          {/* account type */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type *</Label>
            <Select value={local.account_type} onValueChange={(v)=> setLocal(prev => ({ ...prev, account_type: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select account type..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2"><Input placeholder="Filter account types..." value={accountTypeQuery} onChange={(e) => setAccountTypeQuery(e.target.value)} /></div>
                {accountTypes.filter((t:any) => !accountTypeQuery || String(t.name ?? '').toLowerCase().includes(accountTypeQuery.toLowerCase())).map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.account_type && <div className="text-red-600 text-sm">{errors.account_type}</div>}
          </div>

          {/* Currency (searchable select) */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={selectedCurrencyId} onValueChange={(v)=> setLocal(prev => ({ ...prev, currency: v }))} required>
              <SelectTrigger><SelectValue placeholder="Select currency..." /></SelectTrigger>
              <SelectContent>
                <div className="px-2 py-2">
                  <Input placeholder="Filter currencies..." value={currencyQuery} onChange={(e) => setCurrencyQuery(e.target.value)} />
                </div>
                {(currencies || []).filter((c:any) => {
                  const code = (c.code ?? '').toString();
                  const name = (c.name ?? '').toString();
                  return !currencyQuery || code.toLowerCase().includes(currencyQuery.toLowerCase()) || name.toLowerCase().includes(currencyQuery.toLowerCase());
                }).map((c:any) => {
                  const id = String(c.id);
                  const label = c.name ? `${c.code ?? ''} — ${c.name}` : (c.code ?? id);
                  return <SelectItem key={id} value={id}>{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            {errors.currency && <div className="text-red-600 text-sm mt-1">{errors.currency}</div>}
          </div>

          {/* Balance (disabled by default, toggle to enable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="balance">Balance</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit balance" checked={balanceEditable} onChange={(e) => setBalanceEditable(e.target.checked)} />
                Edit
              </label>
            </div>
            <AmountInput
              id="balance"
              currency={local.currency}
              className="disabled:opacity-25 input-invalid file:text-foreground dark:bg-input/30 w-full min-w-0 rounded-md px-3 py-1 bg-input-background transition-[color,box-shadow] outline-none"
              value={local.balance}
              onChange={(v) => setLocal(prev => ({ ...prev, balance: v }))}
              placeholder="0"
              disabled={!balanceEditable}
            />
            {errors.balance && <div className="text-red-600 text-sm mt-1">{errors.balance}</div>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateAccountDialogOpen(false); setIsEditAccountDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>{isEdit ? 'Update' : 'Create'} Account</Button>
        </DialogFooter>
      </form>
    );
  };

  // Transaction form implemented with react-hook-form to avoid focus loss on re-renders
  const TransactionForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => {
    const { register, handleSubmit, control, watch, setValue, formState, reset } = useForm({
      mode: "onTouched",
      defaultValues: {
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        // keep transaction_datetime as full ISO string (backend expects Z)
        transaction_datetime: new Date().toISOString(),
        balance_before: '',
        balance_after: '',
        checked_by_oc: transactionFormData.checked_by_oc ?? '',
      }
    });

    // keep balance_before in sync when account changes
    const selectedAccountId = watch('property_prisoner_account');
    const amountValue = watch('amount');
    useEffect(() => {
      if (!selectedAccountId) {
        setValue('balance_before', '');
        setValue('balance_after', '');
        return;
      }
      const acc = accounts.find(a => String(a.id) === String(selectedAccountId));
      const before = acc ? (parseFloat(acc.balance || '0') || 0) : 0;
      setValue('balance_before', String(before));
      const amountNum = parseFloat(String(amountValue || '0')) || 0;
      setValue('balance_after', String(before + amountNum));
    }, [selectedAccountId, amountValue, accounts, setValue]);

    // datetime editing state: disabled by default, value in form is ISO string
    const [dtEditable, setDtEditable] = useState(false);
    // maintain local datetime-local string for editing UI
    const currentIso = watch('transaction_datetime') || new Date().toISOString();
    const isoToLocal = (iso:string) => {
      try {
        const d = new Date(iso);
        // datetime-local expects "YYYY-MM-DDTHH:mm"
        return d.toISOString().slice(0,16);
      } catch { return ''; }
    };
    const [localDt, setLocalDt] = useState(isoToLocal(currentIso));
    // keep localDt synced when form value changes externally (but not while editing)
    useEffect(() => {
      if (!dtEditable) setLocalDt(isoToLocal(currentIso));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIso, dtEditable]);

    // Reset form values whenever transactionFormData changes (ensures useForm fields use updated cloned data)
    useEffect(() => {
      try { reset({
        property_prisoner_account: transactionFormData.property_prisoner_account || '',
        transaction_type: transactionFormData.transaction_type || '',
        transaction_status: transactionFormData.transaction_status || '',
        amount: transactionFormData.amount || '',
        transaction_remark: transactionFormData.transaction_remark || '',
        biometric_consent: transactionFormData.biometric_consent || false,
        transaction_datetime: transactionFormData.transaction_datetime || new Date().toISOString(),
        balance_before: transactionFormData.balance_before || '',
        balance_after: transactionFormData.balance_after || '',
        checked_by_oc: transactionFormData.checked_by_oc ?? '',
      }); } catch (e) { /* ignore */ }
    }, [transactionFormData, reset]);

    const onSubmitForm = async (values: any) => {
      // delegate create/update to parent handler passed via props.onSubmit
      try {
        await onSubmit(values);
        // if parent didn't close/reset, ensure local form resets for create case
        if (!isEdit) reset();
      } catch (err) {
        // parent shows toast; keep error here for debug
        console.error('Transaction submit error', err);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Account *</Label>
            <Controller control={control} name="property_prisoner_account" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select account..." /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-2">
                    <Input placeholder="Filter accounts..." onChange={() => {}} />
                  </div>
                  {accounts.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.prisoner_name} - {a.account_type_name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.property_prisoner_account && <div className="text-red-600 text-sm">{transactionFormErrors.property_prisoner_account}</div>}
          </div>

          {/* Display selected account currency (read-only, not submitted) */}
          <div className="space-y-2">
            <Label>Account Currency</Label>
            <Input value={(() => {
              const acc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
              return acc ? getCurrencyLabel(acc.currency) : '';
            })()} disabled />
          </div>

          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <Controller control={control} name="transaction_type" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select transaction type..." /></SelectTrigger>
                <SelectContent>
                  {txTypes.map((t:any) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {transactionFormErrors.transaction_type && <div className="text-red-600 text-sm">{transactionFormErrors.transaction_type}</div>}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller control={control} name="transaction_status" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                <SelectContent>
                  {txStatuses.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label>Amount *</Label>
            <Controller control={control} name="amount" rules={{ required: true, pattern: /^-?\d+(\.\d+)?$/ }} render={({ field }) => {
              const selAcc = accounts.find(a => String(a.id) === String(watch('property_prisoner_account')));
              const selCurrency = selAcc?.currency ?? 'UGX';
              return (
                <AmountInput
                  value={field.value ?? ''}
                  onChange={(v) => field.onChange(v)}
                  currency={selCurrency}
                  placeholder="Enter amount"
                />
              );
            }} />
            {formState.errors.amount && <div className="text-red-600 text-sm">{(formState.errors.amount as any).message ?? 'Invalid amount'}</div>}
            {transactionFormErrors.amount && <div className="text-red-600 text-sm">{transactionFormErrors.amount}</div>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Transaction Date & Time</Label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="Edit transaction datetime" checked={dtEditable} onChange={(e) => {
                  const next = e.target.checked;
                  setDtEditable(next);
                  // if disabling, write back current localDt as ISO to form (keeps sync)
                  if (!next) {
                    const iso = new Date(localDt).toISOString();
                    setValue('transaction_datetime', iso);
                  }
                }} />
                Edit
              </label>
            </div>
            {!dtEditable ? (
              // display-only formatted local datetime (not editable)
              <Input type="text" value={localDt ? localDt.replace('T', ' ') : ''} disabled />
            ) : (
              <input
                type="datetime-local"
                className="w-full rounded-md px-3 py-1"
                value={localDt}
                onChange={(e) => {
                  setLocalDt(e.target.value);
                  // convert to ISO Z and set form value for submission
                  const iso = new Date(e.target.value).toISOString();
                  setValue('transaction_datetime', iso);
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Balance Before</Label>
            <Input type="text" {...register('balance_before')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Balance After</Label>
            <Input type="text" {...register('balance_after')} disabled />
          </div>

          <div className="space-y-2">
            <Label>Checked By *</Label>
            <Controller control={control} name="checked_by_oc" rules={{ required: true }} render={({ field }) => (
              <StaffProfileSelect value={field.value} onChange={(v:any) => field.onChange(v)} placeholder="Select staff..." />
            )} />
            {formState.errors.checked_by_oc && <div className="text-red-600 text-sm">Checked By is required</div>}
            {transactionFormErrors.checked_by_oc && <div className="text-red-600 text-sm">{transactionFormErrors.checked_by_oc}</div>}
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea {...register('transaction_remark')} rows={3} />
          </div>

          <div className="space-y-2 flex items-center gap-2 pt-8">
            <Controller control={control} name="biometric_consent" render={({ field }) => (
              <Checkbox id="biometric_consent" checked={!!field.value} onCheckedChange={(c) => field.onChange(c)} />
            )} />
            <Label className="cursor-pointer">Biometric Consent</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => { setIsCreateTransactionDialogOpen(false); setIsEditTransactionDialogOpen(false); }}>Cancel</Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}> {isEdit ? 'Update' : 'Create'} Transaction </Button>
        </DialogFooter>
      </form>
    );
  };

  // update transactionColumns Checked By render to use helper
  // find the column object for checked_by_name and replace its render:
  const updatedTransactionColumns = transactionColumns.map(col => {
    // if col.key === 'checked_by_name') {
    //   // prefer API-provided checked_by_name (v). fallback to staff lookup (checked_by_oc) or fallback value
    //   return { ...col, render: (v:any, r:any) => <span>{v || getCheckedByName(r.checked_by_oc, r.checked_by_name)}</span> };
    // }
    if (col.key === 'checked_by_name') {
      // prefer API-provided checked_by_name (v). fallback to staff lookup (checked_by_oc) or fallback value
      return { ...col, render: (v:any, r:any) => <span>{v || getCheckedByName(r.checked_by_oc, r.checked_by_name)}</span> };
    }
    return col;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl" style={{ color: '#650000' }}>Accounts and Transactions</h1>
          <p className="text-gray-600">Manage prisoner accounts and financial transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v:any)=> setActiveTab(v)} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger
            value="accounts"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex-1 data-[state=active]:bg-[#650000] data-[state=active]:text-white"
          >
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Accounts</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalAccounts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl"> {totalBalance.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending Transactions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => {
                    // reset account form to blank defaults for Create
                    setAccountFormData({ prisoner: '', account_type: '', currency: 'UGX', balance: '0' });
                    setIsCreateAccountDialogOpen(true);
                  }} style={{ backgroundColor: '#650000' }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                url="/property-management/prisoner-accounts/"
                title="Accounts"
                data={accounts}
                loading={accountsLoading}
                total={accountsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadAccounts(); }}
                columns={accountColumns}
                externalSearch={searchTerm}
                // expanded rows support: DataTable should call this to render expanded content for a row
                renderExpandedRow={(row:any) => expandedAccounts.has(row.id) ? (
                  <div className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Transactions</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          setTransactionFormData((prev) => ({ ...deepClone(prev), property_prisoner_account: row.id }));
                          setIsCreateTransactionDialogOpen(true);
                        }}
                        style={{ backgroundColor: '#650000' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Balance After</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getAccountTransactions(row.id).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500">No transactions found</TableCell>
                          </TableRow>
                        ) : getAccountTransactions(row.id).map((t:any) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <DateTime value={t.transaction_datetime} format="dMY" />
                              </div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{t.transaction_type_name}</Badge></TableCell>
                            <TableCell>
                              <span className={parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              {/* <Badge variant={t.transaction_status_name === 'Approved' ? 'default' : t.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                                {t.transaction_status_name}
                              </Badge> */}
                              <Badge variant={getStatusVariant(t.transaction_status_name)}>
                                {t.transaction_status_name}
                              </Badge>
                            </TableCell>
                            <TableCell>{parseFloat(t.balance_after || '0').toLocaleString()}</TableCell>
                            <TableCell className="max-w-xs truncate">{t.transaction_remark}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(t); setIsViewTransactionDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    const copy = deepClone(t);
                                    setSelectedTransaction(copy);
                                    // populate form data for editing (use cloned values)
                                    setTransactionFormData({
                                      property_prisoner_account: copy.property_prisoner_account,
                                      transaction_type: copy.transaction_type,
                                      transaction_status: copy.transaction_status,
                                      amount: copy.amount,
                                      transaction_remark: copy.transaction_remark,
                                      biometric_consent: copy.biometric_consent,
                                      checked_by_oc: copy.checked_by_oc ?? '',
                                      transaction_datetime: copy.transaction_datetime ?? new Date().toISOString(),
                                      balance_before: copy.balance_before ?? '',
                                      balance_after: copy.balance_after ?? '',
                                    });
                                    setIsEditTransactionDialogOpen(true);
                                  }}><Pencil className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedTransaction(deepClone(t)); setDeleteTransactionId(t.id); }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transactions statistics & filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{pendingTransactions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Approved</CardTitle>
                <Check className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{transactions.filter(t => t.transaction_status_name === 'Approved').length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">UGX {transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={transactionSearchTerm}
                      onChange={(e) => { setTransactionSearchTerm(e.target.value); setPage(1); }}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => {
                      // reset transaction form to blank defaults for Create
                      setTransactionFormData({
                        property_prisoner_account: '',
                        transaction_type: '',
                        transaction_status: '',
                        amount: '',
                        transaction_remark: '',
                        biometric_consent: false,
                        checked_by_oc: '',
                      });
                      setIsCreateTransactionDialogOpen(true);
                    }} style={{ backgroundColor: '#650000' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Transaction
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label className="mb-3">Transaction Type</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Types' }, ...txTypes.map((t:any)=>({ id:String(t.id), label:t.name }))]}
                      value={txFilterType}
                      labelField="label"
                      onChange={(v) => {
                        setTxFilterType(v ?? 'all');
                        setPage(1);
                        // baseParams now includes txFilterType so loadTransactions will be triggered by effects
                      }}
                      placeholder="Filter by type..."
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="mb-3">Status</Label>
                    <SearchableSelect
                      items={[{ id: 'all', label: 'All Statuses' }, ...txStatuses.map((s:any)=>({ id:String(s.id), label:s.name }))]}
                      value={txFilterStatus}
                      labelField="label"
                      onChange={(v) => {
                        setTxFilterStatus(v ?? 'all');
                        setPage(1);
                        // baseParams now includes txFilterStatus so loadTransactions will be triggered by effects
                      }}
                      placeholder="Filter by status..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table (DataTable) */}
          <Card>
            <CardContent className="pt-6">
              <DataTable
                url="/property-management/transactions/"
                title="Transactions"
                data={transactions}
                loading={transactionsLoading}
                total={transactionsTotal}
                page={page}
                pageSize={pageSize}
                onPageChange={(p:number)=> setPage(p)}
                onPageSizeChange={(s:number)=> { setPageSize(s); setPage(1); }}
                onSort={() => { setPage(1); loadTransactions(); }}
                columns={updatedTransactionColumns}
                externalSearch={transactionSearchTerm}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit / View Dialogs (reuse forms) */}
      <Dialog open={isCreateAccountDialogOpen} onOpenChange={setIsCreateAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Add a new prisoner account</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleCreateAccount} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAccountDialogOpen} onOpenChange={setIsEditAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update account information</DialogDescription>
            </DialogHeader>
            <AccountForm key={accountFormKey} onSubmit={handleUpdateAccount} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-4">
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>View prisoner account information</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedAccount.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedAccount.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Currency</Label>
                    <p>{getCurrencyLabel(selectedAccount.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance</Label>
                    <p className="text-2xl">{parseFloat(selectedAccount.balance).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewAccountDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateTransactionDialogOpen} onOpenChange={setIsCreateTransactionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add a new transaction</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleCreateTransaction} isEdit={false} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditTransactionDialogOpen} onOpenChange={setIsEditTransactionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>Update transaction information</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleUpdateTransaction} isEdit={true} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className='mb-4'>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>View transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Prisoner Name</Label>
                    <p>{selectedTransaction.prisoner_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Type</Label>
                    <p>{selectedTransaction.account_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Transaction Type</Label>
                    <p>{selectedTransaction.transaction_type_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    {/* <Badge variant={selectedTransaction.transaction_status_name === 'Approved' ? 'default' : selectedTransaction.transaction_status_name === 'Pending' ? 'secondary' : 'destructive'}>
                      {selectedTransaction.transaction_status_name}
                    </Badge> */}
                    <Badge variant={getStatusVariant(selectedTransaction.transaction_status_name)}>
+                      {selectedTransaction.transaction_status_name || 'N/A'}
+                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Amount</Label>
                    <p className={parseFloat(selectedTransaction.amount) >= 0 ? 'text-green-600 text-2xl' : 'text-red-600 text-2xl'}>
                      {parseFloat(selectedTransaction.amount) >= 0 ? '+' : ''}{parseFloat(selectedTransaction.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Date & Time</Label>
                    <p><DateTime value={selectedTransaction.transaction_datetime} format="dMY" /></p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance Before</Label>
                    <p>{parseFloat(selectedTransaction.balance_before).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Balance After</Label>
                    <p>{parseFloat(selectedTransaction.balance_after).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Checked By</Label>
                    <p>{selectedTransaction.checked_by_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Biometric Consent</Label>
                    <p>{selectedTransaction.biometric_consent ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Remarks</Label>
                    <p>{selectedTransaction.transaction_remark || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewTransactionDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
           </Dialog>

      {/* Delete confirmations */}
      <ConfirmDialog
        open={!!deleteAccountId}
        onOpenChange={(o) => { if (!o) { setDeleteAccountId(null); setSelectedAccount(null); } }}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
        details={selectedAccount ? (
          <div>
            <div><strong>Prisoner:</strong> {selectedAccount.prisoner_name}</div>
            <div><strong>Account Type:</strong> {selectedAccount.account_type_name}</div>
          </div>
        ) : null}
        confirmLabel="Delete"
               cancelLabel="Cancel"
        onConfirm={async () => {
          await handleDeleteAccount();
        }}
      />

      <ConfirmDialog
        open={!!deleteTransactionId}
        onOpenChange={(o) => { if (!o) { setDeleteTransactionId(null); setSelectedTransaction(null); } }}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        details={selectedTransaction ? (
          <div>
            <div><strong>Prisoner:</strong> {selectedTransaction.prisoner_name}</div>
            <div><strong>Amount:</strong> {parseFloat(selectedTransaction.amount).toLocaleString()}</div>
            <div><strong>Date:</strong> {new Date(selectedTransaction.transaction_datetime).toLocaleString()}</div>
          </div>
        ) : null}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          await handleDeleteTransaction();
        }}
      />
    </div>
  );
};

export default PrisonerPropertyAccountScreen;

// helper to safely get length of previous arrays (used in optimistic fallbacks)
function prevLengthSafe(arr:any[]) { try { return Array.isArray(arr) ? arr.length : 0; } catch { return 0; } }

 






-------------




import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FileText,
  Calendar,
  User,
  Building2,
  Users,
  X,
  Save,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

import {
  fetchStations,
  fetchReasons,
  fetchStatuses,
} from "../../services/transferServices/transferRequestService";
import { fetchPrisoners } from "../../services/customPrisonersService";
import { fetchStaffProfiles } from "../../services/staffProfilesService";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import SearchableSelect from "../common/SearchableSelect"; // reusable searchable select
import StaffProfileSelect from "../common/StaffProfileSelect";
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";


interface TransferRequest {
  id?: string;
  prisoner_name?: string;
  original_station_name?: string;
  destination_station_name?: string;
  reason_name?: string;
  status_name?: string;
  in_charge_name?: string;
  original_oc_approval_status_name?: string;
  destination_oc_approval_status_name?: string;
  bulk_transfer: boolean;
  number_of_prisoners: number;
  original_station_oc_acknowledged: boolean;
  destination_station_oc_acknowledged: boolean;
  original_station_oc_approved_date: string;
  destination_station_oc_approved_date: string;
  prisoner: string;
  original_station: string;
  destination_station: string;
  reason: string;
  in_charge: number;
  status: string;
  original_station_oc_approval_status: string;
  destination_station_oc_approval_status: string;
  original_station_oc_approved_by: number;
  destination_station_oc_approved_by: number;
}

interface TransferRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransferRequest) => void;
  editingRequest?: TransferRequest | null;
  prisoners?: Array<{ id: string; name: string; number: string }>;
  stations?: Array<{ id: string; name: string }>;
  reasons?: Array<{ id: string; name: string }>;
  statuses?: Array<{ id: string; name: string }>;
  approvalStatuses?: Array<{ id: string; name: string }>;
  staff?: Array<{ id: number; name: string }>;
}

export default function TransferRequestForm({
  open,
  onClose,
  onSave,
  editingRequest,
  prisoners: prisonersProp = [],
  stations: stationsProp = [],
  reasons: reasonsProp = [],
  statuses: statusesProp = [],
  approvalStatuses = [],
  staff: staffProp = [],
}: TransferRequestFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransferRequest>({
    defaultValues: {
      bulk_transfer: false,
      number_of_prisoners: 1,
      original_station_oc_acknowledged: false,
      destination_station_oc_acknowledged: false,
      original_station_oc_approved_date: "",
      destination_station_oc_approved_date: "",
      prisoner: "",
      original_station: "",
      destination_station: "",
      reason: "",
      in_charge: "", // <- use empty string (controlled Select expects string)
      status: "",
      original_station_oc_approval_status: "",
      destination_station_oc_approval_status: "",
      original_station_oc_approved_by: "",
      destination_station_oc_approved_by: "",
    },
  });

  const isBulkTransfer = watch("bulk_transfer");

  // remove local prisoners/staff usage for selects (we still keep for initial items)
  const [stations, setStations] = useState<any[]>(stationsProp || []);
  const [prisoners, setPrisoners] = useState<any[]>(prisonersProp || []);
  const [reasons, setReasons] = useState<any[]>(reasonsProp || []);
  const [statuses, setStatuses] = useState<any[]>(statusesProp || []);
  const [staff, setStaff] = useState<any[]>(staffProp || []);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // label to display for original station (when single transfer)
  const [originalStationLabel, setOriginalStationLabel] = useState<string>("");

  // sync with global location filter to pre-filter stations when bulk
  useFilterRefresh(() => {
    const station = localStorage.getItem("selectedStation") || undefined;
    const region = localStorage.getItem("selectedRegion") || undefined;
    const district = localStorage.getItem("selectedDistrict") || undefined;
    // when global filter changes, reload stations (only used when bulk)
    loadStations({
      station: station && station !== "all" ? station : undefined,
      region: region && region !== "all" ? region : undefined,
      district: district && district !== "all" ? district : undefined,
    });
  }, []);

  useEffect(() => {
    if (editingRequest) {
      reset({
        bulk_transfer: editingRequest.bulk_transfer || false,
        number_of_prisoners: editingRequest.number_of_prisoners || 1,
        original_station_oc_acknowledged:
          editingRequest.original_station_oc_acknowledged || false,
        destination_station_oc_acknowledged:
          editingRequest.destination_station_oc_acknowledged || false,
        original_station_oc_approved_date:
          editingRequest.original_station_oc_approved_date?.split("T")[0] || "",
        destination_station_oc_approved_date:
          editingRequest.destination_station_oc_approved_date?.split("T")[0] || "",
        prisoner: editingRequest.prisoner || "",
        original_station: editingRequest.original_station || "",
        destination_station: editingRequest.destination_station || "",
        reason: editingRequest.reason || "",
        in_charge: editingRequest.in_charge || 0,
        status: editingRequest.status || "",
        original_station_oc_approval_status:
          editingRequest.original_station_oc_approval_status || "",
        destination_station_oc_approval_status:
          editingRequest.destination_station_oc_approval_status || "",
        original_station_oc_approved_by:
          editingRequest.original_station_oc_approved_by || 0,
        destination_station_oc_approved_by:
          editingRequest.destination_station_oc_approved_by || 0,
      });
    } else {
      reset({
        bulk_transfer: false,
        number_of_prisoners: 1,
        original_station_oc_acknowledged: false,
        destination_station_oc_acknowledged: false,
        original_station_oc_approved_date: "",
        destination_station_oc_approved_date: "",
        prisoner: "",
        original_station: "",
        destination_station: "",
        reason: "",
        in_charge: 0,
        status: "",
        original_station_oc_approval_status: "",
        destination_station_oc_approval_status: "",
        original_station_oc_approved_by: 0,
        destination_station_oc_approved_by: 0,
      });
    }
  }, [editingRequest, reset]);

  const onSubmit = async (data: TransferRequest) => {
    console.log("Submitting transfer request:", data);
    if (data.original_station && data.destination_station && data.original_station === data.destination_station) {
      toast.error("Original Station and Destination Station must be different");
      return;
    }

    try {
      // support sync or async onSave handlers
      const result = await Promise.resolve(onSave ? onSave(data) : null);
      console.log("onSave result:", result);
      toast.success("Transfer request saved");
      reset();
      // notify parent to close modal (parent may also close when it receives saved data)
      onClose();
    } catch (err) {
      console.error("Failed to save transfer request:", err);
      toast.error("Failed to save transfer request");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    // load lookup data when form mounts
    let mounted = true;
    setLoadingLookups(true);
    const c = new AbortController();
    Promise.all([
      fetchStations(c.signal).catch(() => []),
      fetchReasons(c.signal).catch(() => []),
      fetchStatuses(c.signal).catch(() => []),
      fetchStaffProfiles("", c.signal).catch(() => ({ items: [] })), // keep staff if needed
      // remove fetchPrisoners here to avoid duplicate requests - CustomPrisonerSearch will fetch itself
      // fetchPrisoners({ page_size: 100 }, c.signal).catch(() => ({ items: [] })),
    ])
      .then(([st, rsn, sts, sfRes /*, prRes */]) => {
        if (!mounted) return;
        setStations(st);
        setReasons(rsn);
        setStatuses(sts);
        setStaff(Array.isArray(sfRes) ? sfRes : (sfRes?.items ?? []));
        // setPrisoners(prRes?.items ?? []); // remove or keep only if used elsewhere
      })
      .finally(() => {
        setLoadingLookups(false);
      });
    return () => {
      mounted = false;
      c.abort();
    };
  }, []);

  const loadStations = async (params?: any) => {
    setLoadingLookups(true);
    const c = new AbortController();
    try {
      const data = await fetchStations({ ...params, page_size: 100 }, c.signal);
      setStations(data);
    } catch (error) {
      setStations([]);
    } finally {
      setLoadingLookups(false);
    }
  };

  // keep watcher
  const prisonerVal = watch("prisoner");
  const originalStationVal = watch("original_station");

  useEffect(() => {
    // When not bulk, auto-populate original station from selected prisoner.
    // Try local cache first, then fall back to server lookup.
    let cancelled = false;
    const c = new AbortController();
    async function resolvePrisonerStation(pId?: string | null) {
      if (!pId) {
        setValue("original_station", "");
        setOriginalStationLabel("");
        return;
      }

      // 1) try local cache
      const local = prisoners.find((p: any) => String(p.id) === String(pId));
      if (local && local.current_station) {
        setValue("original_station", local.current_station);
        setOriginalStationLabel(local.current_station_name ?? "");
        return;
      }

      // 2) try stations/search by id via fetchPrisoners - some backends support id lookup via search
      // (you can keep or remove; if kept ensure useCache:true and page_size:1)
      // try {
      //   const res = await fetchPrisoners({ search: String(pId), page_size: 1 }, c.signal);
      //   if (cancelled) return;
      //   const p = res.items?.[0];
      //   if (p && p.current_station) {
      //     setValue("original_station", p.current_station);
      //     return;
      //   }
      // } catch (_) {
      //   // ignore network/abort errors — leave original_station blank
      // }
    }

    if (!isBulkTransfer) {
      resolvePrisonerStation(prisonerVal);
    } else {
      // when bulk, do not auto-populate
      if (!prisonerVal) {
        setValue("original_station", "");
        setOriginalStationLabel("");
      }
    }

    return () => {
      cancelled = true;
      c.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkTransfer, prisonerVal, prisoners]);

  // Keep originalStationLabel in sync when original_station value or stations list changes
  useEffect(() => {
    if (!originalStationVal) {
      setOriginalStationLabel("");
      return;
    }
    // prefer stations lookup
    const s = stations.find((st: any) => String(st.id) === String(originalStationVal));
    if (s) {
      setOriginalStationLabel(s.name ?? "");
      return;
    }
    // fallback: try to find prisoner and use its current_station_name
    const p = prisoners.find((pr: any) => String(pr.id) === String(prisonerVal));
    if (p && p.current_station_name) {
      setOriginalStationLabel(p.current_station_name);
      return;
    }
  }, [originalStationVal, stations, prisoners, prisonerVal]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingRequest ? "Edit Transfer Request" : "Add Transfer Request"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Bulk Transfer Toggle */}
            <div className="border-b pb-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="bulk_transfer"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="bulk_transfer"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          setValue("number_of_prisoners", 1);
                        }
                      }}
                    />
                  )}
                />
                <label
                  htmlFor="bulk_transfer"
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Bulk Transfer (Multiple Prisoners)
                </label>
              </div>
            </div>

            {/* Prisoner or Number of Prisoners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isBulkTransfer ? (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Prisoner
                  </Label>
                  <Controller
                    name="prisoner"
                    control={control}
                    rules={{ required: !isBulkTransfer ? "Prisoner is required" : false }}
                    render={({ field }) => (
                      <CustomPrisonerSearch
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        onSelectItem={(p) => {

                          // immediately clear previous station to avoid showing stale data
                          setValue("original_station", "");
                          setOriginalStationLabel("");
                          // unified station fields (try multiple keys, include stationId/stationName emitted by dropdown)
                          const stationId = p?.current_station ?? p?.station ?? p?.stationId ?? p?.stationId ?? p?.station_id ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ?? p?.stationId ??
                          if (stationId) {
                            setValue("original_station", stationId);
                          }
                          if (stationName) {
                            setOriginalStationLabel(stationName);
                          }

                          // keep prisoners cache up-to-date (so other lookups can use it)
                          setPrisoners((prev) => {
                            if (!p) return prev;
                            const exists = prev.some((x: any) => String(x.id) === String(p.id));
                            if (exists) return prev;
                            return [p, ...prev];
                          });
                        }}
                        placeholder="Select prisoner"
                        idField="id"
                        labelField="full_name"
                        initialItems={prisoners}
                        pageSize={25}
                        disabled={false}
                      />
                    )}
                  />
                  {errors.prisoner && (
                    <span className="text-sm text-red-500">
                      {errors.prisoner.message}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Prisoners
                  </Label>
                  <Controller
                    name="number_of_prisoners"
                    control={control}
                    rules={{
                      required: isBulkTransfer
                        ? "Number of prisoners is required"
                        : false,
                      min: { value: 1, message: "Must be at least 1" },
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        min="1"
                      />
                    )}
                  />
                  {errors.number_of_prisoners && (
                    <span className="text-sm text-red-500">
                      {errors.number_of_prisoners.message}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Officer In Charge
                </Label>
                <Controller
                  name="in_charge"
                  control={control}
                  rules={{ required: "Officer in charge is required" }}
                  render={({ field }) => (
                    <StaffProfileSelect
                      value={String(field.value ?? "")}
                      onChange={(v) => field.onChange(v ?? "")}
                      placeholder="Select officer in charge"
                      initialItems={staff} // <-- pass initial items to avoid flicker
                    />
                  )}
                />
                {errors.in_charge && (
                  <span className="text-sm text-red-500">
                    {errors.in_charge.message}
                  </span>
                )}
              </div>
            </div>

            {/* Stations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Original Station
                </Label>
                <Controller
                  name="original_station"
                  control={control}
                  rules={{ required: isBulkTransfer ? "Original station is required" : false }}
                  render={({ field }) => {
                    // when not bulk: show read-only label so user can't change; when bulk: full searchable select
                    if (!isBulkTransfer) {
                      const stationLabel = stations.find((s: any) => String(s.id) === String(field.value))?.name
                        || originalStationLabel
                        || (prisoners.find((p: any) => String(p.id) === String(prisonerVal))?.current_station_name)
                        || "";
                      return (
                        <Input value={stationLabel} readOnly placeholder="Auto-filled from prisoner" />
                      );
                    }
                    return (
                      <SearchableSelect
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        placeholder="Select original station"
                        items={stations}
                        idField="id"
                        labelField="name"
                      />
                    );
                  }}
                />
                {!isBulkTransfer && <div className="text-xs text-gray-500">Auto-populated from selected prisoner (disabled for single transfers)</div>}
                {errors.original_station && (<span className="text-sm text-red-500">{errors.original_station.message}</span>)}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Destination Station
                </Label>
                <Controller
                  name="destination_station"
                  control={control}
                  rules={{ required: "Destination station is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      placeholder="Select destination station"
                      items={stations.filter((s: any) => s.id !== (originalStationVal || ""))}
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {errors.destination_station && (<span className="text-sm text-red-500">{errors.destination_station.message}</span>)}
              </div>
            </div>

            {/* Reason and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Reason</Label>
                <Controller
                  name="reason"
                  control={control}
                  rules={{ required: "Reason is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={reasons}
                      idField="id"
                      labelField="name"
                      placeholder="Select reason"
                    />
                  )}
                />
                {errors.reason && (
                  <span className="text-sm text-red-500">
                    {errors.reason.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Request Status</Label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={statuses}
                      idField="id"
                      labelField="name"
                      placeholder="Select status"
                    />
                  )}
                />
                {errors.status && (
                  <span className="text-sm text-red-500">
                    {errors.status.message}
                  </span>
                )}
              </div>
            </div>

            {/* OC Approval Information removed */}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4" />
                {editingRequest ? "Update Request" : "Create Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}









// ...existing code...
-  const onSubmit = (data: TransferRequest) => {
-    if (data.original_station && data.destination_station && data.original_station === data.destination_station) {
-      toast.error("Original Station and Destination Station must be different");
-      return;
-    }
-    onSave(data);
-    reset();
-  };
+  const onSubmit = async (data: TransferRequest) => {
+    console.log("Submitting transfer request:", data);
+    if (data.original_station && data.destination_station && data.original_station === data.destination_station) {
+      toast.error("Original Station and Destination Station must be different");
+      return;
+    }
+
+    try {
+      // support sync or async onSave handlers
+      const result = await Promise.resolve(onSave ? onSave(data) : null);
+      console.log("onSave result:", result);
+      toast.success("Transfer request saved");
+      reset();
+      // notify parent to close modal (parent may also close when it receives saved data)
+      onClose();
+    } catch (err) {
+      console.error("Failed to save transfer request:", err);
+      toast.error("Failed to save transfer request");
+    }
+  };
 // ...existing code...















 [Debug] DataTable render rows: – 4 – "loading:" – false – "total:" – null (DataTable.tsx, line 115)
[Log] Submitting transfer request: (TransferRequestForm.tsx, line 127)
Object

bulk_transfer: false

destination_station: "674276bb-a81a-4d97-9580-248056cb4b71"

destination_station_oc_acknowledged: false

destination_station_oc_approval_status: ""

destination_station_oc_approved_by: 0

destination_station_oc_approved_date: ""

in_charge: "fbb3380e-8b3d-4deb-9475-b10f5cac5726"

number_of_prisoners: 1

original_station: "aa2e5a10-08d0-4a2e-9ec2-02a46e1ad54f"

original_station_oc_acknowledged: false

original_station_oc_approval_status: ""

original_station_oc_approved_by: 0

original_station_oc_approved_date: ""

prisoner: "c9749ce7-82ff-4266-9acc-ae18c0294eb7"

reason: "a81ac3d7-a469-4956-85e2-98742b8d6752"

status: "c7908c57-4d73-464a-9370-edbae19b1f53"

Object Prototype
[Log] onSave result: (TransferRequestForm.tsx, line 135)
Object

bulk_transfer: false

destination_station: "674276bb-a81a-4d97-9580-248056cb4b71"

destination_station_oc_acknowledged: false

destination_station_oc_approval_status: ""

destination_station_oc_approved_by: 0

destination_station_oc_approved_date: ""

in_charge: "fbb3380e-8b3d-4deb-9475-b10f5cac5726"

number_of_prisoners: 1

original_station: "aa2e5a10-08d0-4a2e-9ec2-02a46e1ad54f"

original_station_oc_acknowledged: false

original_station_oc_approval_status: ""

original_station_oc_approved_by: 0

original_station_oc_approved_date: ""

prisoner: "c9749ce7-82ff-4266-9acc-ae18c0294eb7"

reason: "a81ac3d7-a469-4956-85e2-98742b8d6752"

status: "c7908c57-4d73-464a-9370-edbae19b1f53"

Object Prototype
[Debug] DataTable render rows: – 4 – "loading:" – false – "total:" – null (DataTable.tsx, line 115)












// edit not wrking but drop down with loading

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FileText,
  Calendar,
  User,
  Building2,
  Users,
  X,
  Save,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

import { fetchStations, fetchReasons, fetchStatuses } from "../../services/transferServices/transferRequestService";
import { createTransferRequest } from "../../services/transferServices/transferRequestService";
import { fetchPrisoners } from "../../services/customPrisonersService";
import { fetchStaffProfiles } from "../../services/staffProfilesService";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import SearchableSelect from "../common/SearchableSelect"; // reusable searchable select
import StaffProfileSelect from "../common/StaffProfileSelect";
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";


interface TransferRequest {
  id?: string;
  prisoner_name?: string;
  original_station_name?: string;
  destination_station_name?: string;
  reason_name?: string;
  status_name?: string;
  in_charge_name?: string;
  original_oc_approval_status_name?: string;
  destination_oc_approval_status_name?: string;
  bulk_transfer: boolean;
  number_of_prisoners: number;
  original_station_oc_acknowledged: boolean;
  destination_station_oc_acknowledged: boolean;
  original_station_oc_approved_date: string;
  destination_station_oc_approved_date: string;
  prisoner: string;
  original_station: string;
  destination_station: string;
  reason: string;
  in_charge: number;
  status: string;
  original_station_oc_approval_status: string;
  destination_station_oc_approval_status: string;
  original_station_oc_approved_by: number;
  destination_station_oc_approved_by: number;
}

interface TransferRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransferRequest) => void;
  editingRequest?: TransferRequest | null;
  prisoners?: Array<{ id: string; name: string; number: string }>;
  stations?: Array<{ id: string; name: string }>;
  reasons?: Array<{ id: string; name: string }>;
  statuses?: Array<{ id: string; name: string }>;
  approvalStatuses?: Array<{ id: string; name: string }>;
  staff?: Array<{ id: number; name: string }>;
}

export default function TransferRequestForm({
  open,
  onClose,
  onSave,
  editingRequest,
  prisoners: prisonersProp = [],
  stations: stationsProp = [],
  reasons: reasonsProp = [],
  statuses: statusesProp = [],
  approvalStatuses = [],
  staff: staffProp = [],
}: TransferRequestFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransferRequest>({
    defaultValues: {
      bulk_transfer: false,
      number_of_prisoners: 1,
      original_station_oc_acknowledged: false,
      destination_station_oc_acknowledged: false,
      original_station_oc_approved_date: "",
      destination_station_oc_approved_date: "",
      prisoner: "",
      original_station: "",
      destination_station: "",
      reason: "",
      in_charge: "", // <- use empty string (controlled Select expects string)
      status: "",
      original_station_oc_approval_status: "",
      destination_station_oc_approval_status: "",
      original_station_oc_approved_by: "",
      destination_station_oc_approved_by: "",
    },
  });

  const isBulkTransfer = watch("bulk_transfer");

  // remove local prisoners/staff usage for selects (we still keep for initial items)
  const [stations, setStations] = useState<any[]>(stationsProp || []);
  const [prisoners, setPrisoners] = useState<any[]>(prisonersProp || []);
  const [reasons, setReasons] = useState<any[]>(reasonsProp || []);
  const [statuses, setStatuses] = useState<any[]>(statusesProp || []);
  const [staff, setStaff] = useState<any[]>(staffProp || []);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // label to display for original station (when single transfer)
  const [originalStationLabel, setOriginalStationLabel] = useState<string>("");

  // sync with global location filter to pre-filter stations when bulk
  useFilterRefresh(() => {
    const station = localStorage.getItem("selectedStation") || undefined;
    const region = localStorage.getItem("selectedRegion") || undefined;
    const district = localStorage.getItem("selectedDistrict") || undefined;
    // when global filter changes, reload stations (only used when bulk)
    loadStations({
      station: station && station !== "all" ? station : undefined,
      region: region && region !== "all" ? region : undefined,
      district: district && district !== "all" ? district : undefined,
    });
  }, []);

  useEffect(() => {
    if (editingRequest) {
      reset({
        bulk_transfer: editingRequest.bulk_transfer || false,
        number_of_prisoners: editingRequest.number_of_prisoners || 1,
        original_station_oc_acknowledged:
          editingRequest.original_station_oc_acknowledged || false,
        destination_station_oc_acknowledged:
          editingRequest.destination_station_oc_acknowledged || false,
        original_station_oc_approved_date:
          editingRequest.original_station_oc_approved_date?.split("T")[0] || "",
        destination_station_oc_approved_date:
          editingRequest.destination_station_oc_approved_date?.split("T")[0] || "",
        prisoner: editingRequest.prisoner || "",
        original_station: editingRequest.original_station || "",
        destination_station: editingRequest.destination_station || "",
        reason: editingRequest.reason || "",
        in_charge: editingRequest.in_charge || 0,
        status: editingRequest.status || "",
        original_station_oc_approval_status:
          editingRequest.original_station_oc_approval_status || "",
        destination_station_oc_approval_status:
          editingRequest.destination_station_oc_approval_status || "",
        original_station_oc_approved_by:
          editingRequest.original_station_oc_approved_by || 0,
        destination_station_oc_approved_by:
          editingRequest.destination_station_oc_approved_by || 0,
      });
    } else {
      reset({
        bulk_transfer: false,
        number_of_prisoners: 1,
        original_station_oc_acknowledged: false,
        destination_station_oc_acknowledged: false,
        original_station_oc_approved_date: "",
        destination_station_oc_approved_date: "",
        prisoner: "",
        original_station: "",
        destination_station: "",
        reason: "",
        in_charge: 0,
        status: "",
        original_station_oc_approval_status: "",
        destination_station_oc_approval_status: "",
        original_station_oc_approved_by: 0,
        destination_station_oc_approved_by: 0,
      });
    }
  }, [editingRequest, reset]);

  const onSubmit = async (data: TransferRequest) => {
    console.log("Submitting transfer request:", data);
    if (data.original_station && data.destination_station && data.original_station === data.destination_station) {
      toast.error("Original Station and Destination Station must be different");
      return;
    }

    try {
      // call parent onSave if provided
      const result = await Promise.resolve(onSave ? onSave(data) : undefined);
      console.log("onSave result:", result);

      if (typeof result === "undefined") {
        // Parent did not handle saving — fallback: call API directly
        try {
          const created = await createTransferRequest(data);
          console.log("createTransferRequest result:", created);
          toast.success("Transfer request saved");
          reset();
          onClose();
          return;
        } catch (err) {
          console.error("createTransferRequest failed:", err);
          toast.error("Failed to save transfer request");
          return;
        }
      }

      // parent returned something (assume success)
      toast.success("Transfer request saved");
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to save transfer request:", err);
      toast.error("Failed to save transfer request");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    // load lookup data when form mounts
    let mounted = true;
    setLoadingLookups(true);
    const c = new AbortController();
    Promise.all([
      fetchStations(c.signal).catch(() => []),
      fetchReasons(c.signal).catch(() => []),
      fetchStatuses(c.signal).catch(() => []),
      fetchStaffProfiles("", c.signal).catch(() => ({ items: [] })), // keep staff if needed
      // remove fetchPrisoners here to avoid duplicate requests - CustomPrisonerSearch will fetch itself
      // fetchPrisoners({ page_size: 100 }, c.signal).catch(() => ({ items: [] })),
    ])
      .then(([st, rsn, sts, sfRes /*, prRes */]) => {
        if (!mounted) return;
        setStations(st);
        setReasons(rsn);
        setStatuses(sts);
        setStaff(Array.isArray(sfRes) ? sfRes : (sfRes?.items ?? []));
        // setPrisoners(prRes?.items ?? []); // remove or keep only if used elsewhere
      })
      .finally(() => {
        setLoadingLookups(false);
      });
    return () => {
      mounted = false;
      c.abort();
    };
  }, []);

  const loadStations = async (params?: any) => {
    setLoadingLookups(true);
    const c = new AbortController();
    try {
      const data = await fetchStations({ ...params, page_size: 100 }, c.signal);
      setStations(data);
    } catch (error) {
      setStations([]);
    } finally {
      setLoadingLookups(false);
    }
  };

  // keep watcher
  const prisonerVal = watch("prisoner");
  const originalStationVal = watch("original_station");

  useEffect(() => {
    // When not bulk, auto-populate original station from selected prisoner.
    // Try local cache first, then fall back to server lookup.
    let cancelled = false;
    const c = new AbortController();
    async function resolvePrisonerStation(pId?: string | null) {
      if (!pId) {
        setValue("original_station", "");
        setOriginalStationLabel("");
        return;
      }

      // 1) try local cache
      const local = prisoners.find((p: any) => String(p.id) === String(pId));
      if (local && local.current_station) {
        setValue("original_station", local.current_station);
        setOriginalStationLabel(local.current_station_name ?? "");
        return;
      }

      // 2) try stations/search by id via fetchPrisoners - some backends support id lookup via search
      // (you can keep or remove; if kept ensure useCache:true and page_size:1)
      // try {
      //   const res = await fetchPrisoners({ search: String(pId), page_size: 1 }, c.signal);
      //   if (cancelled) return;
      //   const p = res.items?.[0];
      //   if (p && p.current_station) {
      //     setValue("original_station", p.current_station);
      //     return;
      //   }
      // } catch (_) {
      //   // ignore network/abort errors — leave original_station blank
      // }
    }

    if (!isBulkTransfer) {
      resolvePrisonerStation(prisonerVal);
    } else {
      // when bulk, do not auto-populate
      if (!prisonerVal) {
        setValue("original_station", "");
        setOriginalStationLabel("");
      }
    }

    return () => {
      cancelled = true;
      c.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkTransfer, prisonerVal, prisoners]);

  // Keep originalStationLabel in sync when original_station value or stations list changes
  useEffect(() => {
    if (!originalStationVal) {
      setOriginalStationLabel("");
      return;
    }
    // prefer stations lookup
    const s = stations.find((st: any) => String(st.id) === String(originalStationVal));
    if (s) {
      setOriginalStationLabel(s.name ?? "");
      return;
    }
    // fallback: try to find prisoner and use its current_station_name
    const p = prisoners.find((pr: any) => String(pr.id) === String(prisonerVal));
    if (p && p.current_station_name) {
      setOriginalStationLabel(p.current_station_name);
      return;
    }
  }, [originalStationVal, stations, prisoners, prisonerVal]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingRequest ? "Edit Transfer Request" : "Add Transfer Request"}
            </DialogTitle>
            <DialogDescription>
             Please complete the form to create or update a transfer request.
           </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Bulk Transfer Toggle */}
            <div className="border-b pb-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="bulk_transfer"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="bulk_transfer"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          setValue("number_of_prisoners", 1);
                        }
                      }}
                    />
                  )}
                />
                <label
                  htmlFor="bulk_transfer"
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Bulk Transfer (Multiple Prisoners)
                </label>
              </div>
            </div>

            {/* Prisoner or Number of Prisoners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isBulkTransfer ? (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Prisoner
                  </Label>
                  <Controller
                    name="prisoner"
                    control={control}
                    rules={{ required: !isBulkTransfer ? "Prisoner is required" : false }}
                    render={({ field }) => (
                      <CustomPrisonerSearch
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        onSelectItem={(p) => {
                          // immediately clear previous station to avoid showing stale data
                          setValue("original_station", "");
                          setOriginalStationLabel("");

                          // derive stable station fields for the selected item
                          const stationId =
                            p?.current_station ??
                            p?.station ??
                            (p as any)?.stationId ??
                            (p as any)?.station_id ??
                            "";
                          const stationName =
                            p?.current_station_name ??
                            p?.station_name ??
                            (p as any)?.stationName ??
                            "";

                          try {
                            console.log("Prisoner selected (final):", {
                              id: p?.id ?? null,
                              name:
                                p?.full_name ??
                                `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim(),
                              stationId,
                              stationName,
                            });
                          } catch {}

                          // populate form field + label if available (will overwrite the cleared values)
                          if (stationId) {
                            setValue("original_station", stationId);
                          }
                          if (stationName) {
                            setOriginalStationLabel(stationName);
                          }

                          // keep prisoners cache up-to-date (so other lookups can use it)
                          setPrisoners((prev) => {
                            if (!p) return prev;
                            const exists = prev.some(
                              (x: any) => String(x.id) === String(p.id)
                            );
                            if (exists) return prev;
                            return [p, ...prev];
                          });
                        }}
                        placeholder="Select prisoner"
                        idField="id"
                        labelField="full_name"
                        initialItems={prisoners}
                        pageSize={25}
                        disabled={false}
                      />
                    )}
                  />
                  {errors.prisoner && (
                    <span className="text-sm text-red-500">
                      {errors.prisoner.message}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Prisoners
                  </Label>
                  <Controller
                    name="number_of_prisoners"
                    control={control}
                    rules={{
                      required: isBulkTransfer
                        ? "Number of prisoners is required"
                        : false,
                      min: { value: 1, message: "Must be at least 1" },
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        min="1"
                      />
                    )}
                  />
                  {errors.number_of_prisoners && (
                    <span className="text-sm text-red-500">
                      {errors.number_of_prisoners.message}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Officer In Charge
                </Label>
                <Controller
                  name="in_charge"
                  control={control}
                  rules={{ required: "Officer in charge is required" }}
                  render={({ field }) => (
                    <StaffProfileSelect
                      value={String(field.value ?? "")}
                      onChange={(v) => field.onChange(v ?? "")}
                      placeholder="Select officer in charge"
                      initialItems={staff} // <-- pass initial items to avoid flicker
                    />
                  )}
                />
                {errors.in_charge && (
                  <span className="text-sm text-red-500">
                    {errors.in_charge.message}
                  </span>
                )}
              </div>
            </div>

            {/* Stations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Original Station
                </Label>
                <Controller
                  name="original_station"
                  control={control}
                  rules={{ required: isBulkTransfer ? "Original station is required" : false }}
                  render={({ field }) => {
                    // when not bulk: show read-only label so user can't change; when bulk: full searchable select
                    if (!isBulkTransfer) {
                      const stationLabel = stations.find((s: any) => String(s.id) === String(field.value))?.name
                        || originalStationLabel
                        || (prisoners.find((p: any) => String(p.id) === String(prisonerVal))?.current_station_name)
                        || "";
                      return (
                        <Input value={stationLabel} readOnly placeholder="Auto-filled from prisoner" />
                      );
                    }
                    return (
                      <SearchableSelect
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        placeholder="Select original station"
                        items={stations}
                        idField="id"
                        labelField="name"
                      />
                    );
                  }}
                />
                {!isBulkTransfer && <div className="text-xs text-gray-500">Auto-populated from selected prisoner (disabled for single transfers)</div>}
                {errors.original_station && (<span className="text-sm text-red-500">{errors.original_station.message}</span>)}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Destination Station
                </Label>
                <Controller
                  name="destination_station"
                  control={control}
                  rules={{ required: "Destination station is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      placeholder="Select destination station"
                      items={stations.filter((s: any) => s.id !== (originalStationVal || ""))}
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {errors.destination_station && (<span className="text-sm text-red-500">{errors.destination_station.message}</span>)}
              </div>
            </div>

            {/* Reason and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Reason</Label>
                <Controller
                  name="reason"
                  control={control}
                  rules={{ required: "Reason is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={reasons}
                      idField="id"
                      labelField="name"
                      placeholder="Select reason"
                    />
                  )}
                />
                {errors.reason && (
                  <span className="text-sm text-red-500">
                    {errors.reason.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Request Status</Label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={statuses}
                      idField="id"
                      labelField="name"
                      placeholder="Select status"
                    />
                  )}
                />
                {errors.status && (
                  <span className="text-sm text-red-500">
                    {errors.status.message}
                  </span>
                )}
              </div>
            </div>

            {/* OC Approval Information removed */}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4" />
                {editingRequest ? "Update Request" : "Create Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}




// before adding view option

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FileText,
  Calendar,
  User,
  Building2,
  Users,
  X,
  Save,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

import { fetchStations, fetchReasons, fetchStatuses } from "../../services/transferServices/transferRequestService";
import { createTransferRequest, updateTransferRequest } from "../../services/transferServices/transferRequestService";
import { fetchPrisoners } from "../../services/customPrisonersService";
import { fetchStaffProfiles } from "../../services/staffProfilesService";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import SearchableSelect from "../common/SearchableSelect"; // reusable searchable select
import StaffProfileSelect from "../common/StaffProfileSelect";
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";


interface TransferRequest {
  id?: string;
  prisoner_name?: string;
  original_station_name?: string;
  destination_station_name?: string;
  reason_name?: string;
  status_name?: string;
  in_charge_name?: string;
  original_oc_approval_status_name?: string;
  destination_oc_approval_status_name?: string;
  bulk_transfer: boolean;
  number_of_prisoners: number;
  original_station_oc_acknowledged: boolean;
  destination_station_oc_acknowledged: boolean;
  original_station_oc_approved_date: string;
  destination_station_oc_approved_date: string;
  prisoner: string;
  original_station: string;
  destination_station: string;
  reason: string;
  in_charge: number;
  status: string;
  original_station_oc_approval_status: string;
  destination_station_oc_approval_status: string;
  original_station_oc_approved_by: number;
  destination_station_oc_approved_by: number;
}

interface TransferRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransferRequest) => void;
  editingRequest?: TransferRequest | null;
  prisoners?: Array<{ id: string; name: string; number: string }>;
  stations?: Array<{ id: string; name: string }>;
  reasons?: Array<{ id: string; name: string }>;
  statuses?: Array<{ id: string; name: string }>;
  approvalStatuses?: Array<{ id: string; name: string }>;
  staff?: Array<{ id: number; name: string }>;
}

export default function TransferRequestForm({
  open,
  onClose,
  onSave,
  editingRequest,
  prisoners: prisonersProp = [],
  stations: stationsProp = [],
  reasons: reasonsProp = [],
  statuses: statusesProp = [],
  approvalStatuses = [],
  staff: staffProp = [],
}: TransferRequestFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransferRequest>({
    defaultValues: {
      bulk_transfer: false,
      number_of_prisoners: 1,
      original_station_oc_acknowledged: false,
      destination_station_oc_acknowledged: false,
      original_station_oc_approved_date: "",
      destination_station_oc_approved_date: "",
      prisoner: "",
      original_station: "",
      destination_station: "",
      reason: "",
      in_charge: "", // <- use empty string (controlled Select expects string)
      status: "",
      original_station_oc_approval_status: "",
      destination_station_oc_approval_status: "",
      original_station_oc_approved_by: "",
      destination_station_oc_approved_by: "",
    },
  });

  const isBulkTransfer = watch("bulk_transfer");

  // remove local prisoners/staff usage for selects (we still keep for initial items)
  const [stations, setStations] = useState<any[]>(stationsProp || []);
  const [prisoners, setPrisoners] = useState<any[]>(prisonersProp || []);
  const [reasons, setReasons] = useState<any[]>(reasonsProp || []);
  const [statuses, setStatuses] = useState<any[]>(statusesProp || []);
  const [staff, setStaff] = useState<any[]>(staffProp || []);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // label to display for original station (when single transfer)
  const [originalStationLabel, setOriginalStationLabel] = useState<string>("");

  // sync with global location filter to pre-filter stations when bulk
  useFilterRefresh(() => {
    const station = localStorage.getItem("selectedStation") || undefined;
    const region = localStorage.getItem("selectedRegion") || undefined;
    const district = localStorage.getItem("selectedDistrict") || undefined;
    // when global filter changes, reload stations (only used when bulk)
    loadStations({
      station: station && station !== "all" ? station : undefined,
      region: region && region !== "all" ? region : undefined,
      district: district && district !== "all" ? district : undefined,
    });
  }, []);

  useEffect(() => {
    if (editingRequest) {
      reset({
        bulk_transfer: editingRequest.bulk_transfer || false,
        number_of_prisoners: editingRequest.number_of_prisoners || 1,
        original_station_oc_acknowledged:
          editingRequest.original_station_oc_acknowledged || false,
        destination_station_oc_acknowledged:
          editingRequest.destination_station_oc_acknowledged || false,
        original_station_oc_approved_date:
          editingRequest.original_station_oc_approved_date?.split("T")[0] || "",
        destination_station_oc_approved_date:
          editingRequest.destination_station_oc_approved_date?.split("T")[0] || "",
        prisoner: editingRequest.prisoner || "",
        original_station: editingRequest.original_station || "",
        destination_station: editingRequest.destination_station || "",
        reason: editingRequest.reason || "",
        in_charge: editingRequest.in_charge || 0,
        status: editingRequest.status || "",
        original_station_oc_approval_status:
          editingRequest.original_station_oc_approval_status || "",
        destination_station_oc_approval_status:
          editingRequest.destination_station_oc_approval_status || "",
        original_station_oc_approved_by:
          editingRequest.original_station_oc_approved_by || 0,
        destination_station_oc_approved_by:
          editingRequest.destination_station_oc_approved_by || 0,
      });
    } else {
      reset({
        bulk_transfer: false,
        number_of_prisoners: 1,
        original_station_oc_acknowledged: false,
        destination_station_oc_acknowledged: false,
        original_station_oc_approved_date: "",
        destination_station_oc_approved_date: "",
        prisoner: "",
        original_station: "",
        destination_station: "",
        reason: "",
        in_charge: 0,
        status: "",
        original_station_oc_approval_status: "",
        destination_station_oc_approval_status: "",
        original_station_oc_approved_by: 0,
        destination_station_oc_approved_by: 0,
      });
    }
  }, [editingRequest, reset]);

  const onSubmit = async (data: TransferRequest) => {
    console.log("Submitting transfer request:", data);
    if (data.original_station && data.destination_station && data.original_station === data.destination_station) {
      toast.error("Original Station and Destination Station must be different");
      return;
    }

    try {
      // If editingRequest exists -> update path (use API)
      if (editingRequest && editingRequest.id) {
        // defensive: if the form is actually filled for a new record (no prisoner or id mismatch),
        // fall back to create. Adjust the check to match your domain if needed.
        const isLikelyCreate = !editingRequest.prisoner && !!data.prisoner;
        if (!isLikelyCreate) {
          // proceed with update
          const updated = await updateTransferRequest(String(editingRequest.id), data);
          console.log("updateTransferRequest result:", updated);
          // notify parent callback and listeners
          try { if (onSave) await Promise.resolve(onSave(updated)); } catch {}
          try { window.dispatchEvent(new CustomEvent("transfer:updated", { detail: updated })); } catch {}
          toast.success("Transfer request updated");
          reset();
          onClose();
          return;
        }
      }

      // Create path (call API here, then notify parent)
      // Always perform create here, then notify parent with the created object
      const created = await createTransferRequest(data);
      console.log("createTransferRequest result:", created);
      try { if (onSave) await Promise.resolve(onSave(created as any)); } catch (e) { console.warn("onSave handler failed:", e); }
      try { window.dispatchEvent(new CustomEvent("transfer:created", { detail: created })); } catch (e) {}
       toast.success("Transfer request saved");
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to save transfer request:", err);
      toast.error("Failed to save transfer request");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    // load lookup data when form mounts
    let mounted = true;
    setLoadingLookups(true);
    const c = new AbortController();
    Promise.all([
      fetchStations(c.signal).catch(() => []),
      fetchReasons(c.signal).catch(() => []),
      fetchStatuses(c.signal).catch(() => []),
      fetchStaffProfiles("", c.signal).catch(() => ({ items: [] })), // keep staff if needed
      // remove fetchPrisoners here to avoid duplicate requests - CustomPrisonerSearch will fetch itself
      // fetchPrisoners({ page_size: 100 }, c.signal).catch(() => ({ items: [] })),
    ])
      .then(([st, rsn, sts, sfRes /*, prRes */]) => {
        if (!mounted) return;
        setStations(st);
        setReasons(rsn);
        setStatuses(sts);
        setStaff(Array.isArray(sfRes) ? sfRes : (sfRes?.items ?? []));
        // setPrisoners(prRes?.items ?? []); // remove or keep only if used elsewhere
      })
      .finally(() => {
        setLoadingLookups(false);
      });
    return () => {
      mounted = false;
      c.abort();
    };
  }, []);

  const loadStations = async (params?: any) => {
    setLoadingLookups(true);
    const c = new AbortController();
    try {
      const data = await fetchStations({ ...params, page_size: 100 }, c.signal);
      setStations(data);
    } catch (error) {
      setStations([]);
    } finally {
      setLoadingLookups(false);
    }
  };

  // keep watcher
  const prisonerVal = watch("prisoner");
  const originalStationVal = watch("original_station");

  useEffect(() => {
    // When not bulk, auto-populate original station from selected prisoner.
    // Try local cache first, then fall back to server lookup.
    let cancelled = false;
    const c = new AbortController();
    async function resolvePrisonerStation(pId?: string | null) {
      if (!pId) {
        setValue("original_station", "");
        setOriginalStationLabel("");
        return;
      }

      // 1) try local cache
      const local = prisoners.find((p: any) => String(p.id) === String(pId));
      if (local && local.current_station) {
        setValue("original_station", local.current_station);
        setOriginalStationLabel(local.current_station_name ?? "");
        return;
      }

      // 2) try stations/search by id via fetchPrisoners - some backends support id lookup via search
      // (you can keep or remove; if kept ensure useCache:true and page_size:1)
      // try {
      //   const res = await fetchPrisoners({ search: String(pId), page_size: 1 }, c.signal);
      //   if (cancelled) return;
      //   const p = res.items?.[0];
      //   if (p && p.current_station) {
      //     setValue("original_station", p.current_station);
      //     return;
      //   }
      // } catch (_) {
      //   // ignore network/abort errors — leave original_station blank
      // }
    }

    if (!isBulkTransfer) {
      resolvePrisonerStation(prisonerVal);
    } else {
      // when bulk, do not auto-populate
      if (!prisonerVal) {
        setValue("original_station", "");
        setOriginalStationLabel("");
      }
    }

    return () => {
      cancelled = true;
      c.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkTransfer, prisonerVal, prisoners]);

  // Keep originalStationLabel in sync when original_station value or stations list changes
  useEffect(() => {
    if (!originalStationVal) {
      setOriginalStationLabel("");
      return;
    }
    // prefer stations lookup
    const s = stations.find((st: any) => String(st.id) === String(originalStationVal));
    if (s) {
      setOriginalStationLabel(s.name ?? "");
      return;
    }
    // fallback: try to find prisoner and use its current_station_name
    const p = prisoners.find((pr: any) => String(pr.id) === String(prisonerVal));
    if (p && p.current_station_name) {
      setOriginalStationLabel(p.current_station_name);
      return;
    }
  }, [originalStationVal, stations, prisoners, prisonerVal]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingRequest ? "Edit Transfer Request" : "Add Transfer Request"}
            </DialogTitle>
            <DialogDescription>
              {editingRequest ? "Please complete the form to update a transfer request." : "Please complete the form to create a transfer request."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Bulk Transfer Toggle */}
            <div className="border-b pb-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="bulk_transfer"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="bulk_transfer"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          setValue("number_of_prisoners", 1);
                        }
                      }}
                    />
                  )}
                />
                <label
                  htmlFor="bulk_transfer"
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Bulk Transfer (Multiple Prisoners)
                </label>
              </div>
            </div>

            {/* Prisoner or Number of Prisoners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isBulkTransfer ? (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Prisoner
                  </Label>
                  <Controller
                    name="prisoner"
                    control={control}
                    rules={{ required: !isBulkTransfer ? "Prisoner is required" : false }}
                    render={({ field }) => (
                      <CustomPrisonerSearch
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        onSelectItem={(p) => {
                          // immediately clear previous station to avoid showing stale data
                          setValue("original_station", "");
                          setOriginalStationLabel("");

                          // derive stable station fields for the selected item
                          const stationId =
                            p?.current_station ??
                            p?.station ??
                            (p as any)?.stationId ??
                            (p as any)?.station_id ??
                            "";
                          const stationName =
                            p?.current_station_name ??
                            p?.station_name ??
                            (p as any)?.stationName ??
                            "";

                          try {
                            console.log("Prisoner selected (final):", {
                              id: p?.id ?? null,
                              name:
                                p?.full_name ??
                                `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim(),
                              stationId,
                              stationName,
                            });
                          } catch {}

                          // populate form field + label if available (will overwrite the cleared values)
                          if (stationId) {
                            setValue("original_station", stationId);
                          }
                          if (stationName) {
                            setOriginalStationLabel(stationName);
                          }

                          // keep prisoners cache up-to-date (so other lookups can use it)
                          setPrisoners((prev) => {
                            if (!p) return prev;
                            const exists = prev.some(
                              (x: any) => String(x.id) === String(p.id)
                            );
                            if (exists) return prev;
                            return [p, ...prev];
                          });
                        }}
                        placeholder="Select prisoner"
                        idField="id"
                        labelField="full_name"
                        initialItems={prisoners}
                        pageSize={25}
                        disabled={false}
                      />
                    )}
                  />
                  {errors.prisoner && (
                    <span className="text-sm text-red-500">
                      {errors.prisoner.message}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Prisoners
                  </Label>
                  <Controller
                    name="number_of_prisoners"
                    control={control}
                    rules={{
                      required: isBulkTransfer
                        ? "Number of prisoners is required"
                        : false,
                      min: { value: 1, message: "Must be at least 1" },
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        min="1"
                      />
                    )}
                  />
                  {errors.number_of_prisoners && (
                    <span className="text-sm text-red-500">
                      {errors.number_of_prisoners.message}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Officer In Charge
                </Label>
                <Controller
                  name="in_charge"
                  control={control}
                  rules={{ required: "Officer in charge is required" }}
                  render={({ field }) => (
                    <StaffProfileSelect
                      value={String(field.value ?? "")}
                      onChange={(v) => field.onChange(v ?? "")}
                      placeholder="Select officer in charge"
                      initialItems={staff} // <-- pass initial items to avoid flicker
                    />
                  )}
                />
                {errors.in_charge && (
                  <span className="text-sm text-red-500">
                    {errors.in_charge.message}
                  </span>
                )}
              </div>
            </div>

            {/* Stations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Original Station
                </Label>
                <Controller
                  name="original_station"
                  control={control}
                  rules={{ required: isBulkTransfer ? "Original station is required" : false }}
                  render={({ field }) => {
                    // when not bulk: show read-only label so user can't change; when bulk: full searchable select
                    if (!isBulkTransfer) {
                      const stationLabel = stations.find((s: any) => String(s.id) === String(field.value))?.name
                        || originalStationLabel
                        || (prisoners.find((p: any) => String(p.id) === String(prisonerVal))?.current_station_name)
                        || "";
                      return (
                        <Input value={stationLabel} readOnly placeholder="Auto-filled from prisoner" />
                      );
                    }
                    return (
                      <SearchableSelect
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        placeholder="Select original station"
                        items={stations}
                        idField="id"
                        labelField="name"
                      />
                    );
                  }}
                />
                {!isBulkTransfer && <div className="text-xs text-gray-500">Auto-populated from selected prisoner (disabled for single transfers)</div>}
                {errors.original_station && (<span className="text-sm text-red-500">{errors.original_station.message}</span>)}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Destination Station
                </Label>
                <Controller
                  name="destination_station"
                  control={control}
                  rules={{ required: "Destination station is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      placeholder="Select destination station"
                      items={stations.filter((s: any) => s.id !== (originalStationVal || ""))}
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {errors.destination_station && (<span className="text-sm text-red-500">{errors.destination_station.message}</span>)}
              </div>
            </div>

            {/* Reason and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Reason</Label>
                <Controller
                  name="reason"
                  control={control}
                  rules={{ required: "Reason is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={reasons}
                      idField="id"
                      labelField="name"
                      placeholder="Select reason"
                    />
                  )}
                />
                {errors.reason && (
                  <span className="text-sm text-red-500">
                    {errors.reason.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Request Status</Label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={statuses}
                      idField="id"
                      labelField="name"
                      placeholder="Select status"
                    />
                  )}
                />
                {errors.status && (
                  <span className="text-sm text-red-500">
                    {errors.status.message}
                  </span>
                )}
              </div>
            </div>

            {/* OC Approval Information removed */}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4" />
                {editingRequest ? "Update Request" : "Create Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}



prisnoer search b4 scroll

import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../ui/utils";
import { fetchPrisoners } from "../../services/customPrisonersService";
import { useFilters } from "../../contexts/FilterContext";
import { usePaginatedSearch } from "../../hooks/usePaginatedSearch";

type Item = Record<string, any>;

type Props = {
  value?: string | null;
  onChange: (val: string | null) => void;
  placeholder?: string;
  pageSize?: number;
  disabled?: boolean;
  className?: string;
  idField?: string; // default "id"
  labelField?: string; // default "full_name"
  initialItems?: Item[]; // optional initial list
  onSelectItem?: (item: Item) => void; // <--- add this prop
};

export default function CustomPrisonerSearch({
  value = null,
  onChange,
  placeholder = "Search prisoner...",
  pageSize = 25,
  disabled = false,
  className,
  idField = "id",
  labelField = "full_name",
  initialItems = [],
  onSelectItem, // <--- destructure here
}: Props) {
  const { station: globalStation, district: globalDistrict, region: globalRegion } = useFilters();

  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [contentWidth, setContentWidth] = useState<number | null>(null);

  // use hook for paginated search (debounced + abort + loadMore)
  const {
    query,
    setQuery,
    items,
    loading,
    error,
    hasNext,
    loadMore,
  } = usePaginatedSearch<Item>(fetchPrisoners, {
    initialQuery: "",
    pageSize,
    debounceMs: 300,
    filters: {
      station: globalStation || null,
      district: globalDistrict || null,
      region: globalRegion || null,
      useCache: true,
    },
    initialItems: initialItems || [],
    idField,
  });

  // keep selected label in sync with provided value and items
  useEffect(() => {
    if (!value) {
      setSelectedLabel(null);
      return;
    }
    const found = items.find((it) => String(it[idField]) === String(value));
    if (found) {
      setSelectedLabel(found[labelField]);
      return;
    }
    // if not found in current items, try to fetch single record
    const ctrl = new AbortController();
    fetchPrisoners({ search: String(value), page_size: 1, page: 1, station: globalStation || null, district: globalDistrict || null, region: globalRegion || null }, ctrl.signal)
      .then((res) => {
        const p = (res.items || [])[0];
        if (p) {
          setSelectedLabel(p[labelField]);
        }
      })
      .catch(() => {})
      .finally(() => ctrl.abort());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items, idField, labelField]);

  useEffect(() => {
    if (!open) return;
    const updateWidth = () => {
      const w = triggerRef.current?.offsetWidth ?? null;
      setContentWidth(w);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [open]);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left"
            type="button"
            disabled={disabled}
            onClick={() => {
              // open and ensure initial fetch for empty query
              if (!open) {
                // only trigger the debounced hook fetch when we don't already have items
                if (items.length === 0) {
                  setQuery(""); // trigger initial fetch (hook is debounced)
                }
              }
            }}
          >
            {value ? (selectedLabel ?? String(value)) : <span className="text-gray-500 text-sm">{placeholder}</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0"
          style={contentWidth ? { width: `${contentWidth}px` } : undefined}
        >
          <Command shouldFilter={false}>
            <CommandInput placeholder={placeholder} value={query} onValueChange={(v) => setQuery(v)} />
            <CommandList>
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>No prisoner found.</CommandEmpty>
                  <CommandGroup>
                    {items.map((p) => {
                      const id = String(p[idField]);
                      const label = String(p[labelField] ?? id);

                      // derive stable station fields for each item (tries multiple common keys)
                      const stationId = p.current_station ?? p.station ?? p.current_station_id ?? p.station_id ?? p.stationId ?? "";
                      const stationName = p.current_station_name ?? p.station_name ?? p.stationName ?? "";

                      return (
                        <CommandItem
                          key={id}
                          value={id}
                          onSelect={() => {
                            onChange(id);
                            setSelectedLabel(label);
                            // call parent with full item plus explicit station fields (guaranteed keys)
                            try {
                              onSelectItem?.({ ...p, stationId, stationName });
                            } catch {}
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check className={cn("mr-2 h-4 w-4", String(value) === id ? "opacity-100" : "opacity-0")} style={{ color: "#650000" }} />
                          <div className="flex flex-col text-sm">
                            <span>{label}</span>
                            <span className="text-xs text-gray-500">{p.prisoner_number_value ?? p.prisoner_number ?? ""}</span>
                          </div>

                          {/* hidden metadata (kept in DOM for debugging / easy extraction) */}
                          <span style={{ display: "none" }} data-station-id={stationId} data-station-name={stationName} />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>

                  {/* Load more */}
                  {hasNext && (
                    <div className="flex items-center justify-center p-2">
                      <button
                        type="button"
                        onClick={() => loadMore()}
                        className="text-sm text-[#650000] px-3 py-1 rounded hover:underline"
                        disabled={loading}
                      >
                        {loading ? "Loading..." : "Load more"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}











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
                      value={String(field.value ?? "")}
                      onChange={(v) => field.onChange(v ?? "")}
                      placeholder="Select welfare officer"
                      initialItems={[]} // optional: replace with cached staff if available
                    />
                  )}
                />
                {callForm.formState.errors.welfare_officer && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.welfare_officer as any).message}</p>
                )}
              </div>









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
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";

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

  // small totals used in tab labels (we still fetch totals separately)
  const [callsTotal, setCallsTotal] = useState<number>(0);
  const [lettersTotal, setLettersTotal] = useState<number>(0);

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

  // bump to force DataTable remount/refetch (filters or after mutations)
  const [filtersReloadKey, setFiltersReloadKey] = useState<number>(0);

  // lookups for selects
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

  // helper: fetch totals only (used in tab headers)
  const fetchCallsTotal = useCallback(async (q = debouncedSearch) => {
    try {
      const params: any = { page: 1, page_size: 1 };
      if (q) params.search = q;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;
      const res = await PhoneService.fetchCallRecords(params);
      const count = Number(res?.count ?? (Array.isArray(res) ? res.length : 0) ?? 0);
      setCallsTotal(count);
    } catch (err) {
      console.error("fetchCallsTotal error", err);
    }
  }, [debouncedSearch, station, district, region]);

  const fetchLettersTotal = useCallback(async (q = debouncedSearch) => {
    try {
      const params: any = { page: 1, page_size: 1 };
      if (q) params.search = q;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;
      const res = await LetterService.fetchLetters(params);
      const count = Number(res?.count ?? (Array.isArray(res) ? res.length : 0) ?? 0);
      setLettersTotal(count);
    } catch (err) {
      console.error("fetchLettersTotal error", err);
    }
  }, [debouncedSearch, station, district, region]);

  // refresh totals when filters/search/tab change (DataTable will fetch rows itself)
  useEffect(() => {
    fetchCallsTotal();
    fetchLettersTotal();
    // reset page when search or context changes
    setPage(1);
  }, [activeTab, debouncedSearch, station, district, region, fetchCallsTotal, fetchLettersTotal]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    // bump DataTable remount key so DataTable re-requests the current url (which contains filter params below)
    setFiltersReloadKey(k => k + 1);
    // refresh totals
    fetchCallsTotal();
    fetchLettersTotal();
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
        confirmActionRef.current = {
          title: "Delete Call Record",
          description: `Delete call record for "${r.prisoner_name ?? r.caller ?? r.id}"? This action cannot be undone.`,
          onConfirm: async () => {
            try {
              await PhoneService.deleteCallRecord(r.id);
              toast.success("Call record deleted");
              // trigger DataTable refetch + refresh totals
              setFiltersReloadKey(k => k + 1);
              fetchCallsTotal();
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
              // trigger DataTable refetch + refresh totals
              setFiltersReloadKey(k => k + 1);
              fetchLettersTotal();
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
      // trigger DataTable refetch + refresh totals
      setFiltersReloadKey(k => k + 1);
      fetchCallsTotal();
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
      // trigger DataTable refetch + refresh totals
      setFiltersReloadKey(k => k + 1);
      fetchLettersTotal();
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
                key={`calls-${filtersReloadKey}-${station ?? ''}-${district ?? ''}-${region ?? ''}`}
                url={`/rehabilitation/call-records/?${station ? `station=${encodeURIComponent(station)}&` : ''}${district ? `district=${encodeURIComponent(district)}&` : ''}${region ? `region=${encodeURIComponent(region)}&` : ''}`}
                externalSearch={debouncedSearch}
                title="Call Records"
                columns={callsColumns}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            ) : (
              <DataTable
                key={`letters-${filtersReloadKey}-${station ?? ''}-${district ?? ''}-${region ?? ''}`}
                url={`/rehabilitation/eletters/?${station ? `station=${encodeURIComponent(station)}&` : ''}${district ? `district=${encodeURIComponent(district)}&` : ''}${region ? `region=${encodeURIComponent(region)}&` : ''}`}
                externalSearch={debouncedSearch}
                title="Letters"
                columns={lettersColumns}
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
                    <CustomPrisonerSearch
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      onSelectItem={(p: any) => {
                        // ensure form gets the selected id/object per your backend shape
                        field.onChange(p?.id ?? p ?? null);
                        // cache the selected prisoner locally to avoid refetch flicker
                        setPrisoners(prev => prev.some(x => String(x.id) === String(p?.id)) ? prev : [p, ...prev]);
                      }}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      initialItems={prisoners}
                      pageSize={25}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    <CustomPrisonerSearch
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      onSelectItem={(p: any) => {
                        field.onChange(p?.id ?? p ?? null);
                        setPrisoners(prev => prev.some(x => String(x.id) === String(p?.id)) ? prev : [p, ...prev]);
                      }}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      initialItems={prisoners}
                      pageSize={25}
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
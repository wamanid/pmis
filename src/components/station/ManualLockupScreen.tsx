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
import { toast } from 'sonner';
import { Switch } from '../ui/switch';

// validation utils
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  pastOrTodayDateValidation,
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
import { Edit, Trash } from 'lucide-react';
import ConfirmDialog from "../common/ConfirmDialog";
// API constants (single place to manage endpoints)
const MANUAL_LOCKUP_API_BASE = "/station-management/api/manual-lockups";
const MANUAL_LOCKUP_API = (id?: string) => id ? `${MANUAL_LOCKUP_API_BASE}/${id}/` : `${MANUAL_LOCKUP_API_BASE}/`;


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
  // small local cache used for stats / summary view (not the DataTable)
  const [lockups, setLockups] = useState<ManualLockUpItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // header search (kept to drive summary/local filtering)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  // bump to force DataTable remount/refetch when global filters change
  const [filtersReloadKey, setFiltersReloadKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stationDataLoading, setStationDataLoading] = useState(true);
  const [recordsListLoading, setRecordsListLoading] = useState(true)
  const [stations, setStations] = useState<any[]>([])
  const [lockTypes, setLockTypes] = useState<any[]>([])
  const [sexes, setSexes] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([]) // <-- new
  const [prisonerCategories, setPrisonerCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"table-form"|"table-view"|"records">("table-form");
 
  // load lookup data (stations, lock types, categories, sexes, locations)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setStationDataLoading(true);
        const [stationsRes, lockTypesRes, categoriesRes, sexesRes, locationsRes] = await Promise.all([
          getStation(),
          getLockType(),
          getPrisonerCategories(),
          getSexes(),
          axiosInstance.get("/system-administration/locations/"),
        ]);
        if (!mounted) return;
        setStations(stationsRes?.results ?? stationsRes ?? []);
        setLockTypes(lockTypesRes?.results ?? lockTypesRes ?? []);
        setPrisonerCategories(categoriesRes?.results ?? categoriesRes ?? []);
        setSexes(sexesRes?.results ?? sexesRes ?? []);
        const locPayload = locationsRes?.data ?? locationsRes ?? {};
        setLocations(locPayload?.results ?? locPayload ?? []);
      } catch (err) {
        console.error('load lookups error', err);
        toast.error('Failed to load lookup data (stations/types/categories/locations).');
      } finally {
        if (mounted) setStationDataLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // lightweight fetch for summary/stats/ManualLockupTableView (not the paginated DataTable)
  const fetchLockupsForSummary = useCallback(async () => {
    try {
      const params: any = { page: 1, page_size: 1000 };
      if (region) params.region = region;
      if (district) params.district = district;
      if (station) params.station = station;
      // use canonical API helper so path matches other calls and avoids typos
      const resp = await axiosInstance.get(MANUAL_LOCKUP_API(), { params });
      const payload = resp?.data ?? resp ?? {};
      const items = payload?.results ?? payload ?? [];
      setLockups(Array.isArray(items) ? items : []);
      setRecordsListLoading(false);
    } catch (err) {
      console.error("fetchLockupsForSummary error", err);
      setLockups([]);
      setRecordsListLoading(false);
    }
  }, [region, district, station]);

  // load table from API (used by initial load, pagination, search, filters, and after saves)
  const loadTable = useCallback(async (p = 1, ps = pageSize, q = '') => {
    // cancel previous controller
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;

    const reqId = ++requestIdRef.current;
    // use tableLoading for incremental loads so UI keeps showing
    setTableLoading(true);

    try {
      const params: any = { page: p, page_size: ps };
      if (q) params.search = q;
      const res = await getManualLockup(params, controller.signal);
      if ('error' in res) throw res;
      const items = res.results ?? res ?? [];
      const count = Number(res.count ?? items.length ?? 0);

      // only apply results from the latest request
      if (requestIdRef.current === reqId) {
        setLockups(items);
        setTableData(items);
        setTotal(count);
        // clear initial full-page loader once we have data
        setRecordsListLoading(false);
      }
    } catch (err: any) {
      // ignore abort / cancel errors
      if (
        err?.name === 'AbortError' ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED' ||
        String(err?.message).toLowerCase().includes('canceled')
      ) {
        return;
      }
      console.error('load manual lockup error', err);
      toast.error('Failed to load manual lockups');
    } finally {
      // only clear incremental loader for latest request
      if (requestIdRef.current === reqId) setTableLoading(false);
    }
  }, [pageSize]);

  // Callback to handle records created from the table form:
  // - update local summary cache so stats & summary view reflect immediately
  // - bump the DataTable reload key to force the table to refetch its current page
  const handleRecordsCreated = useCallback((records: ManualLockup[]) => {
    setLockups(prev => [...records, ...prev]);
    setPage(1);
    setFiltersReloadKey(k => k + 1);
  }, []);

  // react-hook-form for the modal form (so we can reuse requiredValidation helpers)
  const form = useForm({
    mode: "onTouched",
    defaultValues: {
      id: null,
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

      // if editing (id present) -> update, else create
      let response: any;
      if (values.id) {
        // update via API
        response = await axiosInstance.patch(`/manual-lockups/${values.id}/`, newLockup);
      } else {
        response = await addLockUpRecord(newLockup);
      }
      if ('error' in response) {
        toast.error(response.error);
        return;
      }

      // trigger table refetch + refresh summary cache (no manual loadTable call)
      setFiltersReloadKey(k => k + 1);
      fetchLockupsForSummary();
      toast.success(values.id ? 'Manual lockup record updated' : 'Manual lockup record added successfully');
      setDialogOpen(false);
      reset(); // reset to default values (clears id too)
    } catch (error: any) {
      if (!error?.response) toast.error('Failed to connect to server. Please try again.');
      else toast.error('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  // Helpers that resolve names from loaded lookup arrays (fall back to item fields or id)
  const getStationName = (id: string | any) => {
    if (!id) return 'Unknown';
    // if the API already included station_name on the item, prefer that
    if (typeof id === 'object' && id.name) return id.name;
    const plainId = typeof id === 'string' ? id : (id?.id ?? id);
    const found = stations.find((s) => String(s.id) === String(plainId));
    return found?.name ?? String((id as any)?.station_name ?? plainId ?? 'Unknown');
  };

  const getTypeName = (id: string | any) => {
    if (!id) return 'Unknown';
    if (typeof id === 'object' && id.name) return id.name;
    const plainId = typeof id === 'string' ? id : (id?.id ?? id);
    const found = lockTypes.find((t) => String(t.id) === String(plainId));
    return found?.name ?? String((id as any)?.type_name ?? plainId ?? 'Unknown');
  };

  const getCategoryName = (id: string | any) => {
    if (!id) return 'Unknown';
    if (typeof id === 'object' && id.name) return id.name;
    const plainId = typeof id === 'string' ? id : (id?.id ?? id);
    const found = prisonerCategories.find((c) => String(c.id) === String(plainId));
    return found?.name ?? String((id as any)?.prisoner_category_name ?? plainId ?? 'Unknown');
  };

  const getSexName = (id: string | any) => {
    if (!id) return 'Unknown';
    if (typeof id === 'object' && id.name) return id.name;
    const plainId = typeof id === 'string' ? id : (id?.id ?? id);
    const found = sexes.find((s) => String(s.id) === String(plainId));
    return found?.name ?? String((id as any)?.sex_name ?? plainId ?? 'Unknown');
  };

  // add this helper so table renderers can use readable classes
  const getLocationBadgeColor = (loc: string | undefined | null) => {
    const key = String(loc ?? '').toLowerCase();
    if (key.includes('court')) return 'bg-yellow-100 text-yellow-800';
    if (key.includes('labour')) return 'bg-blue-100 text-blue-800';
    if (key.includes('station')) return 'bg-green-100 text-green-800';
    // fallback neutral
    return 'bg-gray-100 text-gray-800';
  };

  // edit / delete state & handlers (required by table actions and ConfirmDialog)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManualLockUpItem | null>(null);
  const [confirmDescription, setConfirmDescription] = useState<string>('');
  // separate edit modal/form (do not reuse Add form)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [pendingEditTarget, setPendingEditTarget] = useState<ManualLockUpItem | null>(null);
  const editForm = useForm({
    mode: "onTouched",
    defaultValues: {
      id: null,
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
  const {
    register: eRegister,
    handleSubmit: eHandleSubmit,
    control: eControl,
    reset: eReset,
    formState: eFormState,
    setValue: eSetValue,
    watch: eWatch,
  } = editForm;

  const handleEdit = (r: ManualLockUpItem) => {
    // open edit modal and defer hydration until stations (lookups) are available
    setPendingEditTarget(r);
    setEditModalOpen(true);
  };

  // when we have a pending edit target, wait for lookups to load then hydrate the edit form
  useEffect(() => {
    if (!pendingEditTarget) return;
    if (stationDataLoading) return; // wait until lookups ready

    const r = pendingEditTarget;
    // set station to the UUID (string) — display name is resolved for the disabled input
    eReset({
      id: r.id,
      is_active: !!r.is_active,
      date: r.date,
      lockup_time: r.lockup_time,
      location: r.location,
      count: r.count,
      station: r.station, // keep UUID here
      type: r.type,
      prisoner_category: r.prisoner_category,
      sex: r.sex,
    });

    setPendingEditTarget(null);
  }, [pendingEditTarget, stationDataLoading, stations, eReset]);

  const handleDeleteClick = (r: ManualLockUpItem) => {
    setDeleteTarget(r);
    // prepare a human-readable delete message
    const descParts = [];
    if ((r as any).station_name) descParts.push((r as any).station_name);
    if ((r as any).date) descParts.push((r as any).date);
    if ((r as any).count != null) descParts.push(`count: ${r.count}`);
    // include the "Are you sure..." text plus details
    setConfirmDescription(`Are you sure you want to delete: ${descParts.join(" • ") || `ID: ${(r as any).id ?? ''}`}`);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const idToDelete = (deleteTarget as any).id ?? (deleteTarget as any).pk ?? (deleteTarget as any)._id;

    if (!idToDelete) {
      toast.error('Cannot delete: missing record id');
      setConfirmOpen(false);
      return;
    }

    // Call canonical API path defined at top
    try {
      await axiosInstance.delete(MANUAL_LOCKUP_API(idToDelete));
      toast.success('Record deleted');
      // trigger refetch and refresh summary without calling removed loader
      setFiltersReloadKey(k => k + 1);
      fetchLockupsForSummary();
    } catch (err: any) {
      console.error('delete error', err);
      if (err?.response?.status === 404) {
        toast.error('Record not found on server (404). It may have been removed already.');
      } else {
        toast.error('Failed to delete record');
      }
    }

    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  // When Add dialog opens, ensure the add form has empty defaults (do not touch edit modal)
  useEffect(() => {
    if (!dialogOpen) return;
    if (stationDataLoading) return;
    reset({
      id: null,
      is_active: true,
      date: new Date().toISOString().split("T")[0],
      lockup_time: "",
      location: "",
      count: "",
      station: null,
      type: null,
      prisoner_category: null,
      sex: null,
    });
  }, [dialogOpen, stationDataLoading, reset]);

  // Debug: log a sample item and available fields in the summary cache
  useEffect(() => {
    if (lockups && lockups.length) {
      console.debug('ManualLockupScreen: sample lockups[0]', lockups[0]);
    }
  }, [lockups]);

  // client-side summary filtering for the small cache (used in stats and summary view)
  const displayedSummary = (() => {
    const q = (debouncedSearch ?? "").trim().toLowerCase();
    if (!q) return lockups;
    return lockups.filter((item) => {
      return (
        String(getStationName(item.station)).toLowerCase().includes(q) ||
        String(getTypeName(item.type)).toLowerCase().includes(q) ||
        String(getCategoryName(item.prisoner_category)).toLowerCase().includes(q) ||
        String(item.location_name ?? "").toLowerCase().includes(q) ||
        String(item.date ?? "").toLowerCase().includes(q)
      );
    });
  })();

  // debounce searchTerm -> debouncedSearch (simple)
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(t);
  }, [searchTerm]);

  // initial load for summary cache
  useEffect(() => {
    fetchLockupsForSummary();
  }, [fetchLockupsForSummary]);

  // auto reload summary cache when global filters change (do NOT include local searchTerm)
  useFilterRefresh(() => {
    // refresh summary cache
    fetchLockupsForSummary();
    // also bump DataTable reload key so paginated table refetches
    setFiltersReloadKey(k => k + 1);
  }, [region, district, station, pageSize]);

  // show initial skeleton while summary + table haven't loaded
  if (recordsListLoading && lockups.length === 0) {
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full">
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
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    // reset add form defaults before opening
                    reset({
                      id: null,
                      is_active: true,
                      date: new Date().toISOString().split("T")[0],
                      lockup_time: "",
                      location: "",
                      count: "",
                      station: null,
                      type: null,
                      prisoner_category: null,
                      sex: null,
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lockup (Legacy Form)
                </Button>
              </DialogTrigger>

          <DialogContent aria-describedby="manual-lockup-desc" className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{watch('id') ? 'Edit Manual Lockup' : 'Add Manual Lockup Record'}</DialogTitle>
              <DialogDescription id="manual-lockup-desc">
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
                            {locations.length === 0 ? (
                              <div className="p-3 text-sm text-muted-foreground">No locations</div>
                            ) : (
                              locations.map((loc: any) => (
                                <SelectItem key={loc.id} value={String(loc.id)}>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {loc.name ?? loc.location_name ?? String(loc.id)}
                                  </div>
                                </SelectItem>
                              ))
                            )}
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
                      {loading ? (watch('id') ? 'Saving...' : 'Adding...') : (watch('id') ? 'Save' : 'Add Lockup')}
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
                {/* <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search lockups..."
                    className="pl-9"
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => {
                      e.stopPropagation(); 
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    onInput={(e) => {
                      // stop propagation for any input-level events
                      (e as any).stopPropagation?.();
                    }}
                    onKeyDown={(e) => {
                      // stop global handlers and prevent submit/navigation
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setPage(1);
                      }
                    }}
                  />
                </div> */}
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                key={`manual-lockups-${filtersReloadKey}-${region ?? ''}-${district ?? ''}-${station ?? ''}`}
                // include current filters in the URL query so DataTable's internal fetch will include them
                url={`/station-management/api/manual-lockups?${region ? `region=${encodeURIComponent(region)}&` : ''}${district ? `district=${encodeURIComponent(district)}&` : ''}${station ? `station=${encodeURIComponent(station)}&` : ''}`}
                title="Manual Lockups"
                columns={[
                  { key: 'is_active', label: 'Status', render: (_v:any, r:any) => <Badge variant={r?.is_active ? 'default' : 'secondary'}>{r?.is_active ? 'Active' : 'Inactive'}</Badge> },
                  { key: 'date', label: 'Date', sortable: true },
                  { key: 'lockup_time', label: 'Time' },
                  // use location_name (API field) instead of UUID
                  { key: 'location_name', label: 'Location', render: (_v:any, r:any) => <Badge className={getLocationBadgeColor(r?.location_name ?? r?.location)}>{r?.location_name ?? r?.location ?? 'Unknown'}</Badge> },
                  { key: 'station_name', label: 'Station' },
                  { key: 'type_name', label: 'Type' },
                  { key: 'prisoner_category_name', label: 'Category' },
                  { key: 'sex_name', label: 'Sex' },
                  { key: 'count', label: 'Count', align: 'right' },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (_v:any, r:any) => (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(r)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(r)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  }
                ]}
                // wire the header search into DataTable's search param (keeps UX)
                externalSearch={searchTerm}
                onSearch={(q) => { setSearchTerm(q); setPage(1); }}
                onPageChange={(p) => { setPage(p); }}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                onSort={(f, d) => { /* DataTable will handle ordering if supported */ setPage(1); }}
                page={page}
                pageSize={pageSize}
              />

              {/* Edit Modal (separate from Add) */}
              <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent aria-describedby="manual-lockup-edit-desc" className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{eWatch('id') ? 'Edit Manual Lockup' : 'Edit Manual Lockup'}</DialogTitle>
                    <DialogDescription id="manual-lockup-edit-desc">
                      Update details for this manual lockup record
                    </DialogDescription>
                  </DialogHeader>

                  {stationDataLoading ? (
                    <div className="size-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground text-sm">Fetching station data, please wait...</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={eHandleSubmit(async (values) => {
                      setLoading(true);
                      try {
                        const payload: any = {
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
                        await axiosInstance.patch(MANUAL_LOCKUP_API(values.id), payload);
                        toast.success('Manual lockup record updated');
                        setFiltersReloadKey(k => k + 1);
                        fetchLockupsForSummary();
                      } catch (err: any) {
                        console.error('update error', err);
                        toast.error('Failed to update record');
                      } finally {
                        setLoading(false);
                      }
                    })}>
                      <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="e_is_active">Active Status</Label>
                            <p className="text-sm text-muted-foreground">Mark this record as active</p>
                          </div>
                          <Switch id="e_is_active" checked={eWatch("is_active")} onCheckedChange={(c) => eSetValue("is_active", c)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="e_date">Date <span className="text-red-500">*</span></Label>
                            <div className="relative">
                              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="e_date" type="date" className="pl-9" {...eRegister("date", { required: true })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="e_lockup_time">Lockup Time <span className="text-red-500">*</span></Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="e_lockup_time" type="time" className="pl-9" {...eRegister("lockup_time", { required: true })} />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="e_location">Location <span className="text-red-500">*</span></Label>
                            <Select value={String(eWatch("location") ?? "")} onValueChange={(v) => eSetValue("location", v)}>
                              <SelectTrigger id="e_location"><SelectValue placeholder="Select location" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="court">Court</SelectItem>
                                <SelectItem value="labour">Labour</SelectItem>
                                <SelectItem value="station">Station</SelectItem>
                              </SelectContent>
                            </Select>
                            <input type="hidden" {...eRegister("location", { required: true })} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="e_count">Count <span className="text-red-500">*</span></Label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="e_count" type="number" min="0" className="pl-9" {...eRegister("count", { required: true, valueAsNumber: true })} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="e_station">Station</Label>
                          <Controller control={eControl} name="station" rules={{ required: true }} render={({ field }) => (
                            // show read-only station name, keep UUID as form value (field.value)
                            <Input id="e_station" value={getStationName(field.value)} disabled />
                          )} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="e_type">Lockup Type <span className="text-red-500">*</span></Label>
                            <Controller control={eControl} name="type" rules={{ required: true }} render={({ field }) => (
                              <Select value={field.value || ""} onValueChange={(v) => field.onChange(v)}>
                                <SelectTrigger id="e_type"><SelectValue placeholder="Select lockup type" /></SelectTrigger>
                                <SelectContent>{lockTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                              </Select>
                            )} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="e_prisoner_category">Prisoner Category <span className="text-red-500">*</span></Label>
                            <Controller control={eControl} name="prisoner_category" rules={{ required: true }} render={({ field }) => (
                              <Select value={field.value || ""} onValueChange={(v) => field.onChange(v)}>
                                <SelectTrigger id="e_prisoner_category"><SelectValue placeholder="Select prisoner category" /></SelectTrigger>
                                <SelectContent>{prisonerCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                              </Select>
                            )} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="e_sex">Sex <span className="text-red-500">*</span></Label>
                          <Controller control={eControl} name="sex" rules={{ required: true }} render={({ field }) => (
                            <Select value={field.value || ""} onValueChange={(v) => field.onChange(v)}>
                              <SelectTrigger id="e_sex"><SelectValue placeholder="Select sex" /></SelectTrigger>
                              <SelectContent>{sexes.map((s) => <SelectItem key={s.id} value={s.id}><div className="flex items-center gap-2"><User className="h-4 w-4" />{s.name}</div></SelectItem>)}</SelectContent>
                            </Select>
                          )} />
                        </div>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditModalOpen(false)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </DialogFooter>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Plus, Search, Scan, CheckCircle2, XCircle, Clock, User, Loader2, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Textarea } from '../ui/textarea';
import ConfirmDialog from '../common/ConfirmDialog';
import { DataTable } from '../common/DataTable';
import type { DataTableColumn } from '../common/DataTable.types';
import * as StaffEntryService from '../../services/stationServices/staffEntryService';
import { useFilters } from '../../contexts/FilterContext';
import { useFilterRefresh } from '../../hooks/useFilterRefresh';

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
  // autocomplete state + refs
  const [suggestions, setSuggestions] = useState<StaffEntryService.StaffProfile[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const suggestionsAbortRef = useRef<AbortController | null>(null);
  const suggestTimerRef = useRef<number | null>(null);
  const MIN_SUGGEST = 3;
  const SUGGEST_DEBOUNCE_MS = 350;
  const [staffDetails, setStaffDetails] = useState<StaffEntryService.StaffProfile | null>(null);
  const [stationOptions, setStationOptions] = useState<any[]>([]);
  const [attendanceType, setAttendanceType] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [timeOut, setTimeOut] = useState('');
  const [remark, setRemark] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [recordToDeleteObj, setRecordToDeleteObj] = useState<StaffEntryRow | null>(null);
  // Edit modal state (required by Edit button / dialog)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StaffEntryRow | null>(null);
  const [editSelectedStation, setEditSelectedStation] = useState<string>('');
  const [editAttendanceType, setEditAttendanceType] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [editTimeOut, setEditTimeOut] = useState<string>('');
  const [editRemark, setEditRemark] = useState<string>('');
  const [editSubmitLoading, setEditSubmitLoading] = useState<boolean>(false);
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

  // keep DataTable in URL-driven mode: track page/pageSize/sort for DataTable props
  // const [page, setPage] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
  // const [sortField, setSortField] = useState<string | undefined>(undefined);
  // const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);

  // global filters
  const { region: globalRegion, district: globalDistrict, station: globalStation } = useFilters();
  // reload key driven by useFilterRefresh (will bump when global filters change)
  const [tableReloadKey, setTableReloadKey] = useState(0);
  // useFilterRefresh registers filter changes and triggers the callback - mirror complaints pattern
  useFilterRefresh(() => {
    setTableReloadKey((k) => k + 1);
  }, [globalRegion, globalDistrict, globalStation]);

  // Summary counts (separate fetch so cards update even if DataTable doesn't call onLoaded)
  const [summaryTotal, setSummaryTotal] = useState(0);
  const [summaryPresent, setSummaryPresent] = useState(0);
  const [summaryAbsent, setSummaryAbsent] = useState(0);
  const [summaryOnDuty, setSummaryOnDuty] = useState(0);
  const summaryAbortRef = useRef<AbortController | null>(null);

  const fetchSummary = useCallback(async () => {
    if (summaryAbortRef.current) {
      try { summaryAbortRef.current.abort(); } catch {}
    }
    const controller = new AbortController();
    summaryAbortRef.current = controller;
    try {
      // quick offline check
      if (typeof window !== 'undefined' && !window.navigator.onLine) {
        setLoadError('No network connection');
        return;
      }

      const params: Record<string, any> = { page_size: 1000 };
      if (globalRegion) params.region = globalRegion;
      if (globalDistrict) params.district = globalDistrict;
      if (globalStation) params.station = globalStation;
      if (search) params.search = search;
      params._t = tableReloadKey;

      // call service without passing the raw AbortSignal (some service wrappers expect a different API)
      const res = await StaffEntryService.fetchEntries(params);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);

      const present = (items || []).filter((it: any) => it.attendance_type === 'PRESENT').length;
      const absent = (items || []).filter((it: any) => it.attendance_type === 'ABSENT').length;
      const onDuty = (items || []).filter((it: any) => !it.time_out || String(it.time_out).trim() === '').length;

      setSummaryTotal(count);
      setSummaryPresent(present);
      setSummaryAbsent(absent);
      setSummaryOnDuty(onDuty);
      console.debug('Attendance summary fetched', { count, present, absent, onDuty });
      setLoadError(null);
    } catch (err: any) {
      // suppress noisy axios/XHR "Network Error" logs and surface friendly message
      const isNetwork = String(err?.message ?? '').toLowerCase().includes('network') || err?.request?.readyState === 0;
      if (isNetwork) {
        console.warn('fetchSummary network error (suppressed)', err);
        setLoadError('Network error while fetching summary (check API/CORS)');
        return;
      }
      if (err?.name === 'AbortError' || err?.message === 'canceled') return;
      console.error('fetchSummary error', err?.response ?? err);
      setLoadError('Failed to load summary');
    }
  }, [globalRegion, globalDistrict, globalStation, search, tableReloadKey]);

  useEffect(() => {
    fetchSummary();
    return () => { if (summaryAbortRef.current) try { summaryAbortRef.current.abort(); } catch {} };
  }, [fetchSummary]);

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

  const loadStations = useCallback(async () => {
    const s = await StaffEntryService.fetchStations();
    setStationOptions(s || []);
  }, []);

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

  // load stations once
  useEffect(() => { loadStations(); }, [loadStations]);

  // resilient handler when DataTable calls onLoaded (normalize different shapes)
  const handleDataTableLoaded = useCallback((rowsOrResp: any, meta?: any) => {
    // normalize to rows array and meta.total
    let rows: any[] = [];
    let responseMeta: any = meta ?? {};
    if (Array.isArray(rowsOrResp)) rows = rowsOrResp;
    else if (rowsOrResp && typeof rowsOrResp === 'object') {
      rows = Array.isArray(rowsOrResp.results) ? rowsOrResp.results : (Array.isArray(rowsOrResp.data) ? rowsOrResp.data : []);
      responseMeta = responseMeta || { total: Number(rowsOrResp.count ?? rowsOrResp.total ?? rows.length) };
    }
    const mapped = (rows || []).map((it: any): StaffEntryRow => ({
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
    setTableData(mapped);
    const serverTotal = Number(responseMeta?.total ?? responseMeta?.count ?? NaN);
    setTotal(Number.isFinite(serverTotal) ? serverTotal : mapped.length);
    // optionally refresh summary from mapped (but keep summary fetch as source of truth)
    console.debug('DataTable onLoaded normalized', { rows: mapped.length, total: serverTotal || mapped.length });
  }, []);

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
      // const profiles = await StaffEntryService.fetchStaffProfiles({ force_number: forceNumber });

        // normalize to uppercase so search is case-insensitive (backend expects uppercase codes)
      const normalized = (forceNumber || '').trim().toUpperCase();
      // keep input visual consistent
      setForceInput(normalized);
      // try server search by force_number param
      const profiles = await StaffEntryService.fetchStaffProfiles({ force_number: normalized });

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
      // tell DataTable to refetch via reload key and update summary
      setTableReloadKey(k => k + 1);
      fetchSummary();
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
      setRecordToDeleteObj(null);
      // reset to first page and bump reload key so DataTable remounts/refetches
      setPage(1);
      setTableReloadKey(k => k + 1);
      fetchSummary();
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
              // only allow edit when there is no time_out
              if (row.time_out) {
                toast.error('Cannot edit a record that already has a Time Out.');
                return;
              }
              // open edit modal with row values
              setEditingRecord(row);
              setEditSelectedStation(row.station_name ? stationOptions.find(s => s.name === row.station_name)?.id ?? '' : '');
              setEditAttendanceType((row.attendance_type as any) ?? 'PRESENT');
              setEditTimeOut(row.time_out ?? '');
              setEditRemark(row.remark ?? '');
              setEditDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4 text-amber-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setRecordToDelete(row.id);
              setRecordToDeleteObj(row);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  // submit edit
  const handleEditSave = async () => {
    if (!editingRecord) return;
    if (!editSelectedStation) {
      toast.error('Station is required');
      setFormErrors({ station: 'Station is required' });
      return;
    }
    setEditSubmitLoading(true);
    try {
      const payload = {
        station: editSelectedStation,
        attendance_type: editAttendanceType,
        time_out: editTimeOut || null,
        remark: editRemark || null,
      };

      // call service - updateEntry expected to exist
      await StaffEntryService.updateEntry(editingRecord.id, payload);
      toast.success('Record updated');
      setEditDialogOpen(false);
      setEditingRecord(null);
      setTableReloadKey(k => k + 1);
      fetchSummary();
    } catch (err: any) {
      console.error('updateEntry error', err?.response ?? err);
      toast.error('Failed to update record');
    } finally {
      setEditSubmitLoading(false);
    }
  };

  // make sure modal resets when closed
  useEffect(() => {
    if (!editDialogOpen) {
      setEditingRecord(null);
      setEditSelectedStation('');
      setEditAttendanceType('PRESENT');
      setEditTimeOut('');
      setEditRemark('');
      setEditSubmitLoading(false);
    }
  }, [editDialogOpen]);

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

                  {/* <form onSubmit={(e) => { e.preventDefault(); handleFetchClick(e); }} className="space-y-2">
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
                  </form> */}
                  <form onSubmit={(e) => { e.preventDefault(); handleFetchClick(e); }} className="space-y-2" autoComplete="off">
                    <div className="relative">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Force number / Barcode"
                          value={forceInput}
                          disabled={scanningMode || hasFetched}
                          autoFocus={!scanningMode && !hasFetched}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForceInput(v);
                            // cancel any pending timer
                            if (suggestTimerRef.current) { window.clearTimeout(suggestTimerRef.current); suggestTimerRef.current = null; }
                            // close suggestions immediately if input too short
                            if ((v || '').trim().length < MIN_SUGGEST) {
                              // abort in-flight request
                              try { suggestionsAbortRef.current?.abort(); } catch {}
                              setSuggestions([]);
                              setSuggestOpen(false);
                              setHighlightIndex(-1);
                              return;
                            }
                            // debounce search
                            suggestTimerRef.current = window.setTimeout(async () => {
                              // abort previous
                              try { suggestionsAbortRef.current?.abort(); } catch {}
                              const controller = new AbortController();
                              suggestionsAbortRef.current = controller;
                              try {
                                const q = (v || '').trim();
                                // server-side partial match on name or force_number
                                const res = await StaffEntryService.fetchStaffProfiles({ search: q, page_size: 10 });
                                const list = Array.isArray(res) ? res : (res?.results ?? []);
                                setSuggestions(list || []);
                                setSuggestOpen(Array.isArray(list) && list.length > 0);
                                setHighlightIndex(0);
                              } catch (err) {
                                // abort or network: just close suggestions quietly
                                console.debug('autocomplete fetch error', err);
                                setSuggestions([]);
                                setSuggestOpen(false);
                                setHighlightIndex(-1);
                              } finally {
                                suggestionsAbortRef.current = null;
                              }
                            }, SUGGEST_DEBOUNCE_MS);
                          }}
                          onKeyDown={(e) => {
                            if (!suggestOpen) {
                              if (e.key === 'ArrowDown') {
                                // open suggestions if available
                                if (suggestions.length > 0) { setSuggestOpen(true); setHighlightIndex(0); e.preventDefault(); }
                              }
                              return;
                            }
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setHighlightIndex((i) => Math.max(i - 1, 0));
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              const sel = suggestions[highlightIndex];
                              if (sel) {
                                // put only force_number into input per requirement
                                setForceInput(sel.force_number ?? '');
                                setSuggestOpen(false);
                                setSuggestions([]);
                                setHighlightIndex(-1);
                              } else {
                                // no suggestion selected -> treat as fetch submit
                                handleFetchClick();
                              }
                            } else if (e.key === 'Escape') {
                              setSuggestOpen(false);
                              setHighlightIndex(-1);
                            }
                          }}
                        />
                        <Button type="submit" disabled={!forceInput.trim() || fetchLoading || hasFetched}>
                          {fetchLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Fetch</> : 'Fetch'}
                        </Button>
                      </div>

                      {/* suggestions dropdown */}
                      {suggestOpen && suggestions.length > 0 && (
                        <ul role="listbox" aria-label="staff suggestions"
                          className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-auto"
                          onMouseLeave={() => setHighlightIndex(-1)}
                        >
                          {suggestions.map((it, idx) => {
                            const label = `${(it.first_name ?? '').trim()} ${(it.middle_name ?? '').trim()} ${(it.last_name ?? '').trim()}`.replace(/\s+/g, ' ').trim();
                            const display = label ? `${label} | ${it.force_number ?? ''}` : (it.force_number ?? it.id);
                            const isActive = idx === highlightIndex;
                            return (
                              <li
                                key={it.id}
                                role="option"
                                aria-selected={isActive}
                                className={`px-3 py-2 cursor-pointer ${isActive ? 'bg-slate-100' : 'hover:bg-slate-100'} transition-colors`}
                                onMouseEnter={() => setHighlightIndex(idx)}
                                onClick={() => {
                                  // requirement: set only force_number into input and close suggestions
                                  setForceInput(it.force_number ?? '');
                                  setSuggestOpen(false);
                                  setSuggestions([]);
                                  setHighlightIndex(-1);
                                }}
                              >
                                <div className="text-sm font-medium">{display}</div>
                                <div className="text-xs text-muted-foreground">{it.rank_name ?? it.rank ?? ''} {it.station_name ? `• ${it.station_name}` : ''}</div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
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
                        disabled={true}
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
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        rows={3}
                      />
                    </div>
                    {/* Moved Footer: Cancel / Save appear only when staffDetails is shown */}
                    <div className="flex gap-2 justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false);
                          resetForm();
                        }}
                        disabled={submitLoading}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleConfirmEntry} className="bg-primary hover:bg-primary/90" disabled={submitLoading}>
                        {submitLoading ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  // close dialog and fully reset the form state (same behavior as the top-right close)
                  setDialogOpen(false);
                  resetForm();
                }}
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmEntry} className="bg-primary hover:bg-primary/90" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Error loading table data */}
      {loadError && (
        <div className="p-4 text-sm rounded-md bg-red-50 text-red-900 border border-red-300">
          <p className="font-medium">Error loading records</p>
          <p>{loadError}</p>
        </div>
      )}

      {/* Stats summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Total Records</CardTitle></CardHeader>
          <CardContent><div className="text-2xl text-[#650000]">{summaryTotal}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Present</CardTitle></CardHeader>
          <CardContent><div className="text-2xl text-green-600">{summaryPresent}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Absent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl text-red-600">{summaryAbsent}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">On Duty</CardTitle></CardHeader>
          <CardContent><div className="text-2xl text-blue-600">{summaryOnDuty}</div></CardContent>
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

          <DataTable
            key={`attendance-${tableReloadKey}-${search}-${page}-${pageSize}`}
             // server-driven DataTable: let it fetch. pass params so DataTable composes the final request
             url="/station-management/api/attendance/"
             params={{
               region: globalRegion ?? undefined,
               district: globalDistrict ?? undefined,
               station: globalStation ?? undefined,
               search: search || undefined,
               _t: tableReloadKey,
             }}
             title="Staff Entry & Exit Records"
             columns={userColumns}
             externalSearch={search}
             onLoaded={handleDataTableLoaded}
             onError={(err: any) => {
               console.error('DataTable load error', err);
               setLoadError(err?.message ?? 'Failed to load records');
             }}
             onSearch={(q: string) => { setSearch(q); setPage(1); setTableReloadKey(k => k + 1); }}
             onPageChange={(p: number) => { setPage(p); setTableReloadKey(k => k + 1); }}
             onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); setTableReloadKey(k => k + 1); }}
             onSort={(f: string | null, d: 'asc' | 'desc' | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); setTableReloadKey(k => k + 1); }}
             page={page}
             pageSize={pageSize}
           />
           
         </CardContent>
       </Card>
 
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setRecordToDelete(null);
            setRecordToDeleteObj(null);
          }
        }}
        title="Delete Attendance Record"
        description="Are you sure you want to delete this attendance record? This action cannot be undone."
        details={
          recordToDeleteObj ? (
            <div className="text-sm space-y-1">
              <div><strong>Force No:</strong> {recordToDeleteObj.staff_force_number ?? '-'}</div>
              <div><strong>Staff Name:</strong> {recordToDeleteObj.staff_name ?? '-'}</div>
              <div><strong>Category:</strong> {typeof recordToDeleteObj.senior === 'boolean' ? (recordToDeleteObj.senior ? 'Senior' : 'Junior') : '-'}</div>
              <div><strong>Station:</strong> {recordToDeleteObj.station_name ?? '-'}</div>
              <div><strong>Attendance:</strong> {recordToDeleteObj.attendance_type ?? '-'}</div>
              <div><strong>Date:</strong> {recordToDeleteObj.created_datetime ? String(recordToDeleteObj.created_datetime).split('T')[0] : '-'}</div>
            </div>
          ) : null
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          await handleDelete();
        }}
      />

      {/* Edit Record Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Entry</DialogTitle>
            <DialogDescription>
              Only records without a Time Out can be edited.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Staff Name</Label>
              <Input value={editingRecord?.staff_name ?? ''} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Force Number</Label>
              <Input value={editingRecord?.staff_force_number ?? ''} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Station <span className="text-red-500">*</span></Label>
              <Select value={editSelectedStation} onValueChange={(v) => { setEditSelectedStation(v || ''); setFormErrors(null); }} disabled={true}>
                <SelectTrigger><SelectValue placeholder="Select a station" /></SelectTrigger>
                <SelectContent>
                  {stationOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Attendance Type <span className="text-red-500">*</span></Label>
              <Select value={editAttendanceType} onValueChange={(v) => setEditAttendanceType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Out (Optional)</Label>
              <Input type="time" value={editTimeOut} onChange={(e) => setEditTimeOut(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Remark (Optional)</Label>
              <Textarea value={editRemark} onChange={(e) => setEditRemark(e.target.value)} rows={3} />
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editSubmitLoading}>Cancel</Button>
              <Button onClick={handleEditSave} className="bg-primary hover:bg-primary/90" disabled={editSubmitLoading}>
                {editSubmitLoading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
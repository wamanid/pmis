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
  const loadTable = useCallback(async (p = page, ps = pageSize, sf?: string, sd?: string, q?: string) => {
    setTableLoading(true);
    setLoadError(null);
    try {
      const params: Record<string, any> = {
        page: p,
        page_size: ps,
      };
      if (sf) params.ordering = sd === 'desc' ? `-${sf}` : sf;
      if (q) params.search = q;
      const res = await StaffEntryService.fetchEntries(params);
      const items = res.results ?? res ?? [];
      // setTableData((items || []).map((it: any) => ({
      //   id: it.id,
      //   date: it.date,
      //   staff_name: it.staff_name ?? `${it.first_name ?? ''} ${it.last_name ?? ''}`.trim(),
      //   staff_force_number: it.staff_force_number ?? it.force_number ?? '',
      //   // staff_category: it.staff_category ?? it.staff_category_name ?? '',
      //   staff_category: (typeof it.senior === 'boolean')
      //     ? (it.senior ? 'Senior' : 'Junior')
      //     : (it.staff_category ?? it.staff_category_name ?? ''),
      //   time_in: it.time_in,
      //   time_out: it.time_out,
      //   attendance_type: it.attendance_type,
      //   station: it.station_name ?? it.station,
      //   staff_rank: it.staff_rank ?? it.rank_name,
      // })));
      setTableData((items || []).map((it: any) => ({
        id: it.id,
        // keep full created_datetime (columns expect 'created_datetime'); format in column render if desired
        created_datetime: it.created_datetime ?? null,
        staff_name: it.staff_name ?? '',
        staff_force_number: it.staff_force_number ?? '',
        // keep senior as boolean (columns render it)
        senior: typeof it.senior === 'boolean' ? it.senior : null,
        // use API-provided name fields
        staff_rank_name: it.staff_rank_name ?? it.staff_rank ?? '',
        station_name: it.station_name ?? it.station ?? '',
        time_in: it.time_in ?? null,
        time_out: it.time_out ?? null,
        attendance_type: it.attendance_type ?? null,
        remark: it.remark ?? '',
      })));

      setTotal(res.count ?? (items.length || 0));
    } catch (err: any) {
      // log full details to console for debugging (avoid toast noise)
      console.error('loadTable error:', err?.response ?? err);
      // set a small message for the UI so users know to check console / network
      const msg = err?.response?.status
        ? `Failed to load records (status ${err.response.status}). See console/network tab for details.`
        : 'Failed to load records (network error). See console/network tab for details.';
      setLoadError(msg);
    } finally {
      setTableLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    loadStations();
    loadTable(1, pageSize, sortField, sortDir, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload when table state changes
  useEffect(() => {
    loadTable(page, pageSize, sortField, sortDir, search);
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
          {value ?? '-'}
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
            {value}
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
            onSearch={(q) => {
              setSearch(q);
              setPage(1);
              loadTable(1, pageSize, sortField, sortDir, q);
            }}
            onPageChange={(p) => {
              setPage(p);
              loadTable(p, pageSize, sortField, sortDir, search);
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
              loadTable(1, size, sortField, sortDir, search);
            }}
            onSort={(field, dir) => {
              setSortField(field ?? undefined);
              setSortDir(dir ?? undefined);
              loadTable(1, pageSize, field ?? undefined, dir ?? undefined, search);
            }}
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
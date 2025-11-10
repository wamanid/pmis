import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Plus, Search, Scan, CheckCircle2, XCircle, Clock, User, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
// import DataTable, { DataTableColumn } from '../ui/data-table'; 
import { DataTable } from '../common/DataTable';
import type { DataTableColumn } from '../common/DataTable.types';
import * as StaffEntryService from '../../services/stationServices/staffEntryService';

interface StaffEntryRow {
  id: string;
  date: string;
  staff_name: string;
  staff_force_number: string;
  staff_category?: string;
  time_in?: string;
  time_out?: string | null;
  attendance_type: 'PRESENT' | 'ABSENT';
  station: string;
  staff_rank?: string;
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
  const [loading, setLoading] = useState(false);
  const [scanningMode, setScanningMode] = useState(false);
  const [forceInput, setForceInput] = useState('');
  const [staffDetails, setStaffDetails] = useState<StaffEntryService.StaffProfile | null>(null);
  const [stationOptions, setStationOptions] = useState<any[]>([]);
  const [attendanceType, setAttendanceType] = useState<'PRESENT' | 'ABSENT'>('PRESENT');
  const [timeOut, setTimeOut] = useState('');
  const [remark, setRemark] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

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

  const loadStations = useCallback(async () => {
    const s = await StaffEntryService.fetchStations();
    setStationOptions(s || []);
  }, []);

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
      setTableData((items || []).map((it: any) => ({
        id: it.id,
        date: it.date,
        staff_name: it.staff_name ?? `${it.first_name ?? ''} ${it.last_name ?? ''}`.trim(),
        staff_force_number: it.staff_force_number ?? it.force_number ?? '',
        staff_category: it.staff_category ?? '',
        time_in: it.time_in,
        time_out: it.time_out,
        attendance_type: it.attendance_type,
        station: it.station_name ?? it.station,
        staff_rank: it.staff_rank ?? it.rank_name,
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
    setLoading(true);
    try {
      // try server search by force_number param
      const profiles = await StaffEntryService.fetchStaffProfiles({ force_number: forceNumber });
      const staff = profiles[0] ?? null;
      if (!staff) {
        toast.error('Staff not found. Please check the force number.');
        setStaffDetails(null);
        return null;
      }
      setStaffDetails(staff);
      toast.success('Staff details retrieved successfully');
      return staff;
    } catch (err) {
      console.error('fetchStaffDetails error', err?.response ?? err);
      toast.error('Failed to fetch staff details');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeModeToggle = () => {
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
    if (!staffDetails) {
      toast.error('No staff details available');
      return;
    }
    if (!staffDetails.station && !stationOptions.length) {
      toast.error('No station selected or available');
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      const payload: StaffEntryService.StaffEntryPayload = {
        staff: staffDetails.id,
        station: staffDetails.station ?? (stationOptions[0]?.id ?? ''),
        time_in: now.toTimeString().slice(0,5),
        time_out: timeOut || null,
        remark: remark || null,
        attendance_type: attendanceType,
        date: now.toISOString().split('T')[0],
        gate_keeper: 1,
        staff_rank: staffDetails.rank,
        staff_name: `${staffDetails.first_name ?? ''} ${staffDetails.last_name ?? ''}`.trim(),
        staff_force_number: staffDetails.force_number,
      };
      await StaffEntryService.createEntry(payload);
      toast.success('Staff entry recorded successfully');
      // refresh table
      loadTable(1, pageSize, sortField, sortDir, search);
      setDialogOpen(false);
      // reset form
      setForceInput('');
      setStaffDetails(null);
      setRemark('');
      setTimeOut('');
      setAttendanceType('PRESENT');
    } catch (err: any) {
      console.error('createEntry error', err?.response ?? err);
      if (err?.response?.data) {
        // show server validation if any
        toast.error('Failed to save entry. Check input.');
      } else {
        toast.error('Failed to save entry.');
      }
    } finally {
      setLoading(false);
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

  const columns: DataTableColumn<StaffEntryRow>[] = [
    { id: 'date', header: 'Date', accessor: (r) => r.date, sortable: true },
    { id: 'force', header: 'Force Number', accessor: (r) => r.staff_force_number },
    { id: 'name', header: 'Staff Name', accessor: (r) => r.staff_name, sortable: true },
    { id: 'category', header: 'Category', accessor: (r) => r.staff_category },
    { id: 'rank', header: 'Rank', accessor: (r) => r.staff_rank },
    { id: 'station', header: 'Station', accessor: (r) => r.station },
    { id: 'time_in', header: 'Time In', accessor: (r) => r.time_in },
    { id: 'time_out', header: 'Time Out', accessor: (r) => r.time_out ?? '-' },
    { id: 'attendance', header: 'Attendance', accessor: (r) => r.attendance_type },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (r) => r.id,
      cell: (id: string, row: StaffEntryRow) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setRecordToDelete(row.id); setDeleteDialogOpen(true); }}>
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

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setStaffDetails(null); setForceInput(''); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Record Entry/Exit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Staff Entry/Exit</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Button variant={scanningMode ? 'default' : 'outline'} onClick={handleBarcodeModeToggle}>
                  <Scan className="mr-2 h-4 w-4" />
                  {scanningMode ? 'Scanning (press Esc to stop)' : 'Scan Barcode'}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Or enter force number manually
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleFetchClick(e); }} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Force number / Barcode"
                    value={forceInput}
                    onChange={(e) => setForceInput(e.target.value)}
                    disabled={scanningMode}
                    autoFocus={!scanningMode}
                  />
                  <Button type="submit" disabled={!forceInput.trim() || loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Fetch</> : 'Fetch'}
                  </Button>
                </div>
              </form>

              {staffDetails && (
                <div className="p-4 border rounded-md space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <p>{`${staffDetails.first_name ?? ''} ${staffDetails.last_name ?? ''}`.trim()}</p>
                    </div>
                    <div>
                      <Label>Force Number</Label>
                      <p>{staffDetails.force_number}</p>
                    </div>
                    <div>
                      <Label>Rank</Label>
                      <p>{staffDetails.rank_name ?? staffDetails.rank}</p>
                    </div>
                    <div>
                      <Label>Station</Label>
                      <p>{staffDetails.station_name ?? staffDetails.station}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Attendance Type</Label>
                      <Select value={attendanceType} onValueChange={(v) => setAttendanceType(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">Present</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Time Out (optional)</Label>
                      <Input type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} />
                    </div>

                    <div>
                      <Label>Station (optional)</Label>
                      <Select value={staffDetails.station ?? (stationOptions[0]?.id ?? '')} onValueChange={() => {}}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {stationOptions.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Remark</Label>
                    <Input value={remark} onChange={(e) => setRemark(e.target.value)} />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => { setStaffDetails(null); setForceInput(''); }}>
                      Scan Another
                    </Button>
                    <Button onClick={handleConfirmEntry} className="bg-primary hover:bg-primary/90" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Recording...</> : <> <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Entry</>}
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
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Total Records</CardTitle></CardHeader><CardContent><div className="text-2xl text-[#650000]">{total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Present</CardTitle></CardHeader><CardContent><div className="text-2xl text-green-600">{/* calculate if needed */}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">Absent</CardTitle></CardHeader><CardContent><div className="text-2xl text-red-600">{/* calculate if needed */}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-gray-600">On Duty</CardTitle></CardHeader><CardContent><div className="text-2xl text-blue-600">{/* calculate if needed */}</div></CardContent></Card>
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
            url="/station-management/api/attendance/" // correct backend endpoint for attendance
            title="Staff Entry & Exit Records"
            columns={columns.map(c => ({
              key: c.id,
              label: c.header,
              sortable: !!c.sortable,
              render: c.cell ? (val: any, row: any) => c.cell(val, row) : undefined,
            }))}
            config={{
              lengthMenu: [10, 25, 50],
              search: true,
              export: { csv: true, pdf: true, print: true },
            }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
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

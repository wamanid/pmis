import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Calendar } from "../ui/calendar";
import DatePicker from '../common/DatePicker';
import { Plus, Search, Edit, Trash2, Filter, Building2, Calendar as CalendarIcon, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ConfirmDialog from '../common/ConfirmDialog';
import { Switch } from '../ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { DataTable } from '../common/DataTable';
import * as JournalService from '../../services/stationServices/journalService';
import { useFilterRefresh } from '../../hooks/useFilterRefresh';
import { useFilters } from '../../contexts/FilterContext';
import SearchableSelect from '../common/SearchableSelect';
import StaffProfileSelect from '../common/StaffProfileSelect';

interface JournalRow {
  id: string;
  is_active?: boolean;
  created_datetime?: string;
  journal_date?: string;
  type_of_journal_name?: string;
  station_name?: string;
  duty_officer_name?: string;
  rank_name?: string;
  activity?: string;
  force_number?: string;
  [k: string]: any;
}

export function JournalScreen() {
  // table controls (DataTable will perform fetch from the provided url)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [reloadKey, setReloadKey] = useState<number>(Date.now());

  // lookups
  const [journalTypes, setJournalTypes] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [dutyOfficers, setDutyOfficers] = useState<any[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);

  // stats/sample
  const [sampleJournals, setSampleJournals] = useState<JournalRow[]>([]);

  // filters/ui
  const [selectedJournalTypes, setSelectedJournalTypes] = useState<string[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<string | null>(null);
  // view dialog state for "View" action in the table
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewJournal, setViewJournal] = useState<JournalRow | null>(null);
  const handleView = (row: JournalRow) => { setViewJournal(row); setViewDialogOpen(true); };

  // form
  const [editingJournal, setEditingJournal] = useState<JournalRow | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    is_active: true,
    activity: '',
    state_of_prisoners: '',
    state_of_prison: '',
    remark: '',
    force_number: '',
    journal_date: new Date().toISOString().split('T')[0],
    station: '',
    type_of_journal: '',
    duty_officer: '',
    rank: '',       // ✅ holds rank ID for backend
    rank_name: '',  // ✅ holds rank label for UI only
  });

  // refs
  const abortRef = useRef<AbortController | null>(null);
  const [dutyQuery, setDutyQuery] = useState('');
  const [stationQuery, setStationQuery] = useState('');

  // load lookups
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    setLookupLoading(true);
    (async () => {
      try {
        const [types, stns, officers] = await Promise.all([
          JournalService.fetchJournalTypes(undefined, controller.signal),
          JournalService.fetchStations(undefined, controller.signal),
          JournalService.fetchDutyOfficers(undefined, controller.signal),
        ]);
        if (!mounted) return;
        setJournalTypes(types ?? []);
        setStations(stns ?? []);
        setDutyOfficers(officers ?? []);
      } catch (err) {
        console.error('lookup load error', err);
        toast.error('Failed to load lookup data');
      } finally {
        setLookupLoading(false);
      }
    })();
    return () => { mounted = false; controller.abort(); };
  }, []);

  // sample for stats
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await JournalService.fetchJournals({ page: 1, page_size: 100 }, controller.signal);
        if (!mounted) return;
        const items = res?.results ?? res ?? [];
        setSampleJournals(items.map(mapItem));
      } catch (err: any) {
        // ignore expected abort / cancel errors (user navigated away / reloadKey changed)
        if (
          err?.name === 'AbortError' ||
          err?.code === 'ERR_CANCELED' ||
          String(err?.message).toLowerCase().includes('canceled') ||
          (err?.request && err?.request?.readyState === 0 && !err?.response)
        ) {
          // expected cancellation / network abort — do not log
          return;
        }
        console.error('sample load error', err);
      }
    })();
    return () => { mounted = false; controller.abort(); };
  }, [reloadKey]);

  const mapItem = useCallback((it: any): JournalRow => ({
    id: it.id,
    is_active: !!it.is_active,
    created_datetime: it.created_datetime ?? it.journal_date ?? '',
    journal_date: it.journal_date ?? '',
    type_of_journal_name: it.type_of_journal_name ?? '',
    station_name: it.station_name ?? '',
    duty_officer_name: it.duty_officer_name ?? '',
    rank_name: it.rank_name ?? '',
    activity: it.activity ?? '',
    force_number: it.force_number ?? '',
    ...it,
  }), []);

  // (search is handled directly by DataTable via journalsUrl() and externalSearch)

  // global filters (from app) drive reloads and are included in DataTable url below
  const { region: globalRegion, district: globalDistrict, station: globalStation } = useFilters();
  useFilterRefresh(() => {
    setReloadKey(() => Date.now());
  }, [globalRegion, globalDistrict, globalStation]);

  // DataTable now fetches directly from the URL returned by journalsUrl()
  // reloadKey and filters drive the URL so DataTable will refetch automatically.
  // useEffect(() => {
  //   loadTable(page, pageSize, sortField, sortDir, debouncedSearch);
  // }, [page, pageSize, sortField, sortDir, reloadKey, selectedJournalTypes, selectedStations, debouncedSearch, loadTable]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => { setPage(p); };
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: 'asc' | 'desc' | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // build DataTable url with global + local filters and reload key to force refetch when needed
  const journalsUrl = useCallback(() => {
    const base = '/station-management/api/journals/';
    const params: string[] = [];
    params.push(`_t=${reloadKey}`);
    if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
    if (selectedJournalTypes.length) params.push(`type_of_journal=${encodeURIComponent(selectedJournalTypes.join(','))}`);
    if (selectedStations.length) params.push(`station=${encodeURIComponent(selectedStations.join(','))}`);
    if (globalRegion) params.push(`region=${encodeURIComponent(globalRegion)}`);
    if (globalDistrict) params.push(`district=${encodeURIComponent(globalDistrict)}`);
    if (globalStation) params.push(`station=${encodeURIComponent(globalStation)}`);
    return `${base}?${params.join('&')}`;
  }, [reloadKey, searchTerm, selectedJournalTypes, selectedStations, globalRegion, globalDistrict, globalStation]);

  // duty selection autofill
  const handleDutyOfficerSelect = (id: string) => {
    const o = dutyOfficers.find(d => String(d.id) === String(id));
    if (o) {
      setFormData(prev => ({
        ...prev,
        duty_officer: String(o.id),
        force_number: o.force_number ?? prev.force_number,

        // ✅ FIX: Save rank ID for backend, and rank_name for display
        rank: o.rank ?? prev.rank,                 // <-- ID sent to API
        rank_name: o.rank_name ?? prev.rank_name,  // <-- Name shown in UI
      }));
    } else {
      setFormData(prev => ({ ...prev, duty_officer: id }));
    }
  };


  const handleEdit = async (row: JournalRow) => {
    // optionally fetch single item for freshest data
    try {
      const fresh = await JournalService.fetchJournalById(row.id);
      const mapped = mapItem(fresh);
      setEditingJournal(mapped);
      setFormData({
        is_active: !!mapped.is_active,
        activity: mapped.activity ?? '',
        state_of_prisoners: mapped.state_of_prisoners ?? '',
        state_of_prison: mapped.state_of_prison ?? '',
        remark: mapped.remark ?? '',
        force_number: mapped.force_number ?? '',
        journal_date: mapped.journal_date ?? new Date().toISOString().split('T')[0],
        station: mapped.station ?? '',
        type_of_journal: mapped.type_of_journal ?? '',
        duty_officer: mapped.duty_officer ?? '',
        // ✅ Fix for edit mode:
        rank: mapped.rank ?? '',
        rank_name: mapped.rank_name ?? '',
      });
      setDialogOpen(true);
    } catch (err) {
      console.error('fetch single journal error', err);
      toast.error('Failed to load journal for editing');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.activity || !formData.force_number || !formData.journal_date || !formData.station || !formData.type_of_journal || !formData.duty_officer) {
      toast.error('Please fill required fields');
      return;
    }
    setSubmitLoading(true);
    try {
      const payload = {
        activity: formData.activity,
        state_of_prisoners: formData.state_of_prisoners,
        state_of_prison: formData.state_of_prison,
        remark: formData.remark,
        force_number: formData.force_number,
        journal_date: formData.journal_date,
        station: formData.station,
        type_of_journal: formData.type_of_journal,
        duty_officer: formData.duty_officer,
        rank: formData.rank,
        is_active: formData.is_active,
      };
      if (editingJournal?.id) {
        await JournalService.updateJournal(editingJournal.id, payload);
        toast.success('Journal updated');
      } else {
        await JournalService.createJournal(payload);
        toast.success('Journal created');
      }
      setReloadKey(Date.now());
      setDialogOpen(false);
      setEditingJournal(null);
      setFormData({
        is_active: true,
        activity: '',
        state_of_prisoners: '',
        state_of_prison: '',
        remark: '',
        force_number: '',
        journal_date: new Date().toISOString().split('T')[0],
        station: '',
        type_of_journal: '',
        duty_officer: '',
        rank: '',
       rank_name: '',
      });
    } catch (err) {
      console.error('save error', err?.response ?? err);
      // show validation messages from backend when available
      const data = (err as any)?.response?.data;
      if (data) {
        if (typeof data === 'string') {
          toast.error(data);
        } else if (data.non_field_errors) {
          toast.error(String(data.non_field_errors));
        } else {
          // collect first validation message per field
          const messages = Object.entries(data)
            .filter(([k]) => k !== 'detail')
            .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}: ${v}`));
          if (messages.length) {
            toast.error(messages.join(' — '));
          } else if (data.detail) {
            toast.error(String(data.detail));
          } else {
            toast.error('Failed to save journal');
          }
        }
      } else {
        toast.error('Failed to save journal');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = (id: string) => { setJournalToDelete(id); setDeleteDialogOpen(true); };
  const handleDelete = async () => {
    if (!journalToDelete) return;
    try {
      await JournalService.deleteJournal(journalToDelete);
      toast.success('Journal deleted');
      setJournalToDelete(null);
      setDeleteDialogOpen(false);
      setReloadKey(Date.now());
    } catch (err) {
      console.error('delete error', err);
      toast.error('Failed to delete journal');
    }
  };

  const toggleJournalType = (id: string) => {
    const newSelected = selectedJournalTypes.includes(id) ? selectedJournalTypes.filter(x => x !== id) : [...selectedJournalTypes, id];
    setPage(1);
    setSelectedJournalTypes(newSelected);
    // don't clear tableData here — keep current rows until new response arrives
  };

  const toggleStation = (id: string) => {
    const newSelected = selectedStations.includes(id) ? selectedStations.filter(x => x !== id) : [...selectedStations, id];
    setPage(1);
    setSelectedStations(newSelected);
  };

  const clearFilters = () => {
    setSelectedJournalTypes([]);
    setSelectedStations([]);
    setSearchTerm('');
    setPage(1);
  };
  
  const activeFiltersCount = selectedJournalTypes.length + selectedStations.length;

  const getJournalTypeName = (id: string) => journalTypes.find(t => String(t.id) === String(id))?.name ?? String(id);
  const getStationName = (id: string) => stations.find(s => String(s.id) === String(id))?.name ?? String(id);
  // const getRankName = (idOrName?: string) => idOrName ?? '';
  // helper to get officer name from dutyOfficers lookup
  // const getOfficerName = (id?: string) => {
  //   if (!id) return '';
  //   const o = dutyOfficers.find(d => String(d.id) === String(id));
  //   if (!o) return '';
  //   const name = `${o.first_name ?? ''} ${o.last_name ?? ''}`.trim();
  //   return name || String(o.id);
  // };
  
  // build details content for delete confirm (prefer server-provided name fields, fallback to lookups)
  const deleteDialogDetails = journalToDelete
    ? (() => {
        const j = sampleJournals.find(s => String(s.id) === String(journalToDelete)) ?? null;
        const jt = j?.type_of_journal_name ?? getJournalTypeName(j?.type_of_journal ?? '');
        const st = j?.station_name ?? getStationName(j?.station ?? '');
        const dt = j?.journal_date ?? '';
        const at = j?.activity ?? '';
        // const sts = j?.is_active ?? '';

        return (
          <div className="text-sm space-y-1">
            <div><strong>Journal Type:</strong> {jt || '-'}</div>
            <div><strong>Station:</strong> {st || '-'}</div>
            <div><strong>Date:</strong> {dt || '-'}</div>
            {/* <div><strong>Status:</strong> {sts || '-'}</div> */}
            <div><strong>Activity:</strong> {at || '-'}</div>
            {/* <div className="text-xs text-muted-foreground">ID: {journalToDelete}</div> */}
          </div>
        );
      })()
    : null;
  
  const journalColumns = [
    // { key: 'is_active', label: 'Status', render: (v: boolean) => (v ? 'Active' : 'Inactive') },
    {
      key: 'is_active',
      label: 'Status',
      render: (_v: any, journal: JournalRow) => (
        <Badge variant={journal.is_active ? 'default' : 'secondary'}>
          {journal.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { key: 'journal_date', label: 'Date', sortable: true },
    // { key: 'type_of_journal_name', label: 'Journal Type', sortable: true },
    {
      key: 'type_of_journal_name',
      label: 'Journal Type',
      sortable: true,
      render: (_v: any, journal: JournalRow) => (
        <Badge variant="outline">{getJournalTypeName(journal.type_of_journal)}</Badge>
      ),
    },
    { key: 'station_name', label: 'Station', sortable: true },
    // { key: 'duty_officer_name', label: 'Duty Officer', sortable: true },
    {

      key: 'duty_officer_name',
      label: 'Duty Officer',
      sortable: true,

      render: (v: any, journal: JournalRow) => (
        <div>
          <p className="text-sm">
            {journal.duty_officer_name ?? '-'}
            {/* {v ?? journal.duty_officer_name ?? journal.duty_officer ?? '-'} */}
          </p>
          <p className="text-xs text-muted-foreground font-mono">{journal.force_number ?? '-'}</p>
        </div>
      ),
      // key: 'duty_officer',
      // label: 'Duty Officer',
      // sortable: true,
      // render: (_v: any, journal: JournalRow) => (
      //   <div>
      //     <p className="text-sm">{getOfficerName(journal.duty_officer) || journal.duty_officer_name}</p>
      //     <p className="text-xs text-muted-foreground font-mono">{journal.force_number ?? '-'}</p>
      //   </div>
      // ),
    },
    { key: 'rank_name', label: 'Rank' },
    { key: 'activity', label: 'Activity' },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v: any, row: JournalRow) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleView(row)}><Eye className="h-4 w-4 text-green-600" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}><Edit className="h-4 w-4 text-blue-600" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteConfirm(row.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
        </div>
      ),
    },
  ];

  // stats derived from sampleJournals
  const totalCount = sampleJournals.length;
  const activeCount = sampleJournals.filter(j => j.is_active).length;
  const thisWeekCount = sampleJournals.filter(j => j.journal_date && new Date(j.journal_date) >= (() => { const d = new Date(); d.setDate(d.getDate()-7); return d; })()).length;
  const thisMonthCount = sampleJournals.filter(j => j.journal_date && new Date(j.journal_date) >= (() => { const d = new Date(); d.setMonth(d.getMonth()-1); return d; })()).length;

  return (
    <div className="space-y-6">
      {/* Header and add dialog */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[#650000] mb-2">Journal Management</h1>
          <p className="text-muted-foreground">Record and manage station journals and reports</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingJournal(null); setFormData(prev => ({ ...prev, is_active: true })); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Add Journal Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-[1100px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJournal ? 'Edit Journal Entry' : 'Add New Journal Entry'}</DialogTitle>
              <DialogDescription>{editingJournal ? 'Update the journal entry details below' : 'Fill in the details for the new journal entry'}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Active Status</Label>
                    <p className="text-sm text-muted-foreground">Mark this journal entry as active</p>
                  </div>
                  <Switch id="is_active" checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: !!c })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    {/* <Label>Journal Date <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" type="date" value={formData.journal_date} onChange={(e) => setFormData({ ...formData, journal_date: e.target.value })} required />
                    </div> */}
                    <DatePicker
                      label="Journal Date"
                      required
                      value={formData.journal_date ? new Date(formData.journal_date) : null}
                      onChange={(d) => setFormData({ ...formData, journal_date: d ? d.toISOString().split('T')[0] : '' })}
                      placeholder="Pick a date"
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Station <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      value={formData.station}
                      onChange={(v) => setFormData({ ...formData, station: v ?? '' })}
                      items={stations.map(s => ({ ...s, name: s.name ?? s.station_name ?? s.id }))}
                      idField="id"
                      labelField="name"
                      placeholder="Select station"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Journal Type <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      value={formData.type_of_journal}
                      onChange={(v) => setFormData({ ...formData, type_of_journal: v ?? '' })}
                      items={journalTypes.map(t => ({ ...t, name: t.name ?? t.type_of_journal_name ?? t.id }))}
                      idField="id"
                      labelField="name"
                      placeholder="Select journal type"
                    />
                  </div>

                  <div>
                    <Label className="mb-2">Duty Officer <span className="text-red-500">*</span></Label>
                    <StaffProfileSelect
                      value={formData.duty_officer || null}
                      onChange={(v) => handleDutyOfficerSelect(v ?? '')}
                      placeholder="Select duty officer"
                      initialItems={dutyOfficers}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">Force Number <span className="text-red-500">*</span></Label>
                    <Input value={formData.force_number} readOnly className="bg-muted" placeholder="Auto-populated" required />
                  </div>
                  <div>
                    {/* <Label>Rank <span className="text-red-500">*</span></Label>
                    <Input value={formData.rank} readOnly className="bg-muted" placeholder="Auto-populated" required /> */}
                    <Label className="mb-2">Rank <span className="text-red-500">*</span></Label>
                    <Input value={formData.rank_name} readOnly className="bg-muted" placeholder="Auto-populated" required />

                  </div>
                </div>

                <div>
                  <Label className="mb-2">Activity <span className="text-red-500">*</span></Label>
                  <Textarea value={formData.activity} onChange={(e) => setFormData({ ...formData, activity: e.target.value })} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2">State of Prisoners <span className="text-red-500">*</span></Label>
                    <Textarea value={formData.state_of_prisoners} onChange={(e) => setFormData({ ...formData, state_of_prisoners: e.target.value })} required />
                  </div>
                  <div>
                    <Label className="mb-2">State of Prison <span className="text-red-500">*</span></Label>
                    <Textarea value={formData.state_of_prison} onChange={(e) => setFormData({ ...formData, state_of_prison: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Remarks</Label>
                  <Textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setEditingJournal(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitLoading} className="bg-primary hover:bg-primary/90">
                  {submitLoading ? 'Saving...' : (editingJournal ? 'Update Journal' : 'Create Journal')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Total Journals</CardDescription><CardTitle className="text-3xl text-[#650000]">{totalCount}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Active Journals</CardDescription><CardTitle className="text-3xl text-[#650000]">{activeCount}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>This Week</CardDescription><CardTitle className="text-3xl text-[#650000]">{thisWeekCount}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>This Month</CardDescription><CardTitle className="text-3xl text-[#650000]">{thisMonthCount}</CardTitle></CardHeader></Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><CardTitle>Journal Entries</CardTitle><CardDescription>View and manage all journal entries</CardDescription></div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {/* <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search journals..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div> */}

              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild><Button variant="outline" className="relative"><Filter className="mr-2 h-4 w-4" />Journal Type{selectedJournalTypes.length > 0 && <Badge className="ml-2">{selectedJournalTypes.length}</Badge>}</Button></PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><h4 className="font-medium">Journal Type</h4>{selectedJournalTypes.length > 0 && <Button variant="ghost" size="sm" onClick={() => setSelectedJournalTypes([])}>Clear</Button>}</div>
                      <div className="space-y-2">{journalTypes.map((type) => (<div key={type.id} className="flex items-center space-x-2"><Checkbox id={`type-${type.id}`} checked={selectedJournalTypes.includes(type.id)} onCheckedChange={() => toggleJournalType(type.id)} /><label htmlFor={`type-${type.id}`} className="text-sm cursor-pointer flex-1">{type.name}</label></div>))}</div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild><Button variant="outline" className="relative"><Building2 className="mr-2 h-4 w-4" />Station{selectedStations.length > 0 && <Badge className="ml-2">{selectedStations.length}</Badge>}</Button></PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between"><h4 className="font-medium">Station</h4>{selectedStations.length > 0 && <Button variant="ghost" size="sm" onClick={() => setSelectedStations([])}>Clear</Button>}</div>
                      <div className="space-y-2">{stations.map((s) => (<div key={s.id} className="flex items-center space-x-2"><Checkbox id={`station-${s.id}`} checked={selectedStations.includes(s.id)} onCheckedChange={() => toggleStation(s.id)} /><label htmlFor={`station-${s.id}`} className="text-sm cursor-pointer flex-1">{s.name ?? s.station_name ?? s.id}</label></div>))}</div>
                    </div>
                  </PopoverContent>
                </Popover>

                {activeFiltersCount > 0 && (<Button variant="ghost" size="sm" onClick={clearFilters}><X className="mr-1 h-4 w-4" /> Clear All</Button>)}
              </div>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedJournalTypes.map(typeId => (<Badge key={typeId} variant="secondary" className="gap-1">{getJournalTypeName(typeId)}<button onClick={() => toggleJournalType(typeId)} className="ml-1"><X className="h-3 w-3" /></button></Badge>))}
              {selectedStations.map(stationId => (<Badge key={stationId} variant="secondary" className="gap-1">{getStationName(stationId)}<button onClick={() => toggleStation(stationId)} className="ml-1"><X className="h-3 w-3" /></button></Badge>))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="">
            <DataTable
              url={journalsUrl()}
              title="Journal Entries"
              columns={journalColumns}
              externalSearch={searchTerm}
              onSearch={onSearch}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              onSort={onSort}
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setJournalToDelete(null);
        }}
        title="Delete Journal Entry"
        description="Are you sure you want to delete this journal entry? This action cannot be undone."
        details={deleteDialogDetails}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (!journalToDelete) return;
          await handleDelete();
          // ensure DataTable refetch via reloadKey
          setReloadKey(Date.now());
        }}
      />

      {/* View dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => { setViewDialogOpen(open); if (!open) setViewJournal(null); }}>
        <DialogContent className="max-w-md w-[90vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Journal Entry</DialogTitle>
            <DialogDescription>Read-only details for the selected journal entry</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div><strong>Date:</strong> {viewJournal?.journal_date ?? '-'}</div>
            <div><strong>Journal Type:</strong> {viewJournal?.type_of_journal_name ?? viewJournal?.type_of_journal ?? '-'}</div>
            <div><strong>Station:</strong> {viewJournal?.station_name ?? viewJournal?.station ?? '-'}</div>
            <div><strong>Duty Officer:</strong> {viewJournal?.duty_officer_name ?? viewJournal?.duty_officer ?? '-'}</div>
            <div><strong>Force Number:</strong> {viewJournal?.force_number ?? '-'}</div>
            <div><strong>Rank:</strong> {viewJournal?.rank_name ?? viewJournal?.rank ?? '-'}</div>
            <div><strong>Activity:</strong> {viewJournal?.activity ?? '-'}</div>
            <div><strong>State of Prisoners:</strong> {viewJournal?.state_of_prisoners ?? '-'}</div>
            <div><strong>State of Prison:</strong> {viewJournal?.state_of_prison ?? '-'}</div>
            <div><strong>Remarks:</strong> {viewJournal?.remark ?? '-'}</div>
            {/* <div><strong>Created:</strong> {viewJournal?.created_datetime ?? '-'}</div> */}
            {/* <div className="text-xs text-muted-foreground">ID: {viewJournal?.id ?? '-'}</div> */}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setViewDialogOpen(false); setViewJournal(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default JournalScreen;
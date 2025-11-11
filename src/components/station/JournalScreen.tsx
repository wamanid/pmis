import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Search, Edit, Trash2, Filter, BookOpen, Calendar as CalendarIcon, User, Building2, FileText, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Switch } from '../ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';

// Mock data for foreign key references
const mockStations = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Central Station' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'East Wing Station' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'West Wing Station' },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'North Wing Station' },
];

const mockJournalTypes = [
  { id: 'jt-001', name: 'Daily Journal' },
  { id: 'jt-002', name: 'Incident Report' },
  { id: 'jt-003', name: 'Inspection Report' },
  { id: 'jt-004', name: 'Medical Journal' },
  { id: 'jt-005', name: 'Security Journal' },
];

const mockOfficers = [
  { id: 1, force_number: 'UPS001234', name: 'John Musoke', rank_id: '990e8400-e29b-41d4-a716-446655440004' },
  { id: 2, force_number: 'UPS005678', name: 'Sarah Nakato', rank_id: '990e8400-e29b-41d4-a716-446655440005' },
  { id: 3, force_number: 'UPS009012', name: 'David Okello', rank_id: '990e8400-e29b-41d4-a716-446655440006' },
];

const mockRanks = [
  { id: '990e8400-e29b-41d4-a716-446655440004', name: 'Superintendent' },
  { id: '990e8400-e29b-41d4-a716-446655440005', name: 'Assistant Superintendent' },
  { id: '990e8400-e29b-41d4-a716-446655440006', name: 'Officer' },
];

interface Journal {
  id: string;
  is_active: boolean;
  activity: string;
  state_of_prisoners: string;
  state_of_prison: string;
  remark?: string;
  force_number: string;
  journal_date: string;
  station: string;
  type_of_journal: string;
  duty_officer: number;
  rank: string;
}

// Mock existing journals
const mockJournals: Journal[] = [
  {
    id: '1',
    is_active: true,
    activity: 'Morning headcount and cell inspection',
    state_of_prisoners: 'All prisoners accounted for. No incidents reported. Health status normal.',
    state_of_prison: 'All facilities in good condition. Security systems operational.',
    remark: 'Routine operations',
    force_number: 'UPS001234',
    journal_date: '2025-10-16',
    station: '550e8400-e29b-41d4-a716-446655440001',
    type_of_journal: 'jt-001',
    duty_officer: 1,
    rank: '990e8400-e29b-41d4-a716-446655440004',
  },
  {
    id: '2',
    is_active: true,
    activity: 'Security breach investigation',
    state_of_prisoners: 'One prisoner attempted unauthorized communication. Disciplinary action taken.',
    state_of_prison: 'Perimeter security enhanced. Additional patrols deployed.',
    remark: 'Incident resolved. No further action required.',
    force_number: 'UPS005678',
    journal_date: '2025-10-15',
    station: '550e8400-e29b-41d4-a716-446655440002',
    type_of_journal: 'jt-002',
    duty_officer: 2,
    rank: '990e8400-e29b-41d4-a716-446655440005',
  },
  {
    id: '3',
    is_active: true,
    activity: 'Monthly facility inspection',
    state_of_prisoners: 'Overall health and welfare satisfactory. Minor complaints addressed.',
    state_of_prison: 'Minor repairs needed in Block C. Water supply systems functioning well.',
    remark: 'Maintenance work scheduled for next week',
    force_number: 'UPS009012',
    journal_date: '2025-10-14',
    station: '550e8400-e29b-41d4-a716-446655440001',
    type_of_journal: 'jt-003',
    duty_officer: 3,
    rank: '990e8400-e29b-41d4-a716-446655440006',
  },
];

export function JournalScreen() {
  const [journals, setJournals] = useState<Journal[]>(mockJournals);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<string | null>(null);

  // Filter states
  const [selectedJournalTypes, setSelectedJournalTypes] = useState<string[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);

  // Form state
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
    rank: '',
  });

  const handleDutyOfficerChange = (officerId: string) => {
    const officer = mockOfficers.find(o => o.id === parseInt(officerId));
    if (officer) {
      setFormData({
        ...formData,
        duty_officer: officerId,
        force_number: officer.force_number,
        rank: officer.rank_id,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.activity || !formData.state_of_prisoners || !formData.state_of_prison ||
        !formData.force_number || !formData.journal_date || !formData.station ||
        !formData.type_of_journal || !formData.duty_officer || !formData.rank) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (editingJournal) {
      // Update existing journal
      const updatedJournal: Journal = {
        ...editingJournal,
        is_active: formData.is_active,
        activity: formData.activity,
        state_of_prisoners: formData.state_of_prisoners,
        state_of_prison: formData.state_of_prison,
        remark: formData.remark,
        force_number: formData.force_number,
        journal_date: formData.journal_date,
        station: formData.station,
        type_of_journal: formData.type_of_journal,
        duty_officer: parseInt(formData.duty_officer),
        rank: formData.rank,
      };

      setJournals(journals.map(j => j.id === editingJournal.id ? updatedJournal : j));
      toast.success('Journal updated successfully');
    } else {
      // Create new journal
      const newJournal: Journal = {
        id: Date.now().toString(),
        is_active: formData.is_active,
        activity: formData.activity,
        state_of_prisoners: formData.state_of_prisoners,
        state_of_prison: formData.state_of_prison,
        remark: formData.remark,
        force_number: formData.force_number,
        journal_date: formData.journal_date,
        station: formData.station,
        type_of_journal: formData.type_of_journal,
        duty_officer: parseInt(formData.duty_officer),
        rank: formData.rank,
      };

      setJournals([newJournal, ...journals]);
      toast.success('Journal created successfully');
    }

    setDialogOpen(false);
    setLoading(false);
    resetForm();
  };

  const handleEdit = (journal: Journal) => {
    setEditingJournal(journal);
    setFormData({
      is_active: journal.is_active,
      activity: journal.activity,
      state_of_prisoners: journal.state_of_prisoners,
      state_of_prison: journal.state_of_prison,
      remark: journal.remark || '',
      force_number: journal.force_number,
      journal_date: journal.journal_date,
      station: journal.station,
      type_of_journal: journal.type_of_journal,
      duty_officer: journal.duty_officer.toString(),
      rank: journal.rank,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!journalToDelete) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setJournals(journals.filter(j => j.id !== journalToDelete));
    toast.success('Journal deleted successfully');
    setLoading(false);
    setDeleteDialogOpen(false);
    setJournalToDelete(null);
  };

  const resetForm = () => {
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
    });
  };

  const getStationName = (id: string) => mockStations.find(s => s.id === id)?.name || 'Unknown';
  const getJournalTypeName = (id: string) => mockJournalTypes.find(t => t.id === id)?.name || 'Unknown';
  const getOfficerName = (id: number) => mockOfficers.find(o => o.id === id)?.name || 'Unknown';
  const getRankName = (id: string) => mockRanks.find(r => r.id === id)?.name || 'Unknown';

  // Apply filters
  const filteredJournals = journals.filter(journal => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      journal.activity.toLowerCase().includes(searchLower) ||
      getStationName(journal.station).toLowerCase().includes(searchLower) ||
      getJournalTypeName(journal.type_of_journal).toLowerCase().includes(searchLower) ||
      getOfficerName(journal.duty_officer).toLowerCase().includes(searchLower) ||
      journal.force_number.toLowerCase().includes(searchLower);

    const matchesJournalType = selectedJournalTypes.length === 0 || 
      selectedJournalTypes.includes(journal.type_of_journal);

    const matchesStation = selectedStations.length === 0 || 
      selectedStations.includes(journal.station);

    return matchesSearch && matchesJournalType && matchesStation;
  });

  const toggleJournalType = (typeId: string) => {
    setSelectedJournalTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const toggleStation = (stationId: string) => {
    setSelectedStations(prev =>
      prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    );
  };

  const clearFilters = () => {
    setSelectedJournalTypes([]);
    setSelectedStations([]);
  };

  const activeFiltersCount = selectedJournalTypes.length + selectedStations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[#650000] mb-2">Journal Management</h1>
          <p className="text-muted-foreground">Record and manage station journals and reports</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Journal Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-[1300px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
            <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>
                {editingJournal ? 'Edit Journal Entry' : 'Add New Journal Entry'}
              </DialogTitle>
              <DialogDescription>
                {editingJournal 
                  ? 'Update the journal entry details below'
                  : 'Fill in the details for the new journal entry'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Is Active Switch */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Mark this journal entry as active
                    </p>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Journal Date */}
                  <div className="space-y-2">
                    <Label htmlFor="journal_date">
                      Journal Date <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="journal_date"
                        type="date"
                        className="pl-9"
                        value={formData.journal_date}
                        onChange={(e) => setFormData({ ...formData, journal_date: e.target.value })}
                        required
                      />
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
                        {mockStations.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Journal Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type_of_journal">
                      Journal Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.type_of_journal}
                      onValueChange={(value) => setFormData({ ...formData, type_of_journal: value })}
                      required
                    >
                      <SelectTrigger id="type_of_journal">
                        <SelectValue placeholder="Select journal type" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockJournalTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duty Officer */}
                  <div className="space-y-2">
                    <Label htmlFor="duty_officer">
                      Duty Officer <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.duty_officer}
                      onValueChange={handleDutyOfficerChange}
                      required
                    >
                      <SelectTrigger id="duty_officer">
                        <SelectValue placeholder="Select duty officer" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockOfficers.map((officer) => (
                          <SelectItem key={officer.id} value={officer.id.toString()}>
                            {officer.name} ({officer.force_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Force Number (Auto-populated) */}
                  <div className="space-y-2">
                    <Label htmlFor="force_number">
                      Force Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="force_number"
                      type="text"
                      value={formData.force_number}
                      readOnly
                      className="bg-muted"
                      placeholder="Auto-populated"
                    />
                  </div>

                  {/* Rank (Auto-populated) */}
                  <div className="space-y-2">
                    <Label htmlFor="rank">
                      Rank <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="rank"
                      type="text"
                      value={formData.rank ? getRankName(formData.rank) : ''}
                      readOnly
                      className="bg-muted"
                      placeholder="Auto-populated"
                    />
                  </div>
                </div>

                {/* Activity */}
                <div className="space-y-2">
                  <Label htmlFor="activity">
                    Activity <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="activity"
                    placeholder="Describe the activity or incident..."
                    rows={3}
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    required
                  />
                </div>

                {/* State of Prisoners */}
                <div className="space-y-2">
                  <Label htmlFor="state_of_prisoners">
                    State of Prisoners <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="state_of_prisoners"
                    placeholder="Describe the state and condition of prisoners..."
                    rows={3}
                    value={formData.state_of_prisoners}
                    onChange={(e) => setFormData({ ...formData, state_of_prisoners: e.target.value })}
                    required
                  />
                </div>

                {/* State of Prison */}
                <div className="space-y-2">
                  <Label htmlFor="state_of_prison">
                    State of Prison <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="state_of_prison"
                    placeholder="Describe the state and condition of the prison facility..."
                    rows={3}
                    value={formData.state_of_prison}
                    onChange={(e) => setFormData({ ...formData, state_of_prison: e.target.value })}
                    required
                  />
                </div>

                {/* Remark (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="remark">Remarks (Optional)</Label>
                  <Textarea
                    id="remark"
                    placeholder="Add any additional remarks..."
                    rows={2}
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading ? 'Saving...' : editingJournal ? 'Update Journal' : 'Create Journal'}
                </Button>
              </DialogFooter>
            </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Journals</CardDescription>
            <CardTitle className="text-3xl text-[#650000]">{journals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Journals</CardDescription>
            <CardTitle className="text-3xl text-[#650000]">
              {journals.filter(j => j.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-3xl text-[#650000]">
              {journals.filter(j => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(j.journal_date) >= weekAgo;
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl text-[#650000]">
              {journals.filter(j => {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return new Date(j.journal_date) >= monthAgo;
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>View and manage all journal entries</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search journals..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Multi-select Filters */}
              <div className="flex gap-2">
                {/* Journal Type Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                      <Filter className="mr-2 h-4 w-4" />
                      Journal Type
                      {selectedJournalTypes.length > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary">
                          {selectedJournalTypes.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Journal Type</h4>
                        {selectedJournalTypes.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedJournalTypes([])}
                            className="h-auto p-0 text-sm"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {mockJournalTypes.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type.id}`}
                              checked={selectedJournalTypes.includes(type.id)}
                              onCheckedChange={() => toggleJournalType(type.id)}
                            />
                            <label
                              htmlFor={`type-${type.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {type.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Station Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                      <Building2 className="mr-2 h-4 w-4" />
                      Station
                      {selectedStations.length > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary">
                          {selectedStations.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Station</h4>
                        {selectedStations.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStations([])}
                            className="h-auto p-0 text-sm"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {mockStations.map((station) => (
                          <div key={station.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`station-${station.id}`}
                              checked={selectedStations.includes(station.id)}
                              onCheckedChange={() => toggleStation(station.id)}
                            />
                            <label
                              htmlFor={`station-${station.id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {station.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Clear All Filters */}
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-1 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedJournalTypes.map(typeId => (
                <Badge key={typeId} variant="secondary" className="gap-1">
                  {getJournalTypeName(typeId)}
                  <button onClick={() => toggleJournalType(typeId)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedStations.map(stationId => (
                <Badge key={stationId} variant="secondary" className="gap-1">
                  {getStationName(stationId)}
                  <button onClick={() => toggleStation(stationId)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Journal Type</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Duty Officer</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJournals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                      {activeFiltersCount > 0 ? 'No journals match the selected filters' : 'No journals found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJournals.map((journal) => (
                    <TableRow key={journal.id}>
                      <TableCell>
                        <Badge variant={journal.is_active ? 'default' : 'secondary'}>
                          {journal.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{journal.journal_date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getJournalTypeName(journal.type_of_journal)}</Badge>
                      </TableCell>
                      <TableCell>{getStationName(journal.station)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{getOfficerName(journal.duty_officer)}</p>
                          <p className="text-xs text-muted-foreground font-mono">{journal.force_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRankName(journal.rank)}</TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate" title={journal.activity}>
                          {journal.activity}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(journal)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setJournalToDelete(journal.id);
                              setDeleteDialogOpen(true);
                            }}
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJournalToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

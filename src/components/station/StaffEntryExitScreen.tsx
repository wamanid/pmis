import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Search, Scan, CheckCircle2, XCircle, Clock, UserCheck, User, AlertCircle, Loader2, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

// Mock data for foreign key references
const mockStations = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Central Station' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'East Wing Station' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'West Wing Station' },
];

const mockStaffCategories = [
  { id: 'cat-001', name: 'Officer' },
  { id: 'cat-002', name: 'Guard' },
  { id: 'cat-003', name: 'Administrator' },
  { id: 'cat-004', name: 'Medical Staff' },
];

const mockStaffRanks = [
  { id: '990e8400-e29b-41d4-a716-446655440001', name: 'Commissioner' },
  { id: '990e8400-e29b-41d4-a716-446655440002', name: 'Assistant Commissioner' },
  { id: '990e8400-e29b-41d4-a716-446655440003', name: 'Senior Superintendent' },
  { id: '990e8400-e29b-41d4-a716-446655440004', name: 'Superintendent' },
  { id: '990e8400-e29b-41d4-a716-446655440005', name: 'Assistant Superintendent' },
  { id: '990e8400-e29b-41d4-a716-446655440006', name: 'Officer' },
];

// Mock staff database
const mockStaffDatabase = [
  {
    staff_id: 1,
    force_number: 'UPS001234',
    full_name: 'John Musoke',
    category: 'cat-001',
    rank: '990e8400-e29b-41d4-a716-446655440004',
  },
  {
    staff_id: 2,
    force_number: 'UPS005678',
    full_name: 'Sarah Nakato',
    category: 'cat-002',
    rank: '990e8400-e29b-41d4-a716-446655440006',
  },
  {
    staff_id: 3,
    force_number: 'UPS009012',
    full_name: 'David Okello',
    category: 'cat-003',
    rank: '990e8400-e29b-41d4-a716-446655440005',
  },
  {
    staff_id: 4,
    force_number: 'UPS003456',
    full_name: 'Grace Nabirye',
    category: 'cat-004',
    rank: '990e8400-e29b-41d4-a716-446655440006',
  },
];

interface StaffEntryExit {
  id: string;
  is_active: boolean;
  staff_name: string;
  staff_force_number: string;
  staff_category: string;
  time_in: string;
  time_out?: string;
  remark?: string;
  attendance_type: 'PRESENT' | 'ABSENT';
  station: string;
  staff: number;
  staff_rank: string;
  gate_keeper: number;
  date: string;
}

// Mock existing records
const mockRecords: StaffEntryExit[] = [
  {
    id: '1',
    is_active: true,
    staff_name: 'John Musoke',
    staff_force_number: 'UPS001234',
    staff_category: 'cat-001',
    time_in: '08:00',
    time_out: '17:00',
    remark: 'Regular shift',
    attendance_type: 'PRESENT',
    station: '550e8400-e29b-41d4-a716-446655440001',
    staff: 1,
    staff_rank: '990e8400-e29b-41d4-a716-446655440004',
    gate_keeper: 100,
    date: '2025-10-16',
  },
  {
    id: '2',
    is_active: true,
    staff_name: 'Sarah Nakato',
    staff_force_number: 'UPS005678',
    staff_category: 'cat-002',
    time_in: '08:30',
    remark: 'Morning patrol',
    attendance_type: 'PRESENT',
    station: '550e8400-e29b-41d4-a716-446655440002',
    staff: 2,
    staff_rank: '990e8400-e29b-41d4-a716-446655440006',
    gate_keeper: 100,
    date: '2025-10-16',
  },
];

export function StaffEntryExitScreen() {
  const [records, setRecords] = useState<StaffEntryExit[]>(mockRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [staffDetails, setStaffDetails] = useState<any>(null);
  const [barcode, setBarcode] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    station: '',
    time_out: '',
    remark: '',
    attendance_type: 'PRESENT' as 'PRESENT' | 'ABSENT',
  });

  // Mock function to fetch staff details from backend
  const fetchStaffDetails = async (forceNumber: string) => {
    setScanning(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const staff = mockStaffDatabase.find(
      s => s.force_number.toLowerCase() === forceNumber.toLowerCase()
    );
    
    setScanning(false);
    
    if (staff) {
      setStaffDetails(staff);
      toast.success('Staff details retrieved successfully');
      return staff;
    } else {
      toast.error('Staff not found. Please check the force number.');
      return null;
    }
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) {
      toast.error('Please enter a force number');
      return;
    }
    await fetchStaffDetails(barcode.trim());
  };

  const handleConfirmEntry = async () => {
    if (!staffDetails) {
      toast.error('No staff details available');
      return;
    }

    if (!formData.station) {
      toast.error('Please select a station');
      return;
    }

    setLoading(true);
    
    // Simulate API call to save record
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const newRecord: StaffEntryExit = {
      id: Date.now().toString(),
      is_active: true,
      staff_name: staffDetails.full_name,
      staff_force_number: staffDetails.force_number,
      staff_category: staffDetails.category,
      time_in: currentTime,
      time_out: formData.time_out || undefined,
      remark: formData.remark || undefined,
      attendance_type: formData.attendance_type,
      station: formData.station,
      staff: staffDetails.staff_id,
      staff_rank: staffDetails.rank,
      gate_keeper: 100, // Current logged in user
      date: now.toISOString().split('T')[0],
    };

    setRecords([newRecord, ...records]);
    setDialogOpen(false);
    setLoading(false);
    toast.success('Staff entry recorded successfully');
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setBarcode('');
    setStaffDetails(null);
    setFormData({
      station: '',
      time_out: '',
      remark: '',
      attendance_type: 'PRESENT',
    });
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setRecords(records.filter(r => r.id !== recordToDelete));
    toast.success('Record deleted successfully');
    setLoading(false);
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const getStationName = (id: string) => mockStations.find(s => s.id === id)?.name || 'Unknown';
  const getCategoryName = (id: string) => mockStaffCategories.find(c => c.id === id)?.name || 'Unknown';
  const getRankName = (id: string) => mockStaffRanks.find(r => r.id === id)?.name || 'Unknown';

  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.staff_name.toLowerCase().includes(searchLower) ||
      record.staff_force_number.toLowerCase().includes(searchLower) ||
      getStationName(record.station).toLowerCase().includes(searchLower) ||
      getCategoryName(record.staff_category).toLowerCase().includes(searchLower)
    );
  });

  const presentCount = records.filter(r => r.attendance_type === 'PRESENT').length;
  const absentCount = records.filter(r => r.attendance_type === 'ABSENT').length;
  const activeStaffCount = records.filter(r => !r.time_out).length;

  // Auto-focus barcode input when dialog opens
  useEffect(() => {
    if (dialogOpen && barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  }, [dialogOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[#650000] mb-2">Staff Entry & Exit</h1>
          <p className="text-muted-foreground">Track staff attendance and movements</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Record Entry/Exit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Staff Entry/Exit</DialogTitle>
              <DialogDescription>
                Scan staff barcode or enter force number to record attendance
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Barcode Scanner Section */}
              {!staffDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Scan className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-900">
                      Scan staff barcode or manually enter force number below
                    </p>
                  </div>

                  <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Force Number / Barcode</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            ref={barcodeInputRef}
                            id="barcode"
                            type="text"
                            placeholder="Enter or scan force number"
                            className="pl-9"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            disabled={scanning}
                            autoFocus
                          />
                        </div>
                        <Button type="submit" disabled={scanning || !barcode.trim()}>
                          {scanning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Fetching...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              Fetch
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>

                  {/* Sample Force Numbers */}
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm mb-2">Sample Force Numbers for Testing:</p>
                    <div className="flex flex-wrap gap-2">
                      {mockStaffDatabase.map((staff) => (
                        <Badge
                          key={staff.staff_id}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-white"
                          onClick={() => {
                            setBarcode(staff.force_number);
                            fetchStaffDetails(staff.force_number);
                          }}
                        >
                          {staff.force_number}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Staff Details Display (Non-editable) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-900">
                        Staff details verified and loaded
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                      <div>
                        <Label className="text-muted-foreground text-xs">Full Name</Label>
                        <p className="mt-1">{staffDetails.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Force Number</Label>
                        <p className="mt-1">{staffDetails.force_number}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Category</Label>
                        <p className="mt-1">{getCategoryName(staffDetails.category)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Rank</Label>
                        <p className="mt-1">{getRankName(staffDetails.rank)}</p>
                      </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="space-y-4 pt-4 border-t">
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

                      <div className="space-y-2">
                        <Label htmlFor="attendance_type">
                          Attendance Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.attendance_type}
                          onValueChange={(value: 'PRESENT' | 'ABSENT') => 
                            setFormData({ ...formData, attendance_type: value })
                          }
                        >
                          <SelectTrigger id="attendance_type">
                            <SelectValue />
                          </SelectTrigger>
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time_out">Time Out (Optional)</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="time_out"
                            type="time"
                            className="pl-9"
                            value={formData.time_out}
                            onChange={(e) => setFormData({ ...formData, time_out: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="remark">Remarks (Optional)</Label>
                        <Textarea
                          id="remark"
                          placeholder="Enter any remarks..."
                          rows={3}
                          value={formData.remark}
                          onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
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
              {staffDetails && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Scan Another
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmEntry}
                    disabled={loading || !formData.station}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirm Entry
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Records</CardDescription>
            <CardTitle className="text-3xl text-[#650000]">{records.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Present Today</CardDescription>
            <CardTitle className="text-3xl text-green-600">{presentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Absent Today</CardDescription>
            <CardTitle className="text-3xl text-red-600">{absentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Currently On Duty</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{activeStaffCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Staff Entry & Exit Records</CardTitle>
              <CardDescription>View and manage staff attendance records</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
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
                  <TableHead>Date</TableHead>
                  <TableHead>Force Number</TableHead>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground h-24">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{record.staff_force_number}</span>
                      </TableCell>
                      <TableCell>{record.staff_name}</TableCell>
                      <TableCell>{getCategoryName(record.staff_category)}</TableCell>
                      <TableCell>{getRankName(record.staff_rank)}</TableCell>
                      <TableCell>{getStationName(record.station)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {record.time_in}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.time_out ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {record.time_out}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={record.attendance_type === 'PRESENT' ? 'default' : 'destructive'}
                          className={
                            record.attendance_type === 'PRESENT'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : ''
                          }
                        >
                          {record.attendance_type === 'PRESENT' ? (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Present
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Absent
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.remark ? (
                          <span className="text-sm">{record.remark}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRecordToDelete(record.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
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
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this staff entry/exit record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
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

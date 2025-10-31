import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  UserPlus,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Prisoner {
  id: string;
  prisoner_name: string;
  working_party_name: string;
  destination: string;
  time_out: string;
  time_in: string | null;
  reason: string;
  prisoner: string;
  gate_pass: string;
  working_party: string | null;
}

interface Escort {
  id: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  rank: string;
  force_number: string;
  gate_pass: string;
}

interface GatePass {
  id: string;
  gate_keeper_username: string;
  gate_pass_type_name: string;
  prisoners: Prisoner[];
  escorts: Escort[];
  destination: string;
  main_gate_required: boolean;
  exception_reason: string;
  remarks: string;
  gate_keeper: number;
  gate_pass_type: string;
  created_at?: string;
  status?: 'active' | 'completed' | 'pending';
}

interface PrisonerRecord {
  id: string;
  full_name: string;
  prisoner_number: string;
  category: string;
}

interface WorkingParty {
  id: string;
  name: string;
  description: string;
}

interface GatePassType {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  full_name: string;
  rank: string;
  force_number: string;
}

// Mock Data
const mockGatePasses: GatePass[] = [
  {
    id: '1',
    gate_keeper_username: 'officer_john',
    gate_pass_type_name: 'Court Appearance',
    prisoners: [
      {
        id: 'p1',
        prisoner_name: 'John Doe',
        working_party_name: '',
        destination: 'District Court',
        time_out: '2025-10-28T08:00:00Z',
        time_in: '2025-10-28T14:30:00Z',
        reason: 'Court hearing',
        prisoner: 'pr1',
        gate_pass: '1',
        working_party: null
      }
    ],
    escorts: [
      {
        id: 'e1',
        full_name: 'Sgt. James Wilson',
        first_name: 'James',
        middle_name: '',
        last_name: 'Wilson',
        rank: 'Sergeant',
        force_number: 'PS-45678',
        gate_pass: '1'
      }
    ],
    destination: 'District Court',
    main_gate_required: true,
    exception_reason: '',
    remarks: 'Scheduled court hearing for case #2024/567',
    gate_keeper: 1,
    gate_pass_type: 'gpt1',
    created_at: '2025-10-28T07:00:00Z',
    status: 'completed'
  },
  {
    id: '2',
    gate_keeper_username: 'officer_mary',
    gate_pass_type_name: 'Hospital Visit',
    prisoners: [
      {
        id: 'p2',
        prisoner_name: 'Michael Smith',
        working_party_name: '',
        destination: 'General Hospital',
        time_out: '2025-10-28T09:30:00Z',
        time_in: null,
        reason: 'Medical emergency',
        prisoner: 'pr2',
        gate_pass: '2',
        working_party: null
      }
    ],
    escorts: [
      {
        id: 'e2',
        full_name: 'Cpl. Sarah Johnson',
        first_name: 'Sarah',
        middle_name: '',
        last_name: 'Johnson',
        rank: 'Corporal',
        force_number: 'PS-34567',
        gate_pass: '2'
      },
      {
        id: 'e3',
        full_name: 'PC. Robert Brown',
        first_name: 'Robert',
        middle_name: '',
        last_name: 'Brown',
        rank: 'Police Constable',
        force_number: 'PS-23456',
        gate_pass: '2'
      }
    ],
    destination: 'General Hospital',
    main_gate_required: true,
    exception_reason: '',
    remarks: 'Emergency medical attention required',
    gate_keeper: 2,
    gate_pass_type: 'gpt2',
    created_at: '2025-10-28T09:00:00Z',
    status: 'active'
  },
  {
    id: '3',
    gate_keeper_username: 'officer_peter',
    gate_pass_type_name: 'Working Party',
    prisoners: [
      {
        id: 'p3',
        prisoner_name: 'David Wilson',
        working_party_name: 'Farm Labor',
        destination: 'Prison Farm',
        time_out: '2025-10-28T06:00:00Z',
        time_in: '2025-10-28T15:00:00Z',
        reason: 'Daily farm work',
        prisoner: 'pr3',
        gate_pass: '3',
        working_party: 'wp1'
      },
      {
        id: 'p4',
        prisoner_name: 'Thomas Anderson',
        working_party_name: 'Farm Labor',
        destination: 'Prison Farm',
        time_out: '2025-10-28T06:00:00Z',
        time_in: '2025-10-28T15:00:00Z',
        reason: 'Daily farm work',
        prisoner: 'pr4',
        gate_pass: '3',
        working_party: 'wp1'
      }
    ],
    escorts: [
      {
        id: 'e4',
        full_name: 'Sgt. William Davis',
        first_name: 'William',
        middle_name: '',
        last_name: 'Davis',
        rank: 'Sergeant',
        force_number: 'PS-56789',
        gate_pass: '3'
      }
    ],
    destination: 'Prison Farm',
    main_gate_required: false,
    exception_reason: 'Internal movement',
    remarks: 'Daily working party - routine farm duties',
    gate_keeper: 3,
    gate_pass_type: 'gpt3',
    created_at: '2025-10-28T05:30:00Z',
    status: 'completed'
  }
];

const mockPrisonerRecords: PrisonerRecord[] = [
  { id: 'pr1', full_name: 'John Doe', prisoner_number: 'PN-2024-001', category: 'Remand' },
  { id: 'pr2', full_name: 'Michael Smith', prisoner_number: 'PN-2024-002', category: 'Convict' },
  { id: 'pr3', full_name: 'David Wilson', prisoner_number: 'PN-2024-003', category: 'Convict' },
  { id: 'pr4', full_name: 'Thomas Anderson', prisoner_number: 'PN-2024-004', category: 'Convict' },
  { id: 'pr5', full_name: 'James Taylor', prisoner_number: 'PN-2024-005', category: 'Awaiting Trial' }
];

const mockWorkingParties: WorkingParty[] = [
  { id: 'wp1', name: 'Farm Labor', description: 'Agricultural work at prison farm' },
  { id: 'wp2', name: 'Kitchen Duty', description: 'Food preparation and kitchen maintenance' },
  { id: 'wp3', name: 'Maintenance', description: 'General prison maintenance work' },
  { id: 'wp4', name: 'Laundry', description: 'Laundry and cleaning services' }
];

const mockGatePassTypes: GatePassType[] = [
  { id: 'gpt1', name: 'Court Appearance', description: 'Prisoner transport to court' },
  { id: 'gpt2', name: 'Hospital Visit', description: 'Medical treatment outside facility' },
  { id: 'gpt3', name: 'Working Party', description: 'Supervised work detail' },
  { id: 'gpt4', name: 'Transfer', description: 'Transfer to another facility' },
  { id: 'gpt5', name: 'Family Emergency', description: 'Compassionate leave' }
];

const mockUsers: User[] = [
  { id: 1, username: 'officer_john', full_name: 'John Smith', rank: 'Inspector', force_number: 'PS-12345' },
  { id: 2, username: 'officer_mary', full_name: 'Mary Johnson', rank: 'Sergeant', force_number: 'PS-23456' },
  { id: 3, username: 'officer_peter', full_name: 'Peter Williams', rank: 'Sergeant', force_number: 'PS-34567' }
];

const mockEscortStaff: User[] = [
  { id: 4, username: 'escort_james', full_name: 'James Wilson', rank: 'Sergeant', force_number: 'PS-45678' },
  { id: 5, username: 'escort_sarah', full_name: 'Sarah Johnson', rank: 'Corporal', force_number: 'PS-34567' },
  { id: 6, username: 'escort_robert', full_name: 'Robert Brown', rank: 'Police Constable', force_number: 'PS-23456' },
  { id: 7, username: 'escort_william', full_name: 'William Davis', rank: 'Sergeant', force_number: 'PS-56789' },
  { id: 8, username: 'escort_lisa', full_name: 'Lisa Anderson', rank: 'Corporal', force_number: 'PS-67890' }
];

export default function GatePassScreen() {
  const [gatePasses, setGatePasses] = useState<GatePass[]>(mockGatePasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    gate_pass_type: '',
    destination: '',
    main_gate_required: true,
    exception_reason: '',
    remarks: ''
  });

  const [selectedPrisoners, setSelectedPrisoners] = useState<Array<{
    prisoner_id: string;
    working_party_id: string | null;
    destination: string;
    reason: string;
    time_out: string;
    time_in: string;
  }>>([]);

  const [selectedEscorts, setSelectedEscorts] = useState<string[]>([]);

  const itemsPerPage = 10;

  // Filter gate passes
  const filteredGatePasses = gatePasses.filter(gatePass => {
    const matchesSearch = 
      gatePass.gate_keeper_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatePass.gate_pass_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatePass.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatePass.prisoners.some(p => p.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || gatePass.status === statusFilter;
    const matchesType = typeFilter === 'all' || gatePass.gate_pass_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredGatePasses.length / itemsPerPage);
  const paginatedGatePasses = filteredGatePasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateGatePass = () => {
    setDialogMode('create');
    setFormData({
      gate_pass_type: '',
      destination: '',
      main_gate_required: true,
      exception_reason: '',
      remarks: ''
    });
    setSelectedPrisoners([]);
    setSelectedEscorts([]);
    setIsDialogOpen(true);
  };

  const handleEditGatePass = (gatePass: GatePass) => {
    setDialogMode('edit');
    setSelectedGatePass(gatePass);
    setFormData({
      gate_pass_type: gatePass.gate_pass_type,
      destination: gatePass.destination,
      main_gate_required: gatePass.main_gate_required,
      exception_reason: gatePass.exception_reason,
      remarks: gatePass.remarks
    });
    setSelectedPrisoners(gatePass.prisoners.map(p => ({
      prisoner_id: p.prisoner,
      working_party_id: p.working_party,
      destination: p.destination,
      reason: p.reason,
      time_out: p.time_out,
      time_in: p.time_in || ''
    })));
    setSelectedEscorts(gatePass.escorts.map(e => e.force_number));
    setIsDialogOpen(true);
  };

  const handleViewGatePass = (gatePass: GatePass) => {
    setSelectedGatePass(gatePass);
    setIsViewDialogOpen(true);
  };

  const handleDeleteGatePass = (id: string) => {
    if (confirm('Are you sure you want to delete this gate pass?')) {
      setGatePasses(gatePasses.filter(gp => gp.id !== id));
      toast.success('Gate pass deleted successfully');
    }
  };

  const handleSubmit = () => {
    if (!formData.gate_pass_type || !formData.destination || selectedPrisoners.length === 0 || selectedEscorts.length === 0) {
      toast.error('Please fill all required fields including at least one prisoner and one escort');
      return;
    }

    const gatePassType = mockGatePassTypes.find(t => t.id === formData.gate_pass_type);
    const currentUser = mockUsers[0];

    const newGatePass: GatePass = {
      id: dialogMode === 'create' ? `gp-${Date.now()}` : selectedGatePass!.id,
      gate_keeper_username: currentUser.username,
      gate_pass_type_name: gatePassType?.name || '',
      prisoners: selectedPrisoners.map((sp, idx) => {
        const prisoner = mockPrisonerRecords.find(p => p.id === sp.prisoner_id);
        const workingParty = sp.working_party_id ? mockWorkingParties.find(wp => wp.id === sp.working_party_id) : null;
        return {
          id: dialogMode === 'create' ? `p-${Date.now()}-${idx}` : selectedGatePass!.prisoners[idx]?.id || `p-${Date.now()}-${idx}`,
          prisoner_name: prisoner?.full_name || '',
          working_party_name: workingParty?.name || '',
          destination: sp.destination,
          time_out: sp.time_out || new Date().toISOString(),
          time_in: sp.time_in || null,
          reason: sp.reason,
          prisoner: sp.prisoner_id,
          gate_pass: dialogMode === 'create' ? `gp-${Date.now()}` : selectedGatePass!.id,
          working_party: sp.working_party_id
        };
      }),
      escorts: selectedEscorts.map((forceNumber, idx) => {
        const staff = mockEscortStaff.find(s => s.force_number === forceNumber);
        return {
          id: dialogMode === 'create' ? `e-${Date.now()}-${idx}` : selectedGatePass!.escorts[idx]?.id || `e-${Date.now()}-${idx}`,
          full_name: staff?.full_name || '',
          first_name: staff?.full_name.split(' ')[0] || '',
          middle_name: '',
          last_name: staff?.full_name.split(' ')[1] || '',
          rank: staff?.rank || '',
          force_number: forceNumber,
          gate_pass: dialogMode === 'create' ? `gp-${Date.now()}` : selectedGatePass!.id
        };
      }),
      destination: formData.destination,
      main_gate_required: formData.main_gate_required,
      exception_reason: formData.exception_reason,
      remarks: formData.remarks,
      gate_keeper: currentUser.id,
      gate_pass_type: formData.gate_pass_type,
      created_at: dialogMode === 'create' ? new Date().toISOString() : selectedGatePass!.created_at,
      status: 'active'
    };

    if (dialogMode === 'create') {
      setGatePasses([newGatePass, ...gatePasses]);
      toast.success('Gate pass created successfully');
    } else {
      setGatePasses(gatePasses.map(gp => gp.id === selectedGatePass!.id ? newGatePass : gp));
      toast.success('Gate pass updated successfully');
    }

    setIsDialogOpen(false);
  };

  const addPrisonerRow = () => {
    setSelectedPrisoners([...selectedPrisoners, {
      prisoner_id: '',
      working_party_id: null,
      destination: formData.destination,
      reason: '',
      time_out: new Date().toISOString().slice(0, 16),
      time_in: ''
    }]);
  };

  const removePrisonerRow = (index: number) => {
    setSelectedPrisoners(selectedPrisoners.filter((_, i) => i !== index));
  };

  const updatePrisonerRow = (index: number, field: string, value: string) => {
    const updated = [...selectedPrisoners];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedPrisoners(updated);
  };

  const addEscort = () => {
    setSelectedEscorts([...selectedEscorts, '']);
  };

  const removeEscort = (index: number) => {
    setSelectedEscorts(selectedEscorts.filter((_, i) => i !== index));
  };

  const updateEscort = (index: number, forceNumber: string) => {
    const updated = [...selectedEscorts];
    updated[index] = forceNumber;
    setSelectedEscorts(updated);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-600">Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: '#650000' }}>Automated Gate Management</h1>
          <p className="text-gray-600">Manage gate passes, prisoner movements, and escort teams</p>
        </div>
        <Button 
          onClick={handleCreateGatePass}
          style={{ backgroundColor: '#650000' }}
          className="hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Gate Pass
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Gate Passes</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {gatePasses.filter(gp => gp.status === 'active').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {gatePasses.filter(gp => gp.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prisoners Out</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {gatePasses.filter(gp => gp.status === 'active').reduce((sum, gp) => sum + gp.prisoners.length, 0)}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Escorts on Duty</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {gatePasses.filter(gp => gp.status === 'active').reduce((sum, gp) => sum + gp.escorts.length, 0)}
                </p>
              </div>
              <Shield className="h-8 w-8" style={{ color: '#650000' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by gatekeeper, prisoner, type, or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {mockGatePassTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gate Passes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gate Passes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gate Pass Type</TableHead>
                  <TableHead>Gatekeeper</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Prisoners</TableHead>
                  <TableHead>Escorts</TableHead>
                  <TableHead>Main Gate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGatePasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No gate passes found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedGatePasses.map((gatePass) => (
                    <TableRow key={gatePass.id}>
                      <TableCell>{gatePass.gate_pass_type_name}</TableCell>
                      <TableCell>{gatePass.gate_keeper_username}</TableCell>
                      <TableCell>{gatePass.destination}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{gatePass.prisoners.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{gatePass.escorts.length}</Badge>
                      </TableCell>
                      <TableCell>
                        {gatePass.main_gate_required ? (
                          <Badge className="bg-green-600">Required</Badge>
                        ) : (
                          <Badge variant="outline">Not Required</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(gatePass.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {gatePass.created_at ? formatDateTime(gatePass.created_at) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewGatePass(gatePass)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGatePass(gatePass)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGatePass(gatePass.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredGatePasses.length)} of {filteredGatePasses.length} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>
              {dialogMode === 'create' ? 'Create Gate Pass' : 'Edit Gate Pass'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' 
                ? 'Create a new gate pass for prisoner movement with escort team details'
                : 'Update the gate pass information, prisoners, and escort team'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General Information</TabsTrigger>
              <TabsTrigger value="prisoners">Prisoners</TabsTrigger>
              <TabsTrigger value="escorts">Escort Team</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gate Pass Type *</Label>
                  <Select 
                    value={formData.gate_pass_type}
                    onValueChange={(value) => setFormData({ ...formData, gate_pass_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gate pass type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockGatePassTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Destination *</Label>
                  <Input
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="Enter destination"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.main_gate_required}
                  onCheckedChange={(checked) => setFormData({ ...formData, main_gate_required: checked })}
                />
                <Label>Main Gate Required</Label>
              </div>

              {!formData.main_gate_required && (
                <div className="space-y-2">
                  <Label>Exception Reason</Label>
                  <Textarea
                    value={formData.exception_reason}
                    onChange={(e) => setFormData({ ...formData, exception_reason: e.target.value })}
                    placeholder="Provide reason for not using main gate"
                    rows={2}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional remarks or instructions"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="prisoners" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <Label>Prisoners on Gate Pass *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPrisonerRow}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prisoner
                </Button>
              </div>

              {selectedPrisoners.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No prisoners added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPrisonerRow}
                    className="mt-2"
                  >
                    Add First Prisoner
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPrisoners.map((prisoner, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-sm">Prisoner #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrisonerRow(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Prisoner *</Label>
                            <Select
                              value={prisoner.prisoner_id}
                              onValueChange={(value) => updatePrisonerRow(index, 'prisoner_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select prisoner" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockPrisonerRecords.map(pr => (
                                  <SelectItem key={pr.id} value={pr.id}>
                                    {pr.full_name} ({pr.prisoner_number})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Working Party (Optional)</Label>
                            <Select
                              value={prisoner.working_party_id || 'none'}
                              onValueChange={(value) => updatePrisonerRow(index, 'working_party_id', value === 'none' ? null : value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select working party" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {mockWorkingParties.map(wp => (
                                  <SelectItem key={wp.id} value={wp.id}>
                                    {wp.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Destination</Label>
                            <Input
                              value={prisoner.destination}
                              onChange={(e) => updatePrisonerRow(index, 'destination', e.target.value)}
                              placeholder="Specific destination"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Reason *</Label>
                            <Input
                              value={prisoner.reason}
                              onChange={(e) => updatePrisonerRow(index, 'reason', e.target.value)}
                              placeholder="Reason for movement"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Time Out *</Label>
                            <Input
                              type="datetime-local"
                              value={prisoner.time_out ? new Date(prisoner.time_out).toISOString().slice(0, 16) : ''}
                              onChange={(e) => updatePrisonerRow(index, 'time_out', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Time In</Label>
                            <Input
                              type="datetime-local"
                              value={prisoner.time_in ? new Date(prisoner.time_in).toISOString().slice(0, 16) : ''}
                              onChange={(e) => updatePrisonerRow(index, 'time_in', e.target.value ? new Date(e.target.value).toISOString() : '')}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="escorts" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <Label>Escort Team *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEscort}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Escort
                </Button>
              </div>

              {selectedEscorts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No escorts assigned yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEscort}
                    className="mt-2"
                  >
                    Add First Escort
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEscorts.map((forceNumber, index) => {
                    const staff = mockEscortStaff.find(s => s.force_number === forceNumber);
                    return (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <Select
                                value={forceNumber}
                                onValueChange={(value) => updateEscort(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select escort officer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockEscortStaff.map(staff => (
                                    <SelectItem key={staff.force_number} value={staff.force_number}>
                                      {staff.rank} {staff.full_name} ({staff.force_number})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEscort(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {staff && (
                            <div className="ml-8 mt-2 text-sm text-gray-600">
                              <p>Rank: {staff.rank}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              style={{ backgroundColor: '#650000' }}
              className="hover:opacity-90"
            >
              {dialogMode === 'create' ? 'Create Gate Pass' : 'Update Gate Pass'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>Gate Pass Details</DialogTitle>
            <DialogDescription>
              View complete gate pass information including prisoners and escort team
            </DialogDescription>
          </DialogHeader>

          {selectedGatePass && (
            <div className="space-y-6">
              {/* General Information */}
              <div>
                <h3 className="mb-3" style={{ color: '#650000' }}>General Information</h3>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Gate Pass Type</Label>
                        <p>{selectedGatePass.gate_pass_type_name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedGatePass.status)}</div>
                      </div>
                      <div>
                        <Label className="text-gray-600">Gatekeeper</Label>
                        <p>{selectedGatePass.gate_keeper_username}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Created</Label>
                        <p>{selectedGatePass.created_at ? formatDateTime(selectedGatePass.created_at) : '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-gray-600">Destination</Label>
                        <p>{selectedGatePass.destination}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-gray-600">Main Gate Required</Label>
                        <p>{selectedGatePass.main_gate_required ? 'Yes' : 'No'}</p>
                      </div>
                      {selectedGatePass.exception_reason && (
                        <div className="col-span-2">
                          <Label className="text-gray-600">Exception Reason</Label>
                          <p>{selectedGatePass.exception_reason}</p>
                        </div>
                      )}
                      {selectedGatePass.remarks && (
                        <div className="col-span-2">
                          <Label className="text-gray-600">Remarks</Label>
                          <p>{selectedGatePass.remarks}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Prisoners */}
              <div>
                <h3 className="mb-3" style={{ color: '#650000' }}>
                  Prisoners ({selectedGatePass.prisoners.length})
                </h3>
                <div className="space-y-2">
                  {selectedGatePass.prisoners.map((prisoner) => (
                    <Card key={prisoner.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <UserPlus className="h-4 w-4 text-gray-400" />
                              <p>{prisoner.prisoner_name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              {prisoner.working_party_name && (
                                <div>
                                  <Label className="text-xs">Working Party</Label>
                                  <p>{prisoner.working_party_name}</p>
                                </div>
                              )}
                              <div>
                                <Label className="text-xs">Destination</Label>
                                <p>{prisoner.destination}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Reason</Label>
                                <p>{prisoner.reason}</p>
                              </div>
                              <div>
                                <Label className="text-xs">Time Out</Label>
                                <p>{formatDateTime(prisoner.time_out)}</p>
                              </div>
                              {prisoner.time_in && (
                                <div>
                                  <Label className="text-xs">Time In</Label>
                                  <p>{formatDateTime(prisoner.time_in)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          {prisoner.time_in ? (
                            <Badge className="bg-green-600">Returned</Badge>
                          ) : (
                            <Badge className="bg-blue-600">Out</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Escorts */}
              <div>
                <h3 className="mb-3" style={{ color: '#650000' }}>
                  Escort Team ({selectedGatePass.escorts.length})
                </h3>
                <div className="space-y-2">
                  {selectedGatePass.escorts.map((escort) => (
                    <Card key={escort.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p>{escort.full_name}</p>
                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                              <span>Rank: {escort.rank}</span>
                              <span>Force #: {escort.force_number}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

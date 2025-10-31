import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Search, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Users,
  LogIn,
  LogOut,
  Clock
} from 'lucide-react';

interface PrisonerGatePass {
  id: string;
  prisoner_name: string;
  working_party_name: string;
  destination: string;
  time_out: string | null;
  time_in: string | null;
  reason: string;
  prisoner: string;
  gate_pass: string;
  working_party: string | null;
}

interface GatePassDetail {
  id: string;
  gate_keeper_username: string;
  gate_pass_type_name: string;
  destination: string;
  main_gate_required: boolean;
  exception_reason: string;
  remarks: string;
  created_at: string;
  status: string;
}

interface WorkingPartyDetail {
  id: string;
  name: string;
  description: string;
  capacity: number;
  current_members: number;
}

interface PrisonerDetail {
  id: string;
  full_name: string;
  prisoner_number: string;
  category: string;
  date_of_birth: string;
  gender: string;
}

// Mock Data
const mockPrisonerGatePasses: PrisonerGatePass[] = [
  {
    id: '1',
    prisoner_name: 'John Doe',
    working_party_name: '',
    destination: 'District Court',
    time_out: '2025-10-28T08:00:00Z',
    time_in: '2025-10-28T14:30:00Z',
    reason: 'Court hearing',
    prisoner: 'pr1',
    gate_pass: 'gp1',
    working_party: null
  },
  {
    id: '2',
    prisoner_name: 'Michael Smith',
    working_party_name: '',
    destination: 'General Hospital',
    time_out: '2025-10-28T09:30:00Z',
    time_in: null,
    reason: 'Medical emergency',
    prisoner: 'pr2',
    gate_pass: 'gp2',
    working_party: null
  },
  {
    id: '3',
    prisoner_name: 'David Wilson',
    working_party_name: 'Farm Labor',
    destination: 'Prison Farm',
    time_out: '2025-10-28T06:00:00Z',
    time_in: '2025-10-28T15:00:00Z',
    reason: 'Daily farm work',
    prisoner: 'pr3',
    gate_pass: 'gp3',
    working_party: 'wp1'
  },
  {
    id: '4',
    prisoner_name: 'Thomas Anderson',
    working_party_name: 'Farm Labor',
    destination: 'Prison Farm',
    time_out: '2025-10-28T06:00:00Z',
    time_in: '2025-10-28T15:00:00Z',
    reason: 'Daily farm work',
    prisoner: 'pr4',
    gate_pass: 'gp3',
    working_party: 'wp1'
  },
  {
    id: '5',
    prisoner_name: 'James Taylor',
    working_party_name: 'Kitchen Duty',
    destination: 'Main Kitchen',
    time_out: null,
    time_in: null,
    reason: 'Kitchen work',
    prisoner: 'pr5',
    gate_pass: 'gp4',
    working_party: 'wp2'
  },
  {
    id: '6',
    prisoner_name: 'Robert Martinez',
    working_party_name: '',
    destination: 'Central Police Station',
    time_out: '2025-10-28T10:00:00Z',
    time_in: null,
    reason: 'Investigation',
    prisoner: 'pr6',
    gate_pass: 'gp5',
    working_party: null
  }
];

const mockGatePassDetails: Record<string, GatePassDetail> = {
  'gp1': {
    id: 'gp1',
    gate_keeper_username: 'officer_john',
    gate_pass_type_name: 'Court Appearance',
    destination: 'District Court',
    main_gate_required: true,
    exception_reason: '',
    remarks: 'Scheduled court hearing for case #2024/567',
    created_at: '2025-10-28T07:00:00Z',
    status: 'completed'
  },
  'gp2': {
    id: 'gp2',
    gate_keeper_username: 'officer_mary',
    gate_pass_type_name: 'Hospital Visit',
    destination: 'General Hospital',
    main_gate_required: true,
    exception_reason: '',
    remarks: 'Emergency medical attention required',
    created_at: '2025-10-28T09:00:00Z',
    status: 'active'
  },
  'gp3': {
    id: 'gp3',
    gate_keeper_username: 'officer_peter',
    gate_pass_type_name: 'Working Party',
    destination: 'Prison Farm',
    main_gate_required: false,
    exception_reason: 'Internal movement',
    remarks: 'Daily working party - routine farm duties',
    created_at: '2025-10-28T05:30:00Z',
    status: 'completed'
  },
  'gp4': {
    id: 'gp4',
    gate_keeper_username: 'officer_sarah',
    gate_pass_type_name: 'Working Party',
    destination: 'Main Kitchen',
    main_gate_required: false,
    exception_reason: 'Internal movement',
    remarks: 'Kitchen duty assignment',
    created_at: '2025-10-28T05:00:00Z',
    status: 'active'
  },
  'gp5': {
    id: 'gp5',
    gate_keeper_username: 'officer_john',
    gate_pass_type_name: 'Investigation',
    destination: 'Central Police Station',
    main_gate_required: true,
    exception_reason: '',
    remarks: 'Required for ongoing investigation',
    created_at: '2025-10-28T09:30:00Z',
    status: 'active'
  }
};

const mockWorkingPartyDetails: Record<string, WorkingPartyDetail> = {
  'wp1': {
    id: 'wp1',
    name: 'Farm Labor',
    description: 'Agricultural work at prison farm',
    capacity: 20,
    current_members: 15
  },
  'wp2': {
    id: 'wp2',
    name: 'Kitchen Duty',
    description: 'Food preparation and kitchen maintenance',
    capacity: 10,
    current_members: 8
  }
};

const mockPrisonerDetails: Record<string, PrisonerDetail> = {
  'pr1': {
    id: 'pr1',
    full_name: 'John Doe',
    prisoner_number: 'PN-2024-001',
    category: 'Remand',
    date_of_birth: '1985-05-15',
    gender: 'Male'
  },
  'pr2': {
    id: 'pr2',
    full_name: 'Michael Smith',
    prisoner_number: 'PN-2024-002',
    category: 'Convict',
    date_of_birth: '1978-08-22',
    gender: 'Male'
  },
  'pr3': {
    id: 'pr3',
    full_name: 'David Wilson',
    prisoner_number: 'PN-2024-003',
    category: 'Convict',
    date_of_birth: '1990-03-10',
    gender: 'Male'
  },
  'pr4': {
    id: 'pr4',
    full_name: 'Thomas Anderson',
    prisoner_number: 'PN-2024-004',
    category: 'Convict',
    date_of_birth: '1982-11-30',
    gender: 'Male'
  },
  'pr5': {
    id: 'pr5',
    full_name: 'James Taylor',
    prisoner_number: 'PN-2024-005',
    category: 'Awaiting Trial',
    date_of_birth: '1995-01-18',
    gender: 'Male'
  },
  'pr6': {
    id: 'pr6',
    full_name: 'Robert Martinez',
    prisoner_number: 'PN-2024-006',
    category: 'Remand',
    date_of_birth: '1988-07-25',
    gender: 'Male'
  }
};

export default function PrisonerEntryExitScreen() {
  const [prisonerGatePasses, setPrisonerGatePasses] = useState<PrisonerGatePass[]>(mockPrisonerGatePasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PrisonerGatePass | null>(null);

  const itemsPerPage = 10;

  // Get status based on time_out
  const getInOutStatus = (timeOut: string | null) => {
    return timeOut ? 'OUT' : 'IN';
  };

  // Filter prisoner gate passes
  const filteredRecords = prisonerGatePasses.filter(record => {
    const matchesSearch = 
      record.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.working_party_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const inOutStatus = getInOutStatus(record.time_out);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'in' && inOutStatus === 'IN') ||
      (statusFilter === 'out' && inOutStatus === 'OUT');

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (record: PrisonerGatePass) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'IN' ? (
      <Badge className="bg-green-600">
        <LogIn className="h-3 w-3 mr-1" />
        IN
      </Badge>
    ) : (
      <Badge className="bg-orange-600">
        <LogOut className="h-3 w-3 mr-1" />
        OUT
      </Badge>
    );
  };

  // Calculate statistics
  const totalPrisoners = prisonerGatePasses.length;
  const prisonersOut = prisonerGatePasses.filter(p => getInOutStatus(p.time_out) === 'OUT').length;
  const prisonersIn = prisonerGatePasses.filter(p => getInOutStatus(p.time_out) === 'IN').length;
  const onWorkingParty = prisonerGatePasses.filter(p => p.working_party).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: '#650000' }}>Prisoner Entry/Exit Records</h1>
          <p className="text-gray-600">Track prisoner movements in and out of the station</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Prisoners</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {totalPrisoners}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prisoners Out</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {prisonersOut}
                </p>
              </div>
              <LogOut className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prisoners In</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {prisonersIn}
                </p>
              </div>
              <LogIn className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Working Party</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  {onWorkingParty}
                </p>
              </div>
              <Clock className="h-8 w-8" style={{ color: '#650000' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prisoner name, destination, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in">In Station</SelectItem>
                <SelectItem value="out">Out of Station</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prisoner Entry/Exit Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prisoner Name</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Working Party</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Time Out</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>IN/OUT Station</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.prisoner_name}</TableCell>
                      <TableCell>{record.destination}</TableCell>
                      <TableCell>
                        {record.working_party_name ? (
                          <Badge variant="outline">{record.working_party_name}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{record.reason}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateTime(record.time_out)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDateTime(record.time_in)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(getInOutStatus(record.time_out))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} results
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

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>
              Prisoner Movement Details
            </DialogTitle>
            <DialogDescription>
              Complete information about prisoner movement, gate pass, and working party
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Prisoner Information */}
              <div>
                <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Prisoner Information</h3>
                <Card>
                  <CardContent className="p-4">
                    {mockPrisonerDetails[selectedRecord.prisoner] ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p>{mockPrisonerDetails[selectedRecord.prisoner].full_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Prisoner Number</p>
                          <p>{mockPrisonerDetails[selectedRecord.prisoner].prisoner_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <Badge variant="outline">{mockPrisonerDetails[selectedRecord.prisoner].category}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p>{mockPrisonerDetails[selectedRecord.prisoner].gender}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p>{new Date(mockPrisonerDetails[selectedRecord.prisoner].date_of_birth).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Prisoner details not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Movement Details */}
              <div>
                <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Movement Details</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Destination</p>
                        <p>{selectedRecord.destination}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reason</p>
                        <p>{selectedRecord.reason}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time Out</p>
                        <p>{formatDateTime(selectedRecord.time_out)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time In</p>
                        <p>{formatDateTime(selectedRecord.time_in)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Status</p>
                        {getStatusBadge(getInOutStatus(selectedRecord.time_out))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Gate Pass Details */}
              <div>
                <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Gate Pass Details</h3>
                <Card>
                  <CardContent className="p-4">
                    {mockGatePassDetails[selectedRecord.gate_pass] ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Gate Pass Type</p>
                          <p>{mockGatePassDetails[selectedRecord.gate_pass].gate_pass_type_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Gatekeeper</p>
                          <p>{mockGatePassDetails[selectedRecord.gate_pass].gate_keeper_username}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Main Gate Required</p>
                          <Badge className={mockGatePassDetails[selectedRecord.gate_pass].main_gate_required ? 'bg-green-600' : ''}>
                            {mockGatePassDetails[selectedRecord.gate_pass].main_gate_required ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge variant="outline">{mockGatePassDetails[selectedRecord.gate_pass].status}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created At</p>
                          <p>{formatDateTime(mockGatePassDetails[selectedRecord.gate_pass].created_at)}</p>
                        </div>
                        {mockGatePassDetails[selectedRecord.gate_pass].exception_reason && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Exception Reason</p>
                            <p>{mockGatePassDetails[selectedRecord.gate_pass].exception_reason}</p>
                          </div>
                        )}
                        {mockGatePassDetails[selectedRecord.gate_pass].remarks && (
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Remarks</p>
                            <p>{mockGatePassDetails[selectedRecord.gate_pass].remarks}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Gate pass details not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Working Party Details */}
              {selectedRecord.working_party && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm mb-3" style={{ color: '#650000' }}>Working Party Details</h3>
                    <Card>
                      <CardContent className="p-4">
                        {mockWorkingPartyDetails[selectedRecord.working_party] ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Name</p>
                              <p>{mockWorkingPartyDetails[selectedRecord.working_party].name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Capacity</p>
                              <p>{mockWorkingPartyDetails[selectedRecord.working_party].current_members} / {mockWorkingPartyDetails[selectedRecord.working_party].capacity}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-gray-600">Description</p>
                              <p>{mockWorkingPartyDetails[selectedRecord.working_party].description}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">Working party details not available</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

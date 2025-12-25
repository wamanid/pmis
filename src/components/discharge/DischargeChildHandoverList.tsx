import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Plus, Edit, Trash2, Eye, Baby, Users } from 'lucide-react';
import { toast } from 'sonner';
import { DischargeChildHandoverForm } from './DischargeChildHandoverForm';
import { Badge } from '../ui/badge';

interface DischargeChildHandover {
  id: string;
  child_name: string;
  mother_name: string;
  relationship_name: string;
  custodian: string;
  contact_of_custodian: string;
  datetime_of_handover: string;
  reason_for_handover: string;
  physical_condition: string;
  probation_report: string;
  age_at_handover: number;
  remarks: string;
  child: string;
  custodian_relation_to_prisoner: string;
}

interface ChildRecord {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  prisoner_number_value: string;
  sex_name: string;
  age_value: number;
  hospital_name: string;
  district_name: string;
  name: string;
  date_of_birth: string;
  fathers_name: string;
  mothers_name: string;
  photo: string;
  physical_condition: string;
  child_record: string;
  medical_condition: string;
  medical_report: string;
  probation_report: string;
  description: string;
  age_on_admission: number;
  prisoner: string;
  relation: string;
  hospital_of_birth: string;
  district_of_birth: string;
  sex: string;
}

type TabType = 'due-for-handover' | 'handover-records';

export const DischargeChildHandoverList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('due-for-handover');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DischargeChildHandover | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildRecord | null>(null);
  const [isChildViewOpen, setIsChildViewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Mock data for children due for handover (from /api/admission/children-records/?min_age=0&max_age=2)
  const [childrenDueForHandover, setChildrenDueForHandover] = useState<ChildRecord[]>([
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      prisoner_name: 'Jane Smith',
      prisoner_number: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      prisoner_number_value: 'ARPC0000000013/25',
      sex_name: 'Male',
      age_value: 18,
      hospital_name: 'Mulago Hospital',
      district_name: 'Kampala',
      name: 'Baby John Smith',
      date_of_birth: '2023-11-15',
      fathers_name: 'John Doe',
      mothers_name: 'Jane Smith',
      photo: '',
      physical_condition: 'Good health, normal development',
      child_record: 'CR-2023-001',
      medical_condition: 'Healthy',
      medical_report: 'Normal checkup, up to date with vaccinations',
      probation_report: 'Child is ready for handover to family',
      description: 'Healthy baby boy, 18 months old',
      age_on_admission: 1,
      prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      relation: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      hospital_of_birth: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      district_of_birth: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      sex: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    },
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      prisoner_name: 'Mary Johnson',
      prisoner_number: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      prisoner_number_value: 'ARPC0000000014/25',
      sex_name: 'Female',
      age_value: 22,
      hospital_name: 'Nsambya Hospital',
      district_name: 'Kampala',
      name: 'Baby Sarah Johnson',
      date_of_birth: '2023-07-20',
      fathers_name: 'Unknown',
      mothers_name: 'Mary Johnson',
      photo: '',
      physical_condition: 'Excellent health',
      child_record: 'CR-2023-002',
      medical_condition: 'Healthy',
      medical_report: 'All vaccinations complete, regular growth',
      probation_report: 'Approved for handover to grandmother',
      description: 'Healthy baby girl, 22 months old',
      age_on_admission: 2,
      prisoner: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      relation: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      hospital_of_birth: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      district_of_birth: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      sex: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
    },
  ]);

  // Mock data for child handover records
  const [handovers, setHandovers] = useState<DischargeChildHandover[]>([
    {
      id: '1',
      child_name: 'Baby Jane',
      mother_name: 'Jane Smith',
      relationship_name: 'Mother',
      custodian: 'Mary Johnson',
      contact_of_custodian: '+256700123456',
      datetime_of_handover: '2025-11-29T10:00:00Z',
      reason_for_handover: 'Mother discharge',
      physical_condition: 'Good health',
      probation_report: 'Approved for handover',
      age_at_handover: 6,
      remarks: 'Routine handover',
      child: 'child-001',
      custodian_relation_to_prisoner: 'rel-001',
    },
  ]);

  const filteredChildren = childrenDueForHandover.filter(
    (child) =>
      child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      child.prisoner_number_value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHandovers = handovers.filter(
    (record) =>
      record.child_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.mother_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages =
    activeTab === 'due-for-handover'
      ? Math.ceil(filteredChildren.length / recordsPerPage)
      : Math.ceil(filteredHandovers.length / recordsPerPage);

  const startIndex = (currentPage - 1) * recordsPerPage;

  const currentChildren = filteredChildren.slice(
    startIndex,
    startIndex + recordsPerPage
  );
  const currentHandovers = filteredHandovers.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handleViewChild = (child: ChildRecord) => {
    setSelectedChild(child);
    setIsChildViewOpen(true);
  };

  const handleHandoverChild = (child: ChildRecord) => {
    // Pre-populate the handover form with child data
    setSelectedRecord({
      id: '',
      child_name: child.name,
      mother_name: child.mothers_name,
      relationship_name: '',
      custodian: '',
      contact_of_custodian: '',
      datetime_of_handover: new Date().toISOString(),
      reason_for_handover: '',
      physical_condition: child.physical_condition,
      probation_report: child.probation_report,
      age_at_handover: child.age_value,
      remarks: '',
      child: child.id,
      custodian_relation_to_prisoner: '',
    });
    setIsFormOpen(true);
  };

  const handleView = (record: DischargeChildHandover) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const handleEdit = (record: DischargeChildHandover) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (record: DischargeChildHandover) => {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      setHandovers(handovers.filter((r) => r.id !== selectedRecord.id));
      toast.success('Child handover record deleted successfully');
    }
    setIsDeleteOpen(false);
    setSelectedRecord(null);
  };

  const handleFormSubmit = (data: any) => {
    if (selectedRecord?.id) {
      setHandovers(
        handovers.map((r) => (r.id === selectedRecord.id ? { ...r, ...data } : r))
      );
      toast.success('Child handover record updated successfully');
    } else {
      setHandovers([...handovers, { id: Date.now().toString(), ...data }]);
      toast.success('Child handover record created successfully');
    }
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const ageInMonths =
      (today.getFullYear() - birthDate.getFullYear()) * 12 +
      today.getMonth() -
      birthDate.getMonth();
    return ageInMonths;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Child Handovers</h1>
          <p className="text-muted-foreground">
            Manage children due for handover and handover records
          </p>
        </div>
        {activeTab === 'handover-records' && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Handover
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={
                activeTab === 'due-for-handover'
                  ? 'Search by child name or mother name...'
                  : 'Search by child or mother name...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b">
            <button
              onClick={() => {
                setActiveTab('due-for-handover');
                setCurrentPage(1);
                setSearchQuery('');
              }}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'due-for-handover'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'due-for-handover' ? '#650000' : undefined,
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Baby className="h-4 w-4" />
                Children Due for Handover
                <Badge
                  variant="outline"
                  className={
                    activeTab === 'due-for-handover'
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-100'
                  }
                >
                  {filteredChildren.length}
                </Badge>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('handover-records');
                setCurrentPage(1);
                setSearchQuery('');
              }}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'handover-records'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor:
                  activeTab === 'handover-records' ? '#650000' : undefined,
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Child Handovers
                <Badge
                  variant="outline"
                  className={
                    activeTab === 'handover-records'
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-100'
                  }
                >
                  {filteredHandovers.length}
                </Badge>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-0">
            {activeTab === 'due-for-handover' ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary hover:bg-primary">
                      <TableHead className="text-white font-bold">Child Name</TableHead>
                      <TableHead className="text-white font-bold">Mother Name</TableHead>
                      <TableHead className="text-white font-bold">
                        Prisoner Number
                      </TableHead>
                      <TableHead className="text-white font-bold">Date of Birth</TableHead>
                      <TableHead className="text-white font-bold">Age (Months)</TableHead>
                      <TableHead className="text-white font-bold">
                        Physical Condition
                      </TableHead>
                      <TableHead className="text-white font-bold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentChildren.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No children due for handover found
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentChildren.map((child) => (
                        <TableRow key={child.id}>
                          <TableCell className="font-medium">{child.name}</TableCell>
                          <TableCell>{child.mothers_name}</TableCell>
                          <TableCell>{child.prisoner_number_value}</TableCell>
                          <TableCell>{formatDate(child.date_of_birth)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {calculateAge(child.date_of_birth)} months
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={child.physical_condition}>
                              {child.physical_condition}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewChild(child)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleHandoverChild(child)}
                                style={{ backgroundColor: '#34D399' }}
                                className="hover:opacity-90"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Handover
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary hover:bg-primary">
                      <TableHead className="text-white font-bold">Child Name</TableHead>
                      <TableHead className="text-white font-bold">Mother Name</TableHead>
                      <TableHead className="text-white font-bold">Custodian</TableHead>
                      <TableHead className="text-white font-bold">Contact</TableHead>
                      <TableHead className="text-white font-bold">Age</TableHead>
                      <TableHead className="text-white font-bold">Handover Date</TableHead>
                      <TableHead className="text-white font-bold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentHandovers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No child handover records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentHandovers.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.child_name}</TableCell>
                          <TableCell>{record.mother_name}</TableCell>
                          <TableCell>{record.custodian}</TableCell>
                          <TableCell>{record.contact_of_custodian}</TableCell>
                          <TableCell>{record.age_at_handover} months</TableCell>
                          <TableCell>
                            {formatDateTime(record.datetime_of_handover)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(record)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(record)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record)}
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{' '}
            {Math.min(
              startIndex + recordsPerPage,
              activeTab === 'due-for-handover'
                ? filteredChildren.length
                : filteredHandovers.length
            )}{' '}
            of{' '}
            {activeTab === 'due-for-handover'
              ? filteredChildren.length
              : filteredHandovers.length}{' '}
            records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Child View Dialog */}
      <Dialog open={isChildViewOpen} onOpenChange={setIsChildViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Baby className="h-5 w-5" />
              Child Details
            </DialogTitle>
          </DialogHeader>
          {selectedChild && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Basic Information</h2>
                </div>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Child Name</Label>
                      <p className="font-medium mt-1">{selectedChild.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Date of Birth</Label>
                      <p className="font-medium mt-1">
                        {formatDate(selectedChild.date_of_birth)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Age</Label>
                      <p className="font-medium mt-1">
                        {calculateAge(selectedChild.date_of_birth)} months
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Sex</Label>
                      <p className="font-medium mt-1">{selectedChild.sex_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Mother's Name</Label>
                      <p className="font-medium mt-1">{selectedChild.mothers_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Father's Name</Label>
                      <p className="font-medium mt-1">{selectedChild.fathers_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Prisoner Number</Label>
                      <p className="font-medium mt-1">
                        {selectedChild.prisoner_number_value}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Child Record</Label>
                      <p className="font-medium mt-1">{selectedChild.child_record}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Birth Details */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Birth Details</h2>
                </div>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Hospital of Birth</Label>
                      <p className="font-medium mt-1">{selectedChild.hospital_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">District of Birth</Label>
                      <p className="font-medium mt-1">{selectedChild.district_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Age on Admission</Label>
                      <p className="font-medium mt-1">
                        {selectedChild.age_on_admission} months
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical & Physical Condition */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Medical & Physical Condition</h2>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label className="text-gray-500">Physical Condition</Label>
                    <p className="font-medium mt-1">{selectedChild.physical_condition}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Medical Condition</Label>
                    <p className="font-medium mt-1">{selectedChild.medical_condition}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Medical Report</Label>
                    <p className="font-medium mt-1">{selectedChild.medical_report}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Reports */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Reports</h2>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label className="text-gray-500">Probation Report</Label>
                    <p className="font-medium mt-1">{selectedChild.probation_report}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Description</Label>
                    <p className="font-medium mt-1">{selectedChild.description}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChildViewOpen(false)}>
              Close
            </Button>
            {selectedChild && (
              <Button
                onClick={() => {
                  setIsChildViewOpen(false);
                  handleHandoverChild(selectedChild);
                }}
                style={{ backgroundColor: '#34D399' }}
                className="hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Handover
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Handover Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{selectedRecord?.id ? 'Edit' : 'Add'} Child Handover</DialogTitle>
          </DialogHeader>
          <DischargeChildHandoverForm
            initialData={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Handover View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Child Handover Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Child Name</Label>
                  <p className="text-sm mt-1">{selectedRecord.child_name}</p>
                </div>
                <div>
                  <Label>Mother Name</Label>
                  <p className="text-sm mt-1">{selectedRecord.mother_name}</p>
                </div>
                <div>
                  <Label>Custodian</Label>
                  <p className="text-sm mt-1">{selectedRecord.custodian}</p>
                </div>
                <div>
                  <Label>Contact</Label>
                  <p className="text-sm mt-1">{selectedRecord.contact_of_custodian}</p>
                </div>
                <div>
                  <Label>Age</Label>
                  <p className="text-sm mt-1">{selectedRecord.age_at_handover} months</p>
                </div>
                <div>
                  <Label>Handover Date</Label>
                  <p className="text-sm mt-1">
                    {formatDateTime(selectedRecord.datetime_of_handover)}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label>Physical Condition</Label>
                  <p className="text-sm mt-1">{selectedRecord.physical_condition}</p>
                </div>
                <div className="col-span-2">
                  <Label>Remarks</Label>
                  <p className="text-sm mt-1">{selectedRecord.remarks}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this child handover record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

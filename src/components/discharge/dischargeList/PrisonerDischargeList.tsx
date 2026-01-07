import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Calendar,
  Filter,
  Wallet,
  Package,
  Info,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { PrisonerDischargeForm } from '../PrisonerDischargeForm';
import { PrisonerDischargeFormTabbed } from './PrisonerDischargeFormTabbed';
import TransferRequestList from '../../transfer/TransferRequestList';
import TransferRequestForm from '../../transfer/TransferRequestForm';
import {Loader} from "../ViewDischargeDetails";
import {
  handleCatchError,
  handleEmptyList,
  handleServerError,
  handleServerError2
} from "../../../services/stationServices/utils";
import {
  DischargeRequest,
  DischargeType,
  getDischarges,
  getReasons,
  getTypes,
  PrisonerDischarge
} from "../../../services/discharge/discharge";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {StaffItem} from "../../../services/stationServices/staffDeploymentService";

interface ChildProps {
  loading: Loader
  setLoading: React.Dispatch<React.SetStateAction<Loader>>
  types: DischargeType
  setTypes: React.Dispatch<React.SetStateAction<DischargeType[]>>
  reasons: Unit
  setReasons: React.Dispatch<React.SetStateAction<Unit[]>>
  setDischargeRequests: React.Dispatch<React.SetStateAction<DischargeRequest[]>>
  dischargeRequests: DischargeRequest
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
  staff: StaffItem
  setStaff: React.Dispatch<React.SetStateAction<StaffItem[]>>
}

interface PropertyAccount {
  id: string;
  account_type: string;
  account_type_name: string;
  balance: string;
  currency: string;
}

interface Property {
  id: string;
  property_type: string;
  property_type_name: string;
  property_item: string;
  property_item_name: string;
  quantity: string;
  measurement_unit: string;
  measurement_unit_name: string;
  amount: string | null;
  property_status: string;
  property_status_name: string;
  bag_number: string;
  note: string;
  destination: string;
}

// interface PrisonerDischarge {
//   id: string;
//   prisoner_name: string;
//   prisoner_number: string;
//   discharge_type_name: string;
//   discharge_reason_name: string;
//   discharge_datetime: string;
//   remarks: string;
//   prisoner: string;
//   discharge_type: string;
//   discharge_reason: string;
//   intended_place_of_stay?: string;
//   property_accounts?: PropertyAccount[];
//   properties?: Property[];
// }

export const PrisonerDischargeList: React.FC<ChildProps> = ({ loading, setLoading, types, setTypes, reasons, setReasons, dischargeRequests,
                                                              setDischargeRequests, setPrisoners, prisoners, setStaff, staff, }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterReason, setFilterReason] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PrisonerDischarge | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Transfer redirect state
  const [showTransferView, setShowTransferView] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [transferPrisonerData, setTransferPrisonerData] = useState<any>(null);
  
  // Gate pass navigation state
  const [showGatePassView, setShowGatePassView] = useState(false);
  const [gatePassPrisonerData, setGatePassPrisonerData] = useState<any>(null);

  // Mock discharge types with on_premise flag
  // const mockDischargeTypes: Record<string, { on_premise: boolean }> = {
  //   'type-001': { on_premise: true }, // Completion of Sentence
  //   'type-002': { on_premise: false }, // Transfer
  //   'type-003': { on_premise: false }, // Death
  //   'type-004': { on_premise: true }, // Court Order
  //   'type-005': { on_premise: true }, // Deportation
  // };

  // Mock data
  const [dischargeRecords, setDischargeRecords] = useState<PrisonerDischarge[]>([]);

  // Filter records
  const filteredRecords = dischargeRecords.filter((record) => {
    const matchesSearch =
      record.prisoner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.prisoner_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || record.discharge_type_name === filterType;
    const matchesReason = filterReason === 'All' || record.discharge_reason_name === filterReason;
    const matchesDate = !filterDate || record.discharge_datetime.startsWith(filterDate);

    return matchesSearch && matchesType && matchesReason && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  // API Integration
  useEffect(() => {
    if (loading.discharge || !dischargeRecords.length) {
      setLoading(prev => ({
        ...prev,
        discharge: true
      }))
      fetchData()
    }
  }, [loading.discharge]);

  function populateList(response: any, msg: string, setData: any) {
    if (handleServerError2(response)) return true

    if ("results" in response) {
      const data = response.results
      if (msg && !data.length) {
        toast.error(msg)
      }
      setData(data)
      console.log(data)

    }

    return false
  }

  function returnedValue (value: boolean){
    if (value){
      return
    }
  }

  async function fetchData () {
    try {
      const response2 = await getTypes()
      returnedValue(populateList(response2, "", setTypes))

      const response3 = await getReasons()
      returnedValue(populateList(response3, "", setReasons))

      const response1 = await getDischarges()
      returnedValue(populateList(response1, "There are no prisoner discharge records", setDischargeRecords))

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoading(prev => ({
        ...prev,
        discharge: false
      }))
    }
  }

  const handleView = (record: PrisonerDischarge) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const handleEdit = (record: PrisonerDischarge) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (record: PrisonerDischarge) => {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      setDischargeRecords(dischargeRecords.filter((r) => r.id !== selectedRecord.id));
      toast.success('Discharge record deleted successfully');
    }
    setIsDeleteOpen(false);
    setSelectedRecord(null);
  };

  const handleFormSubmit = (data: any) => {

    if (selectedRecord) {
      setDischargeRecords(
        dischargeRecords.map((r) => (r.id === selectedRecord.id ? { ...r, ...data } : r))
      );
      toast.success('Discharge record updated successfully');
    } else {
      const newRecord = {
        id: Date.now().toString(),
        ...data,
      };
      setDischargeRecords([...dischargeRecords, newRecord]);
      toast.success('Discharge record created successfully');
    }
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('All');
    setFilterReason('All');
    setFilterDate('');
    setCurrentPage(1);
  };

  const handleTransferRedirect = (prisonerData: any) => {
    setTransferPrisonerData(prisonerData);
    setIsFormOpen(false);
    setShowTransferView(true);
    setIsTransferFormOpen(true);
    toast.success('Redirecting to Transfer Request...');
  };

  const handleTransferSave = (data: any) => {
    toast.success('Transfer request created successfully');
    setIsTransferFormOpen(false);
  };

  const handleBackToDischarge = () => {
    setShowTransferView(false);
    setTransferPrisonerData(null);
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

  // If showing transfer view, render transfer components
  if (showTransferView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Transfer Request</h1>
            <p className="text-muted-foreground">
              Create transfer request from discharge
            </p>
          </div>
          <Button variant="outline" onClick={handleBackToDischarge}>
            Back to Discharges
          </Button>
        </div>

        <TransferRequestList />

        <TransferRequestForm
          open={isTransferFormOpen}
          onClose={() => setIsTransferFormOpen(false)}
          onSave={handleTransferSave}
          editingRequest={
            transferPrisonerData
              ? {
                  prisoner: transferPrisonerData.prisoner,
                  prisoner_name: transferPrisonerData.prisoner_name,
                  original_station: transferPrisonerData.original_station,
                  original_station_name: 'Luzira Upper Prison',
                  bulk_transfer: false,
                  number_of_prisoners: 1,
                  original_station_oc_acknowledged: false,
                  destination_station_oc_acknowledged: false,
                  original_station_oc_approved_date: '',
                  destination_station_oc_approved_date: '',
                  destination_station: '',
                  reason: '',
                  in_charge: 0,
                  status: '',
                  original_station_oc_approval_status: '',
                  destination_station_oc_approval_status: '',
                  original_station_oc_approved_by: 0,
                  destination_station_oc_approved_by: 0,
                }
              : null
          }
          prisoners={[
            { id: 'prisoner-001', name: 'John Doe', number: 'P-2024-001' },
            { id: 'prisoner-002', name: 'Jane Smith', number: 'P-2024-002' },
            { id: 'prisoner-003', name: 'Michael Johnson', number: 'P-2024-003' },
          ]}
          stations={[
            { id: 'station-001', name: 'Luzira Upper Prison' },
            { id: 'station-002', name: 'Kitalya Prison' },
            { id: 'station-003', name: 'Murchison Bay Prison' },
          ]}
          reasons={[
            { id: 'reason-001', name: 'Security Concerns' },
            { id: 'reason-002', name: 'Medical Treatment' },
            { id: 'reason-003', name: 'Overcrowding' },
          ]}
          statuses={[
            { id: 'status-001', name: 'Pending' },
            { id: 'status-002', name: 'Approved' },
            { id: 'status-003', name: 'Rejected' },
          ]}
          approvalStatuses={[
            { id: 'approval-001', name: 'Pending' },
            { id: 'approval-002', name: 'Approved' },
            { id: 'approval-003', name: 'Rejected' },
          ]}
          staff={[
            { id: 1, name: 'Officer John Smith' },
            { id: 2, name: 'Officer Jane Doe' },
            { id: 3, name: 'Officer Michael Brown' },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <>
      {
        loading.discharge ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching Prisoner Discharge Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
               {/* Header */}
               <div className="flex items-center justify-between">
                <div>
                  <h1>Prisoner Discharges</h1>
                  <p className="text-muted-foreground">
                    Manage prisoner discharge records and documentation
                  </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Discharge
                </Button>
              </div>

               {/* Filters and Search */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="lg:col-span-2">
                        <Label>Search</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search by prisoner name or number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Discharge Type</Label>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              types.map(type => (
                                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Discharge Reason</Label>
                        <Select value={filterReason} onValueChange={setFilterReason}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              reasons.map(reason => (
                                  <SelectItem key={reason.id} value={reason.name}>{reason.name}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={filterDate}
                          onChange={(e) => setFilterDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={handleResetFilters}>
                        Reset Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>

               {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Discharges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">{filteredRecords.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">
                        {filteredRecords.filter((r) => {
                          const date = new Date(r.discharge_datetime);
                          const now = new Date();
                          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                        }).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">
                        {filteredRecords.filter((r) => {
                          const date = new Date(r.discharge_datetime);
                          const now = new Date();
                          return date.toDateString() === now.toDateString();
                        }).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-primary hover:bg-primary">
                            <TableHead className="text-white font-bold">Prisoner Name</TableHead>
                            <TableHead className="text-white font-bold">Prisoner Number</TableHead>
                            <TableHead className="text-white font-bold">Discharge Type</TableHead>
                            <TableHead className="text-white font-bold">Reason</TableHead>
                            <TableHead className="text-white font-bold">Date & Time</TableHead>
                            <TableHead className="text-white font-bold">Remarks</TableHead>
                            <TableHead className="text-white font-bold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentRecords.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No discharge records found
                              </TableCell>
                            </TableRow>
                          ) : (
                            currentRecords.map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{record.prisoner_name}</TableCell>
                                <TableCell>{record.prisoner_number}</TableCell>
                                <TableCell>{record.discharge_type_name}</TableCell>
                                <TableCell>{record.discharge_reason_name}</TableCell>
                                <TableCell>{formatDateTime(record.discharge_datetime)}</TableCell>
                                <TableCell className="max-w-xs truncate">{record.remarks}</TableCell>
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
                  </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
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
            </>
        )
      }
      </>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{selectedRecord ? 'Edit' : 'Add'} Discharge Record</DialogTitle>
          </DialogHeader>
          <PrisonerDischargeFormTabbed
            prisoners={prisoners} setPrisoners={setPrisoners} staff={staff} setStaff={setStaff}
            types={types} setTypes={setTypes} reasons={reasons} setReasons={setReasons}
            dischargeRequests={dischargeRequests}
            setDischargeRequests={setDischargeRequests}
            initialData={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedRecord(null);
            }}
            onTransferRedirect={handleTransferRedirect}
            mode={selectedRecord ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent 
          className="max-w-[1400px] max-h-[90vh] overflow-y-auto resize"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <LogOut className="h-6 w-6" style={{ color: '#650000' }} />
              <span style={{ color: '#650000' }}>Discharge Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* Basic Discharge Information */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    <h2>Discharge Information</h2>
                  </div>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-500">Prisoner Name</Label>
                      <p className="font-medium mt-1">{selectedRecord.prisoner_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Prisoner Number</Label>
                      <p className="font-medium mt-1">{selectedRecord.prisoner_number}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Discharge Date & Time</Label>
                      <p className="font-medium mt-1">{formatDateTime(selectedRecord.discharge_datetime)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Discharge Type</Label>
                      <p className="font-medium mt-1">{selectedRecord.discharge_type_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Discharge Reason</Label>
                      <p className="font-medium mt-1">{selectedRecord.discharge_reason_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Intended Place of Stay</Label>
                      <p className="font-medium mt-1">{selectedRecord.intended_place_of_stay || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Remarks</Label>
                    <p className="font-medium mt-1">{selectedRecord.remarks}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Property Accounts */}
              {selectedRecord.property_accounts && selectedRecord.property_accounts.length > 0 && (
                <Card>
                  <div
                    className="px-6 py-3"
                    style={{ backgroundColor: '#faebd7', color: '#650000' }}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      <h2>Property Accounts</h2>
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedRecord.property_accounts.map((account) => (
                        <div
                          key={account.id}
                          className="p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{account.account_type_name}</p>
                              <p className="text-sm text-gray-500">Account Type</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-semibold" style={{ color: '#10B981' }}>
                                {parseFloat(account.balance).toLocaleString()} {account.currency}
                              </p>
                              <p className="text-sm text-gray-500">Balance</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-700">Total Balance</p>
                        <p className="text-2xl font-bold" style={{ color: '#10B981' }}>
                          {selectedRecord.property_accounts.reduce(
                            (sum, acc) => sum + parseFloat(acc.balance),
                            0
                          ).toLocaleString()} UGX
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Properties */}
              {selectedRecord.properties && selectedRecord.properties.length > 0 && (
                <Card>
                  <div
                    className="px-6 py-3"
                    style={{ backgroundColor: '#faebd7', color: '#650000' }}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <h2>Prisoner Properties</h2>
                    </div>
                  </div>
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-bold">Property Type</TableHead>
                            <TableHead className="font-bold">Property Item</TableHead>
                            <TableHead className="font-bold">Quantity</TableHead>
                            <TableHead className="font-bold">Unit</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Bag Number</TableHead>
                            <TableHead className="font-bold">Note</TableHead>
                            <TableHead className="font-bold">Destination</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedRecord.properties.map((property) => (
                            <TableRow key={property.id} className="hover:bg-gray-50">
                              <TableCell>{property.property_type_name}</TableCell>
                              <TableCell className="font-medium">{property.property_item_name}</TableCell>
                              <TableCell>{property.quantity}</TableCell>
                              <TableCell>{property.measurement_unit_name}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                  {property.property_status_name}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{property.bag_number}</TableCell>
                              <TableCell className="max-w-xs">{property.note}</TableCell>
                              <TableCell>{property.destination || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
                      <p className="text-sm text-gray-600">
                        Total Items: <span className="font-medium">{selectedRecord.properties.length}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            {selectedRecord && mockDischargeTypes[selectedRecord.discharge_type]?.on_premise && (
              <Button 
                onClick={() => {
                  // Prepare prisoner data for gate pass
                  setGatePassPrisonerData({
                    id: selectedRecord.prisoner,
                    prisoner_name: selectedRecord.prisoner_name,
                    prisoner_number: selectedRecord.prisoner_number,
                  });
                  setIsViewOpen(false);
                  setShowGatePassView(true);
                  toast.success('Redirecting to Gate Pass...');
                }}
                style={{ backgroundColor: '#34D399' }}
                className="hover:opacity-90"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Generate Gate Pass
              </Button>
            )}
            <Button 
              onClick={() => {
                setIsViewOpen(false);
                if (selectedRecord) {
                  handleEdit(selectedRecord);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>Are you sure you want to delete this discharge record? This action cannot be undone.</DialogDescription>
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
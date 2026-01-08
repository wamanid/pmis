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
import { Search, Plus, Edit, Trash2, Eye, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { DischargeRequestForm } from './DischargeRequestForm';
import { Badge } from '../../ui/badge';
import {Loader} from "../ViewDischargeDetails";
import {handleCatchError, handleResponseError, handleServerError2} from "../../../services/stationServices/utils";
import {
  addBulkRequest, addRequest,
  BatchDischargeRequest, deleteAllowance, deleteRequest,
  DischargeRequest,
  DischargeType,
  getRequests, SingleDischargeRequest, updateRequest
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
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
  setDischargeRequests: React.Dispatch<React.SetStateAction<DischargeRequest[]>>
  dischargeRequests: DischargeRequest
  staff: StaffItem
  setStaff: React.Dispatch<React.SetStateAction<StaffItem[]>>
}

interface DischargeItem {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  discharge_type_name: string;
  discharge_reason_name: string;
  discharge_number: string;
  discharge_datetime: string;
  remarks: string;
  intended_place_of_stay: string;
  request: string;
  prisoner: string;
  discharge_type: string;
  discharge_reason: string;
}

// interface DischargeRequest {
//   id: string;
//   request_number: string;
//   in_charge_name: string;
//   in_charge_force_number: string;
//   in_charge_rank: string;
//   officer_in_charge_name: string;
//   officer_in_charge_force_number: string;
//   officer_in_charge_rank: string;
//   comment: string;
//   in_charge_approved: boolean;
//   in_charge_remark: string;
//   officer_in_charge_approved: boolean;
//   officer_in_charge_remark: string;
//   discharges: DischargeItem[];
//   in_charge: string;
//   officer_in_charge: string;
// }

export const DischargeRequestList: React.FC<ChildProps> = ({ loading, setLoading, types, reasons, setTypes, setReasons,
                                                             setPrisoners, prisoners, dischargeRequests, setDischargeRequests,
                                                             staff, setStaff }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DischargeRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Mock data
  // const [dischargeRequests, setDischargeRequests] = useState<DischargeRequest[]>([]);

  // Filter records
  const filteredRequests = dischargeRequests.filter((request) => {
    const matchesSearch =
      request.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.in_charge_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.officer_in_charge_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredRequests.slice(startIndex, startIndex + recordsPerPage);

  // API Integration
  // const [staff, setStaff] = useState<StaffItem[]>([]);

  useEffect(() => {
    if (loading.request || !dischargeRequests.length) {
      setLoading(prev => ({
        ...prev,
        request: true
      }))
      fetchData()
    }
  }, [loading.request]);

  async function fetchData() {
    try{

      const response = await getRequests()
      if (handleServerError2(response)) return
      if ("results" in response) {
        const data = response.results
        if (!data.length) {
          toast.error("There are no discharge requests")
        }
        setDischargeRequests(data)
        // console.log(data)
      }
    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoading(prev => ({
        ...prev,
        request: false
      }))
    }
  }

  const handleView = (request: DischargeRequest) => {
    setSelectedRequest(request);
    setIsViewOpen(true);
  };

  const handleEdit = (request: DischargeRequest) => {
    setSelectedRequest(request);
    setIsFormOpen(true);
  };

  const handleDelete = async (request: DischargeRequest) => {
    setSelectedRequest(request);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if(!selectedRequest) return

    try {
       await deleteRequest(selectedRequest.id)
       setDischargeRequests(prev => prev.filter(rec => rec.id !== selectedRequest.id))
       toast.success('Discharge request deleted successfully');
    }catch (error) {
      handleCatchError(error)
    }

    setIsDeleteOpen(false);
    setSelectedRequest(null);
  };

  const handleFormSubmit = async (data: BatchDischargeRequest | SingleDischargeRequest) => {
    // console.log(data)

    try {
      let response: any

      if (selectedRequest) {
        if (!('discharges' in data)) {
          response = await updateRequest(data, selectedRequest.id)
        }
        else {
          toast.error("Editing the request by adding discharges is not yet available");
          return;
        }
      }
      else {
        if ('discharges' in data){
          response = await addBulkRequest(data)
        }
        else {
          response = await addRequest(data)
        }
      }

      if (handleResponseError(response)) return;
      if (!('id' in response)) {
        toast.error("Failed to update the requests table");
      }

      if (selectedRequest) {
        setDischargeRequests(prev => prev.map(r => r.id === selectedRequest.id ? response : r))
        toast.success('Discharge request updated successfully');
      }
      else {
        setDischargeRequests([response, ...dischargeRequests]);
        toast.success('Discharge request created successfully');
      }

      setIsFormOpen(false);
      setSelectedRequest(null);
    }catch (error) {
      handleCatchError(error)
    }
  };

  const getApprovalStatus = (request: DischargeRequest) => {
    if (request.in_charge_approved && request.officer_in_charge_approved) {
      return { label: 'Fully Approved', color: 'bg-green-600', icon: CheckCircle };
    } else if (request.in_charge_approved || request.officer_in_charge_approved) {
      return { label: 'Partially Approved', color: 'bg-yellow-600', icon: Clock };
    } else {
      return { label: 'Pending Approval', color: 'bg-gray-600', icon: Clock };
    }
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

  return (
    <div className="space-y-6">
      {
        loading.request ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching discharge requests' Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1>Discharge Requests</h1>
                  <p className="text-muted-foreground">
                    Manage discharge requests and approvals
                  </p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Discharge Request
                </Button>
              </div>

              {/* Search */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by request number or officer name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentPage(1);
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{filteredRequests.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Fully Approved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-green-600">
                      {
                        filteredRequests.filter(
                          (r) => r.in_charge_approved && r.officer_in_charge_approved
                        ).length
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl text-yellow-600">
                      {
                        filteredRequests.filter(
                          (r) => !r.in_charge_approved || !r.officer_in_charge_approved
                        ).length
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Discharges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">
                      {filteredRequests.reduce((sum, r) => sum + r.discharges.length, 0)}
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
                          <TableHead className="text-white font-bold">Request Number</TableHead>
                          <TableHead className="text-white font-bold">In Charge</TableHead>
                          <TableHead className="text-white font-bold">Officer In Charge</TableHead>
                          <TableHead className="text-white font-bold">Discharges</TableHead>
                          <TableHead className="text-white font-bold">Approval Status</TableHead>
                          <TableHead className="text-white font-bold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No discharge requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentRecords.map((request) => {
                            const status = getApprovalStatus(request);
                            const StatusIcon = status.icon;
                            return (
                              <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.request_number}</TableCell>
                                <TableCell>
                                  <div>
                                    <div>{request.in_charge_name}</div>
                                    <div className="text-sm text-gray-500">{request.in_charge_rank}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div>{request.officer_in_charge_name}</div>
                                    <div className="text-sm text-gray-500">
                                      {request.officer_in_charge_rank}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{request.discharges.length} Discharge(s)</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={status.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleView(request)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(request)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(request)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
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
                    Showing {startIndex + 1} to{' '}
                    {Math.min(startIndex + recordsPerPage, filteredRequests.length)} of{' '}
                    {filteredRequests.length} records
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


      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest ? 'Edit' : 'Create'} Discharge Request
            </DialogTitle>
          </DialogHeader>
          <DischargeRequestForm
            types={types} reasons={reasons} setTypes={setTypes} setReasons={setReasons} prisoners={prisoners} setPrisoners={setPrisoners} staff={staff} setStaff={setStaff}
            initialData={selectedRequest}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedRequest(null);
            }}
            mode={selectedRequest ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6" style={{ color: '#650000' }} />
              <span style={{ color: '#650000' }}>Discharge Request Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Information */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Request Information</h2>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Request Number</Label>
                      <p className="font-medium mt-1">{selectedRequest.request_number}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Total Discharges</Label>
                      <p className="font-medium mt-1">{selectedRequest.discharges.length}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">In Charge</Label>
                      <p className="font-medium mt-1">
                        {selectedRequest.in_charge_name}
                        <br />
                        <span className="text-sm text-gray-500">
                          {selectedRequest.in_charge_rank} • {selectedRequest.in_charge_force_number}
                        </span>
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Officer In Charge</Label>
                      <p className="font-medium mt-1">
                        {selectedRequest.officer_in_charge_name}
                        <br />
                        <span className="text-sm text-gray-500">
                          {selectedRequest.officer_in_charge_rank} •{' '}
                          {selectedRequest.officer_in_charge_force_number}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Comment</Label>
                    <p className="font-medium mt-1">{selectedRequest.comment || 'No comment'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Approval Status */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Approval Status</h2>
                </div>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-500">In Charge Approval</Label>
                        {selectedRequest.in_charge_approved ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <p className="font-medium">
                        {selectedRequest.in_charge_approved ? 'Approved' : 'Pending'}
                      </p>
                      {selectedRequest.in_charge_remark && (
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedRequest.in_charge_remark}
                        </p>
                      )}
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-500">Officer In Charge Approval</Label>
                        {selectedRequest.officer_in_charge_approved ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <p className="font-medium">
                        {selectedRequest.officer_in_charge_approved ? 'Approved' : 'Pending'}
                      </p>
                      {selectedRequest.officer_in_charge_remark && (
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedRequest.officer_in_charge_remark}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Discharges */}
              <Card>
                <div
                  className="px-6 py-3"
                  style={{ backgroundColor: '#faebd7', color: '#650000' }}
                >
                  <h2>Linked Discharges</h2>
                </div>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="font-bold">Discharge Number</TableHead>
                        <TableHead className="font-bold">Prisoner</TableHead>
                        <TableHead className="font-bold">Discharge Type</TableHead>
                        <TableHead className="font-bold">Discharge Reason</TableHead>
                        <TableHead className="font-bold">Date & Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequest.discharges.map((discharge) => (
                        <TableRow key={discharge.id}>
                          <TableCell className="font-medium">{discharge.discharge_number}</TableCell>
                          <TableCell>
                            <div>
                              <div>{discharge.prisoner_name}</div>
                              <div className="text-sm text-gray-500">{discharge.prisoner_number}</div>
                            </div>
                          </TableCell>
                          <TableCell>{discharge.discharge_type_name}</TableCell>
                          <TableCell>{discharge.discharge_reason_name}</TableCell>
                          <TableCell>{formatDateTime(discharge.discharge_datetime)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewOpen(false);
                if (selectedRequest) {
                  handleEdit(selectedRequest);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Request
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
          <DialogDescription>
            Are you sure you want to delete this discharge request? This action cannot be undone.
          </DialogDescription>
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

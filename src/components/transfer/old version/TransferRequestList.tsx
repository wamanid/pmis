import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import TransferRequestForm from "./TransferRequestForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface TransferRequest {
  id?: string;
  prisoner_name?: string;
  original_station_name?: string;
  destination_station_name?: string;
  reason_name?: string;
  status_name?: string;
  in_charge_name?: string;
  original_oc_approval_status_name?: string;
  destination_oc_approval_status_name?: string;
  bulk_transfer: boolean;
  number_of_prisoners: number;
  original_station_oc_acknowledged: boolean;
  destination_station_oc_acknowledged: boolean;
  original_station_oc_approved_date: string;
  destination_station_oc_approved_date: string;
  prisoner: string;
  original_station: string;
  destination_station: string;
  reason: string;
  in_charge: number;
  status: string;
  original_station_oc_approval_status: string;
  destination_station_oc_approval_status: string;
  original_station_oc_approved_by: number;
  destination_station_oc_approved_by: number;
}

interface TransferRequestListProps {
  initialData?: TransferRequest[];
}

export default function TransferRequestList({
  initialData = [],
}: TransferRequestListProps) {
  const [requests, setRequests] = useState<TransferRequest[]>(initialData);
  const [filteredRequests, setFilteredRequests] = useState<TransferRequest[]>(
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<TransferRequest | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedReason, setSelectedReason] = useState<string>("all");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>("all");
  const [transferType, setTransferType] = useState<string>("all"); // all, bulk, single
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Mock data for dropdowns
  const [prisoners] = useState([
    { id: "1", name: "John Doe", number: "P001" },
    { id: "2", name: "Jane Smith", number: "P002" },
    { id: "3", name: "Mike Johnson", number: "P003" },
    { id: "4", name: "Sarah Williams", number: "P004" },
  ]);

  const [stations] = useState([
    { id: "1", name: "Central Prison" },
    { id: "2", name: "North Prison" },
    { id: "3", name: "South Prison" },
    { id: "4", name: "East Prison" },
    { id: "5", name: "West Prison" },
  ]);

  const [reasons] = useState([
    { id: "1", name: "Medical" },
    { id: "2", name: "Court Appearance" },
    { id: "3", name: "Overcrowding" },
    { id: "4", name: "Security" },
    { id: "5", name: "Administrative" },
  ]);

  const [statuses] = useState([
    { id: "1", name: "Pending" },
    { id: "2", name: "Approved" },
    { id: "3", name: "Rejected" },
    { id: "4", name: "In Progress" },
    { id: "5", name: "Completed" },
  ]);

  const [approvalStatuses] = useState([
    { id: "1", name: "Pending" },
    { id: "2", name: "Approved" },
    { id: "3", name: "Rejected" },
    { id: "4", name: "Under Review" },
  ]);

  const [staff] = useState([
    { id: 1, name: "Officer John Smith" },
    { id: 2, name: "Officer Mary Johnson" },
    { id: 3, name: "Officer David Brown" },
    { id: 4, name: "Officer Sarah Davis" },
  ]);

  // Load mock data on mount
  useEffect(() => {
    if (requests.length === 0) {
      const mockRequests: TransferRequest[] = [
        {
          id: "1",
          prisoner_name: "John Doe",
          original_station_name: "Central Prison",
          destination_station_name: "North Prison",
          reason_name: "Medical",
          status_name: "Approved",
          in_charge_name: "Officer John Smith",
          original_oc_approval_status_name: "Approved",
          destination_oc_approval_status_name: "Pending",
          bulk_transfer: false,
          number_of_prisoners: 1,
          original_station_oc_acknowledged: true,
          destination_station_oc_acknowledged: false,
          original_station_oc_approved_date: "2025-11-02T10:00:00Z",
          destination_station_oc_approved_date: "",
          prisoner: "1",
          original_station: "1",
          destination_station: "2",
          reason: "1",
          in_charge: 1,
          status: "2",
          original_station_oc_approval_status: "2",
          destination_station_oc_approval_status: "1",
          original_station_oc_approved_by: 1,
          destination_station_oc_approved_by: 0,
        },
        {
          id: "2",
          prisoner_name: "",
          original_station_name: "South Prison",
          destination_station_name: "East Prison",
          reason_name: "Overcrowding",
          status_name: "In Progress",
          in_charge_name: "Officer Mary Johnson",
          original_oc_approval_status_name: "Approved",
          destination_oc_approval_status_name: "Approved",
          bulk_transfer: true,
          number_of_prisoners: 15,
          original_station_oc_acknowledged: true,
          destination_station_oc_acknowledged: true,
          original_station_oc_approved_date: "2025-11-01T14:00:00Z",
          destination_station_oc_approved_date: "2025-11-02T09:00:00Z",
          prisoner: "",
          original_station: "3",
          destination_station: "4",
          reason: "3",
          in_charge: 2,
          status: "4",
          original_station_oc_approval_status: "2",
          destination_station_oc_approval_status: "2",
          original_station_oc_approved_by: 2,
          destination_station_oc_approved_by: 3,
        },
        {
          id: "3",
          prisoner_name: "Mike Johnson",
          original_station_name: "East Prison",
          destination_station_name: "West Prison",
          reason_name: "Court Appearance",
          status_name: "Pending",
          in_charge_name: "Officer David Brown",
          original_oc_approval_status_name: "Under Review",
          destination_oc_approval_status_name: "Pending",
          bulk_transfer: false,
          number_of_prisoners: 1,
          original_station_oc_acknowledged: false,
          destination_station_oc_acknowledged: false,
          original_station_oc_approved_date: "",
          destination_station_oc_approved_date: "",
          prisoner: "3",
          original_station: "4",
          destination_station: "5",
          reason: "2",
          in_charge: 3,
          status: "1",
          original_station_oc_approval_status: "4",
          destination_station_oc_approval_status: "1",
          original_station_oc_approved_by: 0,
          destination_station_oc_approved_by: 0,
        },
        {
          id: "4",
          prisoner_name: "Sarah Williams",
          original_station_name: "North Prison",
          destination_station_name: "Central Prison",
          reason_name: "Security",
          status_name: "Rejected",
          in_charge_name: "Officer Sarah Davis",
          original_oc_approval_status_name: "Rejected",
          destination_oc_approval_status_name: "N/A",
          bulk_transfer: false,
          number_of_prisoners: 1,
          original_station_oc_acknowledged: true,
          destination_station_oc_acknowledged: false,
          original_station_oc_approved_date: "2025-10-30T11:00:00Z",
          destination_station_oc_approved_date: "",
          prisoner: "4",
          original_station: "2",
          destination_station: "1",
          reason: "4",
          in_charge: 4,
          status: "3",
          original_station_oc_approval_status: "3",
          destination_station_oc_approval_status: "1",
          original_station_oc_approved_by: 4,
          destination_station_oc_approved_by: 0,
        },
      ];
      setRequests(mockRequests);
    }
  }, []);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.prisoner_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.in_charge_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.original_station_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.destination_station_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Station filter
    if (selectedStation !== "all") {
      filtered = filtered.filter(
        (request) =>
          request.original_station === selectedStation ||
          request.destination_station === selectedStation
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (request) => request.status === selectedStatus
      );
    }

    // Reason filter
    if (selectedReason !== "all") {
      filtered = filtered.filter(
        (request) => request.reason === selectedReason
      );
    }

    // Approval status filter
    if (selectedApprovalStatus !== "all") {
      filtered = filtered.filter(
        (request) =>
          request.original_station_oc_approval_status ===
            selectedApprovalStatus ||
          request.destination_station_oc_approval_status ===
            selectedApprovalStatus
      );
    }

    // Transfer type filter
    if (transferType === "bulk") {
      filtered = filtered.filter((request) => request.bulk_transfer === true);
    } else if (transferType === "single") {
      filtered = filtered.filter((request) => request.bulk_transfer === false);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (request) =>
          (request.original_station_oc_approved_date &&
            new Date(request.original_station_oc_approved_date) >=
              new Date(dateFrom + "T00:00:00Z")) ||
          (request.destination_station_oc_approved_date &&
            new Date(request.destination_station_oc_approved_date) >=
              new Date(dateFrom + "T00:00:00Z"))
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (request) =>
          (request.original_station_oc_approved_date &&
            new Date(request.original_station_oc_approved_date) <=
              new Date(dateTo + "T23:59:59Z")) ||
          (request.destination_station_oc_approved_date &&
            new Date(request.destination_station_oc_approved_date) <=
              new Date(dateTo + "T23:59:59Z"))
      );
    }

    setFilteredRequests(filtered);
  }, [
    requests,
    searchTerm,
    selectedStation,
    selectedStatus,
    selectedReason,
    selectedApprovalStatus,
    transferType,
    dateFrom,
    dateTo,
  ]);

  const handleAddRequest = () => {
    setEditingRequest(null);
    setIsDialogOpen(true);
  };

  const handleEditRequest = (request: TransferRequest) => {
    setEditingRequest(request);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;

    try {
      // API call would go here
      // await fetch(`/api/transfer-management/requests/${requestToDelete}/`, {
      //   method: 'DELETE',
      // });

      setRequests(requests.filter((r) => r.id !== requestToDelete));
      toast.success("Transfer request deleted successfully");
    } catch (error) {
      toast.error("Failed to delete transfer request");
    } finally {
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleSaveRequest = (requestData: TransferRequest) => {
    if (editingRequest) {
      // Update existing request
      setRequests(
        requests.map((r) =>
          r.id === editingRequest.id
            ? {
                ...requestData,
                id: editingRequest.id,
                prisoner_name: requestData.bulk_transfer
                  ? ""
                  : prisoners.find((p) => p.id === requestData.prisoner)
                      ?.name || "",
                original_station_name:
                  stations.find((s) => s.id === requestData.original_station)
                    ?.name || "",
                destination_station_name:
                  stations.find((s) => s.id === requestData.destination_station)
                    ?.name || "",
                reason_name:
                  reasons.find((r) => r.id === requestData.reason)?.name || "",
                status_name:
                  statuses.find((s) => s.id === requestData.status)?.name || "",
                in_charge_name:
                  staff.find((s) => s.id === requestData.in_charge)?.name || "",
                original_oc_approval_status_name:
                  approvalStatuses.find(
                    (s) => s.id === requestData.original_station_oc_approval_status
                  )?.name || "",
                destination_oc_approval_status_name:
                  approvalStatuses.find(
                    (s) => s.id === requestData.destination_station_oc_approval_status
                  )?.name || "",
              }
            : r
        )
      );
    } else {
      // Add new request
      const newRequest = {
        ...requestData,
        id: Date.now().toString(),
        prisoner_name: requestData.bulk_transfer
          ? ""
          : prisoners.find((p) => p.id === requestData.prisoner)?.name || "",
        original_station_name:
          stations.find((s) => s.id === requestData.original_station)?.name ||
          "",
        destination_station_name:
          stations.find((s) => s.id === requestData.destination_station)
            ?.name || "",
        reason_name:
          reasons.find((r) => r.id === requestData.reason)?.name || "",
        status_name:
          statuses.find((s) => s.id === requestData.status)?.name || "",
        in_charge_name:
          staff.find((s) => s.id === requestData.in_charge)?.name || "",
        original_oc_approval_status_name:
          approvalStatuses.find(
            (s) => s.id === requestData.original_station_oc_approval_status
          )?.name || "",
        destination_oc_approval_status_name:
          approvalStatuses.find(
            (s) => s.id === requestData.destination_station_oc_approval_status
          )?.name || "",
      };
      setRequests([...requests, newRequest]);
    }
    setIsDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "approved":
        return "default";
      case "in progress":
      case "under review":
        return "secondary";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStation("all");
    setSelectedStatus("all");
    setSelectedReason("all");
    setSelectedApprovalStatus("all");
    setTransferType("all");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#650000]">
              <FileText className="h-6 w-6" />
              Transfer Requests
            </CardTitle>
            <Button
              onClick={handleAddRequest}
              className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
            >
              <Plus className="h-4 w-4" />
              Add Transfer Request
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter Requests</span>
              {(searchTerm ||
                selectedStation !== "all" ||
                selectedStatus !== "all" ||
                selectedReason !== "all" ||
                selectedApprovalStatus !== "all" ||
                transferType !== "all" ||
                dateFrom ||
                dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-[#650000] hover:text-[#4a0000]"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by prisoner name, officer, or station..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedReason} onValueChange={setSelectedReason}>
                <SelectTrigger>
                  <SelectValue placeholder="All Reasons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  {reasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id}>
                      {reason.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedApprovalStatus}
                onValueChange={setSelectedApprovalStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Approval Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approval Statuses</SelectItem>
                  {approvalStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={transferType} onValueChange={setTransferType}>
                <SelectTrigger>
                  <SelectValue placeholder="Transfer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single Transfer</SelectItem>
                  <SelectItem value="bulk">Bulk Transfer</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
              />

              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: '#650000' }}>
                <TableHead className="text-white">Type</TableHead>
                <TableHead className="text-white">Prisoner(s)</TableHead>
                <TableHead className="text-white">From → To</TableHead>
                <TableHead className="text-white">Reason</TableHead>
                <TableHead className="text-white">In Charge</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">OC Approvals</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No transfer requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.bulk_transfer ? (
                        <Badge className="bg-purple-600 flex items-center gap-1 w-fit">
                          <Users className="h-3 w-3" />
                          Bulk
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <User className="h-3 w-3" />
                          Single
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.bulk_transfer ? (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {request.number_of_prisoners} prisoners
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{request.prisoner_name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div className="text-sm">
                          <div>{request.original_station_name}</div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <ArrowRightLeft className="h-3 w-3" />
                            {request.destination_station_name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.reason_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{request.in_charge_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status_name || "")}>
                        {request.status_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs">
                          {request.original_oc_approval_status_name?.toLowerCase() ===
                          "approved" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : request.original_oc_approval_status_name?.toLowerCase() ===
                            "rejected" ? (
                            <XCircle className="h-3 w-3 text-red-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-600">
                            Origin: {request.original_oc_approval_status_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {request.destination_oc_approval_status_name?.toLowerCase() ===
                          "approved" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : request.destination_oc_approval_status_name?.toLowerCase() ===
                            "rejected" ? (
                            <XCircle className="h-3 w-3 text-red-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-600">
                            Dest: {request.destination_oc_approval_status_name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRequest(request)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(request.id!)}
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
        </CardContent>
      </Card>

      {/* Transfer Request Form Dialog */}
      <TransferRequestForm
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveRequest}
        editingRequest={editingRequest}
        prisoners={prisoners}
        stations={stations}
        reasons={reasons}
        statuses={statuses}
        approvalStatuses={approvalStatuses}
        staff={staff}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transfer request? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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

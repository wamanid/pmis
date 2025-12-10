import { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  Filter,
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
import TransferForm from "./TransferForm";
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

interface Transfer {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  original_station_name?: string;
  destination_station_name?: string;
  reason_name?: string;
  status_name?: string;
  transfer_request_id?: string;
  transfer_date: string;
  biometric_consent: boolean;
  original_station_oc_acknowledged: boolean;
  destination_station_oc_acknowledged: boolean;
  original_station_oc_approved: boolean;
  destination_station_oc_approved: boolean;
  transfer_request: string;
  prisoner: string;
  original_station: string;
  destination_station: string;
  reason: string;
  status: string;
}

interface TransferListProps {
  initialData?: Transfer[];
}

export default function TransferList({ initialData = [] }: TransferListProps) {
  const [transfers, setTransfers] = useState<Transfer[]>(initialData);
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedReason, setSelectedReason] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Mock data for dropdowns
  const [prisoners] = useState([
    { id: "1", name: "John Doe", number: "P001" },
    { id: "2", name: "Jane Smith", number: "P002" },
    { id: "3", name: "Mike Johnson", number: "P003" },
  ]);

  const [stations] = useState([
    { id: "1", name: "Central Prison" },
    { id: "2", name: "North Prison" },
    { id: "3", name: "South Prison" },
    { id: "4", name: "East Prison" },
  ]);

  const [reasons] = useState([
    { id: "1", name: "Medical" },
    { id: "2", name: "Court Appearance" },
    { id: "3", name: "Overcrowding" },
    { id: "4", name: "Security" },
  ]);

  const [statuses] = useState([
    { id: "1", name: "Pending" },
    { id: "2", name: "Approved" },
    { id: "3", name: "In Transit" },
    { id: "4", name: "Completed" },
    { id: "5", name: "Rejected" },
  ]);

  const [transferRequests] = useState([
    { id: "1", request_id: "TR-2025-001" },
    { id: "2", request_id: "TR-2025-002" },
    { id: "3", request_id: "TR-2025-003" },
  ]);

  // Load mock data on mount
  useEffect(() => {
    if (transfers.length === 0) {
      const mockTransfers: Transfer[] = [
        {
          id: "1",
          prisoner_name: "John Doe",
          prisoner_number: "P001",
          original_station_name: "Central Prison",
          destination_station_name: "North Prison",
          reason_name: "Medical",
          status_name: "Approved",
          transfer_request_id: "TR-2025-001",
          transfer_date: "2025-11-05T10:00:00Z",
          biometric_consent: true,
          original_station_oc_acknowledged: true,
          destination_station_oc_acknowledged: true,
          original_station_oc_approved: true,
          destination_station_oc_approved: false,
          transfer_request: "1",
          prisoner: "1",
          original_station: "1",
          destination_station: "2",
          reason: "1",
          status: "2",
        },
        {
          id: "2",
          prisoner_name: "Jane Smith",
          prisoner_number: "P002",
          original_station_name: "South Prison",
          destination_station_name: "East Prison",
          reason_name: "Court Appearance",
          status_name: "In Transit",
          transfer_request_id: "TR-2025-002",
          transfer_date: "2025-11-04T14:30:00Z",
          biometric_consent: true,
          original_station_oc_acknowledged: true,
          destination_station_oc_acknowledged: false,
          original_station_oc_approved: true,
          destination_station_oc_approved: false,
          transfer_request: "2",
          prisoner: "2",
          original_station: "3",
          destination_station: "4",
          reason: "2",
          status: "3",
        },
        {
          id: "3",
          prisoner_name: "Mike Johnson",
          prisoner_number: "P003",
          original_station_name: "Central Prison",
          destination_station_name: "South Prison",
          reason_name: "Overcrowding",
          status_name: "Pending",
          transfer_request_id: "TR-2025-003",
          transfer_date: "2025-11-06T09:00:00Z",
          biometric_consent: false,
          original_station_oc_acknowledged: false,
          destination_station_oc_acknowledged: false,
          original_station_oc_approved: false,
          destination_station_oc_approved: false,
          transfer_request: "3",
          prisoner: "3",
          original_station: "1",
          destination_station: "3",
          reason: "3",
          status: "1",
        },
      ];
      setTransfers(mockTransfers);
    }
  }, []);

  // Filter transfers based on search and filters
  useEffect(() => {
    let filtered = [...transfers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transfer) =>
          transfer.prisoner_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transfer.prisoner_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transfer.transfer_request_id
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Station filter
    if (selectedStation !== "all") {
      filtered = filtered.filter(
        (transfer) =>
          transfer.original_station === selectedStation ||
          transfer.destination_station === selectedStation
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (transfer) => transfer.status === selectedStatus
      );
    }

    // Reason filter
    if (selectedReason !== "all") {
      filtered = filtered.filter(
        (transfer) => transfer.reason === selectedReason
      );
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (transfer) =>
          new Date(transfer.transfer_date) >= new Date(dateFrom + "T00:00:00Z")
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (transfer) =>
          new Date(transfer.transfer_date) <= new Date(dateTo + "T23:59:59Z")
      );
    }

    setFilteredTransfers(filtered);
  }, [
    transfers,
    searchTerm,
    selectedStation,
    selectedStatus,
    selectedReason,
    dateFrom,
    dateTo,
  ]);

  const handleAddTransfer = () => {
    setEditingTransfer(null);
    setIsDialogOpen(true);
  };

  const handleEditTransfer = (transfer: Transfer) => {
    setEditingTransfer(transfer);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTransferToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transferToDelete) return;

    try {
      // API call would go here
      // await fetch(`/api/transfer-management/transfers/${transferToDelete}/`, {
      //   method: 'DELETE',
      // });

      setTransfers(transfers.filter((t) => t.id !== transferToDelete));
      toast.success("Transfer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete transfer");
    } finally {
      setDeleteDialogOpen(false);
      setTransferToDelete(null);
    }
  };

  const handleSaveTransfer = (transferData: Transfer) => {
    if (editingTransfer) {
      // Update existing transfer
      setTransfers(
        transfers.map((t) =>
          t.id === editingTransfer.id
            ? {
                ...transferData,
                id: editingTransfer.id,
                prisoner_name:
                  prisoners.find((p) => p.id === transferData.prisoner)
                    ?.name || "",
                prisoner_number:
                  prisoners.find((p) => p.id === transferData.prisoner)
                    ?.number || "",
                original_station_name:
                  stations.find((s) => s.id === transferData.original_station)
                    ?.name || "",
                destination_station_name:
                  stations.find((s) => s.id === transferData.destination_station)
                    ?.name || "",
                reason_name:
                  reasons.find((r) => r.id === transferData.reason)?.name || "",
                status_name:
                  statuses.find((s) => s.id === transferData.status)?.name || "",
                transfer_request_id:
                  transferRequests.find(
                    (tr) => tr.id === transferData.transfer_request
                  )?.request_id || "",
              }
            : t
        )
      );
    } else {
      // Add new transfer
      const newTransfer = {
        ...transferData,
        id: Date.now().toString(),
        prisoner_name:
          prisoners.find((p) => p.id === transferData.prisoner)?.name || "",
        prisoner_number:
          prisoners.find((p) => p.id === transferData.prisoner)?.number || "",
        original_station_name:
          stations.find((s) => s.id === transferData.original_station)?.name ||
          "",
        destination_station_name:
          stations.find((s) => s.id === transferData.destination_station)
            ?.name || "",
        reason_name:
          reasons.find((r) => r.id === transferData.reason)?.name || "",
        status_name:
          statuses.find((s) => s.id === transferData.status)?.name || "",
        transfer_request_id:
          transferRequests.find((tr) => tr.id === transferData.transfer_request)
            ?.request_id || "",
      };
      setTransfers([...transfers, newTransfer]);
    }
    setIsDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
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
        return "default";
      case "approved":
        return "secondary";
      case "in transit":
        return "outline";
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
              <ArrowRightLeft className="h-6 w-6" />
              Transfer Management
            </CardTitle>
            <Button
              onClick={handleAddTransfer}
              className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
            >
              <Plus className="h-4 w-4" />
              Add Transfer
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter Transfers</span>
              {(searchTerm ||
                selectedStation !== "all" ||
                selectedStatus !== "all" ||
                selectedReason !== "all" ||
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
                  placeholder="Search by prisoner name, number, or request ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

      {/* Transfers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: '#650000' }}>
                <TableHead className="text-white">Request ID</TableHead>
                <TableHead className="text-white">Transfer Date</TableHead>
                <TableHead className="text-white">Prisoner</TableHead>
                <TableHead className="text-white">From → To</TableHead>
                <TableHead className="text-white">Reason</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Approvals</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No transfers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <Badge className="bg-[#650000]">
                        {transfer.transfer_request_id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(transfer.transfer_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div>{transfer.prisoner_name}</div>
                          <div className="text-sm text-gray-500">
                            {transfer.prisoner_number}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div className="text-sm">
                          <div>{transfer.original_station_name}</div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <ArrowRightLeft className="h-3 w-3" />
                            {transfer.destination_station_name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{transfer.reason_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(transfer.status_name || "")}>
                        {transfer.status_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs">
                          {transfer.original_station_oc_approved ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-600">Origin OC</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          {transfer.destination_station_oc_approved ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-gray-600">Dest. OC</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTransfer(transfer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(transfer.id!)}
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

      {/* Transfer Form Dialog */}
      <TransferForm
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTransfer}
        editingTransfer={editingTransfer}
        prisoners={prisoners}
        stations={stations}
        reasons={reasons}
        statuses={statuses}
        transferRequests={transferRequests}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transfer? This action cannot
              be undone.
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

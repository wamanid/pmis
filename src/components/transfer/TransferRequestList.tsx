import { useState, useEffect, useMemo } from "react";
import { FileText, Search, Plus, Edit, Trash2, User, Building2, Users, Filter, ArrowRightLeft, Eye } from "lucide-react";
import { DataTable } from '../common/DataTable';
import ConfirmDialog from "../common/ConfirmDialog";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import {
  deleteTransferRequest,
  fetchStations,
  fetchReasons,
  fetchStatuses,
} from "../../services/transferServices/transferRequestService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
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
import DateTime from "../common/DateTime";
import SearchableSelect from "../common/SearchableSelect";

function getStatusBadgeVariant(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("pending")) return "accent";
  // if (s.includes("in-progress")) return "secondary";
  if (s.includes("in-progress") || s.includes("in progress") || s.includes("Pending Approval")) return "secondary";
  if (s.includes("approved") || s.includes("completed")) return "default";
  if (s.includes("rejected") || s.includes("declined") || s.includes("cancel") || s.includes("cancelled")) return "destructive";
  // fallback 
  return "outline";
}

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

export default function TransferRequestList() {
   // We no longer manage table data client-side. DataTable will fetch from the server.
   const [reloadKey, setReloadKey] = useState<number>(0);
   // debounce parent search so we don't spam the server with every keystroke
   const [searchTerm, setSearchTerm] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   useEffect(() => {
     const t = window.setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
     return () => window.clearTimeout(t);
   }, [searchTerm]);

  // local helpers used by columns / dialogs
  const handleViewRequest = (r: any) => { setViewRequest(r); setIsViewOpen(true); };
  const handleEditRequest = (r: any) => { setEditingRequest(r); setIsFormOpen(true); };
  const handleDelete = (r: any) => { setToDeleteRequest(r); setConfirmOpen(true); };

  const confirmDelete = async () => {
    const id = toDeleteRequest?.id;
    if (!id) return;
    try {
      await deleteTransferRequest(id);
      setReloadKey(k => k + 1); // ask DataTable to refresh
      (toast as any)?.success?.("Transfer request deleted");
    } catch (err) {
      (toast as any)?.error?.("Failed to delete transfer request");
    } finally {
      setConfirmOpen(false);
      setToDeleteRequest(null);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteRequest, setToDeleteRequest] = useState<TransferRequest | null>(null);
  const [viewRequest, setViewRequest] = useState<TransferRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Filters
  // (searchTerm is user typed, debouncedSearch is used to build server query)
  const [globalStation, setGlobalStation] = useState<string>("all"); // from global hook
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedReason, setSelectedReason] = useState<string>("all");
  const [transferType, setTransferType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // lookups
  const [stations, setStations] = useState<any[]>([]);
  const [reasons, setReasons] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);

  // wire global filter hook: update globalStation and bump reload key so DataTable refetches
  useFilterRefresh(() => {
    const s = localStorage.getItem("selectedStation") || "all";
    setGlobalStation(s);
    setReloadKey((k) => k + 1);
  }, [selectedStatus, selectedReason, transferType, dateFrom, dateTo]);

  useEffect(() => {
    // load lookups
    const c = new AbortController();
    fetchStations(c.signal).then(setStations).catch(() => {});
    fetchReasons(c.signal).then(setReasons).catch(() => {});
    fetchStatuses(c.signal).then(setStatuses).catch(() => {});
    return () => c.abort();
  }, []);

  // reload when external events happen
  useEffect(() => {
    const onCreated = () => setReloadKey(k => k + 1);
    const onUpdated = () => setReloadKey(k => k + 1);
    window.addEventListener("transfer:created", onCreated as EventListener);
    window.addEventListener("transfer:updated", onUpdated as EventListener);
    return () => {
      window.removeEventListener("transfer:created", onCreated as EventListener);
      window.removeEventListener("transfer:updated", onUpdated as EventListener);
    };
  }, []);

  const columns: DataColumn<any>[] = [
    {
      key: "type",
      header: <span className="text-sm font-medium text-gray-700">Type</span>,
      title: "Type",
      label: "Type",
      render: (_v, r) =>
        r?.bulk_transfer
          ? (<Badge className="bg-purple-600 flex items-center gap-1 w-fit"><Users className="h-3 w-3" />Bulk</Badge>)
          : (<Badge variant="outline" className="flex items-center gap-1 w-fit"><User className="h-3 w-3" />Single</Badge>),
      accessor: (r) => (r?.bulk_transfer ? "bulk" : "single"),
      sortable: true,
    },
    {
      key: "prisoners",
      header: <span className="text-sm font-medium text-gray-700">Prisoner(s)</span>,
      title: "Prisoner(s)",
      label: "Prisoner(s)",
      render: (_v, r) =>
        r?.bulk_transfer
          ? (<div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" /><span className="text-sm">{r.number_of_prisoners} prisoners</span></div>)
          : (<div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="text-sm">{r.prisoner_name}</span></div>),
      accessor: (r) => r.prisoner_name ?? "",
    },
    {
      key: "fromto",
      header: <span className="text-sm font-medium text-gray-700">From → To</span>,
      title: "From → To",
      label: "From → To",
      render: (_v, r) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <div className="text-sm">
            <div>{r?.original_station_name}</div>
            <div className="flex items-center gap-1 text-gray-500"><ArrowRightLeft className="h-3 w-3" />{r?.destination_station_name}</div>
          </div>
        </div>
      ),
      accessor: (r) => `${r.original_station_name ?? ""}->${r.destination_station_name ?? ""}`,
      sortable: true,
    },
    {
      key: "reason",
      header: <span className="text-sm font-medium text-gray-700">Reason</span>,
      title: "Reason",
      label: "Reason",
      render: (_v, r) => <Badge variant="outline">{r?.reason_name}</Badge>,
      accessor: (r) => r.reason_name ?? "",
    },
    {
      key: "in_charge",
      header: <span className="text-sm font-medium text-gray-700">In Charge</span>,
      title: "In Charge",
      label: "In Charge",
      render: (_v, r) => (<div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="text-sm">{r?.in_charge_name}</span></div>),
      accessor: (r) => r.in_charge_name ?? "",
    },
    {
      key: "status",
      header: <span className="text-sm font-medium text-gray-700">Status</span>,
      title: "Status",
      label: "Status",
      render: (_v, r) => (<Badge variant={getStatusBadgeVariant(r?.status_name || "")}>{r?.status_name}</Badge>),
      accessor: (r) => r.status_name ?? "",
      sortable: true,
    },
    {
      key: "actions",
      header: <span className="text-sm font-medium text-gray-700">Actions</span>,
      title: "Actions",
      label: "Actions",
      render: (_v, r) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleViewRequest(r)}><Eye className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => handleEditRequest(r)}><Edit className="h-4 w-4" /></Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(r)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
      accessor: () => "",
    },
  ];

  // build table url string (DataTable / axiosInstance expects a string)
  // - use debouncedSearch to avoid firing on every keystroke
  // - only include `search` when it is meaningful (min length 3)
  const tableUrl = useMemo(() => {
    const params: Record<string,string> = {};
    const minSearchLen = 3;
    if (debouncedSearch && debouncedSearch.length >= minSearchLen) params.search = String(debouncedSearch);
    if (globalStation && globalStation !== "all") params.original_station = String(globalStation);
    if (selectedStatus && selectedStatus !== "all") params.status = String(selectedStatus);
    if (selectedReason && selectedReason !== "all") params.reason = String(selectedReason);
    if (transferType && transferType !== "all") params.transfer_type = String(transferType);
    if (dateFrom) params.date_from = String(dateFrom);
    if (dateTo) params.date_to = String(dateTo);
    const qs = new URLSearchParams(params).toString();
    return `/transfer-management/requests/${qs ? `?${qs}` : ""}`;
  }, [debouncedSearch, globalStation, selectedStatus, selectedReason, transferType, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      {/* Header & filters (keep layout, wire globalStation display) */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#650000]"><FileText className="h-6 w-6" />Transfer Requests</CardTitle>
            <Button
  onClick={() => {
    setEditingRequest(null); // ensure create mode
    setIsFormOpen(true);
  }}
  className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
>
  <Plus className="h-4 w-4" />Add Transfer Request
</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filter Requests</span>
              {(searchTerm || globalStation !== "all" || selectedStatus !== "all" || selectedReason !== "all" || transferType !== "all" || dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setGlobalStation("all"); setSelectedStatus("all"); setSelectedReason("all"); setTransferType("all"); setDateFrom(""); setDateTo(""); }} className="text-[#650000] hover:text-[#4a0000]">Clear Filters</Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by prisoner name, officer, or station..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              {/* <div className="px-2">
                <span className="text-sm text-gray-700">Station: {globalStation === "all" ? "All Stations" : stations.find(s => s.id === globalStation)?.name ?? "Unknown"}</span>
              </div> */}

              {/* Date filters */}
              <div className="px-2 flex gap-2">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchableSelect
                value={selectedStatus}
                onChange={(v) => setSelectedStatus(v ?? "all")}
                items={[{ id: "all", name: "All Statuses" }, ...statuses]}
                idField="id"
                labelField="name"
                placeholder="All Statuses"
              />

              <SearchableSelect
                value={selectedReason}
                onChange={(v) => setSelectedReason(v ?? "all")}
                items={[{ id: "all", name: "All Reasons" }, ...reasons]}
                idField="id"
                labelField="name"
                placeholder="All Reasons"
              />

              <Select value={transferType} onValueChange={setTransferType}>
                <SelectTrigger><SelectValue placeholder="Transfer Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single Transfer</SelectItem>
                  <SelectItem value="bulk">Bulk Transfer</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="my-5">
        <CardContent className="m-5">
          {/* <DataTable columns={columns} data={filteredRequests} pageSize={10} /> */}

          {/* DataTable */}
          <DataTable
             key={reloadKey}
             url={tableUrl}
             title="Transfer Requests"
             columns={columns}
             config={{
               search: true,
               pagination: true,
               lengthMenu: [10, 25, 50, 100],
               export: {
                 pdf: true,
                 csv: true,
                 print: true,
               },
               summary: true,
               rowSpacing: 'normal',
             }}
           />
        </CardContent>
      </Card>

      <TransferRequestForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRequest(null); // clear edit state on close
        }}
        onSave={async (createdOrUpdated: any) => {
          // ask DataTable to refetch
          setReloadKey(k => k + 1);
          window.dispatchEvent(new CustomEvent("transfer:updated", { detail: createdOrUpdated }));
          return createdOrUpdated;
        }}
        editingRequest={editingRequest}
        // pass any initial lookup props if required...
      />

      {/* View dialog for a single transfer request (read-only) */}
      <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Request Details</AlertDialogTitle>
            <AlertDialogDescription>
              {viewRequest ? `Request ID: ${viewRequest.id ?? "N/A"}` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 gap-2 py-4">
            <div><strong>Prisoner:</strong> {viewRequest?.prisoner_name ?? "-"}</div>
            <div><strong>From → To:</strong> {viewRequest?.original_station_name ?? "-"} → {viewRequest?.destination_station_name ?? "-"}</div>
            <div><strong>Reason:</strong> {viewRequest?.reason_name ?? "-"}</div>
            <div><strong>Status:</strong> {viewRequest?.status_name ?? "-"}</div>
            <div><strong>In Charge:</strong> {viewRequest?.in_charge_name ?? "-"}</div>
            <div><strong>Type:</strong> {viewRequest?.bulk_transfer ? `Bulk (${viewRequest?.number_of_prisoners ?? 0})` : "Single"}</div>
            <div><strong>Created:</strong> {viewRequest?.created_datetime ? <DateTime value={viewRequest.created_datetime} /> : "-"}</div>
            <div><strong>Updated:</strong> {viewRequest?.updated_datetime ? <DateTime value={viewRequest.updated_datetime} /> : "-"}</div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsViewOpen(false)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete transfer request"
        description="This will permanently delete the transfer request."
        details={
          <div className="text-sm space-y-1">
            <div><strong>Request:</strong> {toDeleteRequest?.request_id ?? toDeleteRequest?.id ?? "N/A"}</div>
            <div>
              <strong>Type:</strong>{" "}
              {toDeleteRequest?.bulk_transfer ? `Bulk (${toDeleteRequest?.number_of_prisoners ?? 0} prisoners)` : `Single (${toDeleteRequest?.prisoner_name ?? "-"})`}
            </div>
            <div><strong>From → To:</strong> {toDeleteRequest?.original_station_name ?? "-"} → {toDeleteRequest?.destination_station_name ?? "-"}</div>
          </div>
        }
        onConfirm={confirmDelete}
        confirmLabel="Delete"
      />
    </div>
  );
}

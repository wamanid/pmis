import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Filter,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ComplaintForm from "./ComplaintForm";
import * as ComplaintsService from '../../services/stationServices/complaintsService';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface ComplaintAction {
  id: string;
  created_by_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  action: string;
  action_date: string;
  action_status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  action_remark: string;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  complaint: string;
}

interface Complaint {
  id: string;
  station_name: string;
  prisoner_name: string;
  nature_of_complaint_name: string;
  complaint_priority_name: string;
  officer_requested_username: string;
  rank_name: string;
  created_by_name: string;
  actions: ComplaintAction[];
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  complaint: string;
  complaint_date: string;
  complaint_status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  complaint_remark: string;
  date_of_response: string | null;
  force_number: string;
  response: string;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  station: string;
  prisoner: string;
  nature_of_complaint: string;
  complaint_priority: string;
  officer_requested: number;
  rank: string;
}

export function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [natures, setNatures] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [ranks, setRanks] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(
    null,
  );
  const [complaintStatuses, setComplaintStatuses] = useState<any[]>([]);
  const [priorityOptions, setPriorityOptions] = useState<any[]>([]);

  // load complaint statuses once
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const sts = await ComplaintsService.fetchComplaintStatuses(c.signal);
        if (!mounted) return;
        setComplaintStatuses(sts || []);
      } catch (err) {
        console.error('load complaint statuses error', err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // load statuses & priorities when component mounts (inside existing load() or separate)
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [sts, prios] = await Promise.all([
          ComplaintsService.fetchComplaintStatuses(c.signal),
          ComplaintsService.fetchPriorities()
        ]);
        if (!mounted) return;
        setComplaintStatuses(sts || []);
        setPriorityOptions(prios || []);
      } catch (err) {
        console.error('load statuses/priorities error', err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.prisoner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.nature_of_complaint_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.station_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.complaint_status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      complaint.complaint_priority_name === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Build filteredComplaints with resolution
  const resolvedComplaints = complaints.map(cmp => {
    const statusObj = complaintStatuses.find(s => String(s.id) === String(cmp.complaint_status));
    const statusName = statusObj?.name ?? cmp.complaint_status;
    const priorityObj = priorityOptions.find(p => String(p.id) === String(cmp.complaint_priority));
    const priorityName = priorityObj?.name ?? cmp.complaint_priority_name ?? cmp.complaint_priority_name;
    return {
      ...cmp,
      _statusName: statusName,
      _priorityName: priorityName
    };
  });

  const finalFilteredComplaints = resolvedComplaints.filter((complaint) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      String(complaint.prisoner_name || '').toLowerCase().includes(q) ||
      String(complaint.complaint || '').toLowerCase().includes(q) ||
      String(complaint.nature_of_complaint_name || '').toLowerCase().includes(q) ||
      String(complaint.station_name || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || String(complaint.complaint_status) === String(statusFilter);
    const matchesPriority = priorityFilter === "all" || String(complaint.complaint_priority) === String(priorityFilter);

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get status badge
  const getStatusBadge = (status?: string | number) => {
    // Try to resolve status object from API list (match id or name)
    const resolved = complaintStatuses.find(s =>
      String(s.id) === String(status) || String(s.name) === String(status)
    );
    const name = resolved?.name ?? (typeof status === 'string' ? status : undefined);

    // derive visual style from name (fallbacks provided)
    const n = (name || '').toLowerCase();
    const isOpen = n.includes('open');
    const isInProgress = n.includes('progress') || n.includes('in_progress');
    const isResolved = n.includes('resolve') || n.includes('resolved');
    const isClosed = n.includes('close') || n.includes('closed');

    const config = isOpen
      ? { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle }
      : isInProgress
      ? { color: 'bg-blue-100 text-blue-800', icon: Clock }
      : isResolved
      ? { color: 'bg-green-100 text-green-800', icon: CheckCircle }
      : isClosed
      ? { color: 'bg-gray-100 text-gray-800', icon: XCircle }
      : { color: 'bg-gray-100 text-gray-700', icon: AlertCircle };

    const Icon = config.icon;
    const label = name ? String(name).replace(/_/g, ' ') : 'Unknown';

    return (
      <Badge className={`${config.color} flex items-center gap-1`} variant="secondary">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<
      string,
      { color: string; bgColor: string }
    > = {
      Critical: { color: "text-red-800", bgColor: "bg-red-100" },
      High: { color: "text-orange-800", bgColor: "bg-orange-100" },
      Medium: { color: "text-yellow-800", bgColor: "bg-yellow-100" },
      Low: { color: "text-green-800", bgColor: "bg-green-100" },
    };

    const config = priorityConfig[priority] || {
      color: "text-gray-800",
      bgColor: "bg-gray-100",
    };

    return (
      <Badge className={`${config.bgColor} ${config.color}`} variant="secondary">
        {priority}
      </Badge>
    );
  };

  // Get action status badge
  const getActionStatusBadge = (
    status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  ) => {
    const statusConfig = {
      OPEN: { color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      IN_PROGRESS: { color: "bg-blue-50 text-blue-700 border-blue-200" },
      COMPLETED: { color: "bg-green-50 text-green-700 border-green-200" },
      CANCELLED: { color: "bg-red-50 text-red-700 border-red-200" },
    };

    const config = statusConfig[status];

    return (
      <Badge className={`${config.color} border`} variant="outline">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // View complaint details
  const viewComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };

  // Open add complaint form
  const handleAddComplaint = () => {
    setEditingComplaint(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  // Open edit complaint form
  const handleEditComplaint = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  // Save complaint (add or edit) — persists via API
  const handleSaveComplaint = async (complaint: any) => {
    try {
      if (formMode === "add") {
        const created = await ComplaintsService.createComplaint(complaint);
        const newItem = created?.results ? created.results[0] : created;
        setComplaints((prev) => [newItem || complaint, ...prev]);
        return newItem || created;
      } else {
        const updated = await ComplaintsService.updateComplaint(complaint.id, complaint);
        const updatedItem = updated?.results ? updated.results[0] : updated;
        setComplaints((prev) => prev.map((c) => (c.id === (updatedItem?.id ?? complaint.id) ? (updatedItem || complaint) : c)));
        return updatedItem || updated;
      }
    } catch (err: any) {
      // show full error details in console to inspect validation messages
      console.error('Save complaint error:', err?.response?.data ?? err);
      throw err;
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!confirm('Delete this complaint?')) return;
    try {
      await ComplaintsService.deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      setIsDetailsOpen(false);
    } catch (err) { /* axios will show error */ }
  };

  // Load data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [complaintsRes, stationsRes, prisonersRes, naturesRes, prioritiesRes, ranksRes] = await Promise.all([
          ComplaintsService.fetchComplaints({ page_size: 100 }),
          ComplaintsService.fetchStations(),
          ComplaintsService.fetchPrisoners(),
          ComplaintsService.fetchComplaintNatures(),
          ComplaintsService.fetchPriorities(),
          ComplaintsService.fetchRanks(),
        ]);

        // Normalize complaints list
        const items = complaintsRes?.results ?? complaintsRes ?? [];
        setComplaints(items);
        setStations(stationsRes || []);
        setPrisoners(prisonersRes || []);
        setNatures(naturesRes || []);
        setPriorities(prioritiesRes || []);
        setRanks(ranksRes || []);
      } catch (e) {
        // errors handled by axiosInstance interceptors
      }
    };

    load();
  }, []);

  // Statistics
  const stats = {
    total: complaints.length,
    open: resolvedComplaints.filter((c) =>
      (c._statusName ?? "").toLowerCase().includes("open")
    ).length,
    inProgress: resolvedComplaints.filter((c) => {
      const n = (c._statusName ?? "").toLowerCase();
      return n.includes("progress") || n.includes("in progress") || n.includes("in_progress");
    }).length,
    resolved: resolvedComplaints.filter((c) =>
      (c._statusName ?? "").toLowerCase().includes("resolve")
    ).length,
    closed: resolvedComplaints.filter((c) =>
      (c._statusName ?? "").toLowerCase().includes("close")
    ).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#650000]">Complaints Management</h1>
          <p className="text-gray-600">
            Track and manage prisoner complaints and resolutions
          </p>
        </div>
        <Button
          onClick={handleAddComplaint}
          className="bg-[#650000] hover:bg-[#4a0000]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Complaint
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-[#650000]">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-600">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by prisoner, complaint, or station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {complaintStatuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorityOptions.map(p => <SelectItem key={p.id} value={p.id}>{p.name ?? p.display ?? p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-gray-600">Prisoner</th>
                  <th className="text-left p-4 text-gray-600">Station</th>
                  <th className="text-left p-4 text-gray-600">Complaint</th>
                  <th className="text-left p-4 text-gray-600">Nature</th>
                  <th className="text-left p-4 text-gray-600">Priority</th>
                  <th className="text-left p-4 text-gray-600">Status</th>
                  <th className="text-left p-4 text-gray-600">Date</th>
                  <th className="text-left p-4 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {finalFilteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  finalFilteredComplaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{complaint.prisoner_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {complaint.station_name}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="truncate" title={complaint.complaint}>
                          {complaint.complaint}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {complaint.nature_of_complaint_name}
                      </td>
                      <td className="p-4">
                        {getPriorityBadge(complaint.complaint_priority_name)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(complaint.complaint_status)}
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(complaint.complaint_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewComplaintDetails(complaint)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditComplaint(complaint)}
                            className="text-[#650000] border-[#650000] hover:bg-[#650000] hover:text-white"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Complaint Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#650000]">
              Complaint Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this complaint and its actions
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-[#650000] mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Prisoner</label>
                    <p>{selectedComplaint.prisoner_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Station</label>
                    <p>{selectedComplaint.station_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Nature of Complaint
                    </label>
                    <p>{selectedComplaint.nature_of_complaint_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Priority</label>
                    <div className="mt-1">
                      {getPriorityBadge(
                        selectedComplaint.complaint_priority_name,
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedComplaint.complaint_status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Complaint Date
                    </label>
                    <p>{formatDate(selectedComplaint.complaint_date)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Complaint Details */}
              <div>
                <h3 className="text-[#650000] mb-3">Complaint Description</h3>
                <p className="bg-gray-50 p-4 rounded-lg">
                  {selectedComplaint.complaint}
                </p>
                {selectedComplaint.complaint_remark && (
                  <div className="mt-2">
                    <label className="text-sm text-gray-600">Remarks</label>
                    <p className="text-sm mt-1">
                      {selectedComplaint.complaint_remark}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Officer Information */}
              <div>
                <h3 className="text-[#650000] mb-3">Assigned Officer</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Officer</label>
                    <p>{selectedComplaint.officer_requested_username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Rank</label>
                    <p>{selectedComplaint.rank_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Force Number</label>
                    <p>{selectedComplaint.force_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Date of Response
                    </label>
                    <p>
                      {selectedComplaint.date_of_response
                        ? formatDate(selectedComplaint.date_of_response)
                        : "Pending"}
                    </p>
                  </div>
                </div>
                {selectedComplaint.response && (
                  <div className="mt-4">
                    <label className="text-sm text-gray-600">Response</label>
                    <p className="bg-green-50 p-4 rounded-lg mt-1">
                      {selectedComplaint.response}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              <div>
                <h3 className="text-[#650000] mb-3">
                  Actions ({selectedComplaint.actions.length})
                </h3>
                {selectedComplaint.actions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No actions taken yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedComplaint.actions.map((action, index) => (
                      <div
                        key={action.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#650000] text-white text-sm">
                              {index + 1}
                            </span>
                            <div>
                              <p>{action.action}</p>
                              <p className="text-sm text-gray-600">
                                by {action.created_by_name}
                              </p>
                            </div>
                          </div>
                          {getActionStatusBadge(action.action_status)}
                        </div>
                        <div className="ml-8 space-y-1">
                          <p className="text-sm text-gray-600">
                            {action.action_remark}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(action.action_date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Audit Information */}
              <div>
                <h3 className="text-[#650000] mb-3">Audit Trail</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Created By</label>
                    <p>{selectedComplaint.created_by_name}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Created Date</label>
                    <p>{formatDate(selectedComplaint.created_datetime)}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Last Updated</label>
                    <p>{formatDate(selectedComplaint.updated_datetime)}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Status</label>
                    <p>{selectedComplaint.is_active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Complaint Form */}
      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveComplaint}
        complaint={editingComplaint}
        mode={formMode}
        stations={stations}
        prisoners={prisoners}
        complaintNatures={natures}
        priorities={priorities}
        ranks={ranks}
      />
    </div>
  );
};

export default ComplaintsScreen;

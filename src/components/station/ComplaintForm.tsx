import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Trash2,
  Save,
  X,
  AlertCircle,
  User,
  Building2,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

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

interface ComplaintFormData {
  prisoner?: string;
  prisoner_name: string;
  station: string;
  nature_of_complaint: string;
  complaint_priority: string;
  complaint: string;
  complaint_remark: string;
  complaint_date: string;
  complaint_status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  officer_requested_username: string;
  force_number: string;
  rank: string;
  response: string;
}

interface ActionFormData {
  action: string;
  action_date: string;
  action_status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  action_remark: string;
}

interface ComplaintFormProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave now must return a Promise so the form can wait for the API result
  onSave: (complaint: Complaint) => Promise<any>;
  complaint?: Complaint | null;
  mode: "add" | "edit";
  stations?: { id: string; name: string }[];
  prisoners?: { id: string; name: string }[];
  complaintNatures?: { id: string; name: string }[];
  priorities?: { id: string; name: string }[];
  ranks?: { id: string; name: string }[];
}

// Mock options
// const mockStations = [
//   { id: "station-1", name: "Centralzz Police Station" },
//   { id: "station-2", name: "North Division Station" },
//   { id: "station-3", name: "South District Station" },
//   { id: "station-4", name: "East Division Station" },
//   { id: "station-5", name: "West Division Station" },
// ];

// const mockPrisoners = [
//   { id: "prisoner-1", name: "John Doe" },
//   { id: "prisoner-2", name: "Jane Smith" },
//   { id: "prisoner-3", name: "Robert Wilson" },
//   { id: "prisoner-4", name: "Maria Garcia" },
//   { id: "prisoner-5", name: "Ahmed Khan" },
//   { id: "prisoner-6", name: "Carlos Mendez" },
//   { id: "prisoner-7", name: "Thomas Anderson" },
//   { id: "prisoner-8", name: "Sarah Johnson" },
// ];

// const complaintNatures = [
//   { id: "nature-1", name: "Medical Emergency" },
//   { id: "nature-2", name: "Poor Cell Conditions" },
//   { id: "nature-3", name: "Food Quality" },
//   { id: "nature-4", name: "Visitation Rights" },
//   { id: "nature-5", name: "Physical Assault" },
//   { id: "nature-6", name: "Legal Access" },
//   { id: "nature-7", name: "Property Damage" },
//   { id: "nature-8", name: "Hygiene Issues" },
//   { id: "nature-9", name: "Harassment" },
//   { id: "nature-10", name: "Other" },
// ];

// const priorities = [
//   { id: "priority-1", name: "Critical" },
//   { id: "priority-2", name: "High" },
//   { id: "priority-3", name: "Medium" },
//   { id: "priority-4", name: "Low" },
// ];

// const ranks = [
//   { id: "rank-1", name: "Chief Inspector" },
//   { id: "rank-2", name: "Inspector" },
//   { id: "rank-3", name: "Sergeant" },
//   { id: "rank-4", name: "Constable" },
// ];

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  isOpen,
  onClose,
  onSave,
  complaint,
  mode,
  stations = [],
  prisoners = [],
  complaintNatures = [],
  priorities = [],
  ranks = [],
}) => {
  const [actions, setActions] = useState<ComplaintAction[]>([]);
  const [isAddingAction, setIsAddingAction] = useState(false);
  // add search state for prisoners and stations
  const [prisonerSearch, setPrisonerSearch] = useState("");
  const [stationSearch, setStationSearch] = useState("");
  const [currentActionForm, setCurrentActionForm] = useState<ActionFormData>({
    action: "",
    action_date: new Date().toISOString().split("T")[0],
    action_status: "OPEN",
    action_remark: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    defaultValues: {
      prisoner: "",
      prisoner_name: "",
      station: "",
      nature_of_complaint: "",
      complaint_priority: "",
      complaint: "",
      complaint_remark: "",
      complaint_date: new Date().toISOString().split("T")[0],
      complaint_status: "OPEN",
      officer_requested_username: "",
      force_number: "",
      rank: "",
      response: "",
    },
  });

  // Watch form values for selects
  const watchStation = watch("station");
  const watchNature = watch("nature_of_complaint");
  const watchPriority = watch("complaint_priority");
  const watchStatus = watch("complaint_status");
  const watchRank = watch("rank");
  const watchPrisoner = watch("prisoner");

  // Initialize form with complaint data if editing
  useEffect(() => {
    if (complaint && mode === "edit") {
      setValue("prisoner", complaint.prisoner);
      setValue("station", complaint.station);
      setValue("nature_of_complaint", complaint.nature_of_complaint);
      setValue("complaint_priority", complaint.complaint_priority);
      setValue("complaint", complaint.complaint);
      setValue("complaint_remark", complaint.complaint_remark);
      setValue(
        "complaint_date",
        complaint.complaint_date.split("T")[0],
      );
      setValue("complaint_status", complaint.complaint_status);
      setValue("officer_requested_username", complaint.officer_requested_username);
      setValue("force_number", complaint.force_number);
      setValue("rank", complaint.rank);
      setValue("response", complaint.response || "");
      setActions(complaint.actions || []);
    } else {
      reset();
      setActions([]);
    }
  }, [complaint, mode, setValue, reset]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setActions([]);
      setIsAddingAction(false);
      setCurrentActionForm({
        action: "",
        action_date: new Date().toISOString().split("T")[0],
        action_status: "OPEN",
        action_remark: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: ComplaintFormData) => {
    // Get names from IDs
    const stationName = stations.find((s) => s.id === data.station)?.name || "";
    const natureName = complaintNatures.find((n) => n.id === data.nature_of_complaint)?.name || "";
    const priorityName = priorities.find((p) => p.id === data.complaint_priority)?.name || "";
    const rankName = ranks.find((r) => r.id === data.rank)?.name || "";
    const prisonerName = prisoners.find((p) => p.id === (data as any).prisoner)?.name || (data as any).prisoner || "";

    const complaintData: Complaint = {
      id: complaint?.id || `complaint-${Date.now()}`,
      station_name: stationName,
      prisoner_name: prisonerName,
      nature_of_complaint_name: natureName,
      complaint_priority_name: priorityName,
      officer_requested_username: data.officer_requested_username,
      rank_name: rankName,
      created_by_name: "Current User",
      actions: actions,
      created_datetime: complaint?.created_datetime || new Date().toISOString(),
      is_active: true,
      updated_datetime: new Date().toISOString(),
      deleted_datetime: null,
      complaint: data.complaint,
      complaint_date: new Date(data.complaint_date).toISOString(),
      complaint_status: data.complaint_status,
      complaint_remark: data.complaint_remark,
      date_of_response: data.response ? new Date().toISOString() : null,
      force_number: data.force_number,
      response: data.response,
      created_by: 1,
      updated_by: 1,
      deleted_by: null,
      station: data.station,
      prisoner: (data as any).prisoner || data.prisoner_name,
      nature_of_complaint: data.nature_of_complaint,
      complaint_priority: data.complaint_priority,
      officer_requested: 1,
      rank: data.rank,
    };

    try {
      await onSave(complaintData);
      toast.success(
        mode === "add" ? "Complaint created successfully" : "Complaint updated successfully",
      );
      onClose();
    } catch (err) {
      // axiosInstance interceptors already show detailed toast for many errors.
      toast.error("Failed to save complaint. Please check your input.");
    }
  };

  const handleAddAction = () => {
    if (!currentActionForm.action.trim()) {
      toast.error("Please enter an action description");
      return;
    }

    const newAction: ComplaintAction = {
      id: `action-${Date.now()}`,
      created_by_name: "Current User",
      created_datetime: new Date().toISOString(),
      is_active: true,
      updated_datetime: new Date().toISOString(),
      deleted_datetime: null,
      action: currentActionForm.action,
      action_date: new Date(currentActionForm.action_date).toISOString(),
      action_status: currentActionForm.action_status,
      action_remark: currentActionForm.action_remark,
      created_by: 1,
      updated_by: null,
      deleted_by: null,
      complaint: complaint?.id || "",
    };

    setActions([...actions, newAction]);
    setCurrentActionForm({
      action: "",
      action_date: new Date().toISOString().split("T")[0],
      action_status: "OPEN",
      action_remark: "",
    });
    setIsAddingAction(false);
    toast.success("Action added successfully");
  };

  const handleRemoveAction = (actionId: string) => {
    setActions(actions.filter((a) => a.id !== actionId));
    toast.success("Action removed");
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#650000]">
            {mode === "add" ? "New Complaint" : "Edit Complaint"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new complaint record"
              : "Update complaint details and manage actions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-[#650000] mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchPrisoner}
                  onValueChange={(value) => setValue("prisoner", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select prisoner" />
                  </SelectTrigger>
                  <SelectContent>
                    {prisoners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(errors as any).prisoner?.message}</p>
                )}
              </div> */}
                <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchPrisoner}
                  onValueChange={(value: string) => setValue("prisoner", value)}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Select prisoner" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-3 py-2">
                    <Input
                      placeholder="Search prisoner..."
                      value={prisonerSearch}
                      onChange={(e) => setPrisonerSearch(e.target.value)}
                      className="mb-2"
                    />
                    </div>
                    {prisoners
                    .filter((p) => {
                      if (!prisonerSearch) return true;
                      return p.name?.toLowerCase().includes(prisonerSearch.toLowerCase());
                    })
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(errors as any).prisoner?.message}</p>
                )}
                </div>

                <div>
                <Label htmlFor="station">
                  Station <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchStation}
                  onValueChange={(value) => setValue("station", value)}
                >
                  <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                  <div className="px-3 py-2">
                    <Input
                    placeholder="Search station..."
                    value={stationSearch}
                    onChange={(e) => setStationSearch(e.target.value)}
                    className="mb-2"
                    />
                  </div>
                  {stations
                    .filter((s) => {
                    if (!stationSearch) return true;
                    return s.name?.toLowerCase().includes(stationSearch.toLowerCase());
                    })
                    .map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.station && (
                  <p className="text-red-500 text-sm mt-1">
                  {errors.station.message}
                  </p>
                )}
                </div>

              <div>
                <Label htmlFor="complaint_date">
                  Complaint Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="complaint_date"
                  type="date"
                  {...register("complaint_date", {
                    required: "Complaint date is required",
                  })}
                />
                {errors.complaint_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.complaint_date.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="complaint_status">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchStatus}
                  onValueChange={(value) =>
                    setValue(
                      "complaint_status",
                      value as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Complaint Details */}
          <div>
            <h3 className="text-[#650000] mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Complaint Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nature_of_complaint">
                  Nature of Complaint <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchNature}
                  onValueChange={(value) =>
                    setValue("nature_of_complaint", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nature" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintNatures.map((nature) => (
                      <SelectItem key={nature.id} value={nature.id}>
                        {nature.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.nature_of_complaint && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.nature_of_complaint.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="complaint_priority">
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchPriority}
                  onValueChange={(value) =>
                    setValue("complaint_priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.id} value={priority.id}>
                        {priority.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.complaint_priority && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.complaint_priority.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="complaint">
                  Complaint Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="complaint"
                  {...register("complaint", {
                    required: "Complaint description is required",
                  })}
                  placeholder="Describe the complaint in detail..."
                  rows={4}
                />
                {errors.complaint && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.complaint.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="complaint_remark">Remarks</Label>
                <Textarea
                  id="complaint_remark"
                  {...register("complaint_remark")}
                  placeholder="Additional remarks or notes..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Officer Assignment */}
          <div>
            <h3 className="text-[#650000] mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Officer Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="officer_requested_username">
                  Officer Username
                </Label>
                <Input
                  id="officer_requested_username"
                  {...register("officer_requested_username")}
                  placeholder="officer.username"
                />
              </div>

              <div>
                <Label htmlFor="force_number">Force Number</Label>
                <Input
                  id="force_number"
                  {...register("force_number")}
                  placeholder="PF-12345"
                />
              </div>

              <div>
                <Label htmlFor="rank">Rank</Label>
                <Select
                  value={watchRank}
                  onValueChange={(value) => setValue("rank", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranks.map((rank) => (
                      <SelectItem key={rank.id} value={rank.id}>
                        {rank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="response">Response</Label>
                <Textarea
                  id="response"
                  {...register("response")}
                  placeholder="Officer's response to the complaint..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#650000] flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Actions Taken ({actions.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingAction(true)}
                className="text-[#650000] border-[#650000]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Action
              </Button>
            </div>

            {/* Add Action Form */}
            {isAddingAction && (
              <Card className="mb-4 border-[#650000]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">New Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Action Description</Label>
                      <Input
                        value={currentActionForm.action}
                        onChange={(e) =>
                          setCurrentActionForm({
                            ...currentActionForm,
                            action: e.target.value,
                          })
                        }
                        placeholder="Describe the action taken..."
                      />
                    </div>

                    <div>
                      <Label>Action Date</Label>
                      <Input
                        type="date"
                        value={currentActionForm.action_date}
                        onChange={(e) =>
                          setCurrentActionForm({
                            ...currentActionForm,
                            action_date: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Action Status</Label>
                      <Select
                        value={currentActionForm.action_status}
                        onValueChange={(value) =>
                          setCurrentActionForm({
                            ...currentActionForm,
                            action_status: value as
                              | "OPEN"
                              | "IN_PROGRESS"
                              | "COMPLETED"
                              | "CANCELLED",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">Open</SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            In Progress
                          </SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Action Remark</Label>
                      <Input
                        value={currentActionForm.action_remark}
                        onChange={(e) =>
                          setCurrentActionForm({
                            ...currentActionForm,
                            action_remark: e.target.value,
                          })
                        }
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddAction}
                      className="bg-[#650000] hover:bg-[#4a0000]"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save Action
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingAction(false)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions List */}
            {actions.length === 0 && !isAddingAction ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No actions added yet
              </p>
            ) : (
              <div className="space-y-3">
                {actions.map((action, index) => (
                  <Card key={action.id} className="border-l-4 border-l-[#650000]">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#650000] text-white text-sm">
                              {index + 1}
                            </span>
                            <p>{action.action}</p>
                            {getActionStatusBadge(action.action_status)}
                          </div>
                          <div className="ml-8 space-y-1">
                            <p className="text-sm text-gray-600">
                              {action.action_remark}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(action.action_date).toLocaleDateString()} •{" "}
                              {action.created_by_name}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAction(action.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#650000] hover:bg-[#4a0000]"
            >
              <Save className="h-4 w-4 mr-2" />
              {mode === "add" ? "Create Complaint" : "Update Complaint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintForm;

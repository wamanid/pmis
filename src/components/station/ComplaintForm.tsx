import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";
import SearchableSelect from "../common/SearchableSelect";
import DatePicker from "../common/DatePicker";
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
import * as ComplaintsService from "../../services/stationServices/complaintsService";

interface ComplaintAction {
  id: string;
  created_by_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  action: string;
  action_date: string;
  // store UUID or name from backend — keep as string
  action_status: string;
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
  // backend provides UUID for statuses, store as string
  complaint_status: string;
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
  complaint_status: string; // UUID from backend
  officer_requested_username: string;
  force_number: string;
  rank: string;
  response: string;
}

interface ActionFormData {
  action: string;
  action_date: string;
  // store selected approval-status id (UUID) from API (string)
  action_status: string;
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
  const [stationSearch, setStationSearch] = useState("");
  const [currentActionForm, setCurrentActionForm] = useState<ActionFormData>({
    action: "",
    action_date: new Date().toISOString().split("T")[0],
    // start blank; we populate with UUID when user picks from select
    action_status: "",
    action_remark: "",
  });
  const [staffProfiles, setStaffProfiles] = useState<any[]>([]);
  const [staffSearch, setStaffSearch] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  // derived options that combine searchable fields so SearchableSelect can match force number, username or name
  const staffOptions = staffProfiles.map(sp => ({
    ...sp,
    search_label: `${sp.force_number ?? ""} ${sp.username ?? ""} ${sp.name ?? ""}`.trim(),
  }));

  // display name for station (auto-populated when prisoner selected)
  const [stationDisplay, setStationDisplay] = useState<string>("");

  // complaint statuses loaded from backend (ids + names)
  const [complaintStatuses, setComplaintStatuses] = useState<any[]>([]);
  // approval statuses used for action status select (fetched from system-administration/approval-statuses/)
  const [approvalStatuses, setApprovalStatuses] = useState<any[]>([]);
  // track actions that are pending (not yet persisted)
  const [pendingActions, setPendingActions] = useState<ComplaintAction[]>([]);

  // local small cache for initial items / quick prefill (rename to avoid conflict with prop)
  const [localPrisoners, setLocalPrisoners] = useState<any[]>(prisoners ?? []);
  const [originalStationLabel, setOriginalStationLabel] = useState<string>("");
  // when editing an existing complaint, populate prisoner + station and keep them non-editable
  useEffect(() => {
    if (!complaint || mode !== "edit") {
      // clear when not editing
      setOriginalStationLabel("");
      return;
    }
    // complaint.prisoner is the prisoner id, complaint.prisoner_name is display name
    try {
      // set form fields (react-hook-form setValue must be in scope)
      if (typeof setValue === "function") {
        setValue("prisoner", complaint.prisoner ?? null);
        setValue("original_station", complaint.station ?? "");
        // also ensure main station field is set (used by hidden input / submission)
        setValue("station", complaint.station ?? "");
      }
    } catch (e) {
      // ignore if setValue not available
    }
    // populate both station display states so the UI shows the station on edit
    setOriginalStationLabel(complaint.station_name ?? "");
    setStationDisplay(complaint.station_name ?? "");
    // ensure local cache contains the prisoner object so CustomPrisonerSearch (or display) can show label
    const p = localPrisoners.find((pr: any) => String(pr.id) === String(complaint.prisoner));
    if (!p) {
      const newPr = {
        id: complaint.prisoner,
        full_name: complaint.prisoner_name ?? "",
        current_station: complaint.station ?? "",
        current_station_name: complaint.station_name ?? "",
      };
      setLocalPrisoners((prev) => [newPr, ...prev]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint, mode]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    control,
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
  const watchForceNumber = watch("force_number");

  // Initialize form with complaint data if editing
  useEffect(() => {
    if (complaint && mode === "edit") {
      setValue("prisoner", complaint.prisoner);
      setValue("station", complaint.station);
      // set human-friendly display for station (use complaint.station_name if present)
      setStationDisplay(complaint.station_name ?? "");
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
        // start blank; we populate with UUID when user picks from select
        action_status: "",
        action_remark: "",
      });
    }
  }, [isOpen, reset]);

  // load staff profiles once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const st = await ComplaintsService.fetchStaffProfiles();
        if (!mounted) return;
        setStaffProfiles(st || []);
        // if editing and complaint has officer_requested, set selectedStaffId
        if (complaint?.officer_requested) {
          setSelectedStaffId(String(complaint.officer_requested));
        }
      } catch (err) {}
    })();
    return () => { mounted = false; };
  }, [complaint]);

  // when selectedStaffId changes populate form values
  useEffect(() => {
    if (!selectedStaffId) {
      setValue("officer_requested", "");
      setValue("force_number", "");
      setValue("officer_requested_username", "");
      setValue("rank", "");
      setValue("rank_name", "");
      return;
    }
    const s = staffProfiles.find(sp => String(sp.id) === String(selectedStaffId));
    if (s) {
      // submitable values
      setValue("officer_requested", s.id);           // PK expected by backend
      setValue("force_number", s.force_number ?? ""); // textual
      setValue("rank", s.rank ?? "");                // UUID (submit)
      // user-facing / disabled values
      setValue("officer_requested_username", s.username ?? "");
      setValue("rank_name", s.rank_name ?? "");
    }
  }, [selectedStaffId, staffProfiles, setValue]);

  // When prisoner changes, auto-populate station (read-only)
  useEffect(() => {
    const pid = watchPrisoner;
    if (!pid) {
      setValue("station", "");
      setStationDisplay("");
      return;
    }
    const p = localPrisoners.find((pr: any) => String(pr.id) === String(pid));
    if (p) {
      // support multiple prisoner item shapes: prefer explicit fields, fallback to .raw or name/full_name
      const stationId =
        p.current_station ??
        p.current_station_id ??
        p.raw?.current_station ??
        p.station ??
        p.station_id ??
        "";
      const stationName =
        p.current_station_name ??
        p.current_stationName ??
        p.raw?.current_station_name ??
        p.name ??
        p.full_name ??
        "";
      // set the hidden station value (id) and the UI label (name)
      setValue("station", stationId || "");
      setStationDisplay(stationName || stationId || "");
    } else {
      setValue("station", "");
      setStationDisplay("");
    }
  }, [watchPrisoner, localPrisoners, setValue]);

  // load complaint statuses from backend
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const sts = await ComplaintsService.fetchComplaintStatuses(c.signal);
        if (!mounted) return;
        setComplaintStatuses(sts ?? []);
      } catch (err) {
        console.error('load complaint statuses', err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // load approval statuses for action status select
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        // service should return array of { id, name } from /system-administration/approval-statuses/
        const ap = await (ComplaintsService.fetchApprovalStatuses?.(c.signal) ?? ComplaintsService.fetchApprovalStatuses?.());
        if (!mounted) return;
        setApprovalStatuses(ap ?? []);
      } catch (err) {
        console.error('load approval statuses', err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  const onSubmit = async (data: ComplaintFormData) => {
    // Get names from IDs
    const stationName = stations.find((s) => s.id === data.station)?.name || "";
    const natureName = complaintNatures.find((n) => n.id === data.nature_of_complaint)?.name || "";
    const priorityName = priorities.find((p) => p.id === data.complaint_priority)?.name || "";
    const rankName = ranks.find((r) => r.id === data.rank)?.name || "";
    const prisonerName = localPrisoners.find((p) => p.id === (data as any).prisoner)?.name || (data as any).prisoner || "";

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
      // data.complaint_status is UUID from API list
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
      officer_requested: (data as any).officer_requested || undefined,
      rank: data.rank,
    };

    // submitPayload to ensure correct UUIDs are sent
    const submitPayload = {
      ...data,
      complaint_status: data.complaint_status, // UUID from API
      complaint_priority: data.complaint_priority, // ensure id
      officer_requested: data.officer_requested, // staff.id
      rank: data.rank, // rank UUID
      force_number: data.force_number, // string
    };

    // ensure we include the existing complaint id when editing so update uses correct URL
    if (mode === "edit" && complaint?.id) {
      (submitPayload as any).id = complaint.id;
    }
    try {
      const created = await onSave(submitPayload);
      // if there are pending actions (created while adding new complaint), persist them now
      const createdId = created?.id ?? created;
      if (createdId && pendingActions.length > 0) {
        for (const a of pendingActions) {
          try {
            const payload = {
              action: a.action,
              action_date: new Date(a.action_date).toISOString(),
              action_remark: a.action_remark,
              complaint: createdId,
              // resolve action_status -> uuid if possible
              action_status: (() => {
                // if value already looks like a UUID (contains -) assume it's an id
                if (String(a.action_status).includes("-")) return a.action_status;
                const resolved = complaintStatuses.find(s =>
                  String(s.name).toLowerCase().includes(String(a.action_status).toLowerCase())
                );
                return resolved?.id ?? a.action_status;
              })(),
            };
            await ComplaintsService.createComplaintAction(payload);
          } catch (err) {
            console.error('create pending action error', err);
          }
        }
        setPendingActions([]);
      }
      toast.success(
        mode === "add" ? "Complaint created successfully" : "Complaint updated successfully",
      );
      onClose();
    } catch (err) {
      // axiosInstance interceptors already show detailed toast for many errors.
      toast.error("Failed to save complaint. Please check your input.");
    }
  };

  const handleAddAction = async () => {
    if (!currentActionForm.action.trim()) {
      toast.error("Please enter an action description");
      return;
    }

    const tempAction: ComplaintAction = {
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

    // If complaint exists (editing), persist action immediately.
    if (complaint?.id) {
      try {
        const payload = {
          action: tempAction.action,
          action_date: new Date(tempAction.action_date).toISOString(),
          action_remark: tempAction.action_remark,
          complaint: complaint.id,
          action_status: (() => {
            if (String(tempAction.action_status).includes("-")) return tempAction.action_status;
            const resolved = complaintStatuses.find(s =>
              String(s.name).toLowerCase().includes(String(tempAction.action_status).toLowerCase())
            );
            return resolved?.id ?? tempAction.action_status;
          })(),
        };
        const created = await ComplaintsService.createComplaintAction(payload);
        // normalize returned action (many APIs return created object)
        const createdAction: ComplaintAction = {
          id: created?.id ?? tempAction.id,
          created_by_name: created?.created_by_name ?? tempAction.created_by_name,
          created_datetime: created?.created_datetime ?? tempAction.created_datetime,
          is_active: created?.is_active ?? true,
          updated_datetime: created?.updated_datetime ?? tempAction.updated_datetime,
          deleted_datetime: created?.deleted_datetime ?? null,
          action: created?.action ?? tempAction.action,
          action_date: created?.action_date ?? tempAction.action_date,
          action_status: created?.action_status ?? tempAction.action_status,
          action_remark: created?.action_remark ?? tempAction.action_remark,
          created_by: created?.created_by ?? tempAction.created_by,
          updated_by: created?.updated_by ?? tempAction.updated_by,
          deleted_by: created?.deleted_by ?? tempAction.deleted_by,
          complaint: created?.complaint ?? tempAction.complaint,
        };
        setActions(prev => [...prev, createdAction]);
      } catch (err) {
        console.error('persist action error', err);
        toast.error('Failed to save action. It will be kept locally until the complaint is saved.');
        // fallback to keeping locally so user doesn't lose input
        setActions(prev => [...prev, tempAction]);
      }
    } else {
      // For new complaint: keep locally in pendingActions and UI
      setPendingActions(prev => [...prev, tempAction]);
      setActions(prev => [...prev, tempAction]);
    }

    setCurrentActionForm({
      action: "",
      action_date: new Date().toISOString().split("T")[0],
      // start blank; we populate with UUID when user picks from select
      action_status: "",
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
    status: string,
  ) => {
    // resolve status name from approvalStatuses if status is an id (UUID)
    const resolved = approvalStatuses.find(s => String(s.id) === String(status)) ?? approvalStatuses.find(s => String(s.name).toUpperCase() === String(status).toUpperCase());
    const name = resolved?.name ?? status;
    const key = String(name).toUpperCase().replace(/\s+/g, "_");
    const statusConfig: Record<string, { color: string }> = {
      OPEN: { color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      IN_PROGRESS: { color: "bg-blue-50 text-blue-700 border-blue-200" },
      COMPLETED: { color: "bg-green-50 text-green-700 border-green-200" },
      CANCELLED: { color: "bg-red-50 text-red-700 border-red-200" },
    };
    const config = statusConfig[key] ?? { color: "bg-gray-50 text-gray-700 border-gray-200" };
    return (
      <Badge className={`${config.color} border`} variant="outline">
        {name.replace("_", " ")}
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

              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => {
                    // when editing, show a disabled input with prisoner name (not editable)
                    if (mode === "edit") {
                      const displayName =
                        localPrisoners.find((pr: any) => String(pr.id) === String(field.value))?.full_name ??
                        complaint?.prisoner_name ??
                        "";
                      return <Input disabled value={displayName} />;
                    }

                    return (
                      <CustomPrisonerSearch
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        onSelectItem={(p: any) => {
                          // set prisoner id on form
                          field.onChange(p?.id ?? null);
                          // auto-populate original_station (store ID) but show name in the disabled label field
                          if (typeof setValue === "function") {
                            setValue("original_station", p?.current_station ?? "");
                          }
                          setOriginalStationLabel(p?.current_station_name ?? "");
                          // update local cache so initialItems contains selection next time
                          setLocalPrisoners((prev) => (prev.some((x) => String(x.id) === String(p.id)) ? prev : [p, ...prev]));
                        }}
                        placeholder="Select prisoner"
                        idField="id"
                        labelField="full_name"
                        initialItems={localPrisoners}
                        pageSize={25}
                      />
                    );
                  }}
                />
                {errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(errors as any).prisoner?.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="station">
                  Station (auto-populated) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="station_display"
                  value={stationDisplay}
                  placeholder="Station will be filled when prisoner is selected"
                  disabled
                  readOnly
                />
                {/* hidden value to submit station id/name */}
                <input type="hidden" {...register("station")} />
                {errors.station && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.station.message}
                  </p>
                )}
              </div>

              <div>
                {/* <Label htmlFor="complaint_date">
                  Complaint Date <span className="text-red-500">*</span>
                </Label> */}
                <Controller
                  name="complaint_date"
                  control={control}
                  rules={{ required: "Complaint date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      label="Complaint Date"
                      required
                      value={field.value ? new Date(field.value) : null}
                      onChange={(d) => field.onChange(d ? d.toISOString().split("T")[0] : "")}
                      placeholder="Pick a date"
                    />
                  )}
                />
                {errors.complaint_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.complaint_date.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="complaint_status" className="mb-2">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchStatus ?? ""}
                  onValueChange={(value) => setValue("complaint_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(complaintStatuses || []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
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
                <SearchableSelect
                  value={watchNature ?? null}
                  onChange={(v) => setValue("nature_of_complaint", v ?? "")}
                  items={complaintNatures}
                  idField="id"
                  labelField="name"
                  placeholder="Select nature"
                  pageSize={25}
                  className="w-full"
                />
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
                <Label htmlFor="force_number">Force Number <span className="text-red-500">*</span></Label>
                <SearchableSelect
                  value={selectedStaffId ?? null}
                  // when user selects an item, populate the form fields immediately
                  onChange={(v) => {
                    if (!v) {
                      setSelectedStaffId(null);
                      setValue("officer_requested", "");
                      setValue("force_number", "");
                      setValue("rank", "");
                      setValue("officer_requested_username", "");
                      setValue("rank_name", "");
                      return;
                    }
                    const s = staffOptions.find(sp => String(sp.id) === String(v));
                    if (s) {
                      setSelectedStaffId(String(s.id));
                      // set fields expected by backend (ids) and user-facing fields
                      setValue("officer_requested", s.id);
                      setValue("force_number", s.force_number ?? "");
                      setValue("rank", s.rank ?? "");
                      setValue("officer_requested_username", s.username ?? "");
                      setValue("rank_name", s.rank_name ?? "");
                    } else {
                      setSelectedStaffId(String(v));
                    }
                  }}
                  items={staffOptions}
                  idField="id"
                  // search_label contains force_number + username + name so users can search by any
                  labelField="search_label"
                  placeholder="Search by force number, username or name"
                  pageSize={25}
                  renderItem={(sp: any) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{sp.force_number}</span>
                      <span className="text-xs text-muted-foreground">{sp.username} {sp.name ? ` • ${sp.name}` : ""}</span>
                    </div>
                  )}
                  className="w-full"
                />
                {errors.force_number && <p className="text-red-500 text-sm mt-1">{(errors as any).force_number?.message}</p>}
              </div>

              {/* Officer Username - disabled */}
              <div>
                <Label htmlFor="officer_requested_username">Officer Username</Label>
                <Input id="officer_requested_username" {...register("officer_requested_username")} disabled readOnly />
              </div>

              {/* Rank - visible rank_name disabled, but submit rank UUID in hidden field */}
              <div>
                <Label htmlFor="rank_name">Rank</Label>
                <Input id="rank_name" {...register("rank_name")} disabled readOnly />
                {/* hidden actual rank id value for submission */}
                <input type="hidden" {...register("rank")} />
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
                            // value will be the approval-status id (UUID) returned by API
                            action_status: String(value ?? ""),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {(approvalStatuses || []).map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
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

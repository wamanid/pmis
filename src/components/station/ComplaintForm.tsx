import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useFilters } from "../../contexts/FilterContext";
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";
import SearchableSelect from "../common/SearchableSelect";
import StaffProfileSelect from "../common/StaffProfileSelect";
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
  officer_requested_username?: string; // Optional - may not be in API response
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
  officer_requested: string; // Changed from number to string - API returns UUID
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
  officer_requested?: string; // officer ID
  force_number: string;
  rank: string;
  rank_name?: string; // display name for rank
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
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({
  isOpen,
  onClose,
  onSave,
  complaint,
  mode,
}) => {
  const { region: globalRegion, district: globalDistrict, station: globalStation } = useFilters();
  const [actions, setActions] = useState<ComplaintAction[]>([]);
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [currentActionForm, setCurrentActionForm] = useState<ActionFormData>({
    action: "",
    action_date: new Date().toISOString().split("T")[0],
    action_status: "",
    action_remark: "",
  });
  // Track if we've initialized officer to prevent clearing on re-renders
  const isOfficerInitialized = React.useRef(false);
  
  // Initialize selectedStaffId from complaint data to avoid null flash
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(() => {
    if (complaint && mode === "edit" && complaint.officer_requested) {
      isOfficerInitialized.current = true;
      return complaint.officer_requested;
    }
    return null;
  });

  // display name for station (auto-populated when prisoner selected)
  const [stationDisplay, setStationDisplay] = useState<string>("");

  // complaint statuses loaded from backend (ids + names)
  const [complaintStatuses, setComplaintStatuses] = useState<any[]>([]);
  // approval statuses used for action status select (fetched from system-administration/approval-statuses/)
  const [approvalStatuses, setApprovalStatuses] = useState<any[]>([]);
  // track actions that are pending (not yet persisted)
  const [pendingActions, setPendingActions] = useState<ComplaintAction[]>([]);

  const [originalStationLabel, setOriginalStationLabel] = useState<string>("");
  const [selectsKey, setSelectsKey] = useState<number>(0);
  
  // Derive initial items directly from complaint prop to avoid timing issues
  const initialNature = (complaint && mode === "edit" && complaint.nature_of_complaint && complaint.nature_of_complaint_name)
    ? { id: complaint.nature_of_complaint, name: complaint.nature_of_complaint_name }
    : null;
  
  const initialPriority = (complaint && mode === "edit" && complaint.complaint_priority && complaint.complaint_priority_name)
    ? { id: complaint.complaint_priority, name: complaint.complaint_priority_name }
    : null;
  
  // Local state for SearchableSelect values - initialize from complaint immediately
  const [localNatureValue, setLocalNatureValue] = useState<string | null>(null);
  const [localPriorityValue, setLocalPriorityValue] = useState<string | null>(null);
  
  // Update local state when complaint data changes (from fresh API data)
  useEffect(() => {
    if (complaint && mode === "edit") {
      setLocalNatureValue(complaint.nature_of_complaint || null);
      setLocalPriorityValue(complaint.complaint_priority || null);
      // Force SearchableSelect to remount with fresh initialItem
      setSelectsKey(k => k + 1);
    } else {
      setLocalNatureValue(null);
      setLocalPriorityValue(null);
    }
  }, [complaint?.nature_of_complaint, complaint?.complaint_priority, mode]);
  
  // Derive initial form values synchronously to avoid timing issues
  const initialFormValues = React.useMemo(() => {
    if (complaint && mode === "edit") {
      return {
        prisoner: complaint.prisoner,
        prisoner_name: complaint.prisoner_name || "",
        station: complaint.station,
        nature_of_complaint: complaint.nature_of_complaint,
        complaint_priority: complaint.complaint_priority,
        complaint: complaint.complaint,
        complaint_remark: complaint.complaint_remark,
        complaint_date: complaint.complaint_date.split("T")[0],
        complaint_status: complaint.complaint_status,
        officer_requested_username: complaint.officer_requested_username || "",
        officer_requested: complaint.officer_requested, // Already a string UUID from API
        force_number: complaint.force_number,
        rank: complaint.rank,
        rank_name: complaint.rank_name || "",
        response: complaint.response || "",
      };
    }
    return {
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
      officer_requested: "",
      force_number: "",
      rank: "",
      rank_name: "",
      response: "",
    };
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
    defaultValues: initialFormValues as ComplaintFormData,
  });

  // Reset form when initialFormValues change (when complaint changes)
  useEffect(() => {
    if (isOpen && mode === "edit" && complaint) {
      // Update local state (in case complaint changed)
      setLocalNatureValue(initialFormValues.nature_of_complaint || null);
      setLocalPriorityValue(initialFormValues.complaint_priority || null);
      
      // Use reset with options to ensure all fields update
      reset(initialFormValues as ComplaintFormData, { 
        keepDefaultValues: false,
        keepDirty: false,
        keepTouched: false,
      });
    }
  }, [isOpen, complaint?.nature_of_complaint, complaint?.complaint_priority, complaint?.officer_requested, complaint?.force_number, complaint?.rank, mode, initialFormValues, reset]);

  // Watch form values for selects
  const watchStation = watch("station");
  const watchNature = watch("nature_of_complaint");
  const watchPriority = watch("complaint_priority");
  const watchStatus = watch("complaint_status");
  const watchRank = watch("rank");
  const watchRankName = watch("rank_name");
  const watchPrisoner = watch("prisoner");
  const watchForceNumber = watch("force_number");

  // Initialize display states when editing
  useEffect(() => {
    if (complaint && mode === "edit") {
      setStationDisplay(complaint.station_name ?? "");
      setActions(complaint.actions || []);
      // Only set if we have an officer and haven't initialized yet, or if the officer changed
      const newOfficerId = complaint.officer_requested || null;
      if (newOfficerId && (!isOfficerInitialized.current || selectedStaffId !== newOfficerId)) {
        console.log('Setting selectedStaffId to:', newOfficerId);
        setSelectedStaffId(newOfficerId);
        isOfficerInitialized.current = true;
      }
    } else if (mode === "add") {
      // Reset when switching to add mode
      setSelectedStaffId(null);
      isOfficerInitialized.current = false;
    }
  }, [complaint?.officer_requested, complaint?.station_name, mode, selectedStaffId]);

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
      // Reset officer selection and auto-populated fields
      setSelectedStaffId(null);
      isOfficerInitialized.current = false;
      setStationDisplay("");
      setOriginalStationLabel("");
      // Clear pending actions
      setPendingActions([]);
    }
  }, [isOpen, reset]);

  // Fetch staff details only when user manually changes officer selection
  useEffect(() => {
    // Skip if no staff selected OR if we're editing and staff ID matches existing complaint
    if (!selectedStaffId || (mode === "edit" && complaint?.officer_requested === selectedStaffId)) {
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        const response = await ComplaintsService.fetchStaffProfiles({
          id: selectedStaffId,
          page: 1,
          page_size: 1,
        }, controller.signal);
        
        if (!mounted) return;
        
        const results = response?.results ?? [];
        const s = results.length > 0 ? results[0] : null;
        
        if (s) {
          setValue("officer_requested", s.id);
          setValue("force_number", s.force_number ?? "");
          setValue("rank", s.rank ?? "");
          setValue("officer_requested_username", s.username ?? "");
          setValue("rank_name", s.rank_name ?? "");
        }
      } catch (err: any) {
        if (
          err?.name === 'AbortError' ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return;
        }
        console.error('Failed to fetch staff details:', err);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [selectedStaffId, mode, complaint?.officer_requested, setValue]);

  // When prisoner changes, fetch prisoner details to auto-populate station (read-only)
  // This only runs if station is not already set (e.g., when editing)
  useEffect(() => {
    const pid = watchPrisoner;
    if (!pid) {
      setValue("station", "");
      setStationDisplay("");
      return;
    }
    
    // If station is already set, don't fetch again
    if (stationDisplay) {
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        const response = await ComplaintsService.fetchPrisoners({
          id: pid,
          page: 1,
          page_size: 1,
        }, controller.signal);
        
        if (!mounted) return;
        
        const results = response?.results ?? [];
        const p = results.length > 0 ? results[0] : null;
        
        if (p) {
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
          setValue("station", stationId || "");
          setStationDisplay(stationName || stationId || "");
        } else {
          setValue("station", "");
          setStationDisplay("");
        }
      } catch (err: any) {
        if (
          err?.name === 'AbortError' ||
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED'
        ) {
          return;
        }
        console.error('Failed to fetch prisoner details:', err);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [watchPrisoner, setValue]);

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

  // Fetch paginated callbacks for SearchableSelect components
  const fetchNaturesPaginated = useCallback(
    async (opts: any, signal?: AbortSignal) => {
      try {
        const response = await ComplaintsService.fetchComplaintNatures({
          search: opts?.search || '',
          page: opts?.page || 1,
          page_size: opts?.page_size || 50,
        }, signal);
        const payload = response?.results ? response : { results: response || [], count: 0 };
        return {
          items: payload?.results ?? [],
          count: payload?.count ?? 0,
          next: payload?.next ?? null,
        };
      } catch (error: any) {
        if (
          error?.name === 'CanceledError' ||
          error?.code === 'ERR_CANCELED' ||
          String(error?.message).toLowerCase().includes('canceled')
        ) {
          return { items: [], count: 0, next: null };
        }
        console.error('fetchNaturesPaginated error:', error);
        return { items: [], count: 0, next: null };
      }
    },
    []
  );

  const fetchPrioritiesPaginated = useCallback(
    async (opts: any, signal?: AbortSignal) => {
      try {
        const response = await ComplaintsService.fetchPriorities({
          search: opts?.search || '',
          page: opts?.page || 1,
          page_size: opts?.page_size || 50,
        }, signal);
        const payload = response?.results ? response : { results: response || [], count: 0 };
        return {
          items: payload?.results ?? [],
          count: payload?.count ?? 0,
          next: payload?.next ?? null,
        };
      } catch (error: any) {
        if (
          error?.name === 'CanceledError' ||
          error?.code === 'ERR_CANCELED' ||
          String(error?.message).toLowerCase().includes('canceled')
        ) {
          return { items: [], count: 0, next: null };
        }
        console.error('fetchPrioritiesPaginated error:', error);
        return { items: [], count: 0, next: null };
      }
    },
    []
  );

  const onSubmit = async (data: ComplaintFormData) => {
    // Names will be resolved by backend or displayed from form values
    const stationName = stationDisplay || "";
    const natureName = "";
    const priorityName = "";
    const rankName = data.rank_name || "";
    const prisonerName = "";

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
      const created = await onSave(submitPayload as any);
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
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
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
                      const displayName = complaint?.prisoner_name ?? "";
                      return <Input disabled value={displayName} className="bg-muted" />;
                    }

                    return (
                      <CustomPrisonerSearch
                        key={`prisoner-${isOpen}`}
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        onSelectItem={(p: any) => {
                          field.onChange(p?.id ?? null);
                          // Immediately set station from prisoner data to avoid slow API call
                          const stationId = p?.current_station ?? p?.current_station_id ?? p?.station ?? p?.station_id ?? "";
                          const stationName = p?.current_station_name ?? p?.current_stationName ?? "";
                          setValue("station", stationId || "");
                          setStationDisplay(stationName || stationId || "");
                          setOriginalStationLabel(stationName ?? "");
                        }}
                        placeholder="Select prisoner"
                        idField="id"
                        labelField="full_name"
                        pageSize={50}
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
                  className="bg-muted"
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
                  onValueChange={(value: string) => setValue("complaint_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select complaint status" />
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
                  key={`nature-${isOpen}-${complaint?.id}-${selectsKey}`}
                  value={localNatureValue}
                  onChange={(v) => {
                    setLocalNatureValue(v ?? null);
                    setValue("nature_of_complaint", v ?? "");
                  }}
                  fetchPaginated={fetchNaturesPaginated}
                  idField="id"
                  labelField="name"
                  placeholder="Select nature"
                  pageSize={50}
                  className="w-full"
                  initialItem={initialNature ?? undefined}
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
                <SearchableSelect
                  key={`priority-${isOpen}-${complaint?.id}-${selectsKey}`}
                  value={localPriorityValue}
                  onChange={(v) => {
                    setLocalPriorityValue(v ?? null);
                    setValue("complaint_priority", v ?? "");
                  }}
                  fetchPaginated={fetchPrioritiesPaginated}
                  idField="id"
                  labelField="name"
                  placeholder="Select priority"
                  pageSize={50}
                  className="w-full"
                  initialItem={initialPriority ?? undefined}
                />
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
                <Label htmlFor="force_number">Officer <span className="text-red-500">*</span></Label>
                <StaffProfileSelect
                  value={selectedStaffId ?? null}
                  onChange={(v) => setSelectedStaffId(v ?? null)}
                  placeholder="Select officer"
                  initialItem={(() => {
                    if (complaint && mode === "edit" && complaint.officer_requested) {
                      const item = {
                        id: complaint.officer_requested,
                        staff_name: complaint.officer_requested_username || complaint.force_number || "Unknown Officer",
                        force_number: complaint.force_number,
                        rank_name: complaint.rank_name
                      };
                      console.log('StaffProfileSelect initialItem:', item);
                      return item;
                    }
                    return undefined;
                  })()}
                />
                {errors.force_number && <p className="text-red-500 text-sm mt-1">{(errors as any).force_number?.message}</p>}
              </div>

              {/* Force Number - auto-populated */}
              <div>
                <Label htmlFor="force_number">Force Number</Label>
                <Input 
                  id="force_number" 
                  value={watchForceNumber ?? ""}
                  disabled 
                  readOnly 
                  className="bg-muted"
                  placeholder="Auto-populated"
                />
                <input type="hidden" {...register("force_number")} />
              </div>

              {/* Rank - visible rank_name disabled, but submit rank UUID in hidden field */}
              <div>
                <Label htmlFor="rank_name">Rank</Label>
                <Input 
                  id="rank_name" 
                  value={watchRankName ?? ""}
                  disabled 
                  readOnly 
                  className="bg-muted"
                  placeholder="Auto-populated"
                />
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
                        onValueChange={(value: string) =>
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

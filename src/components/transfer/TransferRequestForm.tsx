import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FileText,
  Calendar,
  User,
  Building2,
  Users,
  X,
  Save,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

import { fetchStations, fetchReasons, fetchStatuses } from "../../services/transferServices/transferRequestService";
import { createTransferRequest, updateTransferRequest } from "../../services/transferServices/transferRequestService";
import { fetchPrisoners } from "../../services/customPrisonersService";
import { fetchStaffProfiles } from "../../services/staffProfilesService";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import SearchableSelect from "../common/SearchableSelect"; // reusable searchable select
import StaffProfileSelect from "../common/StaffProfileSelect";
import CustomPrisonerSearch from "../common/CustomPrisonerSearch";


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

interface TransferRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransferRequest) => void;
  editingRequest?: TransferRequest | null;
  prisoners?: Array<{ id: string; name: string; number: string }>;
  stations?: Array<{ id: string; name: string }>;
  reasons?: Array<{ id: string; name: string }>;
  statuses?: Array<{ id: string; name: string }>;
  approvalStatuses?: Array<{ id: string; name: string }>;
  staff?: Array<{ id: number; name: string }>;
}

export default function TransferRequestForm({
  open,
  onClose,
  onSave,
  editingRequest,
  prisoners: prisonersProp = [],
  stations: stationsProp = [],
  reasons: reasonsProp = [],
  statuses: statusesProp = [],
  approvalStatuses = [],
  staff: staffProp = [],
}: TransferRequestFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransferRequest>({
    defaultValues: {
      bulk_transfer: false,
      number_of_prisoners: 1,
      original_station_oc_acknowledged: false,
      destination_station_oc_acknowledged: false,
      original_station_oc_approved_date: "",
      destination_station_oc_approved_date: "",
      prisoner: "",
      original_station: "",
      destination_station: "",
      reason: "",
      in_charge: "", // <- use empty string (controlled Select expects string)
      status: "",
      original_station_oc_approval_status: "",
      destination_station_oc_approval_status: "",
      original_station_oc_approved_by: "",
      destination_station_oc_approved_by: "",
    },
  });

  const isBulkTransfer = watch("bulk_transfer");

  // remove local prisoners/staff usage for selects (we still keep for initial items)
  const [stations, setStations] = useState<any[]>(stationsProp || []);
  const [prisoners, setPrisoners] = useState<any[]>(prisonersProp || []);
  const [reasons, setReasons] = useState<any[]>(reasonsProp || []);
  const [statuses, setStatuses] = useState<any[]>(statusesProp || []);
  const [staff, setStaff] = useState<any[]>(staffProp || []);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // label to display for original station (when single transfer)
  const [originalStationLabel, setOriginalStationLabel] = useState<string>("");

  // sync with global location filter to pre-filter stations when bulk
  useFilterRefresh(() => {
    const station = localStorage.getItem("selectedStation") || undefined;
    const region = localStorage.getItem("selectedRegion") || undefined;
    const district = localStorage.getItem("selectedDistrict") || undefined;
    // when global filter changes, reload stations (only used when bulk)
    loadStations({
      station: station && station !== "all" ? station : undefined,
      region: region && region !== "all" ? region : undefined,
      district: district && district !== "all" ? district : undefined,
    });
  }, []);

  useEffect(() => {
    if (editingRequest) {
      reset({
        bulk_transfer: editingRequest.bulk_transfer || false,
        number_of_prisoners: editingRequest.number_of_prisoners || 1,
        original_station_oc_acknowledged:
          editingRequest.original_station_oc_acknowledged || false,
        destination_station_oc_acknowledged:
          editingRequest.destination_station_oc_acknowledged || false,
        original_station_oc_approved_date:
          editingRequest.original_station_oc_approved_date?.split("T")[0] || "",
        destination_station_oc_approved_date:
          editingRequest.destination_station_oc_approved_date?.split("T")[0] || "",
        prisoner: editingRequest.prisoner || "",
        original_station: editingRequest.original_station || "",
        destination_station: editingRequest.destination_station || "",
        reason: editingRequest.reason || "",
        in_charge: editingRequest.in_charge || 0,
        status: editingRequest.status || "",
        original_station_oc_approval_status:
          editingRequest.original_station_oc_approval_status || "",
        destination_station_oc_approval_status:
          editingRequest.destination_station_oc_approval_status || "",
        original_station_oc_approved_by:
          editingRequest.original_station_oc_approved_by || 0,
        destination_station_oc_approved_by:
          editingRequest.destination_station_oc_approved_by || 0,
      });
    } else {
      reset({
        bulk_transfer: false,
        number_of_prisoners: 1,
        original_station_oc_acknowledged: false,
        destination_station_oc_acknowledged: false,
        original_station_oc_approved_date: "",
        destination_station_oc_approved_date: "",
        prisoner: "",
        original_station: "",
        destination_station: "",
        reason: "",
        in_charge: 0,
        status: "",
        original_station_oc_approval_status: "",
        destination_station_oc_approval_status: "",
        original_station_oc_approved_by: 0,
        destination_station_oc_approved_by: 0,
      });
    }
  }, [editingRequest, reset]);

  const onSubmit = async (data: TransferRequest) => {
    console.log("Submitting transfer request:", data);
    if (data.original_station && data.destination_station && data.original_station === data.destination_station) {
      toast.error("Original Station and Destination Station must be different");
      return;
    }

    try {
      // If editingRequest exists -> update path (use API)
      if (editingRequest && editingRequest.id) {
        // defensive: if the form is actually filled for a new record (no prisoner or id mismatch),
        // fall back to create. Adjust the check to match your domain if needed.
        const isLikelyCreate = !editingRequest.prisoner && !!data.prisoner;
        if (!isLikelyCreate) {
          // proceed with update
          const updated = await updateTransferRequest(String(editingRequest.id), data);
          console.log("updateTransferRequest result:", updated);
          // notify parent callback and listeners
          try { if (onSave) await Promise.resolve(onSave(updated)); } catch {}
          try { window.dispatchEvent(new CustomEvent("transfer:updated", { detail: updated })); } catch {}
          toast.success("Transfer request updated");
          reset();
          onClose();
          return;
        }
      }

      // Create path (call API here, then notify parent)
      // Always perform create here, then notify parent with the created object
      const created = await createTransferRequest(data);
      console.log("createTransferRequest result:", created);
      try { if (onSave) await Promise.resolve(onSave(created as any)); } catch (e) { console.warn("onSave handler failed:", e); }
      try { window.dispatchEvent(new CustomEvent("transfer:created", { detail: created })); } catch (e) {}
       toast.success("Transfer request saved");
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to save transfer request:", err);
      toast.error("Failed to save transfer request");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    // load lookup data when form mounts
    let mounted = true;
    setLoadingLookups(true);
    const c = new AbortController();
    Promise.all([
      fetchStations(c.signal).catch(() => []),
      fetchReasons(c.signal).catch(() => []),
      fetchStatuses(c.signal).catch(() => []),
      fetchStaffProfiles("", c.signal).catch(() => ({ items: [] })), // keep staff if needed
      // remove fetchPrisoners here to avoid duplicate requests - CustomPrisonerSearch will fetch itself
      // fetchPrisoners({ page_size: 100 }, c.signal).catch(() => ({ items: [] })),
    ])
      .then(([st, rsn, sts, sfRes /*, prRes */]) => {
        if (!mounted) return;
        setStations(st);
        setReasons(rsn);
        setStatuses(sts);
        setStaff(Array.isArray(sfRes) ? sfRes : (sfRes?.items ?? []));
        // setPrisoners(prRes?.items ?? []); // remove or keep only if used elsewhere
      })
      .finally(() => {
        setLoadingLookups(false);
      });
    return () => {
      mounted = false;
      c.abort();
    };
  }, []);

  const loadStations = async (params?: any) => {
    setLoadingLookups(true);
    const c = new AbortController();
    try {
      const data = await fetchStations({ ...params, page_size: 100 }, c.signal);
      setStations(data);
    } catch (error) {
      setStations([]);
    } finally {
      setLoadingLookups(false);
    }
  };

  // keep watcher
  const prisonerVal = watch("prisoner");
  const originalStationVal = watch("original_station");

  useEffect(() => {
    // When not bulk, auto-populate original station from selected prisoner.
    // Try local cache first, then fall back to server lookup.
    let cancelled = false;
    const c = new AbortController();
    async function resolvePrisonerStation(pId?: string | null) {
      if (!pId) {
        setValue("original_station", "");
        setOriginalStationLabel("");
        return;
      }

      // 1) try local cache
      const local = prisoners.find((p: any) => String(p.id) === String(pId));
      if (local && local.current_station) {
        setValue("original_station", local.current_station);
        setOriginalStationLabel(local.current_station_name ?? "");
        return;
      }

      // 2) try stations/search by id via fetchPrisoners - some backends support id lookup via search
      // (you can keep or remove; if kept ensure useCache:true and page_size:1)
      // try {
      //   const res = await fetchPrisoners({ search: String(pId), page_size: 1 }, c.signal);
      //   if (cancelled) return;
      //   const p = res.items?.[0];
      //   if (p && p.current_station) {
      //     setValue("original_station", p.current_station);
      //     return;
      //   }
      // } catch (_) {
      //   // ignore network/abort errors — leave original_station blank
      // }
    }

    if (!isBulkTransfer) {
      resolvePrisonerStation(prisonerVal);
    } else {
      // when bulk, do not auto-populate
      if (!prisonerVal) {
        setValue("original_station", "");
        setOriginalStationLabel("");
      }
    }

    return () => {
      cancelled = true;
      c.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBulkTransfer, prisonerVal, prisoners]);

  // Keep originalStationLabel in sync when original_station value or stations list changes
  useEffect(() => {
    if (!originalStationVal) {
      setOriginalStationLabel("");
      return;
    }
    // prefer stations lookup
    const s = stations.find((st: any) => String(st.id) === String(originalStationVal));
    if (s) {
      setOriginalStationLabel(s.name ?? "");
      return;
    }
    // fallback: try to find prisoner and use its current_station_name
    const p = prisoners.find((pr: any) => String(pr.id) === String(prisonerVal));
    if (p && p.current_station_name) {
      setOriginalStationLabel(p.current_station_name);
      return;
    }
  }, [originalStationVal, stations, prisoners, prisonerVal]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingRequest ? "Edit Transfer Request" : "Add Transfer Request"}
            </DialogTitle>
            <DialogDescription>
              {editingRequest ? "Please complete the form to update a transfer request." : "Please complete the form to create a transfer request."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Bulk Transfer Toggle */}
            <div className="border-b pb-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="bulk_transfer"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="bulk_transfer"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (!checked) {
                          setValue("number_of_prisoners", 1);
                        }
                      }}
                    />
                  )}
                />
                <label
                  htmlFor="bulk_transfer"
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Bulk Transfer (Multiple Prisoners)
                </label>
              </div>
            </div>

            {/* Prisoner or Number of Prisoners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isBulkTransfer ? (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Prisoner
                  </Label>
                  <Controller
                    name="prisoner"
                    control={control}
                    rules={{ required: !isBulkTransfer ? "Prisoner is required" : false }}
                    render={({ field }) => (
                      <CustomPrisonerSearch
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        onSelectItem={(p) => {
                          // immediately clear previous station to avoid showing stale data
                          setValue("original_station", "");
                          setOriginalStationLabel("");

                          // derive stable station fields for the selected item
                          const stationId =
                            p?.current_station ??
                            p?.station ??
                            (p as any)?.stationId ??
                            (p as any)?.station_id ??
                            "";
                          const stationName =
                            p?.current_station_name ??
                            p?.station_name ??
                            (p as any)?.stationName ??
                            "";

                          try {
                            console.log("Prisoner selected (final):", {
                              id: p?.id ?? null,
                              name:
                                p?.full_name ??
                                `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim(),
                              stationId,
                              stationName,
                            });
                          } catch {}

                          // populate form field + label if available (will overwrite the cleared values)
                          if (stationId) {
                            setValue("original_station", stationId);
                          }
                          if (stationName) {
                            setOriginalStationLabel(stationName);
                          }

                          // keep prisoners cache up-to-date (so other lookups can use it)
                          setPrisoners((prev) => {
                            if (!p) return prev;
                            const exists = prev.some(
                              (x: any) => String(x.id) === String(p.id)
                            );
                            if (exists) return prev;
                            return [p, ...prev];
                          });
                        }}
                        placeholder="Select prisoner"
                        idField="id"
                        labelField="full_name"
                        initialItems={prisoners}
                        pageSize={25}
                        disabled={false}
                      />
                    )}
                  />
                  {errors.prisoner && (
                    <span className="text-sm text-red-500">
                      {errors.prisoner.message}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Prisoners
                  </Label>
                  <Controller
                    name="number_of_prisoners"
                    control={control}
                    rules={{
                      required: isBulkTransfer
                        ? "Number of prisoners is required"
                        : false,
                      min: { value: 1, message: "Must be at least 1" },
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        min="1"
                      />
                    )}
                  />
                  {errors.number_of_prisoners && (
                    <span className="text-sm text-red-500">
                      {errors.number_of_prisoners.message}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Officer In Charge
                </Label>
                <Controller
                  name="in_charge"
                  control={control}
                  rules={{ required: "Officer in charge is required" }}
                  render={({ field }) => (
                    <StaffProfileSelect
                      value={String(field.value ?? "")}
                      onChange={(v) => field.onChange(v ?? "")}
                      placeholder="Select officer in charge"
                      initialItems={staff} // <-- pass initial items to avoid flicker
                    />
                  )}
                />
                {errors.in_charge && (
                  <span className="text-sm text-red-500">
                    {errors.in_charge.message}
                  </span>
                )}
              </div>
            </div>

            {/* Stations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Original Station
                </Label>
                <Controller
                  name="original_station"
                  control={control}
                  rules={{ required: isBulkTransfer ? "Original station is required" : false }}
                  render={({ field }) => {
                    // when not bulk: show read-only label so user can't change; when bulk: full searchable select
                    if (!isBulkTransfer) {
                      const stationLabel = stations.find((s: any) => String(s.id) === String(field.value))?.name
                        || originalStationLabel
                        || (prisoners.find((p: any) => String(p.id) === String(prisonerVal))?.current_station_name)
                        || "";
                      return (
                        <Input value={stationLabel} readOnly placeholder="Auto-filled from prisoner" />
                      );
                    }
                    return (
                      <SearchableSelect
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? null)}
                        placeholder="Select original station"
                        items={stations}
                        idField="id"
                        labelField="name"
                      />
                    );
                  }}
                />
                {!isBulkTransfer && <div className="text-xs text-gray-500">Auto-populated from selected prisoner (disabled for single transfers)</div>}
                {errors.original_station && (<span className="text-sm text-red-500">{errors.original_station.message}</span>)}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Destination Station
                </Label>
                <Controller
                  name="destination_station"
                  control={control}
                  rules={{ required: "Destination station is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      placeholder="Select destination station"
                      items={stations.filter((s: any) => s.id !== (originalStationVal || ""))}
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {errors.destination_station && (<span className="text-sm text-red-500">{errors.destination_station.message}</span>)}
              </div>
            </div>

            {/* Reason and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Reason</Label>
                <Controller
                  name="reason"
                  control={control}
                  rules={{ required: "Reason is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={reasons}
                      idField="id"
                      labelField="name"
                      placeholder="Select reason"
                    />
                  )}
                />
                {errors.reason && (
                  <span className="text-sm text-red-500">
                    {errors.reason.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Request Status</Label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? null)}
                      items={statuses}
                      idField="id"
                      labelField="name"
                      placeholder="Select status"
                    />
                  )}
                />
                {errors.status && (
                  <span className="text-sm text-red-500">
                    {errors.status.message}
                  </span>
                )}
              </div>
            </div>

            {/* OC Approval Information removed */}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4" />
                {editingRequest ? "Update Request" : "Create Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

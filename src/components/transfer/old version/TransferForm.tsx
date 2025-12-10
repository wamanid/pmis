import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
import {
  ArrowRightLeft,
  Calendar,
  User,
  Building2,
  FileText,
  CheckCircle2,
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
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner@2.0.3";

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

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Transfer) => void;
  editingTransfer?: Transfer | null;
  prisoners?: Array<{ id: string; name: string; number: string }>;
  stations?: Array<{ id: string; name: string }>;
  reasons?: Array<{ id: string; name: string }>;
  statuses?: Array<{ id: string; name: string }>;
  transferRequests?: Array<{ id: string; request_id: string }>;
}

export default function TransferForm({
  open,
  onClose,
  onSave,
  editingTransfer,
  prisoners = [],
  stations = [],
  reasons = [],
  statuses = [],
  transferRequests = [],
}: TransferFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Transfer>({
    defaultValues: {
      transfer_date: new Date().toISOString().split("T")[0],
      biometric_consent: false,
      original_station_oc_acknowledged: false,
      destination_station_oc_acknowledged: false,
      original_station_oc_approved: false,
      destination_station_oc_approved: false,
      transfer_request: "",
      prisoner: "",
      original_station: "",
      destination_station: "",
      reason: "",
      status: "",
    },
  });

  const selectedPrisoner = watch("prisoner");
  const selectedOriginalStation = watch("original_station");
  const selectedDestinationStation = watch("destination_station");
  const selectedReason = watch("reason");
  const selectedStatus = watch("status");

  useEffect(() => {
    if (editingTransfer) {
      reset({
        transfer_date: editingTransfer.transfer_date?.split("T")[0] || "",
        biometric_consent: editingTransfer.biometric_consent || false,
        original_station_oc_acknowledged:
          editingTransfer.original_station_oc_acknowledged || false,
        destination_station_oc_acknowledged:
          editingTransfer.destination_station_oc_acknowledged || false,
        original_station_oc_approved:
          editingTransfer.original_station_oc_approved || false,
        destination_station_oc_approved:
          editingTransfer.destination_station_oc_approved || false,
        transfer_request: editingTransfer.transfer_request || "",
        prisoner: editingTransfer.prisoner || "",
        original_station: editingTransfer.original_station || "",
        destination_station: editingTransfer.destination_station || "",
        reason: editingTransfer.reason || "",
        status: editingTransfer.status || "",
      });
    } else {
      reset({
        transfer_date: new Date().toISOString().split("T")[0],
        biometric_consent: false,
        original_station_oc_acknowledged: false,
        destination_station_oc_acknowledged: false,
        original_station_oc_approved: false,
        destination_station_oc_approved: false,
        transfer_request: "",
        prisoner: "",
        original_station: "",
        destination_station: "",
        reason: "",
        status: "",
      });
    }
  }, [editingTransfer, reset]);

  const onSubmit = async (data: Transfer) => {
    try {
      // API call would go here
      // const response = await fetch('/api/transfer-management/transfers/', {
      //   method: editingTransfer ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      onSave({ ...data, id: editingTransfer?.id || Date.now().toString() });
      toast.success(
        editingTransfer
          ? "Transfer updated successfully"
          : "Transfer created successfully"
      );
      handleClose();
    } catch (error) {
      toast.error("Failed to save transfer");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-[1300px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              {editingTransfer ? "Edit Transfer" : "Add Transfer"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Transfer Request & Prisoner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Transfer Request
                </Label>
                <Controller
                  name="transfer_request"
                  control={control}
                  rules={{ required: "Transfer request is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transfer request" />
                      </SelectTrigger>
                      <SelectContent>
                        {transferRequests.map((request) => (
                          <SelectItem key={request.id} value={request.id}>
                            {request.request_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.transfer_request && (
                  <span className="text-sm text-red-500">
                    {errors.transfer_request.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Prisoner
                </Label>
                <Controller
                  name="prisoner"
                  control={control}
                  rules={{ required: "Prisoner is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select prisoner" />
                      </SelectTrigger>
                      <SelectContent>
                        {prisoners.map((prisoner) => (
                          <SelectItem key={prisoner.id} value={prisoner.id}>
                            {prisoner.name} ({prisoner.number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.prisoner && (
                  <span className="text-sm text-red-500">
                    {errors.prisoner.message}
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
                  rules={{ required: "Original station is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select original station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.original_station && (
                  <span className="text-sm text-red-500">
                    {errors.original_station.message}
                  </span>
                )}
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination station" />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.destination_station && (
                  <span className="text-sm text-red-500">
                    {errors.destination_station.message}
                  </span>
                )}
              </div>
            </div>

            {/* Transfer Date, Reason, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Transfer Date
                </Label>
                <Controller
                  name="transfer_date"
                  control={control}
                  rules={{ required: "Transfer date is required" }}
                  render={({ field }) => (
                    <Input type="date" {...field} className="w-full" />
                  )}
                />
                {errors.transfer_date && (
                  <span className="text-sm text-red-500">
                    {errors.transfer_date.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Controller
                  name="reason"
                  control={control}
                  rules={{ required: "Reason is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {reasons.map((reason) => (
                          <SelectItem key={reason.id} value={reason.id}>
                            {reason.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.reason && (
                  <span className="text-sm text-red-500">
                    {errors.reason.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <span className="text-sm text-red-500">
                    {errors.status.message}
                  </span>
                )}
              </div>
            </div>

            {/* Checkboxes Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="flex items-center gap-2 text-[#650000]">
                <CheckCircle2 className="h-5 w-5" />
                Consent & Acknowledgments
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="biometric_consent"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="biometric_consent"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="biometric_consent"
                    className="text-sm cursor-pointer"
                  >
                    Biometric Consent
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="original_station_oc_acknowledged"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="original_station_oc_acknowledged"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="original_station_oc_acknowledged"
                    className="text-sm cursor-pointer"
                  >
                    Original Station OC Acknowledged
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="destination_station_oc_acknowledged"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="destination_station_oc_acknowledged"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="destination_station_oc_acknowledged"
                    className="text-sm cursor-pointer"
                  >
                    Destination Station OC Acknowledged
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="original_station_oc_approved"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="original_station_oc_approved"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="original_station_oc_approved"
                    className="text-sm cursor-pointer"
                  >
                    Original Station OC Approved
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="destination_station_oc_approved"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="destination_station_oc_approved"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="destination_station_oc_approved"
                    className="text-sm cursor-pointer"
                  >
                    Destination Station OC Approved
                  </label>
                </div>
              </div>
            </div>

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
                {editingTransfer ? "Update Transfer" : "Create Transfer"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
import {
  FileText,
  Calendar,
  User,
  Building2,
  Users,
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
  prisoners = [],
  stations = [],
  reasons = [],
  statuses = [],
  approvalStatuses = [],
  staff = [],
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
      in_charge: 0,
      status: "",
      original_station_oc_approval_status: "",
      destination_station_oc_approval_status: "",
      original_station_oc_approved_by: 0,
      destination_station_oc_approved_by: 0,
    },
  });

  const isBulkTransfer = watch("bulk_transfer");

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
    try {
      // API call would go here
      // const response = await fetch('/api/transfer-management/requests/', {
      //   method: editingRequest ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      onSave({ ...data, id: editingRequest?.id || Date.now().toString() });
      toast.success(
        editingRequest
          ? "Transfer request updated successfully"
          : "Transfer request created successfully"
      );
      handleClose();
    } catch (error) {
      toast.error("Failed to save transfer request");
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingRequest ? "Edit Transfer Request" : "Add Transfer Request"}
            </DialogTitle>
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
                      required: isBulkTransfer ? "Number of prisoners is required" : false,
                      min: { value: 1, message: "Must be at least 1" },
                    }}
                    render={({ field }) => (
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select officer" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map((officer) => (
                          <SelectItem key={officer.id} value={officer.id.toString()}>
                            {officer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

            {/* Reason and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Reason</Label>
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
                <Label>Request Status</Label>
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

            {/* Approval Statuses */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="flex items-center gap-2 text-[#650000]">
                <CheckCircle2 className="h-5 w-5" />
                OC Approval Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Original Station OC Approval Status</Label>
                  <Controller
                    name="original_station_oc_approval_status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select approval status" />
                        </SelectTrigger>
                        <SelectContent>
                          {approvalStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Destination Station OC Approval Status</Label>
                  <Controller
                    name="destination_station_oc_approval_status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select approval status" />
                        </SelectTrigger>
                        <SelectContent>
                          {approvalStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Approved By */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Original Station OC Approved By</Label>
                  <Controller
                    name="original_station_oc_approved_by"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value) || 0)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select officer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {staff.map((officer) => (
                            <SelectItem key={officer.id} value={officer.id.toString()}>
                              {officer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Destination Station OC Approved By</Label>
                  <Controller
                    name="destination_station_oc_approved_by"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseInt(value) || 0)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select officer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {staff.map((officer) => (
                            <SelectItem key={officer.id} value={officer.id.toString()}>
                              {officer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Approval Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Original Station OC Approval Date
                  </Label>
                  <Controller
                    name="original_station_oc_approved_date"
                    control={control}
                    render={({ field }) => (
                      <Input type="date" {...field} className="w-full" />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Destination Station OC Approval Date
                  </Label>
                  <Controller
                    name="destination_station_oc_approved_date"
                    control={control}
                    render={({ field }) => (
                      <Input type="date" {...field} className="w-full" />
                    )}
                  />
                </div>
              </div>

              {/* Acknowledgment Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {editingRequest ? "Update Request" : "Create Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

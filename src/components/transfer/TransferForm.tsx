import React, {useEffect, useState} from "react";
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
  DialogContent, DialogDescription,
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
import {addTransfer, Transfer, TransferRecord, TransferRequest} from "../../services/transferServices/bulkServices";
import {getCurrentDate, handleCatchError, handleResponseError} from "../../services/stationServices/utils";
import {PrisonerProperty} from "../../services/propertyServices/propertyService";

// interface Transfer {
//   id?: string;
//   prisoner_name?: string;
//   prisoner_number?: string;
//   original_station_name?: string;
//   destination_station_name?: string;
//   reason_name?: string;
//   status_name?: string;
//   transfer_request_id?: string;
//   transfer_date: string;
//   biometric_consent: boolean;
//   original_station_oc_acknowledged: boolean;
//   destination_station_oc_acknowledged: boolean;
//   original_station_oc_approved: boolean;
//   destination_station_oc_approved: boolean;
//   transfer_request: string;
//   prisoner: string;
//   original_station: string;
//   destination_station: string;
//   reason: string;
//   status: string;
// }

interface TransferFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TransferRecord) => void;
  editingTransfer?: TransferRecord | null;
  transferRequests?: TransferRequest[];
  setTransfers: React.Dispatch<React.SetStateAction<TransferRecord[]>>;
}

export default function TransferForm({
  open,
  onClose,
  onSave,
  editingTransfer,
  transferRequests,
    setTransfers,
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
      // transfer_date: new Date().toISOString().split("T")[0],
      transfer_date: getCurrentDate(),
      transfer_request: "",
      prisoner: "",
      original_station: "",
      destination_station: "",
      reason: "",
      status: "",
    },
  });

  const [transfer, setTransfer] = useState<Transfer>({
    transfer_request: "",
    original_station: "",
    destination_station: "",
    reason: "",
    status: "",
    transfer_date: getCurrentDate(),
    prisoner: "",
  })

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

    // console.log(transfer)

    try {
      // API call would go here
      // const response = await fetch('/api/transfer-management/transfers/', {
      //   method: editingTransfer ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      // onSave({ ...data, id: editingTransfer?.id || Date.now().toString() });
      // toast.success(
      //   editingTransfer
      //     ? "Transfer updated successfully"
      //     : "Transfer created successfully"
      // );


      const response = await addTransfer(transfer)
      if (handleResponseError(response)) return

      setTransfers(prev => ([response, ...prev]))

      toast.success(
        editingTransfer
          ? "Transfer updated successfully"
          : "Transfer created successfully"
      );
      handleClose();

    } catch (error) {
      handleCatchError(error)
    }
  };

  const handleClose = () => {
    setTransfer({
      transfer_request: "",
      original_station: "",
      destination_station: "",
      reason: "",
      status: "",
      transfer_date: getCurrentDate(),
      prisoner: "",
    })
    reset();
    onClose();
  };

  function handleRequestChange(request: TransferRequest) {
    // console.log(request)
    setValue("prisoner", request.prisoner_name)
    setValue("original_station", request.original_station_name)
    setValue("destination_station", request.destination_station_name)
    setValue("reason", request.reason_name)
    setValue("status", request.status_name)

    setTransfer({
      ...transfer,
      transfer_request: request.id,
      original_station: request.original_station,
      destination_station: request.destination_station,
      reason: request.reason,
      status: request.status,
      prisoner: request.prisoner,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-[1300px] max-h-[95vh] overflow-hidden p-0 flex flex-col resize">
        <div className="flex-1 overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              {editingTransfer ? "Edit Transfer" : "Add Transfer"}
            </DialogTitle>
            <DialogDescription>
            </DialogDescription>
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
                    <Select value={field.value} onValueChange={ (id: string) => {
                      const selectedRequest = transferRequests.find(r => r.id === id);
                      handleRequestChange(selectedRequest)
                      field.onChange(id)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transfer request" />
                      </SelectTrigger>
                      <SelectContent>
                        {transferRequests.map((request) => (
                          <SelectItem key={request.id} value={request.id}>
                            {request.request_number}
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
                      <Input type="text" {...field} className="w-full" disabled />
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
                    <Input type="text" {...field} className="w-full" disabled />
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
                   <Input type="text" {...field} className="w-full" disabled />
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
                    <Input type="date" {...field} className="w-full" onChange={(e) => {
                      setTransfer({...transfer, transfer_date: e.target.value})
                      setValue("transfer_date", e.target.value)
                    }} />
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
                    <Input type="text" {...field} className="w-full" disabled />
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
                    <Input type="text" {...field} className="w-full" disabled />
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
            {/* Consent & Acknowledgments removed */}

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

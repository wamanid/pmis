import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
import {
  ArrowLeftRight,
  Calendar,
  Building2,
  Users,
  CheckCircle2,
  Save,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  User,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { toast } from "sonner@2.0.3";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface Prisoner {
  id: string;
  name: string;
  number: string;
  category?: string;
}

interface BulkTransferData {
  transfer_type: "in" | "out";
  number_of_prisoners: number;
  original_station: string;
  destination_station: string;
  reason: string;
  in_charge: number;
  status: string;
  original_station_oc_approval_status: string;
  destination_station_oc_approval_status: string;
  original_station_oc_approved_by: number;
  destination_station_oc_approved_by: number;
  original_station_oc_acknowledged: boolean;
  destination_station_oc_acknowledged: boolean;
  original_station_oc_approved_date: string;
  destination_station_oc_approved_date: string;
  selected_prisoners: string[];
}

export default function TransferInOutBulkScreen() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BulkTransferData>({
    defaultValues: {
      transfer_type: "out",
      number_of_prisoners: 0,
      original_station: "",
      destination_station: "",
      reason: "",
      in_charge: 0,
      status: "",
      original_station_oc_approval_status: "",
      destination_station_oc_approval_status: "",
      original_station_oc_approved_by: 0,
      destination_station_oc_approved_by: 0,
      original_station_oc_acknowledged: false,
      destination_station_oc_acknowledged: false,
      original_station_oc_approved_date: "",
      destination_station_oc_approved_date: "",
      selected_prisoners: [],
    },
  });

  const transferType = watch("transfer_type");
  const selectedPrisonerIds = watch("selected_prisoners");

  // Collapsible state
  const [isTransferDetailsOpen, setIsTransferDetailsOpen] = useState(false);
  const [isOcApprovalOpen, setIsOcApprovalOpen] = useState(false);

  // Available prisoners list
  const [availablePrisoners, setAvailablePrisoners] = useState<Prisoner[]>([]);
  const [selectedPrisoners, setSelectedPrisoners] = useState<Prisoner[]>([]);
  const [availableSearch, setAvailableSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");

  // Mock data
  const [stations] = useState([
    { id: "1", name: "Central Prison" },
    { id: "2", name: "North Prison" },
    { id: "3", name: "South Prison" },
    { id: "4", name: "East Prison" },
    { id: "5", name: "West Prison" },
  ]);

  const [reasons] = useState([
    { id: "1", name: "Medical" },
    { id: "2", name: "Court Appearance" },
    { id: "3", name: "Overcrowding" },
    { id: "4", name: "Security" },
    { id: "5", name: "Administrative" },
  ]);

  const [statuses] = useState([
    { id: "1", name: "Pending" },
    { id: "2", name: "Approved" },
    { id: "3", name: "In Progress" },
    { id: "4", name: "Completed" },
  ]);

  const [approvalStatuses] = useState([
    { id: "1", name: "Pending" },
    { id: "2", name: "Approved" },
    { id: "3", name: "Rejected" },
    { id: "4", name: "Under Review" },
  ]);

  const [staff] = useState([
    { id: 1, name: "Officer John Smith" },
    { id: 2, name: "Officer Mary Johnson" },
    { id: 3, name: "Officer David Brown" },
    { id: 4, name: "Officer Sarah Davis" },
  ]);

  // Load mock prisoners
  useEffect(() => {
    const mockPrisoners: Prisoner[] = [
      { id: "1", name: "John Doe", number: "P001", category: "Convict" },
      { id: "2", name: "Jane Smith", number: "P002", category: "Remand" },
      { id: "3", name: "Mike Johnson", number: "P003", category: "Civil Debtor" },
      { id: "4", name: "Sarah Williams", number: "P004", category: "Convict" },
      { id: "5", name: "Robert Brown", number: "P005", category: "Remand" },
      { id: "6", name: "Emily Davis", number: "P006", category: "Convict" },
      { id: "7", name: "James Wilson", number: "P007", category: "Civil Debtor" },
      { id: "8", name: "Linda Martinez", number: "P008", category: "Remand" },
      { id: "9", name: "David Anderson", number: "P009", category: "Convict" },
      { id: "10", name: "Patricia Taylor", number: "P010", category: "Remand" },
    ];
    setAvailablePrisoners(mockPrisoners);
  }, []);

  // Update number of prisoners count
  useEffect(() => {
    setValue("number_of_prisoners", selectedPrisoners.length);
    setValue(
      "selected_prisoners",
      selectedPrisoners.map((p) => p.id)
    );
  }, [selectedPrisoners, setValue]);

  // Filter prisoners based on search
  const filteredAvailable = availablePrisoners.filter(
    (p) =>
      p.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
      p.number.toLowerCase().includes(availableSearch.toLowerCase())
  );

  const filteredSelected = selectedPrisoners.filter(
    (p) =>
      p.name.toLowerCase().includes(selectedSearch.toLowerCase()) ||
      p.number.toLowerCase().includes(selectedSearch.toLowerCase())
  );

  // Move prisoner to selected list
  const movePrisonerToSelected = (prisoner: Prisoner) => {
    setAvailablePrisoners(availablePrisoners.filter((p) => p.id !== prisoner.id));
    setSelectedPrisoners([...selectedPrisoners, prisoner]);
  };

  // Move prisoner back to available list
  const movePrisonerToAvailable = (prisoner: Prisoner) => {
    setSelectedPrisoners(selectedPrisoners.filter((p) => p.id !== prisoner.id));
    setAvailablePrisoners([...availablePrisoners, prisoner]);
  };

  // Move all prisoners
  const moveAllToSelected = () => {
    setSelectedPrisoners([...selectedPrisoners, ...filteredAvailable]);
    setAvailablePrisoners(
      availablePrisoners.filter(
        (p) => !filteredAvailable.find((f) => f.id === p.id)
      )
    );
  };

  const moveAllToAvailable = () => {
    setAvailablePrisoners([...availablePrisoners, ...filteredSelected]);
    setSelectedPrisoners(
      selectedPrisoners.filter(
        (p) => !filteredSelected.find((f) => f.id === p.id)
      )
    );
  };

  const onSubmit = async (data: BulkTransferData) => {
    if (selectedPrisoners.length === 0) {
      toast.error("Please select at least one prisoner");
      return;
    }

    try {
      // API call would go here
      // await fetch('/api/transfer-management/requests/bulk_transfers/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });

      toast.success(
        `Bulk ${data.transfer_type === "in" ? "Transfer In" : "Transfer Out"} request created successfully for ${selectedPrisoners.length} prisoners`
      );

      // Reset form
      setSelectedPrisoners([]);
      // Reload available prisoners
    } catch (error) {
      toast.error("Failed to create bulk transfer request");
    }
  };

  const renderPrisonerCard = (
    prisoner: Prisoner,
    onClick: () => void,
    icon: React.ReactNode
  ) => (
    <div
      key={prisoner.id}
      onClick={onClick}
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <User className="h-4 w-4 text-gray-400" />
        <div>
          <div className="text-sm">{prisoner.name}</div>
          <div className="text-xs text-gray-500">
            {prisoner.number} • {prisoner.category}
          </div>
        </div>
      </div>
      {icon}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>Bulk Transfer In/Out</h1>
        <p className="text-muted-foreground">
          Perform bulk prisoner transfers between stations
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-[#650000]">
              <ArrowLeftRight className="h-6 w-6" />
              Bulk Transfer Details
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Transfer Details Section - Collapsible */}
            <Collapsible
              open={isTransferDetailsOpen}
              onOpenChange={setIsTransferDetailsOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center justify-between w-full p-4 hover:bg-[#650000]/10 rounded-lg border-2 border-[#650000] bg-[#650000]/5"
                >
                  <span className="flex items-center gap-2 text-[#650000]">
                    <ArrowLeftRight className="h-5 w-5" />
                    <span className="font-semibold">Transfer Information</span>
                  </span>
                  {isTransferDetailsOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#650000]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#650000]" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-6 pt-6">
                {/* Transfer Type */}
                <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Transfer Type
              </Label>
              <Controller
                name="transfer_type"
                control={control}
                rules={{ required: "Transfer type is required" }}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1">
                      <RadioGroupItem value="out" id="transfer-out" />
                      <label
                        htmlFor="transfer-out"
                        className="cursor-pointer flex-1"
                      >
                        <div>Transfer Out</div>
                        <div className="text-xs text-gray-500">
                          Send prisoners to another station
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 flex-1">
                      <RadioGroupItem value="in" id="transfer-in" />
                      <label
                        htmlFor="transfer-in"
                        className="cursor-pointer flex-1"
                      >
                        <div>Transfer In</div>
                        <div className="text-xs text-gray-500">
                          Receive prisoners from another station
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors.transfer_type && (
                <span className="text-sm text-red-500">
                  {errors.transfer_type.message}
                </span>
              )}
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

            {/* Reason, In Charge, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label>Officer In Charge</Label>
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
              </CollapsibleContent>
            </Collapsible>

            {/* OC Approval Section - Collapsible */}
            <Collapsible
              open={isOcApprovalOpen}
              onOpenChange={setIsOcApprovalOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center justify-between w-full p-4 hover:bg-[#650000]/10 rounded-lg border-2 border-[#650000] bg-[#650000]/5"
                >
                  <span className="flex items-center gap-2 text-[#650000]">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">OC Approval Information</span>
                  </span>
                  {isOcApprovalOpen ? (
                    <ChevronUp className="h-5 w-5 text-[#650000]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#650000]" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-6">
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
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Prisoner Selection Grids */}
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#650000] text-xl">
                <Users className="h-7 w-7" />
                <span className="font-semibold">Select Prisoners for Transfer In/Out</span>
              </CardTitle>
              <Badge className="bg-[#650000]">
                {selectedPrisoners.length} Selected
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-12 gap-4">
              {/* Left Grid - Changes based on transfer type */}
              <div className="col-span-5">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-[#650000] p-3 border-b">
                    <h3 className="text-white mb-2">
                      {transferType === "in"
                        ? "Selected Prisoners"
                        : "Available Prisoners"}
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search prisoners..."
                        value={transferType === "in" ? selectedSearch : availableSearch}
                        onChange={(e) =>
                          transferType === "in"
                            ? setSelectedSearch(e.target.value)
                            : setAvailableSearch(e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[400px] p-3">
                    <div className="space-y-2">
                      {transferType === "in" ? (
                        filteredSelected.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No prisoners selected
                          </div>
                        ) : (
                          filteredSelected.map((prisoner) =>
                            renderPrisonerCard(
                              prisoner,
                              () => movePrisonerToAvailable(prisoner),
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )
                          )
                        )
                      ) : filteredAvailable.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No prisoners available
                        </div>
                      ) : (
                        filteredAvailable.map((prisoner) =>
                          renderPrisonerCard(
                            prisoner,
                            () => movePrisonerToSelected(prisoner),
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )
                        )
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Center Controls */}
              <div className="col-span-2 flex flex-col items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={
                    transferType === "in" ? moveAllToAvailable : moveAllToSelected
                  }
                  title="Move all"
                >
                  {transferType === "in" ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div className="text-xs text-center text-gray-500 my-2">
                  {transferType === "in" ? "Transfer In" : "Transfer Out"}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={
                    transferType === "in" ? moveAllToSelected : moveAllToAvailable
                  }
                  title="Move all back"
                >
                  {transferType === "in" ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Right Grid - Changes based on transfer type */}
              <div className="col-span-5">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-[#650000] p-3 border-b">
                    <h3 className="text-white mb-2">
                      {transferType === "in"
                        ? "Available Prisoners"
                        : "Selected Prisoners"}
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search prisoners..."
                        value={transferType === "in" ? availableSearch : selectedSearch}
                        onChange={(e) =>
                          transferType === "in"
                            ? setAvailableSearch(e.target.value)
                            : setSelectedSearch(e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[400px] p-3">
                    <div className="space-y-2">
                      {transferType === "in" ? (
                        filteredAvailable.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            No prisoners available
                          </div>
                        ) : (
                          filteredAvailable.map((prisoner) =>
                            renderPrisonerCard(
                              prisoner,
                              () => movePrisonerToSelected(prisoner),
                              <ChevronLeft className="h-4 w-4 text-gray-400" />
                            )
                          )
                        )
                      ) : filteredSelected.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No prisoners selected
                        </div>
                      ) : (
                        filteredSelected.map((prisoner) =>
                          renderPrisonerCard(
                            prisoner,
                            () => movePrisonerToAvailable(prisoner),
                            <ChevronLeft className="h-4 w-4 text-gray-400" />
                          )
                        )
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedPrisoners([]);
              setAvailableSearch("");
              setSelectedSearch("");
            }}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
          <Button
            type="submit"
            className="gap-2 bg-[#650000] hover:bg-[#4a0000]"
          >
            <Save className="h-4 w-4" />
            Create Bulk Transfer Request
          </Button>
        </div>
      </form>
    </div>
  );
}

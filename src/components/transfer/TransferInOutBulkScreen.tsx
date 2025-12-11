import React, { useState, useEffect } from "react";
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
  FileText,
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
import {handleCatchError, handleResponseError} from "../../services/stationServices/utils";
import {
  getTransferReasons,
  getTransferRequests, getTransferStatus,
  TransferReason,
  TransferRequest,
  TransferStatus
} from "../../services/transferServices/bulkServices";
import {getStation, Station, StationItem} from "../../services/stationServices/manualLockupIntegration";
import {fetchShiftDetailDeployments} from "../../services/stationServices/shiftDeploymentsService";
import {getStaffProfile, StaffItem} from "../../services/stationServices/staffDeploymentService";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "../ui/dialog";
import {getPrisoners, PrisonerItem} from "../../services/stationServices/visitorsServices/VisitorsService";

// interface Prisoner {
//   id: string;
//   name: string;
//   number: string;
//   category?: string;
// }

// interface BulkTransferData {
//   transfer_type: "in" | "out";
//   number_of_prisoners: number;
//   original_station: string;
//   destination_station: string;
//   reason: string;
//   in_charge: number;
//   status: string;
//   original_station_oc_approval_status: string;
//   destination_station_oc_approval_status: string;
//   original_station_oc_approved_by: number;
//   destination_station_oc_approved_by: number;
//   original_station_oc_acknowledged: boolean;
//   destination_station_oc_acknowledged: boolean;
//   original_station_oc_approved_date: string;
//   destination_station_oc_approved_date: string;
//   selected_prisoners: string[];
//   transfer_request: string;
// }

interface BulkTransferData {
  transfer_type: "in" | "out";
  original_station: string;
  destination_station: string;
  reason: string;
  in_charge: string;
  status: string;
  selected_prisoners: string[];
  transfer_request: string;
}

export default function TransferInOutBulkScreen() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BulkTransferData>({
    defaultValues: {
       transfer_type: "out",
       original_station: "",
       destination_station: "",
       reason: "",
       in_charge: "",
       status: "",
       selected_prisoners: [],
       transfer_request: ""
    },
  });

  const transferType = watch("transfer_type");
  const selectedPrisonerIds = watch("selected_prisoners");

  // Collapsible state
  const [isTransferDetailsOpen, setIsTransferDetailsOpen] = useState(false);
  const [isOcApprovalOpen, setIsOcApprovalOpen] = useState(false);

  // Available prisoners list
  const [availablePrisoners, setAvailablePrisoners] = useState<PrisonerItem[]>([]);
  const [selectedPrisoners, setSelectedPrisoners] = useState<PrisonerItem[]>([]);
  const [availableSearch, setAvailableSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");

  // Mock data
  // const [stations] = useState([
  //   { id: "1", name: "Central Prison" },
  //   { id: "2", name: "North Prison" },
  //   { id: "3", name: "South Prison" },
  //   { id: "4", name: "East Prison" },
  //   { id: "5", name: "West Prison" },
  // ]);

  // const [reasons] = useState([
  //   { id: "1", name: "Medical" },
  //   { id: "2", name: "Court Appearance" },
  //   { id: "3", name: "Overcrowding" },
  //   { id: "4", name: "Security" },
  //   { id: "5", name: "Administrative" },
  // ]);
  //
  // const [statuses] = useState([
  //   { id: "1", name: "Pending" },
  //   { id: "2", name: "Approved" },
  //   { id: "3", name: "In Progress" },
  //   { id: "4", name: "Completed" },
  // ]);

  // const [transferRequests] = useState([
  //   { id: "tr-1", request_id: "REQ-2025-0001" },
  //   { id: "tr-2", request_id: "REQ-2025-0002" },
  //   { id: "tr-3", request_id: "REQ-2025-0003" },
  // ]);
  // const [approvalStatuses] = useState([
  //   { id: "1", name: "Pending" },
  //   { id: "2", name: "Approved" },
  //   { id: "3", name: "Rejected" },
  //   { id: "4", name: "Under Review" },
  // ]);

  // const [staff] = useState([
  //   { id: 1, name: "Officer John Smith" },
  //   { id: 2, name: "Officer Mary Johnson" },
  //   { id: 3, name: "Officer David Brown" },
  //   { id: 4, name: "Officer Sarah Davis" },
  // ]);

  // API integrations
  const [loading, setLoading] = useState(true)
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [reasons, setReasons] = useState<TransferReason[]>([])
  const [statuses, setStatuses] = useState<TransferStatus[]>([]);
  const [stations, setStations] = useState<StationItem[]>([])
  const [staff, setStaff] = useState<StaffItem[]>([])
  const [newDialogLoader, setNewDialogLoader] = useState(false)
  const [loaderText, setLoaderText] = useState("")
  const [bulk, setBulk] = useState<BulkTransferData>({
    transfer_type: "out",
    original_station: "",
    destination_station: "",
    reason: "",
    in_charge: "",
    status: "",
    selected_prisoners: [],
    transfer_request: ""
  });

  useEffect(() => {
    if (loading) {
      fetchData()
    }
  }, [loading]);

  function populateList(response: any, msg: string, setData: any) {
      if (handleResponseError(response)) return false

      const data = response.results
      // console.log(data)
      if (!data.length) {
        toast.error(msg)
        return false
      }
      setData(data)
      return true
  }

  function populateLists(response: any, msg: string): any[] | null {
      if (handleResponseError(response)) return null

      const data = response.results
      // console.log(data)
      if (!data.length) {
        toast.error(msg)
        return null
      }

      return data
  }

  async function fetchData() {
    try {
      const response1 = await getTransferRequests(true)
      const ok1 = populateList(response1, "There are no bulk transfer requests", setTransferRequests)
      if (!ok1) return

      const response2 = await getTransferReasons()
      const ok2 = populateList(response2, "There are no transfer reasons", setReasons)
      if (!ok2) return

      const response3 = await getTransferStatus()
      const ok3 = populateList(response3, "There are no transfer statuses", setStatuses)
      if (!ok3) return

      const response4 = await getStation()
      const ok4 = populateList(response4, "There are no available stations", setStations)
      if (!ok4) return

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoading(false)
    }
  }

  function fetchId(id: String, list: any[]) {
    const valueId = id
      ? list.find(li => li.id === id)?.id || ""
      : "";
    return valueId
  }

  async function handleRequestChange(request: TransferRequest) {
    // console.log(request)
    const reasonId = fetchId(request.reason, reasons)
    const statusId = fetchId(request.status, statuses)
    const origId = fetchId(request.original_station, stations)
    const destId = fetchId(request.destination_station, stations)

    const { officers, newPrisoners } = await getOfficers(origId);
    setStaff(officers)
    setAvailablePrisoners(newPrisoners)
    setSelectedPrisoners([])
    // console.log(officers)
    const chargeId = fetchId(request.in_charge, officers)
    // console.log(chargeId)

    setBulk({
      ...bulk,
      transfer_request: request.id,
      reason: reasonId,
      status: statusId,
      original_station: origId,
      destination_station: destId,
      in_charge: chargeId
    })
  }

  useEffect(() => {
    if(staff) {
      const request = bulk.transfer_request
      const in_charge = transferRequests.find(tr => tr.id === request)?.in_charge || ""
      const chargeId = fetchId(in_charge, staff)
      setBulk({
        ...bulk,
        in_charge: chargeId
      })
    }
  }, [staff]);

  async function getOfficers(origId: string): Promise<{ officers: StaffItem[], newPrisoners: PrisonerItem[] }> {
    setNewDialogLoader(true)
    setLoaderText("Fetching staff list")
    try {
      const response1 = await getStaffProfile(origId)
      const officers = populateLists(response1, "There are no officers for the selected original station") ?? []

      const response2 = await getPrisoners()
      const prisoners = populateLists(response2, "There are no prisoners") ?? []
      const newPrisoners = prisoners.filter(pr => pr.current_station === origId)

       return { officers, newPrisoners}

    }catch (error) {
      handleCatchError(error)
      return { officers: [], newPrisoners: [] };
    }finally {
      setNewDialogLoader(false)
    }
  }

  async function handleChange(name: string, value: string) {

    if (name === "original_station"){
      const { officers, newPrisoners } = await getOfficers(value);
      setStaff(officers)
      setAvailablePrisoners(newPrisoners)
      setSelectedPrisoners([])

      setBulk({
        ...bulk,
        [name]: value,
        destination_station: name === "original_station" && value === bulk.destination_station ? "" : bulk.destination_station,
        in_charge: ""
      })
    }
    else {
      setBulk({
        ...bulk,
        [name]: value,
      })
    }
  }

  const destinationStations = stations.filter(station => station.id !== bulk.original_station)


  // Load mock prisoners
  // useEffect(() => {
  //   const mockPrisoners: Prisoner[] = [
  //     { id: "1", name: "John Doe", number: "P001", category: "Convict" },
  //     { id: "2", name: "Jane Smith", number: "P002", category: "Remand" },
  //     { id: "3", name: "Mike Johnson", number: "P003", category: "Civil Debtor" },
  //     { id: "4", name: "Sarah Williams", number: "P004", category: "Convict" },
  //     { id: "5", name: "Robert Brown", number: "P005", category: "Remand" },
  //     { id: "6", name: "Emily Davis", number: "P006", category: "Convict" },
  //     { id: "7", name: "James Wilson", number: "P007", category: "Civil Debtor" },
  //     { id: "8", name: "Linda Martinez", number: "P008", category: "Remand" },
  //     { id: "9", name: "David Anderson", number: "P009", category: "Convict" },
  //     { id: "10", name: "Patricia Taylor", number: "P010", category: "Remand" },
  //   ];
  //   setAvailablePrisoners(mockPrisoners);
  // }, []);

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
      p.first_name.toLowerCase().includes(availableSearch.toLowerCase()) ||
      p.last_name.toLowerCase().includes(availableSearch.toLowerCase()) ||
      p.prisoner_number_value.toLowerCase().includes(availableSearch.toLowerCase())
  );

  const filteredSelected = selectedPrisoners.filter(
    (p) =>
      p.first_name.toLowerCase().includes(availableSearch.toLowerCase()) ||
      p.last_name.toLowerCase().includes(availableSearch.toLowerCase()) ||
      p.prisoner_number_value.toLowerCase().includes(availableSearch.toLowerCase())
  );

  // Move prisoner to selected list
  const movePrisonerToSelected = (prisoner: PrisonerItem) => {
    setAvailablePrisoners(availablePrisoners.filter((p) => p.id !== prisoner.id));
    setSelectedPrisoners([...selectedPrisoners, prisoner]);
  };

  // Move prisoner back to available list
  const movePrisonerToAvailable = (prisoner: PrisonerItem) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPrisoners.length === 0) {
      toast.error("Please select at least one prisoner");
      return;
    }

    const bulkData: BulkTransferData = {
      ...bulk,
      selected_prisoners: selectedPrisoners.map(pr => pr.id)
    }

    console.log(bulkData)

    // try {
    //   const bulk: BulkTransferData = {
    //     ...data,
    //
    //   }
    //
    //   toast.success(
    //     `Bulk ${data.transfer_type === "in" ? "Transfer In" : "Transfer Out"} request created successfully for ${selectedPrisoners.length} prisoners`
    //   );
    //
    //   // Reset form
    //   setSelectedPrisoners([]);
    //   // Reload available prisoners
    // } catch (error) {
    //   toast.error("Failed to create bulk transfer request");
    // }
  };

  const renderPrisonerCard = (
    prisoner: PrisonerItem,
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
          <div className="text-sm">{prisoner.full_name}</div>
          <div className="text-xs text-gray-500">
            {/*{prisoner.number} • {prisoner.category}*/}
            {prisoner.prisoner_number_value}
          </div>
        </div>
      </div>
      {icon}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Bulk Transfer In/Out</h1>
        <p className="text-muted-foreground">
          Perform bulk prisoner transfers between stations
        </p>
      </div>

      {
        loading ? (
          <div className="size-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm">
                Fetching transfer Information, Please wait...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    {/* Transfer Request (searchable dropdown) */}
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
                          <Select value={field.value} onValueChange={
                            (id: string) => {
                              field.onChange(id)
                              const selectedRequest = transferRequests.find(r => r.id === id);
                              handleRequestChange(selectedRequest)
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select transfer request" />
                            </SelectTrigger>
                            <SelectContent>
                              {transferRequests.map((request) => (
                                <SelectItem
                                    key={request.id}
                                    value={request.id}
                                >
                                  {/*{request.request_id}*/}
                                  {request.id}
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
                            onValueChange={(value: string) => {
                              field.onChange(value)
                              handleChange("transfer_type", value)
                            }}
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
                            <Select
                                value={
                                  field.value === ""
                                    ? stations.find(station => station.id === bulk.original_station)?.id || field.value
                                    : field.value
                                }
                                onValueChange={async (id: string) => {
                                  field.onChange(id)
                                  await handleChange("original_station", id)
                                }}
                            >
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
                            <Select
                                value={
                                  field.value === ""
                                    ? stations.find(station => station.id === bulk.destination_station)?.id || field.value
                                    : field.value
                                }
                                onValueChange={(id: string) => {
                                  field.onChange(id)
                                  handleChange("destination_station", id)
                                }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination station" />
                              </SelectTrigger>
                              <SelectContent>
                                {destinationStations.map((station) => (
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
                            <Select
                                value={
                                  field.value === ""
                                    ? reasons.find(reason => reason.id === bulk.reason)?.id || field.value
                                    : field.value
                                }
                                onValueChange={(id: string) => {
                                  field.onChange(id)
                                  handleChange("reason", id)
                                }}>
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
                                value={
                                  field.value === ""
                                    ? staff.find(st => st.id === bulk.in_charge)?.id || ""
                                    : field.value
                                }
                                onValueChange={(id: string) => {
                                  field.onChange(id)
                                  handleChange("in_charge", id)
                                }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select officer" />
                              </SelectTrigger>
                              <SelectContent>
                                {staff.map((officer) => (
                                  <SelectItem key={officer.id} value={officer.id}>
                                    {officer.first_name} {officer.last_name}
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
                            <Select
                                value={
                                  field.value === ""
                                    ? statuses.find(status => status.id === bulk.status)?.id || field.value
                                    : field.value
                                }
                                onValueChange={(id: string) => {
                                  field.onChange(id)
                                  handleChange("status", id)
                                }}
                            >
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

                {/* OC Approval Section - Collapsible removed*/}

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
        )
      }

      {/* Loading Dialog */}
      <Dialog open={newDialogLoader} onOpenChange={setNewDialogLoader}>
        <DialogContent className="">
          <div className="">
            <DialogHeader>
              <DialogTitle style={{ color: '#650000' }}></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center">
              <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                    {loaderText}
                  </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { toast } from "sonner";
import {
  ChevronsUpDown,
  Check,
  Calendar as CalendarIcon,
  Clock,
  Camera,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  addStationVisitor,
  GateItem,
  getGates,
  getIdTypes,
  getPrisoners, getRelationships, getVisitorStatus,
  getVisitorTypes, IdType, Prisoner, PrisonerItem, RelationShipItem,
  StationVisitor, VisitorStatusItem, VisitorTypeItem
} from "../../services/stationServices/VisitorsService";
import {getStaffProfile, StaffItem} from "../../services/stationServices/staffDeploymentService";
import {handleResponseError} from "../../services/stationServices/utils";

// Types
interface Visitor {
  id?: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  organisation: string;
  vehicle_no: string;
  reason_of_visitation: string;
  id_number: string;
  address: string;
  contact_no: string;
  place_visited: string;
  remarks: string;
  blacklist_reason: string;
  photo: File | null;
  gate: string;
  prisoner: string;
  visitor_type: string;
  gate_keeper: string;
  relation: string;
  id_type: string;
  visitor_status: string;
  visitation_datetime: Date;
  time_in: string;
  time_out: string;
}

interface VisitorRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisitorCreated?: (visitor: Visitor) => void;
  editingVisitor?: Visitor | null;
}

// Mock data
// const mockGates = [
//   { id: "1", name: "Main Gate" },
//   { id: "2", name: "East Gate" },
//   { id: "3", name: "West Gate" },
// ];

// const mockPrisoners = [
//   { id: "1", name: "John Doe", prisoner_number: "P-2024-001" },
//   { id: "2", name: "Jane Smith", prisoner_number: "P-2024-002" },
//   { id: "3", name: "Michael Johnson", prisoner_number: "P-2024-003" },
// ];

// const mockVisitorTypes = [
//   { id: "1", name: "Family Member" },
//   { id: "2", name: "Legal Representative" },
//   { id: "3", name: "Religious Leader" },
//   { id: "4", name: "Official" },
// ];

// const mockRelationships = [
//   { id: "1", name: "Spouse" },
//   { id: "2", name: "Parent" },
//   { id: "3", name: "Child" },
//   { id: "4", name: "Sibling" },
//   { id: "5", name: "Friend" },
//   { id: "6", name: "Lawyer" },
// ];

// const mockIDTypes = [
//   { id: "1", name: "National ID" },
//   { id: "2", name: "Passport" },
//   { id: "3", name: "Driver's License" },
//   { id: "4", name: "Work Permit" },
// ];

// const mockVisitorStatuses = [
//   { id: "1", name: "Checked In", color: "green" },
//   { id: "2", name: "Checked Out", color: "gray" },
//   { id: "3", name: "Blacklisted", color: "red" },
// ];

// const mockStaff = [
//   { id: "1", force_number: "F-001", name: "Officer Smith", rank: "Sergeant" },
//   { id: "2", force_number: "F-002", name: "Officer Jones", rank: "Corporal" },
// ];

export default function VisitorRegistrationDialog({
  open,
  onOpenChange,
  setVisitors,
  editingVisitor,
}: VisitorRegistrationDialogProps) {
  const [form, setForm] = useState<StationVisitor>({
  is_active: true,
  deleted_datetime: null,
  visitation_datetime: new Date().toISOString().split('T')[0],
  first_name: "",
  middle_name: "",
  last_name: "",
  organisation: "",
  id_number: "",
  contact_no: "",
  remarks: "",
  vehicle_no: "",
  time_in: "",
  time_out: "",
  reason_of_visitation: "",
  address: "",
  place_visited: "",
  blacklist_reason: "",
  photo: "",
  deleted_by: null,
  visit_location: "",
  prisoner: "",
  visitor_type: "",
  relation: "",
  visitor_status: "",
  id_type: "",
  gate: "",
  gate_keeper: "",
});

  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Combobox states
  const [openGateCombo, setOpenGateCombo] = useState(false);
  const [openPrisonerCombo, setOpenPrisonerCombo] = useState(false);
  const [openVisitorTypeCombo, setOpenVisitorTypeCombo] = useState(false);
  const [openGateKeeperCombo, setOpenGateKeeperCombo] = useState(false);
  const [openRelationCombo, setOpenRelationCombo] = useState(false);
  const [openIDTypeCombo, setOpenIDTypeCombo] = useState(false);
  const [openVisitorStatusCombo, setOpenVisitorStatusCombo] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formDataLoading, setFormDataLoading] = useState(false)

  // APIs declarations
  const [mockIDTypes, setMockIDTypes] = useState<IdType[]>([])
  const [mockPrisoners, setMockPrisoners] = useState<PrisonerItem[]>([])
  const [mockGates, setMockGates] = useState<GateItem[]>([])
  const [mockStaff, setMockStaff] = useState<StaffItem[]>([])
  const [mockVisitorTypes, setMockVisitorTypes] = useState<VisitorTypeItem[]>([])
  const [mockRelationships, setMockRelationships] = useState<RelationShipItem[]>([])
  const [mockVisitorStatuses, setMockVisitorStatuses] = useState<VisitorStatusItem[]>([])

  useEffect(() => {
    if (editingVisitor) {
      setForm(editingVisitor);
    }
  }, [editingVisitor]);

  const resetForm = () => {
    setForm({
      is_active: true,
      deleted_datetime: "",
      visitation_datetime: new Date().toISOString().split('T')[0],
      first_name: "",
      middle_name: "",
      last_name: "",
      organisation: "",
      id_number: "",
      contact_no: "",
      remarks: "",
      vehicle_no: "",
      time_in: "",
      time_out: "",
      reason_of_visitation: "",
      address: "",
      place_visited: "",
      blacklist_reason: "",
      photo: "",
      deleted_by: 0,
      visit_location: "",
      prisoner: "",
      visitor_type: "",
      relation: "",
      visitor_status: "",
      id_type: "",
      gate: "",
      gate_keeper: "",
    });
    setPhotoPreview("");
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setUseCamera(true);
    } catch (error) {
      toast.error("Failed to access camera");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg")
        );

        if (!blob) return;

        const file = new File([blob], "visitor-photo.jpg", { type: "image/jpeg" });
        const binaryString = await fileToBinaryString(file);
        setForm({ ...form, photo: binaryString });
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
        toast.success("Photo captured successfully");
      }
    }
  };

  async function fileToBinaryString(file: File): Promise<string> {
    const base64Data = await fileToBase64(file);
    // Remove the "data:image/jpeg;base64," prefix
    const [, rawBase64] = base64Data.split(",");
    return rawBase64;
  }


  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {

      const binaryString = await fileToBinaryString(file);
      setForm({ ...form, photo: binaryString });

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Photo uploaded successfully");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      const newVisitor = {
        ...form,
        time_in: timeToIso(form.time_in),
        time_out: timeToIso(form.time_out),
        id: editingVisitor?.id || `visitor-${Date.now()}`,
      };

      const response = await addStationVisitor(newVisitor)
      if (handleResponseError(response)) return

      setVisitors(prev => ([response, ...prev]))

      toast.success(
        editingVisitor
          ? "Visitor updated successfully"
          : "Visitor registered successfully"
      );

      // if (onVisitorCreated) {
      //   onVisitorCreated(newVisitor);
      // }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to save visitor");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  // APIS begin from here
  function handleServerError (response: any) {
    if ('error' in response){
          onOpenChange(false)
          setFormDataLoading(false)
          toast.error(response.error);
          return true
    }
    return false
  }

  function handleEmptyList (data: any, msg: string) {
    if (!data.length){
          onOpenChange(false)
          setFormDataLoading(false)
          toast.error(msg);
          return true
    }
    return false
  }

  function populateList(response: any, msg: string, setData: any) {
    if (handleServerError(response)) return

    if ("results" in response) {
      const data = response.results
      if(handleEmptyList(data, msg)) return
      setData(data)
    }
  }

  useEffect(() => {
    if (open){
      const fetchData =  async () => {
        setFormDataLoading(true)
        try {
          const response1 = await getIdTypes()
          populateList(response1, "There are no ID Types", setMockIDTypes)
        
          const response2 = await getPrisoners()
          populateList(response2, "There are no Prisoners", setMockPrisoners)
          // console.log(response2)
        
          const response3 = await getGates()
          populateList(response3, "There are no gates", setMockGates)
        
          const response4 = await getStaffProfile()
          populateList(response4, "There are no staff", setMockStaff)
          // console.log(response4)
        
          const response5 = await getVisitorTypes()
          populateList(response5, "There are no visitor types", setMockVisitorTypes)
          // console.log(response5)
        
          const response6 = await getVisitorStatus()
          populateList(response6, "There are no visitor statuses", setMockVisitorStatuses)
          // console.log(response6)
        
          const response7 = await getRelationships()
          populateList(response7, "There are no visitor-prisoner relationships", setMockRelationships)
          // console.log(response7)

          setFormDataLoading(false)

        }catch (error) {
          if (!error?.response) {
            toast.error('Failed to connect to server. Please try again.');
          }
          onOpenChange(false);
          setFormDataLoading(false)
        }
      }

      fetchData()
    }
  }, [open]);

  function timeToIso(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);

    const now = new Date();
    now.setHours(hours, minutes, 0, 0); // set hours, minutes, seconds, milliseconds

    return now.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {
          formDataLoading ? (
              <div className="flex-1 max-h-[90vh] p-6">
                <DialogHeader>
                      <DialogTitle></DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                <div className="size-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching some data, Please wait...
                    </p>
                  </div>
                </div>
              </div>
          ) : (
              <div className="flex-1 max-h-[90vh] p-6">
                <DialogHeader>
                  <DialogTitle>
                    {editingVisitor ? "Edit Visitor" : "Register New Visitor"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVisitor
                      ? "Update visitor information"
                      : "Register a new visitor and manage check-in/check-out"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="flex w-full">
                      <TabsTrigger value="personal">Personal Info</TabsTrigger>
                      <TabsTrigger value="visit">Visit Details</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                      <TabsTrigger value="photo">Photo</TabsTrigger>
                    </TabsList>

                    {/* Personal Information Tab */}
                    <TabsContent value="personal" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name *</Label>
                          <Input
                            id="first_name"
                            value={form.first_name}
                            onChange={(e) =>
                              setForm({ ...form, first_name: e.target.value })
                            }
                            placeholder="Enter first name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="middle_name">Middle Name</Label>
                          <Input
                            id="middle_name"
                            value={form.middle_name}
                            onChange={(e) =>
                              setForm({ ...form, middle_name: e.target.value })
                            }
                            placeholder="Enter middle name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name *</Label>
                          <Input
                            id="last_name"
                            value={form.last_name}
                            onChange={(e) =>
                              setForm({ ...form, last_name: e.target.value })
                            }
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact_no">Contact Number *</Label>
                          <Input
                            id="contact_no"
                            value={form.contact_no}
                            onChange={(e) =>
                              setForm({ ...form, contact_no: e.target.value })
                            }
                            placeholder="+256700123456"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="organisation">Organisation *</Label>
                          <Input
                            id="organisation"
                            value={form.organisation}
                            onChange={(e) =>
                              setForm({ ...form, organisation: e.target.value })
                            }
                            placeholder="Enter organisation name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={form.address}
                          onChange={(e) =>
                            setForm({ ...form, address: e.target.value })
                          }
                          placeholder="Enter full address"
                          rows={2}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ID Type */}
                        <div className="space-y-2">
                          <Label>ID Type *</Label>
                          <Popover
                            open={openIDTypeCombo}
                            onOpenChange={setOpenIDTypeCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openIDTypeCombo}
                                className="w-full justify-between"
                              >
                                {form.id_type
                                  ? mockIDTypes.find((t) => t.id === form.id_type)
                                      ?.name
                                  : "Select ID type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search ID type..." />
                                <CommandEmpty>No ID type found.</CommandEmpty>
                                <CommandGroup>
                                  {mockIDTypes.map((type) => (
                                    <CommandItem
                                      key={type.id}
                                      value={type.name}
                                      onSelect={() => {
                                        setForm({ ...form, id_type: type.id });
                                        setOpenIDTypeCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.id_type === type.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {type.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="id_number">ID Number *</Label>
                          <Input
                            id="id_number"
                            value={form.id_number}
                            onChange={(e) =>
                              setForm({ ...form, id_number: e.target.value })
                            }
                            placeholder="Enter ID number"
                            required
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Visit Details Tab */}
                    <TabsContent value="visit" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gate */}
                        <div className="space-y-2">
                          <Label>Gate *</Label>
                          <Popover
                            open={openGateCombo}
                            onOpenChange={setOpenGateCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openGateCombo}
                                className="w-full justify-between"
                              >
                                {form.gate
                                  ? mockGates.find((g) => g.id === form.gate)?.name
                                  : "Select gate..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search gate..." />
                                <CommandEmpty>No gate found.</CommandEmpty>
                                <CommandGroup>
                                  {mockGates.map((gate) => (
                                    <CommandItem
                                      key={gate.id}
                                      value={gate.name}
                                      onSelect={() => {
                                        setForm({ ...form, gate: gate.id });
                                        setOpenGateCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.gate === gate.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {gate.name} ({gate.station_name})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Gate Keeper */}
                        <div className="space-y-2">
                          <Label>Gate Keeper *</Label>
                          <Popover
                            open={openGateKeeperCombo}
                            onOpenChange={setOpenGateKeeperCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openGateKeeperCombo}
                                className="w-full justify-between"
                              >
                                {form.gate_keeper
                                  ? (() => {
                                    const staff = mockStaff.find((s) => s.id === form.gate_keeper);
                                    return staff ? `${staff.first_name} ${staff.last_name}` : "";
                                  })()
                                  : "Select gate keeper..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search staff..." />
                                <CommandEmpty>No staff found.</CommandEmpty>
                                <CommandGroup>
                                  {mockStaff.map((staff) => (
                                    <CommandItem
                                      key={staff.id}
                                      value={`${staff.first_name} ${staff.last_name}`}
                                      onSelect={() => {
                                        setForm({ ...form, gate_keeper: staff.id });
                                        setOpenGateKeeperCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.gate_keeper === staff.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {staff.first_name} {staff.last_name} ({staff.force_number})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Prisoner */}
                        <div className="space-y-2">
                          <Label>Prisoner *</Label>
                          <Popover
                            open={openPrisonerCombo}
                            onOpenChange={setOpenPrisonerCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openPrisonerCombo}
                                className="w-full justify-between"
                              >
                                {form.prisoner
                                  ? mockPrisoners.find((p) => p.id === form.prisoner)
                                      ?.full_name
                                  : "Select prisoner..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search prisoner..." />
                                <CommandEmpty>No prisoner found.</CommandEmpty>
                                <CommandGroup>
                                  {mockPrisoners.map((prisoner) => (
                                    <CommandItem
                                      key={prisoner.id}
                                      value={prisoner.full_name}
                                      onSelect={() => {
                                        setForm({ ...form, prisoner: prisoner.id });
                                        setOpenPrisonerCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.prisoner === prisoner.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {prisoner.full_name} ({prisoner.prisoner_number_value})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Visitor Type */}
                        <div className="space-y-2">
                          <Label>Visitor Type *</Label>
                          <Popover
                            open={openVisitorTypeCombo}
                            onOpenChange={setOpenVisitorTypeCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openVisitorTypeCombo}
                                className="w-full justify-between"
                              >
                                {form.visitor_type
                                  ? mockVisitorTypes.find(
                                      (t) => t.id === form.visitor_type
                                    )?.name
                                  : "Select visitor type..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search visitor type..." />
                                <CommandEmpty>No visitor type found.</CommandEmpty>
                                <CommandGroup>
                                  {mockVisitorTypes.map((type) => (
                                    <CommandItem
                                      key={type.id}
                                      value={type.name}
                                      onSelect={() => {
                                        setForm({ ...form, visitor_type: type.id });
                                        setOpenVisitorTypeCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.visitor_type === type.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {type.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Relationship */}
                        <div className="space-y-2">
                          <Label>Relationship *</Label>
                          <Popover
                            open={openRelationCombo}
                            onOpenChange={setOpenRelationCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openRelationCombo}
                                className="w-full justify-between"
                              >
                                {form.relation
                                  ? mockRelationships.find(
                                      (r) => r.id === form.relation
                                    )?.name
                                  : "Select relationship..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search relationship..." />
                                <CommandEmpty>No relationship found.</CommandEmpty>
                                <CommandGroup>
                                  {mockRelationships.map((rel) => (
                                    <CommandItem
                                      key={rel.id}
                                      value={rel.name}
                                      onSelect={() => {
                                        setForm({ ...form, relation: rel.id });
                                        setOpenRelationCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.relation === rel.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {rel.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Visitor Status */}
                        <div className="space-y-2">
                          <Label>Visitor Status *</Label>
                          <Popover
                            open={openVisitorStatusCombo}
                            onOpenChange={setOpenVisitorStatusCombo}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openVisitorStatusCombo}
                                className="w-full justify-between"
                              >
                                {form.visitor_status
                                  ? mockVisitorStatuses.find(
                                      (s) => s.id === form.visitor_status
                                    )?.name
                                  : "Select status..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search status..." />
                                <CommandEmpty>No status found.</CommandEmpty>
                                <CommandGroup>
                                  {mockVisitorStatuses.map((status) => (
                                    <CommandItem
                                      key={status.id}
                                      value={status.name}
                                      onSelect={() => {
                                        setForm({
                                          ...form,
                                          visitor_status: status.id,
                                        });
                                        setOpenVisitorStatusCombo(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          form.visitor_status === status.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {status.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Visitation Date */}
                        <div className="space-y-2">
                          <Label>Visitation Date *</Label>
                          <Input
                            type="date"
                            value={form.visitation_datetime}
                            onChange={(e) => setForm({ ...form, visitation_datetime: e.target.value })}
                          />
                          {/*<Popover open={calendarOpen} onOpenChange={setCalendarOpen}>*/}
                          {/*  <PopoverTrigger asChild>*/}
                          {/*    <Button*/}
                          {/*      variant="outline"*/}
                          {/*      className={cn(*/}
                          {/*        "w-full justify-start text-left",*/}
                          {/*        !form.visitation_datetime &&*/}
                          {/*          "text-muted-foreground"*/}
                          {/*      )}*/}
                          {/*    >*/}
                          {/*      <CalendarIcon className="mr-2 h-4 w-4" />*/}
                          {/*      {form.visitation_datetime ? (*/}
                          {/*        format(form.visitation_datetime, "PPP")*/}
                          {/*      ) : (*/}
                          {/*        <span>Pick a date</span>*/}
                          {/*      )}*/}
                          {/*    </Button>*/}
                          {/*  </PopoverTrigger>*/}
                          {/*  <PopoverContent className="w-auto p-0" align="start">*/}
                          {/*    <Calendar*/}
                          {/*      mode="single"*/}
                          {/*      selected={form.visitation_datetime}*/}
                          {/*      onSelect={(date: Date | undefined) => {*/}
                          {/*        if (date) {*/}
                          {/*          setForm({ ...form, visitation_datetime: date });*/}
                          {/*          setCalendarOpen(false);*/}
                          {/*        }*/}
                          {/*      }}*/}
                          {/*      initialFocus*/}
                          {/*    />*/}
                          {/*  </PopoverContent>*/}
                          {/*</Popover>*/}
                        </div>

                        {/* Time In */}
                        <div className="space-y-2">
                          <Label htmlFor="time_in">Time In</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              id="time_in"
                              type="time"
                              value={form.time_in}
                              onChange={(e) =>
                                setForm({ ...form, time_in: e.target.value })
                              }
                            />
                          </div>
                        </div>

                        {/* Time Out */}
                        <div className="space-y-2">
                          <Label htmlFor="time_out">Time Out</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              id="time_out"
                              type="time"
                              value={form.time_out}
                              onChange={(e) =>
                                setForm({ ...form, time_out: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vehicle_no">Vehicle Number</Label>
                          <Input
                            id="vehicle_no"
                            value={form.vehicle_no}
                            onChange={(e) =>
                              setForm({ ...form, vehicle_no: e.target.value })
                            }
                            placeholder="e.g., UAH 123X"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="place_visited">Place Visited *</Label>
                          <Input
                            id="place_visited"
                            value={form.place_visited}
                            onChange={(e) =>
                              setForm({ ...form, place_visited: e.target.value })
                            }
                            placeholder="e.g., Visitor's Hall"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reason_of_visitation">
                          Reason for Visitation *
                        </Label>
                        <Textarea
                          id="reason_of_visitation"
                          value={form.reason_of_visitation}
                          onChange={(e) =>
                            setForm({ ...form, reason_of_visitation: e.target.value })
                          }
                          placeholder="Enter reason for visit"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea
                          id="remarks"
                          value={form.remarks}
                          onChange={(e) =>
                            setForm({ ...form, remarks: e.target.value })
                          }
                          placeholder="Enter any remarks"
                          rows={2}
                        />
                      </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="blacklist_reason">Blacklist Reason</Label>
                        <Textarea
                          id="blacklist_reason"
                          value={form.blacklist_reason}
                          onChange={(e) =>
                            setForm({ ...form, blacklist_reason: e.target.value })
                          }
                          placeholder="If visitor is blacklisted, enter reason"
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    {/* Photo Tab */}
                    <TabsContent value="photo" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={startCamera}
                            disabled={useCamera}
                            className="flex-1"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Use Camera
                          </Button>
                          <label className="flex-1">
                            <Button type="button" className="w-full" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {useCamera && (
                          <div className="space-y-2">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              className="w-full rounded-lg border"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={capturePhoto}
                                className="flex-1"
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Capture Photo
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={stopCamera}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {photoPreview && (
                          <div className="space-y-2">
                            <Label>Preview</Label>
                            <img
                              src={photoPreview}
                              alt="Visitor"
                              className="w-full max-w-sm rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPhotoPreview("");
                                setForm({ ...form, photo: null });
                              }}
                            >
                              Remove Photo
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        onOpenChange(false);
                        resetForm();
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      style={{ backgroundColor: '#650000' }}
                      className="hover:opacity-90"
                      disabled={
                        loading ||
                        !form.first_name ||
                        !form.place_visited ||
                        !form.organisation ||
                        !form.reason_of_visitation ||
                        !form.last_name ||
                        !form.contact_no ||
                        !form.id_number ||
                        !form.gate ||
                        !form.prisoner ||
                        !form.visitor_type
                      }
                    >
                      {loading
                        ? "Saving..."
                        : editingVisitor
                        ? "Update Visitor"
                        : "Register Visitor"}
                    </Button>
                  </div>
                </form>
              </div>
          )
        }

      </DialogContent>
    </Dialog>
  );
}

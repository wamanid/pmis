import React, { useState, useEffect, useRef } from "react";
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
   StationVisitor, updateStationVisitor, VisitorStatusItem, VisitorTypeItem
 } from "../../services/stationServices/visitorsServices/VisitorsService";
// validation utils
import {
  phoneNumberValidation,
  emailValidation,
  requiredValidation,
  nationalIdValidation,
  passportValidation,
  nameValidation,
  pastDateValidation,
  normalizePhoneNumber,
} from "../../utils/validation";
 import {getStaffProfile, StaffItem} from "../../services/stationServices/staffDeploymentService";
 import {fileToBinaryString, handleResponseError} from "../../services/stationServices/utils";
import axiosInstance from "../../services/axiosInstance";

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
  setVisitors?: React.Dispatch<React.SetStateAction<Visitor[]>>;
  onSaved?: () => void;
  editingVisitor?: Visitor | null;
}


export default function VisitorRegistrationDialog({
  open,
  onOpenChange,
  setVisitors,
  editingVisitor,
  onSaved,
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

  // inline validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      // normalize visitation_datetime to yyyy-mm-dd for the date input
      const rawDate = (editingVisitor as any).visitation_datetime;
      let dateOnly = "";
      if (rawDate) {
        try {
          dateOnly =
            typeof rawDate === "string" && rawDate.includes("T")
              ? rawDate.split("T")[0]
              : new Date(rawDate).toISOString().split("T")[0];
        } catch {
          dateOnly = "";
        }
      }

      setForm({
        ...editingVisitor,
        visitation_datetime: dateOnly || new Date().toISOString().split("T")[0],
        time_in: extractTimeHHMM(editingVisitor?.time_in),
        time_out: extractTimeHHMM(editingVisitor?.time_out ?? ""),
      });
      setPhotoPreview((editingVisitor as any).photo ?? "");
    }
  }, [editingVisitor]);

  function extractTimeHHMM(isoString: string): string {
    const d = new Date(isoString);

    if (isNaN(d.getTime())) return ""; // invalid date

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  }

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

        const file = new File([blob], `visitor-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        // store File so we can append to FormData
        setForm({ ...form, photo: file as any });
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
        toast.success("Photo captured successfully");
      }
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
      // store File directly for upload
      setForm({ ...form, photo: file as any });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
       toast.success("Photo uploaded successfully");
    }
  };

  function combineDateAndTimeToIso(dateStr?: string, timeStr?: string) {
    if (!dateStr) return undefined;
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh = 0, mm = 0] = (timeStr || "").split(":").map((v) => Number(v || 0));
    const dt = new Date(y, (m || 1) - 1, d, Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
    if (Number.isNaN(dt.getTime())) return undefined;
    return dt.toISOString();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // client-side validation (show inline messages)
    const errs: Record<string,string> = {};

    // required / name validations
    if (!form.first_name || !form.first_name.trim()) errs.first_name = "First name is required";
    else if (!nameValidation.pattern.value.test(form.first_name.trim())) errs.first_name = nameValidation.pattern.message;

    if (!form.last_name || !form.last_name.trim()) errs.last_name = "Last name is required";
    else if (!nameValidation.pattern.value.test(form.last_name.trim())) errs.last_name = nameValidation.pattern.message;

    // contact number validation
    if (!form.contact_no || !String(form.contact_no).trim()) errs.contact_no = "Contact number is required";
    else if (!phoneNumberValidation.pattern.value.test(String(form.contact_no).trim())) errs.contact_no = phoneNumberValidation.pattern.message;

    // id type dependent validation
    const selectedIdType = mockIDTypes.find(t => t.id === form.id_type)?.name?.toLowerCase() ?? "";
    if (!form.id_number || !String(form.id_number).trim()) {
      errs.id_number = "ID / Passport number is required";
    } else {
      const idVal = String(form.id_number).trim();
      if (selectedIdType.includes("passport")) {
        if (!passportValidation.pattern.value.test(idVal)) errs.id_number = passportValidation.pattern.message;
      } else if (selectedIdType.includes("national") || selectedIdType.includes("id")) {
        if (!nationalIdValidation.pattern.value.test(idVal)) errs.id_number = nationalIdValidation.pattern.message;
      }
    }

    // visitation date must not be in the future
    if (!form.visitation_datetime) {
      errs.visitation_datetime = "Visitation date is required";
    } else {
      const ok = pastDateValidation.validate(String(form.visitation_datetime));
      if (ok !== true) errs.visitation_datetime = String(ok);
    }

    // required selects
    if (!form.gate) errs.gate = "Gate is required";
    if (!form.prisoner) errs.prisoner = "Prisoner is required";
    if (!form.visitor_type) errs.visitor_type = "Visitor type is required";
    if (!form.place_visited || !String(form.place_visited).trim()) errs.place_visited = "Place visited is required";
    if (!form.reason_of_visitation || !String(form.reason_of_visitation).trim()) errs.reason_of_visitation = "Reason for visit is required";

    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // normalize phone for backend
      const normalizedPhone = normalizePhoneNumber(String(form.contact_no || ""));
      const payload = { ...form, contact_no: normalizedPhone };

      // Build FormData for multipart upload (works with or without photo)
      const formData = new FormData();
      // required/standard fields (append strings only)
      formData.append("first_name", payload.first_name || "");
      formData.append("middle_name", payload.middle_name || "");
      formData.append("last_name", payload.last_name || "");
      formData.append("organisation", payload.organisation || "");
      formData.append("id_number", payload.id_number || "");
      formData.append("contact_no", payload.contact_no || "");
      formData.append("remarks", payload.remarks || "");
      formData.append("vehicle_no", payload.vehicle_no || "");
      formData.append("reason_of_visitation", payload.reason_of_visitation || "");
      formData.append("address", payload.address || "");
      formData.append("place_visited", payload.place_visited || "");
      formData.append("blacklist_reason", payload.blacklist_reason || "");
      formData.append("visit_location", payload.visit_location || "");
      formData.append("prisoner", payload.prisoner || "");
      formData.append("visitor_type", payload.visitor_type || "");
      formData.append("relation", payload.relation || "");
      formData.append("visitor_status", payload.visitor_status || "");
      formData.append("id_type", payload.id_type || "");
      formData.append("gate", payload.gate || "");
      formData.append("gate_keeper", payload.gate_keeper || "");

      // datetime conversions: visitation_datetime should be date-time (combine date + time_in if present)
      const visitationIso = combineDateAndTimeToIso(String(payload.visitation_datetime), payload.time_in);
      if (visitationIso) formData.append("visitation_datetime", visitationIso);

      // time_in is required (api expects date-time)
      const timeInIso = combineDateAndTimeToIso(String(payload.visitation_datetime), payload.time_in) ?? timeToIso(payload.time_in || "");
      if (timeInIso) formData.append("time_in", timeInIso);

      // time_out is optional: append only if provided
      if (payload.time_out) {
        const timeOutIso = combineDateAndTimeToIso(String(payload.visitation_datetime), payload.time_out) ?? timeToIso(payload.time_out);
        if (timeOutIso) formData.append("time_out", timeOutIso);
      }

      // Append photo file only if it's a File instance
      if (payload.photo && payload.photo instanceof File) {
        formData.append("photo", payload.photo as File);
      }

      // decide endpoint and method (create vs update)
      try {
        let res;
        if (!editingVisitor) {
          res = await axiosInstance.post("/gate-management/station-visitors/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          res = await axiosInstance.put(`/gate-management/station-visitors/${editingVisitor.id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        const responseData = res.data;
        if (handleResponseError(responseData)) return;
        if (!editingVisitor) {
          if (typeof setVisitors === "function") setVisitors((prev = []) => [responseData, ...prev]);
        } else {
          if (typeof setVisitors === "function") setVisitors((prev = []) => prev.map((v: any) => (v.id === responseData.id ? responseData : v)));
        }
        if (typeof onVisitorCreated === "function") onVisitorCreated(responseData);
        // notify parent to refresh server-backed DataTable
        try { onSaved?.(); } catch (e) { /* ignore */ }
      } catch (err: any) {
        console.error("Submit error:", err);
        const serverBody = err?.response?.data ?? err?.message ?? err;
        toast.error(typeof serverBody === "string" ? serverBody : JSON.stringify(serverBody));
        return;
      }

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
                          <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
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
                          <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
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
                          <Label htmlFor="contact_no">Contact Number <span className="text-red-500">*</span></Label>
                          <Input
                            id="contact_no"
                            value={form.contact_no}
                            onChange={(e) =>
                              setForm({ ...form, contact_no: e.target.value })
                            }
                            placeholder="+256700123456"
                            required
                          />
                         {errors.contact_no && <p className="text-red-500 text-sm mt-1">{errors.contact_no}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="organisation">Organisation <span className="text-red-500">*</span></Label>
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
                        <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
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
                          <Label>ID Type <span className="text-red-500">*</span></Label>
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
                          <Label htmlFor="id_number">ID Number <span className="text-red-500">*</span></Label>
                          <Input
                            id="id_number"
                            value={form.id_number}
                            onChange={(e) =>
                              setForm({ ...form, id_number: e.target.value })
                            }
                            placeholder="Enter ID number"
                            required
                          />
                         {errors.id_number && <p className="text-red-500 text-sm mt-1">{errors.id_number}</p>}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Visit Details Tab */}
                    <TabsContent value="visit" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gate */}
                        <div className="space-y-2">
                          <Label>Gate <span className="text-red-500">*</span></Label>
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
                          <Label>Gate Keeper <span className="text-red-500">*</span></Label>
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
                          <Label>Prisoner <span className="text-red-500">*</span></Label>
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
                          <Label>Visitor Type <span className="text-red-500">*</span></Label>
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
                          <Label>Relationship <span className="text-red-500">*</span></Label>
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
                          <Label>Visitor Status <span className="text-red-500">*</span></Label>
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
                          <Label>Visitation Date <span className="text-red-500">*</span></Label>
                          <Input
                            type="date"
                            value={form.visitation_datetime}
                            onChange={(e) => setForm({ ...form, visitation_datetime: e.target.value })}
                          />
                         {errors.visitation_datetime && <p className="text-red-500 text-sm mt-1">{errors.visitation_datetime}</p>}
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
                          <Label htmlFor="place_visited">Place Visited <span className="text-red-500">*</span></Label>
                          <Input
                            id="place_visited"
                            value={form.place_visited}
                            onChange={(e) =>
                              setForm({ ...form, place_visited: e.target.value })
                            }
                            placeholder="e.g., Visitor's Hall"
                          />
                         {errors.place_visited && <p className="text-red-500 text-sm mt-1">{errors.place_visited}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reason_of_visitation">
                          Reason for Visitation <span className="text-red-500">*</span>
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
                       {errors.reason_of_visitation && <p className="text-red-500 text-sm mt-1">{errors.reason_of_visitation}</p>}
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

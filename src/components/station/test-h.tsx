b4 use of resuable image and table refresh after data entry - VisitorRegistrationDialog

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
      setForm({
        ...editingVisitor,
        time_in: extractTimeHHMM(editingVisitor?.time_in),
        time_out: extractTimeHHMM(editingVisitor?.time_out ?? ""),
      });
      setPhotoPreview(editingVisitor.photo)
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







------------------


VisitorRegistrationDialog b4 updates 


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
import {getStaffProfile, StaffItem} from "../../services/stationServices/staffDeploymentService";
import {fileToBinaryString, handleResponseError} from "../../services/stationServices/utils";

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
      setForm({
        ...editingVisitor,
        time_in: extractTimeHHMM(editingVisitor?.time_in),
        time_out: extractTimeHHMM(editingVisitor?.time_out ?? ""),
      });
      setPhotoPreview(editingVisitor.photo)
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

        const file = new File([blob], "visitor-photo.jpg", { type: "image/jpeg" });
        const binaryString = await fileToBinaryString(file);
        setForm({ ...form, photo: binaryString });
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
        toast.success("Photo captured successfully");
      }
    }
  };

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

      if (newVisitor.photo?.startsWith("https://")) {
        delete newVisitor.photo;
      }

      // console.log(newVisitor)

      if (!editingVisitor) {
         const response = await addStationVisitor(newVisitor)
         if (handleResponseError(response)) return
         setVisitors(prev => ([response, ...prev]))
      }
      else {
         const response = await updateStationVisitor(newVisitor, editingVisitor.id)
         if (handleResponseError(response)) return
         if ("id" in response) {
           setVisitors(prev => prev.map(v => (v.id === response.id ? response : v)))
         }
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
                          <Label htmlFor="place_visited">Place Visited <span className="text-red-500">*</span></Label>
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










----------------------------


audio wrking upload strategy service

import axiosInstance from "./axiosInstance";
import { uploadFile, readFileAsBase64 } from "./fileUploadService";

/**
 * uploadStrategyService
 *
 * See earlier docstring...
 */

export type Endpoints = { audio: string; doc: string };

export interface SendOptions {
endpoints: Endpoints;
meta?: Record<string, any>;
onProgress?: (percent: number) => void;
signal?: AbortSignal;
forceBase64?: boolean;
}

export interface SendResult {
ok: boolean;
status?: number;
data?: any;
fileRef?: string | null;
error?: any;
}

// small audio extension fallback (kept local to avoid circular deps)
const AUDIO_EXTS_FALLBACK = ["mp3", "wav", "m4a", "aac", "ogg", "flac", "mpeg"];

function getFileExtLower(file: File) {
return (file.name.split(".").pop() || "").toLowerCase();
}

export async function sendFile(file: File, opts: SendOptions): Promise<SendResult> {
  const { endpoints, meta = {}, onProgress, signal, forceBase64 } = opts;

  try {
    const debugInfo = { filename: file?.name, size: file?.size, type: file?.type };
    console.debug("[uploadStrategy] sendFile called", debugInfo);
  } catch (e) { /* ignore debug errors */ }

  try {
    let fileKey: string | null = null;
    for (const k of Object.keys(meta)) {
      try {
        if (meta[k] === file) { fileKey = k; break; }
      } catch {}
    }

    const ext = getFileExtLower(file);
    const mimeType = (file.type || "").toLowerCase();
    const isAudioMime = mimeType.startsWith("audio/");
    const isAudioExt = AUDIO_EXTS_FALLBACK.includes(ext);
    const isAudio = !forceBase64 && (isAudioMime || isAudioExt);

    console.debug("[uploadStrategy] file detection", { ext, mimeType, isAudioMime, isAudioExt, isAudio });

    // STRICT RULE: multipart only for audio files.
    if (isAudio) {
      const targetField = fileKey ?? "recorded_call";
      const extraData: Record<string, any> = {};
      Object.entries(meta).forEach(([k, v]) => {
        if (k === fileKey) return;
        if (v === undefined || v === null) return;
        extraData[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
      });

      console.debug("[uploadStrategy] using multipart (audio)", { targetField, url: endpoints.audio });

      try {
        const data = await uploadFile(file, {
          url: endpoints.audio,
          fieldName: targetField,
          extraData,
          onProgress,
          signal,
        });
        console.debug("[uploadStrategy] multipart upload response received", { url: endpoints.audio });
        const fileRef = extractFileRefFromResp(data);
        return { ok: true, status: 200, data, fileRef };
      } catch (err: any) {
        console.debug("[uploadStrategy] multipart upload error", { url: endpoints.audio, err: err?.message ?? err });
        if (err?.status) return { ok: false, status: err.status, data: err.data, error: err };
        return { ok: false, error: err };
      }
    }

    // NON-AUDIO: always send as base64 JSON payload to endpoints.doc
    console.debug("[uploadStrategy] using base64 JSON payload (non-audio)", { url: endpoints.doc });
    const { base64, filename, mimeType: mt } = await readFileAsBase64(file);

    const payload: Record<string, any> = { ...meta };
    const targetKey = fileKey ?? "file";
    payload[targetKey] = {
      filename,
      content_base64: base64,
      content_type: mt,
    };

    try {
      const resp = await axiosInstance.post(endpoints.doc, payload, { signal });
      console.debug("[uploadStrategy] base64 JSON response received", { url: endpoints.doc, status: resp.status });
      const fileRef = extractFileRefFromResp(resp.data);
      return { ok: true, status: resp.status, data: resp.data, fileRef };
    } catch (err: any) {
      console.debug("[uploadStrategy] base64 JSON upload error", { url: endpoints.doc, err: err?.message ?? err });
      if (err?.response) {
        return { ok: false, status: err.response.status, data: err.response.data, error: err.response.data };
      } else if (err?.request) {
        return { ok: false, error: new Error("Network / no response") };
      }
      return { ok: false, error: err };
    }
  } catch (err: any) {
    console.debug("[uploadStrategy] unexpected error in sendFile", { err: err?.message ?? err });
    return { ok: false, error: err };
  }
}

// helper used above (re-add if not present)
function extractFileRefFromResp(data: any): string | null {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (data.file_identifier) return data.file_identifier;
    if (data.recorded_call && typeof data.recorded_call === "string") return data.recorded_call;
    if (data.letter_document && typeof data.letter_document === "string") return data.letter_document;
    if (data.id) return String(data.id);
    if (data.url) return data.url;
    if (data.path) return data.path;
    return null;
}












import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Search, Edit, Trash2, X, Save, Calendar as CalendarIcon, Upload, Phone, Mail } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner"; // fixed import
import SearchableSelect from "../common/SearchableSelect";
import FileUploader from "../common/FileUploader";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "../ui/switch";
import { DataTable } from "../common/DataTable";
import * as PhoneService from "../../services/stationServices/phoneService";
import * as LetterService from "../../services/stationServices/letterService";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from "../../services/axiosInstance";
// use the typed/custom prisoners service (returns { items, count })
import { fetchPrisoners as fetchPrisonersService } from "../../services/customPrisonersService";
import { sendFile } from "../../services/uploadStrategyService";
import { readFileAsBase64 } from "../../services/fileUploadService"; // new import

/**
 * Centralized API endpoints (single source of truth).
 * Update these values to match backend routes. Use these variables
 * everywhere instead of hardcoding strings.
 */
const API_ENDPOINTS = {
  createLetter: "/rehabilitation/eletters/",        // POST to create letter (JSON)
  createCall: "/rehabilitation/call-records/",      // POST to create call record (JSON)
  // Upload endpoints used by uploadStrategyService.
  // If your backend has dedicated upload endpoints, set them here.
  // Otherwise uploadStrategyService will post base64 JSON to `doc` endpoint
  // or multipart to `audio` endpoint depending on file type.

};

const AUDIO_EXTS = ["mp3","wav","m4a","aac","ogg","flac"];

// create accept strings for inputs from the extension lists
// keep these centralized so future devs can change formats in one place
const AUDIO_UPLOAD_ACCEPT = "." + AUDIO_EXTS.join(",.");
const LETTER_UPLOAD_ALLOWED_EXTS = [
  // Document formats
  "pdf", "doc", "docx", "txt", "odt",
  // Image formats
  "jpg", "jpeg", "png", "tif", "tiff", "bmp",
];
// accept string used on <input accept="...">
const LETTER_UPLOAD_ACCEPT = "." + LETTER_UPLOAD_ALLOWED_EXTS.join(",.");

// helper: get extension in lowercase (without dot)
function fileExt(file: File | null) {
  if (!file) return "";
  return (file.name.split(".").pop() || "").toLowerCase();
}

// helper: extract a usable file reference from uploadStrategyService response
function extractFileRefFromSendResult(res: any): string | null {
  // backends vary; check common shapes and return a string usable by create endpoints
  if (!res) return null;
  // sometimes service returns normalized { ok, data }
  const data = res.data ?? res;
  if (!data) return null;
  // common fields
  if (typeof data === "string") return data;               // maybe base64 or URL string
  if (data.file_identifier) return data.file_identifier;   // custom
  if (data.id) return String(data.id);
  if (data.url) return data.url;
  if (data.path) return data.path;
  // if API returned structure with file.content_base64
  if (data.file && data.file.content_base64) return data.file.content_base64;
  // fallback — caller can inspect res.data manually in logs
  return null;
}

// Replace onSubmitCall with centralized sendFile usage
const onSubmitCall = async (data: any) => {
  try {
    const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

    // If file present validate extension
    if (file) {
      const ext = fileExt(file);
      if (!AUDIO_EXTS.includes(ext)) {
        toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
        return;
      }

      // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
      // so sendFile will post multipart with meta (other fields) to that endpoint.
      const sendRes = await sendFile(file, {
        endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
        meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
      });

      if (!sendRes.ok) {
        console.error("call file upload failed", sendRes.error ?? sendRes);
        toast.error("Failed to upload recorded call");
        return;
      }

      // If the upload endpoint created the record, we're done.
      if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
        toast.success(editingCall?.id ? "Call updated" : "Call created");
      } else {
        // Otherwise, try to extract a file reference and post the record normally.
        const fileRef = extractFileRefFromSendResult(sendRes);
        if (fileRef) data.recorded_call = fileRef;
        else data.recorded_call = sendRes.data ?? null;

        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }
    } else {
      // No file -> send JSON via existing service
      if (editingCall?.id) {
        await PhoneService.updateCallRecord(editingCall.id, data);
        toast.success("Call updated");
      } else {
        await PhoneService.createCallRecord(data);
        toast.success("Call created");
      }
    }

    setCallDialogOpen(false);
    loadCalls(page, pageSize);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save call");
  }
};

// Replace onSubmitLetter with centralized sendFile usage
const onSubmitLetter = async (data: any) => {
  try {
    const file = data?.letter_document instanceof File ? data.letter_document as File : null;

    if (file) {
      const ext = fileExt(file);
      if (!LETTER_UPLOAD_ALLOWED_EXTS.includes(ext)) {
        toast.error(`Letter document must be one of: ${LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}`);
        return;
      }

      // Use upload strategy service:
      // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
      // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
      const sendRes = await sendFile(file, {
        endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
        meta: { ...data },
      });

      if (!sendRes.ok) {
        console.error("letter file upload failed", sendRes.error ?? sendRes);
        toast.error("Failed to upload letter document");
        return;
      }

      // If endpoint returned created resource, done.
      if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
        toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
      } else {
        // Otherwise extract file ref and include in JSON create call.
        const fileRef = extractFileRefFromSendResult(sendRes);
        if (fileRef) data.letter_document = fileRef;
        else data.letter_document = sendRes.data ?? null;

        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }
    } else {
      // No file -> send JSON as before
      if (editingLetter?.id) {
        await LetterService.updateLetter(editingLetter.id, data);
        toast.success("Letter updated");
      } else {
        await LetterService.createLetter(data);
        toast.success("Letter created");
      }
    }

    setLetterDialogOpen(false);
    loadLetters(page, pageSize);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save letter");
  }
};

type Tab = "calls" | "letters";

export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>("calls");

  // shared table state (calls)
  const [callsData, setCallsData] = useState<PhoneService.CallRecordItem[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsTotal, setCallsTotal] = useState(0);

  // shared table state (letters)
  const [lettersData, setLettersData] = useState<LetterService.ELetterItem[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersTotal, setLettersTotal] = useState(0);

  // paging / sort / search (shared pattern, separate state per table)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // lookups for selects
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);

  // dialog / form state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PhoneService.CallRecordItem | null>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterService.ELetterItem | null>(null);

  // forms
  const callForm = useForm<any>({ defaultValues: {} });
  const letterForm = useForm<any>({ defaultValues: {} });

  // Map API item -> table row (if you need normalization)
  const mapCall = useCallback((it: any): PhoneService.CallRecordItem => ({ ...it }), []);
  const mapLetter = useCallback((it: any): LetterService.ELetterItem => ({ ...it }), []);

  // load lookups used in searchable selects
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [lt, rel] = await Promise.all([
          LetterService.fetchLetterTypes(undefined, c.signal),
          LetterService.fetchRelationships(undefined, c.signal),
        ]);
        if (!mounted) return;
        setLetterTypes(lt ?? []);
        setRelationships(rel ?? []);
      } catch (err) {
        console.error("lookup error", err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Parent-controlled loadTable for calls
  const loadCalls = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setCallsLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      // include location filters from top nav if present
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await PhoneService.fetchCallRecords(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setCallsData((items || []).map(mapCall));
        setCallsTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadCalls error", err);
      toast.error("Failed to load call records");
    } finally {
      if (requestIdRef.current === reqId) setCallsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapCall]);

  // Parent-controlled loadTable for letters
  const loadLetters = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLettersLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await LetterService.fetchLetters(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setLettersData((items || []).map(mapLetter));
        setLettersTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadLetters error", err);
      toast.error("Failed to load letters");
    } finally {
      if (requestIdRef.current === reqId) setLettersLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapLetter]);

  // reload when filters or debounce/search change
  useEffect(() => {
    if (activeTab === "calls") {
      loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    } else {
      loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
    }
  }, [activeTab, page, pageSize, sortField, sortDir, debouncedSearch, loadCalls, loadLetters]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    if (activeTab === "calls") loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    else loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
  }, [region, district, station]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => setPage(p);
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: "asc" | "desc" | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // columns
  const callsColumns = [
    { key: "call_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{row.call_date ? new Date(row.call_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "caller", label: "Caller" },
    { key: "phone_number", label: "Phone" },
    { key: "call_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "call_duration", label: "Duration" },
    { key: "call_notes", label: "Notes", render: (v: any) => (<div className="max-w-xs truncate">{v || "-"}</div>) },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingCall(r); callForm.reset(r); setCallDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await PhoneService.deleteCallRecord(r.id); toast.success("Deleted"); loadCalls(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  const lettersColumns = [
    { key: "letter_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div>{row.letter_date ? new Date(row.letter_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "letter_tracking_number", label: "Tracking No." },
    { key: "subject", label: "Subject" },
    { key: "letter_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingLetter(r); letterForm.reset(r); setLetterDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await LetterService.deleteLetter(r.id); toast.success("Deleted"); loadLetters(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  // wrapper that forwards current filter context to centralized service
  const fetchPrisoners = useCallback(async (q = "", signal?: AbortSignal) => {
    try {
      const res = await fetchPrisonersService(
        { search: q || "", station: station ?? null, district: district ?? null, region: region ?? null, page_size: 100 },
        signal
      );

      // NORMALIZE: service may return { items, count } or an array
      const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);

      // safety: ensure we always operate on an array
      if (!Array.isArray(items)) return [];

      const qlc = (q || "").trim().toLowerCase();
      if (!qlc) return items;

      return items.filter((it: any) => {
        return String(it.full_name ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number_value ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number ?? "").toLowerCase().includes(qlc);
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      console.error("prisoners lookup error", err);
      toast.error("Failed to load prisoners (network).");
      // toast.error("Failed to load prisoners (network). Check CORS / backend or use dev proxy.");
      return [];
    }
  }, [station, district, region]);

  const fetchCallTypes = useCallback(async (q = "", signal?: AbortSignal) => {
    const res = await axiosInstance.get("/rehabilitation/call-types/", { params: { search: q, page_size: 50 }, signal });
    return res.data?.results ?? [];
  }, []);

  // small wrappers for preloaded lists (relationships, letterTypes)
  const fetchRelationshipsLocal = useCallback(async (q = "") => {
    if (!q) return relationships;
    const qlc = q.toLowerCase();
    return relationships.filter((r:any) => String(r.name ?? "").toLowerCase().includes(qlc));
  }, [relationships]);

  const fetchLetterTypesLocal = useCallback(async (q = "") => {
    if (!q) return letterTypes;
    const qlc = q.toLowerCase();
    return letterTypes.filter((t:any) => String(t.name ?? "").toLowerCase().includes(qlc));
  }, [letterTypes]);

  // form submit handlers
  const onSubmitCall = async (data: any) => {
    try {
      const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

      // If file present validate extension
      if (file) {
        const ext = fileExt(file);
        if (!AUDIO_EXTS.includes(ext)) {
          toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
        // so sendFile will post multipart with meta (other fields) to that endpoint.
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
          meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
        });

        if (!sendRes.ok) {
          console.error("call file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload recorded call");
          return;
        }

        // If the upload endpoint created the record, we're done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
          toast.success(editingCall?.id ? "Call updated" : "Call created");
        } else {
          // Otherwise, try to extract a file reference and post the record normally.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.recorded_call = fileRef;
          else data.recorded_call = sendRes.data ?? null;

          if (editingCall?.id) {
            await PhoneService.updateCallRecord(editingCall.id, data);
            toast.success("Call updated");
          } else {
            await PhoneService.createCallRecord(data);
            toast.success("Call created");
          }
        }
      } else {
        // No file -> send JSON via existing service
        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }

      setCallDialogOpen(false);
      loadCalls(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save call");
    }
  };

  const onSubmitLetter = async (data: any) => {
    try {
      const file = data?.letter_document instanceof File ? data.letter_document as File : null;

      if (file) {
        const ext = fileExt(file);
        if (!LETTER_UPLOAD_ALLOWED_EXTS.includes(ext)) {
          toast.error(`Letter document must be one of: ${LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service:
        // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
        // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
          meta: { ...data },
        });

        if (!sendRes.ok) {
          console.error("letter file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload letter document");
          return;
        }

        // If endpoint returned created resource, done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
          toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
        } else {
          // Otherwise extract file ref and include in JSON create call.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.letter_document = fileRef;
          else data.letter_document = sendRes.data ?? null;

          if (editingLetter?.id) {
            await LetterService.updateLetter(editingLetter.id, data);
            toast.success("Letter updated");
          } else {
            await LetterService.createLetter(data);
            toast.success("Letter created");
          }
        }
      } else {
        // No file -> send JSON as before
        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }

      setLetterDialogOpen(false);
      loadLetters(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save letter");
    }
  };

  // Prefetch both tables on mount so counts for inactive tab are available immediately.
  useEffect(() => {
    // use the existing load functions (they are stable via useCallback)
    loadCalls(1, pageSize, sortField, sortDir, debouncedSearch).catch(() => {});
    loadLetters(1, pageSize, sortField, sortDir, debouncedSearch).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCalls, loadLetters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#650000]">Letters & Phone Calls</h1>
        <p className="text-muted-foreground">Manage prisoner communications and correspondence</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab === "calls" ? "calls" : "letters"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button
          className="bg-primary"
          onClick={() => {
            if (activeTab === "calls") {
              setEditingCall(null);
              callForm.reset({});
              setCallDialogOpen(true);
            } else {
              setEditingLetter(null);
              letterForm.reset({});
              setLetterDialogOpen(true);
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {activeTab === "calls" ? "Add Call Record" : "Add Letter"}
        </Button>
      </div>

      {/* Big pill-style tabs with icon + count */}
      <Tabs value={activeTab} onValueChange={(v: Tab) => setActiveTab(v)}>
        <TabsList className="grid w-full grid-cols-2 gap-4 mb-4">
          <TabsTrigger
            value="calls"
            className={`flex items-center justify-center gap-3 py-4 px-6 text-lg rounded-xl shadow-md transition-colors ${
              activeTab === "calls" ? "bg-[#650000] text-white ring-2 ring-[#2a0000]" : "bg-white text-gray-700"
            }`}
          >
            <Phone className="h-5 w-5" />
            Phone Calls ({callsTotal ?? 0})
          </TabsTrigger>
          <TabsTrigger
            value="letters"
            className={`flex items-center justify-center gap-3 py-4 px-6 text-lg rounded-xl shadow-md transition-colors ${
              activeTab === "letters" ? "bg-[#650000] text-white ring-2 ring-[#2a0000]" : "bg-white text-gray-700"
            }`}
          >
            <Mail className="h-5 w-5" />
            Letters ({lettersTotal ?? 0})
          </TabsTrigger>
        </TabsList>

        <Card>
           <CardHeader>
             <CardTitle>{activeTab === "calls" ? "Call Records" : "Letters"}</CardTitle>
           </CardHeader>
           <CardContent>
             {activeTab === "calls" ? (
               <DataTable
                 data={callsData}
                 loading={callsLoading}
                 total={callsTotal}
                 title="Call Records"
                 columns={callsColumns}
                 externalSearch={searchTerm}
                 onSearch={onSearch}
                 onPageChange={onPageChange}
                 onPageSizeChange={onPageSizeChange}
                 onSort={onSort}
                 page={page}
                 pageSize={pageSize}
               />
             ) : (
               <DataTable
                 data={lettersData}
                 loading={lettersLoading}
                 total={lettersTotal}
                 title="Letters"
                 columns={lettersColumns}
                 externalSearch={searchTerm}
                 onSearch={onSearch}
                 onPageChange={onPageChange}
                 onPageSizeChange={onPageSizeChange}
                 onSort={onSort}
                 page={page}
                 pageSize={pageSize}
               />
             )}
           </CardContent>
         </Card>
       </Tabs>

      {/* Call dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCall ? "Edit Call Record" : "Add Call Record"}</DialogTitle></DialogHeader>
          <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      key={`prisoner-select-${region ?? ""}-${district ?? ""}-${station ?? ""}`}
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {callForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Caller Name (required) */}
              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="caller"
                  {...callForm.register("caller", { required: "Caller name is required" })}
                  placeholder="Enter caller name"
                />
                {callForm.formState.errors.caller && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.caller as any).message}</p>
                )}
              </div>

              {/* Phone Number (required) */}
              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  {...callForm.register("phone_number", { ...phoneNumberValidation, required: "Phone number is required" })}
                  placeholder="+256700000000"
                />
                {callForm.formState.errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.phone_number as any).message}</p>
                )}
              </div>

              {/* Call Type (required) */}
              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="call_type"
                  control={callForm.control}
                  rules={requiredValidation("Call type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchCallTypes}
                      placeholder="Select call type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.call_type && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_type as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="relation_to_prisoner">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    // use local preloaded list for relationships
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Call Date & Time (required) */}
              <div>
                <Label htmlFor="call_date">
                  Call Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_date"
                  type="datetime-local"
                  {...callForm.register("call_date", { required: "Call date is required" })}
                />
                {callForm.formState.errors.call_date && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_date as any).message}</p>
                )}
              </div>

              {/* Call Duration (required) */}
              <div>
                <Label htmlFor="call_duration">
                  Call Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_duration"
                  type="number"
                  {...callForm.register("call_duration", {
                    required: "Call duration is required",
                    valueAsNumber: true,
                  })}
                  placeholder="Enter duration in minutes"
                />
                {callForm.formState.errors.call_duration && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_duration as any).message}</p>
                )}
              </div>

              {/* Recorded Call (optional upload) */}
              <div>
                <Label htmlFor="recorded_call">Recorded Call (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Upload audio recording (optional)</p>
                  {/* FileUploader provides client-side validation + UX.
                      For recorded calls we allow common audio formats; change list below if needed. */}
                  <FileUploader
                    id="recorded_call"
                    accept={AUDIO_UPLOAD_ACCEPT}
                    allowedExts={AUDIO_EXTS}
                    maxSizeBytes={10 * 1024 * 1024} // 10 MB
                    onChange={(files) => {
                      if (files && files.length) callForm.setValue("recorded_call", files[0]);
                      else callForm.setValue("recorded_call", null);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Call Notes */}
            <div>
              <Label htmlFor="call_notes">Call Notes</Label>
              <Textarea
                id="call_notes"
                {...callForm.register("call_notes")}
                placeholder="Enter any notes about the call"
                rows={4}
              />
            </div>
             <div className="flex justify-end gap-2">
               <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
               <Button type="submit" className="bg-primary">{editingCall ? "Update" : "Create"}</Button>
             </div>
           </form>
        </DialogContent>
       </Dialog>

      {/* Letter dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLetter ? "Edit Letter" : "Add Letter"}</DialogTitle></DialogHeader>
          <form onSubmit={letterForm.handleSubmit(onSubmitLetter)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {letterForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Letter Type (required) */}
              <div>
                <Label htmlFor="letter_type">
                  Letter Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="letter_type"
                  control={letterForm.control}
                  rules={requiredValidation("Letter type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      items={letterTypes}
                      placeholder="Select letter type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.letter_type && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_type as any).message}</p>
                )}
              </div>

              {/* Subject (required) */}
              <div className="md:col-span-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  {...letterForm.register("subject", { required: "Subject is required" })}
                  placeholder="Enter letter subject"
                />
                {letterForm.formState.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.subject as any).message}</p>
                )}
              </div>

              {/* Letter Date (required) */}
              <div>
                <Label htmlFor="letter_date">
                  Letter Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="letter_date"
                  type="datetime-local"
                  {...letterForm.register("letter_date", { required: "Letter date is required" })}
                />
                {letterForm.formState.errors.letter_date && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_date as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="letter_relation">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Sender Name */}
              <div>
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  {...letterForm.register("sender_name")}
                  placeholder="Enter sender name"
                />
              </div>

              {/* Sender Email */}
              <div>
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  {...letterForm.register("sender_email", emailValidation)}
                  placeholder="sender@example.com"
                />
              </div>

              {/* Recipient Name */}
              <div>
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  {...letterForm.register("recipient_name")}
                  placeholder="Enter recipient name"
                />
              </div>

              {/* Recipient Email */}
              <div>
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  {...letterForm.register("recipient_email", emailValidation)}
                  placeholder="recipient@example.com"
                />
              </div>

            </div>

            {/* Letter Content */}
            <div>
              <Label htmlFor="letter_content">Letter Content</Label>
              <Textarea
                id="letter_content"
                {...letterForm.register("letter_content")}
                placeholder="Enter letter content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Letter Document */}
              <div>
                <Label htmlFor="letter_document">Letter Document (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload scanned letter or PDF (optional)</p>

                  {/* Reusable FileUploader with the centralized allowed extensions constant.
                      onChange updates react-hook-form value to the selected File (or null). */}
                  <FileUploader
                    id="letter_document"
                    accept={LETTER_UPLOAD_ACCEPT}
                    allowedExts={LETTER_UPLOAD_ALLOWED_EXTS}
                    maxSizeBytes={15 * 1024 * 1024} // 15 MB, adjust as needed
                    onChange={(files) => {
                      if (files && files.length) letterForm.setValue("letter_document", files[0]);
                      else letterForm.setValue("letter_document", null);
                      // clear previous validation errors if any
                      letterForm.clearErrors("letter_document");
                    }}
                  />
                  {/* still show react-hook-form validation error if present */}
                  {letterForm.formState.errors.letter_document && (
                    <p className="text-red-500 text-sm mt-1">
                      {(letterForm.formState.errors.letter_document as any).message ||
                        (letterForm.formState.errors.letter_document as any)}
                    </p>
                  )}

                   {/* UX hint listing allowed formats */}
                   <p className="text-xs text-muted-foreground mt-2">
                     Allowed formats: {LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}. You can change the allowed list in code if needed.
                   </p>
                 </div>
               </div>

               {/* Comment */}
               <div>
                 <Label htmlFor="comment">Censor Comments</Label>
                 <Textarea
                   id="comment"
                   {...letterForm.register("comment")}
                   placeholder="Enter censor comments or notes"
                   rows={9}
                 />
               </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingLetter ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


















import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Search, Edit, Trash2, X, Save, Calendar as CalendarIcon, Upload, Phone, Mail } from "lucide-react";
import { toast } from "sonner"; // fixed import
import SearchableSelect from "../common/SearchableSelect";
import FileUploader from "../common/FileUploader";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "../ui/switch";
import { DataTable } from "../common/DataTable";
import * as PhoneService from "../../services/stationServices/phoneService";
import * as LetterService from "../../services/stationServices/letterService";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from "../../services/axiosInstance";
// use the typed/custom prisoners service (returns { items, count })
import { fetchPrisoners as fetchPrisonersService } from "../../services/customPrisonersService";
import { sendFile } from "../../services/uploadStrategyService";
import { readFileAsBase64 } from "../../services/fileUploadService"; // new import

/**
 * Centralized API endpoints (single source of truth).
 * Update these values to match backend routes. Use these variables
 * everywhere instead of hardcoding strings.
 */
const API_ENDPOINTS = {
  createLetter: "/rehabilitation/eletters/",        // POST to create letter (JSON)
  createCall: "/rehabilitation/call-records/",      // POST to create call record (JSON)
  // Upload endpoints used by uploadStrategyService.
  // If your backend has dedicated upload endpoints, set them here.
  // Otherwise uploadStrategyService will post base64 JSON to `doc` endpoint
  // or multipart to `audio` endpoint depending on file type.

};

const AUDIO_EXTS = ["mp3","wav","m4a","aac","ogg","flac"];

// create accept strings for inputs from the extension lists
// keep these centralized so future devs can change formats in one place
const AUDIO_UPLOAD_ACCEPT = "." + AUDIO_EXTS.join(",.");
const LETTER_UPLOAD_ALLOWED_EXTS = [
  // Document formats
  "pdf", "doc", "docx", "txt", "odt",
  // Image formats
  "jpg", "jpeg", "png", "tif", "tiff", "bmp",
];
// accept string used on <input accept="...">
const LETTER_UPLOAD_ACCEPT = "." + LETTER_UPLOAD_ALLOWED_EXTS.join(",.");

// helper: get extension in lowercase (without dot)
function fileExt(file: File | null) {
  if (!file) return "";
  return (file.name.split(".").pop() || "").toLowerCase();
}

// helper: extract a usable file reference from uploadStrategyService response
function extractFileRefFromSendResult(res: any): string | null {
  // backends vary; check common shapes and return a string usable by create endpoints
  if (!res) return null;
  // sometimes service returns normalized { ok, data }
  const data = res.data ?? res;
  if (!data) return null;
  // common fields
  if (typeof data === "string") return data;               // maybe base64 or URL string
  if (data.file_identifier) return data.file_identifier;   // custom
  if (data.id) return String(data.id);
  if (data.url) return data.url;
  if (data.path) return data.path;
  // if API returned structure with file.content_base64
  if (data.file && data.file.content_base64) return data.file.content_base64;
  // fallback — caller can inspect res.data manually in logs
  return null;
}

// Replace onSubmitCall with centralized sendFile usage
const onSubmitCall = async (data: any) => {
  try {
    const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

    // If file present validate extension
    if (file) {
      const ext = fileExt(file);
      if (!AUDIO_EXTS.includes(ext)) {
        toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
        return;
      }

      // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
      // so sendFile will post multipart with meta (other fields) to that endpoint.
      const sendRes = await sendFile(file, {
        endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
        meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
      });

      if (!sendRes.ok) {
        console.error("call file upload failed", sendRes.error ?? sendRes);
        toast.error("Failed to upload recorded call");
        return;
      }

      // If the upload endpoint created the record, we're done.
      if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
        toast.success(editingCall?.id ? "Call updated" : "Call created");
      } else {
        // Otherwise, try to extract a file reference and post the record normally.
        const fileRef = extractFileRefFromSendResult(sendRes);
        if (fileRef) data.recorded_call = fileRef;
        else data.recorded_call = sendRes.data ?? null;

        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }
    } else {
      // No file -> send JSON via existing service
      if (editingCall?.id) {
        await PhoneService.updateCallRecord(editingCall.id, data);
        toast.success("Call updated");
      } else {
        await PhoneService.createCallRecord(data);
        toast.success("Call created");
      }
    }

    setCallDialogOpen(false);
    loadCalls(page, pageSize);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save call");
  }
};

// Replace onSubmitLetter with centralized sendFile usage
const onSubmitLetter = async (data: any) => {
  try {
    const file = data?.letter_document instanceof File ? data.letter_document as File : null;

    if (file) {
      const ext = fileExt(file);
      if (!LETTER_UPLOAD_ALLOWED_EXTS.includes(ext)) {
        toast.error(`Letter document must be one of: ${LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}`);
        return;
      }

      // Use upload strategy service:
      // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
      // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
      const sendRes = await sendFile(file, {
        endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
        meta: { ...data },
      });

      if (!sendRes.ok) {
        console.error("letter file upload failed", sendRes.error ?? sendRes);
        toast.error("Failed to upload letter document");
        return;
      }

      // If endpoint returned created resource, done.
      if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
        toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
      } else {
        // Otherwise extract file ref and include in JSON create call.
        const fileRef = extractFileRefFromSendResult(sendRes);
        if (fileRef) data.letter_document = fileRef;
        else data.letter_document = sendRes.data ?? null;

        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }
    } else {
      // No file -> send JSON as before
      if (editingLetter?.id) {
        await LetterService.updateLetter(editingLetter.id, data);
        toast.success("Letter updated");
      } else {
        await LetterService.createLetter(data);
        toast.success("Letter created");
      }
    }

    setLetterDialogOpen(false);
    loadLetters(page, pageSize);
  } catch (err) {
    console.error(err);
    toast.error("Failed to save letter");
  }
};

type Tab = "calls" | "letters";

export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>("calls");

  // shared table state (calls)
  const [callsData, setCallsData] = useState<PhoneService.CallRecordItem[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsTotal, setCallsTotal] = useState(0);

  // shared table state (letters)
  const [lettersData, setLettersData] = useState<LetterService.ELetterItem[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersTotal, setLettersTotal] = useState(0);

  // paging / sort / search (shared pattern, separate state per table)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // lookups for selects
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);

  // dialog / form state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PhoneService.CallRecordItem | null>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterService.ELetterItem | null>(null);

  // forms
  const callForm = useForm<any>({ defaultValues: {} });
  const letterForm = useForm<any>({ defaultValues: {} });

  // Map API item -> table row (if you need normalization)
  const mapCall = useCallback((it: any): PhoneService.CallRecordItem => ({ ...it }), []);
  const mapLetter = useCallback((it: any): LetterService.ELetterItem => ({ ...it }), []);

  // load lookups used in searchable selects
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [lt, rel] = await Promise.all([
          LetterService.fetchLetterTypes(undefined, c.signal),
          LetterService.fetchRelationships(undefined, c.signal),
        ]);
        if (!mounted) return;
        setLetterTypes(lt ?? []);
        setRelationships(rel ?? []);
      } catch (err) {
        console.error("lookup error", err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Parent-controlled loadTable for calls
  const loadCalls = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setCallsLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      // include location filters from top nav if present
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await PhoneService.fetchCallRecords(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setCallsData((items || []).map(mapCall));
        setCallsTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadCalls error", err);
      toast.error("Failed to load call records");
    } finally {
      if (requestIdRef.current === reqId) setCallsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapCall]);

  // Parent-controlled loadTable for letters
  const loadLetters = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLettersLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await LetterService.fetchLetters(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setLettersData((items || []).map(mapLetter));
        setLettersTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadLetters error", err);
      toast.error("Failed to load letters");
    } finally {
      if (requestIdRef.current === reqId) setLettersLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapLetter]);

  // reload when filters or debounce/search change
  useEffect(() => {
    if (activeTab === "calls") {
      loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    } else {
      loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
    }
  }, [activeTab, page, pageSize, sortField, sortDir, debouncedSearch, loadCalls, loadLetters]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    if (activeTab === "calls") loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    else loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
  }, [region, district, station]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => setPage(p);
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: "asc" | "desc" | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // columns
  const callsColumns = [
    { key: "call_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{row.call_date ? new Date(row.call_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "caller", label: "Caller" },
    { key: "phone_number", label: "Phone" },
    { key: "call_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "call_duration", label: "Duration" },
    { key: "call_notes", label: "Notes", render: (v: any) => (<div className="max-w-xs truncate">{v || "-"}</div>) },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingCall(r); callForm.reset(r); setCallDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await PhoneService.deleteCallRecord(r.id); toast.success("Deleted"); loadCalls(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  const lettersColumns = [
    { key: "letter_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div>{row.letter_date ? new Date(row.letter_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "letter_tracking_number", label: "Tracking No." },
    { key: "subject", label: "Subject" },
    { key: "letter_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingLetter(r); letterForm.reset(r); setLetterDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await LetterService.deleteLetter(r.id); toast.success("Deleted"); loadLetters(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  // wrapper that forwards current filter context to centralized service
  const fetchPrisoners = useCallback(async (q = "", signal?: AbortSignal) => {
    try {
      const res = await fetchPrisonersService(
        { search: q || "", station: station ?? null, district: district ?? null, region: region ?? null, page_size: 100 },
        signal
      );

      // NORMALIZE: service may return { items, count } or an array
      const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);

      // safety: ensure we always operate on an array
      if (!Array.isArray(items)) return [];

      const qlc = (q || "").trim().toLowerCase();
      if (!qlc) return items;

      return items.filter((it: any) => {
        return String(it.full_name ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number_value ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number ?? "").toLowerCase().includes(qlc);
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      console.error("prisoners lookup error", err);
      toast.error("Failed to load prisoners (network).");
      // toast.error("Failed to load prisoners (network). Check CORS / backend or use dev proxy.");
      return [];
    }
  }, [station, district, region]);

  const fetchCallTypes = useCallback(async (q = "", signal?: AbortSignal) => {
    const res = await axiosInstance.get("/rehabilitation/call-types/", { params: { search: q, page_size: 50 }, signal });
    return res.data?.results ?? [];
  }, []);

  // small wrappers for preloaded lists (relationships, letterTypes)
  const fetchRelationshipsLocal = useCallback(async (q = "") => {
    if (!q) return relationships;
    const qlc = q.toLowerCase();
    return relationships.filter((r:any) => String(r.name ?? "").toLowerCase().includes(qlc));
  }, [relationships]);

  const fetchLetterTypesLocal = useCallback(async (q = "") => {
    if (!q) return letterTypes;
    const qlc = q.toLowerCase();
    return letterTypes.filter((t:any) => String(t.name ?? "").toLowerCase().includes(qlc));
  }, [letterTypes]);

  // form submit handlers
  const onSubmitCall = async (data: any) => {
    try {
      const file = data?.recorded_call instanceof File ? data.recorded_call as File : null;

      // If file present validate extension
      if (file) {
        const ext = fileExt(file);
        if (!AUDIO_EXTS.includes(ext)) {
          toast.error(`Recorded call must be audio. Allowed: ${AUDIO_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service. We pass the call endpoint as the 'audio' endpoint
        // so sendFile will post multipart with meta (other fields) to that endpoint.
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createCall },
          meta: { ...data }, // include other fields; sendFile will include as extraData or in JSON depending on strategy
        });

        if (!sendRes.ok) {
          console.error("call file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload recorded call");
          return;
        }

        // If the upload endpoint created the record, we're done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.created)) {
          toast.success(editingCall?.id ? "Call updated" : "Call created");
        } else {
          // Otherwise, try to extract a file reference and post the record normally.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.recorded_call = fileRef;
          else data.recorded_call = sendRes.data ?? null;

          if (editingCall?.id) {
            await PhoneService.updateCallRecord(editingCall.id, data);
            toast.success("Call updated");
          } else {
            await PhoneService.createCallRecord(data);
            toast.success("Call created");
          }
        }
      } else {
        // No file -> send JSON via existing service
        if (editingCall?.id) {
          await PhoneService.updateCallRecord(editingCall.id, data);
          toast.success("Call updated");
        } else {
          await PhoneService.createCallRecord(data);
          toast.success("Call created");
        }
      }

      setCallDialogOpen(false);
      loadCalls(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save call");
    }
  };

  const onSubmitLetter = async (data: any) => {
    try {
      const file = data?.letter_document instanceof File ? data.letter_document as File : null;

      if (file) {
        const ext = fileExt(file);
        if (!LETTER_UPLOAD_ALLOWED_EXTS.includes(ext)) {
          toast.error(`Letter document must be one of: ${LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}`);
          return;
        }

        // Use upload strategy service:
        // - for non-audio files sendFile will perform base64 JSON post to the doc endpoint
        // - meta contains the other fields so the server can create the letter in one call if it accepts that shape
        const sendRes = await sendFile(file, {
          endpoints: { audio: API_ENDPOINTS.createCall, doc: API_ENDPOINTS.createLetter },
          meta: { ...data },
        });

        if (!sendRes.ok) {
          console.error("letter file upload failed", sendRes.error ?? sendRes);
          toast.error("Failed to upload letter document");
          return;
        }

        // If endpoint returned created resource, done.
        if (sendRes.data && (sendRes.data.id || sendRes.data.letter_document)) {
          toast.success(editingLetter?.id ? "Letter updated" : "Letter created");
        } else {
          // Otherwise extract file ref and include in JSON create call.
          const fileRef = extractFileRefFromSendResult(sendRes);
          if (fileRef) data.letter_document = fileRef;
          else data.letter_document = sendRes.data ?? null;

          if (editingLetter?.id) {
            await LetterService.updateLetter(editingLetter.id, data);
            toast.success("Letter updated");
          } else {
            await LetterService.createLetter(data);
            toast.success("Letter created");
          }
        }
      } else {
        // No file -> send JSON as before
        if (editingLetter?.id) {
          await LetterService.updateLetter(editingLetter.id, data);
          toast.success("Letter updated");
        } else {
          await LetterService.createLetter(data);
          toast.success("Letter created");
        }
      }

      setLetterDialogOpen(false);
      loadLetters(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save letter");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#650000]">Letters & Phone Calls</h1>
        <p className="text-muted-foreground">Manage prisoner communications and correspondence</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab === "calls" ? "calls" : "letters"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button className="bg-primary" onClick={() => { if (activeTab === "calls") { setEditingCall(null); callForm.reset({}); setCallDialogOpen(true); } else { setEditingLetter(null); letterForm.reset({}); setLetterDialogOpen(true); } }}><Plus className="h-4 w-4 mr-2" />Add</Button>
      </div>

      {/* Restored original-style tabs with counts (icons + label + count). */}
      <Tabs value={activeTab} onValueChange={(v: Tab) => setActiveTab(v)}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Calls ({callsTotal ?? 0})
          </TabsTrigger>
          <TabsTrigger value="letters" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Letters ({lettersTotal ?? 0})
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>{activeTab === "calls" ? "Call Records" : "Letters"}</CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "calls" ? (
              <DataTable
                data={callsData}
                loading={callsLoading}
                total={callsTotal}
                title="Call Records"
                columns={callsColumns}
                externalSearch={searchTerm}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            ) : (
              <DataTable
                data={lettersData}
                loading={lettersLoading}
                total={lettersTotal}
                title="Letters"
                columns={lettersColumns}
                externalSearch={searchTerm}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                onSort={onSort}
                page={page}
                pageSize={pageSize}
              />
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Call dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCall ? "Edit Call Record" : "Add Call Record"}</DialogTitle></DialogHeader>
          <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      key={`prisoner-select-${region ?? ""}-${district ?? ""}-${station ?? ""}`}
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {callForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Caller Name (required) */}
              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="caller"
                  {...callForm.register("caller", { required: "Caller name is required" })}
                  placeholder="Enter caller name"
                />
                {callForm.formState.errors.caller && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.caller as any).message}</p>
                )}
              </div>

              {/* Phone Number (required) */}
              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  {...callForm.register("phone_number", { ...phoneNumberValidation, required: "Phone number is required" })}
                  placeholder="+256700000000"
                />
                {callForm.formState.errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.phone_number as any).message}</p>
                )}
              </div>

              {/* Call Type (required) */}
              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="call_type"
                  control={callForm.control}
                  rules={requiredValidation("Call type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchCallTypes}
                      placeholder="Select call type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.call_type && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_type as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="relation_to_prisoner">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={callForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    // use local preloaded list for relationships
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {callForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Call Date & Time (required) */}
              <div>
                <Label htmlFor="call_date">
                  Call Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_date"
                  type="datetime-local"
                  {...callForm.register("call_date", { required: "Call date is required" })}
                />
                {callForm.formState.errors.call_date && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_date as any).message}</p>
                )}
              </div>

              {/* Call Duration (required) */}
              <div>
                <Label htmlFor="call_duration">
                  Call Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_duration"
                  type="number"
                  {...callForm.register("call_duration", {
                    required: "Call duration is required",
                    valueAsNumber: true,
                  })}
                  placeholder="Enter duration in minutes"
                />
                {callForm.formState.errors.call_duration && (
                  <p className="text-red-500 text-sm mt-1">{(callForm.formState.errors.call_duration as any).message}</p>
                )}
              </div>

              {/* Recorded Call (optional upload) */}
              <div>
                <Label htmlFor="recorded_call">Recorded Call (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Upload audio recording (optional)</p>
                  {/* FileUploader provides client-side validation + UX.
                      For recorded calls we allow common audio formats; change list below if needed. */}
                  <FileUploader
                    id="recorded_call"
                    accept={AUDIO_UPLOAD_ACCEPT}
                    allowedExts={AUDIO_EXTS}
                    maxSizeBytes={10 * 1024 * 1024} // 10 MB
                    onChange={(files) => {
                      if (files && files.length) callForm.setValue("recorded_call", files[0]);
                      else callForm.setValue("recorded_call", null);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Call Notes */}
            <div>
              <Label htmlFor="call_notes">Call Notes</Label>
              <Textarea
                id="call_notes"
                {...callForm.register("call_notes")}
                placeholder="Enter any notes about the call"
                rows={4}
              />
            </div>
             <div className="flex justify-end gap-2">
               <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
               <Button type="submit" className="bg-primary">{editingCall ? "Update" : "Create"}</Button>
             </div>
           </form>
        </DialogContent>
       </Dialog>

      {/* Letter dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLetter ? "Edit Letter" : "Add Letter"}</DialogTitle></DialogHeader>
          <form onSubmit={letterForm.handleSubmit(onSubmitLetter)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection (required) */}
              <div>
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Prisoner")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchPrisoners}
                      placeholder="Select prisoner"
                      idField="id"
                      labelField="full_name"
                      renderItem={(p: any) => {
                        const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                        const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                        const stationName = p.current_station_name ?? p.station_name ?? "";
                        return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                      }}
                    />
                  )}
                />
                {letterForm.formState.errors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.prisoner as any).message}</p>
                )}
              </div>

              {/* Letter Type (required) */}
              <div>
                <Label htmlFor="letter_type">
                  Letter Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="letter_type"
                  control={letterForm.control}
                  rules={requiredValidation("Letter type")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      items={letterTypes}
                      placeholder="Select letter type"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.letter_type && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_type as any).message}</p>
                )}
              </div>

              {/* Subject (required) */}
              <div className="md:col-span-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  {...letterForm.register("subject", { required: "Subject is required" })}
                  placeholder="Enter letter subject"
                />
                {letterForm.formState.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.subject as any).message}</p>
                )}
              </div>

              {/* Letter Date (required) */}
              <div>
                <Label htmlFor="letter_date">
                  Letter Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="letter_date"
                  type="datetime-local"
                  {...letterForm.register("letter_date", { required: "Letter date is required" })}
                />
                {letterForm.formState.errors.letter_date && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.letter_date as any).message}</p>
                )}
              </div>

              {/* Relationship to Prisoner (required) */}
              <div>
                <Label htmlFor="letter_relation">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={letterForm.control}
                  rules={requiredValidation("Relationship")}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      fetchOptions={fetchRelationshipsLocal}
                      placeholder="Select relationship"
                      idField="id"
                      labelField="name"
                    />
                  )}
                />
                {letterForm.formState.errors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">{(letterForm.formState.errors.relation_to_prisoner as any).message}</p>
                )}
              </div>

              {/* Sender Name */}
              <div>
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  {...letterForm.register("sender_name")}
                  placeholder="Enter sender name"
                />
              </div>

              {/* Sender Email */}
              <div>
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  {...letterForm.register("sender_email", emailValidation)}
                  placeholder="sender@example.com"
                />
              </div>

              {/* Recipient Name */}
              <div>
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  {...letterForm.register("recipient_name")}
                  placeholder="Enter recipient name"
                />
              </div>

              {/* Recipient Email */}
              <div>
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  {...letterForm.register("recipient_email", emailValidation)}
                  placeholder="recipient@example.com"
                />
              </div>

            </div>

            {/* Letter Content */}
            <div>
              <Label htmlFor="letter_content">Letter Content</Label>
              <Textarea
                id="letter_content"
                {...letterForm.register("letter_content")}
                placeholder="Enter letter content"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Letter Document */}
              <div>
                <Label htmlFor="letter_document">Letter Document (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload scanned letter or PDF (optional)</p>

                  {/* Reusable FileUploader with the centralized allowed extensions constant.
                      onChange updates react-hook-form value to the selected File (or null). */}
                  <FileUploader
                    id="letter_document"
                    accept={LETTER_UPLOAD_ACCEPT}
                    allowedExts={LETTER_UPLOAD_ALLOWED_EXTS}
                    maxSizeBytes={15 * 1024 * 1024} // 15 MB, adjust as needed
                    onChange={(files) => {
                      if (files && files.length) letterForm.setValue("letter_document", files[0]);
                      else letterForm.setValue("letter_document", null);
                      // clear previous validation errors if any
                      letterForm.clearErrors("letter_document");
                    }}
                  />
                  {/* still show react-hook-form validation error if present */}
                  {letterForm.formState.errors.letter_document && (
                    <p className="text-red-500 text-sm mt-1">
                      {(letterForm.formState.errors.letter_document as any).message ||
                        (letterForm.formState.errors.letter_document as any)}
                    </p>
                  )}

                   {/* UX hint listing allowed formats */}
                   <p className="text-xs text-muted-foreground mt-2">
                     Allowed formats: {LETTER_UPLOAD_ALLOWED_EXTS.join(", ")}. You can change the allowed list in code if needed.
                   </p>
                 </div>
               </div>

               {/* Comment */}
               <div>
                 <Label htmlFor="comment">Censor Comments</Label>
                 <Textarea
                   id="comment"
                   {...letterForm.register("comment")}
                   placeholder="Enter censor comments or notes"
                   rows={9}
                 />
               </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingLetter ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}












// PhonesLettersScreen before edit
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, Search, Edit, Trash2, X, Save, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner"; // fixed import
import SearchableSelect from "../common/SearchableSelect";
import { useForm, Controller } from "react-hook-form";
import { Switch } from "../ui/switch";
import { DataTable } from "../common/DataTable";
import * as PhoneService from "../../services/stationServices/phoneService";
import * as LetterService from "../../services/stationServices/letterService";
import { phoneNumberValidation, emailValidation, requiredValidation } from "../../utils/validation";
import { useFilterRefresh } from "../../hooks/useFilterRefresh";
import { useFilters } from "../../contexts/FilterContext";
import axiosInstance from "../../services/axiosInstance";
// use the typed/custom prisoners service (returns { items, count })
import { fetchPrisoners as fetchPrisonersService } from "../../services/customPrisonersService";
// API endpoints (centralize for easy updates)
const PRISONERS_ENDPOINT = "/admission/prisoners/";

type Tab = "calls" | "letters";

export default function PhonesLettersScreen() {
  const { station, district, region } = useFilters();

  const [activeTab, setActiveTab] = useState<Tab>("calls");

  // shared table state (calls)
  const [callsData, setCallsData] = useState<PhoneService.CallRecordItem[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsTotal, setCallsTotal] = useState(0);

  // shared table state (letters)
  const [lettersData, setLettersData] = useState<LetterService.ELetterItem[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersTotal, setLettersTotal] = useState(0);

  // paging / sort / search (shared pattern, separate state per table)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // lookups for selects
  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);

  // dialog / form state
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<PhoneService.CallRecordItem | null>(null);
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LetterService.ELetterItem | null>(null);

  // forms
  const callForm = useForm<any>({ defaultValues: {} });
  const letterForm = useForm<any>({ defaultValues: {} });

  // Map API item -> table row (if you need normalization)
  const mapCall = useCallback((it: any): PhoneService.CallRecordItem => ({ ...it }), []);
  const mapLetter = useCallback((it: any): LetterService.ELetterItem => ({ ...it }), []);

  // load lookups used in searchable selects
  useEffect(() => {
    let mounted = true;
    const c = new AbortController();
    (async () => {
      try {
        const [lt, rel] = await Promise.all([
          LetterService.fetchLetterTypes(undefined, c.signal),
          LetterService.fetchRelationships(undefined, c.signal),
        ]);
        if (!mounted) return;
        setLetterTypes(lt ?? []);
        setRelationships(rel ?? []);
      } catch (err) {
        console.error("lookup error", err);
      }
    })();
    return () => { mounted = false; c.abort(); };
  }, []);

  // Parent-controlled loadTable for calls
  const loadCalls = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setCallsLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      // include location filters from top nav if present
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await PhoneService.fetchCallRecords(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setCallsData((items || []).map(mapCall));
        setCallsTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadCalls error", err);
      toast.error("Failed to load call records");
    } finally {
      if (requestIdRef.current === reqId) setCallsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapCall]);

  // Parent-controlled loadTable for letters
  const loadLetters = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setLettersLoading(true);
    try {
      const params: Record<string, any> = {
        page: Math.max(1, Number(_page) || 1),
        page_size: Number(_pageSize) || 10,
      };
      if (_sortField) params.ordering = _sortDir === "desc" ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;
      if (station) params.station = station;
      if (district) params.district = district;
      if (region) params.region = region;

      const res = await LetterService.fetchLetters(params, controller.signal);
      const items = res?.results ?? res ?? [];
      const count = Number(res?.count ?? items.length ?? 0);
      if (requestIdRef.current === reqId) {
        setLettersData((items || []).map(mapLetter));
        setLettersTotal(count);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("loadLetters error", err);
      toast.error("Failed to load letters");
    } finally {
      if (requestIdRef.current === reqId) setLettersLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, station, district, region, mapLetter]);

  // reload when filters or debounce/search change
  useEffect(() => {
    if (activeTab === "calls") {
      loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    } else {
      loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
    }
  }, [activeTab, page, pageSize, sortField, sortDir, debouncedSearch, loadCalls, loadLetters]);

  // wire top-nav filter refresh
  useFilterRefresh(() => {
    // reset page and reload active tab
    setPage(1);
    if (activeTab === "calls") loadCalls(1, pageSize, sortField, sortDir, debouncedSearch);
    else loadLetters(1, pageSize, sortField, sortDir, debouncedSearch);
  }, [region, district, station]);

  // datatable callbacks
  const onSearch = (q: string) => { setSearchTerm(q); setPage(1); };
  const onPageChange = (p: number) => setPage(p);
  const onPageSizeChange = (s: number) => { setPageSize(s); setPage(1); };
  const onSort = (f: string | null, d: "asc" | "desc" | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); };

  // columns
  const callsColumns = [
    { key: "call_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground" />{row.call_date ? new Date(row.call_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "caller", label: "Caller" },
    { key: "phone_number", label: "Phone" },
    { key: "call_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "call_duration", label: "Duration" },
    { key: "call_notes", label: "Notes", render: (v: any) => (<div className="max-w-xs truncate">{v || "-"}</div>) },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingCall(r); callForm.reset(r); setCallDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await PhoneService.deleteCallRecord(r.id); toast.success("Deleted"); loadCalls(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  const lettersColumns = [
    { key: "letter_date", label: "Date", sortable: true, render: (v: any, row: any) => (<div>{row.letter_date ? new Date(row.letter_date).toLocaleString() : "-"}</div>) },
    { key: "prisoner_name", label: "Prisoner", sortable: true },
    { key: "letter_tracking_number", label: "Tracking No." },
    { key: "subject", label: "Subject" },
    { key: "letter_type_name", label: "Type" },
    { key: "relation_name", label: "Relation" },
    { key: "id", label: "Actions", sortable: false, render: (_v: any, r: any) => (<div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setEditingLetter(r); letterForm.reset(r); setLetterDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="destructive" size="sm" onClick={async () => { await LetterService.deleteLetter(r.id); toast.success("Deleted"); loadLetters(page, pageSize); }}><Trash2 className="h-4 w-4" /></Button></div>) }
  ];

  // wrapper that forwards current filter context to centralized service
  const fetchPrisoners = useCallback(async (q = "", signal?: AbortSignal) => {
    try {
      const res = await fetchPrisonersService(
        { search: q || "", station: station ?? null, district: district ?? null, region: region ?? null, page_size: 100 },
        signal
      );

      // NORMALIZE: service may return { items, count } or an array
      const items: any[] = Array.isArray(res) ? res : (res?.items ?? []);

      // safety: ensure we always operate on an array
      if (!Array.isArray(items)) return [];

      const qlc = (q || "").trim().toLowerCase();
      if (!qlc) return items;

      return items.filter((it: any) => {
        return String(it.full_name ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number_value ?? "").toLowerCase().includes(qlc) ||
               String(it.prisoner_number ?? "").toLowerCase().includes(qlc);
      });
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") return [];
      console.error("prisoners lookup error", err);
      toast.error("Failed to load prisoners (network).");
      // toast.error("Failed to load prisoners (network). Check CORS / backend or use dev proxy.");
      return [];
    }
  }, [station, district, region]);

  const fetchCallTypes = useCallback(async (q = "", signal?: AbortSignal) => {
    const res = await axiosInstance.get("/rehabilitation/call-types/", { params: { search: q, page_size: 50 }, signal });
    return res.data?.results ?? [];
  }, []);

  // small wrappers for preloaded lists (relationships, letterTypes)
  const fetchRelationshipsLocal = useCallback(async (q = "") => {
    if (!q) return relationships;
    const qlc = q.toLowerCase();
    return relationships.filter((r:any) => String(r.name ?? "").toLowerCase().includes(qlc));
  }, [relationships]);

  const fetchLetterTypesLocal = useCallback(async (q = "") => {
    if (!q) return letterTypes;
    const qlc = q.toLowerCase();
    return letterTypes.filter((t:any) => String(t.name ?? "").toLowerCase().includes(qlc));
  }, [letterTypes]);

  // form submit handlers
  const onSubmitCall = async (data: any) => {
    try {
      if (editingCall?.id) {
        await PhoneService.updateCallRecord(editingCall.id, data);
        toast.success("Call updated");
      } else {
        await PhoneService.createCallRecord(data);
        toast.success("Call created");
      }
      setCallDialogOpen(false);
      loadCalls(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save call");
    }
  };

  const onSubmitLetter = async (data: any) => {
    try {
      if (editingLetter?.id) {
        await LetterService.updateLetter(editingLetter.id, data);
        toast.success("Letter updated");
      } else {
        await LetterService.createLetter(data);
        toast.success("Letter created");
      }
      setLetterDialogOpen(false);
      loadLetters(page, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save letter");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#650000]">Letters & Phone Calls</h1>
        <p className="text-muted-foreground">Manage prisoner communications and correspondence</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab === "calls" ? "calls" : "letters"}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button className="bg-primary" onClick={() => { if (activeTab === "calls") { setEditingCall(null); callForm.reset({}); setCallDialogOpen(true); } else { setEditingLetter(null); letterForm.reset({}); setLetterDialogOpen(true); } }}><Plus className="h-4 w-4 mr-2" />Add</Button>
      </div>

      <div className="flex gap-2">
        <button className={`px-4 py-2 rounded ${activeTab === "calls" ? "bg-[#650000] text-white" : "bg-white"}`} onClick={() => setActiveTab("calls")}>Phone Calls</button>
        <button className={`px-4 py-2 rounded ${activeTab === "letters" ? "bg-[#650000] text-white" : "bg-white"}`} onClick={() => setActiveTab("letters")}>Letters</button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeTab === "calls" ? "Call Records" : "Letters"}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === "calls" ? (
            <DataTable
              data={callsData}
              loading={callsLoading}
              total={callsTotal}
              title="Call Records"
              columns={callsColumns}
              externalSearch={searchTerm}
              onSearch={onSearch}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              onSort={onSort}
              page={page}
              pageSize={pageSize}
            />
          ) : (
            <DataTable
              data={lettersData}
              loading={lettersLoading}
              total={lettersTotal}
              title="Letters"
              columns={lettersColumns}
              externalSearch={searchTerm}
              onSearch={onSearch}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              onSort={onSort}
              page={page}
              pageSize={pageSize}
            />
          )}
        </CardContent>
      </Card>

      {/* Call dialog */}
      <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCall ? "Edit Call Record" : "Add Call Record"}</DialogTitle></DialogHeader>
          <form onSubmit={callForm.handleSubmit(onSubmitCall)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Prisoner</Label>
                <Controller name="prisoner" control={callForm.control} rules={requiredValidation("Prisoner")} render={({ field }) => (
                  <SearchableSelect
                    key={`prisoner-select-${region ?? ""}-${district ?? ""}-${station ?? ""}`}
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    fetchOptions={fetchPrisoners}
                    placeholder="Search name or prisoner number"
                    idField="id"
                    labelField="full_name"
                    renderItem={(p: any) => {
                      const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                      const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                      const stationName = p.current_station_name ?? p.station_name ?? "";
                      return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                    }}
                  />
                )} />
              </div>

              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input {...callForm.register("caller", { required: "Caller is required" })} />
              </div>

              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input {...callForm.register("phone_number", phoneNumberValidation)} placeholder="+256700000000" />
              </div>

              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller name="call_type" control={callForm.control} render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    fetchOptions={fetchCallTypes}
                    placeholder="Call type"
                    idField="id"
                    labelField="name"
                  />
                )} />
              </div>

              <div>
                <Label>Call Date</Label>
                <Input type="datetime-local" {...callForm.register("call_date")} />
              </div>

              <div>
                <Label>Duration (min)</Label>
                <Input type="number" {...callForm.register("call_duration")} />
              </div>

              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Textarea {...callForm.register("call_notes")} rows={4} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCallDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingCall ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Letter dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingLetter ? "Edit Letter" : "Add Letter"}</DialogTitle></DialogHeader>
          <form onSubmit={letterForm.handleSubmit(onSubmitLetter)} className="space-y-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Prisoner</Label>
                <Controller name="prisoner" control={letterForm.control} rules={requiredValidation("Prisoner")} render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    fetchOptions={fetchPrisoners}
                    placeholder="Search name or prisoner number"
                    idField="id"
                    labelField="full_name"
                    renderItem={(p: any) => {
                      const name = p.full_name ?? `${(p.first_name ?? "")} ${(p.last_name ?? "")}`.trim();
                      const number = p.prisoner_number_value ?? p.prisoner_number ?? "";
                      const stationName = p.current_station_name ?? p.station_name ?? "";
                      return `${String(name).trim()} ${number ? `(${number})` : ""}${stationName ? ` — ${stationName}` : ""}`;
                    }}
                  />
                )} />
              </div>

              <div>
                <Label>Subject</Label>
                <Input {...letterForm.register("subject", { required: "Subject required" })} />
              </div>

              <div>
                <Label>Letter Type</Label>
                <Controller name="letter_type" control={letterForm.control} render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={(id) => field.onChange(id)}
                    items={letterTypes}
                    placeholder="Letter type"
                    idField="id"
                    labelField="name"
                  />
                )} />
              </div>

              <div>
                <Label>Letter Date</Label>
                <Input type="datetime-local" {...letterForm.register("letter_date")} />
              </div>

              <div>
                <Label>Sender Email</Label>
                <Input {...letterForm.register("sender_email", emailValidation)} placeholder="sender@example.com" />
              </div>

              <div>
                <Label>Recipient Email</Label>
                <Input {...letterForm.register("recipient_email", emailValidation)} placeholder="recipient@example.com" />
              </div>

              <div className="md:col-span-2">
                <Label>Content</Label>
                <Textarea {...letterForm.register("letter_content")} rows={6} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLetterDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary">{editingLetter ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

















import { useState, useEffect, useRef, useCallback } from "react";
import { DataTable } from "../common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import {
  Plus,
  Search,
  Users,
  Calendar as CalendarIcon,
  Upload,
  Check,
  ChevronsUpDown,
  Camera,
  Clock,
  LogIn,
  LogOut,
  Edit,
  Eye,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import VisitorPassForm from "../gate/VisitorPassForm";
import VisitorItemList from "./VisitorItemList";
import VisitorRegistrationDialog from "./VisitorRegistrationDialog";
import {getStationVisitors, Visitor} from "../../services/stationServices/visitorsServices/VisitorsService";
<<<<<<< HEAD
import {handleCatchError, handleEffectLoad, handleResponseError} from "../../services/stationServices/utils";
=======
import axiosInstance from "../../services/axiosInstance"; // << ensure path matches your project
import {handleResponseError} from "../../services/stationServices/utils";
>>>>>>> dev_env
import {getVisitorItems, VisitorItem} from "../../services/stationServices/visitorsServices/visitorItem";
import {useFilters} from "../../contexts/FilterContext";
import {useFilterRefresh} from "../../hooks/useFilterRefresh";



interface Region {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  region: string;
}

interface Station {
  id: string;
  name: string;
  district: string;
}

interface Gate {
  id: string;
  name: string;
}

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
}

interface VisitorType {
  id: string;
  name: string;
}

interface Relationship {
  id: string;
  name: string;
}

interface IDType {
  id: string;
  name: string;
}

interface VisitorStatus {
  id: string;
  name: string;
  color: string;
}

interface Staff {
  id: string;
  force_number: string;
  name: string;
  rank: string;
}

export default function VisitationsScreen() {
  // Filter & data states
  const [items, setItems] = useState<VisitorItem[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [idTypes, setIDTypes] = useState<IDType[]>([]);
  const [visitorStatuses, setVisitorStatuses] = useState<VisitorStatus[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  // UI states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  // external search (shown in header). Debounced before triggering API.
  const [searchQuery, setSearchQuery] = useState("");
  // Debounced search so we don't call API on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => window.clearTimeout(id);
  }, [searchQuery]);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Visitor Pass Dialog states
  const [isVisitorPassDialogOpen, setIsVisitorPassDialogOpen] = useState(false);
  const [selectedVisitorForPass, setSelectedVisitorForPass] = useState<Visitor | null>(null);

  // Form states
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    organisation: "",
    vehicle_no: "",
    reason_of_visitation: "",
    id_number: "",
    address: "",
    contact_no: "",
    place_visited: "",
    remarks: "",
    blacklist_reason: "",
    photo: null as File | null,
    gate: "",
    prisoner: "",
    visitor_type: "",
    gate_keeper: "",
    relation: "",
    id_type: "",
    visitor_status: "",
    visitation_datetime: new Date(),
    time_in: "",
    time_out: "",
  });

  // Combobox states
  const [openGateCombo, setOpenGateCombo] = useState(false);
  const [openPrisonerCombo, setOpenPrisonerCombo] = useState(false);
  const [openVisitorTypeCombo, setOpenVisitorTypeCombo] = useState(false);
  const [openGateKeeperCombo, setOpenGateKeeperCombo] = useState(false);
  const [openRelationCombo, setOpenRelationCombo] = useState(false);
  const [openIDTypeCombo, setOpenIDTypeCombo] = useState(false);
  const [openVisitorStatusCombo, setOpenVisitorStatusCombo] = useState(false);

<<<<<<< HEAD
  const [visitorRecordsLoading, setVisitorRecordsLoading] = useState(false)
=======
  const [visitorRecordsLoading, setVisitorRecordsLoading] = useState(true)
  // DataTable states
  const [tableData, setTableData] = useState<Visitor[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | undefined>(undefined);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
>>>>>>> dev_env

  // Calendar state
  const [calendarOpen, setCalendarOpen] = useState(false);

<<<<<<< HEAD
  const { region, district, station } = useFilters();

  // Mock data
=======

  // TODO: fetch gates/prisoners/visitorTypes/relationships/idTypes/visitorStatuses/staffList from API services here.
>>>>>>> dev_env
  useEffect(() => {
    // intentionally left blank: lookups should be loaded from services instead of hardcoded data
  }, []);

  // debounced search (avoid API calls on every keystroke)
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  // Map / normalize server item -> table row (we keep original fields, renderers read them)
  const mapVisitor = useCallback((it: any): Visitor => ({
    ...it,
  }), []);

  // loadTable: server-side load with abort + request id guard
  const loadTable = useCallback(async (_page = page, _pageSize = pageSize, _sortField = sortField, _sortDir = sortDir, _search = debouncedSearch) => {
    try { abortRef.current?.abort(); } catch {}
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++requestIdRef.current;
    setTableLoading(true);
    try {
      const params: Record<string, any> = {};
      params.page = Math.max(1, Number(_page) || 1);
      params.page_size = Number(_pageSize) || 10;
      if (_sortField) params.ordering = _sortDir === 'desc' ? `-${_sortField}` : _sortField;
      if (_search) params.search = _search;

      // const res = await getStationVisitors(params, controller.signal);
      // const itemsRes = res?.results ?? res ?? [];

      // DEBUG: log params so we can inspect what the UI is sending
      // call axios directly so query params are forwarded exactly
      console.debug("calling API with params:", params);
      const apiRes = await axiosInstance.get("/gate-management/station-visitors/", { params });
      const res = apiRes.data;
      console.debug("loadTable response:", res);
      const itemsRes = res?.results ?? res ?? [];
      const count = Number(res?.count ?? itemsRes.length ?? 0);

      if (requestIdRef.current === reqId) {
        setTableData((itemsRes || []).map(mapVisitor));
        setVisitors(itemsRes || []); // keep visitors state for VisitorItemList
        setTotal(count);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return;
      console.error('load visitors error', err?.response ?? err);
      toast.error('Failed to load visitor records');
    } finally {
      if (requestIdRef.current === reqId) setTableLoading(false);
      setVisitorRecordsLoading(false);
    }
  }, [page, pageSize, sortField, sortDir, debouncedSearch, mapVisitor]);

  // trigger load when paging/sorting/search change
  useEffect(() => {
    loadTable(page, pageSize, sortField, sortDir, debouncedSearch);
  }, [page, pageSize, sortField, sortDir, debouncedSearch, loadTable]);

  // Camera functions
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
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "visitor-photo.jpg", {
              type: "image/jpeg",
            });
            setForm({ ...form, photo: file });
            setPhotoPreview(canvas.toDataURL("image/jpeg"));
            stopCamera();
            toast.success("Photo captured successfully");
          }
        }, "image/jpeg");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      organisation: "",
      vehicle_no: "",
      reason_of_visitation: "",
      id_number: "",
      address: "",
      contact_no: "",
      place_visited: "",
      remarks: "",
      blacklist_reason: "",
      photo: null,
      gate: "",
      prisoner: "",
      visitor_type: "",
      gate_keeper: "",
      relation: "",
      id_type: "",
      visitor_status: "",
      visitation_datetime: new Date(),
      time_in: "",
      time_out: "",
    });
    setPhotoPreview("");
    setEditingVisitor(null);
    stopCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // const formData = new FormData();
      // Object.entries(form).forEach(([key, value]) => {
      //   if (value !== null && value !== "") {
      //     if (key === "visitation_datetime") {
      //       formData.append(key, format(value as Date, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
      //     } else {
      //       formData.append(key, value);
      //     }
      //   }
      // });
      // const response = await fetch('/api/gate-management/visitors/', {
      //   method: editingVisitor ? 'PUT' : 'POST',
      //   body: formData
      // });

      toast.success(
        editingVisitor
          ? "Visitor updated successfully"
          : "Visitor registered successfully"
      );
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save visitor");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visitor: Visitor) => {
    // console.log(visitor)
    setEditingVisitor(visitor);

    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusObj = visitorStatuses.find((s) => s.name === status);
    const variant =
      statusObj?.color === "green"
        ? "default"
        : statusObj?.color === "red"
        ? "destructive"
        : statusObj?.color === "yellow"
        ? "secondary"
        : "default";
    return (
      <Badge variant={variant}>
        {status}
      </Badge>
    );
  };

  const handleGenerateVisitorPass = (visitor: Visitor) => {
    setSelectedVisitorForPass(visitor);
    setIsVisitorPassDialogOpen(true);
  };

  const handleVisitorPassSubmit = (data: any) => {
    toast.success('Visitor pass generated successfully');
    setIsVisitorPassDialogOpen(false);
    setSelectedVisitorForPass(null);
  };

  // APIs integration
  async function fetchData() {
    // setVisitorRecordsLoading(true)
      try {
        console.log(station)
        const response = await getStationVisitors(station)
        if (handleResponseError(response)) return

        if ("results" in response) {
          const data = response.results
          if (!data.length){
              toast.error("There are no visitor records");
              return true
          }
          setVisitors(data)
          // console.log(data)
        }

        const response2 = await getVisitorItems()
        if (handleResponseError(response2)) return
        if ("results" in response2) {
          const data = response2.results
          setItems(data)
          // console.log(data)
        }

      }catch (error) {
          handleCatchError(error)
      }finally {
        setVisitorRecordsLoading(false)
      }
  }

  const loadData = async () => {
    // console.log("Loading with filters:", region, district, station);
    // const reload = handleEffectLoad(region, district, station, setVisitorRecordsLoading, fetchData)
    // if (!reload) {
    //   setItems([])
    //   setVisitors([])
    // }
    fetchData()
  };

  useFilterRefresh(loadData, [region, district, station]);

  useEffect(() => {
    if (!isDialogOpen){
      setEditingVisitor(null)
    }
  }, [isDialogOpen]);

  function extractTimeHHMM(isoString: string): string {
    const d = new Date(isoString);

    if (isNaN(d.getTime())) return ""; // invalid date

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Visitations Management</h1>
        <p className="text-muted-foreground">
          Manage visitor check-in and check-out records
        </p>
      </div>

<<<<<<< HEAD
      {/* Main Tabs */}
      {
        visitorRecordsLoading ? (
            <div className="size-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                      Fetching visitor records, Please wait...
                  </p>
                </div>
=======
      {/* Filters removed — global filtering is provided by top nav via useFilterRefresh */}

      {/* Main Tabs */}
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
          <TabsTrigger 
            value="records" 
            className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
          >
            <Users className="h-4 w-4 mr-2" />
            Visitor Records
          </TabsTrigger>
          <TabsTrigger 
            value="items" 
            className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Visitor Items
          </TabsTrigger>
        </TabsList>

        {/* Visitor Records Tab */}
        <TabsContent value="records" className="space-y-6 mt-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID number, or contact..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-10"
              />
>>>>>>> dev_env
            </div>
        ) : (
           <Tabs defaultValue="records" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
                <TabsTrigger
                  value="records"
                  className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Visitor Records
                </TabsTrigger>
                <TabsTrigger
                  value="items"
                  className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Visitor Items
                </TabsTrigger>
              </TabsList>

              {/* Visitor Records Tab */}
              <TabsContent value="records" className="space-y-6 mt-6">
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, ID number, or contact..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Visitor
                  </Button>
                </div>

                <VisitorRegistrationDialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                      resetForm();
                    }
                  }}
                  setVisitors={setVisitors}
                  editingVisitor={editingVisitor}
                />

<<<<<<< HEAD
                {/* Placeholder for form - will be removed */}
                <div style={{display: 'none'}}>
                  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
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
                            <Label htmlFor="organisation">Organisation</Label>
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
                                    ? idTypes.find((t) => t.id === form.id_type)?.name
                                    : "Select ID type..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search ID type..." />
                                  <CommandEmpty>No ID type found.</CommandEmpty>
                                  <CommandGroup>
                                    {idTypes.map((type) => (
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
                                    ? gates.find((g) => g.id === form.gate)?.name
                                    : "Select gate..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search gate..." />
                                  <CommandEmpty>No gate found.</CommandEmpty>
                                  <CommandGroup>
                                    {gates.map((gate) => (
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
                                        {gate.name}
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
                                    ? staffList.find((s) => s.id === form.gate_keeper)
                                        ?.name
                                    : "Select gate keeper..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search staff..." />
                                  <CommandEmpty>No staff found.</CommandEmpty>
                                  <CommandGroup>
                                    {staffList.map((staff) => (
                                      <CommandItem
                                        key={staff.id}
                                        value={staff.name}
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
                                        {staff.name} ({staff.force_number}) - {staff.rank}
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
                            <Label>Prisoner to Visit *</Label>
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
                                    ? prisoners.find((p) => p.id === form.prisoner)
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
                                    {prisoners.map((prisoner) => (
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
                                        {prisoner.full_name} ({prisoner.prisoner_number})
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

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
                                    ? relationships.find((r) => r.id === form.relation)
                                        ?.name
                                    : "Select relationship..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search relationship..." />
                                  <CommandEmpty>No relationship found.</CommandEmpty>
                                  <CommandGroup>
                                    {relationships.map((relation) => (
                                      <CommandItem
                                        key={relation.id}
                                        value={relation.name}
                                        onSelect={() => {
                                          setForm({ ...form, relation: relation.id });
                                          setOpenRelationCombo(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            form.relation === relation.id
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {relation.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    ? visitorTypes.find(
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
                                    {visitorTypes.map((type) => (
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
                                    ? visitorStatuses.find(
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
                                    {visitorStatuses.map((status) => (
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
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left",
                                    !form.visitation_datetime &&
                                      "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {form.visitation_datetime ? (
                                    format(form.visitation_datetime, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={form.visitation_datetime}
                                  onSelect={(date) => {
                                    if (date) {
                                      setForm({ ...form, visitation_datetime: date });
                                      setCalendarOpen(false);
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
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
                            <Label htmlFor="place_visited">Place Visited</Label>
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
                            Reason of Visitation
                          </Label>
                          <Textarea
                            id="reason_of_visitation"
                            value={form.reason_of_visitation}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                reason_of_visitation: e.target.value,
                              })
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
                            placeholder="Additional remarks or notes"
                            rows={2}
                          />
                        </div>
                      </TabsContent>

                      {/* Security Tab */}
                      <TabsContent value="security" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="blacklist_reason">
                            Blacklist Reason (if applicable)
                          </Label>
                          <Textarea
                            id="blacklist_reason"
                            value={form.blacklist_reason}
                            onChange={(e) =>
                              setForm({ ...form, blacklist_reason: e.target.value })
                            }
                            placeholder="Enter reason if visitor is blacklisted"
                            rows={3}
                          />
                        </div>

                        <div className="p-4 border rounded-lg bg-amber-50">
                          <p className="text-sm text-amber-800">
                            <strong>Security Note:</strong> Ensure all visitor
                            information is verified before granting access. Check ID
                            documents and compare with photo.
                          </p>
                        </div>
                      </TabsContent>

                      {/* Photo Tab */}
                      <TabsContent value="photo" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          {!useCamera && (
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={startCamera}
                                className="flex-1"
                              >
                                <Camera className="h-4 w-4 mr-2" />
                                Use Camera
                              </Button>
                              <Label
                                htmlFor="photo-upload"
                                className="flex-1 cursor-pointer"
                              >
                                <div className="flex items-center justify-center gap-2 h-10 px-4 py-2 bg-white border border-input rounded-md hover:bg-accent hover:text-accent-foreground">
                                  <Upload className="h-4 w-4" />
                                  Upload Photo
                                </div>
                                <Input
                                  id="photo-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                              </Label>
                            </div>
                          )}

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
                          setIsDialogOpen(false);
                          resetForm();
                        }}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90"
                        disabled={
                          loading ||
                          !form.first_name ||
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

            {/* Visitors Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Visitor Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Visitor Name</TableHead>
                                  <TableHead>ID Number</TableHead>
                                  <TableHead>Contact</TableHead>
                                  <TableHead>Prisoner</TableHead>
                                  <TableHead>Visitor Type</TableHead>
                                  <TableHead>Gate</TableHead>
                                  <TableHead>Time In</TableHead>
                                  <TableHead>Time Out</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredVisitors.length === 0 ? (
                                  <TableRow>
                                    <TableCell
                                      colSpan={10}
                                      className="text-center py-8 text-muted-foreground"
                                    >
                                      No visitor records found
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  filteredVisitors.map((visitor) => (
                                    <TableRow key={visitor.id}>
                                      <TableCell>
                                        <div>
                                          <p>
                                            {visitor.first_name} {visitor.middle_name}{" "}
                                            {visitor.last_name}
                                          </p>
                                          {visitor.organisation && (
                                            <p className="text-xs text-muted-foreground">
                                              {visitor.organisation}
                                            </p>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>{visitor.id_number}</TableCell>
                                      <TableCell>{visitor.contact_no}</TableCell>
                                      <TableCell>{visitor.prisoner_name}</TableCell>
                                      <TableCell>{visitor.visitor_type_name}</TableCell>
                                      <TableCell>{visitor.gate_name}</TableCell>
                                      <TableCell>
                                        {visitor.time_in ? (
                                          <div className="flex items-center gap-1 text-green-600">
                                            <LogIn className="h-3 w-3" />
                                            {extractTimeHHMM(visitor.time_in)}
                                          </div>
                                        ) : (
                                          "-"
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {visitor.time_out ? (
                                          <div className="flex items-center gap-1 text-red-600">
                                            <LogOut className="h-3 w-3" />
                                            {extractTimeHHMM(visitor.time_out)}
                                          </div>
                                        ) : (
                                          "-"
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {getStatusBadge(visitor.visitor_status_name)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(visitor)}
                                            title="Edit visitor"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleGenerateVisitorPass(visitor)}
                                            style={{ color: '#650000' }}
                                            title="Generate visitor pass"
                                          >
                                            <FileText className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                         </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Visitor Items Tab */}
              <TabsContent value="items" className="mt-6">
                <VisitorItemList visitors={visitors} items={items} setItems={setItems} />
              </TabsContent>
            </Tabs>
        )
      }
=======
      {/* Visitors Table */}
          <div>
            {visitorRecordsLoading || tableLoading ? (
              <div className="size-full flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">Fetching visitor records, Please wait...</p>
                </div>
              </div>
            ) : (
              <DataTable
                data={tableData}
                loading={tableLoading}
                total={total}
                title="Visitor Records"
                columns={[
                  { key: 'full_name', label: 'Visitor Name', sortable: true, render: (_v: any, row: any) => (<div><p>{`${row.first_name ?? ''} ${row.middle_name ?? ''} ${row.last_name ?? ''}`.trim()}</p>{row.organisation && <p className="text-xs text-muted-foreground">{row.organisation}</p>}</div>) },
                  { key: 'id_number', label: 'ID Number', sortable: true },
                  { key: 'contact_no', label: 'Contact', sortable: true },
                  { key: 'prisoner_name', label: 'Prisoner', sortable: true },
                  { key: 'visitor_type_name', label: 'Visitor Type', sortable: true },
                  { key: 'gate_name', label: 'Gate', sortable: true },
                  { key: 'time_in', label: 'Time In', sortable: true, render: (_v: any, row: any) => row.time_in ? (<div className="flex items-center gap-1 text-green-600"><LogIn className="h-3 w-3" />{extractTimeHHMM(row.time_in)}</div>) : '-' },
                  { key: 'time_out', label: 'Time Out', sortable: true, render: (_v: any, row: any) => row.time_out ? (<div className="flex items-center gap-1 text-red-600"><LogOut className="h-3 w-3" />{extractTimeHHMM(row.time_out)}</div>) : '-' },
                  { key: 'visitor_status_name', label: 'Status', sortable: true, render: (v: any) => getStatusBadge(v) },
                  { key: 'id', label: 'Actions', sortable: false, render: (_v: any, row: any) => (<div className="flex gap-1 justify-end"><Button variant="ghost" size="sm" onClick={() => handleEdit(row)} title="Edit visitor"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleGenerateVisitorPass(row)} style={{ color: '#650000' }} title="Generate visitor pass"><FileText className="h-4 w-4" /></Button></div>)},
                ]}
                // externalSearch={searchQuery}
                onSearch={(q: string) => { setSearchQuery(q); setPage(1); }}
                onPageChange={(p: number) => setPage(p)}
                onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }}
                onSort={(f: string | null, d: 'asc' | 'desc' | null) => { setSortField(f ?? undefined); setSortDir(d ?? undefined); setPage(1); }}
                page={page}
                pageSize={pageSize}
              />
            )}
          </div>
        </TabsContent>
>>>>>>> dev_env


      {/* Visitor Pass Generation Dialog */}
      <Dialog 
        open={isVisitorPassDialogOpen} 
        onOpenChange={(open) => {
          setIsVisitorPassDialogOpen(open);
          if (!open) {
            setSelectedVisitorForPass(null);
          }
        }}
      >
        <DialogContent className="max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>
              Generate Visitor Pass
            </DialogTitle>
            <DialogDescription>
              Create a visitor pass for {selectedVisitorForPass ? `${selectedVisitorForPass.first_name} ${selectedVisitorForPass.last_name}` : 'selected visitor'}
            </DialogDescription>
          </DialogHeader>

          {selectedVisitorForPass && (
            <VisitorPassForm
              pass={{
                visitor_tag_number: '',
                valid_from: '',
                valid_until: '',
                purpose: selectedVisitorForPass.reason_of_visitation || '',
                issue_date: new Date().toISOString().slice(0, 16),
                is_suspended: false,
                suspended_date: '',
                suspended_reason: '',
                prisoner: selectedVisitorForPass.prisoner,
                visitor: selectedVisitorForPass.id,
                suspended_by: 0,
                prisoner_name: selectedVisitorForPass.prisoner_name,
                visitor_name: `${selectedVisitorForPass.first_name} ${selectedVisitorForPass.middle_name} ${selectedVisitorForPass.last_name}`.trim()
              }}
              onSubmit={handleVisitorPassSubmit}
              onCancel={() => {
                setIsVisitorPassDialogOpen(false);
                setSelectedVisitorForPass(null);
              }}
              disabledFields={{
                prisoner: true,
                visitor: false
              }}
              onAddNewVisitor={() => {
                setIsDialogOpen(true);
                setEditingVisitor(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



























import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import {
  Plus,
  Search,
  Users,
  Calendar as CalendarIcon,
  Upload,
  Check,
  ChevronsUpDown,
  Camera,
  Clock,
  LogIn,
  LogOut,
  Edit,
  Eye,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import VisitorPassForm from "../gate/VisitorPassForm";
import VisitorItemList from "./VisitorItemList";
import VisitorRegistrationDialog from "./VisitorRegistrationDialog";
import {getStationVisitors, Visitor} from "../../services/stationServices/visitorsServices/VisitorsService";
import {handleResponseError} from "../../services/stationServices/utils";
import {getVisitorItems, VisitorItem} from "../../services/stationServices/visitorsServices/visitorItem";
import PhonesLettersScreen from "./PhonesLettersScreen";



interface Region {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  region: string;
}

interface Station {
  id: string;
  name: string;
  district: string;
}

interface Gate {
  id: string;
  name: string;
}

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
}

interface VisitorType {
  id: string;
  name: string;
}

interface Relationship {
  id: string;
  name: string;
}

interface IDType {
  id: string;
  name: string;
}

interface VisitorStatus {
  id: string;
  name: string;
  color: string;
}

interface Staff {
  id: string;
  force_number: string;
  name: string;
  rank: string;
}

export default function VisitationsScreen() {
  // Filter & data states
  const [items, setItems] = useState<VisitorItem[]>([]);

  // Note: region/district/station filter UI removed — filters are handled globally via useFilterRefresh in the top nav.
  // If you still need these data arrays for other UI parts, re-introduce them; currently we keep only the states used elsewhere.
  const [gates, setGates] = useState<Gate[]>([]);
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [idTypes, setIDTypes] = useState<IDType[]>([]);
  const [visitorStatuses, setVisitorStatuses] = useState<VisitorStatus[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  // UI states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Visitor Pass Dialog states
  const [isVisitorPassDialogOpen, setIsVisitorPassDialogOpen] = useState(false);
  const [selectedVisitorForPass, setSelectedVisitorForPass] = useState<Visitor | null>(null);

  // Form states
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    organisation: "",
    vehicle_no: "",
    reason_of_visitation: "",
    id_number: "",
    address: "",
    contact_no: "",
    place_visited: "",
    remarks: "",
    blacklist_reason: "",
    photo: null as File | null,
    gate: "",
    prisoner: "",
    visitor_type: "",
    gate_keeper: "",
    relation: "",
    id_type: "",
    visitor_status: "",
    visitation_datetime: new Date(),
    time_in: "",
    time_out: "",
  });

  // Combobox states
  const [openGateCombo, setOpenGateCombo] = useState(false);
  const [openPrisonerCombo, setOpenPrisonerCombo] = useState(false);
  const [openVisitorTypeCombo, setOpenVisitorTypeCombo] = useState(false);
  const [openGateKeeperCombo, setOpenGateKeeperCombo] = useState(false);
  const [openRelationCombo, setOpenRelationCombo] = useState(false);
  const [openIDTypeCombo, setOpenIDTypeCombo] = useState(false);
  const [openVisitorStatusCombo, setOpenVisitorStatusCombo] = useState(false);

  const [visitorRecordsLoading, setVisitorRecordsLoading] = useState(true)

  // Calendar state
  const [calendarOpen, setCalendarOpen] = useState(false);


  // TODO: fetch gates/prisoners/visitorTypes/relationships/idTypes/visitorStatuses/staffList from API services here.
  useEffect(() => {
    // intentionally left blank: lookups should be loaded from services instead of hardcoded data
  }, []);

  // Filter visitors
  const filteredVisitors = visitors.filter((visitor) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        visitor.first_name.toLowerCase().includes(query) ||
        visitor.last_name.toLowerCase().includes(query) ||
        visitor.prisoner_name.toLowerCase().includes(query) ||
        visitor.id_number.toLowerCase().includes(query) ||
        visitor.contact_no.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Camera functions
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
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "visitor-photo.jpg", {
              type: "image/jpeg",
            });
            setForm({ ...form, photo: file });
            setPhotoPreview(canvas.toDataURL("image/jpeg"));
            stopCamera();
            toast.success("Photo captured successfully");
          }
        }, "image/jpeg");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      organisation: "",
      vehicle_no: "",
      reason_of_visitation: "",
      id_number: "",
      address: "",
      contact_no: "",
      place_visited: "",
      remarks: "",
      blacklist_reason: "",
      photo: null,
      gate: "",
      prisoner: "",
      visitor_type: "",
      gate_keeper: "",
      relation: "",
      id_type: "",
      visitor_status: "",
      visitation_datetime: new Date(),
      time_in: "",
      time_out: "",
    });
    setPhotoPreview("");
    setEditingVisitor(null);
    stopCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // const formData = new FormData();
      // Object.entries(form).forEach(([key, value]) => {
      //   if (value !== null && value !== "") {
      //     if (key === "visitation_datetime") {
      //       formData.append(key, format(value as Date, "yyyy-MM-dd'T'HH:mm:ss'Z'"));
      //     } else {
      //       formData.append(key, value);
      //     }
      //   }
      // });
      // const response = await fetch('/api/gate-management/visitors/', {
      //   method: editingVisitor ? 'PUT' : 'POST',
      //   body: formData
      // });

      toast.success(
        editingVisitor
          ? "Visitor updated successfully"
          : "Visitor registered successfully"
      );
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save visitor");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (visitor: Visitor) => {
    // console.log(visitor)
    setEditingVisitor(visitor);

    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusObj = visitorStatuses.find((s) => s.name === status);
    const variant =
      statusObj?.color === "green"
        ? "default"
        : statusObj?.color === "red"
        ? "destructive"
        : statusObj?.color === "yellow"
        ? "secondary"
        : "default";
    return (
      <Badge variant={variant}>
        {status}
      </Badge>
    );
  };

  const handleGenerateVisitorPass = (visitor: Visitor) => {
    setSelectedVisitorForPass(visitor);
    setIsVisitorPassDialogOpen(true);
  };

  const handleVisitorPassSubmit = (data: any) => {
    toast.success('Visitor pass generated successfully');
    setIsVisitorPassDialogOpen(false);
    setSelectedVisitorForPass(null);
  };

  // APIs integration
  useEffect(() => {
      if (visitorRecordsLoading) {
        async function fetchData() {
          // setVisitorRecordsLoading(true)
            try {
              const response = await getStationVisitors()
              if (handleResponseError(response)) return

              if ("results" in response) {
                const data = response.results
                if (!data.length){
                    toast.error("There are no visitor records");
                    return true
                }
                setVisitors(data)
                // console.log(data)
              }

              const response2 = await getVisitorItems()
              if (handleResponseError(response2)) return
              if ("results" in response2) {
                const data = response2.results
                setItems(data)
                console.log(data)
              }

            }catch (error) {
              if (!error?.response) {
                toast.error('Failed to connect to server. Please try again.');
              }

            }finally {
              setVisitorRecordsLoading(false)
            }
        }

        fetchData()
      }
  }, [setVisitorRecordsLoading]);

  useEffect(() => {
    if (!isDialogOpen){
      setEditingVisitor(null)
    }
  }, [isDialogOpen]);

  function extractTimeHHMM(isoString: string): string {
    const d = new Date(isoString);

    if (isNaN(d.getTime())) return ""; // invalid date

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");

    return `${hh}:${mm}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Visitations Management</h1>
        <p className="text-muted-foreground">
          Manage visitor check-in and check-out records
        </p>
      </div>

      {/* Filters removed — global filtering is provided by top nav via useFilterRefresh */}

      {/* Main Tabs */}
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
          <TabsTrigger 
            value="records" 
            className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
          >
            <Users className="h-4 w-4 mr-2" />
            Visitor Records
          </TabsTrigger>
          <TabsTrigger 
            value="items" 
            className="text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#650000] data-[state=active]:border-b-2 data-[state=active]:border-[#650000]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Visitor Items
          </TabsTrigger>
        </TabsList>

        {/* Visitor Records Tab */}
        <TabsContent value="records" className="space-y-6 mt-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID number, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Register Visitor
            </Button>
          </div>

          <VisitorRegistrationDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                resetForm();
              }
            }}
            setVisitors={setVisitors}
            editingVisitor={editingVisitor}
          />

          {/* Placeholder for form - will be removed */}
          <div style={{display: 'none'}}>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
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
                      <Label htmlFor="organisation">Organisation</Label>
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
                              ? idTypes.find((t) => t.id === form.id_type)?.name
                              : "Select ID type..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search ID type..." />
                            <CommandEmpty>No ID type found.</CommandEmpty>
                            <CommandGroup>
                              {idTypes.map((type) => (
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
                              ? gates.find((g) => g.id === form.gate)?.name
                              : "Select gate..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search gate..." />
                            <CommandEmpty>No gate found.</CommandEmpty>
                            <CommandGroup>
                              {gates.map((gate) => (
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
                                  {gate.name}
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
                              ? staffList.find((s) => s.id === form.gate_keeper)
                                  ?.name
                              : "Select gate keeper..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search staff..." />
                            <CommandEmpty>No staff found.</CommandEmpty>
                            <CommandGroup>
                              {staffList.map((staff) => (
                                <CommandItem
                                  key={staff.id}
                                  value={staff.name}
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
                                  {staff.name} ({staff.force_number}) - {staff.rank}
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
                      <Label>Prisoner to Visit *</Label>
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
                              ? prisoners.find((p) => p.id === form.prisoner)
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
                              {prisoners.map((prisoner) => (
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
                                  {prisoner.full_name} ({prisoner.prisoner_number})
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

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
                              ? relationships.find((r) => r.id === form.relation)
                                  ?.name
                              : "Select relationship..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search relationship..." />
                            <CommandEmpty>No relationship found.</CommandEmpty>
                            <CommandGroup>
                              {relationships.map((relation) => (
                                <CommandItem
                                  key={relation.id}
                                  value={relation.name}
                                  onSelect={() => {
                                    setForm({ ...form, relation: relation.id });
                                    setOpenRelationCombo(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      form.relation === relation.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {relation.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              ? visitorTypes.find(
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
                              {visitorTypes.map((type) => (
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
                              ? visitorStatuses.find(
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
                              {visitorStatuses.map((status) => (
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
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left",
                              !form.visitation_datetime &&
                                "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.visitation_datetime ? (
                              format(form.visitation_datetime, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.visitation_datetime}
                            onSelect={(date) => {
                              if (date) {
                                setForm({ ...form, visitation_datetime: date });
                                setCalendarOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                      <Label htmlFor="place_visited">Place Visited</Label>
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
                      Reason of Visitation
                    </Label>
                    <Textarea
                      id="reason_of_visitation"
                      value={form.reason_of_visitation}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          reason_of_visitation: e.target.value,
                        })
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
                      placeholder="Additional remarks or notes"
                      rows={2}
                    />
                  </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="blacklist_reason">
                      Blacklist Reason (if applicable)
                    </Label>
                    <Textarea
                      id="blacklist_reason"
                      value={form.blacklist_reason}
                      onChange={(e) =>
                        setForm({ ...form, blacklist_reason: e.target.value })
                      }
                      placeholder="Enter reason if visitor is blacklisted"
                      rows={3}
                    />
                  </div>

                  <div className="p-4 border rounded-lg bg-amber-50">
                    <p className="text-sm text-amber-800">
                      <strong>Security Note:</strong> Ensure all visitor
                      information is verified before granting access. Check ID
                      documents and compare with photo.
                    </p>
                  </div>
                </TabsContent>

                {/* Photo Tab */}
                <TabsContent value="photo" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    {!useCamera && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startCamera}
                          className="flex-1"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Use Camera
                        </Button>
                        <Label
                          htmlFor="photo-upload"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2 h-10 px-4 py-2 bg-white border border-input rounded-md hover:bg-accent hover:text-accent-foreground">
                            <Upload className="h-4 w-4" />
                            Upload Photo
                          </div>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </Label>
                      </div>
                    )}

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
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={
                    loading ||
                    !form.first_name ||
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

      {/* Visitors Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Visitor Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {
                visitorRecordsLoading ? (
                    <div className="size-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground text-sm">
                              Fetching visitor records, Please wait...
                          </p>
                        </div>
                    </div>
                ) : (
                   <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Visitor Name</TableHead>
                            <TableHead>ID Number</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Prisoner</TableHead>
                            <TableHead>Visitor Type</TableHead>
                            <TableHead>Gate</TableHead>
                            <TableHead>Time In</TableHead>
                            <TableHead>Time Out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVisitors.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={10}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No visitor records found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredVisitors.map((visitor) => (
                              <TableRow key={visitor.id}>
                                <TableCell>
                                  <div>
                                    <p>
                                      {visitor.first_name} {visitor.middle_name}{" "}
                                      {visitor.last_name}
                                    </p>
                                    {visitor.organisation && (
                                      <p className="text-xs text-muted-foreground">
                                        {visitor.organisation}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{visitor.id_number}</TableCell>
                                <TableCell>{visitor.contact_no}</TableCell>
                                <TableCell>{visitor.prisoner_name}</TableCell>
                                <TableCell>{visitor.visitor_type_name}</TableCell>
                                <TableCell>{visitor.gate_name}</TableCell>
                                <TableCell>
                                  {visitor.time_in ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <LogIn className="h-3 w-3" />
                                      {extractTimeHHMM(visitor.time_in)}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {visitor.time_out ? (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <LogOut className="h-3 w-3" />
                                      {extractTimeHHMM(visitor.time_out)}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(visitor.visitor_status_name)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(visitor)}
                                      title="Edit visitor"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGenerateVisitorPass(visitor)}
                                      style={{ color: '#650000' }}
                                      title="Generate visitor pass"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                   </div>
                )
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visitor Items Tab */}
        <TabsContent value="items" className="mt-6">
          <VisitorItemList visitors={visitors} items={items} setItems={setItems} />
        </TabsContent>
      </Tabs>

      {/* Visitor Pass Generation Dialog */}
      <Dialog 
        open={isVisitorPassDialogOpen} 
        onOpenChange={(open) => {
          setIsVisitorPassDialogOpen(open);
          if (!open) {
            setSelectedVisitorForPass(null);
          }
        }}
      >
        <DialogContent className="max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>
              Generate Visitor Pass
            </DialogTitle>
            <DialogDescription>
              Create a visitor pass for {selectedVisitorForPass ? `${selectedVisitorForPass.first_name} ${selectedVisitorForPass.last_name}` : 'selected visitor'}
            </DialogDescription>
          </DialogHeader>

          {selectedVisitorForPass && (
            <VisitorPassForm
              pass={{
                visitor_tag_number: '',
                valid_from: '',
                valid_until: '',
                purpose: selectedVisitorForPass.reason_of_visitation || '',
                issue_date: new Date().toISOString().slice(0, 16),
                is_suspended: false,
                suspended_date: '',
                suspended_reason: '',
                prisoner: selectedVisitorForPass.prisoner,
                visitor: selectedVisitorForPass.id,
                suspended_by: 0,
                prisoner_name: selectedVisitorForPass.prisoner_name,
                visitor_name: `${selectedVisitorForPass.first_name} ${selectedVisitorForPass.middle_name} ${selectedVisitorForPass.last_name}`.trim()
              }}
              onSubmit={handleVisitorPassSubmit}
              onCancel={() => {
                setIsVisitorPassDialogOpen(false);
                setSelectedVisitorForPass(null);
              }}
              disabledFields={{
                prisoner: true,
                visitor: false
              }}
              onAddNewVisitor={() => {
                setIsDialogOpen(true);
                setEditingVisitor(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

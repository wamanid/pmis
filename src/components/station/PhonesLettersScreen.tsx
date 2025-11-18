import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
import {
  Phone,
  Mail,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  FileText,
  Upload,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";

interface CallRecord {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  call_type_name?: string;
  relation_name?: string;
  welfare_officer_name?: string;
  caller: string;
  phone_number: string;
  call_date: string;
  call_duration: number;
  call_notes?: string;
  recorded_call?: string;
  prisoner: string;
  call_type: string;
  relation_to_prisoner: string;
  welfare_officer?: number;
}

interface Letter {
  id?: string;
  prisoner_name?: string;
  letter_type_name?: string;
  prisoner_number?: string;
  censored_by_name?: string;
  welfare_officer_name?: string;
  delivered_by_name?: string;
  handled_by_name?: string;
  relation_name?: string;
  subject: string;
  letter_tracking_number?: string;
  letter_date: string;
  letter_content?: string;
  letter_document?: string;
  recipient_email?: string;
  sender_email?: string;
  sender_name?: string;
  recipient_name?: string;
  comment?: string;
  prisoner: string;
  letter_type: string;
  censored_by?: number;
  welfare_officer?: number;
  relation_to_prisoner: string;
  delivered_by?: number;
  handled_by?: number;
}

interface Prisoner {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
}

interface CallType {
  id: string;
  name: string;
}

interface LetterType {
  id: string;
  name: string;
}

interface Relationship {
  id: string;
  name: string;
}

export default function PhonesLettersScreen() {
  const [activeTab, setActiveTab] = useState("calls");
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CallRecord | null>(null);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(false);

  // Dropdown data
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [callTypes, setCallTypes] = useState<CallType[]>([]);
  const [letterTypes, setLetterTypes] = useState<LetterType[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // Forms
  const {
    register: registerCall,
    handleSubmit: handleSubmitCall,
    reset: resetCall,
    setValue: setCallValue,
    watch: watchCall,
    control: controlCall,
    formState: { errors: callErrors },
  } = useForm<CallRecord>();

  const {
    register: registerLetter,
    handleSubmit: handleSubmitLetter,
    reset: resetLetter,
    setValue: setLetterValue,
    watch: watchLetter,
    control: controlLetter,
    formState: { errors: letterErrors },
  } = useForm<Letter>();

  const watchCallPrisoner = watchCall("prisoner");
  const watchLetterPrisoner = watchLetter("prisoner");

  // Mock data initialization
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock prisoners
    const mockPrisoners: Prisoner[] = [
      { id: "1", prisoner_name: "John Doe", prisoner_number: "P001" },
      { id: "2", prisoner_name: "Jane Smith", prisoner_number: "P002" },
      { id: "3", prisoner_name: "Robert Johnson", prisoner_number: "P003" },
    ];
    setPrisoners(mockPrisoners);

    // Mock call types
    const mockCallTypes: CallType[] = [
      { id: "ct-1", name: "Incoming" },
      { id: "ct-2", name: "Outgoing" },
      { id: "ct-3", name: "Emergency" },
      { id: "ct-4", name: "Legal" },
    ];
    setCallTypes(mockCallTypes);

    // Mock letter types
    const mockLetterTypes: LetterType[] = [
      { id: "lt-1", name: "Incoming" },
      { id: "lt-2", name: "Outgoing" },
      { id: "lt-3", name: "Legal" },
      { id: "lt-4", name: "Family" },
    ];
    setLetterTypes(mockLetterTypes);

    // Mock relationships
    const mockRelationships: Relationship[] = [
      { id: "rel-1", name: "Spouse" },
      { id: "rel-2", name: "Parent" },
      { id: "rel-3", name: "Sibling" },
      { id: "rel-4", name: "Child" },
      { id: "rel-5", name: "Lawyer" },
      { id: "rel-6", name: "Friend" },
    ];
    setRelationships(mockRelationships);

    // Mock call records
    const mockCalls: CallRecord[] = [
      {
        id: "call-1",
        prisoner_name: "John Doe",
        prisoner_number: "P001",
        call_type_name: "Incoming",
        relation_name: "Spouse",
        welfare_officer_name: "Officer Smith",
        caller: "Mary Doe",
        phone_number: "+256700123456",
        call_date: "2025-10-20T10:30:00Z",
        call_duration: 15,
        call_notes: "Family welfare check",
        prisoner: "1",
        call_type: "ct-1",
        relation_to_prisoner: "rel-1",
        welfare_officer: 1,
      },
      {
        id: "call-2",
        prisoner_name: "Jane Smith",
        prisoner_number: "P002",
        call_type_name: "Outgoing",
        relation_name: "Lawyer",
        welfare_officer_name: "Officer Brown",
        caller: "Jane Smith",
        phone_number: "+256700789012",
        call_date: "2025-10-21T14:00:00Z",
        call_duration: 30,
        call_notes: "Legal consultation",
        prisoner: "2",
        call_type: "ct-2",
        relation_to_prisoner: "rel-5",
        welfare_officer: 2,
      },
    ];
    setCallRecords(mockCalls);

    // Mock letters
    const mockLetters: Letter[] = [
      {
        id: "letter-1",
        prisoner_name: "John Doe",
        letter_type_name: "Incoming",
        prisoner_number: "P001",
        censored_by_name: "Censor Johnson",
        welfare_officer_name: "Officer Smith",
        relation_name: "Parent",
        subject: "Family Update",
        letter_tracking_number: "LTR-001",
        letter_date: "2025-10-18T09:00:00Z",
        letter_content: "Dear John, We hope this letter finds you well...",
        sender_email: "parent@example.com",
        sender_name: "Michael Doe",
        recipient_name: "John Doe",
        comment: "Approved without modifications",
        prisoner: "1",
        letter_type: "lt-1",
        censored_by: 1,
        welfare_officer: 1,
        relation_to_prisoner: "rel-2",
      },
      {
        id: "letter-2",
        prisoner_name: "Jane Smith",
        letter_type_name: "Outgoing",
        prisoner_number: "P002",
        censored_by_name: "Censor Williams",
        welfare_officer_name: "Officer Brown",
        relation_name: "Lawyer",
        subject: "Legal Documents Request",
        letter_tracking_number: "LTR-002",
        letter_date: "2025-10-19T11:00:00Z",
        letter_content: "Dear Attorney, I am writing to request...",
        sender_name: "Jane Smith",
        recipient_email: "lawyer@lawfirm.com",
        recipient_name: "Attorney Wilson",
        comment: "Approved",
        prisoner: "2",
        letter_type: "lt-2",
        censored_by: 2,
        welfare_officer: 2,
        relation_to_prisoner: "rel-5",
      },
    ];
    setLetters(mockLetters);
  };

  // Call CRUD operations
  const handleAddCall = () => {
    setEditingCall(null);
    resetCall();
    setIsCallDialogOpen(true);
  };

  const handleEditCall = (call: CallRecord) => {
    setEditingCall(call);
    Object.keys(call).forEach((key) => {
      setCallValue(key as keyof CallRecord, call[key as keyof CallRecord]);
    });
    setIsCallDialogOpen(true);
  };

  const handleDeleteCall = (id: string) => {
    setCallRecords(callRecords.filter((call) => call.id !== id));
    toast.success("Call record deleted successfully");
  };

  const onSubmitCall = (data: CallRecord) => {
    setLoading(true);
    
    const selectedPrisoner = prisoners.find((p) => p.id === data.prisoner);
    const selectedCallType = callTypes.find((ct) => ct.id === data.call_type);
    const selectedRelation = relationships.find((r) => r.id === data.relation_to_prisoner);

    const callData = {
      ...data,
      prisoner_name: selectedPrisoner?.prisoner_name,
      prisoner_number: selectedPrisoner?.prisoner_number,
      call_type_name: selectedCallType?.name,
      relation_name: selectedRelation?.name,
      welfare_officer_name: "Officer Smith", // Mock value
    };

    setTimeout(() => {
      if (editingCall) {
        setCallRecords(
          callRecords.map((call) =>
            call.id === editingCall.id ? { ...callData, id: editingCall.id } : call
          )
        );
        toast.success("Call record updated successfully");
      } else {
        setCallRecords([
          ...callRecords,
          { ...callData, id: `call-${Date.now()}` },
        ]);
        toast.success("Call record added successfully");
      }
      setIsCallDialogOpen(false);
      resetCall();
      setLoading(false);
    }, 500);
  };

  // Letter CRUD operations
  const handleAddLetter = () => {
    setEditingLetter(null);
    resetLetter();
    setIsLetterDialogOpen(true);
  };

  const handleEditLetter = (letter: Letter) => {
    setEditingLetter(letter);
    Object.keys(letter).forEach((key) => {
      setLetterValue(key as keyof Letter, letter[key as keyof Letter]);
    });
    setIsLetterDialogOpen(true);
  };

  const handleDeleteLetter = (id: string) => {
    setLetters(letters.filter((letter) => letter.id !== id));
    toast.success("Letter deleted successfully");
  };

  const onSubmitLetter = (data: Letter) => {
    setLoading(true);

    const selectedPrisoner = prisoners.find((p) => p.id === data.prisoner);
    const selectedLetterType = letterTypes.find((lt) => lt.id === data.letter_type);
    const selectedRelation = relationships.find((r) => r.id === data.relation_to_prisoner);

    const letterData = {
      ...data,
      prisoner_name: selectedPrisoner?.prisoner_name,
      prisoner_number: selectedPrisoner?.prisoner_number,
      letter_type_name: selectedLetterType?.name,
      relation_name: selectedRelation?.name,
      welfare_officer_name: "Officer Smith", // Mock value
      censored_by_name: "Censor Johnson", // Mock value
      letter_tracking_number: `LTR-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
    };

    setTimeout(() => {
      if (editingLetter) {
        setLetters(
          letters.map((letter) =>
            letter.id === editingLetter.id
              ? { ...letterData, id: editingLetter.id }
              : letter
          )
        );
        toast.success("Letter updated successfully");
      } else {
        setLetters([
          ...letters,
          { ...letterData, id: `letter-${Date.now()}` },
        ]);
        toast.success("Letter added successfully");
      }
      setIsLetterDialogOpen(false);
      resetLetter();
      setLoading(false);
    }, 500);
  };

  // Filter records based on search
  const filteredCalls = callRecords.filter(
    (call) =>
      call.prisoner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.prisoner_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.caller?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.phone_number?.includes(searchTerm)
  );

  const filteredLetters = letters.filter(
    (letter) =>
      letter.prisoner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.prisoner_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.letter_tracking_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#650000]">Letters & Phone Calls</h1>
          <p className="text-gray-600 mt-1">
            Manage prisoner communications and correspondence
          </p>
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by prisoner, phone, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab === "calls" ? (
          <Button
            onClick={handleAddCall}
            className="bg-[#650000] hover:bg-[#4a0000]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Call Record
          </Button>
        ) : (
          <Button
            onClick={handleAddLetter}
            className="bg-[#650000] hover:bg-[#4a0000]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Letter
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Calls ({filteredCalls.length})
          </TabsTrigger>
          <TabsTrigger value="letters" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Letters ({filteredLetters.length})
          </TabsTrigger>
        </TabsList>

        {/* Phone Calls Table */}
        <TabsContent value="calls">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Prisoner</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Call Type</TableHead>
                    <TableHead>Relation</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No call records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCalls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(call.call_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{call.prisoner_name}</div>
                            <div className="text-sm text-gray-500">{call.prisoner_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>{call.caller}</TableCell>
                        <TableCell>{call.phone_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{call.call_type_name}</Badge>
                        </TableCell>
                        <TableCell>{call.relation_name}</TableCell>
                        <TableCell>{formatDuration(call.call_duration)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-gray-600">
                            {call.call_notes || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCall(call)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCall(call.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Letters Table */}
        <TabsContent value="letters">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Prisoner</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sender/Recipient</TableHead>
                    <TableHead>Relation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLetters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No letters found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLetters.map((letter) => (
                      <TableRow key={letter.id}>
                        <TableCell>
                          <Badge className="bg-[#650000]">
                            {letter.letter_tracking_number}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(letter.letter_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{letter.prisoner_name}</div>
                            <div className="text-sm text-gray-500">
                              {letter.prisoner_number}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{letter.subject}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{letter.letter_type_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {letter.letter_type_name === "Incoming"
                              ? letter.sender_name
                              : letter.recipient_name}
                          </div>
                        </TableCell>
                        <TableCell>{letter.relation_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {letter.censored_by_name ? "Censored" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLetter(letter)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteLetter(letter.id!)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call Record Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {editingCall ? "Edit Call Record" : "Add Call Record"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCall(onSubmitCall)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection */}
              <div>
                <Label htmlFor="call_prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={controlCall}
                  rules={{ required: "Prisoner is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select prisoner" />
                      </SelectTrigger>
                      <SelectContent>
                        {prisoners.map((prisoner) => (
                          <SelectItem key={prisoner.id} value={prisoner.id}>
                            {prisoner.prisoner_name} ({prisoner.prisoner_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {callErrors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">
                    {callErrors.prisoner.message}
                  </p>
                )}
              </div>

              {/* Caller Name */}
              <div>
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="caller"
                  {...registerCall("caller", { required: "Caller name is required" })}
                  placeholder="Enter caller name"
                />
                {callErrors.caller && (
                  <p className="text-red-500 text-sm mt-1">{callErrors.caller.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  {...registerCall("phone_number", {
                    required: "Phone number is required",
                  })}
                  placeholder="+256700000000"
                />
                {callErrors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {callErrors.phone_number.message}
                  </p>
                )}
              </div>

              {/* Call Type */}
              <div>
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="call_type"
                  control={controlCall}
                  rules={{ required: "Call type is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select call type" />
                      </SelectTrigger>
                      <SelectContent>
                        {callTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {callErrors.call_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {callErrors.call_type.message}
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <Label htmlFor="relation_to_prisoner">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={controlCall}
                  rules={{ required: "Relationship is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel.id} value={rel.id}>
                            {rel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {callErrors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">
                    {callErrors.relation_to_prisoner.message}
                  </p>
                )}
              </div>

              {/* Call Date */}
              <div>
                <Label htmlFor="call_date">
                  Call Date & Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_date"
                  type="datetime-local"
                  {...registerCall("call_date", { required: "Call date is required" })}
                />
                {callErrors.call_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {callErrors.call_date.message}
                  </p>
                )}
              </div>

              {/* Call Duration */}
              <div>
                <Label htmlFor="call_duration">
                  Call Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_duration"
                  type="number"
                  {...registerCall("call_duration", {
                    required: "Call duration is required",
                    valueAsNumber: true,
                  })}
                  placeholder="Enter duration in minutes"
                />
                {callErrors.call_duration && (
                  <p className="text-red-500 text-sm mt-1">
                    {callErrors.call_duration.message}
                  </p>
                )}
              </div>

              {/* Recorded Call */}
              <div>
                <Label htmlFor="recorded_call">Recorded Call (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload audio recording</p>
                  <Input
                    id="recorded_call"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    {...registerCall("recorded_call")}
                  />
                </div>
              </div>
            </div>

            {/* Call Notes */}
            <div>
              <Label htmlFor="call_notes">Call Notes</Label>
              <Textarea
                id="call_notes"
                {...registerCall("call_notes")}
                placeholder="Enter any notes about the call"
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCallDialogOpen(false);
                  resetCall();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : editingCall ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Letter Dialog */}
      <Dialog open={isLetterDialogOpen} onOpenChange={setIsLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#650000] flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {editingLetter ? "Edit Letter" : "Add Letter"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitLetter(onSubmitLetter)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prisoner Selection */}
              <div>
                <Label htmlFor="letter_prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="prisoner"
                  control={controlLetter}
                  rules={{ required: "Prisoner is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select prisoner" />
                      </SelectTrigger>
                      <SelectContent>
                        {prisoners.map((prisoner) => (
                          <SelectItem key={prisoner.id} value={prisoner.id}>
                            {prisoner.prisoner_name} ({prisoner.prisoner_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {letterErrors.prisoner && (
                  <p className="text-red-500 text-sm mt-1">
                    {letterErrors.prisoner.message}
                  </p>
                )}
              </div>

              {/* Letter Type */}
              <div>
                <Label htmlFor="letter_type">
                  Letter Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="letter_type"
                  control={controlLetter}
                  rules={{ required: "Letter type is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select letter type" />
                      </SelectTrigger>
                      <SelectContent>
                        {letterTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {letterErrors.letter_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {letterErrors.letter_type.message}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="md:col-span-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  {...registerLetter("subject", { required: "Subject is required" })}
                  placeholder="Enter letter subject"
                />
                {letterErrors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {letterErrors.subject.message}
                  </p>
                )}
              </div>

              {/* Letter Date */}
              <div>
                <Label htmlFor="letter_date">
                  Letter Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="letter_date"
                  type="datetime-local"
                  {...registerLetter("letter_date", {
                    required: "Letter date is required",
                  })}
                />
                {letterErrors.letter_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {letterErrors.letter_date.message}
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <Label htmlFor="letter_relation">
                  Relationship to Prisoner <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="relation_to_prisoner"
                  control={controlLetter}
                  rules={{ required: "Relationship is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map((rel) => (
                          <SelectItem key={rel.id} value={rel.id}>
                            {rel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {letterErrors.relation_to_prisoner && (
                  <p className="text-red-500 text-sm mt-1">
                    {letterErrors.relation_to_prisoner.message}
                  </p>
                )}
              </div>

              {/* Sender Name */}
              <div>
                <Label htmlFor="sender_name">Sender Name</Label>
                <Input
                  id="sender_name"
                  {...registerLetter("sender_name")}
                  placeholder="Enter sender name"
                />
              </div>

              {/* Sender Email */}
              <div>
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  {...registerLetter("sender_email")}
                  placeholder="sender@example.com"
                />
              </div>

              {/* Recipient Name */}
              <div>
                <Label htmlFor="recipient_name">Recipient Name</Label>
                <Input
                  id="recipient_name"
                  {...registerLetter("recipient_name")}
                  placeholder="Enter recipient name"
                />
              </div>

              {/* Recipient Email */}
              <div>
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  {...registerLetter("recipient_email")}
                  placeholder="recipient@example.com"
                />
              </div>

              {/* Letter Document */}
              <div className="md:col-span-2">
                <Label htmlFor="letter_document">Letter Document (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Upload scanned letter or PDF</p>
                  <Input
                    id="letter_document"
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    className="hidden"
                    {...registerLetter("letter_document")}
                  />
                </div>
              </div>
            </div>

            {/* Letter Content */}
            <div>
              <Label htmlFor="letter_content">Letter Content</Label>
              <Textarea
                id="letter_content"
                {...registerLetter("letter_content")}
                placeholder="Enter letter content"
                rows={6}
              />
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment">Censor Comments</Label>
              <Textarea
                id="comment"
                {...registerLetter("comment")}
                placeholder="Enter censor comments or notes"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsLetterDialogOpen(false);
                  resetLetter();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#650000] hover:bg-[#4a0000]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : editingLetter ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

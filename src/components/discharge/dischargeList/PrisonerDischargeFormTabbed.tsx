import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Card, CardContent } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ArrowRightLeft, Skull, Building, User, FileText, Upload, Plus, Trash2, Fingerprint, Shield, X, Eye, Download } from 'lucide-react';
import { Checkbox } from '../../ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../ui/utils';
import  NextOfKinForm  from '../../admission/NextOfKinForm';
import { toast } from 'sonner';
import BiometricCapture from '../../common/BiometricCapture';
import { DischargeRequestForm } from '../request/DischargeRequestForm';
import {
  DischargeRequest,
  DischargeType,
  getReasons,
  getRequests,
  getTypes
} from "../../../services/discharge/discharge";
import {getPrisoners, PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {getStaffProfile, StaffItem} from "../../../services/stationServices/staffDeploymentService";
import {handleCatchError, handleServerError2} from "../../../services/stationServices/utils";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";

interface PrisonerDischargeFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onTransferRedirect?: (prisonerData: { prisoner: string; prisoner_name: string; prisoner_number: string; original_station: string }) => void;
  mode?: 'create' | 'edit';
  setDischargeRequests: React.Dispatch<React.SetStateAction<DischargeRequest[]>>
  dischargeRequests: DischargeRequest
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
  staff: StaffItem
  setStaff: React.Dispatch<React.SetStateAction<StaffItem[]>>
  types: DischargeType
  setTypes: React.Dispatch<React.SetStateAction<DischargeType[]>>
  reasons: Unit
  setReasons: React.Dispatch<React.SetStateAction<Unit[]>>
}

type TabType = 'basic-info' | 'biometric' | 'officers' | 'documents';

// Mock discharge types with on_premise flag
const mockDischargeTypes = [
  { 
    id: 'type-001', 
    name: 'Completion of Sentence', 
    on_premise: true, 
    affects_lockup: true,
    description: 'Release due to completion of sentence',
    is_execution: false
  },
  { 
    id: 'type-002', 
    name: 'Transfer', 
    on_premise: false, 
    affects_lockup: true,
    description: 'Inter-prison transfer',
    is_execution: false
  },
  { 
    id: 'type-003', 
    name: 'Death', 
    on_premise: false, 
    affects_lockup: true,
    description: 'Prisoner deceased',
    is_execution: false
  },
  { 
    id: 'type-004', 
    name: 'Court Order', 
    on_premise: true, 
    affects_lockup: true,
    description: 'Release by court order',
    is_execution: false
  },
  { 
    id: 'type-005', 
    name: 'Deportation', 
    on_premise: true, 
    affects_lockup: true,
    description: 'Deportation of foreign nationals',
    is_execution: false
  },
  { 
    id: 'type-006', 
    name: 'Execution', 
    on_premise: false, 
    affects_lockup: true,
    description: 'Death penalty execution',
    is_execution: true
  },
];

// Mock staff data for officers
const mockStaffProfiles = [
  {
    id: 'staff-001',
    first_name: 'Michael',
    middle_name: 'John',
    last_name: 'Okello',
    force_number: 'UPS/5432/2018',
    rank: 'Senior Superintendent',
    is_active: true,
  },
  {
    id: 'staff-002',
    first_name: 'Sarah',
    middle_name: 'Grace',
    last_name: 'Namuli',
    force_number: 'UPS/6789/2019',
    rank: 'Superintendent',
    is_active: true,
  },
  {
    id: 'staff-003',
    first_name: 'David',
    middle_name: 'Peter',
    last_name: 'Kizito',
    force_number: 'UPS/8901/2020',
    rank: 'Assistant Superintendent',
    is_active: true,
  },
];

// Mock next of kin data
const mockNextOfKinData: Record<string, any[]> = {
  'prisoner-001': [
    {
      id: 'nok-001',
      full_name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+256 700 123 456',
    },
    {
      id: 'nok-002',
      full_name: 'James Doe',
      relationship: 'Father',
      phone: '+256 700 789 012',
    },
  ],
  'prisoner-002': [
    {
      id: 'nok-003',
      full_name: 'Robert Smith',
      relationship: 'Brother',
      phone: '+256 701 234 567',
    },
  ],
};

// Mock approving authorities
const mockApprovingAuthorities = [
  {
    id: 'auth-001',
    full_name: 'Hon. Chief Justice',
    rank: 'Chief Justice',
    force_number: 'CJ/001/2020',
  },
  {
    id: 'auth-002',
    full_name: 'Hon. President',
    rank: 'President',
    force_number: 'PRES/001/2021',
  },
];

interface DischargeOfficer {
  id?: string;
  staff: string;
  staff_name: string;
  force_number: string;
  rank: string;
}

interface DischargeDocument {
  id?: string;
  document_type: string;
  document: File | null;
  description: string;
  file_name?: string;
}

export const PrisonerDischargeFormTabbed: React.FC<PrisonerDischargeFormProps> = ({
    dischargeRequests, setDischargeRequests, setPrisoners, prisoners, setStaff, staff, setReasons, setTypes, types, reasons,
  initialData,
  onSubmit,
  onCancel,
  onTransferRedirect,
  mode = 'create',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic-info');
  const [formData, setFormData] = useState({
    discharge_datetime: '',
    remarks: '',
    intended_place_of_stay: '',
    prisoner: '',
    discharge_type: '',
    discharge_reason: '',
    original_station: 'station-001',
    biometric_data: '',
    request: '',
    request_number: '',
    // Deceased fields
    date_of_death: '',
    morgue_details: '',
    next_of_kin_available: false,
    next_of_kin: '',
    post_mortem_report: null as File | null,
    // Execution fields
    datetime_of_execution: '',
    approving_authority: '',
    approving_authority_name: '',
    approving_authority_force_number: '',
    approving_authority_rank: '',
  });

  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [postMortemFileName, setPostMortemFileName] = useState('');
  const [showNextOfKinDialog, setShowNextOfKinDialog] = useState(false);
  const [nextOfKinOpen, setNextOfKinOpen] = useState(false);
  const [nextOfKinList, setNextOfKinList] = useState<any[]>([]);
  const [approvingAuthorityOpen, setApprovingAuthorityOpen] = useState(false);

  // Discharge Officers state
  const [dischargeOfficers, setDischargeOfficers] = useState<DischargeOfficer[]>([]);
  const [staffOpen, setStaffOpen] = useState(false);
  const [currentOfficerIndex, setCurrentOfficerIndex] = useState<number | null>(null);

  // Discharge Documents state
  const [dischargeDocuments, setDischargeDocuments] = useState<DischargeDocument[]>([]);

  // Discharge Request state
  const [dischargeRequestOpen, setDischargeRequestOpen] = useState(false);
  const [showDischargeRequestDialog, setShowDischargeRequestDialog] = useState(false);

  //API integration
  const [loader, setLoader] = useState(true)
  useEffect(() => {
    if(loader) {
      fetchData()
    }
  }, [loader]);

  function populateList(response: any, msg: string, setData: any) {
    if (handleServerError2(response)) return true

    if ("results" in response) {
      const data = response.results
      if (!data.length) {
        toast.error(msg)
        return true
      }
      setData(data)
      // console.log(data)
    }

    return false
  }

  function returnedValue (value: boolean){
    if (value){
      onCancel()
      return
    }
  }

  async function fetchData() {
    try {
        if (!dischargeRequests.length){
          const response0 = await getRequests()
          returnedValue(populateList(response0, "There are no discharge requests", setDischargeRequests))
        }

        if (!prisoners.length){
          const response1 = await getPrisoners()
          returnedValue(populateList(response1, "There are no prisoners", setPrisoners))
        }

        if (!staff.length) {
            const response2 = await getStaffProfile()
            returnedValue(populateList(response2, "There are no staff officers", setStaff))
        }

        if (!types.length) {
          const response3 = await getTypes()
          returnedValue(populateList(response3, "There are no discharge types", setTypes))

        }

        if (!reasons.length) {
          const response4 = await getReasons()
          returnedValue(populateList(response4, "There are no discharge reasons", setReasons))
        }

    }catch (error) {
      handleCatchError(error)
    }finally {
      setLoader(false)
    }
  }




  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Load existing officers and documents if in edit mode
      if (mode === 'edit' && initialData.officers) {
        setDischargeOfficers(initialData.officers);
      }
      if (mode === 'edit' && initialData.documents) {
        setDischargeDocuments(initialData.documents);
      }
    }
  }, [initialData, mode]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === 'discharge_type_name' && value === 'Transfer') {
      setShowTransferDialog(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      officers: dischargeOfficers,
      documents: dischargeDocuments,
    };
    onSubmit(submitData);
  };

  const handleTransferConfirm = () => {
    setShowTransferDialog(false);
    if (onTransferRedirect) {
      onTransferRedirect({
        prisoner: formData.prisoner,
        prisoner_name: formData.prisoner_name,
        prisoner_number: formData.prisoner_number,
        original_station: formData.original_station,
      });
    }
  };

  const handlePostMortemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, post_mortem_report: file }));
      setPostMortemFileName(file.name);
    }
  };

  const handleNextOfKinOpen = () => {
    setNextOfKinOpen(true);
    const prisonerId = formData.prisoner;
    if (prisonerId && mockNextOfKinData[prisonerId]) {
      setNextOfKinList(mockNextOfKinData[prisonerId]);
    } else {
      setNextOfKinList([]);
    }
  };

  const handleNextOfKinSelect = (nokId: string) => {
    setFormData((prev) => ({ ...prev, next_of_kin: nokId }));
    setNextOfKinOpen(false);
  };

  // Discharge Officers handlers
  const addDischargeOfficer = () => {
    setDischargeOfficers([
      ...dischargeOfficers,
      {
        staff: '',
        staff_name: '',
        force_number: '',
        rank: '',
      },
    ]);
  };

  const removeDischargeOfficer = (index: number) => {
    setDischargeOfficers(dischargeOfficers.filter((_, i) => i !== index));
    toast.success('Officer removed');
  };

  const selectStaffForOfficer = (index: number, staffId: string) => {
    const st = staff.find((s) => s.id === staffId);
    if (st) {
      const updated = [...dischargeOfficers];
      updated[index] = {
        ...updated[index],
        staff: staffId,
        staff_name: `${st.first_name} ${st.middle_name} ${st.last_name}`,
        force_number: st.force_number,
        rank: st.rank_name,
      };
      setDischargeOfficers(updated);
      setStaffOpen(false);
      setCurrentOfficerIndex(null);
      toast.success('Officer added successfully');
    }
  };

  // Discharge Documents handlers
  const addDischargeDocument = () => {
    setDischargeDocuments([
      ...dischargeDocuments,
      {
        document_type: '',
        document: null,
        description: '',
      },
    ]);
  };

  const removeDischargeDocument = (index: number) => {
    setDischargeDocuments(dischargeDocuments.filter((_, i) => i !== index));
    toast.success('Document removed');
  };

  const updateDocument = (index: number, field: string, value: any) => {
    const updated = [...dischargeDocuments];
    updated[index] = { ...updated[index], [field]: value };
    setDischargeDocuments(updated);
  };

  const handleDocumentFileChange = (index: number, file: File | null) => {
    const updated = [...dischargeDocuments];
    updated[index] = { ...updated[index], document: file, file_name: file?.name || '' };
    setDischargeDocuments(updated);
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={cn(
        'px-6 py-3 rounded-t-lg transition-all',
        activeTab === tab
          ? 'text-white shadow-md'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      )}
      style={
        activeTab === tab
          ? { backgroundColor: '#650000' }
          : {}
      }
    >
      {label}
    </button>
  );

  const renderBasicInfoTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="discharge_request">Discharge Request *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Popover open={dischargeRequestOpen} onOpenChange={setDischargeRequestOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={dischargeRequestOpen}
                    className="w-full justify-between"
                    type="button"
                  >
                    {formData.request
                      ? (() => {
                          const selected = dischargeRequests.find((req) => req.id === formData.request);
                          return selected ? selected.request_number : 'Select discharge request...';
                        })()
                      : 'Select discharge request...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search discharge request..." />
                    <CommandList>
                      <CommandEmpty>No discharge request found.</CommandEmpty>
                      <CommandGroup>
                        {dischargeRequests.map((req) => (
                          <CommandItem
                            key={req.id}
                            value={req.request_number}
                            onSelect={() => {
                              setFormData((prev) => ({
                                ...prev,
                                request: req.id,
                                request_number: req.request_number,
                              }));
                              setDischargeRequestOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.request === req.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{req.request_number}</span>
                              <span className="text-xs text-gray-500">In Charge: {req.in_charge_name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setShowDischargeRequestDialog(true)}
              className="shrink-0"
              style={{ borderColor: '#34D399' }}
            >
              <Plus className="h-4 w-4" style={{ color: '#34D399' }} />
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="prisoner">Prisoner *</Label>
          <Select
            value={formData.prisoner}
            onValueChange={(value) => {
              handleChange('prisoner', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select prisoner" />
            </SelectTrigger>
            <SelectContent>
              {
                prisoners.map(pr => (
                    <SelectItem key={pr.id} value={pr.id}>{pr.full_name} ({pr.prisoner_number_value})</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="discharge_type">Discharge Type *</Label>
          <Select
            value={formData.discharge_type}
            onValueChange={(value) => {
              handleChange('discharge_type', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select discharge type" />
            </SelectTrigger>
            <SelectContent>
              {
                types.map(ty => (
                    <SelectItem key={ty.id} value={ty.id}>{ty.name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="discharge_reason">Discharge Reason *</Label>
          <Select
            value={formData.discharge_reason}
            onValueChange={(value) => {
              handleChange('discharge_reason', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select discharge reason" />
            </SelectTrigger>
            <SelectContent>
              {
                reasons.map(rs => (
                    <SelectItem key={rs.id} value={rs.id}>{rs.name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="discharge_datetime">Discharge Date & Time *</Label>
          <Input
            id="discharge_datetime"
            type="datetime-local"
            value={formData.discharge_datetime.slice(0, 16)}
            onChange={(e) => handleChange('discharge_datetime', e.target.value + ':00Z')}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          rows={4}
          placeholder="Enter any additional remarks..."
        />
      </div>

      <div>
        <Label htmlFor="intended_place_of_stay">Intended Place of Stay</Label>
        <Textarea
          id="intended_place_of_stay"
          value={formData.intended_place_of_stay}
          onChange={(e) => handleChange('intended_place_of_stay', e.target.value)}
          rows={3}
          placeholder="Enter intended address/location after discharge..."
        />
      </div>

      {/* Deceased Fields */}
      {formData.discharge_type_name === 'Death' && (
        <div className="border-t pt-6 mt-6">
          <div 
            className="px-4 py-3 rounded-lg mb-6"
            style={{ backgroundColor: '#faebd7', color: '#650000' }}
          >
            <h3 className="flex items-center gap-2">
              <Skull className="h-5 w-5" />
              Deceased Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_of_death">Date of Death *</Label>
              <Input
                id="date_of_death"
                type="date"
                value={formData.date_of_death}
                onChange={(e) => handleChange('date_of_death', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="morgue_details" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Morgue Details
              </Label>
              <Input
                id="morgue_details"
                value={formData.morgue_details}
                onChange={(e) => handleChange('morgue_details', e.target.value)}
                placeholder="e.g., City Morgue, Section A, Shelf 12"
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="next_of_kin_available"
                checked={formData.next_of_kin_available}
                onCheckedChange={(checked) => 
                  setFormData((prev) => ({ ...prev, next_of_kin_available: !!checked }))
                }
              />
              <Label htmlFor="next_of_kin_available" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Next of Kin Available
              </Label>
            </div>
          </div>

          {formData.next_of_kin_available && (
            <div className="mt-4">
              <Label htmlFor="next_of_kin" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Next of Kin *
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Popover open={nextOfKinOpen} onOpenChange={setNextOfKinOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={nextOfKinOpen}
                        className="w-full justify-between"
                        type="button"
                        onClick={handleNextOfKinOpen}
                      >
                        {formData.next_of_kin
                          ? (() => {
                              const selected = nextOfKinList.find((nok) => nok.id === formData.next_of_kin);
                              return selected
                                ? `${selected.full_name} (${selected.relationship})`
                                : "Select next of kin...";
                            })()
                          : "Select next of kin..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search next of kin..." />
                        <CommandList>
                          <CommandEmpty>No next of kin found.</CommandEmpty>
                          <CommandGroup>
                            {nextOfKinList.map((nok) => (
                              <CommandItem
                                key={nok.id}
                                value={nok.full_name}
                                onSelect={() => handleNextOfKinSelect(nok.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.next_of_kin === nok.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{nok.full_name}</span>
                                  <span className="text-xs text-gray-500">
                                    {nok.relationship} • {nok.phone}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setShowNextOfKinDialog(true)}
                  className="shrink-0"
                  style={{ borderColor: '#34D399' }}
                >
                  <Plus className="h-4 w-4" style={{ color: '#34D399' }} />
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Label htmlFor="post_mortem_report" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Post Mortem Report
            </Label>
            <div className="mt-2">
              <label 
                htmlFor="post_mortem_report"
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {postMortemFileName || 'Click to upload PDF file'}
                </span>
              </label>
              <Input
                id="post_mortem_report"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handlePostMortemChange}
                className="hidden"
              />
              {postMortemFileName && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Selected: {postMortemFileName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Execution Fields */}
      {formData.discharge_type_name === 'Execution' && (
        <div className="border-t pt-6 mt-6">
          <div 
            className="px-4 py-3 rounded-lg mb-6"
            style={{ backgroundColor: '#faebd7', color: '#650000' }}
          >
            <h3 className="flex items-center gap-2">
              <Skull className="h-5 w-5" />
              Execution Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="datetime_of_execution">Date & Time of Execution *</Label>
              <Input
                id="datetime_of_execution"
                type="datetime-local"
                value={formData.datetime_of_execution.slice(0, 16)}
                onChange={(e) => handleChange('datetime_of_execution', e.target.value + ':00Z')}
                required
              />
            </div>

            <div>
              <Label htmlFor="approving_authority" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Approving Authority
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Popover open={approvingAuthorityOpen} onOpenChange={setApprovingAuthorityOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={approvingAuthorityOpen}
                        className="w-full justify-between"
                        type="button"
                      >
                        {formData.approving_authority
                          ? (() => {
                              const selected = mockApprovingAuthorities.find((auth) => auth.id === formData.approving_authority);
                              return selected ? selected.full_name : "Select approving authority...";
                            })()
                          : "Select approving authority..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search approving authority..." />
                        <CommandList>
                          <CommandEmpty>No approving authority found.</CommandEmpty>
                          <CommandGroup>
                            {mockApprovingAuthorities.map((auth) => (
                              <CommandItem
                                key={auth.id}
                                value={auth.full_name}
                                onSelect={() => {
                                  setFormData((prev) => ({ 
                                    ...prev, 
                                    approving_authority: auth.id,
                                    approving_authority_name: auth.full_name,
                                    approving_authority_force_number: auth.force_number,
                                    approving_authority_rank: auth.rank,
                                  }));
                                  setApprovingAuthorityOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.approving_authority === auth.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{auth.full_name}</span>
                                  <span className="text-xs text-gray-500">
                                    {auth.rank} • {auth.force_number}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // const renderBiometricTab = () => (
  //   <div className="space-y-6">
  //     <div
  //       className="px-4 py-3 rounded-lg"
  //       style={{ backgroundColor: '#faebd7', color: '#650000' }}
  //     >
  //       <h3 className="flex items-center gap-2">
  //         <Fingerprint className="h-5 w-5" />
  //         Biometric Verification
  //       </h3>
  //     </div>
  //
  //     <div className="max-w-2xl mx-auto">
  //       <BiometricCapture
  //         value={formData.biometric_data}
  //         onChange={(value) => setFormData((prev) => ({ ...prev, biometric_data: value }))}
  //         label="Officer Fingerprint Verification"
  //       />
  //     </div>
  //
  //     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  //       <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
  //       <ul className="text-sm text-blue-800 space-y-1">
  //         <li>• Ensure the biometric scanner is properly connected</li>
  //         <li>• Clean your finger before placing it on the scanner</li>
  //         <li>• Press firmly but gently on the scanner</li>
  //         <li>• Hold still until the capture is complete</li>
  //       </ul>
  //     </div>
  //   </div>
  // );

  const renderOfficersTab = () => (
    <div className="space-y-6">
      <div 
        className="px-4 py-3 rounded-lg flex items-center justify-between"
        style={{ backgroundColor: '#faebd7', color: '#650000' }}
      >
        <h3 className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Discharge Officers
        </h3>
        <Button
          type="button"
          onClick={addDischargeOfficer}
          size="sm"
          style={{ backgroundColor: '#34D399' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Officer
        </Button>
      </div>

      {dischargeOfficers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 mb-4">No officers added yet</p>
          <Button
            type="button"
            onClick={addDischargeOfficer}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Officer
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Officer Name</TableHead>
              <TableHead>Force Number</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dischargeOfficers.map((officer, index) => (
              <TableRow key={index}>
                <TableCell>
                  {officer.staff_name || (
                    <Popover 
                      open={staffOpen && currentOfficerIndex === index} 
                      onOpenChange={(open) => {
                        setStaffOpen(open);
                        setCurrentOfficerIndex(open ? index : null);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          Select Officer
                          <ChevronsUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput placeholder="Search staff..." />
                          <CommandList>
                            <CommandEmpty>No staff found.</CommandEmpty>
                            <CommandGroup>
                              {staff.map((st) => (
                                <CommandItem
                                  key={st.id}
                                  value={`${st.first_name} ${st.last_name}`}
                                  onSelect={() => selectStaffForOfficer(index, st.id)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      officer.staff === st.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{`${st.first_name} ${st.middle_name} ${st.last_name}`}</span>
                                    <span className="text-xs text-gray-500">
                                      {st.rank_name} • {st.force_number}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </TableCell>
                <TableCell>{officer.force_number || '-'}</TableCell>
                <TableCell>{officer.rank || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDischargeOfficer(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div 
        className="px-4 py-3 rounded-lg flex items-center justify-between"
        style={{ backgroundColor: '#faebd7', color: '#650000' }}
      >
        <h3 className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Discharge Documents
        </h3>
        <Button
          type="button"
          onClick={addDischargeDocument}
          size="sm"
          style={{ backgroundColor: '#34D399' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {dischargeDocuments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 mb-4">No documents uploaded yet</p>
          <Button
            type="button"
            onClick={addDischargeDocument}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload First Document
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {dischargeDocuments.map((doc, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`doc_type_${index}`}>Document Type *</Label>
                    <Select
                      value={doc.document_type}
                      onValueChange={(value) => updateDocument(index, 'document_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="release-order">Release Order</SelectItem>
                        <SelectItem value="court-order">Court Order</SelectItem>
                        <SelectItem value="medical-report">Medical Report</SelectItem>
                        <SelectItem value="transfer-letter">Transfer Letter</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`doc_file_${index}`}>Document File *</Label>
                    <div className="flex gap-2">
                      <label 
                        htmlFor={`doc_file_${index}`}
                        className="flex-1 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <Upload className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 truncate">
                          {doc.file_name || 'Choose file...'}
                        </span>
                      </label>
                      <Input
                        id={`doc_file_${index}`}
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentFileChange(index, e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDischargeDocument(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`doc_desc_${index}`}>Description</Label>
                    <Textarea
                      id={`doc_desc_${index}`}
                      value={doc.description}
                      onChange={(e) => updateDocument(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Enter document description..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {
        loader ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching Prisoners and Staff Information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tab Navigation using shadcn Tabs */}
              <Tabs defaultValue="basic-info" className="w-full">
                {/*<TabsList className="grid w-full grid-cols-4">*/}
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
                  {/*<TabsTrigger value="biometric">Biometric Capture</TabsTrigger>*/}
                  <TabsTrigger value="officers">Discharge Officers</TabsTrigger>
                  <TabsTrigger value="documents">Discharge Documents</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic-info" className="space-y-4 mt-4">
                  {renderBasicInfoTab()}
                </TabsContent>

                {/* Biometric Capture Tab */}
                {/*<TabsContent value="biometric" className="space-y-4 mt-4">*/}
                {/*  {renderBiometricTab()}*/}
                {/*</TabsContent>*/}

                {/* Discharge Officers Tab */}
                <TabsContent value="officers" className="space-y-4 mt-4">
                  {renderOfficersTab()}
                </TabsContent>

                {/* Discharge Documents Tab */}
                <TabsContent value="documents" className="space-y-4 mt-4">
                  {renderDocumentsTab()}
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" style={{ backgroundColor: '#650000' }} className="hover:opacity-90">
                  {mode === 'edit' ? 'Update' : 'Create'} Discharge
                </Button>
              </div>
            </form>
        )
      }


      {/* Transfer Confirmation Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <ArrowRightLeft className="h-5 w-5" />
              Transfer Prisoner
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            You have selected "Transfer" as the discharge type. Would you like to create a transfer request for this prisoner?
          </DialogDescription>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Prisoner:</span>
                <span className="font-medium">{formData.prisoner_name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prisoner Number:</span>
                <span className="font-medium">{formData.prisoner_number || 'Not selected'}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              No, Continue with Discharge
            </Button>
            <Button 
              onClick={handleTransferConfirm}
              style={{ backgroundColor: '#34D399' }}
              className="hover:opacity-90"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Yes, Create Transfer Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Next of Kin Dialog */}
      <Dialog open={showNextOfKinDialog} onOpenChange={setShowNextOfKinDialog}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <User className="h-5 w-5" />
              Add Next of Kin
            </DialogTitle>
            <DialogDescription>
              Add a new next of kin for the selected prisoner.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <NextOfKinForm
              prisonerId={formData.prisoner}
              onSubmit={(nokData) => {
                const newNok = {
                  id: `nok-${Date.now()}`,
                  full_name: `${nokData.first_name} ${nokData.surname}`,
                  relationship: nokData.relationship_type === '1' ? 'Spouse' : 
                               nokData.relationship_type === '2' ? 'Parent' : 
                               nokData.relationship_type === '3' ? 'Sibling' : 'Other',
                  phone: nokData.phone_number,
                  ...nokData
                };
                setNextOfKinList([...nextOfKinList, newNok]);
                setFormData((prev) => ({ ...prev, next_of_kin: newNok.id }));
                setShowNextOfKinDialog(false);
                toast.success('Next of Kin added successfully!');
              }}
              onCancel={() => setShowNextOfKinDialog(false)}
              hideFooter={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Discharge Request Dialog */}
      <Dialog open={showDischargeRequestDialog} onOpenChange={setShowDischargeRequestDialog}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <FileText className="h-5 w-5" />
              Add Discharge Request
            </DialogTitle>
            <DialogDescription>
              Add a new discharge request with multiple discharges.
            </DialogDescription>
          </DialogHeader>
          <DischargeRequestForm
            onSubmit={(requestData) => {
              const newRequest = {
                id: `req-${Date.now()}`,
                request_number: `DRQ-2025-${String(Date.now()).slice(-6)}`,
                ...requestData
              };
              setFormData((prev) => ({
                ...prev,
                request: newRequest.id,
                request_number: newRequest.request_number,
              }));
              setShowDischargeRequestDialog(false);
              toast.success('Discharge Request created successfully!');
            }}
            onCancel={() => setShowDischargeRequestDialog(false)}
            mode="create"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
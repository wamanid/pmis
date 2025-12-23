import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ArrowRightLeft, Skull, Building, User, FileText, Upload, Plus, Trash2, Fingerprint, Shield, X } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '../ui/utils';
import { NextOfKinForm } from '../admission/NextOfKinForm';
import { toast } from 'sonner';
import BiometricCapture from '../common/BiometricCapture';

interface PrisonerDischargeFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onTransferRedirect?: (prisonerData: { prisoner: string; prisoner_name: string; prisoner_number: string; original_station: string }) => void;
}

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

export const PrisonerDischargeForm: React.FC<PrisonerDischargeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  onTransferRedirect,
}) => {
  const [formData, setFormData] = useState({
    prisoner_name: '',
    prisoner_number: '',
    discharge_type_name: '',
    discharge_reason_name: '',
    discharge_datetime: '',
    remarks: '',
    intended_place_of_stay: '',
    prisoner: '',
    discharge_type: '',
    discharge_reason: '',
    original_station: 'station-001', // Default station
    // Deceased fields
    date_of_death: '',
    morgue_details: '',
    next_of_kin_available: false,
    next_of_kin: '', // Changed from next_of_kin_details to next_of_kin (UUID)
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

  // Mock next of kin data for selected prisoner
  const mockNextOfKinData: Record<string, any[]> = {
    'prisoner-001': [
      { id: 'nok-001', full_name: 'Mary Doe', relationship: 'Spouse', phone: '0700123456' },
      { id: 'nok-002', full_name: 'Robert Doe', relationship: 'Father', phone: '0701234567' },
    ],
    'prisoner-002': [
      { id: 'nok-003', full_name: 'James Smith', relationship: 'Brother', phone: '0702345678' },
    ],
    'prisoner-003': [],
  };

  // Mock staff data for approving authority
  const mockApprovingAuthorities = [
    { 
      id: 'auth-001', 
      full_name: 'Commissioner General John Okoth Ochola', 
      force_number: 'UPS/001/2020',
      rank: 'Commissioner General'
    },
    { 
      id: 'auth-002', 
      full_name: 'Assistant Commissioner Jane Namutebi', 
      force_number: 'UPS/002/2018',
      rank: 'Assistant Commissioner'
    },
    { 
      id: 'auth-003', 
      full_name: 'Senior Superintendent Michael Kizito', 
      force_number: 'UPS/003/2019',
      rank: 'Senior Superintendent'
    },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Check if discharge type is Transfer
    if (field === 'discharge_type_name' && value === 'Transfer') {
      setShowTransferDialog(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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

  const handleTransferCancel = () => {
    setShowTransferDialog(false);
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

  const handleNextOfKinClose = () => {
    setNextOfKinOpen(false);
  };

  const handleNextOfKinSelect = (nokId: string) => {
    setFormData((prev) => ({ ...prev, next_of_kin: nokId }));
    handleNextOfKinClose();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prisoner">Prisoner *</Label>
            <Select
              value={formData.prisoner}
              onValueChange={(value) => {
                handleChange('prisoner', value);
                // Mock: Set prisoner name and number based on selection
                if (value === 'prisoner-001') {
                  handleChange('prisoner_name', 'John Doe');
                  handleChange('prisoner_number', 'P-2024-001');
                } else if (value === 'prisoner-002') {
                  handleChange('prisoner_name', 'Jane Smith');
                  handleChange('prisoner_number', 'P-2024-002');
                } else if (value === 'prisoner-003') {
                  handleChange('prisoner_name', 'Michael Johnson');
                  handleChange('prisoner_number', 'P-2024-003');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select prisoner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prisoner-001">John Doe (P-2024-001)</SelectItem>
                <SelectItem value="prisoner-002">Jane Smith (P-2024-002)</SelectItem>
                <SelectItem value="prisoner-003">Michael Johnson (P-2024-003)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discharge_type">Discharge Type *</Label>
            <Select
              value={formData.discharge_type}
              onValueChange={(value) => {
                handleChange('discharge_type', value);
                // Mock: Set discharge type name
                const types: Record<string, string> = {
                  'type-001': 'Completion of Sentence',
                  'type-002': 'Transfer',
                  'type-003': 'Death',
                  'type-004': 'Court Order',
                  'type-005': 'Deportation',
                  'type-006': 'Execution',
                };
                handleChange('discharge_type_name', types[value] || '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select discharge type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="type-001">Completion of Sentence</SelectItem>
                <SelectItem value="type-002">Transfer</SelectItem>
                <SelectItem value="type-003">Death</SelectItem>
                <SelectItem value="type-004">Court Order</SelectItem>
                <SelectItem value="type-005">Deportation</SelectItem>
                <SelectItem value="type-006">Execution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discharge_reason">Discharge Reason *</Label>
            <Select
              value={formData.discharge_reason}
              onValueChange={(value) => {
                handleChange('discharge_reason', value);
                // Mock: Set discharge reason name
                const reasons: Record<string, string> = {
                  'reason-001': 'Sentence Completed',
                  'reason-002': 'Inter-Prison Transfer',
                  'reason-003': 'Medical Grounds',
                  'reason-004': 'Presidential Pardon',
                  'reason-005': 'Court Order',
                };
                handleChange('discharge_reason_name', reasons[value] || '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select discharge reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reason-001">Sentence Completed</SelectItem>
                <SelectItem value="reason-002">Inter-Prison Transfer</SelectItem>
                <SelectItem value="reason-003">Medical Grounds</SelectItem>
                <SelectItem value="reason-004">Presidential Pardon</SelectItem>
                <SelectItem value="reason-005">Court Order</SelectItem>
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
          <>
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
                  <Label htmlFor="date_of_death" className="flex items-center gap-2">
                    Date of Death *
                  </Label>
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
                  <Label 
                    htmlFor="next_of_kin_available" 
                    className="flex items-center gap-2 cursor-pointer"
                  >
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
          </>
        )}

        {/* Execution Fields */}
        {formData.discharge_type_name === 'Execution' && (
          <>
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
                  <Label htmlFor="datetime_of_execution" className="flex items-center gap-2">
                    Date & Time of Execution *
                  </Label>
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
                            onClick={() => setApprovingAuthorityOpen(true)}
                          >
                            {formData.approving_authority
                              ? (() => {
                                  const selected = mockApprovingAuthorities.find((type) => type.id === formData.approving_authority);
                                  return selected
                                    ? `${selected.full_name}`
                                    : "Select approving authority...";
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
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setApprovingAuthorityOpen(true)}
                      className="shrink-0"
                      style={{ borderColor: '#34D399' }}
                    >
                      <Plus className="h-4 w-4" style={{ color: '#34D399' }} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="approving_authority_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Approving Authority Name
                </Label>
                <Input
                  id="approving_authority_name"
                  value={formData.approving_authority_name}
                  onChange={(e) => handleChange('approving_authority_name', e.target.value)}
                  placeholder="Enter the name of the approving authority..."
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="approving_authority_force_number" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Approving Authority Force Number
                </Label>
                <Input
                  id="approving_authority_force_number"
                  value={formData.approving_authority_force_number}
                  onChange={(e) => handleChange('approving_authority_force_number', e.target.value)}
                  placeholder="Enter the force number of the approving authority..."
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="approving_authority_rank" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Approving Authority Rank
                </Label>
                <Input
                  id="approving_authority_rank"
                  value={formData.approving_authority_rank}
                  onChange={(e) => handleChange('approving_authority_rank', e.target.value)}
                  placeholder="Enter the rank of the approving authority..."
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Discharge
          </Button>
        </div>
      </form>

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
            <Button variant="outline" onClick={handleTransferCancel}>
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
                // Create new next of kin with mock ID
                const newNok = {
                  id: `nok-${Date.now()}`,
                  full_name: `${nokData.first_name} ${nokData.surname}`,
                  relationship: nokData.relationship_type === '1' ? 'Spouse' : 
                               nokData.relationship_type === '2' ? 'Parent' : 
                               nokData.relationship_type === '3' ? 'Sibling' : 'Other',
                  phone: nokData.phone_number,
                  ...nokData
                };
                // Add new next of kin to the list
                setNextOfKinList([...nextOfKinList, newNok]);
                // Set the new next of kin as selected
                setFormData((prev) => ({ ...prev, next_of_kin: newNok.id }));
                // Close the dialog
                setShowNextOfKinDialog(false);
                toast.success('Next of Kin added successfully!');
              }}
              onCancel={() => setShowNextOfKinDialog(false)}
              hideFooter={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
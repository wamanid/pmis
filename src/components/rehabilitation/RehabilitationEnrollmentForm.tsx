import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Calendar } from '../ui/calendar';
import { Switch } from '../ui/switch';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  Search, 
  Check, 
  ChevronsUpDown, 
  X, 
  CalendarIcon,
  FileText,
  Award,
  User,
  BookOpen
} from 'lucide-react';
import { cn } from '../ui/utils';

interface RehabilitationEnrollment {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  programme_name?: string;
  programme_stage_name?: string;
  sponsor_name?: string;
  responsible_officer_name?: string;
  progress_status_name?: string;
  prisoner_opinion: string;
  date_of_enrollment: string;
  start_date: string;
  end_date: string;
  certificate_awarded: boolean;
  certification_document: string;
  comment: string;
  prisoner: string | string[];
  programme: string;
  programme_stage: string;
  rehabilitation_sponsor: string;
  responsible_officer: number;
  progress_status: string;
}

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
}

interface Programme {
  id: string;
  name: string;
  description?: string;
}

interface ProgrammeStage {
  id: string;
  name: string;
  programme_name?: string;
}

interface Sponsor {
  id: string;
  name: string;
  contact?: string;
}

interface Officer {
  id: number;
  username: string;
  full_name?: string;
}

interface ProgressStatus {
  id: string;
  name: string;
}

interface RehabilitationEnrollmentFormProps {
  enrollment?: RehabilitationEnrollment | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: RehabilitationEnrollment) => void;
  onCancel: () => void;
}

const RehabilitationEnrollmentForm: React.FC<RehabilitationEnrollmentFormProps> = ({
  enrollment,
  mode,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<RehabilitationEnrollment>({
    prisoner_opinion: '',
    date_of_enrollment: new Date().toISOString().split('T')[0],
    start_date: '',
    end_date: '',
    certificate_awarded: false,
    certification_document: '',
    comment: '',
    prisoner: [],
    programme: '',
    programme_stage: '',
    rehabilitation_sponsor: '',
    responsible_officer: 0,
    progress_status: ''
  });

  // Mock data - expanded list for demonstration
  const [prisoners] = useState<Prisoner[]>([
    { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
    { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
    { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
    { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Robert Williams' },
    { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Mary Brown' },
    { id: '6', prisoner_number: 'PR-2024-006', full_name: 'James Davis' },
    { id: '7', prisoner_number: 'PR-2024-007', full_name: 'Patricia Miller' },
    { id: '8', prisoner_number: 'PR-2024-008', full_name: 'William Wilson' },
    { id: '9', prisoner_number: 'PR-2024-009', full_name: 'Linda Moore' },
    { id: '10', prisoner_number: 'PR-2024-010', full_name: 'David Taylor' },
    { id: '11', prisoner_number: 'PR-2024-011', full_name: 'Barbara Anderson' },
    { id: '12', prisoner_number: 'PR-2024-012', full_name: 'Richard Thomas' },
    { id: '13', prisoner_number: 'PR-2024-013', full_name: 'Susan Jackson' },
    { id: '14', prisoner_number: 'PR-2024-014', full_name: 'Joseph White' },
    { id: '15', prisoner_number: 'PR-2024-015', full_name: 'Jessica Harris' }
  ]);

  const [programmes] = useState<Programme[]>([
    { id: '1', name: 'Vocational Training', description: 'Skills development' },
    { id: '2', name: 'Education Programme', description: 'Academic courses' },
    { id: '3', name: 'Counseling Services', description: 'Mental health support' },
    { id: '4', name: 'Substance Abuse Recovery', description: 'Addiction treatment' }
  ]);

  const [programmeStages] = useState<ProgrammeStage[]>([
    { id: '1', name: 'Orientation', programme_name: 'Vocational Training' },
    { id: '2', name: 'Basic Level', programme_name: 'Vocational Training' },
    { id: '3', name: 'Intermediate Level', programme_name: 'Education Programme' },
    { id: '4', name: 'Advanced Level', programme_name: 'Education Programme' },
    { id: '5', name: 'Initial Assessment', programme_name: 'Counseling Services' }
  ]);

  const [sponsors] = useState<Sponsor[]>([
    { id: '1', name: 'NGO Hope Foundation', contact: '0700123456' },
    { id: '2', name: 'Community Outreach', contact: '0700234567' },
    { id: '3', name: 'Faith-Based Organization', contact: '0700345678' },
    { id: '4', name: 'Government Programme', contact: '0700456789' }
  ]);

  const [officers] = useState<Officer[]>([
    { id: 1, username: 'officer1', full_name: 'David Wilson' },
    { id: 2, username: 'officer2', full_name: 'Sarah Brown' },
    { id: 3, username: 'officer3', full_name: 'James Taylor' }
  ]);

  const [progressStatuses] = useState<ProgressStatus[]>([
    { id: '1', name: 'Enrolled' },
    { id: '2', name: 'In Progress' },
    { id: '3', name: 'Completed' },
    { id: '4', name: 'Suspended' },
    { id: '5', name: 'Discontinued' }
  ]);

  const [selectedPrisonerIds, setSelectedPrisonerIds] = useState<string[]>([]);
  const [prisonerSearch, setPrisonerSearch] = useState('');
  const [openPrisoner, setOpenPrisoner] = useState(false);
  const [openProgramme, setOpenProgramme] = useState(false);
  const [openStage, setOpenStage] = useState(false);
  const [openSponsor, setOpenSponsor] = useState(false);
  const [openOfficer, setOpenOfficer] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [showEnrollmentDate, setShowEnrollmentDate] = useState(false);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  useEffect(() => {
    if (enrollment) {
      const prisonerIds = Array.isArray(enrollment.prisoner) 
        ? enrollment.prisoner 
        : enrollment.prisoner 
        ? [enrollment.prisoner] 
        : [];
      
      setFormData({
        ...enrollment,
        prisoner: prisonerIds,
        programme: enrollment.programme || '',
        programme_stage: enrollment.programme_stage || '',
        rehabilitation_sponsor: enrollment.rehabilitation_sponsor || '',
        responsible_officer: enrollment.responsible_officer || 0,
        progress_status: enrollment.progress_status || ''
      });
      setSelectedPrisonerIds(prisonerIds);
    }
  }, [enrollment]);

  const handleInputChange = (field: keyof RehabilitationEnrollment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const prisonerArray = Array.isArray(formData.prisoner) ? formData.prisoner : [];
    if (prisonerArray.length === 0) {
      toast.error('Please select at least one prisoner');
      return;
    }
    if (!formData.programme) {
      toast.error('Please select a programme');
      return;
    }
    if (!formData.date_of_enrollment) {
      toast.error('Please select date of enrollment');
      return;
    }

    onSubmit(formData);
  };

  const handleAddPrisoner = (prisonerId: string) => {
    if (!selectedPrisonerIds.includes(prisonerId)) {
      const newSelectedIds = [...selectedPrisonerIds, prisonerId];
      setSelectedPrisonerIds(newSelectedIds);
      handleInputChange('prisoner', newSelectedIds);
    }
    setPrisonerSearch('');
  };

  const handleRemovePrisoner = (prisonerId: string) => {
    const newSelectedIds = selectedPrisonerIds.filter(id => id !== prisonerId);
    setSelectedPrisonerIds(newSelectedIds);
    handleInputChange('prisoner', newSelectedIds);
  };

  const selectedPrisoners = prisoners.filter(p => selectedPrisonerIds.includes(p.id));

  // Real-time filtering
  const filteredPrisoners = prisoners.filter(prisoner => {
    const searchLower = prisonerSearch.toLowerCase();
    return (
      prisoner.prisoner_number.toLowerCase().includes(searchLower) ||
      prisoner.full_name.toLowerCase().includes(searchLower)
    );
  });

  const isDisabled = mode === 'view';

  const selectedProgramme = programmes.find(p => p.id === formData.programme);
  const selectedStage = programmeStages.find(s => s.id === formData.programme_stage);
  const selectedSponsor = sponsors.find(s => s.id === formData.rehabilitation_sponsor);
  const selectedOfficer = officers.find(o => o.id === formData.responsible_officer);
  const selectedStatus = progressStatuses.find(s => s.id === formData.progress_status);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prisoner Multi-Select Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prisoner">
            Prisoners <span className="text-red-600">*</span>
            {selectedPrisonerIds.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({selectedPrisonerIds.length} selected)
              </span>
            )}
          </Label>
          <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openPrisoner}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                <span className="text-gray-500">
                  {selectedPrisonerIds.length > 0 
                    ? `${selectedPrisonerIds.length} prisoner(s) selected - Click to add more`
                    : 'Search and select prisoners...'
                  }
                </span>
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0">
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Search by prisoner number or name..." 
                  value={prisonerSearch}
                  onValueChange={setPrisonerSearch}
                />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No prisoner found.</CommandEmpty>
                  <CommandGroup>
                    {filteredPrisoners.map((prisoner) => {
                      const isSelected = selectedPrisonerIds.includes(prisoner.id);
                      return (
                        <CommandItem
                          key={prisoner.id}
                          value={`${prisoner.prisoner_number} ${prisoner.full_name}`}
                          onSelect={() => {
                            handleAddPrisoner(prisoner.id);
                          }}
                          className={cn(
                            isSelected && 'bg-gray-100 opacity-60'
                          )}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex-1">
                            <div>{prisoner.prisoner_number}</div>
                            <div className="text-sm text-gray-500">{prisoner.full_name}</div>
                          </div>
                          {isSelected && (
                            <Badge variant="outline" className="ml-2">
                              Selected
                            </Badge>
                          )}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Prisoners List */}
        {selectedPrisoners.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm">Selected Prisoners</Label>
                <Badge variant="outline">{selectedPrisoners.length} selected</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {selectedPrisoners.map((prisoner) => (
                  <Card key={prisoner.id} className="border-2">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate" style={{ color: '#650000' }}>
                            {prisoner.prisoner_number}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {prisoner.full_name}
                          </div>
                        </div>
                        {!isDisabled && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100"
                            onClick={() => handleRemovePrisoner(prisoner.id)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Programme Selection */}
        <div className="space-y-2">
          <Label htmlFor="programme">
            Programme <span className="text-red-600">*</span>
          </Label>
          <Popover open={openProgramme} onOpenChange={setOpenProgramme}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openProgramme}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                {selectedProgramme ? selectedProgramme.name : 'Select programme...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search programme..." />
                <CommandList>
                  <CommandEmpty>No programme found.</CommandEmpty>
                  <CommandGroup>
                    {programmes.map((programme) => (
                      <CommandItem
                        key={programme.id}
                        value={programme.id}
                        onSelect={() => {
                          handleInputChange('programme', programme.id);
                          setOpenProgramme(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.programme === programme.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {programme.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Programme Stage Selection */}
        <div className="space-y-2">
          <Label htmlFor="programme_stage">Programme Stage</Label>
          <Popover open={openStage} onOpenChange={setOpenStage}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStage}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                {selectedStage ? selectedStage.name : 'Select stage...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search stage..." />
                <CommandList>
                  <CommandEmpty>No stage found.</CommandEmpty>
                  <CommandGroup>
                    {programmeStages.map((stage) => (
                      <CommandItem
                        key={stage.id}
                        value={stage.id}
                        onSelect={() => {
                          handleInputChange('programme_stage', stage.id);
                          setOpenStage(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.programme_stage === stage.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {stage.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Sponsor Selection */}
        <div className="space-y-2">
          <Label htmlFor="rehabilitation_sponsor">Sponsor</Label>
          <Popover open={openSponsor} onOpenChange={setOpenSponsor}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSponsor}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                {selectedSponsor ? selectedSponsor.name : 'Select sponsor...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search sponsor..." />
                <CommandList>
                  <CommandEmpty>No sponsor found.</CommandEmpty>
                  <CommandGroup>
                    {sponsors.map((sponsor) => (
                      <CommandItem
                        key={sponsor.id}
                        value={sponsor.id}
                        onSelect={() => {
                          handleInputChange('rehabilitation_sponsor', sponsor.id);
                          setOpenSponsor(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.rehabilitation_sponsor === sponsor.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {sponsor.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Responsible Officer Selection */}
        <div className="space-y-2">
          <Label htmlFor="responsible_officer">Responsible Officer</Label>
          <Popover open={openOfficer} onOpenChange={setOpenOfficer}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openOfficer}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                {selectedOfficer ? (
                  <span>{selectedOfficer.full_name || selectedOfficer.username}</span>
                ) : (
                  'Select officer...'
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search officer..." />
                <CommandList>
                  <CommandEmpty>No officer found.</CommandEmpty>
                  <CommandGroup>
                    {officers.map((officer) => (
                      <CommandItem
                        key={officer.id}
                        value={officer.id.toString()}
                        onSelect={() => {
                          handleInputChange('responsible_officer', officer.id);
                          setOpenOfficer(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.responsible_officer === officer.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {officer.full_name || officer.username}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Progress Status Selection */}
        <div className="space-y-2">
          <Label htmlFor="progress_status">Progress Status</Label>
          <Popover open={openStatus} onOpenChange={setOpenStatus}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStatus}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                {selectedStatus ? selectedStatus.name : 'Select status...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search status..." />
                <CommandList>
                  <CommandEmpty>No status found.</CommandEmpty>
                  <CommandGroup>
                    {progressStatuses.map((status) => (
                      <CommandItem
                        key={status.id}
                        value={status.id}
                        onSelect={() => {
                          handleInputChange('progress_status', status.id);
                          setOpenStatus(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.progress_status === status.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {status.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Date of Enrollment */}
        <div className="space-y-2">
          <Label htmlFor="date_of_enrollment">
            Date of Enrollment <span className="text-red-600">*</span>
          </Label>
          <Popover open={showEnrollmentDate} onOpenChange={setShowEnrollmentDate}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left',
                  !formData.date_of_enrollment && 'text-gray-500'
                )}
                disabled={isDisabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date_of_enrollment
                  ? new Date(formData.date_of_enrollment).toLocaleDateString()
                  : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date_of_enrollment ? new Date(formData.date_of_enrollment) : undefined}
                onSelect={(date) => {
                  if (date) {
                    handleInputChange('date_of_enrollment', date.toISOString().split('T')[0]);
                    setShowEnrollmentDate(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Popover open={showStartDate} onOpenChange={setShowStartDate}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left',
                  !formData.start_date && 'text-gray-500'
                )}
                disabled={isDisabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date
                  ? new Date(formData.start_date).toLocaleDateString()
                  : 'Select start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.start_date ? new Date(formData.start_date) : undefined}
                onSelect={(date) => {
                  if (date) {
                    handleInputChange('start_date', date.toISOString().split('T')[0]);
                    setShowStartDate(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Popover open={showEndDate} onOpenChange={setShowEndDate}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left',
                  !formData.end_date && 'text-gray-500'
                )}
                disabled={isDisabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date
                  ? new Date(formData.end_date).toLocaleDateString()
                  : 'Select end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.end_date ? new Date(formData.end_date) : undefined}
                onSelect={(date) => {
                  if (date) {
                    handleInputChange('end_date', date.toISOString().split('T')[0]);
                    setShowEndDate(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Certificate Awarded */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="certificate_awarded">Certificate Awarded</Label>
            <Switch
              id="certificate_awarded"
              checked={formData.certificate_awarded}
              onCheckedChange={(checked) => handleInputChange('certificate_awarded', checked)}
              disabled={isDisabled}
            />
          </div>
          {formData.certificate_awarded && (
            <Badge variant="outline" className="w-fit">
              <Award className="h-3 w-3 mr-1" />
              Certificate Awarded
            </Badge>
          )}
        </div>

        {/* Certification Document */}
        {formData.certificate_awarded && (
          <div className="space-y-2">
            <Label htmlFor="certification_document">Certification Document</Label>
            <Input
              id="certification_document"
              value={formData.certification_document}
              onChange={(e) => handleInputChange('certification_document', e.target.value)}
              placeholder="Enter document reference or URL"
              disabled={isDisabled}
            />
          </div>
        )}
      </div>

      {/* Prisoner Opinion */}
      <div className="space-y-2">
        <Label htmlFor="prisoner_opinion">Prisoner Opinion</Label>
        <Textarea
          id="prisoner_opinion"
          value={formData.prisoner_opinion}
          onChange={(e) => handleInputChange('prisoner_opinion', e.target.value)}
          placeholder="Enter prisoner's opinion about the programme..."
          rows={3}
          disabled={isDisabled}
        />
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => handleInputChange('comment', e.target.value)}
          placeholder="Enter any additional comments..."
          rows={3}
          disabled={isDisabled}
        />
      </div>

      {/* Form Actions */}
      {mode !== 'view' && (
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }} className="text-white">
            {mode === 'create' ? 'Create Enrollment' : 'Update Enrollment'}
          </Button>
        </div>
      )}

      {mode === 'view' && (
        <div className="flex justify-end pt-4">
          <Button type="button" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}
    </form>
  );
};

export default RehabilitationEnrollmentForm;

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
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
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { CalendarIcon, Search, X, UserPlus, Users, ChevronsUpDown, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface StageAssignment {
  id: string;
  prisoner_name: string;
  prisoner_number: string;
  stage_name: string;
  start_date: string;
  end_date: string | null;
  remark: string;
  prisoner: string;
  stage: string;
}

interface StageAssignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageAssignment?: StageAssignment | null;
  onSuccess: () => void;
}

interface Prisoner {
  id: string;
  prisoner_number: string;
  full_name: string;
}

interface Stage {
  id: string;
  name: string;
  description: string;
}

export function StageAssignForm({
  open,
  onOpenChange,
  stageAssignment,
  onSuccess,
}: StageAssignFormProps) {
  const [loading, setLoading] = useState(false);
  const [searchingPrisoner, setSearchingPrisoner] = useState(false);
  const [prisonerSearch, setPrisonerSearch] = useState('');
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [allPrisoners, setAllPrisoners] = useState<Prisoner[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [prisonerDropdownOpen, setPrisonerDropdownOpen] = useState(false);

  // Form fields
  const [selectedPrisoners, setSelectedPrisoners] = useState<Prisoner[]>([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [remark, setRemark] = useState('');

  // Load stages and prisoners on mount
  useEffect(() => {
    if (open) {
      loadStages();
      loadAllPrisoners();
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (stageAssignment && open) {
      setSelectedPrisoners([{
        id: stageAssignment.prisoner,
        prisoner_number: stageAssignment.prisoner_number,
        full_name: stageAssignment.prisoner_name,
      }]);
      setSelectedStage(stageAssignment.stage);
      setStartDate(new Date(stageAssignment.start_date));
      setEndDate(stageAssignment.end_date ? new Date(stageAssignment.end_date) : undefined);
      setRemark(stageAssignment.remark);
    } else if (open) {
      resetForm();
    }
  }, [stageAssignment, open]);

  const loadStages = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/system-administration/stages/');
      // const data = await response.json();
      // setStages(data.results);

      // Mock data
      setStages([
        {
          id: '1',
          name: 'Orientation Stage',
          description: 'Initial orientation for new prisoners',
        },
        {
          id: '2',
          name: 'Ordinary Stage',
          description: 'Standard classification stage',
        },
        {
          id: '3',
          name: 'Star Stage',
          description: 'Advanced stage for model prisoners',
        },
        {
          id: '4',
          name: 'Special Stage',
          description: 'Special classification stage',
        },
      ]);
    } catch (error) {
      console.error('Failed to load stages:', error);
      toast.error('Failed to load stages');
    }
  };

  const loadAllPrisoners = async () => {
    try {
      setSearchingPrisoner(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/admission/api/prisoner-records/');
      // const data = await response.json();
      // setAllPrisoners(data.results);

      // Mock data - expanded list for demonstration
      const mockPrisoners: Prisoner[] = [
        { id: '1', prisoner_number: 'P-2024-001', full_name: 'John Doe' },
        { id: '2', prisoner_number: 'P-2024-002', full_name: 'Jane Smith' },
        { id: '3', prisoner_number: 'P-2024-003', full_name: 'Robert Johnson' },
        { id: '4', prisoner_number: 'P-2024-004', full_name: 'Mary Williams' },
        { id: '5', prisoner_number: 'P-2024-005', full_name: 'James Brown' },
        { id: '6', prisoner_number: 'P-2024-006', full_name: 'Patricia Davis' },
        { id: '7', prisoner_number: 'P-2024-007', full_name: 'Michael Miller' },
        { id: '8', prisoner_number: 'P-2024-008', full_name: 'Linda Wilson' },
        { id: '9', prisoner_number: 'P-2024-009', full_name: 'David Moore' },
        { id: '10', prisoner_number: 'P-2024-010', full_name: 'Elizabeth Taylor' },
        { id: '11', prisoner_number: 'P-2024-011', full_name: 'Richard Anderson' },
        { id: '12', prisoner_number: 'P-2024-012', full_name: 'Sarah Thomas' },
        { id: '13', prisoner_number: 'P-2024-013', full_name: 'Joseph Jackson' },
        { id: '14', prisoner_number: 'P-2024-014', full_name: 'Nancy White' },
        { id: '15', prisoner_number: 'P-2024-015', full_name: 'Thomas Harris' },
        { id: '16', prisoner_number: 'P-2024-016', full_name: 'Charles Martin' },
        { id: '17', prisoner_number: 'P-2024-017', full_name: 'Barbara Thompson' },
        { id: '18', prisoner_number: 'P-2024-018', full_name: 'Daniel Garcia' },
        { id: '19', prisoner_number: 'P-2024-019', full_name: 'Susan Martinez' },
        { id: '20', prisoner_number: 'P-2024-020', full_name: 'Matthew Robinson' },
        { id: '21', prisoner_number: 'P-2024-021', full_name: 'Jessica Clark' },
        { id: '22', prisoner_number: 'P-2024-022', full_name: 'Christopher Rodriguez' },
        { id: '23', prisoner_number: 'P-2024-023', full_name: 'Ashley Lewis' },
        { id: '24', prisoner_number: 'P-2024-024', full_name: 'Andrew Lee' },
        { id: '25', prisoner_number: 'P-2024-025', full_name: 'Amanda Walker' },
      ];

      setAllPrisoners(mockPrisoners);
      setPrisoners(mockPrisoners);
    } catch (error) {
      console.error('Failed to load prisoners:', error);
      toast.error('Failed to load prisoners');
    } finally {
      setSearchingPrisoner(false);
    }
  };



  const handleAddPrisoner = (prisoner: Prisoner) => {
    // Check if prisoner is already selected
    if (selectedPrisoners.some((p) => p.id === prisoner.id)) {
      toast.error('Prisoner already selected');
      return;
    }

    setSelectedPrisoners([...selectedPrisoners, prisoner]);
    setPrisonerSearch('');
    setPrisoners([]);
    setShowPrisonerDropdown(false);
    toast.success(`Added ${prisoner.full_name}`);
  };

  const handleRemovePrisoner = (prisonerId: string) => {
    setSelectedPrisoners(selectedPrisoners.filter((p) => p.id !== prisonerId));
  };

  const resetForm = () => {
    setSelectedPrisoners([]);
    setSelectedStage('');
    setStartDate(undefined);
    setEndDate(undefined);
    setRemark('');
    setPrisonerSearch('');
    setPrisoners(allPrisoners);
    setPrisonerDropdownOpen(false);
  };

  const validateForm = () => {
    if (selectedPrisoners.length === 0) {
      toast.error('Please select at least one prisoner');
      return false;
    }
    if (!selectedStage) {
      toast.error('Please select a stage');
      return false;
    }
    if (!startDate) {
      toast.error('Please select a start date');
      return false;
    }
    if (endDate && endDate < startDate) {
      toast.error('End date cannot be before start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (stageAssignment) {
        // Update existing stage assignment (single prisoner)
        const payload = {
          prisoner: selectedPrisoners[0].id,
          stage: selectedStage,
          start_date: format(startDate!, 'yyyy-MM-dd'),
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          remark: remark,
        };

        // TODO: Replace with actual API call
        // const response = await fetch(`/api/stage-management/prisoner-stages/${stageAssignment.id}/`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload),
        // });
        // if (!response.ok) throw new Error('Failed to update stage assignment');

        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Stage assignment updated successfully');
      } else {
        // Create new stage assignments (multiple prisoners)
        const assignments = selectedPrisoners.map((prisoner) => ({
          prisoner: prisoner.id,
          stage: selectedStage,
          start_date: format(startDate!, 'yyyy-MM-dd'),
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          remark: remark,
        }));

        // TODO: Replace with actual API call for batch creation
        // const response = await fetch('/api/stage-management/prisoner-stages/bulk/', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ assignments }),
        // });
        // if (!response.ok) throw new Error('Failed to create stage assignments');

        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success(`Stage assigned to ${selectedPrisoners.length} prisoner(s) successfully`);
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving stage assignment:', error);
      toast.error(
        stageAssignment
          ? 'Failed to update stage assignment'
          : 'Failed to create stage assignments'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
            {stageAssignment ? 'Edit Stage Assignment' : 'Assign Prisoner Stage'}
          </DialogTitle>
          <DialogDescription>
            {stageAssignment
              ? 'Update the prisoner stage assignment details'
              : 'Assign a progressive stage to one or multiple prisoners'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prisoner Selection */}
          <div className="space-y-2">
            <Label htmlFor="prisoner">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Search & Select Prisoners *
              </div>
            </Label>
            
            {/* Searchable Dropdown using Command */}
            <Popover open={prisonerDropdownOpen} onOpenChange={setPrisonerDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={prisonerDropdownOpen}
                  className="w-full justify-between"
                  disabled={!!stageAssignment}
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Search by name or prisoner number...
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[800px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Type to search prisoners..." 
                    value={prisonerSearch}
                    onValueChange={setPrisonerSearch}
                  />
                  <CommandList className="max-h-[400px] overflow-y-auto">
                    <CommandEmpty>
                      {searchingPrisoner ? 'Searching...' : 'No prisoners found.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {allPrisoners
                        .filter((prisoner) => {
                          if (!prisonerSearch) return true;
                          const searchLower = prisonerSearch.toLowerCase();
                          return (
                            prisoner.full_name.toLowerCase().includes(searchLower) ||
                            prisoner.prisoner_number.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((prisoner) => {
                          const isSelected = selectedPrisoners.some((p) => p.id === prisoner.id);
                          return (
                            <CommandItem
                              key={prisoner.id}
                              value={prisoner.id}
                              onSelect={() => {
                                handleAddPrisoner(prisoner);
                              }}
                              disabled={isSelected}
                              className={isSelected ? 'opacity-50' : ''}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <Check
                                    className={`h-4 w-4 ${
                                      isSelected ? 'opacity-100' : 'opacity-0'
                                    }`}
                                  />
                                  <div>
                                    <p className="font-medium">{prisoner.full_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {prisoner.prisoner_number}
                                    </p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Prisoners List - 3 Column Grid */}
            {selectedPrisoners.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Selected Prisoners ({selectedPrisoners.length})
                  </Label>
                  {!stageAssignment && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPrisoners([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                <ScrollArea className="h-[300px] border rounded-md p-4" type="always">
                  <div className="grid grid-cols-3 gap-3">
                    {selectedPrisoners.map((prisoner) => (
                      <div
                        key={prisoner.id}
                        className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors relative group"
                      >
                        <div className="pr-6">
                          <p className="font-medium text-sm truncate" title={prisoner.full_name}>
                            {prisoner.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" title={prisoner.prisoner_number}>
                            {prisoner.prisoner_number}
                          </p>
                        </div>
                        {!stageAssignment && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemovePrisoner(prisoner.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Stage Selection */}
          <div className="space-y-2">
            <Label htmlFor="stage">Stage *</Label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Remark */}
          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Textarea
              id="remark"
              placeholder="Enter any additional remarks..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
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
              disabled={loading}
              style={{ backgroundColor: '#650000' }}
              className="text-white hover:opacity-90"
            >
              {loading 
                ? 'Saving...' 
                : stageAssignment 
                  ? 'Update' 
                  : `Assign to ${selectedPrisoners.length} Prisoner(s)`
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

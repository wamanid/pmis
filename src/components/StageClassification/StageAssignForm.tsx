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
import { format} from 'date-fns';
import { toast } from 'sonner';
import { PrisonerRecord } from '../../models/gate/Index';
import { getprisoners } from '../../services/gateService';
import { getStages, submitStageData, updateStageData } from '../../services/stageService';
import { Prisoner } from '../../models/gate/Prisoner';
import { Stage, StageAssignmentPost } from '../../models/StageClassification';

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
  const [startDate, setStartDate] = useState<String>('');
  const [endDate, setEndDate] = useState<String>('');
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

     // alert(new Date(stageAssignment.start_date)).;
      setSelectedPrisoners([{
        id: stageAssignment.prisoner,
        prisoner_number: stageAssignment.prisoner_number,
        prisoner_name: stageAssignment.prisoner_name,
      }]);
      setSelectedStage(stageAssignment.stage);
     setStartDate(stageAssignment.start_date);
     setEndDate(stageAssignment.end_date ? stageAssignment.end_date : undefined);
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
        let stages: Stage[] = [
      ];

      //get stages
       getStages().then((data) => {
       // alert(JSON.stringify(data));
         stages = data.results;
         setStages(stages);
      }).catch((error) => {
        alert(error);

      });

      setStages(stages);
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
      let mockPrisoners: Prisoner[] = [];
        getprisoners().then((data) => {
         mockPrisoners = data.results;
          setAllPrisoners(mockPrisoners);
      setPrisoners(mockPrisoners);
    //alert(JSON.stringify(data.results));
       
      }).catch((error) => {
        alert(error);

      });
     
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
    toast.success(`Added ${prisoner.prisoner_name}`);
  };

  const handleRemovePrisoner = (prisonerId: string) => {
    setSelectedPrisoners(selectedPrisoners.filter((p) => p.id !== prisonerId));
  };

  const resetForm = () => {
    setSelectedPrisoners([]);
    setSelectedStage('');
    setStartDate('');
    setEndDate('');
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
          start_date: startDate!,
          end_date: endDate ,
          remark: remark,
          id:stageAssignment.id
        };
      updateStageData(payload).then((data) => {
     toast.success('Stage assignment updated successfully');
    onOpenChange(false);
      }).catch((error) => {
        alert(error);

      });


       
      } else {
        // Create new stage assignments (multiple prisoners)
        const assignments = selectedPrisoners.map((prisoner) => ({
          id: prisoner.id,
         
        }));

        let dataToPost:StageAssignmentPost={
            id:"",
          stage: selectedStage,
          start_date: startDate,
          end_date: endDate ,
          remark: remark,
          prisoners:assignments,
          prisoner:assignments[0].id,
          status:"0996439c-24cc-453e-87e4-1936a3e52820"
        };
       //alert(JSON.stringify(dataToPost));
     submitStageData(dataToPost).then((data) => {
      // alert(JSON.stringify(data));
    toast.success(`Stage assigned to ${selectedPrisoners.length} prisoner(s) successfully`);
    onOpenChange(false);
      }).catch((error) => {
        alert(error);

      });

       // await new Promise((resolve) => setTimeout(resolve, 500));
      }
     //onSuccess();
     
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
                            prisoner.prisoner_number_value.toLowerCase().includes(searchLower)
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
                                      {prisoner.prisoner_number_value}
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
                            {prisoner.full_name===""?"N/A":prisoner.full_name}
                             {prisoner.prisoner_name}
                           
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
          <Label>
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
               setStartDate(e.target.value);
            }}
            
          />
        </div>

<div className="space-y-2">
          <Label>
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
               setEndDate(e.target.value);
            }}
            
          />
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
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, Check, Calendar as CalendarIcon, ScanBarcode } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

interface PrisonerOffencePair {
  id: string;
  prisoner: string;
  prisoner_name: string;
  offence: string;
  offence_name: string;
}

interface BulkScheduleData {
  court_detail: string;
  station: string;
  court_attendance_type: string;
  scheduled_date: string;
  scheduled_time: string;
  presiding_judge: string;
  prisoner_offence_pairs: PrisonerOffencePair[];
}

// Mock data for dropdowns
const mockCourts = [
  { id: '1', name: 'High Court Kampala' },
  { id: '2', name: 'Chief Magistrates Court Kampala' },
  { id: '3', name: 'Magistrates Court Entebbe' },
  { id: '4', name: 'High Court Jinja' },
  { id: '5', name: 'Chief Magistrates Court Mbarara' },
  { id: '6', name: 'Magistrates Court Gulu' },
  { id: '7', name: 'High Court Mbale' },
];

const mockStations = [
  { id: '1', name: 'Luzira Prison' },
  { id: '2', name: 'Kigo Prison' },
  { id: '3', name: 'Jinja Main Prison' },
  { id: '4', name: 'Mbarara Prison' },
  { id: '5', name: 'Fort Portal Prison' },
  { id: '6', name: 'Gulu Prison' },
  { id: '7', name: 'Mbale Prison' },
];

const mockAttendanceTypes = [
  { id: '1', name: 'Hearing' },
  { id: '2', name: 'Mention' },
  { id: '3', name: 'Sentencing' },
  { id: '4', name: 'Bail Application' },
  { id: '5', name: 'Judgment' },
  { id: '6', name: 'Plea Bargain' },
  { id: '7', name: 'Pre-Trial Conference' },
];

const mockPrisoners = [
  { id: '1', name: 'John Doe - PR001' },
  { id: '2', name: 'Jane Smith - PR002' },
  { id: '3', name: 'Michael Johnson - PR003' },
  { id: '4', name: 'Emily Davis - PR004' },
  { id: '5', name: 'Robert Lee - PR005' },
  { id: '6', name: 'Sarah Williams - PR006' },
  { id: '7', name: 'David Brown - PR007' },
  { id: '8', name: 'Mary Wilson - PR008' },
  { id: '9', name: 'James Anderson - PR009' },
  { id: '10', name: 'Patricia Martinez - PR010' },
];

const mockOffences = [
  { id: '1', name: 'Theft' },
  { id: '2', name: 'Assault' },
  { id: '3', name: 'Murder' },
  { id: '4', name: 'Robbery' },
  { id: '5', name: 'Fraud' },
  { id: '6', name: 'Drug Trafficking' },
  { id: '7', name: 'Burglary' },
  { id: '8', name: 'Manslaughter' },
  { id: '9', name: 'Embezzlement' },
  { id: '10', name: 'Kidnapping' },
];

// Searchable Combobox Component
interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
  emptyText?: string;
}

const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder,
  emptyText = 'No results found.',
}) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => option.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedOption ? selectedOption.name : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const BulkCourtScheduleForm: React.FC = () => {
  const [formData, setFormData] = useState<BulkScheduleData>({
    court_detail: '',
    station: '',
    court_attendance_type: '',
    scheduled_date: '',
    scheduled_time: '',
    presiding_judge: '',
    prisoner_offence_pairs: [],
  });

  const [currentPair, setCurrentPair] = useState({
    prisoner: '',
    prisoner_name: '',
    offence: '',
    offence_name: '',
  });

  // Collapsible section states
  const [section1Collapsed, setSection1Collapsed] = useState(false);
  const [section2Collapsed, setSection2Collapsed] = useState(false);
  const [section3Collapsed, setSection3Collapsed] = useState(false);

  const handleInputChange = (field: keyof BulkScheduleData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddPair = () => {
    if (!currentPair.prisoner || !currentPair.offence) {
      toast.error('Please select both prisoner and offence');
      return;
    }

    // Check if this prisoner-offence pair already exists
    const exists = formData.prisoner_offence_pairs.some(
      (pair) => pair.prisoner === currentPair.prisoner && pair.offence === currentPair.offence
    );

    if (exists) {
      toast.error('This prisoner-offence pair already exists');
      return;
    }

    const newPair: PrisonerOffencePair = {
      id: `${Date.now()}`,
      ...currentPair,
    };

    setFormData((prev) => ({
      ...prev,
      prisoner_offence_pairs: [...prev.prisoner_offence_pairs, newPair],
    }));

    // Reset current pair
    setCurrentPair({
      prisoner: '',
      prisoner_name: '',
      offence: '',
      offence_name: '',
    });

    toast.success('Prisoner-Offence pair added successfully');
  };

  const handleRemovePair = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      prisoner_offence_pairs: prev.prisoner_offence_pairs.filter((pair) => pair.id !== id),
    }));
    toast.success('Pair removed successfully');
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.court_detail) {
      toast.error('Please select a court');
      return;
    }
    if (!formData.station) {
      toast.error('Please select a station');
      return;
    }
    if (!formData.court_attendance_type) {
      toast.error('Please select an attendance type');
      return;
    }
    if (!formData.scheduled_date) {
      toast.error('Please select a scheduled date');
      return;
    }
    if (!formData.scheduled_time) {
      toast.error('Please select a scheduled time');
      return;
    }
    if (!formData.presiding_judge) {
      toast.error('Please enter presiding judge name');
      return;
    }
    if (formData.prisoner_offence_pairs.length === 0) {
      toast.error('Please add at least one prisoner-offence pair');
      return;
    }

    // Here you would make the API call to bulk schedule
    console.log('Bulk Schedule Data:', formData);
    toast.success(`Successfully scheduled ${formData.prisoner_offence_pairs.length} court appearances`);

    // Reset form
    setFormData({
      court_detail: '',
      station: '',
      court_attendance_type: '',
      scheduled_date: '',
      scheduled_time: '',
      presiding_judge: '',
      prisoner_offence_pairs: [],
    });
  };

  const handleReset = () => {
    setFormData({
      court_detail: '',
      station: '',
      court_attendance_type: '',
      scheduled_date: '',
      scheduled_time: '',
      presiding_judge: '',
      prisoner_offence_pairs: [],
    });
    setCurrentPair({
      prisoner: '',
      prisoner_name: '',
      offence: '',
      offence_name: '',
    });
    toast.info('Form reset');
  };

  const handleBarcodeScan = () => {
    // Simulate barcode scanning
    // In a real implementation, this would interface with a barcode scanner device
    toast.info('Barcode scanner activated. Please scan prisoner barcode...');
    
    // Mock: Simulate scanning a barcode after 1.5 seconds
    setTimeout(() => {
      // Randomly select a prisoner to simulate barcode scan
      const randomPrisoner = mockPrisoners[Math.floor(Math.random() * mockPrisoners.length)];
      setCurrentPair((prev) => ({
        ...prev,
        prisoner: randomPrisoner.id,
        prisoner_name: randomPrisoner.name,
      }));
      toast.success(`Prisoner scanned: ${randomPrisoner.name}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Court, Station, and Attendance Type */}
      <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#650000' }}
          onClick={() => setSection1Collapsed(!section1Collapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white">Court, Station & Attendance Details</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setSection1Collapsed(!section1Collapsed);
              }}
            >
              {section1Collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!section1Collapsed && (
          <CardContent className="pt-6 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="court_detail">Court Name *</Label>
                <Combobox
                  value={formData.court_detail}
                  onChange={(value) => handleInputChange('court_detail', value)}
                  options={mockCourts}
                  placeholder="Select court"
                  emptyText="No court found."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="station">Station Name *</Label>
                <Combobox
                  value={formData.station}
                  onChange={(value) => handleInputChange('station', value)}
                  options={mockStations}
                  placeholder="Select station"
                  emptyText="No station found."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="court_attendance_type">Attendance Type *</Label>
                <Combobox
                  value={formData.court_attendance_type}
                  onChange={(value) => handleInputChange('court_attendance_type', value)}
                  options={mockAttendanceTypes}
                  placeholder="Select type"
                  emptyText="No attendance type found."
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 2: Date, Time, and Judge */}
      <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#650000' }}
          onClick={() => setSection2Collapsed(!section2Collapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <CalendarIcon className="h-4 w-4" />
              Schedule Information
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setSection2Collapsed(!section2Collapsed);
              }}
            >
              {section2Collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!section2Collapsed && (
          <CardContent className="pt-6 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_time">Scheduled Time *</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="presiding_judge">Presiding Judge *</Label>
                <Input
                  id="presiding_judge"
                  type="text"
                  placeholder="Enter judge name..."
                  value={formData.presiding_judge}
                  onChange={(e) => handleInputChange('presiding_judge', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 3: Prisoner-Offence Pairs */}
      <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#650000' }}
          onClick={() => setSection3Collapsed(!section3Collapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <CalendarIcon className="h-4 w-4" />
              Prisoner-Offence Selection
              {formData.prisoner_offence_pairs.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white text-[#650000] rounded-full text-sm">
                  {formData.prisoner_offence_pairs.length}
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                setSection3Collapsed(!section3Collapsed);
              }}
            >
              {section3Collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!section3Collapsed && (
          <CardContent className="pt-6 space-y-4 bg-gray-50/50">
            {/* Add Pair Form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
              <div className="md:col-span-4 space-y-2">
                <Label htmlFor="prisoner">Select Prisoner *</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Combobox
                      value={currentPair.prisoner}
                      onChange={(value) => {
                        const prisoner = mockPrisoners.find((p) => p.id === value);
                        setCurrentPair((prev) => ({
                          ...prev,
                          prisoner: value,
                          prisoner_name: prisoner?.name || '',
                        }));
                      }}
                      options={mockPrisoners}
                      placeholder="Select prisoner"
                      emptyText="No prisoner found."
                    />
                  </div>
                  <Button
                    onClick={handleBarcodeScan}
                    variant="outline"
                    size="icon"
                    className="shrink-0 border-2"
                    style={{ borderColor: '#650000' }}
                    title="Scan Prisoner Barcode"
                  >
                    <ScanBarcode className="h-4 w-4" style={{ color: '#650000' }} />
                  </Button>
                </div>
              </div>

              <div className="md:col-span-4 space-y-2">
                <Label htmlFor="offence">Select Offence *</Label>
                <Combobox
                  value={currentPair.offence}
                  onChange={(value) => {
                    const offence = mockOffences.find((o) => o.id === value);
                    setCurrentPair((prev) => ({
                      ...prev,
                      offence: value,
                      offence_name: offence?.name || '',
                    }));
                  }}
                  options={mockOffences}
                  placeholder="Select offence"
                  emptyText="No offence found."
                />
              </div>

              <div className="md:col-span-4 flex items-end">
                <Button
                  onClick={handleAddPair}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white hover:opacity-90 w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pair
                </Button>
              </div>
            </div>

            {/* Pairs Table */}
            {formData.prisoner_offence_pairs.length > 0 && (
              <div className="border-2 rounded-lg overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow style={{ backgroundColor: '#650000' }}>
                      <TableHead className="w-12 text-white">#</TableHead>
                      <TableHead className="text-white">Prisoner</TableHead>
                      <TableHead className="text-white">Offence</TableHead>
                      <TableHead className="w-20 text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.prisoner_offence_pairs.map((pair, index) => (
                      <TableRow key={pair.id} className="hover:bg-gray-50 bg-white">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{pair.prisoner_name}</TableCell>
                        <TableCell>{pair.offence_name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePair(pair.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {formData.prisoner_offence_pairs.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg bg-white">
                No prisoner-offence pairs added yet. Use the form above to add pairs.
              </div>
            )}

            {formData.prisoner_offence_pairs.length > 0 && (
              <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border-2 border-gray-200">
                <span className="font-semibold">Total pairs to schedule:</span>{' '}
                <span style={{ color: '#650000' }} className="font-bold text-lg">
                  {formData.prisoner_offence_pairs.length}
                </span>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={handleReset} className="border-2">
          <X className="h-4 w-4 mr-2" />
          Reset Form
        </Button>
        <Button
          onClick={handleSubmit}
          style={{ backgroundColor: '#650000' }}
          className="text-white hover:opacity-90 shadow-md"
        >
          <Save className="h-4 w-4 mr-2" />
          Schedule All Appearances
        </Button>
      </div>
    </div>
  );
};

export default BulkCourtScheduleForm;
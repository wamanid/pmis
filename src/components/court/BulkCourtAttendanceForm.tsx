import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Calendar as CalendarIcon, 
  ScanBarcode,
  Upload,
  FileText
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';
import { BulkAttendanceData, Courts } from '../../models/court';
import { bulkattendance, getAppeals, getAttendacetypes, getCourtDetails, getOffencesPersonal, getOutcomes,
   getprisonerAppeals, getScheduleList, getStations } from '../../services/courtService';
import { getprisonergatepass, getprisoners } from '../../services/gateService';
import { OffenceRequest } from '../../models/StageClassification';
import { fileToBase64, unicodeToBase64 } from '../../utils/Util';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';



// Searchable Combobox Component
interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  placeholder: string;
  emptyText?: string;
  disabled?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder,
  emptyText = 'No results found.',
  disabled = false,
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
          disabled={disabled}
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

const BulkCourtAttendanceForm: React.FC = () => {
  const [formData, setFormData] = useState<BulkAttendanceData>({
    court: '',
    court_attendance_type: '',
    attendance_datetime: '',
    case_outcome: '',
    appeal: '',
    gate_pass_number: '',
    remarks: '',
    production_warrant: null,
    criminal_case_number: '',
    legal_proceedings: '',
    schedule: '',
    prisoner_offence_pairs: [],
  });

  const [currentPair, setCurrentPair] = useState({
    prisoner: '',
    prisoner_name: '',
    offence: '',
    offence_name: '',
    legal_proceedings:'',
    remarks:'',
    gate_pass_number:''
  });

    const [mockGatePasses, setMockGatePasses] = useState<any[]>([]);
               

  // Collapsible section states
  const [section1Collapsed, setSection1Collapsed] = useState(false);
  const [section2Collapsed, setSection2Collapsed] = useState(false);
  const [section3Collapsed, setSection3Collapsed] = useState(false);


  const [fileName, setFileName] = useState<string>('');

 const [mockCourts, setCourts] = useState<Courts[]>([]);
        const [mockAttendanceTypes, setAttendancetypes] = useState<any[]>([]);
           const [mockPrisoners, setMockPrisoners] = useState<any[]>([]);
  const [mockCaseOutcomes, setOutcomes] = useState<any[]>([]);
    const [mockAppeals, setMockAppeals] = useState<any[]>([]);
                     const [mockOffences, setOffences] = useState<any[]>([]);
                        const [mockSchedules, setSchedules] = useState<any[]>([]);


    useEffect(() => {


           getAppeals().then((data) => {
            //alert(JSON.stringify(data.results));
                  setMockAppeals(data.results);
                }).catch((error) => {
                 alert(error);
                });
      

      getAttendacetypes().then((data) => {
             setAttendancetypes(data.results);
          }).catch((error) => {
            alert(error);
          });
         
          
       getScheduleList().then((data) => {
       // alert(JSON.stringify(data.results));
          setSchedules(data.results);
          }).catch((error) => {
            alert(error);
          });
     
          getOutcomes().then((data) => {
          setOutcomes(data.results);
          }).catch((error) => {
            alert(error);
          });

          getCourtDetails().then((data) => {
         // alert(JSON.stringify(data.results));
          setCourts(data.results);
        }).catch((error) => {
          alert(error);
        });
  
  
  

  
             getprisoners().then((data) => {
             // alert(JSON.stringify(data.results));
                   setMockPrisoners(data.results);
                }).catch((error) => {
                  alert(error);
                });
  
  
      }, []);

  const handleInputChange = (field: keyof BulkAttendanceData, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type (JPEG only as per API spec)
      const validTypes = ['image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a JPEG image file');


        return;
      }
      setFormData((prev) => ({
        ...prev,
        production_warrant: file,
      }));
      setFileName(file.name);
      toast.success('Production warrant uploaded');
    }
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
      legal_proceedings:'',
      remarks:''
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

  const handleBarcodeScan = () => {
    // Simulate barcode scanning
    toast.info('Barcode scanner activated. Please scan prisoner barcode...');
    
    // Mock: Simulate scanning a barcode after 1.5 seconds
    setTimeout(() => {
      const randomPrisoner = mockPrisoners[Math.floor(Math.random() * mockPrisoners.length)];
      setCurrentPair((prev) => ({
        ...prev,
        prisoner: randomPrisoner.id,
        prisoner_name: randomPrisoner.name,
      }));
      toast.success(`Prisoner scanned: ${randomPrisoner.name}`);
    }, 1500);
  };

const handleSubmit = async () => {
  // Validation
  if (!formData.court) {
    toast.error('Please select a court');
    return;
  }
  if (!formData.court_attendance_type) {
    toast.error('Please select an attendance type');
    return;
  }
  if (!formData.attendance_datetime) {
    toast.error('Please select attendance date and time');
    return;
  }
  if (formData.prisoner_offence_pairs.length === 0) {
    toast.error('Please add at least one prisoner-offence pair');
    return;
  }

  let dataToPost={};

  try {

     const warrantBase64 = formData.production_warrant 
      ? unicodeToBase64(await fileToBase64(formData.production_warrant))
      : '';


    

    const prisoners = formData.prisoner_offence_pairs.map((pair) => ({
      prisoner: pair.prisoner,
      offence: pair.offence,
      legal_proceedings:pair.legal_proceedings,
      remarks:formData.remarks,
      court:formData.court,
      court_attendance_type:formData.court_attendance_type,
      attendance_datetime:formData.attendance_datetime,
      case_outcome:formData.case_outcome,
      appeal:formData.appeal,
      gate_pass_number:pair.gate_pass_number,
      production_warrant: warrantBase64,
      criminal_case_number:formData.criminal_case_number,
    }));

    dataToPost={records:prisoners,};
    //alert(JSON.stringify(dataToPost));
     bulkattendance(dataToPost).then((data) => {
    console.log('Bulk Attendance Data:', formData);
    toast.success(`Successfully recorded attendance for ${formData.prisoner_offence_pairs.length} prisoner(s)`);
    handleReset();
     }).catch((error) => {
 toast.error(error);
   
     });
   

  } catch (error) {
    toast.error('Failed to record attendance');
    console.error(error);
  }
};

  const handleReset = () => {
    setFormData({
      court: '',
      court_attendance_type: '',
      attendance_datetime: '',
      case_outcome: '',
      appeal: '',
      gate_pass_number: '',
      remarks: '',
      production_warrant: null,
      criminal_case_number: '',
      legal_proceedings: '',
      schedule: '',
      prisoner_offence_pairs: [],
    });
    setCurrentPair({
      prisoner: '',
      prisoner_name: '',
      offence: '',
      offence_name: '',
      legal_proceedings:'',
      remarks:'',
      gate_pass_number: ''

    });
    setFileName('');
    toast.info('Form reset');
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Primary Information */}
      <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#650000' }}
          onClick={() => setSection1Collapsed(!section1Collapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <CalendarIcon className="h-4 w-4" />
              Court & Attendance Information
            </CardTitle>
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
                <Label htmlFor="court">Court Name *</Label>
                <Combobox
                  value={formData.court}
                  onChange={(value) => handleInputChange('court', value)}
                  options={mockCourts}
                  placeholder="Select court"
                  emptyText="No court found."
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

              <div className="space-y-2">
                <Label htmlFor="attendance_datetime">Attendance Date & Time *</Label>
                <Input
                  id="attendance_datetime"
                  type="datetime-local"
                  value={formData.attendance_datetime}
                  onChange={(e) => handleInputChange('attendance_datetime', e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 2: Additional Details */}
      <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#650000' }}
          onClick={() => setSection2Collapsed(!section2Collapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Additional Case Details
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Combobox
                  value={formData.schedule}
                  onChange={(value) => handleInputChange('schedule', value)}
                    options={mockSchedules.map((p) => ({ id: p.id, name: p.offence_name+" "+p.created_datetime }))}
                  placeholder="Select schedule"
                  emptyText="No schedule found."
                />
              </div>

            

              <div className="space-y-2">
                <Label htmlFor="appeal">Appeal</Label>
                <Combobox
                  value={formData.appeal}
                  onChange={(value) => handleInputChange('appeal', value)}
               
                  options={mockAppeals.map((p) => ({ id: p.id, name: p.appeal_number }))}
                 

                  
                  placeholder="Select appeal status"
                  emptyText="No appeal status found."
                />
              </div>

              

              <div className="space-y-2">
                <Label htmlFor="criminal_case_number">Criminal Case Number</Label>
                <Input
                  id="criminal_case_number"
                  type="text"
                  placeholder="Enter case number..."
                  value={formData.criminal_case_number}
                  onChange={(e) => handleInputChange('criminal_case_number', e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="production_warrant">Production Warrant (JPEG)</Label>
                <div className="flex gap-2">
                  <Input
                    id="production_warrant"
                    type="file"
                    accept="image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="bg-white hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('production_warrant')?.click()}
                    className="w-full justify-start"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {fileName || 'Choose file...'}
                  </Button>
                </div>
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
            <div className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">



   <div className="md:col-span-4 space-y-2">
    
                <Label htmlFor="case_outcome">Case Outcome</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                <Combobox
                  value={formData.case_outcome}
                  onChange={(value) => handleInputChange('case_outcome', value)}
                  options={mockCaseOutcomes}
                  placeholder="Select outcome"
                  emptyText="No case outcome found."
                />
              </div>
              </div>
              </div>

                <div className="md:col-span-5 space-y-2">
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
                            prisoner_name: prisoner?.full_name || '',
                          }));


                           let datatopost:OffenceRequest={
                                      prisoner:value
                                    }

                          
                                     getOffencesPersonal(datatopost).then((data) => {
                                     // alert(JSON.stringify(data.results));
                                     setOffences(data.results); 
                                    }).catch((error) => {
                                     // alert(error);
                                    });


                                     getprisonergatepass(value).then((data) => {
                                                setMockGatePasses(data.results);
                                              }).catch((error) => {
                                               alert(error);
                                              });
                                    





                        }}
                       options={mockPrisoners.map((p) => ({ id: p.id, name: p.full_name }))}
                    
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

                <div className="md:col-span-5 space-y-2">
                  <Label htmlFor="offence">Select Offence *</Label>
                  <Combobox
                    value={currentPair.offence}
                    onChange={(value) => {
                      const offence = mockOffences.find((o) => o.id === value);
                      setCurrentPair((prev) => ({
                        ...prev,
                        offence: value,
                        offence_name: offence?.offence_name+" "+offence?.created_datetime || '',
                      }));
                    }}
                  
                     options={mockOffences.map((o) => ({ id: o.id, name: o.offence_name+" "+o.created_datetime }))}
                    
                    placeholder="Select offence"
                    emptyText="No offence found."
                  />
                </div>


 <div className="space-y-2">
                  <Label htmlFor="gate_pass">Gate Pass</Label>
                  <Select
                    value={formData.gate_pass_number}
                  //  onValueChange={(value) => setFormData({ ...formData, gate_pass: value })}

                        onValueChange={(value) => {
                          setFormData({ ...formData, gate_pass_number: value });
                      const offence = mockOffences.find((o) => o.id === value);
                      setCurrentPair((prev) => ({
                       ...prev,
                        remarks: prev.remarks,
                        prisoner: prev.prisoner,
                        prisoner_name: prev.prisoner_name,
                        offence: prev.offence,
                        offence_name: prev.offence_name,
                        legal_proceedings:prev.legal_proceedings,
                        gate_pass_number:value
                      }));
                    }}
                   
                  >
                    <SelectTrigger id="gate_pass">
                      <SelectValue placeholder="Select gate pass" />
                    </SelectTrigger>
                    <SelectContent>
                      
                      {mockGatePasses.map((pass) => (
                        <SelectItem key={pass.id} value={pass.id}>
                          {pass.gatepass_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

             {/*}
               <div className="space-y-2">
                <Label htmlFor="gate_pass_number">Gate Pass Number</Label>
                <Input
                  id="gate_pass_number"
                  type="text"
                  placeholder="Enter gate pass number..."
                  value={formData.gate_pass_number}
               //   onChange={(e) => handleInputChange('gate_pass_number', e.target.value)}

                     onChange={(e) => {
                      const offence = mockOffences.find((o) => o.id === value);
                      setCurrentPair((prev) => ({
                       ...prev,
                        remarks: prev.remarks,
                        prisoner: prev.prisoner,
                        prisoner_name: prev.prisoner_name,
                        offence: prev.offence,
                        offence_name: prev.offence_name,
                        legal_proceedings:prev.legal_proceedings,
                        gate_pass_number:e.target.value
                      }));
                    }}


                  className="bg-white"
                />
              </div>
             {*/}



                  <div className="space-y-2 md:col-span-2">
                <Label htmlFor="legal_proceedings">Legal Proceedings</Label>
                <Textarea
                  id="legal_proceedings"
                  placeholder="Enter legal proceedings details..."
                 value={currentPair.legal_proceedings}
                //  onChange={(e) => handleInputChange('legal_proceedings', e.target.value)}
                     onChange={(e) => {
                      setCurrentPair((prev) => ({
                        ...prev,
                        remarks: prev.remarks,
                        prisoner: prev.prisoner,
                        prisoner_name: prev.prisoner_name,
                        offence: prev.offence,
                        offence_name: prev.offence_name,
                        legal_proceedings:e.target.value
                      }));
                    }}
                    className="bg-white min-h-20"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Enter any additional remarks..."
                  value={currentPair.remarks}
                      onChange={(e) => {
                      setCurrentPair((prev) => ({
                        ...prev,
                        prisoner: prev.prisoner,
                        prisoner_name: prev.prisoner_name,
                        offence: prev.offence,
                        offence_name: prev.offence_name,
                        legal_proceedings:prev.legal_proceedings,
                        remarks:e.target.value
                      }));
                    }}
                  className="bg-white min-h-20"
                />
              </div>

                <div className="md:col-span-2">
                  <Button
                    onClick={handleAddPair}
                    style={{ backgroundColor: '#650000' }}
                    className="text-white hover:opacity-90 w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
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
                      <TableHead className="text-white">Legal Proceedings</TableHead>
                      <TableHead className="text-white">Remarks</TableHead>
                      <TableHead className="text-white">Gate Pass</TableHead>
                      
                      <TableHead className="w-20 text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.prisoner_offence_pairs.map((pair, index) => (
                      <TableRow key={pair.id} className="hover:bg-gray-50 bg-white">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{pair.prisoner_name}</TableCell>
                        <TableCell>{pair.offence_name}</TableCell>
                        <TableCell>{pair.legal_proceedings}</TableCell>
                        <TableCell>{pair.remarks}</TableCell>
                        <TableCell>{pair.gate_pass_number}</TableCell>

                        

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
                <span className="font-semibold">Total attendance records to create:</span>{' '}
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
          Record All Attendance
        </Button>
      </div>
    </div>
  );
};

export default BulkCourtAttendanceForm;
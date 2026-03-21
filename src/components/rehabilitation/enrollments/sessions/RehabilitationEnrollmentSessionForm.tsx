import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../ui/command';
import { Calendar } from '../../../ui/calendar';
import { toast } from 'sonner';
import { 
  Check, 
  ChevronsUpDown, 
  CalendarIcon,
  Clock
} from 'lucide-react';
import { cn } from '../../../ui/utils';
import {Enrollment, Session, SessionForm} from "../../../../services/rehabilitation";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {getEnrollmentList} from "../../../../services/rehabilitation/enrollments/enrollmentGetApis";
import {handleCatchError} from "../../../../services/stationServices/utils";

// interface EnrollmentSession {
//   id?: string;
//   prisoner_name?: string;
//   programme_name?: string;
//   session_date: string;
//   session_duration: number;
//   remarks: string;
//   enrollment: string;
// }

// interface Enrollment {
//   id: string;
//   prisoner_name: string;
//   programme_name: string;
//   prisoner_number?: string;
// }

interface RehabilitationEnrollmentSessionFormProps {
  session?: Session | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: Session) => void;
  onCancel: () => void;
  enrollments: Enrollment[]
  setEnrollments: Dispatch<SetStateAction<Enrollment[]>>;
}

const RehabilitationEnrollmentSessionForm: React.FC<RehabilitationEnrollmentSessionFormProps> = ({
  enrollments, setEnrollments,
  session,
  mode,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<SessionForm>({
    session_date: new Date().toISOString().split('T')[0],
    session_duration: 60,
    remarks: '',
    enrollment: '',
    is_active: true,
    deleted_datetime: null,
    deleted_by: null,
  });

  // Mock enrollments data
  // const [enrollments] = useState<Enrollment[]>([
  //   { id: '1', prisoner_name: 'John Doe', programme_name: 'Vocational Training', prisoner_number: 'PR-2024-001' },
  //   { id: '2', prisoner_name: 'Jane Smith', programme_name: 'Education Programme', prisoner_number: 'PR-2024-002' },
  //   { id: '3', prisoner_name: 'Michael Johnson', programme_name: 'Counseling Services', prisoner_number: 'PR-2024-003' },
  //   { id: '4', prisoner_name: 'Robert Williams', programme_name: 'Substance Abuse Recovery', prisoner_number: 'PR-2024-004' },
  //   { id: '5', prisoner_name: 'Mary Brown', programme_name: 'Vocational Training', prisoner_number: 'PR-2024-005' }
  // ]);

  const [openEnrollment, setOpenEnrollment] = useState(false);
  const [showSessionDate, setShowSessionDate] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(true);

  useEffect(() => {
    loadDropdownData();
  }, []);

  async function loadDropdownData () {
    try {
      // console.log(statuses)
      let enrollmentsOk = true

      if (!enrollments.length) {
        enrollmentsOk = await getEnrollmentList(setEnrollments)
      }

      if (enrollmentsOk) {
        setDataLoaded(false)
      }
      else {
        toast.error("Please make sure you have enrollments")
        onCancel()
      }
    }
    catch (error) {
      handleCatchError(error)
      onCancel()
    }
  }

  useEffect(() => {
    if (session) {
      setFormData({
        ...session,
        enrollment: session.enrollment || ''
      });
    }
  }, [session]);

  const handleInputChange = (field: keyof Session, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.enrollment) {
      toast.error('Please select an enrollment');
      return;
    }
    if (!formData.session_date) {
      toast.error('Please select session date');
      return;
    }
     if (!formData.remarks) {
      toast.error('Please enter some remarks');
      return;
    }
    if (!formData.session_duration || formData.session_duration <= 0) {
      toast.error('Please enter a valid session duration');
      return;
    }

    onSubmit(formData);
  };

  const isDisabled = mode === 'view';

  const selectedEnrollment = enrollments.find(e => e.id === formData.enrollment);

  return (
      <>
        {
          dataLoaded ? (
              <div className="size-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground text-sm">
                          Fetching additional information, Please wait...
                        </p>
                  </div>
              </div>
          ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Enrollment Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="enrollment">
                      Enrollment <span className="text-red-600">*</span>
                    </Label>
                    <Popover open={openEnrollment} onOpenChange={setOpenEnrollment}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openEnrollment}
                          className="w-full justify-between"
                          disabled={isDisabled}
                        >
                          {selectedEnrollment ? (
                            <span className="truncate">
                              {selectedEnrollment.prisoner_name} - {selectedEnrollment.programme_name}
                            </span>
                          ) : (
                            <span className="text-gray-500">Select enrollment...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[500px] p-0">
                        <Command>
                          <CommandInput placeholder="Search enrollment..." />
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No enrollment found.</CommandEmpty>
                            <CommandGroup>
                              {enrollments.map((enrollment) => (
                                <CommandItem
                                  key={enrollment.id}
                                  value={enrollment.id}
                                  onSelect={() => {
                                    handleInputChange('enrollment', enrollment.id);
                                    setOpenEnrollment(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.enrollment === enrollment.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span>{enrollment.prisoner_name}</span>
                                      {enrollment.prisoner_number && (
                                        <span className="text-sm text-gray-500">({enrollment.prisoner_number})</span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">{enrollment.programme_name}</div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Session Date */}
                  <div className="space-y-2">
                    <Label htmlFor="session_date">
                      Session Date <span className="text-red-600">*</span>
                    </Label>
                    <Popover open={showSessionDate} onOpenChange={setShowSessionDate}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left',
                            !formData.session_date && 'text-gray-500'
                          )}
                          disabled={isDisabled}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.session_date
                            ? new Date(formData.session_date).toLocaleDateString()
                            : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.session_date ? new Date(formData.session_date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              handleInputChange('session_date', date.toISOString().split('T')[0]);
                              setShowSessionDate(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Session Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="session_duration">
                      Session Duration (minutes) <span className="text-red-600">*</span>
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="session_duration"
                        type="number"
                        value={formData.session_duration}
                        onChange={(e) => handleInputChange('session_duration', parseInt(e.target.value) || 0)}
                        placeholder="Enter duration in minutes"
                        className="pl-10"
                        disabled={isDisabled}
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks <span className="text-red-600">*</span></Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    placeholder="Enter session remarks or notes..."
                    rows={4}
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
                      {mode === 'create' ? 'Create Session' : 'Update Session'}
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
          )
        }
      </>

  );
};

export default RehabilitationEnrollmentSessionForm;

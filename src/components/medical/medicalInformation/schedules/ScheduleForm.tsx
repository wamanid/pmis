import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Switch } from '../../../ui/switch';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { CalendarClock, Save, X, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { requiredValidation } from '../../../../utils/validation';
import { format } from 'date-fns';
import {CaseBook, NewSchedule} from "../../../../services/medical/medicalInformation/medical";
import {
  getBloodGroupList,
  getCasebookList,
  getPrisonersList
} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError} from "../../../../services/stationServices/utils";

interface Schedule {
  id?: string;
  prisoner_name?: string;
  case_book_display?: string;
  followup_date: string;
  attendance_status: boolean;
  notes: string;
  medical_case_book: string;
}

interface ScheduleFormProps {
  schedule?: Schedule | null;
  onSubmit: (schedule: Schedule) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  loader: boolean
  setLoader: React.Dispatch<React.SetStateAction<Boolean>>
  setNewDialogLoader: React.Dispatch<React.SetStateAction<Boolean>>
  caseBooks: CaseBook[];
  setCaseBooks: React.Dispatch<React.SetStateAction<CaseBook[]>>;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onSubmit, onCancel, mode, setCaseBooks, caseBooks, setNewDialogLoader, loader, setLoader }) => {
  const [formData, setFormData] = useState<NewSchedule>({
    followup_date: '',
    attendance_status: false,
    notes: '',
    medical_case_book: '',
    is_active: true,
    deleted_by: null,
    deleted_datetime: null
  });

  // const [caseBooks, setCaseBooks] = useState<any[]>([]);
  // const [loader, setLoader] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (schedule && dataLoaded) {
      setFormData(schedule);
    }
  }, [schedule, dataLoaded]);

  const loadDropdownData = async () => {
    try {
      let casebooksOk = true

      if (!caseBooks.length) {
        casebooksOk = await getCasebookList(setCaseBooks)
      }

      if (casebooksOk) {
        setDataLoaded(false)
      }
      else {
        toast.error("Please make sure you have case books")
        onCancel()
      }

    }
    catch (error) {
      handleCatchError(error)
    }
    // setCaseBooks([
    //   { id: '1', prisoner_name: 'John Doe', case_number: 'CB-2024-001' },
    //   { id: '2', prisoner_name: 'Jane Smith', case_number: 'CB-2024-002' },
    //   { id: '3', prisoner_name: 'Michael Johnson', case_number: 'CB-2024-003' },
    //   { id: '4', prisoner_name: 'Emily Davis', case_number: 'CB-2024-004' },
    //   { id: '5', prisoner_name: 'Robert Lee', case_number: 'CB-2024-005' },
    // ]);
    //
    // setDataLoaded(true);
  };

  const handleInputChange = (field: keyof Schedule, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.medical_case_book) {
      newErrors.medical_case_book = 'Medical Case Book is required';
    }
    if (!formData.followup_date) {
      newErrors.followup_date = 'Follow-up Date is required';
    }
    if (!formData.notes) {
      newErrors.notes = 'Notes is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    setLoader(true);
    onSubmit(formData);

    // setTimeout(() => {
    //   const selectedCaseBook = caseBooks.find((cb) => cb.id === formData.medical_case_book);
    //
    //   const submitData: Schedule = {
    //     ...formData,
    //     prisoner_name: selectedCaseBook?.prisoner_name || '',
    //     case_book_display: `${selectedCaseBook?.case_number} - ${selectedCaseBook?.prisoner_name}`,
    //   };
    //
    //   onSubmit(submitData);
    //   setLoader(false);
    //
    //   if (mode === 'create') {
    //     toast.success('Schedule created successfully');
    //     setFormData({
    //       followup_date: '',
    //       attendance_status: false,
    //       notes: '',
    //       medical_case_book: '',
    //     });
    //   } else {
    //     toast.success('Schedule updated successfully');
    //   }
    // }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <CalendarClock className="h-5 w-5" />
          {mode === 'create' && 'New Medical Schedule'}
          {mode === 'edit' && 'Edit Medical Schedule'}
          {mode === 'view' && 'View Medical Schedule'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
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
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Case Book Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medical_case_book">
                        Medical Case Book <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.medical_case_book}
                        onValueChange={(value) => handleInputChange('medical_case_book', value)}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger id="medical_case_book">
                          <SelectValue placeholder="Select case book" />
                        </SelectTrigger>
                        <SelectContent>
                          {caseBooks.map((cb) => (
                            <SelectItem key={cb.id} value={cb.id}>
                              {cb.check_type_name} - {cb.prisoner_name} - Doctor: {cb.doctors_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Schedule Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="followup_date">
                        Follow-up Date <span className="text-red-500">*</span>
                      </Label>
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                            disabled={isReadOnly}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.followup_date
                              ? format(new Date(formData.followup_date), 'PPP')
                              : 'Select follow-up date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.followup_date ? new Date(formData.followup_date) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                handleInputChange('followup_date', format(date, 'yyyy-MM-dd'));
                                setDatePickerOpen(false);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="attendance_status">Attendance Status</Label>
                        <p className="text-sm text-gray-600">Mark if prisoner attended the appointment</p>
                      </div>
                      <Switch
                        id="attendance_status"
                        checked={formData.attendance_status}
                        onCheckedChange={(checked) => handleInputChange('attendance_status', checked)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                    Additional Notes
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Enter any additional notes about the schedule..."
                      rows={4}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loader}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      style={{ backgroundColor: '#650000' }}
                      className="text-white hover:opacity-90"
                      disabled={loader}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loader ? 'Saving...' : mode === 'create' ? 'Create Schedule' : 'Update Schedule'}
                    </Button>
                  </div>
                )}

                {isReadOnly && (
                  <div className="flex items-center justify-end pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Close
                    </Button>
                  </div>
                )}
              </form>
          )
        }

      </CardContent>
    </Card>
  );
};

export default ScheduleForm;
import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { format } from 'date-fns';
import {Award, CalendarIcon, Check, ChevronsUpDown, File, Save, Search, Upload, X} from 'lucide-react';
import {AssessmentForm, Enrollment, ProgrammeStage} from "../../../../services/rehabilitation";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {getPrisonersList} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {
  getEnrollmentList,
  getSponsorList,
  getStaffList
} from "../../../../services/rehabilitation/enrollments/enrollmentGetApis";
import {toast} from "sonner";
import {handleCatchError} from "../../../../services/stationServices/utils";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "../../../ui/command";
import {cn} from "../../../ui/utils";
import {Badge} from "../../../ui/badge";
import {Card, CardContent} from "../../../ui/card";
import {Switch} from "../../../ui/switch";

interface EnrollmentAssessment {
  id?: string;
  prisoner_name?: string;
  programme_name?: string;
  status_name?: string;
  start_date: string;
  end_date: string;
  board_members: string;
  remarks: string;
  enrollment: string;
  status: string;
}

interface EnrollmentAssessmentFormProps {
  assessment: EnrollmentAssessment | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: EnrollmentAssessment) => void;
  onCancel: () => void;
  enrollments: Enrollment[]
  assessmentStatuses: Unit[]
  setEnrollments: Dispatch<SetStateAction<Enrollment[]>>;
}

// Mock data for dropdowns
// const mockEnrollments = [
//   { id: '1', label: 'John Doe - Carpentry Skills' },
//   { id: '2', label: 'Jane Smith - Computer Literacy' },
//   { id: '3', label: 'Michael Johnson - Agriculture Training' },
//   { id: '4', label: 'Sarah Williams - Tailoring' },
//   { id: '5', label: 'David Brown - Electrical Skills' },
// ];
//
// const mockStatuses = [
//   { id: '1', name: 'Pending' },
//   { id: '2', name: 'In Progress' },
//   { id: '3', name: 'Completed' },
//   { id: '4', name: 'On Hold' },
//   { id: '5', name: 'Cancelled' },
// ];

const EnrollmentAssessmentForm: React.FC<EnrollmentAssessmentFormProps> = ({
  enrollments, assessmentStatuses, setEnrollments,
  assessment,
  mode,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<AssessmentForm>({
    start_date: '',
    end_date: '',
    board_members: '',
    remarks: '',
    enrollment: '',
    status: '',
    is_active: true,
    deleted_datetime: null,
    deleted_by: null,
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    }
  }

  useEffect(() => {
    if (assessment) {
      setFormData(assessment);
      if (assessment.start_date) {
        setStartDate(new Date(assessment.start_date));
      }
      if (assessment.end_date) {
        setEndDate(new Date(assessment.end_date));
      }
    }
  }, [assessment]);

  const handleChange = (field: keyof AssessmentForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setFormData((prev) => ({ ...prev, start_date: format(date, 'yyyy-MM-dd') }));
      if (errors.start_date) {
        setErrors((prev) => ({ ...prev, start_date: '' }));
      }
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setFormData((prev) => ({ ...prev, end_date: format(date, 'yyyy-MM-dd') }));
      if (errors.end_date) {
        setErrors((prev) => ({ ...prev, end_date: '' }));
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.enrollment) {
      newErrors.enrollment = 'Enrollment is required';
    }
    if (!formData.remarks) {
      newErrors.remarks = 'Remarks are required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (!formData.board_members.trim()) {
      newErrors.board_members = 'Board members are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;

    if (validate()) {
      onSubmit(formData);
    }
  };

  const isViewMode = mode === 'view';

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
                  {/* Enrollment */}
                  <div className="space-y-2">
                    <Label htmlFor="enrollment">
                      Enrollment <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.enrollment}
                      onValueChange={(value) => handleChange('enrollment', value)}
                      disabled={isViewMode}
                    >
                      <SelectTrigger className={errors.enrollment ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select enrollment" />
                      </SelectTrigger>
                      <SelectContent>
                        {enrollments.map((enrollment) => (
                          <SelectItem key={enrollment.id} value={enrollment.id}>
                            {enrollment.prisoner_name} ({enrollment.programme_name}-{enrollment.programme_stage_name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.enrollment && <p className="text-sm text-red-500">{errors.enrollment}</p>}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange('status', value)}
                      disabled={isViewMode}
                    >
                      <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {assessmentStatuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="start_date">
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left ${
                            errors.start_date ? 'border-red-500' : ''
                          }`}
                          disabled={isViewMode}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={handleStartDateSelect} initialFocus />
                      </PopoverContent>
                    </Popover>
                    {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="end_date">
                      End Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left ${
                            errors.end_date ? 'border-red-500' : ''
                          }`}
                          disabled={isViewMode}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={handleEndDateSelect} initialFocus />
                      </PopoverContent>
                    </Popover>
                    {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                  </div>

                  {/* Board Members */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="board_members">
                      Board Members <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="board_members"
                      value={formData.board_members}
                      onChange={(e) => handleChange('board_members', e.target.value)}
                      placeholder="Enter board members (comma-separated)"
                      disabled={isViewMode}
                      className={errors.board_members ? 'border-red-500' : ''}
                    />
                    {errors.board_members && <p className="text-sm text-red-500">{errors.board_members}</p>}
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="remarks">Remarks <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => handleChange('remarks', e.target.value)}
                      placeholder="Enter any additional remarks or observations"
                      rows={4}
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    {isViewMode ? 'Close' : 'Cancel'}
                  </Button>
                  {!isViewMode && (
                    <Button type="submit" style={{ backgroundColor: '#650000' }} className="text-white">
                      {mode === 'create' ? 'Create Assessment' : 'Update Assessment'}
                    </Button>
                  )}
                </div>
              </form>
          )
        }
      </>

  );
};

export default EnrollmentAssessmentForm;

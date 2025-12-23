import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { Calendar, Upload, X } from 'lucide-react';
import PrisonerSearchScreen from '../common/PrisonerSearchScreen';

interface CourtAttendanceFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CourtAttendanceRecord | null;
}

interface CourtAttendanceRecord {
  id?: string;
  prisoner_name?: string;
  attendance_type_name?: string;
  court_name?: string;
  offence_name?: string;
  case_outcome_name?: string;
  appeal_id?: string;
  gate_pass_number?: string;
  remarks?: string;
  production_warrant?: string;
  criminal_case_number?: string;
  attendance_datetime?: string;
  legal_proceedings?: string;
  prisoner?: string;
  court_attendance_type?: string;
  court?: string;
  offence?: string;
  case_outcome?: string;
  appeal?: string;
  gate_pass?: string;
}

interface Prisoner {
  id: string;
  prisoner_number: string;
  personal_number: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  id_number: string;
  id_type: string;
  gender: string;
  tribe: string;
  date_of_admission: string;
  religion: string;
  category?: string;
  status?: string;
}

// Mock data for dropdowns
const mockAttendanceTypes = [
  { id: '1', name: 'Court Appearance' },
  { id: '2', name: 'Bail Hearing' },
  { id: '3', name: 'Sentencing' },
  { id: '4', name: 'Appeal Hearing' },
  { id: '5', name: 'Case Mention' }
];

const mockCourts = [
  { id: '1', name: 'High Court - Kampala' },
  { id: '2', name: 'Chief Magistrates Court - Kampala' },
  { id: '3', name: 'Magistrates Court - Nakawa' },
  { id: '4', name: 'Family Court - Mengo' },
  { id: '5', name: 'Commercial Court - Kampala' }
];

const mockOffences = [
  { id: '1', name: 'Theft' },
  { id: '2', name: 'Assault' },
  { id: '3', name: 'Murder' },
  { id: '4', name: 'Fraud' },
  { id: '5', name: 'Drug Trafficking' }
];

const mockCaseOutcomes = [
  { id: '1', name: 'Adjourned' },
  { id: '2', name: 'Convicted' },
  { id: '3', name: 'Acquitted' },
  { id: '4', name: 'Case Dismissed' },
  { id: '5', name: 'Bail Granted' },
  { id: '6', name: 'Remanded' }
];

const mockAppeals = [
  { id: '1', name: 'APP-2024-001' },
  { id: '2', name: 'APP-2024-002' },
  { id: '3', name: 'APP-2024-003' }
];

const mockGatePasses = [
  { id: '1', number: 'GP-2024-001' },
  { id: '2', number: 'GP-2024-002' },
  { id: '3', number: 'GP-2024-003' }
];

export default function CourtAttendanceForm({ open, onClose, onSuccess, editData }: CourtAttendanceFormProps) {
  const [formData, setFormData] = useState<CourtAttendanceRecord>({
    prisoner: '',
    court_attendance_type: '',
    court: '',
    offence: '',
    case_outcome: '',
    appeal: '',
    gate_pass: '',
    criminal_case_number: '',
    attendance_datetime: '',
    legal_proceedings: '',
    remarks: '',
    production_warrant: ''
  });
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [warrantFile, setWarrantFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        attendance_datetime: editData.attendance_datetime ? 
          new Date(editData.attendance_datetime).toISOString().slice(0, 16) : ''
      });
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setFormData({
      prisoner: '',
      court_attendance_type: '',
      court: '',
      offence: '',
      case_outcome: '',
      appeal: '',
      gate_pass: '',
      criminal_case_number: '',
      attendance_datetime: '',
      legal_proceedings: '',
      remarks: '',
      production_warrant: ''
    });
    setSelectedPrisoner(null);
    setWarrantFile(null);
  };

  const handlePrisonerSelect = (prisonerId: string, prisoner: Prisoner | null) => {
    setFormData({ ...formData, prisoner: prisonerId });
    setSelectedPrisoner(prisoner);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setWarrantFile(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.court_attendance_type) {
      toast.error('Please select attendance type');
      return;
    }
    if (!formData.court) {
      toast.error('Please select court');
      return;
    }
    if (!formData.attendance_datetime) {
      toast.error('Please select attendance date and time');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const formDataToSend = new FormData();
      // Object.keys(formData).forEach(key => {
      //   if (formData[key as keyof CourtAttendanceRecord]) {
      //     formDataToSend.append(key, formData[key as keyof CourtAttendanceRecord] as string);
      //   }
      // });
      // if (warrantFile) {
      //   formDataToSend.append('production_warrant', warrantFile);
      // }
      
      // const url = editData 
      //   ? `/api/court-attendance/attendance-records/${editData.id}/`
      //   : '/api/court-attendance/attendance-records/';
      // const method = editData ? 'PUT' : 'POST';
      
      // const response = await fetch(url, {
      //   method,
      //   body: formDataToSend
      // });
      
      // if (!response.ok) throw new Error('Failed to save record');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(editData ? 'Court attendance record updated successfully' : 'Court attendance record created successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving court attendance record:', error);
      toast.error('Failed to save court attendance record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1270px] h-[95vh] overflow-hidden p-0 flex flex-col">
        {/* Fixed Header */}
        <DialogHeader style={{ borderBottom: '2px solid #650000', padding: '0.75rem 1.5rem' }} className="shrink-0">
          <DialogTitle style={{ color: '#650000' }}>
            {editData ? 'Edit Court Attendance Record' : 'Create Court Attendance Record'}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Prisoner Search */}
              <div>
                <PrisonerSearchScreen
                  value={formData.prisoner}
                  onChange={handlePrisonerSelect}
                  showTitle={false}
                  label="Select Prisoner"
                  required={true}
                  disabled={isLoading}
                />
              </div>

              {/* Court Attendance Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="court_attendance_type">
                    Attendance Type <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.court_attendance_type}
                    onValueChange={(value) => setFormData({ ...formData, court_attendance_type: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="court_attendance_type">
                      <SelectValue placeholder="Select attendance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAttendanceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="court">
                    Court <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.court}
                    onValueChange={(value) => setFormData({ ...formData, court: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="court">
                      <SelectValue placeholder="Select court" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCourts.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendance_datetime">
                    Attendance Date & Time <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="attendance_datetime"
                      type="datetime-local"
                      value={formData.attendance_datetime}
                      onChange={(e) => setFormData({ ...formData, attendance_datetime: e.target.value })}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Case Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offence">Offence</Label>
                  <Select
                    value={formData.offence}
                    onValueChange={(value) => setFormData({ ...formData, offence: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="offence">
                      <SelectValue placeholder="Select offence" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockOffences.map((offence) => (
                        <SelectItem key={offence.id} value={offence.id}>
                          {offence.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criminal_case_number">Criminal Case Number</Label>
                  <Input
                    id="criminal_case_number"
                    value={formData.criminal_case_number}
                    onChange={(e) => setFormData({ ...formData, criminal_case_number: e.target.value })}
                    placeholder="Enter case number"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case_outcome">Case Outcome</Label>
                  <Select
                    value={formData.case_outcome}
                    onValueChange={(value) => setFormData({ ...formData, case_outcome: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="case_outcome">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCaseOutcomes.map((outcome) => (
                        <SelectItem key={outcome.id} value={outcome.id}>
                          {outcome.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appeal">Appeal</Label>
                  <Select
                    value={formData.appeal}
                    onValueChange={(value) => setFormData({ ...formData, appeal: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="appeal">
                      <SelectValue placeholder="Select appeal" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAppeals.map((appeal) => (
                        <SelectItem key={appeal.id} value={appeal.id}>
                          {appeal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gate_pass">Gate Pass</Label>
                  <Select
                    value={formData.gate_pass}
                    onValueChange={(value) => setFormData({ ...formData, gate_pass: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="gate_pass">
                      <SelectValue placeholder="Select gate pass" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockGatePasses.map((pass) => (
                        <SelectItem key={pass.id} value={pass.id}>
                          {pass.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="production_warrant">Production Warrant (Image)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="production_warrant"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    {warrantFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setWarrantFile(null)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {warrantFile && (
                    <p className="text-xs text-gray-600">Selected: {warrantFile.name}</p>
                  )}
                </div>
              </div>

              {/* Text Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legal_proceedings">Legal Proceedings</Label>
                  <Textarea
                    id="legal_proceedings"
                    value={formData.legal_proceedings}
                    onChange={(e) => setFormData({ ...formData, legal_proceedings: e.target.value })}
                    placeholder="Enter legal proceedings details"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Enter any additional remarks"
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div 
            className="shrink-0 flex justify-end gap-3 px-6 py-4"
            style={{ borderTop: '1px solid #e5e7eb' }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: '#650000' }}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : editData ? 'Update Record' : 'Create Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

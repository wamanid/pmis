import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { Save, X, Trash2, Upload, Calendar as CalendarIcon, Clock, File } from 'lucide-react';
import { Switch } from '../ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import PrisonerSearchScreen from '../common/PrisonerSearchScreen';
import CourtAttendanceForm from './CourtAttendanceForm';
import { PrisonerRecord } from '../../models/gate/Index';
import { CourtSchedulePost, CourtScheduleRecord, UploadedFile } from '../../models/court';
import { deleteCourtSchedule, getOffencesPersonal, submitCourtSchedule, submitCourtScheduleMulti } from '../../services/courtService';
import { fileToBase64 } from '../../utils/Util';
import { OffenceRequest } from '../../models/StageClassification';
import axiosInstance from '../../services/axiosInstance';

interface CourtScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CourtScheduleRecord | null;
  
  prisoners?:PrisonerRecord[];
  offenses?:any[];
  courts?:any[];
  stations?:any[];
  attendancetypes?:any;
  coutcomes?:any[];
}
const CourtScheduleForm: React.FC<CourtScheduleFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
  prisoners,
  offenses,
  courts,stations,attendancetypes,coutcomes
}) => {
  const [formData, setFormData] = useState({
    prisoner: '',
    offence: '',
    court_detail: '',
    station: '',
    court_attendance_type: '',
    case_outcome: '',
    scheduled_date: '',
    scheduled_time: '',
    presiding_judge: '',
    attendance_status: false,
    remarks: '',
    court_order: ''
  });
const [files, setFiles] = useState<UploadedFile[]>([]);

  // Mock data for dropdowns
let mockOffences = offenses;

const mockCourts = courts;

const mockStations = stations;


const mockAttendanceTypes =/* [
  { id: '1', name: 'Court Appearance' },
  { id: '2', name: 'Bail Hearing' },
  { id: '3', name: 'Sentencing' },
  { id: '4', name: 'Appeal Hearing' },
  { id: '5', name: 'Case Mention' },
];*/ attendancetypes;

const mockCaseOutcomes =/* [
  { id: '1', name: 'Adjourned' },
  { id: '2', name: 'Convicted' },
  { id: '3', name: 'Acquitted' },
  { id: '4', name: 'Bail Granted' },
  { id: '5', name: 'Bail Denied' },
  { id: '6', name: 'Remanded' },
];*/coutcomes;


  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrisonerSearch, setShowPrisonerSearch] = useState(false);
  const [selectedPrisonerName, setSelectedPrisonerName] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [showAttendanceForm, setShowAttendanceForm] = useState(false);
  const [offs, setOffs] = useState([]);
  const [imgdata, setImageData] = useState("");

  useEffect(() => {
    if (editData) {

        getOffencesPersonal(editData).then((data) => {
        mockOffences=data.results;
        setOffs(data.results);
       //  alert(JSON.stringify(data.results));
      }).catch((error) => {
       // alert(error);
      });

      setFormData({
        prisoner: editData.prisoner || '',
        offence: editData.offence || '',
        court_detail: editData.court_detail || '',
        station: editData.station || '',
        court_attendance_type: editData.court_attendance_type || '',
        case_outcome: editData.case_outcome || '',
        scheduled_date: editData.scheduled_date || '',
        scheduled_time: editData.scheduled_time ? editData.scheduled_time.substring(0, 5) : '',
        presiding_judge: editData.presiding_judge || '',
        attendance_status: editData.attendance_status || false,
        remarks: editData.remarks || '',
        court_order: editData.court_order
      });
      setSelectedPrisonerName(editData.prisoner_name || '');
      if (editData.court_order) {
        setSelectedFileName(editData.court_order);
      }
    } else {
      resetForm();
    }
  }, [editData, open]);

  const resetForm = () => {
    setFormData({
      prisoner: '',
      offence: '',
      court_detail: '',
      station: '',
      court_attendance_type: '',
      case_outcome: '',
      scheduled_date: '',
      scheduled_time: '',
      presiding_judge: '',
      attendance_status: false,
      remarks: '',
      court_order: File || null
    });
    setSelectedPrisonerName('');
    setSelectedFileName('');
  };

  const handlePrisonerSelect = (prisonerId: string) => {
    setFormData({ ...formData, prisoner: prisonerId });
    // Mock prisoner name - in real app, fetch from API
    const p = prisoners.find((assignment) => assignment.id === prisonerId);
    if(p) {
      setSelectedPrisonerName(`Prisoner ${p?.first_name} ${p?.last_name}`);
      //load the offenses here
      let datatopost:OffenceRequest={
        prisoner:prisonerId
      }

      getOffencesPersonal(datatopost).then((data) => {
        mockOffences=data.results;
        setOffs(data.results);
       //  alert(JSON.stringify(data.results));
       
      }).catch((error) => {
       // alert(error);
      });
    }

    setShowPrisonerSearch(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
     /* if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }*/
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      try {
        let selectedFile = file;
            // Convert the selected file to a Base64 string
            const base64String = await fileToBase64(selectedFile);
            // Display the Data URL in the output field and image preview
          //  const base64Output = document.getElementById('image_preview') as HTMLInputElement;
           // base64Output.value = base64String;
          //  alert(base64String);
      setSelectedFileName(file.name);
      setFiles([...files, { name: file.name, file: file }]);
      setFormData({ ...formData, court_order: base64String});
      setImageData(base64String);
     // alert(formData.court_order);

            console.log('Base64 encoding complete:', base64String);
        } catch (error) {
            console.error('Error during file conversion:', error);
           
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
    if (!formData.offence) {
      toast.error('Please select an offence');
      return;
    }
    if (!formData.court_detail) {
      toast.error('Please select a court');
      return;
    }
    if (!formData.station) {
      toast.error('Please select a station');
      return;
    }
    if (!formData.court_attendance_type) {
      toast.error('Please select attendance type');
      return;
    }
    if (!formData.scheduled_date) {
      toast.error('Please enter scheduled date');
      return;
    }
    if (!formData.scheduled_time) {
      toast.error('Please enter scheduled time');
      return;
    }
    if (!formData.presiding_judge?.trim()) {
      toast.error('Please enter presiding judge name');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
    //  await new Promise(resolve => setTimeout(resolve, 1000));
         const formData2= new FormData();
    files.forEach((uploadFile, index) => {
      formData2.append('court_order', uploadFile.file); // Note: 'files' is the field name
    });
    formData2.append('prisoner', formData?.prisoner || '');
    formData2.append('offence', formData?.offence || '');
    formData2.append('court_detail', formData?.court_detail || '');
    formData2.append('station', formData?.station || '');
    formData2.append('court_attendance_type', formData?.court_attendance_type || '');
    formData2.append('case_outcome', formData?.case_outcome || '');
    formData2.append('scheduled_date', formData?.scheduled_date || '');
    formData2.append('scheduled_time', formData?.scheduled_time ? formData.scheduled_time.substring(0, 5) : '');
    formData2.append('presiding_judge', formData?.presiding_judge || '');
    formData2.append('attendance_status', String(editData?.attendance_status || false));
    formData2.append('remarks', formData?.remarks || '');
    formData2.append('uploadedAt', new Date().toISOString());

     const token =
        localStorage.getItem("access_token") ??
        localStorage.getItem("token") ??
        localStorage.getItem("auth_token") ??
        localStorage.getItem("authToken") ??
        null;
      const configuredBase =
      (axiosInstance && (axiosInstance.defaults as any)?.baseURL) ??
      ((import.meta as any).env?.VITE_API_BASE_URL ?? "")


      if (editData?.id) {
        toast.success('Court schedule updated successfully');

        try {      
      const response = await fetch(configuredBase+"/court-attendance/schedules/"+editData?.id+"/", {
        method: 'PATCH',
        headers: {
          "Authorization": "Bearer "+token, // ✅ Optional auth
        },
        body: formData2,
      });
       const result = await response.json();
        //alert(JSON.stringify(result));
      if (!response.ok) {
            toast.error(response.status); 
       // throw new Error(`Upload failed: ${response.status}`);
      }
      else{
           
    resetForm();
    onSuccess();
    onClose();
      toast.success('Court schedule created successfully');
      }
    } catch (error) {
      toast.error(error);

    }





        //update wapi call here
      } else {
        //add here
            try {
    
      
    try {      
      const response = await fetch(configuredBase+"/court-attendance/schedules/", {
        method: 'POST',
        headers: {
          "Authorization": "Bearer "+token, // ✅ Optional auth
        },
        body: formData2,
      });
       const result = await response.json();
     //   alert(JSON.stringify(result));
      if (!response.ok) {
            toast.error(response.status); 
       // throw new Error(`Upload failed: ${response.status}`);
      }
      else{
           
    resetForm();
    onSuccess();
    onClose();
      toast.success('Court schedule created successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error);
      
      // Update all files to error
     /* setFiles((prev) =>
        prev.map((f) => ({ ...f, status: 'error', error: 'Upload failed' }))
      );*/
      
      
    }


    /*
      let dataPost:CourtSchedulePost= {
        start_date: formData?.scheduled_date || '',
        scheduled_time: formData?.scheduled_time ? formData.scheduled_time.substring(0, 5) : '',
        presiding_judge: formData?.presiding_judge || '',
        attendance_status: String(formData?.attendance_status || false),
        remarks: formData?.remarks || '',
        court_order: '',
        prisoner: formData?.prisoner || '',
        stage: formData?.stage || '',
        offence: formData?.offence || '',
        court_detail: formData?.court_detail || '',
        station: formData?.station || '',
        court_attendance_type: formData?.court_attendance_type || '',
        case_outcome: formData?.case_outcome || '',
        file:formData?.court_order || File
      };
     alert(JSON.stringify(dataPost));
     await submitCourtSchedule(dataPost).then((data) => {
            alert(JSON.stringify(data));
          }).catch((error) => {
            alert(error);
          });*/
        
     // toast.success('Court schedule created successfully');
    } catch (error) {
      console.error('Upload error:', error);

      toast.error('Upload failed. Please try again.');
    }
        
      }

    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editData?.id) return;
    setLoading(true);
    try {
          deleteCourtSchedule(editData.id).then((data) => {
           toast.success('Court schedule deleted successfully');
          }).catch((error) => {
            alert(error);
          });
      
      setShowDeleteDialog(false);
      onSuccess();
      onClose();
    } catch (error) {
      //toast.error('Failed to delete court schedule'+error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[1400px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editData ? 'Edit Court Schedule' : 'New Court Schedule'}</span>
              <div className="flex gap-2">
                {editData && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prisoner Selection */}
            <div className="space-y-2">
              <Label htmlFor="prisoner">
                Prisoner <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="prisoner"
                  value={selectedPrisonerName}
                  placeholder="Click to search for prisoner..."
                  disabled
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  onClick={() => setShowPrisonerSearch(true)}
                  disabled={loading}
                  variant="outline"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Row 1: Offence, Court, Station */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offence">
                  Offence <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.offence}
                  onValueChange={(value) => setFormData({ ...formData, offence: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select offence" />
                  </SelectTrigger>
                  <SelectContent>
                    {offs.map((offence) => (
                      <SelectItem key={offence.id} value={offence.id}>
                        {offence.offence_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="court_detail">
                  Court <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.court_detail}
                  onValueChange={(value) => setFormData({ ...formData, court_detail: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
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
                <Label htmlFor="station">
                  Station <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.station}
                  onValueChange={(value) => setFormData({ ...formData, station: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select station" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Attendance Type, Case Outcome */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="court_attendance_type">
                  Attendance Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.court_attendance_type}
                  onValueChange={(value) => setFormData({ ...formData, court_attendance_type: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
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
                <Label htmlFor="case_outcome">Case Outcome</Label>
                <Select
                  value={formData.case_outcome}
                  onValueChange={(value) => setFormData({ ...formData, case_outcome: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select case outcome" />
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

            {/* Row 3: Date, Time, Presiding Judge */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">
                  Scheduled Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    disabled={loading}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_time">
                  Scheduled Time <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    disabled={loading}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presiding_judge">
                  Presiding Judge <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="presiding_judge"
                  value={formData.presiding_judge}
                  onChange={(e) => setFormData({ ...formData, presiding_judge: e.target.value })}
                  placeholder="Enter judge name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Attendance Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="attendance_status"
                checked={formData.attendance_status}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, attendance_status: checked });
                  if (checked && editData) {
                    // Open Court Attendance Form when toggle is turned on in edit mode
                    setShowAttendanceForm(true);
                  }
                }}
                disabled={loading}
              />
              <Label htmlFor="attendance_status" className="cursor-pointer">
                Mark as Attended
              </Label>
            </div>
           
            {/* Court Order Upload */}
            <div className="space-y-2">
              <Label htmlFor="court_order">Court Order (PDF)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="court_order_display"
                  value={selectedFileName}
                  placeholder="No file selected"
                  disabled
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('court_order')?.click()}
                  disabled={loading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <input
                  id="court_order"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

               <br/>
               </div>
              <p className="text-sm text-gray-500">Upload PDF file (Max 5MB)</p>
            </div>
               <div className="space-y-2">

              {/*}
                 <img id="image_preview" src={formData.court_order} alt="Preview" className="mt-2 max-h-40 border" />
             
              
              {*/}
               </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Enter any additional remarks..."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : editData ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Prisoner Search Dialog */}
      <Dialog open={showPrisonerSearch} onOpenChange={setShowPrisonerSearch}>
        <DialogContent className="max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Search Prisoner</DialogTitle>
          </DialogHeader>
          <PrisonerSearchScreen
            value={formData.prisoner}
            onChange={handlePrisonerSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this court schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Court Attendance Form Dialog */}
      <CourtAttendanceForm
        open={showAttendanceForm}
        onClose={() => setShowAttendanceForm(false)}
        onSuccess={() => {
          setShowAttendanceForm(false);
          toast.success('Court attendance record created successfully');
        }}
        editData={null}
      />
    </>
  );
};

export default CourtScheduleForm;

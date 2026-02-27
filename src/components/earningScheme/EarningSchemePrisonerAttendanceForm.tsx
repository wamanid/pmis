import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Calendar, DollarSign, Users, Briefcase, Award } from 'lucide-react';
<<<<<<< HEAD

interface AttendanceFormData {
  prisoner_name: string;
  working_party_name: string;
  earning_rate_grade: string;
  is_present: boolean;
  attendance_datetime: string;
  amount_earned: string;
  remarks: string;
  working_party_prisoner: string;
  earning_rate: string;
}

interface EarningSchemePrisonerAttendanceFormProps {
  initialData?: AttendanceFormData | null;
  onSubmit: (data: AttendanceFormData) => void;
  onCancel: () => void;
}
=======
import { PrisonerRecord } from '../../models/admission';
import { getPrisoners } from '../../services/admission';
import { getEarningRateForPrisoner, getEarningRateTypes,getWorkingpartyPrisoners } from '../../services/gratuityService';


import { getprisoners, getworkingparty } from '../../services/gateService';
import { AttendanceFormData, EarningSchemePrisonerAttendanceFormProps } from '../../models/earningScheme/earning';
import { WorkingParty } from '../../models/gate/Index';
>>>>>>> ezama

export const EarningSchemePrisonerAttendanceForm: React.FC<EarningSchemePrisonerAttendanceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
<<<<<<< HEAD
=======
  editData,
  prisoners,
  workingParties
>>>>>>> ezama
}) => {
  const [formData, setFormData] = useState<AttendanceFormData>({
    prisoner_name: '',
    working_party_name: '',
    earning_rate_grade: '',
    is_present: true,
    attendance_datetime: new Date().toISOString().slice(0, 16),
    amount_earned: '0.00',
    remarks: '',
    working_party_prisoner: '',
    earning_rate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoursWorked, setHoursWorked] = useState<string>('8');

<<<<<<< HEAD
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Mock data for dropdowns
  const prisoners = [
    { id: 'p-001', name: 'John Doe' },
    { id: 'p-002', name: 'Jane Smith' },
    { id: 'p-003', name: 'Michael Johnson' },
    { id: 'p-004', name: 'Robert Brown' },
    { id: 'p-005', name: 'David Wilson' },
  ];

  const workingParties = [
    { id: 'wp-001', name: 'Workshop A' },
    { id: 'wp-002', name: 'Kitchen' },
    { id: 'wp-003', name: 'Cleaning Squad' },
    { id: 'wp-004', name: 'Shamba/Agriculture' },
    { id: 'wp-005', name: 'Livestock Care' },
    { id: 'wp-006', name: 'Workshop B' },
  ];

  const earningRates = [
    { id: 'er-001', grade: 'Grade A (1398)', amount: 1398 },
    { id: 'er-002', grade: 'Grade B (699)', amount: 699 },
    { id: 'er-003', grade: 'Grade C (280)', amount: 280 },
  ];
=======


  const [earningRates,setearningRates] = useState([
  /*  { id: 'er-001', grade: 'Grade A (1398)', amount: 1398 },
    { id: 'er-002', grade: 'Grade B (699)', amount: 699 },
    { id: 'er-003', grade: 'Grade C (280)', amount: 280 },*/
  ]);

  const loadData = async() => {



  }

  useEffect(() => {

    if (initialData) {
          setFormData(initialData);
    }
  

            

          //its loaded all the time here
          //but this needs to be loaded and passed as a prop to the form and not loaded in the form because its used in other places as well
      if (editData) {
     //   alert(`Edit data found: ${JSON.stringify(editData)}`);
       const workingPartyPrisoner= prisoners.find(p => p.id === editData.working_party_prisoner);
      if(workingPartyPrisoner)
      {
      let prisonerId = workingPartyPrisoner.prisoner;
     getEarningRateForPrisoner(prisonerId).then((data) => {
     setearningRates(data.results);
      // setFormData({...formData,amount_earned: prisoner.amount_earned});
  // alert(`Found working party prisoner: ${JSON.stringify(workingPartyPrisoner)}`);
   setFormData(prev => ({...prev, prisoner_name: workingPartyPrisoner.prisoner_name,prisoner_id: prisonerId, 
    working_party: editData.working_party_name,
    working_party_prisoner: workingPartyPrisoner.id,
     earning_rate_grade: workingPartyPrisoner.earning_rate_grade, earning_rate: workingPartyPrisoner.earning_rate}));
   /* handleChange('prisoner_name', workingPartyPrisoner.prisoner_name);
     handleChange('prisoner_id',prisonerId);
     handleChange('working_party_prisoner', workingPartyPrisoner.id);
      handleChange('earning_rate_grade', workingPartyPrisoner.earning_rate);
     handleChange('earning_rate', workingPartyPrisoner.earning_rate);*/
     // alert(`Found prisoner for editing: ${JSON.stringify(data.results)}`);
    calculateEarnings(editData.is_present, "8", editData.earning_rate_grade);
    
      }
      ).catch((error) => {
        alert(error);
      }
      );
    
  
    

    }

}
     

       /*    getEarningRateTypes().then((data) => {
           alert(JSON.stringify(data.results));
            setearningRates(data.results);
          }).catch((error) => {
            alert(error);
          });*/


                

  }, [initialData]);


>>>>>>> ezama

  // Calculate earnings based on attendance, hours worked, and grade
  const calculateEarnings = (isPresent: boolean, hours: string, grade: string) => {
    if (!isPresent) return '0.00';
    
    const hoursNum = parseFloat(hours) || 0;
    if (hoursNum < 3) return '0.00'; // No earnings if worked less than 3 hours
    
<<<<<<< HEAD
    const selectedRate = earningRates.find(r => r.grade === grade);
    if (!selectedRate) return '0.00';
    
    return selectedRate.amount.toFixed(2);
=======
    const selectedRate = earningRates.find(r => r.earning_rate_grade == grade);
   // alert(`Calculating earnings with isPresent=${isPresent}, hours=${hours}, grade=${grade} selectedRate=${JSON.stringify(selectedRate)}`);
    
    if (!selectedRate) return '0.00';
    
    //remove commas from the amount and convert to number
    return parseFloat(selectedRate.earning_rate_amount.replace(/,/g, '')).toFixed(2);
>>>>>>> ezama
  };

  useEffect(() => {
    const earnings = calculateEarnings(formData.is_present, hoursWorked, formData.earning_rate_grade);
    setFormData(prev => ({ ...prev, amount_earned: earnings }));
  }, [formData.is_present, hoursWorked, formData.earning_rate_grade]);

  const handleChange = (field: keyof AttendanceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePrisonerChange = (prisonerId: string) => {
<<<<<<< HEAD
    const prisoner = prisoners.find(p => p.id === prisonerId);
    if (prisoner) {
      handleChange('prisoner_name', prisoner.name);
      handleChange('working_party_prisoner', prisonerId);
=======

    //b93828de-9440-45ca-89ea-08a391676261
    const prisoner = prisoners.find(p => p.id === prisonerId);
    //alert(JSON.stringify(prisonerId));
    if (prisoner) {
    //alert(JSON.stringify(prisoner));
      //get the earning rate for the selected prisoner and set it in the form data
      //getEarningRateForPrisoner
      getEarningRateForPrisoner(prisoner.prisoner).then((data) => {
    //alert(JSON.stringify(data.results));
     setearningRates(data.results);
      }
      ).catch((error) => {
        alert(error);
      }
      );
      setFormData({...formData,earning_rate_grade: prisoner.earning_rate});
     // handleChange('earning_rate', prisoner.earning_rate);
      handleChange('prisoner_name', prisoner.prisoner_name);
      handleChange('prisoner_id',prisonerId);
      handleChange('working_party_prisoner', prisoner.id);
       handleChange('earning_rate_grade', '');
      handleChange('earning_rate', 'None');

    }
    else{
      handleChange('prisoner_name', '');
      handleChange('prisoner_id','');
      handleChange('working_party_prisoner', '');
      handleChange('earning_rate_grade', '');
      handleChange('earning_rate', '');
>>>>>>> ezama
    }
  };

  const handleWorkingPartyChange = (partyName: string) => {
    handleChange('working_party_name', partyName);
  };

  const handleEarningRateChange = (rateId: string) => {
    const rate = earningRates.find(r => r.id === rateId);
    if (rate) {
<<<<<<< HEAD
      handleChange('earning_rate_grade', rate.grade);
      handleChange('earning_rate', rateId);
    }
=======
      handleChange('earning_rate_grade', rate.earning_rate_grade);
      handleChange('earning_rate', rateId);
    }
    else{
      handleChange('earning_rate_grade', '');
      handleChange('earning_rate', 'None');

    }
>>>>>>> ezama
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.prisoner_name) newErrors.prisoner_name = 'Prisoner is required';
    if (!formData.working_party_name) newErrors.working_party_name = 'Working party is required';
    if (!formData.earning_rate_grade) newErrors.earning_rate_grade = 'Earning grade is required';
    if (!formData.attendance_datetime) newErrors.attendance_datetime = 'Date and time are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prisoner Selection */}
      <div className="space-y-2">
        <Label htmlFor="prisoner" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Prisoner <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.working_party_prisoner}
<<<<<<< HEAD
          onValueChange={handlePrisonerChange}
        >
=======
          onValueChange={handlePrisonerChange}>
>>>>>>> ezama
          <SelectTrigger id="prisoner" className={errors.prisoner_name ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select prisoner..." />
          </SelectTrigger>
          <SelectContent>
<<<<<<< HEAD
            {prisoners.map(prisoner => (
              <SelectItem key={prisoner.id} value={prisoner.id}>
                {prisoner.name}
=======
              <SelectItem key="None" value='None'>
                Select Prisoner
              </SelectItem>
            {prisoners.map(prisoner => (
              <SelectItem key={prisoner.id} value={prisoner.id}>
                {prisoner.prisoner_name}
>>>>>>> ezama
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.prisoner_name && (
          <p className="text-sm text-red-500">{errors.prisoner_name}</p>
        )}
      </div>

      {/* Working Party Selection */}
      <div className="space-y-2">
        <Label htmlFor="working_party" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Working Party <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.working_party_name}
          onValueChange={handleWorkingPartyChange}
        >
          <SelectTrigger id="working_party" className={errors.working_party_name ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select working party..." />
          </SelectTrigger>
          <SelectContent>
            {workingParties.map(party => (
              <SelectItem key={party.id} value={party.name}>
                {party.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.working_party_name && (
          <p className="text-sm text-red-500">{errors.working_party_name}</p>
        )}
      </div>

      {/* Earning Rate/Grade Selection */}
      <div className="space-y-2">
        <Label htmlFor="earning_rate" className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          Earning Grade <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.earning_rate}
          onValueChange={handleEarningRateChange}
        >
          <SelectTrigger id="earning_rate" className={errors.earning_rate_grade ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select earning grade..." />
          </SelectTrigger>
          <SelectContent>
<<<<<<< HEAD
            {earningRates.map(rate => (
              <SelectItem key={rate.id} value={rate.id}>
                {rate.grade} - UGX {rate.amount.toLocaleString()}
=======
              <SelectItem key="None" value='None'>
                Select Earning Grade
              </SelectItem>

            {earningRates.map(rate => (
              <SelectItem key={rate.id} value={rate.id}>
                {rate.earning_rate_grade} - UGX {rate.earning_rate_amount.toLocaleString()}
>>>>>>> ezama
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.earning_rate_grade && (
          <p className="text-sm text-red-500">{errors.earning_rate_grade}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="space-y-2">
        <Label htmlFor="attendance_datetime" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Attendance Date & Time <span className="text-red-500">*</span>
        </Label>
        <Input
          id="attendance_datetime"
          type="datetime-local"
          value={formData.attendance_datetime.slice(0, 16)}
          onChange={(e) => handleChange('attendance_datetime', e.target.value + ':00Z')}
          className={errors.attendance_datetime ? 'border-red-500' : ''}
        />
        {errors.attendance_datetime && (
          <p className="text-sm text-red-500">{errors.attendance_datetime}</p>
        )}
      </div>

      {/* Attendance Status */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Attendance Status <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.is_present ? 'present' : 'absent'}
          onValueChange={(value) => handleChange('is_present', value === 'present')}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="present" id="present" />
              <Label htmlFor="present" className="cursor-pointer text-green-600">
                Present
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="absent" id="absent" />
              <Label htmlFor="absent" className="cursor-pointer text-red-600">
                Absent
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Hours Worked (only if present) */}
      {formData.is_present && (
        <div className="space-y-2">
          <Label htmlFor="hours_worked">
            Hours Worked <span className="text-red-500">*</span>
            <span className="text-sm text-muted-foreground ml-2">(Minimum 3 hours to earn)</span>
          </Label>
          <Input
            id="hours_worked"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={hoursWorked}
            onChange={(e) => setHoursWorked(e.target.value)}
          />
          {parseFloat(hoursWorked) < 3 && (
            <p className="text-sm text-orange-600">
              Note: No earnings will be recorded for less than 3 hours of work
            </p>
          )}
        </div>
      )}

      {/* Amount Earned (Auto-calculated, read-only) */}
      <div className="space-y-2">
        <Label htmlFor="amount_earned" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Amount Earned (Auto-calculated)
        </Label>
        <div className="relative">
          <Input
            id="amount_earned"
            type="text"
            value={`UGX ${parseFloat(formData.amount_earned).toLocaleString()}`}
            readOnly
            className="bg-gray-50"
            style={{ 
              color: parseFloat(formData.amount_earned) > 0 ? '#34D399' : '#EF4444',
              fontWeight: 'bold'
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Based on attendance status, hours worked, and earning grade
        </p>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          placeholder="Add any additional notes or remarks..."
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          rows={4}
        />
      </div>

      {/* Information Box */}
      <div className="p-4 border-2 rounded-lg bg-blue-50 border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Earning Scheme Rules:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Prisoners must work ≥3 hours to earn payment</li>
          <li>• No earnings on weekends/holidays (except Cooks, Cleaners, Shamba Guards, Livestock Care)</li>
          <li>• Earnings automatically split: 2/3 to PP Cash, 1/3 to Mandatory Savings</li>
          <li>• Stage 2, Stage 3, and Out of Stage prisoners do not earn</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" style={{ backgroundColor: '#34D399' }} className="text-white">
          {initialData ? 'Update Record' : 'Save Record'}
        </Button>
      </div>
    </form>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> ezama

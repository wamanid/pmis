import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { HeartHandshake, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {getLiteracyLevels, Welfare, WelfareForm} from "../../../services/rehabilitation";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {StaffItem} from "../../../services/stationServices/staffDeploymentService";
import {getPrisonersList} from "../../../services/medical/medicalInformation/medicalGetApis";
import {
  getAfterCareActivitiesList, getEducationLevelsList, getLiteracyLevelsList, getReligionsList,
  getStaffList,
  getTreadsList
} from "../../../services/rehabilitation/enrollments/enrollmentGetApis";
import {handleCatchError} from "../../../services/stationServices/utils";

interface WelfareFormProps {
  welfare?: Welfare | null;
  onSubmit: (welfare: Welfare) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
  classes: Unit[]
  treads: Unit[]
  educationLevels: Unit[]
  literacyLevels: Unit[]
  religions: Unit[]
  setTreads: Dispatch<SetStateAction<Unit[]>>
  setReligions: Dispatch<SetStateAction<Unit[]>>
  setEducationLevels: Dispatch<SetStateAction<Unit[]>>;
  setLiteracyLevels: Dispatch<SetStateAction<Unit[]>>;
  prisoners: PrisonerItem[];
  setPrisoners: Dispatch<SetStateAction<PrisonerItem[]>>;
  staff: StaffItem[];
  setStaff: Dispatch<SetStateAction<StaffItem[]>>;
}

const WelfareForm: React.FC<WelfareFormProps> = ({
    classes, educationLevels, setLiteracyLevels, setEducationLevels, literacyLevels, treads, setTreads, prisoners, setPrisoners, staff, setStaff, religions, setReligions,
  welfare,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<WelfareForm>({
    reception_date: new Date().toISOString().split('T')[0],
    reception_place: '',
    physical_mental_state: '',
    prisoner_history: '',
    note_from_previous_record: '',
    board_recommendation: '',
    income_details: '',
    own_land_property: false,
    consider_investigation: false,
    has_salary_debt: false,
    has_property_debt: false,
    has_loan: false,
    further_details: '',
    prisoner: '',
    literacy_level: '',
    education_level: '',
    religion: '',
    tread_qualification: '',
    recommended_classification: '',
    officer_in_charge: '',
    is_active: true,
    deleted_datetime: null,
    deleted_by: null,
  });

  // const [prisoners, setPrisoners] = useState<any[]>([]);
  // const [literacyLevels, setLiteracyLevels] = useState<any[]>([]);
  // const [educationLevels, setEducationLevels] = useState<any[]>([]);
  // const [religions, setReligions] = useState<any[]>([]);
  // const [treadQualifications, setTreadQualifications] = useState<any[]>([]);
  // const [classifications, setClassifications] = useState<any[]>([]);
  // const [officers, setOfficers] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (welfare) {
      setFormData(welfare);
    }
  }, [welfare]);

  async function loadDropdownData () {
    try {
      let prisonersOk = true
      let treadsOk = true
      let educationOk = true
      let literacyOk = true
      let staffOK = true
      let religionsOK = true

      if (!prisoners.length) {
        prisonersOk = await getPrisonersList(setPrisoners)
      }
      if (!treads.length) {
        treadsOk = await getTreadsList(setTreads)
      }
      if (!literacyLevels.length) {
        literacyOk = await getLiteracyLevelsList(setLiteracyLevels)
      }
      if (!educationLevels.length) {
        educationOk = await getEducationLevelsList(setEducationLevels)
      }
      if(!staff.length) {
        staffOK = await getStaffList(setStaff)
      }
      if(!religions.length) {
        religionsOK = await getReligionsList(setReligions)
      }

      if (prisonersOk && treadsOk && staffOK && educationOk && literacyOk && religionsOK && !!classes.length) {
      // if (prisonersOk) {
        setDataLoaded(false)
      }
      else {
        toast.error("Please make sure you have prisoners, staff, tread qualifications, education levels, literacy levels, religions and prisoner classifications")
        // toast.error("Please make sure you have prisoners")
        onCancel()
      }
    }
    catch (error) {
      handleCatchError(error)
      onCancel()
    }
  }

  const handleInputChange = (field: keyof Welfare, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof Welfare, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.officer_in_charge) {
      toast.error('Please select an officer in charge');
      return;
    }
    if (!formData.literacy_level) {
      toast.error('Please select a literacy level');
      return;
    }
    if (!formData.education_level) {
      toast.error('Please select an education level');
      return;
    }
    if (!formData.religion) {
      toast.error('Please select a religion');
      return;
    }
    if (!formData.tread_qualification) {
      toast.error('Please select a tread qualification');
      return;
    }
    if (!formData.recommended_classification) {
      toast.error('Please select a recommended classification');
      return;
    }
    if (!formData.physical_mental_state) {
      toast.error('Please enter a physical & mental state');
      return;
    }
    if (!formData.prisoner_history) {
      toast.error('Please enter prisoner history');
      return;
    }
    if (!formData.note_from_previous_record) {
      toast.error('Please enter notes from previous records');
      return;
    }
    if (!formData.board_recommendation) {
      toast.error('Please enter the board recommendation');
      return;
    }
    if (!formData.reception_date) {
      toast.error('Please enter reception date');
      return;
    }
    if (!formData.income_details) {
      toast.error('Please enter the prisoner income details');
      return;
    }
    if (!formData.further_details) {
      toast.error('Please enter further details');
      return;
    }
    if (!formData.reception_place.trim()) {
      toast.error('Please enter reception place');
      return;
    }

    setLoading(true);
    onSubmit(formData);
    setLoading(false);

  };

  const isReadOnly = mode === 'view';

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
              <Card className="w-full">
                <CardHeader style={{ backgroundColor: '#650000' }}>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <HeartHandshake className="h-5 w-5" />
                    {mode === 'create' && 'New Welfare Record'}
                    {mode === 'edit' && 'Edit Welfare Record'}
                    {mode === 'view' && 'View Welfare Record'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Prisoner Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                        Prisoner Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prisoner">
                            Prisoner <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.prisoner}
                            onValueChange={(value) => handleInputChange('prisoner', value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="prisoner">
                              <SelectValue placeholder="Select prisoner" />
                            </SelectTrigger>
                            <SelectContent>
                              {prisoners.map((prisoner) => (
                                <SelectItem key={prisoner.id} value={prisoner.id}>
                                  {prisoner.prisoner_number_value} - {prisoner.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="officer_in_charge">Officer In Charge <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.officer_in_charge}
                            onValueChange={(value) => handleInputChange('officer_in_charge', value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="officer_in_charge">
                              <SelectValue placeholder="Select officer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">None</SelectItem>
                              {staff.map((officer) => (
                                <SelectItem key={officer.id} value={officer.id}>
                                  {officer.first_name} {officer.last_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Reception Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                        Reception Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reception_date">
                            Reception Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="reception_date"
                            type="date"
                            value={formData.reception_date}
                            onChange={(e) => handleInputChange('reception_date', e.target.value)}
                            disabled={isReadOnly}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reception_place">
                            Reception Place <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="reception_place"
                            value={formData.reception_place}
                            onChange={(e) => handleInputChange('reception_place', e.target.value)}
                            placeholder="Enter reception place"
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Education & Background */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                        Education & Background
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="literacy_level">Literacy Level <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.literacy_level}
                            onValueChange={(value) => handleInputChange('literacy_level', value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="literacy_level">
                              <SelectValue placeholder="Select literacy level" />
                            </SelectTrigger>
                            <SelectContent>
                              {literacyLevels.map((level) => (
                                <SelectItem key={level.id} value={level.id}>
                                  {level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="education_level">Education Level <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.education_level}
                            onValueChange={(value) => handleInputChange('education_level', value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="education_level">
                              <SelectValue placeholder="Select education level" />
                            </SelectTrigger>
                            <SelectContent>
                              {educationLevels.map((level) => (
                                <SelectItem key={level.id} value={level.id}>
                                  {level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="religion">Religion <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.religion}
                            onValueChange={(value) => handleInputChange('religion', value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="religion">
                              <SelectValue placeholder="Select religion" />
                            </SelectTrigger>
                            <SelectContent>
                              {religions.map((religion) => (
                                <SelectItem key={religion.id} value={religion.id}>
                                  {religion.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tread_qualification">Trade Qualification <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.tread_qualification}
                            onValueChange={(value) => handleInputChange('tread_qualification', value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="tread_qualification">
                              <SelectValue placeholder="Select trade qualification" />
                            </SelectTrigger>
                            <SelectContent>
                              {treads.map((qual) => (
                                <SelectItem key={qual.id} value={qual.id}>
                                  {qual.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recommended_classification">Recommended Classification <span className="text-red-500">*</span></Label>
                          <Select
                            value={formData.recommended_classification}
                            onValueChange={(value) => handleInputChange('recommended_classification', value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger id="recommended_classification">
                              <SelectValue placeholder="Select classification" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classification) => (
                                <SelectItem key={classification.id} value={classification.id}>
                                  {classification.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* State & History */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                        State & History
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="physical_mental_state">Physical & Mental State <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="physical_mental_state"
                            value={formData.physical_mental_state}
                            onChange={(e) => handleInputChange('physical_mental_state', e.target.value)}
                            placeholder="Describe physical and mental state..."
                            rows={3}
                            disabled={isReadOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="prisoner_history">Prisoner History <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="prisoner_history"
                            value={formData.prisoner_history}
                            onChange={(e) => handleInputChange('prisoner_history', e.target.value)}
                            placeholder="Enter prisoner history..."
                            rows={3}
                            disabled={isReadOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="note_from_previous_record">Notes from Previous Records <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="note_from_previous_record"
                            value={formData.note_from_previous_record}
                            onChange={(e) => handleInputChange('note_from_previous_record', e.target.value)}
                            placeholder="Enter notes from previous records..."
                            rows={3}
                            disabled={isReadOnly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="board_recommendation">Board Recommendation <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="board_recommendation"
                            value={formData.board_recommendation}
                            onChange={(e) => handleInputChange('board_recommendation', e.target.value)}
                            placeholder="Enter board recommendation..."
                            rows={3}
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Financial & Property Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                        Financial & Property Information
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="income_details">Income Details <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="income_details"
                            value={formData.income_details}
                            onChange={(e) => handleInputChange('income_details', e.target.value)}
                            placeholder="Enter income details..."
                            rows={3}
                            disabled={isReadOnly}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="own_land_property"
                              checked={formData.own_land_property}
                              onCheckedChange={(checked) => handleCheckboxChange('own_land_property', checked as boolean)}
                              disabled={isReadOnly}
                            />
                            <Label htmlFor="own_land_property" className="cursor-pointer">
                              Owns Land/Property
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="consider_investigation"
                              checked={formData.consider_investigation}
                              onCheckedChange={(checked) => handleCheckboxChange('consider_investigation', checked as boolean)}
                              disabled={isReadOnly}
                            />
                            <Label htmlFor="consider_investigation" className="cursor-pointer">
                              Consider Investigation
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has_salary_debt"
                              checked={formData.has_salary_debt}
                              onCheckedChange={(checked) => handleCheckboxChange('has_salary_debt', checked as boolean)}
                              disabled={isReadOnly}
                            />
                            <Label htmlFor="has_salary_debt" className="cursor-pointer">
                              Has Salary Debt
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has_property_debt"
                              checked={formData.has_property_debt}
                              onCheckedChange={(checked) => handleCheckboxChange('has_property_debt', checked as boolean)}
                              disabled={isReadOnly}
                            />
                            <Label htmlFor="has_property_debt" className="cursor-pointer">
                              Has Property Debt
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="has_loan"
                              checked={formData.has_loan}
                              onCheckedChange={(checked) => handleCheckboxChange('has_loan', checked as boolean)}
                              disabled={isReadOnly}
                            />
                            <Label htmlFor="has_loan" className="cursor-pointer">
                              Has Loan
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="further_details">Further Details <span className="text-red-500">*</span></Label>
                          <Textarea
                            id="further_details"
                            value={formData.further_details}
                            onChange={(e) => handleInputChange('further_details', e.target.value)}
                            placeholder="Enter any additional details..."
                            rows={3}
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isReadOnly && (
                      <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onCancel}
                          disabled={loading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          style={{ backgroundColor: '#650000' }}
                          className="text-white hover:opacity-90"
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? 'Saving...' : mode === 'create' ? 'Create Welfare Record' : 'Update Welfare Record'}
                        </Button>
                      </div>
                    )}

                    {isReadOnly && (
                      <div className="flex items-center justify-end pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onCancel}
                        >
                          Close
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
          )
        }
      </>

  );
};

export default WelfareForm;

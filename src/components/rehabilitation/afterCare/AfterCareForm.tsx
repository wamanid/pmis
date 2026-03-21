import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { toast } from 'sonner';
import {
  Check,
  ChevronsUpDown,
  Upload,
  X,
  User,
  Activity,
  UserCircle,
  FileText,
  Image as ImageIcon, File
} from 'lucide-react';
import { cn } from '../../ui/utils';
import {PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {StaffItem} from "../../../services/stationServices/staffDeploymentService";
import {AfterCare, AfterCareForm, getAfterCareActivities} from "../../../services/rehabilitation";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";
import {getPrisonersList} from "../../../services/medical/medicalInformation/medicalGetApis";
import {
  getAfterCareActivitiesList,
  getSponsorList,
  getStaffList
} from "../../../services/rehabilitation/enrollments/enrollmentGetApis";
import {handleCatchError} from "../../../services/stationServices/utils";

interface AfterCareFormProps {
  afterCare?: AfterCare | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: AfterCare) => void;
  onCancel: () => void;
  prisoners: PrisonerItem[];
  setPrisoners: Dispatch<SetStateAction<PrisonerItem[]>>;
  staff: StaffItem[];
  setStaff: Dispatch<SetStateAction<StaffItem[]>>;
  afterCareActivities : Unit
  setAfterCareActivities: Dispatch<SetStateAction<Unit[]>>;
}

const AfterCareForm: React.FC<AfterCareFormProps> = ({
  afterCare, prisoners, setPrisoners, setAfterCareActivities, afterCareActivities, staff, setStaff,
  mode,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<AfterCareForm>({
    description: '',
    prisoner: '',
    after_care_activity: '',
    officer: '',
    photo: null,
    is_active: true,
    deleted_datetime: null,
    deleted_by: null,
  });


  const [openPrisoner, setOpenPrisoner] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);
  const [openOfficer, setOpenOfficer] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [dataLoaded, setDataLoaded] = useState(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);


  useEffect(() => {
    loadDropdownData();
  }, []);

  async function loadDropdownData () {
    try {
      let prisonersOk = true
      let activitiesOk = true
      let staffOK = true

      if (!prisoners.length) {
        prisonersOk = await getPrisonersList(setPrisoners)
      }

      if (!afterCareActivities.length) {
        activitiesOk = await getAfterCareActivitiesList(setAfterCareActivities)
      }
      // await getProgrammeStagesList("asas", setProgrammeStages)
      if(!staff.length) {
        staffOK = await getStaffList(setStaff)
      }

      if (prisonersOk && activitiesOk && staffOK) {
        setDataLoaded(false)
      }
      else {
        toast.error("Please make sure you have prisoners, staff and after care activities")
        onCancel()
      }
    }
    catch (error) {
      handleCatchError(error)
      onCancel()
    }
  }

  useEffect(() => {
    if (afterCare) {
      setFormData({
        ...afterCare,
        prisoner: afterCare.prisoner || '',
        after_care_activity: afterCare.after_care_activity || '',
        officer: afterCare.officer || 0
      });
      if (afterCare.photo) {
        setPhotoPreview(afterCare.photo);
      }
    }
  }, [afterCare]);

  const handleInputChange = (field: keyof AfterCare, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setPhotoFile(file)
        handleInputChange('photo', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    handleInputChange('photo', null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.after_care_activity) {
      toast.error('Please select an after care activity');
      return;
    }
    if (!formData.officer) {
      toast.error('Please select a responsible officer');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    onSubmit(formData, photoFile);
  };

  const isDisabled = mode === 'view';

  const selectedPrisoner = prisoners.find(p => p.id === formData.prisoner);
  const selectedActivity = afterCareActivities.find(a => a.id === formData.after_care_activity);
  const selectedOfficer = staff.find(o => o.id === formData.officer);

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
                  {/* Prisoner Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="prisoner">
                      Prisoner <span className="text-red-600">*</span>
                    </Label>
                    <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPrisoner}
                          className="w-full justify-between"
                          disabled={isDisabled}
                        >
                          {selectedPrisoner ? (
                            <span className="truncate">
                              {selectedPrisoner.full_name} ({selectedPrisoner.prisoner_number_value})
                            </span>
                          ) : (
                            <span className="text-gray-500">Select prisoner...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search prisoner..." />
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No prisoner found.</CommandEmpty>
                            <CommandGroup>
                              {prisoners.map((prisoner) => (
                                <CommandItem
                                  key={prisoner.id}
                                  value={prisoner.id}
                                  onSelect={() => {
                                    handleInputChange('prisoner', prisoner.id);
                                    setOpenPrisoner(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.prisoner === prisoner.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div>{prisoner.full_name}</div>
                                    <div className="text-sm text-gray-500">{prisoner.prisoner_number_value}</div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* After Care Activity Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="after_care_activity">
                      After Care Activity <span className="text-red-600">*</span>
                    </Label>
                    <Popover open={openActivity} onOpenChange={setOpenActivity}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openActivity}
                          className="w-full justify-between"
                          disabled={isDisabled}
                        >
                          {selectedActivity ? (
                            <span className="truncate">{selectedActivity.name}</span>
                          ) : (
                            <span className="text-gray-500">Select activity...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search activity..." />
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No activity found.</CommandEmpty>
                            <CommandGroup>
                              {afterCareActivities.map((activity) => (
                                <CommandItem
                                  key={activity.id}
                                  value={activity.id}
                                  onSelect={() => {
                                    handleInputChange('after_care_activity', activity.id);
                                    setOpenActivity(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.after_care_activity === activity.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div>{activity.name}</div>
                                    {activity.description && (
                                      <div className="text-sm text-gray-500">{activity.description}</div>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Responsible Officer Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="officer">
                      Responsible Officer <span className="text-red-600">*</span>
                    </Label>
                    <Popover open={openOfficer} onOpenChange={setOpenOfficer}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openOfficer}
                          className="w-full justify-between"
                          disabled={isDisabled}
                        >
                          {selectedOfficer ? (
                            <span className="truncate">
                              {selectedOfficer.first_name} {selectedOfficer.last_name}
                              {selectedOfficer.rank_name && ` - ${selectedOfficer.rank_name}`}
                            </span>
                          ) : (
                            <span className="text-gray-500">Select officer...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search officer..." />
                          <CommandList className="max-h-[300px] overflow-y-auto">
                            <CommandEmpty>No officer found.</CommandEmpty>
                            <CommandGroup>
                              {staff.map((officer) => (
                                <CommandItem
                                  key={officer.id}
                                  value={officer.id.toString()}
                                  onSelect={() => {
                                    handleInputChange('officer', officer.id);
                                    setOpenOfficer(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.officer === officer.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  <div className="flex-1">
                                    <div>{officer.first_name} {officer.last_name}</div>
                                    {officer.rank_name && (
                                      <div className="text-sm text-gray-500">{officer.rank_name}</div>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter detailed description of the after care activity and progress..."
                    rows={5}
                    disabled={isDisabled}
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="photo">Activity Photo</Label>
                  {photoPreview ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={photoPreview}
                          alt="Activity preview"
                          className="w-full h-full object-contain"
                        />
                        {!isDisabled && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemovePhoto}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG or JPEG (max. 5MB)
                        </p>
                      </div>
                      {!isDisabled && (
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      )}
                      {!isDisabled && (
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={() => document.getElementById('photo')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                {mode !== 'view' && (
                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" style={{ backgroundColor: '#650000' }} className="text-white">
                      {mode === 'create' ? 'Create After Care Record' : 'Update After Care Record'}
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

export default AfterCareForm;

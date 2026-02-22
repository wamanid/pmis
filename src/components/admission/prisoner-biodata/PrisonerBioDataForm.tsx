import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import { SexSelect } from "../../common/SexSelect";
import { MaritalStatusSelect } from "../../common/MaritalStatusSelect";
import { EducationLevelSelect } from "../../common/EducationLevelSelect";
import { EmploymentStatusSelect } from "../../common/EmploymentStatusSelect";
import { CountrySelect } from "../../common/CountrySelect";
import { StatusOfWomanSelect } from "../../common/StatusOfWomanSelect";
import { ReligionSelect } from "../../common/ReligionSelect";
import { TribeSelect } from "../../common/TribeSelect";
import { IdTypeSelect } from "../../common/IdTypeSelect";
import { ArmedForceSelect } from "../../common/ArmedForceSelect";
import { ArmedForceStatusSelect } from "../../common/ArmedForceStatusSelect";
import { AddressSelect } from "../../common/AddressSelect";
import { BuildSelect } from "../../common/BuildSelect";
import { FaceSelect } from "../../common/FaceSelect";
import { EyeSelect } from "../../common/EyeSelect";
import { MouthSelect } from "../../common/MouthSelect";
import { LipSelect } from "../../common/LipSelect";
import { TeethSelect } from "../../common/TeethSelect";
import { EarSelect } from "../../common/EarSelect";
import { HairSelect } from "../../common/HairSelect";
import { SpeechSelect } from "../../common/SpeechSelect";
import { RegionSelect } from "../../common/RegionSelect";
import { DistrictSelect } from "../../common/DistrictSelect";
import { CountySelect } from "../../common/CountySelect";
import { SubCountySelect } from "../../common/SubCountySelect";
import { ParishSelect } from "../../common/ParishSelect";
import { VillageSelect } from "../../common/VillageSelect";
import { PrisonerClassSelect } from "../../common/PrisonerClassSelect";
import FileUpload from "../../common/FileUpload";
import ChildRecordForm from "../ChildRecordForm";
import NextOfKinForm from "../NextOfKinForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Separator } from "../../ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import type { PrisonerBiodata, ArmedPersonnel, ChildRecord, NextOfKin, PrisonerRecord } from "../../../models/admission";
import { CardContent } from "../../ui/card";
import { Card } from "../../ui/card";
import { CardHeader } from "../../ui/card";
import { CardTitle } from "../../ui/card";
import { createPrisonerBiodata, updatePrisonerBiodata } from "../../../services/admission/prisonerBiodataService";
import { getPrisonerRecordsByPrisonerId, createPrisonerRecord, updatePrisonerRecord } from "../../../services/admission/prisonerRecordService";
import { pastOrTodayDateValidation, minimumAgeValidation } from "../../../utils/validation";
import { useFilters } from "../../../contexts/FilterContext";
import {
  Search,
  User,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  FileText,
  Users,
  MapPin,
  Briefcase,
  Info,
  DollarSign,
  Upload,
  X,
  Fingerprint,
  Loader2,
  Baby,
} from "lucide-react";
import { phoneNumberValidationFlexible, nameValidation } from "../../../utils";

interface PrisonerBiodataFormProps {
  bioData: PrisonerBiodata | null;
  onSubmit: (data: PrisonerBiodata) => void;
  onCancel: () => void;
}

const PrisonerBiodataForm: React.FC<PrisonerBiodataFormProps> = ({
  bioData,
  onSubmit,
  onCancel,
}) => {
  const { station } = useFilters();
  const prisonerCategory = useMemo(() => {
    try {
      const admissionState = JSON.parse(
        localStorage.getItem('pmis_admission_form_state') || '{}'
      );
      return typeof admissionState?.prisonerCategory === 'string'
        ? admissionState.prisonerCategory
        : '';
    } catch {
      return '';
    }
  }, []);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prisonerRecords, setPrisonerRecords] = useState<PrisonerRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<PrisonerBiodata>({
    defaultValues: bioData || {
      is_active: true,
      first_name: "",
      surname: "",
      date_of_birth: "",
      date_of_admission: "",
    },
    mode: 'onChange', // Enable validation on change
  });

  // Load form state from localStorage on mount
  useEffect(() => {
    const loadFormState = () => {
      try {
        const storedFormData = localStorage.getItem("pmis_biodata_form_state");
        if (storedFormData) {
          const formData = JSON.parse(storedFormData);
          reset(formData);
          
          // Populate all fields explicitly
          Object.keys(formData).forEach((key) => {
            if (formData[key] !== undefined && formData[key] !== null) {
              if (key === 'continent') {
                setValue(key as keyof PrisonerBiodata, coerceIdToUuid(formData[key]) as any);
              } else {
                setValue(key as keyof PrisonerBiodata, formData[key]);
              }
            }
          });
        }
      } catch (error) {
        console.error("Error loading form state:", error);
      }
    };

    if (!bioData) {
      loadFormState();
    }
  }, []);

  useEffect(() => {
    if (bioData) {
      reset(bioData);

      if ((bioData as any).continent) {
        setValue('continent' as keyof PrisonerBiodata, coerceIdToUuid((bioData as any).continent) as any);
      }
      
      // Populate address fields explicitly for AddressSelect components
      if (bioData.address_region) setValue("address_region", bioData.address_region);
      if (bioData.address_district) setValue("address_district", bioData.address_district);
      if (bioData.address_county) setValue("address_county", bioData.address_county);
      if (bioData.address_sub_county) setValue("address_sub_county", bioData.address_sub_county);
      if (bioData.address_parish) setValue("address_parish", bioData.address_parish);
      if (bioData.address_village) setValue("address_village", bioData.address_village);
      
      if (bioData.permanent_region) setValue("permanent_region", bioData.permanent_region);
      if (bioData.permanent_district) setValue("permanent_district", bioData.permanent_district);
      if (bioData.permanent_county) setValue("permanent_county", bioData.permanent_county);
      if (bioData.permanent_sub_county) setValue("permanent_sub_county", bioData.permanent_sub_county);
      if (bioData.permanent_parish) setValue("permanent_parish", bioData.permanent_parish);
      if (bioData.permanent_village) setValue("permanent_village", bioData.permanent_village);
      
      // Populate birth location fields
      if (bioData.birth_region) setValue("birth_region", bioData.birth_region);
      if (bioData.birth_district) setValue("birth_district", bioData.birth_district);
      if (bioData.birth_county) setValue("birth_county", bioData.birth_county);
      if (bioData.birth_sub_county) setValue("birth_sub_county", bioData.birth_sub_county);
      if (bioData.birth_parish) setValue("birth_parish", bioData.birth_parish);
      if (bioData.birth_village) setValue("birth_village", bioData.birth_village);
      
      // Populate physical characteristics fields
      if (bioData.build) setValue("build", bioData.build);
      if (bioData.face) setValue("face", bioData.face);
      if (bioData.eyes) setValue("eyes", bioData.eyes);
      if (bioData.mouth) setValue("mouth", bioData.mouth);
      if (bioData.teeth) setValue("teeth", bioData.teeth);
      if (bioData.lips) setValue("lips", bioData.lips);
      if (bioData.ears) setValue("ears", bioData.ears);
      if (bioData.hair) setValue("hair", bioData.hair);
      if (bioData.speech) setValue("speech", bioData.speech);
      
      // Populate arrest location fields
      if (bioData.arrest_region) setValue("arrest_region", bioData.arrest_region);
      if (bioData.arrest_district) setValue("arrest_district", bioData.arrest_district);
      if (bioData.arrest_county) setValue("arrest_county", bioData.arrest_county);
      if (bioData.arrest_sub_county) setValue("arrest_sub_county", bioData.arrest_sub_county);
      if (bioData.arrest_parish) setValue("arrest_parish", bioData.arrest_parish);
      if (bioData.arrest_village) setValue("arrest_village", bioData.arrest_village);
      
      // Populate record fields
      if (bioData.desired_district_of_release) setValue("desired_district_of_release", bioData.desired_district_of_release);
      if (bioData.prisoner_class) setValue("prisoner_class", bioData.prisoner_class);
      
      // Fetch prisoner records if prisoner ID is available
      if (bioData.prisoner) {
        fetchPrisonerRecords(bioData.prisoner);
      }
    }
  }, [bioData, reset, setValue]);

  // Save form state to localStorage whenever form data changes
  useEffect(() => {
    const subscription = watch((formData) => {
      try {
        localStorage.setItem("pmis_biodata_form_state", JSON.stringify(formData));
      } catch (error) {
        console.error("Error saving form state:", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Fetch prisoner records
  const fetchPrisonerRecords = async (prisonerId: string) => {
    try {
      setLoadingRecords(true);
      const response = await getPrisonerRecordsByPrisonerId(prisonerId);
      setPrisonerRecords(response.results || []);
    } catch (error) {
      console.error("Error fetching prisoner records:", error);
      toast.error("Failed to load prisoner records");
    } finally {
      setLoadingRecords(false);
    }
  };

  // Helper function to set value and clear error
  const setValueAndClearError = (field: keyof PrisonerBiodata, value: any) => {
    setValue(field, value);
    clearErrors(field);
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const coerceIdToUuid = (value: unknown): string | undefined => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'id' in value) {
      const id = (value as { id?: unknown }).id;
      return typeof id === 'string' ? id : undefined;
    }
    return undefined;
  };

  const handleFormSubmit = async (data: PrisonerBiodata) => {
    try {
      setIsSubmitting(true);
      
      // Get prisoner IDs from localStorage
      const storedReservation = localStorage.getItem("pmis_prisoner_number_reservation");
      let prisonerId=null
      let prisonerNumberId = null;
      let prisonerPersonalNumberId = null;
      let reservationId = null;
      
      if (storedReservation) {
        const reservation = JSON.parse(storedReservation);
        prisonerId=reservation.prisoner_id
        prisonerNumberId = reservation.id;  // Send prisoner_id
        prisonerPersonalNumberId = reservation.prisoner_personal_number_details?.id;  // Send prisoner_personal_number_details.id
        reservationId = reservation.id;  // Send reservation id
      }
      
      if (!prisonerNumberId || !prisonerPersonalNumberId) {
        toast.error("Prisoner IDs not found. Please generate prisoner numbers first.");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare biodata for API submission (exclude prisoner record fields)
      const biodataSubmission: any = {
        ...data,
        prisoner: prisonerId,
        prisoner_number: prisonerNumberId,
        prisoner_personal_number: prisonerPersonalNumberId,
        // Duplicate education_level to highest_education
        highest_education: data.education_level,
        // Replicate nationality to country_of_origin
        country_of_origin: data.nationality,
        // Replicate permanent_district to district_of_origin
        district_of_origin: data.permanent_district,
        // Convert height to decimal with 2 decimal places
        height: data.height ? parseFloat(parseFloat(data.height as any).toFixed(2)) : null,
      };

      // Ensure FK fields are UUID strings (not expanded objects)
      if ((biodataSubmission as any).continent !== undefined) {
        biodataSubmission.continent = coerceIdToUuid((biodataSubmission as any).continent) || null;
      }

      // Remove prisoner record fields from biodata submission
      const formData = data as any;
      delete biodataSubmission.escapee;
      delete biodataSubmission.armed_personnel;
      delete biodataSubmission.extremely_violent;
      delete biodataSubmission.life_or_death_imprisonment;
      delete biodataSubmission.commital;
      delete biodataSubmission.previous_convictions_count;

      // Handle photo upload - convert to base64 if file is selected
      if (data.photo && data.photo instanceof FileList && data.photo.length > 0) {
        const photoFile = data.photo[0];
        biodataSubmission.photo = await fileToBase64(photoFile);
      } else {
        // Remove photo field if no file is uploaded
        delete biodataSubmission.photo;
      }

      // Handle fingerprint upload - convert to base64 if file is selected
      if (data.finger_print && data.finger_print instanceof FileList && data.finger_print.length > 0) {
        const fingerprintFile = data.finger_print[0];
        biodataSubmission.finger_print = await fileToBase64(fingerprintFile);
      } else {
        // Remove finger_print field if no file is uploaded
        delete biodataSubmission.finger_print;
      }
      
      // 1. Submit biodata to API
      const biodataResponse = bioData?.id 
        ? await updatePrisonerBiodata(bioData.id, biodataSubmission)
        : await createPrisonerBiodata(biodataSubmission);
      
      // 2. Prepare and submit prisoner record data separately
      const storedFilters = JSON.parse(localStorage.getItem("pmis_user_filters") || "{}");
      const prisonStationId = (station as any) || storedFilters.station;

      if (!prisonStationId) {
        toast.error("Station is required. Please select a station before submitting.");
        setIsSubmitting(false);
        return;
      }

      const prisonerRecordData: any = {
        prisoner: prisonerId,
        prisoner_class: data.prisoner_class,
        escapee: formData.escapee || false,
        armed_personnel: formData.armed_personnel || false,
        extremely_violent: formData.extremely_violent || false,
        life_or_death_imprisonment: formData.life_or_death_imprisonment || false,
        commital: formData.commital || false,
        previous_convictions_count: formData.previous_convictions_count || 0,
        arrest_region: data.arrest_region,
        arrest_district: data.arrest_district,
        arrest_county: data.arrest_county,
        arrest_sub_county: data.arrest_sub_county,
        arrest_parish: data.arrest_parish,
        arrest_village: data.arrest_village,
        prison_station: prisonStationId,
      };

      // Submit or update prisoner record
      if (prisonerRecords.length > 0) {
        // Update existing record
        await updatePrisonerRecord(prisonerRecords[0].id, prisonerRecordData);
      } else {
        // Create new record
        await createPrisonerRecord(prisonerRecordData);
      }
      
      toast.success("Prisoner biodata and record submitted successfully!");
      
      // Clear form state and prisoner_id from localStorage on successful submission
      localStorage.removeItem("pmis_biodata_form_state");
      localStorage.removeItem("pmis_prisoner_number_reservation");
      localStorage.removeItem("pmis_admission_form_state");
      
      // Call the parent onSubmit callback
      onSubmit(biodataResponse);
      
      // Navigate to prisoner detail screen
      navigate(`/admissions-management/prisoners/${prisonerId}`);
    } catch (error: any) {
      console.error("Error submitting biodata:", error);
      
      // Check if it's a 400 validation error
      if (error?.response?.status === 400 && error?.response?.data) {
        const validationErrors = error.response.data;
        
        // Count total errors
        const errorCount = Object.keys(validationErrors).length;
        
        // Set field-level errors on the form
        Object.entries(validationErrors).forEach(([field, messages]: [string, any]) => {
          const errorMessage = Array.isArray(messages) ? messages[0] : messages;
          setError(field as keyof PrisonerBiodata, {
            type: 'manual',
            message: errorMessage,
          });

          if (Array.isArray(messages)) {
            messages.forEach((m) => {
              if (typeof m === 'string' && m.trim()) {
                toast.error(`${field.replace(/_/g, ' ')}: ${m}`);
              }
            });
          } else if (typeof messages === 'string' && messages.trim()) {
            toast.error(`${field.replace(/_/g, ' ')}: ${messages}`);
          }
        });
        
        // Display summary toast
        toast.error(`Validation failed: ${errorCount} field(s) require attention. Please check the form.`);
      } else {
        // Generic error message for other errors
        toast.error("Failed to submit prisoner biodata. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

const {
  register: registerArmedPersonnel,
  handleSubmit: handleSubmitArmedPersonnel,
  setValue: setArmedPersonnelValue,
  watch: watchArmedPersonnel,
  reset: resetArmedPersonnel,
  control: controlArmedPersonnel,
  formState: { errors: armedPersonnelErrors },
} = useForm<ArmedPersonnel>();

  // State for children management
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [currentChild, setCurrentChild] = useState<ChildRecord | null>(null);
  const [showChildForm, setShowChildForm] = useState(false);

  // State for next of kin management
  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>([]);
  const [currentNextOfKin, setCurrentNextOfKin] = useState<NextOfKin | null>(null);
  const [showNextOfKinForm, setShowNextOfKinForm] = useState(false);

  // Watch form values for selects
  const watchSex = watch("sex");
  const watchNationality = watch("nationality");
  const watchMaritalStatus = watch("marital_status");
  const watchEducationLevel = watch("education_level");
  const watchEmploymentStatus = watch("employment_status");
  const watchStatusOfWomen = watch("status_of_women");
  const watchReligion = watch("religion");
  const watchTribe = watch("tribe");
  const watchIdType = watch("id_type");
  const watchDesiredDistrictOfRelease = watch("desired_district_of_release");
  const watchPrisonerClass = watch("prisoner_class");
  const isArmedPersonnel = watch("armed_personnel");

  // State to store the selected sex object
  const [selectedSexData, setSelectedSexData] = useState<any>(null);
  
  // State to store the selected status of woman object
  const [selectedStatusOfWoman, setSelectedStatusOfWoman] = useState<any>(null);

  // Computed value to check if selected sex is Female (based on text/name only)
  const isFemale = useMemo(() => {
    console.log("Checking isFemale, selectedSexData:", selectedSexData);
    if (selectedSexData && selectedSexData.name) {
      const sexName = selectedSexData.name.toLowerCase().trim();
      console.log("Sex name:", sexName);
      return sexName === 'female' || sexName === 'f';
    }
    return false;
  }, [selectedSexData]);

  // Computed value to check if status contains "pregnant"
  const isPregnant = useMemo(() => {
    if (selectedStatusOfWoman && selectedStatusOfWoman.name) {
      const statusName = selectedStatusOfWoman.name.toLowerCase();
      console.log("Status of woman:", statusName);
      return statusName.includes('pregnant');
    }
    return false;
  }, [selectedStatusOfWoman]);

  // Computed value to check if status contains "with child"
  const isWithChild = useMemo(() => {
    if (selectedStatusOfWoman && selectedStatusOfWoman.name) {
      const statusName = selectedStatusOfWoman.name.toLowerCase();
      return statusName.includes('with child');
    }
    return false;
  }, [selectedStatusOfWoman]);

  // Watch address fields for Current Address
  const watchCurrentRegion = watch("address_region");
  const watchCurrentDistrict = watch("address_district");
  const watchCurrentCounty = watch("address_county");
  const watchCurrentSubCounty = watch("address_sub_county");
  const watchCurrentParish = watch("address_parish");
  const watchCurrentVillage = watch("address_village");

  // Watch address fields for Permanent Address
  const watchPermanentRegion = watch("permanent_region");
  const watchPermanentDistrict = watch("permanent_district");
  const watchPermanentCounty = watch("permanent_county");
  const watchPermanentSubCounty = watch("permanent_sub_county");
  const watchPermanentParish = watch("permanent_parish");
  const watchPermanentVillage = watch("permanent_village");

  // Watch address fields for Birth Location
  const watchBirthRegion = watch("birth_region");
  const watchBirthDistrict = watch("birth_district");
  const watchBirthCounty = watch("birth_county");
  const watchBirthSubCounty = watch("birth_sub_county");
  const watchBirthParish = watch("birth_parish");
  const watchBirthVillage = watch("birth_village");

  // Watch physical characteristics fields
  const watchBuild = watch("build");
  const watchFace = watch("face");
  const watchEyes = watch("eyes");
  const watchMouth = watch("mouth");
  const watchTeeth = watch("teeth");
  const watchLips = watch("lips");
  const watchEars = watch("ears");
  const watchHair = watch("hair");
  const watchSpeech = watch("speech");

  // Watch arrest location fields
  const watchArrestRegion = watch("arrest_region");
  const watchArrestDistrict = watch("arrest_district");
  const watchArrestCounty = watch("arrest_county");
  const watchArrestSubCounty = watch("arrest_sub_county");
  const watchArrestParish = watch("arrest_parish");
  const watchArrestVillage = watch("arrest_village");

  // Watch date fields for age calculation
  const watchDateOfBirth = watch("date_of_birth");
  const watchDateOfAdmission = watch("date_of_admission");

  // Auto-calculate age_on_admission when date_of_birth or date_of_admission changes
  useEffect(() => {
    if (watchDateOfBirth && watchDateOfAdmission) {
      const birthDate = new Date(watchDateOfBirth);
      const admissionDate = new Date(watchDateOfAdmission);
      
      // Calculate age in years
      let age = admissionDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = admissionDate.getMonth() - birthDate.getMonth();
      
      // Adjust age if birthday hasn't occurred yet in the admission year
      if (monthDiff < 0 || (monthDiff === 0 && admissionDate.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Only set if age is valid (non-negative)
      if (age >= 0) {
        setValueAndClearError("age_on_admission", age);
      }
    }
  }, [watchDateOfBirth, watchDateOfAdmission]);

  // Child handlers
  const onSubmitChild = (data: ChildRecord) => {
    if (currentChild) {
      // Editing existing child
      setChildren(
        children.map((c) =>
          c.id === currentChild.id
            ? { ...data, id: currentChild.id }
            : c,
        ),
      );
      toast.success("Child record updated successfully!");
    } else {
      // Adding new child
      const newChild = { ...data, id: Date.now().toString() };
      setChildren([...children, newChild]);
      toast.success("Child record added successfully!");
    }
    setShowChildForm(false);
    setCurrentChild(null);
  };

  const handleAddChild = () => {
    setCurrentChild(null);
    setShowChildForm(true);
  };

  const handleEditChild = (child: ChildRecord) => {
    setCurrentChild(child);
    setShowChildForm(true);
  };

  const handleDeleteChild = (childId: string) => {
    setChildren(children.filter((c) => c.id !== childId));
    toast.success("Child record removed");
  };

  const handleCancelChildForm = () => {
    setShowChildForm(false);
    setCurrentChild(null);
  };

  // Next of Kin handlers
  const onSubmitNextOfKin = (data: NextOfKin) => {
    if (currentNextOfKin) {
      // Editing existing next of kin
      setNextOfKin(
        nextOfKin.map((nok) =>
          nok.id === currentNextOfKin.id
            ? { ...data, id: currentNextOfKin.id }
            : nok,
        ),
      );
      toast.success("Next of Kin updated successfully!");
    } else {
      // Adding new next of kin
      const newNextOfKin = {
        ...data,
        id: Date.now().toString(),
      };
      setNextOfKin([...nextOfKin, newNextOfKin]);
      toast.success("Next of Kin added successfully!");
    }
    setShowNextOfKinForm(false);
    setCurrentNextOfKin(null);
  };

  const handleAddNextOfKin = () => {
    setCurrentNextOfKin(null);
    setShowNextOfKinForm(true);
  };

  const handleEditNextOfKin = (nok: NextOfKin) => {
    setCurrentNextOfKin(nok);
    setShowNextOfKinForm(true);
  };

  const handleDeleteNextOfKin = (nokId: string) => {
    setNextOfKin(nextOfKin.filter((nok) => nok.id !== nokId));
    toast.success("Next of Kin removed");
  };

  const handleCancelNextOfKinForm = () => {
    setShowNextOfKinForm(false);
    setCurrentNextOfKin(null);
  };
  
  return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-[#650000] flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prisoner Biodata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="personal"
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="personal">
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="identification">
                    Identification
                  </TabsTrigger>
                  <TabsTrigger value="address">
                    Address
                  </TabsTrigger>
                  <TabsTrigger value="physical">
                    Physical
                  </TabsTrigger>
                  <TabsTrigger value="record">
                    Record
                  </TabsTrigger>
                  <TabsTrigger value="next_of_kin">
                    Next of Kin
                  </TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent
                  value="personal"
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="first_name">
                        First Name{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        {...register("first_name", {
                          ...nameValidation,
                          required: "First name is required",
                        })}
                        placeholder="Enter first name"
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.first_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="middle_name">
                        Middle Name
                      </Label>
                      <Input
                        id="middle_name"
                        {...register("middle_name")}
                        placeholder="Enter middle name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="surname">
                        Surname{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="surname"
                        {...register("surname", {
                          required: "Surname is required",
                        })}
                        placeholder="Enter surname"
                      />
                      {errors.surname && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.surname.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="also_known_as">
                        Also Known As
                      </Label>
                      <Input
                        id="also_known_as"
                        {...register("also_known_as")}
                        placeholder="Aliases"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date_of_birth">
                        Date of Birth{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        {...register("date_of_birth", {
                          required: "Date of birth is required",
                          ...minimumAgeValidation(18),
                        })}
                      />
                      {errors.date_of_birth && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.date_of_birth.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="sex">
                        Sex{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <SexSelect
                        value={watchSex}
                        onValueChange={(value, sexObject) => {
                          setValueAndClearError("sex", value);
                          setSelectedSexData(sexObject);
                          console.log("Sex selected:", sexObject);
                        }}
                        placeholder="Select sex"
                      />
                      {errors.sex && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.sex.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="nationality">
                        Nationality{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <CountrySelect
                        value={watchNationality}
                        onValueChange={(value) => setValueAndClearError("nationality", value)}
                        placeholder="Select nationality"
                      />
                      {errors.nationality && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.nationality.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="marital_status">
                        Marital Status
                      </Label>
                      <MaritalStatusSelect
                        value={watchMaritalStatus}
                        onValueChange={(value) => setValueAndClearError("marital_status", value)}
                        placeholder="Select marital status"
                      />
                    </div>

                    <div>
                      <Label htmlFor="religion">Religion</Label>
                      <ReligionSelect
                        value={watchReligion}
                        onValueChange={(value) => setValueAndClearError("religion", value)}
                        placeholder="Select religion"
                      />
                      {errors.religion && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.religion.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="fathers_name">
                        Father's Name
                      </Label>
                      <Input
                        id="fathers_name"
                        {...register("fathers_name")}
                        placeholder="Enter father's name"
                      />
                      {errors.fathers_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fathers_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="mothers_name">
                        Mother's Name
                      </Label>
                      <Input
                        id="mothers_name"
                        {...register("mothers_name")}
                        placeholder="Enter mother's name"
                      />
                      {errors.mothers_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.mothers_name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="tribe">Tribe</Label>
                      <TribeSelect
                        value={watchTribe}
                        onValueChange={(value) => setValueAndClearError("tribe", value)}
                        placeholder="Select tribe"
                      />
                      {errors.tribe && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tribe.message}
                        </p>
                      )}
                    </div>

                    {/* Status of Women - Only visible for Female prisoners */}
                    {isFemale && (
                      <div>
                        <Label htmlFor="status_of_women">
                          Status of Women
                        </Label>
                        <StatusOfWomanSelect
                          value={watchStatusOfWomen}
                          onValueChange={(value, statusObject) => {
                            setValueAndClearError("status_of_women", value);
                            setSelectedStatusOfWoman(statusObject);
                            console.log("Status of woman selected:", statusObject);
                          }}
                          placeholder="Select status of women"
                        />
                        {errors.status_of_women && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.status_of_women.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Estimated Age of Pregnancy - Only visible when pregnant */}
                    {isFemale && isPregnant && (
                      <div>
                        <Label htmlFor="estimated_age_of_pregnancy">
                          Estimated Age of Pregnancy (weeks)
                        </Label>
                        <Input
                          id="estimated_age_of_pregnancy"
                          type="number"
                          min="0"
                          {...register("estimated_age_of_pregnancy", {
                            valueAsNumber: true,
                            min: { value: 0, message: "Must be a positive number" }
                          })}
                          placeholder="Enter weeks"
                        />
                        {errors.estimated_age_of_pregnancy && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.estimated_age_of_pregnancy.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Children Section - Only visible when status contains "with child" */}
                  {isFemale && isWithChild && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          Children Records
                        </h4>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddChild}
                          className="bg-[#650000] hover:bg-[#4a0000]"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Child
                        </Button>
                      </div>

                      {children.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Date of Birth</TableHead>
                              <TableHead>Sex</TableHead>
                              <TableHead>Age on Admission</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {children.map((child) => (
                              <TableRow key={child.id}>
                                <TableCell>{child.name}</TableCell>
                                <TableCell>{child.date_of_birth}</TableCell>
                                <TableCell>{child.sex}</TableCell>
                                <TableCell>{child.age_on_admission}</TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditChild(child)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteChild(child.id!)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}

                      {/* Child Form Dialog */}
                      {showChildForm && (
                        <ChildRecordForm
                          currentChild={currentChild}
                          onSubmit={onSubmitChild}
                          onCancel={handleCancelChildForm}
                        />
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Identification Tab */}
                <TabsContent
                  value="identification"
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="id_type">ID Type</Label>
                      <IdTypeSelect
                        value={watchIdType}
                        onValueChange={(value) => setValueAndClearError("id_type", value)}
                        placeholder="Select ID type"
                      />
                      {errors.id_type && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.id_type.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="id_number">
                        ID Number
                      </Label>
                      <Input
                        id="id_number"
                        {...register("id_number")}
                        placeholder="Enter ID number"
                      />
                      {errors.id_number && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.id_number.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="education_level">
                        Education Level
                      </Label>
                      <EducationLevelSelect
                        value={watchEducationLevel}
                        onValueChange={(value) => setValueAndClearError("education_level", value)}
                        placeholder="Select education level"
                      />
                      {errors.education_level && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.education_level.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="employment_status">
                        Employment Status
                      </Label>
                      <EmploymentStatusSelect
                        value={watchEmploymentStatus}
                        onValueChange={(value) => setValueAndClearError("employment_status", value)}
                        placeholder="Select employment status"
                      />
                      {errors.employment_status && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.employment_status.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="employer">Employer</Label>
                      <Input
                        id="employer"
                        {...register("employer")}
                        placeholder="Enter employer name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employment_description">
                        Employment Description
                      </Label>
                      <Input
                        id="employment_description"
                        {...register("employment_description")}
                        placeholder="Describe employment"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date_of_admission">
                        Date of Admission{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date_of_admission"
                        type="date"
                        {...register("date_of_admission", {
                          required:
                            "Date of admission is required",
                          ...pastOrTodayDateValidation,
                        })}
                      />
                      {errors.date_of_admission && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.date_of_admission.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 pt-6">
                      <div className="flex items-center gap-2">
                        <Controller
                          name="habitual_criminal"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              id="habitual_criminal"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor="habitual_criminal"
                          className="cursor-pointer"
                        >
                          Habitual Criminal
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Controller
                          name="deformity"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              id="deformity"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor="deformity"
                          className="cursor-pointer"
                        >
                          Has Deformity
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Address Tab */}
                <TabsContent
                  value="address"
                  className="space-y-4"
                >
                  <h4 className="text-sm text-gray-600">
                    Current Address
                  </h4>
                  <AddressSelect
                    region={watchCurrentRegion}
                    district={watchCurrentDistrict}
                    county={watchCurrentCounty}
                    subCounty={watchCurrentSubCounty}
                    parish={watchCurrentParish}
                    village={watchCurrentVillage}
                    onRegionChange={(value) => setValueAndClearError("address_region", value)}
                    onDistrictChange={(value) => setValueAndClearError("address_district", value)}
                    onCountyChange={(value) => setValueAndClearError("address_county", value)}
                    onSubCountyChange={(value) => setValueAndClearError("address_sub_county", value)}
                    onParishChange={(value) => setValueAndClearError("address_parish", value)}
                    onVillageChange={(value) => setValueAndClearError("address_village", value)}
                    gridCols={3}
                  />
                  {(errors.address_region || errors.address_district || errors.address_county || 
                    errors.address_sub_county || errors.address_parish || errors.address_village) && (
                    <div className="text-red-500 text-sm mt-2 space-y-1">
                      {errors.address_region && <p>{errors.address_region.message}</p>}
                      {errors.address_district && <p>{errors.address_district.message}</p>}
                      {errors.address_county && <p>{errors.address_county.message}</p>}
                      {errors.address_sub_county && <p>{errors.address_sub_county.message}</p>}
                      {errors.address_parish && <p>{errors.address_parish.message}</p>}
                      {errors.address_village && <p>{errors.address_village.message}</p>}
                    </div>
                  )}

                  <Separator />

                  <h4 className="text-sm text-gray-600">
                    Permanent Address
                  </h4>
                  <AddressSelect
                    region={watchPermanentRegion}
                    district={watchPermanentDistrict}
                    county={watchPermanentCounty}
                    subCounty={watchPermanentSubCounty}
                    parish={watchPermanentParish}
                    village={watchPermanentVillage}
                    onRegionChange={(value) => setValueAndClearError("permanent_region", value)}
                    onDistrictChange={(value) => setValueAndClearError("permanent_district", value)}
                    onCountyChange={(value) => setValueAndClearError("permanent_county", value)}
                    onSubCountyChange={(value) => setValueAndClearError("permanent_sub_county", value)}
                    onParishChange={(value) => setValueAndClearError("permanent_parish", value)}
                    onVillageChange={(value) => setValueAndClearError("permanent_village", value)}
                    gridCols={3}
                  />
                  {(errors.permanent_region || errors.permanent_district || errors.permanent_county || 
                    errors.permanent_sub_county || errors.permanent_parish || errors.permanent_village) && (
                    <div className="text-red-500 text-sm mt-2 space-y-1">
                      {errors.permanent_region && <p>{errors.permanent_region.message}</p>}
                      {errors.permanent_district && <p>{errors.permanent_district.message}</p>}
                      {errors.permanent_county && <p>{errors.permanent_county.message}</p>}
                      {errors.permanent_sub_county && <p>{errors.permanent_sub_county.message}</p>}
                      {errors.permanent_parish && <p>{errors.permanent_parish.message}</p>}
                      {errors.permanent_village && <p>{errors.permanent_village.message}</p>}
                    </div>
                  )}

                  <Separator />

                  <h4 className="text-sm text-gray-600">
                    Birth Location
                  </h4>
                  <AddressSelect
                    region={watchBirthRegion}
                    district={watchBirthDistrict}
                    county={watchBirthCounty}
                    subCounty={watchBirthSubCounty}
                    parish={watchBirthParish}
                    village={watchBirthVillage}
                    onRegionChange={(value) => setValueAndClearError("birth_region", value)}
                    onDistrictChange={(value) => setValueAndClearError("birth_district", value)}
                    onCountyChange={(value) => setValueAndClearError("birth_county", value)}
                    onSubCountyChange={(value) => setValueAndClearError("birth_sub_county", value)}
                    onParishChange={(value) => setValueAndClearError("birth_parish", value)}
                    onVillageChange={(value) => setValueAndClearError("birth_village", value)}
                    gridCols={3}
                  />
                  {(errors.birth_region || errors.birth_district || errors.birth_county || 
                    errors.birth_sub_county || errors.birth_parish || errors.birth_village) && (
                    <div className="text-red-500 text-sm mt-2 space-y-1">
                      {errors.birth_region && <p>{errors.birth_region.message}</p>}
                      {errors.birth_district && <p>{errors.birth_district.message}</p>}
                      {errors.birth_county && <p>{errors.birth_county.message}</p>}
                      {errors.birth_sub_county && <p>{errors.birth_sub_county.message}</p>}
                      {errors.birth_parish && <p>{errors.birth_parish.message}</p>}
                      {errors.birth_village && <p>{errors.birth_village.message}</p>}
                    </div>
                  )}
                </TabsContent>

                {/* Physical Characteristics Tab */}
                <TabsContent
                  value="physical"
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="height">
                        Height (cm)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        max="500"
                        min="1"
                        {...register("height", {
                          valueAsNumber: true,
                          max: { value: 500, message: "Height must be no more than 500 cm" },
                          min: { value: 1, message: "Height must be at least 1 cm" }
                        })}
                        placeholder="Enter height in cm (e.g., 75.50)"
                      />
                      {errors.height && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.height.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Build</Label>
                      <BuildSelect
                        value={watchBuild}
                        onValueChange={(value) => setValueAndClearError("build", value)}
                      />
                      {errors.build && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.build.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Face</Label>
                      <FaceSelect
                        value={watchFace}
                        onValueChange={(value) => setValueAndClearError("face", value)}
                      />
                      {errors.face && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.face.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Eyes</Label>
                      <EyeSelect
                        value={watchEyes}
                        onValueChange={(value) => setValueAndClearError("eyes", value)}
                      />
                      {errors.eyes && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.eyes.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Mouth</Label>
                      <MouthSelect
                        value={watchMouth}
                        onValueChange={(value) => setValueAndClearError("mouth", value)}
                      />
                      {errors.mouth && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.mouth.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Teeth</Label>
                      <TeethSelect
                        value={watchTeeth}
                        onValueChange={(value) => setValueAndClearError("teeth", value)}
                      />
                      {errors.teeth && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.teeth.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Lips</Label>
                      <LipSelect
                        value={watchLips}
                        onValueChange={(value) => setValueAndClearError("lips", value)}
                      />
                      {errors.lips && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lips.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Ears</Label>
                      <EarSelect
                        value={watchEars}
                        onValueChange={(value) => setValueAndClearError("ears", value)}
                      />
                      {errors.ears && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.ears.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Hair</Label>
                      <HairSelect
                        value={watchHair}
                        onValueChange={(value) => setValueAndClearError("hair", value)}
                      />
                      {errors.hair && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.hair.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Speech</Label>
                      <SpeechSelect
                        value={watchSpeech}
                        onValueChange={(value) => setValueAndClearError("speech", value)}
                      />
                      {errors.speech && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.speech.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="marks">
                        Distinguishing Marks
                      </Label>
                      <Textarea
                        id="marks"
                        {...register("marks")}
                        placeholder="Describe any scars, tattoos, birthmarks..."
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <Label htmlFor="description">
                        General Description
                      </Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Overall physical description..."
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Prisoner Record Tab */}

                <TabsContent
                  value="record"
                  className="space-y-4"
                >
                  {/* Existing Prisoner Records Display */}
                  {bioData?.prisoner && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium">Prisoner Records History</h4>
                        {loadingRecords && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                      
                      {prisonerRecords.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Prisoner Class</TableHead>
                                <TableHead>Prison Station</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Security Rating</TableHead>
                                <TableHead>Created</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {prisonerRecords.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>{record.prisoner_class_name}</TableCell>
                                  <TableCell>{record.prison_station_name}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {record.escapee && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                          Escapee
                                        </span>
                                      )}
                                      {record.armed_personnel && (
                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                                          Armed
                                        </span>
                                      )}
                                      {record.extremely_violent && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                                          Violent
                                        </span>
                                      )}
                                      {record.life_or_death_imprisonment && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                                          Life/Death
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>{record.avg_security_rating}/5</TableCell>
                                  <TableCell>
                                    {new Date(record.created_datetime).toLocaleDateString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        !loadingRecords && (
                          <p className="text-sm text-gray-500 italic">
                            No prisoner records found. Fill out the form below to create one.
                          </p>
                        )
                      )}
                      <Separator className="mt-6" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prisoner_class">
                        Prisoner Class
                      </Label>
                      <PrisonerClassSelect
                        value={watchPrisonerClass}
                        onValueChange={(value) => setValueAndClearError("prisoner_class", value)}
                        placeholder="Select prisoner class"
                      />
                      {errors.prisoner_class && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.prisoner_class.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="desired_district_of_release">
                        Desired District of Release
                      </Label>
                      <DistrictSelect
                        value={watchDesiredDistrictOfRelease}
                        onValueChange={(value) => setValueAndClearError("desired_district_of_release", value)}
                        placeholder="Select district"
                        ignoreRegion={true}
                      />
                      {errors.desired_district_of_release && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.desired_district_of_release.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />
                  <div className="space-y-4">
                    <h4 className="mb-4">Prisoner Tagging</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Controller
                          name="escapee"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              id="escapee"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor="escapee"
                          className="cursor-pointer"
                        >
                          Escapee
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Controller
                          name="armed_personnel"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              id="armed_personnel"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor="armed_personnel"
                          className="cursor-pointer"
                        >
                          Armed Personnel
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Controller
                          name="extremely_violent"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              id="extremely_violent"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor="extremely_violent"
                          className="cursor-pointer"
                        >
                          Extremely Violent
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Controller
                          name="life_or_death_imprisonment"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              id="life_or_death_imprisonment"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor="life_or_death_imprisonment"
                          className="cursor-pointer"
                        >
                          Life or Death Imprisonment
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Controller
                          name="commital"
                          control={control}
                          defaultValue={false}
                          render={({ field }) => (
                            <Checkbox
                              id="commital"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label
                          htmlFor="commital"
                          className="cursor-pointer"
                        >
                          Commital
                        </Label>
                      </div>

                      <div>
                        <Label htmlFor="previous_convictions_count">
                          Previous Convictions Count
                        </Label>
                        <Input
                          id="previous_convictions_count"
                          type="number"
                          {...register(
                            "previous_convictions_count",
                          )}
                          placeholder="Number of previous convictions"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Armed Personnel Details Section */}
                    {isArmedPersonnel && (
                      <>
                        <div className="space-y-4">
                          <h4 className="mb-4">
                            Armed Personnel Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="armed_force">
                                Armed Force *
                              </Label>
                              <Controller
                                name="armed_force"
                                control={controlArmedPersonnel}
                                render={({ field }) => (
                                  <ArmedForceSelect
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select armed force"
                                  />
                                )}
                              />
                            </div>

                            <div>
                              <Label htmlFor="armed_forces_status">
                                Armed Force Status *
                              </Label>
                              <Controller
                                name="armed_forces_status"
                                control={controlArmedPersonnel}
                                render={({ field }) => (
                                  <ArmedForceStatusSelect
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select armed force status"
                                  />
                                )}
                              />
                            </div>

                            <div>
                              <Label htmlFor="force_number">
                                Force Number
                              </Label>
                              <Input
                                id="force_number"
                                {...registerArmedPersonnel("force_number")}
                                placeholder="Enter force number"
                              />
                            </div>

                            <div>
                              <Label htmlFor="unit">Unit</Label>
                              <Input
                                id="unit"
                                {...registerArmedPersonnel(
                                  "unit",
                                )}
                                placeholder="Enter unit"
                              />
                            </div>

                            <div>
                              <Label htmlFor="division">
                                Division
                              </Label>
                              <Input
                                id="division"
                                {...registerArmedPersonnel(
                                  "division",
                                )}
                                placeholder="Enter division"
                              />
                            </div>

                            <div>
                              <Label htmlFor="station">
                                Station
                              </Label>
                              <Input
                                id="station"
                                {...registerArmedPersonnel(
                                  "station",
                                )}
                                placeholder="Enter station"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Controller
                                name="government_forces"
                                control={controlArmedPersonnel}
                                defaultValue={false}
                                render={({ field }) => (
                                  <Checkbox
                                    id="government_forces"
                                    checked={field.value}
                                    onCheckedChange={
                                      field.onChange
                                    }
                                  />
                                )}
                              />
                              <Label
                                htmlFor="government_forces"
                                className="cursor-pointer"
                              >
                                Government Forces
                              </Label>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="armed_remarks">
                              Remarks
                            </Label>
                            <Textarea
                              id="armed_remarks"
                              {...registerArmedPersonnel(
                                "remarks",
                              )}
                              placeholder="Enter any additional remarks about armed personnel"
                              rows={3}
                            />
                          </div>
                        </div>

                        <Separator />
                      </>
                    )}

                    <div>
                      <h4 className="mb-4">Arrest Location</h4>
                      <AddressSelect
                        region={watchArrestRegion}
                        district={watchArrestDistrict}
                        county={watchArrestCounty}
                        subCounty={watchArrestSubCounty}
                        parish={watchArrestParish}
                        village={watchArrestVillage}
                        onRegionChange={(value) => setValueAndClearError("arrest_region", value)}
                        onDistrictChange={(value) => setValueAndClearError("arrest_district", value)}
                        onCountyChange={(value) => setValueAndClearError("arrest_county", value)}
                        onSubCountyChange={(value) => setValueAndClearError("arrest_sub_county", value)}
                        onParishChange={(value) => setValueAndClearError("arrest_parish", value)}
                        onVillageChange={(value) => setValueAndClearError("arrest_village", value)}
                        gridCols={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Next of Kin Tab */}
                <TabsContent
                  value="next_of_kin"
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm">
                        Next of Kin Records
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddNextOfKin}
                        className="bg-[#650000] hover:bg-[#4a0000]"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Next of Kin
                      </Button>
                    </div>

                    {nextOfKin.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Relationship</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>ID Number</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nextOfKin.map((nok) => (
                            <TableRow key={nok.id}>
                              <TableCell>{`${nok.first_name} ${nok.middle_name || ""} ${nok.surname}`}</TableCell>
                              <TableCell>
                                {nok.relationship}
                              </TableCell>
                              <TableCell>
                                {nok.phone_number}
                              </TableCell>
                              <TableCell>
                                {nok.id_number}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleEditNextOfKin(nok)
                                    }
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteNextOfKin(
                                        nok.id!,
                                      )
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}

                    {/* Next of Kin Form Dialog */}
                    {showNextOfKinForm && (
                      <NextOfKinForm
                        currentNextOfKin={currentNextOfKin}
                        onSubmit={onSubmitNextOfKin}
                        onCancel={handleCancelNextOfKinForm}
                      />
                    )}
                  </div>
                </TabsContent>

                {/* Other Information Tab */}
                <TabsContent
                  value="other"
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="photo">
                        Photo Upload
                      </Label>
                      <FileUpload
                        id="photo"
                        name="photo"
                        allowedFileTypes={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
                        description="Upload prisoner's photo (PNG, JPEG, or WebP)"
                        maxSizeMB={3}
                        icon={<User className="h-10 w-10" />}
                        onFileChange={(base64, file) => {
                          setValue("photo", base64);
                        }}
                        value={watch("photo")}
                      />
                      {errors.photo && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.photo.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="finger_print">
                        Fingerprint Upload
                      </Label>
                      <FileUpload
                        id="finger_print"
                        name="finger_print"
                        allowedFileTypes={["image/png", "image/jpeg", "image/jpg", "application/pdf"]}
                        description="Upload fingerprint scan (Image or PDF)"
                        maxSizeMB={5}
                        icon={<Fingerprint className="h-10 w-10" />}
                        onFileChange={(base64, file) => {
                          setValue("finger_print", base64);
                        }}
                        value={watch("finger_print")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="age_on_admission">
                        Age on Admission
                      </Label>
                      <Input
                        id="age_on_admission"
                        type="number"
                        disabled
                        {...register("age_on_admission")}
                        placeholder="Enter age"
                      />
                      {errors.age_on_admission && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.age_on_admission.message}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="submit"
                  className="bg-[#650000] hover:bg-[#4a0000]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : prisonerCategory === "DEBTOR" ? (
                    <>
                      Next{" "}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit Admission
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
  );
};

export default PrisonerBiodataForm;

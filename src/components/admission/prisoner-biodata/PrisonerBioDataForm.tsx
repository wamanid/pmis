import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Separator } from "../../ui/separator";
import { PrisonerBioData } from "./PrisonerBioDataList";
import { ArmedPersonnel, ChildRecord, NextOfKin } from "../../../models/admission/";
import { CardContent } from "../../ui/card";
import { Card } from "../../ui/card";
import { CardHeader } from "../../ui/card";
import { CardTitle } from "../../ui/card";
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
} from "lucide-react";

interface PrisonerBioDataFormProps {
  bioData: PrisonerBioData | null;
  onSubmit: (data: PrisonerBioData) => void;
  onCancel: () => void;
  prisonerCategory?: string;
}


const PrisonerBioDataForm: React.FC<PrisonerBioDataFormProps> = ({
  bioData,
  onSubmit,
  onCancel,
  prisonerCategory,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PrisonerBioData>({
    defaultValues: bioData || {
      is_active: true,
      first_name: "",
      surname: "",
      date_of_birth: "",
      date_of_admission: "",
    },
  });

  useEffect(() => {
    if (bioData) {
      reset(bioData);
      
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
    }
  }, [bioData, reset, setValue]);

  const handleFormSubmit = (data: PrisonerBioData) => {
    onSubmit(data);
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

  // Child form hook
  const {
    register: registerChild,
    handleSubmit: handleSubmitChild,
    setValue: setChildValue,
    watch: watchChild,
    reset: resetChild,
    control: controlChild,
    formState: { errors: childErrors },
  } = useForm<ChildRecord>();

  // Next of Kin form hook
  const {
    register: registerNextOfKin,
    handleSubmit: handleSubmitNextOfKin,
    setValue: setNextOfKinValue,
    watch: watchNextOfKin,
    reset: resetNextOfKin,
    control: controlNextOfKin,
    formState: { errors: nextOfKinErrors },
  } = useForm<NextOfKin>();

  // State for children management
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [currentChild, setCurrentChild] = useState<ChildRecord | null>(null);
  const [showChildForm, setShowChildForm] = useState(false);

  // State for next of kin management
  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>([]);
  const [currentNextOfKin, setCurrentNextOfKin] = useState<NextOfKin | null>(null);
  const [showNextOfKinForm, setShowNextOfKinForm] = useState(false);

  // Toast notification helper
  const toast = {
    success: (message: string) => {
      console.log('Success:', message);
      // TODO: Integrate with actual toast library
    },
    error: (message: string) => {
      console.error('Error:', message);
      // TODO: Integrate with actual toast library
    }
  };

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
  const isArmedPersonnel = watch("armed_personnel");

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
    resetChild();
  };

  const handleAddChild = () => {
    setCurrentChild(null);
    resetChild();
    setShowChildForm(true);
  };

  const handleEditChild = (child: ChildRecord) => {
    setCurrentChild(child);
    // Populate form with child data
    Object.keys(child).forEach((key) => {
      setChildValue(
        key as keyof ChildRecord,
        child[key as keyof ChildRecord],
      );
    });
    setShowChildForm(true);
  };

  const handleDeleteChild = (childId: string) => {
    setChildren(children.filter((c) => c.id !== childId));
    toast.success("Child record removed");
  };

  const handleCancelChildForm = () => {
    setShowChildForm(false);
    setCurrentChild(null);
    resetChild();
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
    resetNextOfKin();
  };

  const handleAddNextOfKin = () => {
    setCurrentNextOfKin(null);
    resetNextOfKin();
    setShowNextOfKinForm(true);
  };

  const handleEditNextOfKin = (nok: NextOfKin) => {
    setCurrentNextOfKin(nok);
    // Populate form with next of kin data
    Object.keys(nok).forEach((key) => {
      setNextOfKinValue(
        key as keyof NextOfKin,
        nok[key as keyof NextOfKin],
      );
    });
    setShowNextOfKinForm(true);
  };

  const handleDeleteNextOfKin = (nokId: string) => {
    setNextOfKin(nextOfKin.filter((nok) => nok.id !== nokId));
    toast.success("Next of Kin removed");
  };

  const handleCancelNextOfKinForm = () => {
    setShowNextOfKinForm(false);
    setCurrentNextOfKin(null);
    resetNextOfKin();
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
                        onValueChange={(value) => setValue("sex", value)}
                        placeholder="Select sex"
                      />
                    </div>

                    <div>
                      <Label htmlFor="nationality">
                        Nationality{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <CountrySelect
                        value={watchNationality}
                        onValueChange={(value) => setValue("nationality", value)}
                        placeholder="Select nationality"
                      />
                    </div>

                    <div>
                      <Label htmlFor="marital_status">
                        Marital Status
                      </Label>
                      <MaritalStatusSelect
                        value={watchMaritalStatus}
                        onValueChange={(value) => setValue("marital_status", value)}
                        placeholder="Select marital status"
                      />
                    </div>

                    <div>
                      <Label htmlFor="religion">Religion</Label>
                      <ReligionSelect
                        value={watchReligion}
                        onValueChange={(value) => setValue("religion", value)}
                        placeholder="Select religion"
                      />
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
                    </div>

                    <div>
                      <Label htmlFor="tribe">Tribe</Label>
                      <TribeSelect
                        value={watchTribe}
                        onValueChange={(value) => setValue("tribe", value)}
                        placeholder="Select tribe"
                      />
                    </div>
                  </div>
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
                        onValueChange={(value) => setValue("id_type", value)}
                        placeholder="Select ID type"
                      />
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
                    </div>

                    <div>
                      <Label htmlFor="education_level">
                        Education Level
                      </Label>
                      <EducationLevelSelect
                        value={watchEducationLevel}
                        onValueChange={(value) => setValue("education_level", value)}
                        placeholder="Select education level"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employment_status">
                        Employment Status
                      </Label>
                      <EmploymentStatusSelect
                        value={watchEmploymentStatus}
                        onValueChange={(value) => setValue("employment_status", value)}
                        placeholder="Select employment status"
                      />
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
                    onRegionChange={(value) => setValue("address_region", value)}
                    onDistrictChange={(value) => setValue("address_district", value)}
                    onCountyChange={(value) => setValue("address_county", value)}
                    onSubCountyChange={(value) => setValue("address_sub_county", value)}
                    onParishChange={(value) => setValue("address_parish", value)}
                    onVillageChange={(value) => setValue("address_village", value)}
                    gridCols={3}
                  />

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
                    onRegionChange={(value) => setValue("permanent_region", value)}
                    onDistrictChange={(value) => setValue("permanent_district", value)}
                    onCountyChange={(value) => setValue("permanent_county", value)}
                    onSubCountyChange={(value) => setValue("permanent_sub_county", value)}
                    onParishChange={(value) => setValue("permanent_parish", value)}
                    onVillageChange={(value) => setValue("permanent_village", value)}
                    gridCols={3}
                  />
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
                        {...register("height")}
                        placeholder="Enter height in cm"
                      />
                    </div>

                    <div>
                      <Label>Build</Label>
                      <BuildSelect
                        value={watchBuild}
                        onValueChange={(value) => setValue("build", value)}
                      />
                    </div>

                    <div>
                      <Label>Face</Label>
                      <FaceSelect
                        value={watchFace}
                        onValueChange={(value) => setValue("face", value)}
                      />
                    </div>

                    <div>
                      <Label>Eyes</Label>
                      <EyeSelect
                        value={watchEyes}
                        onValueChange={(value) => setValue("eyes", value)}
                      />
                    </div>

                    <div>
                      <Label>Mouth</Label>
                      <MouthSelect
                        value={watchMouth}
                        onValueChange={(value) => setValue("mouth", value)}
                      />
                    </div>

                    <div>
                      <Label>Teeth</Label>
                      <TeethSelect
                        value={watchTeeth}
                        onValueChange={(value) => setValue("teeth", value)}
                      />
                    </div>

                    <div>
                      <Label>Lips</Label>
                      <LipSelect
                        value={watchLips}
                        onValueChange={(value) => setValue("lips", value)}
                      />
                    </div>

                    <div>
                      <Label>Ears</Label>
                      <EarSelect
                        value={watchEars}
                        onValueChange={(value) => setValue("ears", value)}
                      />
                    </div>

                    <div>
                      <Label>Hair</Label>
                      <HairSelect
                        value={watchHair}
                        onValueChange={(value) => setValue("hair", value)}
                      />
                    </div>

                    <div>
                      <Label>Speech</Label>
                      <SpeechSelect
                        value={watchSpeech}
                        onValueChange={(value) => setValue("speech", value)}
                      />
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
                              <Input
                                id="armed_force"
                                {...registerArmedPersonnel("armed_force")}
                                placeholder="Enter armed force"
                              />
                            </div>

                            <div>
                              <Label htmlFor="armed_forces_status">
                                Armed Force Status *
                              </Label>
                              <Input
                                id="armed_forces_status"
                                {...registerArmedPersonnel("armed_forces_status")}
                                placeholder="Enter armed force status"
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
                        onRegionChange={(value) => setValue("arrest_region", value)}
                        onDistrictChange={(value) => setValue("arrest_district", value)}
                        onCountyChange={(value) => setValue("arrest_county", value)}
                        onSubCountyChange={(value) => setValue("arrest_sub_county", value)}
                        onParishChange={(value) => setValue("arrest_parish", value)}
                        onVillageChange={(value) => setValue("arrest_village", value)}
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
                      <Card className="border-2 border-[#650000]">
                        <CardHeader>
                          <CardTitle className="text-[#650000]">
                            {currentNextOfKin
                              ? "Edit Next of Kin"
                              : "Add Next of Kin"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="nok_first_name">
                                  First Name{" "}
                                  <span className="text-red-500">
                                    *
                                  </span>
                                </Label>
                                <Input
                                  id="nok_first_name"
                                  {...registerNextOfKin(
                                    "first_name",
                                    {
                                      required:
                                        "First name is required",
                                    },
                                  )}
                                  placeholder="Enter first name"
                                />
                                {nextOfKinErrors.first_name && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      nextOfKinErrors.first_name
                                        .message
                                    }
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="nok_middle_name">
                                  Middle Name
                                </Label>
                                <Input
                                  id="nok_middle_name"
                                  {...registerNextOfKin(
                                    "middle_name",
                                  )}
                                  placeholder="Enter middle name"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_surname">
                                  Surname{" "}
                                  <span className="text-red-500">
                                    *
                                  </span>
                                </Label>
                                <Input
                                  id="nok_surname"
                                  {...registerNextOfKin(
                                    "surname",
                                    {
                                      required:
                                        "Surname is required",
                                    },
                                  )}
                                  placeholder="Enter surname"
                                />
                                {nextOfKinErrors.surname && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {
                                      nextOfKinErrors.surname
                                        .message
                                    }
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label htmlFor="nok_relationship">
                                  Relationship
                                </Label>
                                <Input
                                  id="nok_relationship"
                                  {...registerNextOfKin(
                                    "relationship",
                                  )}
                                  placeholder="e.g., Father, Mother, Spouse"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_sex">
                                  Sex
                                </Label>
                                <SexSelect
                                  value={watchNextOfKin("sex")}
                                  onValueChange={(value) => setNextOfKinValue("sex", value)}
                                  placeholder="Select sex"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_phone">
                                  Phone Number
                                </Label>
                                <Input
                                  id="nok_phone"
                                  {...registerNextOfKin(
                                    "phone_number",
                                  )}
                                  placeholder="+256700000000"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_alt_phone">
                                  Alternate Phone Number
                                </Label>
                                <Input
                                  id="nok_alt_phone"
                                  {...registerNextOfKin(
                                    "alternate_phone_number",
                                  )}
                                  placeholder="+256700000000"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_id_type">
                                  ID Type
                                </Label>
                                <Input
                                  id="nok_id_type"
                                  {...registerNextOfKin(
                                    "id_type",
                                  )}
                                  placeholder="e.g., National ID, Passport"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_id_number">
                                  ID Number
                                </Label>
                                <Input
                                  id="nok_id_number"
                                  {...registerNextOfKin(
                                    "id_number",
                                  )}
                                  placeholder="Enter ID number"
                                />
                              </div>

                              <div>
                                <Label htmlFor="nok_lc1">
                                  LC1 Chairman
                                </Label>
                                <Input
                                  id="nok_lc1"
                                  {...registerNextOfKin("lc1")}
                                  placeholder="LC1 name"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <Controller
                                  name="discharge_property"
                                  control={controlNextOfKin}
                                  defaultValue={false}
                                  render={({ field }) => (
                                    <Checkbox
                                      id="discharge_property"
                                      checked={field.value}
                                      onCheckedChange={
                                        field.onChange
                                      }
                                    />
                                  )}
                                />
                                <Label
                                  htmlFor="discharge_property"
                                  className="cursor-pointer"
                                >
                                  Discharge Property to this
                                  person
                                </Label>
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="mb-4">
                                Next of Kin Address
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="nok_address_region">
                                    Region
                                  </Label>
                                  <Input
                                    id="nok_address_region"
                                    {...registerNextOfKin(
                                      "address_region",
                                    )}
                                    placeholder="Enter region"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_district">
                                    District
                                  </Label>
                                  <Input
                                    id="nok_address_district"
                                    {...registerNextOfKin(
                                      "address_district",
                                    )}
                                    placeholder="Enter district"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_county">
                                    County
                                  </Label>
                                  <Input
                                    id="nok_address_county"
                                    {...registerNextOfKin(
                                      "address_county",
                                    )}
                                    placeholder="Enter county"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_sub_county">
                                    Sub County
                                  </Label>
                                  <Input
                                    id="nok_address_sub_county"
                                    {...registerNextOfKin(
                                      "address_sub_county",
                                    )}
                                    placeholder="Enter sub county"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_parish">
                                    Parish
                                  </Label>
                                  <Input
                                    id="nok_address_parish"
                                    {...registerNextOfKin(
                                      "address_parish",
                                    )}
                                    placeholder="Enter parish"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="nok_address_village">
                                    Village
                                  </Label>
                                  <Input
                                    id="nok_address_village"
                                    {...registerNextOfKin(
                                      "address_village",
                                    )}
                                    placeholder="Enter village"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={
                                  handleCancelNextOfKinForm
                                }
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                className="bg-[#650000] hover:bg-[#4a0000]"
                                onClick={handleSubmitNextOfKin(
                                  onSubmitNextOfKin,
                                )}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {currentNextOfKin
                                  ? "Update Next of Kin"
                                  : "Add Next of Kin"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload photo
                        </p>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...register("photo")}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="finger_print">
                        Fingerprint Upload
                      </Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload fingerprint
                        </p>
                        <Input
                          id="finger_print"
                          type="file"
                          className="hidden"
                          {...register("finger_print")}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="age_on_admission">
                        Age on Admission
                      </Label>
                      <Input
                        id="age_on_admission"
                        type="number"
                        {...register("age_on_admission")}
                        placeholder="Enter age"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Status of Women Section - Only visible for Female prisoners */}
              {watchSex === "sex-2" && (
                <div className="mt-6 space-y-4">
                  <div className="pb-4 border-b">
                    <Label htmlFor="status_of_women">
                      Status of Women
                    </Label>
                    <StatusOfWomanSelect
                      value={watchStatusOfWomen}
                      onValueChange={(value) => setValue("status_of_women", value)}
                      placeholder="Select status of women"
                    />
                  </div>

                  {/* Estimated Duration of Pregnancy - Show if Pregnant or Pregnant + With Child */}
                  {(watchStatusOfWomen === "sow-1" ||
                    watchStatusOfWomen === "sow-3") && (
                    <div>
                      <Label htmlFor="estimated_age_of_pregnancy">
                        Estimated Duration of Pregnancy (weeks)
                      </Label>
                      <Input
                        id="estimated_age_of_pregnancy"
                        type="number"
                        {...register(
                          "estimated_age_of_pregnancy",
                        )}
                        placeholder="Enter estimated duration in weeks"
                      />
                    </div>
                  )}

                  {/* Children Section - Show if With Child or Pregnant + With Child */}
                  {(watchStatusOfWomen === "sow-2" ||
                    watchStatusOfWomen === "sow-3") && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm">
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
                              <TableHead>
                                Date of Birth
                              </TableHead>
                              <TableHead>Sex</TableHead>
                              <TableHead>
                                Age on Admission
                              </TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {children.map((child) => (
                              <TableRow key={child.id}>
                                <TableCell>
                                  {child.name}
                                </TableCell>
                                <TableCell>
                                  {child.date_of_birth}
                                </TableCell>
                                <TableCell>
                                  {child.sex}
                                </TableCell>
                                <TableCell>
                                  {child.age_on_admission}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleEditChild(child)
                                      }
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleDeleteChild(
                                          child.id!,
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

                      {/* Child Form Dialog */}
                      {showChildForm && (
                        <Card className="border-2 border-[#650000]">
                          <CardHeader>
                            <CardTitle className="text-[#650000]">
                              {currentChild
                                ? "Edit Child Record"
                                : "Add Child Record"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="child_name">
                                    Child Name{" "}
                                    <span className="text-red-500">
                                      *
                                    </span>
                                  </Label>
                                  <Input
                                    id="child_name"
                                    {...registerChild("name", {
                                      required:
                                        "Name is required",
                                    })}
                                    placeholder="Enter child's name"
                                  />
                                  {childErrors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {childErrors.name.message}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <Label htmlFor="child_dob">
                                    Date of Birth{" "}
                                    <span className="text-red-500">
                                      *
                                    </span>
                                  </Label>
                                  <Input
                                    id="child_dob"
                                    type="date"
                                    {...registerChild(
                                      "date_of_birth",
                                      {
                                        required:
                                          "Date of birth is required",
                                      },
                                    )}
                                  />
                                  {childErrors.date_of_birth && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {
                                        childErrors
                                          .date_of_birth.message
                                      }
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <Label htmlFor="child_sex">
                                    Sex
                                  </Label>
                                  <SexSelect
                                    value={watchChild("sex")}
                                    onValueChange={(value) => setChildValue("sex", value)}
                                    placeholder="Select sex"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="child_age">
                                    Age on Admission
                                  </Label>
                                  <Input
                                    id="child_age"
                                    type="number"
                                    {...registerChild(
                                      "age_on_admission",
                                    )}
                                    placeholder="Age in years"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="fathers_name">
                                    Father's Name
                                  </Label>
                                  <Input
                                    id="fathers_name"
                                    {...registerChild(
                                      "fathers_name",
                                    )}
                                    placeholder="Enter father's name"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="mothers_name">
                                    Mother's Name
                                  </Label>
                                  <Input
                                    id="mothers_name"
                                    {...registerChild(
                                      "mothers_name",
                                    )}
                                    placeholder="Enter mother's name"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="hospital_of_birth">
                                    Hospital of Birth
                                  </Label>
                                  <Input
                                    id="hospital_of_birth"
                                    {...registerChild(
                                      "hospital_of_birth",
                                    )}
                                    placeholder="Enter hospital"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="district_of_birth">
                                    District of Birth
                                  </Label>
                                  <Input
                                    id="district_of_birth"
                                    {...registerChild(
                                      "district_of_birth",
                                    )}
                                    placeholder="Enter district"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="relation">
                                    Relation to Prisoner
                                  </Label>
                                  <Input
                                    id="relation"
                                    {...registerChild(
                                      "relation",
                                    )}
                                    placeholder="e.g., Son, Daughter"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="physical_condition">
                                    Physical Condition
                                  </Label>
                                  <Input
                                    id="physical_condition"
                                    {...registerChild(
                                      "physical_condition",
                                    )}
                                    placeholder="Describe physical condition"
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <Label htmlFor="medical_condition">
                                    Medical Condition
                                  </Label>
                                  <Textarea
                                    id="medical_condition"
                                    {...registerChild(
                                      "medical_condition",
                                    )}
                                    placeholder="Describe any medical conditions..."
                                    rows={2}
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <Label htmlFor="child_description">
                                    Description
                                  </Label>
                                  <Textarea
                                    id="child_description"
                                    {...registerChild(
                                      "description",
                                    )}
                                    placeholder="Additional information about the child..."
                                    rows={2}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="child_photo">
                                    Photo Upload
                                  </Label>
                                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                      Click to upload
                                    </p>
                                    <Input
                                      id="child_photo"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      {...registerChild(
                                        "photo",
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={
                                    handleCancelChildForm
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  className="bg-[#650000] hover:bg-[#4a0000]"
                                  onClick={handleSubmitChild(
                                    onSubmitChild,
                                  )}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {currentChild
                                    ? "Update Child"
                                    : "Add Child"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="submit"
                  className="bg-[#650000] hover:bg-[#4a0000]"
                >
                  {prisonerCategory === "DEBTOR" ? (
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

export default PrisonerBioDataForm;

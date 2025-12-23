import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form@7.55.0";
import { Save, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Separator } from "../../ui/separator";
import { PrisonerBioData } from "./PrisonerBioDataList";

interface PrisonerBioDataFormProps {
  bioData: PrisonerBioData | null;
  onSubmit: (data: PrisonerBioData) => void;
  onCancel: () => void;
}

// Mock dropdown options
const mockSexOptions = [
  { id: "sex-1", name: "Male" },
  { id: "sex-2", name: "Female" },
];

const mockNationalities = [
  { id: "nationality-1", name: "Ugandan" },
  { id: "nationality-2", name: "Kenyan" },
  { id: "nationality-3", name: "Tanzanian" },
  { id: "nationality-4", name: "Rwandan" },
];

const mockMaritalStatuses = [
  { id: "marital-1", name: "Single" },
  { id: "marital-2", name: "Married" },
  { id: "marital-3", name: "Divorced" },
  { id: "marital-4", name: "Widowed" },
];

const mockEducationLevels = [
  { id: "edu-1", name: "None" },
  { id: "edu-2", name: "Primary" },
  { id: "edu-3", name: "Secondary" },
  { id: "edu-4", name: "Tertiary" },
  { id: "edu-5", name: "University" },
];

const mockEmploymentStatuses = [
  { id: "emp-1", name: "Employed" },
  { id: "emp-2", name: "Unemployed" },
  { id: "emp-3", name: "Self-Employed" },
  { id: "emp-4", name: "Student" },
];

const mockReligions = [
  { id: "rel-1", name: "Christianity" },
  { id: "rel-2", name: "Islam" },
  { id: "rel-3", name: "Hinduism" },
  { id: "rel-4", name: "Other" },
];

const mockIdTypes = [
  { id: "id-1", name: "National ID" },
  { id: "id-2", name: "Passport" },
  { id: "id-3", name: "Driving Permit" },
  { id: "id-4", name: "Other" },
];

const mockRegions = [
  { id: "region-1", name: "Central Region" },
  { id: "region-2", name: "Eastern Region" },
  { id: "region-3", name: "Northern Region" },
  { id: "region-4", name: "Western Region" },
];

const PrisonerBioDataForm: React.FC<PrisonerBioDataFormProps> = ({
  bioData,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
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
    }
  }, [bioData, reset]);

  const handleFormSubmit = (data: PrisonerBioData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="other">Other Info</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="first_name">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="first_name"
                {...register("first_name", { required: "First name is required" })}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                {...register("middle_name")}
                placeholder="Enter middle name"
              />
            </div>

            <div>
              <Label htmlFor="surname">
                Surname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="surname"
                {...register("surname", { required: "Surname is required" })}
                placeholder="Enter surname"
              />
              {errors.surname && (
                <p className="text-sm text-destructive mt-1">
                  {errors.surname.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date_of_birth">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register("date_of_birth", { required: "Date of birth is required" })}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-destructive mt-1">
                  {errors.date_of_birth.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="date_of_admission">
                Date of Admission <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date_of_admission"
                type="date"
                {...register("date_of_admission", {
                  required: "Date of admission is required",
                })}
              />
              {errors.date_of_admission && (
                <p className="text-sm text-destructive mt-1">
                  {errors.date_of_admission.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="age_on_admission">Age on Admission</Label>
              <Input
                id="age_on_admission"
                type="number"
                {...register("age_on_admission")}
                placeholder="Enter age"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sex">Sex</Label>
              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="sex">
                      <SelectValue placeholder="Select Sex" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSexOptions.map((sex) => (
                        <SelectItem key={sex.id} value={sex.id}>
                          {sex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="nationality">
                      <SelectValue placeholder="Select Nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockNationalities.map((nat) => (
                        <SelectItem key={nat.id} value={nat.id}>
                          {nat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="marital_status">Marital Status</Label>
              <Controller
                name="marital_status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="marital_status">
                      <SelectValue placeholder="Select Marital Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMaritalStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prisoner_personal_number">Prisoner Personal Number</Label>
              <Input
                id="prisoner_personal_number"
                {...register("prisoner_personal_number")}
                placeholder="Auto-generated"
              />
            </div>

            <div>
              <Label htmlFor="prisoner_number">Prisoner Number</Label>
              <Input
                id="prisoner_number"
                {...register("prisoner_number")}
                placeholder="Auto-generated"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="id_type">ID Type</Label>
              <Controller
                name="id_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="id_type">
                      <SelectValue placeholder="Select ID Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockIdTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                {...register("id_number")}
                placeholder="Enter ID number"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Controller
                name="is_active"
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <Checkbox
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>

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
              <Label htmlFor="habitual_criminal" className="cursor-pointer">
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
              <Label htmlFor="deformity" className="cursor-pointer">
                Has Deformity
              </Label>
            </div>
          </div>
        </TabsContent>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fathers_name">Father's Name</Label>
              <Input
                id="fathers_name"
                {...register("fathers_name")}
                placeholder="Enter father's name"
              />
            </div>

            <div>
              <Label htmlFor="mothers_name">Mother's Name</Label>
              <Input
                id="mothers_name"
                {...register("mothers_name")}
                placeholder="Enter mother's name"
              />
            </div>

            <div>
              <Label htmlFor="also_known_as">Also Known As</Label>
              <Input
                id="also_known_as"
                {...register("also_known_as")}
                placeholder="Enter alias"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tribe">Tribe</Label>
              <Input id="tribe" {...register("tribe")} placeholder="Enter tribe" />
            </div>

            <div>
              <Label htmlFor="religion">Religion</Label>
              <Controller
                name="religion"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="religion">
                      <SelectValue placeholder="Select Religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockReligions.map((rel) => (
                        <SelectItem key={rel.id} value={rel.id}>
                          {rel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="education_level">Education Level</Label>
              <Controller
                name="education_level"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="education_level">
                      <SelectValue placeholder="Select Education Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEducationLevels.map((edu) => (
                        <SelectItem key={edu.id} value={edu.id}>
                          {edu.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label htmlFor="employment_status">Employment Status</Label>
              <Controller
                name="employment_status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="employment_status">
                      <SelectValue placeholder="Select Employment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEmploymentStatuses.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employment_description">Employment Description</Label>
              <Input
                id="employment_description"
                {...register("employment_description")}
                placeholder="Enter employment description"
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
          </div>

          <div>
            <Label htmlFor="estimated_age_of_pregnancy">
              Estimated Age of Pregnancy (weeks)
            </Label>
            <Input
              id="estimated_age_of_pregnancy"
              type="number"
              {...register("estimated_age_of_pregnancy")}
              placeholder="Enter weeks if applicable"
            />
          </div>
        </TabsContent>

        {/* Address Information Tab */}
        <TabsContent value="address" className="space-y-4 mt-4">
          <h4 className="text-sm text-gray-600">Current Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Region</Label>
              <Controller
                name="address_region"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRegions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>District</Label>
              <Input {...register("address_district")} placeholder="Enter district" />
            </div>
            <div>
              <Label>County</Label>
              <Input {...register("address_county")} placeholder="Enter county" />
            </div>
            <div>
              <Label>Sub County</Label>
              <Input
                {...register("address_sub_county")}
                placeholder="Enter sub county"
              />
            </div>
            <div>
              <Label>Parish</Label>
              <Input {...register("address_parish")} placeholder="Enter parish" />
            </div>
            <div>
              <Label>Village</Label>
              <Input {...register("address_village")} placeholder="Enter village" />
            </div>
          </div>

          <Separator />

          <h4 className="text-sm text-gray-600">Permanent Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Region</Label>
              <Controller
                name="permanent_region"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRegions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>District</Label>
              <Input
                {...register("permanent_district")}
                placeholder="Enter district"
              />
            </div>
            <div>
              <Label>County</Label>
              <Input {...register("permanent_county")} placeholder="Enter county" />
            </div>
            <div>
              <Label>Sub County</Label>
              <Input
                {...register("permanent_sub_county")}
                placeholder="Enter sub county"
              />
            </div>
            <div>
              <Label>Parish</Label>
              <Input {...register("permanent_parish")} placeholder="Enter parish" />
            </div>
            <div>
              <Label>Village</Label>
              <Input {...register("permanent_village")} placeholder="Enter village" />
            </div>
          </div>

          <Separator />

          <h4 className="text-sm text-gray-600">Birth Place</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Region</Label>
              <Controller
                name="birth_region"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRegions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label>District</Label>
              <Input {...register("birth_district")} placeholder="Enter district" />
            </div>
            <div>
              <Label>County</Label>
              <Input {...register("birth_county")} placeholder="Enter county" />
            </div>
            <div>
              <Label>Sub County</Label>
              <Input {...register("birth_sub_county")} placeholder="Enter sub county" />
            </div>
            <div>
              <Label>Parish</Label>
              <Input {...register("birth_parish")} placeholder="Enter parish" />
            </div>
            <div>
              <Label>Village</Label>
              <Input {...register("birth_village")} placeholder="Enter village" />
            </div>
          </div>
        </TabsContent>

        {/* Physical Characteristics Tab */}
        <TabsContent value="physical" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                {...register("height")}
                placeholder="Enter height in cm"
              />
            </div>

            <div>
              <Label htmlFor="build">Build</Label>
              <Input id="build" {...register("build")} placeholder="e.g., Slim, Medium" />
            </div>

            <div>
              <Label htmlFor="face">Face</Label>
              <Input id="face" {...register("face")} placeholder="Face description" />
            </div>

            <div>
              <Label htmlFor="eyes">Eyes</Label>
              <Input id="eyes" {...register("eyes")} placeholder="Eye description" />
            </div>

            <div>
              <Label htmlFor="mouth">Mouth</Label>
              <Input
                id="mouth"
                {...register("mouth")}
                placeholder="Mouth description"
              />
            </div>

            <div>
              <Label htmlFor="teeth">Teeth</Label>
              <Input
                id="teeth"
                {...register("teeth")}
                placeholder="Teeth description"
              />
            </div>

            <div>
              <Label htmlFor="lips">Lips</Label>
              <Input id="lips" {...register("lips")} placeholder="Lips description" />
            </div>

            <div>
              <Label htmlFor="ears">Ears</Label>
              <Input id="ears" {...register("ears")} placeholder="Ears description" />
            </div>

            <div>
              <Label htmlFor="hair">Hair</Label>
              <Input id="hair" {...register("hair")} placeholder="Hair description" />
            </div>

            <div>
              <Label htmlFor="speech">Speech</Label>
              <Input
                id="speech"
                {...register("speech")}
                placeholder="Speech description"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="marks">Distinguishing Marks</Label>
              <Textarea
                id="marks"
                {...register("marks")}
                placeholder="Scars, tattoos, birthmarks, etc."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="description">General Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter general physical description"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>

        {/* Other Information Tab */}
        <TabsContent value="other" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prisoner_class">Prisoner Class</Label>
              <Input
                id="prisoner_class"
                {...register("prisoner_class")}
                placeholder="Enter prisoner class"
              />
            </div>

            <div>
              <Label htmlFor="desired_district_of_release">
                Desired District of Release
              </Label>
              <Input
                id="desired_district_of_release"
                {...register("desired_district_of_release")}
                placeholder="Enter district"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="continent">Continent</Label>
              <Input
                id="continent"
                {...register("continent")}
                placeholder="Enter continent"
              />
            </div>

            <div>
              <Label htmlFor="country_of_origin">Country of Origin</Label>
              <Input
                id="country_of_origin"
                {...register("country_of_origin")}
                placeholder="Enter country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="district_of_origin">District of Origin</Label>
              <Input
                id="district_of_origin"
                {...register("district_of_origin")}
                placeholder="Enter district"
              />
            </div>

            <div>
              <Label htmlFor="status_of_women">Status of Women</Label>
              <Input
                id="status_of_women"
                {...register("status_of_women")}
                placeholder="Enter status"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="finger_print">Fingerprint Reference</Label>
              <Input
                id="finger_print"
                {...register("finger_print")}
                placeholder="Enter fingerprint reference"
              />
            </div>

            <div>
              <Label htmlFor="photo">Photo URL</Label>
              <Input
                id="photo"
                {...register("photo")}
                placeholder="Enter photo URL or path"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          Save Bio Data
        </Button>
      </div>
    </form>
  );
};

export default PrisonerBioDataForm;

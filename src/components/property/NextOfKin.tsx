import React, {useEffect, useState} from "react";
import { useForm, Controller } from "react-hook-form";
import {getCurrentUser} from "../../services";
import { phoneNumberValidation, requiredValidation, nationalIdValidation } from "../../utils/validation";
import {
  addNextOfKin,
  County,
  District, getRegions,
  NextOfKin, NextOfKinResponse,
  Parish,
  Region,
  SubCounty,
  Village
} from "../../services/admission/nextOfKinService";
import {Separator} from "../ui/separator";
import {Label} from "../ui/label";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select";
import {Checkbox} from "../ui/checkbox";
import {DialogFooter} from "../ui/dialog";
import {
  fetchCounties,
  fetchDistricts, fetchParishes, fetchSubCounties, fetchVillages,
  handleCatchError,
  handleEmptyList, handleResponseError,
  handleServerError
} from "../../services/stationServices/utils";
import {getSexes, Item} from "../../services/stationServices/manualLockupIntegration";
import {
  getIdTypes,
  getRelationships,
  IdType,
  RelationShipItem
} from "../../services/stationServices/visitorsServices/VisitorsService";
import {toast} from "sonner";
import SearchableSelect from "../common/SearchableSelect";
import LocationSelect from "../common/LocationSelect";

interface ChildProps {
  setNewDialogLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setLoaderText: React.Dispatch<React.SetStateAction<string>>;
  setIsNextCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setNextOfKins: React.Dispatch<React.SetStateAction<NextOfKinResponse[]>>
  isNextCreateDialogOpen: boolean
  prisoner: string
  prisonerName?: string
  prisonerNumber?: string
}

const NextOfKin: React.FC<ChildProps> = ({ setNewDialogLoader, setLoaderText, setIsNextCreateDialogOpen, isNextCreateDialogOpen, prisoner, setNextOfKins, prisonerName, prisonerNumber }) => {

    // React Hook Form setup
    const { register, handleSubmit, formState: { errors }, setValue, watch, control, reset, clearErrors, trigger } = useForm<NextOfKin>({
      defaultValues: {
        is_active: true,
        first_name: "",
        middle_name: "",
        surname: "",
        phone_number: "",
        alternate_phone_number: "",
        id_number: "",
        lc1: "",
        discharge_property: false,
        created_by: getCurrentUser().id,
        prisoner: prisoner,
        relationship: "",
        sex: "",
        id_type: "",
        address_region: "",
        address_district: "",
        address_county: "",
        address_sub_county: "",
        address_parish: "",
        address_village: "",
      }
    });

    const [sexes, setSexes] = useState<Item[]>([])
    const [relationships, setRelationships] = useState<RelationShipItem[]>([])
    const [idTypes, setIdTypes] = useState<IdType[]>([])
    const [regions, setRegions] = useState<Region[]>([])
    const [districts, setDistricts] = useState<District[]>([])
    const [counties, setCounties] = useState<County[]>([])
    const [subCounties, setSubCounties] = useState<SubCounty[]>([])
    const [parishes, setParishes] = useState<Parish[]>([])
    const [villages, setVillages] = useState<Village[]>([])
    const [dataReady, setDataReady] = useState(false)

    // Watch id_type to conditionally require id_number
    const selectedIdType = watch("id_type");
    const idNumber = watch("id_number");
    
    // Watch location fields for cascading dropdowns
    const selectedRegion = watch("address_region");
    const selectedDistrict = watch("address_district");
    const selectedCounty = watch("address_county");
    const selectedSubCounty = watch("address_sub_county");
    const selectedParish = watch("address_parish");

    // Compute ID number validation rules dynamically
    const idNumberValidationRules = React.useMemo(() => ({
      ...(selectedIdType ? requiredValidation("ID number") : {}),
      ...(idTypes.find(t => t.id === selectedIdType)?.name === "National ID" ? nationalIdValidation : {})
    }), [selectedIdType, idTypes]);

    useEffect(() => {
      if (isNextCreateDialogOpen){
        setDataReady(false); // Reset data ready flag
        setNewDialogLoader(true)
        setLoaderText("Fetching Next of Kin Information, please wait")
        fetchKinData()
      } else {
        // Clear all data when dialog closes to prevent stale data
        setSexes([]);
        setRelationships([]);
        setIdTypes([]);
        setRegions([]);
        setDistricts([]);
        setCounties([]);
        setSubCounties([]);
        setParishes([]);
        setVillages([]);
        setDataReady(false);
      }
    }, [isNextCreateDialogOpen]);

    // Update prisoner value when prop changes
    useEffect(() => {
      setValue("prisoner", prisoner);
    }, [prisoner, setValue]);

    // Debug: Monitor districts state changes
    useEffect(() => {
      console.log('Districts state changed:', districts);
    }, [districts]);

    // Re-validate ID number when ID type changes
    useEffect(() => {
      // Clear ID number field and errors when ID type changes
      if (selectedIdType) {
        // Clear any existing errors
        clearErrors("id_number");
        // Re-trigger validation if field has value
        if (idNumber) {
          trigger("id_number");
        }
      } else {
        // If no ID type selected, clear the field and errors
        setValue("id_number", "");
        clearErrors("id_number");
      }
    }, [selectedIdType, clearErrors, trigger, setValue, idNumber]);

    function populateList(response: any, msg: string, setData: any) {
    if(handleServerError(response, setNewDialogLoader)) return

    if ("results" in response) {
      const data = response.results
      console.log("populateList received data:", data);
      if (handleEmptyList(data, msg, setNewDialogLoader)) return
      setData(data)
    }
  }

    async function fetchKinData() {
    try {
      const response1 = await getSexes()
      populateList(response1, "There are no sex types, you can't create the Next of Kin without sex types", setSexes)

      const response2 = await getRelationships()
      populateList(response2, "There are no relationships, you can't create the Next of Kin without relationships", setRelationships)

      const response3 = await getIdTypes()
      populateList(response3, "There are no ID types, you can't create the Next of Kin without ID types", setIdTypes)

      const response4 = await getRegions()
      populateList(response4, "There are no regions, you can't create the Next of Kin without regions", setRegions)

      setValue("prisoner", prisoner);

      // Mark data as ready after all initial fetches complete
      setDataReady(true);

    }catch (error) {
      handleCatchError(error)
    }
    finally {
      setNewDialogLoader(false)
    }
  }

    async function handleLocationChange (name: string, value: string) {
      console.log(`handleLocationChange called with name: ${name}, value: ${value}`);
      setValue(name as any, value);
      if (name === "address_region"){
        console.log(`Fetching districts for region: ${value}`);
        // Clear all child selections and data
        setValue("address_district", "");
        setValue("address_county", "");
        setValue("address_sub_county", "");
        setValue("address_parish", "");
        setValue("address_village", "");
        setDistricts([]); // Clear before fetching
        setCounties([]);
        setSubCounties([]);
        setParishes([]);
        setVillages([]);
        await fetchDistricts(setDistricts, setNewDialogLoader, setLoaderText, value)
        console.log('Districts state after fetch:', districts);
      }
      else if (name === "address_district") {
        console.log(`Fetching counties for district: ${value}`);
        // Clear child selections and data
        setValue("address_county", "");
        setValue("address_sub_county", "");
        setValue("address_parish", "");
        setValue("address_village", "");
        setCounties([]); // Clear before fetching
        setSubCounties([]);
        setParishes([]);
        setVillages([]);
        await fetchCounties(setCounties, setNewDialogLoader, setLoaderText, value)
      }
      else if (name === "address_county") {
        console.log(`Fetching sub counties for county: ${value}`);
        // Clear child selections and data
        setValue("address_sub_county", "");
        setValue("address_parish", "");
        setValue("address_village", "");
        setSubCounties([]); // Clear before fetching
        setParishes([]);
        setVillages([]);
        await fetchSubCounties(setSubCounties, setNewDialogLoader, setLoaderText, value)
      }
      else if (name === "address_sub_county") {
        console.log(`Fetching parishes for sub county: ${value}`);
        // Clear child selections and data
        setValue("address_parish", "");
        setValue("address_village", "");
        setParishes([]); // Clear before fetching
        setVillages([]);
        await fetchParishes(setParishes, setNewDialogLoader, setLoaderText, value)
      }
      else if (name === "address_parish") {
        console.log(`Fetching villages for parish: ${value}`);
        // Clear child selection and data
        setValue("address_village", "");
        setVillages([]); // Clear before fetching
        await fetchVillages(setVillages, setNewDialogLoader, setLoaderText, value)
      }
    }

    const onSubmit = async (data: NextOfKin) => {
      try {
        const payload = {
          ...data,
          is_active: true,
          created_by: getCurrentUser().id,
        };
        
        const response = await addNextOfKin(payload);
        if (handleResponseError(response)) return;

        if ('id' in response) {
          setNextOfKins(prev => ([response as NextOfKinResponse, ...prev]));
        }
        toast.success('Next of Kin added successfully');
        resetForm(); // Reset form and close dialog

      } catch (error) {
        handleCatchError(error)
      }

  };

    function resetForm() {
      reset({
      is_active: true,
      first_name: "",
      middle_name: "",
      surname: "",
      phone_number: "",
      alternate_phone_number: "",
      id_number: "",
      lc1: "",
      discharge_property: false,
      created_by: getCurrentUser().id,
      prisoner: "",
      relationship: "",
      sex: "",
      id_type: "",
      address_region: "",
      address_district: "",
      address_county: "",
      address_sub_county: "",
      address_parish: "",
      address_village: "",
    })
      setIsNextCreateDialogOpen(false)
    }


     // Don't render form until initial data is loaded
     if (!dataReady) {
       return null;
     }

     return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Prisoner Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Prisoner Information</h3>
          <Separator />
          <div className="space-y-2">
            <Label>Prisoner</Label>
            <Input
              value={prisonerName ? `${prisonerName}${prisonerNumber && !prisonerNumber.includes('-') ? ` | ${prisonerNumber}` : ''}` : 'No prisoner selected'}
              disabled
              className="bg-gray-100"
            />
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000', marginTop: '20px' }}>Personal Information</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="first_name"
                {...register("first_name", requiredValidation("First name"))}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                {...register("middle_name")}
                placeholder="Enter middle name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname <span className="text-red-500">*</span></Label>
              <Input
                id="surname"
                {...register("surname", requiredValidation("Surname"))}
                placeholder="Enter surname"
              />
              {errors.surname && (
                <p className="text-red-500 text-sm mt-1">{errors.surname.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex_type">Sex <span className="text-red-500">*</span></Label>
              <Controller
                name="sex"
                control={control}
                rules={requiredValidation("Sex")}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      {sexes.map((sex) => (
                        <SelectItem key={sex.id} value={sex.id}>
                          {sex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sex && (
                <p className="text-red-500 text-sm mt-1">{errors.sex.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_type">Relationship <span className="text-red-500">*</span></Label>
              <Controller
                name="relationship"
                control={control}
                rules={requiredValidation("Relationship")}
                render={({ field }) => (
                  <SearchableSelect
                    items={relationships}
                    value={field.value}
                    onChange={field.onChange}
                    idField="id"
                    labelField="name"
                    placeholder="Select relationship..."
                    className="w-full"
                  />
                )}
              />
              {errors.relationship && (
                <p className="text-red-500 text-sm mt-1">{errors.relationship.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Contact Information</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone_number"
                type="tel"
                {...register("phone_number", { ...phoneNumberValidation, ...requiredValidation("Phone number") })}
                placeholder="+256700000000"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternate_phone_number">Alternate Phone Number</Label>
              <Input
                id="alternate_phone_number"
                type="tel"
                {...register("alternate_phone_number", phoneNumberValidation)}
                placeholder="+256700000000"
              />
              {errors.alternate_phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.alternate_phone_number.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Identification */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Identification</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_type_value">ID Type</Label>
              <Controller
                name="id_type"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    items={idTypes}
                    value={field.value}
                    onChange={field.onChange}
                    idField="id"
                    labelField="name"
                    placeholder="Select ID type..."
                    className="w-full"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">
                ID Number {selectedIdType && <span className="text-red-500">*</span>}
              </Label>
              <Controller
                name="id_number"
                control={control}
                rules={idNumberValidationRules}
                render={({ field }) => (
                  <Input
                    id="id_number"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Enter ID number"
                  />
                )}
              />
              {errors.id_number && (
                <p className="text-red-500 text-sm mt-1">{errors.id_number.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Address Information</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_region">Region <span className="text-red-500">*</span></Label>
              <Controller
                name="address_region"
                control={control}
                rules={requiredValidation("Region")}
                render={({ field }) => (
                  <LocationSelect
                    items={regions}
                    value={field.value}
                    onChange={(value) => handleLocationChange("address_region", value)}
                    idField="id"
                    labelField="name"
                    placeholder="Select region..."
                    className="w-full"
                  />
                )}
              />
              {errors.address_region && (
                <p className="text-red-500 text-sm mt-1">{errors.address_region.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_district">District <span className="text-red-500">*</span></Label>
              <Controller
                name="address_district"
                control={control}
                rules={requiredValidation("District")}
                render={({ field }) => (
                  <LocationSelect
                    items={districts}
                    value={field.value}
                    onChange={(value) => handleLocationChange("address_district", value)}
                    idField="id"
                    labelField="name"
                    placeholder="Select district..."
                    className="w-full"
                    disabled={!selectedRegion}
                  />
                )}
              />
              {errors.address_district && (
                <p className="text-red-500 text-sm mt-1">{errors.address_district.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_county">County <span className="text-red-500">*</span></Label>
              <Controller
                name="address_county"
                control={control}
                rules={requiredValidation("County")}
                render={({ field }) => (
                  <LocationSelect
                    items={counties}
                    value={field.value}
                    onChange={(value) => handleLocationChange("address_county", value)}
                    idField="id"
                    labelField="name"
                    placeholder="Select county..."
                    className="w-full"
                    disabled={!selectedDistrict}
                  />
                )}
              />
              {errors.address_county && (
                <p className="text-red-500 text-sm mt-1">{errors.address_county.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_sub_county">Sub County <span className="text-red-500">*</span></Label>
              <Controller
                name="address_sub_county"
                control={control}
                rules={requiredValidation("Sub County")}
                render={({ field }) => (
                  <LocationSelect
                    items={subCounties}
                    value={field.value}
                    onChange={(value) => handleLocationChange("address_sub_county", value)}
                    idField="id"
                    labelField="name"
                    placeholder="Select sub county..."
                    className="w-full"
                    disabled={!selectedCounty}
                  />
                )}
              />
              {errors.address_sub_county && (
                <p className="text-red-500 text-sm mt-1">{errors.address_sub_county.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_parish">Parish <span className="text-red-500">*</span></Label>
              <Controller
                name="address_parish"
                control={control}
                rules={requiredValidation("Parish")}
                render={({ field }) => (
                  <LocationSelect
                    items={parishes}
                    value={field.value}
                    onChange={(value) => handleLocationChange("address_parish", value)}
                    idField="id"
                    labelField="name"
                    placeholder="Select parish..."
                    className="w-full"
                    disabled={!selectedSubCounty}
                  />
                )}
              />
              {errors.address_parish && (
                <p className="text-red-500 text-sm mt-1">{errors.address_parish.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_village">Village <span className="text-red-500">*</span></Label>
              <Controller
                name="address_village"
                control={control}
                rules={requiredValidation("Village")}
                render={({ field }) => (
                  <LocationSelect
                    items={villages}
                    value={field.value}
                    onChange={(value) => handleLocationChange("address_village", value)}
                    idField="id"
                    labelField="name"
                    placeholder="Select village..."
                    className="w-full"
                    disabled={!selectedParish}
                  />
                )}
              />
              {errors.address_village && (
                <p className="text-red-500 text-sm mt-1">{errors.address_village.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Other Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Other Information</h3>
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="lc1">LC1 Chairman</Label>
            <Input
              id="lc1"
              type="text"
              {...register("lc1")}
              placeholder="Enter LC1 chairman name"
            />
            {errors.lc1 && (
              <p className="text-red-500 text-sm mt-1">{errors.lc1.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="discharge_property"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="discharge_property"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="discharge_property" className="cursor-pointer">
              Authorized to Collect Discharge Property
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => {
            resetForm();
          }}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }}>
            Create Next of Kin
          </Button>
        </DialogFooter>
      </form>
    );
}

export default NextOfKin
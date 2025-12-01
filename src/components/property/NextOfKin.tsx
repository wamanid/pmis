import React, {useEffect, useState} from "react";
import {getCurrentUser} from "../../services";
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
import {Popover, PopoverContent, PopoverTrigger} from "../ui/popover";
import {Button} from "../ui/button";
import {Check, ChevronsUpDown} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandItem, CommandList} from "../ui/command";
import {cn} from "../ui/utils";
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

interface ChildProps {
  setNewDialogLoader: React.Dispatch<React.SetStateAction<boolean>>;
  setLoaderText: React.Dispatch<React.SetStateAction<string>>;
  setIsNextCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setNextOfKins: React.Dispatch<React.SetStateAction<NextOfKinResponse[]>>
  isNextCreateDialogOpen: boolean
  prisoner: string
}

const NextOfKin: React.FC<ChildProps> = ({ setNewDialogLoader, setLoaderText, setIsNextCreateDialogOpen, isNextCreateDialogOpen, prisoner, setNextOfKins }) => {

    const [sexes, setSexes] = useState<Item[]>([])
    const [relationships, setRelationships] = useState<RelationShipItem[]>([])
    const [idTypes, setIdTypes] = useState<IdType[]>([])
    const [regions, setRegions] = useState<Region[]>([])
    const [districts, setDistricts] = useState<District[]>([])
    const [counties, setCounties] = useState<County[]>([])
    const [subCounties, setSubCounties] = useState<SubCounty[]>([])
    const [parishes, setParishes] = useState<Parish[]>([])
    const [villages, setVillages] = useState<Village[]>([])
    const [openPrisoner, setOpenPrisoner] = useState(false);
    const [openRelationship, setOpenRelationship] = useState(false);
    const [openSex, setOpenSex] = useState(false);
    const [openIdType, setOpenIdType] = useState(false);
    const [formData1, setFormData1] = useState<NextOfKin>({
      is_active: true,
      deleted_datetime: null,
      first_name: "",
      middle_name: "",
      surname: "",
      phone_number: "",
      alternate_phone_number: "",
      id_number: "",
      lc1: "",
      discharge_property: false,
      created_by: getCurrentUser().id,
      updated_by: null,
      deleted_by: null,
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
    });

    useEffect(() => {
      if (isNextCreateDialogOpen){
        setNewDialogLoader(true)
        setLoaderText("Fetching Next of Kin Information, please wait")
        fetchKinData()
      }
    }, [isNextCreateDialogOpen]);

    function populateList(response: any, msg: string, setData: any) {
    if(handleServerError(response, setNewDialogLoader)) return

    if ("results" in response) {
      const data = response.results
      // console.log(data)
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

      setFormData1({...formData1, prisoner})

    }catch (error) {
      handleCatchError(error)
    }
    finally {
      setNewDialogLoader(false)
    }
  }

    async function handleLocationChange (name: string, value: string) {
    setFormData1({...formData1, [name]: value})
    if (name === "address_region"){
      await fetchDistricts(setDistricts, setNewDialogLoader, setLoaderText, value)
    }
    else if (name === "address_district") {
      await fetchCounties(setCounties, setNewDialogLoader, setLoaderText, value)
    }
    else if (name === "address_county") {
      await fetchSubCounties(setSubCounties, setNewDialogLoader, setLoaderText, value)
    }
    else if (name === "address_sub_county") {
      await fetchParishes(setParishes, setNewDialogLoader, setLoaderText, value)
    }
    else if (name === "address_parish") {
      await fetchVillages(setVillages, setNewDialogLoader, setLoaderText, value)
    }

  }

    const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

      // console.log(formData1)
      try {
        const response = await addNextOfKin(formData1)
        if (handleResponseError(response)) return
         setNextOfKins(prev => ([response, ...prev]))
        resetForm();
        toast.success('Next of Kin added successfully');

      } catch (error) {
        handleCatchError(error)
      }

  };

    function resetForm() {
      setFormData1({
      is_active: true,
      deleted_datetime: null,
      first_name: "",
      middle_name: "",
      surname: "",
      phone_number: "",
      alternate_phone_number: "",
      id_number: "",
      lc1: "",
      discharge_property: false,
      created_by: getCurrentUser().id,
      updated_by: null,
      deleted_by: null,
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


     return (
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Prisoner Information */}
        {/*<div className="space-y-4">*/}
        {/*  <h3 className="text-lg" style={{ color: '#650000' }}>Prisoner Information</h3>*/}
        {/*  <Separator />*/}
        {/*</div>*/}

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000', marginTop: '20px' }}>Personal Information</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={formData1.first_name}
                onChange={(e) => setFormData1({...formData1, first_name: e.target.value})}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                value={formData1.middle_name}
                onChange={(e) => setFormData1({...formData1, middle_name: e.target.value})}
                placeholder="Enter middle name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname *</Label>
              <Input
                id="surname"
                value={formData1.surname}
                onChange={(e) => setFormData1({...formData1, surname: e.target.value})}
                placeholder="Enter surname"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex_type">Sex *</Label>
              <Popover open={openSex} onOpenChange={setOpenSex}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSex}
                    className="w-full justify-between"
                    type="button"
                  >
                    {formData1.sex
                      ? sexes.find((s) => s.id === formData1.sex)?.name
                      : "Select sex..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No sex found.</CommandEmpty>
                      <CommandGroup>
                        {sexes.map((sex) => (
                          <CommandItem
                            key={sex.id}
                            value={sex.name}
                            onSelect={() => {
                              setFormData1({...formData1, sex: sex.id});
                              setOpenSex(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData1.sex === sex.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {sex.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_type">Relationship *</Label>
              <Popover open={openRelationship} onOpenChange={setOpenRelationship}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openRelationship}
                    className="w-full justify-between"
                    type="button"
                  >
                    {formData1.relationship
                      ? relationships.find((r) => r.id === formData1.relationship)?.name
                      : "Select relationship..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No relationship found.</CommandEmpty>
                      <CommandGroup>
                        {relationships.map((relationship) => (
                          <CommandItem
                            key={relationship.id}
                            value={relationship.name}
                            onSelect={() => {
                              setFormData1({...formData1, relationship: relationship.id});
                              setOpenRelationship(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData1.relationship === relationship.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {relationship.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Contact Information</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                value={formData1.phone_number}
                onChange={(e) => setFormData1({...formData1, phone_number: e.target.value})}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternate_phone_number">Alternate Phone Number</Label>
              <Input
                id="alternate_phone_number"
                value={formData1.alternate_phone_number}
                onChange={(e) => setFormData1({...formData1, alternate_phone_number: e.target.value})}
                placeholder="Enter alternate phone number"
              />
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
              <Popover open={openIdType} onOpenChange={setOpenIdType}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openIdType}
                    className="w-full justify-between"
                    type="button"
                  >
                    {formData1.id_type
                      ? idTypes.find((it) => it.id === formData1.id_type)?.name
                      : "Select ID type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No ID type found.</CommandEmpty>
                      <CommandGroup>
                        {idTypes.map((idType) => (
                          <CommandItem
                            key={idType.id}
                            value={idType.name}
                            onSelect={() => {
                              setFormData1({...formData1, id_type: idType.id});
                              setOpenIdType(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData1.id_type === idType.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {idType.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">ID Number</Label>
              <Input
                id="id_number"
                value={formData1.id_number}
                onChange={(e) => setFormData1({...formData1, id_number: e.target.value})}
                placeholder="Enter ID number"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg" style={{ color: '#650000' }}>Address Information</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address_region">Region</Label>
              <Select
                value={formData1.address_region}
                onValueChange={(value) => handleLocationChange("address_region", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_district">District</Label>
              <Select
                value={formData1.address_district}
                onValueChange={(value) => handleLocationChange("address_district", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_county">County</Label>
              <Select
                value={formData1.address_county}
                onValueChange={(value) => handleLocationChange("address_county", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>

            <div className="space-y-2">
              <Label htmlFor="address_sub_county">Sub County</Label>
              <Select
                value={formData1.address_sub_county}
                onValueChange={(value) => handleLocationChange("address_sub_county", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub county" />
                </SelectTrigger>
                <SelectContent>
                  {subCounties.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_parish">Parish</Label>
              <Select
                value={formData1.address_parish}
                onValueChange={(value) => handleLocationChange("address_parish", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parish" />
                </SelectTrigger>
                <SelectContent>
                  {parishes.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_village">Village</Label>
              <Select
                value={formData1.address_village}
                onValueChange={(value) => handleLocationChange("address_village", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select village" />
                </SelectTrigger>
                <SelectContent>
                  {villages.map((county) => (
                    <SelectItem key={county.id} value={county.id}>
                      {county.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              value={formData1.lc1}
              onChange={(e) => setFormData1({...formData1, lc1: e.target.value})}
              placeholder="Enter LC1 chairman name"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="discharge_property"
              checked={formData1.discharge_property}
              onCheckedChange={(checked) => setFormData1({...formData1, discharge_property: checked as boolean})}
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
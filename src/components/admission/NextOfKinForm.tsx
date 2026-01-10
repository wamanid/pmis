import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { SexSelect } from "../common/SexSelect";
import { RegionSelect } from "../common/RegionSelect";
import { DistrictSelect } from "../common/DistrictSelect";
import { CountySelect } from "../common/CountySelect";
import { SubCountySelect } from "../common/SubCountySelect";
import { NextOfKin } from "../../models/admission/";

interface NextOfKinFormProps {
  currentNextOfKin: NextOfKin | null;
  onSubmit: (data: NextOfKin) => void;
  onCancel: () => void;
}

const NextOfKinForm: React.FC<NextOfKinFormProps> = ({
  currentNextOfKin,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<NextOfKin>({
    defaultValues: currentNextOfKin || {},
  });

  const handleFormSubmit = (data: NextOfKin) => {
    onSubmit(data);
  };

  return (
    <Card className="border-2 border-[#650000]">
      <CardHeader>
        <CardTitle className="text-[#650000]">
          {currentNextOfKin ? "Edit Next of Kin" : "Add Next of Kin"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <Label htmlFor="nok_first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nok_first_name"
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

            {/* Middle Name */}
            <div>
              <Label htmlFor="nok_middle_name">Middle Name</Label>
              <Input
                id="nok_middle_name"
                {...register("middle_name")}
                placeholder="Enter middle name"
              />
            </div>

            {/* Surname */}
            <div>
              <Label htmlFor="nok_surname">
                Surname <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nok_surname"
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

            {/* Relationship */}
            <div>
              <Label htmlFor="nok_relationship">Relationship</Label>
              <Input
                id="nok_relationship"
                {...register("relationship")}
                placeholder="e.g., Father, Mother, Spouse"
              />
            </div>

            {/* Sex */}
            <div>
              <Label htmlFor="nok_sex">Sex</Label>
              <SexSelect
                value={watch("sex")}
                onValueChange={(value) => setValue("sex", value)}
                placeholder="Select sex"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="nok_phone">Phone Number</Label>
              <Input
                id="nok_phone"
                {...register("phone_number")}
                placeholder="+256700000000"
              />
            </div>

            {/* Alternate Phone Number */}
            <div>
              <Label htmlFor="nok_alt_phone">Alternate Phone Number</Label>
              <Input
                id="nok_alt_phone"
                {...register("alternate_phone_number")}
                placeholder="+256700000000"
              />
            </div>

            {/* ID Type */}
            <div>
              <Label htmlFor="nok_id_type">ID Type</Label>
              <Input
                id="nok_id_type"
                {...register("id_type")}
                placeholder="e.g., National ID, Passport"
              />
            </div>

            {/* ID Number */}
            <div>
              <Label htmlFor="nok_id_number">ID Number</Label>
              <Input
                id="nok_id_number"
                {...register("id_number")}
                placeholder="Enter ID number"
              />
            </div>

            {/* LC1 Chairman */}
            <div>
              <Label htmlFor="nok_lc1">LC1 Chairman</Label>
              <Input
                id="nok_lc1"
                {...register("lc1")}
                placeholder="LC1 name"
              />
            </div>

            {/* Discharge Property Checkbox */}
            <div className="flex items-center gap-2">
              <Controller
                name="discharge_property"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Checkbox
                    id="discharge_property"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="discharge_property" className="cursor-pointer">
                Discharge Property to this person
              </Label>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div>
            <h4 className="mb-4 font-semibold">Next of Kin Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Region */}
              <div>
                <Label htmlFor="nok_address_region">Region</Label>
                <RegionSelect
                  value={watch("address_region")}
                  onValueChange={(value) => setValue("address_region", value)}
                  placeholder="Select region"
                />
              </div>

              {/* District */}
              <div>
                <Label htmlFor="nok_address_district">District</Label>
                <DistrictSelect
                  value={watch("address_district")}
                  onValueChange={(value) => setValue("address_district", value)}
                  regionId={watch("address_region")}
                  placeholder="Select district"
                />
              </div>

              {/* County */}
              <div>
                <Label htmlFor="nok_address_county">County</Label>
                <CountySelect
                  value={watch("address_county")}
                  onValueChange={(value) => setValue("address_county", value)}
                  districtId={watch("address_district")}
                  placeholder="Select county"
                />
              </div>

              {/* Sub County */}
              <div>
                <Label htmlFor="nok_address_sub_county">Sub County</Label>
                <SubCountySelect
                  value={watch("address_sub_county")}
                  onValueChange={(value) => setValue("address_sub_county", value)}
                  countyId={watch("address_county")}
                  placeholder="Select sub county"
                />
              </div>

              {/* Parish */}
              <div>
                <Label htmlFor="nok_address_parish">Parish</Label>
                <Input
                  id="nok_address_parish"
                  {...register("address_parish")}
                  placeholder="Enter parish"
                />
              </div>

              {/* Village */}
              <div>
                <Label htmlFor="nok_address_village">Village</Label>
                <Input
                  id="nok_address_village"
                  {...register("address_village")}
                  placeholder="Enter village"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#650000] hover:bg-[#4a0000]">
              {currentNextOfKin ? "Update Next of Kin" : "Add Next of Kin"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NextOfKinForm;

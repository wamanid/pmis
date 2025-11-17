import React from "react";
import { useForm } from "react-hook-form";
import { Baby } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import FileUpload from "../common/FileUpload";
import { ChildRecord } from "../../models/admission/";

interface ChildRecordFormProps {
  currentChild: ChildRecord | null;
  onSubmit: (data: ChildRecord) => void;
  onCancel: () => void;
}

const ChildRecordForm: React.FC<ChildRecordFormProps> = ({
  currentChild,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChildRecord>({
    defaultValues: currentChild || {},
  });

  const handleFormSubmit = (data: ChildRecord) => {
    onSubmit(data);
  };

  return (
    <Card className="border-2 border-[#650000]">
      <CardHeader>
        <CardTitle className="text-[#650000]">
          {currentChild ? "Edit Child Record" : "Add Child Record"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Child Name */}
            <div>
              <Label htmlFor="child_name">
                Child Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="child_name"
                {...register("name", {
                  required: "Child name is required",
                })}
                placeholder="Enter child's name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="child_date_of_birth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="child_date_of_birth"
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

            {/* Sex */}
            <div>
              <Label htmlFor="child_sex">
                Sex <span className="text-red-500">*</span>
              </Label>
              <Input
                id="child_sex"
                {...register("sex", {
                  required: "Sex is required",
                })}
                placeholder="Enter sex"
              />
              {errors.sex && (
                <p className="text-red-500 text-sm mt-1">{errors.sex.message}</p>
              )}
            </div>

            {/* Age on Admission */}
            <div>
              <Label htmlFor="child_age_on_admission">
                Age on Admission <span className="text-red-500">*</span>
              </Label>
              <Input
                id="child_age_on_admission"
                type="number"
                {...register("age_on_admission", {
                  required: "Age is required",
                })}
                placeholder="Enter age"
              />
              {errors.age_on_admission && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.age_on_admission.message}
                </p>
              )}
            </div>

            {/* Hospital of Birth */}
            <div>
              <Label htmlFor="child_hospital_of_birth">Hospital of Birth</Label>
              <Input
                id="child_hospital_of_birth"
                {...register("hospital_of_birth")}
                placeholder="Enter hospital of birth"
              />
            </div>

            {/* Medical Condition */}
            <div className="md:col-span-2">
              <Label htmlFor="medical_condition">Medical Condition</Label>
              <Textarea
                id="medical_condition"
                {...register("medical_condition")}
                placeholder="Describe any medical conditions..."
                rows={2}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="child_description">Description</Label>
              <Textarea
                id="child_description"
                {...register("description")}
                placeholder="Additional information about the child..."
                rows={2}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <Label htmlFor="child_photo">Photo Upload</Label>
              <FileUpload
                id="child_photo"
                name="child_photo"
                allowedFileTypes={[
                  "image/png",
                  "image/jpeg",
                  "image/jpg",
                  "image/webp",
                ]}
                description="Upload child's photo (PNG, JPEG, or WebP)"
                maxSizeMB={2}
                icon={<Baby className="h-10 w-10" />}
                onFileChange={(base64, file) => {
                  setValue("photo", base64 || undefined);
                }}
                value={watch("photo") || null}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#650000] hover:bg-[#4a0000]"
            >
              {currentChild ? "Update Child" : "Add Child"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChildRecordForm;

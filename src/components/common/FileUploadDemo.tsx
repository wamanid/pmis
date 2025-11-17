import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FileUpload from "./FileUpload";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { User, FileText, CreditCard } from "lucide-react";

interface DemoFormData {
  name: string;
  email: string;
  profilePhoto: string | null;
  resume: string | null;
  idDocument: string | null;
}

const FileUploadDemo: React.FC = () => {
  const { register, handleSubmit, setValue, watch } = useForm<DemoFormData>({
    defaultValues: {
      name: "",
      email: "",
      profilePhoto: null,
      resume: null,
      idDocument: null,
    },
  });

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);

  const profilePhoto = watch("profilePhoto");
  const resume = watch("resume");
  const idDocument = watch("idDocument");

  const onSubmit = (data: DemoFormData) => {
    console.log("Form submitted with data:", {
      name: data.name,
      email: data.email,
      profilePhoto: data.profilePhoto ? `${data.profilePhoto.substring(0, 50)}...` : null,
      resume: data.resume ? `${data.resume.substring(0, 50)}...` : null,
      idDocument: data.idDocument ? `${data.idDocument.substring(0, 50)}...` : null,
    });

    toast.success("Form submitted successfully! Check console for base64 data.");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">File Upload Component Demo</h1>
        <p className="text-muted-foreground mt-2">
          Demonstration of the generic FileUpload component with drag & drop, progress bar, and base64 encoding
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
                placeholder="john.doe@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* File Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>File Uploads</CardTitle>
            <CardDescription>Upload your documents using drag & drop or click to browse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo Upload */}
            <div>
              <Label htmlFor="profilePhoto" className="mb-2 block">
                Profile Photo
              </Label>
              <FileUpload
                id="profilePhoto"
                name="profilePhoto"
                allowedFileTypes={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
                description="Upload your profile photo (PNG, JPEG, or WebP)"
                maxSizeMB={2}
                icon={<User className="h-10 w-10" />}
                onFileChange={(base64, file) => {
                  setValue("profilePhoto", base64);
                  setProfilePhotoFile(file);
                }}
                value={profilePhoto}
              />
              {profilePhotoFile && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {profilePhotoFile.name}
                </div>
              )}
            </div>

            <Separator />

            {/* Resume Upload */}
            <div>
              <Label htmlFor="resume" className="mb-2 block">
                Resume / CV
              </Label>
              <FileUpload
                id="resume"
                name="resume"
                allowedFileTypes={["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]}
                description="Upload your resume (PDF or Word document)"
                maxSizeMB={5}
                icon={<FileText className="h-10 w-10" />}
                onFileChange={(base64, file) => {
                  setValue("resume", base64);
                  setResumeFile(file);
                }}
                value={resume}
              />
              {resumeFile && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {resumeFile.name}
                </div>
              )}
            </div>

            <Separator />

            {/* ID Document Upload */}
            <div>
              <Label htmlFor="idDocument" className="mb-2 block">
                ID Document
              </Label>
              <FileUpload
                id="idDocument"
                name="idDocument"
                allowedFileTypes={["image/png", "image/jpeg", "image/jpg", "application/pdf"]}
                description="Upload a scan of your ID (Image or PDF)"
                maxSizeMB={3}
                icon={<CreditCard className="h-10 w-10" />}
                onFileChange={(base64, file) => {
                  setValue("idDocument", base64);
                  setIdDocumentFile(file);
                }}
                value={idDocument}
              />
              {idDocumentFile && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {idDocumentFile.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Data Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Form Data Preview</CardTitle>
            <CardDescription>Current form state (base64 data truncated for display)</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
              {JSON.stringify(
                {
                  name: watch("name"),
                  email: watch("email"),
                  profilePhoto: profilePhoto ? `${profilePhoto.substring(0, 100)}...` : null,
                  resume: resume ? `${resume.substring(0, 100)}...` : null,
                  idDocument: idDocument ? `${idDocument.substring(0, 100)}...` : null,
                },
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              toast.info("Form reset");
              window.location.reload();
            }}
          >
            Reset
          </Button>
          <Button type="submit">
            Submit Form
          </Button>
        </div>
      </form>

      {/* Feature List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Component Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Drag & Drop:</strong> Drag files directly onto the upload area</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Click to Browse:</strong> Click anywhere on the upload area to open file dialog</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Progress Bar:</strong> Visual feedback during file processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Base64 Encoding:</strong> Automatically converts files to base64 for form submission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>File Type Validation:</strong> Restricts uploads to specified file types</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Size Validation:</strong> Enforces maximum file size limits</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Error Handling:</strong> Clear error messages for validation failures</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Remove File:</strong> Easy file removal with visual feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>Customizable:</strong> Configurable file types, size limits, and descriptions</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Usage Example */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto">
{`import FileUpload from "./components/common/FileUpload";

<FileUpload
  id="profilePhoto"
  name="profilePhoto"
  allowedFileTypes={["image/png", "image/jpeg"]}
  description="Upload your profile photo"
  maxSizeMB={2}
  onFileChange={(base64, file) => {
    // Handle the base64 data and file
    setValue("profilePhoto", base64);
  }}
  value={profilePhoto}
/>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUploadDemo;

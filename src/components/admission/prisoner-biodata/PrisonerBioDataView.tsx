import React from "react";
import { User, MapPin, Ruler, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { PrisonerBioData } from "./PrisonerBioDataList";

interface PrisonerBioDataViewProps {
  bioData: PrisonerBioData;
}

const PrisonerBioDataView: React.FC<PrisonerBioDataViewProps> = ({ bioData }) => {
  const InfoRow = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
    if (value === undefined || value === null || value === "") return null;
    
    const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : value;
    
    return (
      <div className="grid grid-cols-3 gap-4 py-2">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="col-span-2 text-sm">{displayValue}</dd>
      </div>
    );
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {bioData.photo ? (
              <img
                src={bioData.photo}
                alt={`${bioData.first_name} ${bioData.surname}`}
                className="w-24 h-24 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl">
                  {bioData.first_name} {bioData.middle_name} {bioData.surname}
                </h3>
                {bioData.also_known_as && (
                  <p className="text-sm text-muted-foreground">
                    Also known as: {bioData.also_known_as}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {bioData.is_active ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {bioData.habitual_criminal && (
                  <Badge variant="destructive">Habitual Criminal</Badge>
                )}
                {bioData.deformity && <Badge variant="secondary">Has Deformity</Badge>}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Prisoner Number</p>
                  <p>{bioData.prisoner_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Personal Number</p>
                  <p>{bioData.prisoner_personal_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p>{calculateAge(bioData.date_of_birth)} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sex</p>
                  <p>{bioData.sex_name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="other">Other Info</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <InfoRow label="First Name" value={bioData.first_name} />
                <InfoRow label="Middle Name" value={bioData.middle_name} />
                <InfoRow label="Surname" value={bioData.surname} />
                <InfoRow label="Date of Birth" value={bioData.date_of_birth} />
                <InfoRow label="Date of Admission" value={bioData.date_of_admission} />
                <InfoRow label="Age on Admission" value={bioData.age_on_admission} />
                <InfoRow label="Sex" value={bioData.sex_name} />
                <InfoRow label="Nationality" value={bioData.nationality_name} />
                <InfoRow label="ID Type" value={bioData.id_type} />
                <InfoRow label="ID Number" value={bioData.id_number} />
                <InfoRow label="Habitual Criminal" value={bioData.habitual_criminal} />
                <InfoRow label="Has Deformity" value={bioData.deformity} />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <InfoRow label="Father's Name" value={bioData.fathers_name} />
                <InfoRow label="Mother's Name" value={bioData.mothers_name} />
                <InfoRow label="Also Known As" value={bioData.also_known_as} />
                <InfoRow label="Tribe" value={bioData.tribe} />
                <InfoRow label="Religion" value={bioData.religion} />
                <InfoRow label="Marital Status" value={bioData.marital_status} />
                <InfoRow label="Education Level" value={bioData.education_level} />
                <InfoRow label="Highest Education" value={bioData.highest_education} />
                <InfoRow label="Employment Status" value={bioData.employment_status} />
                <InfoRow label="Employment Description" value={bioData.employment_description} />
                <InfoRow label="Employer" value={bioData.employer} />
                <InfoRow label="Status of Women" value={bioData.status_of_women} />
                <InfoRow
                  label="Estimated Age of Pregnancy (weeks)"
                  value={bioData.estimated_age_of_pregnancy}
                />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Information */}
        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <InfoRow label="Region" value={bioData.address_region} />
                <InfoRow label="District" value={bioData.address_district} />
                <InfoRow label="County" value={bioData.address_county} />
                <InfoRow label="Sub County" value={bioData.address_sub_county} />
                <InfoRow label="Parish" value={bioData.address_parish} />
                <InfoRow label="Village" value={bioData.address_village} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Permanent Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <InfoRow label="Region" value={bioData.permanent_region} />
                <InfoRow label="District" value={bioData.permanent_district} />
                <InfoRow label="County" value={bioData.permanent_county} />
                <InfoRow label="Sub County" value={bioData.permanent_sub_county} />
                <InfoRow label="Parish" value={bioData.permanent_parish} />
                <InfoRow label="Village" value={bioData.permanent_village} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Birth Place
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <InfoRow label="Region" value={bioData.birth_region} />
                <InfoRow label="District" value={bioData.birth_district} />
                <InfoRow label="County" value={bioData.birth_county} />
                <InfoRow label="Sub County" value={bioData.birth_sub_county} />
                <InfoRow label="Parish" value={bioData.birth_parish} />
                <InfoRow label="Village" value={bioData.birth_village} />
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Physical Characteristics */}
        <TabsContent value="physical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Physical Characteristics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <InfoRow label="Height (cm)" value={bioData.height} />
                <InfoRow label="Build" value={bioData.build} />
                <InfoRow label="Face" value={bioData.face} />
                <InfoRow label="Eyes" value={bioData.eyes} />
                <InfoRow label="Mouth" value={bioData.mouth} />
                <InfoRow label="Teeth" value={bioData.teeth} />
                <InfoRow label="Lips" value={bioData.lips} />
                <InfoRow label="Ears" value={bioData.ears} />
                <InfoRow label="Hair" value={bioData.hair} />
                <InfoRow label="Speech" value={bioData.speech} />
              </dl>
              
              {bioData.marks && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="text-sm mb-2">Distinguishing Marks</h4>
                    <p className="text-sm text-muted-foreground">{bioData.marks}</p>
                  </div>
                </>
              )}
              
              {bioData.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="text-sm mb-2">General Description</h4>
                    <p className="text-sm text-muted-foreground">{bioData.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Information */}
        <TabsContent value="other" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                <InfoRow label="Prisoner Class" value={bioData.prisoner_class} />
                <InfoRow
                  label="Desired District of Release"
                  value={bioData.desired_district_of_release}
                />
                <InfoRow label="Continent" value={bioData.continent} />
                <InfoRow label="Country of Origin" value={bioData.country_of_origin} />
                <InfoRow label="District of Origin" value={bioData.district_of_origin} />
                <InfoRow label="Fingerprint Reference" value={bioData.finger_print} />
              </dl>
            </CardContent>
          </Card>

          {/* Metadata */}
          {(bioData.created_by || bioData.updated_by) && (
            <Card>
              <CardHeader>
                <CardTitle>Record Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-border">
                  <InfoRow label="Created By" value={bioData.created_by} />
                  <InfoRow label="Updated By" value={bioData.updated_by} />
                  {bioData.deleted_by && (
                    <InfoRow label="Deleted By" value={bioData.deleted_by} />
                  )}
                  {bioData.deleted_datetime && (
                    <InfoRow label="Deleted Date" value={bioData.deleted_datetime} />
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PrisonerBioDataView;

import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { toast } from "sonner@2.0.3";
import PrisonerBioDataView from "./PrisonerBioDataView";
import PrisonerBioDataForm from "./PrisonerBioDataForm";
import { PrisonerBioData } from "./PrisonerBioDataList";

interface PrisonerDetailScreenProps {
  prisonerId: string;
  onBack: () => void;
}

// Mock data - In production, this would fetch from API
const mockBioDataDetails: Record<string, PrisonerBioData> = {
  "1": {
    id: "1",
    is_active: true,
    first_name: "John",
    middle_name: "Paul",
    surname: "Doe",
    date_of_birth: "1990-05-15",
    date_of_admission: "2024-10-01",
    prisoner_personal_number: "PP-2024-001",
    prisoner_number: "PN-2024-001",
    sex: "sex-1",
    sex_name: "Male",
    nationality: "nationality-1",
    nationality_name: "Ugandan",
    habitual_criminal: false,
    deformity: false,
    age_on_admission: 34,
    height: "175",
    id_number: "CM90123456789",
    id_type: "National ID",
    marital_status: "Single",
    fathers_name: "James Doe",
    mothers_name: "Mary Doe",
    tribe: "Muganda",
    religion: "Christianity",
    education_level: "Secondary",
    employment_status: "Employed",
    employer: "ABC Company Ltd",
    employment_description: "Construction Worker",
    address_region: "Central Region",
    address_district: "Kampala",
    address_county: "Makindye",
    address_sub_county: "Makindye Division",
    address_parish: "Nsambya",
    address_village: "Kabalagala",
    permanent_region: "Central Region",
    permanent_district: "Masaka",
    permanent_county: "Kyotera",
    build: "Medium",
    face: "Oval",
    eyes: "Brown",
    hair: "Black, Short",
    marks: "Small scar on left cheek",
    description: "Average build, brown eyes, short black hair",
    created_by: 1,
    updated_by: 1,
  },
  "2": {
    id: "2",
    is_active: true,
    first_name: "Jane",
    middle_name: "Marie",
    surname: "Smith",
    date_of_birth: "1985-08-22",
    date_of_admission: "2024-09-15",
    prisoner_personal_number: "PP-2024-002",
    prisoner_number: "PN-2024-002",
    sex: "sex-2",
    sex_name: "Female",
    nationality: "nationality-2",
    nationality_name: "Kenyan",
    habitual_criminal: true,
    deformity: false,
    age_on_admission: 39,
    height: "165",
    id_number: "KE85987654321",
    id_type: "Passport",
    marital_status: "Divorced",
    fathers_name: "Robert Smith",
    mothers_name: "Anna Smith",
    tribe: "Kikuyu",
    religion: "Christianity",
    education_level: "University",
    employment_status: "Self-Employed",
    employer: "Self",
    employment_description: "Business Owner",
    address_region: "Eastern Region",
    address_district: "Mbale",
    address_county: "Mbale Municipality",
    build: "Slim",
    face: "Round",
    eyes: "Dark Brown",
    hair: "Black, Long",
    marks: "Tattoo on right arm",
    description: "Slim build, dark brown eyes, long black hair",
    created_by: 1,
    updated_by: 1,
  },
  "3": {
    id: "3",
    is_active: false,
    first_name: "Robert",
    middle_name: "Lee",
    surname: "Johnson",
    date_of_birth: "1995-03-10",
    date_of_admission: "2024-08-20",
    prisoner_personal_number: "PP-2024-003",
    prisoner_number: "PN-2024-003",
    sex: "sex-1",
    sex_name: "Male",
    nationality: "nationality-1",
    nationality_name: "Ugandan",
    habitual_criminal: false,
    deformity: true,
    age_on_admission: 29,
    height: "182",
    id_number: "CM95234567890",
    id_type: "National ID",
    marital_status: "Married",
    fathers_name: "David Johnson",
    mothers_name: "Grace Johnson",
    tribe: "Acholi",
    religion: "Islam",
    education_level: "Primary",
    employment_status: "Unemployed",
    address_region: "Northern Region",
    address_district: "Gulu",
    address_county: "Aswa",
    build: "Tall",
    face: "Long",
    eyes: "Brown",
    hair: "Black, Curly",
    marks: "Burn scar on left hand",
    description:
      "Tall build, brown eyes, curly black hair, visible deformity on left hand",
    created_by: 1,
    updated_by: 1,
  },
};

const PrisonerDetailScreen: React.FC<
  PrisonerDetailScreenProps
> = ({ prisonerId, onBack }) => {
  const [bioData, setBioData] =
    useState<PrisonerBioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState(false);

  // Fetch prisoner bio data on mount
  useEffect(() => {
    const fetchBioData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) =>
          setTimeout(resolve, 500),
        );

        const data = mockBioDataDetails[prisonerId];
        if (data) {
          setBioData(data);
        } else {
          toast.error("Prisoner bio data not found");
          onBack();
        }
      } catch (error) {
        toast.error("Failed to load prisoner bio data");
        console.error("Error fetching bio data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBioData();
  }, [prisonerId, onBack]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Call API to delete prisoner bio data
    toast.success("Prisoner bio data deleted successfully!");
    setIsDeleteDialogOpen(false);
    onBack();
  };

  const handleFormSubmit = (data: PrisonerBioData) => {
    // TODO: Call API to update prisoner bio data
    setBioData(data);
    toast.success("Prisoner bio data updated successfully!");
    setIsEditDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Loading prisoner details...
          </p>
        </div>
      </div>
    );
  }

  if (!bioData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Prisoner bio data not found
              </p>
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1>Prisoner Bio Data Details</h1>
            <p className="text-muted-foreground">
              {bioData.prisoner_number} -{" "}
              {`${bioData.first_name} ${bioData.middle_name || ""} ${bioData.surname}`.trim()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Bio Data View */}
      <PrisonerBioDataView bioData={bioData} />

      {/* Edit Dialog */}
      
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="max-w-[95vw] md:w-80 w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Prisoner Bio Data</DialogTitle>
          </DialogHeader>
          <PrisonerBioDataForm
            bioData={bioData}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bio data for{" "}
              {bioData.first_name} {bioData.surname}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrisonerDetailScreen;
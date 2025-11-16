import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { getPrisonerBiodataByPrisonerId, createPrisonerBiodata } from "../../../services/admission/prisonerBiodataService";

const PrisonerDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bioData, setBioData] = useState<PrisonerBioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch prisoner bio data on mount
  useEffect(() => {
    const fetchBioData = async () => {
      if (!id) {
        setError("No prisoner ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getPrisonerBiodataByPrisonerId(id);
        setBioData(data);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching bio data:", error);
        setError(error.message || "Failed to load prisoner bio data");
        toast.error("Failed to load prisoner bio data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBioData();
  }, [id]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    
    // TODO: Implement delete functionality when API endpoint is available
    toast.info("Delete functionality not yet implemented");
    setIsDeleteDialogOpen(false);
  };

  const handleFormSubmit = async (data: PrisonerBioData) => {
    // TODO: Implement update functionality when API endpoint is available
    setBioData(data);
    toast.success("Prisoner bio data updated successfully!");
    setIsEditDialogOpen(false);
  };

  const handleBack = () => {
    navigate("/admissions-management/prisoners");
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

  if (error || !bioData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error || "Prisoner bio data not found"}
              </p>
              <Button onClick={handleBack} variant="outline">
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Prisoner Bio Data Details</h1>
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
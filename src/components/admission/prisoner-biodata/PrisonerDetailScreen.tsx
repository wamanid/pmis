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
import { toast } from "sonner";
import PrisonerBioDataView from "./PrisonerBioDataView";
import PrisonerBioDataForm from "./PrisonerBioDataForm";
import { getPrisonerById, deletePrisoner } from "../../../services/admission/prisonerService";
import { getPrisonerBiodataByPrisonerId, updatePrisonerBiodata, deletePrisonerBiodata } from "../../../services/admission/prisonerBiodataService";
import type { Prisoner, PrisonerBiodata } from "../../../models/admission";

const PrisonerDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prisoner, setPrisoner] = useState<Prisoner | null>(null);
  const [bioData, setBioData] = useState<PrisonerBiodata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch prisoner info and bio data on mount
  useEffect(() => {
    const fetchPrisonerData = async () => {
      if (!id) {
        setError("No prisoner ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // First, fetch prisoner basic info
        const prisonerData = await getPrisonerById(id);
        setPrisoner(prisonerData);

        // Then, fetch prisoner biodata using prisoner ID filter
        const biodataResult = await getPrisonerBiodataByPrisonerId(id);
        
        if (biodataResult) {
          setBioData(biodataResult);
        } else {
          setError("No biodata found for this prisoner");
        }
        
        setError(null);
      } catch (error: any) {
        console.error("Error fetching prisoner data:", error);
        setError(error.message || "Failed to load prisoner data");
        toast.error("Failed to load prisoner data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrisonerData();
  }, [id]);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    
    try {
      // Delete both biodata and prisoner
      if (bioData?.id) {
        await deletePrisonerBiodata(bioData.id);
      }
      await deletePrisoner(id);
      
      toast.success("Prisoner deleted successfully");
      navigate("/admissions-management/prisoners");
    } catch (error) {
      console.error("Error deleting prisoner:", error);
      toast.error("Failed to delete prisoner");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (data: PrisonerBiodata) => {
    if (!bioData?.id) return;
    
    try {
      const updated = await updatePrisonerBiodata(bioData.id, data);
      setBioData(updated);
      toast.success("Prisoner biodata updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating biodata:", error);
      toast.error("Failed to update prisoner biodata");
    }
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

  if (error || !prisoner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error || "Prisoner not found"}
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
            <h1 className="text-2xl font-bold">Prisoner Details</h1>
            <p className="text-muted-foreground">
              {prisoner.prisoner_number_value} - {prisoner.full_name}
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
      {bioData ? (
        <PrisonerBioDataView bioData={bioData} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No biodata available for this prisoner
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] max-h-[95vh] overflow-y-auto">
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
              This will permanently delete the prisoner record and all associated biodata for{" "}
              {prisoner.full_name}. This action cannot be undone.
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
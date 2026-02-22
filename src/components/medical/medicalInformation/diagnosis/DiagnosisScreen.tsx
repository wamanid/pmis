import React, {useEffect, useState} from 'react';
import { Stethoscope, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import DiagnosisForm from './DiagnosisForm';
import DiagnosisList from './DiagnosisList';
import {
  addDiagnosis,
  addResult,
  CaseBook, deleteDiagnosis,
  deleteResult,
  Diagnosis, DiagnosisItem,
  getRegimentss, updateDiagnosis, updateResult
} from "../../../../services/medical/medicalInformation/medical";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem} from "../../../../services/stationServices/visitorsServices/VisitorsService";
import {Loading} from "../MedicalDetails";
import {handleCatchError, handleResponseError} from "../../../../services/stationServices/utils";
import {getDiagnosisList, getDiseasesList} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {toast} from "sonner";

export interface ChildProps {
  diagnosis: Diagnosis[];
  setDiagnosis: React.Dispatch<React.SetStateAction<Diagnosis[]>>;
  regiments: Unit[];
  setRegiments: React.Dispatch<React.SetStateAction<Unit[]>>;
  diseases: Unit[];
  setDiseases: React.Dispatch<React.SetStateAction<Unit[]>>;
  caseBooks: CaseBook[];
  setCaseBooks: React.Dispatch<React.SetStateAction<CaseBook[]>>;
  loading: Loading
  setLoading: React.Dispatch<React.SetStateAction<Loading>>
}

const DiagnosisScreen: React.FC<ChildProps> = ({ caseBooks, setCaseBooks, loading, setLoading, diagnosis, setDiagnosis,
                                                 regiments, setRegiments, diseases, setDiseases }) => {

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  //API Integration
  const [loader, setLoader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newDialogLoader, setNewDialogLoader] = useState(false)

  useEffect(() => {
    if (loading.diagnosis){
      fetchData()
    }
  }, [loading.diagnosis]);

  async function fetchData() {
    try {
      await getDiseasesList(setDiseases)
      await getDiagnosisList(setDiagnosis)

    } catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        diagnosis: false
      }))
    }
  }

  const handleCreateClick = () => {
     if (!diseases.length){
       toast.error("You can't create a case book record without a disease list")
      return
    }

    setDialogMode('create');
    setSelectedRecord(null);
    setShowDialog(true);
  };

  const handleView = (record: any) => {
    setDialogMode('view');
    setSelectedRecord(record);
    setShowDialog(true);
  };

  const handleEdit = (record: any) => {
    setDialogMode('edit');
    setSelectedRecord(record);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return

    try {
      await deleteDiagnosis(id)
      setDiagnosis(prev => prev.filter(rec => rec.id !== id))
      toast.success('Diagnosis record deleted successfully');
      setDeleteDialogOpen(false)

    }catch (error) {
      handleCatchError(error)
    }
    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (data: DiagnosisItem) => {
    try {
      let response
      if (selectedRecord) {
        response = await updateDiagnosis(data, selectedRecord.id)
      }
      else {
        response = await addDiagnosis(data)
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the diagnosis records table");
        return;
      }

      if (selectedRecord) {
        setDiagnosis(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        toast.success('Diagnosis record updated successfully');
      }
      else {
        setDiagnosis(prev => [response, ...prev]);
        toast.success('Diagnosis record created successfully');
      }

      setShowDialog(false);
      setSelectedRecord(null);
    }
    catch (error) {
      handleCatchError(error)
    }
    finally {
      setLoader(false)
    }
    // setShowDialog(false);
    // setSelectedRecord(null);
    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setSelectedRecord(null);
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {
        loading.diagnosis ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching Diagnosis records, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h1 style={{ color: '#650000' }}>Diagnosis</h1>
                    <p className="text-gray-600">
                      Manage and track prisoner medical diagnoses and evaluations
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateClick}
                    style={{ backgroundColor: '#650000' }}
                    className="text-white hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Diagnosis
                  </Button>
                </div>

                {/* Diagnosis List */}
                <DiagnosisList
                  diagnosis={diagnosis}
                  diseases={diseases}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  refreshTrigger={refreshTrigger}
                />
            </>
        )
      }
      {/* Dialog for Create/Edit/View */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Stethoscope className="h-5 w-5" />
              {dialogMode === 'create' && 'New Diagnosis'}
              {dialogMode === 'edit' && 'Edit Diagnosis'}
              {dialogMode === 'view' && 'View Diagnosis'}
            </DialogTitle>
          </DialogHeader>
          <DiagnosisForm
            diagnosis={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
            setNewDialogLoader={setNewDialogLoader}
            loader={loader}
            setLoader={setLoader}
            caseBooks={caseBooks}
            setCaseBooks={setCaseBooks}
            diseases={diseases}
            regiments={regiments}
            setRegiments={setRegiments}
          />
        </DialogContent>
      </Dialog>

      {/* Loading Dialog */}
      <Dialog open={newDialogLoader} onOpenChange={setNewDialogLoader}>
        <DialogContent className="max-w-[95vw] w-[1300px] overflow-hidden">
          <div className="flex-1 p-6">
            <DialogHeader>
              <DialogTitle style={{ color: '#650000' }}></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">
                    Fetching additional information
                  </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiagnosisScreen;

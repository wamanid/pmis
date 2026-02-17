import React, {useEffect, useState} from 'react';
import { Heart, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import AilmentForm from './AilmentForm';
import AilmentList from './AilmentList';
import {
  addAilment,
  addLabTest,
  Ailment,
  CaseBook, deleteAilment,
  deleteLabTest,
  Diagnosis,
  MedicalRecord, updateAilment, updateLabTest
} from "../../../../services/medical/medicalInformation/medical";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {Loading} from "../MedicalDetails";
import {handleCatchError, handleResponseError} from "../../../../services/stationServices/utils";
import {
  getAilmentsList,
  getDiseasesList,
  getRegimentList
} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {toast} from "sonner";

export interface ChildProps {
  regiments: Unit[];
  setRegiments: React.Dispatch<React.SetStateAction<Unit[]>>;
  diseases: Unit[];
  setDiseases: React.Dispatch<React.SetStateAction<Unit[]>>;
  ailments: Ailment[];
  setAilments: React.Dispatch<React.SetStateAction<Ailment[]>>;
  loading: Loading
  setLoading: React.Dispatch<React.SetStateAction<Loading>>
  medicalRecords: MedicalRecord[]
  setMedicalRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>
}

const AilmentScreen: React.FC<ChildProps> = ({ regiments, setRegiments, diseases, setDiseases, ailments, setAilments,
                                               loading, setLoading, setMedicalRecords, medicalRecords }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  //API Integration
  const [loader, setLoader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newDialogLoader, setNewDialogLoader] = useState(false)

  useEffect(() => {
    if (loading.ailments){
      fetchData()
    }
  }, [loading.ailments]);

  async function fetchData() {
    try {
      if (!diseases.length){
        await getDiseasesList(setDiseases)
      }

      if (!regiments.length){
        await getRegimentList(setRegiments)
      }

      await getAilmentsList(setAilments)

    } catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        ailments: false
      }))
    }
  }

  const handleCreateClick = () => {
     if (!diseases.length){
       toast.error("You can't create an ailment record without a disease list")
      return
    }

     if (!regiments.length){
       toast.error("You can't create an ailment record without the regiments")
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
      await deleteAilment(id)
      setAilments(prev => prev.filter(rec => rec.id !== id))
      toast.success('Ailment deleted successfully');
      setDeleteDialogOpen(false)

    }catch (error) {
      handleCatchError(error)
    }
  };

  const handleSubmit = async (data: any) => {
    // console.log(data)

    const formData = new FormData()

    formData.append("remarks", data.remarks)
    formData.append("prisoner_medical_record", data.prisoner_medical_record)
    formData.append("ailment", data.ailment)
    formData.append("regiment", data.regiment)

    if (data.supporting_document && data.document instanceof File) {
      formData.append("supporting_document", data.document);
    }

    console.log(formData)

    try {
      let response
      if (selectedRecord) {
        response = await updateAilment(formData, selectedRecord.id)
      }
      else {
        response = await addAilment(formData)
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the ailments' table");
        return;
      }

      if (selectedRecord) {
        setAilments(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        console.log(response)
        toast.success('Ailment updated successfully');
      }
      else {
        setAilments(prev => [response, ...prev]);
        console.log(response)
        toast.success('Ailment created successfully');
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
        loading.ailments ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching Ailments' records, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <div>
                  <h1 style={{ color: '#650000' }}>Ailments</h1>
                  <p className="text-gray-600">
                    Manage and track prisoner ailments, conditions, and health issues
                  </p>
                </div>
                <Button
                  onClick={handleCreateClick}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Ailment
                </Button>
              </div>

              {/* Ailment List */}
              <AilmentList
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refreshTrigger={refreshTrigger}
                regiments={regiments}
                diseases={diseases}
                ailments={ailments}
              />
            </>
        )
      }


      {/* Dialog for Create/Edit/View */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Heart className="h-5 w-5" />
              {dialogMode === 'create' && 'New Ailment'}
              {dialogMode === 'edit' && 'Edit Ailment'}
              {dialogMode === 'view' && 'View Ailment'}
            </DialogTitle>
          </DialogHeader>
          <AilmentForm
            ailment={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
            setNewDialogLoader={setNewDialogLoader}
            loader={loader}
            setLoader={setLoader}
            medicalRecords={medicalRecords}
            setMedicalRecords={setMedicalRecords}
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

export default AilmentScreen;

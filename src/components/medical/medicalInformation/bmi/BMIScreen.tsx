import React, {useEffect, useState} from 'react';
import { Activity, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import BMIForm from './BMIForm';
import BMIList from './BMIList';
import {PrisonerItem} from "../../../../services/stationServices/visitorsServices/VisitorsService";
import {Loading} from "../MedicalDetails";
import {
  getBloodGroupList, getBmiList, getClassifications,
  getMedicalRecordsList,
  getPrisonersList
} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError, handleResponseError} from "../../../../services/stationServices/utils";
import {
  addBmiRecord,
  addMedicalRecord,
  Bmi,
  BmiClassification,
  BmiRecord, deleteBmiRecord, deleteMedicalRecord, updateBmiRecord,
  updateMedicalRecord
} from "../../../../services/medical/medicalInformation/medical";
import {toast} from "sonner";

interface ChildProps {
  prisoners: PrisonerItem[]
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
  loading: Loading
  setLoading: React.Dispatch<React.SetStateAction<Loading>>
  classifications: BmiClassification[]
  setClassifications: React.Dispatch<React.SetStateAction<BmiClassification[]>>
  bmiRecords: BmiRecord[]
  setBmiRecords: React.Dispatch<React.SetStateAction<BmiRecord[]>>
}

const BMIScreen: React.FC<ChildProps> = ({ prisoners, setPrisoners, loading, setLoading,bmiRecords, setBmiRecords, classifications, setClassifications }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // API integration

  const [loader, setLoader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (loading.bmi){
      fetchData()
    }
  }, [loading.bmi]);

  async function fetchData() {
    try {
      if (!prisoners.length) {
        await getPrisonersList(setPrisoners)
      }
      await getBmiList(setBmiRecords)
      await getClassifications(setClassifications)
    } catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        bmi: false
      }))
    }
  }

  const handleCreateClick = () => {
    if (!prisoners.length){
      toast.error("You can't create a bmi record without prisoners")
      return
    }
    if (!classifications.length){
      toast.error("You can create a bmi record without Classifications")
      return;
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
      await deleteBmiRecord(id)
      setBmiRecords(prev => prev.filter(rec => rec.id !== id))
      toast.success('BMI record deleted successfully');
      setDeleteDialogOpen(false)

    }catch (error) {
      handleCatchError(error)
    }
    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (data: Bmi) => {
    // console.log(data)
    try {
      let response
      if (selectedRecord) {
        response = await updateBmiRecord(data, selectedRecord.id)
      }
      else {
        response = await addBmiRecord(data)
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the bmi records table");
        return;
      }

      if (selectedRecord) {
        setBmiRecords(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        toast.success('BMI record updated successfully');
      }
      else {
        setBmiRecords(prev => [response, ...prev]);
        toast.success('BMI record created successfully');
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
        loading.bmi ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching BMI information, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
               {/* Header */}
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h1 style={{ color: '#650000' }}>BMI Records</h1>
                    <p className="text-gray-600">
                      Track and monitor prisoner Body Mass Index measurements and classifications
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateClick}
                    style={{ backgroundColor: '#650000' }}
                    className="text-white hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New BMI Record
                  </Button>
                </div>

                {/* BMI List */}
                <BMIList
                  deleteDialogOpen={deleteDialogOpen}
                  setDeleteDialogOpen={setDeleteDialogOpen}
                  setBmiRecords={setBmiRecords}
                  bmiRecords={bmiRecords}
                  classifications={classifications}
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
              <Activity className="h-5 w-5" />
              {dialogMode === 'create' && 'New BMI Record'}
              {dialogMode === 'edit' && 'Edit BMI Record'}
              {dialogMode === 'view' && 'View BMI Record'}
            </DialogTitle>
          </DialogHeader>
          <BMIForm
            classifications={classifications}
            prisoners={prisoners}
            loader={loader}
            setLoader={setLoader}
            bmiRecord={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BMIScreen;

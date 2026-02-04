import React, {useEffect, useState} from 'react';
import {Activity, Edit, Plus, Search, Trash2} from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import MedicalRecordForm from './MedicalRecordForm';
import MedicalRecordList from './MedicalRecordList';
import {Loader} from "../../../discharge/ViewDischargeDetails";
import {deleteAllowance, DischargeRequest, DischargeType} from "../../../../services/discharge/discharge";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem} from "../../../../services/stationServices/visitorsServices/VisitorsService";
import {StaffItem} from "../../../../services/stationServices/staffDeploymentService";
import {Loading} from "../MedicalDetails";
import {Card, CardContent} from "../../../ui/card";
import {Input} from "../../../ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../../../ui/table";
import {getBloodGroupList, getMedicalRecordsList, getPrisonersList} from "../../../../services/medical/medicalApis";
import {handleCatchError, handleResponseError} from "../../../../services/stationServices/utils";
import {
  addMedicalRecord,
  deleteMedicalRecord,
  MedicalRecord,
  updateMedicalRecord
} from "../../../../services/medical/medical";
import {toast} from "sonner";

interface ChildProps {
  prisoners: PrisonerItem
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
  loading: Loading
  setLoading: React.Dispatch<React.SetStateAction<Loading>>
}

const MedicalRecordScreen: React.FC<ChildProps> = ({ prisoners, setPrisoners, loading, setLoading }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // API Integration
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [bloodGroups, setBloodGroups] = useState<Unit[]>([]);
  const [loader, setLoader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (loading.record){
      fetchData()
    }
  }, [loading.record]);

  async function fetchData() {
    try {
      await getPrisonersList(setPrisoners)
      await getMedicalRecordsList(setMedicalRecords)
      await getBloodGroupList(setBloodGroups)
    } catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        record: false
      }))
    }
  }

  const handleCreateClick = () => {
    if (!prisoners.length){
      toast.error("You can create a medical record without prisoners")
      return
    }
    if (!bloodGroups.length){
      toast.error("You can create a medical record without blood groups")
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

    // console.log(record)

    setDialogMode('edit');
    setSelectedRecord(record);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return

    try {
      await deleteMedicalRecord(id)
      setMedicalRecords(prev => prev.filter(rec => rec.id !== id))
      toast.success('Medical record deleted successfully');
      setDeleteDialogOpen(false)

    }catch (error) {
      handleCatchError(error)
    }

    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (data: any) => {
    // console.log(data)
    try {
      let response
      if (selectedRecord) {
        response = await updateMedicalRecord(data, selectedRecord.id)
      }
      else {
        response = await addMedicalRecord(data)
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the medical records table");
        return;
      }

      if (selectedRecord) {
        setMedicalRecords(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        toast.success('Medical record updated successfully');
      }
      else {
        setMedicalRecords(prev => [response, ...prev]);
        toast.success('Medical record created successfully');
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
        loading.record ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching medical records, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
               {/* Header */}
                <div className="flex items-center justify-between w-full">
                  <div>
                    <h1 style={{ color: '#650000' }}>Medical Records</h1>
                    <p className="text-gray-600">
                      Manage and track prisoner medical records and health information
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateClick}
                    style={{ backgroundColor: '#650000' }}
                    className="text-white hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Medical Record
                  </Button>
                </div>

                {/* Medical Record List */}
                <MedicalRecordList
                  medicalRecords={medicalRecords}
                  bloodGroups={bloodGroups}
                  setMedicalRecords={setMedicalRecords}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deleteDialogOpen={deleteDialogOpen}
                  setDeleteDialogOpen={setDeleteDialogOpen}
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
              {dialogMode === 'create' && 'New Medical Record'}
              {dialogMode === 'edit' && 'Edit Medical Record'}
              {dialogMode === 'view' && 'View Medical Record'}
            </DialogTitle>
          </DialogHeader>
          <MedicalRecordForm
            bloodGroups={bloodGroups}
            loader={loader}
            setLoader={setLoader}
            prisoners={prisoners}
            medicalRecord={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalRecordScreen;

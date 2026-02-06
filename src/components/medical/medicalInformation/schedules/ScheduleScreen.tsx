import React, {useEffect, useState} from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import ScheduleForm from './ScheduleForm';
import ScheduleList from './ScheduleList';
import {
  addBmiRecord, addSchedule,
  CaseBook, deleteCaseBook, deleteSchedule,
  NewSchedule,
  Schedule,
  updateBmiRecord, updateSchedule
} from "../../../../services/medical/medicalInformation/medical";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem} from "../../../../services/stationServices/visitorsServices/VisitorsService";
import {Loading} from "../MedicalDetails";
import {getScheduleList} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError, handleResponseError} from "../../../../services/stationServices/utils";
import {toast} from "sonner";

export interface ChildProps {
  caseBooks: CaseBook[];
  setCaseBooks: React.Dispatch<React.SetStateAction<CaseBook[]>>;
  loading: Loading
  setLoading: React.Dispatch<React.SetStateAction<Loading>>
  schedules: Schedule[]
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>
}

const ScheduleScreen: React.FC<ChildProps> = ({ caseBooks, setCaseBooks, setSchedules, schedules, loading, setLoading }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  //API Integration
  const [loader, setLoader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newDialogLoader, setNewDialogLoader] = useState(false)

  useEffect(() => {
    if (loading.schedule){
      fetchData()
    }
  }, [loading.schedule]);

  async function fetchData() {
    try {
      // if (!prisoners.length) {
      //   await getPrisonersList(setPrisoners)
      // }
      await getScheduleList(setSchedules)
    } catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        schedule: false
      }))
    }
  }

  const handleCreateClick = () => {
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
      await deleteSchedule(id)
      setSchedules(prev => prev.filter(rec => rec.id !== id))
      toast.success('Schedule deleted successfully');
      setDeleteDialogOpen(false)

    }catch (error) {
      handleCatchError(error)
    }
  };

  const handleSubmit = async (data: NewSchedule) => {
     try {
      let response
      if (selectedRecord) {
        response = await updateSchedule(data, selectedRecord.id)
      }
      else {
        response = await addSchedule(data)
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the schedules' table");
        return;
      }

      if (selectedRecord) {
        setSchedules(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        toast.success('Schedule record updated successfully');
      }
      else {
        setSchedules(prev => [response, ...prev]);
        toast.success('Schedule created successfully');
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
        loading.schedule ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching available schedules, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <div>
                  <h1 style={{ color: '#650000' }}>Medical Schedules</h1>
                  <p className="text-gray-600">
                    Manage and track prisoner medical appointments and schedules
                  </p>
                </div>
                <Button
                  onClick={handleCreateClick}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </div>

              {/* Schedule List */}
              <ScheduleList
                schedules={schedules}
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
              <Calendar className="h-5 w-5" />
              {dialogMode === 'create' && 'New Schedule'}
              {dialogMode === 'edit' && 'Edit Schedule'}
              {dialogMode === 'view' && 'View Schedule'}
            </DialogTitle>
          </DialogHeader>
          <ScheduleForm
            caseBooks={caseBooks}
            setCaseBooks={setCaseBooks}
            setNewDialogLoader={setNewDialogLoader}
            loader={loader}
            setLoader={setLoader}
            schedule={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
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
                    Fetching patient BMI records
                  </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ScheduleScreen;

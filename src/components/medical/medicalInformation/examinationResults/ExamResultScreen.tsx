import React, {useEffect, useState} from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import ExamResultForm from './ExamResultForm';
import ExamResultList from './ExamResultList';
import {
  addCaseBook, addResult,
  CaseBook, deleteCaseBook, deleteResult,
  ExaminationResult,
  Result,
  updateCaseBook, updateResult
} from "../../../../services/medical/medicalInformation/medical";
import {Loading} from "../MedicalDetails";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {
  getCasebookList, getExaminationResultsList,
  getExamsList,
  getScheduleList
} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError, handleResponseError} from "../../../../services/stationServices/utils";
import {toast} from "sonner";

export interface ChildProps {
  caseBooks: CaseBook[];
  setCaseBooks: React.Dispatch<React.SetStateAction<CaseBook[]>>;
  loading: Loading
  setLoading: React.Dispatch<React.SetStateAction<Loading>>
  exams: Unit[];
  setExams: React.Dispatch<React.SetStateAction<Unit[]>>;
  examinationResults: ExaminationResult[]
  setExaminationResults: React.Dispatch<React.SetStateAction<ExaminationResult[]>>
}

const ExamResultScreen: React.FC<ChildProps> = ({ caseBooks, setCaseBooks, loading, setLoading, examinationResults, exams, setExaminationResults, setExams }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  //API Integration
  const [loader, setLoader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newDialogLoader, setNewDialogLoader] = useState(false)

  useEffect(() => {
    if (loading.exam){
      fetchData()
    }
  }, [loading.exam]);

  async function fetchData() {
    try {
      if (!caseBooks.length) {
        await getCasebookList(setCaseBooks)
      }
      await getExamsList(setExams)
      await getExaminationResultsList(setExaminationResults)
    } catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        exam: false
      }))
    }
  }

  const handleCreateClick = () => {
    if(!exams.length) {
       toast.error("You can't enter an examination result without medical exams")
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
      await deleteResult(id)
      setExaminationResults(prev => prev.filter(rec => rec.id !== id))
      toast.success('Examination result deleted successfully');
      setDeleteDialogOpen(false)

    }catch (error) {
      handleCatchError(error)
    }
    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (data: Result) => {
     try {
      let response
      if (selectedRecord) {
        response = await updateResult(data, selectedRecord.id)
      }
      else {
        response = await addResult(data)
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the examination results table");
        return;
      }

      if (selectedRecord) {
        setExaminationResults(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        toast.success('Examination Result updated successfully');
      }
      else {
        setExaminationResults(prev => [response, ...prev]);
        toast.success('Examination Result created successfully');
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
        loading.exam ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching available examination results, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <div>
                  <h1 style={{ color: '#650000' }}>Examination Results</h1>
                  <p className="text-gray-600">
                    Manage and track prisoner medical examination results and findings
                  </p>
                </div>
                <Button
                  onClick={handleCreateClick}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Exam Result
                </Button>
              </div>

              {/* Exam Result List */}
              <ExamResultList
                examinationResults={examinationResults}
                exams={exams}
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
              <FileText className="h-5 w-5" />
              {dialogMode === 'create' && 'New Exam Result'}
              {dialogMode === 'edit' && 'Edit Exam Result'}
              {dialogMode === 'view' && 'View Exam Result'}
            </DialogTitle>
          </DialogHeader>
          <ExamResultForm
            exams={exams}
            caseBooks={caseBooks}
            setCaseBooks={setCaseBooks}
            setNewDialogLoader={setNewDialogLoader}
            loader={loader}
            setLoader={setLoader}
            examResult={selectedRecord}
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
                    Fetching patients' Case books
                  </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamResultScreen;

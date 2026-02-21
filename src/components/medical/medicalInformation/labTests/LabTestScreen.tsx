import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import { TestTube, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import LabTestForm, {Test} from './LabTestForm';
import LabTestList from './LabTestList';
import {
  addLabTest,
  addResult,
  CaseBook, deleteLabTest, deleteResult,
  ExaminationResult,
  getMedicalTests,
  LabTest, updateLabTest, updateResult
} from "../../../../services/medical/medicalInformation/medical";
import {Loading} from "../MedicalDetails";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {
  getCasebookList,
  getExaminationResultsList,
  getExamsList, getLabTestsList, getMedicalTestsList, getTestResultsList
} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError, handleResponseError} from "../../../../services/stationServices/utils";
import {toast} from "sonner";

export interface ChildProps {
  caseBooks: CaseBook[];
  setCaseBooks: React.Dispatch<React.SetStateAction<CaseBook[]>>;
  loading: Loading
  setLoading: React.Dispatch<React.SetStateAction<Loading>>
  labTests: LabTest[];
  setLabTests: React.Dispatch<SetStateAction<LabTest[]>>;
  medicalTests: Unit[];
  setMedicalTests: React.Dispatch<SetStateAction<Unit[]>>;
  testResults: Unit[];
  setTestResults: React.Dispatch<SetStateAction<Unit[]>>;
}

const LabTestScreen: React.FC<ChildProps> = ({ loading, setLoading, caseBooks, setCaseBooks, setTestResults, testResults,
                                               setMedicalTests, medicalTests, labTests, setLabTests }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // API Integration
  const [loader, setLoader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newDialogLoader, setNewDialogLoader] = useState(false)

  useEffect(() => {
    if (loading.lab){
      fetchData()
    }
  }, [loading.lab]);

  async function fetchData() {
    try {
      await getMedicalTestsList(setMedicalTests)
      await getTestResultsList(setTestResults)
      await getLabTestsList(setLabTests)
    } catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        lab: false
      }))
    }
  }

  const handleCreateClick = () => {
     if(!medicalTests.length) {
       toast.error("You can't enter a lab test without medical tests")
        return
    }

    if(!testResults.length) {
       toast.error("You can't enter a lab test without test results")
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
      await deleteLabTest(id)
      setLabTests(prev => prev.filter(rec => rec.id !== id))
      toast.success('Lab Test deleted successfully');
      setDeleteDialogOpen(false)

    }catch (error) {
      handleCatchError(error)
    }
    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (data: Test) => {

    // console.log(data)

    const formData = new FormData()

    formData.append("notes", data.notes)
    formData.append("medical_case_book", data.medical_case_book)
    formData.append("medical_test", data.medical_test)
    formData.append("result", data.result)

    if (data.result_document && data.document instanceof File) {
      formData.append("result_document", data.document);
    }

    console.log(formData)

    try {
      let response
      if (selectedRecord) {
        response = await updateLabTest(formData, selectedRecord.id)
      }
      else {
        response = await addLabTest(formData)
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the lab tests table");
        return;
      }

      if (selectedRecord) {
        setLabTests(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        console.log(response)
        toast.success('Lab test updated successfully');
      }
      else {
        setLabTests(prev => [response, ...prev]);
        console.log(response)
        toast.success('Lab test created successfully');
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
        loading.lab ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching available lab tests, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <div>
                  <h1 style={{ color: '#650000' }}>Laboratory Tests</h1>
                  <p className="text-gray-600">
                    Manage and track prisoner laboratory test requests and results
                  </p>
                </div>
                <Button
                  onClick={handleCreateClick}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Lab Test
                </Button>
              </div>

              {/* Lab Test List */}
              <LabTestList
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refreshTrigger={refreshTrigger}
                labTests={labTests}
                medicalTests={medicalTests}
                testResults={testResults}
              />
            </>
        )
      }

      {/* Dialog for Create/Edit/View */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <TestTube className="h-5 w-5" />
              {dialogMode === 'create' && 'New Lab Test'}
              {dialogMode === 'edit' && 'Edit Lab Test'}
              {dialogMode === 'view' && 'View Lab Test'}
            </DialogTitle>
          </DialogHeader>
          <LabTestForm
            labTest={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            mode={dialogMode}
            medicalTests={medicalTests}
            testResults={testResults}
            setNewDialogLoader={setNewDialogLoader}
            loader={loader}
            setLoader={setLoader}
            caseBooks={caseBooks}
            setCaseBooks={setCaseBooks}
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

export default LabTestScreen;
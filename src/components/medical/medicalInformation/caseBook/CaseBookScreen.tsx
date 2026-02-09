import React, {useEffect, useState} from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import CaseBookForm from './CaseBookForm';
import CaseBookList from './CaseBookList';
import {
  addBmiRecord, addCaseBook,
  BmiRecord,
  Case,
  CaseBook, deleteBmiRecord, deleteCaseBook,
  getPresentationTypes,
  updateBmiRecord, updateCaseBook
} from "../../../../services/medical/medicalInformation/medical";
import {Unit} from "../../../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem} from "../../../../services/stationServices/visitorsServices/VisitorsService";
import {Loading} from "../MedicalDetails";
import {
  getBmiList, getCasebookList, getCheckupTypesList,
  getClassifications, getPresentations,
  getPrisonersList
} from "../../../../services/medical/medicalInformation/medicalGetApis";
import {handleCatchError, handleResponseError} from "../../../../services/stationServices/utils";
import {toast} from "sonner";

export interface ChildProps {
  caseBooks: CaseBook[];
  setCaseBooks: React.Dispatch<React.SetStateAction<CaseBook[]>>;
  checkupTypes: Unit[];
  setCheckupTypes: React.Dispatch<React.SetStateAction<Unit[]>>;
  presentations: Unit[];
  setPresentations: React.Dispatch<React.SetStateAction<Unit[]>>;
  prisoners: PrisonerItem[]
  setPrisoners: React.Dispatch<React.SetStateAction<PrisonerItem[]>>
  loading: Loading
  setLoading: React.Dispatch<React.SetStateAction<Loading>>
  // bmiRecords: BmiRecord[]
  // setBmiRecords: React.Dispatch<React.SetStateAction<BmiRecord[]>>
  bloodGroups: Unit[]
  setBloodGroups: React.Dispatch<React.SetStateAction<Unit[]>>
}

const CaseBookScreen: React.FC<ChildProps> = ({ prisoners, setPrisoners, loading, setLoading, caseBooks, checkupTypes,
                                                setCaseBooks, setCheckupTypes, presentations, setPresentations,
                                                setBloodGroups, bloodGroups }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCaseBook, setSelectedCaseBook] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  //API Integration
  const [loader, setLoader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newDialogLoader, setNewDialogLoader] = useState(false)

  useEffect(() => {
    if (loading.case){
      fetchData()
    }
  }, [loading.case]);

  async function fetchData() {
    try {
      // if (!prisoners.length) {
      //   await getPrisonersList(setPrisoners)
      // }
      await getPresentations(setPresentations)
      await getCheckupTypesList(setCheckupTypes)
      await getCasebookList(setCaseBooks)
    } catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        case: false
      }))
    }
  }

  const handleCreateClick = () => {
    if (!checkupTypes.length){
       toast.error("You can't create a case book record without check up types")
      return
    }
    if (!presentations.length){
       toast.error("You can't create a case book record without presentation types")
      return
    }
    setDialogMode('create');
    setSelectedCaseBook(null);
    setShowDialog(true);
  };

  const handleView = (caseBook: any) => {
    setDialogMode('view');
    setSelectedCaseBook(caseBook);
    setShowDialog(true);
  };

  const handleEdit = (caseBook: any) => {
    setDialogMode('edit');
    setSelectedCaseBook(caseBook);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return

    try {
      await deleteCaseBook(id)
      setCaseBooks(prev => prev.filter(rec => rec.id !== id))
      toast.success('Case book record deleted successfully');
      setDeleteDialogOpen(false)

    }catch (error) {
      handleCatchError(error)
    }
  };

  const handleSubmit = async (data: Case) => {

    // console.log(data)
    try {
      let response
      if (selectedCaseBook) {
        response = await updateCaseBook(data, selectedCaseBook.id)
      }
      else {
        response = await addCaseBook(data)
      }
      if (handleResponseError(response)) return;

      if (!('id' in response)) {
        toast.error("Failed to update the case book records table");
        return;
      }

      if (selectedCaseBook) {
        setCaseBooks(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        toast.success('Case book record updated successfully');
      }
      else {
        setCaseBooks(prev => [response, ...prev]);
        toast.success('Case book record created successfully');
      }

      setShowDialog(false);
      setSelectedCaseBook(null);
    }
    catch (error) {
      handleCatchError(error)
    }
    finally {
      setLoader(false)
    }

    // setShowDialog(false);
    // setSelectedCaseBook(null);
    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setSelectedCaseBook(null);
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {
        loading.case ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching Case book records, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <div>
                  <h1 style={{ color: '#650000' }}>Medical Case Book</h1>
                  <p className="text-gray-600">
                    Manage and track prisoner medical case records, examinations, and health assessments
                  </p>
                </div>
                <Button
                  onClick={handleCreateClick}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Case Book Entry
                </Button>
              </div>

              {/* Case Book List */}
              <CaseBookList
                caseBooks={caseBooks}
                checkupTypes={checkupTypes}
                presentations={presentations}
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
              {dialogMode === 'create' && 'New Case Book Entry'}
              {dialogMode === 'edit' && 'Edit Case Book Entry'}
              {dialogMode === 'view' && 'View Case Book Entry'}
            </DialogTitle>
          </DialogHeader>
          <CaseBookForm
            setNewDialogLoader={setNewDialogLoader}
            caseBook={selectedCaseBook}
            onSubmit={handleSubmit}
            presentations={presentations}
            onCancel={handleCancel}
            mode={dialogMode}
            loader={loader}
            setLoader={setLoader}
            checkupTypes={checkupTypes}
            bloodGroups={bloodGroups}
            setBloodGroups={setBloodGroups}
            prisoners={prisoners}
            setPrisoners={setPrisoners}
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

export default CaseBookScreen;

import React, {useEffect, useState} from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import RehabilitationEnrollmentForm from './enrollment/RehabilitationEnrollmentForm';
import RehabilitationEnrollmentList from './enrollment/RehabilitationEnrollmentList';
import {
  addEnrollment, deleteEnrollment,
  Enrollment,
  Programme,
  ProgrammeStage,
  RehabilitationEnrollment,
  Sponsor, updateEnrollment
} from "../../../services/rehabilitation";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";
import {
  getCertificationList, getEnrollmentList,
  getProgrammesList,
  getProgressStatusList
} from "../../../services/rehabilitation/enrollments/enrollmentGetApis";
import {handleCatchError, handleResponseError} from "../../../services/stationServices/utils";
import {PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {StaffItem} from "../../../services/stationServices/staffDeploymentService";
import {addCaseBook, deleteCaseBook, updateCaseBook} from "../../../services/medical/medicalInformation/medical";

// interface RehabilitationEnrollment {
//   id?: string;
//   prisoner_name?: string;
//   prisoner_number?: string;
//   programme_name?: string;
//   programme_stage_name?: string;
//   sponsor_name?: string;
//   responsible_officer_name?: string;
//   progress_status_name?: string;
//   prisoner_opinion: string;
//   date_of_enrollment: string;
//   start_date: string;
//   end_date: string;
//   certificate_awarded: boolean;
//   certification_document: string;
//   comment: string;
//   prisoner: string;
//   programme: string;
//   programme_stage: string;
//   rehabilitation_sponsor: string;
//   responsible_officer: number;
//   progress_status: string;
// }

const EnrollmentsScreen: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // API integrations
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [certifications, setCertifications] = useState<Unit[]>([]);
  const [statuses, setStatuses] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  // for creating an enrollment
  const [prisoners, setPrisoners] = useState<PrisonerItem[]>([])
  const [staff, setStaff] = useState<StaffItem[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [programmeStages, setProgrammeStages] = useState<ProgrammeStage[]>([])
  const [loader, setLoader] = useState(false);
  const [newDialogLoader, setNewDialogLoader] = useState(false)

  useEffect(() => {
    if(loading) {
      fetchData()
    }
  }, [loading]);

  async function fetchData() {
    try {
      await getProgrammesList(setProgrammes)
      await getProgressStatusList(setStatuses)
      await getCertificationList(setCertifications)
      await getEnrollmentList(setEnrollments)
    }catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
     if (!programmes.length){
       toast.error("You can't create an enrollment without programmes")
      return
    }
    if (!statuses.length){
       toast.error("You can't create an enrollment without progress statuses")
      return
    }

    setDialogMode('create');
    setSelectedEnrollment(null);
    setShowDialog(true);
  };

  const handleView = (enrollment: Enrollment) => {
    setDialogMode('view');
    setSelectedEnrollment(enrollment);
    setShowDialog(true);
  };

  const handleEdit = (enrollment: Enrollment) => {
    setDialogMode('edit');
    setSelectedEnrollment(enrollment);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    setEnrollmentToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {

    if (!enrollmentToDelete) return

    try {
      await deleteEnrollment(enrollmentToDelete)
      setEnrollments(prev => prev.filter(rec => rec.id !== enrollmentToDelete))
      toast.success('Enrollment deleted successfully');
      setShowDeleteDialog(false);
      setEnrollmentToDelete(null);

    }catch (error) {
      handleCatchError(error)
    }

    // Simulate API call
    // toast.success('Enrollment deleted successfully');
    // setShowDeleteDialog(false);
    // setEnrollmentToDelete(null);
    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleSubmit = async (data: RehabilitationEnrollment) => {
    // console.log(data)
    try {
      let response
      if (selectedEnrollment) {
        response = await updateEnrollment(data, selectedEnrollment.id)
      }
      else {
        response = await addEnrollment(data)
      }
      if (handleResponseError(response)) return;

      // console.log(response)

      if (selectedEnrollment) {
        if (!('id' in response)) {
          toast.error("Failed to update the enrollments table");
          return;
        }
        setEnrollments(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
        toast.success('Enrollment updated successfully');
      }
      else {
        const enrollments = response.enrollments
        setEnrollments(prev => [...enrollments, ...prev]);
        toast.success('Enrollment created successfully');
      }

      setShowDialog(false);
      setSelectedEnrollment(null);
    }
    catch (error) {
      handleCatchError(error)
    }
    finally {
      setLoader(false)
    }
    // Simulate API call
    // if (dialogMode === 'create') {
    //   toast.success('Enrollment created successfully');
    // } else {
    //   toast.success('Enrollment updated successfully');
    // }
    // setShowDialog(false);
    // setSelectedEnrollment(null);
    // setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setSelectedEnrollment(null);
  };

  return (
    <div className="p-6 space-y-6">

      {
        loading ? (
            <div className="size-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-sm">
                      Fetching available enrollments, Please wait...
                    </p>
              </div>
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 style={{ color: '#650000' }}>Enrollments</h1>
                  <p className="text-gray-600">Manage prisoner enrollments in rehabilitation programmes</p>
                </div>
                <Button
                  onClick={handleCreate}
                  style={{ backgroundColor: '#650000' }}
                  className="text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Enrollment
                </Button>
              </div>

              {/* Enrollment List */}
              <RehabilitationEnrollmentList
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refreshTrigger={refreshTrigger}
                enrollments={enrollments}
                programmes={programmes}
                certifications={certifications}
                statuses={statuses}
              />
            </>
        )
      }

      {/* Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto" style={{ width: '1200px' }}>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' && 'Create New Enrollment'}
              {dialogMode === 'edit' && 'Edit Enrollment'}
              {dialogMode === 'view' && 'View Enrollment Details'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' && 'Enroll a prisoner in a rehabilitation programme'}
              {dialogMode === 'edit' && 'Update enrollment information'}
              {dialogMode === 'view' && 'View enrollment details and progress'}
            </DialogDescription>
          </DialogHeader>
          <RehabilitationEnrollmentForm
            enrollment={selectedEnrollment}
            mode={dialogMode}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            prisoners={prisoners}
            setPrisoners={setPrisoners}
            staff={staff}
            setStaff={setStaff}
            sponsors={sponsors}
            setSponsors={setSponsors}
            programmeStages={programmeStages}
            setProgrammeStages={setProgrammeStages}
            programmes={programmes}
            statuses={statuses}
            loader={loader}
            setLoader={setLoader}
            setNewDialogLoader={setNewDialogLoader}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the enrollment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              style={{ backgroundColor: '#650000' }}
              className="text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

export default EnrollmentsScreen;

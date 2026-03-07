import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ClipboardCheck, Award, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import PrisonerSearchScreenWider from '../common/PrisonerSearchScreen-wider';
import RehabilitationEnrollmentList from './enrollments/enrollment/RehabilitationEnrollmentList';
import EnrollmentAssessmentList from './enrollments/assessment/EnrollmentAssessmentList';
import RehabilitationEnrollmentSessionList from './enrollments/sessions/RehabilitationEnrollmentSessionList';
import AfterCareList from './afterCare/AfterCareList';
import {
  Enrollment,
  Programme,
  Sponsor,
  ProgrammeStage,
  Assessment,
  AssessmentForm, updateEnrollment, addEnrollment, updateAssessment, addAssessment
} from '../../services/rehabilitation';
import { Unit } from '../../services/stationServices/visitorsServices/visitorItem';
import { PrisonerItem } from '../../services/stationServices/visitorsServices/VisitorsService';
import { StaffItem } from '../../services/stationServices/staffDeploymentService';
import {
  getEnrollmentList,
  getProgrammesList,
  getCertificationList,
  getProgressStatusList, getAssessmentList
} from '../../services/rehabilitation/enrollments/enrollmentGetApis';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import RehabilitationEnrollmentForm from './enrollments/enrollment/RehabilitationEnrollmentForm';
import EnrollmentAssessmentForm from './enrollments/assessment/EnrollmentAssessmentForm';
import RehabilitationEnrollmentSessionForm from './enrollments/sessions/RehabilitationEnrollmentSessionForm';
import AfterCareForm from './afterCare/AfterCareForm';
import EnrollmentDetailView from './enrollments/EnrollmentDetailView';
import {preinit} from "react-dom";
import {handleCatchError, handleResponseError} from "../../services/stationServices/utils";

interface Prisoner {
  id: string;
  prisoner_number: string;
  personal_number: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  id_number: string;
  id_type: string;
  gender: string;
  tribe: string;
  date_of_admission: string;
  religion: string;
  category?: string;
  status?: string;
}

export interface Loader {
  enrollment: boolean,
  assessment: boolean,
  session: boolean,
  afterCare: boolean,
}

const RehabilitationDetailView: React.FC = () => {
  const [selectedPrisoner, setSelectedPrisoner] = useState<Prisoner | null>(null);
  const [activeTab, setActiveTab] = useState<'enrollments' | 'assessments' | 'sessions' | 'aftercare'>('enrollments');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Backend data state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [certifications, setCertifications] = useState<Unit[]>([]);
  const [statuses, setStatuses] = useState<Unit[]>([]);
  const [prisoners, setPrisoners] = useState<PrisonerItem[]>([]);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [programmeStages, setProgrammeStages] = useState<ProgrammeStage[]>([]);
  const [loading, setLoading] = useState<Loader>({ enrollment: true, assessment: true, session: true, afterCare: true });
  const [loader, setLoader] = useState(false);
  const [newDialogLoader, setNewDialogLoader] = useState(false);

  // Load dropdown data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        getEnrollmentList(setEnrollments),
        getProgrammesList(setProgrammes),
        getCertificationList(setCertifications),
        getProgressStatusList(setStatuses)
      ]);
      setLoading(prev => ({...prev, enrollment: false}));
    };
    loadData();
  }, [refreshTrigger]);

  // Dialog states
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [enrollmentDialogMode, setEnrollmentDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [assessmentDialogMode, setAssessmentDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [sessionDialogMode, setSessionDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const [showAfterCareDialog, setShowAfterCareDialog] = useState(false);
  const [afterCareDialogMode, setAfterCareDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAfterCare, setSelectedAfterCare] = useState<any>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  // Prisoner selection handler
  const handlePrisonerSelect = (prisoner: Prisoner) => {
    setSelectedPrisoner(prisoner);
    setRefreshTrigger((prev) => prev + 1);
  };

  const [assessments, setAssessments] = useState<Assessment[]>([])

  useEffect(() => {
    if (activeTab === "assessments" && loading.assessment){
      fetchAssessments()
    }
  }, [activeTab]);

  async function fetchAssessments(){
    try {
      await getAssessmentList(setAssessments)
      const promises = []
      if (!programmes?.length) {
        promises.push(getProgrammesList(setProgrammes))
      }
      if (!statuses?.length) {
        promises.push(getProgressStatusList(setStatuses))
      }
      await Promise.all(promises)
    }
    catch (error) {
      handleCatchError(error)
    } finally {
      setLoading(prev => ({
        ...prev,
        assessment: false
      }))
    }
  }

  // Create button handlers
  const handleCreateClick = () => {
    switch (activeTab) {
      case 'enrollments':
        setEnrollmentDialogMode('create');
        setSelectedEnrollment(null);
        setShowEnrollmentDialog(true);
        break;
      case 'assessments':
        setAssessmentDialogMode('create');
        setSelectedAssessment(null);
        setShowAssessmentDialog(true);
        break;
      case 'sessions':
        setSessionDialogMode('create');
        setSelectedSession(null);
        setShowSessionDialog(true);
        break;
      case 'aftercare':
        setAfterCareDialogMode('create');
        setSelectedAfterCare(null);
        setShowAfterCareDialog(true);
        break;
    }
  };

  // Get dynamic button text based on active tab
  const getCreateButtonText = () => {
    switch (activeTab) {
      case 'enrollments':
        return 'Create Enrollment';
      case 'assessments':
        return 'Create Assessment';
      case 'sessions':
        return 'Create Session';
      case 'aftercare':
        return 'Create After Care';
      default:
        return 'Create';
    }
  };

  // Enrollment handlers
  const handleViewEnrollment = (enrollment: any) => {
    setEnrollmentDialogMode('view');
    setSelectedEnrollment(enrollment);
    setShowEnrollmentDialog(true);
  };

  const handleEditEnrollment = (enrollment: any) => {
    setEnrollmentDialogMode('edit');
    setSelectedEnrollment(enrollment);
    setShowEnrollmentDialog(true);
  };

  const handleDeleteEnrollment = (id: string) => {
    setDeleteTarget({ type: 'enrollment', id });
    setShowDeleteDialog(true);
  };

  const handleEnrollmentSubmit = (data: any, file?: File | null) => {
    toast.success(
      enrollmentDialogMode === 'create'
        ? 'Enrollment created successfully'
        : 'Enrollment updated successfully'
    );
    setShowEnrollmentDialog(false);
    setSelectedEnrollment(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Assessment handlers
  const handleViewAssessment = (assessment: any) => {
    setAssessmentDialogMode('view');
    setSelectedAssessment(assessment);
    setShowAssessmentDialog(true);
  };

  const handleEditAssessment = (assessment: any) => {
    setAssessmentDialogMode('edit');
    setSelectedAssessment(assessment);
    setShowAssessmentDialog(true);
  };

  const handleDeleteAssessment = (id: string) => {
    setDeleteTarget({ type: 'assessment', id });
    setShowDeleteDialog(true);
  };

  const handleAssessmentSubmit = async (data: AssessmentForm) => {
    console.log(data)
    try {
      let response
      if (selectedEnrollment) {
        response = await updateAssessment(data, selectedAssessment.id)
      }
      else {
        response = await addAssessment(data)
      }
      if (handleResponseError(response)) return;

      // console.log(response)

      if (selectedAssessment) {
        if (!('id' in response)) {
          toast.error("Failed to update the assessment table");
          return;
        }
        setAssessments(prev => (
            prev.map(item => item.id === response.id ? response : item)
        ));
      }
      else {
        const enrollments = response.enrollments
        setEnrollments(prev => [...enrollments, ...prev]);
      }

      toast.success(
      assessmentDialogMode === 'create'
        ? 'Assessment created successfully'
        : 'Assessment updated successfully'
    );

      setShowAssessmentDialog(false);
      setSelectedAssessment(null);
    }
    catch (error) {
      handleCatchError(error)
    }
    // finally {
    //   setLoader(false)
    // }
    // toast.success(
    //   assessmentDialogMode === 'create'
    //     ? 'Assessment created successfully'
    //     : 'Assessment updated successfully'
    // );
    // setShowAssessmentDialog(false);
    // setSelectedAssessment(null);
    // setRefreshTrigger((prev) => prev + 1);
  };

  // Session handlers
  const handleViewSession = (session: any) => {
    setSessionDialogMode('view');
    setSelectedSession(session);
    setShowSessionDialog(true);
  };

  const handleEditSession = (session: any) => {
    setSessionDialogMode('edit');
    setSelectedSession(session);
    setShowSessionDialog(true);
  };

  const handleDeleteSession = (id: string) => {
    setDeleteTarget({ type: 'session', id });
    setShowDeleteDialog(true);
  };

  const handleSessionSubmit = (data: any) => {
    toast.success(
      sessionDialogMode === 'create'
        ? 'Session created successfully'
        : 'Session updated successfully'
    );
    setShowSessionDialog(false);
    setSelectedSession(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  // After Care handlers
  const handleViewAfterCare = (afterCare: any) => {
    setAfterCareDialogMode('view');
    setSelectedAfterCare(afterCare);
    setShowAfterCareDialog(true);
  };

  const handleEditAfterCare = (afterCare: any) => {
    setAfterCareDialogMode('edit');
    setSelectedAfterCare(afterCare);
    setShowAfterCareDialog(true);
  };

  const handleDeleteAfterCare = (id: string) => {
    setDeleteTarget({ type: 'aftercare', id });
    setShowDeleteDialog(true);
  };

  const handleAfterCareSubmit = (data: any) => {
    toast.success(
      afterCareDialogMode === 'create'
        ? 'After care record created successfully'
        : 'After care record updated successfully'
    );
    setShowAfterCareDialog(false);
    setSelectedAfterCare(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Delete confirmation
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const messages = {
      enrollment: 'Enrollment deleted successfully',
      assessment: 'Assessment deleted successfully',
      session: 'Session deleted successfully',
      aftercare: 'After care record deleted successfully',
    };

    toast.success(messages[deleteTarget.type as keyof typeof messages]);
    setShowDeleteDialog(false);
    setDeleteTarget(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 style={{ color: '#650000' }}>Rehabilitation Management</h1>
          <p className="text-gray-600">
            View and manage prisoner rehabilitation records, enrollments, assessments, and after-care services
          </p>
        </div>
      </div>

      {/* Prisoner Search Section */}
      <Card style={{ borderTop: '3px solid #650000' }}>
        <CardContent className="pt-6">
          <PrisonerSearchScreenWider
            onPrisonerSelect={handlePrisonerSelect}
            showTitle={false}
            label="Select Prisoner to Filter Rehabilitation Records (Optional)"
          />
        </CardContent>
      </Card>

      {/* Tabs Section - Always show */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b items-center justify-between flex-wrap">
            <div className="flex gap-2 flex-1 flex-wrap">
              <button
                onClick={() => setActiveTab('enrollments')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                  activeTab === 'enrollments'
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{
                  backgroundColor: activeTab === 'enrollments' ? '#650000' : undefined,
                }}
              >
                <div className="flex items-center gap-2 justify-center">
                  <BookOpen className="h-4 w-4" />
                  <span>Enrollments</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('assessments')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                  activeTab === 'assessments'
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{
                  backgroundColor: activeTab === 'assessments' ? '#650000' : undefined,
                }}
              >
                <div className="flex items-center gap-2 justify-center">
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Assessments</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                  activeTab === 'sessions'
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{
                  backgroundColor: activeTab === 'sessions' ? '#650000' : undefined,
                }}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Calendar className="h-4 w-4" />
                  <span>Sessions</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('aftercare')}
                className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                  activeTab === 'aftercare'
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{
                  backgroundColor: activeTab === 'aftercare' ? '#650000' : undefined,
                }}
              >
                <div className="flex items-center gap-2 justify-center">
                  <Award className="h-4 w-4" />
                  <span>After Care</span>
                </div>
              </button>
            </div>

            {/* Dynamic Create Button */}
            <Button
              onClick={handleCreateClick}
              style={{ backgroundColor: '#650000' }}
              className="text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {getCreateButtonText()}
            </Button>
          </div>

          {/* Tab Content */}
          {activeTab === 'enrollments' && (
            <div className="p-6">
              {
                loading.enrollment ? (
                    <div className="size-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground text-sm">
                              Fetching Enrollment records, Please wait...
                            </p>
                      </div>
                    </div>
                ) : (
                   <RehabilitationEnrollmentList
                    onView={handleViewEnrollment}
                    onEdit={handleEditEnrollment}
                    onDelete={handleDeleteEnrollment}
                    refreshTrigger={refreshTrigger}
                    enrollments={enrollments}
                    programmes={programmes}
                    certifications={certifications}
                    statuses={statuses}
                  />
                )
              }

            </div>
          )}

          {activeTab === 'assessments' && (
            <div className="p-6">
              {
                loading.assessment ? (
                    <div className="size-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground text-sm">
                              Fetching Assessment records, Please wait...
                            </p>
                      </div>
                    </div>
                ) : (
                    <EnrollmentAssessmentList
                      onView={handleViewAssessment}
                      onEdit={handleEditAssessment}
                      onDelete={handleDeleteAssessment}
                      refreshTrigger={refreshTrigger}
                      prisonerId={selectedPrisoner?.id}
                      programmes={programmes}
                      statuses={statuses}
                      assessments={assessments}
                    />
                )
              }

            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="p-6">
              {
                loading.session ? (
                    <div className="size-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground text-sm">
                              Fetching Sessions records, Please wait...
                            </p>
                      </div>
                    </div>
                ) : (
                    <RehabilitationEnrollmentSessionList
                      onView={handleViewSession}
                      onEdit={handleEditSession}
                      onDelete={handleDeleteSession}
                      refreshTrigger={refreshTrigger}
                      prisonerId={selectedPrisoner?.id}
                    />
                )
              }

            </div>
          )}

          {activeTab === 'aftercare' && (
            <div className="p-6">
               {
                loading.afterCare ? (
                    <div className="size-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground text-sm">
                              Fetching After care records, Please wait...
                            </p>
                      </div>
                    </div>
                ) : (
                    <AfterCareList
                      onView={handleViewAfterCare}
                      onEdit={handleEditAfterCare}
                      onDelete={handleDeleteAfterCare}
                      refreshTrigger={refreshTrigger}
                      prisonerId={selectedPrisoner?.id}
                    />
                )
              }

            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollmentDialog} onOpenChange={setShowEnrollmentDialog}>
        <DialogContent
          className={
            enrollmentDialogMode === 'view'
              ? 'max-w-[95vw] w-[1400px] max-h-[95vh] overflow-y-auto'
              : 'max-w-[1200px] max-h-[90vh] overflow-y-auto'
          }
          style={enrollmentDialogMode === 'view' ? { width: '1400px' } : { width: '1200px' }}
        >
          {enrollmentDialogMode !== 'view' && (
            <DialogHeader>
              <DialogTitle>
                {enrollmentDialogMode === 'create' && 'Create New Enrollment'}
                {enrollmentDialogMode === 'edit' && 'Edit Enrollment'}
              </DialogTitle>
              <DialogDescription>
                {enrollmentDialogMode === 'create' && 'Enroll prisoner in a rehabilitation programme'}
                {enrollmentDialogMode === 'edit' && 'Update enrollment information'}
              </DialogDescription>
            </DialogHeader>
          )}
          {enrollmentDialogMode === 'view' && selectedEnrollment ? (
            <EnrollmentDetailView
              enrollment={selectedEnrollment}
              onViewAssessment={handleViewAssessment}
              onEditAssessment={handleEditAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              onViewSession={handleViewSession}
              onEditSession={handleEditSession}
              onDeleteSession={handleDeleteSession}
              onViewAfterCare={handleViewAfterCare}
              onEditAfterCare={handleEditAfterCare}
              onDeleteAfterCare={handleDeleteAfterCare}
            />
          ) : (
            <RehabilitationEnrollmentForm
              enrollment={selectedEnrollment}
              mode={enrollmentDialogMode}
              onSubmit={handleEnrollmentSubmit}
              onCancel={() => {
                setShowEnrollmentDialog(false);
                setSelectedEnrollment(null);
              }}
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
          )}
        </DialogContent>
      </Dialog>

      {/* Assessment Dialog */}
      <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto" style={{ width: '1200px' }}>
          <DialogHeader>
            <DialogTitle>
              {assessmentDialogMode === 'create' && 'Create New Assessment'}
              {assessmentDialogMode === 'edit' && 'Edit Assessment'}
              {assessmentDialogMode === 'view' && 'View Assessment Details'}
            </DialogTitle>
          </DialogHeader>
          <EnrollmentAssessmentForm
            assessment={selectedAssessment}
            mode={assessmentDialogMode}
            onSubmit={handleAssessmentSubmit}
            onCancel={() => {
              setShowAssessmentDialog(false);
              setSelectedAssessment(null);
            }}
            enrollments={enrollments}
            setEnrollments={setEnrollments}
            statuses={statuses}
          />
        </DialogContent>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto" style={{ width: '1200px' }}>
          <DialogHeader>
            <DialogTitle>
              {sessionDialogMode === 'create' && 'Create New Session'}
              {sessionDialogMode === 'edit' && 'Edit Session'}
              {sessionDialogMode === 'view' && 'View Session Details'}
            </DialogTitle>
          </DialogHeader>
          <RehabilitationEnrollmentSessionForm
            session={selectedSession}
            mode={sessionDialogMode}
            onSubmit={handleSessionSubmit}
            onCancel={() => {
              setShowSessionDialog(false);
              setSelectedSession(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* After Care Dialog */}
      <Dialog open={showAfterCareDialog} onOpenChange={setShowAfterCareDialog}>
        <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto" style={{ width: '1200px' }}>
          <DialogHeader>
            <DialogTitle>
              {afterCareDialogMode === 'create' && 'Create New After Care Record'}
              {afterCareDialogMode === 'edit' && 'Edit After Care Record'}
              {afterCareDialogMode === 'view' && 'View After Care Details'}
            </DialogTitle>
          </DialogHeader>
          <AfterCareForm
            afterCare={selectedAfterCare}
            mode={afterCareDialogMode}
            onSubmit={handleAfterCareSubmit}
            onCancel={() => {
              setShowAfterCareDialog(false);
              setSelectedAfterCare(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              {deleteTarget?.type} record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              style={{ backgroundColor: '#650000' }}
              className="text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RehabilitationDetailView;

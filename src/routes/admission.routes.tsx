import { RouteObject } from 'react-router-dom';
import { AdmissionDashboard } from '../components/admission/AdmissionDashboard';
import PrisonerAdmissionScreen from '../components/admission/PrisonerAdmissionScreen';
import { PendingApprovals } from '../components/admission/PendingApprovals';
import  PrisonersListScreen  from '../components/admission/PrisonerListScreen';
import  PrisonerDetailScreen  from '../components/admission/prisoner-biodata/PrisonerDetailScreen';
import  FileUploadDemo  from '../components/common/FileUploadDemo';
import { BulkAdmissionScreen } from '../components/admission/BulkAdmissionScreen';
import { BulkAdmissionDetailScreen } from '../components/admission/BulkAdmissionDetailScreen';
/**
 * Admissions Management Routes
 * Handles prisoner admission, approvals, and admission-related functionality
 */
export const admissionRoutes: RouteObject[] = [
  {
    path: '/admissions-management/admissions',
    element: <AdmissionDashboard />,
  },
  {
    path: '/admissions-management/prisoner-admission',
    element: <PrisonerAdmissionScreen />,
  },
  {
    path: '/admissions-management/prisoners',
    element: <PrisonersListScreen />,
  },
  {
    path: '/admissions-management/pending-approvals',
    element: <PendingApprovals />,
  },
  {
    path: '/admissions-management/prisoners/:id',
    element: <PrisonerDetailScreen />,
  },
  {
    path: '/admissions-management/file-upload-demo',
    element: <FileUploadDemo />,
  },
  {
    path: '/admissions-management/bulk-admissions',
    element: <BulkAdmissionScreen />,
  },
  {
    path: '/admissions-management/bulk-admissions/:id',
    element: <BulkAdmissionDetailScreen />,
  }
];

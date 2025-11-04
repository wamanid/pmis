import { RouteObject } from 'react-router-dom';
import { AdmissionDashboard } from '../components/admission/AdmissionDashboard';
import PrisonerAdmissionScreen from '../components/admission/PrisonerAdmissionScreen';
import { PendingApprovals } from '../components/admission/PendingApprovals';

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
    path: '/admissions-management/pending-approvals',
    element: <PendingApprovals />,
  },
];

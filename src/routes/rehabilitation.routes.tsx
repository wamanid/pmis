import { RouteObject } from 'react-router-dom';
// import EnrollmentsScreen from '../components/rehabilitation/enrollments/EnrollmentsScreen';
// import EnrollmentAssessmentScreen from '../components/rehabilitation/enrollments/assessment/EnrollmentAssessmentScreen';
// import AfterCareScreen from '../components/rehabilitation/afterCare/AfterCareScreen';
import RehabilitationDetailView from '../components/rehabilitation/RehabilitationDetailView';

/**
 * Rehabilitation Management Routes
 * Handles rehabilitation enrollments, sessions, assessments, after care, prisoner children, dependents, and welfare
 */
export const rehabilitationRoutes: RouteObject[] = [
  {
    path: '/rehabilitation/overview',
    element: <RehabilitationDetailView />,
  },
  // {
  //   path: '/rehabilitation/enrollments',
  //   element: <EnrollmentsScreen />,
  // },
  // {
  //   path: '/rehabilitation/assessments',
  //   element: <EnrollmentAssessmentScreen />,
  // },
  // {
  //   path: '/rehabilitation/after-care',
  //   element: <AfterCareScreen />,
  // },
];

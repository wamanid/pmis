import { RouteObject } from 'react-router-dom';
import EnrollmentsScreen from '../components/rehabilitation/enrollments/EnrollmentsScreen';
import AfterCareScreen from '../components/rehabilitation/afterCare/AfterCareScreen';

/**
 * Rehabilitation Management Routes
 * Handles rehabilitation enrollments, sessions, and after care
 */
export const rehabilitationRoutes: RouteObject[] = [
  {
    path: '/rehabilitation/enrollments',
    element: <EnrollmentsScreen />,
  },
  {
    path: '/rehabilitation/after-care',
    element: <AfterCareScreen />,
  },
];

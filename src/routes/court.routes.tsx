import { RouteObject } from 'react-router-dom';
import { CourtDashboard } from '../components/court/CourtDashboard';
import BulkCourtAttendanceForm from '../components/court/BulkCourtAttendanceForm';
import BulkCourtScheduleForm from '../components/court/BulkCourtScheduleForm';
import ViewFullCourtDetail from '../components/court/ViewFullCourtDetail';
/**
 * Gate Pass Management Routes
 * Handles gate pass related functionality
 */
export const courtRoutes: RouteObject[] = [
   {
    path: '/court-management/overview',
    element: <CourtDashboard />,
  },

  {
    path: '/court-management/bulk-attendance',
    element: <BulkCourtAttendanceForm />,
  },

  {
    path: '/court-management/bulk-schedules',
    element: <BulkCourtScheduleForm />,
  },

    {
    path: '/court-management/court-details',
    element: <ViewFullCourtDetail />,
  },



  
 
];

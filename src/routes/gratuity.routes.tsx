import { RouteObject } from 'react-router-dom';
import { CourtDashboard } from '../components/court/CourtDashboard';
import { EarningSchemeOverview } from '../components/earningScheme/EarningSchemeOverview';
import { EarningSchemePrisonerAttendanceList } from '../components/earningScheme/EarningSchemePrisonerAttendanceList';

/**
 * Gate Pass Management Routes
 * Handles gate pass related functionality
 */
export const gratuityRoutes: RouteObject[] = [
   {
    path: '/earning-scheme/manage',
    element: <EarningSchemePrisonerAttendanceList />,
  },

    {
    path: '/earning-scheme/overview',
    element: <EarningSchemeOverview />,
  },
];

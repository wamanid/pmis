import { RouteObject } from 'react-router-dom';
import { StationDashboard } from '../components/station/StationDashboard';
import { ManualLockupScreen } from '../components/station/ManualLockupScreen';
import { StaffEntryExitScreen } from '../components/station/StaffEntryExitScreen';
import { JournalScreen } from '../components/station/JournalScreen';
import { StaffDeploymentScreen } from '../components/station/StaffDeploymentScreen';
import ComplaintsScreen from '../components/station/ComplaintsScreen';
import { PrisonerEntryExit } from '../components/station/PrisonerEntryExit';
import VisitationsScreen from '../components/station/VisitationsScreen';
import ShiftDeploymentsScreen from '../components/station/ShiftDeploymentsScreen';
import PhonesLettersScreen from "../components/station/PhonesLettersScreen";

/**
 * Station Management Routes
 * Handles all station-related functionality including lockup, entry/exit, journals, etc.
 */
export const stationRoutes: RouteObject[] = [
  {
    path: '/station-management',
    element: <StationDashboard />,
  },
  {
    path: '/station-management/overview',
    element: <StationDashboard />,
  },
  {
    path: '/station-management/lockup/system',
    element: <StationDashboard />,
  },
  {
    path: '/station-management/lockup/manual',
    element: <ManualLockupScreen />,
  },
  {
    path: '/station-management/entry-exit',
    element: <StationDashboard />,
  },
  {
    path: '/station-management/entry-exit/staff',
    element: <StaffEntryExitScreen />,
  },
  {
    path: '/station-management/entry-exit/prisoners',
    element: <PrisonerEntryExit />,
  },
  {
    path: '/station-management/housing',
    element: <StationDashboard />,
  },
  {
    path: '/station-management/journals',
    element: <JournalScreen />,
  },
  {
    path: '/station-management/staff-deployment',
    element: <StaffDeploymentScreen />,
  },
  {
    path: '/station-management/complaints',
    element: <ComplaintsScreen />,
  },
  {
    path: '/station-management/letters-phone',
    element: <PhonesLettersScreen />,
  },
  {
    path: '/station-management/visitations',
    element: <VisitationsScreen />,
  },
  {
    path: '/station-management/shift-deployments',
    element: <ShiftDeploymentsScreen />,
  },
];

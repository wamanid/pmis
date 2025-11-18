import { RouteObject } from 'react-router-dom';
import  {GatePassScreen}  from '../components/gate/GatePassScreen';
import { PrisonerEntryExitScreen } from '../components/gate/PrisonerEntryExitScreen';
/**
 * Gate Pass Management Routes
 * Handles gate pass related functionality
 */
export const gateRoutes: RouteObject[] = [
  {
    path: '/gate-management/gate-passes',
    element: <GatePassScreen />,
  },
    {
    path: '/gate-management/prisoner-entry-exit',
    element: <PrisonerEntryExitScreen />,
  },
];

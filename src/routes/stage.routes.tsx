import { RouteObject } from 'react-router-dom';
import  {GatePassScreen}  from '../components/gate/GatePassScreen';
import { PrisonerEntryExitScreen } from '../components/gate/PrisonerEntryExitScreen';
import { StageAssignList } from '../components/StageClassification/StageAssignList';
/**
 * Gate Pass Management Routes
 * Handles gate pass related functionality
 */
export const stageRoutes: RouteObject[] = [
  {
    path: '/classification-progressive/overview',
    element: <StageAssignList />,
  },
 
];

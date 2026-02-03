import { RouteObject } from 'react-router-dom';
import { StageAssignList } from '../components/StageClassification/StageAssignList';
/**
 * Gate Pass Management Routes
 * Handles gate pass related functionality
 */
export const stageRoutes: RouteObject[] = [
   {
    path: '/classification-progressive/stage-assignments',
    element: <StageAssignList />,
  },
    {
    path: '/classification-progressive/overview',
    element: <StageAssignList />,
  },


  
];

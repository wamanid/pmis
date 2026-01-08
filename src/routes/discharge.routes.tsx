import { RouteObject } from 'react-router-dom';
import ViewDischargeDetails from '../components/discharge/ViewDischargeDetails';
import { DischargeAndExitOverview } from '../components/discharge/DischargeAndExitOverview';


export const dischargeRoutes: RouteObject[] = [
  {
    path: '/discharge/DischargeAndExitOverview',
    element: <DischargeAndExitOverview />,
  },
    {
    path: '/discharge/ViewDischargeDetails',
    element: <ViewDischargeDetails />,
  },
];
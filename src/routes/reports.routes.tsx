import { RouteObject } from 'react-router-dom';
import { ReportsList } from '../components/reports/ReportsList';
import { ReportViewer } from '../components/reports/ReportViewer';
import { CreateReport } from '../components/reports/CreateReport';

export const reportsRoutes: RouteObject[] = [
  {
    path: '/reports',
    element: <ReportsList />
  },
  {
    path: '/reports/create',
    element: <CreateReport />
  },
  {
    path: '/reports/viewer/:id',
    element: <ReportViewer />
  }
];

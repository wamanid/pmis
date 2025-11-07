import { RouteObject } from 'react-router-dom';
import { DataTableDemo } from '../components/common/DataTable.demo';

/**
 * Demo Routes
 * Routes for component demonstrations and examples
 */
export const demoRoutes: RouteObject[] = [
  {
    path: '/demo/datatable',
    element: <DataTableDemo />,
  },
];

import { RouteObject } from 'react-router-dom';
import { DataTableDemo } from '../components/common/DataTable.demo';
import PrisonerSearchScreen from '../components/common/PrisonerSearchScreen';
import {PrisonerCategorySelect} from '../components/common/PrisonerCategorySelect';
/**
 * Demo Routes
 * Routes for component demonstrations and examples
 */
export const demoRoutes: RouteObject[] = [
  {
    path: '/demo/datatable',
    element: <DataTableDemo />,
  },
  {
    path: '/demo/prisoner-search',
    element: <PrisonerSearchScreen />,
  },
  {
    path: '/demo/prisoner-category-select',
    element: <PrisonerCategorySelect />,
  },
];

import { RouteObject, Outlet } from 'react-router-dom';
import PrisonerPropertyScreen from "../components/property/PrisonerPropertyScreen";
import PrisonerPropertyAccountScreen from "../components/property/PrisonerPropertyAccountScreen";

export const propertyRoutes: RouteObject[] = [
    //   {
    //     path: 'Property Overview',
    //     element: <PropertyOverviewPlaceholder />,
    //   },
    {
        path: '/property-management/PrisonerPropertyScreen',
        element: <PrisonerPropertyScreen />,
    },
    {
        path: '/property-management/PrisonerPropertyAccountScreen',
        element: <PrisonerPropertyAccountScreen />,
    },
];

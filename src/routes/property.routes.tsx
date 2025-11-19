import { RouteObject } from 'react-router-dom';
import PrisonerPropertyScreen from "../components/property/PrisonerPropertyScreen";

export const propertyRoutes: RouteObject[] = [
    {
        path: '/property-management',
        element: <PrisonerPropertyScreen />,
    },
]

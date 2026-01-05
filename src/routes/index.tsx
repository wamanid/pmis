import { RouteObject } from 'react-router-dom';
import { UnderDevelopment } from '../components/common/UnderDevelopment';
import { authRoutes } from './auth.routes';
import { stationRoutes } from './station.routes';
import { admissionRoutes } from './admission.routes';
import { demoRoutes } from './demo.routes';
import { propertyRoutes } from './property.routes'
import { transferRoutes } from './transfer.routes';
import { gateRoutes } from './gate.routes';
import { stageRoutes } from './stage.routes';

/**
 * Application Routes Configuration
 * Combines all module-specific routes into a single configuration
 * 
 * Routes are organized by module:
 * - Authentication routes (login, logout)
 * - Station management routes (lockup, entry/exit, journals, etc.)
 * - Admissions management routes (prisoner admission, approvals, etc.)
 * - Demo routes (component demonstrations and examples)
 */
export const routes: RouteObject[] = [
  // Authentication Routes
  ...authRoutes,

  // Station Management Routes
  ...stationRoutes,

  // Admissions Management Routes
  ...admissionRoutes,

  // Demo Routes
  ...demoRoutes,

  // Property Management Routes
  ...propertyRoutes,

  // Transfer Management Routes
  ...transferRoutes,

  // Gate Management Routes
  ...gateRoutes,

  // Stage Classification Routes
  ...stageRoutes,

  // Default/Fallback Route
  {
    path: '*',
    element: <UnderDevelopment />,
  },
];

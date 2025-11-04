import { RouteObject } from 'react-router-dom';
import { LoginScreen } from '../components/authentication/LoginScreen';

/**
 * Authentication Routes
 * Handles login, logout, and authentication-related pages
 */
export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginScreen />,
  },
];

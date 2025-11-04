import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginScreen } from './components/authentication/LoginScreen';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from './components/ui/sonner';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={location.state?.from || '/station-management/overview'} replace />
            ) : (
              <LoginScreen />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainLayout />
            ) : (
              <Navigate to="/login" state={{ from: location.pathname }} replace />
            )
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}
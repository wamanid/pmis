import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../services/authService';
import { isAuthenticated as checkAuth, getCurrentUser, logout as logoutService } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = () => {
      const authenticated = checkAuth();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = getCurrentUser();
        setUser(userData);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await logoutService();
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

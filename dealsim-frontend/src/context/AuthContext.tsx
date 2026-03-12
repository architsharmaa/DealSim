import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/api';
import { userService } from '../api/services/userService';

interface AuthContextType {
  currentUser: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authToken) {
        try {
          // In a real app, we might verify the token or fetch the profile
          const user = await userService.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [authToken]);

  const login = (token: string, user: User) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem('auth_token', token);
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authToken,
        isAuthenticated: !!authToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

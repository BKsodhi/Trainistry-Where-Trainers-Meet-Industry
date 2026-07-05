import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../utils/apiClient';

export type Role = "trainer" | "company" | "admin" | null;

interface User {
  id: string;
  email: string;
  role: 'TRAINER' | 'COMPANY' | 'ADMIN';
  isOnboarded: boolean;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  loginSession: (payload: any) => Promise<void>;
  registerSession: (payload: any) => Promise<void>;
  logoutSession: () => Promise<void>;
  // Preserve Figma UI template props
  role: Role;
  setRole: (r: Role) => void;
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Figma state preservation
  const [role, setRole] = useState<Role>(null);
  const [isAuthenticated, setAuthenticated] = useState(false);

  // Run a quick security session self-check on initial page load
  useEffect(() => {
    const initializeAuthSession = async () => {
      try {
        const response = await apiClient('/auth/me');
        if (response.success && response.data.user) {
          setUser(response.data.user);
          // Sync Figma state
          setRole(response.data.user.role.toLowerCase() as Role);
          setAuthenticated(true);
        }
      } catch (err) {
        // Silent catch: User is simply unauthenticated, keep context reading null
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuthSession();
  }, []);

  const loginSession = async (payload: any) => {
    const response = await apiClient('/auth/login', { method: 'POST', bodyData: payload });
    if (response.success) {
      if (response.data.token) {
        localStorage.setItem('trainistry_token', response.data.token);
      }
      setUser(response.data.user);
      setRole(response.data.user.role.toLowerCase() as Role);
      setAuthenticated(true);
    }
  };

  const registerSession = async (payload: any) => {
    const response = await apiClient('/auth/register', { method: 'POST', bodyData: payload });
    if (response.success) {
      // Direct user straight to login layout workflow after registering
      await loginSession({ email: payload.email, password: payload.password });
    }
  };

  const logoutSession = async () => {
    await apiClient('/auth/logout', { method: 'POST' });
    localStorage.removeItem('trainistry_token');
    setUser(null);
    setRole(null);
    setAuthenticated(false);
  };

  return (
    <AppContext.Provider value={{ 
      user, loading, loginSession, registerSession, logoutSession,
      role, setRole, isAuthenticated, setAuthenticated
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp hook context must be wrapped securely inside an AppProvider layer.');
  return context;
};

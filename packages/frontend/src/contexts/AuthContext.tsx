import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, APIResult } from '../types/camara';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/camaraApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<APIResult<{ user: User }>>;
  register: (email: string, password: string, name: string) => Promise<APIResult<{ user: User }>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      // TODO: Validate token and get user info
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiLogin({ email, password });
    if (result.success && result.data) {
      setUser(result.data.user);
    }
    return result;
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await apiRegister({ email, password, name });
    if (result.success && result.data) {
      setUser(result.data.user);
    }
    return result;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
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

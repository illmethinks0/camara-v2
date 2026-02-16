import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, APIResult, LoginResponse, RegisterResponse } from '../types/camara';
import {
  getMe as apiGetMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from '../services/camaraApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<APIResult<LoginResponse>>;
  register: (email: string, password: string, name: string) => Promise<APIResult<RegisterResponse>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const result = await apiGetMe();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      } else {
        await apiLogout();
        setUser(null);
      }

      setIsLoading(false);
    };

    void bootstrapAuth();
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

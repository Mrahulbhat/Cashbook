import React, { createContext, useContext, useEffect, useState } from 'react';
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

console.log('🔗 Mobile API Base URL:', API_BASE_URL);

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>; // NEW: Google ID token
  api: AxiosInstance;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Initialize session ---
  useEffect(() => {
    const init = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          const res = await api.get('/auth/session');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
          } else {
            throw new Error('Invalid session');
          }
        }
      } catch (error: any) {
        await SecureStore.deleteItemAsync('authToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const loginWithToken = async (token: string) => {
    try {
      // Save token locally
      await SecureStore.setItemAsync('authToken', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Fetch user info from backend
      const res = await api.get('/auth/session');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error: any) {
      console.error('loginWithToken error:', error);
      await SecureStore.deleteItemAsync('authToken');
      delete api.defaults.headers.common.Authorization;
      setUser(null);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (!res.data.success || !res.data.token || !res.data.user) {
        throw new Error(res.data.message || 'Login failed');
      }
      const { token, user } = res.data;
      await SecureStore.setItemAsync('authToken', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(user);
    } catch (error: any) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const res = await api.post('/auth/register', { email, password, name });
      if (!res.data.success || !res.data.token || !res.data.user) {
        throw new Error(res.data.message || 'Signup failed');
      }
      const { token, user } = res.data;
      await SecureStore.setItemAsync('authToken', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(user);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      try {
        await api.post('/auth/logout');
      } catch (e) {
        console.log('Backend logout failed, continuing local logout');
      }
      await SecureStore.deleteItemAsync('authToken');
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      await SecureStore.deleteItemAsync('authToken');
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        loginWithToken, // expose Google login helper
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};

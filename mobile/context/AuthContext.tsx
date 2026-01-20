import React, { createContext, useContext, useEffect, useState } from 'react';
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

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
  logout: () => Promise<void>;
  api: AxiosInstance;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        }
      } catch {
        await SecureStore.deleteItemAsync('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;

    await SecureStore.setItemAsync('authToken', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
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

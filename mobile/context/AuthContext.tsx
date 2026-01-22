import React, { createContext, useContext, useEffect, useState } from 'react';
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

// Log API URL on module load for debugging
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
  api: AxiosInstance;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Match frontend configuration
  timeout: 10000, // 10 second timeout
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('AuthContext: Initializing, API URL:', API_BASE_URL);
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          console.log('AuthContext: Found token, verifying...');
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          // Use /auth/session like frontend does (more compatible)
          const res = await api.get('/auth/session');
          console.log('AuthContext: /auth/session response:', res.data);
          // Backend returns { success: true, user: {...} }
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            console.log('AuthContext: User authenticated:', res.data.user);
          } else {
            throw new Error('Invalid response');
          }
        } else {
          console.log('AuthContext: No token found');
        }
      } catch (error: any) {
        console.error('AuthContext: Auth check failed:', error.message);
        if (error.response) {
          console.error('AuthContext: Error response:', error.response.data);
          console.error('AuthContext: Error status:', error.response.status);
        } else if (error.request) {
          console.error('AuthContext: No response from server. Check if backend is running at:', API_BASE_URL);
        }
        // Backend down or invalid token - clear it and show login
        await SecureStore.deleteItemAsync('authToken');
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('AuthContext: Initialization complete');
      }
    };

    init();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      const res = await api.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      
      // Backend returns { success: true, token, user: {...} }
      if (!res.data.success || !res.data.token || !res.data.user) {
        throw new Error(res.data.message || 'Login failed');
      }

      const { token, user } = res.data;
      await SecureStore.setItemAsync('authToken', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(user);
      console.log('Login successful, user set:', user);
    } catch (error: any) {
      console.error('Login error:', error.message);
      if (error.response) {
        // Server responded with error status
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response from server. Is backend running?');
        console.error('API URL:', API_BASE_URL);
        throw new Error('Cannot connect to server. Please check:\n1. Backend server is running\n2. Correct API URL in .env\n3. Network connection');
      } else {
        // Something else happened
        console.error('Error setting up request:', error.message);
        throw new Error(error.message || 'Login failed');
      }
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      console.log('Attempting signup to:', `${API_BASE_URL}/auth/register`);
      // Backend uses /register endpoint, not /signup
      const res = await api.post('/auth/register', { email, password, name });
      console.log('Signup response:', res.data);
      
      // Backend returns { success: true, token, user: {...} }
      if (!res.data.success || !res.data.token || !res.data.user) {
        throw new Error(res.data.message || 'Signup failed');
      }

      const { token, user } = res.data;
      await SecureStore.setItemAsync('authToken', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(user);
      console.log('Signup successful, user set:', user);
    } catch (error: any) {
      console.error('Signup error:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('No response from server. Is backend running?');
        console.error('API URL:', API_BASE_URL);
        throw new Error('Cannot connect to server. Please check:\n1. Backend server is running\n2. Correct API URL in .env\n3. Network connection');
      } else {
        console.error('Error setting up request:', error.message);
        throw new Error(error.message || 'Signup failed');
      }
    }
  };

  const logout = async () => {
    try {
      // Try to call backend logout endpoint
      try {
        await api.post('/auth/logout');
      } catch (error) {
        // Ignore backend errors, still logout locally
        console.log('Backend logout failed, continuing with local logout');
      }
      
      // Clear local storage
      await SecureStore.deleteItemAsync('authToken');
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear local data
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

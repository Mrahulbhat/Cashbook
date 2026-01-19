import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check if there's a token in localStorage
        const token = localStorage.getItem("token");
        if (token) {
          // Set the token in axios header
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        const response = await axiosInstance.get("/auth/session");
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem("token");
        delete axiosInstance.defaults.headers.common["Authorization"];
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      
      // Clear token from localStorage
      localStorage.removeItem("token");
      
      // Clear token from axios headers
      delete axiosInstance.defaults.headers.common["Authorization"];
      
      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common["Authorization"];
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

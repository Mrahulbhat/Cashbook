'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axiosInstance.get("/auth/me");
                if (response.data.success) {
                    setUser(response.data.user);
                }
            } catch (error) {
                setUser(null);
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
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            setUser(null);
            router.push("/login");
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

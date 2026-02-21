'use client';

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    if (pathname === "/login" || pathname === "/signup") {
        return null;
    }

    return (
        <nav className="w-full bg-gradient-to-r from-black via-gray-900 to-black h-[10vh] flex px-6 sm:px-9 text-white justify-between items-center relative border-b border-gray-800/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>

            <div className="relative z-10">
                <h1
                    className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent cursor-pointer hover:from-blue-300 hover:via-purple-300 hover:to-blue-300 transition-all duration-300 select-none"
                    onClick={() => router.push("/dashboard")}
                >
                    My Cashbook App
                </h1>
                <div className="h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 hover:w-full"></div>
            </div>

            <div className="relative z-10 flex gap-3">
                {user && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300 hidden sm:inline">
                            Welcome, <span className="text-blue-300 font-medium">{user.name}</span>
                        </span>
                        <button
                            className="group flex gap-2 justify-center items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-800/50 to-red-700/50 border border-red-700/50 hover:border-red-500/30 hover:from-red-600/20 hover:to-red-600/20 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
                            onClick={logout}
                        >
                            <LogOut size={18} className="group-hover:scale-110 group-hover:text-red-300 transition-all duration-300" />
                            <span className="font-medium group-hover:text-red-300 transition-colors duration-300">Logout</span>
                        </button>
                    </div>
                )}

                <button
                    className="group flex gap-2 justify-center items-center px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-blue-500/30 hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
                    onClick={() => router.push("/dashboard")}
                >
                    <Home size={18} className="group-hover:scale-110 group-hover:text-blue-300 transition-all duration-300" />
                    <span className="font-medium group-hover:text-blue-300 transition-colors duration-300">Dashboard</span>
                </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
        </nav>
    );
};

export default Navbar;

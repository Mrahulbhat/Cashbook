import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Don't show navbar on login page
  if (location.pathname === "/login") {
    return null;
  }
  
  return (
    <nav className="w-full bg-gradient-to-r from-black via-gray-900 to-black h-[10vh] flex px-6 sm:px-9 text-white justify-between items-center relative border-b border-gray-800/50 backdrop-blur-sm">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
      
      {/* Logo/Brand */}
      <div className="relative z-10">
        <h1 
          className="font-bold text-2xl sm:text-3xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent cursor-pointer hover:from-blue-300 hover:via-purple-300 hover:to-blue-300 transition-all duration-300 select-none"
          onClick={() => navigate("/dashboard")}
        >
          My Cashbook App
        </h1>
        {/* Subtle underline effect */}
        <div className="h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 hover:w-full"></div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="relative z-10 flex gap-3">
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">
              Welcome, <span className="text-blue-300 font-medium">{user.name}</span>
            </span>
            <button
              className="group flex gap-2 justify-center items-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-800/50 to-red-700/50 border border-red-700/50 hover:border-red-500/30 hover:from-red-600/20 hover:to-red-600/20 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
              onClick={logout}
            >
              <LogOut 
                size={18} 
                className="group-hover:scale-110 group-hover:text-red-300 transition-all duration-300" 
              />
              <span className="font-medium group-hover:text-red-300 transition-colors duration-300">
                Logout
              </span>
            </button>
          </div>
        )}
        
        <button
          className="group flex gap-2 justify-center items-center px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-blue-500/30 hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
          onClick={() => navigate("/dashboard")}
        >
          <Home 
            size={18} 
            className="group-hover:scale-110 group-hover:text-blue-300 transition-all duration-300" 
          />
          <span className="font-medium group-hover:text-blue-300 transition-colors duration-300">
            Dashboard
          </span>
          
          {/* Subtle glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
        </button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      
      {/* Subtle animated dots */}
      <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-purple-400/30 rounded-full animate-pulse delay-1000"></div>
    </nav>
  );
};

export default Navbar;
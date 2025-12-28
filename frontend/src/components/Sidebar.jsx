import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, TrendingUp, Wallet, Tag, Home } from "lucide-react";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: "Dashboard", icon: Home, path: "/dashboard", id: "dashboard" },
        { name: "Transactions", icon: TrendingUp, path: "/transactions", id: "transactions" },
        { name: "Accounts", icon: Wallet, path: "/accounts", id: "accounts" },
        { name: "Categories", icon: Tag, path: "/categories", id: "categories" },
        { name: "Statistics", icon: TrendingUp, path: "/stats", id: "statistics" },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-20 left-4 z-50 p-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg md:hidden"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-700/50 backdrop-blur-sm z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:relative md:top-0 md:h-auto md:w-64 md:z-30`}
            >
                <div className="p-6 space-y-2">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Navigation
                    </h3>

                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = isActive(tab.path);

                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleNavigation(tab.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform ${active
                                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 scale-105"
                                        : "text-gray-400 hover:text-white hover:bg-gray-800/50 hover:translate-x-1"
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-semibold text-sm">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700/50 bg-gradient-to-t from-black to-transparent">
                    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-lg p-4">
                        <p className="text-gray-300 text-xs font-semibold mb-2">Pro Tip</p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Track your finances regularly to maintain better control over your money.
                        </p>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;

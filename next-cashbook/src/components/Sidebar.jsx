'use client';

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, X, TrendingUp, Wallet, Tag, Home, Repeat, Target, Dumbbell, History, List } from "lucide-react";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');

    // Sidebar is only mounted under Cashbook routes — AppShell never renders
    // it on /habits, /login, /signup, /select-app, or /admin.
    // This guard is just a safety net.
    if (pathname === "/login" || pathname === "/signup" || pathname === "/select-app") {
        return null;
    }

    const isGym = pathname?.startsWith("/gym");

    const cashbookTabs = [
        { name: "Dashboard", icon: Home, path: "/dashboard", id: "dashboard" },
        { name: "Planning", icon: Target, path: "/planning", id: "planning" },
        { name: "Transactions", icon: TrendingUp, path: "/transactions", id: "transactions" },
        { name: "Accounts", icon: Wallet, path: "/accounts", id: "accounts" },
        { name: "Transfer", icon: Repeat, path: "/transfer", id: "transfer" },
        { name: "Categories", icon: Tag, path: "/categories", id: "categories" },
        { name: "Statistics", icon: TrendingUp, path: "/stats", id: "statistics" },
    ];

    const gymTabs = [
        { name: "Log Workout", icon: Dumbbell, path: "/gym", id: "gym-workout", tab: "workout" },
        { name: "Exercises", icon: List, path: "/gym", id: "gym-exercises", tab: "exercises" },
        { name: "History", icon: History, path: "/gym", id: "gym-history", tab: "history" },
    ];

    const tabs = isGym ? gymTabs : cashbookTabs;
    const activeGradient = isGym ? "from-orange-600 to-red-600" : "from-green-600 to-emerald-600";
    const activeGlow = isGym ? "shadow-orange-500/25" : "shadow-green-500/25";
    const toggleBg = isGym ? "from-orange-600 to-red-600" : "from-green-600 to-emerald-600";

    const handleNavigation = (path) => {
        router.push(path);
        setIsOpen(false);
    };

    const isActive = (path) => pathname === path;

    return (
        <>
            <button
                id="sidebarMenuToggle"
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-20 left-4 z-50 p-2 bg-gradient-to-r ${toggleBg} text-white rounded-lg md:hidden`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div id="sidebar"
                className={`fixed left-0 top-[10vh] h-[90vh] w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-700/50 backdrop-blur-sm z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:relative md:top-0 md:h-[90vh] md:w-64 md:z-30`}
            >
                <div className="p-6 space-y-2">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Navigation
                    </h3>

                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = isGym 
                            ? (currentTab === tab.tab || (!currentTab && tab.tab === 'workout'))
                            : isActive(tab.path);

                        return (
                            <button
                                id={tab.id}
                                key={tab.id}
                                onClick={() => handleNavigation(isGym ? `${tab.path}?tab=${tab.tab}` : tab.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform ${active
                                    ? `bg-gradient-to-r ${activeGradient} text-white shadow-lg ${activeGlow} scale-105`
                                    : "text-gray-400 hover:text-white hover:bg-gray-800/50 hover:translate-x-1"
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-semibold text-sm">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>


            {isOpen && (
                <div
                    className="fixed inset-0 top-[10vh] bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;

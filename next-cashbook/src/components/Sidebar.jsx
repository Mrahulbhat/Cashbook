'use client';

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Menu, X, TrendingUp, Wallet, Tag, Home, Repeat, Target, Dumbbell, History, List, HandCoins } from "lucide-react";

const MIN_SIDEBAR_WIDTH = 208;
const MAX_SIDEBAR_WIDTH = 360;
const DEFAULT_SIDEBAR_WIDTH = 256;

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;
        const savedWidth = Number(window.localStorage.getItem("cashbookSidebarWidth"));
        if (!savedWidth) return DEFAULT_SIDEBAR_WIDTH;
        return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, savedWidth));
    });
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');

    const isGym = pathname?.startsWith("/gym");

    const cashbookTabs = [
        { name: "Transactions", icon: TrendingUp, path: "/transactions", id: "transactions" },
        { name: "Accounts", icon: Wallet, path: "/accounts", id: "accounts" },
        { name: "Categories", icon: Tag, path: "/categories", id: "categories" },
        { name: "Dashboard", icon: Home, path: "/dashboard", id: "dashboard" },
        { name: "Planning", icon: Target, path: "/planning", id: "planning" },
        // Temporarily removed as there is a bug
        // { name: "Transfer", icon: Repeat, path: "/transfer", id: "transfer" },
        { name: "IOU Tracker", icon: HandCoins, path: "/iou", id: "iou" },
        { name: "Statistics", icon: TrendingUp, path: "/stats", id: "statistics" },
    ];

    const gymTabs = [
        { name: "Log Workout", icon: Dumbbell, path: "/gym", id: "gym-workout", tab: "workout" },
        { name: "Exercises", icon: List, path: "/gym", id: "gym-exercises", tab: "exercises" },
        { name: "History", icon: History, path: "/gym", id: "gym-history", tab: "history" },
    ];

    const tabs = isGym ? gymTabs : cashbookTabs;
    
    // Clean banking theme colors
    const activeBg = "bg-orange-50 text-orange-700 font-bold border-r-4 border-orange-500";
    const inactiveClass = "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium";

    const handleNavigation = (path) => {
        router.push(path);
        setIsOpen(false);
    };

    useEffect(() => {
        if (!isResizing) return;

        const handlePointerMove = (event) => {
            const nextWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, event.clientX));
            setSidebarWidth(nextWidth);
        };

        const handlePointerUp = () => {
            setIsResizing(false);
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [isResizing]);

    useEffect(() => {
        window.localStorage.setItem("cashbookSidebarWidth", String(sidebarWidth));
    }, [sidebarWidth]);

    const isActive = (path) => pathname === path;

    if (pathname === "/login" || pathname === "/signup" || pathname === "/select-app") {
        return null;
    }

    return (
        <>
            <button
                id="sidebarMenuToggle"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-20 left-4 z-50 p-2 bg-white text-slate-800 border border-slate-200 shadow-sm rounded-lg md:hidden"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div id="sidebar"
                style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
                className={`fixed left-0 top-[10vh] h-[90vh] bg-white border-r border-slate-200 shadow-sm z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:relative md:top-0 md:h-[90vh] md:z-30 overflow-y-auto scrollbar-hide`}
            >
                <div className="p-6 space-y-2">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active ? activeBg : inactiveClass}`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-orange-600" : "text-slate-400"}`} />
                                <span className="text-sm">{tab.name}</span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    aria-label="Resize sidebar"
                    onPointerDown={(event) => {
                        event.preventDefault();
                        setIsResizing(true);
                    }}
                    className={`hidden md:block absolute top-0 right-0 h-full w-2 translate-x-1 cursor-col-resize transition-colors ${isResizing ? "bg-orange-200" : "bg-transparent hover:bg-orange-50"}`}
                />
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 top-[10vh] bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;

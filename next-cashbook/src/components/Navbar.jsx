'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutGrid, Wallet, ListTodo, Plus, X, ArrowRight, Dumbbell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ── App catalogue ──────────────────────────────────────────────
const APPS = [
    {
        id: "cashbook",
        label: "Cashbook",
        description: "Finance & budget tracker",
        detail: "Track expenses, manage budgets, and take control of your money.",
        route: "/transactions",
        icon: Wallet,
        gradient: "from-orange-500 to-slate-950",
        glow: "shadow-orange-500/20",
        border: "hover:border-orange-300",
        matchPaths: ["/dashboard", "/transactions", "/accounts", "/categories", "/stats", "/planning", "/transfer", "/settings", "/add-transaction", "/edit-transaction", "/iou"],
    },
    {
        id: "servicecare",
        label: "Service Care",
        description: "Maintenance & service management",
        detail: "Manage service requests, track maintenance, and keep everything running smoothly.",
        route: "/servicecare",
        icon: ListTodo,
        gradient: "from-orange-500 to-slate-950",
        glow: "shadow-orange-500/20",
        border: "hover:border-orange-300",
        matchPaths: ["/servicecare", "/servicecare/requests", "/servicecare/history", "/servicecare/settings"],
    },
    {
        id: "habits",
        label: "Habit Tracker",
        description: "Build better routines",
        detail: "Stay consistent, break bad habits, and build the routines that matter.",
        route: "/habits",
        icon: ListTodo,
        gradient: "from-orange-500 to-slate-950",
        glow: "shadow-orange-500/20",
        border: "hover:border-orange-300",
        matchPaths: ["/habits"],
    },
    {
        id: "gym",
        label: "Gym Tracker",
        description: "Log your workouts",
        detail: "Track your progress, manage exercises, and stay on top of your fitness goals.",
        route: "/gym",
        icon: Dumbbell,
        gradient: "from-orange-500 to-slate-950",
        glow: "shadow-orange-500/20",
        border: "hover:border-orange-300",
        matchPaths: ["/gym"],
    },
];

function getActiveApp(pathname) {
    return APPS.find(a => a.matchPaths.some(p => pathname?.startsWith(p))) || null;
}

// ── Full-screen App Switcher Overlay ──────────────────────────
function AppSwitcherOverlay({ onClose, currentAppId }) {
    const router = useRouter();

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const navigate = (app) => {
        if (app.disabled) return;
        router.push(app.route);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[300] flex flex-col bg-[#fffaf3]/95 backdrop-blur-xl animate-in fade-in duration-200 text-[#15110c]">

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-[#eadfce] bg-white/70">
                <div>
                    <p className="text-xs font-bold tracking-[0.3em] text-orange-700 uppercase mb-1">Workspace</p>
                    <h2 className="text-2xl font-black text-[#15110c]">Switch App</h2>
                </div>
                <button
                    id="app-switcher-close"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white border border-[#eadfce] text-slate-600 hover:bg-orange-50 hover:text-orange-700 transition-all duration-200"
                >
                    <X size={20} />
                </button>
            </div>

            {/* App Cards */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-10">
                <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {APPS.map((app) => {
                        const Icon = app.icon;
                        const isCurrent = app.id === currentAppId;

                        return (
                            <button
                                key={app.id}
                                id={`app-switcher-${app.id}`}
                                onClick={() => navigate(app)}
                                disabled={app.disabled}
                                className={`group relative flex flex-col items-start gap-4 p-6 rounded-2xl border text-left transition-all duration-300
                                    ${app.disabled
                                        ? 'border-[#eadfce] bg-white/50 opacity-50 cursor-not-allowed'
                                        : isCurrent
                                            ? 'border-orange-300 bg-orange-50 cursor-default'
                                            : `border-[#eadfce] bg-white hover:bg-orange-50 ${app.border} hover:shadow-xl ${app.glow} cursor-pointer`
                                    }`}
                            >
                                {/* Current badge */}
                                {isCurrent && (
                                    <span className="absolute top-4 right-4 text-[10px] font-bold tracking-widest text-orange-700 uppercase bg-orange-100 px-2 py-0.5 rounded-full">
                                        Current
                                    </span>
                                )}

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 ${!app.disabled && !isCurrent ? 'group-hover:scale-110' : ''}`}>
                                    <Icon size={22} className="text-white" />
                                </div>

                                {/* Text */}
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-[#15110c]">{app.label}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{app.detail}</p>
                                </div>

                                {/* Arrow — shown on hover for non-disabled, non-current */}
                                {!app.disabled && !isCurrent && (
                                    <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 group-hover:text-orange-700 transition-colors">
                                        <span>Open</span>
                                        <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer hint */}
            <div className="relative z-10 text-center pb-6 text-xs text-slate-500">
                Press <kbd className="px-1.5 py-0.5 bg-white border border-[#eadfce] rounded text-slate-600 font-mono">Esc</kbd> to close
            </div>
        </div>
    );
}

// ── Main Navbar ────────────────────────────────────────────────
const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [switcherOpen, setSwitcherOpen] = useState(false);

    const isAuthPage = ["/login", "/signup", "/select-app"].includes(pathname) || pathname?.startsWith("/admin");

    // Lock body scroll when overlay is open
    useEffect(() => {
        if (switcherOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [switcherOpen]);

    if (isAuthPage) return null;

    const activeApp = getActiveApp(pathname);

    return (
        <>
            {/* Full-screen overlay */}
            {switcherOpen && (
                <AppSwitcherOverlay
                    onClose={() => setSwitcherOpen(false)}
                    currentAppId={activeApp?.id}
                />
            )}

            <nav className="w-full bg-[#fffaf3]/95 h-[10vh] grid grid-cols-3 px-4 sm:px-6 text-[#15110c] items-center relative border-b border-[#eadfce] backdrop-blur-sm flex-shrink-0 z-50 shadow-sm shadow-orange-950/5">

                {/* ── LEFT: App Switcher toggle ── */}
                <div className="relative z-10 flex items-center">
                    <button
                        id="app-switcher-toggle"
                        onClick={() => setSwitcherOpen(v => !v)}
                        title="Switch application"
                        className={`p-2 rounded-xl border transition-all duration-200 group
                            ${switcherOpen
                                ? 'bg-orange-50 border-orange-300 text-orange-700'
                                : 'bg-white border-[#eadfce] text-slate-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700'
                            }`}
                    >
                        <LayoutGrid size={20} className="transition-transform duration-200 group-hover:scale-110" />
                    </button>
                </div>

                {/* ── CENTER: Active App Name ── */}
                <div className="relative z-10 flex items-center justify-center">
                    <h1
                        id="Logo"
                        className="font-extrabold text-lg sm:text-xl text-[#15110c] cursor-pointer hover:text-orange-700 transition-all duration-300 select-none whitespace-nowrap"
                        onClick={() => router.push("/select-app")}
                    >
                        {activeApp?.label ?? "My Workspace"}
                    </h1>
                </div>

                {/* ── RIGHT: Avatar + Logout ── */}
                <div className="relative z-10 flex items-center justify-end gap-3">
                    {user && (
                        <>
                            {/* Avatar circle with first letter */}
                            <div
                                id="userAvatar"
                                title="Profile Settings"
                                onClick={() => router.push("/settings")}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-slate-950 flex items-center justify-center text-white font-bold text-sm select-none flex-shrink-0 shadow-lg shadow-orange-500/20 ring-2 ring-orange-100 cursor-pointer hover:scale-110 hover:ring-orange-200 transition-all duration-200"
                            >
                                {user.name?.charAt(0).toUpperCase()}
                            </div>

                            <button
                                id="LogoutBtn"
                                className="group flex gap-2 items-center px-3 py-2 rounded-xl bg-white border border-[#eadfce] text-slate-700 hover:bg-red-50 hover:border-red-200 transition-all duration-200 flex-shrink-0"
                                onClick={logout}
                            >
                                <LogOut size={16} className="group-hover:scale-110 group-hover:text-red-300 transition-all duration-200" />
                                <span className="font-medium text-sm group-hover:text-red-600 transition-colors hidden sm:inline">Logout</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"></div>
            </nav>
        </>
    );
};

export default Navbar;

'use client';

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutGrid, Wallet, ListTodo, Plus, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ── App catalogue ──────────────────────────────────────────────
const APPS = [
    {
        id: "cashbook",
        label: "Cashbook",
        description: "Finance & budget tracker",
        detail: "Track expenses, manage budgets, and take control of your money.",
        route: "/dashboard",
        icon: Wallet,
        gradient: "from-green-500 to-emerald-600",
        glow: "shadow-green-500/25",
        border: "hover:border-green-500/40",
        matchPaths: ["/dashboard", "/transactions", "/accounts", "/categories", "/stats", "/planning", "/transfer", "/settings", "/add-transaction", "/edit-transaction"],
    },
    {
        id: "habits",
        label: "Habit Tracker",
        description: "Build better routines",
        detail: "Stay consistent, break bad habits, and build the routines that matter.",
        route: "/habits",
        icon: ListTodo,
        gradient: "from-blue-500 to-indigo-600",
        glow: "shadow-blue-500/25",
        border: "hover:border-blue-500/40",
        matchPaths: ["/habits"],
    },
    {
        id: "new",
        label: "Coming Soon",
        description: "New project — stay tuned",
        detail: "Something new is being built. Stay tuned for future updates.",
        route: null,
        icon: Plus,
        gradient: "from-gray-600 to-gray-700",
        glow: "",
        border: "",
        matchPaths: [],
        disabled: true,
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
        <div className="fixed inset-0 z-[300] flex flex-col bg-[#030711]/98 backdrop-blur-xl animate-in fade-in duration-200">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-green-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
                <div>
                    <p className="text-xs font-bold tracking-[0.3em] text-gray-500 uppercase mb-1">Workspace</p>
                    <h2 className="text-2xl font-black text-white">Switch App</h2>
                </div>
                <button
                    id="app-switcher-close"
                    onClick={onClose}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200"
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
                                        ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                                        : isCurrent
                                            ? 'border-white/20 bg-white/[0.06] cursor-default'
                                            : `border-white/10 bg-white/[0.03] hover:bg-white/[0.07] ${app.border} hover:shadow-xl ${app.glow} cursor-pointer`
                                    }`}
                            >
                                {/* Current badge */}
                                {isCurrent && (
                                    <span className="absolute top-4 right-4 text-[10px] font-bold tracking-widest text-white/50 uppercase bg-white/10 px-2 py-0.5 rounded-full">
                                        Current
                                    </span>
                                )}

                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 ${!app.disabled && !isCurrent ? 'group-hover:scale-110' : ''}`}>
                                    <Icon size={22} className="text-white" />
                                </div>

                                {/* Text */}
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white">{app.label}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{app.detail}</p>
                                </div>

                                {/* Arrow — shown on hover for non-disabled, non-current */}
                                {!app.disabled && !isCurrent && (
                                    <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-gray-500 group-hover:text-white transition-colors">
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
            <div className="relative z-10 text-center pb-6 text-xs text-gray-600">
                Press <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-gray-500 font-mono">Esc</kbd> to close
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

            <nav className="w-full bg-gradient-to-r from-black via-gray-900 to-black h-[10vh] grid grid-cols-3 px-4 sm:px-6 text-white items-center relative border-b border-gray-800/50 backdrop-blur-sm flex-shrink-0 z-50">
                {/* Subtle ambient gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

                {/* ── LEFT: App Switcher toggle ── */}
                <div className="relative z-10 flex items-center">
                    <button
                        id="app-switcher-toggle"
                        onClick={() => setSwitcherOpen(v => !v)}
                        title="Switch application"
                        className={`p-2 rounded-xl border transition-all duration-200 group
                            ${switcherOpen
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <LayoutGrid size={20} className="transition-transform duration-200 group-hover:scale-110" />
                    </button>
                </div>

                {/* ── CENTER: Active App Name ── */}
                <div className="relative z-10 flex items-center justify-center">
                    <h1
                        id="Logo"
                        className="font-bold text-lg sm:text-xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent cursor-pointer hover:from-blue-300 hover:via-purple-300 hover:to-blue-300 transition-all duration-300 select-none whitespace-nowrap"
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
                                title={user.name}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm select-none flex-shrink-0 shadow-lg shadow-blue-500/30 ring-2 ring-white/10"
                            >
                                {user.name?.charAt(0).toUpperCase()}
                            </div>

                            <button
                                id="LogoutBtn"
                                className="group flex gap-2 items-center px-3 py-2 rounded-xl bg-gradient-to-r from-red-900/40 to-red-800/40 border border-red-800/50 hover:border-red-500/50 hover:from-red-700/40 hover:to-red-600/40 transition-all duration-200 flex-shrink-0"
                                onClick={logout}
                            >
                                <LogOut size={16} className="group-hover:scale-110 group-hover:text-red-300 transition-all duration-200" />
                                <span className="font-medium text-sm group-hover:text-red-300 transition-colors hidden sm:inline">Logout</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            </nav>
        </>
    );
};

export default Navbar;

'use client';

import { useRouter } from "next/navigation";
import { Wallet, ListTodo, Plus, LogOut, ArrowRight, Sparkles, Dumbbell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const APPS = [
    {
        id: "cashbook",
        name: "Cashbook",
        description: "Track expenses & manage budgets",
        icon: Wallet,
        route: "/transactions",
        iconColor: "text-orange-700",
        iconRing: "ring-orange-200",
        iconBg: "bg-orange-50",
        accent: "group-hover:text-orange-700",
        tag: "Finance",
    },
    {
        id: "servicecare",
        name: "Service Care",
        description: "Manage service requests & maintenance",
        icon: ListTodo,
        route: "/servicecare",
        iconColor: "text-orange-700",
        iconRing: "ring-orange-200",
        iconBg: "bg-orange-50",
        accent: "group-hover:text-orange-700",
        tag: "Maintenance",
    },
    {
        id: "habits",
        name: "Habit Tracker",
        description: "Build streaks & daily routines",
        icon: ListTodo,
        route: "/habits",
        iconColor: "text-orange-700",
        iconRing: "ring-orange-200",
        iconBg: "bg-orange-50",
        accent: "group-hover:text-orange-700",
        tag: "Wellness",
    },
    {
        id: "gym",
        name: "Gym Tracker",
        description: "Log workouts & track progress",
        icon: Dumbbell,
        route: "/gym",
        iconColor: "text-orange-700",
        iconRing: "ring-orange-200",
        iconBg: "bg-orange-50",
        accent: "group-hover:text-orange-700",
        tag: "Fitness",
    },
    {
        id: "dsa",
        name: "DSA Tracker",
        description: "Organize problems, challenges, and rankings",
        icon: ListTodo,
        route: "/dsa",
        iconColor: "text-violet-700",
        iconRing: "ring-violet-200",
        iconBg: "bg-violet-50",
        accent: "group-hover:text-violet-700",
        tag: "Algorithm",
    },
];

const AppSelectionPage = () => {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login");
        } catch {
            toast.error("Failed to logout");
        }
    };

    return (
        <div className="min-h-screen bank-page flex flex-col">

            {/* Top bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-300" />
                    <span className="text-sm font-semibold text-slate-300 tracking-wide">App Dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-slate-900 flex items-center justify-center text-white font-bold text-xs ring-2 ring-violet-500/20 select-none">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm text-slate-300">{user?.name}</span>
                    <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-300 transition-colors" title="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Cards */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-lg space-y-3">
                <h1 className="text-4xl font-bold text-white mb-3 text-center pt-4">App Dashboard</h1>
                    <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase mb-10 text-center">Choose an app</p>

                    {APPS.map((app) => {
                        const Icon = app.icon;
                        return (
                            <div
                                key={app.id}
                                id={`app-card-${app.id}`}
                                onClick={() => router.push(app.route)}
                                className="group flex items-center gap-4 p-4 rounded-xl border border-slate-800 hover:border-violet-500 bg-slate-900/80 hover:bg-slate-800 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-violet-500/10"
                            >
                                {/* Icon */}
                                <div className={`w-11 h-11 rounded-xl ${app.iconBg} ring-1 ${app.iconRing} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                                    <Icon className={`w-5 h-5 ${app.iconColor}`} />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className={`text-sm font-semibold text-white transition-colors duration-200 ${app.accent}`}>{app.name}</h2>
                                        <span className="text-[10px] text-slate-400 font-medium">{app.tag}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">{app.description}</p>
                                </div>

                                {/* Arrow */}
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-300 transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 pb-5 text-center">
                <p className="text-[11px] text-slate-500">© 2026 · Built by Rahul Bhat</p>
            </footer>
        </div>
    );
};

export default AppSelectionPage;

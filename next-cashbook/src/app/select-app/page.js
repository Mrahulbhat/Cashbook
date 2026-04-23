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
        route: "/dashboard",
        iconColor: "text-emerald-400",
        iconRing: "ring-emerald-500/20",
        iconBg: "bg-emerald-500/10",
        accent: "group-hover:text-emerald-400",
        tag: "Finance",
    },
    {
        id: "habits",
        name: "Habit Tracker",
        description: "Build streaks & daily routines",
        icon: ListTodo,
        route: "/habits",
        iconColor: "text-blue-400",
        iconRing: "ring-blue-500/20",
        iconBg: "bg-blue-500/10",
        accent: "group-hover:text-blue-400",
        tag: "Wellness",
    },
    {
        id: "gym",
        name: "Gym Tracker",
        description: "Log workouts & track progress",
        icon: Dumbbell,
        route: "/gym",
        iconColor: "text-orange-400",
        iconRing: "ring-orange-500/20",
        iconBg: "bg-orange-500/10",
        accent: "group-hover:text-orange-400",
        tag: "Fitness",
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
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">

            {/* Top bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-gray-400 tracking-wide">App Dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10 select-none">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm text-gray-500">{user?.name}</span>
                    <button onClick={handleLogout} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors" title="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Cards */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-lg space-y-3">
                <h1 className="text-4xl font-bold text-white mb-3 text-center pt-4">App Dashboard</h1>
                    <p className="text-xs font-semibold tracking-[0.2em] text-gray-600 uppercase mb-10 text-center">Choose an app</p>

                    {APPS.map((app) => {
                        const Icon = app.icon;
                        return (
                            <div
                                key={app.id}
                                id={`app-card-${app.id}`}
                                onClick={() => router.push(app.route)}
                                className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all duration-200"
                            >
                                {/* Icon */}
                                <div className={`w-11 h-11 rounded-xl ${app.iconBg} ring-1 ${app.iconRing} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                                    <Icon className={`w-5 h-5 ${app.iconColor}`} />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h2 className={`text-sm font-semibold text-white transition-colors duration-200 ${app.accent}`}>{app.name}</h2>
                                        <span className="text-[10px] text-gray-600 font-medium">{app.tag}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{app.description}</p>
                                </div>

                                {/* Arrow */}
                                <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-all duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
                            </div>
                        );
                    })}

                    {/* Coming soon */}
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] opacity-40 cursor-not-allowed">
                        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-gray-500">Coming Soon</h2>
                                <span className="text-[10px] text-gray-700 font-medium">New</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">Another app is on the way</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 pb-5 text-center">
                <p className="text-[11px] text-gray-700">© 2026 · Built by Rahul Bhat</p>
            </footer>
        </div>
    );
};

export default AppSelectionPage;

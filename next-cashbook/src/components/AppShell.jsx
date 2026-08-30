'use client';

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

/**
 * AppShell — renders the correct chrome around each page:
 *
 *  /admin/*      → bare (admin has its own layout)
 *  /login, /signup, /select-app → bare (no chrome needed)
 *  /habits       → Navbar only  (habit tracker is self-contained, no sidebar)
 *  everything else (Cashbook) → Navbar + Sidebar
 */
export default function AppShell({ children }) {
    const pathname = usePathname();

    // Pages that render completely bare
    const isBareRoute =
        pathname?.startsWith("/admin") ||
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/select-app";

    if (isBareRoute) {
        return <>{children}</>;
    }

    // Habit Tracker, ServiceCare and DSA Tracker — Navbar but no Cashbook sidebar
    const isHabits = pathname?.startsWith("/habits");
    const isServiceCare = pathname?.startsWith("/servicecare");
    const isDsa = pathname?.startsWith("/dsa");

    if (isHabits || isServiceCare || isDsa) {
        return (
            <div className="h-screen flex flex-col bg-[#070b14] text-slate-100">
                <Navbar />
                <main className="flex-1 overflow-auto bank-page">
                    {children}
                </main>
            </div>
        );
    }

    // Cashbook — Navbar + Sidebar
    return (
        <div className="h-screen flex flex-col bg-[#070b14] text-slate-100">
            <Navbar />
            <div className="flex flex-1 bg-[#070b14] overflow-hidden">
                <Suspense fallback={<div className="w-64 bg-slate-900 animate-pulse" />}>
                    <Sidebar />
                </Suspense>
                <main className="flex-1 overflow-auto bank-page">
                    {children}
                </main>
            </div>
        </div>
    );
}

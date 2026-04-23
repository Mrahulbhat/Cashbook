'use client';

import { usePathname } from "next/navigation";
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

    // Habit Tracker — Navbar but no Cashbook sidebar
    const isHabits = pathname?.startsWith("/habits");

    if (isHabits) {
        return (
            <div className="h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 overflow-auto bg-[#050505]">
                    {children}
                </main>
            </div>
        );
    }

    // Cashbook — Navbar + Sidebar
    return (
        <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1 bg-black overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

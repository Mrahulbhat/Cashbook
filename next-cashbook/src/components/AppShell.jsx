'use client';

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AIAssistant from "@/components/AIAssistant";

/**
 * Conditionally renders the app shell (Navbar + Sidebar) only
 * for pages that are NOT under the /admin route.
 */
export default function AppShell({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        // Admin pages get a bare wrapper — no nav, no sidebar
        return <>{children}</>;
    }

    return (
        <div className="h-screen flex flex-col relative">
            <Navbar />
            <div className="flex flex-1 bg-black overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
            
            {/* AI Floating Assistant */}
            <AIAssistant />
        </div>
    );
}

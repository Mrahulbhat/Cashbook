'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";

export default function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <Loader className="size-10 animate-spin text-green-500" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return children;
}

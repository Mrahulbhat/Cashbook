'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ShieldCheck, Loader, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Welcome, Admin!");
                router.push('/admin');
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (err) {
            toast.error("Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-700/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Header badge */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl px-5 py-3">
                        <ShieldCheck className="text-purple-400 w-6 h-6" />
                        <span className="text-purple-300 font-semibold tracking-wide text-sm uppercase">Admin Portal</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-gray-900/60 border border-gray-800/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-purple-900/20">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
                        <p className="text-gray-500 text-sm">Restricted — authorized personnel only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    id="adminUsername"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    autoComplete="username"
                                    disabled={isLoading}
                                    className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    id="adminPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="adminLoginBtn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isLoading
                                ? <><Loader className="w-5 h-5 animate-spin" /> Authenticating...</>
                                : <><ShieldCheck className="w-5 h-5" /> Sign In as Admin</>
                            }
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-800/60 text-center">
                        <a href="/login" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
                            ← Back to user login
                        </a>
                    </div>
                </div>

                <p className="text-center text-gray-700 text-xs mt-6">
                    Cashbook Admin Panel · All actions are logged
                </p>
            </div>
        </div>
    );
}

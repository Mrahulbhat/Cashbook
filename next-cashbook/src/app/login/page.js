'use client';

import { useState, useEffect } from "react";
import { Mail, Lock, LogIn, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!phone || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/auth/login", {
                phone,
                password,
            });

            if (response.data.success) {
                toast.success("Login successful!");
                setUser(response.data.user);
                router.push("/dashboard");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                            Cashbook
                        </h1>
                        <p className="text-gray-400 text-sm">Manage your finances efficiently</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 mb-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Your phone number"
                                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all duration-300"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all duration-300"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                            Sign up here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

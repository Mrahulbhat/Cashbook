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

    // Check for token in URL params (from Google OAuth redirect)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            // Set token in localStorage and cookies (handled by API/Middleware usually, but frontend needs to restore state)
            // In Next.js, we usually rely on the cookie set by the server. 
            // If the server redirects with a token, we might need to fetch the user profile.
            // For now, let's just trigger a reload or check the session.
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.href = "/dashboard";
        }
    }, []);

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

    const handleGoogleLogin = () => {
        window.location.href = "/api/auth/google";
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
                            Cashbook - Next js
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
                                    id="emailInputField"
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
                                    id="passwordInputField"
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
                            id="loginButton"
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-700/0 to-gray-700"></div>
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-700 to-gray-700/0"></div>
                    </div>

                    <button
                        id="googleLoginButton"
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Login with Google
                    </button>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        Don't have an account?{" "}
                        <a id="signupLink" href="/signup" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                            Sign up here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

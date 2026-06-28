'use client';

import { useState, useEffect } from "react";
import { Lock, LogIn, Loader, Phone, ShieldCheck } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const router = useRouter();
    const { setUser } = useAuth();

    // Check for token in URL params (from Google OAuth redirect)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.href = "/select-app";
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
                router.push("/select-app");
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
        <div className="min-h-screen bank-page flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-500 to-slate-950"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                    Welcome to OneTrack
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Secure access to your personal dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-4 shadow-xl shadow-orange-950/10 sm:rounded-3xl sm:px-10 border border-[#eadfce]">
                    {!showLoginForm ? (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <p className="text-slate-600">Select an authentication method to continue.</p>
                            </div>
                            <button
                                onClick={() => setShowLoginForm(true)}
                                className="w-full flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm"
                            >
                                <Phone className="w-5 h-5" />
                                Login with Phone Number
                            </button>
                            
                            <div className="flex items-center gap-3 my-6">
                                <div className="flex-1 h-px bg-slate-200"></div>
                                <span className="text-slate-400 text-sm font-medium">or</span>
                                <div className="flex-1 h-px bg-slate-200"></div>
                            </div>

                            <button
                                id="GoogleLoginBtn"
                                type="button"
                                onClick={handleGoogleLogin}
                                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#4285F4] via-[#34A853] via-[#FBBC05] to-[#EA4335] p-[2px] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                <span className="flex w-full items-center justify-center gap-3 rounded-[10px] bg-white px-4 py-3 text-slate-800 transition-colors duration-300 group-hover:bg-slate-50">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span>Continue with Google</span>
                                </span>
                            </button>

                            <div className="mt-6">
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-slate-500">New to OneTrack?</span>
                                </div>
                                <div className="mt-4 text-center">
                                    <a id="SignupLink" href="/signup" className="text-orange-700 hover:text-orange-800 font-semibold transition-colors">
                                        Create an Account
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={handleLogin}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="PhoneInput"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Your phone number"
                                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    </div>
                                    <input
                                        id="PasswordInput"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                id="LoginBtn"
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                                {isLoading ? "Logging in..." : "Sign In Securely"}
                            </button>

                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowLoginForm(false)}
                                    className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Back to options
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

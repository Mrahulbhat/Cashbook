'use client';

import { useState } from "react";
import { Mail, Lock, User, LogIn, Loader, Eye, EyeOff, Globe, Github, Linkedin } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const SignupPage = () => {
    const router = useRouter();
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Name is required");
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return false;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axiosInstance.post("/auth/signup", {
                name: formData.name,
                phone: formData.phone,
                password: formData.password,
            });

            if (response.data.success) {
                toast.success("Account created successfully!");
                setUser(response.data.user);
                router.push("/select-app");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "/api/auth/google";
    };

    return (
        <div className="min-h-screen bank-page relative overflow-y-auto flex flex-col items-center justify-start p-4 scrollbar-hide">
            <div className="relative z-10 w-full max-w-md my-auto pt-10">
                <div className="bg-white/95 backdrop-blur-xl border border-[#eadfce] rounded-2xl p-8 shadow-2xl shadow-orange-950/10">
                    <div className="mb-8 text-center">
                        <h1 id="signupPageTitle" className="text-3xl font-bold mb-2 text-[#15110c]">
                            Cashbook
                        </h1>
                        <p className="text-slate-500 text-sm">Create your account</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4 mb-6">
                        <div>
                            <label className="block text-slate-700 text-sm font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    id="NameInput"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-sm font-medium mb-2">Phone Number</label>
                            <div className="relative">
                                <input
                                    id="PhoneInput"
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Your phone number"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    id="PasswordInput"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-10 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-orange-700"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-sm font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    id="ConfirmPasswordInput"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            id="SignupBtn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-orange-600 to-slate-950 hover:from-orange-500 hover:to-slate-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#eadfce]"></div>
                        <span className="text-slate-500 text-sm">or</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#eadfce] to-transparent"></div>
                    </div>

                    <button
                        id="GoogleLoginBtn"
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
                        Sign up with Google
                    </button>

                    <p className="text-center text-slate-500 text-sm mt-6">
                        Already have an account?{" "}
                        <a id="LoginLink" href="/login" className="text-orange-700 hover:text-orange-800 font-semibold transition-colors">Login here</a>
                    </p>
                </div>
                <div className="py-12 text-center">
                    <p className="text-slate-500 text-sm mb-4">Developed by <span className="text-orange-700 font-semibold tracking-wide">M Rahul Bhat</span></p>
                    <div className="flex justify-center gap-6">
                        <a href="#" className="p-2.5 bg-white hover:bg-orange-50 border border-[#eadfce] hover:border-orange-300 rounded-xl text-slate-500 hover:text-orange-700 transition-all duration-300 transform hover:-translate-y-1 group">
                            <Globe size={18} className="group-hover:animate-pulse" />
                        </a>
                        <a href="#" className="p-2.5 bg-white hover:bg-orange-50 border border-[#eadfce] hover:border-orange-300 rounded-xl text-slate-500 hover:text-orange-700 transition-all duration-300 transform hover:-translate-y-1 group">
                            <Github size={18} />
                        </a>
                        <a href="#" className="p-2.5 bg-white hover:bg-orange-50 border border-[#eadfce] hover:border-orange-300 rounded-xl text-slate-500 hover:text-orange-700 transition-all duration-300 transform hover:-translate-y-1 group">
                            <Linkedin size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;

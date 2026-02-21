'use client';

import { ArrowRight, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="h-full bg-black relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 h-full p-6 sm:p-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent mb-6">
          Welcome to <span className="text-green-400">Cashbook</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-12 font-light">
          Manage your finances, track transactions, and control your spending in one place
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
          {[
            { icon: Wallet, title: "Account Management", desc: "All your accounts in one dashboard" },
            { icon: DollarSign, title: "Easy Tracking", desc: "Quickly record income and expenses" },
            { icon: TrendingUp, title: "Smart Insights", desc: "Analyze your spending patterns" }
          ].map((feature, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl hover:border-green-500/30 transition-all">
              <feature.icon className="text-green-400 mx-auto mb-4" size={32} />
              <h3 className="text-white font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push(user ? "/dashboard" : "/login")}
          className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
        >
          {user ? "View Dashboard" : "Get Started"} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

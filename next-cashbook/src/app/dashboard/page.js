'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader, ArrowUpRight, ArrowDownLeft, Wallet, Tag } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useAccountStore } from "@/store/useAccountStore";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const DashboardContent = () => {
    const router = useRouter();
    const { transactions, fetchTransactions, loading } = useTransactionStore();
    const { fetchAccounts } = useAccountStore();

    const [filter, setFilter] = useState("monthly");
    const [pageLoading, setPageLoading] = useState(true);

    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setPageLoading(true);
            await Promise.all([fetchTransactions(), fetchAccounts()]);
        } catch (error) {
            toast.error("Failed to load dashboard");
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        const filteredTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            const now = new Date();
            
            if (filter === 'daily') {
                return d.getDate() === now.getDate() && 
                       d.getMonth() === now.getMonth() && 
                       d.getFullYear() === now.getFullYear();
            }
            if (filter === 'monthly') {
                return d.getMonth() === now.getMonth() && 
                       d.getFullYear() === now.getFullYear();
            }
            if (filter === 'yearly') {
                return d.getFullYear() === now.getFullYear();
            }
            return true;
        });

        let totalIncome = 0;
        let totalExpense = 0;

        filteredTransactions.forEach((t) => {
            const amount = Number(t.amount);
            const type = t.type.toLowerCase();
            if (type === "income") {
                totalIncome += amount;
            } else if (type === "expense") {
                totalExpense += amount;
            }
        });

        setStats({
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
        });
    }, [transactions, filter]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        }).format(amount);

    if (pageLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <Loader className="w-12 h-12 animate-spin text-green-400" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black overflow-hidden p-4 sm:p-8">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto pb-20">
                <div className="flex justify-center mb-8">
                    <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-md">
                        {['daily', 'monthly', 'yearly', 'lifetime'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2.5 rounded-xl capitalize text-sm font-semibold transition-all duration-300 ${filter === f ? 'bg-green-600 text-white shadow-lg shadow-green-900/40 transform scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div id="totalIncomeCard" className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-green-400 font-semibold text-xs">Total Income</h3>
                            <div className="p-1.5 bg-green-500/20 rounded-md">
                                <ArrowDownLeft className="w-4 h-4 text-green-400" />
                            </div>
                        </div>
                        <p id="totalIncome" className="text-xl font-bold text-white">{formatCurrency(stats.totalIncome)}</p>
                    </div>

                    <div id="totalExpenseCard" className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-red-400 font-semibold text-xs">Total Expense</h3>
                            <div className="p-1.5 bg-red-500/20 rounded-md">
                                <ArrowUpRight className="w-4 h-4 text-red-400" />
                            </div>
                        </div>
                        <p id="totalExpense" className="text-xl font-bold text-white">{formatCurrency(stats.totalExpense)}</p>
                    </div>

                    <div id="balanceCard" className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-blue-400 font-semibold text-xs">Balance</h3>
                        </div>
                        <p id="totalBalance" className="text-xl font-bold text-white">{formatCurrency(stats.balance)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        id="AddTransactionBtn"
                        onClick={() => router.push("/add-transaction")}
                        className="flex items-center justify-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm font-semibold text-green-100 transition-all duration-200 hover:border-green-400/60 hover:bg-green-500/20"
                    >
                        <Plus className="w-5 h-5 text-green-400" />
                        Add New Transaction
                    </button>
                    <button
                        id="AddAccountBtn"
                        onClick={() => router.push("/accounts/add")}
                        className="flex items-center justify-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm font-semibold text-blue-100 transition-all duration-200 hover:border-blue-400/60 hover:bg-blue-500/20"
                    >
                        <Wallet className="w-5 h-5 text-blue-400" />
                        Add Account
                    </button>
                    <button
                        id="AddCategoryBtn"
                        onClick={() => router.push("/categories/add")}
                        className="flex items-center justify-center gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-4 text-sm font-semibold text-purple-100 transition-all duration-200 hover:border-purple-400/60 hover:bg-purple-500/20"
                    >
                        <Tag className="w-5 h-5 text-purple-400" />
                        Add Category
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

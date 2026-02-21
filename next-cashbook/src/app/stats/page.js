'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Target, PieChart, Loader } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const StatisticsContent = () => {
    const router = useRouter();
    const { transactions, fetchTransactions, loading: transLoading } = useTransactionStore();
    const { categories, loadCategories, loading: catLoading } = useCategoryStore();

    const [filter, setFilter] = useState("lifetime");
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        savingsRate: 0,
        categoryStats: [],
    });

    useEffect(() => {
        fetchTransactions();
        loadCategories();
    }, [fetchTransactions, loadCategories]);

    useEffect(() => {
        const now = new Date();
        const filtered = transactions.filter(t => {
            if (filter === 'monthly') {
                const d = new Date(t.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (filter === 'yearly') {
                return new Date(t.date).getFullYear() === now.getFullYear();
            }
            return true;
        });

        let totalIncome = 0;
        let totalExpense = 0;
        const categoryMap = {};

        filtered.forEach(t => {
            const amount = Number(t.amount);
            if (t.type === 'income') totalIncome += amount;
            else totalExpense += amount;

            const catName = t.category?.name || 'Uncategorized';
            if (!categoryMap[catName]) {
                categoryMap[catName] = { name: catName, amount: 0, type: t.type };
            }
            categoryMap[catName].amount += amount;
        });

        const categoryStats = Object.values(categoryMap)
            .filter(c => c.type === 'expense')
            .sort((a, b) => b.amount - a.amount);

        const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

        setStats({ totalIncome, totalExpense, savingsRate, categoryStats });
    }, [transactions, filter]);

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

    if (transLoading || catLoading) {
        return <div className="min-h-screen bg-black flex justify-center items-center"><Loader className="animate-spin text-purple-500" /></div>;
    }

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto pb-20">
                <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>

                <h1 className="text-4xl font-bold text-white mb-8">Statistics</h1>

                <div className="flex gap-3 mb-8">
                    {['monthly', 'yearly', 'lifetime'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-lg capitalize ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl">
                        <div className="flex justify-between mb-4"><span className="text-green-400 text-sm">Income</span><TrendingUp size={20} className="text-green-400" /></div>
                        <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalIncome)}</p>
                    </div>
                    <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-2xl">
                        <div className="flex justify-between mb-4"><span className="text-red-400 text-sm">Expense</span><TrendingUp size={20} className="text-red-400 rotate-180" /></div>
                        <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalExpense)}</p>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl">
                        <div className="flex justify-between mb-4"><span className="text-blue-400 text-sm">Net Savings</span><PieChart size={20} className="text-blue-400" /></div>
                        <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalIncome - stats.totalExpense)}</p>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-500/30 p-6 rounded-2xl">
                        <div className="flex justify-between mb-4"><span className="text-amber-400 text-sm">Savings Rate</span><Target size={20} className="text-amber-400" /></div>
                        <p className="text-2xl font-bold text-white">{stats.savingsRate}%</p>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
                    <h2 className="text-white text-xl font-bold mb-6">Expense Breakdown</h2>
                    <div className="space-y-6">
                        {stats.categoryStats.map((c, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white">{c.name}</span>
                                    <span className="text-white font-bold">{formatCurrency(c.amount)}</span>
                                </div>
                                <div className="w-full bg-gray-800 h-2 rounded-full">
                                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, (c.amount / stats.totalExpense) * 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function StatisticsPage() {
    return <ProtectedRoute><StatisticsContent /></ProtectedRoute>;
}

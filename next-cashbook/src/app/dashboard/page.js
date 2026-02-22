'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader, ArrowUpRight, ArrowDownLeft, Trash2, Edit2 } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useAccountStore } from "@/store/useAccountStore";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const DashboardContent = () => {
    const router = useRouter();
    const { transactions, fetchTransactions, deleteTransaction, loading } = useTransactionStore();
    const { accounts, fetchAccounts } = useAccountStore();

    const [lastTransactions, setLastTransactions] = useState([]);
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
        if (transactions.length > 0) {
            const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
            setLastTransactions(sorted.slice(0, 5));

            let totalIncome = 0;
            let totalExpense = 0;

            transactions.forEach((t) => {
                const amount = Number(t.amount);
                if (t.type.toLowerCase() === "income") {
                    totalIncome += amount;
                } else {
                    totalExpense += amount;
                }
            });

            setStats({
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
            });
        } else {
            setLastTransactions([]);
            setStats({ totalIncome: 0, totalExpense: 0, balance: 0 });
        }
    }, [transactions]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            await deleteTransaction(id);
            await loadData();
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-green-400 font-semibold text-sm">Total Income</h3>
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <ArrowDownLeft className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalIncome)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-red-400 font-semibold text-sm">Total Expense</h3>
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <ArrowUpRight className="w-5 h-5 text-red-400" />
                            </div>
                        </div>
                        <p id="totalExpense" className="text-2xl font-bold text-white">{formatCurrency(stats.totalExpense)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-blue-400 font-semibold text-sm">Balance</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{formatCurrency(stats.balance)}</p>
                    </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/30 rounded-3xl overflow-hidden">
                    <div className="bg-gray-800/50 px-8 py-6">
                        <h2 className="text-white text-2xl font-bold">Recent Transactions</h2>
                    </div>

                    {lastTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table data-testid="resultsTable" className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700/50 text-gray-400 text-sm">
                                        <th className="px-8 py-4 text-left">Type</th>
                                        <th className="px-8 py-4 text-left">Amount</th>
                                        <th className="px-8 py-4 text-left">Category</th>
                                        <th className="px-8 py-4 text-left">Account</th>
                                        <th className="px-8 py-4 text-left">Date</th>
                                        <th className="px-8 py-4 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-300">
                                    {lastTransactions.map((transaction) => (
                                        <tr key={transaction._id} className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                                            <td className="px-8 py-4 capitalize">{transaction.type}</td>
                                            <td className={`px-8 py-4 font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                {formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="px-8 py-4">{transaction.category?.name || 'N/A'}</td>
                                            <td className="px-8 py-4">{transaction.account?.name || 'N/A'}</td>
                                            <td className="px-8 py-4">{formatDate(transaction.date)}</td>
                                            <td className="px-8 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => router.push(`/edit-transaction/${transaction._id}`)} className="p-2 hover:bg-blue-500/20 rounded-lg">
                                                        <Edit2 className="w-4 h-4 text-blue-400" />
                                                    </button>
                                                    <button onClick={() => handleDelete(transaction._id)} className="p-2 hover:bg-red-500/20 rounded-lg">
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-8 py-16 text-center text-gray-400">
                            <p>No transactions yet</p>
                            <button onClick={() => router.push("/add-transaction")} className="mt-4 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2">
                                <Plus size={18} /> Add First Transaction
                            </button>
                        </div>
                    )}
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

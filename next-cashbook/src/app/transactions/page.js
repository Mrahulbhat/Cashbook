'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Loader, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const TransactionsContent = () => {
    const router = useRouter();
    const { transactions, fetchTransactions, deleteTransaction, loading } = useTransactionStore();
    const [filter, setFilter] = useState("monthly");

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = transactions.filter(t => {
        const now = new Date();
        const d = new Date(t.date);
        if (filter === 'monthly') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        if (filter === 'yearly') return d.getFullYear() === now.getFullYear();
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleDelete = async (id) => {
        if (window.confirm("Delete this transaction?")) {
            await deleteTransaction(id);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
                        <p className="text-gray-400">View and manage your history</p>
                    </div>
                    <button id="addTransactionBtn" onClick={() => router.push("/add-transaction")} className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-transform transform hover:scale-105">
                        <Plus size={18} /> Add Transaction
                    </button>
                </div>

                <div className="flex gap-3 mb-8">
                    {['monthly', 'yearly', 'lifetime'].map(f => (
                        <button key={f} id={`${f}FilterBtn`} onClick={() => setFilter(f)} className={`px-6 py-2 rounded-lg capitalize ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl">
                    <div className="px-8 py-6 border-b border-gray-800"><h2 className="text-white text-xl font-bold">Transaction History</h2></div>

                    {loading ? (
                        <div className="p-20 flex justify-center"><Loader className="animate-spin text-green-500" /></div>
                    ) : filteredTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table data-testid="resultsTable" className="w-full">
                                <thead className="text-gray-400 text-sm text-left">
                                    <tr>
                                        <th className="px-8 py-4">Type</th>
                                        <th className="px-8 py-4">Amount</th>
                                        <th className="px-8 py-4">Category</th>
                                        <th className="px-8 py-4">Account</th>
                                        <th className="px-8 py-4">Date</th>
                                        <th className="px-8 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-300">
                                    {filteredTransactions.map(t => (
                                        <tr key={t._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                            <td className="px-8 py-4 flex items-center gap-2">
                                                {t.type === 'income' ? <ArrowDownLeft className="text-green-400" size={16} /> : <ArrowUpRight className="text-red-400" size={16} />}
                                                <span className="capitalize">{t.type}</span>
                                            </td>
                                            <td className={`px-8 py-4 font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(t.amount)}</td>
                                            <td className="px-8 py-4">{t.category?.name || 'N/A'}</td>
                                            <td className="px-8 py-4">{t.account?.name || 'N/A'}</td>
                                            <td className="px-8 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="px-8 py-4">
                                                <div className="flex gap-2">
                                                    <button id="editRecordBtn" onClick={() => router.push(`/edit-transaction/${t._id}`)} className="p-2 hover:bg-blue-500/20 rounded-lg"><Edit2 size={16} className="text-blue-400" /></button>
                                                    <button id="deleteBtn" onClick={() => handleDelete(t._id)} className="p-2 hover:bg-red-500/20 rounded-lg"><Trash2 size={16} className="text-red-400" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 text-center text-gray-400"><p>No transactions found</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function TransactionsPage() {
    return <ProtectedRoute><TransactionsContent /></ProtectedRoute>;
}

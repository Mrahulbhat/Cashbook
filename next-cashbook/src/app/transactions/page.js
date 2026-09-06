'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Folder, Trash2, Loader, ArrowUpRight, ArrowDownLeft, Repeat } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";

const TransactionsContent = () => {
    const router = useRouter();
    const { transactions, fetchTransactions, deleteTransaction, loading } = useTransactionStore();
    const [filter, setFilter] = useState("monthly");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const now = new Date();
            const d = new Date(t.date);
            
            if (filter === 'daily') {
                return d.getDate() === now.getDate() && 
                       d.getMonth() === now.getMonth() && 
                       d.getFullYear() === now.getFullYear();
            }
            if (filter === 'monthly') {
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (filter === 'yearly') {
                return d.getFullYear() === now.getFullYear();
            }
            return true;
        }).sort((a, b) => {
            const dateCompare = new Date(b.date) - new Date(a.date);
            if (dateCompare !== 0) return dateCompare;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [transactions, filter]);

    useEffect(() => {
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
    }, [filteredTransactions]);

    const handleDelete = (id) => {
        setSelectedTransactionId(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedTransactionId) {
            await deleteTransaction(selectedTransactionId);
            setSelectedTransactionId(null);
        }
    };

    const handleConfirmBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        for (const id of selectedIds) {
            await deleteTransaction(id);
        }
        setSelectedIds([]);
    };

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-0">Transactions</h1>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-md">
                        {['daily', 'monthly', 'yearly', 'lifetime'].map((f) => (
                            <button
                                key={f}
                                id={`FilterBtn-${f}`}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2.5 rounded-xl capitalize text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${filter === f ? 'bg-green-600 text-white shadow-lg shadow-green-900/40 transform scale-105' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
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

                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            id="AddBtnSmall"
                            onClick={() => router.push("/add-transaction")}
                            className="bg-white text-orange-700 border border-orange-500 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-orange-100"
                        >
                            <Plus size={16} className="text-orange-600" />
                            <span className="text-orange-700">Add</span>
                        </button>

                        <button
                            id="BulkDeleteBtn"
                            onClick={() => setIsBulkModalOpen(true)}
                            disabled={selectedIds.length === 0}
                            className={`bg-white text-orange-700 border border-orange-500 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Trash2 size={16} className="text-orange-600" />
                            <span className="text-orange-700">Delete</span>
                        </button>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/60 px-4 py-2 shadow-sm">
                        <span className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">No of records</span>
                        <span className="text-lg font-bold text-white">{filteredTransactions.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex justify-center"><Loader className="animate-spin text-green-500" /></div>
                ) : filteredTransactions.length > 0 ? (
                    <div className="overflow-x-auto bg-gray-900/30 border border-gray-800 rounded-2xl p-4">
                        <table data-testid="resultsTable" className="w-full table-auto text-center border-collapse border border-gray-800">
                            <thead>
                                <tr className="text-gray-400 text-sm">
                                    <th className="w-10 py-1 px-2 border border-gray-800">
                                        <input
                                            type="checkbox"
                                            onChange={() => {
                                                if (selectedIds.length === filteredTransactions.length) setSelectedIds([]);
                                                else setSelectedIds(filteredTransactions.map(t => t._id));
                                            }}
                                            checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                                            aria-label="Select all transactions"
                                        />
                                    </th>
                                    <th className="w-10 py-1 px-2 border border-gray-800">Actions</th>
                                    <th className="py-3 border border-gray-800">Date</th>
                                    <th className="py-3 border border-gray-800">Type</th>
                                    <th className="py-3 border border-gray-800">Amount</th>
                                    <th className="py-3 border border-gray-800">Category</th>
                                    <th className="py-3 border border-gray-800">Account</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((t) => (
                                    <tr key={t._id} className="hover:bg-gray-800/20">
                                        <td className="w-10 py-1 px-2 border border-gray-800">
                                            <input
                                                type="checkbox"
                                                className="accent-orange-600 border-orange-500"
                                                checked={selectedIds.includes(t._id)}
                                                onChange={() => setSelectedIds(prev => prev.includes(t._id) ? prev.filter(x => x !== t._id) : [...prev, t._id])}
                                                aria-label={`Select ${t._id}`}
                                            />
                                        </td>
                                        <td className="w-10 py-1 px-2 border border-gray-800">
                                            <div className="flex items-center justify-center">
                                                <button id="EditBtn" onClick={() => router.push(`/edit-transaction/${t._id}`)} className="p-1 hover:bg-blue-500/20 rounded-md">
                                                    <Folder className="w-4 h-4 text-orange-600" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 border border-gray-800">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="py-4 border border-gray-800">
                                            <div className="flex items-center gap-2 justify-center">
                                                {t.type === 'income' ? <ArrowDownLeft className="text-green-400" size={16} /> :
                                                    t.type === 'investment' ? <Repeat className="text-blue-400" size={16} /> :
                                                        <ArrowUpRight className="text-red-400" size={16} />}
                                                <span className="capitalize">{t.type}</span>
                                            </div>
                                        </td>
                                        <td className={`py-4 border border-gray-800 font-bold ${t.type === 'income' ? 'text-green-400' : t.type === 'investment' ? 'text-blue-400' : 'text-red-400'}`}>{formatCurrency(t.amount)}</td>
                                        <td className="py-4 border border-gray-800">{t.category?.name || 'N/A'}</td>
                                        <td className="py-4 border border-gray-800">{t.type === "investment" ? `${t.account?.name} → ${t.toAccount?.name || "N/A"}` : t.account?.name || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-16 text-center">
                        <p className="text-gray-400 text-lg">No transactions found</p>
                        <p className="mt-2 text-sm text-gray-500">No of records: 0</p>
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Transaction"
                    message="Are you sure you want to delete this transaction? This action cannot be undone."
                    confirmText="Delete"
                    type="danger"
                />

                <Modal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    onConfirm={handleConfirmBulkDelete}
                    title="Delete Selected Transactions"
                    message={`Are you sure you want to delete ${selectedIds.length} selected transaction(s)? This will be permanent.`}
                    confirmText="Delete"
                    type="danger"
                />
            </div>
        </div>
    );
};

export default function TransactionsPage() {
    return <ProtectedRoute><TransactionsContent /></ProtectedRoute>;
}

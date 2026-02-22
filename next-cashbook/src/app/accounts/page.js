'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, Loader } from "lucide-react";
import { useAccountStore } from "@/store/useAccountStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const AccountsContent = () => {
    const router = useRouter();
    const { accounts, fetchAccounts, deleteAccount, loading } = useAccountStore();

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this account?")) {
            await deleteAccount(id);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    const getTotalBalance = () => {
        return accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
    };

    if (loading && accounts.length === 0) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <Loader className="w-12 h-12 animate-spin text-green-400" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black overflow-hidden p-4 sm:p-8">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Accounts</h1>
                        <p className="text-gray-400">Manage your financial accounts</p>
                    </div>
                    <button
                        id="addAccountBtn"
                        onClick={() => router.push("/accounts/add")}
                        className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-transform transform hover:scale-105"
                    >
                        <Plus size={18} /> Add Account
                    </button>
                </div>

                {accounts.length > 0 && (
                    <div id="balanceContainer" className="mb-8 bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-8 backdrop-blur-sm">
                        <h3 className="text-emerald-400 font-semibold text-sm mb-2">Total Balance</h3>
                        <p className="text-4xl font-bold text-white">{formatCurrency(getTotalBalance())}</p>
                        <p className="text-emerald-400 text-sm mt-2">Across {accounts.length} account(s)</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map((account) => (
                        <div key={account._id} id={`accountDiv${account.name}`} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/30 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-white font-bold text-lg">{account.name}</h3>
                                <div className="flex gap-2">
                                    <button id="editBtn" onClick={() => router.push(`/accounts/edit/${account._id}`)} className="p-2 hover:bg-blue-500/20 rounded-lg">
                                        <Edit2 className="w-4 h-4 text-blue-400" />
                                    </button>
                                    <button id="deleteBtn" onClick={() => handleDeleteClick(account._id)} className="p-2 hover:bg-red-500/20 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-gray-400 text-xs mb-1">Current Balance</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(account.balance)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {accounts.length === 0 && (
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-16 text-center">
                        <p className="text-gray-400 text-lg mb-6">No accounts yet</p>
                        <button onClick={() => router.push("/accounts/add")} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl inline-flex items-center gap-2">
                            <Plus size={18} /> Create Your First Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function AccountsPage() {
    return (
        <ProtectedRoute>
            <AccountsContent />
        </ProtectedRoute>
    );
}

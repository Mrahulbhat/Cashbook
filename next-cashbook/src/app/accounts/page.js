'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Folder, Trash2, Loader } from "lucide-react";
import { useAccountStore } from "@/store/useAccountStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";

const AccountsContent = () => {
    const router = useRouter();
    const { accounts, fetchAccounts, deleteAccount, loading } = useAccountStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleDeleteClick = (id) => {
        setSelectedAccountId(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedAccountId) {
            await deleteAccount(selectedAccountId);
            setSelectedAccountId(null);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === accounts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(accounts.map((a) => a._id));
        }
    };

    const handleConfirmBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        for (const id of selectedIds) {
            await deleteAccount(id);
        }
        setSelectedIds([]);
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
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Accounts</h1>                    </div>
                </div>

                <div id="balanceContainer" className="mb-8 bg-white/5 border border-orange-500/20 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-5">
                        <div className="text-orange-600 text-sm flex items-center gap-2">
                            <span className="font-semibold">Total Balance</span>
                            <span className="text-white font-bold">{formatCurrency(getTotalBalance())}</span>
                        </div>
                        <div className="text-orange-600 text-sm">
                            <span className="text-white font-semibold">{accounts.length}</span>
                            <span className="ml-2">account(s)</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6 flex items-center justify-start gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            id="AddBtnSmall"
                            onClick={() => router.push("/accounts/add")}
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
                </div>

                <div className="overflow-x-auto bg-gray-900/30 border border-gray-800 rounded-2xl p-4">
                    <table className="w-full table-auto text-center border-collapse border border-gray-800">
                        <thead>
                            <tr className="text-gray-400 text-sm">
                                <th className="w-10 py-1 px-2 border border-gray-800">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={accounts.length > 0 && selectedIds.length === accounts.length}
                                        aria-label="Select all accounts"
                                    />
                                </th>
                                <th className="w-10 py-1 px-2 border border-gray-800">Actions</th>
                                <th className="py-3 border border-gray-800">Account Name</th>
                                <th className="py-3 border border-gray-800">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account._id} className="hover:bg-gray-800/20">
                                    <td className="w-10 py-1 px-2 border border-gray-800">
                                            <input
                                                type="checkbox"
                                                className="accent-orange-600 border-orange-500"
                                                checked={selectedIds.includes(account._id)}
                                                onChange={() => toggleSelect(account._id)}
                                                aria-label={`Select ${account.name}`}
                                            />
                                    </td>
                                    <td className="w-10 py-1 px-2 border border-gray-800">
                                        <div className="flex items-center gap-1 justify-center">
                                            <button id="EditBtn" onClick={() => router.push(`/accounts/edit/${account._id}`)} className="p-1 hover:bg-blue-500/20 rounded-md">
                                                <Folder className="w-4 h-4 text-orange-600" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 border border-gray-800">
                                        <div className="text-white font-semibold">{account.name}</div>
                                    </td>
                                    <td className="py-4 border border-gray-800">
                                        <div className="font-bold text-white">{formatCurrency(account.balance)}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {accounts.length === 0 && (
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-16 text-center">
                        <p className="text-gray-400 text-lg">No accounts found</p>
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Account"
                    message="Are you sure you want to delete this account? All associated transactions will be affected."
                    confirmText="Delete"
                    type="danger"
                />
                <Modal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    onConfirm={handleConfirmBulkDelete}
                    title="Delete Selected Accounts"
                    message={`Are you sure you want to delete ${selectedIds.length} selected account(s)? This will affect associated transactions.`}
                    confirmText="Delete"
                    type="danger"
                />
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

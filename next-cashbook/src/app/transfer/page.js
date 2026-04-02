'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Repeat, Loader, DollarSign, AlignLeft, ArrowRightLeft } from "lucide-react";
import { useAccountStore } from "@/store/useAccountStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const TransferContent = () => {
    const router = useRouter();
    const { accounts, fetchAccounts, loading: accLoading } = useAccountStore();
    const { categories, loadCategories, loading: catLoading } = useCategoryStore();
    const { fetchTransactions } = useTransactionStore();
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fromAccount: "",
        toAccount: "",
        amount: "",
        description: "",
    });

    useEffect(() => {
        fetchAccounts();
        loadCategories();
    }, [fetchAccounts, loadCategories]);

    // Find suitable categories for transfer
    const transferCategories = useMemo(() => {
        const expenseCat = categories.find(c => c.name.toLowerCase().includes('transfer') && c.type === 'expense') 
                        || categories.find(c => c.type === 'expense') 
                        || null;
        
        const incomeCat = categories.find(c => c.name.toLowerCase().includes('transfer') && c.type === 'income')
                        || categories.find(c => c.type === 'income')
                        || null;
        
        return { expenseCat, incomeCat };
    }, [categories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fromAccount || !formData.toAccount || !formData.amount) {
            toast.error("Please fill in all required fields");
            return;
        }
        
        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid positive amount");
            return;
        }

        if (formData.fromAccount === formData.toAccount) {
            toast.error("Cannot transfer to the same account");
            return;
        }

        if (!transferCategories.expenseCat || !transferCategories.incomeCat) {
            toast.error("Please create at least one income and one expense category first");
            return;
        }

        const sourceAccount = accounts.find(a => a._id === formData.fromAccount);
        if (sourceAccount && sourceAccount.balance < amount) {
            toast.error(`Insufficient balance in ${sourceAccount.name}`);
            return;
        }

        setLoading(true);
        try {
            // Outflow from source account
            await axiosInstance.post("/transactions", {
                type: 'expense',
                amount: amount,
                account: formData.fromAccount,
                description: `Transfer to ${accounts.find(a => a._id === formData.toAccount)?.name}${formData.description ? ': ' + formData.description : ''}`,
                category: transferCategories.expenseCat._id,
                date: new Date(),
            });

            // Inflow to destination account
            await axiosInstance.post("/transactions", {
                type: 'income',
                amount: amount,
                account: formData.toAccount,
                description: `Transfer from ${accounts.find(a => a._id === formData.fromAccount)?.name}${formData.description ? ': ' + formData.description : ''}`,
                category: transferCategories.incomeCat._id,
                date: new Date(),
            });

            toast.success("Transfer completed!");
            
            // Refresh data in background
            await Promise.all([fetchAccounts(), fetchTransactions()]);
            
            router.push("/dashboard");
        } catch (error) {
            console.error("Transfer error:", error);
            toast.error(error.response?.data?.message || "Transfer failed");
        } finally {
            setLoading(false);
        }
    };

    if (accLoading || catLoading) {
        return <div className="min-h-screen bg-black flex justify-center items-center"><Loader className="animate-spin text-blue-500 w-10 h-10" /></div>;
    }

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="max-w-xl mx-auto z-10 relative">
                <button 
                    id="BackBtn" 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 mb-8 text-gray-500 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                                Transfer
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Move funds between your accounts</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <ArrowRightLeft className="text-blue-400" size={28} />
                        </div>
                    </div>

                    <form id="TransferForm" onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-400 mb-3 ml-1 group-focus-within:text-blue-400 transition-colors">From Account</label>
                                <select 
                                    id="FromAccountDropdown" 
                                    value={formData.fromAccount} 
                                    onChange={e => setFormData({ ...formData, fromAccount: e.target.value })} 
                                    className="w-full p-4 bg-gray-800/80 border border-gray-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select source account</option>
                                    {accounts.map(a => <option key={a._id} value={a._id}>{a.name} (₹{a.balance})</option>)}
                                </select>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-400 mb-3 ml-1 group-focus-within:text-blue-400 transition-colors">To Account</label>
                                <select 
                                    id="ToAccountDropdown" 
                                    value={formData.toAccount} 
                                    onChange={e => setFormData({ ...formData, toAccount: e.target.value })} 
                                    className="w-full p-4 bg-gray-800/80 border border-gray-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select destination account</option>
                                    {accounts.map(a => <option key={a._id} value={a._id}>{a.name} (₹{a.balance})</option>)}
                                </select>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-400 mb-3 ml-1 group-focus-within:text-blue-400 transition-colors">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                    <input 
                                        id="AmountInput" 
                                        type="number" 
                                        step="0.01"
                                        value={formData.amount} 
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                                        placeholder="0.00" 
                                        className="w-full p-4 pl-10 bg-gray-800/80 border border-gray-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-400 mb-3 ml-1 group-focus-within:text-blue-400 transition-colors">Note (Optional)</label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-4 top-4 text-gray-500" size={18} />
                                    <textarea 
                                        id="DescriptionInput"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add a reason for this transfer..."
                                        rows="2"
                                        className="w-full p-4 pl-12 bg-gray-800/80 border border-gray-700/50 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            id="SubmitBtn" 
                            disabled={loading} 
                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader className="animate-spin" size={20} />
                                    <span>Processing...</span>
                                </div>
                            ) : "Confirm Transfer"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function TransferPage() {
    return <ProtectedRoute><TransferContent /></ProtectedRoute>;
}

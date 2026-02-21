'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useAccountStore } from "@/store/useAccountStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const AddTransactionContent = () => {
    const router = useRouter();
    const { addTransaction, loading: transLoading } = useTransactionStore();
    const { accounts, fetchAccounts, loading: accLoading } = useAccountStore();
    const { categories, loadCategories, loading: catLoading } = useCategoryStore();

    const [formData, setFormData] = useState({
        amount: "",
        type: "expense",
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        account: "",
    });

    useEffect(() => {
        fetchAccounts();
        loadCategories();
    }, [fetchAccounts, loadCategories]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.category || !formData.account) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await addTransaction({
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date(formData.date),
            });
            toast.success("Transaction recorded successfully!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to add transaction");
        }
    };

    const filteredCategories = categories.filter(cat => cat.type === formData.type);

    const isLoading = accLoading || catLoading || transLoading;

    return (
        <div className="min-h-screen bg-black p-4 pb-20 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-green-600 rounded-lg"><Plus className="text-white" /></div>
                        <h1 className="text-2xl font-bold text-white">Add Transaction</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-4">
                            {['income', 'expense'].map(t => (
                                <label key={t} className="flex items-center gap-2 cursor-pointer capitalize text-gray-300">
                                    <input type="radio" name="type" value={t} checked={formData.type === t} onChange={handleInputChange} className="accent-green-500" />
                                    {t}
                                </label>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Amount *</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Account *</label>
                                <select name="account" value={formData.account} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white" required>
                                    <option value="">Select Account</option>
                                    {accounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Category *</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white" required>
                                    <option value="">Select Category</option>
                                    {filteredCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Date *</label>
                            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white" required />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white resize-none" />
                        </div>

                        <div className="flex gap-4">
                            <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                            <button type="submit" disabled={isLoading} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
                                {isLoading ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />} Save Transaction
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function AddTransactionPage() {
    return (
        <ProtectedRoute>
            <AddTransactionContent />
        </ProtectedRoute>
    );
}

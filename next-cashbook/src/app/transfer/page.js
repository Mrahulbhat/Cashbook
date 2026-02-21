'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Repeat, Loader } from "lucide-react";
import { useAccountStore } from "@/store/useAccountStore";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const TransferContent = () => {
    const router = useRouter();
    const { accounts, fetchAccounts, loading: accLoading } = useAccountStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fromAccount: "",
        toAccount: "",
        amount: "",
        description: "",
    });

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fromAccount || !formData.toAccount || !formData.amount) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (formData.fromAccount === formData.toAccount) {
            toast.error("Cannot transfer to the same account");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post("/transactions", {
                type: 'expense',
                amount: parseFloat(formData.amount),
                account: formData.fromAccount,
                description: `Transfer to ${accounts.find(a => a._id === formData.toAccount)?.name}: ${formData.description}`,
                category: null, // Should ideally have a system category for transfers
                date: new Date(),
            });
            await axiosInstance.post("/transactions", {
                type: 'income',
                amount: parseFloat(formData.amount),
                account: formData.toAccount,
                description: `Transfer from ${accounts.find(a => a._id === formData.fromAccount)?.name}: ${formData.description}`,
                category: null,
                date: new Date(),
            });
            toast.success("Transfer completed!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Transfer failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8 relative">
            <div className="max-w-2xl mx-auto z-10 relative">
                <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-gray-400"><ArrowLeft size={18} /> Back</button>
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800">
                    <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><Repeat className="text-blue-500" /> Fund Transfer</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">From Account</label>
                            <select value={formData.fromAccount} onChange={e => setFormData({ ...formData, fromAccount: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none">
                                <option value="">Select Account</option>
                                {accounts.map(a => <option key={a._id} value={a._id}>{a.name} (₹{a.balance})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">To Account</label>
                            <select value={formData.toAccount} onChange={e => setFormData({ ...formData, toAccount: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none">
                                <option value="">Select Account</option>
                                {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Amount</label>
                            <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" />
                        </div>
                        <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all">
                            {loading ? <Loader className="animate-spin mx-auto" /> : "Confirm Transfer"}
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

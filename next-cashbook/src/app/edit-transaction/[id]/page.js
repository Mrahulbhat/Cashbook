'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { useAccountStore } from "@/store/useAccountStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const EditTransactionContent = () => {
    const router = useRouter();
    const { id } = useParams();
    const { accounts, fetchAccounts } = useAccountStore();
    const { categories, loadCategories } = useCategoryStore();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        amount: "",
        type: "expense",
        description: "",
        category: "",
        date: "",
        account: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [txRes] = await Promise.all([
                    axiosInstance.get(`/transactions/${id}`),
                    fetchAccounts(),
                    loadCategories(),
                ]);
                const tx = txRes.data;
                setFormData({
                    amount: tx.amount,
                    type: tx.type,
                    description: tx.description || "",
                    category: tx.category?._id || tx.category,
                    date: new Date(tx.date).toISOString().split("T")[0],
                    account: tx.account?._id || tx.account,
                });
            } catch (error) {
                toast.error("Failed to load data");
                router.push("/dashboard");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, router, fetchAccounts, loadCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put(`/transactions/${id}`, {
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date(formData.date),
            });
            toast.success("Transaction updated!");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-screen bg-black flex justify-center items-center"><Loader className="animate-spin text-green-500" /></div>;

    const filteredCategories = categories.filter(c => c.type === formData.type);

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-gray-400"><ArrowLeft size={18} /> Back</button>
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800">
                    <h1 className="text-2xl font-bold text-white mb-8">Edit Transaction</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Amount</label>
                            <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Account</label>
                                <select value={formData.account} onChange={e => setFormData({ ...formData, account: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required>
                                    {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required>
                                    {filteredCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Date</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required />
                        </div>
                        <button disabled={loading} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition-all flex justify-center items-center gap-2">
                            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function EditTransactionPage() {
    return <ProtectedRoute><EditTransactionContent /></ProtectedRoute>;
}

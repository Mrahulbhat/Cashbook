'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { useAccountStore } from "@/store/useAccountStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import QuickCreateModal from "@/components/QuickCreateModal";

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

    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'account', // 'account' or 'category'
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
                    category: tx.category?._id || tx.category || "",
                    date: new Date(tx.date).toISOString().split("T")[0],
                    account: tx.account?._id || tx.account || "",
                });
            } catch (error) {
                toast.error("Failed to load data");
                router.push("/transactions");
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, router, fetchAccounts, loadCategories]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (value === "ADD_NEW_ACCOUNT") {
            setModalState({ isOpen: true, type: 'account' });
            return;
        }
        if (value === "ADD_NEW_CATEGORY") {
            setModalState({ isOpen: true, type: 'category' });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuickCreateSuccess = (newId, type) => {
        if (type === 'account') {
            setFormData(prev => ({ ...prev, account: newId }));
        } else if (type === 'category') {
            setFormData(prev => ({ ...prev, category: newId }));
        }
    };

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
            router.push("/transactions");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-screen bg-black flex justify-center items-center"><Loader className="animate-spin text-green-500" /></div>;

    const filteredCategories = categories.filter(c => c.type === formData.type);

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8 relative">
            <div className="max-w-2xl mx-auto z-10 relative">
                <button id="BackBtn" onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-gray-400"><ArrowLeft size={18} /> Back</button>
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
                    <h1 className="text-2xl font-bold text-white mb-8">Edit Transaction</h1>
                    <form id="EditTransactionForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-4 mb-4">
                            {['income', 'expense'].map(t => (
                                <label key={t} className="flex items-center gap-2 cursor-pointer capitalize text-gray-300">
                                    <input 
                                        id={t === 'income' ? 'TypeRadio-income' : 'TypeRadio-expense'} 
                                        type="radio" 
                                        name="type" 
                                        value={t} 
                                        checked={formData.type === t} 
                                        onChange={handleInputChange} 
                                        className="accent-green-500" 
                                    />
                                    {t}
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Amount</label>
                            <input id="AmountInput" name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Account</label>
                                <select id="AccountDropdown" name="account" value={formData.account || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required>
                                    <option value="">Select Account</option>
                                    <optgroup label="Actions">
                                        <option value="ADD_NEW_ACCOUNT">+ Add New Account</option>
                                    </optgroup>
                                    <optgroup label="Existing Accounts">
                                        {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Category</label>
                                <select id="CategoryDropdown" name="category" value={formData.category || ""} onChange={handleInputChange} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required>
                                    <option value="">Select Category</option>
                                    <optgroup label="Actions">
                                        <option value="ADD_NEW_CATEGORY">+ Add New Category</option>
                                    </optgroup>
                                    <optgroup label="Existing Categories">
                                        {filteredCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Date</label>
                            <input id="DateInput" name="date" type="date" value={formData.date} onChange={handleInputChange} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea id="DescriptionInput" name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none resize-none" />
                        </div>
                        <div className="flex gap-4">
                            <button id="CancelBtn" type="button" onClick={() => router.back()} className="flex-1 py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-all">Cancel</button>
                            <button id="SaveBtn" disabled={loading} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 transition-all flex justify-center items-center gap-2">
                                {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <QuickCreateModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                type={modalState.type}
                onSuccess={handleQuickCreateSuccess}
                initialType={formData.type}
            />
        </div>
    );
};

export default function EditTransactionPage() {
    return <ProtectedRoute><EditTransactionContent /></ProtectedRoute>;
}

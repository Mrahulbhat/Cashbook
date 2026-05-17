'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader, HandCoins } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useAccountStore } from "@/store/useAccountStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useIouStore } from "@/store/useIouStore";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import QuickCreateModal from "@/components/QuickCreateModal";

const AddTransactionContent = () => {
    const router = useRouter();
    const { addTransaction, loading: transLoading } = useTransactionStore();
    const { accounts, fetchAccounts, loading: accLoading } = useAccountStore();
    const { categories, loadCategories, loading: catLoading } = useCategoryStore();
    const { addIou } = useIouStore();

    const [formData, setFormData] = useState({
        amount: "",
        type: "expense",
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        account: "",
    });

    const [iouEnabled, setIouEnabled] = useState(false);
    const [iouFriend, setIouFriend] = useState("");
    const [iouAmountToGetBack, setIouAmountToGetBack] = useState("");

    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'account',
    });

    useEffect(() => {
        fetchAccounts();
        loadCategories();
    }, [fetchAccounts, loadCategories]);

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

    const handleQuickCreateSuccess = (id, type) => {
        if (type === 'account') {
            setFormData(prev => ({ ...prev, account: id }));
        } else if (type === 'category') {
            setFormData(prev => ({ ...prev, category: id }));
        }
    };

    const submitTransaction = async () => {
        // Derive defaults if not explicitly selected
        const defaultAccount = accounts.find(acc => acc.isDefault);
        const accountToUse = formData.account || (defaultAccount ? defaultAccount._id : "");
        
        const defaultCategory = categories.find(cat => cat.isDefault && cat.type === formData.type);
        const categoryToUse = formData.category || (defaultCategory ? defaultCategory._id : "");

        if (!formData.amount || !categoryToUse || !accountToUse) {
            toast.error("Please fill in all required fields");
            return null;
        }
        if (iouEnabled) {
            if (!iouFriend.trim()) {
                toast.error("Please enter your friend's name");
                return null;
            }
            if (!iouAmountToGetBack || parseFloat(iouAmountToGetBack) <= 0) {
                toast.error("Please enter a valid amount to get back");
                return null;
            }
        }

        const result = await addTransaction({
            ...formData,
            account: accountToUse,
            category: categoryToUse,
            amount: parseFloat(formData.amount),
            date: new Date(formData.date),
        });

        if (result) {
            // If user marked this as paid-for-friend, create IOU
            if (iouEnabled && iouFriend.trim()) {
                await addIou({
                    friendName: iouFriend.trim(),
                    amount: parseFloat(iouAmountToGetBack),
                    description: formData.description || `Paid for ${iouFriend.trim()}`,
                    date: new Date(formData.date),
                    linkedTransactionId: result._id,
                });
            }
            return result;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await submitTransaction();
        if (result) {
            router.push("/transactions");
        }
    };

    const handleSaveAndAnother = async () => {
        const result = await submitTransaction();
        if (result) {
            toast.success("Transaction saved!");
            // Reset form but KEEP date
            setFormData(prev => ({
                amount: "",
                type: prev.type,
                description: "",
                category: "",
                date: prev.date, // KEEP DATE
                account: prev.account, // Keep account for convenience
            }));
            // Also reset IOU state
            setIouFriend("");
            setIouAmountToGetBack("");
            setIouEnabled(false);
        }
    };

    const filteredCategories = categories.filter(cat => cat.type === formData.type);

    const defaultAccount = accounts.find(acc => acc.isDefault);
    const accountToUse = formData.account || (defaultAccount ? defaultAccount._id : "");

    const defaultCategory = categories.find(cat => cat.isDefault && cat.type === formData.type);
    const categoryToUse = formData.category || (defaultCategory ? defaultCategory._id : "");

    const isLoading = accLoading || catLoading || transLoading;

    return (
        <div className="min-h-screen bg-black p-4 pb-20 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
                <button id="BackBtn" onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-green-600 rounded-lg"><Plus className="text-white" /></div>
                        <h1 className="text-2xl font-bold text-white">Add Transaction</h1>
                    </div>

                    <form id="AddTransactionForm" onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-4">
                            {['income', 'expense', 'investment'].map(t => (
                                <label key={t} className="flex items-center gap-2 cursor-pointer capitalize text-gray-300">
                                    <input id={`TypeRadio-${t}`} type="radio" name="type" value={t} checked={formData.type === t} onChange={handleInputChange} className="accent-green-500" />
                                    {t}
                                </label>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Amount *</label>
                            <input
                                id="AmountInput"
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
                                <label className="block text-sm font-semibold text-gray-400 mb-2">
                                    Account * {defaultAccount && <span className="text-xs text-green-400 font-normal">(Auto-selected default: {defaultAccount.name})</span>}
                                </label>
                                <select id="AccountDropdown" name="account" value={accountToUse} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white" required>
                                    <option value="">Select Account</option>
                                    <optgroup label="Actions">
                                        <option value="ADD_NEW_ACCOUNT">+ Add New Account</option>
                                    </optgroup>
                                    <optgroup label="Existing Accounts">
                                        {accounts.map(acc => <option key={acc._id} value={acc._id}>{acc.name}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">
                                    Category * {defaultCategory && <span className="text-xs text-green-400 font-normal">(Auto-selected default: {defaultCategory.name})</span>}
                                </label>
                                <select id="CategoryDropdown" name="category" value={categoryToUse} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white" required>
                                    <option value="">Select Category</option>
                                    <optgroup label="Actions">
                                        <option value="ADD_NEW_CATEGORY">+ Add New Category</option>
                                    </optgroup>
                                    <optgroup label="Existing Categories">
                                        {filteredCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Date *</label>
                            <input id="DateInput" type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white" required />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Description</label>
                            <textarea id="DescriptionInput" name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white resize-none" />
                        </div>

                        {/* IOU Toggle — only show for expense */}
                        {formData.type === 'expense' && (
                            <div className={`rounded-2xl border p-4 transition-all duration-300 ${iouEnabled ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-gray-700 bg-gray-800/40'}`}>
                                <label id="IouToggleLabel" className="flex items-center gap-3 cursor-pointer select-none">
                                    <div
                                        id="IouToggle"
                                        onClick={() => setIouEnabled(v => !v)}
                                        className={`w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0 ${iouEnabled ? 'bg-yellow-500' : 'bg-gray-700'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${iouEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HandCoins size={16} className={iouEnabled ? 'text-yellow-400' : 'text-gray-500'} />
                                        <span className={`text-sm font-semibold ${iouEnabled ? 'text-yellow-300' : 'text-gray-400'}`}>
                                            Paid for a friend?
                                        </span>
                                    </div>
                                </label>
                                {iouEnabled && (
                                    <div className="mt-3 animate-in slide-in-from-top-1 duration-200">
                                        <p className="text-xs text-yellow-600 mb-2">An IOU will be created — they owe you this amount.</p>
                                        <div className="space-y-2">
                                            <input
                                                id="IouFriendName"
                                                type="text"
                                                value={iouFriend}
                                                onChange={e => setIouFriend(e.target.value)}
                                                placeholder="Friend's name (e.g. Priya)"
                                                className="w-full px-4 py-2.5 bg-gray-900 border border-yellow-500/40 rounded-lg focus:outline-none focus:border-yellow-400 text-white text-sm placeholder-gray-600"
                                            />
                                            <input
                                                id="IouAmountToGetBack"
                                                type="number"
                                                value={iouAmountToGetBack}
                                                onChange={e => setIouAmountToGetBack(e.target.value)}
                                                placeholder="Amount I have to get back"
                                                className="w-full px-4 py-2.5 bg-gray-900 border border-yellow-500/40 rounded-lg focus:outline-none focus:border-yellow-400 text-white text-sm placeholder-gray-600"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button id="CancelBtn" type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                            <button id="SaveBtn" type="submit" disabled={isLoading} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-500 flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
                                {isLoading ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />} Save & Go Back
                            </button>
                            <button id="SaveAndAnotherBtn" type="button" onClick={handleSaveAndAnother} disabled={isLoading} className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-500 flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
                                {isLoading ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />} Save & Add Another
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

export default function AddTransactionPage() {
    return (
        <ProtectedRoute>
            <AddTransactionContent />
        </ProtectedRoute>
    );
}

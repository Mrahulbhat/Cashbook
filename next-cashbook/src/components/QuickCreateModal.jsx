import React, { useState } from 'react';
import { X, Plus, Loader, Wallet, Tag } from 'lucide-react';
import { useAccountStore } from '@/store/useAccountStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import toast from 'react-hot-toast';

const QuickCreateModal = ({ isOpen, onClose, type, onSuccess, initialType = 'expense' }) => {
    const { addAccount, loading: accLoading } = useAccountStore();
    const { createCategory, loading: catLoading } = useCategoryStore();

    const [accountData, setAccountData] = useState({ name: '', balance: '' });
    const [categoryData, setCategoryData] = useState({
        name: '',
        type: initialType,
        parentCategory: 'Needs',
        budget: '',
    });

    const parentCategories = ["Needs", "Wants", "Savings/Investment", "Income", "System"];

    if (!isOpen) return null;

    const handleAccountSubmit = async (e) => {
        e.preventDefault();
        if (!accountData.name || accountData.balance === '') {
            toast.error("Please fill in all fields");
            return;
        }
        const newAcc = await addAccount({
            name: accountData.name,
            balance: parseFloat(accountData.balance),
        });
        if (newAcc) {
            onSuccess(newAcc._id, 'account');
            onClose();
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if (!categoryData.name) {
            toast.error("Category name is required");
            return;
        }
        try {
            const newCat = await createCategory({
                ...categoryData,
                budget: categoryData.budget ? parseFloat(categoryData.budget) : undefined,
            });
            if (newCat) {
                onSuccess(newCat._id, 'category');
                onClose();
            }
        } catch (error) {
            // Error handled by store
        }
    };

    const isLoading = accLoading || catLoading;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        {type === 'account' ? (
                            <><Wallet className="text-blue-500" size={24} /> Quick Add Account</>
                        ) : (
                            <><Tag className="text-purple-500" size={24} /> Quick Add Category</>
                        )}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {type === 'account' ? (
                        <form id="QuickAddAccountForm" onSubmit={handleAccountSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Account Name</label>
                                <input
                                    id="QuickAccName"
                                    type="text"
                                    value={accountData.name}
                                    onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                                    placeholder="e.g. Cash, Savings"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Initial Balance</label>
                                <input
                                    id="QuickAccBalance"
                                    type="number"
                                    value={accountData.balance}
                                    onChange={(e) => setAccountData({ ...accountData, balance: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-white"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-900/20"
                            >
                                {isLoading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />} Create Account
                            </button>
                        </form>
                    ) : (
                        <form id="QuickAddCategoryForm" onSubmit={handleCategorySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Category Name</label>
                                <input
                                    id="QuickCatName"
                                    type="text"
                                    value={categoryData.name}
                                    onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                                    placeholder="e.g. Food, Salary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Parent Category</label>
                                <select
                                    id="QuickCatParent"
                                    value={categoryData.parentCategory}
                                    onChange={(e) => setCategoryData({ ...categoryData, parentCategory: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                                >
                                    {parentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-purple-900/20"
                            >
                                {isLoading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />} Create Category
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickCreateModal;

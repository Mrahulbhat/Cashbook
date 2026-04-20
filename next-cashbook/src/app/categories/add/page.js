'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Loader, Tag } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const AddCategoryContent = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "expense",
        budget: "",
        planningBucket: "None",
        yearlyBudget: "",
    });
    const [budgetType, setBudgetType] = useState("monthly"); // "monthly" or "yearly"



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Category name is required");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post("/categories", {
                ...formData,
                budget: budgetType === 'monthly' && formData.budget ? parseFloat(formData.budget) : 0,
                yearlyBudget: budgetType === 'yearly' && formData.yearlyBudget ? parseFloat(formData.yearlyBudget) : 0,
            });
            toast.success("Category created successfully!");
            router.push("/categories");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black p-4 pb-20 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
                <button id="BackBtn" onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-purple-600 rounded-lg"><Tag className="text-white" /></div>
                        <h1 className="text-2xl font-bold text-white">Add New Category</h1>
                    </div>

                    <form id="AddCategoryForm" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Category Name *</label>
                            <input
                                id="NameInput"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-3">Type *</label>
                            <div className="flex gap-4">
                                {['income', 'expense'].map(t => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer capitalize text-gray-300">
                                        <input id={`TypeRadio-${t}`} type="radio" name="type" value={t} checked={formData.type === t} onChange={handleInputChange} className="accent-purple-500" />
                                        {t}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 space-y-6">
                            <div className="flex p-1 bg-black rounded-xl border border-gray-800">
                                <button 
                                    type="button"
                                    onClick={() => setBudgetType('monthly')}
                                    className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${budgetType === 'monthly' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Monthly Budget
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setBudgetType('yearly')}
                                    className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${budgetType === 'yearly' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Yearly Budget
                                </button>
                            </div>

                            {budgetType === 'monthly' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Monthly Limit (INR)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input
                                            id="BudgetInput"
                                            type="number"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white font-bold text-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2 px-1">Calculates progress based on a fixed amount each month.</p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Total Yearly Limit (INR)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input
                                            id="YearlyBudgetInput"
                                            type="number"
                                            name="yearlyBudget"
                                            value={formData.yearlyBudget}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-white font-bold text-lg"
                                            placeholder="36000"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2 px-1">Smart Tracking: Automatically adjusts monthly targets based on remaining budget and months left.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Planning Bucket</label>
                            <select
                                id="PlanningBucketDropdown"
                                name="planningBucket"
                                value={formData.planningBucket}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            >
                                {['None', 'Needs', 'Wants', 'Short Term', 'Long Term'].map(bucket => (
                                    <option key={bucket} value={bucket}>{bucket}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Track this category against your targets in the Planning section.</p>
                        </div>

                        <div className="flex gap-4">
                            <button id="CancelBtn" type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                            <button id="SaveBtn" type="submit" disabled={loading} className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-500 flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
                                {loading ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />} Create Category
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function AddCategoryPage() {
    return (
        <ProtectedRoute>
            <AddCategoryContent />
        </ProtectedRoute>
    );
}

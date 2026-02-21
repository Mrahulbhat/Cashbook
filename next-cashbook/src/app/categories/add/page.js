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
        parentCategory: "Needs",
        budget: "",
    });

    const parentCategories = ["Needs", "Wants", "Savings/Investment", "Income", "System"];

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
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
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
                <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-purple-600 rounded-lg"><Tag className="text-white" /></div>
                        <h1 className="text-2xl font-bold text-white">Add New Category</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Category Name *</label>
                            <input
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
                                        <input type="radio" name="type" value={t} checked={formData.type === t} onChange={handleInputChange} className="accent-purple-500" />
                                        {t}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Parent Category *</label>
                            <select
                                name="parentCategory"
                                value={formData.parentCategory}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            >
                                {parentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Monthly Budget (Optional)</label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Cancel</button>
                            <button type="submit" disabled={loading} className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-500 flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
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

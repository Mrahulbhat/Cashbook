'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, Loader } from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const CategoriesContent = () => {
    const router = useRouter();
    const { categories, loading, loadCategories, deleteCategory } = useCategoryStore();
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            await deleteCategory(id);
        }
    };

    const filteredCategories = filter === "all"
        ? categories
        : categories.filter(cat => cat.type.toLowerCase() === filter.toLowerCase());

    if (loading && categories.length === 0) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <Loader className="w-12 h-12 animate-spin text-purple-400" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black overflow-hidden p-4 sm:p-8">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto pb-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Categories</h1>
                        <p className="text-gray-400">Organize your income and expenses</p>
                    </div>
                    <button
                        onClick={() => router.push("/categories/add")}
                        className="mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-transform transform hover:scale-105"
                    >
                        <Plus size={18} /> Add Category
                    </button>
                </div>

                <div className="mb-8 flex gap-3">
                    {['all', 'income', 'expense'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-lg capitalize transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((category) => (
                        <div key={category._id} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{category.name}</h3>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${category.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {category.type}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => router.push(`/categories/edit/${category._id}`)} className="p-2 hover:bg-blue-500/20 rounded-lg">
                                        <Edit2 className="w-4 h-4 text-blue-400" />
                                    </button>
                                    <button onClick={() => handleDelete(category._id)} className="p-2 hover:bg-red-500/20 rounded-lg">
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                            {category.budget && (
                                <div className="pt-3 border-t border-gray-700/30">
                                    <p className="text-gray-400 text-xs">Budget: <span className="text-white font-bold">₹{category.budget}</span></p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredCategories.length === 0 && (
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-16 text-center">
                        <p className="text-gray-400 text-lg mb-6">No categories found</p>
                        <button onClick={() => router.push("/categories/add")} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl inline-flex items-center gap-2">
                            <Plus size={18} /> Create Category
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function CategoriesPage() {
    return (
        <ProtectedRoute>
            <CategoriesContent />
        </ProtectedRoute>
    );
}

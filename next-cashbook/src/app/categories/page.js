'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Folder, Trash2, Loader } from "lucide-react";
import { useCategoryStore } from "@/store/useCategoryStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";

const CategoriesContent = () => {
    const router = useRouter();
    const { categories, loading, loadCategories, deleteCategory } = useCategoryStore();
    const [filter, setFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const handleDelete = (id) => {
        setSelectedCategoryId(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedCategoryId) {
            await deleteCategory(selectedCategoryId);
            setSelectedCategoryId(null);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCategories.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredCategories.map((c) => c._id));
        }
    };

    const handleConfirmBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        for (const id of selectedIds) {
            await deleteCategory(id);
        }
        setSelectedIds([]);
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
                        id="AddBtn"
                        onClick={() => router.push("/categories/add")}
                        className="mt-4 sm:mt-0 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-transform transform hover:scale-105"
                    >
                        <Plus size={18} /> Add Category
                    </button>
                </div>

                <div className="mb-8 flex gap-3">
                    {['all', 'income', 'expense'].map(f => (
                        <button
                            id={`FilterBtn-${f}`}
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-lg capitalize transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="mb-6 flex items-center justify-start gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            id="AddBtnSmall"
                            onClick={() => router.push("/categories/add")}
                            className="bg-white text-orange-600 border border-orange-400 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-orange-50"
                        >
                            <Plus size={16} className="text-orange-500" />
                            <span className="text-orange-600">Add</span>
                        </button>

                        <button
                            id="BulkDeleteBtn"
                            onClick={() => setIsBulkModalOpen(true)}
                            disabled={selectedIds.length === 0}
                            className={`bg-white text-orange-600 border border-orange-400 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <Trash2 size={16} className="text-orange-500" />
                            <span className="text-orange-600">Delete</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto bg-gray-900/30 border border-gray-800 rounded-2xl p-4">
                    <table className="w-full table-auto text-center border-collapse border border-gray-800">
                        <thead>
                            <tr className="text-gray-400 text-sm">
                                <th className="w-10 py-1 px-2 border border-gray-800">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={filteredCategories.length > 0 && selectedIds.length === filteredCategories.length}
                                        aria-label="Select all categories"
                                    />
                                </th>
                                <th className="w-10 py-1 px-2 border border-gray-800">Actions</th>
                                <th className="py-3 border border-gray-800">Category Name</th>
                                <th className="py-3 border border-gray-800">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-800/20">
                                    <td className="w-10 py-1 px-2 border border-gray-800">
                                                <input
                                                    type="checkbox"
                                                    className="accent-orange-500 border-orange-400"
                                                    checked={selectedIds.includes(category._id)}
                                                    onChange={() => toggleSelect(category._id)}
                                                    aria-label={`Select ${category.name}`}
                                                />
                                    </td>
                                    <td className="w-10 py-1 px-2 border border-gray-800">
                                        <div className="flex items-center gap-1 justify-center">
                                            <button id="EditBtn" onClick={() => router.push(`/categories/edit/${category._id}`)} className="p-1 hover:bg-orange-50 rounded-md">
                                                <Folder className="w-4 h-4 text-orange-500" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 border border-gray-800">
                                        <div className="text-white font-semibold">{category.name}</div>
                                    </td>
                                    <td className="py-4 border border-gray-800">
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${category.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {category.type}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCategories.length === 0 && (
                    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-16 text-center">
                        <p className="text-gray-400 text-lg mb-6">No categories found</p>
                        <button id="AddBtn" onClick={() => router.push("/categories/add")} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl inline-flex items-center gap-2">
                            <Plus size={18} /> Create Category
                        </button>
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Category"
                    message="Are you sure you want to delete this category? All transactions in this category will be preserved but uncategorized."
                    confirmText="Delete"
                    type="danger"
                />
                <Modal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    onConfirm={handleConfirmBulkDelete}
                    title="Delete Selected Categories"
                    message={`Are you sure you want to delete ${selectedIds.length} selected category(s)?`}
                    confirmText="Delete"
                    type="danger"
                />
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

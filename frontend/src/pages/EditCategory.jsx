import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { useCategoryStore } from "../store/useCategoryStore";
import toast from "react-hot-toast";

const EditCategory = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { categories, getCategoryById, updateCategory, loading } = useCategoryStore();

    const [formData, setFormData] = useState({
        name: "",
        type: "expense",
        parentCategory: "",
        budget: "",
    });

    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const category = getCategoryById(id);
        if (!category) {
            toast.error("Category not found");
            navigate("/categories");
            return;
        }

        setFormData({
            name: category.name,
            type: category.type,
            parentCategory: category.parentCategory || "",
            budget: category.budget || "",
        });

        setLoadingData(false);
    }, [id, getCategoryById, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateCategory(id, {
                ...formData,
                budget: formData.budget ? Number(formData.budget) : undefined,
            });
            navigate("/categories");
        } catch (err) {
            toast.error("Failed to update category");
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex justify-center items-center">
                <div className="text-center space-y-4">
                    <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto" />
                    <p className="text-white text-lg">Loading category...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 p-4 pb-20">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 mb-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-purple-500/30 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
                >
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Card */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-white via-gray-50 to-white text-black rounded-3xl shadow-2xl p-8 border border-gray-200/50 backdrop-blur-sm">
                        <h1 className="text-3xl font-bold mb-6">Edit Category</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Type *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>

                            {/* Parent Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Parent Category
                                </label>
                                <div>
                                    <select
                                        name="parentCategory"
                                        value={formData.parentCategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="">None</option>

                                        {categories
                                            .filter(
                                                (cat) =>
                                                    cat.type === formData.type && cat._id !== id
                                            )
                                            .map((cat) => (
                                                <option key={cat._id} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Monthly Budget
                                </label>
                                <input
                                    type="number"
                                    name="budget"
                                    min="0"
                                    step="0.01"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "Update Category"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCategory;

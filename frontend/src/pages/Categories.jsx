import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import ModalContent from "../components/ModalContent";

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/category");
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/category/${selectedCategoryId}`);
      toast.success("Category deleted successfully");
      setShowConfirm(false);
      setSelectedCategoryId(null);
      await loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const filteredCategories =
    filter === "all"
      ? categories
      : categories.filter(
          (cat) => cat.type.toLowerCase() === filter.toLowerCase()
        );

  const incomeCount = categories.filter(
    (c) => c.type.toLowerCase() === "income"
  ).length;

  const expenseCount = categories.filter(
    (c) => c.type.toLowerCase() === "expense"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden p-4 sm:p-8 pb-20">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Categories
            </h1>
            <p className="text-gray-400">
              Organize your income and expenses
            </p>
          </div>
          <button
            id="addCategoryBtn"
            onClick={() => navigate("/addCategory")}
            className="mt-4 sm:mt-0 group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-gray-400 text-sm font-semibold">
              Total Categories
            </p>
            <p
              id="totalCategoryCount"
              className="text-3xl font-bold text-white mt-1"
            >
              {categories.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-green-400 text-sm font-semibold">
              Income Categories
            </p>
            <p
              id="totalIncomeCategoryCount"
              className="text-3xl font-bold text-white mt-1"
            >
              {incomeCount}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-red-400 text-sm font-semibold">
              Expense Categories
            </p>
            <p
              id="totalExpenseCategoryCount"
              className="text-3xl font-bold text-white mt-1"
            >
              {expenseCount}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              filter === "all"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              filter === "income"
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
              filter === "expense"
                ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Expense
          </button>
        </div>

        <ModalContent
          open={showConfirm}
          title="Delete Category"
          message="Are you sure you want to delete this category?"
          onCancel={() => {
            setShowConfirm(false);
            setSelectedCategoryId(null);
          }}
          onConfirm={handleDelete}
        />

        {/* Categories Grid / Loader / Empty State */}
        {loading ? null : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                id={`categoryDiv${category.name}`}
                key={category._id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {category.name}
                    </h3>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        category.type.toLowerCase() === "income"
                          ? "bg-green-100/20 text-green-400"
                          : "bg-red-100/20 text-red-400"
                      }`}
                    >
                      {category.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="editBtn"
                      onClick={() =>
                        navigate(`/edit-category/${category._id}`)
                      }
                      className="p-2 hover:bg-blue-100/10 rounded-lg transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      id="deleteBtn"
                      onClick={() => {
                        setSelectedCategoryId(category._id);
                        setShowConfirm(true);
                      }}
                      className="p-2 hover:bg-red-100/10 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {category.budget && (
                  <div className="bg-white/5 rounded-lg p-3 mb-3">
                    <p className="text-gray-400 text-xs mb-1">
                      Monthly Budget
                    </p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(category.budget)}
                    </p>
                  </div>
                )}

                {category.parentCategory && (
                  <div className="pt-3 border-t border-gray-600/30">
                    <p className="text-gray-400 text-xs">
                      Parent:{" "}
                      <span className="text-gray-300 font-medium">
                        {category.parentCategory}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-2xl p-16 text-center backdrop-blur-sm">
            <div className="mb-6 text-5xl">📂</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No Categories Yet
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create categories to organize your transactions by type.
            </p>
            <button
              onClick={() => navigate("/addCategory")}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <Plus className="w-5 h-5" />
              Create Your First Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

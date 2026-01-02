import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader, Tag } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AddCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    parentCategory: "",
    budget: "",
  });

  const parentCategories = [
    "Needs",
    "Wants",
    "Savings/Investment",
    "Income",
    "System"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.type || !formData.parentCategory) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const categoryData = {
        name: formData.name,
        type: formData.type,
        parentCategory: formData.parentCategory,
        budget: formData.budget || undefined,
      };

      const response = await axiosInstance.post("/category/new", categoryData);

      toast.success("Category created successfully!");

      // Reset form
      setFormData({
        name: "",
        type: "expense",
        parentCategory: "",
        budget: "",
      });

      // Navigate back after success
      setTimeout(() => {
        navigate("/categories");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create category"
      );
      console.error("Error creating category:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        {/* Back button */}
        <button
        id="BackBtn"
          className="group flex items-center gap-3 ml-2 mb-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-purple-500/30 text-white px-6 py-3 rounded-xl hover:from-purple-600/20 hover:to-pink-600/20 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back</span>
        </button>

        {/* Main form card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-white via-gray-50 to-white text-black rounded-3xl shadow-2xl p-8 border border-gray-200/50 backdrop-blur-sm">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Add New Category
                </h1>
              </div>
              <p className="text-gray-600 ml-14">
                Create a category for organizing your transactions
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  id="categoryNameInputField"
                  type="text"
                  name="name"
                  placeholder="e.g., Groceries, Salary, Rent"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-400"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  Give your category a clear, descriptive name
                </p>
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="incomeCheckbox"
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === "income"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-500 cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium">Income</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="expenseCheckbox"
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === "expense"}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-red-500 cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium">Expense</span>
                  </label>
                </div>
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parent Category *
                </label>
                <select
                  id="parentCategoryDropdown"
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-400"
                  required
                >
                  <option value="">Select a parent category</option>
                  {parentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-gray-500 text-xs mt-1">
                  Choose a parent category to organize this category
                </p>
              </div>

              {/* Budget (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monthly Budget (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-600 font-semibold">
                    ₹
                  </span>
                  <input
                    id="budgetInputField"
                    type="number"
                    name="budget"
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-400"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Set a budget limit for this category (leave empty for no limit)
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <span className="font-semibold">💡 Tip:</span> Categories help
                  you organize and track spending by type. You can create as many
                  as you need.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  id="saveBtn"
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create Category</span>
                    </>
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

export default AddCategory;

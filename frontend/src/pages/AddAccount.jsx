import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader, Wallet } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AddAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    balance: "",
  });

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
    if (!formData.name || formData.balance === "") {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.balance) < 0) {
      toast.error("Balance cannot be negative");
      return;
    }

    setLoading(true);

    try {
      const accountData = {
        name: formData.name,
        balance: parseFloat(formData.balance),
      };

      const response = await axiosInstance.post("/account/new", accountData);

      toast.success("Account created successfully!");

      // Reset form
      setFormData({
        name: "",
        balance: "",
      });

      // Navigate back after success
      setTimeout(() => {
        navigate("/accounts");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create account"
      );
      console.error("Error creating account:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        {/* Back button */}
        <button
          id="BackBtn"
          className="group flex items-center gap-3 ml-2 mb-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-blue-500/30 text-white px-6 py-3 rounded-xl hover:from-blue-600/20 hover:to-cyan-600/20 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
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
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Add New Account
                </h1>
              </div>
              <p className="text-gray-600 ml-14">
                Create a new bank or savings account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Name *
                </label>
                <input
                  id="accountNameInputField"
                  type="text"
                  name="name"
                  placeholder="e.g., Savings Account, Checking Account"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  Give your account a descriptive name
                </p>
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Initial Balance *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-600 font-semibold">
                    ₹
                  </span>
                  <input
                    id="balanceInputField"
                    type="number"
                    name="balance"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Enter the current balance in your account
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Tip:</span> You can update
                  the balance anytime by adding transactions. Start with your
                  current account balance.
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
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create Account</span>
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

export default AddAccount;

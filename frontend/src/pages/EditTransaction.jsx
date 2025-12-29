import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Loader } from "lucide-react";
import { useTransactionStore } from "../store/useTransactionStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const EditTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateTransaction, loading } = useTransactionStore();

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [transaction, setTransaction] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    description: "",
    category: "",
    date: "",
    account: "",
  });

  // Fetch accounts, categories, and transaction data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, categoriesRes, transactionRes] = await Promise.all([
          axiosInstance.get("/account"),
          axiosInstance.get("/category"),
          axiosInstance.get(`/transaction/${id}`),
        ]);
        setAccounts(accountsRes.data);
        setCategories(categoriesRes.data);

        const trans = transactionRes.data;
        setTransaction(trans);

        // Format date for input
        const formattedDate = trans.date.split("T")[0];

        setFormData({
          amount: trans.amount,
          type: trans.type,
          description: trans.description || "",
          category: trans.category,
          date: formattedDate,
          account: trans.account._id,
        });
      } catch (error) {
        toast.error("Failed to load transaction or data");
        console.error("Error fetching data:", error);
        setTimeout(() => navigate(-1), 1500);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type,
      category: "", // Reset category when type changes
    }));
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type.toLowerCase() === formData.type.toLowerCase()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.amount || !formData.type || !formData.category || !formData.account || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description || undefined,
        category: formData.category,
        date: new Date(formData.date),
        account: formData.account,
      };

      await updateTransaction(id, transactionData);

      // Navigate back
      setTimeout(() => {
        navigate("/transactions");
      }, 1000);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  // Determine if all required fields are valid
  const isFormValid = Boolean(
    formData.amount &&
    !isNaN(parseFloat(formData.amount)) &&
    parseFloat(formData.amount) > 0 &&
    formData.type &&
    formData.category &&
    formData.account &&
    formData.date
  );

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex justify-center items-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin text-green-400 mx-auto" />
          <p className="text-white text-lg">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex justify-center items-center">
        <div className="text-center space-y-4">
          <p className="text-white text-lg">Transaction not found</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        {/* Back button */}
        <button id="BackBtn"
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
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Edit Transaction
                </h1>
              </div>
              <p className="text-gray-600 ml-14">Update transaction details</p>
            </div>

            {/* Form */}
            <form id="editTransactionForm" onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Transaction Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="incomeRadioBox"
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === "income"}
                      onChange={handleTypeChange}
                      className="w-4 h-4 text-green-500 cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium">Income</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="expenseRadioBox"
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === "expense"}
                      onChange={handleTypeChange}
                      className="w-4 h-4 text-red-500 cursor-pointer"
                    />
                    <span className="text-gray-700 font-medium">Expense</span>
                  </label>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  id="AmountInputField"
                  type="number"
                  name="amount"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                  required
                />
              </div>

              {/* Account */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account *
                </label>
                <select
                  id="accountDropdown"
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                  required
                >
                  <option value="">Select an account</option>
                  {accounts.map((acc) => (
                    <option id="accountDropdownOptions" key={acc._id} value={acc._id}>
                      {acc.name} (₹{acc.balance})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  id="categoryDropdown"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                  required
                >
                  <option value="">Select a category</option>
                  {filteredCategories.map((cat) => (
                    <option id="categoryDropdownOptions" key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="dateInputField"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="descriptionInputField"
                  name="description"
                  placeholder="Add any notes about this transaction..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  id="cancelBtn"
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  id="updateBtn"
                  type="submit"
                  disabled={loading || isFormValid}
                  aria-disabled={loading || !isFormValid}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Update Transaction</span>
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

export default EditTransaction;

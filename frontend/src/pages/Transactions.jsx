import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Loader, ArrowUpRight, ArrowDownLeft, Divide } from "lucide-react";
import { useTransactionStore } from "../store/useTransactionStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Transactions = () => {
  const navigate = useNavigate();
  const { transactions, fetchTransactions, deleteTransaction, deleteAllTransactions, deleteTestTransactions } =
    useTransactionStore();
  const [filter, setFilter] = useState("monthly");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchTransactions();
  };

  const getFilteredTransactions = () => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    let filtered = transactions;

    if (filter === "monthly") {
      filtered = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return (
          transDate.getMonth() === now.getMonth() &&
          transDate.getFullYear() === now.getFullYear()
        );
      });
    } else if (filter === "yearly") {
      filtered = transactions.filter((t) => {
        const transDate = new Date(t.date);
        return transDate.getFullYear() === now.getFullYear();
      });
    }

    return filtered;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
      await loadData();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredTransactions = [...getFilteredTransactions()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      "This will permanently delete ALL transactions. Are you sure?"
    );

    if (!confirmed) return;

    await deleteAllTransactions();
    await loadData();
  };

  const handleDeleteTestTransactions = async () => {
    const confirmed = window.confirm(
      "This will permanently delete ALL transactions. Are you sure?"
    );

    if (!confirmed) return;

    await deleteTestTransactions();
    await loadData();
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden p-4 sm:p-8 pb-20">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Transactions</h1>
            <p className="text-gray-400">Manage and view all your transactions</p>
          </div>
          <button id="addTransactionBtn"
            onClick={() => navigate("/addTransaction")}
            className="mt-4 sm:mt-0 group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button id="monthlyFilterBtn"
            onClick={() => setFilter("monthly")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "monthly"
              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            Monthly
          </button>
          <button id="yearlyFilterBtn"
            onClick={() => setFilter("yearly")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "yearly"
              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            Yearly
          </button>
          <button id="lifetimeFilterBtn"
            onClick={() => setFilter("lifetime")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "lifetime"
              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            Lifetime
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6">
            <h2 className="text-white text-2xl font-bold">All Transactions</h2>
            <p id="txnCount" className="text-gray-400 text-sm mt-1">
              {filteredTransactions.length} transaction(s) ({filter})
            </p>
          </div>

          {/* Table Content */}
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table data-testid="resultsTable" className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Account
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="tablebody border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {/* Type */}
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          {transaction.type.toLowerCase() === "income" ? (
                            <div className="p-2 bg-green-100 rounded-lg">
                              <ArrowDownLeft className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="p-2 bg-red-100 rounded-lg">
                              <ArrowUpRight className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                          <span className="font-semibold text-gray-800 capitalize">
                            {transaction.type}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-8 py-4">
                        <span
                          className={`font-bold text-lg ${transaction.type.toLowerCase() === "income"
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                        >
                          {transaction.type.toLowerCase() === "income"
                            ? "+"
                            : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-8 py-4">
                        <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                          {transaction.category?.name || "N/A"}
                        </span>
                      </td>

                      {/* Account */}
                      <td className="px-8 py-4">
                        <span className="text-gray-700 font-medium">
                          {transaction.account?.name || "N/A"}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-8 py-4 text-gray-700 max-w-xs truncate">
                        {transaction.description || "-"}
                      </td>

                      {/* Date */}
                      <td className="px-8 py-4 text-gray-700">
                        {formatDate(transaction.date)}
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-4">
                        <div className="flex gap-2">
                          <button
                            id="editRecordBtn"
                            onClick={() =>
                              navigate(`/edit-transaction/${transaction._id}`)
                            }
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleDeleteTestTransactions}>
                Delete Test Transactions
              </button>

              <button onClick={handleDeleteAll}>
                Delete All Transactions
              </button>

            </div>

          ) : (
            <div className="px-8 py-16 text-center">
              <div className="mb-4 text-5xl">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first transaction to get started.
              </p>
              <button
                onClick={() => navigate("/addTransaction")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add First Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;

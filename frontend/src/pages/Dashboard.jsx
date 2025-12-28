import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader, ArrowUpRight, ArrowDownLeft, Trash2, Edit2 } from "lucide-react";
import { useTransactionStore } from "../store/useTransactionStore";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { transactions, fetchTransactions, deleteTransaction, loading } =
    useTransactionStore();
  const [lastTransactions, setLastTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    await fetchTransactions();
  };

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Sort by date (most recent first) and get last 5
      const sorted = [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setLastTransactions(sorted.slice(0, 5));

      // Calculate stats
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach((t) => {
        const amount = Number(t.amount);
        if (t.type.toLowerCase() === "income") {
          totalIncome += amount;
        } else if (t.type.toLowerCase() === "expense") {
          totalExpense += amount;
        }
      });

      setStats({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      });
    } else {
      setLastTransactions([]);
      setStats({ totalIncome: 0, totalExpense: 0, balance: 0 });
    }
  }, [transactions]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
      await loadTransactions();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-400">Manage your finances at a glance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 font-semibold text-sm">
                  Total Income
                </h3>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <ArrowDownLeft className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>

            {/* Total Expense */}
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-red-400 font-semibold text-sm">
                  Total Expense
                </h3>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>

            {/* Balance */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-400 font-semibold text-sm">Balance</h3>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(stats.balance)}
              </p>
            </div>
          </div>

          {/* Add Transaction Button */}
          <div className="mb-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/addTransaction")}
              className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 border border-green-500/20"
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span>Add New Transaction</span>
            </button>

            <button
              onClick={() => navigate("/addAccount")}
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 border border-blue-500/20"
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span>Add Account</span>
            </button>

            <button
              onClick={() => navigate("/addCategory")}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 border border-purple-500/20"
            >
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span>Add Category</span>
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6">
              <h2 className="text-white text-2xl font-bold">Recent Transactions</h2>
              <p className="text-gray-400 text-sm mt-1">
                {lastTransactions.length > 0
                  ? `Last ${lastTransactions.length} transactions`
                  : "No transactions yet"}
              </p>
            </div>

            {/* Table Content */}
            {lastTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
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
                        Date
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastTransactions.map((transaction, index) => (
                      <tr
                        key={transaction._id}
                        className="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
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
                            className={`font-bold text-lg ${
                              transaction.type.toLowerCase() === "income"
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
                            {transaction.category}
                          </span>
                        </td>

                        {/* Account */}
                        <td className="px-8 py-4">
                          <span className="text-gray-700 font-medium">
                            {transaction.account?.name || "N/A"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-8 py-4 text-gray-700">
                          {formatDate(transaction.date)}
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/edit-transaction/${transaction._id}`
                                )
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
              </div>
            ) : (
              <div className="px-8 py-16 text-center">
                <div className="mb-4 text-5xl">📊</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Transactions Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your finances by adding your first transaction.
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
    </div>
  );
};

export default Dashboard;

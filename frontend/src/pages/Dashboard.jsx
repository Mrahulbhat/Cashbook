import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader, ArrowUpRight, ArrowDownLeft, Trash2, Edit2 } from "lucide-react";
import { useTransactionStore } from "../store/useTransactionStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { transactions, fetchTransactions, deleteTransaction, loading } =
    useTransactionStore();
  const [accounts, setAccounts] = useState([]);
  const [lastTransactions, setLastTransactions] = useState([]);
  const [filter, setFilter] = useState("monthly"); // lifetime, yearly, monthly
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchTransactions();
    await fetchAccounts();
  };

  const fetchAccounts = async () => {
    try {
      const response = await axiosInstance.get("/account");
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    }
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

  useEffect(() => {
    const filteredTransactions = [...getFilteredTransactions()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

    if (filteredTransactions && filteredTransactions.length > 0) {
      // Sort by date (most recent first) and get last 5
      const sorted = [...filteredTransactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setLastTransactions(sorted.slice(0, 5));

      // Calculate stats
      let totalIncome = 0;
      let totalExpense = 0;

      filteredTransactions.forEach((t) => {
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
  }, [transactions, filter]);

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

  const getTotalAccountsBalance = () => {
    return accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
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

          {/* Filter Section */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("monthly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "monthly"
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setFilter("yearly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "yearly"
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setFilter("lifetime")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "lifetime"
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              Lifetime
            </button>
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
              <p className="text-green-400 text-xs mt-2 capitalize">{filter}</p>
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
              <p id="totalExpense" className="text-2xl font-bold text-white">
                {formatCurrency(stats.totalExpense)}
              </p>
              <p className="text-red-400 text-xs mt-2 capitalize">{filter}</p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6">
              <h2 className="text-white text-2xl font-bold">Recent Transactions</h2>
              <p className="text-gray-400 text-sm mt-1">
                {lastTransactions.length > 0
                  ? `Last ${lastTransactions.length} transactions (${filter})`
                  : "No transactions yet"}
              </p>
            </div>

            {/* Table Content */}
            {lastTransactions.length > 0 ? (
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

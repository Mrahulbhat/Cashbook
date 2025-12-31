import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Target, PieChart } from "lucide-react";
import { useTransactionStore } from "../store/useTransactionStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Statistics = () => {
  const navigate = useNavigate();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("lifetime"); // lifetime, yearly, monthly
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    savingsRate: 0,
    categoryStats: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchTransactions();
      const response = await axiosInstance.get("/category");
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
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
    const filteredTransactions = getFilteredTransactions();

    let totalIncome = 0;
    let totalExpense = 0;

    // Calculate totals and group by category
    const categoryMap = {};

    filteredTransactions.forEach((t) => {
      const amount = Number(t.amount);

      const categoryName =
        typeof t.category === "object" ? t.category.name : t.category;

      if (t.type.toLowerCase() === "income") {
        totalIncome += amount;
      } else if (t.type.toLowerCase() === "expense") {
        totalExpense += amount;
      }

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          category: categoryName,
          amount: 0,
          count: 0,
          type: t.type,
          budget: 0,
        };
      }

      categoryMap[categoryName].amount += amount;
      categoryMap[categoryName].count += 1;
    });


    // Add budget info from categories
    categories.forEach((cat) => {
      if (categoryMap[cat.name]) {
        categoryMap[cat.name].budget = Number(cat.budget) || 0;
      }
    });

    const categoryStats = Object.values(categoryMap)
      .filter((c) => c.type.toLowerCase() === "expense")
      .sort((a, b) => b.amount - a.amount);

    const savingsRate =
      totalIncome > 0
        ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
        : 0;

    setStats({
      totalIncome,
      totalExpense,
      savingsRate: Math.max(savingsRate, 0),
      categoryStats,
    });
  }, [transactions, filter, categories]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (index) => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
    ];
    return colors[index % colors.length];
  };

  const getTotalPercentage = (categoryAmount) => {
    return stats.totalExpense > 0
      ? Math.round((categoryAmount / stats.totalExpense) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex justify-center items-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <button
            className="group flex items-center gap-3 mb-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-purple-500/30 text-white px-6 py-3 rounded-xl hover:from-purple-600/20 hover:to-pink-600/20 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Statistics
            </h1>
            <p className="text-gray-400">Detailed analysis of your finances</p>
          </div>

          {/* Filter Section */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("monthly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "monthly"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setFilter("yearly")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "yearly"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setFilter("lifetime")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${filter === "lifetime"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
            >
              Lifetime
            </button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-green-400 font-semibold text-sm">Total Income</h3>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(stats.totalIncome)}
              </p>
              <p className="text-green-400 text-xs mt-2 capitalize">{filter}</p>
            </div>

            {/* Total Expense */}
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-red-400 font-semibold text-sm">Total Expense</h3>
                <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />
              </div>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(stats.totalExpense)}
              </p>
              <p className="text-red-400 text-xs mt-2 capitalize">{filter}</p>
            </div>

            {/* Net Savings */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-400 font-semibold text-sm">Net Savings</h3>
                <PieChart className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(stats.totalIncome - stats.totalExpense)}
              </p>
              <p className="text-blue-400 text-xs mt-2">
                {stats.totalIncome > 0
                  ? `${Math.round(((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100)}% of income`
                  : "No income"}
              </p>
            </div>

            {/* Savings Rate */}
            <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-400 font-semibold text-sm">Savings Rate</h3>
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.savingsRate}%</p>
              <p className="text-amber-400 text-xs mt-2">of total income</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div id="statsContainer" className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6">
              <h2 className="text-white text-2xl font-bold">Expense by Category</h2>
              <p className="text-gray-400 text-sm mt-1">
                {stats.categoryStats.length} categories tracked
              </p>
            </div>

            {stats.categoryStats.length > 0 ? (
              <div className="p-8 space-y-6">
                {stats.categoryStats.map((category, index) => {
                  const categoryData = categories.find(
                    (c) => c.name === category.category
                  );
                  const budget = Number(categoryData?.budget) || 0;
                  const isOverBudget = budget > 0 && category.amount > budget;
                  const budgetPercentage =
                    budget > 0
                      ? Math.round((category.amount / budget) * 100)
                      : 0;

                  return (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getCategoryColor(index),
                            }}
                          ></div>
                          <div>
                            <h3 className="text-gray-800 font-semibold">
                              {category.category}
                            </h3>
                            <p className="text-gray-500 text-xs">
                              {category.count} transaction{category.count > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-800 font-bold">
                            {formatCurrency(category.amount)}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {getTotalPercentage(category.amount)}% of total
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${isOverBudget
                              ? "bg-red-500"
                              : "bg-gradient-to-r from-blue-500 to-blue-400"
                            }`}
                          style={{
                            width: `${Math.min(getTotalPercentage(category.amount), 100)}%`,
                          }}
                        ></div>
                      </div>

                      {/* Budget Info */}
                      {budget > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className={isOverBudget ? "text-red-600" : "text-gray-600"}>
                            {isOverBudget ? "⚠️ Over Budget" : "Within Budget"}
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(category.amount)} / {formatCurrency(budget)} (
                            {budgetPercentage}%)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-8 py-16 text-center">
                <p className="text-gray-600">No expense data available</p>
              </div>
            )}
          </div>

          {/* Pie Chart Representation */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6">
              <h2 className="text-white text-2xl font-bold">Distribution Chart</h2>
              <p className="text-gray-400 text-sm mt-1">
                Visual breakdown of spending by category
              </p>
            </div>

            {stats.categoryStats.length > 0 ? (
              <div className="p-8">
                <div className="flex flex-wrap gap-6 justify-center items-center">
                  {/* Pie Chart Visualization */}
                  <div className="w-48 h-48 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {(() => {
                        let currentAngle = -90;
                        return stats.categoryStats.map((category, index) => {
                          const percentage = getTotalPercentage(category.amount);
                          const sliceAngle = (percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + sliceAngle;

                          const startRad = (startAngle * Math.PI) / 180;
                          const endRad = (endAngle * Math.PI) / 180;

                          const x1 = 50 + 40 * Math.cos(startRad);
                          const y1 = 50 + 40 * Math.sin(startRad);
                          const x2 = 50 + 40 * Math.cos(endRad);
                          const y2 = 50 + 40 * Math.sin(endRad);

                          const largeArc = sliceAngle > 180 ? 1 : 0;

                          const path = [
                            `M 50 50`,
                            `L ${x1} ${y1}`,
                            `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
                            "Z",
                          ].join(" ");

                          const result = (
                            <path
                              key={index}
                              d={path}
                              fill={getCategoryColor(index)}
                              stroke="white"
                              strokeWidth="0.5"
                            />
                          );

                          currentAngle = endAngle;
                          return result;
                        });
                      })()}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3">
                    {stats.categoryStats.map((category, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: getCategoryColor(index) }}
                        ></div>
                        <div>
                          <p className="text-gray-800 font-medium text-sm">
                            {category.category}
                          </p>
                          <p className="text-gray-600 text-xs">
                            {formatCurrency(category.amount)} (
                            {getTotalPercentage(category.amount)}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-8 py-16 text-center">
                <p className="text-gray-600">No data to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

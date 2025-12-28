import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useTransactionStore } from "../store/useTransactionStore";

const Transactions = () => {
  const navigate = useNavigate();
  const { transactions, fetchTransactions, deleteTransaction } =
    useTransactionStore();

  const [filter, setFilter] = useState("monthly");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getFilteredTransactions = () => {
    if (!transactions || transactions.length === 0) return [];

    const now = new Date();
    let filtered = [...transactions]; // copy to avoid mutation

    if (filter === "monthly") {
      filtered = filtered.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    } else if (filter === "yearly") {
      filtered = filtered.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === now.getFullYear();
      });
    }

    // 🔽 SORT: latest first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
      await fetchTransactions();
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 sm:p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Transactions
            </h1>
            <p className="text-gray-400">
              Manage and view all your transactions
            </p>
          </div>

          <button
            id="addTransactionBtn"
            onClick={() => navigate("/addTransaction")}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3">
          {["monthly", "yearly", "lifetime"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg font-semibold ${
                filter === f
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gray-800 px-8 py-6">
            <h2 className="text-white text-2xl font-bold">
              All Transactions
            </h2>
            <p className="text-gray-400 text-sm">
              {filteredTransactions.length} transaction(s)
            </p>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table data-testid="resultsTable" className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Type",
                      "Amount",
                      "Category",
                      "Account",
                      "Description",
                      "Date",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-8 py-4 text-left text-sm font-semibold text-gray-700"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr
                      key={t._id}
                      className="border-b hover:bg-gray-100"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          {t.type === "income" ? (
                            <ArrowDownLeft className="text-green-600" />
                          ) : (
                            <ArrowUpRight className="text-red-600" />
                          )}
                          <span className="capitalize font-semibold">
                            {t.type}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-4 font-bold">
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </td>

                      <td className="px-8 py-4">{t.category}</td>
                      <td className="px-8 py-4">
                        {t.account?.name || "N/A"}
                      </td>
                      <td className="px-8 py-4 truncate max-w-xs">
                        {t.description || "-"}
                      </td>
                      <td className="px-8 py-4">
                        {formatDate(t.date)}
                      </td>

                      <td className="px-8 py-4 flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/edit-transaction/${t._id}`)
                          }
                        >
                          <Edit2 className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                        >
                          <Trash2 className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <h3 className="text-xl font-semibold">
                No Transactions Found
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;

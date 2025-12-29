import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/account");
      setAccounts(response.data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/account/${id}`);
      toast.success("Account deleted successfully");
      await loadAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const getTotalBalance = () => {
  return accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
};

return (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden p-4 sm:p-8 pb-20">
    {/* Background effects */}
    <div className="absolute inset-0">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>

    <div className="relative z-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Accounts</h1>
          <p className="text-gray-400">Manage your financial accounts</p>
        </div>
        <button
          id="addAccountBtn"
          onClick={() => navigate("/addAccount")}
          className="mt-4 sm:mt-0 group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      {accounts.length > 0 && (
        <div className="mb-8 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-emerald-400 font-semibold text-sm mb-2">
            Total Balance
          </h3>
          <p className="text-4xl font-bold text-white">
            {formatCurrency(getTotalBalance())}
          </p>
          <p className="text-emerald-400 text-sm mt-2">
            Across {accounts.length} account(s)
          </p>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {accounts.map((account) => (
          <div
            id={"accountDiv" + account.name}
            key={account._id}
            className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 id="accountNameDisplay" className="text-white font-bold text-lg">{account.name}</h3>
              <div className="flex gap-2">
                <button
                  id="editBtn"
                  onClick={() => navigate(`/edit-account/${account._id}`)}
                  className="p-2 hover:bg-blue-100/10 rounded-lg transition-colors duration-200"
                  title="Edit account"
                >
                  <Edit2 className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  id="deleteBtn"
                  onClick={() => handleDelete(account._id)}
                  className="p-2 hover:bg-red-100/10 rounded-lg transition-colors duration-200"
                  title="Delete account"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(account.balance)}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-600/30">
              <p className="text-gray-400 text-xs">Account ID: {account._id.slice(-8)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {accounts.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-2xl p-16 text-center backdrop-blur-sm">
          <div className="mb-6 text-5xl">🏦</div>
          <h3 className="text-2xl font-bold text-white mb-3">No Accounts Yet</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Create your first account to start tracking your finances.
          </p>
          <button
            onClick={() => navigate("/addAccount")}
            className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 mx-auto transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Create Your First Account
          </button>
        </div>
      )}
    </div>
  </div>
);

export default Accounts;

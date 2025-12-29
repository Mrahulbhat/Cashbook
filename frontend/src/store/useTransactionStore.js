import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useTransactionStore = create((set) => ({
  transactions: [],
  loading: false,

  // Get all transactions
  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/transaction");
      set({ transactions: response.data, loading: false });
    } catch (error) {
      toast.error("Failed to fetch transactions");
      set({ loading: false });
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/transaction/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch transaction");
      set({ loading: false });
    }
  },

  // Add new transaction
  addTransaction: async (transactionData) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.post("/transaction/new", transactionData);
      set((state) => ({
        transactions: [...state.transactions, response.data],
        loading: false,
      }));
      toast.success("Transaction added successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add transaction");
      set({ loading: false });
    }
  },

  // Update transaction
  updateTransaction: async (id, updatedData) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.put(`/transaction/${id}`, updatedData);
      set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction._id === id ? response.data : transaction
        ),
        loading: false,
      }));
      toast.success("Transaction updated successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update transaction");
      set({ loading: false });
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/transaction/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction._id !== id),
        loading: false,
      }));
      toast.success("Transaction deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete transaction");
      set({ loading: false });
    }
  },

  // Get transactions by account
  getTransactionsByAccount: async (accountId) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/transaction/account/${accountId}`);
      set({ transactions: response.data, loading: false });
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch transactions for account");
      set({ loading: false });
    }
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (startDate, endDate) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get("/transaction/date-range", {
        params: { startDate, endDate },
      });
      set({ transactions: response.data, loading: false });
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch transactions for date range");
      set({ loading: false });
    }
  },

  // Get transactions by category
  getTransactionsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axiosInstance.get(`/transaction/category/${category}`);
      set({ transactions: response.data, loading: false });
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch transactions for category");
      set({ loading: false });
    }
  },

  // Delete All transactions
  deleteAllTransactions: async () => {
    set({ loading: true });
    try {
      await axiosInstance.delete("/transaction/delete-all");

      set({ transactions: [], loading: false });
      toast.success("All transactions deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete all transactions");
      set({ loading: false });
    }
  },

  // Delete test transactions
  deleteTestTransactions: async () => {
    set({ loading: true });
    try {
      const response = await axiosInstance.delete("/transaction/delete-test");
      toast.success(response.data.message || "Test transactions deleted successfully");
      // Refetch to update local state
      const allTxns = await axiosInstance.get("/transaction");
      set({ transactions: allTxns.data, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete test transactions");
      set({ loading: false });
    }
  },

}));

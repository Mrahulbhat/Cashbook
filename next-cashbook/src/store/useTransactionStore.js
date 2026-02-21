import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";

export const useTransactionStore = create((set) => ({
    transactions: [],
    loading: false,

    fetchTransactions: async () => {
        set({ loading: true });
        try {
            const response = await axiosInstance.get("/transactions");
            set({ transactions: response.data, loading: false });
        } catch (error) {
            toast.error("Failed to fetch transactions");
            set({ loading: false });
        }
    },

    getTransactionById: async (id) => {
        set({ loading: true });
        try {
            const response = await axiosInstance.get(`/transactions/${id}`);
            set({ loading: false });
            return response.data;
        } catch (error) {
            toast.error("Failed to fetch transaction");
            set({ loading: false });
        }
    },

    addTransaction: async (transactionData) => {
        set({ loading: true });
        try {
            const response = await axiosInstance.post("/transactions", transactionData);
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

    updateTransaction: async (id, updatedData) => {
        set({ loading: true });
        try {
            const response = await axiosInstance.put(`/transactions/${id}`, updatedData);
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

    deleteTransaction: async (id) => {
        set({ loading: true });
        try {
            await axiosInstance.delete(`/transactions/${id}`);
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
}));

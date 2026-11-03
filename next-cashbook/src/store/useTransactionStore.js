import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";

export const useTransactionStore = create((set) => ({
    transactions: [],
    pagination: null,
    loading: false,

    fetchTransactions: async (paginationOptions) => {
        set({ loading: true });
        try {
            const response = await axiosInstance.get("/transactions", paginationOptions
                ? { params: paginationOptions }
                : undefined);
            set({
                transactions: paginationOptions ? response.data.transactions : response.data,
                pagination: paginationOptions ? response.data.pagination : null,
                loading: false,
            });
        } catch (error) {
            console.error("fetchTransactions error:", error);
            toast.error(error.response?.data?.message || "Failed to fetch transactions");
            set({ loading: false, transactions: [], pagination: null });
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
            set((state) => {
                const deletedTransaction = state.transactions.find((transaction) => transaction._id === id);
                const total = state.pagination
                    ? Math.max(0, state.pagination.total - (deletedTransaction ? 1 : 0))
                    : 0;

                return {
                    transactions: state.transactions.filter((transaction) => transaction._id !== id),
                    pagination: state.pagination
                        ? {
                            ...state.pagination,
                            total,
                            totalPages: Math.ceil(total / state.pagination.limit),
                            totalExpense: Math.max(
                                0,
                                state.pagination.totalExpense -
                                    (deletedTransaction?.type === "expense" ? Number(deletedTransaction.amount) : 0)
                            ),
                        }
                        : null,
                    loading: false,
                };
            });
            toast.success("Transaction deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete transaction");
            set({ loading: false });
        }
    },
}));

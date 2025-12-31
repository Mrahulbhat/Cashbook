import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAccountStore = create((set, get) => ({
  accounts: [],
  loading: false,

  // Fetch all accounts
  fetchAccounts: async () => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get("/account");
      set({ accounts: res.data });
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      set({ loading: false });
    }
  },

  // Add account
  addAccount: async (accountData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post("/account", accountData);
      set((state) => ({ accounts: [...state.accounts, res.data] }));
      toast.success("Account added successfully");
      return res.data;
    } catch (error) {
      console.error("Error adding account:", error);
      toast.error(error.response?.data?.message || "Failed to add account");
    } finally {
      set({ loading: false });
    }
  },

  // Update account
  updateAccount: async (id, accountData) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/account/${id}`, accountData);
      set((state) => ({
        accounts: state.accounts.map((acc) =>
          acc._id === id ? res.data : acc
        ),
      }));
      toast.success("Account updated successfully");
      return res.data;
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(error.response?.data?.message || "Failed to update account");
    } finally {
      set({ loading: false });
    }
  },

  // Delete account
  deleteAccount: async (id) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/account/${id}`);
      set((state) => ({
        accounts: state.accounts.filter((acc) => acc._id !== id),
      }));
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    } finally {
      set({ loading: false });
    }
  },

  // Get account by ID
  getAccountById: async (id) => {
    try {
      const res = await axiosInstance.get(`/account/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching account:", error);
      toast.error(error.response?.data?.message || "Failed to get account");
    }
  },

  // Update account balance (for transactions)
  updateBalance: async (id, amount) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.put(`/account/balance/${id}`, { amount });
      set((state) => ({
        accounts: state.accounts.map((acc) =>
          acc._id === id ? res.data : acc
        ),
      }));
      return res.data;
    } catch (error) {
      console.error("Error updating balance:", error);
      toast.error(error.response?.data?.message || "Failed to update balance");
    } finally {
      set({ loading: false });
    }
  },
}));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set) => ({
  loading: false,

  createCategory: async (data) => {
    try {
      set({ loading: true });
      await axiosInstance.post("/category/new", data);
      toast.success("Category created successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create category"
      );
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

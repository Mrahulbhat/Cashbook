import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,

  loadCategories: async () => {
    try {
      set({ loading: true });
      const res = await axiosInstance.get("/category");
      set({ categories: res.data || [] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      set({ loading: false });
    }
  },

  createCategory: async (data) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post("/category/new", data);
      set((state) => ({
        categories: [...state.categories, res.data],
      }));
      toast.success("Category created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCategory: async (id, data) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.put(`/category/${id}`, data);
      set((state) => ({
        categories: state.categories.map((c) =>
          c._id === id ? res.data : c
        ),
      }));
      toast.success("Category updated successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteCategory: async (id) => {
    try {
      set({ loading: true });
      await axiosInstance.delete(`/category/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c._id !== id),
      }));
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getCategoryById: (id) => {
    return get().categories.find((c) => c._id === id);
  },
}));

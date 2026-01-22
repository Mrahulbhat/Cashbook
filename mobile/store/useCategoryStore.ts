import { create } from 'zustand';
import { Alert } from 'react-native';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  parentCategory?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  loadCategories: (api: any) => Promise<void>;
  createCategory: (data: any, api: any) => Promise<Category | null>;
  updateCategory: (id: string, data: any, api: any) => Promise<Category | null>;
  deleteCategory: (id: string, api: any) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: false,

  loadCategories: async (api) => {
    try {
      set({ loading: true });
      const res = await api.get('/category');
      set({ categories: res.data || [], loading: false });
    } catch (error: any) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
      set({ loading: false });
    }
  },

  createCategory: async (data: any, api) => {
    try {
      set({ loading: true });
      const res = await api.post('/category/new', data);
      set((state) => ({
        categories: [...state.categories, res.data],
        loading: false,
      }));
      Alert.alert('Success', 'Category created successfully');
      return res.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      const message = error.response?.data?.message || 'Failed to create category';
      Alert.alert('Error', message);
      set({ loading: false });
      return null;
    }
  },

  updateCategory: async (id: string, data: any, api) => {
    try {
      set({ loading: true });
      const res = await api.put(`/category/${id}`, data);
      set((state) => ({
        categories: state.categories.map((c) =>
          c._id === id ? res.data : c
        ),
        loading: false,
      }));
      Alert.alert('Success', 'Category updated successfully');
      return res.data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      const message = error.response?.data?.message || 'Failed to update category';
      Alert.alert('Error', message);
      set({ loading: false });
      return null;
    }
  },

  deleteCategory: async (id: string, api) => {
    try {
      set({ loading: true });
      await api.delete(`/category/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c._id !== id),
        loading: false,
      }));
      Alert.alert('Success', 'Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error.response?.data?.message || 'Failed to delete category';
      Alert.alert('Error', message);
      set({ loading: false });
    }
  },

  getCategoryById: (id: string) => {
    return get().categories.find((c) => c._id === id);
  },
}));

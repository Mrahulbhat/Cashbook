import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import toast from 'react-hot-toast';

export const useUpcomingStore = create((set, get) => ({
    upcomingExpenses: [],
    loading: false,

    fetchUpcoming: async () => {
        set({ loading: true });
        try {
            const res = await axiosInstance.get('/upcoming');
            set({ upcomingExpenses: res.data, loading: false });
        } catch (error) {
            console.error('Error fetching upcoming expenses:', error);
            set({ loading: false });
        }
    },

    addUpcoming: async (expenseData) => {
        try {
            const res = await axiosInstance.post('/upcoming', expenseData);
            set((state) => ({
                upcomingExpenses: [...state.upcomingExpenses, res.data].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            }));
            toast.success('Upcoming expense added!');
            return res.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add upcoming expense');
            throw error;
        }
    },

    deleteUpcoming: async (id) => {
        try {
            await axiosInstance.delete(`/upcoming/${id}`);
            set((state) => ({
                upcomingExpenses: state.upcomingExpenses.filter((e) => e._id !== id)
            }));
            toast.success('Upcoming expense deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    },

    updateUpcoming: async (id, updates) => {
        try {
            const res = await axiosInstance.patch(`/upcoming/${id}`, updates);
            set((state) => ({
                upcomingExpenses: state.upcomingExpenses.map((e) => e._id === id ? res.data : e)
            }));
            return res.data;
        } catch (error) {
            toast.error('Failed to update');
            throw error;
        }
    }
}));

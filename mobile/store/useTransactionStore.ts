import { create } from 'zustand';
import { Alert } from 'react-native';

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: {
    _id: string;
    name: string;
  };
  account?: {
    _id: string;
    name: string;
  };
  date: string;
  createdAt?: string;
}

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  fetchTransactions: (api: any) => Promise<void>;
  getTransactionById: (id: string, api: any) => Promise<Transaction | null>;
  addTransaction: (transactionData: any, api: any) => Promise<Transaction | null>;
  updateTransaction: (id: string, updatedData: any, api: any) => Promise<Transaction | null>;
  deleteTransaction: (id: string, api: any) => Promise<void>;
  deleteAllTransactions: (api: any) => Promise<void>;
  getTransactionsByAccount: (accountId: string, api: any) => Promise<Transaction[]>;
  getTransactionsByDateRange: (startDate: string, endDate: string, api: any) => Promise<Transaction[]>;
  getTransactionsByCategory: (category: string, api: any) => Promise<Transaction[]>;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  loading: false,

  // Get all transactions
  fetchTransactions: async (api) => {
    set({ loading: true });
    try {
      const response = await api.get('/transaction');
      set({ transactions: response.data || [], loading: false });
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions');
      set({ loading: false });
    }
  },

  // Get transaction by ID
  getTransactionById: async (id: string, api) => {
    set({ loading: true });
    try {
      const response = await api.get(`/transaction/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch transaction:', error);
      Alert.alert('Error', 'Failed to fetch transaction');
      set({ loading: false });
      return null;
    }
  },

  // Add new transaction
  addTransaction: async (transactionData: any, api) => {
    set({ loading: true });
    try {
      const response = await api.post('/transaction/new', transactionData);
      set((state) => ({
        transactions: [...state.transactions, response.data],
        loading: false,
      }));
      Alert.alert('Success', 'Transaction added successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to add transaction:', error);
      const message = error.response?.data?.message || 'Failed to add transaction';
      Alert.alert('Error', message);
      set({ loading: false });
      return null;
    }
  },

  // Update transaction
  updateTransaction: async (id: string, updatedData: any, api) => {
    set({ loading: true });
    try {
      const response = await api.put(`/transaction/${id}`, updatedData);
      set((state) => ({
        transactions: state.transactions.map((transaction) =>
          transaction._id === id ? response.data : transaction
        ),
        loading: false,
      }));
      Alert.alert('Success', 'Transaction updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to update transaction:', error);
      const message = error.response?.data?.message || 'Failed to update transaction';
      Alert.alert('Error', message);
      set({ loading: false });
      return null;
    }
  },

  // Delete transaction
  deleteTransaction: async (id: string, api) => {
    set({ loading: true });
    try {
      await api.delete(`/transaction/${id}`);
      set((state) => ({
        transactions: state.transactions.filter((transaction) => transaction._id !== id),
        loading: false,
      }));
      Alert.alert('Success', 'Transaction deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete transaction:', error);
      const message = error.response?.data?.message || 'Failed to delete transaction';
      Alert.alert('Error', message);
      set({ loading: false });
    }
  },

  // Get transactions by account
  getTransactionsByAccount: async (accountId: string, api) => {
    set({ loading: true });
    try {
      const response = await api.get(`/transaction/account/${accountId}`);
      set({ transactions: response.data || [], loading: false });
      return response.data || [];
    } catch (error: any) {
      console.error('Failed to fetch transactions for account:', error);
      Alert.alert('Error', 'Failed to fetch transactions for account');
      set({ loading: false });
      return [];
    }
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (startDate: string, endDate: string, api) => {
    set({ loading: true });
    try {
      const response = await api.get('/transaction/date-range', {
        params: { startDate, endDate },
      });
      set({ transactions: response.data || [], loading: false });
      return response.data || [];
    } catch (error: any) {
      console.error('Failed to fetch transactions for date range:', error);
      Alert.alert('Error', 'Failed to fetch transactions for date range');
      set({ loading: false });
      return [];
    }
  },

  // Get transactions by category
  getTransactionsByCategory: async (category: string, api) => {
    set({ loading: true });
    try {
      const response = await api.get(`/transaction/category/${category}`);
      set({ transactions: response.data || [], loading: false });
      return response.data || [];
    } catch (error: any) {
      console.error('Failed to fetch transactions for category:', error);
      Alert.alert('Error', 'Failed to fetch transactions for category');
      set({ loading: false });
      return [];
    }
  },

  // Delete All transactions
  deleteAllTransactions: async (api) => {
    set({ loading: true });
    try {
      await api.delete('/transaction/delete-all');
      set({ transactions: [], loading: false });
      Alert.alert('Success', 'All transactions deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete all transactions:', error);
      const message = error.response?.data?.message || 'Failed to delete all transactions';
      Alert.alert('Error', message);
      set({ loading: false });
    }
  },
}));

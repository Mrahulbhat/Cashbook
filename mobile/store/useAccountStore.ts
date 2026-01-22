import { create } from 'zustand';
import { Alert } from 'react-native';

interface Account {
  _id: string;
  accountName: string;
  accountType: string;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AccountStore {
  accounts: Account[];
  loading: boolean;
  fetchAccounts: (api: any) => Promise<void>;
  addAccount: (accountData: any, api: any) => Promise<Account | null>;
  updateAccount: (id: string, accountData: any, api: any) => Promise<Account | null>;
  deleteAccount: (id: string, api: any) => Promise<void>;
  getAccountById: (id: string, api: any) => Promise<Account | null>;
  updateBalance: (id: string, amount: number, api: any) => Promise<Account | null>;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  loading: false,

  // Fetch all accounts
  fetchAccounts: async (api) => {
    set({ loading: true });
    try {
      const res = await api.get('/account');
      set({ accounts: res.data || [], loading: false });
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Error', 'Failed to load accounts');
      set({ loading: false });
    }
  },

  // Add account
  addAccount: async (accountData: any, api) => {
    set({ loading: true });
    try {
      const res = await api.post('/account/new', accountData);
      set((state) => ({ accounts: [...state.accounts, res.data], loading: false }));
      Alert.alert('Success', 'Account added successfully');
      return res.data;
    } catch (error: any) {
      console.error('Error adding account:', error);
      const message = error.response?.data?.message || 'Failed to add account';
      Alert.alert('Error', message);
      set({ loading: false });
      return null;
    }
  },

  // Update account
  updateAccount: async (id: string, accountData: any, api) => {
    set({ loading: true });
    try {
      const res = await api.put(`/account/${id}`, accountData);
      set((state) => ({
        accounts: state.accounts.map((acc) =>
          acc._id === id ? res.data : acc
        ),
        loading: false,
      }));
      Alert.alert('Success', 'Account updated successfully');
      return res.data;
    } catch (error: any) {
      console.error('Error updating account:', error);
      const message = error.response?.data?.message || 'Failed to update account';
      Alert.alert('Error', message);
      set({ loading: false });
      return null;
    }
  },

  // Delete account
  deleteAccount: async (id: string, api) => {
    set({ loading: true });
    try {
      await api.delete(`/account/${id}`);
      set((state) => ({
        accounts: state.accounts.filter((acc) => acc._id !== id),
        loading: false,
      }));
      Alert.alert('Success', 'Account deleted successfully');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      const message = error.response?.data?.message || 'Failed to delete account';
      Alert.alert('Error', message);
      set({ loading: false });
    }
  },

  // Get account by ID
  getAccountById: async (id: string, api) => {
    try {
      const res = await api.get(`/account/${id}`);
      return res.data;
    } catch (error: any) {
      console.error('Error fetching account:', error);
      const message = error.response?.data?.message || 'Failed to get account';
      Alert.alert('Error', message);
      return null;
    }
  },

  // Update account balance (for transactions)
  updateBalance: async (id: string, amount: number, api) => {
    set({ loading: true });
    try {
      const res = await api.patch(`/account/${id}/balance`, { amount });
      set((state) => ({
        accounts: state.accounts.map((acc) =>
          acc._id === id ? res.data : acc
        ),
        loading: false,
      }));
      return res.data;
    } catch (error: any) {
      console.error('Error updating balance:', error);
      const message = error.response?.data?.message || 'Failed to update balance';
      Alert.alert('Error', message);
      set({ loading: false });
      return null;
    }
  },
}));

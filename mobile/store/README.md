# Mobile App Stores

All stores are now TypeScript-compatible and follow the same pattern as your frontend stores.

## Available Stores

### 1. `useTransactionStore.ts`
Manages all transaction-related state and API calls.

**Usage:**
```tsx
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuth } from '@/context/AuthContext';

const MyComponent = () => {
  const { api } = useAuth();
  const { transactions, fetchTransactions, addTransaction, deleteTransaction } = useTransactionStore();

  useEffect(() => {
    fetchTransactions(api);
  }, [api]);

  const handleAdd = async () => {
    await addTransaction({ description: 'Test', amount: 100, type: 'income' }, api);
    await fetchTransactions(api); // Refresh list
  };
};
```

**Methods:**
- `fetchTransactions(api)` - Get all transactions
- `getTransactionById(id, api)` - Get single transaction
- `addTransaction(data, api)` - Create new transaction
- `updateTransaction(id, data, api)` - Update transaction
- `deleteTransaction(id, api)` - Delete transaction
- `deleteAllTransactions(api)` - Delete all transactions
- `getTransactionsByAccount(accountId, api)` - Filter by account
- `getTransactionsByDateRange(startDate, endDate, api)` - Filter by date
- `getTransactionsByCategory(category, api)` - Filter by category

---

### 2. `useAccountStore.ts`
Manages all account-related state and API calls.

**Usage:**
```tsx
import { useAccountStore } from '@/store/useAccountStore';
import { useAuth } from '@/context/AuthContext';

const MyComponent = () => {
  const { api } = useAuth();
  const { accounts, fetchAccounts, addAccount, deleteAccount } = useAccountStore();

  useEffect(() => {
    fetchAccounts(api);
  }, [api]);
};
```

**Methods:**
- `fetchAccounts(api)` - Get all accounts
- `addAccount(data, api)` - Create new account
- `updateAccount(id, data, api)` - Update account
- `deleteAccount(id, api)` - Delete account
- `getAccountById(id, api)` - Get single account
- `updateBalance(id, amount, api)` - Update account balance

---

### 3. `useCategoryStore.ts`
Manages all category-related state and API calls.

**Usage:**
```tsx
import { useCategoryStore } from '@/store/useCategoryStore';
import { useAuth } from '@/context/AuthContext';

const MyComponent = () => {
  const { api } = useAuth();
  const { categories, loadCategories, createCategory, deleteCategory } = useCategoryStore();

  useEffect(() => {
    loadCategories(api);
  }, [api]);
};
```

**Methods:**
- `loadCategories(api)` - Get all categories
- `createCategory(data, api)` - Create new category
- `updateCategory(id, data, api)` - Update category
- `deleteCategory(id, api)` - Delete category
- `getCategoryById(id)` - Get category from local state (no API call)

---

## Important Notes

1. **Always pass `api` parameter**: All store methods require the `api` instance from `useAuth()`
2. **Error handling**: All stores use `Alert.alert()` for mobile-friendly error messages
3. **Loading state**: All stores have a `loading` boolean you can use for UI feedback
4. **TypeScript**: All stores are fully typed for better development experience

## Example: Complete Component

```tsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAccountStore } from '@/store/useAccountStore';
import { useAuth } from '@/context/AuthContext';

export default function AccountsScreen() {
  const { api } = useAuth();
  const { accounts, loading, fetchAccounts } = useAccountStore();

  useEffect(() => {
    if (api) {
      fetchAccounts(api);
    }
  }, [api]);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      {accounts.map(account => (
        <Text key={account._id}>{account.accountName}</Text>
      ))}
    </View>
  );
}
```

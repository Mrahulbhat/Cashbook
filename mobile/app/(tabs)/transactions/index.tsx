//TRANSACTIONS SCREEN SET AS DEFAULT SCREEN IN TABS

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

const TransactionsScreen = () => {
  const { api, logout } = useAuth();
  const router = useRouter();
  const {
    transactions,
    fetchTransactions,
    deleteTransaction,
    deleteAllTransactions,
  } = useTransactionStore();

  const [filter, setFilter] = useState<'monthly' | 'yearly' | 'lifetime'>(
    'monthly'
  );

  useEffect(() => {
    if (api) {
      fetchTransactions(api);
    }
  }, [api]);

  const getFilteredTransactions = () => {
    if (!transactions || transactions.length === 0) return [];
    const now = new Date();

    return transactions.filter((t) => {
      const transDate = new Date(t.date);
      if (filter === 'monthly') {
        return (
          transDate.getMonth() === now.getMonth() &&
          transDate.getFullYear() === now.getFullYear()
        );
      }
      if (filter === 'yearly') {
        return transDate.getFullYear() === now.getFullYear();
      }
      return true; // lifetime
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(id, api);
          await fetchTransactions(api);
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    Alert.alert('Confirm', 'Delete all transactions?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          await deleteAllTransactions(api);
          await fetchTransactions(api);
        },
      },
    ]);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  const filteredTransactions = [...getFilteredTransactions()].sort(
    (a, b) =>
      new Date(b.createdAt || b.date).getTime() -
      new Date(a.createdAt || a.date).getTime()
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Transactions</Text>
              <Text style={styles.subtitle}>
                Manage and view all your transactions
              </Text>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() =>
                Alert.alert('Logout', 'Are you sure you want to logout?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      await logout();
                      router.replace('/auth/login');
                    },
                  },
                ])
              }
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              Alert.alert('Coming Soon', 'Add transaction feature coming soon')
            }
          >
            <Text style={styles.addButtonText}>+ Add Transaction</Text>
          </TouchableOpacity>
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          {['monthly', 'yearly', 'lifetime'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                filter === f && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f as any)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.transactionCard}>
                <View style={styles.typeContainer}>
                  <Text style={styles.typeIcon}>
                    {item.type.toLowerCase() === 'income' ? '↓' : '↑'}
                  </Text>
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>

                <Text
                  style={[
                    styles.amountText,
                    item.type.toLowerCase() === 'income'
                      ? styles.income
                      : styles.expense,
                  ]}
                >
                  {item.type.toLowerCase() === 'income' ? '+' : '-'}
                  {formatCurrency(item.amount)}
                </Text>

                <Text style={styles.categoryText}>
                  {item.category?.name || 'N/A'}
                </Text>
                <Text style={styles.accountText}>
                  {item.account?.name || 'N/A'}
                </Text>
                <Text style={styles.descText}>{item.description || '-'}</Text>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>

                <View style={styles.actions}>
                  <TouchableOpacity>
                    <Text style={styles.editButton}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Text style={styles.deleteButton}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptySubtitle}>
              Add your first transaction to get started.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteAllBtn}
          onPress={handleDeleteAll}
        >
          <Text style={styles.deleteAllText}>Delete All Transactions</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ff4d4d',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 10,
    width: 180,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#222',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: 'green',
  },
  filterText: {
    color: '#ccc',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  transactionCard: {
    backgroundColor: '#111',
    padding: 12,
    marginBottom: 12,
    borderRadius: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeIcon: {
    color: '#fff',
    marginRight: 6,
  },
  typeText: {
    color: '#fff',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  income: {
    color: 'green',
  },
  expense: {
    color: 'red',
  },
  categoryText: {
    color: '#0f0',
  },
  accountText: {
    color: '#ccc',
  },
  descText: {
    color: '#aaa',
  },
  dateText: {
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    color: 'blue',
    fontWeight: '600',
  },
  deleteButton: {
    color: 'red',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  emptySubtitle: {
    color: '#aaa',
    textAlign: 'center',
  },
  deleteAllBtn: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteAllText: {
    color: '#fff',
    fontWeight: '700',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

const TransactionsScreen = () => {
  const { api } = useAuth();
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
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
          <Text style={styles.subtitle}>
            {filteredTransactions.length} {filter} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </Text>
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
          <>
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 180 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.transactionCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.leftSection}>
                      <View style={[
                        styles.iconCircle,
                        item.type.toLowerCase() === 'income' ? styles.incomeCircle : styles.expenseCircle
                      ]}>
                        <Text style={styles.typeIcon}>
                          {item.type.toLowerCase() === 'income' ? '↓' : '↑'}
                        </Text>
                      </View>
                      <View style={styles.infoSection}>
                        <Text style={styles.categoryText}>
                          {item.category?.name || 'N/A'}
                        </Text>
                        <Text style={styles.accountText}>
                          {item.account?.name || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rightSection}>
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
                      <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    </View>
                  </View>

                  {item.description && (
                    <Text style={styles.descText}>{item.description}</Text>
                  )}

                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.editButton}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(item._id)}
                    >
                      <Text style={styles.deleteButton}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            {/* Action Buttons */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.deleteAllButton}
                onPress={handleDeleteAll}
              >
                <Text style={styles.deleteAllText}>Delete All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => router.push('/transactions/add')}
              >
                <Text style={styles.addBtnText}>+ Add Transaction</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptySubtitle}>
              Add your first transaction to get started.
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {/* Add your navigation logic */ }}
            >
              <Text style={styles.addBtnText}>+ Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterButtonActive: {
    backgroundColor: '#1a4d1a',
    borderColor: '#2d7a2d',
  },
  filterText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#4ade80',
  },
  transactionCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeCircle: {
    backgroundColor: '#1a4d1a',
  },
  expenseCircle: {
    backgroundColor: '#4d1a1a',
  },
  typeIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  infoSection: {
    flex: 1,
  },
  categoryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountText: {
    color: '#888',
    fontSize: 13,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  income: {
    color: '#4ade80',
  },
  expense: {
    color: '#f87171',
  },
  dateText: {
    color: '#666',
    fontSize: 12,
  },
  descText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0a0a0a',
  },
  editButton: {
    color: '#60a5fa',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    color: '#f87171',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    textAlign: 'center',
    fontSize: 15,
    marginBottom: 32,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    flexDirection: 'row',
    gap: 12,
  },
  deleteAllButton: {
    flex: 1,
    backgroundColor: '#4d1a1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7a2d2d',
  },
  deleteAllText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 15,
  },
  addBtn: {
    flex: 2,
    backgroundColor: '#1a4d1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d7a2d',
  },
  addBtnText: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: 15,
  },
});
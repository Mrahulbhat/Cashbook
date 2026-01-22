import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAccountStore } from '@/store/useAccountStore';
import { useAuth } from '@/context/AuthContext';

const AccountsScreen = () => {
  const router = useRouter();
  const { api } = useAuth();
  const { accounts, fetchAccounts, deleteAccount, loading } = useAccountStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (api) {
      fetchAccounts(api);
    }
  }, [api]);

  const handleDeleteClick = (id: string) => {
    setSelectedAccountId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedAccountId && api) {
      await deleteAccount(selectedAccountId, api);
      await fetchAccounts(api);
    }
    setShowConfirm(false);
    setSelectedAccountId(null);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);

  const getTotalBalance = () =>
    accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Accounts</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/accounts/add')}
          >
            <Text style={styles.addButtonText}>+ Add Account</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#22c55e" />
          </View>
        )}

        {/* Total Balance */}
        {accounts.length > 0 && !loading && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(getTotalBalance())}
            </Text>
            <Text style={styles.balanceSub}>
              Across {accounts.length} account(s)
            </Text>
          </View>
        )}

        {/* Accounts List */}
        {!loading && accounts.length > 0 && (
          <FlatList
            data={accounts}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <View style={styles.accountCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.accountName}>{item.name}</Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/accounts/edit/${item._id}`)
                      }
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDeleteClick(item._id)}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.balanceTitle}>Current Balance</Text>
                <Text style={styles.accountBalance}>
                  {formatCurrency(item.balance)}
                </Text>

                <Text style={styles.accountId}>
                  Account ID: {item._id.slice(-8)}
                </Text>
              </View>
            )}
          />
        )}

        {/* Empty State */}
        {!loading && accounts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏦</Text>
            <Text style={styles.emptyTitle}>No Accounts Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first account to start tracking your finances.
            </Text>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/accounts/add')}
            >
              <Text style={styles.createBtnText}>
                + Create Your First Account
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Confirmation Modal */}
        <Modal visible={showConfirm} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete this account? This action cannot
                be undone.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowConfirm(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleConfirmDelete}
                >
                  <Text style={styles.confirmText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default AccountsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, padding: 16 },

  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#aaa', fontSize: 14 },

  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '700' },

  loader: { marginTop: 40 },

  balanceCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  balanceLabel: { color: '#34d399', fontSize: 12 },
  balanceAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  balanceSub: { color: '#6ee7b7', marginTop: 4 },

  accountCard: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accountName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 12 },
  editText: { color: '#60a5fa', fontWeight: '600' },
  deleteText: { color: '#f87171', fontWeight: '600' },

  balanceTitle: { color: '#aaa', fontSize: 12 },
  accountBalance: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  accountId: { color: '#666', fontSize: 12, marginTop: 8 },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptySubtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginVertical: 8,
  },
  createBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  createBtnText: { color: '#fff', fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 16,
    width: '85%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMessage: { color: '#aaa', marginBottom: 16 },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: { padding: 8 },
  cancelText: { color: '#aaa' },
  confirmBtn: { padding: 8 },
  confirmText: { color: '#f87171', fontWeight: '700' },
});

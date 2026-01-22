import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAccountStore } from '@/store/useAccountStore';

export default function EditAccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id; 

  const { api } = useAuth();
  const { accounts, fetchAccounts, updateAccount, loading } = useAccountStore();

  const [accountData, setAccountData] = useState({ name: '', balance: '' });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        if (!accounts.length) {
          await fetchAccounts(api);
        }

        const account = accounts.find(acc => acc._id === id);
        if (!account) {
          Alert.alert('Error', 'Account not found');
          return router.back();
        }

        setAccountData({ name: account.name, balance: account.balance.toString() });
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load account');
        router.back();
      } finally {
        setLoadingData(false);
      }
    };

    loadAccount();
  }, [id, accounts]);

  const handleChange = (key: string, value: string) => {
    setAccountData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const balanceNumber = Number(accountData.balance);
    if (!accountData.name || isNaN(balanceNumber) || balanceNumber < 0) {
      Alert.alert('Error', 'Please provide valid name and balance');
      return;
    }

    try {
      await updateAccount(id, { name: accountData.name, balance: balanceNumber }, api);
      Alert.alert('Success', 'Account updated successfully');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update account');
    }
  };

  if (loadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.heading}>Edit Account</Text>
          <Text style={styles.subheading}>Update your account details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Name *</Text>
            <TextInput
              value={accountData.name}
              onChangeText={text => handleChange('name', text)}
              placeholder="e.g., Savings Account"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Balance *</Text>
            <TextInput
              value={accountData.balance}
              onChangeText={text => handleChange('balance', text)}
              placeholder="0.00"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveText}>Update Account</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  backBtn: { marginBottom: 16 },
  backText: { color: '#fff', fontSize: 16 },
  card: { backgroundColor: '#111', borderRadius: 20, padding: 20 },
  heading: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subheading: { color: '#aaa', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#ccc', marginBottom: 6 },
  input: { backgroundColor: '#222', padding: 12, borderRadius: 12, color: '#fff' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#333' },
  cancelText: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#4ade80' },
  saveText: { color: '#000', fontWeight: '700' },
});

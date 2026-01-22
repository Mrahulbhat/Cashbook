import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAccountStore } from '@/store/useAccountStore';

export default function AddAccountScreen() {
  const router = useRouter();
  const { api } = useAuth();
  const { addAccount } = useAccountStore();

  const [formData, setFormData] = useState({
    name: '',
    balance: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.balance === '') {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.balance) < 0) {
      Alert.alert('Error', 'Balance cannot be negative');
      return;
    }

    setLoading(true);

    try {
      const newAccount = await addAccount(
        {
          name: formData.name,
          balance: parseFloat(formData.balance),
        },
        api
      );

      if (newAccount) {
        Alert.alert('Success', 'Account created successfully');
        setFormData({ name: '', balance: '' });
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.heading}>Add New Account</Text>
          <Text style={styles.subheading}>
            Create a new bank or savings account
          </Text>

          {/* Account Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Name *</Text>
            <TextInput
              placeholder="e.g., Savings Account"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={styles.input}
            />
          </View>

          {/* Initial Balance */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Initial Balance *</Text>
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              value={formData.balance}
              onChangeText={(text) => handleInputChange('balance', text)}
              style={styles.input}
            />
          </View>

          {/* Tip Box */}
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              💡 Tip: You can update the balance anytime by adding transactions.
              Start with your current account balance.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#fff', fontSize: 16 },
  card: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 20,
  },
  heading: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subheading: { color: '#aaa', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#ccc', marginBottom: 6 },
  input: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 12,
    color: '#fff',
  },
  tipBox: {
    backgroundColor: '#1c1c2e',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipText: { color: '#7ac7ff' },
  buttons: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#333' },
  cancelText: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#4ade80' },
  saveText: { color: '#000', fontWeight: '700' },
});

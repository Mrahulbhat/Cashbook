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
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';

import { useAuth } from '@/context/AuthContext';
import { useTransactionStore } from '@/store/useTransactionStore';

export default function AddTransactionScreen() {
    const router = useRouter();
    const { api } = useAuth();
    const { addTransaction, loading } = useTransactionStore();

    const [accounts, setAccounts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        description: '',
        category: '',
        account: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsRes, categoriesRes] = await Promise.all([
                    api.get('/account'),
                    api.get('/category'),
                ]);
                setAccounts(accountsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                Alert.alert('Error', 'Failed to load accounts or categories');
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const filteredCategories = categories.filter(
        (cat) => cat.type === formData.type
    );

    const handleSubmit = async () => {
        if (
            !formData.amount ||
            !formData.category ||
            !formData.account
        ) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            Alert.alert('Error', 'Amount must be greater than 0');
            return;
        }

        try {
            const transaction = await addTransaction(
                {
                    amount: Number(formData.amount),
                    type: formData.type,
                    description: formData.description || undefined,
                    category: formData.category,
                    account: formData.account,
                    date: new Date(formData.date),
                },
                api
            );

            if (transaction) {
                Alert.alert('Success', 'Transaction added successfully');
                router.back();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add transaction');
        }
    };

    if (loadingData) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {/* Header */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.card}>
                    <Text style={styles.heading}>Add Transaction</Text>
                    <Text style={styles.subheading}>
                        Record a new income or expense
                    </Text>

                    {/* Type */}
                    <View style={styles.row}>
                        <TouchableOpacity
                            onPress={() =>
                                setFormData({ ...formData, type: 'income', category: '' })
                            }
                        >
                            <Text
                                style={
                                    formData.type === 'income'
                                        ? styles.active
                                        : styles.inactive
                                }
                            >
                                Income
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                setFormData({ ...formData, type: 'expense', category: '' })
                            }
                        >
                            <Text
                                style={
                                    formData.type === 'expense'
                                        ? styles.active
                                        : styles.inactive
                                }
                            >
                                Expense
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amount */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount *</Text>
                        <TextInput
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={formData.amount}
                            onChangeText={(text) =>
                                setFormData({ ...formData, amount: text })
                            }
                            style={styles.input}
                        />
                    </View>

                    {/* Account */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Account *</Text>
                        <Picker
                            selectedValue={formData.account}
                            onValueChange={(value) =>
                                setFormData({ ...formData, account: value })
                            }
                        >
                            <Picker.Item label="Select account" value="" />
                            {accounts.map((acc) => (
                                <Picker.Item
                                    key={acc._id}
                                    label={acc.name}
                                    value={acc._id}
                                />
                            ))}
                        </Picker>
                    </View>

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category *</Text>
                        <Picker
                            selectedValue={formData.category}
                            onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                            }
                        >
                            <Picker.Item label="Select category" value="" />
                            {filteredCategories.map((cat) => (
                                <Picker.Item
                                    key={cat._id}
                                    label={cat.name}
                                    value={cat._id}
                                />
                            ))}
                        </Picker>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            placeholder="Notes about this transaction"
                            value={formData.description}
                            onChangeText={(text) =>
                                setFormData({ ...formData, description: text })
                            }
                            style={[styles.input, { height: 80 }]}
                            multiline
                        />
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
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={styles.saveText}>Add Transaction</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    backBtn: {
        marginBottom: 16
    },
    backText: {
        color: '#fff',
        fontSize: 16
    },
    card: {
        backgroundColor: '#111',
        borderRadius: 20,
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4
    },

    subheading: {
        color: '#aaa',
        marginBottom: 20
    },
    inputGroup: {
        marginBottom: 16
    },
    label: {
        color: '#ccc',
        marginBottom: 6
    },
    input: {
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 12,
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 16,
    },
    active: {
        color: '#4ade80',
        fontWeight: '700',
    },
    inactive: {
        color: '#777',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8
    },
    btn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center'
    },
    cancelBtn: {
        backgroundColor: '#333'
    },
    cancelText: {
        color: '#fff',
        fontWeight: '600'
    },
    saveBtn: {
        backgroundColor: '#4ade80'
    },
    saveText: {
        color: '#000',
        fontWeight: '700'
    },
});

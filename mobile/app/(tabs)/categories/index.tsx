import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useAuth } from '@/context/AuthContext';

type FilterType = 'all' | 'income' | 'expense';

export default function CategoriesScreen() {
  const router = useRouter();
  const { api } = useAuth();

  const {
    categories,
    loading,
    loadCategories,
    deleteCategory,
  } = useCategoryStore();

  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (api) {
      loadCategories(api);
    }
  }, [api]);

  const filteredCategories = useMemo(() => {
    if (filter === 'all') return categories;
    return categories.filter((c) => c.type === filter);
  }, [filter, categories]);

  const incomeCount = categories.filter((c) => c.type === 'income').length;
  const expenseCount = categories.filter((c) => c.type === 'expense').length;

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(id, api);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.title}>{item.name}</Text>
          <Text
            style={[
              styles.badge,
              item.type === 'income' ? styles.income : styles.expense,
            ]}
          >
            {item.type}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push(`/categories/edit/${item._id}`)}
          >
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>

          <Pressable onPress={() => confirmDelete(item._id)}>
            <Text style={[styles.actionText, { color: 'red' }]}>
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Categories</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/categories/add')}
        >
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.stat}>Total: {categories.length}</Text>
        <Text style={styles.stat}>Income: {incomeCount}</Text>
        <Text style={styles.stat}>Expense: {expenseCount}</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {['all', 'income', 'expense'].map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterBtn,
              filter === f && styles.filterActive,
            ]}
            onPress={() => setFilter(f as FilterType)}
          >
            <Text style={styles.filterText}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : filteredCategories.length === 0 ? (
        <Text style={styles.empty}>No categories found</Text>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    color: '#aaa',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  filterActive: {
    backgroundColor: '#7c3aed',
  },
  filterText: {
    color: '#fff',
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    marginTop: 4,
    fontSize: 12,
  },
  income: {
    color: '#4ade80',
  },
  expense: {
    color: '#f87171',
  },
  actions: {
    gap: 8,
  },
  actionText: {
    color: '#60a5fa',
  },
  empty: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 40,
  },
});

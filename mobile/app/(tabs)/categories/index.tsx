import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
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
    <View style={styles.categoryCard}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={[
            styles.iconCircle,
            item.type === 'income' ? styles.incomeCircle : styles.expenseCircle
          ]}>
            <Text style={styles.categoryIcon}>
              {item.type === 'income' ? '💰' : '💸'}
            </Text>
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text
              style={[
                styles.categoryType,
                item.type === 'income' ? styles.incomeText : styles.expenseText,
              ]}
            >
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/categories/edit/${item._id}`)}
        >
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => confirmDelete(item._id)}
        >
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Categories</Text>
          <Text style={styles.subtitle}>
            {filteredCategories.length} {filter !== 'all' ? filter : ''} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{categories.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, styles.incomeStatCard]}>
          <Text style={[styles.statValue, styles.incomeText]}>
            {incomeCount}
          </Text>
          <Text style={styles.statLabel}>Income</Text>
        </View>
        <View style={[styles.statCard, styles.expenseStatCard]}>
          <Text style={[styles.statValue, styles.expenseText]}>
            {expenseCount}
          </Text>
          <Text style={styles.statLabel}>Expense</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {['all', 'income', 'expense'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterBtn,
              filter === f && styles.filterActive,
            ]}
            onPress={() => setFilter(f as FilterType)}
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

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ade80" />
        </View>
      ) : filteredCategories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No Categories Found</Text>
          <Text style={styles.emptySubtitle}>
            Create your first category to get started.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/categories/add')}
      >
        <Text style={styles.addText}>+ Add Category</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  heading: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  incomeStatCard: {
    backgroundColor: '#0d1f0d',
    borderColor: '#1a4d1a',
  },
  expenseStatCard: {
    backgroundColor: '#1f0d0d',
    borderColor: '#4d1a1a',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  incomeText: {
    color: '#4ade80',
  },
  expenseText: {
    color: '#f87171',
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  filterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  filterActive: {
    backgroundColor: '#1a4d1a',
    borderColor: '#2d7a2d',
  },
  filterText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 15,
  },
  filterTextActive: {
    color: '#4ade80',
    fontWeight: '700',
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardContent: {
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  categoryIcon: {
    fontSize: 24,
  },
  infoSection: {
    flex: 1,
  },
  categoryName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryType: {
    fontSize: 13,
    fontWeight: '500',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  addBtn: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: '#1a4d1a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d7a2d',
  },
  addText: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: 15,
  },
});
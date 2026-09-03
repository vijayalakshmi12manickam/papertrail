import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useCategories } from '../../hooks/useCategories';
import { useBudgetsWithProgress } from '../../hooks/useBudgetProgress';
import { useAddBudget, useUpdateBudget, useDeleteBudget } from '../../hooks/useBudgets';
import BudgetCard from '../../components/budget/BudgetCard';
import BudgetForm from '../../components/budget/BudgetForm';
import Modal from '../../components/common/Modal';

export default function BudgetScreen() {
  const { theme } = useAppTheme();
  const { budgets, isLoading } = useBudgetsWithProgress();
  const { data: categories = [] } = useCategories();

  const [formMode, setFormMode] = useState(null); // null | 'add' | 'edit'
  const [editingBudget, setEditingBudget] = useState(null);

  const addBudget = useAddBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  const handleAddSubmit = (data) => {
    addBudget.mutate(data, { onSuccess: () => setFormMode(null) });
  };

  const handleEditSubmit = (data) => {
    updateBudget.mutate(
      { id: editingBudget.id, ...data },
      {
        onSuccess: () => {
          setFormMode(null);
          setEditingBudget(null);
        },
      }
    );
  };

  const handleDelete = (budget) => {
    deleteBudget.mutate(budget.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: theme.spacing.xl }} color={theme.colors.accent} />
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 96 }}
          renderItem={({ item }) => {
            const category = categoryById[item.scopeValue];
            return (
              <BudgetCard
                budget={item}
                categoryLabel={category ? `${category.icon} ${category.name}` : '—'}
                onEdit={() => {
                  setEditingBudget(item);
                  setFormMode('edit');
                }}
                onDelete={() => handleDelete(item)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: theme.spacing.xl }}>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>
                No budgets yet. Create one for a category (e.g. Groceries this month) or a tag (e.g. a trip).
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => {
          setEditingBudget(null);
          setFormMode('add');
        }}
        style={[styles.fab, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill }]}
      >
        <Text style={{ color: '#FFF', fontSize: 26, marginTop: -2 }}>+</Text>
      </Pressable>

      <Modal visible={formMode === 'add'} onClose={() => setFormMode(null)} title="New Budget">
        <BudgetForm onSubmit={handleAddSubmit} onCancel={() => setFormMode(null)} submitting={addBudget.isPending} />
      </Modal>

      <Modal
        visible={formMode === 'edit'}
        onClose={() => {
          setFormMode(null);
          setEditingBudget(null);
        }}
        title="Edit Budget"
      >
        <BudgetForm
          initialBudget={editingBudget}
          onSubmit={handleEditSubmit}
          onCancel={() => {
            setFormMode(null);
            setEditingBudget(null);
          }}
          submitting={updateBudget.isPending}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

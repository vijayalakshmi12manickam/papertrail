import React, { useMemo, useState } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useCategories } from '../../hooks/useCategories';
import { useAccounts } from '../../hooks/useAccounts';
import { useExpensesInRange, getMonthRange, useAddExpense, useUpdateExpense, useDeleteExpense } from '../../hooks/useExpenses';
import FilterBar from '../../components/expenses/FilterBar';
import ExpenseListItem from '../../components/expenses/ExpenseListItem';
import ExpenseDetailContent from '../../components/expenses/ExpenseDetailContent';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import Modal from '../../components/common/Modal';

export default function ExpensesScreen() {
  const { theme } = useAppTheme();
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [accountFilter, setAccountFilter] = useState(null);

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | 'add' | 'edit'

  const { start, end } = useMemo(() => getMonthRange(year, monthIndex), [year, monthIndex]);
  const { data: expenses = [], isLoading, isRefetching, refetch } = useExpensesInRange(start, end);
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const addExpense = useAddExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accountById = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (categoryFilter && e.categoryId !== categoryFilter) return false;
      if (accountFilter && e.accountId !== accountFilter) return false;
      return true;
    });
  }, [expenses, categoryFilter, accountFilter]);

  const changeMonth = (delta) => {
    let m = monthIndex + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonthIndex(m);
    setYear(y);
  };

  const handleAddSubmit = (data) => {
    addExpense.mutate(data, { onSuccess: () => setFormMode(null) });
  };

  const handleEditSubmit = (data) => {
    updateExpense.mutate(
      { id: selectedExpense.id, ...data },
      {
        onSuccess: () => {
          setFormMode(null);
          setSelectedExpense(null);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteExpense.mutate(selectedExpense.id, { onSuccess: () => setSelectedExpense(null) });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FilterBar
        year={year}
        monthIndex={monthIndex}
        onChangeMonth={changeMonth}
        categories={categories}
        categoryFilter={categoryFilter}
        onChangeCategoryFilter={setCategoryFilter}
        accounts={accounts}
        accountFilter={accountFilter}
        onChangeAccountFilter={setAccountFilter}
      />

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: theme.spacing.xl }} color={theme.colors.accent} />
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 96 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.accent} colors={[theme.colors.accent]} />
          }
          renderItem={({ item }) => (
            <ExpenseListItem
              expense={item}
              category={categoryById[item.categoryId]}
              account={accountById[item.accountId]}
              onPress={setSelectedExpense}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: theme.spacing.xl }}>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
                No expenses for this month yet.
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => setFormMode('add')}
        style={[styles.fab, { backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill }]}
      >
        <Text style={{ color: '#FFF', fontSize: 26, marginTop: -2 }}>+</Text>
      </Pressable>

      {/* Detail modal */}
      <Modal visible={!!selectedExpense && !formMode} onClose={() => setSelectedExpense(null)} title="Expense">
        <ExpenseDetailContent
          expense={selectedExpense}
          category={selectedExpense ? categoryById[selectedExpense.categoryId] : null}
          account={selectedExpense ? accountById[selectedExpense.accountId] : null}
          onEdit={() => setFormMode('edit')}
          onDelete={handleDelete}
          deleting={deleteExpense.isPending}
        />
      </Modal>

      {/* Add modal */}
      <Modal visible={formMode === 'add'} onClose={() => setFormMode(null)} title="Add Expense">
        <ExpenseForm onSubmit={handleAddSubmit} onCancel={() => setFormMode(null)} submitting={addExpense.isPending} />
      </Modal>

      {/* Edit modal */}
      <Modal visible={formMode === 'edit'} onClose={() => setFormMode(null)} title="Edit Expense">
        <ExpenseForm
          initialExpense={selectedExpense}
          onSubmit={handleEditSubmit}
          onCancel={() => setFormMode(null)}
          submitting={updateExpense.isPending}
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

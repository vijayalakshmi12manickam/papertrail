import React from 'react';
import { Text, FlatList, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useExpensesByTag } from '../../hooks/useExpenses';
import ExpenseListItem from '../expenses/ExpenseListItem';

// The full, unbounded expense history for one tag — opened from the Dashboard
// tag cloud as its own view rather than filtering the (month-limited, 5-item)
// recent-expenses widget in place.
export default function TagExpensesList({ tag, categoryById, accountById, onPressExpense }) {
  const { theme } = useAppTheme();
  const { data: expenses = [], isLoading } = useExpensesByTag(tag);

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: theme.spacing.xl }} color={theme.colors.accent} />;
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: theme.spacing.md }}
      renderItem={({ item }) => (
        <ExpenseListItem
          expense={item}
          category={categoryById[item.categoryId]}
          account={accountById[item.accountId]}
          onPress={onPressExpense}
        />
      )}
      ListEmptyComponent={
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
          No expenses tagged #{tag}.
        </Text>
      }
    />
  );
}

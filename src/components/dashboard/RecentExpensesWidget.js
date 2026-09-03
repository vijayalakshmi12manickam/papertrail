import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import ExpenseListItem from '../expenses/ExpenseListItem';

export default function RecentExpensesWidget({ expenses, categoryById, accountById, onPress, tagFilter, limit = 5 }) {
  const { theme } = useAppTheme();
  const filtered = tagFilter ? expenses.filter((e) => (e.tags || []).includes(tagFilter)) : expenses;
  const visible = filtered.slice(0, limit);

  if (visible.length === 0) {
    return (
      <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
        {tagFilter ? `No expenses tagged #${tagFilter} this month.` : 'No recent expenses.'}
      </Text>
    );
  }

  return (
    <View>
      {visible.map((e) => (
        <ExpenseListItem
          key={e.id}
          expense={e}
          category={categoryById[e.categoryId]}
          account={accountById[e.accountId]}
          onPress={onPress}
        />
      ))}
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import ExpenseListItem from '../expenses/ExpenseListItem';

export default function RecentExpensesWidget({ expenses, categoryById, accountById, onPress, limit = 5 }) {
  const { theme } = useAppTheme();
  const visible = expenses.slice(0, limit);

  if (visible.length === 0) {
    return <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>No recent expenses.</Text>;
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

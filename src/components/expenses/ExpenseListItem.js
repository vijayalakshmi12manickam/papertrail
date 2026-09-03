import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, toJsDate } from '../../lib/format';

export default function ExpenseListItem({ expense, category, account, onPress }) {
  const { theme } = useAppTheme();
  const isShared = expense.isShared;

  return (
    <Pressable
      onPress={() => onPress(expense)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: isShared ? theme.colors.shared + '17' : theme.colors.surface,
          borderColor: isShared ? theme.colors.shared + '40' : theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.categoryDot,
          { backgroundColor: category?.color || theme.colors.textMuted },
        ]}
      >
        <Text style={{ fontSize: 16 }}>{category?.icon || '📦'}</Text>
      </View>

      <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {expense.item}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            {formatDate(toJsDate(expense.date))} · {account?.name || 'Unknown'}
          </Text>
          {isShared ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.shared + '30', borderRadius: theme.radius.pill },
              ]}
            >
              <Text style={[theme.typography.caption, { color: theme.colors.shared, fontWeight: '700' }]}>
                Shared
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text style={[theme.typography.amount, { color: theme.colors.textPrimary }]}>
        {formatCurrency(expense.amount, expense.currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  categoryDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});

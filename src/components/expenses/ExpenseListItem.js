import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, toJsDate } from '../../lib/format';

export default function ExpenseListItem({ expense, category, account, onPress, showTotal = false }) {
  const { theme } = useAppTheme();
  const isShared = expense.isShared;
  const displayAmount = showTotal && isShared ? expense.totalAmount : expense.amount;

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

      <View style={{ flex: 1, marginLeft: theme.spacing.sm, minWidth: 0 }}>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {expense.item}
        </Text>
        <View style={styles.metaRow}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textSecondary, flexShrink: 1 }]}
            numberOfLines={1}
          >
            {formatDate(toJsDate(expense.date))} · {account?.name || 'Unknown'}
          </Text>
          {isShared ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors.shared + '30', borderRadius: theme.radius.pill },
              ]}
            >
              <Ionicons name="people" size={12} color={theme.colors.shared} />
            </View>
          ) : null}
        </View>
      </View>

      <View style={{ marginLeft: theme.spacing.sm, alignItems: 'flex-end' }}>
        <Text style={[theme.typography.amount, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {formatCurrency(displayAmount, expense.currency)}
        </Text>
        {showTotal && isShared ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>total</Text>
        ) : null}
      </View>
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
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

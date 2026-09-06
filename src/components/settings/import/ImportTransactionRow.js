import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../context/ThemeContext';
import { formatCurrency, formatDate } from '../../../lib/format';

export default function ImportTransactionRow({ transaction, category, currency, onToggle, onEdit }) {
  const { theme } = useAppTheme();
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      onPress={() => onEdit(transaction)}
      style={[
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
        },
      ]}
    >
      <Pressable onPress={() => onToggle(transaction.localId)} hitSlop={10} style={{ marginRight: theme.spacing.sm }}>
        <Ionicons
          name={transaction.selected ? 'checkbox' : 'square-outline'}
          size={22}
          color={transaction.selected ? theme.colors.accent : theme.colors.textMuted}
        />
      </Pressable>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
          {formatDate(transaction.date)} · {category ? `${category.icon || ''} ${category.name}` : 'Uncategorized'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {transaction.possibleSelfTransfer ? (
            <Badge color={theme.colors.warning} label="Possible internal transfer" />
          ) : null}
          {transaction.isDuplicate ? <Badge color={theme.colors.danger} label="Possible duplicate" /> : null}
        </View>
      </View>

      <View style={{ alignItems: 'flex-end', marginLeft: theme.spacing.sm }}>
        <Text
          style={[theme.typography.amount, { color: isIncome ? theme.colors.success : theme.colors.textPrimary }]}
        >
          {isIncome ? '+' : ''}
          {formatCurrency(transaction.amount, currency)}
        </Text>
        <Ionicons name="pencil" size={14} color={theme.colors.textMuted} style={{ marginTop: 4 }} />
      </View>
    </Pressable>
  );
}

function Badge({ color, label }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: theme.radius.sm, backgroundColor: color + '25' }}>
      <Text style={[theme.typography.caption, { color, fontSize: 10, fontWeight: '700' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
});

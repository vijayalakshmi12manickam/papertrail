import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../lib/format';

// row: { personName, currency, amount } — positive = they owe you.
export default function BalanceRow({ row, onPress }) {
  const { theme } = useAppTheme();
  const owesYou = row.amount > 0;
  const color = owesYou ? theme.colors.success : theme.colors.danger;

  return (
    <Pressable
      onPress={() => onPress(row)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]}>{row.personName}</Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[theme.typography.amount, { color }]}>{formatCurrency(Math.abs(row.amount), row.currency)}</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
          {owesYou ? 'owes you' : 'you owe'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
});

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, toJsDate } from '../../lib/format';
import Button from '../common/Button';

export default function ExpenseDetailContent({ expense, category, account, onEdit, onDelete, deleting }) {
  const { theme } = useAppTheme();
  if (!expense) return null;

  const Row = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
      <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginBottom: 4 }]}>
        {expense.item}
      </Text>
      <Text
        style={[theme.typography.amountLarge, { color: theme.colors.textPrimary, marginBottom: theme.spacing.lg }]}
      >
        {formatCurrency(expense.amount, expense.currency)}
      </Text>

      <Row label="Date" value={formatDate(toJsDate(expense.date))} />
      <Row label="Category" value={`${category?.icon || ''} ${category?.name || '—'}`} />
      <Row label="Account" value={`${account?.icon || ''} ${account?.name || '—'}`} />
      <Row label="Transaction type" value={expense.txnType} />
      {expense.tags?.length ? <Row label="Tags" value={expense.tags.join(', ')} /> : null}

      {expense.isShared && (
        <View
          style={{
            marginTop: theme.spacing.md,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.shared + '17',
            borderRadius: theme.radius.md,
          }}
        >
          <Text style={[theme.typography.bodyStrong, { color: theme.colors.shared, marginBottom: 8 }]}>
            Shared — {formatCurrency(expense.totalAmount, expense.currency)} total, paid by {expense.paidBy}
          </Text>
          {expense.participants?.map((p, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>{p.name}</Text>
              <Text style={[theme.typography.amount, { color: theme.colors.textPrimary }]}>
                {formatCurrency(p.amount, expense.currency)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {(onEdit || onDelete) && (
        <View style={{ marginTop: theme.spacing.xl }}>
          {onEdit ? <Button title="Edit" onPress={onEdit} style={{ marginBottom: theme.spacing.sm }} /> : null}
          {onDelete ? <Button title="Delete" variant="outline" onPress={onDelete} loading={deleting} /> : null}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
});

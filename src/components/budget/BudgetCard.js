import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, toJsDate } from '../../lib/format';
import { budgetStatusColor } from '../../lib/aggregations';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';

export default function BudgetCard({ budget, categoryLabel, onEdit, onDelete }) {
  const { theme } = useAppTheme();
  const statusColor = budgetStatusColor(budget.percent, theme.colors);
  const scopeLabel = budget.scopeType === 'category' ? categoryLabel : `#${budget.scopeValue}`;
  const isOver = budget.percent >= 1;

  return (
    <Card style={{ marginBottom: theme.spacing.md }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]}>{scopeLabel}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {formatDate(toJsDate(budget.periodStart))} – {formatDate(toJsDate(budget.periodEnd))}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Pressable onPress={onEdit} hitSlop={8}>
            <Text style={[theme.typography.caption, { color: theme.colors.accent }]}>Edit</Text>
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8}>
            <Text style={[theme.typography.caption, { color: theme.colors.danger }]}>Delete</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: theme.spacing.sm, marginBottom: 6 }}>
        <ProgressBar percent={budget.percent} color={statusColor} />
      </View>

      <View style={styles.footerRow}>
        <Text style={[theme.typography.caption, { color: statusColor, fontWeight: '700' }]}>
          {formatCurrency(budget.spent, budget.currency)} of {formatCurrency(budget.totalBudget, budget.currency)}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
          {isOver
            ? `${formatCurrency(Math.abs(budget.remaining), budget.currency)} over`
            : `${formatCurrency(budget.remaining, budget.currency)} left`}
        </Text>
      </View>

      {budget.otherCurrencyCount > 0 ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 6 }]}>
          {budget.otherCurrencyCount} matching expense{budget.otherCurrencyCount > 1 ? 's' : ''} in a different
          currency not included
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
});

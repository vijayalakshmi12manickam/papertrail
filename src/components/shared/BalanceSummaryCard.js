import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../lib/format';
import Card from '../common/Card';

// rows: from balancesToRows() — [{ personName, currency, amount }]
export default function BalanceSummaryCard({ rows }) {
  const { theme } = useAppTheme();

  const totals = useMemo(() => {
    const owedToYou = {}; // currency -> amount
    const youOwe = {};
    for (const r of rows) {
      if (r.amount > 0) owedToYou[r.currency] = (owedToYou[r.currency] || 0) + r.amount;
      else youOwe[r.currency] = (youOwe[r.currency] || 0) + Math.abs(r.amount);
    }
    return { owedToYou, youOwe };
  }, [rows]);

  const renderTotals = (byCurrency) => {
    const entries = Object.entries(byCurrency);
    if (entries.length === 0) return '—';
    return entries.map(([cur, amt]) => formatCurrency(amt, cur)).join(' + ');
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>You are owed</Text>
          <Text style={[theme.typography.h2, { color: theme.colors.success, marginTop: 2 }]}>
            {renderTotals(totals.owedToYou)}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: theme.colors.border, marginHorizontal: 16 }} />
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>You owe</Text>
          <Text style={[theme.typography.h2, { color: theme.colors.danger, marginTop: 2 }]}>
            {renderTotals(totals.youOwe)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

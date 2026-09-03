import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../lib/format';
import Card from '../common/Card';

export default function MonthComparisonCard({ current, last, deltaPct, currency }) {
  const { theme } = useAppTheme();
  const up = deltaPct > 0;
  const flat = deltaPct === 0;
  const deltaColor = flat ? theme.colors.textSecondary : up ? theme.colors.danger : theme.colors.success;

  return (
    <Card style={{ marginBottom: 16 }}>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>This month</Text>
      <Text style={[theme.typography.amountLarge, { color: theme.colors.textPrimary, marginTop: 2 }]}>
        {formatCurrency(current, currency)}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <Text style={[theme.typography.bodyStrong, { color: deltaColor }]}>
          {flat ? '—' : `${up ? '▲' : '▼'} ${Math.abs(deltaPct)}%`}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 6 }]}>
          vs {formatCurrency(last, currency)} last month
        </Text>
      </View>
    </Card>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../lib/format';

export default function CategoryBreakdownList({ rows, currency, limit = 8 }) {
  const { theme } = useAppTheme();
  const visible = rows.slice(0, limit);
  const max = Math.max(...rows.map((r) => r.total), 1);

  if (visible.length === 0) {
    return (
      <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>No spending yet.</Text>
    );
  }

  return (
    <View>
      {visible.map((row) => (
        <View key={row.categoryId} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
              {row.icon} {row.name}
            </Text>
            <Text style={[theme.typography.amount, { color: theme.colors.textPrimary }]}>
              {formatCurrency(row.total, currency)}
            </Text>
          </View>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.surfaceAlt,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.max((row.total / max) * 100, 3)}%`,
                height: '100%',
                backgroundColor: row.color,
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import Select from '../common/Select';
import { formatMonthLabel } from '../../lib/format';

export default function FilterBar({
  year,
  monthIndex,
  onChangeMonth,
  categories,
  categoryFilter,
  onChangeCategoryFilter,
  accounts,
  accountFilter,
  onChangeAccountFilter,
}) {
  const { theme } = useAppTheme();

  const categoryOptions = [
    { label: 'All categories', value: null },
    ...categories.map((c) => ({ label: c.name, value: c.id, icon: c.icon })),
  ];
  const accountOptions = [
    { label: 'All accounts', value: null },
    ...accounts.map((a) => ({ label: a.name, value: a.id, icon: a.icon })),
  ];

  return (
    <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}>
      <View style={styles.monthRow}>
        <Pressable onPress={() => onChangeMonth(-1)} hitSlop={10} style={styles.arrowBtn}>
          <Text style={[theme.typography.h3, { color: theme.colors.accent }]}>‹</Text>
        </Pressable>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          {formatMonthLabel(year, monthIndex)}
        </Text>
        <Pressable onPress={() => onChangeMonth(1)} hitSlop={10} style={styles.arrowBtn}>
          <Text style={[theme.typography.h3, { color: theme.colors.accent }]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.filtersRow}>
        <View style={{ flex: 1 }}>
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={onChangeCategoryFilter}
            placeholder="All categories"
          />
        </View>
        <View style={{ width: theme.spacing.sm }} />
        <View style={{ flex: 1 }}>
          <Select
            options={accountOptions}
            value={accountFilter}
            onChange={onChangeAccountFilter}
            placeholder="All accounts"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 10,
  },
  arrowBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  filtersRow: { flexDirection: 'row' },
});

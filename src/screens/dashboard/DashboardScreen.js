import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useCategories } from '../../hooks/useCategories';
import { useAccounts } from '../../hooks/useAccounts';
import { useDashboardData } from '../../hooks/useDashboardData';
import {
  computeMonthlyTotals,
  computeCategoryTotals,
  computeTagTotals,
  computeMonthComparison,
} from '../../lib/aggregations';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import MonthComparisonCard from '../../components/dashboard/MonthComparisonCard';
import TrendChart from '../../components/dashboard/TrendChart';
import CategoryBreakdownList from '../../components/dashboard/CategoryBreakdownList';
import TagCloud from '../../components/dashboard/TagCloud';
import RecentExpensesWidget from '../../components/dashboard/RecentExpensesWidget';
import Modal from '../../components/common/Modal';
import ExpenseDetailContent from '../../components/expenses/ExpenseDetailContent';

export default function DashboardScreen() {
  const { theme } = useAppTheme();
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [displayCurrency, setDisplayCurrency] = useState('GBP');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const { yearExpenses, currentMonthExpenses, lastMonthExpenses, isLoading } = useDashboardData(year);
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accountById = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const currencyOptions = useMemo(() => {
    const set = new Set(['GBP', ...yearExpenses.map((e) => e.currency)]);
    return Array.from(set).map((c) => ({ label: c, value: c }));
  }, [yearExpenses]);

  const monthly = useMemo(
    () => computeMonthlyTotals(yearExpenses, displayCurrency, selectedCategoryIds),
    [yearExpenses, displayCurrency, selectedCategoryIds]
  );
  const categoryTotals = useMemo(
    () => computeCategoryTotals(currentMonthExpenses, categories, displayCurrency),
    [currentMonthExpenses, categories, displayCurrency]
  );
  const tagTotals = useMemo(() => computeTagTotals(yearExpenses, displayCurrency), [yearExpenses, displayCurrency]);
  const comparison = useMemo(
    () => computeMonthComparison(currentMonthExpenses, lastMonthExpenses, displayCurrency),
    [currentMonthExpenses, lastMonthExpenses, displayCurrency]
  );

  const toggleCategory = (id) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.md }}>
      <View style={{ marginBottom: theme.spacing.md }}>
        <Select label="Display currency" options={currencyOptions} value={displayCurrency} onChange={setDisplayCurrency} />
      </View>

      <MonthComparisonCard
        current={comparison.current}
        last={comparison.last}
        deltaPct={comparison.deltaPct}
        currency={displayCurrency}
      />

      <Card style={{ marginBottom: theme.spacing.md }}>
        <View style={styles.headerRow}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Monthly Trend</Text>
          <View style={styles.yearRow}>
            <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={10}>
              <Text style={[theme.typography.body, { color: theme.colors.accent }]}>‹</Text>
            </Pressable>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary, marginHorizontal: 8 }]}>
              {year}
            </Text>
            <Pressable onPress={() => setYear((y) => y + 1)} hitSlop={10}>
              <Text style={[theme.typography.body, { color: theme.colors.accent }]}>›</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: theme.spacing.sm }}>
          {categories.map((c) => {
            const active = selectedCategoryIds.includes(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => toggleCategory(c.id)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: theme.radius.pill,
                  backgroundColor: active ? c.color + '30' : theme.colors.surfaceAlt,
                  borderWidth: active ? 1 : 0,
                  borderColor: c.color,
                }}
              >
                <Text style={[theme.typography.caption, { color: active ? c.color : theme.colors.textSecondary }]}>
                  {c.icon} {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TrendChart totals={monthly.totals} currency={displayCurrency} />
        {monthly.otherCurrencyCount > 0 ? (
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginTop: 4 }]}>
            {monthly.otherCurrencyCount} expense{monthly.otherCurrencyCount > 1 ? 's' : ''} in a different currency
            not shown
          </Text>
        ) : null}
      </Card>

      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
          This Month by Category
        </Text>
        <CategoryBreakdownList rows={categoryTotals.rows} currency={displayCurrency} />
      </Card>

      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
          Tags
        </Text>
        <TagCloud tagTotals={tagTotals} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      </Card>

      <Card>
        <View style={styles.headerRow}>
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
            Recent Expenses{selectedTag ? ` — #${selectedTag}` : ''}
          </Text>
          {selectedTag ? (
            <Pressable onPress={() => setSelectedTag(null)} hitSlop={8}>
              <Text style={[theme.typography.caption, { color: theme.colors.accent }]}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={{ marginTop: theme.spacing.sm }}>
          <RecentExpensesWidget
            expenses={currentMonthExpenses}
            categoryById={categoryById}
            accountById={accountById}
            onPress={setSelectedExpense}
            tagFilter={selectedTag}
          />
        </View>
      </Card>

      <Modal visible={!!selectedExpense} onClose={() => setSelectedExpense(null)} title="Expense">
        {selectedExpense && (
          <ExpenseDetailContent
            expense={selectedExpense}
            category={categoryById[selectedExpense.categoryId]}
            account={accountById[selectedExpense.accountId]}
          />
        )}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  yearRow: { flexDirection: 'row', alignItems: 'center' },
});

import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate, toJsDate } from '../../lib/format';
import { getSharedExpensesForPerson } from '../../lib/aggregations';
import ExpenseListItem from '../expenses/ExpenseListItem';
import Button from '../common/Button';

export default function PersonDetailContent({
  personName,
  balanceRows,
  sharedExpenses,
  settlements,
  categoryById,
  accountById,
  onSettleUp,
  onExpensePress,
}) {
  const { theme } = useAppTheme();

  const personExpenses = useMemo(
    () => getSharedExpensesForPerson(personName, sharedExpenses),
    [personName, sharedExpenses]
  );
  const personSettlements = useMemo(
    () => settlements.filter((s) => s.personName === personName),
    [personName, settlements]
  );
  const myBalances = balanceRows.filter((r) => r.personName === personName);

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md }}>
      <View style={{ marginBottom: theme.spacing.lg }}>
        {myBalances.length === 0 ? (
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>All settled up.</Text>
        ) : (
          myBalances.map((row) => (
            <Text
              key={row.currency}
              style={[
                theme.typography.h2,
                { color: row.amount > 0 ? theme.colors.success : theme.colors.danger, marginBottom: 2 },
              ]}
            >
              {row.amount > 0 ? 'Owes you ' : 'You owe '}
              {formatCurrency(Math.abs(row.amount), row.currency)}
            </Text>
          ))
        )}
        <Button title="Settle Up" onPress={onSettleUp} style={{ marginTop: theme.spacing.md }} />
      </View>

      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 8 }]}>
        Shared expenses ({personExpenses.length})
      </Text>
      {personExpenses.length === 0 ? (
        <Text style={[theme.typography.body, { color: theme.colors.textMuted, marginBottom: theme.spacing.lg }]}>
          No shared expenses with {personName} yet.
        </Text>
      ) : (
        personExpenses.map((e) => (
          <ExpenseListItem
            key={e.id}
            expense={e}
            category={categoryById[e.categoryId]}
            account={accountById[e.accountId]}
            onPress={onExpensePress}
          />
        ))
      )}

      {personSettlements.length > 0 && (
        <>
          <Text
            style={[theme.typography.h3, { color: theme.colors.textPrimary, marginTop: theme.spacing.md, marginBottom: 8 }]}
          >
            Settlement history
          </Text>
          {personSettlements.map((s) => (
            <View
              key={s.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                {s.direction === 'theyPaidMe' ? `${personName} paid you` : `You paid ${personName}`}
                {s.note ? ` — ${s.note}` : ''}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[theme.typography.amount, { color: theme.colors.textPrimary }]}>
                  {formatCurrency(s.amount, s.currency)}
                </Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                  {formatDate(toJsDate(s.date))}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

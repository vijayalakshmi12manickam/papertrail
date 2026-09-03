import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useCategories } from '../../hooks/useCategories';
import { useAccounts } from '../../hooks/useAccounts';
import { useSharedExpenses } from '../../hooks/useSharedExpenses';
import { useSettlements, useAddSettlement } from '../../hooks/useSettlements';
import { computeBalances, balancesToRows } from '../../lib/aggregations';
import BalanceSummaryCard from '../../components/shared/BalanceSummaryCard';
import BalanceRow from '../../components/shared/BalanceRow';
import PersonDetailContent from '../../components/shared/PersonDetailContent';
import SettlementForm from '../../components/shared/SettlementForm';
import ExpenseListItem from '../../components/expenses/ExpenseListItem';
import ExpenseDetailContent from '../../components/expenses/ExpenseDetailContent';
import Modal from '../../components/common/Modal';

export default function SharedExpensesScreen() {
  const { theme } = useAppTheme();
  const { data: sharedExpenses = [], isLoading: expensesLoading } = useSharedExpenses();
  const { data: settlements = [], isLoading: settlementsLoading } = useSettlements();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const addSettlement = useAddSettlement();

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [settling, setSettling] = useState(false);

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accountById = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const balances = useMemo(() => computeBalances(sharedExpenses, settlements), [sharedExpenses, settlements]);
  const balanceRows = useMemo(() => balancesToRows(balances), [balances]);

  const isLoading = expensesLoading || settlementsLoading;

  const personSummary = (personName) => balanceRows.find((r) => r.personName === personName);

  const handleSettleSubmit = (data) => {
    addSettlement.mutate(data, { onSuccess: () => setSettling(false) });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: theme.spacing.xl }} color={theme.colors.accent} />
      ) : (
        <FlatList
          data={sharedExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 48 }}
          ListHeaderComponent={
            <View style={{ marginBottom: theme.spacing.md }}>
              <BalanceSummaryCard rows={balanceRows} />

              {balanceRows.length > 0 && (
                <>
                  <Text
                    style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 8 }]}
                  >
                    By person
                  </Text>
                  {balanceRows.map((row) => (
                    <BalanceRow key={`${row.personName}-${row.currency}`} row={row} onPress={() => setSelectedPerson(row.personName)} />
                  ))}
                </>
              )}

              <Text
                style={[
                  theme.typography.h3,
                  { color: theme.colors.textPrimary, marginTop: theme.spacing.md, marginBottom: 8 },
                ]}
              >
                All shared expenses
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ExpenseListItem
              expense={item}
              category={categoryById[item.categoryId]}
              account={accountById[item.accountId]}
              onPress={setSelectedExpense}
            />
          )}
          ListEmptyComponent={
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
              No shared expenses logged yet.
            </Text>
          }
        />
      )}

      {/* Person detail */}
      <Modal
        visible={!!selectedPerson && !settling}
        onClose={() => setSelectedPerson(null)}
        title={selectedPerson || ''}
      >
        {selectedPerson && (
          <PersonDetailContent
            personName={selectedPerson}
            balanceRows={balanceRows}
            sharedExpenses={sharedExpenses}
            settlements={settlements}
            categoryById={categoryById}
            accountById={accountById}
            onSettleUp={() => setSettling(true)}
            onExpensePress={(e) => {
              setSelectedPerson(null);
              setSelectedExpense(e);
            }}
          />
        )}
      </Modal>

      {/* Settle up */}
      <Modal visible={settling} onClose={() => setSettling(false)} title="Settle Up">
        <SettlementForm
          initialPersonName={selectedPerson}
          initialDirection={
            selectedPerson && personSummary(selectedPerson)?.amount > 0 ? 'theyPaidMe' : 'iPaidThem'
          }
          initialAmount={selectedPerson ? Math.abs(personSummary(selectedPerson)?.amount || 0) || undefined : undefined}
          initialCurrency={selectedPerson ? personSummary(selectedPerson)?.currency : undefined}
          onSubmit={handleSettleSubmit}
          onCancel={() => setSettling(false)}
          submitting={addSettlement.isPending}
        />
      </Modal>

      {/* Expense detail (read-only here — edits happen from the Expenses tab) */}
      <Modal visible={!!selectedExpense} onClose={() => setSelectedExpense(null)} title="Expense">
        {selectedExpense && (
          <ExpenseDetailContent
            expense={selectedExpense}
            category={categoryById[selectedExpense.categoryId]}
            account={accountById[selectedExpense.accountId]}
          />
        )}
      </Modal>
    </View>
  );
}

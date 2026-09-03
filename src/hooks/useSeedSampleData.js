import { useMutation, useQueryClient } from '@tanstack/react-query';
import { writeBatch, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { expensesCol, budgetsCol, settlementsCol } from '../../firebase/collections';
import { useAuth } from '../context/AuthContext';
import { useCategories } from './useCategories';
import { useAccounts } from './useAccounts';
import { buildSampleExpenses, buildSampleBudgets, buildSampleSettlements } from '../lib/seedData';

const ts = (d) => Timestamp.fromDate(d);

export function useSeedSampleData() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  return useMutation({
    mutationFn: async () => {
      if (categories.length === 0 || accounts.length === 0) {
        throw new Error('Categories and accounts must load first — try again in a moment.');
      }

      const expenses = buildSampleExpenses(categories, accounts);
      const budgets = buildSampleBudgets(categories);
      const settlements = buildSampleSettlements();

      const batch = writeBatch(db);

      for (const e of expenses) {
        batch.set(doc(expensesCol(user.uid)), { ...e, date: ts(e.date) });
      }
      for (const b of budgets) {
        batch.set(doc(budgetsCol(user.uid)), {
          ...b,
          periodStart: ts(b.periodStart),
          periodEnd: ts(b.periodEnd),
        });
      }
      for (const s of settlements) {
        batch.set(doc(settlementsCol(user.uid)), { ...s, date: ts(s.date) });
      }

      await batch.commit();
      return { expenseCount: expenses.length, budgetCount: budgets.length, settlementCount: settlements.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', user.uid] });
      qc.invalidateQueries({ queryKey: ['sharedExpenses', user.uid] });
      qc.invalidateQueries({ queryKey: ['budgets', user.uid] });
      qc.invalidateQueries({ queryKey: ['settlements', user.uid] });
    },
  });
}

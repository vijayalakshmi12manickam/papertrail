import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useBudgets } from './useBudgets';
import { fetchExpensesInRange } from './useExpenses';
import { computeBudgetSpent } from '../lib/aggregations';
import { toJsDate } from '../lib/format';

// Each budget typically has its own period, so this issues one range query per
// budget — but the queryKey matches whatever useExpensesInRange would use for
// the same range, so if e.g. the Expenses tab already fetched this month,
// the budget card reuses that cached data instead of re-reading Firestore.
export function useBudgetsWithProgress() {
  const { user } = useAuth();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();

  const expenseQueries = useQueries({
    queries: budgets.map((budget) => {
      const start = toJsDate(budget.periodStart);
      const end = toJsDate(budget.periodEnd);
      return {
        queryKey: ['expenses', user?.uid, start?.toISOString(), end?.toISOString()],
        queryFn: () => fetchExpensesInRange(user.uid, start, end),
        enabled: !!user && !!start && !!end,
        staleTime: 2 * 60 * 1000,
      };
    }),
  });

  const budgetsWithProgress = useMemo(() => {
    return budgets.map((budget, i) => {
      const expensesInRange = expenseQueries[i]?.data || [];
      const progress = computeBudgetSpent(budget, expensesInRange);
      return { ...budget, ...progress, loading: expenseQueries[i]?.isLoading };
    });
  }, [budgets, expenseQueries]);

  return {
    budgets: budgetsWithProgress,
    isLoading: budgetsLoading || expenseQueries.some((q) => q.isLoading),
  };
}

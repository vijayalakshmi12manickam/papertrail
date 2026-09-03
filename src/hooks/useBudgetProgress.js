import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useBudgets } from './useBudgets';
import { fetchExpensesInRange } from './useExpenses';
import { computeBudgetSpent, startOfDay, endOfDayExclusive } from '../lib/aggregations';
import { toJsDate } from '../lib/format';

// Each budget typically has its own period, so this issues one range query per
// budget — but the queryKey matches whatever useExpensesInRange would use for
// the same range, so if e.g. the Expenses tab already fetched this month,
// the budget card reuses that cached data instead of re-reading Firestore.
export function useBudgetsWithProgress() {
  const { user } = useAuth();
  const budgetsQuery = useBudgets();
  const budgets = budgetsQuery.data || [];

  const expenseQueries = useQueries({
    queries: budgets.map((budget) => {
      const rawStart = toJsDate(budget.periodStart);
      const rawEnd = toJsDate(budget.periodEnd);
      // Widen to full calendar days so the budget includes every expense dated
      // within its start/end days, regardless of the time-of-day the budget
      // itself happened to be created or edited at — see comment in aggregations.js.
      const start = rawStart ? startOfDay(rawStart) : null;
      const end = rawEnd ? endOfDayExclusive(rawEnd) : null;
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

  // Not memoized with useCallback: expenseQueries is a fresh array every render
  // (from useQueries), and closing over a stale one could refetch the wrong
  // budget's date range if the budget list changes between renders.
  const refetch = () => Promise.all([budgetsQuery.refetch(), ...expenseQueries.map((q) => q.refetch())]);

  return {
    budgets: budgetsWithProgress,
    isLoading: budgetsQuery.isLoading || expenseQueries.some((q) => q.isLoading),
    isRefetching: budgetsQuery.isRefetching || expenseQueries.some((q) => q.isRefetching),
    refetch,
  };
}

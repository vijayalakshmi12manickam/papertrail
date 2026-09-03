import { useMemo } from 'react';
import { useExpensesInRange, getYearRange, getMonthRange } from './useExpenses';

// Query keys match useExpensesInRange's convention exactly, so if the user
// already viewed "this month" on the Expenses tab, that read is reused here
// for free — no extra Firestore call.
export function useDashboardData(selectedYear) {
  const now = useMemo(() => new Date(), []);
  const { start: yearStart, end: yearEnd } = useMemo(() => getYearRange(selectedYear), [selectedYear]);
  const { start: curStart, end: curEnd } = useMemo(
    () => getMonthRange(now.getFullYear(), now.getMonth()),
    [now]
  );
  const lastMonthDate = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), [now]);
  const { start: lastStart, end: lastEnd } = useMemo(
    () => getMonthRange(lastMonthDate.getFullYear(), lastMonthDate.getMonth()),
    [lastMonthDate]
  );

  const yearQuery = useExpensesInRange(yearStart, yearEnd);
  const currentMonthQuery = useExpensesInRange(curStart, curEnd);
  const lastMonthQuery = useExpensesInRange(lastStart, lastEnd);

  return {
    yearExpenses: yearQuery.data || [],
    currentMonthExpenses: currentMonthQuery.data || [],
    lastMonthExpenses: lastMonthQuery.data || [],
    isLoading: yearQuery.isLoading || currentMonthQuery.isLoading || lastMonthQuery.isLoading,
  };
}

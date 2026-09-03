import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { expensesCol, expenseDoc } from '../../firebase/collections';
import { useAuth } from '../context/AuthContext';

export function toTimestamp(date) {
  return date instanceof Date ? Timestamp.fromDate(date) : Timestamp.fromDate(new Date(date));
}

export async function fetchExpensesInRange(uid, startDate, endDate) {
  const q = query(
    expensesCol(uid),
    where('date', '>=', toTimestamp(startDate)),
    where('date', '<', toTimestamp(endDate)),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Fetches exactly the window a screen needs (e.g. one month for Expenses tab,
// one year for the Dashboard trend chart) rather than the whole collection —
// this is the main read-count lever for the free tier. Callers should pass
// stable Date objects (e.g. memoized) so the query key doesn't churn.
export function useExpensesInRange(startDate, endDate, options = {}) {
  const { user } = useAuth();
  const key = [
    'expenses',
    user?.uid,
    startDate?.toISOString?.(),
    endDate?.toISOString?.(),
  ];
  return useQuery({
    queryKey: key,
    queryFn: () => fetchExpensesInRange(user.uid, startDate, endDate),
    enabled: !!user && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes — expenses change often within a session
    ...options,
  });
}

function invalidateAllExpenseQueries(qc, uid) {
  // We don't know which cached ranges an add/edit/delete affects, so invalidate
  // every 'expenses' query for this user. They only refetch when next viewed
  // (React Query doesn't refetch inactive queries eagerly). 'sharedExpenses' is
  // a separate cached query (see useSharedExpenses) and needs its own invalidation.
  qc.invalidateQueries({ queryKey: ['expenses', uid] });
  qc.invalidateQueries({ queryKey: ['sharedExpenses', uid] });
}

export function useAddExpense() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expense) =>
      addDoc(expensesCol(user.uid), {
        ...expense,
        date: toTimestamp(expense.date),
        type: expense.type || 'expense',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    onSuccess: () => invalidateAllExpenseQueries(qc, user.uid),
  });
}

export function useUpdateExpense() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...changes }) => {
      const payload = { ...changes, updatedAt: serverTimestamp() };
      if (changes.date) payload.date = toTimestamp(changes.date);
      return updateDoc(expenseDoc(user.uid, id), payload);
    },
    onSuccess: () => invalidateAllExpenseQueries(qc, user.uid),
  });
}

export function useDeleteExpense() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (expenseId) => deleteDoc(expenseDoc(user.uid, expenseId)),
    onSuccess: () => invalidateAllExpenseQueries(qc, user.uid),
  });
}

// Convenience helpers for the common "current month" / "given year" windows.
export function getMonthRange(year, monthIndex /* 0-based */) {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);
  return { start, end };
}

export function getYearRange(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return { start, end };
}

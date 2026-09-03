import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, updateDoc, deleteDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { budgetsCol, budgetDoc } from '../../firebase/collections';
import { useAuth } from '../context/AuthContext';

function toTimestamp(date) {
  return date instanceof Date ? Timestamp.fromDate(date) : Timestamp.fromDate(new Date(date));
}

async function fetchBudgets(uid) {
  const q = query(budgetsCol(uid), orderBy('periodStart', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Budgets are few in number even for a heavy user (a handful of active ones at
// a time), so we fetch the whole collection rather than range-querying —
// simpler, and still a tiny read cost.
export function useBudgets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['budgets', user?.uid],
    queryFn: () => fetchBudgets(user.uid),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddBudget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (budget) =>
      addDoc(budgetsCol(user.uid), {
        ...budget,
        periodStart: toTimestamp(budget.periodStart),
        periodEnd: toTimestamp(budget.periodEnd),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', user.uid] }),
  });
}

export function useUpdateBudget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...changes }) => {
      const payload = { ...changes };
      if (changes.periodStart) payload.periodStart = toTimestamp(changes.periodStart);
      if (changes.periodEnd) payload.periodEnd = toTimestamp(changes.periodEnd);
      return updateDoc(budgetDoc(user.uid, id), payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', user.uid] }),
  });
}

export function useDeleteBudget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (budgetId) => deleteDoc(budgetDoc(user.uid, budgetId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', user.uid] }),
  });
}

import { useQuery } from '@tanstack/react-query';
import { getDocs, query, where, orderBy } from 'firebase/firestore';
import { expensesCol } from '../../firebase/collections';
import { useAuth } from '../context/AuthContext';

// Requires a composite index on (isShared ASC, date DESC) — Firestore will
// print a console link to create it the first time this runs against a real
// project; click it once and it's done.
async function fetchSharedExpenses(uid) {
  const q = query(expensesCol(uid), where('isShared', '==', true), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Balances need the FULL shared-expense history, not just a month, so this
// intentionally doesn't range-query. It's still a modest read cost in
// practice — shared expenses are typically a fraction of all expenses — and
// a 5-minute staleTime means normal tab-switching doesn't re-read at all.
export function useSharedExpenses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['sharedExpenses', user?.uid],
    queryFn: () => fetchSharedExpenses(user.uid),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

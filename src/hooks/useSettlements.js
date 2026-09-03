import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, deleteDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { settlementsCol, settlementDoc } from '../../firebase/collections';
import { useAuth } from '../context/AuthContext';

function toTimestamp(date) {
  return date instanceof Date ? Timestamp.fromDate(date) : Timestamp.fromDate(new Date(date));
}

async function fetchSettlements(uid) {
  const q = query(settlementsCol(uid), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Settlements are a running ledger, not tied to individual expenses — fetched
// in full (typically a small collection) and combined with shared-expense
// participant amounts client-side (see lib/aggregations.js, next step) to
// produce per-person balances.
export function useSettlements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['settlements', user?.uid],
    queryFn: () => fetchSettlements(user.uid),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddSettlement() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settlement) =>
      addDoc(settlementsCol(user.uid), { ...settlement, date: toTimestamp(settlement.date) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settlements', user.uid] }),
  });
}

export function useDeleteSettlement() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settlementId) => deleteDoc(settlementDoc(user.uid, settlementId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settlements', user.uid] }),
  });
}

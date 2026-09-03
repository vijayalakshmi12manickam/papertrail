import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, deleteDoc, getDocs, writeBatch, doc, query, orderBy } from 'firebase/firestore';
import { currenciesCol, currencyDoc } from '../../firebase/collections';
import { db } from '../../firebase/config';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CURRENCIES = ['GBP', 'USD', 'EUR', 'ISK', 'JPY', 'AUD', 'CAD'];

async function fetchOrSeedCurrencies(uid) {
  const q = query(currenciesCol(uid), orderBy('order', 'asc'));
  const snap = await getDocs(q);

  if (!snap.empty) {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // First run for this user: seed the default currency list in one batched write,
  // same pattern as categories/accounts.
  const batch = writeBatch(db);
  const seeded = [];
  DEFAULT_CURRENCIES.forEach((code, i) => {
    const ref = doc(currenciesCol(uid));
    const data = { name: code, order: i };
    batch.set(ref, data);
    seeded.push({ id: ref.id, ...data });
  });
  await batch.commit();
  return seeded;
}

// Currencies are reference data like categories/accounts (same seed-once /
// cache-long pattern), and get the same AsyncStorage-persisted React Query cache
// (see App.js) so the currency dropdown still has data when adding an expense offline.
export function useCurrencies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['currencies', user?.uid],
    queryFn: () => fetchOrSeedCurrencies(user.uid),
    enabled: !!user,
    staleTime: 60 * 60 * 1000, // 1 hour — currencies rarely change
  });
}

export function useAddCurrency() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, order }) =>
      addDoc(currenciesCol(user.uid), { name: name.trim().toUpperCase(), order: order ?? 999 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currencies', user.uid] }),
  });
}

export function useDeleteCurrency() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (currencyId) => deleteDoc(currencyDoc(user.uid, currencyId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['currencies', user.uid] }),
  });
}

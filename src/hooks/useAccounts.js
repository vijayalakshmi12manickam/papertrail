import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, deleteDoc, getDocs, writeBatch, doc, query, orderBy } from 'firebase/firestore';
import { accountsCol, accountDoc } from '../../firebase/collections';
import { db } from '../../firebase/config';
import { useAuth } from '../context/AuthContext';

const DEFAULT_ACCOUNTS = [
  { name: 'Cash', icon: '💵', color: '#5B6472' },
  { name: 'Monzo', icon: '💳', color: '#0FA3A3' },
  { name: 'Revolut', icon: '💳', color: '#1E3A5F' },
];

async function fetchOrSeedAccounts(uid) {
  const q = query(accountsCol(uid), orderBy('order', 'asc'));
  const snap = await getDocs(q);

  if (!snap.empty) {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  const batch = writeBatch(db);
  const seeded = [];
  DEFAULT_ACCOUNTS.forEach((acc, i) => {
    const ref = doc(accountsCol(uid));
    const data = { ...acc, order: i };
    batch.set(ref, data);
    seeded.push({ id: ref.id, ...data });
  });
  await batch.commit();
  return seeded;
}

export function useAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['accounts', user?.uid],
    queryFn: () => fetchOrSeedAccounts(user.uid),
    enabled: !!user,
    staleTime: 60 * 60 * 1000, // 1 hour — accounts rarely change
  });
}

export function useAddAccount() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, icon, color, order }) =>
      addDoc(accountsCol(user.uid), { name, icon: icon || '🏦', color: color || '#8A93A0', order: order ?? 999 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts', user.uid] }),
  });
}

export function useDeleteAccount() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (accountId) => deleteDoc(accountDoc(user.uid, accountId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts', user.uid] }),
  });
}

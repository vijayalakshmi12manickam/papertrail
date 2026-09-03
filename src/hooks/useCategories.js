import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDoc, deleteDoc, getDocs, writeBatch, doc, query, orderBy } from 'firebase/firestore';
import { categoriesCol, categoryDoc } from '../../firebase/collections';
import { db } from '../../firebase/config';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CATEGORIES = [
  { name: 'Groceries', icon: '🛒', color: '#0FA3A3' },
  { name: 'Travel', icon: '✈️', color: '#1E3A5F' },
  { name: 'Dining', icon: '🍽️', color: '#E0A22C' },
  { name: 'Bills & Utilities', icon: '💡', color: '#D64545' },
  { name: 'Entertainment', icon: '🎬', color: '#6E5AC7' },
  { name: 'Health', icon: '💊', color: '#2E9E5B' },
  { name: 'Shopping', icon: '🛍️', color: '#5B6472' },
  { name: 'Other', icon: '📦', color: '#8A93A0' },
];

async function fetchOrSeedCategories(uid) {
  const q = query(categoriesCol(uid), orderBy('order', 'asc'));
  const snap = await getDocs(q);

  if (!snap.empty) {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // First run for this user: seed defaults in a single batched write (1 write op,
  // not N) so onboarding doesn't cost more than a normal mutation would.
  const batch = writeBatch(db);
  const seeded = [];
  DEFAULT_CATEGORIES.forEach((cat, i) => {
    const ref = doc(categoriesCol(uid));
    const data = { ...cat, order: i };
    batch.set(ref, data);
    seeded.push({ id: ref.id, ...data });
  });
  await batch.commit();
  return seeded;
}

export function useCategories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['categories', user?.uid],
    queryFn: () => fetchOrSeedCategories(user.uid),
    enabled: !!user,
    staleTime: 60 * 60 * 1000, // 1 hour — categories rarely change
  });
}

export function useAddCategory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, icon, color, order }) =>
      addDoc(categoriesCol(user.uid), { name, icon: icon || '🏷️', color: color || '#8A93A0', order: order ?? 999 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories', user.uid] }),
  });
}

export function useDeleteCategory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId) => deleteDoc(categoryDoc(user.uid, categoryId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories', user.uid] }),
  });
}

import { getDocs, query, orderBy } from 'firebase/firestore';
import { expensesCol } from '../../firebase/collections';

// Deliberately not a React Query hook — export is a rare, explicit user
// action, not something that should sit in cache getting silently refetched.
// One full read of the collection when the button is pressed, nothing more.
export async function fetchAllExpensesOnce(uid) {
  const q = query(expensesCol(uid), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

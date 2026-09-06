import { useMutation, useQueryClient } from '@tanstack/react-query';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { expensesCol } from '../../firebase/collections';
import { useAuth } from '../context/AuthContext';
import { toTimestamp } from './useExpenses';

// Firestore batches cap at 500 writes; a large statement (a year of Barclays
// transactions, say) could exceed that, so writes are chunked well under the
// limit rather than assuming one batch is always enough.
const CHUNK_SIZE = 400;

export function useBulkImportExpenses() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (expenses) => {
      for (let i = 0; i < expenses.length; i += CHUNK_SIZE) {
        const chunk = expenses.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const expense of chunk) {
          batch.set(doc(expensesCol(user.uid)), {
            ...expense,
            date: toTimestamp(expense.date),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
      return { count: expenses.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', user.uid] });
      qc.invalidateQueries({ queryKey: ['sharedExpenses', user.uid] });
    },
  });
}

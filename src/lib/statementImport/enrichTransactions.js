import { looksLikeSelfTransfer, nameToTokens } from './selfTransfer';
import { suggestCategoryId } from './categorize';
import { findDuplicate } from './duplicates';

// Turns raw parsed rows (date/description/amount/direction) into the fully
// review-screen-ready shape: category suggestion, self-transfer flag, and
// duplicate detection against what's already in Firestore.
export function enrichTransactions(rawTransactions, { holderName, categories = [], existingExpenses = [] } = {}) {
  const holderTokens = nameToTokens(holderName);

  return rawTransactions.map((t, index) => {
    const transferCheck = looksLikeSelfTransfer(`${t.description} ${t.reference || ''}`, holderTokens);
    const duplicate = findDuplicate(t, existingExpenses);

    return {
      localId: `import-${index}`,
      date: t.date,
      description: t.description,
      reference: t.reference || null,
      amount: t.amount,
      direction: t.direction,
      type: t.direction === 'in' ? 'income' : 'expense',
      txnType: t.txnTypeHint === 'card' || t.txnTypeHint === 'transfer' ? t.txnTypeHint : 'other',
      categoryId: t.direction === 'out' ? suggestCategoryId(t.description, categories) : null,
      possibleSelfTransfer: transferCheck.flagged,
      selfTransferReason: transferCheck.reason,
      isDuplicate: !!duplicate,
      selected: !transferCheck.flagged && !duplicate,
    };
  });
}

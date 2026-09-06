import { toJsDate } from '../format';

// Flags a parsed transaction as a likely duplicate of an expense that already
// exists in Firestore — same day, same amount, and a loose description
// overlap (bank statement wording rarely matches the app's own free-text
// item name exactly, so this deliberately isn't an exact-string match).
export function findDuplicate(transaction, existingExpenses) {
  return existingExpenses.find((e) => {
    const existingDate = toJsDate(e.date);
    if (!existingDate) return false;
    const sameDay = existingDate.toDateString() === transaction.date.toDateString();
    if (!sameDay) return false;

    const sameAmount = Math.abs(Number(e.amount) - transaction.amount) < 0.01;
    if (!sameAmount) return false;

    const a = (e.item || '').toLowerCase();
    const b = (transaction.description || '').toLowerCase();
    if (!a || !b) return true; // same day + amount is already a strong signal

    const shortest = a.length < b.length ? a : b;
    const longest = a.length < b.length ? b : a;
    return longest.includes(shortest.slice(0, Math.min(8, shortest.length)));
  });
}

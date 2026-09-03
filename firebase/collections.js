import { collection, doc } from 'firebase/firestore';
import { db } from './config';

// All data lives under users/{uid}/... — a single ownership rule covers everything:
// match /users/{uid}/{document=**} { allow read, write: if request.auth.uid == uid; }

export const userDoc = (uid) => doc(db, 'users', uid);

export const expensesCol = (uid) => collection(db, 'users', uid, 'expenses');
export const expenseDoc = (uid, id) => doc(db, 'users', uid, 'expenses', id);

export const categoriesCol = (uid) => collection(db, 'users', uid, 'categories');
export const categoryDoc = (uid, id) => doc(db, 'users', uid, 'categories', id);

export const accountsCol = (uid) => collection(db, 'users', uid, 'accounts');
export const accountDoc = (uid, id) => doc(db, 'users', uid, 'accounts', id);

export const budgetsCol = (uid) => collection(db, 'users', uid, 'budgets');
export const budgetDoc = (uid, id) => doc(db, 'users', uid, 'budgets', id);

export const settlementsCol = (uid) => collection(db, 'users', uid, 'settlements');
export const settlementDoc = (uid, id) => doc(db, 'users', uid, 'settlements', id);

export const currenciesCol = (uid) => collection(db, 'users', uid, 'currencies');
export const currencyDoc = (uid, id) => doc(db, 'users', uid, 'currencies', id);

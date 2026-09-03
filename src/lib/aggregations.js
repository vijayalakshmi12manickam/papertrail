// Budgets are edited via date pickers that only show a calendar day (no time
// picker), but the underlying Date objects keep whatever time-of-day they were
// created with — e.g. a brand-new budget defaults `periodStart` to `new Date()`
// (the exact moment of creation). Used raw, that excludes any expense dated
// earlier the same day (added before the budget was created) and, at the other
// end, expenses dated exactly on `periodEnd`'s calendar day. Normalizing both
// ends to full calendar-day boundaries makes the range behave the way the UI
// presents it: every expense dated anywhere within [periodStart, periodEnd],
// regardless of when the budget itself was created or edited.
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDayExclusive(date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
}

// A budget "matches" an expense if it's scoped to that expense's category,
// or scoped to a tag the expense carries. Income rows never count against
// a spending budget.
export function matchesBudgetScope(expense, budget) {
  if (expense.type === 'income') return false;
  if (budget.scopeType === 'category') return expense.categoryId === budget.scopeValue;
  if (budget.scopeType === 'tag') return (expense.tags || []).includes(budget.scopeValue);
  return false;
}

// expensesInRange: expenses already fetched for [budget.periodStart, budget.periodEnd).
// Only sums the user's own share (`amount`), per the earlier agreement that
// shared-expense budgets track your share, not the receipt total. Expenses in
// a different currency than the budget are excluded from the total but
// counted separately so the UI can flag them rather than silently mixing
// currencies into one number.
export function computeBudgetSpent(budget, expensesInRange) {
  const matching = expensesInRange.filter((e) => matchesBudgetScope(e, budget));
  const sameCurrency = matching.filter((e) => e.currency === budget.currency);
  const otherCurrency = matching.filter((e) => e.currency !== budget.currency);

  const spent = sameCurrency.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const percent = budget.totalBudget > 0 ? spent / budget.totalBudget : 0;

  return {
    spent,
    remaining: budget.totalBudget - spent,
    percent, // can exceed 1 when over budget
    matchCount: matching.length,
    otherCurrencyCount: otherCurrency.length,
  };
}

export function budgetStatusColor(percent, colors) {
  if (percent >= 1) return colors.danger;
  if (percent >= 0.8) return colors.warning;
  return colors.success;
}

// Balances are a pure client-side reduction over every shared expense plus
// every settlement — no stored ledger, so there's nothing to keep in sync.
// Sign convention: positive = they owe you; negative = you owe them.
// Balances are kept separate per currency (a person can owe you in more than
// one currency) rather than force-converting, matching the multi-currency
// design used elsewhere.
//
// Only tracks the two-party relationship between "You" and each other named
// participant — this is a single-user ledger, not a full multi-party splitter,
// so a third participant's share on someone else's paid expense isn't tracked.
export function computeBalances(sharedExpenses, settlements, myName = 'You') {
  const balances = {}; // { [personName]: { [currency]: amount } }

  const add = (person, currency, delta) => {
    if (!balances[person]) balances[person] = {};
    balances[person][currency] = round2((balances[person][currency] || 0) + delta);
  };

  for (const expense of sharedExpenses) {
    const currency = expense.currency;
    const participants = expense.participants || [];

    if (expense.paidBy === myName) {
      // You paid — everyone else's share is money they owe you.
      for (const p of participants) {
        if (p.name === myName) continue;
        add(p.name, currency, p.amount);
      }
    } else {
      // Someone else paid — your share is money you owe them.
      const mine = participants.find((p) => p.name === myName);
      if (mine) add(expense.paidBy, currency, -mine.amount);
    }
  }

  for (const s of settlements) {
    const delta = s.direction === 'theyPaidMe' ? -s.amount : s.amount;
    add(s.personName, s.currency, delta);
  }

  return balances;
}

// Flattens the balances map into rows for list rendering, dropping
// effectively-zero entries (fully settled).
export function balancesToRows(balances) {
  const rows = [];
  for (const [personName, byCurrency] of Object.entries(balances)) {
    for (const [currency, amount] of Object.entries(byCurrency)) {
      if (Math.abs(amount) < 0.005) continue;
      rows.push({ personName, currency, amount });
    }
  }
  return rows.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
}

export function getSharedExpensesForPerson(personName, sharedExpenses) {
  return sharedExpenses.filter(
    (e) => e.paidBy === personName || (e.participants || []).some((p) => p.name === personName)
  );
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// --- Dashboard aggregations -------------------------------------------------
// All of these take an already-fetched expense array (income rows excluded)
// and a `displayCurrency` to sum against, returning `otherCurrencyTotal` /
// `otherCurrencyCount` separately rather than silently mixing currencies —
// same convention as computeBudgetSpent above.

function spendable(expenses, displayCurrency) {
  const spending = expenses.filter((e) => e.type !== 'income');
  return {
    matching: spending.filter((e) => e.currency === displayCurrency),
    other: spending.filter((e) => e.currency !== displayCurrency),
  };
}

// yearExpenses: all expenses for the selected calendar year.
// Returns 12 totals (Jan..Dec), optionally restricted to a set of categoryIds.
export function computeMonthlyTotals(yearExpenses, displayCurrency, categoryIds = null) {
  const totals = new Array(12).fill(0);
  const { matching, other } = spendable(yearExpenses, displayCurrency);
  for (const e of matching) {
    if (categoryIds && categoryIds.length > 0 && !categoryIds.includes(e.categoryId)) continue;
    const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    totals[d.getMonth()] = round2(totals[d.getMonth()] + (Number(e.amount) || 0));
  }
  return { totals, otherCurrencyCount: other.length };
}

export function computeCategoryTotals(expenses, categories, displayCurrency) {
  const { matching, other } = spendable(expenses, displayCurrency);
  const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
  const totals = {};
  for (const e of matching) {
    totals[e.categoryId] = round2((totals[e.categoryId] || 0) + (Number(e.amount) || 0));
  }
  const rows = Object.entries(totals)
    .map(([categoryId, total]) => ({
      categoryId,
      total,
      name: byId[categoryId]?.name || 'Uncategorized',
      icon: byId[categoryId]?.icon || '📦',
      color: byId[categoryId]?.color || '#8A93A0',
    }))
    .sort((a, b) => b.total - a.total);
  return { rows, otherCurrencyCount: other.length };
}

export function computeTagTotals(expenses, displayCurrency) {
  const { matching } = spendable(expenses, displayCurrency);
  const totals = {};
  for (const e of matching) {
    for (const tag of e.tags || []) {
      totals[tag] = round2((totals[tag] || 0) + (Number(e.amount) || 0));
    }
  }
  return Object.entries(totals)
    .map(([tag, total]) => ({ tag, total }))
    .sort((a, b) => b.total - a.total);
}

export function computeMonthComparison(currentMonthExpenses, lastMonthExpenses, displayCurrency) {
  const current = spendable(currentMonthExpenses, displayCurrency).matching.reduce(
    (s, e) => s + (Number(e.amount) || 0),
    0
  );
  const last = spendable(lastMonthExpenses, displayCurrency).matching.reduce(
    (s, e) => s + (Number(e.amount) || 0),
    0
  );
  const deltaPct = last > 0 ? round2(((current - last) / last) * 100) : current > 0 ? 100 : 0;
  return { current: round2(current), last: round2(last), deltaPct };
}

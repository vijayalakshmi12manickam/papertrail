// Pure data generation — no Firestore calls here, so it's easy to eyeball or
// unit test the shape before anything gets written. Dates are relative to
// "today" so the sample data always lands in "this month" / "last month"
// regardless of when you run the seeder.

function findCategory(categories, name) {
  return categories.find((c) => c.name.toLowerCase() === name.toLowerCase()) || categories[0];
}
function findAccount(accounts, name) {
  return accounts.find((a) => a.name.toLowerCase() === name.toLowerCase()) || accounts[0];
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
}
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function buildSampleExpenses(categories, accounts) {
  const groceries = findCategory(categories, 'Groceries');
  const travel = findCategory(categories, 'Travel');
  const dining = findCategory(categories, 'Dining');
  const bills = findCategory(categories, 'Bills & Utilities');
  const entertainment = findCategory(categories, 'Entertainment');
  const shopping = findCategory(categories, 'Shopping');

  const monzo = findAccount(accounts, 'Monzo');
  const revolut = findAccount(accounts, 'Revolut');
  const cash = findAccount(accounts, 'Cash');

  const rows = [];

  // Recurring-ish non-shared expenses across the last ~70 days.
  const recurring = [
    { item: 'Weekly grocery shop', category: groceries, account: monzo, amount: 42.5, everyDays: 7, txnType: 'card' },
    { item: 'Coffee', category: dining, account: cash, amount: 3.4, everyDays: 3, txnType: 'cash' },
    { item: 'Gym membership', category: entertainment, account: monzo, amount: 28, everyDays: 30, txnType: 'card' },
    { item: 'Phone bill', category: bills, account: revolut, amount: 22, everyDays: 30, txnType: 'transfer' },
  ];
  for (const r of recurring) {
    for (let d = 2; d < 70; d += r.everyDays) {
      rows.push({
        item: r.item,
        accountId: r.account.id,
        txnType: r.txnType,
        categoryId: r.category.id,
        date: daysAgo(d),
        tags: [],
        currency: 'GBP',
        amount: round2(r.amount * (0.9 + Math.random() * 0.2)),
        totalAmount: 0,
        isShared: false,
        paidBy: 'You',
        splitType: 'equal',
        participants: [],
        type: 'expense',
      });
    }
  }

  // A handful of one-off non-shared expenses.
  rows.push(
    {
      item: 'New running shoes',
      accountId: monzo.id,
      txnType: 'card',
      categoryId: shopping.id,
      date: daysAgo(18),
      tags: [],
      currency: 'GBP',
      amount: 68.0,
      totalAmount: 0,
      isShared: false,
      paidBy: 'You',
      splitType: 'equal',
      participants: [],
      type: 'expense',
    },
    {
      item: 'Cinema ticket',
      accountId: cash.id,
      txnType: 'cash',
      categoryId: entertainment.id,
      date: daysAgo(9),
      tags: [],
      currency: 'GBP',
      amount: 12.5,
      totalAmount: 0,
      isShared: false,
      paidBy: 'You',
      splitType: 'equal',
      participants: [],
      type: 'expense',
    }
  );

  // A trip to Iceland ~5 weeks ago — shared, equal split with Daniel, tagged.
  rows.push(
    {
      item: 'Ice Cave Tour',
      accountId: revolut.id,
      txnType: 'card',
      categoryId: travel.id,
      date: daysAgo(35),
      tags: ['Iceland0326'],
      currency: 'ISK',
      amount: 235.54,
      totalAmount: 471.08,
      isShared: true,
      paidBy: 'You',
      splitType: 'equal',
      participants: [
        { name: 'You', amount: 235.54 },
        { name: 'Daniel', amount: 235.54 },
      ],
      type: 'expense',
    },
    {
      item: 'Airbnb in Reykjavik',
      accountId: revolut.id,
      txnType: 'transfer',
      categoryId: travel.id,
      date: daysAgo(36),
      tags: ['Iceland0326'],
      currency: 'GBP',
      amount: 150,
      totalAmount: 300,
      isShared: true,
      paidBy: 'You',
      splitType: 'equal',
      participants: [
        { name: 'You', amount: 150 },
        { name: 'Daniel', amount: 150 },
      ],
      type: 'expense',
    },
    {
      item: 'Group dinner',
      accountId: monzo.id,
      txnType: 'card',
      categoryId: dining.id,
      date: daysAgo(34),
      tags: ['Iceland0326'],
      currency: 'ISK',
      amount: 30,
      totalAmount: 90,
      isShared: true,
      paidBy: 'Daniel',
      splitType: 'shares',
      participants: [
        { name: 'You', amount: 30, share: 1 },
        { name: 'Daniel', amount: 30, share: 1 },
        { name: 'Sarah', amount: 30, share: 1 },
      ],
      type: 'expense',
    }
  );

  // A weekend trip 10 days ago — shared with Sarah, custom split.
  rows.push({
    item: 'Weekend cottage',
    accountId: monzo.id,
    txnType: 'transfer',
    categoryId: travel.id,
    date: daysAgo(10),
    tags: ['CottageMar26'],
    currency: 'GBP',
    amount: 90,
    totalAmount: 200,
    isShared: true,
    paidBy: 'You',
    splitType: 'custom',
    participants: [
      { name: 'You', amount: 90 },
      { name: 'Sarah', amount: 110 },
    ],
    type: 'expense',
  });

  return rows;
}

export function buildSampleBudgets(categories) {
  const groceries = findCategory(categories, 'Groceries');
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return [
    {
      scopeType: 'category',
      scopeValue: groceries.id,
      periodStart: monthStart,
      periodEnd: monthEnd,
      totalBudget: 180,
      currency: 'GBP',
    },
    {
      scopeType: 'tag',
      scopeValue: 'Iceland0326',
      periodStart: daysAgo(45),
      periodEnd: daysAgo(25),
      totalBudget: 500,
      currency: 'GBP',
    },
  ];
}

export function buildSampleSettlements() {
  return [
    {
      personName: 'Daniel',
      direction: 'theyPaidMe',
      amount: 100,
      currency: 'GBP',
      date: daysAgo(20),
      note: 'Partial payback for Iceland',
    },
  ];
}

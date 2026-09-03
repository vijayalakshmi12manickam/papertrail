import { toJsDate } from './format';

const HEADERS = [
  'Date',
  'Item',
  'Category',
  'Account',
  'Type',
  'Currency',
  'Amount (your share)',
  'Total Amount',
  'Is Shared',
  'Paid By',
  'Split Type',
  'Participants',
  'Tags',
];

// One flat row per expense — participants are flattened to "Name: amount"
// pairs since spreadsheet cells can't hold nested structures.
export function buildExportRows(expenses, categoryById, accountById) {
  return expenses.map((e) => {
    const date = toJsDate(e.date);
    return {
      Date: date ? date.toISOString().slice(0, 10) : '',
      Item: e.item || '',
      Category: categoryById[e.categoryId]?.name || '',
      Account: accountById[e.accountId]?.name || '',
      Type: e.txnType || '',
      Currency: e.currency || '',
      'Amount (your share)': e.amount ?? '',
      'Total Amount': e.isShared ? e.totalAmount ?? '' : '',
      'Is Shared': e.isShared ? 'Yes' : 'No',
      'Paid By': e.paidBy || '',
      'Split Type': e.isShared ? e.splitType || '' : '',
      Participants: (e.participants || []).map((p) => `${p.name}: ${p.amount}`).join('; '),
      Tags: (e.tags || []).join(', '),
    };
  });
}

export function buildCsv(rows) {
  const escape = (val) => {
    const str = String(val ?? '');
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  const lines = [HEADERS.join(',')];
  for (const row of rows) {
    lines.push(HEADERS.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export { HEADERS };

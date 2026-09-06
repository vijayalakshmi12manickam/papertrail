// Shared low-level helpers for turning bank-statement PDF text into numbers/dates.
// Kept bank-agnostic; each bank parser owns its own line-shape assumptions.

const MONTH_ABBR = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// "12 May" — no year on the row itself; Barclays statements always give the
// year via the statement period, so the caller supplies which year applies
// (a statement can span a year boundary, e.g. Dec/Jan).
export function parseDayMonth(str, year) {
  const m = /^(\d{1,2})\s+([A-Za-z]{3,})/.exec(str.trim());
  if (!m) return null;
  const month = MONTH_ABBR[m[2].slice(0, 3).toLowerCase()];
  if (month === undefined) return null;
  return new Date(year, month, parseInt(m[1], 10));
}

// "31/07/2025"
export function parseSlashDate(str) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(str.trim());
  if (!m) return null;
  return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
}

// "1,234.56" / "-5.00" / "1041.11" -> number
export function parseAmount(str) {
  const cleaned = str.replace(/[£,\s]/g, '');
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? null : n;
}

export function isBareNumberLine(line) {
  return /^-?[\d,]+\.\d{2}$/.test(line.trim());
}

// Barclays rows show either just the amount ("21.00") or, on a day's last
// transaction, "amount balance" on one line ("21.00 7,600.52"). Matches
// either shape; returns null for anything else.
export function matchAmountBalanceLine(line) {
  const m = /^(-?[\d,]+\.\d{2})(?:\s+([\d,]+\.\d{2}))?$/.exec(line.trim());
  if (!m) return null;
  return { amount: parseAmount(m[1]), balance: m[2] ? parseAmount(m[2]) : null };
}

export function toLines(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

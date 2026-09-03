export function formatCurrency(amount, currencyCode = 'GBP') {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
    }).format(value);
  } catch (e) {
    // Unknown/unsupported currency code — fall back to a plain-labelled number.
    return `${value.toFixed(2)} ${currencyCode}`;
  }
}

// Best-effort currency symbol for a 3-letter code (e.g. 'GBP' -> '£'). Falls
// back to the code itself for anything Intl doesn't recognize — which
// includes user-added currencies that aren't real ISO 4217 codes.
export function getCurrencySymbol(currencyCode) {
  try {
    const parts = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === 'currency');
    return symbolPart ? symbolPart.value : currencyCode;
  } catch (e) {
    return currencyCode;
  }
}

export function formatDate(date, opts = {}) {
  const d = toJsDate(date);
  if (!d) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: opts.showYear === false ? undefined : 'numeric',
  });
}

export function formatMonthLabel(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

// Expenses store `date` as a Firestore Timestamp once persisted, but forms
// work with JS Dates before save — normalize either shape.
export function toJsDate(date) {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date?.toDate === 'function') return date.toDate();
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
}

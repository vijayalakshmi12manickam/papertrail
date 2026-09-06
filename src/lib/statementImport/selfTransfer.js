// Detects transactions that are likely the account holder moving money
// between their own accounts (different banks, or Monzo's own round-up-to-Pot
// transfers) rather than real income/spending. These are common in personal
// statements and would otherwise flood an imported expense list with noise.
//
// Deliberately a soft heuristic: callers show flagged rows on the review
// screen unchecked-by-default rather than dropping them, so a false positive
// just costs one tap and a false negative is no worse than not flagging at all.

const BANK_KEYWORDS = [
  'monzo', 'barclays', 'lloyds', 'hsbc', 'natwest', 'santander',
  'halifax', 'nationwide', 'starling', 'revolut', 'tsb', 'chase',
];

export function looksLikeSelfTransfer(text, holderTokens = []) {
  const lower = text.toLowerCase();

  if (lower.includes('transfer to pot')) {
    return { flagged: true, reason: 'Monzo Pot transfer' };
  }
  if (/\bself\b/.test(lower)) {
    return { flagged: true, reason: 'Reference mentions "self"' };
  }

  // Word-boundary match, not substring — "chase" must not match inside
  // "purchase", "hsbc" shouldn't match inside a longer alphanumeric token, etc.
  const bankHits = BANK_KEYWORDS.filter((b) => new RegExp(`\\b${b}\\b`, 'i').test(lower));
  if (bankHits.length >= 2) {
    return { flagged: true, reason: `Mentions ${bankHits.join(' and ')} — likely a transfer between your own accounts` };
  }
  if (bankHits.length === 1) {
    return { flagged: true, reason: `Mentions ${bankHits[0]} — check if this is your own account` };
  }

  const surname = holderTokens[holderTokens.length - 1];
  if (surname && surname.length >= 4) {
    const words = lower.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 4);
    const surnamePrefix = surname.toLowerCase().slice(0, 5);
    const matched = words.some((w) => w.startsWith(surnamePrefix) || surname.toLowerCase().startsWith(w.slice(0, 5)));
    if (matched) {
      return { flagged: true, reason: 'Matches your name — check if this is a transfer to yourself' };
    }
  }

  return { flagged: false, reason: null };
}

// Pulls name-like tokens ("Vinothkumar", "Baskaran") out of a free-text name
// string for fuzzy matching above. Strips common titles.
export function nameToTokens(name) {
  if (!name) return [];
  return name
    .replace(/\b(mr|mrs|ms|miss|mx|dr)\b\.?/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

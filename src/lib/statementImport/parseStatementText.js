import { parseBarclays } from './banks/parseBarclays';
import { parseMonzo } from './banks/parseMonzo';

// Add a new bank by adding one entry here and one file in ./banks — nothing
// else in the pipeline needs to change.
const BANK_DETECTORS = [
  {
    bank: 'monzo',
    matches: (lower) => lower.includes('monzo') && lower.includes('personal account statement'),
    parse: parseMonzo,
  },
  {
    bank: 'barclays',
    matches: (lower) => lower.includes('barclays') && (lower.includes('sort code') || lower.includes('swiftbic')),
    parse: parseBarclays,
  },
];

export function detectBank(text) {
  const lower = text.toLowerCase();
  const hit = BANK_DETECTORS.find((d) => d.matches(lower));
  return hit ? hit.bank : null;
}

export function parseStatementText(text) {
  const hit = BANK_DETECTORS.find((d) => d.matches(text.toLowerCase()));
  if (!hit) {
    return {
      bank: null,
      transactions: [],
      currency: 'GBP',
      holderName: null,
      unparsedLines: [],
      warnings: ['Could not recognize this statement format. Currently supported: Monzo, Barclays.'],
    };
  }
  return { bank: hit.bank, ...hit.parse(text) };
}

import { parseSlashDate, parseAmount, toLines } from '../textUtils';

// Monzo's main account table is one transaction per row: "date description
// amount balance", with the description occasionally wrapping onto a
// following line. Directly after this table Monzo includes separate "Pot
// statement" sections (internal savings buckets) — these aren't spending and
// are intentionally not parsed.
const TRANSACTION_RE = /^(\d{2}\/\d{2}\/\d{4})\s+(.*?)\s+(-?[\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*$/;
const TRANSFER_HINTS = /\((faster payments|p2p payment)\)|transfer to pot/i;

function guessTxnType(description) {
  if (TRANSFER_HINTS.test(description)) return 'transfer';
  return 'card';
}

function extractHolderName(text) {
  const m = /\d{2}\/\d{2}\/\d{4}\s*-\s*\d{2}\/\d{2}\/\d{4}\s*\n([^\n]+)\n/.exec(text);
  return m ? m[1].trim() : null;
}

function extractCurrency(text) {
  const m = /\((\w{3})\)\s*Amount/i.exec(text);
  return m ? m[1].toUpperCase() : 'GBP';
}

export function parseMonzo(text) {
  const potIndex = text.indexOf('Pot statement');
  const mainText = potIndex >= 0 ? text.slice(0, potIndex) : text;

  const allLines = toLines(mainText);
  const holderName = extractHolderName(text);
  const currency = extractCurrency(text);

  // Skip the summary block above the table (name/address, balance figures,
  // and critically the "DD/MM/YYYY - DD/MM/YYYY" period line, which itself
  // starts with a date and would otherwise be mistaken for a transaction).
  const headerIdx = allLines.findIndex((l) => /^date\s+description\s+\(\w{3}\)\s*amount\s+\(\w{3}\)\s*balance/i.test(l));
  const lines = headerIdx >= 0 ? allLines.slice(headerIdx + 1) : allLines;

  const transactions = [];
  const unparsedLines = [];

  let i = 0;
  const dateStartRe = /^\d{2}\/\d{2}\/\d{4}\b/;

  while (i < lines.length) {
    if (!dateStartRe.test(lines[i])) {
      i += 1;
      continue;
    }

    // A transaction's date/description/amount/balance may be split across
    // this line and the next (description wraps) — keep appending lines
    // until the trailing "amount balance" pair matches, or we hit the next
    // transaction's date.
    let blob = lines[i];
    let j = i + 1;
    let match = TRANSACTION_RE.exec(blob);
    while (!match && j < lines.length && !dateStartRe.test(lines[j])) {
      blob = `${blob} ${lines[j]}`;
      match = TRANSACTION_RE.exec(blob);
      j += 1;
    }

    if (!match) {
      unparsedLines.push(lines[i]);
      i += 1;
      continue;
    }

    const [, dateStr, description, amountStr, balanceStr] = match;
    const amount = parseAmount(amountStr);
    void balanceStr; // per-row balance isn't needed once the amount/direction is known

    transactions.push({
      date: parseSlashDate(dateStr),
      description: description.trim(),
      reference: null,
      amount: Math.abs(amount),
      direction: amount < 0 ? 'out' : 'in',
      txnTypeHint: guessTxnType(description),
    });

    i = j > i + 1 ? j : i + 1;
  }

  return {
    transactions,
    currency,
    holderName,
    unparsedLines,
    warnings: [],
  };
}

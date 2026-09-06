import { parseDayMonth, parseAmount, matchAmountBalanceLine, toLines } from '../textUtils';
import { nameToTokens } from '../selfTransfer';

// Barclays statements group rows by day: the date cell is only populated on
// the FIRST line of each day, and multiple transactions on the same day have
// no date prefix at all — just a fresh description line starting right after
// the previous transaction's amount. The table also splits amounts into
// separate "Money out"/"Money in" columns, but plain-text extraction
// collapses columns, so column position can't be trusted. Direction is
// instead read off the description's own verb ("Payment to" / "Received
// From" / ...), which Barclays uses consistently regardless of extraction
// quirks.
const OUT_VERBS = [
  /^payment to/i,
  /^direct debit to/i,
  /^card purchase/i,
  /^card payment to/i,
  /^bill payment to/i,
  /^standing order to/i,
];
const IN_VERBS = [
  /^received from/i,
  /^giro received/i,
  /^interest/i,
  /^refund/i,
  /^bank giro credit/i,
];

// Card lines often show the *posting* date in the row but the actual
// purchase date in the text itself, e.g. "Card Purchase Aldi On 24 May" while
// the row is dated "26 May". Prefer that when present.
function extractEmbeddedDate(description, year) {
  const m = /\bOn\s+(\d{1,2}\s+[A-Za-z]{3,})\b/.exec(description);
  return m ? parseDayMonth(m[1], year) : null;
}

function classifyDirection(description) {
  if (OUT_VERBS.some((re) => re.test(description))) return 'out';
  if (IN_VERBS.some((re) => re.test(description))) return 'in';
  return null; // ambiguous — caller decides a fallback
}

function guessTxnType(description) {
  if (/^card (purchase|payment)/i.test(description)) return 'card';
  if (/^(direct debit|standing order)/i.test(description)) return 'transfer';
  return 'other';
}

function extractHolderName(text) {
  const m = /\b(?:Mr|Mrs|Ms|Miss|Mx|Dr)\.?\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/.exec(text);
  return m ? m[0] : null;
}

function extractSummaryTotals(text) {
  const grab = (label) => {
    const m = new RegExp(`${label}\\s*£?([\\d,]+\\.\\d{2})`, 'i').exec(text);
    return m ? parseAmount(m[1]) : null;
  };
  return {
    startBalance: grab('Start balance'),
    moneyIn: grab('Money in'),
    moneyOut: grab('Money out'),
    endBalance: grab('End balance'),
  };
}

function inferYear(text) {
  // Statement date / period headers ("05 Jun 2026", "08 May - 05 Jun 2026")
  // carry the year; fall back to the current year if nothing is found.
  const m = /\b(20\d{2})\b/.exec(text);
  return m ? parseInt(m[1], 10) : new Date().getFullYear();
}

// Only the "Your transactions" table (bounded by its header row and the
// "End balance" line) should be scanned — the address block, sort
// code/IBAN, and "At a glance" summary all sit outside it and must never be
// mistaken for transaction rows.
function extractTableLines(lines) {
  const startIdx = lines.findIndex((l) => /^date\s+description\s+money\s*out\s+money\s*in\s+balance/i.test(l));
  if (startIdx === -1) return [];
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i += 1) {
    if (/^\d{1,2}\s+[A-Za-z]{3,}\s+end balance\b/i.test(lines[i])) {
      endIdx = i + 1;
      break;
    }
  }
  return lines.slice(startIdx + 1, endIdx);
}

const dateLineRe = /^(\d{1,2}\s+[A-Za-z]{3,})\s*(.*)$/;

export function parseBarclays(text) {
  const allLines = toLines(text);
  const year = inferYear(text);
  const holderName = extractHolderName(text);
  const holderTokens = nameToTokens(holderName);
  const summary = extractSummaryTotals(text);

  const tableLines = extractTableLines(allLines);
  const transactions = [];
  const unparsedLines = [];
  const warnings = [];

  let currentDate = null;
  let descLines = [];
  let numbers = [];

  const finalize = () => {
    const description = descLines.join(' ').replace(/\s+/g, ' ').trim();
    descLines = [];
    const collectedNumbers = numbers;
    numbers = [];

    if (!description || /^(start|end) balance$/i.test(description)) return;
    if (collectedNumbers.length === 0) {
      unparsedLines.push(description);
      return;
    }

    const amount = collectedNumbers[0];
    const knownDirection = classifyDirection(description);
    const direction = knownDirection || 'out';
    if (!knownDirection) {
      warnings.push(`Couldn't confirm money in/out for "${description}" — please check.`);
    }

    const effectiveDate = extractEmbeddedDate(description, year) || currentDate;

    transactions.push({
      date: effectiveDate,
      description: description.replace(/\s+On\s+\d{1,2}\s+[A-Za-z]{3,}$/i, '').trim(),
      reference: null,
      amount,
      direction,
      txnTypeHint: guessTxnType(description),
    });
  };

  for (const line of tableLines) {
    const dateMatch = dateLineRe.exec(line);
    const parsedDate = dateMatch ? parseDayMonth(dateMatch[1], year) : null;

    if (parsedDate) {
      finalize();
      currentDate = parsedDate;
      const remainder = dateMatch[2].trim();
      // "Start balance"/"End balance" rows carry their figure inline on the
      // same line rather than as a separate bare-number line — these aren't
      // real transactions, just balance checkpoints, so drop them entirely.
      if (remainder && !/^(start|end) balance\b/i.test(remainder)) {
        descLines.push(remainder);
      }
      continue;
    }

    const numberMatch = matchAmountBalanceLine(line);
    if (numberMatch) {
      // A day's last transaction shows "amount balance" on one line; only the
      // amount is needed for the transaction itself.
      numbers.push(numberMatch.amount);
      continue;
    }

    if (/^ref:/i.test(line)) {
      // Reference lines belong to whichever transaction is currently
      // accumulating — appended to the description text for self-transfer
      // matching (e.g. "Ref: Monzo", "Ref: Lloyds Self").
      descLines.push(line);
      continue;
    }

    // A plain description line. If we've already collected at least one
    // number for the transaction in progress, this is a *new* same-day
    // transaction (no date prefix shown) — finalize the previous one first.
    if (numbers.length > 0) {
      finalize();
    }
    if (currentDate) descLines.push(line);
  }
  finalize();

  // Reconcile against the statement's own "At a glance" totals — a cheap,
  // global sanity check that doesn't depend on getting every row's direction
  // right, just the aggregate.
  if (summary.startBalance != null && summary.endBalance != null) {
    const sumIn = transactions.filter((t) => t.direction === 'in').reduce((s, t) => s + t.amount, 0);
    const sumOut = transactions.filter((t) => t.direction === 'out').reduce((s, t) => s + t.amount, 0);
    const expectedEnd = summary.startBalance + sumIn - sumOut;
    if (Math.abs(expectedEnd - summary.endBalance) > 0.5) {
      warnings.push(
        `Parsed totals (in ${sumIn.toFixed(2)}, out ${sumOut.toFixed(2)}) don't reconcile with the statement's start/end balance — some transactions may be missing or misclassified. Please review carefully.`
      );
    }
  }

  return {
    transactions,
    currency: 'GBP',
    holderName,
    unparsedLines,
    warnings,
  };
}

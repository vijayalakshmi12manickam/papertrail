// Pure split-math helpers. `totalAmount` is the full receipt; `participants` is
// [{ name, input }] where `input` means different things per splitType:
//   equal      -> input ignored, split evenly across all participants
//   percentage -> input is a percentage (0-100), must sum to 100
//   shares     -> input is a share count (e.g. 2 vs 1), split proportionally
//   custom     -> input IS the exact amount owed by that participant
//
// Returns { participants: [{ name, amount, share? }], myShare, isValid, error }
// where `myShare` is what goes in the expense's top-level `amount` field.

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calculateSplit(splitType, totalAmount, participants, myName = 'You') {
  if (!participants || participants.length === 0) {
    return { participants: [], myShare: 0, isValid: false, error: 'Add at least one participant.' };
  }
  if (!totalAmount || totalAmount <= 0) {
    return { participants: [], myShare: 0, isValid: false, error: 'Enter a total amount greater than 0.' };
  }

  switch (splitType) {
    case 'equal':
      return splitEqual(totalAmount, participants, myName);
    case 'percentage':
      return splitPercentage(totalAmount, participants, myName);
    case 'shares':
      return splitShares(totalAmount, participants, myName);
    case 'custom':
      return splitCustom(totalAmount, participants, myName);
    default:
      return { participants: [], myShare: 0, isValid: false, error: `Unknown split type: ${splitType}` };
  }
}

function distributeRemainder(baseAmounts, totalAmount) {
  // Rounding to 2dp per-participant can leave the sum a cent off the total.
  // Assign the remainder to the largest share so totals always reconcile exactly.
  const sum = round2(baseAmounts.reduce((s, a) => s + a.amount, 0));
  const diff = round2(totalAmount - sum);
  if (diff !== 0 && baseAmounts.length > 0) {
    const largestIdx = baseAmounts.reduce(
      (maxIdx, a, i, arr) => (a.amount > arr[maxIdx].amount ? i : maxIdx),
      0
    );
    baseAmounts[largestIdx].amount = round2(baseAmounts[largestIdx].amount + diff);
  }
  return baseAmounts;
}

function splitEqual(totalAmount, participants, myName) {
  const n = participants.length;
  const each = round2(totalAmount / n);
  const result = participants.map((p) => ({ name: p.name, amount: each }));
  distributeRemainder(result, totalAmount);
  const myShare = result.find((p) => p.name === myName)?.amount ?? 0;
  return { participants: result, myShare, isValid: true, error: null };
}

function splitPercentage(totalAmount, participants, myName) {
  const totalPct = participants.reduce((s, p) => s + (Number(p.input) || 0), 0);
  if (round2(totalPct) !== 100) {
    return {
      participants: [],
      myShare: 0,
      isValid: false,
      error: `Percentages must add up to 100 (currently ${round2(totalPct)}).`,
    };
  }
  const result = participants.map((p) => ({
    name: p.name,
    amount: round2((totalAmount * (Number(p.input) || 0)) / 100),
    share: Number(p.input) || 0,
  }));
  distributeRemainder(result, totalAmount);
  const myShare = result.find((p) => p.name === myName)?.amount ?? 0;
  return { participants: result, myShare, isValid: true, error: null };
}

function splitShares(totalAmount, participants, myName) {
  const totalShares = participants.reduce((s, p) => s + (Number(p.input) || 0), 0);
  if (totalShares <= 0) {
    return { participants: [], myShare: 0, isValid: false, error: 'Enter at least one share.' };
  }
  const result = participants.map((p) => ({
    name: p.name,
    amount: round2((totalAmount * (Number(p.input) || 0)) / totalShares),
    share: Number(p.input) || 0,
  }));
  distributeRemainder(result, totalAmount);
  const myShare = result.find((p) => p.name === myName)?.amount ?? 0;
  return { participants: result, myShare, isValid: true, error: null };
}

function splitCustom(totalAmount, participants, myName) {
  const sum = round2(participants.reduce((s, p) => s + (Number(p.input) || 0), 0));
  if (sum !== round2(totalAmount)) {
    return {
      participants: [],
      myShare: 0,
      isValid: false,
      error: `Amounts must add up to the total (currently ${sum} of ${round2(totalAmount)}).`,
    };
  }
  const result = participants.map((p) => ({ name: p.name, amount: round2(Number(p.input) || 0) }));
  const myShare = result.find((p) => p.name === myName)?.amount ?? 0;
  return { participants: result, myShare, isValid: true, error: null };
}

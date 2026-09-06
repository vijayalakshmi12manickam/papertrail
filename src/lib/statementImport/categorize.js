// Best-effort auto-categorization: match merchant/description text to a
// generic spending "concept" (groceries, dining, ...), then find a category
// in the user's own (freely-named) category list whose name looks related.
// Falls back to null (Uncategorized) rather than guessing wildly — the
// review screen is where the user confirms or corrects this either way.

const MERCHANT_HINTS = [
  { concept: 'groceries', keywords: ['aldi', 'tesco', 'sainsbury', 'asda', 'lidl', 'morrisons', 'co-op', 'waitrose', 'iceland', 'gokulam'] },
  { concept: 'dining', keywords: ['greggs', 'mcdonald', 'kfc', 'domino', 'chopstix', 'nando', 'costa', 'starbucks', 'pizza', 'wok kitchen', 'tastecard', 'hasty tasty', 'toogoodtogo'] },
  { concept: 'entertainment', keywords: ['vue', 'cinema', 'netflix', 'disney', 'spotify', 'apple.com'] },
  { concept: 'transport', keywords: ['uber', 'trainline', 'citipark', 'car park', 'petrol', 'fuel', 'parking', 'rontec'] },
  { concept: 'health', keywords: ['boots', 'pharmacy', 'gym'] },
  { concept: 'shopping', keywords: ['amazon', 'b&m', 'primark', 'poundland', 'post office', 'go outdoors', 'zettle'] },
  { concept: 'bills', keywords: ['energy', 'gas trading', 'hyperoptic', 'utilities', 'ovo'] },
  { concept: 'travel', keywords: ['zoo', 'safari', 'hotel', 'airbnb'] },
];

// concept -> substrings likely to appear in a user's own category name for it
const CONCEPT_TO_CATEGORY_HINTS = {
  groceries: ['grocer', 'food shop', 'supermarket'],
  dining: ['dining', 'restaurant', 'eating out', 'food & drink', 'food and drink', 'takeaway'],
  entertainment: ['entertain', 'fun', 'leisure'],
  transport: ['transport', 'travel', 'car', 'fuel', 'parking'],
  health: ['health', 'fitness', 'medical', 'gym'],
  shopping: ['shop'],
  bills: ['bill', 'utilit'],
  travel: ['travel', 'holiday', 'trip'],
};

function findCategoryByHints(categories, hints) {
  return categories.find((c) => hints.some((h) => c.name?.toLowerCase().includes(h)));
}

export function suggestCategoryId(description, categories) {
  if (!description || !categories?.length) return null;
  const lower = description.toLowerCase();

  const hint = MERCHANT_HINTS.find((h) => h.keywords.some((k) => lower.includes(k)));
  if (hint) {
    const match = findCategoryByHints(categories, CONCEPT_TO_CATEGORY_HINTS[hint.concept] || []);
    if (match) return match.id;
  }

  // Fallback: the user's own category name appears literally in the description.
  const literal = categories.find((c) => c.name && lower.includes(c.name.toLowerCase()));
  return literal ? literal.id : null;
}

// utils/analyzeHand.js
import _ from "lodash";

const rankOrder = {
  A: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
};

// ✅ Check if a sequence is pure (same suit, consecutive ranks, no jokers)
function isPureSequence(cards) {
  if (cards.length < 3) return false;
  const suit = cards[0].suit;
  const sorted = cards
    .filter((card) => !card.joker)
    .sort((a, b) => rankOrder[a.rank] - rankOrder[b.rank]);

  for (let i = 1; i < sorted.length; i++) {
    if (
      sorted[i].suit !== suit ||
      rankOrder[sorted[i].rank] !== rankOrder[sorted[i - 1].rank] + 1
    ) {
      return false;
    }
  }
  return sorted.length === cards.length;
}

// ✅ Group cards by suit and try to find sequences
function extractPureSequences(cards) {
  const grouped = _.groupBy(cards, "suit");
  const pureSequences = [];
  const usedIndexes = new Set();

  Object.values(grouped).forEach((group) => {
    const sorted = group.sort((a, b) => rankOrder[a.rank] - rankOrder[b.rank]);
    for (let i = 0; i < sorted.length - 2; i++) {
      const s = [sorted[i]];
      for (let j = i + 1; j < sorted.length; j++) {
        if (
          rankOrder[sorted[j].rank] ===
          rankOrder[s[s.length - 1].rank] + 1
        ) {
          s.push(sorted[j]);
          if (s.length >= 3) {
            const indexes = s.map((c) => cards.indexOf(c));
            if (indexes.some((i) => usedIndexes.has(i))) continue;
            indexes.forEach((i) => usedIndexes.add(i));
            pureSequences.push([...s]);
            break;
          }
        } else break;
      }
    }
  });

  const leftCards = cards.filter((_, idx) => !usedIndexes.has(idx));
  return { pureSequences, leftCards };
}

// ✅ This includes jokers and allows impure sequences
function analyzeHand(cards, jokers = []) {
  const jokerRanks = jokers.map((j) => j.rank);
  const groupedBySuit = _.groupBy(cards, "suit");
  const used = new Set();

  const sequences = [];
  const pureSequences = [];

  // First detect pure sequences
  const { pureSequences: pure, leftCards: afterPure } = extractPureSequences(
    cards.filter((c) => !c.joker)
  );
  pureSequences.push(...pure);
  afterPure.forEach((c) => used.add(cards.indexOf(c)));

  // Try to find impure sequences with jokers
  const remaining = cards.filter((_, idx) => !used.has(idx));
  const grouped = _.groupBy(remaining, "suit");

  Object.values(grouped).forEach((group) => {
    const sorted = group.sort((a, b) => rankOrder[a.rank] - rankOrder[b.rank]);
    for (let i = 0; i < sorted.length - 1; i++) {
      const s = [sorted[i]];
      let jokerUsed = 0;

      for (let j = i + 1; j < sorted.length && s.length < 4; j++) {
        if (rankOrder[sorted[j].rank] === rankOrder[s[s.length - 1].rank] + 1) {
          s.push(sorted[j]);
        } else if (jokerUsed === 0 && jokerRanks.includes(sorted[j].rank)) {
          s.push({ ...sorted[j], isJokerUsed: true });
          jokerUsed++;
        } else {
          break;
        }
      }

      if (s.length >= 3) {
        const indexes = s.map((c) => cards.indexOf(c));
        if (indexes.some((i) => used.has(i))) continue;
        indexes.forEach((i) => used.add(i));
        sequences.push([...s]);
        break;
      }
    }
  });

  const leftCards = cards.filter((_, idx) => !used.has(idx));

  return {
    pureSequences,
    sequences,
    leftCards,
  };
}

export { analyzeHand, extractPureSequences };

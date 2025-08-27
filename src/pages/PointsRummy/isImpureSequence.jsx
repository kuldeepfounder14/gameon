export function isImpureSequence(group, jokerCard) {
  if (group.length < 3 || !jokerCard) return false;
  const jokerRank = jokerCard.rank;
  const jokers = group.filter(c => c.rank === jokerRank);
  if (jokers.length === 0) return false;

  const nonJokers = group.filter(c => c.rank !== jokerRank);
  if (nonJokers.length < 2) return false;
  const suit = nonJokers[0].suit;
  if (!nonJokers.every(c => c.suit === suit)) return false;

  const sorted = [...nonJokers].sort((a, b) => a.rankIndex - b.rankIndex);
  let requiredJokers = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = sorted[i + 1].rankIndex - sorted[i].rankIndex;
    if (diff > 1) requiredJokers += diff - 1;
  }

  return requiredJokers <= jokers.length;
}

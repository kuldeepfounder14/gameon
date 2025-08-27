export function isSet(group, jokerCard) {
  if (group.length < 3 || group.length > 4) return false;

  const jokerRank = jokerCard?.rank;
  const nonJokers = group.filter(c => c.rank !== jokerRank);

  if (nonJokers.length === 0) return true;

  const rank = nonJokers[0].rank;
  if (!nonJokers.every(c => c.rank === rank)) return false;

  const uniqueSuits = new Set(nonJokers.map(c => c.suit));
  return uniqueSuits.size === nonJokers.length;
}

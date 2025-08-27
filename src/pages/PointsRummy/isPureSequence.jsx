export function isPureSequence(group) {
  if (group.length < 3) return false;
  const sorted = [...group].sort((a, b) => a.rankIndex - b.rankIndex);
  const suit = sorted[0].suit;
  if (!sorted.every(card => card.suit === suit)) return false;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1].rankIndex !== sorted[i].rankIndex + 1) {
      return false;
    }
  }
  return true;
}

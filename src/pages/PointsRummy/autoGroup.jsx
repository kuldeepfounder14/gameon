export function autoGroup(hand, jokerCard) {
  const groups = [];
  const used = new Set();

  const isSame = (a, b) => a.rank === b.rank && a.suit === b.suit;

  const copy = [...hand];

  // Step 1: try finding pure sequences
  copy.sort((a, b) => a.suit.localeCompare(b.suit) || a.rankIndex - b.rankIndex);
  for (let i = 0; i < copy.length - 2; i++) {
    if (used.has(i)) continue;
    const seq = [copy[i]];
    for (let j = i + 1; j < copy.length; j++) {
      if (
        copy[j].suit === seq[0].suit &&
        copy[j].rankIndex === seq[seq.length - 1].rankIndex + 1 &&
        !used.has(j)
      ) {
        seq.push(copy[j]);
      }
      if (seq.length >= 3) {
        seq.forEach(c => used.add(copy.indexOf(c)));
        groups.push(seq);
        break;
      }
    }
  }

  // Step 2: Add remaining cards into last group (as deadwood)
  const remaining = copy.filter((_, i) => !used.has(i));
  if (remaining.length > 0) groups.push(remaining);

  return groups;
}

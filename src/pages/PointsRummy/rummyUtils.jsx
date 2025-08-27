// src/utils/rummyUtils.js

export function getCardPoints(card) {
  const faceRanks = ['J', 'Q', 'K', 'A'];
  if (faceRanks.includes(card.rank)) return 10;
  return parseInt(card.rank);
}

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

export function getMeldType(group, jokerCard) {
  if (isPureSequence(group)) return 'pureSequence';
  if (isImpureSequence(group, jokerCard)) return 'impureSequence';
  if (isSet(group, jokerCard)) return 'set';
  return 'invalid';
}

export function canDeclareShow(allGroups, jokerCard) {
  const totalCards = allGroups.flat().length;
  if (totalCards !== 13) return false;

  let pureSequenceCount = 0;
  let sequenceCount = 0;

  for (const group of allGroups) {
    const type = getMeldType(group, jokerCard);
    if (type === 'invalid') return false;
    if (type === 'pureSequence') {
      pureSequenceCount++;
      sequenceCount++;
    } else if (type === 'impureSequence') {
      sequenceCount++;
    }
  }

  return pureSequenceCount >= 1 && sequenceCount >= 2;
}

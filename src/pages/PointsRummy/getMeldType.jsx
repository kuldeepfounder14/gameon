export function getMeldType(group, jokerCard) {
  if (isPureSequence(group)) return 'pureSequence';
  if (isImpureSequence(group, jokerCard)) return 'impureSequence';
  if (isSet(group, jokerCard)) return 'set';
  return 'invalid';
}

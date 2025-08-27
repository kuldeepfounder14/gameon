export const startGlobalTimer = (playerKey) => {
  if (timerRef.current) clearInterval(timerRef.current);

  currentPlayerRef.current = playerKey;
  timeLeftRef.current = phaseRef.current === 1 ? 30 : 15;

  setTurnTimer(timeLeftRef.current); // this is just for UI
  setCurrentPoints(phaseRef.current === 1 ? 80 : 0);

  timerRef.current = setInterval(() => {
    timeLeftRef.current -= 1;

    setTurnTimer(timeLeftRef.current); // update UI
    if (phaseRef.current === 1) {
      setCurrentPoints((prev) => Math.max(prev - 1, 0));
    }

    if (timeLeftRef.current <= 0) {
      clearInterval(timerRef.current);
      timerRef.current = null;

      if (phaseRef.current === 1) {
        phaseRef.current = 2;
        startGlobalTimer(currentPlayerRef.current); // go to discard phase
      } else {
        // go to next player
        const currentIndex = playerKeys.indexOf(currentPlayerRef.current);
        const nextIndex = (currentIndex + 1) % playerKeys.length;
        const nextPlayer = playerKeys[nextIndex];

        currentPlayerRef.current = nextPlayer;
        phaseRef.current = 1;

        setCurrentTurnKey(nextPlayer);
        startGlobalTimer(nextPlayer);
      }
    }
  }, 1000);
};

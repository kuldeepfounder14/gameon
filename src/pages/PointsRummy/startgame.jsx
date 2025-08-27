  const startGame = () => {
    const shuffled = shuffleDeck(fullDeck);

    // 1. Deal cards to players
    const count = playerCount;
    const cardsToDistribute = count * 13;
    const newHands = {};
    for (let p = 0; p < count; p++) {
      const playerKey = `player${p + 1}`;
      newHands[playerKey] = shuffled.slice(p * 13, (p + 1) * 13);
    }

    // 2. Remaining deck after dealing
    let remainingDeck = shuffled.slice(cardsToDistribute);

    // 3. Select random joker from remaining deck
    const jokerIndex = Math.floor(Math.random() * remainingDeck.length);
    const selectedJoker = remainingDeck[jokerIndex];
    setJokerCard(selectedJoker);

    // 4. Remove joker from deck
    remainingDeck = remainingDeck.filter((_, idx) => idx !== jokerIndex);

    // 5. Select a discard card randomly
    const discardIndex = Math.floor(Math.random() * remainingDeck.length);
    const firstDiscard = remainingDeck[discardIndex];
    const updatedDeck = remainingDeck.filter((_, idx) => idx !== discardIndex);

    // 6. Set all states
    setPlayersHands(newHands);
    setDeck(updatedDeck);
    setDiscardPile([firstDiscard]);
  };



    const dealCards = (shuffled) => {
    const newHands = {};
    const count = playerCount;
    for (let p = 0; p < count; p++) {
      const playerKey = `player${p + 1}`;
      newHands[playerKey] = shuffled.slice(p * 13, (p + 1) * 13);
    }
    setPlayersHands(newHands);
    setDeck(shuffled.slice(count * 13)); // Remaining deck
  };